import { Strategy } from '@node-saml/passport-saml';
import { env } from './environment';

/**
 * Configuración de la estrategia SAML para Google Workspace
 * Utiliza @node-saml/passport-saml para la autenticación con Google
 */
export const samlStrategy = new Strategy(
  {
    // URL donde Google enviará la respuesta SAML
    callbackUrl: 'https://sgmm.portalapps.mx/api/auth/saml/callback',
    
    // URL de entrada del proveedor SAML (Google Workspace)
    entryPoint: env.SAML_ENTRY_POINT,
    
    // Identificador único de nuestra aplicación
    issuer: env.SAML_ISSUER,
    
    // Certificado público de Google para verificar las respuestas
    idpCert: env.SAML_CERT,
    
    // Configuraciones adicionales
    wantAssertionsSigned: true,
    wantAuthnResponseSigned: true,
    acceptedClockSkewMs: -1, // No permitir diferencia de tiempo
    disableRequestedAuthnContext: true,
    signatureAlgorithm: 'sha256',
    digestAlgorithm: 'sha256',
  },
  /**
   * Función de callback que se ejecuta después de la autenticación exitosa
   * @param profile - Perfil del usuario obtenido de Google
   * @param done - Función de callback de Passport
   */
  (profile: any, done: (err: any, user?: any, info?: any) => void) => {
    try {
      // Log del perfil recibido para debugging
      console.log('SAML Profile received:', JSON.stringify(profile, null, 2));
      
      // Por ahora, simplemente retornamos el perfil
      // En el siguiente paso, aquí procesaremos el perfil y crearemos/actualizaremos el usuario
      return done(null, profile);
    } catch (error) {
      console.error('Error processing SAML profile:', error);
      return done(error, null);
    }
  },
  // Tercer parámetro opcional para configuración adicional
  {} as any
);

/**
 * Configuración de metadatos SAML para el Service Provider
 * Esta información será necesaria para configurar Google Workspace
 */
export const samlMetadata = {
  // URL donde Google puede encontrar nuestros metadatos
  metadataUrl: `${env.HOST}:${env.PORT}/api/auth/saml/metadata`,
  
  // URL donde Google enviará las respuestas SAML
  callbackUrl: `${env.HOST}:${env.PORT}/api/auth/saml/callback`,
  
  // URL donde Google redirigirá después del logout
  logoutUrl: `${env.HOST}:${env.PORT}/api/auth/logout`,
  
  // Identificador único de nuestro Service Provider
  entityId: env.SAML_ISSUER,
};

/**
 * Mapeo de atributos SAML de Google a nuestros campos de usuario
 * Google envía ciertos atributos estándar que mapearemos a nuestros campos
 */
export const samlAttributeMapping = {
  // Identificador único del usuario en Google
  googleId: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  
  // Email del usuario
  email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  
  // Nombre completo
  fullName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  
  // Nombre
  firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
  
  // Apellido
  lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
  
  // Dominio de la empresa
  domain: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn',
};
