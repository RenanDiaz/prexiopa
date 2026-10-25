# Spec: Prexiopá Lite

> **Estado:** Borrador para revisión · **Fecha:** 2026-10-24
> **Reemplaza a:** el plan de sprints de `CLAUDE.md` (Sprints 1–7)
> **Plataforma destino:** Cloudflare Workers + D1 (sale Supabase)

---

## 1. Problema

Prexiopá v0 se dejó de usar. Hay dos causas, y ninguna es la calidad del código:

1. **Registrar una compra cuesta demasiado.** Cada producto pide buscar o escanear, abrir un modal y llenar precio, cantidad, tienda, ITBMS y promociones. Una compra de 30 productos se traduce en más de 150 interacciones.
2. **El esfuerzo se fue a una comunidad que no existe:** contribuciones, moderación, roles, reputación, analytics de admin y promociones colaborativas. Eso suma ~53k líneas de TS, 17 tablas y 54 RPCs para un solo usuario.

## 2. Objetivo

Que registrar una compra tome **menos de 30 segundos y sin escribir nada**, aprovechando la factura electrónica (CAFE) de la DGI. Con ese historial se responde una sola pregunta:

> **"¿Cuánto pagué por esto la última vez, y dónde estaba más barato?"**

### Métricas de éxito (personales, a 60 días del deploy)

- Registro al menos el 80 % de mis compras de supermercado.
- La mediana del tiempo entre escanear el QR y tener la compra guardada es ≤ 30 s.
- Uso la consulta de precio en tienda al menos 1 vez por semana.

Si a los 60 días no se cumplen, se archiva el proyecto sin culpa.

## 3. Alcance

### En alcance (v1)

| ID | Funcionalidad | Prioridad |
|---|---|---|
| F1 | Importar una compra desde el QR o el CUFE de la factura electrónica | Must |
| F2 | Historial de compras (lista + detalle) | Must |
| F3 | Consulta de precio de un producto (escaneo de código de barras o búsqueda) | Must |
| F4 | Compra manual mínima (fallback para tiendas sin factura electrónica) | Should |
| F5 | Nombrar y vincular productos entre tiendas | Should |
| F6 | Resumen de gasto mensual | Could |
| F7 | Instalable en el teléfono (manifest PWA, sin modo offline) | Could |

### Fuera de alcance (explícito)

Lo siguiente **no se construye**. Si un agente lo propone, la respuesta es no:

- Contribuciones, moderación, roles, reputación, leaderboard y panel de admin.
- Modelado de promociones (7 tipos), cupones y cartillas. Se reemplaza por el **precio efectivo** (ver §5.3).
- Entrada manual de ITBMS. El ITBMS se **lee de la factura** y no se pide al usuario.
- Listas de compra para planificar.
- Favoritos, alertas de precio, perfil y página de settings.
- Registro con email/contraseña, verificación de email y reset de contraseña.
- Toggle de dark mode (se usa `prefers-color-scheme`).
- Modo offline, push notifications, SEO, sitemap y analytics de terceros.

## 4. Flujos y criterios de aceptación

### F1 — Importar compra desde la factura

**Flujo:** Inicio → "Escanear factura" → cámara → preview → "Guardar" → detalle de la compra.

- **CA1.1** Con la cámara abierta, al apuntar al QR de una factura CAFE válida, el preview aparece sin que el usuario toque nada más. Debe funcionar con QR de alta densidad, que el escáner actual ya maneja.
- **CA1.2** Si la cámara falla, se puede pegar el CUFE o la URL del QR en un campo de texto y el resultado es el mismo.
- **CA1.3** El preview muestra la tienda (nombre según la DGI), fecha, total, número de líneas y la lista de líneas con descripción, cantidad y total de línea.
- **CA1.4** Al guardar, se crea la compra con todas sus líneas. Si el RUC del emisor no existe en `stores`, la tienda se crea automáticamente.
- **CA1.5** Si el CUFE ya fue importado por el usuario, no se duplica la compra: se muestra "Ya importaste esta factura" con un enlace a ella.
- **CA1.6** Si la DGI no responde o devuelve un formato desconocido, se muestra un error con el CUFE visible y la opción "Reintentar". No se guarda nada parcial.
- **CA1.7** Las interacciones entre abrir la cámara y ver la compra guardada son, como máximo, **2 taps**: "Escanear" y "Guardar".
- **CA1.8** Cada compra importada guarda `scan_ms`: los milisegundos entre que el cliente detecta el QR (o se envía el CUFE pegado) y que el usuario toca "Guardar". Se mide en el cliente con `performance.now()` (reloj monotónico, así el desfase del reloj del teléfono no afecta) y viaja en el body de `POST /api/purchases/cafe`. Incluye la espera de la DGI y el tiempo que el usuario mira el preview, porque eso es lo que vive en la caja. No se sobrescribe si la compra ya existía (CA1.5). Si falta, queda en `NULL` y no cuenta para la métrica.

### F2 — Historial de compras

