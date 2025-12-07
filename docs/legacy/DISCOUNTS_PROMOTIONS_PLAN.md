# 🎁 Sistema de Descuentos y Promociones - Plan de Implementación

> **Fecha:** 29 de Noviembre, 2025
> **Estado:** Planificación completa - Pendiente de implementación
> **Prioridad:** Alta (Feature crítico para comparador de precios)

---

## 📋 Decisiones de Diseño

### **Respuestas a preguntas clave:**

1. **¿Quién crea las promociones?**
   - ✅ **Opción B:** Usuarios pueden reportar promociones (requiere moderación)
   - Los usuarios contribuyen, los moderadores aprueban
   - Similar al sistema de contribuciones de productos ya implementado

2. **¿Prioridad de implementación?**
   - ✅ **Implementar todos los tipos desde el inicio**
   - Sistema flexible y escalable desde el día 1

3. **¿Validez de promociones?**
   - ✅ **Expiran automáticamente según fecha**
   - Si no se especifica fecha de fin, aplica solo una vez (evento único)
   - Sistema de cron job para marcar promociones expiradas

4. **¿Cómo se validan?**
   - ✅ **Sistema de reporte por usuarios**
   - Los usuarios pueden reportar promociones inactivas
   - Moderadores revisan y desactivan si es necesario

---

## 🗄️ Estructura de Base de Datos

### **1. Tabla: `promotions`**
Almacena campañas promocionales generales.

```sql
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,  -- "Black Friday", "Promo Semana Santa"
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,  -- NULL = evento único sin fecha de fin
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),  -- Usuario que creó la promo
  approved_by UUID REFERENCES auth.users(id),  -- Moderador que aprobó
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_promotions_status ON promotions(status, is_active);
CREATE INDEX idx_promotions_store ON promotions(store_id);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);
```

### **2. Tabla: `discounts`**
Almacena los descuentos específicos por producto.

```sql
CREATE TABLE discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promotion_id UUID REFERENCES promotions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,

  -- Tipo de descuento
  discount_type TEXT NOT NULL CHECK (discount_type IN (
    'percentage',      -- 20% de descuento
    'fixed_amount',    -- $1 de descuento
    'buy_x_get_y',     -- 2x1, 3x2
    'bulk_discount',   -- Descuento por cantidad (4+ unidades a $0.90 c/u)
    'bundle'           -- Compra X y lleva Y con descuento/gratis
  )),

  -- Valores del descuento (JSON flexible para diferentes tipos)
  discount_data JSONB NOT NULL,
  /*
    Ejemplos de discount_data por tipo:

    percentage:
      {"value": 20}

    fixed_amount:
      {"value": 1.00}

    buy_x_get_y:
      {"buy": 2, "get": 1}  // 2x1
      {"buy": 3, "get": 2}  // 3x2

    bulk_discount:
      {
        "tiers": [
          {"quantity": 1, "unit_price": 1.00},
          {"quantity": 4, "unit_price": 0.90},
          {"quantity": 10, "unit_price": 0.80}
        ]
      }

    bundle:
      {
        "required_product_id": "uuid-producto-principal",
        "bundle_product_id": "uuid-producto-bonus",
        "bundle_discount_type": "percentage",  // o "fixed_amount" o "free"
        "bundle_discount_value": 50,  // 50% off, $1 off, o null si es gratis
        "min_main_quantity": 1  // Cuántos del producto principal se requieren
      }
  */

  -- Precio original y final (para cálculos rápidos)
  original_price DECIMAL(10, 2) NOT NULL,
  final_price DECIMAL(10, 2) NOT NULL,
  savings DECIMAL(10, 2) NOT NULL,

  -- Restricciones de cantidad
  min_quantity INTEGER DEFAULT 1,
  max_quantity INTEGER,  -- NULL = sin límite
  max_per_customer INTEGER,  -- Límite por cliente (opcional)

  -- Metadatos
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),  -- Usuario que reportó
  approved_by UUID REFERENCES auth.users(id),  -- Moderador que aprobó
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Evitar duplicados
  CONSTRAINT unique_discount_per_product UNIQUE (product_id, store_id, promotion_id)
);

CREATE INDEX idx_discounts_active ON discounts(is_active, store_id);
CREATE INDEX idx_discounts_product ON discounts(product_id);
CREATE INDEX idx_discounts_promotion ON discounts(promotion_id);
CREATE INDEX idx_discounts_type ON discounts(discount_type);
```

