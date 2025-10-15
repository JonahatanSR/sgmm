#!/bin/bash

# Script de Rebuild Seguro para SGMM
# Protege la base de datos durante rebuilds

echo "🛡️  INICIANDO REBUILD SEGURO DE SGMM"
echo "======================================"

# 1. Crear backup de la base de datos
echo "📦 Creando backup de la base de datos..."
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
docker-compose exec -T postgres pg_dump -U sgmm_user -d sgmm_db > "$BACKUP_FILE"
echo "✅ Backup creado: $BACKUP_FILE"

# 2. Verificar que el backup se creó correctamente
if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    echo "✅ Backup verificado correctamente"
else
    echo "❌ Error: No se pudo crear el backup"
    exit 1
fi

# 3. Parar solo el frontend (no tocar la base de datos)
echo "🔄 Parando solo el frontend..."
docker-compose stop frontend

# 4. Rebuild del frontend sin cache
echo "🔨 Rebuild del frontend..."
docker-compose build --no-cache frontend

# 5. Iniciar el frontend
echo "🚀 Iniciando frontend..."
docker-compose up -d frontend

# 6. Verificar que todo esté funcionando
echo "🔍 Verificando servicios..."
sleep 5
docker-compose ps

echo ""
echo "✅ REBUILD SEGURO COMPLETADO"
echo "📦 Backup disponible en: $BACKUP_FILE"
echo "🔗 Para restaurar si es necesario:"
echo "   docker-compose exec -T postgres psql -U sgmm_user -d sgmm_db < $BACKUP_FILE"
echo ""
