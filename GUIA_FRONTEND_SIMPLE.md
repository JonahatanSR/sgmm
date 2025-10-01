# 🚀 Guía de Implementación Frontend - Pasos Exactos

**Proyecto:** SGMM - Autenticación SAML  
**URL Backend Producción:** `https://sgmm.portalapps.mx`  
**Estado:** ✅ Backend listo para integración

---

## 📋 Lo Que Necesitas Saber

El backend ya maneja:
- ✅ Autenticación con Google SAML
- ✅ Generación de tokens JWT
- ✅ Cookies seguras (HttpOnly)
- ✅ Validación de sesiones

El frontend solo necesita:
1. Un botón/enlace que inicie el flujo SAML
2. Un "route guard" que verifique la sesión
3. Mostrar los datos del usuario

---

## 🎯 PASO 1: El Botón de Inicio de Sesión

### ❌ NO hagas esto:
```jsx
// NO uses un formulario
<form onSubmit={handleLogin}>
  <button type="submit">Iniciar Sesión</button>
</form>
```

### ✅ HAZ esto:
```jsx
// Usa un simple enlace <a>
<a href="https://sgmm.portalapps.mx/api/auth/saml/login">
  Iniciar Sesión con Google
</a>
```

### Ejemplo completo (React):
```jsx
// src/pages/LoginPage.tsx
export const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">SGMM</h1>
          <p className="text-gray-600 mt-2">
            Sistema de Gestión de Gastos Médicos Mayores
          </p>
        </div>

        {/* BOTÓN SIMPLE - SOLO UN ENLACE */}
        <a
          href="https://sgmm.portalapps.mx/api/auth/saml/login"
          className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-semibold"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Iniciar Sesión con Google
        </a>

        <p className="text-sm text-gray-500 text-center mt-6">
          Utiliza tu cuenta corporativa para acceder
        </p>
      </div>
    </div>
  );
};
```

**¿Qué pasa después?**
1. Usuario hace clic → Va a `https://sgmm.portalapps.mx/api/auth/saml/login`
2. Backend redirige a Google
3. Usuario se autentica en Google
4. Google envía respuesta al backend
5. Backend verifica email, genera token, establece cookie
6. **Backend redirige a `https://sgmm.portalapps.mx/dashboard`**

---

## 🎯 PASO 2: Configurar Cliente HTTP

**⚠️ MUY IMPORTANTE:** El cliente HTTP debe enviar cookies automáticamente.

### Opción A: Axios (Recomendado)

```typescript
// src/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://sgmm.portalapps.mx',
  withCredentials: true,  // ⚠️ CRÍTICO: Envía la cookie session_token
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### Opción B: Fetch

```typescript
// src/api/client.ts
export const apiClient = {
  get: async (url: string) => {
    const response = await fetch(`https://sgmm.portalapps.mx${url}`, {
      method: 'GET',
      credentials: 'include',  // ⚠️ CRÍTICO: Envía la cookie session_token
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return response.json();
  }
};
```

---

## 🎯 PASO 3: Verificación de Sesión (Route Guard)

Este es el código que verifica si el usuario está autenticado.

### Implementación Completa:

```typescript
// src/hooks/useAuth.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

interface User {
  id: string;
  employee_number: string;
  email: string;
  full_name: string;
  role: string;
  company_id: string;
}

interface AuthResponse {
  authenticated: boolean;
  user?: User;
  session?: {
    expires_at: string;
    issued_at: string;
  };
  error?: string;
  message?: string;
}

export const useAuth = () => {
  const { data, isLoading, error } = useQuery<AuthResponse>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      // ⚠️ IMPORTANTE: Usa withCredentials: true (ya configurado en apiClient)
      const response = await apiClient.get('/api/auth/me');
      return response.data;
    },
    retry: false,  // No reintentar si falla
    staleTime: 5 * 60 * 1000,  // Considerar válido por 5 minutos
  });

  return {
    user: data?.user,
    session: data?.session,
    isAuthenticated: data?.authenticated ?? false,
    isLoading,
    error,
  };
};
```

### Componente ProtectedRoute:

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading mientras verifica
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // ❌ Si NO está autenticado → Redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Si está autenticado → Mostrar contenido
  return <Outlet />;
};
```

---

## 🎯 PASO 4: Configurar Rutas

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* Más rutas protegidas aquí */}
          </Route>
          
          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
```

---

## 🎯 PASO 5: Mostrar Datos del Usuario

```typescript
// src/pages/DashboardPage.tsx
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../api/client';

export const DashboardPage = () => {
  const { user, session } = useAuth();

  const handleLogout = async () => {
    await apiClient.get('/api/auth/logout');
    window.location.href = '/login';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">
              Bienvenido, {user.full_name}
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Información del Usuario</h2>
          
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Nombre</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.full_name}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Número de Empleado</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.employee_number}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Sesión expira</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(session?.expires_at ?? '').toLocaleString('es-MX')}
              </dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  );
};
```

---

## 📦 Dependencias Necesarias

```bash
npm install axios @tanstack/react-query react-router-dom
```

O con yarn:
```bash
yarn add axios @tanstack/react-query react-router-dom
```

---

## 🔍 Manejo de Respuestas de `/api/auth/me`

### ✅ Respuesta Exitosa (200 OK)
```json
{
  "authenticated": true,
  "user": {
    "id": "emp-123",
    "employee_number": "3619",
    "email": "jonahatan.angeles@siegfried.com.mx",
    "full_name": "Jonahatan Angeles",
    "role": "collaborator",
    "company_id": "company-1"
  },
  "session": {
    "expires_at": "2025-10-01T15:30:00.000Z",
    "issued_at": "2025-10-01T14:30:00.000Z"
  }
}
```

**Acción:** Mostrar dashboard con datos del usuario.

### ❌ Respuesta Error (401 Unauthorized)
```json
{
  "authenticated": false,
  "error": "Token expired",
  "message": "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
}
```

**Acción:** Redirigir inmediatamente a `/login`.

---

## 🎬 Flujo Completo del Usuario

```
1. Usuario abre https://sgmm.portalapps.mx/login
   └─> Ve el botón "Iniciar Sesión con Google"

