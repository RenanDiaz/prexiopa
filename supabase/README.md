# Supabase Database Setup

Instrucciones para configurar la base de datos de Prexiopá en Supabase.

## 📋 Requisitos Previos

- Cuenta de Supabase (gratuita): https://supabase.com
- Proyecto de Supabase creado
- Credenciales en `.env` (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY)

## 🚀 Pasos de Configuración

### 1. Acceder al SQL Editor

1. Ve a tu proyecto en https://supabase.com/dashboard
2. En el menú lateral, haz clic en **SQL Editor**
3. Haz clic en **New query** para crear una nueva consulta

### 2. Ejecutar Schema (Estructura de Tablas)

1. Abre el archivo `supabase/schema.sql`
2. Copia todo el contenido
3. Pégalo en el editor SQL de Supabase
4. Haz clic en **Run** para ejecutar

Este script creará:
- ✅ 4 tablas: `stores`, `products`, `prices`, `favorites`
- ✅ Índices para optimizar consultas
- ✅ Políticas de RLS (Row Level Security)
- ✅ Triggers para `updated_at`

### 3. Poblar con Datos de Prueba

1. Abre el archivo `supabase/seed.sql`
2. Copia todo el contenido
3. Pégalo en una **nueva query** en el editor SQL
4. Haz clic en **Run** para ejecutar

Este script insertará:
- ✅ 5 tiendas (Riba Smith, Super 99, El Machetazo, Xtra, Rey)
- ✅ 25 productos (alimentos, bebidas, limpieza, snacks, etc.)
- ✅ ~100 precios (cada producto en 3-5 tiendas diferentes)

## 📊 Estructura de la Base de Datos

### Tabla: `stores`
```sql
- id (UUID, PK)
- name (VARCHAR)
- logo (TEXT)
- website (TEXT)
- created_at, updated_at
```

### Tabla: `products`
```sql
- id (UUID, PK)
- name (VARCHAR)
- description (TEXT)
- image (TEXT)
- category (VARCHAR)
- brand (VARCHAR)
- barcode (VARCHAR, UNIQUE)
- created_at, updated_at
```

### Tabla: `prices`
```sql
- id (UUID, PK)
- product_id (UUID, FK → products)
- store_id (UUID, FK → stores)
- price (DECIMAL)
- date (DATE)
- in_stock (BOOLEAN)
- created_at
```

### Tabla: `favorites`
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- product_id (UUID, FK → products)
- created_at
```

## 🔐 Row Level Security (RLS)

### Políticas Configuradas:

**Stores, Products, Prices:**
- ✅ Lectura pública (cualquiera puede ver)
- ❌ Solo admin puede modificar (protegido)

**Favorites:**
- ✅ Usuarios solo ven sus propios favoritos
- ✅ Usuarios pueden agregar/eliminar sus favoritos
- ❌ No pueden ver favoritos de otros usuarios

## ✅ Verificación

Para verificar que todo se instaló correctamente:

### En el SQL Editor, ejecuta:

```sql
-- Verificar tiendas
SELECT COUNT(*) as total_stores FROM stores;
-- Debe retornar: 5

-- Verificar productos
SELECT COUNT(*) as total_products FROM products;
-- Debe retornar: 25

-- Verificar precios
SELECT COUNT(*) as total_prices FROM prices;
-- Debe retornar: ~100

-- Ver productos con sus precios más bajos
SELECT
  p.name,
  p.category,
  p.brand,
  MIN(pr.price) as lowest_price,
  COUNT(pr.id) as stores_count
FROM products p
LEFT JOIN prices pr ON pr.product_id = p.id
GROUP BY p.id, p.name, p.category, p.brand
ORDER BY p.name;
```

### En el Table Editor:

1. Ve a **Table Editor** en el menú lateral
2. Verifica que aparezcan las 4 tablas
3. Haz clic en cada tabla para ver los datos

## 🐛 Troubleshooting

### Error: "permission denied for schema public"
**Solución:** Ejecuta el schema.sql primero, que habilita las políticas RLS correctamente.

### Error: "relation already exists"
**Solución:** Las tablas ya existen. Puedes:
1. Eliminarlas manualmente en Table Editor
2. O modificar el script para usar `CREATE TABLE IF NOT EXISTS`

### Error: "violates foreign key constraint"
**Solución:** Ejecuta el seed.sql DESPUÉS del schema.sql. El orden importa.

### No aparecen productos en la app
**Verificaciones:**
1. ✅ Revisa que `.env` tenga las credenciales correctas
2. ✅ Verifica que RLS esté habilitado en las tablas
3. ✅ Ejecuta las queries de verificación arriba
4. ✅ Revisa la consola del navegador por errores

## 📝 Agregar Más Datos

Para agregar más productos manualmente:

```sql
-- Ejemplo: Agregar nuevo producto
INSERT INTO products (name, description, image, category, brand, barcode) VALUES
  ('Nuevo Producto', 'Descripción', 'https://url-imagen.com', 'Alimentos', 'Marca', '1234567890123');

-- Agregar precios para el nuevo producto
INSERT INTO prices (product_id, store_id, price, in_stock) VALUES
  ((SELECT id FROM products WHERE barcode = '1234567890123'),
   (SELECT id FROM stores WHERE name = 'Riba Smith'),
   9.99,
   true);
```

## 🔄 Reiniciar Base de Datos

Para limpiar y volver a empezar:

```sql
-- CUIDADO: Esto eliminará TODOS los datos
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS prices CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS stores CASCADE;

-- Luego ejecuta schema.sql y seed.sql nuevamente
```

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Row Level Security (RLS) Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [SQL Editor](https://supabase.com/docs/guides/database/overview)

## 🎯 Siguientes Pasos

Una vez configurada la base de datos:
1. ✅ Verifica que la app puede leer productos
2. ✅ Prueba el login con Google OAuth
3. ✅ Agrega productos a favoritos
4. ✅ Compara precios entre tiendas
5. ✅ Escanea un código de barras

¡Tu base de datos está lista para Prexiopá! 🚀
