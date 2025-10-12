# 🚀 Guía de Despliegue - WhatsApp Manager UI Kit

## 📋 Preparación Previa

### 1. Variables de Entorno Requeridas

Crea un archivo `.env` en la raíz del proyecto con:

```env
# Evolution API - Configuración principal
VITE_EVOLUTION_API_URL=https://tu-evolution-api.com
VITE_EVOLUTION_API_KEY=tu-api-key-segura

# HubSpot Integration (opcional)
VITE_HUBSPOT_API_KEY=tu-hubspot-key
VITE_HUBSPOT_PORTAL_ID=tu-portal-id

# URLs de Producción
VITE_PRODUCTION_URL=https://tu-dominio.com
VITE_WEBHOOK_URL=https://tu-dominio.com/api/webhook

# Configuración de la Aplicación
VITE_APP_TITLE=WhatsApp Manager UI Kit
VITE_APP_VERSION=1.0.0
```

### 2. Verificar Dependencias

```bash
npm install
npm run lint
```

## 🌐 Opciones de Despliegue

### Opción A: Vercel (Recomendado)

1. **Instalar Vercel CLI:**
```bash
npm i -g vercel
```

2. **Desplegar:**
```bash
vercel
```

3. **Configurar Variables de Entorno en Vercel:**
   - Ve a tu proyecto en Vercel Dashboard
   - Settings → Environment Variables
   - Agrega todas las variables del `.env`

4. **Configurar Dominio Personalizado:**
   - Settings → Domains
   - Agrega tu dominio personalizado

### Opción B: Netlify

1. **Instalar Netlify CLI:**
```bash
npm i -g netlify-cli
```

2. **Build y Desplegar:**
```bash
npm run build:prod
netlify deploy --prod --dir=dist
```

3. **Configurar Variables de Entorno:**
   - Site Settings → Environment Variables
   - Agrega las variables necesarias

### Opción C: Railway

1. **Conectar con GitHub:**
   - Conecta tu repositorio con Railway
   - Railway detectará automáticamente que es un proyecto Vite

2. **Configurar Variables:**
   - Variables → Add Variable
   - Agrega todas las variables de entorno

3. **Desplegar:**
   - Railway desplegará automáticamente

### Opción D: DigitalOcean App Platform

1. **Crear App:**
   - New App → Source Code
   - Conecta tu repositorio GitHub

2. **Configurar Build:**
   - Build Command: `npm run build:prod`
   - Run Command: `npm run start`
   - Output Directory: `dist`

3. **Variables de Entorno:**
   - Settings → App-Level Environment Variables
   - Agrega las variables necesarias

## 🔧 Comandos de Despliegue Local

### Build de Producción
```bash
npm run build:prod
```

### Preview Local
```bash
npm run preview
```

### Servidor de Producción
```bash
npm run start
```

## 📊 Verificación Post-Despliegue

### 1. Verificar Funcionalidades
- [ ] La aplicación carga correctamente
- [ ] Las conexiones a Evolution API funcionan
- [ ] Los webhooks están configurados
- [ ] Las integraciones con HubSpot funcionan

### 2. Pruebas de Rendimiento
- [ ] Tiempo de carga < 3 segundos
- [ ] Responsive design funciona
- [ ] No hay errores en consola

### 3. Seguridad
- [ ] HTTPS configurado
- [ ] Variables de entorno seguras
- [ ] No hay información sensible expuesta

## 🚨 Solución de Problemas Comunes

### Error: "Module not found"
```bash
npm install
npm run build:prod
```

### Error: "Environment variables not found"
- Verifica que las variables estén configuradas en la plataforma
- Asegúrate de que empiecen con `VITE_`

### Error: "CORS policy"
- Configura los headers CORS en tu servidor
- Verifica las URLs en las variables de entorno

### Error: "Build failed"
```bash
npm run lint
# Corrige los errores de linting
npm run build:prod
```

## 📈 Optimizaciones de Producción

### 1. Compresión
- Configura gzip/brotli en tu servidor
- Usa CDN para assets estáticos

### 2. Caché
- Configura headers de caché apropiados
- Usa service workers si es necesario

### 3. Monitoreo
- Configura herramientas de monitoreo (Sentry, LogRocket)
- Implementa analytics (Google Analytics, Mixpanel)

## 🔄 Actualizaciones Futuras

### Despliegue Automático
1. Configura GitHub Actions o CI/CD
2. Despliega automáticamente en cada push a main
3. Configura tests automáticos

### Backup y Recuperación
1. Configura backups automáticos
2. Documenta el proceso de recuperación
3. Prueba la recuperación regularmente

## 📞 Soporte

Si encuentras problemas durante el despliegue:

1. Revisa los logs de la plataforma
2. Verifica las variables de entorno
3. Consulta la documentación de la plataforma
4. Contacta al soporte técnico

---

**¡Tu aplicación estará lista para el público siguiendo estos pasos!** 🎉
