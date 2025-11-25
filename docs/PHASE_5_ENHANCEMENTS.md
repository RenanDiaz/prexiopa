# 📈 Prexiopá - Fase 5: Schema Enhancements & Data Migration

> **Fecha de creación:** 22 de Noviembre, 2025
> **Estado:** Planificación
> **Objetivo:** Mejorar el sistema de comparación de precios con unidades, medidas y mejor tracking

---

## 🎯 Resumen Ejecutivo

Esta fase mejora significativamente la capacidad de comparación de precios de Prexiopá al agregar:
1. **Sistema de unidades y medidas** - Comparar precios por litro/kg
2. **Tracking mejorado de precios** - Cantidad, descuentos, precio unitario
3. **Modo dual para Shopping Sessions** - Planear compras futuras o registrar compras pasadas
4. **Migración de datos históricos** - Importar datos de la app anterior (ThriftyTracker)

---

## 📊 Análisis de Valor

### Problema Actual
- ❌ No se puede comparar "Leche 1L $3" vs "Leche 2L $5" automáticamente
- ❌ Deals como "2x1" o "3 por $10" no se registran correctamente
- ❌ No hay forma de registrar compras pasadas para historial de precios
- ❌ Base de datos con solo datos seed (no reales)

### Solución Propuesta
- ✅ Cálculo automático de precio por unidad ($/L, $/kg)
- ✅ Registro de cantidades y descuentos
- ✅ Shopping Sessions dual: modo "Plan" y modo "Registro"
- ✅ Migración de 450+ productos reales de app anterior

### Impacto Esperado
- 🚀 **Comparaciones 10x más precisas** - Normalizar por unidad
- 💰 **Mejor detección de deals** - Ver ofertas reales
- 📈 **Data real desde día 1** - Historial de precios de 2020-2024
- ⭐ **Mayor confianza del usuario** - Datos verificados en lugar de seed data

---

## 🏗️ Arquitectura de Cambios

### 1. Schema Database Changes

#### 1.1 Products Table Enhancement
```sql
-- Agregar campos de unidad y medida
ALTER TABLE products
  ADD COLUMN unit VARCHAR(20),           -- 'L', 'kg', 'g', 'mL', 'oz', 'lb', 'un'
  ADD COLUMN measurement_value DECIMAL(10,2), -- 1, 2, 0.5, 500
  ADD COLUMN tax_percentage DECIMAL(5,2) DEFAULT 0; -- 0, 7 (ITBMS)

-- Ejemplos:
-- "Leche Estrella Azul" -> unit: 'L', measurement_value: 1
-- "Pan Blanco" -> unit: 'g', measurement_value: 500
-- "Huevos" -> unit: 'un', measurement_value: 12
```

#### 1.2 Prices Table Enhancement
```sql
-- Renombrar y agregar campos
ALTER TABLE prices
  RENAME COLUMN price TO unit_price;

ALTER TABLE prices
  ADD COLUMN quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  ADD COLUMN discount DECIMAL(10,2) DEFAULT 0 CHECK (discount >= 0),
  ADD COLUMN total_price DECIMAL(10,2) CHECK (total_price >= 0),
  ADD COLUMN is_promotion BOOLEAN DEFAULT false,
  ADD COLUMN notes TEXT;

-- Cálculo: total_price = (unit_price * quantity) - discount
-- Ejemplo: "2 x $5 con descuento de $1"
--   unit_price: 3.00
--   quantity: 2
--   discount: 1.00
--   total_price: 5.00
```

#### 1.3 Shopping Sessions Enhancement
```sql
-- Agregar modo a shopping_sessions
ALTER TABLE shopping_sessions
  ADD COLUMN mode VARCHAR(20) DEFAULT 'planning' CHECK (mode IN ('planning', 'completed'));

-- mode = 'planning': Compra futura (precios actuales de BD)
-- mode = 'completed': Compra pasada (usuario ingresa precios pagados)
```

### 2. Calculated Fields & Functions

