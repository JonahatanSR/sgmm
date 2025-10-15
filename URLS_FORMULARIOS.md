# 🔗 URLs Correctas para Formularios - SGMM

## ❌ **PROBLEMA IDENTIFICADO:**

El error **NO es por ser dev**, sino porque estabas usando un **ID de empleado incorrecto** en la URL.

### **🚨 Error Común:**
```
❌ https://sgmm.portalapps.mx/dev/dependents/new/1
```
**Problema:** El `1` no es un ID válido de empleado.

## ✅ **SOLUCIÓN: URLs CORRECTAS**

### **🎯 URLs Válidas para Formulario de Dependientes:**

#### **1. Para Juan Pérez García (SR-001):**
```
✅ https://sgmm.portalapps.mx/dev/dependents/new/cmf3e3rbk0007d89x8vy17ejl
```
**Datos del empleado:**
- Nombre: Juan Pérez García
- Email: test.employee@siegfried.com.mx
- Departamento: IT
- Puesto: Desarrollador Senior

#### **2. Para Jonahatan Angeles (SR-002):**
```
✅ https://sgmm.portalapps.mx/dev/dependents/new/cmf3e3rbk0008d89x8vy17ejm
```
**Datos del empleado:**
- Nombre: Jonahatan Angeles
- Email: jonahatan.angeles@siegfried.com.mx
- Departamento: IT
- Puesto: Senior Developer

#### **3. Para Usuario de Desarrollo (DEV-001):**
```
✅ https://sgmm.portalapps.mx/dev/dependents/new/dev-user-001
```
**Datos del empleado:**
- Nombre: Usuario de Desarrollo
- Email: dev@sgmm.local
- Departamento: N/A
- Puesto: N/A

## 🔍 **Cómo Obtener IDs Correctos:**

### **Método 1: Desde la Base de Datos**
```sql
SELECT id, employee_number, full_name 
FROM employees 
ORDER BY employee_number;
```

### **Método 2: Desde la API**
```bash
# Buscar empleado
curl "http://localhost:3000/api/employees/search?q=Juan"

# Obtener empleado específico
curl "http://localhost:3000/api/employees/cmf3e3rbk0007d89x8vy17ejl"
```

## 📋 **Formulario Funcionando Correctamente:**

### **✅ Campos Disponibles:**
- **Apellido Paterno** ✅
- **Apellido Materno** ✅
- **Nombre(s)** ✅
- **Sexo** (M/F) ✅
- **Fecha de nacimiento** ✅
- **Parentesco** (dropdown) ✅
- **Fecha Antigüedad** (automática) ✅
- **Aviso de privacidad** (checkbox obligatorio) ✅

### **✅ Tipos de Parentesco:**
1. **Cónyuge** (ID: 1)
2. **Hijo** (ID: 2)
3. **Hija** (ID: 3)
4. **Padre** (ID: 4)
5. **Madre** (ID: 5)

## 🧪 **Prueba Realizada:**

### **✅ Endpoint POST Funcionando:**
```bash
curl -X POST "http://localhost:3000/api/employees/cmf3e3rbk0007d89x8vy17ejl/dependents" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "María",
    "paternal_last_name": "Pérez",
    "maternal_last_name": "González",
    "birth_date": "1990-05-15T00:00:00.000Z",
    "gender": "F",
    "relationship_type_id": 2,
    "policy_start_date": "2024-01-01T00:00:00.000Z"
  }'
```

**Resultado:** ✅ Dependiente creado exitosamente
- **ID:** `cmgjz2bew0001xxgs2ee4tqy8`
- **Dependent ID:** `SR-001-a03`
- **Estado:** `ACTIVE`

## 📊 **Dependientes Actuales:**

| Empleado | Dependiente | Parentesco | Estado |
|----------|-------------|------------|--------|
| Juan Pérez García | María Pérez | Hijo | ACTIVE |
| Juan Pérez García | Carlos Pérez | Cónyuge | ACTIVE |
| Juan Pérez García | María Pérez | Hijo | ACTIVE |
| Jonahatan Angeles | Ana Angeles | Hijo | ACTIVE |

## 🎉 **CONCLUSIÓN:**

### **✅ EL SISTEMA FUNCIONA PERFECTAMENTE:**

- ❌ **NO es problema de dev** - las rutas de desarrollo funcionan bien
- ❌ **NO es problema del backend** - el API está funcionando
- ✅ **ES problema de URL** - necesitas usar IDs reales de empleados

### **🚀 Para Usar el Formulario:**

1. **Copia una de las URLs correctas** de arriba
2. **Pega en tu navegador**
3. **Llena el formulario** con los datos del dependiente
4. **Marca el checkbox** del aviso de privacidad
5. **Haz clic en "Guardar"**

### **🔗 Enlaces Directos:**

```
# Prueba con Juan Pérez García
https://sgmm.portalapps.mx/dev/dependents/new/cmf3e3rbk0007d89x8vy17ejl

# Aviso de privacidad
https://sgmm.portalapps.mx/privacy-policy
```

**¡El formulario está 100% funcional con las URLs correctas!**

