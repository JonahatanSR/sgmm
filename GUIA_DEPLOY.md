# 🚀 Guía de Deploy SGMM - Autenticación SAML

**Fecha:** 1 de Octubre, 2025  
**Estado:** Listo para deploy

---

## 📋 Cambios Implementados que Requieren Deploy

### Backend
- ✅ Método `findByEmail` implementado
- ✅ Endpoint `/api/auth/me` creado
- ✅ Correcciones en el modelo `Dependent`
- ✅ 39 tests pasando

### Frontend
- ✅ Sistema de autenticación completo
- ✅ Hook `useAuth()`
- ✅ Componente `ProtectedRoute`
- ✅ Páginas `LoginPage` y `DashboardPage`
- ✅ Build exitoso sin errores

---

## 🎯 Plan de Deploy

### OPCIÓN A: Deploy Rápido (Recomendado)

```bash
# 1. Ir al directorio del proyecto
cd /home/gcloud/proyecto_sgmm

# 2. Detener servicios actuales (sin borrar datos)
docker-compose stop backend frontend

# 3. Reconstruir backend con cambios
docker-compose build backend

# 4. Reconstruir frontend con cambios
docker-compose build frontend

# 5. Levantar servicios actualizados
docker-compose up -d backend frontend

# 6. Verificar estado
docker-compose ps
docker-compose logs -f backend --tail=50
```

### OPCIÓN B: Deploy Completo (Si hay problemas)

```bash
# 1. Ir al directorio del proyecto
cd /home/gcloud/proyecto_sgmm

# 2. Bajar todos los servicios (SIN borrar volúmenes)
docker-compose down

# 3. Reconstruir todo
docker-compose build --no-cache

# 4. Levantar todo en orden
docker-compose up -d

# 5. Verificar
docker-compose logs -f
```

---

## ⚡ Comandos Paso a Paso (Ejecutar uno por uno)

### PASO 1: Preparación
```bash
cd /home/gcloud/proyecto_sgmm
```

### PASO 2: Verificar estado actual
```bash
docker-compose ps
```

### PASO 3: Detener backend y frontend (sin borrar datos)
```bash
docker-compose stop backend frontend
```

### PASO 4: Reconstruir backend
```bash
docker-compose build backend
```

### PASO 5: Reconstruir frontend
```bash
docker-compose build frontend
```

### PASO 6: Levantar servicios
```bash
docker-compose up -d backend frontend
```

### PASO 7: Ver logs para verificar
```bash
# Logs del backend
docker-compose logs backend --tail=100

# Logs del frontend
docker-compose logs frontend --tail=50
```

### PASO 8: Verificar endpoints
```bash
# Health del backend
curl http://localhost:3000/api/health

# Endpoint de autenticación (debe retornar 401 sin sesión)
curl http://localhost:3000/api/auth/me

# Frontend
curl http://localhost:80
```

---

## 🔍 Verificación Post-Deploy

### 1. Verificar que los contenedores están corriendo
```bash
docker-compose ps
```

**Salida esperada:**
```
NAME              STATUS            PORTS
sgmm_backend      Up 2 minutes (healthy)    0.0.0.0:3000->3000/tcp
sgmm_frontend     Up 2 minutes (healthy)    0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
sgmm_postgres     Up 2 minutes (healthy)    0.0.0.0:5432->5432/tcp
sgmm_redis        Up 2 minutes (healthy)    0.0.0.0:6379->6379/tcp
```

### 2. Verificar health del backend
```bash
curl http://localhost:3000/api/health
```

**Salida esperada:**
```json
{
  "status": "healthy",
  "timestamp": "...",
  "database": "connected"
}
```

### 3. Verificar endpoint de autenticación
```bash
curl -v http://localhost:3000/api/auth/me
```

**Salida esperada:**
```
< HTTP/1.1 401 Unauthorized
{
  "authenticated": false,
  "error": "No session token",
  "message": "No se encontró token de sesión..."
}
```

### 4. Verificar frontend
```bash
curl -I http://localhost:80
```

**Salida esperada:**
```
HTTP/1.1 200 OK
```

---

## 🧪 Prueba del Flujo Completo

### Paso 1: Abrir el navegador
```
http://localhost:80
```
o si estás en producción:
```
https://sgmm.portalapps.mx
```

### Paso 2: Verificar redirección a login
- ✅ Debe redirigir automáticamente a `/login`
- ✅ Debe mostrar botón "Iniciar Sesión con Google"

### Paso 3: Iniciar sesión
- Clic en "Iniciar Sesión con Google"
- Debe redirigir a Google
- Autenticarse con cuenta corporativa

### Paso 4: Verificar dashboard
- ✅ Debe redirigir a `/dashboard`
- ✅ Debe mostrar "Bienvenido, [Tu Nombre]"
- ✅ Debe mostrar tu email y número de empleado

