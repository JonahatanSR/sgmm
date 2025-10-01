# 🔧 Configuración de Google Workspace SAML

**Error Actual:** `app_not_configured_for_user`  
**Causa:** La aplicación SAML no está configurada en Google Workspace  
**Solución:** Configurar o actualizar la aplicación SAML en Google Admin Console

---

## ⚠️ PROBLEMA ACTUAL

### Síntoma
```
Error: app_not_configured_for_user
Service is not configured for this user
```

### Causa
Google Workspace está rechazando la autenticación porque:
1. La aplicación SAML no existe en Google Admin Console
2. O el usuario no tiene acceso asignado
3. O las URLs del callback no coinciden

---

## 🎯 SOLUCIÓN: Configurar Aplicación SAML en Google Workspace

### Prerrequisitos
- ✅ Acceso a Google Admin Console (https://admin.google.com)
- ✅ Permisos de Super Admin
- ✅ Dominio verificado: `siegfried.com.mx` o `weser.com.mx`

---

## 📝 PASO 1: Acceder a Aplicaciones SAML

1. Ir a **Google Admin Console**: https://admin.google.com
2. Menú → **Aplicaciones** → **Aplicaciones web y para dispositivos móviles**
3. Click en **Agregar aplicación** → **Agregar aplicación SAML personalizada**

---

## 📝 PASO 2: Información Básica de la Aplicación

**Nombre de la aplicación:**
```
SGMM - Sistema de Gestión de Gastos Médicos Mayores
```

**Descripción:**
```
Sistema de renovación anual de seguros médicos. Multi-company con gestión de empleados y dependientes.
```

**Icono:** (Opcional) Subir logo de la empresa

Click en **CONTINUAR**

---

## 📝 PASO 3: Descargar Metadatos de Google

En esta pantalla verás:

1. **SSO URL** - Copiar y guardar
2. **Entity ID** - Copiar y guardar
3. **Certificado** - Click en **DESCARGAR CERTIFICADO**

**IMPORTANTE:** Guarda estos valores, los necesitaremos para actualizar el backend.

**Valores actuales en el backend:**
```
SAML_ENTRY_POINT: https://accounts.google.com/o/saml2/idp?idpid=C03j9v9rv
SAML_CERT: -----BEGIN CERTIFICATE-----...
```

Click en **CONTINUAR**

---

## 📝 PASO 4: Detalles del Proveedor de Servicios

### URLs Críticas (copiar exactamente):

**ACS URL (Assertion Consumer Service URL):**
```
https://sgmm.portalapps.mx/api/auth/saml/callback
```

**Entity ID:**
```
https://sgmm.portalapps.mx/api/auth/saml/metadata
```

**Start URL (opcional):**
```
https://sgmm.portalapps.mx/api/auth/saml/login
```

### Opciones Adicionales:

- **Signed Response:** ✅ Activado
- **Name ID Format:** `EMAIL`
- **Name ID:** `Basic Information > Primary email`

Click en **CONTINUAR**

---

## 📝 PASO 5: Asignación de Atributos

**⚠️ CRÍTICO** - Configurar estos mapeos exactamente:

| Atributo de Google | Nombre del atributo en la aplicación |
|-------------------|--------------------------------------|
| **Primary email** | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress` |
| **First name** | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname` |
| **Last name** | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname` |

Click en **FINALIZAR**

---

## 📝 PASO 6: Asignar Usuarios

**⚠️ MUY IMPORTANTE** - Sin esto, nadie podrá acceder.

1. Click en la aplicación SAML recién creada
2. **Acceso de usuarios** → **Activado para todos** 

   O si prefieres ser selectivo:
   
3. **Activado solo para algunas unidades organizativas**
   - Seleccionar unidades organizativas
   - O grupos específicos

4. **GUARDAR**

### Usuarios de Prueba Recomendados:
```
jonahatan.angeles@siegfried.com.mx
```

---

## 📝 PASO 7: Probar la Configuración

1. Esperar 1-2 minutos (propagación de cambios en Google)
2. Abrir nueva ventana incógnito
3. Ir a `https://sgmm.portalapps.mx`
4. Click en "Iniciar Sesión con Google"
5. Autenticarse con cuenta corporativa
6. Debería funcionar ✅

---

## 🔍 Verificación de Configuración Actual

### URLs que Google debe tener configuradas:

```yaml
ACS URL (Callback):
  https://sgmm.portalapps.mx/api/auth/saml/callback

Entity ID:
  https://sgmm.portalapps.mx/api/auth/saml/metadata
  
Start URL:
  https://sgmm.portalapps.mx/api/auth/saml/login
```

### Variables en el Backend (docker-compose.yml):

```yaml
SAML_ENTRY_POINT: https://accounts.google.com/o/saml2/idp?idpid=C03j9v9rv
SAML_ISSUER: https://sgmm-backend.local/api/auth/saml/metadata  ← DEBE COINCIDIR con Entity ID
SAML_CERT: -----BEGIN CERTIFICATE-----...
```

---

## ⚠️ POSIBLE PROBLEMA: Entity ID No Coincide

Veo una inconsistencia:

**Backend tiene:**
```
SAML_ISSUER: https://sgmm-backend.local/api/auth/saml/metadata
```

**Pero debería ser:**
```
SAML_ISSUER: https://sgmm.portalapps.mx/api/auth/saml/metadata
```

---

## 🛠️ Corrección Rápida Necesaria

Necesito actualizar el `SAML_ISSUER` en el backend para que coincida con la URL real.

¿Quieres que:

1. **Actualice el `SAML_ISSUER`** en docker-compose.yml y redepliegue
2. **Te proporcione las instrucciones exactas** para configurar Google Workspace
3. **Ambas cosas**

¿Qué prefieres que haga primero?
