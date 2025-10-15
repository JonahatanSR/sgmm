# 📄 SISTEMA DE GENERACIÓN DE PDFs - DOCUMENTACIÓN TÉCNICA

## 🎯 OBJETIVO
Sistema completo para la generación de PDFs con información de colaboradores y dependientes, integrado con audit trail y optimizaciones de performance.

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### **Frontend (React + TypeScript)**
```
frontend/src/
├── components/pdf/           # Componentes React para PDFs
│   ├── PDFTemplate.tsx       # Plantilla principal del PDF
│   ├── PDFGenerator.tsx      # Generador con vista previa
│   ├── PDFPreview.tsx        # Vista previa del PDF
│   ├── PDFOptions.tsx        # Configuración de opciones
│   ├── PDFGeneratorButton.tsx # Botón reutilizable
│   └── PDFTester.tsx         # Herramienta de testing
├── hooks/                    # Hooks personalizados
│   ├── usePDFGeneration.ts   # Hook para generación
│   ├── usePDFData.ts         # Hook para datos del PDF
│   └── useAuditHistory.ts    # Hook para historial de auditoría
├── services/                 # Servicios
│   └── PDFService.ts         # Servicio principal de PDFs
├── types/                    # Tipos TypeScript
│   └── pdf.types.ts          # Interfaces y tipos
├── utils/                    # Utilidades
│   ├── pdf.utils.ts         # Utilidades de formateo
│   └── pdf.performance.ts   # Optimizaciones de performance
└── templates/               # Plantillas HTML
    └── PDFTemplate.html     # Plantilla base HTML
```

### **Backend (Node.js + Fastify)**
```
backend/src/
├── modules/pdf/             # Módulo de PDFs
│   └── http.ts              # Endpoints para datos de PDF
├── modules/audit/           # Módulo de auditoría
│   ├── services/
│   │   └── auditService.ts  # Servicio de audit trail
│   └── http.ts              # Endpoints de auditoría
└── database/                # Base de datos
    └── prisma/              # Esquema Prisma
```

---

## 🔧 COMPONENTES PRINCIPALES

### **1. PDFService.ts**
Servicio principal para generación de PDFs con jsPDF + html2canvas.

**Características:**
- Generación directa de PDFs con jsPDF
- Conversión HTML → Canvas → PDF
- Configuración optimizada para tamaño Carta
- Integración automática con audit trail
- Manejo de errores robusto

**Métodos principales:**
- `generatePDFFromHTML()` - Conversión HTML a PDF
- `generateCollaboratorPDF()` - Generación directa de PDF
- `logPDFGeneration()` - Registro en audit trail

### **2. PDFTemplate.tsx**
Componente React para renderizar la plantilla del PDF.

**Características:**
- Datos dinámicos del colaborador y dependientes
- Estilos optimizados para impresión
- Formateo automático de fechas y datos
- Responsive design

### **3. usePDFGeneration.ts**
Hook personalizado para manejo de estado de generación.

**Características:**
- Estado de carga y errores
- Generación asíncrona
- Manejo de resultados
- Limpieza de estado

### **4. AuditService.ts**
Servicio de backend para audit trail.

**Características:**
- Registro automático de acciones
- Historial de PDFs por empleado
- Metadatos completos (IP, User Agent, timestamp)
- Consultas optimizadas

---

## 📊 FLUJO DE GENERACIÓN DE PDF

### **1. Iniciación**
```typescript
// Usuario hace clic en "Generar PDF"
const handleGeneratePDF = async () => {
  await generatePDF(pdfData, options);
};
```

### **2. Obtención de Datos**
```typescript
// Hook obtiene datos del backend
const { data: pdfData } = usePDFData(employeeId);
```

### **3. Generación**
```typescript
// PDFService genera el PDF
const success = await pdfService.generateCollaboratorPDF(data, filename);
```

### **4. Audit Trail**
```typescript
// Registro automático en auditoría
await auditService.logPDFGeneration(employeeId, actorId, ...);
```

### **5. Descarga**
```typescript
// PDF se descarga automáticamente
pdf.save(filename);
```

---

## 🎨 PLANTILLA DEL PDF

### **Estructura:**
1. **Encabezado** - Logo, nombre de compañía, fecha
2. **Datos del Colaborador** - Información personal y laboral
3. **Dependientes** - Tabla con información de dependientes
4. **Sección de Firma** - Campos para firma y aceptación
5. **Pie de Página** - Información del sistema