### **3. Tabla: `discount_reports`**
Sistema de reportes por usuarios (promociones inactivas/incorrectas).

```sql
CREATE TABLE discount_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discount_id UUID REFERENCES discounts(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES auth.users(id),
  reason TEXT NOT NULL CHECK (reason IN (
    'expired',        -- Promoción ya no está activa
    'incorrect',      -- Información incorrecta
    'not_available'   -- No disponible en tienda
  )),
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_discount_reports_status ON discount_reports(status);
CREATE INDEX idx_discount_reports_discount ON discount_reports(discount_id);
```

### **4. RLS Policies**

```sql
-- Promotions: cualquiera puede leer activas, solo creadores y moderadores pueden escribir
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved promotions"
  ON promotions FOR SELECT
  USING (status = 'approved' AND is_active = true);

CREATE POLICY "Authenticated users can create promotions"
  ON promotions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

CREATE POLICY "Moderators can update promotions"
  ON promotions FOR UPDATE
  USING (is_moderator_or_admin());

-- Discounts: similar a promotions
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active discounts"
  ON discounts FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can create discounts"
  ON discounts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

CREATE POLICY "Moderators can update discounts"
  ON discounts FOR UPDATE
  USING (is_moderator_or_admin());

-- Discount Reports: usuarios pueden crear, moderadores pueden ver y resolver
ALTER TABLE discount_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON discount_reports FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = reported_by);

CREATE POLICY "Users can view own reports"
  ON discount_reports FOR SELECT
  USING (auth.uid() = reported_by);

CREATE POLICY "Moderators can view all reports"
  ON discount_reports FOR SELECT
  USING (is_moderator_or_admin());

CREATE POLICY "Moderators can update reports"
  ON discount_reports FOR UPDATE
  USING (is_moderator_or_admin());
```

---

## 📐 Tipos de Descuentos (Ejemplos Detallados)

### **1. Descuento Porcentual (percentage)**

**Caso de uso:** "20% de descuento en todos los productos de limpieza"

```typescript
{
  discount_type: "percentage",
  discount_data: {
    value: 20  // 20% de descuento
  },
  original_price: 5.00,
  final_price: 4.00,  // 5.00 - (5.00 * 0.20)
  savings: 1.00,
  min_quantity: 1,
  max_quantity: null  // Sin límite
}
```

**UI:**
- Badge: `20% OFF`
- Precio: ~~$5.00~~ **$4.00**
- Ahorro: Ahorras $1.00

---

### **2. Descuento Fijo (fixed_amount)**

**Caso de uso:** "$1 de descuento en compras mayores a $5"

```typescript
{
  discount_type: "fixed_amount",
  discount_data: {
    value: 1.00  // $1 de descuento
  },
  original_price: 5.00,
  final_price: 4.00,  // 5.00 - 1.00
  savings: 1.00,
  min_quantity: 1,
  max_quantity: 5  // Máximo 5 unidades con descuento
}
```

**UI:**
- Badge: `$1 OFF`
- Precio: ~~$5.00~~ **$4.00**
- Ahorro: Ahorras $1.00

---

### **3. Promoción 2x1, 3x2 (buy_x_get_y)**

**Caso de uso:** "Lleva 2 y paga 1" o "Lleva 3 y paga 2"

```typescript
{
  discount_type: "buy_x_get_y",
  discount_data: {
    buy: 2,     // Compra 2
    get: 1,     // Paga 1 (llevas 1 gratis)
    // Para 3x2: buy: 3, get: 2
  },
  original_price: 5.00,
  final_price: 2.50,  // 5.00 * 1 / 2 = precio por unidad efectivo
  savings: 2.50,  // Al comprar 2: ahorras 5.00
  min_quantity: 2  // Mínimo 2 para activar promo
}
```

**Cálculo:**
- Compras 2 unidades → Pagas 1 → Precio efectivo por unidad: $2.50
- Compras 4 unidades → Pagas 2 → Precio efectivo por unidad: $2.50
- Compras 5 unidades → Pagas 3 → Precio efectivo por unidad: $3.00

**UI:**
- Badge: `2x1`
- Precio por unidad: $5.00 → **$2.50** (al comprar 2+)
- Ahorro: Ahorras $5.00 al comprar 2

---

### **4. Descuento por Cantidad (bulk_discount)**

**Caso de uso:** "Precio unitario $1; si llevas 4 iguales, el precio unitario es $0.90"

