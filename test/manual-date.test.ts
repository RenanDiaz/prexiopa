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

async function createManual(user: Api, date: string, store = 'Chino de la esquina') {
  const res = await user(
    '/purchases/manual',
    send('POST', { store: { name: store }, date, lines: [{ description: 'Pan de molde', quantity: 1, lineTotalCents: 250 }] }),
  );
  return (await res.json<{ id: string }>()).id;
}

const issuedAt = async (user: Api, id: string) =>
  (await (await user(`/purchases/${id}`)).json<{ issuedAt: string }>()).issuedAt;

describe('PATCH /api/purchases/:id (CA4.5)', () => {
  it('cambia la fecha de una compra manual a mediodía de Panamá y reordena el historial', async () => {
    const user = as('fecha@example.com');
    const older = await createManual(user, '2026-10-10');
    const newer = await createManual(user, '2026-10-20');

    const res = await user(`/purchases/${older}`, send('PATCH', { date: '2026-10-22' }));
    expect(res.status).toBe(204);
    expect(await issuedAt(user, older)).toBe('2026-10-22T17:00:00.000Z');

    const list = await (await user('/purchases')).json<{ items: { id: string }[] }>();
    expect(list.items.map((p) => p.id)).toEqual([older, newer]);
  });

  it('no permite cambiar la fecha de una factura importada', async () => {
    const user = as('fecha-cafe@example.com', fakeDgi(oneLine).options);
    const { id } = await (
      await user('/purchases/cafe', send('POST', { input: ONE_LINE_CUFE }))
    ).json<{ id: string }>();
    const before = await issuedAt(user, id);

    const res = await user(`/purchases/${id}`, send('PATCH', { date: '2026-10-01' }));
    expect(res.status).toBe(409);
    expect(await issuedAt(user, id)).toBe(before);
  });

  it('rechaza fechas inválidas o futuras sin cambiar nada', async () => {
    const user = as('fecha-invalida@example.com');
    const id = await createManual(user, '2026-10-10');
    const future = new Date(Date.now() + 5 * 86_400_000).toISOString().slice(0, 10);

    for (const date of ['hoy', '2026-13-45', '10/10/2026', future, 20261010, undefined]) {
      const res = await user(`/purchases/${id}`, send('PATCH', { date }));
      expect(res.status).toBe(400);
    }
    expect(await issuedAt(user, id)).toBe('2026-10-10T17:00:00.000Z');
  });

  it('devuelve 404 si la compra no existe', async () => {
    const res = await as('fecha-404@example.com')('/purchases/no-existe', send('PATCH', { date: '2026-10-10' }));
    expect(res.status).toBe(404);
  });
});
