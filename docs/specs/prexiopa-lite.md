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

### F2 — Historial de compras

- **CA2.1** La lista muestra las compras ordenadas por fecha descendente, cada una con tienda, fecha, total y número de líneas.
- **CA2.2** El detalle muestra las líneas y el desglose de la factura: subtotal, ITBMS por tasa, descuentos y total, todo tal como viene en la factura.
- **CA2.3** Se puede eliminar una compra (pidiendo confirmación).
- **CA2.4** La lista pagina o hace scroll infinito sin degradarse con 500 compras o más.

### F3 — Consulta de precio

**Flujo:** Inicio → "¿Cuánto cuesta?" → escanear código de barras o escribir texto → resultado.

- **CA3.1** Al escanear un EAN/UPC, se muestran todas las veces que compré ese producto: tienda, fecha y **precio efectivo unitario**.
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
users          id, email UNIQUE, created_at

stores         id, ruc UNIQUE NULL, dv, legal_name, display_name NULL,
               code_format ('gtin'|'gtin_no_check'|'internal'), created_at
               -- una fila por CADENA (RUC), no por sucursal (ver §10)
               -- ruc NULL solo para tiendas creadas a mano (F4)

products       id, user_id, name, gtin NULL, created_at
               UNIQUE(user_id, gtin)
               -- producto "canónico" del usuario, el que F3 compara entre tiendas
               -- gtin: GTIN-13 normalizado (§10.2)

store_items    id, user_id, store_id, code NULL, description, product_id NULL, created_at
               UNIQUE(user_id, store_id, code)
               -- cómo llama cada tienda a un producto (texto y código de la factura)

purchases      id, user_id, store_id, source ('cafe'|'manual'), cufe NULL,
               issued_at, branch_address NULL,
               subtotal_cents, tax_cents, discount_cents, total_cents, paid_cents,
               source_url NULL, raw_json NULL, created_at
               UNIQUE(user_id, cufe)
               -- totales tomados del ENCABEZADO de la factura, nunca sumando líneas (§10.3)

purchase_lines id, purchase_id, line_no, store_item_id, description, quantity,
               list_price_cents, discount_cents, line_total_cents,
               tax_rate_bp, tax_cents
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
| Íconos | `lucide-react` | Se elimina `react-icons` |
| Tests | Vitest + `@cloudflare/vitest-plugin` | Integración real contra D1 local. Antes se llamaba `vitest-pool-workers` |

### 6.2 Autenticación — recomendación: Cloudflare Access

- Access (con Google como IdP) protege todo el Worker. El Worker valida el header `Cf-Access-Jwt-Assertion` contra los certs del team, comprobando `aud` e `iss`, y hace upsert de `users` por email.
- **Pros:** no hay que escribir código de login ni manejar sesiones o contraseñas, y es gratis para pocos usuarios.
- **Contras:** la pantalla de login no se puede personalizar, y no sirve si un día la app se abre al público.
- **Salida futura:** si se vuelve pública, se migra a Better Auth sobre D1. El modelo ya tiene `user_id`, así que el cambio queda acotado a un middleware.
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

### Fase 1 — Esqueleto — ✅ local (rama `feat/lite-skeleton`); falta el deploy detrás de Access

- Taguear el estado actual como `v0-supabase` y eliminar el código v0 (queda en el historial de git).
- Scaffold: Worker + Hono + D1 + Drizzle + Vite SPA, con auth Access y el middleware de §6.2.
- CI en GitHub Actions: lint, typecheck, test y build, más el check de presupuesto de bundle.
- Deploy a `*.workers.dev` detrás de Access.
- Reemplazar `CLAUDE.md` por el del Anexo A.

**Salida:** una pantalla "Hola, {email}" en producción, CI en verde y el test de aislamiento (§6.4) pasando con un endpoint de ejemplo.

### Fase 2 — Import CAFE (F1, F2)

**Salida:** se cumplen CA1.x y CA2.x, y yo importo mis compras reales de 2 semanas.

### Fase 3 — Consulta de precios (F3, F5)

**Salida:** se cumplen CA3.x y CA5.x, y lo uso en tienda.

### Fase 4 — Manual, migración de datos y apagado de Supabase (F4, F6, F7)

- Migración de datos: exportar los **CUFEs** de `imported_invoices` y **reimportarlos con el pipeline nuevo**, sin transformar datos viejos.
- Las sesiones manuales de v0 se descartan, salvo que se decida lo contrario (ver §8).
- Pausar el proyecto de Supabase. Se borra a los 30 días sin incidentes.

## 8. Decisiones abiertas

| # | Decisión | Recomendación |
|---|---|---|
| D1 | Auth: Cloudflare Access o Better Auth | **Access** (§6.2) |
| D2 | ¿Usuarios en v1: solo yo, o yo + familia? | Hasta ~5 personas con Access. El modelo ya es multiusuario |
| D3 | ¿Migrar las compras manuales de v0? | **No.** Solo se reimportan CUFEs |
| D4 | Dominio propio o `workers.dev` | `workers.dev` hasta cumplir las métricas de §2 |
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

### 10.5 Privacidad

El HTML trae la cédula, el nombre y el teléfono del receptor. Los fixtures **deben** redactar el bloque `RECEPTOR` antes de commitearse, y `raw_json` no guarda el receptor.

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