- **CA2.1** La lista muestra las compras ordenadas por fecha descendente, cada una con tienda, fecha, total y número de líneas.
- **CA2.2** El detalle muestra las líneas y el desglose de la factura: subtotal, ITBMS por tasa, descuentos y total, todo tal como viene en la factura.
- **CA2.3** Se puede eliminar una compra (pidiendo confirmación).
- **CA2.4** La lista pagina o hace scroll infinito sin degradarse con 500 compras o más.

### F3 — Consulta de precio

**Flujo:** Inicio → "¿Cuánto cuesta?" → escanear código de barras o escribir texto → resultado.

- **CA3.1** Al escanear un EAN/UPC, se muestran todas las veces que compré ese producto: tienda, fecha y **precio efectivo unitario**. Si la cantidad de esa línea no es confiable (§10.6), se muestra el **precio pagado por la línea**, marcado como tal, y no entra en el "más bajo" de CA3.2.
- **CA3.2** Arriba se destaca el último precio pagado y el precio más bajo de los últimos 90 días, cada uno con su tienda.
- **CA3.3** La búsqueda por texto encuentra coincidencias parciales en el nombre del producto y en la descripción de la línea de factura (por ejemplo, "leche estrella" encuentra "LECHE ESTRELLA AZUL 1L").
- **CA3.4** Si no hay resultados, se muestra "Aún no has comprado esto". No se ofrece crear el producto.
- **CA3.5** El historial se ve como lista. Un sparkline en SVG inline es opcional. **No se usa Recharts.**

### F4 — Compra manual (Should)

- **CA4.1** Primero se elige la tienda (con autocompletado sobre las existentes, o creando una nueva solo con nombre).
- **CA4.2** Cada línea pide solo **producto, cantidad y total de línea pagado**. El producto se escanea, se busca o se escribe como texto libre. No hay campos de ITBMS ni de promoción.
- **CA4.3** Agregar una línea toma ≤ 3 interacciones después de elegir el producto.
- **CA4.4** Una compra manual queda en el mismo historial que las importadas, marcada como "Manual".

### F5 — Nombrar y vincular productos (Should)

- **CA5.1** Desde una línea de factura se puede asignar un nombre legible (por ejemplo, "LCH EST AZ 1L" → "Leche Estrella Azul 1 L").
- **CA5.2** Se pueden vincular ítems de tiendas distintas al mismo producto para que F3 los compare.
- **CA5.3** Si el código de la línea, normalizado según el `code_format` de la tienda (§10.2), es un GTIN válido, el vínculo con `products` se hace automáticamente.
- **CA5.4** Se puede editar el nombre visible de una tienda. La DGI entrega la razón social (por ejemplo, "Inmobiliaria Don Antonio, S.A."), no el nombre comercial.
- **CA5.5** En el detalle de una compra de una tienda con cantidades no confiables (§10.6), cada línea permite corregir la cantidad con "+ / −" (1 tap por unidad) o, si es pesable, anotar el peso. Es opcional: la compra queda guardada aunque no se corrija nada.
- **CA5.6** Las cantidades inferidas (§10.6) se muestran marcadas como "inferida" y se pueden corregir igual que en CA5.5.

### F6 — Resumen mensual (Could)

- **CA6.1** Muestra el total gastado por mes en los últimos 12 meses y el total por tienda del mes actual.

## 5. Modelo de datos (D1 / SQLite)

### 5.1 Reglas

- **Dinero en enteros de centavos** (`*_cents INTEGER`). Nunca `REAL` para montos.
- Cantidades en `REAL`, porque hay productos por peso (1.234 kg).
- IDs en `TEXT` (UUID v7 o ULID, generados en el Worker).
- Fechas en `TEXT` ISO-8601 UTC.
- **D1 no tiene RLS.** Toda tabla con datos de usuario lleva `user_id`, y **toda** query la filtra (ver §6.4).

### 5.2 Tablas

