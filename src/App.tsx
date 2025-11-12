/**
 * App - Componente raíz de Prexiopá
 * Configura el RouterProvider con todas las rutas de la aplicación
 */

import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

function App() {
  return <RouterProvider router={router} />;
}

export default App;