```sql
-- Función para calcular precio por unidad base
CREATE OR REPLACE FUNCTION calculate_price_per_base_unit(
  p_unit_price DECIMAL,
  p_unit VARCHAR,
  p_measurement_value DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  v_price_per_base DECIMAL;
BEGIN
  -- Normalizar a unidad base (L, kg, unidad)
  CASE p_unit
    WHEN 'L' THEN v_price_per_base := p_unit_price / p_measurement_value;
    WHEN 'mL' THEN v_price_per_base := (p_unit_price * 1000) / p_measurement_value;
    WHEN 'kg' THEN v_price_per_base := p_unit_price / p_measurement_value;
    WHEN 'g' THEN v_price_per_base := (p_unit_price * 1000) / p_measurement_value;
    WHEN 'lb' THEN v_price_per_base := (p_unit_price * 2.20462) / p_measurement_value;
    WHEN 'oz' THEN v_price_per_base := (p_unit_price * 35.274) / p_measurement_value;
    WHEN 'un' THEN v_price_per_base := p_unit_price / p_measurement_value;
    ELSE v_price_per_base := p_unit_price; -- Fallback
  END CASE;

  RETURN ROUND(v_price_per_base, 2);
END;
$$ LANGUAGE plpgsql;

-- View: productos con precio unitario calculado
CREATE OR REPLACE VIEW products_with_unit_price AS
SELECT
  p.*,
  pr.unit_price,
  pr.quantity,
  pr.total_price,
  pr.discount,
  pr.is_promotion,
  pr.store_id,
  pr.date,
  calculate_price_per_base_unit(
    pr.unit_price,
    p.unit,
    p.measurement_value
  ) AS price_per_base_unit,
  CASE
    WHEN p.unit IN ('L', 'mL') THEN CONCAT('$', ROUND(calculate_price_per_base_unit(pr.unit_price, p.unit, p.measurement_value), 2), '/L')
    WHEN p.unit IN ('kg', 'g', 'lb', 'oz') THEN CONCAT('$', ROUND(calculate_price_per_base_unit(pr.unit_price, p.unit, p.measurement_value), 2), '/kg')
    WHEN p.unit = 'un' THEN CONCAT('$', ROUND(calculate_price_per_base_unit(pr.unit_price, p.unit, p.measurement_value), 2), '/un')
  END AS price_display
FROM products p
LEFT JOIN prices pr ON pr.product_id = p.id
WHERE pr.date = (
  SELECT MAX(date)
  FROM prices
  WHERE product_id = p.id AND store_id = pr.store_id
);
```

---

## 📝 Implementación por Sub-Fases

### **Fase 5.1: Unit System** ⭐⭐⭐⭐⭐
**Prioridad:** CRÍTICA
**Esfuerzo:** Medio (5-7 días)
**Valor:** Muy Alto

#### Objetivos
- Agregar campos de unidad y medida a productos
- Crear función de cálculo de precio unitario
- Actualizar UI para mostrar precio por unidad
- Migrar datos existentes

#### Tareas

##### Backend (Database & Services)
- [ ] Crear migración `20250122_add_unit_system.sql`
- [ ] Agregar campos: `unit`, `measurement_value`, `tax_percentage` a `products`
- [ ] Crear función `calculate_price_per_base_unit()`
- [ ] Crear view `products_with_unit_price`
- [ ] Actualizar servicio `products.ts`:
  - Modificar `CreateProductInput` para incluir unit/measurement
  - Modificar `getProducts()` para incluir precio unitario
  - Modificar `createProduct()` para aceptar nuevos campos

##### Frontend (Types & Components)
- [ ] Actualizar `src/types/product.types.ts`:
  ```typescript
  interface Product {
    // ... campos existentes
    unit?: string;              // 'L', 'kg', 'g', 'mL', 'oz', 'lb', 'un'
    measurement_value?: number; // 1, 2, 0.5, 500
    tax_percentage?: number;    // 0, 7
    price_per_base_unit?: number; // Calculado
  }
  ```

- [ ] Actualizar `CreateProductModal`:
  - Agregar select de unidad
  - Agregar input de medida
  - Ejemplo: "Coca Cola" + "2" + "L"

- [ ] Actualizar `ProductCard`:
  - Mostrar precio por unidad: "$1.50/L"
  - Mostrar precio total: "$3.00"
  - Badge para promociones

- [ ] Actualizar `PriceComparison`:
  - Ordenar por precio por unidad
  - Highlight mejor deal
  - Mostrar diferencia porcentual

##### Testing
- [ ] Test unitarios para `calculate_price_per_base_unit()`
- [ ] Test conversiones L/mL, kg/g, lb/oz
- [ ] Test UI con diferentes unidades
- [ ] Test de migración con datos seed

