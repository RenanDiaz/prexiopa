# 🔧 Aplicar Migración de Columnas Faltantes en `prices`

## 🐛 Problema

La aplicación está fallando con el error:
```
HTTP 400: Could not find the 'discount' column of 'prices' in the schema cache
```

Esto ocurre porque la tabla `prices` en Supabase no tiene las columnas necesarias para el sistema de precios mejorado (quantity, discount, total_price, is_promotion, notes, reported_by).

## ✅ Solución

Aplicar la migración `20250130000007_ensure_prices_columns.sql` que agrega todas las columnas faltantes de forma idempotente (no falla si ya existen).

## 📝 Instrucciones

### **Opción 1: Usando Supabase Dashboard (RECOMENDADO)**

1. **Ir a Supabase Dashboard:**
   - https://supabase.com/dashboard/project/ycfiblaugmbdjyxhctpb

2. **Abrir SQL Editor:**
   - En el menú lateral izquierdo, clic en "SQL Editor"
   - Clic en "New query"

3. **Copiar y pegar el SQL:**
   - Abrir el archivo: `supabase/migrations/20250130000007_ensure_prices_columns.sql`
   - Copiar TODO el contenido
   - Pegarlo en el SQL Editor

4. **Ejecutar:**
   - Clic en el botón "Run" (▶)
   - Esperar a que termine (debería tardar ~2-3 segundos)
   - Verificar que aparezca "Success. No rows returned"

5. **Verificar:**
   ```sql
   SELECT column_name, data_type, is_nullable, column_default
   FROM information_schema.columns
   WHERE table_name = 'prices'
   ORDER BY ordinal_position;
   ```

   Deberías ver las columnas:
   - `quantity` (integer)
   - `discount` (numeric)
   - `total_price` (numeric)
   - `is_promotion` (boolean)
   - `notes` (text)
   - `reported_by` (uuid)

---

### **Opción 2: Usando Supabase CLI**

⚠️ **ADVERTENCIA:** Este método no funcionará si hay migraciones anteriores sin aplicar.

```bash
# Intentar push normal
supabase db push

# Si falla, copiar el SQL manualmente al dashboard
```

---

## 🔍 Columnas que se Agregan

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `quantity` | INTEGER | 1 | Cantidad comprada (para deals como "2 x $5") |
| `discount` | DECIMAL(10,2) | 0 | Descuento aplicado (ej: $1 off) |
| `total_price` | DECIMAL(10,2) | NULL | Precio total pagado (calculado automáticamente) |
| `is_promotion` | BOOLEAN | false | ¿Es un precio promocional? |
| `notes` | TEXT | NULL | Notas sobre el deal (ej: "2x1", "3 por $10") |
| `reported_by` | UUID | NULL | Usuario que reportó este precio |

## 🎯 Características de la Migración

✅ **Idempotente:** Se puede ejecutar múltiples veces sin causar errores
✅ **Constraints:** Valida que quantity > 0, discount >= 0, total_price >= 0
✅ **Trigger:** Calcula `total_price` automáticamente si no se proporciona
✅ **Índices:** Crea índices en `is_promotion` y `reported_by`
✅ **Actualiza datos existentes:** Asigna valores por defecto a registros ya existentes

## 🧪 Testing Después de Aplicar

1. **Verificar que la app funciona:**
   - Ir a Dashboard
   - Buscar un producto
   - Hacer clic en "Ver detalles"
   - La sección de precios debería cargar sin errores

2. **Crear un nuevo precio:**
   - Crear un producto nuevo
   - Agregar a lista de compras con precio
   - Verificar que se guarde correctamente

3. **Verificar en Supabase:**
   ```sql
   SELECT * FROM prices ORDER BY created_at DESC LIMIT 5;
   ```

   Los registros nuevos deberían tener valores en `quantity`, `discount`, `total_price`.

---

## 📚 Archivos Relacionados

- **Migración:** `supabase/migrations/20250130000007_ensure_prices_columns.sql`
- **Servicio que usa estas columnas:** `src/services/supabase/prices.ts`
- **Tipos:** `src/types/price.types.ts`

---

## ❓ Troubleshooting

### Error: "column already exists"
✅ **OK - Es esperado.** La migración es idempotente y simplemente saltará las columnas que ya existen.

### Error: "permission denied"
❌ Asegúrate de estar conectado como usuario administrador en Supabase Dashboard.

### Error persiste después de aplicar
1. Verificar que las columnas existen:
   ```sql
   \d prices
   ```

2. Recargar el schema cache de Supabase:
   - Dashboard → Settings → API
   - Clic en "Reload schema cache"

3. Hacer hard refresh en la app (Ctrl+Shift+R o Cmd+Shift+R)

---

**Última actualización:** 30 de enero, 2025
**Autor:** Claude Code
