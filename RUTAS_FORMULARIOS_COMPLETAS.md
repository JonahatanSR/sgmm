# 📋 **Rutas de Formularios - Sistema SGMM**

## 🎯 **Resumen de Formularios Disponibles**

### **1. 🔐 Formulario de Login SAML**
- **Ruta Frontend:** `/login`
- **URL Completa:** `https://sgmm.portalapps.mx/login`
- **Componente:** `LoginPage.tsx`
- **Descripción:** Formulario de autenticación con Google SAML
- **Campos:**
  - Botón de login con Google Workspace
  - Información de seguridad
  - Enlace a política de privacidad

### **2. 👥 Formulario de Dependientes**
- **Rutas Frontend:**
  - **Nuevo:** `/dependents/new/:employeeId` (Protegida)
  - **Editar:** `/dependents/:id/edit` (Protegida)
  - **Dev Nuevo:** `/dev/dependents/new/:employeeId` (Sin autenticación)
  - **Dev Editar:** `/dev/dependents/:id/edit` (Sin autenticación)

- **URLs de Ejemplo:**
  ```
  # Producción (requiere autenticación)
  https://sgmm.portalapps.mx/dependents/new/cmf3e3rbk0008d89x8vy17ejm
  
  # Desarrollo (sin autenticación)
  https://sgmm.portalapps.mx/dev/dependents/new/cmf3e3rbk0008d89x8vy17ejm
  ```

- **Componente:** `DependentForm.tsx`
- **Campos del Formulario:**
  - ✅ **Apellido Paterno** (requerido)
  - ✅ **Apellido Materno** (opcional)
  - ✅ **Nombre(s)** (requerido)
  - ✅ **Sexo** (M/F - requerido)
  - ✅ **Fecha de nacimiento** (requerido)
  - ✅ **Parentesco** (dropdown - requerido)
  - ✅ **Fecha de antigüedad** (automática)
  - ✅ **Aviso de privacidad** (checkbox obligatorio)

- **Tipos de Parentesco:**
  1. **Cónyuge** (ID: 1)
  2. **Hijo** (ID: 2)
  3. **Hija** (ID: 3)
  4. **Padre** (ID: 4)
  5. **Madre** (ID: 5)

### **3. ✏️ Formulario de Edición de Colaborador**
- **Rutas Frontend:**
  - **Protegida:** `/collaborator/:id/edit`
  - **Dev:** `/dev/collaborator/:id/edit`

- **URLs de Ejemplo:**
  ```
  # Producción (requiere autenticación)
  https://sgmm.portalapps.mx/collaborator/cmf3e3rbk0008d89x8vy17ejm/edit
  
  # Desarrollo (sin autenticación)
  https://sgmm.portalapps.mx/dev/collaborator/cmf3e3rbk0008d89x8vy17ejm/edit
  ```

- **Componente:** `EditCollaborator.tsx`
- **Campos del Formulario:**
  - ✅ **Apellido Paterno**
  - ✅ **Apellido Materno**
  - ✅ **Nombre(s)**
  - ✅ **Sexo** (M/F)
  - ✅ **Fecha de nacimiento**

## 🔗 **Rutas del Backend (APIs)**

### **Autenticación**
```
GET  /api/auth/me                    - Obtener usuario actual
GET  /api/auth/saml/login            - Iniciar login SAML
POST /api/auth/saml/callback         - Callback SAML
GET  /api/auth/saml/metadata         - Metadata SAML
GET  /api/auth/dev-login             - Login de desarrollo
```

### **Empleados**
```
GET  /api/employees/:id              - Obtener empleado
PUT  /api/employees/:id              - Actualizar empleado
GET  /api/employees/search           - Buscar empleados
```

### **Dependientes**
```
GET  /api/employees/:employeeId/dependents           - Listar dependientes activos
GET  /api/employees/:employeeId/dependents/inactive  - Listar dependientes inactivos
POST /api/employees/:employeeId/dependents           - Crear dependiente
PUT  /api/dependents/:id                             - Actualizar dependiente
DELETE /api/dependents/:id                           - Eliminar dependiente
POST /api/dependents/:id/restore                     - Restaurar dependiente
GET  /api/dependents/:id                             - Obtener dependiente
```

### **Tipos de Parentesco**
```
GET  /api/relationship-types         - Obtener tipos de parentesco
```

## 🆔 **IDs de Empleados Válidos para Pruebas**

### **Empleados Activos en el Sistema:**

| ID | Nombre | Email | Departamento |
|----|--------|-------|--------------|
| `cmf3e3rbk0007d89x8vy17ejl` | Juan Pérez García | test.employee@siegfried.com.mx | IT |
| `cmf3e3rbk0008d89x8vy17ejm` | Jonahatan Angeles | jonahatan.angeles@siegfried.com.mx | IT |
| `dev-user-001` | Usuario de Desarrollo | dev@sgmm.local | N/A |

## 🧪 **URLs de Prueba Funcionales**

### **Formulario de Dependientes:**
```
# Con Juan Pérez García
https://sgmm.portalapps.mx/dev/dependents/new/cmf3e3rbk0007d89x8vy17ejl

# Con Jonahatan Angeles (tu usuario SAML)
https://sgmm.portalapps.mx/dev/dependents/new/cmf3e3rbk0008d89x8vy17ejm

# Usuario de desarrollo
https://sgmm.portalapps.mx/dev/dependents/new/dev-user-001
```

### **Formulario de Edición de Colaborador:**
```
# Editar Jonahatan Angeles
https://sgmm.portalapps.mx/dev/collaborator/cmf3e3rbk0008d89x8vy17ejm/edit
```

### **Otras Páginas:**
```
# Landing page
https://sgmm.portalapps.mx/landing

# Login
https://sgmm.portalapps.mx/login

# Política de privacidad
https://sgmm.portalapps.mx/privacy-policy

# Dashboard (requiere autenticación)
https://sgmm.portalapps.mx/dashboard
```

## 🎯 **Flujo de Uso Recomendado**

### **1. Para Usuarios Nuevos:**
1. Visitar `https://sgmm.portalapps.mx/landing`
2. Hacer clic en "Iniciar Sesión con Google"
3. Autenticarse con cuenta corporativa
4. Ser redirigido automáticamente al dashboard

### **2. Para Agregar Dependientes:**
1. Acceder al dashboard
2. Buscar empleado o ir a `/dependents/new/:employeeId`
3. Llenar formulario de dependiente
4. Marcar checkbox de privacidad
5. Guardar

### **3. Para Desarrollo/Pruebas:**
1. Usar rutas `/dev/*` que no requieren autenticación
2. Usar IDs de empleados válidos de la tabla de arriba
3. Probar formularios sin necesidad de login SAML

## ✅ **Estado de Funcionamiento**

- ✅ **Login SAML:** Funcionando completamente
- ✅ **Formulario de Dependientes:** Funcionando con validaciones
- ✅ **Formulario de Edición:** Funcionando
- ✅ **APIs del Backend:** Todas funcionando
- ✅ **Autenticación:** Protección de rutas funcionando
- ✅ **Rutas de Desarrollo:** Disponibles para pruebas

## 🚀 **¡Sistema Listo para Usar!**

Todos los formularios están funcionando correctamente. Usa las URLs de ejemplo con los IDs válidos para probar el sistema.