#### Entregables
- ✅ Migración SQL aplicada
- ✅ Productos con unidad y medida
- ✅ UI mostrando precio unitario
- ✅ Comparaciones normalizadas

---

### **Fase 5.2: Enhanced Price Tracking** ⭐⭐⭐⭐
**Prioridad:** ALTA
**Esfuerzo:** Medio (4-6 días)
**Valor:** Alto

#### Objetivos
- Agregar cantidad, descuento, precio unitario a precios
- Registrar promociones y deals
- Calcular precio total automáticamente

#### Tareas

##### Backend (Database & Services)
- [ ] Crear migración `20250123_enhance_prices.sql`
- [ ] Renombrar `price` → `unit_price`
- [ ] Agregar: `quantity`, `discount`, `total_price`, `is_promotion`, `notes`
- [ ] Crear trigger para validar `total_price = (unit_price * quantity) - discount`
- [ ] Actualizar servicio `prices.ts`:
  ```typescript
  interface CreatePriceInput {
    product_id: string;
    store_id: string;
    unit_price: number;
    quantity?: number;      // Default 1
    discount?: number;      // Default 0
    is_promotion?: boolean; // Default false
    notes?: string;         // "2x1", "3 por $10"
    date?: string;
  }
  ```

##### Frontend (Components)
- [ ] Crear `PriceEntryForm` component:
  - Input precio unitario
  - Input cantidad (default 1)
  - Input descuento (optional)
  - Checkbox "Es promoción"
  - Input notas
  - Display: Precio total calculado

- [ ] Actualizar `ProductDetail`:
  - Mostrar deals: "2x1", "3 por $10"
  - Badge "OFERTA" si is_promotion
  - Histórico de descuentos

- [ ] Actualizar `PriceHistoryChart`:
  - Línea de precio unitario
  - Puntos destacados en promociones
  - Tooltips con detalles (cantidad, descuento)

##### Testing
- [ ] Test cálculo precio total
- [ ] Test validaciones (precio > 0, cantidad > 0)
- [ ] Test UI con diferentes scenarios
- [ ] Test promociones en historical chart

#### Entregables
- ✅ Precios con cantidad y descuento
- ✅ Registro de promociones
- ✅ UI mejorada para deals

---

### **Fase 5.3: Dual-Mode Shopping Sessions** ⭐⭐⭐
**Prioridad:** MEDIA
**Esfuerzo:** Medio (5-7 días)
**Valor:** Alto

#### Objetivos
- Agregar modo "Planning" y modo "Completed" a shopping sessions
- Modo Planning: usar precios de BD (actual)
- Modo Completed: usuario ingresa precios pagados (nuevo)
- Al completar en modo Completed, guardar como price history

#### Arquitectura

```
┌─────────────────────────────────────────────┐
│         Shopping Session                    │
├─────────────────────────────────────────────┤
│  Mode: [Planning ▼] o [Completed ▼]        │
└─────────────────────────────────────────────┘
         │                    │
         │                    │
    Planning Mode        Completed Mode
         ↓                    ↓
  ┌────────────┐        ┌─────────────┐
  │ Use prices │        │ User enters │
  │ from DB    │        │ actual paid │
  │            │        │ prices      │
  └────────────┘        └─────────────┘
         │                    │
         ↓                    ↓
  Save to session      Save to session
  (not prices)         + Save to prices table
```

#### Tareas

##### Backend (Database & Services)
- [ ] Crear migración `20250124_dual_mode_sessions.sql`
- [ ] Agregar `mode` column a `shopping_sessions`
- [ ] Actualizar `shopping.ts`:
  ```typescript
  interface ShoppingSession {
    // ... campos existentes
    mode: 'planning' | 'completed';
  }

  interface ShoppingItem {
    // ... campos existentes
    paid_price?: number; // Solo para mode='completed'
    paid_quantity?: number;
    paid_discount?: number;
  }
  ```

- [ ] Crear función `convertSessionToPriceHistory()`:
  - Cuando session.status = 'completed' y mode = 'completed'
  - Crear entry en `prices` por cada item con paid_price

##### Frontend (Components)
- [ ] Actualizar `CreateShoppingSessionModal`:
  - Radio buttons: "Planear compra" / "Registrar compra realizada"
  - Si "Registrar": cambiar labels y comportamiento

