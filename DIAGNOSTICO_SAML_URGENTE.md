# 🚨 DIAGNÓSTICO URGENTE: Problema SAML - Bucle de Autenticación

**Fecha:** 14 de Octubre, 2025  
**Usuario Afectado:** `jonahatan.angeles@siegfried.com.mx`  
**Problema:** Bucle de autenticación - Google envía respuesta SAML válida pero SGMM redirige de vuelta a Google

---

## ✅ **ESTADO ACTUAL VERIFICADO**

### **1. Configuración del Sistema SGMM**
- ✅ **Backend funcionando:** Puerto 3000 activo y saludable
- ✅ **Base de datos:** Usuario `jonahatan.angeles@siegfried.com.mx` existe y está ACTIVE
- ✅ **Endpoints SAML:** Funcionando correctamente
  - `/api/auth/saml/metadata` → Responde XML válido
  - `/api/auth/saml/login` → Redirige correctamente a Google
  - `/api/auth/saml/callback` → Configurado para recibir respuesta

### **2. URLs Configuradas (CORREGIDAS)**
- ✅ **Entity ID:** `https://sgmm.portalapps.mx/api/auth/saml/metadata`
- ✅ **ACS URL:** `https://sgmm.portalapps.mx/api/auth/saml/callback`
- ✅ **Metadatos:** Generando URL correcta del callback

### **3. Usuario en Base de Datos**
```sql
SELECT email, full_name, status FROM employees WHERE email = 'jonahatan.angeles@siegfried.com.mx';
-- Resultado: jonahatan.angeles@siegfried.com.mx | Jonahatan Angeles | ACTIVE
```

---

## 🔍 **POSIBLES CAUSAS DEL BUCLE**

### **Causa 1: Configuración de Certificados SAML**
**Problema:** El certificado de Google puede no estar configurado correctamente o puede haber cambiado.

**Verificación:**
```bash
# Verificar variable de entorno del certificado
echo $SAML_CERT
```

**Solución:**
1. Solicitar certificado actualizado de Google Workspace
2. Verificar que el certificado no haya expirado
3. Confirmar que el formato del certificado es correcto

### **Causa 2: Validación de Firma SAML**
**Problema:** La configuración actual requiere firmas estrictas que pueden estar fallando.

**Configuración actual:**
```typescript
wantAssertionsSigned: true,
wantAuthnResponseSigned: true,
acceptedClockSkewMs: -1, // Sin tolerancia de tiempo
```

**Solución temporal:**
```typescript
acceptedClockSkewMs: 30000, // 30 segundos de tolerancia
```

### **Causa 3: Mapeo de Atributos Incorrecto**
**Problema:** Google puede estar enviando atributos en formato diferente al esperado.

**Atributos esperados:**
- `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress`
- `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name`

**Solución:** Agregar logs detallados para ver qué atributos está enviando Google.

### **Causa 4: Configuración de Dominio en Google**
**Problema:** El usuario puede no estar en la unidad organizativa correcta o la app puede no estar habilitada para todos.

---

## 🛠️ **PLAN DE ACCIÓN INMEDIATO**

### **Paso 1: Habilitar Logs Detallados SAML**
Agregar logs más específicos en el callback para capturar exactamente qué está recibiendo el sistema.

### **Paso 2: Verificar Certificado SAML**
Solicitar certificado actualizado de Google y verificar su validez.

### **Paso 3: Ajustar Tolerancia de Tiempo**
Permitir cierta tolerancia en la validación de tiempo para evitar problemas de sincronización.

### **Paso 4: Probar con Usuario de Desarrollo**
Crear un usuario de prueba para aislar el problema.

---

## 📋 **INFORMACIÓN PARA GOOGLE ADMIN**

### **Configuración Actual en SGMM:**
- **Entity ID:** `https://sgmm.portalapps.mx/api/auth/saml/metadata`
- **ACS URL:** `https://sgmm.portalapps.mx/api/auth/saml/callback`
- **Formato NameID:** `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress`

### **Atributos Requeridos:**
1. **Email:** `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress`
2. **Nombre:** `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name`
3. **Nombre ID:** `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier`

### **Recomendaciones para Google Admin:**
1. **Verificar que la app esté habilitada para TODOS los usuarios** (no solo "Tecnología de la Información")
2. **Confirmar que el usuario esté en la unidad organizativa correcta**
3. **Verificar que los atributos estén mapeados correctamente**
4. **Probar el acceso SAML desde el Admin Console**

---

## 🧪 **PRUEBAS RECOMENDADAS**

### **Prueba 1: Test de Acceso SAML desde Google Admin**
1. Google Admin Console → Apps → SGMM
2. Click en "PROBAR EL ACCESO DE SAML"
3. Seleccionar usuario: `jonahatan.angeles@siegfried.com.mx`
4. Analizar resultado

### **Prueba 2: Logs en Tiempo Real**
Monitorear logs del backend durante un intento de login:
```bash
docker-compose logs -f backend
```

### **Prueba 3: Verificar Metadatos**
Confirmar que Google esté usando los metadatos actualizados:
```bash
curl -s https://sgmm.portalapps.mx/api/auth/saml/metadata
```

---

## 📞 **PRÓXIMOS PASOS**

1. **Inmediato:** Solicitar certificado actualizado de Google
2. **En 5 minutos:** Habilitar logs detallados SAML
3. **En 10 minutos:** Ajustar tolerancia de tiempo
4. **En 15 minutos:** Probar con usuario de desarrollo
5. **En 20 minutos:** Coordinar prueba en tiempo real con Google Admin

---

**Contacto:** Equipo de Desarrollo SGMM  
**Prioridad:** CRÍTICA - Bloquea acceso de usuario  
**Tiempo estimado de resolución:** 30-60 minutos