```typescript
{
  discount_type: "bulk_discount",
  discount_data: {
    tiers: [
      { quantity: 1, unit_price: 1.00 },   // 1-3 unidades: $1.00 c/u
      { quantity: 4, unit_price: 0.90 },   // 4-9 unidades: $0.90 c/u
      { quantity: 10, unit_price: 0.80 }   // 10+ unidades: $0.80 c/u
    ]
  },
  original_price: 1.00,
  final_price: 0.90,  // Asumiendo compra de 4-9 unidades
  savings: 0.40       // 0.10 * 4
}
```

**Cálculo:**
- 1 unidad: $1.00 × 1 = $1.00
- 4 unidades: $0.90 × 4 = $3.60 (ahorras $0.40)
- 10 unidades: $0.80 × 10 = $8.00 (ahorras $2.00)

**UI:**
- Badge: `Descuento por cantidad`
- Precio: $1.00 c/u → **$0.90 c/u** (4+ unidades)
- Tabla de precios:
  - 1-3 unidades: $1.00 c/u
  - 4-9 unidades: $0.90 c/u
  - 10+ unidades: $0.80 c/u

---

### **5. Bundle (Compra X + Lleva Y con descuento/gratis)**

**Caso de uso:** "Compra 1 shampoo y lleva el acondicionador con 50% de descuento"

```typescript
{
  discount_type: "bundle",
  discount_data: {
    required_product_id: "uuid-shampoo",
    bundle_product_id: "uuid-acondicionador",
    bundle_discount_type: "percentage",  // o "fixed_amount" o "free"
    bundle_discount_value: 50,  // 50% de descuento
    min_main_quantity: 1  // Mínimo 1 shampoo
  },
  original_price: 5.00,  // Precio original del acondicionador
  final_price: 2.50,     // 50% de descuento
  savings: 2.50
}
```

**Variantes:**
- **Gratis:** `bundle_discount_type: "free"`, `bundle_discount_value: null`
- **Descuento fijo:** `bundle_discount_type: "fixed_amount"`, `bundle_discount_value: 2.00`

**UI:**
- Badge: `Combo` o `2° producto 50% OFF`
- Mensaje: "Compra Shampoo X y lleva Acondicionador Y con 50% de descuento"
- Precio bundle: ~~$5.00~~ **$2.50**

---

## 🎨 UI/UX - Componentes y Diseño

### **1. Badge de Descuento en ProductCard**

```tsx
// Posición: esquina superior derecha (opuesta al corazón de favoritos)
{product.active_discount && (
  <DiscountBadge type={product.active_discount.discount_type}>
    {formatDiscountBadge(product.active_discount)}
  </DiscountBadge>
)}
```

**Variantes de Badge:**
- `20% OFF` - Fondo verde, texto blanco
- `$1 OFF` - Fondo naranja, texto blanco
- `2x1` - Fondo rojo, texto blanco
- `Descuento por cantidad` - Fondo azul, texto blanco
- `Combo` - Fondo morado, texto blanco

### **2. Precio con Descuento en ProductCard**

```tsx
<PriceSection>
  {product.active_discount ? (
    <>
      <OriginalPrice>${product.original_price}</OriginalPrice>
      <DiscountPrice>${product.final_price}</DiscountPrice>
      <Savings>Ahorras ${product.savings}</Savings>
      {product.active_discount.discount_type === 'bulk_discount' && (
        <BulkHint>Precio por {product.active_discount.discount_data.tiers[1].quantity}+ unidades</BulkHint>
      )}
    </>
  ) : (
    <Price>${product.price}</Price>
  )}

  {product.store_with_lowest_price && (
    <StoreName>en {product.store_with_lowest_price.name}</StoreName>
  )}
</PriceSection>
```

### **3. Detalle de Descuento en ProductDetail**

```tsx
<DiscountSection>
  <DiscountHeader>
    <DiscountBadge>{formatDiscountBadge(discount)}</DiscountBadge>
    <DiscountTitle>{discount.promotion_name}</DiscountTitle>
  </DiscountHeader>

  <DiscountDetails>
    {discount.discount_type === 'bulk_discount' && (
      <BulkPricingTable tiers={discount.discount_data.tiers} />
    )}

    {discount.discount_type === 'bundle' && (
      <BundleOffer
        mainProduct={product}
        bundleProduct={bundleProduct}
        discountValue={discount.discount_data.bundle_discount_value}
      />
    )}
  </DiscountDetails>

  <DiscountValidity>
    <FiClock />
    Válido hasta: {formatDate(discount.end_date)}
  </DiscountValidity>

  <ReportButton onClick={handleReportDiscount}>
    <FiFlag />
    Reportar si esta promoción ya no está activa
  </ReportButton>
</DiscountSection>
```

