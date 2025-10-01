# Configuración HTTPS con Certbot

Este documento describe cómo configurar HTTPS con certificados SSL automáticos usando Certbot y Let's Encrypt.

## 📋 Prerrequisitos

1. **Dominio configurado**: El dominio `sgmm.portalapps.mx` debe apuntar a la IP del servidor
2. **Puertos abiertos**: Los puertos 80 y 443 deben estar abiertos en el firewall
3. **Docker y Docker Compose**: Instalados y funcionando

## 🚀 Configuración Inicial

### 1. Preparar el entorno

```bash
# Crear directorios necesarios
mkdir -p data/certbot/conf data/certbot/www

# Dar permisos al script
chmod +x scripts/init-ssl.sh
```

### 2. Obtener certificados SSL

```bash
# Ejecutar script de inicialización
./scripts/init-ssl.sh
```

Este script:
- Inicia los servicios necesarios
- Ejecuta Certbot para obtener certificados
- Configura Nginx con HTTPS
- Verifica que todo funcione correctamente

### 3. Verificar la configuración

```bash
# Verificar que el sitio funciona con HTTPS
curl -I https://sgmm.portalapps.mx

# Verificar certificados
openssl s_client -connect sgmm.portalapps.mx:443 -servername sgmm.portalapps.mx
```

## 🔄 Renovación Automática

Los certificados SSL de Let's Encrypt expiran cada 90 días. Para renovarlos:

### Renovación manual

```bash
./scripts/renew-ssl.sh
```

### Renovación automática con cron

Agregar al crontab para renovación automática:

```bash
# Editar crontab
crontab -e

# Agregar línea para renovar cada 2 meses a las 3:00 AM
0 3 1 */2 * /home/gcloud/proyecto_sgmm/scripts/renew-ssl.sh
```

## 🔧 Configuración del Servicio

### Servicios Docker Compose

- **frontend**: Nginx con HTTPS habilitado
- **certbot**: Servicio para obtener y renovar certificados SSL
- **backend**: API backend (sin cambios)

### Puertos

- **80**: HTTP (redirige a HTTPS)
- **443**: HTTPS (tráfico principal)

### Volúmenes

- `./data/certbot/conf`: Certificados SSL
- `./data/certbot/www`: Archivos de desafío para Let's Encrypt

## 🛠️ Solución de Problemas

### Error: "Domain not pointing to this server"

```bash
# Verificar DNS
dig sgmm.portalapps.mx
nslookup sgmm.portalapps.mx

# Verificar que el puerto 80 responde
curl -I http://sgmm.portalapps.mx
```

### Error: "Port 80 already in use"

```bash
# Verificar qué proceso usa el puerto 80
sudo netstat -tlnp | grep :80
sudo lsof -i :80

# Detener servicios que usen el puerto
sudo systemctl stop apache2  # si está instalado
sudo systemctl stop nginx    # si está instalado
```

### Error: "Certificate already exists"

```bash
# Limpiar certificados existentes
rm -rf data/certbot/conf/live/sgmm.portalapps.mx
rm -rf data/certbot/conf/archive/sgmm.portalapps.mx

# Ejecutar nuevamente el script
./scripts/init-ssl.sh
```

## 📁 Estructura de Archivos

```
proyecto_sgmm/
├── docker-compose.yml          # Configuración con Certbot
├── frontend/
│   ├── nginx.conf             # Configuración HTTPS
│   └── Dockerfile             # Nginx con puertos 80/443
├── scripts/
│   ├── init-ssl.sh            # Script de inicialización
│   └── renew-ssl.sh           # Script de renovación
├── data/
│   └── certbot/
│       ├── conf/              # Certificados SSL
│       └── www/               # Archivos de desafío
└── HTTPS-SETUP.md             # Este archivo
```

## 🔒 Configuración de Seguridad

El archivo `nginx.conf` incluye:

- **SSL/TLS**: Protocolos seguros (TLSv1.2, TLSv1.3)
- **HSTS**: HTTP Strict Transport Security
- **CORS**: Configurado para HTTPS
- **Security Headers**: X-Frame-Options, CSP, etc.
- **Redirect**: HTTP → HTTPS automático

## 📞 Soporte

Si encuentras problemas:

1. Verifica los logs: `docker-compose logs frontend`
2. Revisa el estado de los servicios: `docker-compose ps`
3. Consulta este documento de solución de problemas
4. Verifica que el dominio apunte correctamente al servidor
