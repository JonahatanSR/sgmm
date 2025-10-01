# 🔍 Diagnóstico: Error Google SAML - app_not_configured_for_user

**Error:** `app_not_configured_for_user - Service is not configured for this user`  
**Estado:** Persiste después de 2 minutos del cambio

---

## ✅ Lo que YA Está Correcto

1. **Backend desplegado** ✅
2. **URLs configuradas en Google** ✅
   - ACS URL: `https://sgmm.portalapps.mx/api/auth/saml/callback`
   - Entity ID: `https://sgmm.portalapps.mx/api/auth/saml/metadata`
3. **Usuario existe en la BD** ✅
   - Email: `jonahatan.angeles@siegfried.com.mx`
   - Status: ACTIVE

---

## 🎯 POSIBLES CAUSAS Y SOLUCIONES

### Causa 1: Propagación de Cambios en Google (Más Probable)

**Problema:** Google Workspace puede tardar entre **5 minutos y 24 horas** en propagar cambios de aplicaciones SAML.

**Solución:**
- Esperar **5-10 minutos** más
- Mientras tanto, hacer el **Test de Acceso SAML**

### Causa 2: Usuario No Tiene Acceso Asignado

**Problema:** La app está activada solo para "Tecnología de la Información" pero el usuario podría no estar correctamente asignado.

**Solución:**
1. Google Admin → **Usuarios**
2. Buscar `jonahatan.angeles@siegfried.com.mx`
3. Verificar **Unidad organizativa** exacta
4. Si no está en "Tecnología de la Información", moverlo ahí
5. O cambiar la app a **"ACTIVADO para todos"**

### Causa 3: Mapeo de Atributos Faltante

**Problema:** Google no está enviando el email en el formato esperado.

**Solución:**
1. En Google Admin → App SGMM → **"Editar detalles"** 
2. Ir a **"Asignación de atributos"**
3. Agregar estos mapeos:

| Atributo de Google | Nombre en app |
|-------------------|---------------|
| **Primary email** | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress` |
| **First name** | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname` |
| **Last name** | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname` |

---

## 🧪 Prueba desde Google Admin Console

Hay una forma de probar directamente desde Google sin esperar:

1. En Google Admin Console
2. Ir a la app **SGMM**
3. Click en **"PROBAR EL ACCESO DE SAML"** (botón del menú izquierdo)
4. Seleccionar tu usuario: `jonahatan.angeles@siegfried.com.mx`
5. Click en **"PROBAR"**

**¿Qué debería pasar?**
- ✅ Si funciona: Te lleva a la aplicación con login exitoso
- ❌ Si falla: Muestra el error específico

---

## 🔄 Solución Alternativa: Recrear la App SAML

Si nada funciona después de 10-15 minutos:

1. **Eliminar** la app SGMM actual
2. **Crear nueva** aplicación SAML desde cero
3. Usar **exactamente** los mismos valores
4. **ACTIVAR para todos** desde el inicio
5. Probar inmediatamente

---

## 📞 ¿Qué Hacer Ahora?

### Opción 1: Esperar 5-10 minutos más
Los cambios de Google pueden tardar

### Opción 2: Activar para TODOS los usuarios
En lugar de solo "Tecnología de la Información"

### Opción 3: Probar Acceso SAML desde Admin Console
Click en "PROBAR EL ACCESO DE SAML" en el menú

---

¿Cuál prefieres intentar?