### **4. Modal de Agregar Promoción (Usuarios)**

```tsx
<AddPromotionModal>
  <Step1: Seleccionar producto y tienda>
  <Step2: Elegir tipo de descuento>
    - Botones: 20% OFF | $1 OFF | 2x1 | Descuento por cantidad | Combo
  <Step3: Ingresar detalles según tipo>
    - Percentage: input numérico (%)
    - Fixed: input numérico ($)
    - Buy X Get Y: 2 inputs (compra X, paga Y)
    - Bulk: tabla editable de tiers
    - Bundle: selector de producto bundle + tipo de descuento
  <Step4: Fechas y restricciones>
    - Fecha inicio/fin (opcional)
    - Límites de cantidad
  <Step5: Preview y enviar>
    - Vista previa de cómo se verá
    - Botón "Enviar para revisión"
</AddPromotionModal>
```

---

## 🔧 Funciones Helper y Utils

### **1. Cálculo de Precio con Descuento**

```typescript
// src/utils/discounts.ts

export interface Discount {
  id: string;
  discount_type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bulk_discount' | 'bundle';
  discount_data: any;
  original_price: number;
  final_price: number;
  savings: number;
  min_quantity: number;
  max_quantity?: number;
}

export interface DiscountResult {
  finalPrice: number;
  savings: number;
  minQuantity?: number;
  pricePerUnit?: number;
  applicableQuantity?: number;
}

/**
 * Calcula el precio final según el tipo de descuento y cantidad
 */
export const calculateDiscountedPrice = (
  originalPrice: number,
  discount: Discount,
  quantity: number = 1
): DiscountResult => {
  switch (discount.discount_type) {
    case 'percentage':
      const percentOff = discount.discount_data.value / 100;
      const discountedPrice = originalPrice * (1 - percentOff);
      return {
        finalPrice: discountedPrice * quantity,
        savings: (originalPrice * percentOff) * quantity,
        pricePerUnit: discountedPrice,
      };

    case 'fixed_amount':
      const priceAfterDiscount = Math.max(0, originalPrice - discount.discount_data.value);
      return {
        finalPrice: priceAfterDiscount * quantity,
        savings: discount.discount_data.value * quantity,
        pricePerUnit: priceAfterDiscount,
      };

    case 'buy_x_get_y':
      const { buy, get } = discount.discount_data;
      const totalUnits = buy + get;

      if (quantity < buy) {
        // No aplica descuento si no alcanza mínimo
        return {
          finalPrice: originalPrice * quantity,
          savings: 0,
          minQuantity: buy,
        };
      }

      // Calcular cuántos sets completos
      const completeSets = Math.floor(quantity / totalUnits);
      const remainingUnits = quantity % totalUnits;

      // Precio por set completo = precio de 'buy' unidades
      const pricePerSet = originalPrice * buy;
      const priceForComplete = pricePerSet * completeSets;
      const priceForRemaining = originalPrice * Math.min(remainingUnits, buy);

      const finalPrice = priceForComplete + priceForRemaining;
      const savings = (originalPrice * quantity) - finalPrice;

      return {
        finalPrice,
        savings,
        minQuantity: buy,
        pricePerUnit: finalPrice / quantity,
        applicableQuantity: completeSets * totalUnits + Math.min(remainingUnits, buy),
      };

    case 'bulk_discount':
      const tiers = discount.discount_data.tiers;

      // Encontrar tier aplicable (de mayor a menor cantidad)
      const applicableTier = tiers
        .sort((a: any, b: any) => b.quantity - a.quantity)
        .find((tier: any) => quantity >= tier.quantity);

      if (!applicableTier) {
        // No aplica descuento
        return {
          finalPrice: originalPrice * quantity,
          savings: 0,
        };
      }

      const finalPrice = applicableTier.unit_price * quantity;
      const savings = (originalPrice - applicableTier.unit_price) * quantity;

      return {
        finalPrice,
        savings,
        pricePerUnit: applicableTier.unit_price,
      };

    case 'bundle':
      // Para bundles, el cálculo es más complejo y requiere el producto principal
      // Se maneja en una función separada
      return calculateBundleDiscount(discount, quantity);

    default:
      return {
        finalPrice: originalPrice * quantity,
        savings: 0,
      };
  }
};

/**
 * Calcula descuento de bundle
 */
export const calculateBundleDiscount = (
  discount: Discount,
  quantity: number
): DiscountResult => {
  const { bundle_discount_type, bundle_discount_value } = discount.discount_data;
  const originalPrice = discount.original_price;

  switch (bundle_discount_type) {
    case 'percentage':
      const percentOff = bundle_discount_value / 100;
      const discountedPrice = originalPrice * (1 - percentOff);
      return {
        finalPrice: discountedPrice * quantity,
        savings: (originalPrice * percentOff) * quantity,
        pricePerUnit: discountedPrice,
      };

    case 'fixed_amount':
      const priceAfterDiscount = Math.max(0, originalPrice - bundle_discount_value);
      return {
        finalPrice: priceAfterDiscount * quantity,
        savings: bundle_discount_value * quantity,
        pricePerUnit: priceAfterDiscount,
      };

    case 'free':
      return {
        finalPrice: 0,
        savings: originalPrice * quantity,
        pricePerUnit: 0,
      };

    default:
      return {
        finalPrice: originalPrice * quantity,
        savings: 0,
      };
  }
};

/**
 * Formatea el badge según el tipo de descuento
 */
export const formatDiscountBadge = (discount: Discount): string => {
  switch (discount.discount_type) {
    case 'percentage':
      return `${discount.discount_data.value}% OFF`;

    case 'fixed_amount':
      return `$${discount.discount_data.value} OFF`;

    case 'buy_x_get_y':
      const { buy, get } = discount.discount_data;
      const total = buy + get;
      const pay = buy;
      return `${total}x${pay}`;

    case 'bulk_discount':
      return 'Descuento por cantidad';

    case 'bundle':
      return 'Combo';

    default:
      return 'OFERTA';
  }
};

/**
 * Valida si un descuento está activo según fechas
 */
export const isDiscountActive = (discount: Discount): boolean => {
  const now = new Date();
  const startDate = new Date(discount.start_date);
  const endDate = discount.end_date ? new Date(discount.end_date) : null;

  // Si no hay fecha de fin, solo validar fecha de inicio
  if (!endDate) {
    return discount.is_active && now >= startDate;
  }

  // Validar rango de fechas
  return discount.is_active && now >= startDate && now <= endDate;
};

/**
 * Obtiene el mejor descuento entre múltiples opciones
 */
export const getBestDiscount = (
  discounts: Discount[],
  quantity: number = 1
): Discount | null => {
  if (discounts.length === 0) return null;

  const activeDiscounts = discounts.filter(isDiscountActive);
  if (activeDiscounts.length === 0) return null;

  // Calcular savings para cada descuento
  const discountsWithSavings = activeDiscounts.map(discount => ({
    discount,
    result: calculateDiscountedPrice(discount.original_price, discount, quantity),
  }));

  // Ordenar por mayor ahorro
  discountsWithSavings.sort((a, b) => b.result.savings - a.result.savings);

  return discountsWithSavings[0].discount;
};
```

