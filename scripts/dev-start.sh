#!/bin/bash

# 🚀 Script de inicio para desarrollo optimizado
# Mantiene producción corriendo y inicia desarrollo en paralelo

echo "🚀 Iniciando desarrollo optimizado..."

# Verificar que producción esté corriendo
if ! docker-compose ps | grep -q "sgmm_backend.*Up"; then
    echo "⚠️  Producción no está corriendo. Iniciando producción primero..."
    docker-compose up -d
    echo "⏳ Esperando que producción esté lista..."
    sleep 30
fi

# Iniciar desarrollo optimizado
echo "🔧 Iniciando entorno de desarrollo optimizado..."
docker-compose -f docker-compose.dev-optimized.yml up -d --build

echo "⏳ Esperando que servicios estén listos..."
sleep 15

# Verificar estado
echo "📊 Estado de servicios:"
docker-compose -f docker-compose.dev-optimized.yml ps

echo ""
echo "✅ Desarrollo optimizado iniciado!"
echo "🌐 Frontend: http://localhost:8080 (con hot reload)"
echo "🔧 Backend: http://localhost:3000 (con hot reload)"
echo "🗄️  Base de datos: localhost:5432 (misma que producción)"
echo ""
echo "📝 Comandos útiles:"
echo "  Ver logs: docker-compose -f docker-compose.dev-optimized.yml logs -f"
echo "  Parar dev: docker-compose -f docker-compose.dev-optimized.yml down"
echo "  Rebuild: docker-compose -f docker-compose.dev-optimized.yml up -d --build"
