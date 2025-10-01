import { FastifyInstance } from 'fastify';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { samlStrategy } from '../../config/saml';
import { env } from '../../config/environment';
import { getPrismaClient } from '../../config/database';
import { PrismaEmployeeRepository } from '../employees/adapters/prismaEmployeeRepository';

export async function authRoutes(app: FastifyInstance) {
  app.log.info('Registering authentication routes...');

  // 1. Registrar la estrategia SAML directamente con passport
  passport.use('saml', samlStrategy as any);

  // 2. Serializar y deserializar usuario para la sesión
  // Por ahora, solo pasamos el perfil completo.
  passport.serializeUser((user: any, done: any) => {
    app.log.info('Serializing user for session...');
    done(null, user);
  });

  passport.deserializeUser((user: any, done: any) => {
    app.log.info('Deserializing user from session...');
    done(null, user);
  });

  // --- RUTAS DE AUTENTICACIÓN ---

  // Inicia el flujo de login SAML
  app.get('/api/auth/saml/login', async (req: any, reply: any) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('saml', {
        failureRedirect: '/api/auth/login-failed',
        successRedirect: '/',
      })(req.raw, reply.raw, (err: any, user: any, info: any) => {
        if (err) {
          app.log.error('SAML authentication error:', err);
          return reply.redirect('/api/auth/login-failed');
        }
        if (!user) {
          app.log.warn('SAML authentication failed:', info);
          return reply.redirect('/api/auth/login-failed');
        }
        // Si llegamos aquí, la autenticación fue exitosa
        resolve(reply.redirect('/'));
      });
    });
  });

  // Callback que Google llamará tras el login
  app.post('/api/auth/saml/callback', async (req: any, reply: any) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('saml', {
        failureRedirect: '/api/auth/login-failed',
        successRedirect: '/',
      })(req.raw, reply.raw, async (err: any, user: any, info: any) => {
        try {
          if (err) {
            app.log.error('SAML callback error:', err);
            return reply.redirect('/api/auth/login-failed');
          }
          if (!user) {
            app.log.warn('SAML callback failed:', info);
            return reply.redirect('/api/auth/login-failed');
          }
          
          app.log.info('SAML authentication successful for user:', user);
          
          // 1. Extraer el perfil del usuario de la respuesta SAML
          const userProfile = user;
          const email = userProfile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
          
          if (!email) {
            app.log.error('No email found in SAML profile:', userProfile);
            return reply.code(403).send({
              error: 'Usuario no autorizado en el sistema SGMM',
              message: 'Email no encontrado en el perfil de autenticación'
            });
          }
          
          // 2. Buscar usuario en la base de datos
          const prisma = getPrismaClient();
          const employeeRepository = new PrismaEmployeeRepository(prisma);
          const employee = await employeeRepository.findByEmail(email);
          
          // 3. Manejar "Usuario no Encontrado"
          if (!employee) {
            app.log.warn(`Usuario no encontrado en el sistema: ${email}`);
            return reply.code(403).send({
              error: 'Usuario no autorizado en el sistema SGMM',
              message: 'Tu cuenta no está registrada en el sistema'
            });
          }
          
          // 4. Generar Token de Sesión (JWT)
          const jwtPayload = {
            id: employee.id,
            employee_number: employee.employee_number,
            email: employee.email,
            role: 'collaborator',
            full_name: employee.full_name,
            company_id: employee.company_id
          };
          
          const token = jwt.sign(jwtPayload, env.JWT_SECRET, {
            expiresIn: env.JWT_EXPIRES_IN
          } as jwt.SignOptions);
          
          // 5. Establecer Cookie de Sesión
          const frontendUrl = env.FRONTEND_DASHBOARD_URL;
          
          reply.setCookie('session_token', token, {
            httpOnly: true,
            secure: env.isProduction(),
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 1000 // 1 hora en milisegundos
          });
          
          // 6. Redireccionar al Frontend
          const dashboardUrl = `${frontendUrl}/dashboard`;
          app.log.info(`Redirecting user ${email} to dashboard: ${dashboardUrl}`);
          
          resolve(reply.redirect(dashboardUrl));
          
        } catch (error: any) {
          app.log.error('Error processing SAML callback:', error);
          return reply.code(500).send({
            error: 'Error interno del servidor',
            message: 'Ocurrió un error durante la autenticación'
          });
        }
      });
    });
  });

  // Ruta para obtener información del usuario autenticado (usado por frontend)
  app.get('/api/auth/me', async (req: any, reply: any) => {
    try {
      // 1. Extraer token de la cookie
      const token = req.cookies?.session_token;
      
      if (!token) {
        app.log.debug('No session token found in cookies');
        return reply.code(401).send({
          authenticated: false,
          error: 'No session token',
          message: 'No se encontró token de sesión. Por favor, inicia sesión.'
        });
      }

      // 2. Verificar y decodificar el JWT
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        
        app.log.info(`Session validated for user: ${decoded.email}`);
        
        // 3. Retornar datos del usuario
        return {
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
            expires_at: new Date(decoded.exp * 1000).toISOString(),
            issued_at: new Date(decoded.iat * 1000).toISOString(),
          }
        };
      } catch (jwtError: any) {
        // Token inválido o expirado
        if (jwtError.name === 'TokenExpiredError') {
          app.log.warn('Session token expired');
          
          // Limpiar cookie expirada
          reply.clearCookie('session_token');
          
          return reply.code(401).send({
            authenticated: false,
            error: 'Token expired',
            message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
          });
        }
        
        if (jwtError.name === 'JsonWebTokenError') {
          app.log.warn('Invalid session token');
          
          // Limpiar cookie inválida
          reply.clearCookie('session_token');
          
          return reply.code(401).send({
            authenticated: false,
            error: 'Invalid token',
            message: 'Token de sesión inválido. Por favor, inicia sesión nuevamente.'
          });
        }
        
        // Otros errores JWT
        throw jwtError;
      }
    } catch (error: any) {
      app.log.error('Error validating session:', error);
      return reply.code(500).send({
        authenticated: false,
        error: 'Internal server error',
        message: 'Error al validar la sesión'
      });
    }
  });

  // Ruta para verificar el estado de la sesión (deprecated, usar /api/auth/me)
  app.get('/api/auth/status', async (req: any, reply: any) => {
    try {
      // Por ahora, verificar si hay usuario en la sesión
      const user = req.session?.user || null;
      const isAuthenticated = !!user;
      
      return { 
        authenticated: isAuthenticated, 
        user: user,
        message: 'Authentication status endpoint working (deprecated, use /api/auth/me)',
        timestamp: new Date().toISOString(),
      };
        } catch (error: any) {
          app.log.error('Error checking auth status:', error);
          return reply.code(500).send({
            authenticated: false,
            error: 'Failed to check authentication status'
          });
        }
  });

  // Ruta para cerrar sesión
  app.get('/api/auth/logout', async (req: any, reply: any) => {
    try {
      app.log.info('Logout requested');
      
      // Limpiar la sesión
      if (req.session) {
        await req.session.destroy();
      }

      app.log.info('User logged out successfully');

      return reply.send({
        message: 'Logout successful',
        redirectTo: '/login',
        timestamp: new Date().toISOString(),
      });
        } catch (error: any) {
          app.log.error('Error during logout:', error);
          return reply.code(500).send({ error: 'Failed to logout' });
        }
  });

  app.get('/api/auth/login-failed', async (req: any, reply: any) => {
    reply.status(401).send({ message: 'SAML authentication failed.' });
  });

  app.log.info('Authentication routes registered successfully.');
}