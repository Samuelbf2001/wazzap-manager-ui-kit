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
      },
      {
        id: '6',
        name: 'Agente de Actualización de Información',
        type: 'conversational',
        status: 'active',
        model: 'GPT-4',
        knowledgeBases: ['kb1', 'kb2'],
        created: new Date('2024-01-22'),
        lastUsed: new Date('2024-01-22'),
        totalConversations: 0,
        avgResponseTime: 1.5,
        successRate: 98.0,
        systemPrompt: `Eres un agente especializado en actualización y sincronización de información. Tu función principal es:

- **Actualizar datos de contactos**: Mantener información actualizada de clientes en HubSpot
- **Sincronizar conversaciones**: Registrar interacciones de WhatsApp en el CRM
- **Validar información**: Verificar y corregir datos inconsistentes
- **Enriquecer perfiles**: Agregar información adicional basada en conversaciones
- **Mantener historial**: Registrar todas las interacciones y cambios

**Proceso de trabajo:**
1. Identifica información nueva o modificada en las conversaciones
2. Valida la información contra fuentes existentes
3. Actualiza los registros correspondientes en HubSpot
4. Registra el cambio con timestamp y contexto
5. Notifica sobre actualizaciones importantes

Mantén un registro detallado de todos los cambios y siempre preserva la integridad de los datos.`,
        temperature: 0.2,
        maxTokens: 1500,
        tools: [
          {
            id: 'hubspot-update-1',
            name: 'HubSpot Contact Update',
            type: 'hubspot' as const,
            description: 'Actualiza información de contactos en HubSpot',
            config: { 
              apiKey: 'xxx', 
              operations: ['contacts', 'companies'], 
              fields: ['firstname', 'lastname', 'email', 'phone', 'company', 'jobtitle', 'lifecyclestage']
            },
            enabled: true
          },
          {
            id: 'conversation-log-1',
            name: 'Registro de Conversaciones',
            type: 'database' as const,
            description: 'Registra conversaciones y cambios',
            config: { database: 'conversations', table: 'logs' },
            enabled: true
          },
          {
            id: 'validation-1',
            name: 'Validador de Datos',
            type: 'custom' as const,
            description: 'Valida y limpia información',
            config: { validators: ['email', 'phone', 'name'], rules: 'strict' },
            enabled: true
          }
        ],
        useMemory: true,
        memoryType: 'conversation',
        memorySize: 2000,
        timeout: 30000,
        maxIterations: 8,
        fallbackBehavior: 'human_handoff'
      },
      {
        id: '7',
        name: 'Agente de Recomendaciones Comerciales',
        type: 'reasoning',
        status: 'active',
        model: 'GPT-4',
        knowledgeBases: ['kb1', 'kb2', 'kb3'],
        created: new Date('2024-01-22'),
        lastUsed: new Date('2024-01-22'),
        totalConversations: 0,
        avgResponseTime: 3.2,
        successRate: 95.5,
        systemPrompt: `Eres un consultor comercial experto especializado en análisis de oportunidades y recomendaciones estratégicas. Tu función es:

- **Análisis de oportunidades**: Identificar potencial comercial en conversaciones
- **Recomendaciones personalizadas**: Sugerir acciones específicas basadas en el perfil del cliente
- **Estrategias de seguimiento**: Proponer próximos pasos comerciales efectivos
- **Segmentación inteligente**: Clasificar clientes según su potencial y comportamiento
- **Optimización de conversiones**: Mejorar tasas de éxito comercial

**Metodología de trabajo:**
1. **Análisis del contexto**: Evalúa la situación actual del cliente
2. **Identificación de necesidades**: Detecta problemas y oportunidades
3. **Evaluación del potencial**: Calcula el valor comercial potencial
4. **Generación de recomendaciones**: Propone acciones específicas y medibles
5. **Priorización**: Ordena acciones por impacto y probabilidad de éxito

**Tipos de recomendaciones:**
- Seguimiento inmediato (24-48 horas)
- Nurturing a largo plazo (semanas/meses)
- Upselling/Cross-selling
- Referencias y recomendaciones
- Escalamiento a especialistas

Siempre fundamenta tus recomendaciones con datos concretos y considera el contexto del cliente.`,
        temperature: 0.6,
        maxTokens: 2500,
        tools: [
          {
            id: 'crm-analysis-1',
            name: 'Análisis CRM',
            type: 'hubspot' as const,
            description: 'Analiza historial y comportamiento del cliente',
            config: { 
              apiKey: 'xxx', 
              operations: ['contacts', 'deals', 'activities', 'companies'],
              analysis: ['behavior', 'engagement', 'purchase_history']
            },
            enabled: true
          },
          {
            id: 'scoring-1',
            name: 'Motor de Scoring',
            type: 'custom' as const,
            description: 'Calcula puntuaciones de oportunidad comercial',
            config: { 
              models: ['lead_scoring', 'opportunity_scoring', 'churn_prediction'],
              weights: { engagement: 0.3, budget: 0.25, authority: 0.25, timeline: 0.2 }
            },
            enabled: true
          },
          {
            id: 'recommendation-engine-1',
            name: 'Motor de Recomendaciones',
            type: 'custom' as const,
            description: 'Genera recomendaciones basadas en ML',
            config: { 
              algorithms: ['collaborative_filtering', 'content_based', 'hybrid'],
              data_sources: ['conversations', 'crm', 'behavior']
            },
            enabled: true
          },
          {
            id: 'market-intelligence-1',
            name: 'Inteligencia de Mercado',
            type: 'api' as const,
            description: 'Accede a datos de mercado y tendencias',
            config: { 
              baseUrl: 'https://api.market-intelligence.com', 
              endpoints: ['trends', 'competitors', 'pricing'],
              auth: 'bearer'
            },
            enabled: true
          }
        ],
        useMemory: true,
        memoryType: 'graph',
        memorySize: 3000,
        timeout: 45000,
        maxIterations: 12,
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