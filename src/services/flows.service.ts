import { FlowData, FlowListItem, CreateFlowRequest, UpdateFlowRequest } from '@/types/flow';

// Función auxiliar para obtener la empresa autenticada
function getCurrentCompany(): { id: string; name: string; email: string } | null {
  try {
    const stored = localStorage.getItem('authenticated_company');
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo empresa actual:', error);
    return null;
  }
}

// Función auxiliar para generar la clave de storage específica por empresa
function getCompanyFlowsKey(): string {
  const company = getCurrentCompany();
  if (!company) {
    throw new Error('No hay empresa autenticada. Por favor inicia sesión.');
  }
  return `wazzap_flows_${company.id}`;
}

export class FlowsService {
  
  // Obtener todos los flujos (lista)
  static getFlows(): FlowListItem[] {
    try {
      const company = getCurrentCompany();
      if (!company) {
        console.warn('No hay empresa autenticada, retornando lista vacía');
        return [];
      }

      const flows = localStorage.getItem(getCompanyFlowsKey());
      if (!flows) return [];
      
      const parsedFlows: FlowData[] = JSON.parse(flows);
      
      // Convertir a FlowListItem
      return parsedFlows.map(flow => ({
        id: flow.id,
        name: flow.name,
        description: flow.description,
        status: flow.status,
        createdAt: new Date(flow.createdAt),
        updatedAt: new Date(flow.updatedAt),
        nodeCount: flow.nodes.length,
        category: flow.category,
        tags: flow.tags,
        statistics: flow.statistics
      }));
    } catch (error) {
      console.error('Error al obtener flujos:', error);
      return [];
    }
  }

  // Obtener un flujo específico por ID
  static getFlowById(id: string): FlowData | null {
    try {
      const company = getCurrentCompany();
      if (!company) {
        console.warn('No hay empresa autenticada');
        return null;
      }

      const flows = localStorage.getItem(getCompanyFlowsKey());
      if (!flows) return null;
      
      const parsedFlows: FlowData[] = JSON.parse(flows);
      const flow = parsedFlows.find(f => f.id === id);
      
      if (!flow) return null;
      
      // Asegurar que las fechas sean objetos Date
      return {
        ...flow,
        createdAt: new Date(flow.createdAt),
        updatedAt: new Date(flow.updatedAt)
      };
    } catch (error) {
      console.error('Error al obtener flujo:', error);
      return null;
    }
  }

  // Crear nuevo flujo
  static createFlow(request: CreateFlowRequest): FlowData {
    try {
      const company = getCurrentCompany();
      if (!company) {
        throw new Error('No hay empresa autenticada. Por favor inicia sesión.');
      }

      const flows = this.getFlows();
      const allFlows = this.getAllFlowsData();
      
      const newFlow: FlowData = {
        id: this.generateId(),
        name: request.name,
        description: request.description,
        status: 'draft',
        nodes: [],
        edges: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        tags: request.tags || [],
        category: request.category,
        statistics: {
          totalExecutions: 0,
          successRate: 0
        }
      };

      allFlows.push(newFlow);
      localStorage.setItem(getCompanyFlowsKey(), JSON.stringify(allFlows));
      
      return newFlow;
    } catch (error) {
      console.error('Error al crear flujo:', error);
      throw new Error('Error al crear el flujo');
    }
  }

  // Actualizar flujo existente
  static updateFlow(request: UpdateFlowRequest): FlowData | null {
    try {
      const company = getCurrentCompany();
      if (!company) {
        throw new Error('No hay empresa autenticada. Por favor inicia sesión.');
      }

      const allFlows = this.getAllFlowsData();
      const flowIndex = allFlows.findIndex(f => f.id === request.id);
      
      if (flowIndex === -1) {
        throw new Error('Flujo no encontrado');
      }

      const updatedFlow: FlowData = {
        ...allFlows[flowIndex],
        ...request,
        updatedAt: new Date(),
        version: allFlows[flowIndex].version + 1
      };

      allFlows[flowIndex] = updatedFlow;
      localStorage.setItem(getCompanyFlowsKey(), JSON.stringify(allFlows));
      
      return updatedFlow;
    } catch (error) {
      console.error('Error al actualizar flujo:', error);
      return null;
    }
  }