### **2. Formateo de Precios con Descuento**

```typescript
// src/utils/priceFormatters.ts

/**
 * Formatea un precio con descuento para mostrar
 */
export const formatDiscountedPrice = (
  originalPrice: number,
  finalPrice: number,
  savings: number
) => {
  return {
    original: `$${originalPrice.toFixed(2)}`,
    final: `$${finalPrice.toFixed(2)}`,
    savings: `$${savings.toFixed(2)}`,
    savingsPercent: `${((savings / originalPrice) * 100).toFixed(0)}%`,
  };
};

/**
 * Formatea mensaje de descuento por cantidad
 */
export const formatBulkDiscountMessage = (tiers: any[]) => {
  return tiers.map((tier, index) => {
    if (index === 0) {
      return `1-${tiers[1]?.quantity - 1 || '+'} unidades: $${tier.unit_price.toFixed(2)} c/u`;
    }
    const nextTier = tiers[index + 1];
    const range = nextTier
      ? `${tier.quantity}-${nextTier.quantity - 1}`
      : `${tier.quantity}+`;
    return `${range} unidades: $${tier.unit_price.toFixed(2)} c/u`;
  });
};
```

---

## 🚀 Plan de Implementación Detallado

### **FASE 1: Base de Datos y Backend** (Estimado: 4-6 horas)

#### **Tareas:**
1. [ ] Crear migración de base de datos
   - Tabla `promotions`
   - Tabla `discounts`
   - Tabla `discount_reports`
   - Índices necesarios
   - RLS policies

