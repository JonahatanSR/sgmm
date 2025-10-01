// Tipos para el sistema de autenticación SAML

export interface User {
  id: string;
  employee_number: string;
  email: string;
  full_name: string;
  company_id: string;
  role: string;
}

export interface Session {
  expires_at: string;
  issued_at: string;
}

export interface AuthResponse {
  authenticated: boolean;
  user?: User;
  session?: Session;
  error?: string;
  message?: string;
}