  // Eliminar flujo
  static deleteFlow(id: string): boolean {
    try {
      const company = getCurrentCompany();
      if (!company) {
        throw new Error('No hay empresa autenticada. Por favor inicia sesión.');
      }

      const allFlows = this.getAllFlowsData();
      const filteredFlows = allFlows.filter(f => f.id !== id);
      
      if (filteredFlows.length === allFlows.length) {
        return false; // No se encontró el flujo
      }

      localStorage.setItem(getCompanyFlowsKey(), JSON.stringify(filteredFlows));
      return true;
    } catch (error) {
      console.error('Error al eliminar flujo:', error);
      return false;
    }
  }

  // Duplicar flujo
  static duplicateFlow(id: string, newName?: string): FlowData | null {
    try {
      const company = getCurrentCompany();
      if (!company) {
        throw new Error('No hay empresa autenticada. Por favor inicia sesión.');
      }

      const originalFlow = this.getFlowById(id);
      if (!originalFlow) return null;

      const duplicatedFlow: FlowData = {
        ...originalFlow,
        id: this.generateId(),
        name: newName || `${originalFlow.name} (Copia)`,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        status: 'draft',
        statistics: {
          totalExecutions: 0,
          successRate: 0
        }
      };

      const allFlows = this.getAllFlowsData();
      allFlows.push(duplicatedFlow);
      localStorage.setItem(getCompanyFlowsKey(), JSON.stringify(allFlows));

      return duplicatedFlow;
    } catch (error) {
      console.error('Error al duplicar flujo:', error);
      return null;
    }
  }

  // Cambiar estado del flujo
  static changeFlowStatus(id: string, status: 'draft' | 'active' | 'inactive'): boolean {
    try {
      const updateResult = this.updateFlow({ id, status });
      return updateResult !== null;
    } catch (error) {
      console.error('Error al cambiar estado del flujo:', error);
      return false;
    }
  }

  // Exportar flujo
  static exportFlow(id: string): string | null {
    try {
      const company = getCurrentCompany();
      if (!company) {
        throw new Error('No hay empresa autenticada. Por favor inicia sesión.');
      }

      const flow = this.getFlowById(id);
      if (!flow) return null;
      
      return JSON.stringify(flow, null, 2);
    } catch (error) {
      console.error('Error al exportar flujo:', error);
      return null;
    }
  }

  // Importar flujo
  static importFlow(flowData: string, newName?: string): FlowData | null {
    try {
      const company = getCurrentCompany();
      if (!company) {
        throw new Error('No hay empresa autenticada. Por favor inicia sesión.');
      }

      const flow: FlowData = JSON.parse(flowData);
      
      // Validar estructura básica
      if (!flow.name || !flow.nodes || !flow.edges) {
        throw new Error('Formato de flujo inválido');
      }

      const importedFlow: FlowData = {
        ...flow,
        id: this.generateId(),
        name: newName || `${flow.name} (Importado)`,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        status: 'draft'
      };

      const allFlows = this.getAllFlowsData();
      allFlows.push(importedFlow);
      localStorage.setItem(getCompanyFlowsKey(), JSON.stringify(allFlows));

      return importedFlow;
    } catch (error) {
      console.error('Error al importar flujo:', error);
      return null;
    }
  }

  // Obtener estadísticas de flujos
  static getFlowStats() {
    try {
      const company = getCurrentCompany();
      if (!company) {
        throw new Error('No hay empresa autenticada. Por favor inicia sesión.');
      }

      const flows = this.getFlows();
      
      return {
        total: flows.length,
        active: flows.filter(f => f.status === 'active').length,
        draft: flows.filter(f => f.status === 'draft').length,
        inactive: flows.filter(f => f.status === 'inactive').length,
        totalExecutions: flows.reduce((sum, f) => sum + (f.statistics?.totalExecutions || 0), 0),
        avgSuccessRate: flows.length > 0 
          ? flows.reduce((sum, f) => sum + (f.statistics?.successRate || 0), 0) / flows.length 
          : 0
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        total: 0,
        active: 0,
        draft: 0,
        inactive: 0,
        totalExecutions: 0,
        avgSuccessRate: 0
      };
    }
  }

  // Métodos privados auxiliares
  private static getAllFlowsData(): FlowData[] {
    try {
      const company = getCurrentCompany();
      if (!company) {
        throw new Error('No hay empresa autenticada. Por favor inicia sesión.');
      }

      const flows = localStorage.getItem(getCompanyFlowsKey());
      return flows ? JSON.parse(flows) : [];
    } catch (error) {
      console.error('Error al obtener datos de flujos:', error);
      return [];
    }
  }

