# Base de Datos WazzAp Manager

Este directorio contiene toda la configuración necesaria para la base de datos de la aplicación WazzAp Manager.

## 🗄️ Tecnologías Utilizadas

- **PostgreSQL 15**: Base de datos principal
- **Redis 7**: Cache y sesiones
- **Docker & Docker Compose**: Containerización
- **Adminer**: Interfaz web para administración de BD

## 🚀 Configuración Rápida

### 1. Prerrequisitos

- Docker y Docker Compose instalados
- Puerto 5432 (PostgreSQL), 6379 (Redis), y 8080 (Adminer) disponibles

### 2. Levantar la Base de Datos

```bash
# Desde el directorio database/
chmod +x setup.sh
./setup.sh
```

O manualmente:

```bash
# Copiar variables de entorno
cp ../.env.example ../.env

# Levantar servicios
docker-compose up -d

# Verificar estado
docker-compose ps
```

### 3. Acceder a la Base de Datos

**Adminer (Interfaz Web):**
- URL: http://localhost:8080
- Servidor: `postgres`
- Usuario: `wazzap_user`
- Contraseña: `wazzap_password_2024`
- Base de datos: `wazzap_manager`

**Línea de comandos:**
```bash
docker exec -it wazzap_postgres psql -U wazzap_user -d wazzap_manager
```

## 📊 Estructura de la Base de Datos

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios del sistema |
| `products` | Catálogo de productos |
| `orders` | Pedidos y órdenes |
| `conversation_threads` | Hilos de conversación |
| `messages` | Mensajes individuales |
| `contacts` | Contactos/clientes |
| `agents` | Agentes de soporte |
| `flows` | Flujos de trabajo |
| `flow_executions` | Ejecuciones de flujos |
| `quick_responses` | Respuestas rápidas |
| `system_settings` | Configuraciones del sistema |
| `audit_logs` | Logs de auditoría |

### Relaciones Clave

- `users` ← `conversation_threads` (1:N)
- `conversation_threads` ← `messages` (1:N)
- `conversation_threads` ← `conversation_steps` (1:N)
- `flows` ← `flow_executions` (1:N)
- `users` ← `contacts` (1:1 opcional)

## 📝 Datos de Ejemplo

La base de datos se carga automáticamente con datos de ejemplo que incluyen:

- 5 usuarios de prueba
- 8 productos (iPhone, Samsung, MacBook, etc.)
- 4 órdenes de ejemplo
- 5 conversaciones activas
- 9 mensajes de prueba
- 4 agentes de soporte
- 5 contactos
- 3 flujos de trabajo
- 6 respuestas rápidas
- Configuraciones del sistema

## 🔧 Comandos Útiles

### Docker Compose

```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f postgres

# Detener servicios
docker-compose down

# Reiniciar servicios
docker-compose restart

# Eliminar volúmenes (¡CUIDADO! Elimina todos los datos)
docker-compose down -v
```

### PostgreSQL

```bash
# Conectar a la base de datos
docker exec -it wazzap_postgres psql -U wazzap_user -d wazzap_manager

# Ejecutar un archivo SQL
docker exec -i wazzap_postgres psql -U wazzap_user -d wazzap_manager < archivo.sql

# Crear backup
docker exec wazzap_postgres pg_dump -U wazzap_user wazzap_manager > backup.sql

# Restaurar backup
docker exec -i wazzap_postgres psql -U wazzap_user -d wazzap_manager < backup.sql
```

### Redis

```bash
# Conectar a Redis
docker exec -it wazzap_redis redis-cli -a redis_password_2024

# Ver todas las llaves
docker exec wazzap_redis redis-cli -a redis_password_2024 KEYS "*"

# Limpiar cache
docker exec wazzap_redis redis-cli -a redis_password_2024 FLUSHALL
```

## 🗂️ Archivos

- `schema.sql`: Esquema completo de la base de datos
- `seed.sql`: Datos de ejemplo
- `docker-compose.yml`: Configuración de servicios
- `setup.sh`: Script de configuración automática
- `README.md`: Esta documentación

## 🔒 Variables de Entorno

Las siguientes variables deben estar configuradas en tu archivo `.env`:

```env
# Base de datos PostgreSQL
DATABASE_URL=postgresql://wazzap_user:wazzap_password_2024@localhost:5432/wazzap_manager
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wazzap_manager
DB_USER=wazzap_user
DB_PASSWORD=wazzap_password_2024

# Redis
REDIS_URL=redis://:redis_password_2024@localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password_2024
```

## 🚨 Seguridad

**⚠️ IMPORTANTE para Producción:**

1. Cambia todas las contraseñas por defecto
2. Usa variables de entorno seguras
3. Habilita SSL/TLS para las conexiones
4. Configura backups automáticos
5. Restringe acceso de red a las bases de datos
6. Actualiza regularmente las imágenes de Docker

## 🔄 Migraciones

Para futuras actualizaciones del esquema:

1. Crea archivos de migración numerados: `001_nueva_tabla.sql`
2. Aplica migraciones en orden secuencial
3. Registra cambios en `audit_logs`
4. Crea backups antes de aplicar migraciones

## 📞 Soporte

Si tienes problemas:

1. Verifica que Docker esté corriendo: `docker ps`
2. Revisa los logs: `docker-compose logs -f`
3. Verifica puertos disponibles: `netstat -tlnp | grep :5432`
4. Reinicia los servicios: `docker-compose restart`

## 🧪 Pruebas

Para ejecutar pruebas de conexión:

```bash
# Probar PostgreSQL
docker exec wazzap_postgres pg_isready -U wazzap_user -d wazzap_manager

# Probar Redis
docker exec wazzap_redis redis-cli -a redis_password_2024 ping

# Contar registros en una tabla
docker exec wazzap_postgres psql -U wazzap_user -d wazzap_manager -c "SELECT COUNT(*) FROM users;"
```