2. Usuario hace clic en el botón
   └─> Navegador va a https://sgmm.portalapps.mx/api/auth/saml/login
   └─> Backend redirige a Google
   └─> Usuario se autentica en Google

3. Google redirige al callback del backend
   └─> Backend valida al usuario con findByEmail
   └─> Backend genera JWT
   └─> Backend establece cookie HttpOnly
   └─> Backend redirige a https://sgmm.portalapps.mx/dashboard

4. Dashboard se carga
   └─> ProtectedRoute ejecuta
   └─> Llama a GET /api/auth/me (con cookie automática)
   └─> Backend valida JWT y retorna datos del usuario
   └─> Frontend muestra "Bienvenido, [Nombre]"
```

---

## ⚠️ Errores Comunes y Soluciones

### Error: "No session token found"

**Causa:** El cliente HTTP no está enviando cookies.

**Solución:** Verificar que tengas `withCredentials: true` en Axios o `credentials: 'include'` en Fetch.

```typescript
// ✅ Correcto
axios.create({ withCredentials: true })

// ❌ Incorrecto
axios.create({ /* sin withCredentials */ })
```

### Error: CORS

**Causa:** El backend no permite peticiones desde tu dominio.

**Solución:** Verificar que el backend tenga configurado:
```
CORS_ORIGIN=https://sgmm.portalapps.mx
```

### Error: Cookie no se establece

**Causa:** Intentando usar HTTP en producción (debe ser HTTPS).

**Solución:** Usar siempre HTTPS en producción.

---

## 🧪 Cómo Probar

### 1. Prueba Manual
```
1. Abre https://sgmm.portalapps.mx/login
2. Clic en "Iniciar Sesión con Google"
3. Autentica con tu cuenta corporativa
4. Deberías ver el dashboard con tu nombre
5. Abre DevTools → Application → Cookies
6. Deberías ver una cookie llamada "session_token"
```

### 2. Prueba de Sesión Expirada
```
1. Inicia sesión normalmente
2. Espera 1 hora (o borra la cookie manualmente)
3. Recarga la página
4. Deberías ser redirigido a /login
```

---

## 📋 Checklist de Implementación

Frontend debe completar:

- [ ] 1. Crear página de login con enlace a `/api/auth/saml/login`
- [ ] 2. Configurar cliente HTTP con `withCredentials: true`
- [ ] 3. Crear hook `useAuth()` que llame a `/api/auth/me`
- [ ] 4. Crear componente `ProtectedRoute`
- [ ] 5. Configurar rutas en `App.tsx`
- [ ] 6. Crear página Dashboard que use `useAuth()`
- [ ] 7. Probar login completo
- [ ] 8. Probar logout
- [ ] 9. Probar sesión expirada
- [ ] 10. Validar en DevTools que la cookie se establece

---

## 🚀 Plan de Acción Inmediato

### Para el Equipo de Frontend:
1. **Leer esta guía completa** ✅
2. **Implementar los 5 pasos** en orden
3. **Instalar dependencias**: `npm install axios @tanstack/react-query react-router-dom`
4. **Copiar y adaptar el código** de ejemplo
5. **Probar localmente** (si tienes backend local)
6. **Coordinar con backend** para despliegue en producción

### Para el Equipo de Backend:
1. **Desplegar última versión** a `https://sgmm.portalapps.mx`
2. **Verificar que `/api/auth/saml/login` responde** (no 404)
3. **Verificar que `/api/auth/me` responde** (no 404)
4. **Verificar CORS** permite peticiones del frontend
5. **Verificar certificados SSL** están configurados

### Prueba E2E (Juntos):
1. Frontend desplegado en producción
2. Backend desplegado en producción
3. Probar flujo completo:
   - Login → Google → Callback → Dashboard
   - Verificar que se ve el nombre del usuario
   - Verificar logout funciona
   - Verificar sesión expirada redirige a login

---

## 📞 Contacto

Si tienes dudas durante la implementación:
- **Backend listo:** Todos los endpoints funcionando y probados
- **Documentación:** Esta guía + `TESTING_REPORT.md`
- **Email:** jonahatan.angeles@segfried.com.mx

---

## ✅ Resumen Ultra-Rápido

```typescript
// 1. Botón de login - SOLO UN ENLACE
<a href="https://sgmm.portalapps.mx/api/auth/saml/login">Login</a>

// 2. Cliente HTTP - CON COOKIES
axios.create({ withCredentials: true })

// 3. Hook de auth - LLAMA A /api/auth/me
const { user, isAuthenticated } = useAuth();

// 4. Route Guard - VERIFICA SESIÓN
if (!isAuthenticated) return <Navigate to="/login" />;

// 5. Dashboard - MUESTRA DATOS
<h1>Bienvenido, {user.full_name}</h1>
```

**¡Eso es todo! Con estos 5 pasos el frontend estará completamente integrado.** 🎉

---

**Estado:** ✅ Backend listo, esperando integración frontend  
**Próximo Paso:** Desplegar backend + Implementar frontend  
**Tiempo Estimado:** 2-4 horas de desarrollo frontend

