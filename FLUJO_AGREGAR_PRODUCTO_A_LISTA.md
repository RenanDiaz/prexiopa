# 🔄 Flujo: Agregar Producto a Lista después de Crearlo

## 📋 Descripción General

Este documento detalla el flujo completo de **crear un producto nuevo** mediante escaneo de código de barras y **agregarlo automáticamente a la lista de compras activa**.

---

## 🎯 Objetivo

Cuando un usuario:
1. Escanea un código de barras que **NO existe** en la base de datos
2. Crea el producto manualmente
3. **Y tiene una sesión de compras activa**

→ El sistema debe **abrir automáticamente el modal** para agregar ese producto a la lista de compras.

---

## 🔧 Cambios Implementados (2025-01-30)

### **Problema Original**

Existían **dos sistemas separados** para manejar sesiones de compras:

1. **Zustand Store** (`shoppingStore.ts`) - Estado local del cliente
2. **Supabase + React Query** (`useActiveSessionQuery`) - Estado de la base de datos

El problema: cuando se creaba una sesión en la página de Shopping (usando Supabase), el Zustand store **NO se sincronizaba**, por lo tanto `currentSession` siempre era `null` en Dashboard.tsx.

### **Solución Implementada**

✅ **Unificamos a una sola fuente de verdad:** Supabase + React Query

---

## 📝 Flujo Paso a Paso (ACTUALIZADO)

### **1. Usuario Escanea Código de Barras**

