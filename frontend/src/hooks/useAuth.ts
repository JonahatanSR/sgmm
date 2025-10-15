// Hook para manejar la autenticación del usuario
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import type { AuthResponse, User, Session } from '../types/auth';

/**
 * Obtiene la información del usuario autenticado desde /api/auth/me
 */
async function fetchCurrentUser(): Promise<AuthResponse> {
  const { data } = await apiClient.get<AuthResponse>('/api/auth/me');
  return data;
}

/**
 * Hook useAuth
 * 
 * Verifica la sesión del usuario y retorna su información.
 * Automáticamente envía la cookie session_token gracias a withCredentials.
 * 
 * @returns {Object} - Estado de autenticación y datos del usuario
 */
export const useAuth = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AuthResponse>({
    queryKey: ['auth', 'me'],
    queryFn: fetchCurrentUser,
    retry: false,  // No reintentar si falla (probablemente sin sesión)
    refetchOnWindowFocus: false,  // No refetch automático al enfocar ventana
    staleTime: 0,
    gcTime: 0,
  });

  return {
    user: data?.user as User | undefined,
    session: data?.session as Session | undefined,
    isAuthenticated: data?.authenticated ?? false,
    isLoading,
    isError,
    error,
    refetch,
  };
};

