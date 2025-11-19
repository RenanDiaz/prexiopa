# OAuth Quick Fix - 404 Issue

## Problema
Google OAuth redirige a `/dashboard#access_token=...` pero muestra un 404.

## Causa
Falta configurar la **Site URL** y **Redirect URLs** en Supabase.

## Solución Rápida

### 1. Ve a Supabase Dashboard
https://supabase.com/dashboard

### 2. Selecciona tu proyecto: `ycfiblaugmbdjyxhctpb`

### 3. Ve a Authentication > URL Configuration

### 4. Configura las siguientes URLs:

**Site URL:**
```
https://prexiopa.vercel.app
```

**Redirect URLs (separadas por comas):**
```
https://prexiopa.vercel.app/auth/callback,https://prexiopa.vercel.app/**
```

**Para desarrollo local, agrega también:**
```
http://localhost:5173/auth/callback,http://localhost:5173/**
```

### 5. Haz clic en "Save"

### 6. Prueba nuevamente

1. Ve a https://prexiopa.vercel.app/login
2. Haz clic en "Continuar con Google"
3. Autentica con Google
4. Deberías ser redirigido a `/auth/callback` primero
5. Luego automáticamente a `/dashboard` con tu sesión activa

## ¿Cómo funciona?

```
1. Usuario hace clic en "Continuar con Google"
   ↓
2. Supabase genera URL de OAuth y redirige a Google
   ↓
3. Google autentica y redirige a:
   https://ycfiblaugmbdjyxhctpb.supabase.co/auth/v1/callback
   ↓
4. Supabase procesa el token y redirige a tu Site URL + hash:
   https://prexiopa.vercel.app/auth/callback#access_token=...
   ↓
5. AuthCallback page detecta el hash, extrae el token con getSession()
   ↓
6. Se guarda el usuario en el store de Zustand
   ↓
7. Redirect a /dashboard con sesión activa
```

## Verificación

Después de configurar, verifica en la consola del navegador:
- Deberías ver logs de `[AuthCallback] Usuario autenticado:`
- No deberías ver errores de "No session found"
- El token debería estar en localStorage como `sb-*-auth-token`

## Si sigue sin funcionar

1. Verifica que el dominio en Google Cloud Console incluya:
   - Authorized JavaScript origins: `https://prexiopa.vercel.app`

2. Limpia cookies y localStorage:
   ```javascript
   localStorage.clear();
   // Luego recarga la página
   ```

3. Verifica en Network tab del DevTools:
   - El redirect de Google debería ir a Supabase
   - Supabase debería redirigir a tu app con el hash
   - No debería haber errores 404 en la redirección

## Notas Importantes

- **Site URL** es donde Supabase redirige después de OAuth
- **Redirect URLs** es una whitelist de URLs permitidas
- El `**` permite cualquier subruta
- Los cambios en Supabase pueden tomar 1-2 minutos en propagarse