- [ ] Crear componente `CompletedShoppingItem`:
  - Similar a `ShoppingItemCard` pero permite editar precio
  - Input precio pagado
  - Input cantidad comprada
  - Input descuento aplicado
  - Mostrar diferencia con precio de BD

- [ ] Actualizar `CompleteSessionModal`:
  - Si mode = 'completed': preguntar "¿Guardar precios en historial?"
  - Mostrar resumen de precios vs precios de BD
  - Calcular ahorro total

- [ ] Crear página `PurchaseHistory`:
  - Listado de sessions completadas con mode='completed'
  - Ver qué productos compraste y a qué precio
  - Analytics: "Este mes gastaste $X en supermercado"

##### Testing
- [ ] Test crear session en modo Planning
- [ ] Test crear session en modo Completed
- [ ] Test completar y guardar a price history
- [ ] Test UI para ambos modos

#### Entregables
- ✅ Shopping Sessions dual mode
- ✅ Registro de compras pasadas
- ✅ Auto-save a price history
- ✅ Purchase history view

---

### **Fase 5.4: Data Migration from ThriftyTracker** ⭐⭐⭐⭐
**Prioridad:** ALTA
**Esfuerzo:** Alto (7-10 días)
**Valor:** Muy Alto

#### Objetivos
- Migrar 450+ productos de MongoDB a Supabase
- Migrar 3,250+ entries de precio de receipts/items
- Preservar historial de fechas (2020-2024)
- Generar reporte de migración

#### Arquitectura de Migración

```
MongoDB (ThriftyTracker)          PostgreSQL (Prexiopá)
─────────────────────            ──────────────────────

Store                    →       stores
├─ name                          ├─ name
                                 ├─ logo (default)
                                 └─ website (null)

Category                 →       (embedded in products)
└─ name                          └─ products.category

Unit                     →       (embedded in products)
├─ abbreviation                  ├─ products.unit
└─ name                          └─ products.measurement_value

Product                  →       products
├─ description                   ├─ name (description + measurement + unit)
├─ unit (ref)            →       ├─ unit (abbreviation)
├─ measurementValue      →       ├─ measurement_value
├─ tax                   →       ├─ tax_percentage
├─ categories (refs)     →       ├─ category (first category)
                                 ├─ brand (null or extracted)
                                 ├─ barcode (null)
                                 └─ image (default)

Receipt                  →       (converted to prices)
├─ store (ref)
├─ purchaseDate          →       prices.date
└─ items []              →       prices[] (one per item)

Item                     →       prices
├─ product (ref)         →       ├─ product_id
├─ receipt.store         →       ├─ store_id
├─ unitPrice             →       ├─ unit_price
├─ quantity              →       ├─ quantity
├─ totalPrice            →       ├─ total_price
├─ discount              →       ├─ discount
└─ receipt.purchaseDate  →       └─ date
```

#### Transformaciones

##### 1. Producto: Unit + Measurement → Name
```javascript
// Antes (MongoDB):
{
  description: "Whole Milk",
  unit: ObjectId("...L"),    // Liter
  measurementValue: 1
}

// Después (PostgreSQL):
{
  name: "Whole Milk 1L",     // Concatenado
  unit: "L",
  measurement_value: 1
}
```

##### 2. Receipt + Items → Prices
```javascript
// Antes (MongoDB):
Receipt {
  store: ObjectId("...Rey"),
  purchaseDate: "2024-01-15",
  items: [
    {
      product: ObjectId("...Milk"),
      unitPrice: 3.50,
      quantity: 2,
      totalPrice: 7.00,
      discount: 0
    }
  ]
}

// Después (PostgreSQL):
prices {
  product_id: "uuid-milk",
  store_id: "uuid-rey",
  unit_price: 3.50,
  quantity: 2,
  total_price: 7.00,
  discount: 0,
  date: "2024-01-15"
}
```

#### Tareas

##### Fase A: Export from MongoDB
- [ ] Crear script `scripts/export-thriftytracker.js`:
  - Conectar a MongoDB
  - Export `stores` → `data/export/stores.json`
  - Export `categories` → `data/export/categories.json`
  - Export `units` → `data/export/units.json`
  - Export `products` con populate → `data/export/products.json`
  - Export `receipts` con populate → `data/export/receipts.json`

