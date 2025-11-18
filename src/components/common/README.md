# Common UI Components

Sistema de componentes comunes de Prexiopá diseñados para desarrollo rápido, accesibilidad completa y consistencia visual.

## Componentes Disponibles

- [Button](#button) - Botones versátiles con múltiples variantes y estados
- [Input](#input) - Inputs con validación, iconos y estados
- [Card](#card) - Contenedores flexibles para agrupar contenido
- [Badge](#badge) - Etiquetas y badges para estados y contadores
- [Modal](#modal) - Diálogos modales accesibles con animaciones

---

## Button

Componente de botón altamente versátil con múltiples variantes, tamaños y estados.

### Características

- 5 variantes visuales (primary, secondary, outline, ghost, danger)
- 3 tamaños (sm, md, lg)
- Estado de loading con spinner
- Soporte para iconos (izquierda/derecha)
- Completamente accesible (ARIA labels, focus states)
- Animaciones suaves

### Uso Básico

```tsx
import { Button } from '@/components/common';

// Botón principal
<Button variant="primary" size="lg">
  Buscar Ofertas
</Button>

// Con estado de loading
<Button variant="secondary" loading>
  Guardando...
</Button>

// Con iconos
<Button variant="outline" iconLeft={<SearchIcon />}>
  Buscar
</Button>

// Botón de peligro
<Button variant="danger" onClick={handleDelete}>
  Eliminar
</Button>

// Full width (móvil)
<Button variant="primary" fullWidth>
  Continuar
</Button>
```

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | Estilo visual del botón |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del botón |
| `loading` | `boolean` | `false` | Muestra spinner y deshabilita |
| `fullWidth` | `boolean` | `false` | Ancho completo del contenedor |
| `iconLeft` | `ReactNode` | - | Icono a la izquierda |
| `iconRight` | `ReactNode` | - | Icono a la derecha |
| `disabled` | `boolean` | `false` | Deshabilita el botón |

---

## Input

Componente de input flexible con estados de validación, iconos y texto de ayuda.

### Características

- Múltiples tipos (text, email, password, number, search, tel, url)
- Estados de error y éxito
- Iconos a la izquierda y derecha
- Botón de limpiar para búsquedas
- Texto de ayuda y mensajes de error
- Label integrado
- Completamente accesible

### Uso Básico

```tsx
import { Input } from '@/components/common';

// Input básico
<Input
  label="Nombre"
  placeholder="Ingresa tu nombre"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

// Con estado de error
<Input
  label="Email"
  type="email"
  error="El email es inválido"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// Búsqueda con icono y clear
<Input
  type="search"
  placeholder="Buscar productos..."
  iconLeft={<SearchIcon />}
  clearable
  onClear={() => setSearch('')}
/>

// Con helper text
<Input
  label="Contraseña"
  type="password"
  helperText="Mínimo 8 caracteres"
/>

// Con éxito
<Input
  label="Username"
  success
  value="usuario123"
/>
```

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `label` | `string` | - | Etiqueta del input |
| `type` | `'text' \| 'email' \| 'password' \| 'number' \| 'search' \| 'tel' \| 'url'` | `'text'` | Tipo de input |
| `error` | `string` | - | Mensaje de error |
| `success` | `boolean` | `false` | Estado de éxito |
| `helperText` | `string` | - | Texto de ayuda |
| `iconLeft` | `ReactNode` | - | Icono a la izquierda |
| `iconRight` | `ReactNode` | - | Icono a la derecha |
| `clearable` | `boolean` | `false` | Muestra botón limpiar |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del input |
| `fullWidth` | `boolean` | `false` | Ancho completo |
| `onClear` | `() => void` | - | Callback al limpiar |

---

## Card

Componente contenedor flexible para agrupar contenido relacionado.

### Características

- 3 variantes (default, elevated, outlined)
- Opción clickable con efectos hover
- Secciones opcionales (Header, Body, Footer)
- Soporte para imágenes
- Múltiples tamaños de padding

### Uso Básico

```tsx
import { Card } from '@/components/common';

// Card básica
<Card>
  <p>Contenido de la card</p>
</Card>

// Card elevada con secciones
<Card variant="elevated">
  <Card.Header>
    <h3>Título del Producto</h3>
  </Card.Header>
  <Card.Body>
    <p>Descripción del producto...</p>
  </Card.Body>
  <Card.Footer>
    <Button>Ver Detalles</Button>
  </Card.Footer>
</Card>

// Card clickable
<Card clickable onClick={() => navigate('/producto/123')}>
  <CardProducto data={product} />
</Card>

// Card con imagen
<Card variant="elevated">
  <Card.Image
    src="/producto.jpg"
    alt="Producto"
  />
  <Card.Body>
    <h4>Nombre del Producto</h4>
    <p>$10.99</p>
  </Card.Body>
</Card>

// Card outlined
<Card variant="outlined" padding="lg">
  <h3>Contenido destacado</h3>
</Card>
```

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'default' \| 'elevated' \| 'outlined'` | `'default'` | Estilo visual |
| `clickable` | `boolean` | `false` | Card clickable con hover |
| `padding` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del padding |
| `onClick` | `(e) => void` | - | Handler de click |

### Subcomponentes

- `Card.Header` - Encabezado con borde inferior
- `Card.Body` - Contenido principal (flex: 1)
- `Card.Footer` - Pie con borde superior
- `Card.Image` - Imagen con aspect ratio

---

## Badge

Componente de badge versátil para estados, contadores y etiquetas.

### Características

- 6 variantes (primary, secondary, success, warning, danger, info)
- 3 tamaños (sm, md, lg)
- Opción de dot indicator
- Estilo pill (redondeado completo)

### Uso Básico

```tsx
import { Badge } from '@/components/common';

// Badges de estado
<Badge variant="success">Disponible</Badge>
<Badge variant="danger">Agotado</Badge>
<Badge variant="warning">Pocas unidades</Badge>

// Contador de notificaciones
<Badge variant="primary" size="sm">3</Badge>

// Badge de descuento
<Badge variant="warning" size="lg">-25%</Badge>

// Con dot indicator
<Badge variant="info" dot>Nuevo</Badge>

// Sin pill (cuadrado)
<Badge variant="secondary" pill={false}>
  Categoría
</Badge>
```

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'primary'` | Estilo visual |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del badge |
| `dot` | `boolean` | `false` | Muestra dot indicator |
| `pill` | `boolean` | `true` | Forma de píldora |

---

## Modal

Componente de modal completamente accesible con gestión de focus y animaciones.

### Características

- Overlay con backdrop blur
- Cierre con X, backdrop click, ESC
- Focus trap automático
- Animaciones de entrada/salida
- Gestión de scroll del body
- 4 tamaños (sm, md, lg, full)
- Secciones opcionales (Header, Body, Footer)
- Portal a document.body

### Uso Básico

```tsx
import { Modal, Button } from '@/components/common';
import { useState } from 'react';

function Component() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal
      </Button>

      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <Modal.Header>
          <h2>Confirmar acción</h2>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas continuar?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
          >
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

// Modal grande
<Modal open={isOpen} onClose={handleClose} size="lg">
  <Modal.Body>
    <ProductDetail product={selectedProduct} />
  </Modal.Body>
</Modal>

// Prevenir cierre en backdrop
<Modal
  open={isOpen}
  onClose={handleClose}
  closeOnBackdrop={false}
  closeOnEsc={false}
>
  <Modal.Body>
    Contenido importante que no se puede cerrar accidentalmente
  </Modal.Body>
</Modal>

// Sin botón de cerrar
<Modal
  open={isOpen}
  onClose={handleClose}
  showCloseButton={false}
>
  <Modal.Body>Modal sin X</Modal.Body>
</Modal>
```

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `open` | `boolean` | - | Controla visibilidad |
| `onClose` | `() => void` | - | Callback al cerrar |
| `size` | `'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` | Tamaño del modal |
| `closeOnBackdrop` | `boolean` | `true` | Cerrar al click en backdrop |
| `closeOnEsc` | `boolean` | `true` | Cerrar con tecla ESC |
| `showCloseButton` | `boolean` | `true` | Muestra botón X |

### Subcomponentes

- `Modal.Header` - Encabezado con espacio para close button
- `Modal.Body` - Contenido con scroll automático
- `Modal.Footer` - Pie con acciones (botones)

---

## Patrones Comunes de Uso

### Formulario de Búsqueda

```tsx
<form onSubmit={handleSearch}>
  <Input
    type="search"
    placeholder="Buscar productos en Prexiopá..."
    iconLeft={<SearchIcon />}
    clearable
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    onClear={() => setQuery('')}
    fullWidth
  />
  <Button type="submit" variant="primary" fullWidth>
    Buscar
  </Button>
</form>
```

### Card de Producto

```tsx
<Card
  variant="elevated"
  clickable
  onClick={() => navigate(`/producto/${product.id}`)}
>
  <Card.Image src={product.image} alt={product.name} />
  <Card.Body>
    <h3>{product.name}</h3>
    <Badge variant="warning" size="sm">-{product.discount}%</Badge>
    <p>${product.price}</p>
    <Badge variant={product.inStock ? 'success' : 'danger'}>
      {product.inStock ? 'Disponible' : 'Agotado'}
    </Badge>
  </Card.Body>
</Card>
```

### Modal de Confirmación

```tsx
<Modal open={showDelete} onClose={() => setShowDelete(false)} size="sm">
  <Modal.Header>
    <h3>Eliminar favorito</h3>
  </Modal.Header>
  <Modal.Body>
    ¿Estás seguro de que deseas eliminar este producto de favoritos?
  </Modal.Body>
  <Modal.Footer>
    <Button variant="outline" onClick={() => setShowDelete(false)}>
      Cancelar
    </Button>
    <Button variant="danger" onClick={handleDelete}>
      Eliminar
    </Button>
  </Modal.Footer>
</Modal>
```

---

## Accesibilidad

Todos los componentes están construidos siguiendo las mejores prácticas de accesibilidad:

- **Roles ARIA apropiados**: `button`, `dialog`, `alert`, etc.
- **Labels descriptivos**: Todos los elementos interactivos tienen labels
- **Estados ARIA**: `aria-disabled`, `aria-invalid`, `aria-busy`, etc.
- **Focus management**: Estilos de focus visibles con `focus-visible`
- **Keyboard navigation**: Soporte completo de teclado
- **Screen reader support**: Textos apropiados para lectores de pantalla

---

## Responsive Design

Todos los componentes son mobile-first y se adaptan automáticamente:

- **Breakpoints automáticos** en modales y cards
- **Touch targets** de mínimo 44px en móvil
- **Full-width buttons** por defecto en móvil
- **Stacking automático** de footers en modal móvil

---

## Performance

- **Styled-components optimizado** con theme caching
- **React.memo** en componentes que lo necesitan
- **Lazy animations** solo cuando son necesarias
- **Portal rendering** para modales (evita re-renders)

---

## Desarrollo

### Agregar un nuevo componente

1. Crear archivo de componente: `NewComponent.tsx`
2. Crear archivo de estilos: `NewComponent.styles.ts`
3. Exportar desde `index.ts`
4. Documentar en README

### Guidelines

- Usar TypeScript estricto
- Documentar con JSDoc
- Incluir ejemplos de uso
- Hacer componentes accesibles
- Seguir el theme system
- Props sensibles con defaults
