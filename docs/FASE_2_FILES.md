# 🎯 FASE 2: GESTIÓN DE ARCHIVOS - IMPLEMENTACIÓN COMPLETA

## 🎯 OBJETIVO DE LA FASE

Implementar sistema completo de gestión de archivos con integración a Google Drive, validaciones de seguridad, y organización por ID compuesto. Esta fase establece la base para el manejo seguro de documentos (actas de nacimiento) y conecta con el módulo de dependientes.

## 📋 MÓDULOS INVOLUCRADOS

- **Documents**: Sistema completo de gestión de documentos
- **Google Drive**: Integración con Google Drive API
- **File Validation**: Validaciones de tamaño y tipo
- **Security**: Control de acceso y seguridad de archivos

## 🔗 CONEXIÓN CON OTROS MÓDULOS

Esta fase implementa la base de gestión de archivos para:
- **Dependents**: Upload obligatorio de actas de nacimiento (primera vez)
- **Audit Trail**: Registro de uploads/downloads
- **Privacy**: Archivos ligados a aceptación de privacidad
- **Reports**: Archivos adjuntos en reportes

## 📚 FUENTES DE VERDAD

- **`DATA_DICTIONARY.md`**: Tabla 7 - `documents` (líneas 200-250)
- **`NAMING_CONVENTIONS.md`**: Convenciones de nomenclatura para el módulo
- **`.cursorrules`**: Metodología de bloques atómicos y validación triple
- **`RF_RNF_VALIDATION.md`**: RF-004 (gestión de documentos)

---

## 📝 BLOQUES DE TRABAJO (FASE 2)

### BLOQUE 2.1: ANÁLISIS DE GESTIÓN DE ARCHIVOS (1-2 horas)

**Objetivo**: Identificar requerimientos específicos de gestión de archivos y planificar integración con Google Drive.

**Tareas**:
1. **Auditar requerimientos**: Analizar RF-004 y necesidades de archivos
2. **Identificar tipos de archivo**: PDF, JPG, PNG para actas de nacimiento
3. **Mapear validaciones**: Tamaño máximo (5MB), tipos permitidos
4. **Planificar Google Drive**: Estructura de carpetas y organización
5. **Crear plan de implementación**: Priorizar por funcionalidad crítica
6. **Documentar estructura**: Organización por ID compuesto

**Entregables**:
- Análisis de requerimientos de archivos
- Plan de integración con Google Drive
- Estructura de organización documentada

**Validación (Triple)**:
- **Pre-validación**: `grep -r "document\|file" src/` (funcionalidad existente)
- **Durante**: Análisis de requerimientos documentado
- **Post-validación**: Plan de implementación validado

**Criterios de Éxito**:
- Requerimientos de archivos identificados
- Plan de Google Drive documentado
- Estructura de organización definida

**Rollback**: `git checkout HEAD -- docs/FASE_2_FILES.md`

---

### BLOQUE 2.2: INTEGRACIÓN CON GOOGLE DRIVE (3-4 horas)

**Objetivo**: Implementar integración completa con Google Drive API para almacenamiento seguro.

**Tareas**:
1. **Configurar Google Drive API**: Credenciales y permisos
2. **Crear servicio GoogleDriveService**: Upload, download, delete
3. **Implementar estructura de carpetas**: Organización por empleado/dependiente
4. **Crear utilidades de archivo**: Validación, naming, paths
5. **Validar tipos**: Ejecutar `npx tsc --noEmit`
6. **Tests básicos**: Verificar integración con Google Drive

**Entregables**:
- Integración Google Drive funcional
- Servicio GoogleDriveService implementado
- Estructura de carpetas organizada
- Utilidades de archivo creadas

**Validación (Triple)**:
- **Pre-validación**: `grep -r "google\|drive" src/` (integraciones existentes)
- **Durante**: `npx tsc --noEmit` (validar tipos)
- **Post-validación**: Upload de archivo de prueba exitoso

