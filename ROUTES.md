# Sistema de Rutas de Prexiopá

Este documento describe todas las rutas configuradas en la aplicación Prexiopá usando React Router v7.

## Estructura de Rutas

### Rutas Públicas con Layout

Estas rutas incluyen el Navbar y el layout principal:

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | Dashboard | Página principal con productos destacados, ofertas y tendencias |
| `/search` | SearchResults | Página de búsqueda con filtros y resultados |
| `/product/:id` | ProductDetail | Detalle de producto con precios por tienda e historial |
| `/store/:id` | StorePage | Página de tienda con productos y ubicaciones |
| `/favorites` | Favorites | Lista de productos favoritos del usuario (protegida)* |
| `/profile` | Profile | Perfil y configuración del usuario (protegida)* |

*Estas rutas deberán ser protegidas con autenticación en el futuro.

### Rutas Públicas sin Layout

Estas rutas no incluyen el Navbar (fullscreen):

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/login` | Login | Página de inicio de sesión |
| `/register` | Register | Página de registro de nuevos usuarios |

### Ruta de Error

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/*` | NotFound | Página 404 para rutas no encontradas |

## Características Implementadas

### Lazy Loading
Todas las páginas usan `React.lazy()` para carga diferida, mejorando el performance inicial.

### Loading States
El sistema incluye un componente `LoadingFallback` con spinner animado que se muestra durante la carga de páginas.

### Navegación Activa
El Navbar detecta automáticamente la ruta activa y la resalta visualmente.

### Responsive Design
Todas las páginas están optimizadas para mobile-first con breakpoints en:
- 640px (sm)
- 768px (md)
- 1024px (lg)
- 1280px (xl)

### Theme Integration
Todos los componentes usan styled-components con acceso completo al theme de Prexiopá.

## Uso de Parámetros

### Producto Individual
```typescript
// URL: /product/123
const { id } = useParams<{ id: string }>();
```

### Tienda Individual
```typescript
// URL: /store/super99
const { id } = useParams<{ id: string }>();
```

### Búsqueda con Query
```typescript
// URL: /search?q=arroz&category=alimentos
const [searchParams] = useSearchParams();
const query = searchParams.get('q');
const category = searchParams.get('category');
```

## Navegación Programática

### Usando Link
```tsx
import { Link } from 'react-router-dom';

<Link to="/product/123">Ver Producto</Link>
```

### Usando useNavigate
```tsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/product/123');
navigate(-1); // Volver atrás
```

## Próximas Mejoras

- [ ] Implementar sistema de autenticación
- [ ] Agregar ProtectedRoute component
- [ ] Implementar rutas de admin
- [ ] Agregar animaciones de transición entre páginas
- [ ] Implementar breadcrumbs
- [ ] Agregar rutas de ayuda y términos

## Estructura de Archivos

```
src/
├── routes/
│   └── index.tsx          # Configuración del router
├── pages/
│   ├── Dashboard.tsx      # Página principal
│   ├── Login.tsx          # Inicio de sesión
│   ├── Register.tsx       # Registro
│   ├── Profile.tsx        # Perfil de usuario
│   ├── ProductDetail.tsx  # Detalle de producto
│   ├── StorePage.tsx      # Página de tienda
│   ├── Favorites.tsx      # Favoritos
│   ├── SearchResults.tsx  # Resultados de búsqueda
│   ├── NotFound.tsx       # Página 404
│   └── index.ts           # Barrel export
├── components/
│   ├── Navbar.tsx         # Barra de navegación
│   ├── Layout.tsx         # Layout principal
│   └── index.ts           # Barrel export
└── App.tsx                # RouterProvider
```

## Testing de Rutas

Para probar todas las rutas:

1. **Dashboard**: http://localhost:5173/
2. **Búsqueda**: http://localhost:5173/search?q=test
3. **Producto**: http://localhost:5173/product/123
4. **Tienda**: http://localhost:5173/store/super99
5. **Favoritos**: http://localhost:5173/favorites
6. **Perfil**: http://localhost:5173/profile
7. **Login**: http://localhost:5173/login
8. **Registro**: http://localhost:5173/register
9. **404**: http://localhost:5173/ruta-inexistente
