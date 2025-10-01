// Cliente Axios configurado para autenticación con cookies
import axios from 'axios';

// Crear instancia de Axios con configuración para SAML
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://sgmm.portalapps.mx',
  withCredentials: true,  // ⚠️ CRÍTICO: Permite enviar cookies HttpOnly
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si recibimos 401, la sesión expiró
    if (error.response?.status === 401) {
      // La lógica de redirección se maneja en el hook useAuth
      console.log('Session expired or invalid');
    }
    return Promise.reject(error);
  }
);

export default apiClient;