```text
users          id, email UNIQUE, catalog_version, created_at
               -- catalog_version: reglas de catálogo ya aplicadas a sus datos

stores         id, ruc UNIQUE NULL, dv, legal_name, display_name NULL,
               code_format ('gtin'|'gtin_no_check'|'internal'),
               quantities ('reliable'|'always_one'), configured_by_user, created_at
               -- quantities: si la cadena manda la cantidad real o siempre 1 (§10.6)
               -- configured_by_user: el usuario corrigió code_format/quantities y la detección ya no los cambia
               -- una fila por CADENA (RUC), no por sucursal (ver §10)
               -- ruc NULL solo para tiendas creadas a mano (F4)

products       id, user_id, name, gtin NULL, created_at
               UNIQUE(user_id, gtin)
               -- producto "canónico" del usuario, el que F3 compara entre tiendas
               -- gtin: GTIN-13 normalizado (§10.2)

store_items    id, user_id, store_id, code NULL, description, product_id NULL,
               link_source ('auto'|'user') NULL, is_weighed (0|1), weighed_by_user NULL, created_at
               UNIQUE(user_id, store_id, code)
               -- cómo llama cada tienda a un producto (texto y código de la factura)
               -- link_source: 'auto' = vínculo por GTIN (CA5.3); 'user' = el usuario vinculó o desvinculó
               -- is_weighed: pesable (§10.6 regla 2); weighed_by_user: corrección del usuario, gana sobre la detección

purchases      id, user_id, store_id, source ('cafe'|'manual'), cufe NULL,
               issued_at, branch_address NULL,
               subtotal_cents, tax_cents, discount_cents, total_cents, paid_cents,
               source_url NULL, raw_json NULL, scan_ms INTEGER NULL, created_at
               UNIQUE(user_id, cufe)
               -- scan_ms: CA1.8, solo compras 'cafe'; NULL en manuales y en las anteriores a la Fase 5
               -- totales tomados del ENCABEZADO de la factura, nunca sumando líneas (§10.3)

purchase_lines id, purchase_id, line_no, store_item_id, description, quantity,
               list_price_cents, discount_cents, line_total_cents,
               tax_rate_bp, tax_cents,
               quantity_source ('invoice'|'inferred'|'user')
               -- quantity_source: de dónde sale `quantity` (§10.6)
               -- list_price = columna "Precio"; discount = columna "Descuento";
               -- line_total = columna "Total" (incluye ITBMS)
               -- tax_rate_bp: puntos base (700 = 7 %)
```

Se eliminan todas las tablas de v0 que no aparecen aquí.

### 5.3 Precio efectivo (reemplaza el sistema de promociones)

```
precio_efectivo_unitario = line_total_cents / quantity
```

`line_total_cents` es lo que **realmente se pagó** por la línea, después de descuentos. Un 2x1, un "Ahorra 4" o un cupón ya quedan reflejados en ese número. F3 compara siempre el precio efectivo, nunca el precio de lista. Confirmado en la Fase 0: el descuento viene como columna de cada línea (§10.1).

El precio efectivo unitario solo es comparable si `quantity` es real: cuando `quantity_source` es `invoice` en una tienda `reliable`, o es `inferred` o `user`. En los demás casos (cantidad 1 de una tienda `always_one`, sin corregir) F3 usa el precio de la línea y lo marca como tal (§10.6). Para pesables con peso conocido, el precio efectivo es por kg.

## 6. Arquitectura

### 6.1 Stack

| Capa | Elección | Nota |
|---|---|---|
| Runtime | **Un solo Cloudflare Worker** | Sirve la SPA (static assets) y la API en `/api/*`, con el mismo origen y sin CORS |
| API | Hono | Router liviano, nativo de Workers |
| BD | D1 + Drizzle ORM | Schema en TS. Las migraciones las genera `drizzle-kit` y se aplican con `wrangler d1 migrations apply` |
| Frontend | React + TypeScript + Vite (`@cloudflare/vite-plugin`) | El dev local corre el Worker y D1 dentro de Vite |
| Estado del servidor | TanStack Query | **Sin Zustand.** El estado de UI va en `useState` o en la URL |
| Escáner | `@zxing/browser`, cargado con lazy load | Una sola librería. Se elimina `jsqr` solo si zxing lee las facturas reales de la Fase 0 |
| Estilos | CSS Modules | Pocas pantallas; no hace falta un design system |
| Íconos | Ninguna librería | `react-icons` se eliminó; la UI no necesita íconos |
| Tests | Vitest + `@cloudflare/vitest-plugin` | Integración real contra D1 local. Antes se llamaba `vitest-pool-workers` |

### 6.2 Autenticación — decisión: Better Auth con Google (D1)

- Better Auth corre dentro del Worker en `/api/auth/*`, con Google como único proveedor. El login redirige directo al dominio de la app (`BETTER_AUTH_URL`), sin pantalla intermedia de Cloudflare.
- Better Auth guarda usuarios, cuentas, sesiones y verificaciones en sus propias tablas `auth_*` (D1, vía el adapter de Drizzle). La identidad de la app sigue siendo `users`: el middleware lee la sesión y hace upsert de `users` por email.
- **Acceso restringido (D2):** solo entran los correos de `ALLOWED_EMAILS` (secret, separado por comas). Se valida al crear el usuario y en cada request, así que quitar un correo de la lista corta también sus sesiones abiertas. Lista vacía = nadie entra.
- **Fail closed:** sin `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID` o `GOOGLE_CLIENT_SECRET`, el Worker responde 500 y no acepta sesiones.
- **Contras frente a Access:** el login y las sesiones son código propio (mitigado con tests en `test/auth.test.ts`), y los secrets hay que rotarlos a mano.
- **Dev local:** `DEV_USER_EMAIL` en `.dev.vars` salta la validación. **Solo** si `ENVIRONMENT=development`, y debe haber un test que lo verifique.

### 6.3 Import CAFE

