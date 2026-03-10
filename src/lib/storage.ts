// Servicio de persistencia con localStorage
// Maneja automáticamente la serialización/deserialización y errores

export class StorageService {
  static setItem<T>(key: string, value: T): boolean {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      console.log(`💾 Guardado en localStorage: ${key}`);
      return true;
    } catch (error) {
      console.error(`Error guardando en localStorage (${key}):`, error);
      return false;
    }
  }

  static getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue || null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error leyendo de localStorage (${key}):`, error);
      return defaultValue || null;
    }
  }

  static removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      console.log(`🗑️ Eliminado de localStorage: ${key}`);
      return true;
    } catch (error) {
      console.error(`Error eliminando de localStorage (${key}):`, error);
      return false;
    }
  }

  static clear(): boolean {
    try {
      localStorage.clear();
      console.log('🧹 localStorage limpiado completamente');
      return true;
    } catch (error) {
      console.error('Error limpiando localStorage:', error);
      return false;
    }
  }

  static exists(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  static getKeys(): string[] {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error obteniendo keys de localStorage:', error);
      return [];
    }
  }

  static getSize(): number {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total;
    } catch (error) {
      console.error('Error calculando tamaño de localStorage:', error);
      return 0;
    }
  }

  // Método específico para deserializar fechas
  static getItemWithDates<T>(key: string, dateFields: string[], defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue || null;
      }
      
      const parsed = JSON.parse(item);
      
      // Convertir campos de fecha
      const convertDates = (obj: any): any => {
        if (Array.isArray(obj)) {
          return obj.map(convertDates);
        } else if (obj && typeof obj === 'object') {
          const converted = { ...obj };
          for (const field of dateFields) {
            if (converted[field] && typeof converted[field] === 'string') {
              converted[field] = new Date(converted[field]);
            }
          }
          // Recursivamente convertir objetos anidados
          for (const [key, value] of Object.entries(converted)) {
            if (value && typeof value === 'object') {
              converted[key] = convertDates(value);
            }
          }
          return converted;
        }
        return obj;
      };
      
      return convertDates(parsed) as T;
    } catch (error) {
      console.error(`Error leyendo con fechas de localStorage (${key}):`, error);
      return defaultValue || null;
    }
  }
}

// Constantes para las keys de localStorage
export const STORAGE_KEYS = {
  // Agentes IA
  AI_AGENTS: 'wazzap-ai-agents',
  
  // Reportes de mejora IA
  AI_RESPONSE_REPORTS: 'wazzap-ai-response-reports',
  AI_IMPROVEMENT_HISTORY: 'wazzap-ai-improvement-history',
  
  // Conversaciones
  LIVE_INBOX_CONVERSATIONS: 'wazzap-live-inbox-conversations',
  CHAT_MESSAGES: 'wazzap-chat-messages',
  
  // Configuraciones
  MESSAGE_TEMPLATES: 'wazzap-message-templates',
  HUBSPOT_TOKENS: 'hubspot_oauth_tokens',
  WHATSAPP_CONFIG: 'wazzap-whatsapp-config',
  
  // Flujos de trabajo
  FLOW_BUILDER_FLOWS: 'wazzap-flow-builder-flows',
  FLOW_BUILDER_CURRENT: 'flowBuilder_currentFlow',
  
  // Estado de la aplicación
  USER_PREFERENCES: 'wazzap-user-preferences',
  SIDEBAR_STATE: 'wazzap-sidebar-state',
  
  // Analytics y métricas
  AGENT_ANALYTICS: 'wazzap-agent-analytics',
  PERFORMANCE_METRICS: 'wazzap-performance-metrics'
} as const;

// Utility functions específicas para la app
export class WazzapStorage {
  // Persistencia para reportes de IA
  static saveAIReports(reports: any[]): boolean {
    return StorageService.setItem(STORAGE_KEYS.AI_RESPONSE_REPORTS, reports);
  }

  static getAIReports(): any[] {
    return StorageService.getItemWithDates(
      STORAGE_KEYS.AI_RESPONSE_REPORTS,
      ['reportedAt', 'generatedAt', 'reviewedAt', 'implementedAt'],
      []
    ) || [];
  }

  // Persistencia para conversaciones
  static saveConversations(conversations: any[]): boolean {
    return StorageService.setItem(STORAGE_KEYS.LIVE_INBOX_CONVERSATIONS, conversations);
  }

  static getConversations(): any[] {
    return StorageService.getItemWithDates(
      STORAGE_KEYS.LIVE_INBOX_CONVERSATIONS,
      ['timestamp', 'createdAt', 'updatedAt'],
      []
    ) || [];
  }

  // Persistencia para agentes IA
  static saveAIAgents(agents: any[]): boolean {
    return StorageService.setItem(STORAGE_KEYS.AI_AGENTS, agents);
  }

  static getAIAgents(): any[] {
    return StorageService.getItemWithDates(
      STORAGE_KEYS.AI_AGENTS,
      ['created', 'lastUsed'],
      []
    ) || [];
  }

  // Limpiar todos los datos de la app
  static clearAllAppData(): boolean {
    const keys = Object.values(STORAGE_KEYS);
    let success = true;
    
    keys.forEach(key => {
      if (!StorageService.removeItem(key)) {
        success = false;
      }
    });
    
    return success;
  }

  // Exportar todos los datos de la app
  static exportAllData(): string {
    const data: Record<string, any> = {};
    
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      const value = StorageService.getItem(key);
      if (value !== null) {
        data[name] = value;
      }
    });
    
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      data
    }, null, 2);
  }

  // Importar datos a la app
  static importAllData(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData);
      
      if (!imported.data) {
        throw new Error('Formato de datos inválido');
      }
      
      let success = true;
      Object.entries(imported.data).forEach(([name, value]) => {
        const key = STORAGE_KEYS[name as keyof typeof STORAGE_KEYS];
        if (key && !StorageService.setItem(key, value)) {
          success = false;
        }
      });
      
      return success;
    } catch (error) {
      console.error('Error importando datos:', error);
      return false;
    }
  }

  // Obtener estadísticas de almacenamiento
  static getStorageStats() {
    const totalSize = StorageService.getSize();
    const keys = StorageService.getKeys();
    const appKeys = keys.filter(key => key.startsWith('wazzap-'));
    
    const keysSizes = appKeys.map(key => {
      const value = localStorage.getItem(key) || '';
      return {
        key,
        size: key.length + value.length,
        sizeKB: Math.round((key.length + value.length) / 1024 * 100) / 100
      };
    }).sort((a, b) => b.size - a.size);
    
    return {
      totalSizeBytes: totalSize,
      totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
      totalKeys: keys.length,
      appKeys: appKeys.length,
      keysSizes
    };
  }
} 