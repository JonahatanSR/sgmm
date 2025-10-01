// Componente que protege rutas requiriendo autenticación
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute Component
 * 
 * Envuelve rutas que requieren autenticación.
 * - Si el usuario está autenticado: Renderiza el contenido (Outlet)
 * - Si no está autenticado: Redirige a /login
 * - Mientras carga: Muestra spinner
 */
export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading mientras verifica la sesión
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderizar rutas hijas
  return <Outlet />;
};