2. [ ] Crear servicios en Supabase
   - `src/services/supabase/promotions.ts`
     - `getActivePromotions(storeId?)`
     - `getPromotionById(id)`
     - `createPromotion(data)` - Usuario crea promo (status: pending)
     - `updatePromotion(id, data)` - Moderador aprueba/rechaza
     - `deletePromotion(id)`

   - `src/services/supabase/discounts.ts`
     - `getActiveDiscounts(productId?, storeId?)`
     - `getDiscountsByPromotion(promotionId)`
     - `createDiscount(data)` - Usuario reporta descuento
     - `updateDiscount(id, data)` - Moderador aprueba/rechaza
     - `deleteDiscount(id)`
     - `getProductDiscounts(productId)` - Todos los descuentos de un producto

   - `src/services/supabase/discountReports.ts`
     - `createReport(discountId, reason, comment)`
     - `getReports(status?)` - Para moderadores
     - `resolveReport(id, status)`

3. [ ] Crear funciones RPC en Supabase
   - `get_active_discounts_by_store(store_id UUID)`
   - `get_best_discount_for_product(product_id UUID, quantity INT)`
   - `mark_expired_promotions()` - Para cron job

4. [ ] Crear utils de cálculo
   - `src/utils/discounts.ts` (todas las funciones listadas arriba)
   - `src/utils/priceFormatters.ts`

**Archivos a crear:**
- `supabase/migrations/YYYYMMDD_create_promotions_discounts_system.sql`
- `src/services/supabase/promotions.ts`
- `src/services/supabase/discounts.ts`
- `src/services/supabase/discountReports.ts`
- `src/utils/discounts.ts`
- `src/utils/priceFormatters.ts`
- `src/types/discount.types.ts`

---

### **FASE 2: Frontend - Mostrar Descuentos** (Estimado: 6-8 horas)

#### **Tareas:**
1. [ ] Actualizar tipos de TypeScript
   - Agregar `active_discount?` a tipo `Product`
   - Crear interfaces completas para `Discount`, `Promotion`, `DiscountReport`

2. [ ] Crear componentes de UI
   - `src/components/discounts/DiscountBadge.tsx` (60 líneas)
     - Props: `discount`, `size`, `variant`
     - Muestra badge según tipo

   - `src/components/discounts/DiscountPriceDisplay.tsx` (120 líneas)
     - Props: `originalPrice`, `finalPrice`, `savings`, `discount`
     - Muestra precio tachado + precio final + ahorro

   - `src/components/discounts/BulkPricingTable.tsx` (100 líneas)
     - Props: `tiers`, `currentQuantity`
     - Tabla de precios por cantidad

   - `src/components/discounts/BundleOfferCard.tsx` (150 líneas)
     - Props: `mainProduct`, `bundleProduct`, `discount`
     - Card especial para bundles

3. [ ] Modificar componentes existentes
   - `ProductCard.tsx`:
     - Agregar `<DiscountBadge />` si hay descuento
     - Reemplazar precio simple con `<DiscountPriceDisplay />`

   - `ProductDetail.tsx`:
     - Agregar sección de descuentos detallada
     - Mostrar `<BulkPricingTable />` si es bulk_discount
     - Mostrar `<BundleOfferCard />` si es bundle
     - Botón de reportar descuento

4. [ ] Crear hooks de React Query
   - `src/hooks/useDiscounts.ts`
     - `useProductDiscountsQuery(productId)`
     - `useStoreDiscountsQuery(storeId)`
     - `useCreateDiscountMutation()`
     - `useReportDiscountMutation()`

5. [ ] Modificar queries de productos
   - Actualizar `getProducts()` para incluir descuentos activos
   - Agregar join con `discounts` y `promotions`
   - Calcular `active_discount` del lado del servidor

**Archivos a crear/modificar:**
- `src/types/discount.types.ts` (nuevo)
- `src/components/discounts/DiscountBadge.tsx` (nuevo)
- `src/components/discounts/DiscountPriceDisplay.tsx` (nuevo)
- `src/components/discounts/BulkPricingTable.tsx` (nuevo)
- `src/components/discounts/BundleOfferCard.tsx` (nuevo)
- `src/components/discounts/index.ts` (nuevo)
- `src/hooks/useDiscounts.ts` (nuevo)
- `src/components/products/ProductCard.tsx` (modificar)
- `src/pages/ProductDetail.tsx` (modificar)
- `src/services/supabase/products.ts` (modificar queries)