- Se porta `supabase/functions/fetch-cafe/index.ts` (Deno) a `worker/cafe/` y se divide en dos partes:
  - `parseInvoiceHtml(html): CafeInvoice`, una **función pura** probada con fixtures HTML reales y redactados (sin nombre ni RUC del receptor).
  - `fetchCafe(cufeOrUrl)`, que hace el fetch a `dgi-fep.mef.gob.pa`, aplica reintentos y luego llama al parser.
- `POST /api/purchases/cafe/preview` devuelve el preview sin guardar. `POST /api/purchases/cafe` guarda, y es idempotente por `(user_id, cufe)`.
- El guardado (compra, líneas, tienda y store_items) es **atómico** con `db.batch()`.

### 6.4 Aislamiento por usuario (sustituto de RLS)

- Todo acceso a datos pasa por un módulo `worker/db/scoped.ts` que recibe `userId` y **siempre** filtra por él. Ningún handler importa Drizzle directamente.
- Una regla de lint (`no-restricted-imports`) prohíbe importar el cliente de BD fuera de `worker/db/`.
- Un test de integración crea dos usuarios y verifica que ninguno puede leer, modificar ni borrar datos del otro en cada endpoint.

### 6.5 Estructura

```text
/worker          API (Hono), auth, cafe, db
/worker/db       schema.ts, scoped.ts, migrations/
/src             SPA (React)
/test/fixtures   HTML de facturas redactadas
wrangler.jsonc
```

### 6.6 Presupuestos

- JS inicial ≤ **150 KB gzip**. El escáner va en un chunk lazy aparte.
- `GET /api/*` p95 ≤ 300 ms. El preview CAFE depende de la DGI y se excluye.
- El CI falla si el bundle inicial excede el presupuesto.

## 7. Plan por fases

Cada fase se puede desplegar sola y tiene un criterio de salida.

### Fase 0 — Validación (spike, ≤ 1 día) ✅ Cerrada (ver §10)

Sirve para saber si el producto tiene sentido antes de construir nada.

1. Importar 3–5 facturas reales del supermercado habitual con el sistema actual, o con un script que reuse el parser.
2. Responder y documentar en este spec:
   - ¿Las facturas traen el detalle por línea? ¿Qué tan legibles son las descripciones?
   - ¿El código de producto de la línea es un EAN/UPC o un código interno de la tienda?
   - ¿Cómo vienen los descuentos: como campo de la línea o como líneas negativas?
   - ¿Con cuántos decimales viene el precio unitario?
3. Desplegar un Worker descartable que haga fetch a una URL de la DGI y confirmar que **la DGI no bloquea la salida de Cloudflare**.

**Salida:** si las facturas no traen el detalle por línea, o la DGI bloquea Cloudflare, **se detiene el plan** y se replantea.

### Fase 1 — Esqueleto — ✅ completada (24 Oct 2026)

- Taguear el estado actual como `v0-supabase` y eliminar el código v0 (queda en el historial de git).
- Scaffold: Worker + Hono + D1 + Drizzle + Vite SPA, con auth Better Auth + Google y el middleware de §6.2.
- CI en GitHub Actions: lint, typecheck, test y build, más el check de presupuesto de bundle.
- Deploy con login de Google vía Better Auth (§6.2).
- Reemplazar `CLAUDE.md` por el del Anexo A.

**Salida:** una pantalla "Hola, {email}" en producción, CI en verde y el test de aislamiento (§6.4) pasando con un endpoint de ejemplo.

**Resultado:** en producción en `https://prexiopa.com` con login de Google (Better Auth) verificado. Migraciones `0000` y `0001` aplicadas en D1. CI en verde en el PR del esqueleto; los commits de Better Auth pasaron `npm run check`, build y presupuesto en local.

### Fase 2 — Import CAFE (F1, F2) — 🟡 implementada y probada en el teléfono; falta el uso real

**Salida:** se cumplen CA1.x y CA2.x, y yo importo mis compras reales de 2 semanas.

**Estado (2026-10-24):** parser, endpoints, guardado atómico, historial paginado, detalle y escáner implementados. CA1.2–CA1.6 y CA2.1–CA2.4 tienen tests y se probaron en local contra la DGI real. CA1.1 y CA1.7 se verificaron con la cámara de un teléfono (2026-10-25). Queda el uso real de 2 semanas.

### Fase 3 — Consulta de precios (F3, F5) — 🟡 implementada; falta usarla en tienda

- Incluye el manejo de cantidades no confiables (§10.6): migración de `stores.quantities`, `store_items.is_weighed` y `purchase_lines.quantity_source`; detección por tienda; inferencia de cantidades; y corrección rápida (CA5.5, CA5.6).

**Salida:** se cumplen CA3.x y CA5.x, y lo uso en tienda.

