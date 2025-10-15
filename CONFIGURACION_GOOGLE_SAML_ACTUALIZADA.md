# 🔧 Configuración Google Workspace SAML - SGMM

## 📋 Información de Nuestra Aplicación

### URLs que Google debe configurar:
```
Entity ID (Identificador): https://sgmm.portalapps.mx/api/auth/saml/metadata
ACS URL (Callback): https://sgmm.portalapps.mx/api/auth/saml/callback
Metadatos: https://sgmm.portalapps.mx/api/auth/saml/metadata
```

### Metadatos SAML (XML):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="https://sgmm.portalapps.mx/api/auth/saml/metadata">
  <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:AssertionConsumerService index="0" Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://sgmm.portalapps.mx/api/auth/saml/callback"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>
```

---

## 🎯 PASOS PARA CONFIGURAR EN GOOGLE WORKSPACE

### 1. Crear Nueva Aplicación SAML

1. **Google Admin Console** → https://admin.google.com
2. **Aplicaciones** → **Aplicaciones web y para dispositivos móviles**
3. **Agregar aplicación** → **Agregar aplicación SAML personalizada**

### 2. Información Básica

**Nombre de la aplicación:**
```
SGMM - Sistema de Gestión de Gastos Médicos Mayores
```

**Descripción:**
```
Sistema de renovación anual de seguros médicos para empleados de Siegfried y Weser.
```

### 3. Descargar Metadatos de Google

En esta pantalla verás:
- **SSO URL**: `https://accounts.google.com/o/saml2/idp?idpid=C03j9v9rv`
- **Entity ID**: (anotar este valor)
- **Certificado**: Descargar el archivo .crt

**GUARDAR ESTOS VALORES** - los necesitaremos para actualizar el backend.

### 4. Detalles del Proveedor de Servicios

**⚠️ CONFIGURAR EXACTAMENTE:**

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

**Opciones adicionales:**
- **Signed Response**: ✅ Activado
- **Name ID Format**: `EMAIL`
- **Name ID**: `Basic Information > Primary email`

### 5. Asignación de Atributos

**⚠️ CRÍTICO - Configurar estos mapeos:**

| Atributo de Google | Nombre del atributo en la aplicación |
|-------------------|--------------------------------------|
| **Primary email** | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress` |
| **First name** | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname` |
| **Last name** | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname` |

### 6. Asignar Usuarios

**⚠️ MUY IMPORTANTE:**

1. Click en la aplicación SAML recién creada
2. **Acceso de usuarios** → **Activado para todos** 
   
   **O si prefieres ser selectivo:**
3. **Activado solo para algunas unidades organizativas**
   - Seleccionar "Tecnología de la Información" o la unidad donde está el usuario
   - **GUARDAR**

### 7. Usuario de Prueba

Asegurar que este usuario tenga acceso:
```
jonahatan.angeles@siegfried.com.mx
```

---

## 🔄 PASO 2B: Si YA existe la aplicación

### Verificar Configuración Existente

1. **Google Admin Console** → **Aplicaciones** → **SGMM** (o nombre similar)
2. **Editar detalles** → **Configuración del proveedor de servicios**
3. **Verificar que coincidan exactamente:**

```
ACS URL: https://sgmm.portalapps.mx/api/auth/saml/callback
Entity ID: https://sgmm.portalapps.mx/api/auth/saml/metadata
```

### Si NO coinciden:
- **Actualizar** con las URLs correctas
- **Guardar** los cambios

### Verificar Asignación de Usuarios

1. **Acceso de usuarios** → Verificar que esté **"Activado para todos"** o que incluya al usuario de prueba
2. Si no está activado, **activar** y **guardar**

---

## 🧪 Prueba Final

1. **Esperar 2-3 minutos** (propagación de cambios)
2. **Abrir ventana incógnito**
3. **Ir a**: `https://sgmm.portalapps.mx`
4. **Click en**: "Iniciar Sesión con Google"
5. **Debería funcionar** sin error 403

---

## 🚨 Si Persiste el Error

### Opción 1: Probar Acceso SAML desde Admin Console

1. **Google Admin Console** → **SGMM**
2. **"PROBAR EL ACCESO DE SAML"** (menú izquierdo)
3. **Seleccionar usuario**: `jonahatan.angeles@siegfried.com.mx`
4. **Click en "PROBAR"**

### Opción 2: Recrear la Aplicación

Si nada funciona:
1. **Eliminar** la app SGMM actual
2. **Crear nueva** desde cero
3. **Usar exactamente** los mismos valores
4. **ACTIVAR para todos** desde el inicio

---

## 📞 Contacto

Si necesitas ayuda adicional, todos los endpoints están funcionando correctamente:
- ✅ Metadatos: https://sgmm.portalapps.mx/api/auth/saml/metadata
- ✅ Login: https://sgmm.portalapps.mx/api/auth/saml/login
- ✅ Callback: https://sgmm.portalapps.mx/api/auth/saml/callback