---

### **FASE 3: Usuarios - Reportar Promociones** (Estimado: 5-6 horas)

#### **Tareas:**
1. [ ] Modal de reportar promoción
   - `src/components/discounts/AddPromotionModal.tsx` (400+ líneas)
   - Wizard de 5 pasos:
     1. Seleccionar producto y tienda
     2. Elegir tipo de descuento (botones con iconos)
     3. Ingresar detalles según tipo
     4. Configurar fechas y restricciones
     5. Preview y confirmar
   - Validación en cada paso
   - Preview visual del descuento

2. [ ] Forms específicos por tipo
   - `PercentageDiscountForm.tsx` - Input de porcentaje
   - `FixedAmountDiscountForm.tsx` - Input de monto
   - `BuyXGetYForm.tsx` - 2 inputs (compra X, paga Y)
   - `BulkDiscountForm.tsx` - Tabla editable de tiers
   - `BundleDiscountForm.tsx` - Selector de producto + tipo

3. [ ] Modal de reportar descuento inactivo
   - `src/components/discounts/ReportDiscountModal.tsx` (150 líneas)
   - Razones: Expirado / Incorrecto / No disponible
   - Textarea de comentario opcional
   - Botón de enviar

4. [ ] Integración en ProductDetail
   - Botón "Reportar promoción" si hay descuento
   - Botón "Agregar promoción" si NO hay descuento
   - Abrir modales correspondientes

**Archivos a crear:**
- `src/components/discounts/AddPromotionModal.tsx`
- `src/components/discounts/forms/PercentageDiscountForm.tsx`
- `src/components/discounts/forms/FixedAmountDiscountForm.tsx`
- `src/components/discounts/forms/BuyXGetYForm.tsx`
- `src/components/discounts/forms/BulkDiscountForm.tsx`
- `src/components/discounts/forms/BundleDiscountForm.tsx`
- `src/components/discounts/ReportDiscountModal.tsx`

---

### **FASE 4: Admin - Moderar Promociones** (Estimado: 8-10 horas)

#### **Tareas:**
1. [ ] Página de admin de promociones
   - `src/pages/admin/Promotions.tsx`
   - Tabs: Pendientes / Aprobadas / Rechazadas / Reportadas
   - Lista de promociones pendientes
   - Lista de reportes pendientes

2. [ ] Componentes de moderación
   - `PromotionReviewCard.tsx`
     - Muestra datos de la promoción pendiente
     - Preview de cómo se verá
     - Botones: Aprobar / Rechazar
     - Modal de rechazo con razón

   - `DiscountReportCard.tsx`
     - Muestra reporte de usuario
     - Información del descuento reportado
     - Botones: Desactivar descuento / Descartar reporte

3. [ ] Lógica de aprobación/rechazo
   - Al aprobar: cambiar status a "approved", is_active = true
   - Al rechazar: cambiar status a "rejected", is_active = false
   - Toast notifications
   - Invalidar queries de React Query

4. [ ] Dashboard de estadísticas
   - Total de promociones activas
   - Promociones por aprobar
   - Reportes pendientes
   - Gráfico de promociones por tienda
   - Top productos con descuento

**Archivos a crear:**
- `src/pages/admin/Promotions.tsx`
- `src/components/admin/PromotionReviewCard.tsx`
- `src/components/admin/DiscountReportCard.tsx`
- `src/components/admin/PromotionStats.tsx`

---

### **FASE 5: Shopping List - Aplicar Descuentos** (Estimado: 4-5 horas)

#### **Tareas:**
1. [ ] Modificar `AddToListModal`
   - Detectar si producto tiene descuento activo
   - Mostrar precio con descuento pre-seleccionado
   - Permitir editar cantidad y ver cómo cambia el descuento
   - Mostrar savings total

2. [ ] Modificar `ShoppingItemCard`
   - Mostrar badge de descuento si aplica
   - Mostrar precio original tachado + precio final
   - Mostrar savings individuales

3. [ ] Modificar `ActiveShoppingSession`
   - Calcular savings totales de toda la sesión
   - Mostrar resumen:
     - Total sin descuentos: $XX.XX
     - Descuentos aplicados: -$XX.XX
     - Total final: $XX.XX
   - Badge de "Ahorraste $XX.XX"

4. [ ] Sugerencias inteligentes
   - "Agrega 1 más para activar descuento de 2x1"
   - "Lleva 2 más y ahorra $X"
   - Componente `DiscountSuggestions.tsx`

