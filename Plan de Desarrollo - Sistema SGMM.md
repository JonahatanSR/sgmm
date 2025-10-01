# Plan de Desarrollo - Sistema SGMM
## Roadmap por Etapas Lógicas de Construcción

### Estimaciones de Tiempo
- **Total proyecto**: 10-12 semanas con 2 desarrolladores
- **MVP funcional**: 6 semanas
- **Sistema completo**: 10-12 semanas

---

## **Fase 1: Fundaciones (Semanas 1-2)**
*Objetivo: Establecer base sólida del sistema*

### Sprint 1.1: Configuración Inicial (Semana 1)
**Entregables:**
- [ ] Setup inicial del proyecto (Vite + React, Node.js + TypeScript)
- [ ] Configuración de Base de Datos PostgreSQL + Prisma
- [ ] Schema inicial de BD (employees, companies, dependents, relationship_types)
- [ ] Configuración de ambiente desarrollo (variables, Docker opcional)
- [ ] Setup de linting, prettier, husky hooks
- [ ] Estructura de directorios según arquitectura definida

**Criterios de Aceptación:**
- Proyecto se levanta sin errores en ambiente local
- Base de datos se conecta y migra correctamente
- Seed data básico carga (relationship types, company ejemplo)
- Hot reload funciona en frontend y backend

**Riesgos:**
- Problemas de configuración TypeScript (monitorear memoria RAM)
- Conflictos de puertos o permisos de BD

### Sprint 1.2: Autenticación Base (Semana 2)
**Entregables:**
- [ ] Sistema de autenticación con Strategy Pattern
- [ ] Google OAuth integration (preparado, puede usar mock inicialmente)
- [ ] OTP local authentication como fallback
- [ ] Middleware de autorización por roles
- [ ] Login/logout básico en frontend
- [ ] Session management con Redis

**Criterios de Aceptación:**
- Usuario puede autenticarse con OTP local
- Roles se asignan correctamente (EMPLOYEE, HR_ADMIN, SUPER_ADMIN)
- Rutas protegidas funcionan según rol
- Session persiste entre recargas de página

**Definición de Listo:**
- Tests unitarios de authentication services
- Documentación de setup OAuth para producción

---

## **Fase 2: Core Business Logic (Semanas 3-4)**
*Objetivo: Funcionalidades esenciales del negocio*

### Sprint 2.1: Gestión de Empleados (Semana 3)
**Entregables:**
- [ ] CRUD completo de employees (service + repository + controller)
- [ ] Sync con Google AD (mock service si no hay acceso)
- [ ] Vista principal colaborador con sus datos
- [ ] Formulario edición datos personales
- [ ] Validaciones de negocio (fechas, formatos)
- [ ] Audit logging para cambios de employee

**Criterios de Aceptación:**
- Colaborador ve sus datos pre-cargados de Google AD
- Puede editar campos permitidos (nombres, fecha nacimiento, género)
- Cambios se guardan y auditan correctamente
- Vista responsive y usable

**Features Clave:**
- Auto-cálculo de edad desde birth_date
- Validación de company_id según usuario logueado
- Campos read-only vs editables claramente diferenciados

### Sprint 2.2: Gestión de Dependientes (Semana 4)
**Entregables:**
- [ ] CRUD completo de dependents
- [ ] Tabla de dependientes en vista principal colaborador
- [ ] Formularios agregar/editar dependiente
- [ ] Validaciones de relationship types
- [ ] Soft delete con historial
- [ ] Componente tabla reutilizable con acciones

**Criterios de Aceptación:**
- Colaborador puede agregar/editar/eliminar sus dependientes
- Validaciones previenen datos inconsistentes
- Tabla muestra dependientes activos vs histórico
- Experiencia UX fluida entre formularios

**Business Rules:**
- Máximo dependientes por configuración (default: 10)
- Relationship types dinámicos desde BD
- Policy start date automática según reglas de negocio

---

## **Fase 3: Multi-Company & Branding (Semanas 5-6)**
*Objetivo: Implementar sistema multi-tenant con identidad visual*

### Sprint 3.1: Core Multi-Company (Semana 5)
**Entregables:**
- [ ] Sistema de companies con configuración básica
- [ ] Filtrado automático por compañía en queries
- [ ] ThemeService para branding dinámico
- [ ] CSS variables que se cargan según compañía del usuario
- [ ] Middleware company-scoped para todos los endpoints
- [ ] Migration de datos existentes a estructura multi-company

**Criterios de Aceptación:**
- Usuarios solo ven datos de su compañía
- UI se adapta automáticamente a colores/logo de la compañía
- Isolation completa entre compañías en BD
- Performance no se ve afectada por filtros adicionales

**Features Técnicas:**
- Cache de temas por compañía (Redis)
- Fallback a tema default si falla branding
- Invalidación automática de cache al cambiar branding

