import { describe, expect, it } from 'vitest';
import { as, fakeDgi } from './helpers';
import oneLine from './fixtures/don-antonio-1-linea.html?raw';

const ONE_LINE_CUFE = 'FE0120000000541-81-118009-0610192025120300001102620310312027507502';

const send = (method: string, body?: unknown) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: body === undefined ? undefined : JSON.stringify(body),
});

type Api = ReturnType<typeof as>;
type Detail = {
  totalCents: number;
  subtotalCents: number;
  paidCents: number | null;
  lines: { id: string; description: string; quantity: number; listPriceCents: number; lineTotalCents: number }[];
};

async function createManual(user: Api): Promise<string> {
  const res = await user(
    '/purchases/manual',
    send('POST', {
      store: { name: 'Súper de prueba' },
      lines: [
        { description: 'Leche', quantity: 2, lineTotalCents: 500 },
        { description: 'Pan', quantity: 1, lineTotalCents: 250 },
      ],
    }),
  );
  return (await res.json<{ id: string }>()).id;
}

const detail = async (user: Api, id: string) => (await user(`/purchases/${id}`)).json<Detail>();

describe('PATCH /api/purchase-lines/:id/total (CA4.7)', () => {
  it('corrige el total pagado con ITBMS y recalcula el unitario y el total de la compra', async () => {
    const user = as('total-linea@example.com');
    const id = await createManual(user);
    const leche = (await detail(user, id)).lines[0]!;

    const res = await user(`/purchase-lines/${leche.id}/total`, send('PATCH', { lineTotalCents: 580 }));
    expect(res.status).toBe(204);

    const after = await detail(user, id);
    expect(after.lines[0]).toMatchObject({ lineTotalCents: 580, listPriceCents: 290, quantity: 2 });
    expect(after.lines[1]).toMatchObject({ lineTotalCents: 250 });
    expect(after).toMatchObject({ totalCents: 830, subtotalCents: 830, paidCents: 830 });
  });

  it('el precio unitario usa la cantidad vigente', async () => {
    const user = as('total-cantidad@example.com');
    const id = await createManual(user);
    const leche = (await detail(user, id)).lines[0]!;

    await user(`/purchase-lines/${leche.id}`, send('PATCH', { quantity: 4 }));
    await user(`/purchase-lines/${leche.id}/total`, send('PATCH', { lineTotalCents: 900 }));

    expect((await detail(user, id)).lines[0]).toMatchObject({ quantity: 4, listPriceCents: 225, lineTotalCents: 900 });
  });

  it('valida que el monto sea un entero de centavos y no cambia nada si falla', async () => {
    const user = as('total-invalido@example.com');
    const id = await createManual(user);
    const leche = (await detail(user, id)).lines[0]!;

    for (const lineTotalCents of [1.5, -1, '580', undefined, 10_000_001]) {
      const res = await user(`/purchase-lines/${leche.id}/total`, send('PATCH', { lineTotalCents }));
      expect(res.status).toBe(400);
    }
    expect((await detail(user, id)).lines[0]!.lineTotalCents).toBe(500);
  });

  it('responde 404 a una línea inexistente y 409 a una línea de factura importada', async () => {
    const user = as('total-factura@example.com', fakeDgi(oneLine).options);
    const { id } = await (await user('/purchases/cafe', send('POST', { input: ONE_LINE_CUFE }))).json<{ id: string }>();
    const linea = (await detail(user, id)).lines[0]!;

    expect((await user('/purchase-lines/no-existe/total', send('PATCH', { lineTotalCents: 1 }))).status).toBe(404);

    const res = await user(`/purchase-lines/${linea.id}/total`, send('PATCH', { lineTotalCents: 1 }));
    expect(res.status).toBe(409);
    expect((await detail(user, id)).lines[0]!.lineTotalCents).toBe(linea.lineTotalCents);
  });
});