**Criterios de Éxito**:
- Google Drive API configurada
- Servicio funcional
- Upload/download funcionando
- Tests pasando

**Rollback**: `git checkout HEAD -- src/services/GoogleDriveService.ts`

---

### BLOQUE 2.3: IMPLEMENTACIÓN DE DOCUMENTS CRUD (2-3 horas)

**Objetivo**: Implementar operaciones CRUD completas para documents con validaciones según DATA_DICTIONARY.md.

**Tareas**:
1. **Crear tabla documents**: Migración Prisma
2. **Implementar DocumentRepository**: CRUD operations
3. **Crear DocumentService**: Lógica de negocio
4. **Implementar endpoints**: Upload, download, delete
5. **Validaciones de archivo**: Tamaño, tipo, nombre
6. **Tests funcionales**: Crear pruebas para cada operación

**Entregables**:
- Tabla `documents` implementada
- CRUD completo para documents
- Validaciones de archivo implementadas
- Endpoints funcionales

**Validación (Triple)**:
- **Pre-validación**: `grep -r "documents" prisma/schema.prisma` (tabla existe)
- **Durante**: Tests funcionales ejecutándose
- **Post-validación**: `curl -X POST /api/documents/upload` (endpoint funcional)

**Criterios de Éxito**:
- CRUD completo funcional
- Validaciones implementadas
- Endpoints funcionando
- Tests pasando

**Rollback**: `git checkout HEAD -- prisma/migrations/`

---

### BLOQUE 2.4: INTEGRACIÓN CON DEPENDENTS (2-3 horas)

**Objetivo**: Conectar gestión de archivos con dependientes, incluyendo upload obligatorio para primera vez.

**Tareas**:
1. **Integrar con dependents**: Upload obligatorio para primera vez
2. **Implementar validaciones**: Archivo requerido si is_first_time = true
3. **Crear componente upload**: Frontend para subir archivos
4. **Validar flujo completo**: Desde formulario hasta Google Drive
5. **Tests de integración**: Validar flujo end-to-end
6. **Documentación actualizada**: Actualizar docs de dependents

**Entregables**:
- Integración completa con dependents
- Upload obligatorio para primera vez
- Componente frontend de upload
- Flujo completo funcional

**Validación (Triple)**:
- **Pre-validación**: `docker-compose logs sgmm-backend` (sistema funcionando)
- **Durante**: Tests de integración ejecutándose
- **Post-validación**: Flujo completo desde dependiente hasta archivo

**Criterios de Éxito**:
- Integración funcional con dependents
- Upload obligatorio funcionando
- Componente frontend funcional
- Tests de integración pasando

**Rollback**: `git checkout HEAD -- src/modules/dependents/`

---

### BLOQUE 2.5: VALIDACIÓN FINAL Y PRUEBAS TANGIBLES (1-2 horas)

**Objetivo**: Validar que gestión de archivos está completamente funcional y segura.

**Tareas**:
1. **Pruebas funcionales completas**: Ejecutar suite completa
2. **Validación de seguridad**: Verificar control de acceso
3. **Pruebas de Google Drive**: Validar integración completa
4. **Documentación actualizada**: Actualizar docs de archivos
5. **Métricas finales**: Registrar métricas de gestión de archivos
6. **Commit final**: Hacer commit con métricas de progreso

**Entregables**:
- Sistema de gestión de archivos completamente funcional
- Métricas de seguridad implementadas
- Documentación actualizada

**Validación (Triple)**:
- **Pre-validación**: `npx tsc --noEmit` (errores TypeScript)
- **Durante**: Tests completos ejecutándose
- **Post-validación**: `npm test` (suite completa pasando)

**Criterios de Éxito**:
- 0 errores TypeScript en archivos
- Tests completos pasando
- Gestión de archivos funcional

**Rollback**: `git checkout HEAD -- src/modules/documents/`

