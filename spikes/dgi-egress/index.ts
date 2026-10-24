const DGI_URL = 'https://dgi-fep.mef.gob.pa/Consultas/FacturasPorCUFE/';
const CUFE_RE = /^FE[0-9A-Za-z-]{40,120}$/;

export default {
  async fetch(request: Request): Promise<Response> {
    const cufe = new URL(request.url).searchParams.get('cufe') ?? '';
    if (!CUFE_RE.test(cufe)) return new Response('cufe inválido', { status: 400 });

    const colo = (request as Request & { cf?: { colo?: string } }).cf?.colo;
    const started = Date.now();
    try {
      const res = await fetch(DGI_URL + cufe, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'es-PA,es;q=0.9',
        },
      });
      const html = await res.text();
      // Sin datos personales en la respuesta: solo métricas.
      return Response.json({
        status: res.status,
        ms: Date.now() - started,
        bytes: html.length,
        lines: (html.match(/data-title="Código"/g) ?? []).length,
        hasTotal: html.includes('TOTAL PAGADO'),
        colo,
      });
    } catch (error) {
      return Response.json({ error: String(error), ms: Date.now() - started, colo }, { status: 502 });
    }
  },
};
