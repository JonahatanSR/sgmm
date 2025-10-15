#!/bin/bash

# ⚡ Script para desarrollo rápido (solo rebuild cuando sea necesario)

echo "⚡ Desarrollo rápido iniciado..."

# Verificar si hay cambios en código
if [ "$1" = "--force" ] || [ "$1" = "-f" ]; then
    echo "🔄 Rebuild forzado..."
    docker-compose -f docker-compose.dev-optimized.yml up -d --build
else
    echo "🔍 Verificando cambios..."
    # Solo rebuild si hay cambios en package.json o Dockerfiles
    if [ "./backend/package.json" -nt "./backend/Dockerfile.dev-optimized" ] || \
       [ "./frontend/package.json" -nt "./frontend/Dockerfile.dev-optimized" ]; then
        echo "📦 Cambios detectados en dependencias. Rebuilding..."
        docker-compose -f docker-compose.dev-optimized.yml up -d --build
    else
        echo "✅ Sin cambios en dependencias. Solo restarting..."
        docker-compose -f docker-compose.dev-optimized.yml restart
    fi
fi

echo "📊 Estado actual:"
docker-compose -f docker-compose.dev-optimized.yml ps

echo ""
echo "🎯 URLs de desarrollo:"
echo "  Frontend: http://localhost:8080"
echo "  Backend: http://localhost:3000"
echo "  Logs: docker-compose -f docker-compose.dev-optimized.yml logs -f"
