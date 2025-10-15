# 🔐 Implementación SAML - Sistema SGMM

## 📋 Resumen

Este documento describe la implementación completa del sistema de autenticación SAML para el Sistema de Gestión de Gastos Médicos Mayores (SGMM), integrado con Google Workspace.

## 🏗️ Arquitectura

### Principios de Diseño

La implementación sigue los principios SOLID y arquitectura limpia:

- **Single Responsibility**: Cada servicio tiene una responsabilidad específica
- **Open/Closed**: Extensible para otros proveedores SAML
- **Liskov Substitution**: Interfaces claras y consistentes
- **Interface Segregation**: Interfaces específicas y cohesivas
- **Dependency Inversion**: Dependencias hacia abstracciones

### Componentes Principales

```
src/modules/auth/
├── services/
│   ├── samlProcessor.ts      # Procesamiento de respuestas SAML
│   └── samlAuthService.ts    # Lógica de autenticación
├── http.ts                   # Rutas HTTP
└── config/
    └── saml.ts              # Configuración SAML
```

## 🔧 Configuración

### Variables de Entorno

```bash
# Configuración SAML
SAML_ENTRY_POINT=https://accounts.google.com/o/saml2/idp?idpid=C03j9v9rv
SAML_CALLBACK_URL=https://sgmm.portalapps.mx/api/auth/saml/callback
SAML_ISSUER=https://sgmm.portalapps.mx/api/auth/saml/metadata
SAML_CERT=<certificado_google>
JWT_SECRET=<secreto_jwt>
```

### Configuración en Google Workspace

1. **Entity ID**: `https://sgmm.portalapps.mx/api/auth/saml/metadata`
2. **ACS URL**: `https://sgmm.portalapps.mx/api/auth/saml/callback`
3. **Name ID Format**: `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress`

## 🚀 Flujo de Autenticación

### 1. Inicio de Login

```http
GET /api/auth/saml/login
```

- Redirige al usuario a Google Workspace
- Configura el estado de retorno (RelayState)

### 2. Callback de Google

```http
POST /api/auth/saml/callback
Content-Type: application/x-www-form-urlencoded

SAMLResponse=<base64_encoded_response>
RelayState=<return_url>
```

### 3. Procesamiento

1. **Decodificación**: Convierte la respuesta base64 a XML
2. **Parsing**: Extrae datos del usuario del XML SAML
3. **Validación**: Verifica la estructura y firma
4. **Mapeo**: Convierte atributos SAML a modelo de usuario
5. **Persistencia**: Crea/actualiza usuario en base de datos
6. **Sesión**: Genera JWT y establece cookie

## 📊 Estructura de Datos

### Respuesta SAML de Google

```xml
<saml2p:Response>
  <saml2:Assertion>
    <saml2:Subject>
      <saml2:NameID>usuario@empresa.com</saml2:NameID>
    </saml2:Subject>
    <saml2:AttributeStatement>
      <saml2:Attribute Name="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress">
        <saml2:AttributeValue>usuario@empresa.com</saml2:AttributeValue>
      </saml2:Attribute>
      <saml2:Attribute Name="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname">
        <saml2:AttributeValue>Nombre</saml2:AttributeValue>
      </saml2:Attribute>
      <saml2:Attribute Name="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname">
        <saml2:AttributeValue>Apellido</saml2:AttributeValue>
      </saml2:Attribute>
    </saml2:AttributeStatement>
  </saml2:Assertion>
</saml2p:Response>
```

### Mapeo de Atributos

| Atributo SAML | Campo Usuario | Descripción |
|---------------|---------------|-------------|
| `emailaddress` | `email` | Email del usuario |
| `givenname` | `firstName` | Nombre |
| `surname` | `lastName` | Apellido |
| `name` | `fullName` | Nombre completo |
| `upn` | `domain` | Dominio de empresa |

## 🔒 Seguridad

### Validaciones Implementadas

1. **Firma Digital**: Verificación de la firma de Google
2. **Timestamps**: Validación de `NotBefore` y `NotOnOrAfter`
3. **Audiencia**: Verificación del destinatario
4. **Dominio**: Validación de dominios autorizados
5. **JWT**: Tokens firmados con expiración

### Configuración de Seguridad

```typescript
// Configuración SAML
{
  wantAssertionsSigned: true,
  wantAuthnResponseSigned: true,
  acceptedClockSkewMs: 30000,
  signatureAlgorithm: 'sha256',
  digestAlgorithm: 'sha256'
}
```

## 🧪 Testing

### Pruebas Unitarias

```bash
# Ejecutar tests
npm test -- --grep "SAML"

# Tests específicos
npm test tests/auth.saml.integration.test.ts
```

### Pruebas de Integración

1. **Flujo Completo**: Login → Google → Callback → Sesión
2. **Datos de Usuario**: Verificación de mapeo correcto
3. **Seguridad**: Validación de firmas y timestamps
4. **Errores**: Manejo de respuestas inválidas

## 📝 Logs y Monitoreo

### Logs Estructurados

```typescript
console.log('🔐 [SAML AUTH] Iniciando autenticación SAML');
console.log('✅ [SAML AUTH] Usuario procesado:', userData);
console.log('❌ [SAML AUTH] Error en autenticación:', error);
```

### Métricas Importantes

- Tiempo de procesamiento SAML
- Tasa de éxito de autenticación
- Errores por tipo
- Usuarios únicos por dominio

## 🔄 Mantenimiento

### Actualizaciones

1. **Certificados**: Renovación anual de certificados Google
2. **Dependencias**: Actualización de librerías SAML
3. **Configuración**: Ajustes de seguridad según mejores prácticas

### Troubleshooting

#### Problemas Comunes

1. **Error de Firma**: Verificar certificado de Google
2. **Timeout**: Ajustar `acceptedClockSkewMs`
3. **Dominio**: Validar configuración de dominios autorizados

#### Logs de Debug

```bash
# Ver logs en tiempo real
docker-compose logs -f backend

# Filtrar logs SAML
docker-compose logs backend | grep "SAML"
```

## 📚 Referencias

- [SAML 2.0 Specification](https://docs.oasis-open.org/security/saml/v2.0/)
- [Google Workspace SAML](https://support.google.com/a/answer/6081169)
- [Passport SAML Strategy](https://github.com/node-saml/passport-saml)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

## 🚀 Despliegue

### Comandos de Despliegue

```bash
# Construir imagen
docker-compose build backend

# Desplegar servicios
docker-compose up -d

# Verificar estado
docker-compose ps
```

### Verificación Post-Despliegue

1. **Health Check**: `GET /health`
2. **Metadatos SAML**: `GET /api/auth/saml/metadata`
3. **Login SAML**: `GET /api/auth/saml/login`
4. **Callback**: Probar flujo completo

---

**Versión**: 1.0.0  
**Última Actualización**: 2025-10-14  
**Autor**: Sistema SGMM  
**Estado**: ✅ Implementado y Documentado
