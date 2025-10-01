#!/bin/bash

echo "🚀 Iniciando Sistema SGMM en Producción..."

# Detener servicios existentes
echo "🛑 Deteniendo servicios existentes..."
docker-compose down
killall npm tsx node 2>/dev/null

# Limpiar contenedores y volúmenes huérfanos
echo "🧹 Limpiando sistema..."
docker system prune -f
docker volume prune -f

# Construir e iniciar todos los servicios
echo "🔨 Construyendo servicios..."
docker-compose build --no-cache

echo "🚀 Iniciando servicios..."
docker-compose up -d

# Esperar que los servicios estén healthy
echo "⏳ Esperando que los servicios inicien..."
sleep 30

# Verificar estado
echo "📊 Verificando estado de servicios..."
docker-compose ps

echo ""
echo "🔍 Health checks:"

# Test PostgreSQL
if docker exec sgmm_postgres pg_isready -U sgmm_user > /dev/null 2>&1; then
    echo "✅ PostgreSQL: Healthy"
else
    echo "❌ PostgreSQL: Failed"
fi

# Test Redis
if docker exec sgmm_redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: Healthy"
else
    echo "❌ Redis: Failed"
fi

# Test Backend
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Backend: Healthy"
else
    echo "❌ Backend: Failed"
fi

# Test Frontend
if curl -s http://localhost:8080/ > /dev/null; then
    echo "✅ Frontend: Healthy"
else
    echo "❌ Frontend: Failed"
fi

echo ""
echo "🌐 URLs públicas:"
echo "🔙 Backend:  http://34.122.229.40:3000"
echo "🖥️  Frontend: http://34.122.229.40:8080"
echo ""
echo "📊 Para monitorear:"
echo "  docker-compose logs -f backend"
echo "  docker-compose logs -f frontend"
echo "  docker-compose ps"




