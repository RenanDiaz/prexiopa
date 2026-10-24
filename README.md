# Prexiopá

Registra tus compras de supermercado escaneando el QR de la factura electrónica (DGI Panamá)
y consulta cuánto pagaste por un producto y dónde estaba más barato.

- **Spec:** [`docs/specs/prexiopa-lite.md`](docs/specs/prexiopa-lite.md)
- **Stack:** Cloudflare Workers + D1, Hono, Drizzle, React + Vite
- **Versión anterior (Supabase):** tag `v0-supabase`

## Desarrollo local

Requiere Node 24 (npm 11).

```bash
npm ci
cp .dev.vars.example .dev.vars   # define DEV_USER_EMAIL
npm run db:migrate:local
npm run dev
```

## Verificación

```bash
npm run check                    # lint + typecheck + tests
npm run build && npm run budget  # build + presupuesto de bundle
```

## Deploy (manual, primera vez)

1. `npx wrangler d1 create prexiopa` y copiar el `database_id` a `wrangler.jsonc`.
2. `npx wrangler d1 migrations apply prexiopa --remote`
3. `npm run build && npx wrangler deploy`
4. En Cloudflare Zero Trust, crear una aplicación Access (self-hosted) para el dominio
   del Worker con Google como IdP, y copiar `ACCESS_TEAM_DOMAIN` y `ACCESS_AUD`
   a `wrangler.jsonc`. Volver a desplegar.