##### Fase B: Transform Data
- [ ] Crear script `scripts/transform-data.js`:
  - Leer JSONs exportados
  - Transformar productos:
    ```javascript
    {
      name: `${product.description} ${product.measurementValue}${unit.abbreviation}`,
      unit: unit.abbreviation,
      measurement_value: product.measurementValue,
      tax_percentage: product.tax || 0,
      category: categories[0]?.name || 'Sin categoría',
      brand: null, // Extraer manualmente después
      barcode: null,
      image: 'https://via.placeholder.com/200'
    }
    ```
  - Transformar receipts → prices array
  - Generar UUIDs
  - Output: `data/transformed/*.json`

##### Fase C: Import to Supabase
- [ ] Crear script `scripts/import-to-supabase.ts`:
  - Conectar a Supabase
  - Bulk insert stores (match by name, create if not exists)
  - Bulk insert products (con manejo de duplicados)
  - Bulk insert prices (batch de 100)
  - Transaction handling
  - Progress bar
  - Error logging

##### Fase D: Validation & Report
- [ ] Crear script `scripts/validate-migration.ts`:
  - Verificar counts (productos, precios)
  - Verificar integridad (todos los products tienen prices)
  - Verificar date ranges
  - Detectar outliers (precios extraños)
  - Generate report: `migration-report.md`

##### Fase E: Cleanup & Manual Review
- [ ] Review productos sin marca (extraer de name)
- [ ] Review productos sin categoría
- [ ] Review precios outliers
- [ ] Agregar barcodes manualmente (opcional)
- [ ] Agregar imágenes (opcional)

#### Scripts Structure

```
scripts/
├── migration/
│   ├── 1-export-mongodb.js      # Export desde ThriftyTracker
│   ├── 2-transform-data.js      # Transformar formato
│   ├── 3-import-supabase.ts     # Importar a Prexiopá
│   ├── 4-validate.ts            # Validar migración
│   └── 5-cleanup.ts             # Limpieza final
│
├── data/
│   ├── export/                  # JSONs desde MongoDB
│   ├── transformed/             # JSONs transformados
│   └── logs/                    # Logs de proceso
│
└── package.json                 # Dependencies: mongodb, @supabase/supabase-js
```

#### Testing
- [ ] Test dry-run con 10 productos
- [ ] Test con subset (1 store, 50 products)
- [ ] Test full migration en staging
- [ ] Validación manual de muestra
- [ ] Rollback test

#### Entregables
- ✅ Scripts de migración completos
- ✅ 450+ productos migrados
- ✅ 3,250+ precios históricos migrados
- ✅ Reporte de migración
- ✅ Data real en producción

---

## 📅 Timeline Estimado

```
Semana 1: Fase 5.1 - Unit System
├─ Días 1-2: Backend (migrations, functions)
├─ Días 3-4: Frontend (types, components)
├─ Días 5-6: Testing & refinement
└─ Día 7:    Documentation & PR

Semana 2: Fase 5.2 - Enhanced Price Tracking
├─ Días 1-2: Backend (migrations, services)
├─ Días 3-4: Frontend (forms, displays)
├─ Días 5-6: Testing & refinement
└─ Día 7:    Documentation & PR

Semana 3: Fase 5.3 - Dual-Mode Shopping
├─ Días 1-2: Backend (mode logic)
├─ Días 3-4: Frontend (dual UI)
├─ Días 5-6: Price history integration
└─ Día 7:    Testing & PR

Semana 4-5: Fase 5.4 - Data Migration
├─ Días 1-3: Export & transform scripts
├─ Días 4-6: Import & validation
├─ Días 7-8: Manual review & cleanup
├─ Días 9-10: Final validation & deploy
```

**Total: 5 semanas** (con testing exhaustivo)

---

## 🚀 Quick Start Guide

### Para Fase 5.1 (Unit System)

1. **Aplicar migración:**
```bash
cd supabase
psql $DATABASE_URL -f migrations/20250122_add_unit_system.sql
```

2. **Actualizar types:**
```bash
npm run generate-types  # Si usas supabase gen types
```

3. **Desarrollar:**
```bash
npm run dev
```

4. **Testear:**
```bash
# Crear producto con unidad
POST /api/products
{
  "name": "Coca Cola",
  "unit": "L",
  "measurement_value": 2,
  "category": "Bebidas"
}

# Ver precio unitario
GET /api/products?include_unit_price=true
```

---

## ⚠️ Consideraciones Importantes

### Backward Compatibility
- [ ] Productos sin unit/measurement deben seguir funcionando
- [ ] Precios sin quantity deben asumir quantity=1
- [ ] UI debe manejar productos con y sin unit data