**Estado (2026-10-24):** migración `0002`, catálogo (`worker/catalog/rules.ts`, `worker/db/catalog.ts`), búsqueda por texto y código, historial de precios con último y más bajo de 90 días, renombrar, vincular y desvincular, nombre y formatos de la tienda, corrección de cantidad/peso y pesable por ítem. Con las 7 facturas reales: Don Antonio se detecta como `always_one`, CITY MALL y TAMEK como `reliable`, 6 productos quedan vinculados por GTIN entre Don Antonio y CITY MALL, y confirmar una cantidad en Don Antonio la vuelve comparable. Sin verificar: escanear códigos de barras con la cámara del teléfono, y el sparkline opcional (CA3.5) no se hizo.

- Al subir `CATALOG_VERSION`, los datos de cada usuario se recalculan una vez al abrir la app (`GET /api/me`). Así se aplican las reglas a las compras importadas antes de la Fase 3.
- Los PLU se marcan como pesables, pero algunos se venden por unidad (un mazo de culantro). Por eso cada ítem tiene "Se vende por peso / por unidad" (`weighed_by_user`).

### Fase 4 — Manual, migración de datos y apagado de Supabase (F4, F6, F7) — 🟡 implementada; falta apagar la v0

**Estado (2026-10-24):** compra manual (tienda nueva solo con nombre o autocompletado, líneas con producto existente, código escaneado o texto libre, cantidad y total; se vincula por GTIN si se escaneó), resumen mensual de 12 meses y por tienda del mes en hora de Panamá, importar varios, y manifest PWA con íconos. Probado en local. Pendiente del dueño: borrar el proyecto de Supabase y desconectar Vercel.

- Migración de datos: exportar los **CUFEs** de `imported_invoices` y **reimportarlos con el pipeline nuevo**, sin transformar datos viejos.
  - ✅ **Resultado (2026-10-24): no hay nada que migrar.** Se reactivó el proyecto de Supabase y `imported_invoices` está vacía (0 CUFEs). La importación por CUFE llegó a la v0 en diciembre de 2025, cerca de cuando se dejó de usar. Las compras manuales de la v0 no se migran (D3). El backup descargado queda archivado fuera del repo.
  - Export en el SQL Editor de Supabase: `select cufe from imported_invoices order by issue_date;`
  - **Importar varios** (pantalla de importar): se pega una lista de CUFEs o URLs del QR, uno por línea. Se importan de a uno, con el estado de cada uno a la vista: guardada, ya importada o error con "Reintentar". Usa el mismo `POST /api/purchases/cafe`, así que las facturas ya importadas no se duplican (CA1.5).
- Las sesiones manuales de v0 se descartan, salvo que se decida lo contrario (ver §8).
- Pausar el proyecto de Supabase. Se borra a los 30 días sin incidentes. Como no había datos que migrar, se puede borrar sin esperar.
- Desconectar del repo el proyecto de Vercel de la v0, que falla en cada PR desde la Fase 1.

### Fase 5 — Uso y decisión (sin funciones nuevas) — ⏳ pendiente

**Regla:** durante esta fase solo se corrigen bugs y fricciones que aparezcan al usar la app. No se agregan funciones, y todo lo de "Fuera de alcance" sigue fuera.

**Calendario:** día 0 = **2026-10-25**. Revisión el **2026-12-24** (día 60). Si no se cumplen las métricas de §2, se archiva el proyecto sin culpa.

**Trabajo previo (antes de contar los 60 días en serio):**

1. Implementar CA1.8 (`scan_ms`): columna nullable en `purchases` y migración aditiva, compatible con la versión anterior del Worker. El cliente envía `scan_ms` al guardar, y la lista, el detalle y el resto de la API no cambian. Va con test del endpoint y de que una compra duplicada no pisa el valor.
2. Verificar con la cámara del teléfono el escaneo de códigos de barras (CA3.1), único criterio de las fases 3 y 4 sin probar en un dispositivo.
3. Borrar el proyecto de Supabase y desconectar Vercel (dueño).
4. Confirmar que D1 Time Travel está disponible en el plan antes de acumular historial.

**Cómo se miden las métricas del día 60** (consultas de solo lectura, sin pantalla ni endpoint nuevo):

| Métrica | Consulta |
|---|---|
| Mediana de `scan_ms` ≤ 30 000 | `SELECT scan_ms FROM purchases WHERE source='cafe' AND scan_ms IS NOT NULL ORDER BY scan_ms LIMIT 1 OFFSET (SELECT (COUNT(*)-1)/2 FROM purchases WHERE source='cafe' AND scan_ms IS NOT NULL);` |
| ≥ 80 % de compras de súper registradas | Autorreporte: el usuario anota cuántas idas al súper hizo y se compara con `COUNT(*)` de `purchases` en el periodo |
| Consulta de precio ≥ 1 vez por semana | Autorreporte. No se registran consultas, para no agregar telemetría |

SQLite no tiene `MEDIAN`, por eso la consulta usa `OFFSET`. Se corre con `wrangler d1 execute --remote --command` (solo `SELECT`).

**Preguntas que el uso debe responder** (se anotan en §10.7 durante la fase):

