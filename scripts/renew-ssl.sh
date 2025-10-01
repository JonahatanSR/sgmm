#!/bin/bash

# Script para renovar certificados SSL
# Uso: ./scripts/renew-ssl.sh

set -e

echo "🔄 Renovando certificados SSL..."

# Renovar certificados
docker-compose run --rm certbot renew

# Recargar configuración de Nginx si los certificados fueron renovados
echo "🔄 Recargando configuración de Nginx..."
docker-compose exec frontend nginx -s reload

echo "✅ Renovación de certificados completada!"