  private static generateId(): string {
    return `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Limpiar todos los flujos (para desarrollo/testing)
  static clearAllFlows(): void {
    const company = getCurrentCompany();
    if (company) {
      localStorage.removeItem(getCompanyFlowsKey());
    }
  }

  // Crear flujos de ejemplo
  static createSampleFlows(): void {
    const company = getCurrentCompany();
    if (!company) {
      console.warn('No hay empresa autenticada, no se pueden crear flujos de ejemplo.');
      return;
    }

    const sampleFlows: FlowData[] = [
      {
        id: 'flow_sample_1',
        name: 'Atención al Cliente 24/7',
        description: 'Flujo automatizado para brindar soporte básico a clientes fuera del horario de oficina',
        status: 'active',
        nodes: [
          {
            id: 'start',
            type: 'enhancedMessage',
            position: { x: 100, y: 100 },
            data: { label: 'Bienvenida', message: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte?' }
          },
          {
            id: 'menu',
            type: 'enhancedMessage',
            position: { x: 100, y: 250 },
            data: { label: 'Menú Principal', message: 'Selecciona una opción:', hasButtons: true, buttons: ['Soporte', 'Ventas', 'Información'] }
          }
        ],
        edges: [
          { id: 'e1-2', source: 'start', target: 'menu', animated: true }
        ],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        version: 3,
        tags: ['soporte', 'automatización', '24/7'],
        category: 'customer-service',
        statistics: {
          totalExecutions: 156,
          successRate: 94.2,
          lastExecution: new Date('2024-01-20')
        }
      },
      {
        id: 'flow_sample_2',
        name: 'Generación de Leads',
        description: 'Captura información de prospectos interesados en nuestros productos',
        status: 'active',
        nodes: [
          {
            id: 'intro',
            type: 'enhancedMessage',
            position: { x: 100, y: 100 },
            data: { label: 'Introducción', message: '¡Gracias por tu interés! Te ayudaré a conocer más sobre nuestros productos.' }
          },
          {
            id: 'survey',
            type: 'survey',
            position: { x: 100, y: 250 },
            data: { label: 'Encuesta de Interés', title: 'Cuéntanos sobre ti', questions: ['¿Cuál es tu presupuesto?', '¿Cuándo planeas comprar?'] }
          }
        ],
        edges: [
          { id: 'e1-2', source: 'intro', target: 'survey', animated: true }
        ],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-18'),
        version: 2,
        tags: ['leads', 'ventas', 'prospección'],
        category: 'lead-generation',
        statistics: {
          totalExecutions: 89,
          successRate: 87.6,
          lastExecution: new Date('2024-01-18')
        }
      },
      {
        id: 'flow_sample_3',
        name: 'Onboarding Nuevos Clientes',
        description: 'Flujo de bienvenida y configuración inicial para nuevos usuarios',
        status: 'draft',
        nodes: [
          {
            id: 'welcome',
            type: 'enhancedMessage',
            position: { x: 100, y: 100 },
            data: { label: 'Bienvenida', message: '¡Bienvenido a nuestra plataforma! Te guiaremos paso a paso.' }
          }
        ],
        edges: [],
        createdAt: new Date('2024-01-22'),
        updatedAt: new Date('2024-01-22'),
        version: 1,
        tags: ['onboarding', 'bienvenida', 'configuración'],
        category: 'onboarding',
        statistics: {
          totalExecutions: 0,
          successRate: 0
        }
      }
    ];

    localStorage.setItem(getCompanyFlowsKey(), JSON.stringify(sampleFlows));
  }

  // Limpiar flujos de ejemplo si existen
  static initializeSampleData(): void {
    const company = getCurrentCompany();
    if (!company) {
      console.warn('No hay empresa autenticada, no se pueden limpiar flujos de ejemplo.');
      return;
    }

    // Eliminar flujos de ejemplo si existen
    const allFlows = this.getAllFlowsData();
    const sampleFlowIds = ['flow_sample_1', 'flow_sample_2', 'flow_sample_3'];
    
    const filteredFlows = allFlows.filter(flow => !sampleFlowIds.includes(flow.id));
    
    if (filteredFlows.length !== allFlows.length) {
      // Si había flujos de ejemplo, guardar la lista sin ellos
      localStorage.setItem(getCompanyFlowsKey(), JSON.stringify(filteredFlows));
    }
  }
} 