- Don Antonio: ¿la inferencia de unidades y la corrección con +/− alcanzan, o corregir cantidades se vuelve una carga? (§10.6)
- DGI: ¿qué parte de `scan_ms` es espera de la DGI? Si la mediana pasa de 30 s por esa espera, se evalúa guardar en segundo plano.
- ¿Se consulta el precio en tienda antes de comprar?

**Decisión del día 60:** cumple las métricas → seguir y evaluar solo lo que los datos justifiquen (D2 familia, sparkline, OCR). No las cumple → archivar.

## 8. Decisiones abiertas

| # | Decisión | Recomendación |
|---|---|---|
| D1 | Auth: Cloudflare Access o Better Auth | ✅ **Better Auth** con Google: el login redirige directo al dominio de la app (§6.2) |
| D2 | ¿Usuarios en v1: solo yo, o yo + familia? | Lista cerrada en `ALLOWED_EMAILS` (§6.2). El modelo ya es multiusuario |
| D3 | ¿Migrar las compras manuales de v0? | ✅ **No.** Solo se reimportan CUFEs (la v0 no tenía ninguno, §7 Fase 4) |
| D4 | Dominio propio o `workers.dev` | ✅ **Dominio propio** `prexiopa.com` (lo pide el login con Better Auth); `workers.dev` desactivado |
| D5 | Estilos: CSS Modules o mantener styled-components | ✅ **CSS Modules** (decidido en la Fase 1) |
| D6 | ¿Los productos (`products`) se comparten entre usuarios? | **No** en v1. Compartirlos vuelve a traer la moderación |

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| La DGI cambia el HTML de la consulta | Parser puro con fixtures; un error claro (CA1.6) en vez de datos corruptos |
| La DGI bloquea o limita las IPs de Cloudflare | Validarlo en la Fase 0. Plan B: escanear el QR y abrir la URL en el navegador del usuario (fuera de alcance hasta que haga falta) |
| Fuga de datos entre usuarios sin RLS | §6.4: módulo scoped, regla de lint y test de aislamiento obligatorio |
| Scope creep (repetir v0) | §3 "Fuera de alcance". Toda funcionalidad nueva requiere actualizar este spec primero |
| Fixtures con datos personales en el repo | Redactar el nombre y RUC del receptor antes de commitear |

## 10. Resultados de la Fase 0 (2026-10-24)

**Muestra:** 7 facturas reales de 3 cadenas (razones sociales TAMEK, S.A.; Inmobiliaria Don Antonio, S.A.; CITY MALL, S.A.), de 1 a 87 líneas cada una, entre nov 2025 y oct 2026. El parser v0 (`supabase/functions/fetch-cafe`) leyó las 7 sin errores.

| Pregunta | Resultado |
|---|---|
| ¿Traen detalle por línea? | **Sí.** Código, descripción, cantidad, precio, descuento, ITBMS y total en todas. Las descripciones de Don Antonio vienen truncadas a 18 caracteres ("ESTRELLA AZUL YOGU") |
| ¿El código es EAN/UPC? | **Depende de la cadena** (§10.2). Con solo 7 facturas ya hay 8 productos que coinciden entre dos cadenas distintas |
| ¿Cómo vienen los descuentos? | **Como columna "Descuento" de cada línea.** 33 líneas con descuento, $23.37 en total. "Total" ya es el neto con ITBMS |
| ¿Precisión decimal? | Inconsistente: TAMEK manda 6 decimales con ruido de float (`1.639999`) y CITY MALL totales sin redondear (`3.53875`) |
| ¿La DGI responde desde Cloudflare? | **Sí.** 7 de 7 respondieron 200 con líneas y total, desde el colo `MIA`. Latencia: 0.6–1.5 s para el emisor `541-81`, y **11–12 s** para TAMEK y CITY MALL |

**Veredicto:** el producto es viable. La Fase 0 quedó cerrada el 2026-10-24.

- Las 2 facturas que el spike reportó con `lines: 1` son compras reales de un solo producto (ATLAS LATA 355 ML por $4.62 y VALUE507 CREMA 400 por $2.60). Los totales cuadran con el encabezado; no se trata de otro formato de página.
- **Por la latencia:** el fetch a la DGI usa un timeout de 30 s con 1 reintento, y el preview de F1 muestra un estado de "Consultando la DGI…". CA1.1 se cumple aunque el preview tarde 12 s.

### 10.1 Columnas de la tabla de líneas (HTML de la DGI)

`Linea, Código, Descripción, Información de interés, Cantidad, Precio, Descuento, Monto, Impuesto, ISC, Acarreo, Seguro, Total`

Encabezado: `Valor Total`, `ITBMS Total`, `Forma de Pago`, `TOTAL PAGADO`, `Vuelto`.

### 10.2 Normalización de códigos (`stores.code_format`)