### Sprint 3.2: Identity Manager (Semana 6)
**Entregables:**
- [ ] Panel admin para gestión de branding por compañía - **INTERFACE SIMPLE**
- [ ] Color picker con validación de accessibility (máximo 4 colores)
- [ ] Upload de logos con procesamiento automático
- [ ] Preview en vivo de cambios de branding - **UN SOLO PREVIEW, no múltiples opciones**
- [ ] Templates predefinidos de paletas (máximo 3 opciones profesionales)
- [ ] Validaciones de contraste WCAG

**UI/UX Constraints:**
- Interface de configuración limpia, una sección por vez
- Color picker simple, no complicado con múltiples formatos
- Preview instantáneo pero no abrumador
- **NO crear "design studio" complejo - solo lo esencial**

**Criterios de Aceptación:**
- Super Admin puede personalizar branding de cualquier compañía
- Validaciones previenen problemas de accessibility
- Preview muestra resultado antes de aplicar cambios
- **Interface se siente directa y profesional, no como herramienta de diseño compleja**

**Business Rules:**
- Máximo 4 colores por paleta corporativa (obligatorio)
- Logos máximo 2MB, formatos PNG/SVG/JPG
- Contraste mínimo WCAG AA (4.5:1)
- **NO permitir fonts personalizadas - solo web-safe fonts predefinidas**

---

## **Fase 4: Gestión de Documentos (Semanas 7-8)**
*Objetivo: Sistema robusto de manejo de archivos*

### Sprint 4.1: Upload y Storage (Semana 7)
**Entregables:**
- [ ] Sistema de upload con validaciones estrictas
- [ ] Integración con Google Drive (opcional, con fallback local)
- [ ] Procesamiento de archivos (validación PDF, metadata)
- [ ] DocumentService con storage abstraction
- [ ] UI drag & drop para upload de actas
- [ ] Preview de documentos en browser

**Criterios de Aceptación:**
- Solo acepta PDFs válidos, máximo 5MB
- Storage funciona tanto local como Google Drive
- Archivos se nombran según convención del sistema
- Usuario recibe feedback claro del proceso de upload

**Consideraciones Técnicas:**
- Worker threads para procesamiento de archivos grandes
- Cleanup automático de archivos temporales
- Retry logic para uploads fallidos

### Sprint 4.2: Gestión Avanzada Documentos (Semana 8)
**Entregables:**
- [ ] Historial de documentos por empleado/dependiente
- [ ] Sistema de reemplazo de documentos
- [ ] Bulk upload para HR (múltiples archivos)
- [ ] Reportes de documentos faltantes
- [ ] Integración con email notifications
- [ ] Audit trail completo de operaciones de archivos

**Criterios de Aceptación:**
- HR puede identificar fácilmente documentos faltantes
- Sistema mantiene historial de reemplazos
- Notifications automáticas cuando faltan documentos críticos
- Bulk operations no afectan performance del sistema

---

## **Fase 5: Reportes y PDFs (Semanas 9-10)**
*Objetivo: Sistema robusto de generación de reportes*

### Sprint 5.1: PDF Generation Engine (Semana 9)
**Entregables:**
- [ ] PDFService con React-PDF integration
- [ ] Templates base para reportes principales
- [ ] Sistema de variables dinámicas en templates
- [ ] Branding automático según compañía
- [ ] Queue system para generación de PDFs pesados
- [ ] Cache de PDFs generados frecuentemente

**Criterios de Aceptación:**
- PDFs incluyen branding correcto de la compañía
- Templates son modificables sin cambiar código
- Generación no bloquea UI ni consume excesiva memoria
- PDFs se ven profesionales y son imprimibles

**Features Técnicas:**
- Worker processes para PDFs grandes
- Template inheritance para consistencia
- Watermarks y footers personalizables

### Sprint 5.2: Template Builder para HR (Semana 10)
**Entregables:**
- [ ] Interface visual para customizar templates PDF
- [ ] Sistema de campos activables/desactivables
- [ ] Preview instantáneo de cambios
- [ ] Configuración de fonts y espaciado
- [ ] Versionado de templates
- [ ] Export/import de configuraciones de template

**Criterios de Aceptación:**
- HR puede personalizar PDFs sin ayuda técnica
- Cambios se ven en preview antes de aplicar
- Sistema previene configuraciones que rompan layout
- Templates se pueden revertir a versiones anteriores

**Business Rules:**
- Solo fonts web-safe permitidas
- Campos obligatorios no se pueden desactivar
- Layout constraints para mantener profesionalismo

---

## **Fase 6: Communication Center (Semana 11)**
*Objetivo: Sistema completo de comunicaciones*

