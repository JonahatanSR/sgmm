#!/bin/bash

echo "🚀 Iniciando Sistema SGMM..."

# Matar procesos existentes
killall npm tsx node 2>/dev/null
sleep 2

# Liberar puertos
sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null
sudo lsof -ti:8080 | xargs sudo kill -9 2>/dev/null

echo "✅ Puertos liberados"

# Verificar servicios Docker
cd /home/gcloud/proyecto_sgmm
docker-compose ps | grep "Up" || docker-compose up -d

echo "✅ Base de datos verificada"

# Iniciar backend
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!

# Iniciar frontend  
cd ../frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!

echo "✅ Servicios iniciados"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"

# Esperar que inicien
sleep 8

# Probar conectividad
echo "🔍 Probando conectividad..."

# Test backend
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Backend OK: http://34.122.229.40:3000"
else
    echo "❌ Backend falló"
fi

# Test frontend
if curl -s http://localhost:8080/ > /dev/null; then
    echo "✅ Frontend OK: http://34.122.229.40:8080"
else
    echo "❌ Frontend falló"
fi

echo ""
echo "📊 Estado final:"
echo "🔙 Backend: http://34.122.229.40:3000"
echo "🖥️  Frontend: http://34.122.229.40:8080"
echo ""
echo "Para ver logs:"
echo "  Backend: tail -f backend.log"
echo "  Frontend: tail -f frontend.log"