| Formato | Ejemplo | Cadena observada | Regla |
|---|---|---|---|
| `gtin` | `7411000222904` | CITY MALL (60 de 77 válidos) | Validar el dígito verificador y rellenar con ceros a 13 |
| `gtin_no_check` | `741100022290` → `7411000222904` | Don Antonio | **Le falta el dígito verificador y los ceros iniciales.** Calcular el dígito y rellenar a 13 |
| `internal` | `10085482` | TAMEK (5 de 81 válidos, al azar) | No hay GTIN; el vínculo es manual (F5) |

- **Detección automática al crear la tienda:** si ≥ 60 % de los códigos numéricos de 8 a 14 dígitos tienen un dígito verificador válido, el formato es `gtin`. Si no, y la mayoría tienen 10–12 dígitos, es `gtin_no_check`. En otro caso, `internal`. El usuario puede corregirlo.
- Los códigos de pesables (PLU de 4 dígitos, prefijo `2` de circulación restringida) nunca generan GTIN. Se vinculan a mano.
- Al cambiar el `code_format` de una tienda se recalculan los vínculos automáticos de sus `store_items`.

### 10.3 Montos

- Los números se parsean **como string a centavos enteros** (redondeo half-up). Nunca se usa `parseFloat` para dinero.
- Los totales de la compra salen del **encabezado** (`Valor Total`, `ITBMS Total`, `TOTAL PAGADO`). La suma de las líneas puede diferir en algunos centavos: en CITY MALL suman $156.2381, el encabezado dice $156.22 y se pagó $156.24. Solo se registra un warning si la diferencia es mayor a $0.05.

### 10.4 Bugs del parser v0 que se corrigen al portarlo

- Ignora la columna `Descuento`.
- Calcula los totales sumando floats en lugar de leer el encabezado.
- `invoiceNumber` sale vacío en las 7 facturas. No bloquea, porque el CUFE es el identificador.

### 10.4.1 Hallazgos al portar el parser (Fase 2)

- La columna es **"Descuento Unitario"**: el descuento es por unidad. `purchase_lines.discount_cents` guarda el descuento total de la línea (`Descuento × Cantidad`).
- El "Descuentos" del pie de la factura es un descuento global y casi siempre viene en `0.00`, aunque haya líneas con descuento. `purchases.discount_cents` = suma de los descuentos de línea + el del pie.
- `Valor Total` **incluye** ITBMS. `subtotal_cents = Valor Total − ITBMS Total`.
- La tasa de ITBMS de cada línea no viene en el HTML: se infiere de `Impuesto / Monto` y se redondea a la tasa más cercana (0, 7, 10 o 15 %).
- El número de factura sí viene, en el encabezado ("No. 0000110262"). La fecha del encabezado está en hora de Panamá (UTC-5) y se guarda en UTC.
- Algunas descripciones traen `\/` escapado ("D\/ARROZ").
- Los paneles EMISOR y RECEPTOR usan las mismas etiquetas (`RUC`, `NOMBRE`…): el parser solo lee el panel del emisor.
- Si el CUFE no existe, la DGI responde **200** con el contenedor `facturaHTML` vacío. La API lo devuelve como 404 `not_found`.
- El preview deja el HTML en la caché del Worker por 15 minutos, para que "Guardar" no espere otros 12 s a la DGI.

### 10.5 Privacidad

El HTML trae la cédula, el nombre y el teléfono del receptor. Los fixtures **deben** redactar el bloque `RECEPTOR` antes de commitearse, y `raw_json` no guarda el receptor.

### 10.6 Cantidades no confiables (Inmobiliaria Don Antonio)

**Hallazgo (2026-10-24):** las facturas de Inmobiliaria Don Antonio, S.A. (RUC 541-81-118009; El Rey, Romero, Mr. Precio, Farmacias Metro y Farma Ahorro) traen **cantidad 1 en todas las líneas**:

- Si se llevan varias unidades del mismo producto, sale **una sola línea** con cantidad 1, y "Precio" y "Total" corresponden a todas las unidades. Ningún código se repite dentro de una factura.
- Los pesables también salen con cantidad 1: "ZANAHORIA 1 KG" cuesta $0.82 en una compra y $0.94 en otra, según el peso real, pero el peso no aparece.
- 191 de 191 líneas en las 5 facturas de muestra. En TAMEK y CITY MALL las cantidades son reales (`1.937008` kg, `0.745` kg, `6` unidades).
- El XML oculto de la página (`facturaXML`) viene cifrado, y el HTML se genera de ese mismo XML: no hay otra fuente de la cantidad real en la DGI.
- **El ticket impreso que entrega la tienda sí muestra la cantidad y el precio unitario correctos.** El punto de venta tiene los datos; se pierden al generar la factura electrónica que se transmite a la DGI.

**Contexto normativo:** según la Ficha Técnica de la FE v1.10 de la DGI, `dCantCodInt` (C06) es obligatorio y es la "cantidad del producto o servicio, en la unidad de medida del código interno". La validación automática solo exige que `dPrItem` = `dCantCodInt × (dPrUnit − dPrUnitDesc)`, así que una línea con cantidad 1 y "precio unitario" igual al total de varias unidades pasa la validación. Que la cantidad no sea la real no lo detecta el sistema de la DGI.