### Paso 5: Verificar cookies en DevTools
- Abrir DevTools (F12)
- Application → Cookies
- ✅ Debe existir cookie `session_token`
- ✅ Debe ser `HttpOnly`

### Paso 6: Verificar navegación
- Navegar a otra ruta (ej: `/panel`)
- Recargar la página
- ✅ Sesión debe persistir (no pide login de nuevo)

### Paso 7: Probar logout
- Clic en "Cerrar Sesión"
- ✅ Debe redirigir a `/login`
- ✅ Cookie debe eliminarse

---

## 🐛 Troubleshooting

### Problema: "Cannot GET /api/auth/me"

**Causa:** Backend no está corriendo o no se desplegó correctamente.

**Solución:**
```bash
docker-compose logs backend --tail=100
docker-compose restart backend
```

### Problema: CORS Error

**Causa:** Frontend no puede comunicarse con backend.

**Solución:** Verificar que `CORS_ORIGIN` esté configurado:
```bash
# En docker-compose.yml, línea 55
CORS_ORIGIN=*
```

### Problema: Cookie no se establece

**Causa:** Dominio incorrecto o HTTPS faltante en producción.

**Solución:**
- En desarrollo (HTTP): OK
- En producción: DEBE usar HTTPS

### Problema: "Module not found" en frontend

**Causa:** Falta reconstruir frontend.

**Solución:**
```bash
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Problema: Backend no inicia

**Causa:** Error en migración de base de datos.

**Solución:**
```bash
# Ver logs
docker-compose logs backend --tail=200

# Entrar al contenedor y correr migraciones manualmente
docker exec -it sgmm_backend sh
npx prisma migrate deploy
exit
```

---

## 📊 Checklist Pre-Deploy

Antes de hacer deploy, verificar:

- [ ] Backend compilado sin errores (`npm run build`)
- [ ] Frontend compilado sin errores (`npm run build`)
- [ ] Tests del backend pasando (`npm test`)
- [ ] Variables de entorno configuradas
- [ ] Certificados SSL configurados (producción)
- [ ] Base de datos tiene datos de prueba

---

## 📊 Checklist Post-Deploy

Después de hacer deploy, verificar:

- [ ] Contenedores corriendo (`docker-compose ps`)
- [ ] Backend healthy (`curl http://localhost:3000/api/health`)
- [ ] Frontend accesible (`curl http://localhost:80`)
- [ ] Endpoint `/api/auth/me` responde 401 sin sesión
- [ ] Navegador redirige a `/login`
- [ ] Login con Google funciona
- [ ] Dashboard muestra datos del usuario
- [ ] Logout funciona
- [ ] Cookies se establecen correctamente

---

## 🔄 Rollback (Si algo falla)

Si el deploy falla y necesitas volver atrás:

```bash
# 1. Detener servicios nuevos
docker-compose down

# 2. Volver a la versión anterior del código (Git)
git log --oneline  # Ver commits
git checkout <commit-anterior>

# 3. Reconstruir con versión anterior
docker-compose build

# 4. Levantar de nuevo
docker-compose up -d
```

---

## 📝 Variables de Entorno Importantes

### Backend (`docker-compose.yml`)
```yaml
JWT_SECRET: Debe ser un secreto seguro
SESSION_SECRET: Debe ser un secreto seguro
SAML_ENTRY_POINT: URL de Google SAML
SAML_CERT: Certificado de Google
CORS_ORIGIN: * (desarrollo) o dominio específico (producción)
```

### Frontend (`.env`)
```bash
VITE_API_URL=https://sgmm.portalapps.mx
```

---

## 🚀 Deploy a Producción

### Consideraciones Adicionales

1. **HTTPS Obligatorio**
   - Certificados SSL deben estar activos
   - Cookies solo funcionan con HTTPS

2. **CORS Específico**
   - Cambiar `CORS_ORIGIN=*` a dominio específico

3. **Secretos Seguros**
   - Cambiar `JWT_SECRET` y `SESSION_SECRET`
   - Usar valores aleatorios fuertes

4. **Logs**
   - Configurar agregación de logs
   - Monitoreo de errores

---

## 📞 Soporte

Si encuentras problemas durante el deploy:

1. **Ver logs:** `docker-compose logs -f`
2. **Verificar salud:** `docker-compose ps`
3. **Reintentar:** `docker-compose restart [servicio]`

---

## ✅ Comando Todo-en-Uno (Quick Deploy)

```bash
cd /home/gcloud/proyecto_sgmm && \
docker-compose stop backend frontend && \
docker-compose build backend frontend && \
docker-compose up -d backend frontend && \
sleep 5 && \
docker-compose ps && \
curl http://localhost:3000/api/health
```

---

**¡Listo para deploy!** 🚀