### Performance
- [ ] Index en `products(unit, measurement_value)`
- [ ] Materialized view para productos populares con precio unitario
- [ ] Cache de cálculos frecuentes

### Data Quality
- [ ] Validar unidades permitidas (enum)
- [ ] Validar measurement_value > 0
- [ ] Validar tax_percentage entre 0-100
- [ ] Limpiar datos de migración

### Security
- [ ] RLS policies para prices con quantity/discount
- [ ] Validar que usuarios no ingresen precios negativos
- [ ] Rate limit en bulk price creation

---

## 📊 Success Metrics

### Fase 5.1 (Unit System)
- ✅ 100% de productos con unit/measurement después de migración
- ✅ Precio unitario mostrado en UI
- ✅ Comparaciones normalizadas funcionando

### Fase 5.2 (Enhanced Prices)
- ✅ Promociones registradas correctamente
- ✅ Deals "2x1" y similares visibles en UI
- ✅ Historical chart con descuentos

### Fase 5.3 (Dual Mode)
- ✅ 50%+ de sesiones en modo "Completed"
- ✅ Price history creciendo orgánicamente
- ✅ Users usando purchase history

### Fase 5.4 (Migration)
- ✅ 450+ productos migrados con <5% errores
- ✅ 3,250+ precios históricos con fechas correctas
- ✅ 100% de stores migrados
- ✅ Data quality score > 95%

---

## 🔄 Rollback Plan

### Si algo sale mal:

1. **Fase 5.1-5.3:**
```sql
-- Rollback migration
BEGIN;
  ALTER TABLE products DROP COLUMN unit;
  ALTER TABLE products DROP COLUMN measurement_value;
  ALTER TABLE products DROP COLUMN tax_percentage;

  ALTER TABLE prices DROP COLUMN quantity;
  ALTER TABLE prices DROP COLUMN discount;
  ALTER TABLE prices DROP COLUMN total_price;
  ALTER TABLE prices RENAME COLUMN unit_price TO price;

  ALTER TABLE shopping_sessions DROP COLUMN mode;
COMMIT;
```

2. **Fase 5.4 (Migration):**
```sql
-- Delete migrated data
DELETE FROM prices WHERE date < '2025-01-01'; -- Historical data
DELETE FROM products WHERE image LIKE '%placeholder%';
DELETE FROM stores WHERE logo LIKE '%placeholder%';
```

---

## 📚 Referencias

- [Documento modelo antigua app](./OLD_APP_DATABASE_MODELS.md)
- [Schema actual](../supabase/schema.sql)
- [Shopping sessions schema](../supabase/schema-shopping.sql)
- [Project status](../PROJECT_STATUS.md)

---

## ✅ Checklist de Completitud

### Fase 5.1: Unit System
- [ ] Migration SQL creado y aplicado
- [ ] Types TypeScript actualizados
- [ ] CreateProductModal con unit/measurement
- [ ] ProductCard mostrando precio unitario
- [ ] PriceComparison normalizado
- [ ] Tests pasando
- [ ] Documentación actualizada
- [ ] PR merged

### Fase 5.2: Enhanced Prices
- [ ] Migration SQL creado y aplicado
- [ ] PriceEntryForm component
- [ ] ProductDetail mostrando deals
- [ ] PriceHistoryChart con promociones
- [ ] Tests pasando
- [ ] Documentación actualizada
- [ ] PR merged

### Fase 5.3: Dual-Mode Shopping
- [ ] Migration SQL creado y aplicado
- [ ] Mode selector en CreateSessionModal
- [ ] CompletedShoppingItem component
- [ ] CompleteSessionModal con price save
- [ ] PurchaseHistory page
- [ ] Tests pasando
- [ ] Documentación actualizada
- [ ] PR merged

### Fase 5.4: Data Migration
- [ ] Export scripts completos
- [ ] Transform scripts completos
- [ ] Import scripts completos
- [ ] Validation scripts completos
- [ ] Dry-run exitoso
- [ ] Full migration en staging
- [ ] Manual review completado
- [ ] Production migration
- [ ] Migration report generado
- [ ] Old data backed up

---

**Estado Final:** 🚀 Prexiopá con data real, comparaciones precisas, y sistema robusto de tracking de precios

**Next Steps:** Fase 6 - Optimización, Analytics, y Features Avanzados
