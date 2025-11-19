# Configuración de Google OAuth con Supabase

Esta guía te ayudará a configurar Google OAuth para la autenticación en Prexiopá.

## Requisitos Previos

- Una cuenta de Supabase activa
- Un proyecto en Google Cloud Console
- Acceso al dashboard de Supabase

## Paso 1: Configurar Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto o crea uno nuevo
3. Ve a **Settings > API**
4. Copia los siguientes valores:
   - **URL del Proyecto**: `https://tu-proyecto.supabase.co`
   - **Anon/Public Key**: La clave pública de tu proyecto

5. Crea un archivo `.env` en la raíz del proyecto (basado en `.env.example`):

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

## Paso 2: Configurar Google Cloud Console

### 2.1 Crear un Proyecto

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el **Project ID**

### 2.2 Habilitar APIs

1. En el menú lateral, ve a **APIs & Services > Library**
2. Busca "Google+ API"
3. Haz clic en **Enable**

### 2.3 Configurar OAuth Consent Screen

1. Ve a **APIs & Services > OAuth consent screen**
2. Selecciona **External** y haz clic en **Create**
3. Completa la información requerida:
   - **App name**: Prexiopá
   - **User support email**: Tu email
   - **Developer contact information**: Tu email
4. Haz clic en **Save and Continue**
5. En **Scopes**, añade los siguientes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
6. Haz clic en **Save and Continue**
7. En **Test users** (opcional), añade emails de usuarios de prueba
8. Revisa y confirma la configuración

### 2.4 Crear OAuth 2.0 Client ID

1. Ve a **APIs & Services > Credentials**
2. Haz clic en **Create Credentials > OAuth 2.0 Client ID**
3. Selecciona **Web application** como Application type
4. Completa la información:
   - **Name**: Prexiopá Web Client
   - **Authorized JavaScript origins**:
     ```
     http://localhost:5173
     https://tu-dominio.com
     ```
   - **Authorized redirect URIs**:
     ```
     https://tu-proyecto.supabase.co/auth/v1/callback
     ```

     **Nota**: Solo necesitas la URL de Supabase aquí. Supabase se encargará de redirigir a tu app.
5. Haz clic en **Create**
6. Copia el **Client ID** y **Client Secret**

## Paso 3: Configurar Site URL en Supabase

**IMPORTANTE**: Antes de configurar el provider, debes configurar la Site URL.

1. Ve a tu [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Authentication > URL Configuration**
4. Configura las siguientes URLs:

   **Para desarrollo local:**
   - **Site URL**: `http://localhost:5173`
   - **Redirect URLs**:
     ```
     http://localhost:5173/auth/callback
     http://localhost:5173/**
     ```

   **Para producción:**
   - **Site URL**: `https://prexiopa.vercel.app`
   - **Redirect URLs**:
     ```
     https://prexiopa.vercel.app/auth/callback
     https://prexiopa.vercel.app/**
     ```

5. Haz clic en **Save**

## Paso 4: Configurar Google Provider en Supabase

1. En el mismo dashboard de Supabase
2. Ve a **Authentication > Providers**
3. Busca **Google** en la lista de providers
4. Haz clic en **Enable**
5. Pega los valores copiados de Google Cloud Console:
   - **Client ID**: El Client ID de Google
   - **Client Secret**: El Client Secret de Google
6. En **Redirect URL**, verifica que sea:
   ```
   https://tu-proyecto.supabase.co/auth/v1/callback
   ```
7. Haz clic en **Save**

## Paso 6: Configurar Redirect URL en el Código

El redirect está configurado en `src/services/authService.ts`:

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
});
```

## Paso 7: Usar el Componente GoogleButton

En tu página de login (`src/pages/Login.tsx`), importa y usa el componente:

```tsx
import { GoogleButton } from '@/components/auth';

// En tu componente
<GoogleButton
  text="Continuar con Google"
  onSuccess={() => console.log('Login exitoso')}
  onError={(error) => console.error('Error:', error)}
/>
```

## Flujo de Autenticación

1. Usuario hace clic en el botón "Continuar con Google"
2. Se llama a `authService.loginWithGoogle()`
3. Supabase genera una URL de autorización de Google
4. Usuario es redirigido a Google para autenticarse
5. Google redirige a `/auth/callback` con el token
6. La página `AuthCallback` procesa la sesión
7. Usuario es redirigido al dashboard

## Componentes Creados

### 1. `authService.loginWithGoogle()`
Inicia el flujo de OAuth con Google.

### 2. `authService.handleOAuthCallback()`
Procesa el callback después de la autenticación.

### 3. `GoogleButton`
Componente de UI para el botón de Google.

### 4. `AuthCallback` Page
Página que maneja el callback de OAuth.

## Testing Local

1. Asegúrate de tener las variables de entorno configuradas
2. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Ve a `http://localhost:5173/login`
4. Haz clic en "Continuar con Google"
5. Deberías ser redirigido a Google para autenticarte
6. Después de autenticarte, deberías volver al dashboard

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Problema**: La URL de redirección no coincide con las configuradas en Google Cloud Console.

**Solución**:
- Verifica que la URL de redirección en Google Cloud Console incluya:
  ```
  https://tu-proyecto.supabase.co/auth/v1/callback
  ```
- Asegúrate de que no haya espacios adicionales
- Puede tomar unos minutos para que los cambios se propaguen

### Error: "Access blocked: Prexiopá has not completed the Google verification process"

**Problema**: Tu app no ha sido verificada por Google.

**Solución**:
- Durante el desarrollo, añade usuarios de prueba en **OAuth consent screen > Test users**
- Para producción, solicita la verificación de Google

### Error: "No session found"

**Problema**: La sesión no se guardó correctamente después del callback.

**Solución**:
- Verifica que las variables de entorno estén configuradas correctamente
- Asegúrate de que el dominio en el redirect_uri coincida con el origen de la solicitud
- Revisa la consola del navegador para errores específicos

## Seguridad

### Protección de Credenciales

- **NUNCA** commiteés el archivo `.env` al repositorio
- Usa `.env.example` como plantilla (sin valores reales)
- En producción, usa variables de entorno del hosting (Vercel, Netlify, etc.)

### Best Practices

1. **Usa HTTPS en producción**: Nunca uses OAuth sin HTTPS
2. **Valida el estado**: Supabase maneja esto automáticamente
3. **Verifica la sesión**: Siempre valida la sesión en el servidor
4. **Implementa timeout**: Las sesiones deben expirar
5. **Revoca tokens**: Permite a los usuarios cerrar sesión en todos los dispositivos

## Referencias

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