**Archivos a modificar:**
- `src/components/shopping/AddToListModal.tsx`
- `src/components/shopping/ShoppingItemCard.tsx`
- `src/components/shopping/ActiveShoppingSession.tsx`
- `src/components/shopping/DiscountSuggestions.tsx` (nuevo)

---

### **FASE 6: Features Avanzados** (Estimado: 8-12 horas)

#### **Tareas:**
1. [ ] Alertas de descuentos
   - Notificar cuando producto en favoritos tiene descuento
   - Configuración de preferencias de notificaciones

2. [ ] Filtros de búsqueda
   - Agregar filtro "Con descuento" en SearchFilters
   - Agregar filtro por tipo de descuento

3. [ ] Comparador de descuentos
   - Página `/compare/:productId`
   - Tabla comparativa de descuentos en diferentes tiendas
   - Highlight del mejor descuento

4. [ ] Historial de descuentos
   - Almacenar histórico de descuentos
   - Gráfico de tendencias
   - "Este producto suele tener 20% OFF cada mes"

5. [ ] Cron job para expirar promociones
   - Función serverless o Edge Function
   - Ejecutar cada hora
   - Marcar promociones expiradas como `status: 'expired'`

**Archivos a crear:**
- `src/pages/CompareDiscounts.tsx`
- `src/components/discounts/DiscountHistory.tsx`
- `supabase/functions/expire-promotions/index.ts` (Edge Function)

---

## 🎯 Orden de Implementación Recomendado

### **Sprint 1: Base + Mostrar Descuentos** (12-14 horas)
1. ✅ Fase 1: Base de Datos y Backend
2. ✅ Fase 2: Frontend - Mostrar Descuentos
3. ✅ Testing básico

**Resultado:** Los usuarios pueden VER descuentos en productos, pero no crearlos.

---

### **Sprint 2: Crowdsourcing de Promociones** (10-12 horas)
1. ✅ Fase 3: Usuarios - Reportar Promociones
2. ✅ Fase 4: Admin - Moderar Promociones
3. ✅ Testing de flujo completo

**Resultado:** Sistema completo de crowdsourcing con moderación.

---

### **Sprint 3: Shopping List + Features Avanzados** (12-17 horas)
1. ✅ Fase 5: Shopping List - Aplicar Descuentos
2. ✅ Fase 6: Features Avanzados (opcional)
3. ✅ Testing end-to-end
4. ✅ Performance optimization

**Resultado:** Sistema completo y optimizado en producción.

---

## 📊 Métricas de Éxito

### **KPIs a medir:**
- Número de promociones reportadas por usuarios
- Tasa de aprobación de promociones (meta: >70%)
- Productos con descuento activo (meta: >30% del catálogo)
- Engagement en productos con descuento vs sin descuento
- Savings promedio por sesión de compras
- Reportes de descuentos inactivos (indicador de calidad de datos)

---

## 🚧 Consideraciones Técnicas

### **Performance:**
- Índices en `discounts` por `product_id` y `store_id`
- Cache de descuentos activos (TTL: 5 minutos)
- Lazy loading de componentes pesados
- Virtualization en listas largas de promociones

### **Seguridad:**
- RLS policies estrictas
- Validación de inputs en todos los forms
- Rate limiting en API de creación de promociones
- Moderación obligatoria antes de publicar

### **UX:**
- Loading skeletons mientras cargan descuentos
- Empty states si no hay descuentos
- Mensajes claros de error
- Confirmaciones antes de acciones destructivas
- Preview en tiempo real al crear promoción

---

## 📝 Notas Adicionales

### **Prioridades:**
1. **ALTA:** Mostrar descuentos existentes (Fase 1-2)
2. **ALTA:** Crowdsourcing + moderación (Fase 3-4)
3. **MEDIA:** Aplicar en shopping list (Fase 5)
4. **BAJA:** Features avanzados (Fase 6)

### **Dependencias:**
- Sistema de roles y permisos (ya implementado en Sprint 3)
- Sistema de contribuciones (similar, usar como referencia)
- React Query (ya en uso)
- Toast notifications (ya implementadas)

### **Testing:**
- Unit tests para funciones de cálculo
- Integration tests para flujo de moderación
- E2E tests para flujo completo de usuario

---

**Estado:** ✅ Plan completo y detallado
**Próximo paso:** Implementar Fase 1 cuando estés listo

🚀 ¡Listo para implementar cuando lo necesites!