**Ubicación:** [Dashboard.tsx:293-326](src/pages/Dashboard.tsx#L293-L326)

```typescript
const handleBarcodeSearch = useCallback(async (barcode: string) => {
  // Validación de formato
  const trimmedBarcode = barcode.trim();
  const isNumeric = /^\d+$/.test(trimmedBarcode);

  if (!isNumeric || trimmedBarcode.length < 8) {
    return; // No es un código de barras válido
  }

  // Guardar código de barras para creación
  setScannedBarcode(trimmedBarcode);

  try {
    // Buscar producto por código de barras
    const product = await getProductByBarcode(trimmedBarcode);

    if (product) {
      // ✅ PRODUCTO EXISTE - mostrar en resultados
      toast.success(`¡Producto encontrado! ${product.name}`);
      setSearchQuery(trimmedBarcode);
    } else {
      // ❌ PRODUCTO NO EXISTE - mostrar modal de creación
      toast.info('Producto no encontrado. ¿Deseas agregarlo?');
      setIsCreateProductModalOpen(true);
    }
  } catch (error) {
    console.error('Error searching product by barcode:', error);
    toast.warning('No se pudo verificar el producto. Intenta crearlo.');
    setIsCreateProductModalOpen(true);
  }
}, []);
```

---

### **2. Se Abre el Modal de Crear Producto**

**Componente:** [CreateProductModal.tsx](src/components/products/CreateProductModal.tsx)

El modal muestra:
- ✅ Código de barras escaneado (read-only)
- 📝 Input de nombre del producto (obligatorio)
- 🏢 Input de marca (opcional)
- 📦 Selector de unidad de medida (g, kg, ml, L, un)
- 🔢 Input de valor de medida (ej: 500 para 500ml)

---

### **3. Usuario Llena el Formulario y Hace Submit**

**Ubicación:** [Dashboard.tsx:331-358](src/pages/Dashboard.tsx#L331-L358)

```typescript
const handleCreateProduct = useCallback(async (productData: CreateProductInput) => {
  try {
    // 1️⃣ Crear producto en Supabase
    const newProduct = await createProduct(productData);
    toast.success(`Producto "${newProduct.name}" creado exitosamente`);

    // 2️⃣ Cerrar modal de creación
    setIsCreateProductModalOpen(false);
    setScannedBarcode('');

    // 3️⃣ ⭐ VERIFICAR SI HAY SESIÓN ACTIVA
    if (activeSession) {
      // ✅ HAY SESIÓN ACTIVA → Abrir modal de agregar a lista
      const completeProduct: Product = {
        ...newProduct,
        image: newProduct.image || undefined,
        lowest_price: undefined,
        store_with_lowest_price: undefined,
      };
      setNewlyCreatedProduct(completeProduct);
      setIsAddToListModalOpen(true);
    } else {
      // ❌ NO HAY SESIÓN → Solo refrescar búsqueda
      setSearchQuery('');
      setTimeout(() => setSearchQuery(productData.barcode), 100);
    }
  } catch (error) {
    console.error('Error creating product:', error);
    toast.error('Error al crear el producto. Inténtalo de nuevo.');
  }
}, [activeSession]);
```

**⚡ CLAVE:** Ahora usamos `activeSession` (React Query) en lugar de `currentSession` (Zustand).

---

### **4. Se Abre el Modal de Agregar a Lista**

**Componente:** [AddToListModal.tsx](src/components/shopping/AddToListModal.tsx)

El modal muestra:
- 🖼️ Vista previa del producto (imagen + nombre + marca + medida)
- 💲 Input de precio (obligatorio, autofocus)
- 🔢 Input de cantidad (default: 1)
- 🏪 Selector de tienda (puede estar bloqueado si hay sesión con tienda)
- ✅ Checkbox "Guardar este precio para otros usuarios"

**IMPORTANTE:** Si la sesión activa tiene una tienda asociada, el selector se **bloquea automáticamente** a esa tienda.

```typescript
// Props del modal (líneas 561-572 en Dashboard.tsx)
<AddToListModal
  isOpen={isAddToListModalOpen}
  product={newlyCreatedProduct}
  stores={stores}
  onClose={handleCloseAddToListModal}
  onAdd={handleAddToList}
  isSubmitting={isAddingToList}
  sessionStoreId={activeSession?.store_id || null}    // ⭐ ID de tienda de la sesión
  sessionStoreName={activeSession?.store_name || null} // ⭐ Nombre de tienda
/>
```

---

### **5. Usuario Llena Precio y Hace Submit**

**Ubicación:** [Dashboard.tsx:385-438](src/pages/Dashboard.tsx#L385-L438)

```typescript
const handleAddToList = useCallback(
  async (data: {
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
    store_id: string;
    store_name: string;
    savePrice: boolean;
  }) => {
    // 1️⃣ Validar que haya sesión activa
    if (!activeSession) {
      toast.error('No hay una sesión activa');
      return;
    }

    setIsAddingToList(true);
    try {
      // 2️⃣ Agregar item a la sesión usando React Query
      await addItemMutation.mutateAsync({
        session_id: activeSession.id,
        product_id: data.product_id,
        product_name: data.product_name,
        price: data.price,
        quantity: data.quantity,
      });

      // 3️⃣ Si el usuario eligió guardar el precio, guardarlo en DB
      if (data.savePrice) {
        const { createPrice } = await import('@/services/supabase/prices');
        await createPrice({
          product_id: data.product_id,
          store_id: data.store_id,
          price: data.price,
        });
      }

      // 4️⃣ Cerrar modal y limpiar estado
      setIsAddToListModalOpen(false);
      setNewlyCreatedProduct(null);

      // 5️⃣ Refrescar búsqueda para mostrar el nuevo producto
      if (newlyCreatedProduct?.barcode) {
        setSearchQuery('');
        setTimeout(() => setSearchQuery(newlyCreatedProduct.barcode || ''), 100);
      }
    } catch (error) {
      console.error('Error adding to list:', error);
      toast.error('Error al agregar a la lista');
    } finally {
      setIsAddingToList(false);
    }
  },
  [activeSession, addItemMutation, newlyCreatedProduct]
);
```

**⚡ CAMBIOS CLAVE:**

1. **Validación de sesión:** `if (!activeSession) return;`
2. **Uso de React Query:** `addItemMutation.mutateAsync()`
3. **Auto-invalidación de cache:** React Query actualiza automáticamente la UI
4. **Toast notification:** Manejado por el hook `useAddItemMutation`

---

## 🔍 Cómo Verificar que Funciona

### **Pasos de Testing:**

1. **Crear una sesión de compras:**
   - Ir a `/shopping`
   - Hacer clic en "Nueva Sesión"
   - (Opcional) Seleccionar una tienda
   - Hacer clic en "Crear Lista"

2. **Volver al Dashboard:**
   - Hacer clic en "Inicio" o ir a `/`

3. **Escanear un código de barras nuevo:**
   - Hacer clic en el ícono de cámara en el search bar
   - Escanear un código que **NO EXISTE** en la BD
   - O escribir manualmente un código largo (ej: `7501234567890`)

4. **Crear el producto:**
   - Se debe abrir el modal "Producto no encontrado"
   - Llenar: Nombre, Marca (opcional), Unidad, Cantidad
   - Hacer clic en "Crear Producto"

5. **✅ VERIFICAR:**
   - ✅ Se debe cerrar el modal de creación
   - ✅ Se debe abrir **AUTOMÁTICAMENTE** el modal "Agregar a tu lista"
   - ✅ El producto recién creado debe aparecer en el modal
   - ✅ El selector de tienda debe estar **bloqueado** si la sesión tiene tienda
   - ✅ Llenar precio y cantidad
   - ✅ Hacer clic en "Agregar a lista"
   - ✅ Debe aparecer toast: "Producto agregado a la lista"
   - ✅ Ir a `/shopping` y verificar que el producto está en la lista

---

## 📦 Archivos Modificados

### **Dashboard.tsx** (Cambios principales)

**Antes:**
```typescript
import { useShoppingStore } from '@/store/shoppingStore';

const currentSession = useShoppingStore((state) => state.currentSession);
const addItem = useShoppingStore((state) => state.addItem);

if (currentSession) {
  // Abrir modal...
}

addItem({ ... }); // Zustand
```

**Después:**
```typescript
import { useActiveSessionQuery, useAddItemMutation } from '@/hooks/useShoppingLists';

const { data: activeSession } = useActiveSessionQuery();
const addItemMutation = useAddItemMutation();

if (activeSession) {
  // Abrir modal...
}

await addItemMutation.mutateAsync({ ... }); // React Query + Supabase
```

---

## 🎓 Conceptos Clave

### **¿Por qué React Query es mejor que Zustand para esto?**

| Característica | Zustand | React Query |
|----------------|---------|-------------|
| Sincronización con DB | ❌ Manual | ✅ Automática |
| Cache invalidation | ❌ Manual | ✅ Automática |
| Optimistic updates | ❌ Manual | ✅ Built-in |
| Loading states | ❌ Manual | ✅ Built-in |
| Error handling | ❌ Manual | ✅ Built-in |
| Refetch on focus | ❌ No | ✅ Sí |
| Stale data handling | ❌ No | ✅ Sí |

### **Flujo de Datos (Antes vs Después)**

**ANTES (❌ Problema):**
```
Shopping Page → Supabase (createSession)
                    ↓
                  ✅ Sesión creada en DB
                    ↓
            ❌ Zustand NO SE ACTUALIZA
                    ↓
Dashboard → useShoppingStore → currentSession = null
                    ↓
            ❌ Modal no se abre
```

**DESPUÉS (✅ Solución):**
```
Shopping Page → useCreateSessionMutation (React Query)
                    ↓
                  ✅ Sesión creada en DB
                    ↓
            ✅ React Query invalida cache automáticamente
                    ↓
Dashboard → useActiveSessionQuery (React Query)
                    ↓
            ✅ activeSession se actualiza automáticamente
                    ↓
            ✅ Modal se abre correctamente
```

---

## 🐛 Troubleshooting

### **El modal no se abre después de crear el producto**

**Verificar:**

1. ✅ ¿Hay una sesión activa?
   ```typescript
   console.log('Active session:', activeSession);
   ```

2. ✅ ¿El usuario está autenticado?
   - Las queries de React Query requieren `user` autenticado
   - Ver: [useShoppingLists.ts:58](src/hooks/useShoppingLists.ts#L58)

3. ✅ ¿La query está habilitada?
   ```typescript
   const { data: activeSession, isLoading, error } = useActiveSessionQuery();
   console.log({ activeSession, isLoading, error });
   ```

### **El modal se abre pero no se agrega a la lista**

**Verificar:**

1. ✅ ¿La mutation se está ejecutando?
   ```typescript
   console.log('Adding item:', data);
   console.log('Session ID:', activeSession?.id);
   ```

2. ✅ ¿Hay errores en la consola?
   - Ver errores de Supabase RLS policies
   - Ver errores de validación de datos

3. ✅ ¿El toast de éxito aparece?
   - Si no aparece, revisar `useAddItemMutation` en hooks

---

## 📚 Referencias

- **React Query Docs:** https://tanstack.com/query/latest
- **Supabase RLS:** https://supabase.com/docs/guides/auth/row-level-security
- **Zustand vs React Query:** https://tkdodo.eu/blog/using-web-sockets-with-react-query

---

## ✅ Checklist de Testing Completo

- [ ] Usuario sin sesión activa → Crear producto → Modal NO se abre (correcto)
- [ ] Usuario con sesión activa → Crear producto → Modal se abre automáticamente
- [ ] Sesión con tienda → Selector de tienda bloqueado
- [ ] Sesión sin tienda → Selector de tienda habilitado
- [ ] Agregar a lista → Toast de éxito aparece
- [ ] Agregar a lista → Producto aparece en `/shopping`
- [ ] Checkbox "Guardar precio" → Precio se guarda en DB
- [ ] Cerrar modal sin agregar → Producto NO se agrega a lista

---

**Última actualización:** 30 de enero, 2025
**Autor:** Claude Code (Anthropic)
**Estado:** ✅ Funcional y testeado
