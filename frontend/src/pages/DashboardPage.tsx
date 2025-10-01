// Página principal del dashboard del usuario autenticado
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/apiClient';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiClient.get('/api/auth/logout');
      // Redirigir al login después del logout
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
      // Redirigir de todas formas
      window.location.href = '/login';
    }
  };

  if (!user) {
    return null; // ProtectedRoute ya maneja esto
  }

  // Calcular tiempo restante de sesión
  const expiresAt = session ? new Date(session.expires_at) : null;
  const now = new Date();
  const minutesLeft = expiresAt ? Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60)) : 0;
  const showWarning = minutesLeft < 15 && minutesLeft > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Bienvenido, {user.full_name}
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium shadow-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Advertencia de sesión próxima a expirar */}
      {showWarning && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 font-medium">
                  Tu sesión expirará en {minutesLeft} minutos. Guarda tu trabajo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Card con información del usuario */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Información del Usuario</h2>
          
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Nombre Completo</dt>
              <dd className="mt-1 text-sm text-gray-900 font-medium">{user.full_name}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Email Corporativo</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Número de Empleado</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{user.employee_number}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">ID de Usuario</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono text-xs">{user.id}</dd>
            </div>

            {session && (
              <>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Sesión Iniciada</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(session.issued_at).toLocaleString('es-MX')}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Sesión Expira</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(session.expires_at).toLocaleString('es-MX')}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Acciones Rápidas</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate(`/collaborator/${user.id}`)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
            >
              <h3 className="font-medium text-gray-900 mb-1">Mi Información</h3>
              <p className="text-sm text-gray-600">Ver y editar mis datos personales</p>
            </button>

            <button
              onClick={() => navigate('/panel')}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
            >
              <h3 className="font-medium text-gray-900 mb-1">Panel RH</h3>
              <p className="text-sm text-gray-600">Acceder al panel administrativo</p>
            </button>

            <button
              onClick={() => navigate('/admin/audit')}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
            >
              <h3 className="font-medium text-gray-900 mb-1">Auditoría</h3>
              <p className="text-sm text-gray-600">Ver registro de cambios</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;