---

## 🎯 PRUEBAS TANGIBLES AL FINAL DE FASE 2

### **PRUEBA 1: Upload de Archivo**
```bash
# Subir acta de nacimiento para dependiente
curl -X POST /api/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@acta_nacimiento.pdf" \
  -F "employee_id=3619" \
  -F "dependent_id=3619-a01" \
  -F "document_type=BIRTH_CERTIFICATE"
```

### **PRUEBA 2: Download de Archivo**
```bash
# Descargar archivo subido
curl -X GET /api/documents/3619-a01/download \
  -H "Authorization: Bearer $TOKEN" \
  -o acta_descargada.pdf
```

### **PRUEBA 3: Validaciones de Archivo**
```bash
# Intentar subir archivo muy grande (debe fallar)
curl -X POST /api/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@archivo_grande.pdf" \
  -F "employee_id=3619"
# Debe retornar error 400

# Intentar subir tipo no permitido (debe fallar)
curl -X POST /api/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@documento.docx" \
  -F "employee_id=3619"
# Debe retornar error 400
```

### **PRUEBA 4: Integración con Dependientes**
```bash
# Crear dependiente de primera vez sin archivo (debe fallar)
curl -X POST /api/dependents \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"first_name": "Test", "employee_id": "3619", "is_first_time": true}'
# Debe retornar error 400

# Crear dependiente de primera vez con archivo (debe funcionar)
curl -X POST /api/dependents \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"first_name": "Test", "employee_id": "3619", "is_first_time": true, "document_id": "doc-123"}'
```

### **PRUEBA 5: Google Drive Integration**
```bash
# Verificar archivo en Google Drive
curl -X GET /api/documents/3619-a01/google-drive-url \
  -H "Authorization: Bearer $TOKEN"
# Debe retornar URL válida de Google Drive

# Verificar estructura de carpetas
curl -X GET /api/documents/folder-structure \
  -H "Authorization: Bearer $TOKEN"
# Debe mostrar estructura organizada por empleado
```

---

## 📊 MÉTRICAS DE ÉXITO

### **Métricas de Funcionalidad**:
- ✅ Upload de archivos: 100%
- ✅ Download de archivos: 100%
- ✅ Validaciones de archivo: 100%
- ✅ Integración Google Drive: 100%

### **Métricas de Calidad**:
- ✅ Errores TypeScript en archivos: < 5
- ✅ Cobertura de tests: > 80%
- ✅ Documentación actualizada: 100%
- ✅ Validaciones de seguridad: 100%

### **Métricas de Seguridad**:
- ✅ Control de acceso: 100%
- ✅ Validación de tipos: 100%
- ✅ Validación de tamaño: 100%
- ✅ Organización segura: 100%

---

**Última Actualización**: 15 de Enero 2025
**Estado**: ⏳ PENDIENTE
**Duración Estimada**: 8-12 horas (2-3 días)
**Dependencias**: FASE 1 completada ✅
**Próxima Fase**: FASE 3 - Sistema de Reportes

## 🏆 RESULTADOS ESPERADOS FASE 2

### **✅ BLOQUES A COMPLETAR**
- ⏳ BLOQUE 2.1: Análisis de gestión de archivos
- ⏳ BLOQUE 2.2: Integración con Google Drive
- ⏳ BLOQUE 2.3: Implementación de documents CRUD
- ⏳ BLOQUE 2.4: Integración con dependents
- ⏳ BLOQUE 2.5: Validación final y pruebas tangibles

### **📊 MÉTRICAS DE ÉXITO ESPERADAS**
- ⏳ Upload de archivos: 100%
- ⏳ Download de archivos: 100%
- ⏳ Validaciones de archivo: 100%
- ⏳ Integración Google Drive: 100%
- ⏳ Errores TypeScript en archivos: < 5
- ⏳ Cobertura de tests: > 80%
- ⏳ Documentación actualizada: 100%
