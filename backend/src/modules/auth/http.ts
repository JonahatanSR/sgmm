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


  // 1. Registrar la estrategia SAML directamente con passport - TEMPORALMENTE DESHABILITADO PARA DEBUGGING
  // passport.use('saml', samlStrategy as any);

  // 🚪 BYPASS TEMPORAL PARA DESARROLLO
  if (env.DISABLE_AUTH) {
    app.log.warn('⚠️  AUTHENTICATION DISABLED - DEVELOPMENT MODE ONLY');
    
    app.get('/api/auth/bypass', async (req: any, reply: any) => {
      // Crear un usuario mock para desarrollo
      const mockUser = {
        id: 'dev-user-001',
        email: 'dev@sgmm.local',
        full_name: 'Usuario de Desarrollo',
        company_id: 'company-sr-001',
        employee_number: 'DEV-001'
      };
      
      // Generar JWT para el usuario mock
      const token = jwt.sign(
        { 
          userId: mockUser.id, 
          email: mockUser.email,
          companyId: mockUser.company_id 
        },
        env.JWT_SECRET,
        { expiresIn: '24h' } as SignOptions
      );
      
      reply.setCookie('auth_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      });
      
      return reply.redirect('/');
    });
    
    app.get('/api/auth/me', async (req: any, reply: any) => {
      // Usuario mock para desarrollo
      return reply.send({
        id: 'dev-user-001',
        email: 'dev@sgmm.local',
        full_name: 'Usuario de Desarrollo',
        company_id: 'company-sr-001',
        employee_number: 'DEV-001'
      });
    });
  }

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

  // Inicia el flujo de login SAML - IMPLEMENTACIÓN CORRECTA
  app.get('/api/auth/saml/login', async (req: any, reply: any) => {
    console.log('🔐 [SAML LOGIN] Iniciando flujo de autenticación SAML');
    
    try {
      // Generar ID único para la petición SAML
      const requestId = `_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const issueInstant = new Date().toISOString();
      
      // Crear XML SAMLRequest válido
      const samlRequestXml = `<?xml version="1.0" encoding="UTF-8"?>
<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                    ID="${requestId}"
                    Version="2.0"
                    IssueInstant="${issueInstant}"
                    Destination="${env.SAML_ENTRY_POINT}"
                    AssertionConsumerServiceURL="${env.SAML_CALLBACK_URL}">
  <saml:Issuer>${env.SAML_ISSUER}</saml:Issuer>
  <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"
                      AllowCreate="true"/>
</samlp:AuthnRequest>`;

      // Codificar el XML en base64 y URL encode
      const samlRequestEncoded = encodeURIComponent(
        Buffer.from(samlRequestXml).toString('base64')
      );

      // Crear URL de redirección
      const redirectUrl = `${env.SAML_ENTRY_POINT}?SAMLRequest=${samlRequestEncoded}&RelayState=login`;
      
      console.log('🔗 [SAML LOGIN] Redirigiendo a Google SAML');
      console.log('📋 [SAML LOGIN] Request ID:', requestId);
      
      // Redirigir a Google SAML
      return reply.redirect(redirectUrl);
      
    } catch (error: any) {
      console.error('❌ [SAML LOGIN] Error iniciando SAML:', error);
      return reply.status(500).send({
        success: false,
        error: 'Error iniciando autenticación SAML',
        message: error.message
      });
    }
  });


  // Endpoint de metadatos SAML (requerido por Google Workspace)
  app.get('/api/auth/saml/metadata', async (req: any, reply: any) => {
    try {
      // 🔍 LOGS DETALLADOS PARA METADATOS SAML
      console.log('=== SOLICITUD METADATOS SAML ===');
      console.log('🌐 Request URL:', req.url);
      console.log('📋 User-Agent:', req.headers['user-agent']);
      console.log('🌍 IP del cliente:', req.ip);
      console.log('⏰ Timestamp:', new Date().toISOString());
      console.log('🔧 Generando metadatos con:');
      console.log('  - Entity ID:', env.SAML_ISSUER);
      console.log('  - Callback URL:', env.SAML_CALLBACK_URL);
      
      app.log.info('Serving SAML metadata');
      
      // Generar metadatos SAML básicos
      const metadata = `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="${env.SAML_ISSUER}">
  <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:AssertionConsumerService index="0" Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="${env.SAML_CALLBACK_URL}"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;
      
      console.log('✅ Metadatos generados exitosamente');
      console.log('📄 Contenido de metadatos:', metadata);
      console.log('=== FIN SOLICITUD METADATOS SAML ===');
      
      reply.type('application/xml');
      return metadata;
    } catch (error: any) {
      console.error('❌ Error generando metadatos SAML:', error);
      console.error('❌ Stack trace:', error.stack);
      app.log.error('Error generating SAML metadata:', error);
      return reply.code(500).send({
        error: 'Error generating SAML metadata'
      });
    }
  });

  // Endpoint temporal para debugging SAML sin Passport
  app.post('/api/auth/saml/callback-debug', async (req: any, reply: any) => {
    try {
      console.log('🚨 CALLBACK DEBUG EJECUTÁNDOSE - INICIO');
      console.log('🚨 HEADERS:', JSON.stringify(req.headers, null, 2));
      console.log('🚨 BODY:', JSON.stringify(req.body, null, 2));
      console.log('🚨 URL:', req.url);
      console.log('🚨 METHOD:', req.method);
      
      return reply.send({
        success: true,
        message: 'Callback debug recibido correctamente',
        headers: req.headers,
        body: req.body,
        url: req.url,
        method: req.method
      });
    } catch (error: any) {
      console.error('🚨 ERROR EN CALLBACK DEBUG:', error);
      return reply.code(500).send({
        error: 'Error en callback debug',
        message: error.message
      });
    }
  });

  // Callback que Google llamará tras el login - IMPLEMENTACIÓN COMPLETA
  app.post('/api/auth/saml/callback', async (req: any, reply: any) => {
    console.log('🔐 [SAML CALLBACK] Iniciando procesamiento de callback SAML');

    try {
      // 1. Extraer datos de la petición
      const { SAMLResponse, RelayState } = req.body;
      
      console.log('📋 [SAML CALLBACK] Datos recibidos:', {
        hasSamlResponse: !!SAMLResponse,
        relayState: RelayState,
        contentLength: req.headers['content-length']
      });

      // 2. Validar que tenemos la respuesta SAML
      if (!SAMLResponse) {
        console.error('❌ [SAML CALLBACK] No se recibió SAMLResponse');
        return reply.status(400).send({
          success: false,
          error: 'No se recibió respuesta SAML válida'
        });
      }

      // 3. Procesar la autenticación SAML
      const { samlAuthService } = await import('./services/samlAuthService');
      const authResult = await samlAuthService.authenticateUser(SAMLResponse, RelayState);

      // 4. Manejar resultado de la autenticación
      if (!authResult.success) {
        console.error('❌ [SAML CALLBACK] Error en autenticación:', authResult.error);
        return reply.status(401).send({
          success: false,
          error: authResult.error || 'Error de autenticación'
        });
      }

      // 5. Establecer cookie de sesión correctamente
      reply.cookie('session_token', authResult.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
        path: '/',
        domain: '.portalapps.mx' // Dominio para que funcione en subdominios
      });

      console.log('✅ [SAML CALLBACK] Autenticación exitosa:', {
        userId: authResult.user?.id,
        email: authResult.user?.email,
        companyId: authResult.user?.company_id
      });

      // 6. Redirigir directamente a la vista del colaborador usando employee_number
      console.log('✅ [SAML CALLBACK] Redirigiendo directamente al colaborador');
      return reply.redirect(`/collaborator/${authResult.user?.id}`);

    } catch (error: any) {
      console.error('💥 [SAML CALLBACK] Error inesperado:', error);
      return reply.status(500).send({
        success: false,
        error: 'Error interno del servidor'
      });
    }
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