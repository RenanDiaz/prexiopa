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

## Deploy

Producción: **https://prexiopa.com**. Workers Builds (Cloudflare) hace el build y el deploy
en cada push a `main`. No hace falta correr `wrangler deploy` a mano.

Si el cambio trae una migración nueva en `worker/db/migrations/`, aplícala **antes** de
mergear a `main`, para que el código nuevo no corra contra un schema viejo:

```bash
npx wrangler d1 migrations apply prexiopa --remote
```

Las migraciones deben ser compatibles con la versión anterior (solo agregar), porque entre la
migración y el deploy sigue corriendo el código viejo.

### Configuración (ya hecha; referencia para rehacerla)

- **D1:** base `prexiopa`; su id está en `wrangler.jsonc`.
- **Google OAuth:** cliente "Aplicación web" en Google Cloud Console, con origen
  `https://prexiopa.com` y redirección `https://prexiopa.com/api/auth/callback/google`.
- **Secrets** (`npx wrangler secret put <NOMBRE>`): `BETTER_AUTH_SECRET`
  (`openssl rand -base64 32`), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y
  `ALLOWED_EMAILS` (correos separados por coma).
- **Dominio:** `prexiopa.com` está como custom domain en `wrangler.jsonc`, y `workers.dev` está apagado.
- **Workers Builds** (Workers & Pages → prexiopa → Settings → Build): repo
  `RenanDiaz/prexiopa`, rama de producción `main`, build `npm run build`, deploy
  `npx wrangler deploy`, variable `NODE_VERSION=24`, builds de otras ramas desactivados.