**Reglas:**

1. **Detección por tienda.** `stores.quantities = 'always_one'` si, en las facturas importadas de esa cadena con ≥ 10 líneas, el 100 % de las cantidades es 1 y hay al menos un pesable (§10.2) con cantidad 1. Si no, es `reliable`. Se recalcula al importar y el usuario lo puede corregir. Para Inmobiliaria Don Antonio queda `always_one` desde la primera factura grande.
2. **Pesables.** `store_items.is_weighed` si el código es un PLU (≤ 5 dígitos) o una etiqueta de balanza (prefijo `2` de circulación restringida, 11–14 dígitos), o si la descripción contiene `KG`, `KILO` o `LB`. En tiendas `always_one`, un pesable sin peso anotado nunca genera precio por kg.
   - Las carnes, quesos y embutidos los pesa el dependiente y les pone una etiqueta cuyo código incluye el producto y el peso o el precio; la caja lee el peso de ahí. Don Antonio transmite ese código sin dígito verificador y con el peso en ceros (`20786500000` = DON PEDRO MOZZAREL), así que el código identifica el producto en la tienda pero no trae el peso. Sirve para el historial del ítem, no para vincular entre cadenas.
3. **Inferencia automática de unidades** (solo tiendas `always_one`, no pesables): si el mismo `store_item`, o el mismo `product` en Fase 3, tiene un precio unitario conocido de los últimos 60 días (de una línea con `quantity_source` `invoice` en tienda `reliable`, `user` o `inferred`), y `line_total_cents / precio_unitario` está a ≤ 1 centavo por unidad de un entero `k` entre 2 y 24, entonces `quantity = k` y `quantity_source = 'inferred'`. Si el cociente es ≈ 1, la cantidad 1 se acepta como real y la línea queda como precio unitario conocido. En cualquier otro caso no se infiere nada.
4. **Corrección opcional** (CA5.5): "+ / −" para unidades y un campo de peso para pesables. Guarda `quantity_source = 'user'` y no cambia `line_total_cents` ni los totales de la compra, que siempre son los de la factura.
5. **F3 nunca mezcla:** el "más bajo de los últimos 90 días" (CA3.2) solo considera líneas con cantidad real (regla de §5.3).

**Fuera de alcance:** reclamarle a la DGI o a la cadena, y leer el ticket impreso (OCR) para sacar la cantidad.

**OCR: dudoso, no es el plan.** Los tickets de súper son muy largos y de papel térmico, lo que da fotos difíciles de leer, y habría que fotografiar uno por compra, lo que contradice el objetivo de "sin escribir nada" y los 30 s. Solo se reconsidera si la inferencia y la corrección manual fallan en la práctica **y** no aparece una alternativa mejor.

**Pendiente de investigar (dueño):** preguntar en la tienda por qué el ticket impreso trae la cantidad real y la factura electrónica no (¿configuración del punto de venta, o decisión de la cadena?). Si la respuesta es una configuración, la solución es de la cadena y no de la app. Se anota la respuesta en §10.7.

### 10.7 Notas de uso (Fase 5)

_Se llena durante la fase: respuestas de la tienda, fricciones, y las respuestas a las preguntas de §7 Fase 5._

---

## Anexo A — `CLAUDE.md` (aplicado en la Fase 1; la versión vigente es `/CLAUDE.md`)

```markdown
# Prexiopá

App personal para registrar compras desde la factura electrónica de la DGI (Panamá)
y consultar cuánto pagué por un producto y dónde estaba más barato.

**Fuente de verdad del alcance:** `docs/specs/prexiopa-lite.md`.
No implementes nada que no esté en ese spec. Si algo falta, propón el cambio al spec primero.

## Stack
Cloudflare Worker único (Hono en /api, SPA en static assets) · D1 + Drizzle ·
React + TS + Vite · TanStack Query · Vitest (+ vitest-pool-workers).

## Comandos
- `npm run dev` — Vite + Worker + D1 local
- `npm run check` — lint + typecheck + test (correr antes de cada commit)
- `npm run db:generate` — genera migración desde `worker/db/schema.ts`
- `npm run db:migrate:local` — aplica migraciones a D1 local

## Reglas
- Dinero SIEMPRE en enteros de centavos (`*_cents`). Nunca floats para montos.
- Acceso a BD SOLO vía `worker/db/scoped.ts` (filtra por userId). D1 no tiene RLS.
- Todo endpoint nuevo agrega su caso al test de aislamiento entre usuarios.
- El parser CAFE es una función pura; todo cambio va con fixture + test.
- Sin Zustand, sin Recharts, sin librerías de UI nuevas sin justificar en el PR.
- NO ejecutar `wrangler d1 migrations apply --remote` ni `wrangler deploy`:
  los hace el humano o el CI.
- Fixtures de facturas: redactar nombre y RUC del receptor.
```