### **Estilos:**
- **Tamaño**: Carta (8.5" x 11")
- **Fuente**: Helvetica
- **Colores**: Azul corporativo (#3498db)
- **Layout**: Dos columnas para datos del empleado
- **Tabla**: Dependientes con columnas optimizadas

---

## 🔍 AUDIT TRAIL

### **Acciones Registradas:**
- `PDF_GENERATED` - Generación de PDF
- `PDF_DOWNLOADED` - Descarga de PDF
- `PDF_VIEWED` - Visualización de PDF

### **Metadatos Capturados:**
- **Actor**: ID, rol, email del usuario
- **Contexto**: IP, User Agent, timestamp
- **Contenido**: Nombre del archivo, opciones de generación
- **Sistema**: Información de la sesión

### **Endpoints de Consulta:**
- `GET /api/audit/employee/:employeeId` - Historial completo
- `GET /api/audit/employee/:employeeId/pdfs` - Solo PDFs
- `POST /api/audit/pdf/generation` - Registrar generación

---

## ⚡ OPTIMIZACIONES DE PERFORMANCE

### **1. Configuración Optimizada**
```typescript
const OPTIMIZED_CANVAS_CONFIG = {
  scale: 1.5,           // Reducido de 2 a 1.5
  removeContainer: true, // Limpiar después de usar
  foreignObjectRendering: false, // Mejor compatibilidad
  imageTimeout: 5000    // Timeout para imágenes
};
```

### **2. Cache de Recursos**
```typescript
// Cache para imágenes y recursos
const resourceCache = ResourceCache.getInstance();
await resourceCache.getImage(logoUrl);
```

### **3. Limpieza de Memoria**
```typescript
// Limpiar recursos después de generar
cleanupAfterPDF();
```

### **4. Pre-carga de Recursos**
```typescript
// Pre-cargar recursos necesarios
await preloadPDFResources(pdfData);
```

---

## 🧪 TESTING Y DEBUGGING

### **PDFTester.tsx**
Componente para testing de performance:

**Tests incluidos:**
- Generación básica
- Pre-carga de recursos
- Debug de performance
- Generación optimizada

**Métricas capturadas:**
- Tiempo de generación
- Uso de memoria
- Información del sistema
- Errores y warnings

### **Debug de Performance**
```typescript
// Analizar elementos del DOM
debugPDFPerformance(element);

// Medir tiempo de generación
const result = await measurePDFGeneration(generator);
```

---

## 📱 INTEGRACIÓN CON SISTEMA EXISTENTE

### **ViewMainCollaborator.tsx**
Integración con la página principal:

```typescript
// Hook para datos del PDF
const { data: pdfData, isLoading: isLoadingPDFData } = usePDFData(employeeId);

// Hook para generación
const { generatePDF, isGenerating: isGeneratingPDF } = usePDFGeneration();

// Función simplificada
const handleGeneratePDF = async () => {
  if (!pdfData) return;
  await generatePDF(pdfData, options);
};
```

### **Botón Integrado**
```typescript
<button 
  onClick={handleGeneratePDF}
  disabled={isGeneratingPDF || isLoadingPDFData || !pdfData}
>
  {isLoadingPDFData ? 'Cargando datos...' : 
   isGeneratingPDF ? 'Generando PDF...' : 
   'Generar PDF'}
</button>
```

---

## 🔒 SEGURIDAD Y PRIVACIDAD

### **Validaciones:**
- Verificación de permisos del usuario
- Validación de datos antes de generar
- Sanitización de inputs
- Verificación de integridad

### **Audit Trail:**
- Registro completo de acciones
- Trazabilidad de accesos
- Metadatos de seguridad
- Cumplimiento de normativas

### **Datos Sensibles:**
- Información personal protegida
- Cumplimiento con aviso de privacidad
- Encriptación en tránsito
- Almacenamiento seguro

---

## 🚀 DESPLIEGUE Y CONFIGURACIÓN

### **Variables de Entorno:**
```env
# Configuración de PDF
PDF_MAX_FILE_SIZE=5MB
PDF_ALLOWED_TYPES=pdf,jpg,jpeg,png
PDF_COMPRESSION_QUALITY=0.85

# Configuración de Audit
AUDIT_RETENTION_DAYS=365
AUDIT_LOG_LEVEL=info
```

### **Dependencias:**
```json
{
  "jspdf": "^3.0.3",
  "html2canvas": "^1.4.1",
  "@types/jspdf": "^1.3.3"
}
```

### **Configuración de Nginx:**
```nginx
# Headers para PDFs
add_header Content-Type application/pdf;
add_header Content-Disposition attachment;
```

---

## 📈 MÉTRICAS Y MONITOREO

### **Métricas de Performance:**
- Tiempo de generación promedio
- Tasa de éxito de generación
- Uso de memoria
- Tamaño de archivos generados

### **Métricas de Uso:**
- PDFs generados por día/semana/mes
- Usuarios más activos
- Tipos de PDF más solicitados
- Errores más comunes

### **Alertas:**
- Fallos en generación > 5%
- Tiempo de generación > 10s
- Errores de audit trail
- Uso excesivo de memoria

---

## 🔧 MANTENIMIENTO

### **Tareas Regulares:**
- Limpieza de cache de recursos
- Rotación de logs de audit
- Optimización de base de datos
- Actualización de dependencias

### **Monitoreo:**
- Logs de generación de PDFs
- Métricas de performance
- Errores y excepciones
- Uso de recursos del sistema

### **Backup:**
- Configuración de plantillas
- Datos de audit trail
- Configuración del sistema
- Logs de auditoría

---

## 📚 RECURSOS ADICIONALES

### **Documentación:**
- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [html2canvas Documentation](https://html2canvas.hertzen.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)

### **Herramientas de Debug:**
- PDFTester component
- Browser DevTools
- Performance Profiler
- Memory Usage Monitor

### **Soporte:**
- Logs del sistema
- Métricas de performance
- Audit trail completo
- Documentación técnica

---

**Última actualización**: 15 de enero de 2025  
**Versión**: 1.0.0  
**Mantenido por**: Equipo de Desarrollo SGMM
