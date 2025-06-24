import { AIAgent } from '@/components/AIAgentManager';

// Simulación de almacenamiento local - en una implementación real sería una API o base de datos
class AIAgentsService {
  private storageKey = 'wazzap-ai-agents';

  // Obtener todos los agentes
  async getAgents(): Promise<AIAgent[]> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return this.getDefaultAgents();
      
      const agents = JSON.parse(stored);
      return agents.map((agent: any) => ({
        ...agent,
        created: new Date(agent.created),
        lastUsed: new Date(agent.lastUsed)
      }));
    } catch (error) {
      console.error('Error loading agents:', error);
      return this.getDefaultAgents();
    }
  }

  // Obtener un agente específico por ID
  async getAgentById(id: string): Promise<AIAgent | null> {
    const agents = await this.getAgents();
    return agents.find(agent => agent.id === id) || null;
  }

  // Guardar agentes
  async saveAgents(agents: AIAgent[]): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(agents));
    } catch (error) {
      console.error('Error saving agents:', error);
      throw error;
    }
  }

  // Agregar o actualizar un agente
  async saveAgent(agent: AIAgent): Promise<void> {
    const agents = await this.getAgents();
    const existingIndex = agents.findIndex(a => a.id === agent.id);
    
    if (existingIndex >= 0) {
      agents[existingIndex] = agent;
    } else {
      agents.push(agent);
    }
    
    await this.saveAgents(agents);
  }

  // Eliminar un agente
  async deleteAgent(id: string): Promise<void> {
    const agents = await this.getAgents();
    const filtered = agents.filter(agent => agent.id !== id);
    await this.saveAgents(filtered);
  }

  // Obtener agentes por tipo
  async getAgentsByType(type: AIAgent['type']): Promise<AIAgent[]> {
    const agents = await this.getAgents();
    return agents.filter(agent => agent.type === type);
  }

  // Obtener solo agentes activos
  async getActiveAgents(): Promise<AIAgent[]> {
    const agents = await this.getAgents();
    return agents.filter(agent => agent.status === 'active');
  }

  // Agentes por defecto para demostración
  private getDefaultAgents(): AIAgent[] {
    return [
      {
        id: '1',
        name: 'Asistente de Ventas',
        type: 'conversational',
        status: 'active',
        model: 'GPT-4',
        knowledgeBases: ['kb1', 'kb2'],
        created: new Date('2024-01-15'),
        lastUsed: new Date('2024-01-20'),
        totalConversations: 1250,
        avgResponseTime: 2.3,
        successRate: 94.5,
        // Configuración extendida para FlowBuilder
        systemPrompt: `Eres un asistente de ventas experto y amigable. Tu objetivo es:
- Ayudar a los clientes a encontrar productos que se adapten a sus necesidades
- Proporcionar información detallada sobre productos y servicios
- Guiar el proceso de compra de manera natural y no intrusiva
- Resolver dudas y objeciones con empatía
- Recomendar productos complementarios cuando sea apropiado

Mantén un tono profesional pero cercano, y siempre busca generar confianza.`,
        temperature: 0.7,
        maxTokens: 2000,
        tools: [
          {
            id: 'search-1',
            name: 'Búsqueda de Productos',
            type: 'database' as const,
            description: 'Busca productos en el catálogo',
            config: { database: 'products', table: 'catalog' },
            enabled: true
          },
          {
            id: 'crm-1',
            name: 'HubSpot CRM',
            type: 'hubspot' as const,
            description: 'Acceso a datos de clientes',
            config: { apiKey: 'xxx', operations: ['contacts', 'deals'] },
            enabled: true
          }
        ],
        useMemory: true,
        memoryType: 'conversation',
        memorySize: 1000,
        timeout: 30000,
        maxIterations: 10,
        fallbackBehavior: 'human_handoff'
      },
      {
        id: '2',
        name: 'Soporte Técnico IA',
        type: 'tool_using',
        status: 'active',
        model: 'Claude-3',
        knowledgeBases: ['kb3'],
        created: new Date('2024-01-10'),
        lastUsed: new Date('2024-01-19'),
        totalConversations: 850,
        avgResponseTime: 3.1,
        successRate: 91.2,
        systemPrompt: `Eres un especialista en soporte técnico con amplio conocimiento en:
- Resolución de problemas técnicos
- Diagnóstico de errores y fallas
- Configuración de sistemas y aplicaciones
- Mejores prácticas de seguridad
- Escalamiento adecuado de casos complejos

Proporciona soluciones paso a paso, solicita información específica cuando sea necesario y siempre confirma que el problema se haya resuelto.`,
        temperature: 0.3,
        maxTokens: 2500,
        tools: [
          {
            id: 'kb-1',
            name: 'Base de Conocimiento',
            type: 'search' as const,
            description: 'Busca en la documentación técnica',
            config: { index: 'technical_docs', threshold: 0.8 },
            enabled: true
          },
          {
            id: 'api-1',
            name: 'API de Sistema',
            type: 'api' as const,
            description: 'Consulta estado del sistema',
            config: { baseUrl: 'https://api.sistema.com', auth: 'bearer' },
            enabled: true
          }
        ],
        useMemory: true,
        memoryType: 'vector',
        memorySize: 2000,
        timeout: 45000,
        maxIterations: 15,
        fallbackBehavior: 'human_handoff'
      },
      {
        id: '3',
        name: 'Analizador de Consultas',
        type: 'reasoning',
        status: 'training',
        model: 'GPT-4',
        knowledgeBases: ['kb1'],
        created: new Date('2024-01-18'),
        lastUsed: new Date('2024-01-18'),
        totalConversations: 45,
        avgResponseTime: 4.2,
        successRate: 87.8,
        systemPrompt: `Eres un analista experto especializado en:
- Análisis profundo de consultas complejas
- Identificación de patrones y tendencias
- Razonamiento lógico estructurado
- Síntesis de información de múltiples fuentes
- Generación de insights accionables

Utiliza un enfoque metodológico, descompón problemas complejos en partes manejables y proporciona análisis fundamentados.`,
        temperature: 0.4,
        maxTokens: 3000,
        tools: [
          {
            id: 'analytics-1',
            name: 'Motor de Análisis',
            type: 'custom' as const,
            description: 'Herramientas de análisis avanzado',
            config: { engine: 'advanced_analytics', models: ['classification', 'clustering'] },
            enabled: true
          }
        ],
        useMemory: true,
        memoryType: 'graph',       
        memorySize: 3000,
        timeout: 60000,
        maxIterations: 20,
        fallbackBehavior: 'default_response'
      },
      {
        id: '4',
        name: 'Coordinador de Flujos',
        type: 'workflow',
        status: 'inactive',
        model: 'GPT-4',
        knowledgeBases: ['kb2'],
        created: new Date('2024-01-12'),
        lastUsed: new Date('2024-01-17'),
        totalConversations: 320,
        avgResponseTime: 1.8,
        successRate: 96.1,
        systemPrompt: `Eres un coordinador de flujos de trabajo especializado en:
- Orquestación de procesos automatizados
- Coordinación entre diferentes sistemas
- Gestión de estados de flujo
- Enrutamiento inteligente de tareas
- Supervisión y optimización de workflows

Mantén una visión holística del proceso, asegura la continuidad y optimiza la eficiencia.`,
        temperature: 0.2,
        maxTokens: 1500,
        tools: [
          {
            id: 'workflow-1',
            name: 'Motor de Workflow',
            type: 'webhook' as const,
            description: 'Ejecuta acciones de workflow',
            config: { endpoints: ['start', 'pause', 'resume', 'stop'], auth: 'api_key' },
            enabled: true
          }
        ],
        useMemory: true,
        memoryType: 'session',
        memorySize: 500,
        timeout: 20000,
        maxIterations: 5,
        fallbackBehavior: 'error'
      },
      {
        id: '5',
        name: 'Sistema Multi-Agente',
        type: 'multi_agent',
        status: 'active',
        model: 'GPT-4',
        knowledgeBases: ['kb1', 'kb2', 'kb3'],
        created: new Date('2024-01-20'),
        lastUsed: new Date('2024-01-21'),
        totalConversations: 150,
        avgResponseTime: 5.2,
        successRate: 92.3,
        systemPrompt: `Eres el coordinador principal de un sistema multi-agente que gestiona:
- Delegación inteligente de tareas
- Coordinación entre agentes especializados
- Síntesis de resultados múltiples
- Resolución de conflictos entre agentes
- Optimización de la colaboración

Asegura que cada tarea sea asignada al agente más adecuado y que los resultados se integren coherentemente.`,
        temperature: 0.5,
        maxTokens: 2000,
        tools: [
          {
            id: 'multi-1',
            name: 'Coordinador de Agentes',
            type: 'custom' as const,
            description: 'Gestiona la comunicación entre agentes',
            config: { agents: ['sales', 'support', 'analytics'], protocol: 'message_passing' },
            enabled: true
          }
        ],
        useMemory: true,
        memoryType: 'graph',
        memorySize: 4000,
        timeout: 90000,
        maxIterations: 25,
        fallbackBehavior: 'human_handoff'
      }
    ];
  }
}

// Exportar una instancia singleton
export const aiAgentsService = new AIAgentsService();

// Tipos extendidos para FlowBuilder
export interface FlowBuilderAgentData {
  id: string;
  name: string;
  type: AIAgent['type'];
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  tools: Array<{
    id: string;
    name: string;
    type: 'search' | 'database' | 'api' | 'calculator' | 'file' | 'webhook' | 'mcp' | 'hubspot' | 'custom';
    description: string;
    config: Record<string, any>;
    enabled: boolean;
  }>;
  useMemory: boolean;
  memoryType: 'conversation' | 'vector' | 'graph' | 'session';
  memorySize: number;
  timeout: number;
  maxIterations: number;
  fallbackBehavior: 'human_handoff' | 'default_response' | 'error';
  status: AIAgent['status'];
  successRate: number;
  totalConversations: number;
  avgResponseTime: number;
} 