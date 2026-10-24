# Prexiopá

App personal para registrar compras desde la factura electrónica de la DGI (Panamá)
y consultar cuánto pagué por un producto y dónde estaba más barato.

**Fuente de verdad del alcance:** `docs/specs/prexiopa-lite.md`.
No implementes nada que no esté en ese spec. Si algo falta, propón el cambio al spec primero.
El código v0 (Supabase) está en el tag `v0-supabase`; consúltalo solo como referencia.

## Stack
Cloudflare Worker único (Hono en `/api`, SPA en static assets) · D1 + Drizzle ·
React + TS + Vite (`@cloudflare/vite-plugin`) · TanStack Query · CSS Modules ·
Vitest + `@cloudflare/vitest-plugin` (tests corren dentro de workerd con D1 real).

Requiere **npm 11** (Node 24). npm 10 falla resolviendo peer deps (`edgesOut`).

## Estructura
- `worker/index.ts` — app Hono (`createApp`), rutas `/api/*`
- `worker/auth.ts` — Better Auth + Google en `/api/auth/*` y middleware de sesión (+ bypass solo en development)
- `worker/db/schema.ts` — schema Drizzle; `worker/db/migrations/` — SQL generado
- `worker/db/scoped.ts` — ÚNICA puerta a datos del usuario (filtra por userId)
- `src/` — SPA · `test/` — tests de Worker · `scripts/` — utilidades de CI

## Comandos
- `npm run dev` — Vite + Worker + D1 local (copia `.dev.vars.example` a `.dev.vars`)
- `npm run check` — lint + typecheck + test (correr antes de cada commit)
- `npm run build && npm run budget` — build y presupuesto de bundle (≤150 KB gzip inicial)
- `npm run db:generate` — genera migración desde `worker/db/schema.ts` (commitearla)
- `npm run db:migrate:local` — aplica migraciones a D1 local
- `npm run cf-typegen` — regenera `worker-configuration.d.ts` tras cambiar `wrangler.jsonc`

## Reglas
- Dinero SIEMPRE en enteros de centavos (`*_cents`). Parsear montos de la DGI como
  string → centavos; nunca `parseFloat` para dinero.
- Acceso a BD SOLO vía `worker/db/scoped.ts` (lint lo impone). D1 no tiene RLS.
- Todo endpoint nuevo con datos de usuario agrega su caso a `test/isolation.test.ts`.
- El parser CAFE es una función pura; todo cambio va con fixture + test.
- Sin Zustand, sin Recharts, sin librerías de UI nuevas sin justificar en el PR.
- NO ejecutar `wrangler d1 migrations apply --remote` ni `wrangler deploy`.
  El deploy lo hace Workers Builds en cada push a `main`. Las migraciones remotas
  las aplica el humano antes del merge, y deben ser compatibles con la versión anterior.
- Fixtures de facturas: redactar el bloque RECEPTOR (cédula, nombre, teléfono).
