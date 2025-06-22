#!/bin/bash

# Script de configuración para base de datos WazzAp Manager
# Ejecuta Docker Compose para levantar PostgreSQL, Redis y Adminer

echo "🚀 Configurando base de datos WazzAp Manager..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    echo "   Visita: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    echo "   Visita: https://docs.docker.com/compose/install/"
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f "../.env" ]; then
    echo "📝 Creando archivo .env..."
    cp ../.env.example ../.env
    echo "✅ Archivo .env creado. Por favor configura las variables según tu entorno."
fi

# Detener contenedores existentes si están corriendo
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down

# Crear volúmenes si no existen
echo "📦 Creando volúmenes..."
docker volume create wazzap_postgres_data 2>/dev/null || true
docker volume create wazzap_redis_data 2>/dev/null || true

# Levantar servicios
echo "🐳 Levantando servicios de base de datos..."
docker-compose up -d

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
timeout=60
counter=0

while ! docker exec wazzap_postgres pg_isready -U wazzap_user -d wazzap_manager > /dev/null 2>&1; do
    sleep 2
    counter=$((counter + 2))
    if [ $counter -ge $timeout ]; then
        echo "❌ Timeout esperando PostgreSQL. Verifica los logs con: docker-compose logs postgres"
        exit 1
    fi
    echo "   Esperando... ($counter/$timeout segundos)"
done

echo "✅ PostgreSQL está listo!"

# Verificar que Redis esté funcionando
echo "⏳ Verificando Redis..."
if docker exec wazzap_redis redis-cli -a redis_password_2024 ping > /dev/null 2>&1; then
    echo "✅ Redis está funcionando!"
else
    echo "⚠️  Redis puede no estar funcionando correctamente. Verifica los logs."
fi

# Mostrar información de conexión
echo ""
echo "🎉 ¡Base de datos configurada exitosamente!"
echo ""
echo "📊 Información de conexión:"
echo "   PostgreSQL:"
echo "     Host: localhost"
echo "     Puerto: 5432"
echo "     Base de datos: wazzap_manager"
echo "     Usuario: wazzap_user"
echo "     Contraseña: wazzap_password_2024"
echo ""
echo "   Redis:"
echo "     Host: localhost"
echo "     Puerto: 6379"
echo "     Contraseña: redis_password_2024"
echo ""
echo "   Adminer (Interfaz web para BD):"
echo "     URL: http://localhost:8080"
echo "     Servidor: postgres"
echo "     Usuario: wazzap_user"
echo "     Contraseña: wazzap_password_2024"
echo "     Base de datos: wazzap_manager"
echo ""
echo "🛠️  Comandos útiles:"
echo "   Ver logs: docker-compose logs -f"
echo "   Detener: docker-compose down"
echo "   Reiniciar: docker-compose restart"
echo "   Entrar a PostgreSQL: docker exec -it wazzap_postgres psql -U wazzap_user -d wazzap_manager"
echo ""
echo "📚 La base de datos ya incluye datos de ejemplo para pruebas."