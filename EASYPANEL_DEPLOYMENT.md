# 🚀 Guía de Despliegue en EasyPanel - WhatsApp Manager UI Kit

## 📋 Preparación para EasyPanel

### 1. Archivos Necesarios (Ya Creados)
✅ `Dockerfile` - Configuración de contenedor optimizada
✅ `docker-compose.easypanel.yml` - Configuración de servicios
✅ Variables de entorno listas para copiar

### 2. Variables de Entorno para EasyPanel

Copia estas variables en la sección "Environment Variables" de EasyPanel:

```env
# Evolution API Configuration
EVOLUTION_API_URL=https://tu-evolution-api.easypanel.host
EVOLUTION_API_KEY=tu-api-key-segura-aqui

# HubSpot Configuration (opcional)
HUBSPOT_API_KEY=tu-hubspot-key-aqui
HUBSPOT_PORTAL_ID=tu-portal-id-aqui

# Production URLs
PRODUCTION_URL=https://tu-dominio.easypanel.host
WEBHOOK_URL=https://tu-dominio.easypanel.host/api/webhook

# App Configuration
VITE_APP_TITLE=WhatsApp Manager UI Kit
VITE_APP_VERSION=1.0.0
NODE_ENV=production
PORT=8081
```

## 🎯 Pasos para Desplegar en EasyPanel

### Paso 1: Preparar el Repositorio
```bash
# Asegúrate de que todos los archivos estén en tu repositorio
git add .
git commit -m "Configuración para EasyPanel"
git push origin main
```

### Paso 2: Crear Nueva Aplicación en EasyPanel

1. **Accede a tu panel de EasyPanel**
2. **Clic en "New Project"**
3. **Selecciona "From Git Repository"**
4. **Conecta tu repositorio GitHub**

### Paso 3: Configurar la Aplicación

#### Configuración Básica:
- **Name**: `whatsapp-manager-ui`
- **Type**: `Web Service`
- **Source**: Tu repositorio GitHub
- **Branch**: `main`

#### Configuración de Build:
- **Build Command**: `npm run build:prod`
- **Start Command**: `serve -s dist -l 8081`
- **Port**: `8081`

#### Configuración de Docker:
- **Dockerfile**: Usar el Dockerfile incluido
- **Context**: `/` (raíz del proyecto)

### Paso 4: Configurar Variables de Entorno

En la sección "Environment Variables" de EasyPanel, agrega:

```env
EVOLUTION_API_URL=https://tu-evolution-api.easypanel.host
EVOLUTION_API_KEY=tu-api-key-segura
PRODUCTION_URL=https://tu-dominio.easypanel.host
WEBHOOK_URL=https://tu-dominio.easypanel.host/api/webhook
VITE_APP_TITLE=WhatsApp Manager UI Kit
NODE_ENV=production
PORT=8081
```

### Paso 5: Configurar Dominio

1. **Ve a "Domains" en tu aplicación**
2. **Agrega tu dominio personalizado**
3. **Configura SSL automático**

### Paso 6: Desplegar

1. **Clic en "Deploy"**
2. **Espera a que termine el build** (5-10 minutos)
3. **Verifica que la aplicación esté funcionando**

## 🔧 Configuración Avanzada

### Configuración de Recursos
```yaml
# En EasyPanel, configura:
CPU: 0.5 cores
Memory: 512MB
Storage: 1GB
```

### Configuración de Red
```yaml
# Puertos expuestos:
Port: 8081
Protocol: HTTP
```

### Health Check
```yaml
# EasyPanel detectará automáticamente:
Path: /
Port: 8081
Timeout: 30s
```

## 🚨 Solución de Problemas Comunes

### Error: "Build failed"
```bash
# Verifica que el Dockerfile esté en la raíz
# Asegúrate de que package.json tenga los scripts correctos
```

### Error: "Environment variables not found"
- Verifica que las variables estén configuradas en EasyPanel
- Asegúrate de que empiecen con `VITE_` para las del frontend

### Error: "Port not accessible"
- Verifica que el puerto 8081 esté configurado
- Asegúrate de que la aplicación esté escuchando en 0.0.0.0:8081

### Error: "CORS policy"
- Configura las URLs correctas en las variables de entorno
- Verifica que Evolution API esté configurado correctamente

## 📊 Monitoreo y Logs

### Ver Logs en EasyPanel
1. Ve a tu aplicación
2. Clic en "Logs"
3. Selecciona el servicio
4. Revisa los logs en tiempo real

### Métricas Importantes
- **CPU Usage**: Debe estar < 80%
- **Memory Usage**: Debe estar < 512MB
- **Response Time**: Debe estar < 2 segundos

## 🔄 Actualizaciones

### Despliegue Automático
1. Conecta tu repositorio GitHub
2. Configura webhook para auto-deploy
3. Cada push a `main` desplegará automáticamente

### Despliegue Manual
1. Ve a tu aplicación en EasyPanel
2. Clic en "Deploy"
3. Selecciona la rama/commit
4. Clic en "Deploy"

## 🌐 Configuración de Dominio Personalizado

### Con EasyPanel Subdomain
```
https://tu-app.easypanel.host
```

### Con Dominio Personalizado
```
https://tu-dominio.com
```

### Configuración DNS
```
A Record: tu-dominio.com → IP de EasyPanel
CNAME: www.tu-dominio.com → tu-app.easypanel.host
```

## 🔒 Seguridad

### Variables Sensibles
- Nunca expongas API keys en el código
- Usa variables de entorno para todo
- Rota las claves regularmente

### HTTPS
- EasyPanel proporciona SSL automático
- Configura redirects HTTP → HTTPS

## 📈 Optimizaciones

### Performance
- Usa CDN para assets estáticos
- Configura compresión gzip
- Optimiza imágenes

### Costos
- Monitorea el uso de recursos
- Configura auto-scaling si es necesario
- Usa caché para reducir requests

## 🆘 Soporte

### Logs de Debug
```bash
# En EasyPanel, revisa:
- Build logs
- Runtime logs
- Error logs
```

### Contacto
- EasyPanel Support: [Documentación](https://easypanel.io/docs)
- GitHub Issues: Para problemas del código
- Discord: Para soporte de la comunidad

---

**¡Tu aplicación estará funcionando en EasyPanel siguiendo estos pasos!** 🎉

### Resumen Rápido:
1. ✅ Archivos de configuración creados
2. 🔧 Configura variables de entorno
3. 🚀 Despliega en EasyPanel
4. 🌐 Configura dominio
5. ✅ ¡Listo para el público!
