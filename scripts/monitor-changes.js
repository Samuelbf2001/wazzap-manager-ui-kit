#!/usr/bin/env node

/**
 * 🔍 MONITOR DE CAMBIOS AUTOMATIZADO
 * 
 * Sistema que se ejecuta cada 12 horas para:
 * - Detectar nuevos cambios en el código
 * - Validar calidad y problemas
 * - Actualizar informe de revisión
 * - Generar alertas sobre issues críticos
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CodeChangeMonitor {
  constructor() {
    this.baseDir = process.cwd();
    this.trackingFile = path.join(this.baseDir, '.code-tracking.json');
    this.revisionFile = path.join(this.baseDir, 'REVISION_COMPLETA_APLICACION.md');
    this.alertsFile = path.join(this.baseDir, 'ALERTAS_CODIGO.md');
    
    this.criticalPatterns = [
      /TODO|FIXME|HACK|BUG|XXX/gi,
      /console\.log|console\.warn|console\.error/gi,
      /any\s*;|:\s*any/gi,
      /\.innerHTML\s*=/gi,
      /eval\(/gi,
      /document\.write/gi
    ];

    this.fileExtensions = ['.ts', '.tsx', '.js', '.jsx'];
  }

  /**
   * Ejecutar monitoreo completo
   */
  async runMonitoring() {
    console.log('🔍 Iniciando monitoreo de cambios...');
    console.log(`📅 ${new Date().toLocaleString()}`);
    
    const currentState = await this.analyzeCurrentState();
    const previousState = this.loadPreviousState();
    const changes = this.detectChanges(previousState, currentState);
    
    if (changes.hasChanges) {
      console.log(`✨ Detectados ${changes.summary.totalChanges} cambios`);
      
      await this.analyzeChanges(changes);
      await this.updateRevisionReport(changes);
      await this.generateAlerts(changes);
      
      this.saveCurrentState(currentState);
      
      console.log('📊 Informe actualizado en REVISION_COMPLETA_APLICACION.md');
      console.log('🚨 Alertas generadas en ALERTAS_CODIGO.md');
    } else {
      console.log('✅ No se detectaron cambios desde la última revisión');
    }
    
    console.log('🔍 Monitoreo completado\n');
  }

  /**
   * Analizar estado actual del código
   */
  async analyzeCurrentState() {
    const state = {
      timestamp: new Date().toISOString(),
      files: {},
      metrics: {},
      issues: {}
    };

    // Escanear archivos
    const files = this.getAllCodeFiles();
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const relativePath = path.relative(this.baseDir, file);
      
      state.files[relativePath] = {
        hash: crypto.createHash('md5').update(content).digest('hex'),
        lines: content.split('\n').length,
        size: content.length,
        lastModified: fs.statSync(file).mtime.toISOString()
      };
    }

    // Métricas generales
    state.metrics = await this.calculateMetrics(files);
    
    // Detectar issues
    state.issues = await this.detectIssues(files);
    
    return state;
  }

  /**
   * Obtener todos los archivos de código
   */
  getAllCodeFiles() {
    const files = [];
    
    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Saltar directorios no relevantes
          if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(item)) {
            scanDirectory(fullPath);
          }
        } else if (this.fileExtensions.includes(path.extname(item))) {
          files.push(fullPath);
        }
      }
    };
    
    scanDirectory(path.join(this.baseDir, 'src'));
    return files;
  }

  /**
   * Calcular métricas del código
   */
  async calculateMetrics(files) {
    let totalLines = 0;
    let totalFiles = files.length;
    let totalSize = 0;
    let componentsCount = 0;
    let servicesCount = 0;
    let typesCount = 0;

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n').length;
      
      totalLines += lines;
      totalSize += content.length;
      
      // Contar tipos de archivos
      if (file.includes('/components/')) componentsCount++;
      if (file.includes('/services/')) servicesCount++;
      if (file.includes('/types/')) typesCount++;
    }

    return {
      totalFiles,
      totalLines,
      totalSize,
      componentsCount,
      servicesCount,
      typesCount,
      avgLinesPerFile: Math.round(totalLines / totalFiles)
    };
  }

  /**
   * Detectar issues en el código
   */
  async detectIssues(files) {
    const issues = {
      critical: [],
      warnings: [],
      improvements: [],
      todos: [],
      anyTypes: [],
      consoleLogs: []
    };

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      const relativePath = path.relative(this.baseDir, file);
      
      lines.forEach((line, index) => {
        const lineNum = index + 1;
        
        // TODO/FIXME
        if (/TODO|FIXME|HACK|BUG|XXX/gi.test(line)) {
          issues.todos.push({
            file: relativePath,
            line: lineNum,
            content: line.trim(),
            type: this.getIssueType(line)
          });
        }
        
        // Tipos any
        if (/any\s*;|:\s*any/gi.test(line)) {
          issues.anyTypes.push({
            file: relativePath,
            line: lineNum,
            content: line.trim()
          });
        }
        
        // Console logs
        if (/console\.log|console\.warn|console\.error/gi.test(line)) {
          issues.consoleLogs.push({
            file: relativePath,
            line: lineNum,
            content: line.trim()
          });
        }
        
        // Vulnerabilidades críticas
        if (/\.innerHTML\s*=|eval\(|document\.write/gi.test(line)) {
          issues.critical.push({
            file: relativePath,
            line: lineNum,
            content: line.trim(),
            type: 'security'
          });
        }
      });
    }

    return issues;
  }

  /**
   * Detectar cambios entre estados
   */
  detectChanges(previous, current) {
    if (!previous) {
      return {
        hasChanges: true,
        type: 'initial',
        newFiles: Object.keys(current.files),
        modifiedFiles: [],
        deletedFiles: [],
        newIssues: current.issues || {},
        resolvedIssues: {},
        metricsChanges: {
          linesChange: current.metrics.totalLines,
          filesChange: current.metrics.totalFiles,
          sizeChange: current.metrics.totalSize
        },
        summary: { 
          totalChanges: Object.keys(current.files).length,
          newIssuesCount: Object.values(current.issues || {}).flat().length,
          resolvedIssuesCount: 0
        }
      };
    }

    const changes = {
      hasChanges: false,
      newFiles: [],
      modifiedFiles: [],
      deletedFiles: [],
      newIssues: {},
      resolvedIssues: {},
      metricsChanges: {},
      summary: {}
    };

    // Archivos nuevos
    for (const file in current.files) {
      if (!previous.files[file]) {
        changes.newFiles.push(file);
        changes.hasChanges = true;
      }
    }

    // Archivos modificados
    for (const file in current.files) {
      if (previous.files[file] && 
          current.files[file].hash !== previous.files[file].hash) {
        changes.modifiedFiles.push({
          file,
          previousLines: previous.files[file].lines,
          currentLines: current.files[file].lines,
          linesChanged: current.files[file].lines - previous.files[file].lines
        });
        changes.hasChanges = true;
      }
    }

    // Archivos eliminados
    for (const file in previous.files) {
      if (!current.files[file]) {
        changes.deletedFiles.push(file);
        changes.hasChanges = true;
      }
    }

    // Cambios en issues
    changes.newIssues = this.compareIssues(previous.issues, current.issues, 'new');
    changes.resolvedIssues = this.compareIssues(previous.issues, current.issues, 'resolved');

    // Cambios en métricas
    changes.metricsChanges = {
      linesChange: current.metrics.totalLines - previous.metrics.totalLines,
      filesChange: current.metrics.totalFiles - previous.metrics.totalFiles,
      sizeChange: current.metrics.totalSize - previous.metrics.totalSize
    };

    // Resumen
    changes.summary = {
      totalChanges: changes.newFiles.length + changes.modifiedFiles.length + changes.deletedFiles.length,
      newIssuesCount: Object.values(changes.newIssues).flat().length,
      resolvedIssuesCount: Object.values(changes.resolvedIssues).flat().length
    };

    return changes;
  }

  /**
   * Comparar issues entre estados
   */
  compareIssues(previousIssues, currentIssues, type) {
    const result = {};
    
    for (const category in currentIssues) {
      result[category] = [];
      
      if (type === 'new') {
        // Nuevos issues
        const currentSet = new Set(
          currentIssues[category].map(issue => `${issue.file}:${issue.line}:${issue.content}`)
        );
        const previousSet = new Set(
          (previousIssues[category] || []).map(issue => `${issue.file}:${issue.line}:${issue.content}`)
        );
        
        currentIssues[category].forEach(issue => {
          const key = `${issue.file}:${issue.line}:${issue.content}`;
          if (!previousSet.has(key)) {
            result[category].push(issue);
          }
        });
      } else {
        // Issues resueltos
        const currentSet = new Set(
          currentIssues[category].map(issue => `${issue.file}:${issue.line}:${issue.content}`)
        );
        
        (previousIssues[category] || []).forEach(issue => {
          const key = `${issue.file}:${issue.line}:${issue.content}`;
          if (!currentSet.has(key)) {
            result[category].push(issue);
          }
        });
      }
    }
    
    return result;
  }

  /**
   * Analizar cambios en detalle
   */
  async analyzeChanges(changes) {
    console.log('\n📊 ANÁLISIS DE CAMBIOS:');
    
    if (changes.newFiles.length > 0) {
      console.log(`➕ Archivos nuevos: ${changes.newFiles.length}`);
      changes.newFiles.forEach(file => console.log(`   📄 ${file}`));
    }
    
    if (changes.modifiedFiles.length > 0) {
      console.log(`✏️  Archivos modificados: ${changes.modifiedFiles.length}`);
      changes.modifiedFiles.forEach(({ file, linesChanged }) => {
        const indicator = linesChanged > 0 ? '📈' : linesChanged < 0 ? '📉' : '📊';
        console.log(`   ${indicator} ${file} (${linesChanged > 0 ? '+' : ''}${linesChanged} líneas)`);
      });
    }
    
    if (changes.deletedFiles.length > 0) {
      console.log(`🗑️  Archivos eliminados: ${changes.deletedFiles.length}`);
      changes.deletedFiles.forEach(file => console.log(`   🗑️  ${file}`));
    }

    // Nuevos issues
    const newIssuesCount = Object.values(changes.newIssues).flat().length;
    if (newIssuesCount > 0) {
      console.log(`🚨 Nuevos problemas detectados: ${newIssuesCount}`);
    }

    // Issues resueltos
    const resolvedIssuesCount = Object.values(changes.resolvedIssues).flat().length;
    if (resolvedIssuesCount > 0) {
      console.log(`✅ Problemas resueltos: ${resolvedIssuesCount}`);
    }
  }

  /**
   * Actualizar informe de revisión
   */
  async updateRevisionReport(changes) {
    const currentTime = new Date().toLocaleString();
    const updateSection = this.generateUpdateSection(changes, currentTime);
    
    let content = '';
    
    if (fs.existsSync(this.revisionFile)) {
      content = fs.readFileSync(this.revisionFile, 'utf8');
      
      // Buscar sección de actualizaciones o crear una nueva
      const updateMarker = '## 🔄 HISTORIAL DE ACTUALIZACIONES';
      
      if (content.includes(updateMarker)) {
        // Insertar nueva actualización al inicio de la sección
        const sections = content.split(updateMarker);
        content = sections[0] + updateMarker + '\n\n' + updateSection + '\n' + sections[1];
      } else {
        // Agregar sección completa al final
        content += '\n\n---\n\n' + updateMarker + '\n\n' + updateSection;
      }
    } else {
      content = updateSection;
    }
    
    fs.writeFileSync(this.revisionFile, content);
  }

  /**
   * Generar sección de actualización
   */
  generateUpdateSection(changes, timestamp) {
    let section = `### 📅 Actualización ${timestamp}\n\n`;
    
    // Resumen de cambios
    section += `**Resumen**: ${changes.summary.totalChanges} archivos modificados, `;
    section += `${changes.summary.newIssuesCount} nuevos problemas, `;
    section += `${changes.summary.resolvedIssuesCount} problemas resueltos\n\n`;
    
    // Archivos cambiados
    if (changes.newFiles.length > 0 || changes.modifiedFiles.length > 0) {
      section += '#### 📝 Cambios en Código\n\n';
      
      if (changes.newFiles.length > 0) {
        section += '**Archivos Nuevos:**\n';
        changes.newFiles.forEach(file => {
          section += `- ➕ \`${file}\`\n`;
        });
        section += '\n';
      }
      
      if (changes.modifiedFiles.length > 0) {
        section += '**Archivos Modificados:**\n';
        changes.modifiedFiles.forEach(({ file, linesChanged }) => {
          const indicator = linesChanged > 0 ? '📈' : linesChanged < 0 ? '📉' : '📊';
          section += `- ${indicator} \`${file}\` (${linesChanged > 0 ? '+' : ''}${linesChanged} líneas)\n`;
        });
        section += '\n';
      }
    }
    
    // Nuevos problemas
    const newIssuesCount = Object.values(changes.newIssues).flat().length;
    if (newIssuesCount > 0) {
      section += '#### 🚨 Nuevos Problemas Detectados\n\n';
      
      for (const [category, issues] of Object.entries(changes.newIssues)) {
        if (issues.length > 0) {
          section += `**${this.getCategoryName(category)}** (${issues.length}):\n`;
          issues.slice(0, 5).forEach(issue => {
            section += `- \`${issue.file}:${issue.line}\` - ${issue.content.substring(0, 80)}...\n`;
          });
          if (issues.length > 5) {
            section += `- ... y ${issues.length - 5} más\n`;
          }
          section += '\n';
        }
      }
    }
    
    // Problemas resueltos
    const resolvedIssuesCount = Object.values(changes.resolvedIssues).flat().length;
    if (resolvedIssuesCount > 0) {
      section += '#### ✅ Problemas Resueltos\n\n';
      
      for (const [category, issues] of Object.entries(changes.resolvedIssues)) {
        if (issues.length > 0) {
          section += `**${this.getCategoryName(category)}**: ${issues.length} resueltos\n`;
        }
      }
      section += '\n';
    }
    
    // Métricas
    section += '#### 📊 Métricas Actualizadas\n\n';
    section += `- **Líneas de código**: ${changes.metricsChanges.linesChange > 0 ? '+' : ''}${changes.metricsChanges.linesChange}\n`;
    section += `- **Archivos**: ${changes.metricsChanges.filesChange > 0 ? '+' : ''}${changes.metricsChanges.filesChange}\n`;
    section += `- **Tamaño**: ${this.formatBytes(changes.metricsChanges.sizeChange)}\n\n`;
    
    section += '---\n';
    
    return section;
  }

  /**
   * Generar alertas
   */
  async generateAlerts(changes) {
    const alerts = [];
    const currentTime = new Date().toLocaleString();
    
    // Alertas críticas
    const criticalIssues = changes.newIssues.critical || [];
    if (criticalIssues.length > 0) {
      alerts.push({
        level: 'CRÍTICO',
        title: 'Vulnerabilidades de seguridad detectadas',
        count: criticalIssues.length,
        items: criticalIssues.slice(0, 3)
      });
    }
    
    // Alertas por muchos TODOs nuevos
    const newTodos = changes.newIssues.todos || [];
    if (newTodos.length > 5) {
      alerts.push({
        level: 'ADVERTENCIA',
        title: 'Muchos TODOs agregados',
        count: newTodos.length,
        message: 'Se están acumulando tareas pendientes'
      });
    }
    
    // Alertas por incremento significativo de tipos any
    const newAnyTypes = changes.newIssues.anyTypes || [];
    if (newAnyTypes.length > 10) {
      alerts.push({
        level: 'ADVERTENCIA',
        title: 'Degradación de type safety',
        count: newAnyTypes.length,
        message: 'Incremento significativo en uso de tipos any'
      });
    }
    
    // Alertas por archivos muy largos
    changes.modifiedFiles.forEach(({ file, currentLines }) => {
      if (currentLines > 1000) {
        alerts.push({
          level: 'MEJORA',
          title: 'Archivo muy largo detectado',
          message: `${file} tiene ${currentLines} líneas`,
          suggestion: 'Considerar refactoring en componentes más pequeños'
        });
      }
    });
    
    // Generar archivo de alertas
    if (alerts.length > 0) {
      const alertContent = this.generateAlertContent(alerts, currentTime);
      fs.writeFileSync(this.alertsFile, alertContent);
    }
  }

  /**
   * Generar contenido de alertas
   */
  generateAlertContent(alerts, timestamp) {
    let content = `# 🚨 ALERTAS DE CÓDIGO\n\n`;
    content += `**Última actualización**: ${timestamp}\n\n`;
    
    const criticalAlerts = alerts.filter(a => a.level === 'CRÍTICO');
    const warningAlerts = alerts.filter(a => a.level === 'ADVERTENCIA');
    const improvementAlerts = alerts.filter(a => a.level === 'MEJORA');
    
    if (criticalAlerts.length > 0) {
      content += `## 🔴 ALERTAS CRÍTICAS (${criticalAlerts.length})\n\n`;
      criticalAlerts.forEach(alert => {
        content += `### ${alert.title}\n`;
        content += `**Elementos detectados**: ${alert.count}\n\n`;
        if (alert.items) {
          alert.items.forEach(item => {
            content += `- 📍 \`${item.file}:${item.line}\`\n`;
          });
        }
        content += `\n**⚡ ACCIÓN REQUERIDA**: Revisar inmediatamente\n\n`;
      });
    }
    
    if (warningAlerts.length > 0) {
      content += `## 🟡 ADVERTENCIAS (${warningAlerts.length})\n\n`;
      warningAlerts.forEach(alert => {
        content += `### ${alert.title}\n`;
        content += `**Elementos**: ${alert.count}\n`;
        if (alert.message) content += `**Detalle**: ${alert.message}\n`;
        content += `**🔧 Recomendación**: Programar refactoring\n\n`;
      });
    }
    
    if (improvementAlerts.length > 0) {
      content += `## 🔵 MEJORAS SUGERIDAS (${improvementAlerts.length})\n\n`;
      improvementAlerts.forEach(alert => {
        content += `### ${alert.title}\n`;
        if (alert.message) content += `**Detalle**: ${alert.message}\n`;
        if (alert.suggestion) content += `**💡 Sugerencia**: ${alert.suggestion}\n`;
        content += '\n';
      });
    }
    
    content += '\n---\n\n';
    content += '**Monitoreo automático** - Este archivo se actualiza cada 12 horas\n';
    content += 'Para resolver alertas, corrige el código y espera la próxima validación\n';
    
    return content;
  }

  /**
   * Cargar estado anterior
   */
  loadPreviousState() {
    if (fs.existsSync(this.trackingFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.trackingFile, 'utf8'));
      } catch (error) {
        console.warn('⚠️  Error cargando estado anterior:', error.message);
        return null;
      }
    }
    return null;
  }

  /**
   * Guardar estado actual
   */
  saveCurrentState(state) {
    fs.writeFileSync(this.trackingFile, JSON.stringify(state, null, 2));
  }

  /**
   * Utilidades
   */
  getIssueType(line) {
    if (/TODO/gi.test(line)) return 'TODO';
    if (/FIXME/gi.test(line)) return 'FIXME';
    if (/HACK/gi.test(line)) return 'HACK';
    if (/BUG/gi.test(line)) return 'BUG';
    return 'OTHER';
  }

  getCategoryName(category) {
    const names = {
      critical: 'Críticos',
      warnings: 'Advertencias',
      improvements: 'Mejoras',
      todos: 'TODOs',
      anyTypes: 'Tipos Any',
      consoleLogs: 'Console Logs'
    };
    return names[category] || category;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Script principal
async function main() {
  const monitor = new CodeChangeMonitor();
  
  // Ejecutar monitoreo
  await monitor.runMonitoring();
  
  // Programar siguiente ejecución si no es un run manual
  if (process.argv.includes('--continuous')) {
    console.log('⏰ Programando siguiente monitoreo en 12 horas...');
    setTimeout(() => {
      main();
    }, 12 * 60 * 60 * 1000); // 12 horas
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { CodeChangeMonitor };