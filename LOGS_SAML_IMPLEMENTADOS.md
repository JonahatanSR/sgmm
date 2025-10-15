# Logs SAML Implementados para Diagnóstico

## 📋 Resumen

Se han agregado logs detallados en todo el flujo SAML para facilitar el diagnóstico del problema de autenticación. Los logs están diseñados para capturar cada paso del proceso de autenticación SAML.

## 🔍 Logs Implementados

### 1. **Endpoint de Login SAML** (`/api/auth/saml/login`)

**Ubicación**: `backend/src/modules/auth/http.ts` (líneas 78-117)

**Logs agregados**:
- 🌐 URL de la solicitud
- 📋 Headers completos de la solicitud
- 🔗 User-Agent del cliente
- 🌍 IP del cliente
- ⏰ Timestamp de la solicitud
- 🔧 Configuración SAML actual (Entry Point, Issuer, Callback URL)
- ✅/❌ Resultado de la autenticación
- 🔄 Redirecciones aplicadas

### 2. **Endpoint de Metadatos SAML** (`/api/auth/saml/metadata`)

**Ubicación**: `backend/src/modules/auth/http.ts` (líneas 120-156)

**Logs agregados**:
- 🌐 URL de la solicitud
- 📋 User-Agent del cliente
- 🌍 IP del cliente
- ⏰ Timestamp de la solicitud
- 🔧 Configuración utilizada para generar metadatos
- 📄 Contenido completo de los metadatos generados
- ✅/❌ Resultado de la generación

### 3. **Callback SAML** (`/api/auth/saml/callback`)

**Ubicación**: `backend/src/modules/auth/http.ts` (líneas 159-250+)

**Logs agregados**:
- 🔍 Confirmación de recepción del callback
- 📋 Headers completos de la respuesta SAML
- 📝 Claves del body de la solicitud
- 🔍 Errores de autenticación SAML
- 👤 Datos del usuario recibidos de Google
- 📧 Email extraído del perfil SAML
- 👤 Resultado de búsqueda en base de datos
- 📋 Datos del empleado encontrado
- ✅/❌ Resultado final del proceso

### 4. **Procesamiento del Perfil SAML**

**Ubicación**: `backend/src/config/saml.ts` (líneas 38-58)

**Logs agregados**:
- 📋 Perfil completo recibido de Google
- 📧 Email extraído del perfil
- 🆔 NameID del usuario
- 🏢 Dominio de la empresa
- 👤 Nombre completo del usuario
- ⏰ Timestamp del procesamiento
- ❌ Errores y stack traces detallados

## 🚀 Cómo Usar los Logs

### 1. **Monitorear en Tiempo Real**
```bash
cd /home/gcloud/proyecto_sgmm
docker-compose logs -f backend
```

### 2. **Buscar Logs Específicos**
```bash
# Buscar logs de login SAML
docker-compose logs backend | grep "INICIO LOGIN SAML"

# Buscar logs de callback SAML
docker-compose logs backend | grep "SAML Callback recibido"

# Buscar logs de metadatos
docker-compose logs backend | grep "SOLICITUD METADATOS SAML"
```

### 3. **Logs por Timestamp**
Los logs incluyen timestamps para facilitar el seguimiento temporal del flujo.

## 📊 Información Capturada

### **Datos del Cliente**
- IP del cliente
- User-Agent
- Headers HTTP completos
- URL de la solicitud

### **Configuración SAML**
- Entry Point (Google)
- Issuer (SGMM)
- Callback URL
- Certificados utilizados

### **Datos del Usuario**
- Email del usuario
- NameID
- Dominio de la empresa
- Nombre completo
- Estado en base de datos

### **Errores Detallados**
- Mensajes de error específicos
- Stack traces completos
- Información de contexto

## 🎯 Próximos Pasos

1. **Realizar una prueba de login SAML** mientras se monitorean los logs
2. **Identificar el punto exacto donde falla** el flujo de autenticación
3. **Analizar los logs** para determinar la causa raíz del problema
4. **Aplicar la solución específica** basada en los hallazgos

## 📝 Notas Importantes

- Los logs están diseñados para ser **detallados pero legibles**
- Incluyen **emojis** para facilitar la identificación visual
- Todos los logs incluyen **timestamps** para seguimiento temporal
- Los **errores** incluyen stack traces completos para debugging
- Los logs están **optimizados** para no afectar el rendimiento del sistema

---

**Fecha de implementación**: 14 de Octubre, 2025  
**Estado**: ✅ Implementado y activo  
**Backend**: Reiniciado y funcionando correctamente
