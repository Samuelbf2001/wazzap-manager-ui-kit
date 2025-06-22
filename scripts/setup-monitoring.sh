#!/bin/bash

# 🔧 SETUP DEL SISTEMA DE MONITOREO AUTOMATIZADO
# 
# Este script configura el monitoreo automático que se ejecuta cada 12 horas
# para validar cambios en el código y actualizar la revisión.

set -e

echo "🔧 Configurando sistema de monitoreo automatizado..."

# Crear directorio de scripts si no existe
mkdir -p scripts
mkdir -p logs

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
fi

# Verificar que el script de monitoreo exista
if [ ! -f "scripts/monitor-changes.js" ]; then
    echo "❌ Script de monitoreo no encontrado en scripts/monitor-changes.js"
    exit 1
fi

# Hacer el script ejecutable
chmod +x scripts/monitor-changes.js

# Crear script wrapper para cron
cat > scripts/run-monitoring.sh << 'EOF'
#!/bin/bash

# Script wrapper para ejecutar el monitoreo desde cron
# Redirige output a logs con timestamp

cd "$(dirname "$0")/.."
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
LOG_FILE="logs/monitoring_${TIMESTAMP}.log"

echo "🔍 Iniciando monitoreo automatizado - $(date)" | tee -a "$LOG_FILE"

# Ejecutar el script de monitoreo
node scripts/monitor-changes.js 2>&1 | tee -a "$LOG_FILE"

# Limpiar logs antiguos (mantener solo los últimos 30 días)
find logs -name "monitoring_*.log" -mtime +30 -delete

echo "✅ Monitoreo completado - $(date)" | tee -a "$LOG_FILE"
EOF

chmod +x scripts/run-monitoring.sh

# Detectar el sistema operativo y configurar cron
case "$OSTYPE" in
  linux*|darwin*)
    echo "🐧 Configurando cron job para Linux/macOS..."
    
    # Crear entrada de cron (ejecutar cada 12 horas)
    CRON_ENTRY="0 */12 * * * cd $(pwd) && bash scripts/run-monitoring.sh"
    
    # Verificar si ya existe la entrada
    if ! crontab -l 2>/dev/null | grep -q "run-monitoring.sh"; then
        # Agregar nueva entrada preservando las existentes
        (crontab -l 2>/dev/null || true; echo "$CRON_ENTRY") | crontab -
        echo "✅ Cron job configurado: cada 12 horas"
        echo "   Para verificar: crontab -l"
        echo "   Para eliminar: crontab -e"
    else
        echo "⚠️  Cron job ya existe. Para reconfigurar ejecuta: crontab -e"
    fi
    ;;
    
  msys*|cygwin*|win*)
    echo "🪟 Sistema Windows detectado..."
    echo "⚠️  En Windows, necesitas configurar manualmente:"
    echo "   1. Usar Programador de Tareas (Task Scheduler)"
    echo "   2. O ejecutar manualmente: npm run monitor:start"
    echo "   3. O usar WSL con cron"
    ;;
    
  *)
    echo "❓ Sistema operativo no reconocido: $OSTYPE"
    echo "   Configura manualmente la ejecución periódica de:"
    echo "   bash scripts/run-monitoring.sh"
    ;;
esac

# Crear configuración de npm scripts si no existe
if [ -f "package.json" ]; then
    echo "📦 Agregando scripts npm..."
    
    # Verificar si ya existe la sección scripts
    if ! grep -q '"monitor:' package.json; then
        # Crear backup
        cp package.json package.json.backup
        
        # Agregar scripts de monitoreo
        node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        if (!pkg.scripts) pkg.scripts = {};
        
        pkg.scripts['monitor:run'] = 'node scripts/monitor-changes.js';
        pkg.scripts['monitor:start'] = 'node scripts/monitor-changes.js --continuous';
        pkg.scripts['monitor:setup'] = 'bash scripts/setup-monitoring.sh';
        pkg.scripts['monitor:logs'] = 'tail -f logs/monitoring_*.log';
        
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
        "
        
        echo "✅ Scripts npm agregados:"
        echo "   npm run monitor:run     # Ejecutar una vez"
        echo "   npm run monitor:start   # Ejecutar continuamente"
        echo "   npm run monitor:logs    # Ver logs en tiempo real"
    else
        echo "⚠️  Scripts de monitoreo ya existen en package.json"
    fi
fi

# Crear archivo de configuración
cat > .monitoring-config.json << 'EOF'
{
  "enabled": true,
  "interval": "12h",
  "patterns": {
    "critical": ["TODO", "FIXME", "HACK", "BUG", "XXX"],
    "security": ["innerHTML", "eval(", "document.write"],
    "quality": ["any;", ": any", "console.log"]
  },
  "alerts": {
    "slack": {
      "enabled": false,
      "webhook": ""
    },
    "email": {
      "enabled": false,
      "recipients": []
    }
  },
  "thresholds": {
    "newTodos": 5,
    "newAnyTypes": 10,
    "fileLines": 1000
  }
}
EOF

# Crear gitignore entries si no existen
if [ -f ".gitignore" ]; then
    if ! grep -q ".code-tracking.json" .gitignore; then
        echo "" >> .gitignore
        echo "# Monitoreo automatizado" >> .gitignore
        echo ".code-tracking.json" >> .gitignore
        echo "logs/" >> .gitignore
        echo "ALERTAS_CODIGO.md" >> .gitignore
    fi
fi

# Ejecutar primera validación
echo ""
echo "🚀 Ejecutando primera validación..."
node scripts/monitor-changes.js

echo ""
echo "✅ ¡Sistema de monitoreo configurado exitosamente!"
echo ""
echo "📋 RESUMEN DE CONFIGURACIÓN:"
echo "   ✓ Script de monitoreo: scripts/monitor-changes.js"
echo "   ✓ Script wrapper: scripts/run-monitoring.sh"
echo "   ✓ Configuración: .monitoring-config.json"
echo "   ✓ Logs: logs/monitoring_*.log"
echo ""
echo "🔄 EJECUCIÓN AUTOMÁTICA:"
case "$OSTYPE" in
  linux*|darwin*)
    echo "   ✓ Cron job configurado (cada 12 horas)"
    echo "   ⏰ Próxima ejecución: $(date -d '+12 hours' 2>/dev/null || date -v+12H 2>/dev/null || echo 'En 12 horas')"
    ;;
  *)
    echo "   ⚠️  Configurar manualmente en tu sistema"
    ;;
esac
echo ""
echo "📘 COMANDOS DISPONIBLES:"
echo "   npm run monitor:run      # Ejecutar monitoreo una vez"
echo "   npm run monitor:start    # Ejecutar continuamente"
echo "   npm run monitor:logs     # Ver logs en tiempo real"
echo ""
echo "📊 ARCHIVOS GENERADOS:"
echo "   📄 REVISION_COMPLETA_APLICACION.md  # Informe principal"
echo "   🚨 ALERTAS_CODIGO.md               # Alertas críticas"
echo "   📈 .code-tracking.json             # Estado tracking"
echo ""
echo "🎯 El sistema ahora monitoreará tu código cada 12 horas y actualizará automáticamente la revisión."