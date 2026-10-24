# Spike: salida a la DGI desde Cloudflare (Fase 0)

```bash
cd spikes/dgi-egress
npx wrangler login        # si no has iniciado sesión
npx wrangler deploy
curl "https://prexiopa-dgi-egress-spike.<tu-subdominio>.workers.dev/?cufe=<CUFE>"
npx wrangler delete       # al terminar
```

**Éxito:** `status: 200`, `lines > 0` y `hasTotal: true` en 3 CUFEs distintos.
Este directorio se elimina en la Fase 1.