### Sprint 6.1: Email System (Semana 11)
**Entregables:**
- [ ] EmailService con template engine
- [ ] Plantillas de correo con variables dinámicas
- [ ] Interface HR para crear campañas
- [ ] Selector de destinatarios por criterios múltiples
- [ ] Queue system para envíos masivos
- [ ] Tracking de delivery y opens (básico)

**Criterios de Aceptación:**
- HR puede enviar emails dirigidos por múltiples criterios
- Templates incluyen branding automático de compañía
- Sistema no satura servidor de email con envíos masivos
- Fallbacks apropiados si fallan envíos individuales

**Criterios Avanzados:**
- Integration con Google AD para obtener OUs
- Filtros por: departamento, documentos faltantes, status
- Scheduling de campañas para envío posterior
- Historial completo de comunicaciones

---

## **Fase 7: Admin Panels & Polish (Semana 12)**
*Objetivo: Completar funcionalidades administrativas*

### Sprint 7.1: Paneles Administrativos (Semana 12)
**Entregables:**
- [ ] Panel HR completo con dashboard y métricas básicas
- [ ] Panel Super Admin con gestión de usuarios
- [ ] Sistema de configuración general
- [ ] Reportes y exports por compañía/rol
- [ ] Gestión de relationship types
- [ ] Backup y restore básico

**Criterios de Aceptación:**
- HR tiene visibilidad completa de su compañía
- Super Admin puede gestionar todo el sistema
- Configuraciones se pueden cambiar sin redeployment
- Sistema de permisos previene accesos no autorizados

**Features de Calidad:**
- Error handling robusto en toda la aplicación
- Loading states y feedback apropiado
- Responsive design en todos los paneles
- Performance optimization (lazy loading, pagination)

---

## **Criterios de Calidad Transversales**

### Testing Strategy
**Por Sprint:**
- Unit tests para todos los services nuevos
- Integration tests para APIs críticas
- E2E tests para flujos principales de usuario

### Performance Benchmarks
- Tiempo de carga inicial < 3 segundos
- Queries de BD < 100ms promedio
- PDF generation < 5 segundos
- Email sending < 30 segundos para 100 destinatarios

### Security Checklist
- [ ] Input validation en todos los endpoints
- [ ] SQL injection prevention
- [ ] File upload security
- [ ] XSS prevention
- [ ] CORS configurado apropiadamente
- [ ] Rate limiting implementado
- [ ] Audit logs completos

### Documentation
**Entregables finales:**
- API documentation completa
- User guides para cada rol
- Admin setup guides
- Troubleshooting documentation
- Database schema documentation

---

## **Plan de Deployment**

### Staging Environment (Durante desarrollo)
- Deploy automático de feature branches
- Database seeding con datos de prueba
- Integration testing automatizado

### Production Readiness
- [ ] Environment variables documentadas
- [ ] Database backup strategy
- [ ] Monitoring y logging configurado
- [ ] SSL certificates configurados
- [ ] Domain y DNS setup
- [ ] Performance monitoring activo

### Go-Live Strategy
1. **Soft Launch**: Solo Super Admins (Semana 12)
2. **Pilot**: Un grupo pequeño de HR (Semana 13)
3. **Full Rollout**: Todos los usuarios (Semana 14)

---

## **Risk Mitigation**

### Riesgos Técnicos Altos
1. **Google AD Integration delays**
   - *Mitigation*: Mock service funcional desde Sprint 1
   - *Timeline*: No afecta desarrollo principal

2. **PDF Memory issues**
   - *Mitigation*: Worker processes + queue system
   - *Testing*: Load testing desde Sprint 5

3. **File storage problems**
   - *Mitigation*: Dual storage (local + cloud)
   - *Fallback*: Sistema funciona solo con local storage

### Riesgos de Negocio
1. **Cambios en requerimientos**
   - *Mitigation*: Architecture modular y extensible
   - *Buffer*: 20% tiempo adicional en cada sprint

2. **User adoption issues**
   - *Mitigation*: UX testing desde Sprint 2
   - *Feedback loops*: Weekly demos con stakeholders

### Contingency Plans
- **Si se atrasa 1 semana**: Skip advanced PDF customization
- **Si se atrasa 2 semanas**: Launch sin Communication Center
- **Si hay problemas críticos**: MVP funcional disponible en Semana 8

---

## **Success Metrics**

### MVP Success (Semana 6)
- [ ] Usuario puede actualizar sus datos personales
- [ ] Usuario puede gestionar sus dependientes
- [ ] Sistema multi-company funciona correctamente
- [ ] Branding básico se aplica automáticamente

### Full System Success (Semana 12)
- [ ] RH puede generar reportes completos
- [ ] PDFs con branding se generan correctamente
- [ ] Sistema de comunicaciones funciona end-to-end
- [ ] Admin panels permiten gestión completa del sistema
- [ ] Performance cumple benchmarks establecidos
- [ ] Security audit pasa sin issues críticos