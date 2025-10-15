# 📋 ANÁLISIS DE REQUERIMIENTOS - GENERACIÓN DE PDFs

## 🎯 OBJETIVO
Documentar los requerimientos específicos para la generación de PDFs del sistema SGMM, basado en las fuentes de verdad del proyecto.

---

## 📊 REQUERIMIENTOS DEL PDF

### **Información del Colaborador (Titular)**
Basado en `DATA_DICTIONARY.md` - Tabla EMPLOYEES (líneas 69-118):

| Campo | Descripción | Ejemplo | Fuente BD |
|-------|-------------|---------|-----------|
| `employee_number` | Número de empleado | `3619` | `employees.employee_number` |
| `full_name` | Nombre completo | `Jonahatan Angeles Rosas` | `employees.full_name` |
| `first_name` | Nombre(s) | `Jonahatan` | `employees.first_name` |
| `paternal_last_name` | Apellido paterno | `Angeles` | `employees.paternal_last_name` |
| `maternal_last_name` | Apellido materno | `Rosas` | `employees.maternal_last_name` |
| `email` | Email corporativo | `jonahatan.angeles@siegfried.com.mx` | `employees.email` |
| `birth_date` | Fecha de nacimiento | `1990-05-20` | `employees.birth_date` |
| `gender` | Sexo | `M` | `employees.gender` |
| `hire_date` | Fecha de ingreso | `2020-01-15` | `employees.hire_date` |
| `department` | Departamento | `Tecnología` | `employees.department` |
| `position` | Posición | `Desarrollador Senior` | `employees.position` |
| `policy_number` | Número de póliza | `POL-2025-3619` | `employees.policy_number` |

### **Información de la Compañía**
Basado en `DATA_DICTIONARY.md` - Tabla COMPANIES (líneas 28-67):

| Campo | Descripción | Ejemplo | Fuente BD |
|-------|-------------|---------|-----------|
| `company_name` | Nombre de la compañía | `Siegfried Rhein` | `companies.name` |
| `company_code` | Código de la compañía | `SR` | `companies.code` |
| `logo_url` | URL del logo | `https://drive.google.com/...` | `companies.logo_url` |

### **Información de Dependientes**
Basado en `DATA_DICTIONARY.md` - Tabla DEPENDENTS (líneas 120-162):

| Campo | Descripción | Ejemplo | Fuente BD |
|-------|-------------|---------|-----------|
| `dependent_id` | ID del dependiente | `3619-a01` | `dependents.id` |
| `dependent_seq` | Secuencia | `1` | `dependents.dependent_seq` |
| `first_name` | Nombre(s) | `María` | `dependents.first_name` |
| `paternal_last_name` | Apellido paterno | `Angeles` | `dependents.paternal_last_name` |
| `maternal_last_name` | Apellido materno | `García` | `dependents.maternal_last_name` |
| `birth_date` | Fecha de nacimiento | `2015-03-10` | `dependents.birth_date` |
| `gender` | Sexo | `F` | `dependents.gender` |
| `relationship_type` | Parentesco | `Hija` | `relationship_types.name` |
| `policy_start_date` | Inicio de póliza | `2025-01-01` | `dependents.policy_start_date` |
| `policy_end_date` | Fin de póliza | `2025-12-31` | `dependents.policy_end_date` |
| `status` | Estado | `ACTIVE` | `dependents.status` |

---

## 🎨 DISEÑO DEL PDF

### **Especificaciones Técnicas**
- **Tamaño**: Carta (8.5" x 11")
- **Orientación**: Vertical
- **Márgenes**: 1" en todos los lados
- **Fuente**: Arial, 12pt para texto, 14pt para títulos
- **Colores**: Negro para texto, azul corporativo para títulos

### **Estructura del PDF**

#### **1. Encabezado (0.5")**
- Logo de la compañía (izquierda)
- Nombre de la compañía (centro)
- Fecha de generación (derecha)

#### **2. Información del Colaborador (2")**
- **Título**: "INFORMACIÓN DEL COLABORADOR"
- **Datos**:
  - Número de empleado
  - Nombre completo
  - Email corporativo
  - Fecha de nacimiento y edad calculada
  - Departamento y posición
  - Fecha de ingreso
  - Número de póliza

#### **3. Información de Dependientes (4")**
- **Título**: "DEPENDIENTES REGISTRADOS"
- **Tabla con columnas**:
  - Secuencia
  - Nombre completo
  - Fecha de nacimiento y edad
  - Parentesco
  - Estado de póliza
  - Fechas de vigencia

#### **4. Sección de Firma (2")**
- **Título**: "ACEPTACIÓN Y FIRMA"
- **Texto**: "Por medio de la presente, confirmo que la información proporcionada es veraz y completa, y acepto los términos y condiciones del plan de gastos médicos mayores."
- **Líneas para firma**:
  - Firma del colaborador
  - Fecha
  - Nombre completo

