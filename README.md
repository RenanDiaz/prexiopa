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

1. ~~`npx wrangler d1 create prexiopa`~~ (hecho; el id ya está en `wrangler.jsonc`).
2. `npx wrangler d1 migrations apply prexiopa --remote`
3. En Google Cloud Console → APIs y servicios → Credenciales, crear (o reutilizar) un
   cliente OAuth de tipo "Aplicación web" con:
   - Orígenes autorizados: `https://<tu-dominio>`
   - URI de redireccionamiento: `https://<tu-dominio>/api/auth/callback/google`
4. Poner `BETTER_AUTH_URL` (`https://<tu-dominio>`, sin barra final) en `wrangler.jsonc`.
5. Cargar los secrets:
   ```bash
   openssl rand -base64 32 | npx wrangler secret put BETTER_AUTH_SECRET
   npx wrangler secret put GOOGLE_CLIENT_ID
   npx wrangler secret put GOOGLE_CLIENT_SECRET
   npx wrangler secret put ALLOWED_EMAILS   # correos separados por coma
   ```
6. `npm run build && npx wrangler deploy`
7. Si usas dominio propio, agregarlo en Workers → prexiopa → Settings → Domains & Routes.
