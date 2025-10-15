// Página principal del sistema SGMM
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirigir automáticamente según el estado de autenticación
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user?.id) {
        // Si está autenticado, ir a la vista del colaborador (página principal)
        navigate(`/collaborator/${user.id}`, { replace: true });
      } else {
        // Si no está autenticado, ir al login
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate, user?.id]);

  // Mostrar loading mientras se verifica la autenticación
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">SGMM</h2>
        <p className="text-gray-600">Cargando sistema...</p>
      </div>
    </div>
  );
};

export default HomePage;