#### **5. Pie de página (0.5")**
- Información de contacto de la compañía
- Número de página

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### **Tecnologías a Utilizar**
- **jsPDF**: Generación del PDF
- **html2canvas**: Captura del componente HTML
- **React**: Componente de plantilla
- **TypeScript**: Tipado fuerte
- **TailwindCSS**: Estilos (convertidos a CSS inline)

### **Estructura de Archivos**
```
src/
├── components/
│   └── pdf/
│       ├── PDFGenerator.tsx          # Componente principal
│       ├── PDFTemplate.tsx           # Plantilla HTML
│       └── PDFPreview.tsx            # Vista previa
├── services/
│   └── PDFService.ts                 # Servicio de generación
├── templates/
│   └── collaborator-template.html    # Plantilla HTML base
└── types/
    └── pdf.types.ts                  # Tipos TypeScript
```

### **Flujo de Generación**
1. **Usuario hace clic** en "Generar PDF"
2. **Sistema obtiene datos** del colaborador y dependientes
3. **Se renderiza plantilla** HTML con datos
4. **html2canvas captura** el componente HTML
5. **jsPDF genera** el PDF con la imagen
6. **Se descarga** automáticamente el PDF
7. **Se registra** en audit_trails

---

## 📋 VALIDACIONES REQUERIDAS

### **Validaciones de Datos**
- ✅ Colaborador debe existir y estar activo
- ✅ Al menos un dependiente debe estar registrado
- ✅ Datos de compañía deben estar disponibles
- ✅ Fechas deben ser válidas
- ✅ Parentescos deben estar definidos

### **Validaciones de PDF**
- ✅ Tamaño correcto (Carta)
- ✅ Todas las secciones incluidas
- ✅ Información completa y coherente
- ✅ Sección de firma presente
- ✅ Calidad de imagen adecuada

### **Validaciones de Seguridad**
- ✅ Solo el colaborador puede generar su PDF
- ✅ Datos sensibles protegidos
- ✅ Audit trail registrado
- ✅ Validación de permisos

---

## 🎯 CRITERIOS DE ACEPTACIÓN

### **Funcionalidad**
- ✅ PDF se genera correctamente
- ✅ Información es coherente y completa
- ✅ Diseño es profesional
- ✅ Descarga funciona
- ✅ Sección de firma está presente

### **Calidad**
- ✅ PDF tamaño Carta
- ✅ Texto legible
- ✅ Imágenes de calidad
- ✅ Estructura clara
- ✅ Información organizada

### **Rendimiento**
- ✅ Generación en < 5 segundos
- ✅ PDF < 2MB
- ✅ Compatible con navegadores modernos
- ✅ No bloquea la UI

### **Integración**
- ✅ Usa datos reales del sistema
- ✅ Registra en audit trail
- ✅ Respeta permisos de usuario
- ✅ Maneja errores correctamente

---

## 📊 MÉTRICAS DE ÉXITO

### **Métricas Técnicas**
- ✅ Tiempo de generación: < 5 segundos
- ✅ Tamaño de PDF: < 2MB
- ✅ Calidad de imagen: > 300 DPI
- ✅ Compatibilidad: 95% navegadores

### **Métricas de Usuario**
- ✅ Satisfacción: > 4.5/5
- ✅ Facilidad de uso: < 3 clics
- ✅ Tiempo de aprendizaje: < 5 minutos
- ✅ Tasa de error: < 1%

### **Métricas de Negocio**
- ✅ Adopción: > 80% usuarios
- ✅ Frecuencia de uso: > 2 veces/mes
- ✅ Reducción de tiempo: > 50%
- ✅ Satisfacción del cliente: > 4/5

---

## 🚨 RIESGOS IDENTIFICADOS

### **Riesgos Técnicos**
- **Calidad de imagen**: html2canvas puede no capturar bien algunos estilos
- **Tamaño de archivo**: PDFs con muchas imágenes pueden ser grandes
- **Compatibilidad**: Diferentes navegadores pueden renderizar diferente
- **Rendimiento**: Generación puede ser lenta con muchos dependientes

### **Riesgos de Negocio**
- **Datos sensibles**: Información personal en PDFs
- **Cumplimiento legal**: Requerimientos de privacidad
- **Auditoría**: Necesidad de trazabilidad completa
- **Escalabilidad**: Muchos usuarios generando PDFs simultáneamente

### **Mitigaciones**
- **Testing exhaustivo**: Probar en múltiples navegadores
- **Optimización**: Comprimir imágenes y optimizar CSS
- **Validaciones**: Verificar datos antes de generar
- **Monitoreo**: Implementar logging y métricas

---

*Análisis realizado el: 15 de Enero 2025*
*Basado en fuentes de verdad del proyecto SGMM*
*Próxima actualización: Al completar implementación*
