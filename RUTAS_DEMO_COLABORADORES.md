# 🎯 **Rutas Demo de Colaboradores - Sistema SGMM**

## ✅ **Rutas Demo Agregadas**

He agregado las rutas demo que faltaban para colaboradores. Ahora tienes disponibles:

### **📋 Rutas Demo de Colaboradores:**

#### **1. Ver Colaborador (Demo)**
```
https://sgmm.portalapps.mx/dev/collaborator/:id
```
- **Descripción:** Ver información completa del colaborador
- **Componente:** `ViewMainCollaborator`
- **Sin autenticación requerida**

#### **2. Editar Colaborador (Demo)**
```
https://sgmm.portalapps.mx/dev/collaborator/:id/edit
```
- **Descripción:** Editar información del colaborador
- **Componente:** `EditCollaborator`
- **Sin autenticación requerida**

## 🆔 **IDs de Colaboradores Disponibles**

### **Empleados Actuales en el Sistema:**

| ID | Nombre | Email | Departamento |
|----|--------|-------|--------------|
| `cmf3e3rbk0007d89x8vy17ejl` | Juan Pérez García | test.employee@siegfried.com.mx | IT |
| `cmf3e3rbk0008d89x8vy17ejm` | Jonahatan Angeles | jonahatan.angeles@siegfried.com.mx | IT |
| `dev-user-001` | Usuario de Desarrollo | dev@sgmm.local | N/A |

## 🔗 **URLs Demo Funcionales**

### **Ver Colaboradores:**
```
# Ver Juan Pérez García
https://sgmm.portalapps.mx/dev/collaborator/cmf3e3rbk0007d89x8vy17ejl

# Ver Jonahatan Angeles (tu usuario SAML)
https://sgmm.portalapps.mx/dev/collaborator/cmf3e3rbk0008d89x8vy17ejm

# Ver Usuario de Desarrollo
https://sgmm.portalapps.mx/dev/collaborator/dev-user-001
```

### **Editar Colaboradores:**
```
# Editar Juan Pérez García
https://sgmm.portalapps.mx/dev/collaborator/cmf3e3rbk0007d89x8vy17ejl/edit

# Editar Jonahatan Angeles
https://sgmm.portalapps.mx/dev/collaborator/cmf3e3rbk0008d89x8vy17ejm/edit

# Editar Usuario de Desarrollo
https://sgmm.portalapps.mx/dev/collaborator/dev-user-001/edit
```

## 🔍 **Sobre el ID Específico**

**ID solicitado:** `cmf3k18rs0007w9it17undwc5`

Este ID específico **no existe actualmente** en el sistema. Los IDs de empleados siguen un patrón específico:

- **Patrón actual:** `cmf3e3rbk0007d89x8vy17ejl`
- **Patrón solicitado:** `cmf3k18rs0007w9it17undwc5`

### **Posibles Explicaciones:**

1. **ID de una versión anterior** del sistema
2. **ID de un empleado eliminado** o inactivo
3. **ID de prueba** que se usaba en desarrollo
4. **ID de otra base de datos** o entorno

## 🛠️ **Para Crear un Empleado con ese ID:**

Si necesitas ese ID específico, podemos:

1. **Crear un empleado de prueba** con ese ID exacto
2. **Modificar el seed** para incluir ese empleado
3. **Crear manualmente** via API

### **Comando para crear empleado de prueba:**
```bash
# Ejemplo de creación via API (requiere autenticación)
curl -X POST "https://sgmm.portalapps.mx/api/employees" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "cmf3k18rs0007w9it17undwc5",
    "employee_number": "DEMO-001",
    "email": "demo@sgmm.local",
    "full_name": "Usuario Demo",
    "company_id": "company-sr-001",
    "status": "ACTIVE"
  }'
```

## 📋 **Rutas Demo Completas Disponibles**

### **Formularios:**
- ✅ `/dev/dependents/new/:employeeId` - Nuevo dependiente
- ✅ `/dev/dependents/:id/edit` - Editar dependiente
- ✅ `/dev/collaborator/:id` - Ver colaborador ⭐ **NUEVO**
- ✅ `/dev/collaborator/:id/edit` - Editar colaborador ⭐ **NUEVO**

### **Administración:**
- ✅ `/dev/admin/audit` - Auditoría
- ✅ `/dev/panel` - Panel RH

### **Páginas Públicas:**
- ✅ `/landing` - Landing page
- ✅ `/login` - Login SAML
- ✅ `/privacy-policy` - Política de privacidad

## 🎉 **¡Rutas Demo Listas!**

Ahora tienes acceso completo a todas las rutas demo, incluyendo las de colaboradores que faltaban. Puedes usar cualquiera de los IDs válidos para probar las funcionalidades.

**¿Necesitas que cree un empleado específico con el ID que mencionaste?** 🤔

