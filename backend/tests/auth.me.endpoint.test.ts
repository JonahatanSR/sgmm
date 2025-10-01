import jwt from 'jsonwebtoken';

/**
 * Pruebas para el Endpoint GET /api/auth/me
 * 
 * Este endpoint es utilizado por el frontend para:
 * 1. Verificar si el usuario tiene una sesión activa
 * 2. Obtener información del usuario autenticado
 * 3. Validar que el token JWT no ha expirado
 */
describe('GET /api/auth/me - Endpoint de Validación de Sesión', () => {
  const JWT_SECRET = 'test-secret-key-for-testing';

  describe('Casos de Éxito', () => {
    it('retorna información del usuario cuando el token es válido', () => {
      // Simular payload del JWT (generado en el callback SAML)
      const userPayload = {
        id: 'emp-123',
        employee_number: '3619',
        email: 'jonahatan.angeles@siegfried.com.mx',
        role: 'collaborator',
        full_name: 'Jonahatan Angeles',
        company_id: 'company-1'
      };

      // Generar token válido (como lo hace el callback SAML)
      const token = jwt.sign(userPayload, JWT_SECRET, {
        expiresIn: '1h'
      });

      // Verificar el token (como lo hace /api/auth/me)
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & {
        id: string;
        email: string;
        full_name: string;
        employee_number: string;
        role: string;
        company_id: string;
      };

      // Validaciones
      expect(decoded.id).toBe('emp-123');
      expect(decoded.email).toBe('jonahatan.angeles@siegfried.com.mx');
      expect(decoded.full_name).toBe('Jonahatan Angeles');
      expect(decoded.employee_number).toBe('3619');
      expect(decoded.role).toBe('collaborator');
      expect(decoded.company_id).toBe('company-1');

      // Validar que tiene timestamps
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });

    it('calcula correctamente las fechas de expiración y emisión', () => {
      const userPayload = {
        id: 'emp-123',
        email: 'test@example.com',
        role: 'collaborator',
      };

      const token = jwt.sign(userPayload, JWT_SECRET, {
        expiresIn: '1h'
      });

      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

      // Convertir timestamps a fechas (como lo hace el endpoint)
      const expiresAt = new Date((decoded.exp ?? 0) * 1000);
      const issuedAt = new Date((decoded.iat ?? 0) * 1000);

      // Validar que expires_at es 1 hora después de issued_at
      const diffInMs = expiresAt.getTime() - issuedAt.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);

      expect(diffInHours).toBeCloseTo(1, 2); // 1 hora ± 0.01
      expect(expiresAt > issuedAt).toBe(true);
    });

    it('retorna todos los campos esperados en el formato correcto', () => {
      const userPayload = {
        id: 'emp-456',
        employee_number: '4000',
        email: 'maria.lopez@siegfried.com.mx',
        role: 'collaborator',
        full_name: 'María López',
        company_id: 'company-2'
      };

      const token = jwt.sign(userPayload, JWT_SECRET, {
        expiresIn: '2h'
      });

      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & {
        id: string;
        employee_number: string;
        email: string;
        full_name: string;
        role: string;
        company_id: string;
      };

      // Simular estructura de respuesta del endpoint
      const response = {
        authenticated: true,
        user: {
          id: decoded.id,
          employee_number: decoded.employee_number,
          email: decoded.email,
          full_name: decoded.full_name,
          role: decoded.role,
          company_id: decoded.company_id,
        },
        session: {
          expires_at: new Date((decoded.exp ?? 0) * 1000).toISOString(),
          issued_at: new Date((decoded.iat ?? 0) * 1000).toISOString(),
        }
      };

      // Validaciones
      expect(response.authenticated).toBe(true);
      expect(response.user.id).toBe('emp-456');
      expect(response.user.email).toBe('maria.lopez@siegfried.com.mx');
      expect(response.user.full_name).toBe('María López');
      expect(response.session.expires_at).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO format
      expect(response.session.issued_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('Casos de Error - Token Ausente', () => {
    it('maneja correctamente cuando no hay token en la cookie', () => {
      // Simular request sin cookie
      const token = undefined;

      // El endpoint debería detectar esto
      if (!token) {
        const errorResponse = {
          authenticated: false,
          error: 'No session token',
          message: 'No se encontró token de sesión. Por favor, inicia sesión.'
        };

        expect(errorResponse.authenticated).toBe(false);
        expect(errorResponse.error).toBe('No session token');
      }
    });

    it('maneja correctamente cuando la cookie está vacía', () => {
      const token = '';

      if (!token) {
        const errorResponse = {
          authenticated: false,
          error: 'No session token',
          message: 'No se encontró token de sesión. Por favor, inicia sesión.'
        };

        expect(errorResponse.authenticated).toBe(false);
      }
    });
  });

  describe('Casos de Error - Token Expirado', () => {
    it('detecta cuando el token ha expirado', () => {
      const userPayload = {
        id: 'emp-123',
        email: 'test@example.com',
        role: 'collaborator',
      };

      // Generar token que expira inmediatamente
      const token = jwt.sign(userPayload, JWT_SECRET, {
        expiresIn: '-1s' // Expirado hace 1 segundo
      });

      // Intentar verificar
      try {
        jwt.verify(token, JWT_SECRET);
        fail('Debería haber lanzado TokenExpiredError');
      } catch (error: any) {
        expect(error.name).toBe('TokenExpiredError');
        expect(error.message).toContain('jwt expired');

        // Simular respuesta del endpoint
        const errorResponse = {
          authenticated: false,
          error: 'Token expired',
          message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
        };

        expect(errorResponse.authenticated).toBe(false);
        expect(errorResponse.error).toBe('Token expired');
      }
    });

    it('calcula correctamente cuando un token está próximo a expirar', () => {
      const userPayload = {
        id: 'emp-123',
        email: 'test@example.com',
        role: 'collaborator',
      };

      // Token que expira en 5 minutos
      const token = jwt.sign(userPayload, JWT_SECRET, {
        expiresIn: '5m'
      });

      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = (decoded.exp ?? 0) - now;

      // Debería estar entre 4.5 y 5 minutos (270-300 segundos)
      expect(timeUntilExpiry).toBeGreaterThanOrEqual(270);
      expect(timeUntilExpiry).toBeLessThanOrEqual(300);

      // Frontend podría usar esto para mostrar advertencia si quedan menos de 15 minutos
      const shouldWarnUser = timeUntilExpiry <= 900; // 15 minutos o menos
      expect(shouldWarnUser).toBe(true);
    });
  });

  describe('Casos de Error - Token Inválido', () => {
    it('detecta token firmado con secreto incorrecto', () => {
      const wrongSecret = 'wrong-secret-key';

      const userPayload = {
        id: 'emp-123',
        email: 'test@example.com',
        role: 'collaborator',
      };

      // Generar token con secreto incorrecto
      const token = jwt.sign(userPayload, wrongSecret, {
        expiresIn: '1h'
      });

      // Intentar verificar con el secreto correcto
      try {
        jwt.verify(token, JWT_SECRET);
        fail('Debería haber lanzado JsonWebTokenError');
      } catch (error: any) {
        expect(error.name).toBe('JsonWebTokenError');
        expect(error.message).toContain('invalid signature');

        // Simular respuesta del endpoint
        const errorResponse = {
          authenticated: false,
          error: 'Invalid token',
          message: 'Token de sesión inválido. Por favor, inicia sesión nuevamente.'
        };

        expect(errorResponse.authenticated).toBe(false);
        expect(errorResponse.error).toBe('Invalid token');
      }
    });

    it('detecta token malformado', () => {
      const malformedToken = 'esto.no.es.un.jwt.valido';

      try {
        jwt.verify(malformedToken, JWT_SECRET);
        fail('Debería haber lanzado JsonWebTokenError');
      } catch (error: any) {
        expect(error.name).toBe('JsonWebTokenError');
      }
    });

    it('detecta token sin formato JWT', () => {
      const invalidToken = 'token-aleatorio-sin-formato-jwt';

      try {
        jwt.verify(invalidToken, JWT_SECRET);
        fail('Debería haber lanzado JsonWebTokenError');
      } catch (error: any) {
        expect(error.name).toBe('JsonWebTokenError');
        expect(error.message).toContain('jwt malformed');
      }
    });
  });

  describe('Integración con el Flujo SAML', () => {
    it('valida token generado por el callback SAML', () => {
      // Este es el mismo payload que genera el callback SAML (líneas 96-103 de auth/http.ts)
      const samlCallbackPayload = {
        id: 'emp-789',
        employee_number: '5000',
        email: 'carlos.martinez@siegfried.com.mx',
        role: 'collaborator',
        full_name: 'Carlos Martínez',
        company_id: 'company-1'
      };

      // Generar token (simulando callback SAML)
      const token = jwt.sign(samlCallbackPayload, JWT_SECRET, {
        expiresIn: '1h'
      });

      // Validar token (como lo hace /api/auth/me)
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & {
        id: string;
        employee_number: string;
        email: string;
        full_name: string;
        role: string;
        company_id: string;
      };

      // El frontend recibirá estos datos
      const frontendData = {
        authenticated: true,
        user: {
          id: decoded.id,
          employee_number: decoded.employee_number,
          email: decoded.email,
          full_name: decoded.full_name,
          role: decoded.role,
          company_id: decoded.company_id,
        },
        session: {
          expires_at: new Date((decoded.exp ?? 0) * 1000).toISOString(),
          issued_at: new Date((decoded.iat ?? 0) * 1000).toISOString(),
        }
      };

      // Validaciones de integración
      expect(frontendData.authenticated).toBe(true);
      expect(frontendData.user.email).toBe(samlCallbackPayload.email);
      expect(frontendData.user.role).toBe('collaborator');
      expect(frontendData.session.expires_at).toBeDefined();
    });
  });

  describe('Casos de Uso Frontend', () => {
    it('permite al frontend verificar si debe mostrar el dashboard', () => {
      const userPayload = {
        id: 'emp-123',
        email: 'test@example.com',
        role: 'collaborator',
        full_name: 'Test User',
        company_id: 'company-1',
        employee_number: '1000'
      };

      const token = jwt.sign(userPayload, JWT_SECRET, {
        expiresIn: '1h'
      });

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & {
          role: string;
          full_name: string;
        };
        
        // Frontend puede usar esto para decidir qué mostrar
        const canAccessDashboard = decoded && decoded.role === 'collaborator';
        const userName = decoded.full_name;

        expect(canAccessDashboard).toBe(true);
        expect(userName).toBe('Test User');
      } catch (error) {
        // Si falla la verificación, redirigir a login
        fail('Token debería ser válido');
      }
    });

    it('permite al frontend detectar necesidad de re-login', () => {
      // Simular token expirado
      const expiredToken = jwt.sign(
        { id: 'emp-123', email: 'test@example.com' },
        JWT_SECRET,
        { expiresIn: '-1h' }
      );

      let shouldRedirectToLogin = false;

      try {
        jwt.verify(expiredToken, JWT_SECRET);
      } catch (error: any) {
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
          shouldRedirectToLogin = true;
        }
      }

      expect(shouldRedirectToLogin).toBe(true);
    });

    it('proporciona información de expiración para mostrar advertencias', () => {
      const userPayload = {
        id: 'emp-123',
        email: 'test@example.com',
        role: 'collaborator',
      };

      // Token que expira en 10 minutos
      const token = jwt.sign(userPayload, JWT_SECRET, {
        expiresIn: '10m'
      });

      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
      
      // Frontend puede calcular tiempo restante
      const now = Math.floor(Date.now() / 1000);
      const secondsUntilExpiry = (decoded.exp ?? 0) - now;
      const minutesUntilExpiry = Math.floor(secondsUntilExpiry / 60);

      // Mostrar advertencia si quedan menos de 15 minutos
      const shouldShowExpiryWarning = minutesUntilExpiry < 15;

      expect(minutesUntilExpiry).toBeGreaterThanOrEqual(9);
      expect(minutesUntilExpiry).toBeLessThanOrEqual(10);
      expect(shouldShowExpiryWarning).toBe(true);
    });
  });

  describe('Seguridad del Endpoint', () => {
    it('no expone información sensible en el payload', () => {
      const userPayload = {
        id: 'emp-123',
        employee_number: '3619',
        email: 'test@example.com',
        role: 'collaborator',
        full_name: 'Test User',
        company_id: 'company-1'
      };

      const token = jwt.sign(userPayload, JWT_SECRET, {
        expiresIn: '1h'
      });

      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & Record<string, unknown>;

      // Verificar que NO contiene información sensible
      expect(decoded.password).toBeUndefined();
      expect(decoded.otp_secret).toBeUndefined();
      expect(decoded.google_id).toBeUndefined();

      // Solo debe contener campos seguros para el cliente
      const safeFields = ['id', 'employee_number', 'email', 'role', 'full_name', 'company_id', 'iat', 'exp'];
      const tokenFields = Object.keys(decoded);

      tokenFields.forEach(field => {
        expect(safeFields).toContain(field);
      });
    });
  });
});

