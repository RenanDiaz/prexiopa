Genera un proyecto completo de **web app** llamado "Prexiopá", usando **React + Vite + TypeScript**. La app sirve para **buscar, comparar y seguir precios de productos en diferentes tiendas y supermercados en Panamá**.

Debes crear:

1. **Estructura de carpetas**:
  /src
    /components       # Componentes reutilizables (Botones, Inputs, Cards)
    /pages            # Páginas principales (Dashboard, Producto, Tienda, Login, Registro, Perfil)
    /routes           # React Router
    /services         # Funciones para consumir la API (axios)
    /store            # Redux Toolkit (o Context API) para state global
    /utils            # Funciones auxiliares
    /assets           # Imágenes, íconos, logos
    /styles           # Global styles con styled-components
    /hooks            # Custom hooks

2. **Dependencias a instalar**:
  - react-router-dom
  - styled-components
  - axios
  - redux toolkit o zustand
  - react-icons
  - react-query (opcional, para manejo de datos)
  - recharts o chart.js (para gráficas de precios)
  - react-toastify (para notificaciones)

3. **Páginas iniciales**:
  - Login
  - Registro
  - Dashboard: tarjetas de productos, top ofertas, tendencias
  - Producto: detalle de precios por tienda, gráfico de historial, botón de favoritos
  - Tienda: listado de productos y precios
  - Perfil: información de usuario y configuración

4. **Componentes reutilizables sugeridos**:
  - CardProducto
  - CardTienda
  - Navbar
  - Footer
  - InputBusqueda
  - FiltroSidebar
  - Botón genérico
  - Modal para alertas / favoritos

5. **Estado global**:
  - Usuario autenticado
  - Lista de productos favoritos
  - Filtros de búsqueda y categoría
  - Alertas de precios

6. **Estilos y branding**:
  - Paleta: Verde (#00C853), Azul turquesa (#00BCD4), Gris claro (#F5F5F5)
  - Tipografía: Poppins
  - Diseño responsive mobile-first
  - Dashboard con tarjetas y gráficos de precios
  - Íconos para tiendas, productos, alertas y favoritos

7. **Endpoints simulados** (para servicios con axios):
  - GET /products?query=nombre
  - GET /products/:id
  - GET /products/:id/prices
  - POST /favorites
  - GET /favorites
  - GET /stores
  - POST /alerts
  - POST /auth/login
  - POST /auth/register
  - GET /users/:id

8. **Funcionalidades iniciales a implementar**:
  - Login / registro / perfil
  - Dashboard con listado de productos y top ofertas
  - Página de producto con comparación de precios y gráfico de historial
  - Guardar productos favoritos
  - Filtros de búsqueda por nombre, categoría y tienda
  - Navegación completa con React Router
  - Estilos base con styled-components
  - Notificaciones visuales (toast) para alertas de precio

9. **Extras opcionales**:
  - Dark mode
  - Autocompletado en búsqueda
  - Ordenar productos por precio, tienda o categoría
  - Gráficos con historial de precios (línea o barra)

Entrega todo el **código base listo para ejecutar con `npm install` y `npm run dev`**, con comentarios explicativos en componentes y hooks.