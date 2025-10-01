#!/bin/bash

# Script para inicializar certificados SSL con Certbot
# Uso: ./scripts/init-ssl.sh

set -e

echo "🔐 Inicializando certificados SSL para sgmm.portalapps.mx..."

# Verificar que el dominio esté configurado
DOMAIN="sgmm.portalapps.mx"
EMAIL="admin@sgmm.portalapps.mx"

# Crear directorios necesarios
mkdir -p data/certbot/conf
mkdir -p data/certbot/www

# Iniciar solo los servicios necesarios para el desafío
echo "📦 Iniciando servicios para desafío SSL..."
docker-compose up -d postgres redis backend

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Iniciar el frontend sin SSL (para el desafío)
echo "🌐 Iniciando frontend para desafío SSL..."
docker-compose up -d frontend

# Esperar a que Nginx esté listo
echo "⏳ Esperando a que Nginx esté listo..."
sleep 5

# Ejecutar Certbot para obtener certificados
echo "🔒 Obteniendo certificados SSL..."
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d $DOMAIN

# Verificar que los certificados se crearon
if [ -f "data/certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "✅ Certificados SSL obtenidos exitosamente!"
    echo "📁 Ubicación: data/certbot/conf/live/$DOMAIN/"
    
    # Reiniciar el frontend con SSL habilitado
    echo "🔄 Reiniciando frontend con SSL..."
    docker-compose restart frontend
    
    echo "🎉 ¡HTTPS configurado exitosamente!"
    echo "🌐 Accede a: https://$DOMAIN"
else
    echo "❌ Error: No se pudieron obtener los certificados SSL"
    echo "🔍 Verifica que:"
    echo "   - El dominio $DOMAIN apunte a este servidor"
    echo "   - Los puertos 80 y 443 estén abiertos"
    echo "   - No haya otros servicios usando estos puertos"
    exit 1
fi

echo "📝 Para renovar certificados automáticamente, puedes usar:"
echo "   docker-compose run --rm certbot renew"
