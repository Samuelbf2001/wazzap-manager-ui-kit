# 🚀 Configuración Completa de Base de Datos - WazzAp Manager

¡Perfecto! He preparado todo lo necesario para que tengas una base de datos completa funcionando para tu aplicación WazzAp Manager.

## 📋 ¿Qué se ha configurado?

### ✅ Base de Datos PostgreSQL
- **13 tablas** completas con todas las relaciones necesarias
- **Datos de ejemplo** listos para pruebas
- **Índices optimizados** para mejor rendimiento
- **Triggers automáticos** para timestamps
- **Funciones de auditoría** incluidas

### ✅ Cache Redis
- Configurado para sesiones y cache de datos
- Optimizado para alta performance

### ✅ Interfaz de Administración
- **Adminer** incluido para gestión visual de la BD
- Acceso web fácil e intuitivo

### ✅ Código Actualizado
- **DatabaseExecutor** actualizado para usar PostgreSQL real
- **Tipos TypeScript** completos para todas las tablas
- **Helper functions** para operaciones comunes

## 🚀 Pasos para Ejecutar

### 1. **Instalar Dependencias**
```bash
# Si usas npm
npm install

# Si usas bun (recomendado)
bun install
```

### 2. **Configurar Variables de Entorno**
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar las variables según tu entorno (opcional, los valores por defecto funcionan)
nano .env
```

### 3. **Levantar la Base de Datos**
```bash
# Ir al directorio de base de datos
cd database

# Ejecutar script de configuración automática
./setup.sh

# O manualmente:
# docker-compose up -d
```

### 4. **Verificar Conexión**
```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs si hay problemas
docker-compose logs -f

# Probar conexión a PostgreSQL
docker exec wazzap_postgres pg_isready -U wazzap_user -d wazzap_manager
```

### 5. **Acceder a la Interfaz Web**
- **Adminer**: http://localhost:8080
  - Servidor: `postgres`
  - Usuario: `wazzap_user`
  - Contraseña: `wazzap_password_2024`
  - Base de datos: `wazzap_manager`

### 6. **Ejecutar la Aplicación**
```bash
# Volver al directorio principal
cd ..

# Ejecutar en modo desarrollo
npm run dev
# o
bun dev
```

## 📊 Datos Incluidos

Tu base de datos ya tiene **datos de ejemplo** listos:

- **5 usuarios** de prueba
- **8 productos** (iPhone, Samsung, MacBook, etc.)
- **4 órdenes** de ejemplo
- **5 conversaciones** activas
- **9 mensajes** de prueba
- **4 agentes** de soporte
- **5 contactos** con datos completos
- **3 flujos** de trabajo configurados
- **6 respuestas** rápidas
- **Configuraciones** del sistema

## 🗄️ Estructura de Tablas

### Principales Entidades:
1. **`users`** - Usuarios del sistema
2. **`products`** - Catálogo de productos
3. **`orders`** - Pedidos y órdenes
4. **`conversation_threads`** - Hilos de conversación
5. **`messages`** - Mensajes individuales
6. **`contacts`** - Contactos/clientes
7. **`agents`** - Agentes de soporte
8. **`flows`** - Flujos de trabajo
9. **`flow_executions`** - Ejecuciones de flujos
10. **`quick_responses`** - Respuestas rápidas
11. **`system_settings`** - Configuraciones
12. **`audit_logs`** - Logs de auditoría

## 🔧 Comandos Útiles

### Gestión de Docker
```bash
# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Detener todo
docker-compose down

# Eliminar todo (¡CUIDADO! Borra datos)
docker-compose down -v
```

### Acceso Directo a PostgreSQL
```bash
# Conectar por línea de comandos
docker exec -it wazzap_postgres psql -U wazzap_user -d wazzap_manager

# Ejemplos de consultas
SELECT COUNT(*) FROM users;
SELECT * FROM products LIMIT 5;
SELECT * FROM conversation_threads WHERE status = 'active';
```

### Gestión de Datos
```bash
# Crear backup
docker exec wazzap_postgres pg_dump -U wazzap_user wazzap_manager > backup.sql

# Restaurar backup
docker exec -i wazzap_postgres psql -U wazzap_user -d wazzap_manager < backup.sql

# Reiniciar datos (volver a seed inicial)
docker-compose down -v
docker-compose up -d
```

## 🎯 Integración con tu Aplicación

El código ya está **100% integrado**:

- ✅ **DatabaseExecutor** usa PostgreSQL real
- ✅ **Tipos TypeScript** definidos para todas las tablas
- ✅ **Helper functions** para operaciones comunes
- ✅ **Variables de entorno** configuradas
- ✅ **Mock data** removido y reemplazado por BD real

### Ejemplo de uso en tu código:
```typescript
import { DatabaseHelpers } from '@/lib/database';

// Crear un usuario
const user = await DatabaseHelpers.createUser({
  name: 'Juan Pérez',
  email: 'juan@example.com',
  phone: '+525551234567'
});

// Obtener productos
const products = await DatabaseHelpers.getProducts({
  category: 'electronics',
  active: true
});

// Crear conversación
const thread = await DatabaseHelpers.createConversationThread({
  thread_id: 'thread_123',
  user_id: user.id,
  phone_number: '+525551234567'
});
```

## 🚨 Importante para Producción

Cuando vayas a producción, **cambia estos valores**:

1. **Contraseñas**: Genera contraseñas seguras únicas
2. **Variables de entorno**: Usa valores específicos de producción
3. **SSL**: Habilita conexiones SSL/TLS
4. **Backups**: Configura backups automáticos
5. **Monitoreo**: Configura alertas y logging

## 🆘 Solución de Problemas

### Puerto ocupado:
```bash
# Ver qué está usando el puerto 5432
sudo netstat -tlnp | grep :5432

# Cambiar puerto en docker-compose.yml si es necesario
```

### Docker no responde:
```bash
# Reiniciar Docker
sudo systemctl restart docker

# Limpiar contenedores
docker system prune -f
```

### Datos corruptos:
```bash
# Recrear desde cero
docker-compose down -v
docker volume rm $(docker volume ls -q | grep wazzap)
docker-compose up -d
```

## ✅ ¡Listo!

Tu base de datos está **100% configurada** y lista para usar. La aplicación ahora tiene:

- 🗄️ **Base de datos real** con PostgreSQL
- ⚡ **Cache rápido** con Redis  
- 🎨 **Interfaz de administración** con Adminer
- 📊 **Datos de ejemplo** para pruebas inmediatas
- 🔧 **Código integrado** y funcionando

**¡Disfruta desarrollando tu aplicación con una base de datos profesional!** 🎉