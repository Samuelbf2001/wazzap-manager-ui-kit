# Dockerfile optimizado para EasyPanel - WhatsApp Manager UI Kit
# Multi-stage build para optimizar el tamaño de la imagen

# Etapa 1: Build
FROM node:18-alpine AS builder

# Instalar dependencias del sistema
RUN apk add --no-cache git

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Build de producción
RUN npm run build:prod

# Etapa 2: Producción
FROM node:18-alpine AS production

# Instalar serve globalmente
RUN npm install -g serve

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos build desde la etapa anterior
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 8081

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=8081

# Comando para servir la aplicación
CMD ["serve", "-s", "dist", "-l", "8081"]

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8081 || exit 1
