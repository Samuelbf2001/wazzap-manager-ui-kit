// Servicio de base de datos para manejo de todas las entidades
import { 
  Account, 
  Contact, 
  Conversation, 
  Message, 
  Agent, 
  Campaign, 
  SystemLog, 
  WebhookLog,
  Company,
  CreateCompanyRequest,
  LoginRequest
} from '../types/database';

export interface DatabaseConfig {
  connectionString: string;
  type: 'sqlite' | 'postgresql' | 'mysql';
  migrationsPath?: string;
  seedsPath?: string;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  filters?: Record<string, any>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface WhatsAppConnection {
  id: string;
  name: string;
  phone_number?: string;
  status: 'active' | 'inactive' | 'pending' | 'connected';
  instance_state: string | null;
  instance_name: string | null;
  created_at: string;
  updated_at: string;
  qr_code?: string;
  webhook_url?: string;
  agent_assigned?: string;
  features: string[];
}

interface LogEntry {
  id: string;
  connection_id?: string;
  type: 'webhook_request' | 'webhook_response' | 'webhook_error' | 'connection_lost' | 'connection_restored' | 'message_sent' | 'qr_generated' | 'qr_scanned' | 'form_submission' | 'system_error' | 'info' | 'warning' | 'success';
  sessionName?: string;
  phoneNumber?: string;
  timestamp: string;
  message: string;
  data?: any;
  error?: string;
  status: 'success' | 'error' | 'warning' | 'info';
  source: 'system' | 'webhook' | 'connection' | 'user';
  level: 'debug' | 'info' | 'warn' | 'error';
  metadata?: {
    ip_address?: string;
    user_agent?: string;
    url?: string;
    method?: string;
    response_time?: number;
    request_size?: number;
    response_size?: number;
  };
}

interface DatabaseSchema {
  whatsapp_connections: WhatsAppConnection[];
  logs: LogEntry[];
  companies: Company[];
}

class DatabaseService {
  private config: DatabaseConfig;
  private isConnected: boolean = false;
  private db: DatabaseSchema;
  private readonly DB_KEY = 'wazzap_manager_database';
  private subscribers: Map<string, Function[]> = new Map();

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.db = this.loadDatabase();
  }

  // === INICIALIZACIÓN ===

  async initialize(): Promise<void> {
    try {
      console.log('Inicializando base de datos...');
      
      // Aquí implementarías la conexión real según el tipo de base de datos
      switch (this.config.type) {
        case 'sqlite':
          await this.initializeSQLite();
          break;
        case 'postgresql':
          await this.initializePostgreSQL();
          break;
        case 'mysql':
          await this.initializeMySQL();
          break;
        default:
          throw new Error(`Tipo de base de datos no soportado: ${this.config.type}`);
      }

      await this.runMigrations();
      this.isConnected = true;
      
      console.log('Base de datos inicializada correctamente');
    } catch (error) {
      console.error('Error inicializando base de datos:', error);
      throw error;
    }
  }

  private async initializeSQLite(): Promise<void> {
    // Implementar conexión SQLite
    console.log('Configurando SQLite...');
  }

  private async initializePostgreSQL(): Promise<void> {
    // Implementar conexión PostgreSQL
    console.log('Configurando PostgreSQL...');
  }

  private async initializeMySQL(): Promise<void> {
    // Implementar conexión MySQL
    console.log('Configurando MySQL...');
  }

  private async runMigrations(): Promise<void> {
    console.log('Ejecutando migraciones...');
    
    // Crear tablas si no existen
    await this.createTables();
  }

  private async createTables(): Promise<void> {
    // Aquí implementarías la creación de tablas según el esquema
    const tables = [
      'accounts',
      'agents',
      'contacts',
      'conversations', 
      'messages',
      'campaigns',
      'system_logs',
      'webhook_logs',
      'flow_executions'
    ];

    console.log('Creando tablas:', tables.join(', '));
    // Implementar creación de tablas
  }

  // === GESTIÓN DE CUENTAS ===

  async createAccount(accountData: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    const account: Account = {
      id: this.generateId(),
      ...accountData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Creando cuenta:', account.id);
    // Implementar inserción en base de datos
    
    return account;
  }

  async getAccount(accountId: string): Promise<Account | null> {
    console.log('Obteniendo cuenta:', accountId);
    // Implementar consulta en base de datos
    return null;
  }

  async updateAccount(accountId: string, updates: Partial<Account>): Promise<Account | null> {
    console.log('Actualizando cuenta:', accountId);
    // Implementar actualización en base de datos
    return null;
  }

  async deleteAccount(accountId: string): Promise<boolean> {
    console.log('Eliminando cuenta:', accountId);
    // Implementar eliminación en base de datos
    return true;
  }

  // === GESTIÓN DE CONTACTOS ===

  async createContact(contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    const contact: Contact = {
      id: this.generateId(),
      ...contactData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Creando contacto:', contact.id);
    // Implementar inserción en base de datos
    
    return contact;
  }

  async getContact(contactId: string): Promise<Contact | null> {
    console.log('Obteniendo contacto:', contactId);
    // Implementar consulta en base de datos
    return null;
  }

  async findContactByPhone(phoneNumber: string, accountId: string): Promise<Contact | null> {
    console.log('Buscando contacto por teléfono:', phoneNumber);
    // Implementar búsqueda en base de datos
    return null;
  }

  async findContactByHubSpotId(hubspotId: string): Promise<Contact | null> {
    console.log('Buscando contacto por HubSpot ID:', hubspotId);
    // Implementar búsqueda en base de datos
    return null;
  }

  async updateContact(contactId: string, updates: Partial<Contact>): Promise<Contact | null> {
    console.log('Actualizando contacto:', contactId);
    // Implementar actualización en base de datos
    return null;
  }

  async getContacts(accountId: string, options: QueryOptions = {}): Promise<PaginatedResult<Contact>> {
    console.log('Obteniendo contactos para cuenta:', accountId);
    // Implementar consulta paginada
    
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: options.limit || 20,
      totalPages: 0
    };
  }

  // === GESTIÓN DE CONVERSACIONES ===

  async createConversation(conversationData: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Conversation> {
    const conversation: Conversation = {
      id: this.generateId(),
      ...conversationData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Creando conversación:', conversation.id);
    // Implementar inserción en base de datos
    
    return conversation;
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    console.log('Obteniendo conversación:', conversationId);
    // Implementar consulta en base de datos
    return null;
  }

  async findConversationByContact(contactId: string, instanceId: string): Promise<Conversation | null> {
    console.log('Buscando conversación por contacto:', contactId, instanceId);
    // Implementar búsqueda en base de datos
    return null;
  }

  async updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<Conversation | null> {
    console.log('Actualizando conversación:', conversationId);
    // Implementar actualización en base de datos
    return null;
  }

  async getConversations(accountId: string, options: QueryOptions = {}): Promise<PaginatedResult<Conversation>> {
    console.log('Obteniendo conversaciones para cuenta:', accountId);
    // Implementar consulta paginada
    
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: options.limit || 20,
      totalPages: 0
    };
  }

  // === GESTIÓN DE MENSAJES ===

  async createMessage(messageData: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const message: Message = {
      id: this.generateId(),
      ...messageData,
      createdAt: new Date()
    };

    console.log('Creando mensaje:', message.id);
    // Implementar inserción en base de datos
    
    return message;
  }

  async getMessage(messageId: string): Promise<Message | null> {
    console.log('Obteniendo mensaje:', messageId);
    // Implementar consulta en base de datos
    return null;
  }

  async findMessageByExternalId(externalMessageId: string): Promise<Message | null> {
    console.log('Buscando mensaje por ID externo:', externalMessageId);
    // Implementar búsqueda en base de datos
    return null;
  }

  async updateMessage(messageId: string, updates: Partial<Message>): Promise<Message | null> {
    console.log('Actualizando mensaje:', messageId);
    // Implementar actualización en base de datos
    return null;
  }

  async getMessages(conversationId: string, options: QueryOptions = {}): Promise<PaginatedResult<Message>> {
    console.log('Obteniendo mensajes para conversación:', conversationId);
    // Implementar consulta paginada
    
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: options.limit || 50,
      totalPages: 0
    };
  }

  async updateMessageProcessingStatus(messageId: string, status: Partial<Message['processingStatus']>): Promise<void> {
    console.log('Actualizando estado de procesamiento del mensaje:', messageId, status);
    // Implementar actualización en base de datos
  }

  // === GESTIÓN DE AGENTES ===

  async createAgent(agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agent> {
    const agent: Agent = {
      id: this.generateId(),
      ...agentData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Creando agente:', agent.id);
    // Implementar inserción en base de datos
    
    return agent;
  }

  async getAgent(agentId: string): Promise<Agent | null> {
    console.log('Obteniendo agente:', agentId);
    // Implementar consulta en base de datos
    return null;
  }

  async updateAgent(agentId: string, updates: Partial<Agent>): Promise<Agent | null> {
    console.log('Actualizando agente:', agentId);
    // Implementar actualización en base de datos
    return null;
  }

  async getAgents(accountId: string, options: QueryOptions = {}): Promise<PaginatedResult<Agent>> {
    console.log('Obteniendo agentes para cuenta:', accountId);
    // Implementar consulta paginada
    
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: options.limit || 20,
      totalPages: 0
    };
  }

  // === GESTIÓN DE CAMPAÑAS ===

  async createCampaign(campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
    const campaign: Campaign = {
      id: this.generateId(),
      ...campaignData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Creando campaña:', campaign.id);
    // Implementar inserción en base de datos
    
    return campaign;
  }

  async getCampaign(campaignId: string): Promise<Campaign | null> {
    console.log('Obteniendo campaña:', campaignId);
    // Implementar consulta en base de datos
    return null;
  }

  async updateCampaign(campaignId: string, updates: Partial<Campaign>): Promise<Campaign | null> {
    console.log('Actualizando campaña:', campaignId);
    // Implementar actualización en base de datos
    return null;
  }

  async getCampaigns(accountId: string, options: QueryOptions = {}): Promise<PaginatedResult<Campaign>> {
    console.log('Obteniendo campañas para cuenta:', accountId);
    // Implementar consulta paginada
    
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: options.limit || 20,
      totalPages: 0
    };
  }

  // === GESTIÓN DE LOGS ===

  async createSystemLog(logData: Omit<SystemLog, 'id' | 'timestamp'>): Promise<SystemLog> {
    const log: SystemLog = {
      id: this.generateId(),
      ...logData,
      timestamp: new Date()
    };

    console.log('Creando log del sistema:', log.id);
    // Implementar inserción en base de datos
    
    return log;
  }

  async createWebhookLog(logData: Omit<WebhookLog, 'id' | 'timestamp'>): Promise<WebhookLog> {
    const log: WebhookLog = {
      id: this.generateId(),
      ...logData,
      timestamp: new Date()
    };

    console.log('Creando log de webhook:', log.id);
    // Implementar inserción en base de datos
    
    return log;
  }

  async getSystemLogs(accountId: string, options: QueryOptions = {}): Promise<PaginatedResult<SystemLog>> {
    console.log('Obteniendo logs del sistema para cuenta:', accountId);
    // Implementar consulta paginada
    
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: options.limit || 50,
      totalPages: 0
    };
  }

  async getWebhookLogs(accountId: string, options: QueryOptions = {}): Promise<PaginatedResult<WebhookLog>> {
    console.log('Obteniendo logs de webhooks para cuenta:', accountId);
    // Implementar consulta paginada
    
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: options.limit || 50,
      totalPages: 0
    };
  }

  // === ESTADÍSTICAS Y REPORTES ===

  async getConversationStats(accountId: string, period: 'day' | 'week' | 'month' = 'day'): Promise<any> {
    console.log('Obteniendo estadísticas de conversaciones:', accountId, period);
    // Implementar consultas de estadísticas
    
    return {
      totalConversations: 0,
      activeConversations: 0,
      resolvedConversations: 0,
      averageResponseTime: 0,
      customerSatisfactionScore: 0
    };
  }

  async getMessageStats(accountId: string, period: 'day' | 'week' | 'month' = 'day'): Promise<any> {
    console.log('Obteniendo estadísticas de mensajes:', accountId, period);
    // Implementar consultas de estadísticas
    
    return {
      totalMessages: 0,
      inboundMessages: 0,
      outboundMessages: 0,
      averageMessagesPerConversation: 0
    };
  }

  async getAgentStats(agentId: string, period: 'day' | 'week' | 'month' = 'day'): Promise<any> {
    console.log('Obteniendo estadísticas del agente:', agentId, period);
    // Implementar consultas de estadísticas
    
    return {
      conversationsHandled: 0,
      messagesHandled: 0,
      averageResponseTime: 0,
      customerSatisfactionScore: 0
    };
  }

  // === UTILIDADES ===

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  async healthCheck(): Promise<boolean> {
    return this.isConnected;
  }

  async close(): Promise<void> {
    console.log('Cerrando conexión a la base de datos...');
    this.isConnected = false;
    // Implementar cierre de conexión
  }

  // === TRANSACCIONES ===

  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    console.log('Iniciando transacción...');
    
    try {
      // Implementar inicio de transacción
      const result = await callback();
      // Implementar commit
      console.log('Transacción completada exitosamente');
      return result;
    } catch (error) {
      // Implementar rollback
      console.error('Error en transacción, haciendo rollback:', error);
      throw error;
    }
  }

  // === BÚSQUEDAS AVANZADAS ===

  async searchContacts(accountId: string, query: string, options: QueryOptions = {}): Promise<PaginatedResult<Contact>> {
    console.log('Buscando contactos:', query);
    // Implementar búsqueda por texto
    
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: options.limit || 20,
      totalPages: 0
    };
  }

  async searchMessages(conversationId: string, query: string, options: QueryOptions = {}): Promise<PaginatedResult<Message>> {
    console.log('Buscando mensajes:', query);
    // Implementar búsqueda por texto en mensajes
    
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: options.limit || 20,
      totalPages: 0
    };
  }

  private loadDatabase(): DatabaseSchema {
    try {
      const stored = localStorage.getItem(this.DB_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('❌ Error cargando base de datos:', error);
    }

    // Base de datos inicial con datos de prueba
    return {
      whatsapp_connections: [
        {
          id: 'conn_001',
          name: 'Ventas Principal',
          phone_number: '+34600123456',
          status: 'connected',
          instance_state: 'open',
          instance_name: 'ventas-principal',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-22T14:20:00Z',
          qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          webhook_url: 'https://api.whatsfull.com/webhook/ventas-principal',
          agent_assigned: 'Agente de Ventas',
          features: ['Bot', 'Webhook', 'Variables', 'Logs', 'Analytics']
        },
        {
          id: 'conn_002',
          name: 'Soporte Técnico',
          phone_number: '+34600123457',
          status: 'connected',
          instance_state: 'open',
          instance_name: 'soporte-tecnico',
          created_at: '2024-01-16T09:15:00Z',
          updated_at: '2024-01-22T16:45:00Z',
          qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          webhook_url: 'https://api.whatsfull.com/webhook/soporte-tecnico',
          agent_assigned: 'Agente de Soporte',
          features: ['Bot', 'Webhook', 'Variables', 'Logs', 'Tickets']
        },
        {
          id: 'conn_003',
          name: 'Marketing Digital',
          phone_number: '+34600123458',
          status: 'connected',
          instance_state: 'open',
          instance_name: 'marketing-digital',
          created_at: '2024-01-17T11:00:00Z',
          updated_at: '2024-01-22T12:30:00Z',
          qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          webhook_url: 'https://api.whatsfull.com/webhook/marketing-digital',
          agent_assigned: 'Agente de Marketing',
          features: ['Bot', 'Webhook', 'Variables', 'Logs', 'Campaigns']
        },
        {
          id: 'conn_004',
          name: 'Atención al Cliente',
          phone_number: '+34600123459',
          status: 'connected',
          instance_state: 'open',
          instance_name: 'atencion-cliente',
          created_at: '2024-01-18T08:45:00Z',
          updated_at: '2024-01-22T15:10:00Z',
          qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          webhook_url: 'https://api.whatsfull.com/webhook/atencion-cliente',
          agent_assigned: 'Agente de Atención',
          features: ['Bot', 'Webhook', 'Variables', 'Logs', 'CRM']
        },
        {
          id: 'conn_005',
          name: 'Ventas Corporativas',
          phone_number: '+34600123460',
          status: 'connected',
          instance_state: 'open',
          instance_name: 'ventas-corporativas',
          created_at: '2024-01-19T13:20:00Z',
          updated_at: '2024-01-22T17:00:00Z',
          qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          webhook_url: 'https://api.whatsfull.com/webhook/ventas-corporativas',
          agent_assigned: 'Agente Corporativo',
          features: ['Bot', 'Webhook', 'Variables', 'Logs', 'Analytics', 'CRM']
        },
        {
          id: 'conn_006',
          name: 'Recursos Humanos',
          phone_number: '+34600123461',
          status: 'active',
          instance_state: 'connecting',
          instance_name: 'recursos-humanos',
          created_at: '2024-01-20T10:10:00Z',
          updated_at: '2024-01-22T11:25:00Z',
          qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          webhook_url: 'https://api.whatsfull.com/webhook/recursos-humanos',
          agent_assigned: 'Agente de RRHH',
          features: ['Bot', 'Webhook', 'Variables', 'Logs']
        },
        {
          id: 'conn_007',
          name: 'Finanzas y Contabilidad',
          phone_number: '+34600123462',
          status: 'connected',
          instance_state: 'open',
          instance_name: 'finanzas-contabilidad',
          created_at: '2024-01-21T09:30:00Z',
          updated_at: '2024-01-22T14:50:00Z',
          qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          webhook_url: 'https://api.whatsfull.com/webhook/finanzas-contabilidad',
          agent_assigned: 'Agente de Finanzas',
          features: ['Bot', 'Webhook', 'Variables', 'Logs', 'Analytics']
        },
        {
          id: 'conn_008',
          name: 'Desarrollo de Software',
          phone_number: '+34600123463',
          status: 'connected',
          instance_state: 'open',
          instance_name: 'desarrollo-software',
          created_at: '2024-01-22T08:00:00Z',
          updated_at: '2024-01-22T16:30:00Z',
          qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          webhook_url: 'https://api.whatsfull.com/webhook/desarrollo-software',
          agent_assigned: 'Agente de Desarrollo',
          features: ['Bot', 'Webhook', 'Variables', 'Logs', 'GitHub']
        },
        {
          id: 'conn_009',
          name: 'E-commerce',
          phone_number: '+34600123464',
          status: 'active',
          instance_state: 'connecting',
          instance_name: 'ecommerce',
          created_at: '2024-01-22T12:15:00Z',
          updated_at: '2024-01-22T15:45:00Z',
          qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          webhook_url: 'https://api.whatsfull.com/webhook/ecommerce',
          agent_assigned: 'Agente de E-commerce',
          features: ['Bot', 'Webhook', 'Variables', 'Logs', 'Shopify']
        },
        {
          id: 'conn_010',
          name: 'Consultoría Empresarial',
          phone_number: '+34600123465',
          status: 'connected',
          instance_state: 'open',
          instance_name: 'consultoria-empresarial',
          created_at: '2024-01-22T14:30:00Z',
          updated_at: '2024-01-22T18:20:00Z',
          qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          webhook_url: 'https://api.whatsfull.com/webhook/consultoria-empresarial',
          agent_assigned: 'Agente de Consultoría',
          features: ['Bot', 'Webhook', 'Variables', 'Logs', 'CRM', 'Analytics']
        },
        {
          id: 'conn_011',
          name: 'Servicios Legales',
          phone_number: '+34600123466',
          status: 'inactive',
          instance_state: 'closed',
          instance_name: 'servicios-legales',
          created_at: '2024-01-22T16:00:00Z',
          updated_at: '2024-01-22T19:10:00Z',
          qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          webhook_url: 'https://api.whatsfull.com/webhook/servicios-legales',
          agent_assigned: 'Agente Legal',
          features: ['Bot', 'Webhook', 'Variables', 'Logs']
        },
        {
          id: 'conn_012',
          name: 'Salud y Bienestar',
          phone_number: '+34600123467',
          status: 'pending',
          instance_state: null,
          instance_name: 'salud-bienestar',
          created_at: '2024-01-22T18:00:00Z',
          updated_at: '2024-01-22T18:00:00Z',
          qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          webhook_url: 'https://api.whatsfull.com/webhook/salud-bienestar',
          agent_assigned: 'Sin asignar',
          features: ['Bot', 'Webhook', 'Variables', 'Logs']
        }
      ],
      logs: [
        {
          id: 'log_001',
          connection_id: 'conn_001',
          timestamp: '2024-01-22T14:20:00Z',
          level: 'info',
          message: 'Conexión establecida exitosamente',
          details: { instance: 'ventas-principal', status: 'connected' },
          source: 'evolution-api',
          metadata: { user_agent: 'WhatsApp/2.23.24.78', version: '1.0.0' }
        },
        {
          id: 'log_002',
          connection_id: 'conn_001',
          timestamp: '2024-01-22T14:25:00Z',
          level: 'info',
          message: 'Mensaje recibido de cliente',
          details: { from: '+34600987654', message_type: 'text', content: 'Hola, necesito información sobre sus productos' },
          source: 'webhook',
          metadata: { message_id: 'msg_123456', thread_id: 'thread_789' }
        },
        {
          id: 'log_003',
          connection_id: 'conn_002',
          timestamp: '2024-01-22T16:45:00Z',
          level: 'info',
          message: 'Ticket de soporte creado',
          details: { ticket_id: 'TKT-001', priority: 'medium', category: 'technical' },
          source: 'ticket-system',
          metadata: { customer_id: 'cust_456', agent_id: 'agent_789' }
        },
        {
          id: 'log_004',
          connection_id: 'conn_003',
          timestamp: '2024-01-22T12:30:00Z',
          level: 'info',
          message: 'Campaña de marketing enviada',
          details: { campaign_id: 'CAMP-001', recipients: 1500, sent: 1487, failed: 13 },
          source: 'campaign-manager',
          metadata: { template_id: 'tpl_001', delivery_rate: 99.13 }
        },
        {
          id: 'log_005',
          connection_id: 'conn_004',
          timestamp: '2024-01-22T15:10:00Z',
          level: 'warning',
          message: 'Tiempo de respuesta alto detectado',
          details: { avg_response_time: 45.2, threshold: 30, conversation_id: 'conv_123' },
          source: 'analytics',
          metadata: { agent_id: 'agent_456', queue_length: 8 }
        },
        {
          id: 'log_006',
          connection_id: 'conn_005',
          timestamp: '2024-01-22T17:00:00Z',
          level: 'info',
          message: 'Deal corporativo actualizado',
          details: { deal_id: 'DEAL-001', stage: 'negotiation', value: 50000 },
          source: 'crm-sync',
          metadata: { company_id: 'comp_789', owner_id: 'owner_123' }
        },
        {
          id: 'log_007',
          connection_id: 'conn_006',
          timestamp: '2024-01-22T11:25:00Z',
          level: 'error',
          message: 'Error de conexión detectado',
          details: { error_code: 'CONN_001', error_message: 'QR Code expired' },
          source: 'evolution-api',
          metadata: { retry_count: 2, last_success: '2024-01-22T10:30:00Z' }
        },
        {
          id: 'log_008',
          connection_id: 'conn_007',
          timestamp: '2024-01-22T14:50:00Z',
          level: 'info',
          message: 'Reporte financiero generado',
          details: { report_type: 'monthly', period: '2024-01', transactions: 1250 },
          source: 'finance-system',
          metadata: { generated_by: 'system', format: 'pdf' }
        },
        {
          id: 'log_009',
          connection_id: 'conn_008',
          timestamp: '2024-01-22T16:30:00Z',
          level: 'info',
          message: 'Commit de código sincronizado',
          details: { repository: 'whatsfull/main', commit_hash: 'abc123', branch: 'feature/new-integration' },
          source: 'github-webhook',
          metadata: { author: 'dev@whatsfull.com', files_changed: 12 }
        },
        {
          id: 'log_010',
          connection_id: 'conn_009',
          timestamp: '2024-01-22T15:45:00Z',
          level: 'info',
          message: 'Pedido procesado exitosamente',
          details: { order_id: 'ORD-001', amount: 299.99, customer: 'customer_123' },
          source: 'ecommerce-platform',
          metadata: { payment_method: 'credit_card', shipping_address: 'Madrid, Spain' }
        },
        {
          id: 'log_011',
          connection_id: 'conn_010',
          timestamp: '2024-01-22T18:20:00Z',
          level: 'info',
          message: 'Consulta empresarial registrada',
          details: { consultation_type: 'strategy', duration: 60, client_satisfaction: 9 },
          source: 'consultation-system',
          metadata: { consultant_id: 'cons_456', follow_up_scheduled: true }
        },
        {
          id: 'log_012',
          connection_id: 'conn_011',
          timestamp: '2024-01-22T19:10:00Z',
          level: 'warning',
          message: 'Conexión cerrada por inactividad',
          details: { inactive_duration: 7200, reason: 'timeout' },
          source: 'connection-monitor',
          metadata: { last_activity: '2024-01-22T17:10:00Z', auto_reconnect: false }
        },
        {
          id: 'log_013',
          connection_id: 'conn_012',
          timestamp: '2024-01-22T18:00:00Z',
          level: 'info',
          message: 'Nueva conexión creada',
          details: { status: 'pending', qr_generated: true },
          source: 'connection-manager',
          metadata: { created_by: 'admin@whatsfull.com', template: 'healthcare' }
        }
      ],
      companies: [
        {
          id: 'company_1',
          name: 'Empresa Demo',
          email: 'admin@demo.com',
          phone: '+34600123456',
          password: '123456', // En producción esto debería estar hasheado
          status: 'active',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: 'company_2',
          name: 'WhatsFull Corp',
          email: 'contacto@whatsfull.com',
          phone: '+34600654321',
          password: 'admin123', // En producción esto debería estar hasheado
          status: 'active',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ]
    };
  }

  private saveDatabase(): void {
    try {
      localStorage.setItem(this.DB_KEY, JSON.stringify(this.db));
      console.log('💾 Base de datos guardada exitosamente');
    } catch (error) {
      console.error('❌ Error guardando base de datos:', error);
    }
  }

  private notifySubscribers(table: string, data: any): void {
    const callbacks = this.subscribers.get(table) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('❌ Error en callback de suscriptor:', error);
      }
    });
  }

  // 📡 SUSCRIPCIONES
  public subscribe(table: string, callback: Function): void {
    if (!this.subscribers.has(table)) {
      this.subscribers.set(table, []);
    }
    this.subscribers.get(table)!.push(callback);
    console.log(`📡 Nueva suscripción a tabla: ${table}`);
  }

  public unsubscribe(table: string, callback: Function): void {
    const callbacks = this.subscribers.get(table) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
      console.log(`📡 Cancelada suscripción a tabla: ${table}`);
    }
  }

  // 🔄 OPERACIONES DE CONEXIONES WHATSAPP
  public async createConnection(connectionData: Omit<WhatsAppConnection, 'id' | 'created_at' | 'updated_at'>): Promise<WhatsAppConnection> {
    const now = new Date().toISOString();
    const newConnection: WhatsAppConnection = {
      id: `conn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      created_at: now,
      updated_at: now,
      features: ['Bot', 'Webhook', 'Variables', 'Logs'],
      agent_assigned: 'Sin asignar',
      ...connectionData
    };

    this.db.whatsapp_connections.push(newConnection);
    this.saveDatabase();
    
    console.log('✅ Nueva conexión creada:', newConnection);
    this.notifySubscribers('whatsapp_connections', this.db.whatsapp_connections);
    
    return newConnection;
  }

  public async updateConnection(id: string, updates: Partial<WhatsAppConnection>): Promise<WhatsAppConnection | null> {
    const index = this.db.whatsapp_connections.findIndex(conn => conn.id === id);
    if (index === -1) {
      console.error(`❌ Conexión no encontrada: ${id}`);
      return null;
    }

    const updatedConnection = {
      ...this.db.whatsapp_connections[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.db.whatsapp_connections[index] = updatedConnection;
    this.saveDatabase();
    
    console.log('📝 Conexión actualizada:', updatedConnection);
    this.notifySubscribers('whatsapp_connections', this.db.whatsapp_connections);
    
    return updatedConnection;
  }

  public async deleteConnection(id: string): Promise<boolean> {
    const index = this.db.whatsapp_connections.findIndex(conn => conn.id === id);
    if (index === -1) {
      console.error(`❌ Conexión no encontrada para eliminar: ${id}`);
      return false;
    }

    const deletedConnection = this.db.whatsapp_connections.splice(index, 1)[0];
    this.saveDatabase();
    
    console.log('🗑️ Conexión eliminada:', deletedConnection);
    this.notifySubscribers('whatsapp_connections', this.db.whatsapp_connections);
    
    return true;
  }

  public getConnection(id: string): WhatsAppConnection | null {
    return this.db.whatsapp_connections.find(conn => conn.id === id) || null;
  }

  public getAllConnections(): WhatsAppConnection[] {
    return [...this.db.whatsapp_connections];
  }

  public getConnectionByName(name: string): WhatsAppConnection | null {
    return this.db.whatsapp_connections.find(conn => conn.name === name) || null;
  }

  // 📊 ESTADÍSTICAS
  public getConnectionStats() {
    const connections = this.db.whatsapp_connections;
    return {
      total: connections.length,
      connected: connections.filter(c => c.status === 'connected' && c.instance_state === 'open').length,
      active: connections.filter(c => c.status === 'active').length,
      pending: connections.filter(c => c.status === 'pending').length,
      inactive: connections.filter(c => c.status === 'inactive').length
    };
  }

  // 📝 LOGS BÁSICOS (mantenemos compatibilidad)
  public async addLog(connectionId: string, message: string, type: 'info' | 'error' | 'success' | 'warning' = 'info'): Promise<void> {
    const log: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      connection_id: connectionId,
      message,
      type: 'system_error', // Mapeo a un tipo válido del enum
      timestamp: new Date().toISOString(),
      status: type,
      source: 'system',
      level: type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'info'
    };

    this.db.logs.push(log);
    
    // Mantener solo los últimos 2000 logs
    if (this.db.logs.length > 2000) {
      this.db.logs = this.db.logs.slice(-2000);
    }
    
    this.saveDatabase();
    this.notifySubscribers('logs', this.db.logs);
  }

  // 📝 NUEVA FUNCIÓN PARA LOGS AVANZADOS
  public async addAdvancedLog(logData: Omit<LogEntry, 'id' | 'timestamp'>): Promise<void> {
    // Detectar automáticamente el status si no se proporcionó o es incorrecto
    const detectedStatus = this.detectLogStatus(logData.message, logData.error, logData.type);
    
    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      status: detectedStatus, // Usar el status detectado automáticamente
      ...logData
    };

    this.db.logs.push(logEntry);
    
    // Mantener solo los últimos 2000 logs para rendimiento
    if (this.db.logs.length > 2000) {
      this.db.logs = this.db.logs.slice(-2000);
    }
    
    this.saveDatabase();
    this.notifySubscribers('logs', this.db.logs);
    
    console.log(`📝 Log agregado: ${logData.type} - Status: ${detectedStatus} - ${logData.message}`);
  }

  public getLogsByConnection(connectionId: string): LogEntry[] {
    return this.db.logs.filter(log => log.connection_id === connectionId);
  }

  public getAllLogs(): LogEntry[] {
    return [...this.db.logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getLogsByType(type: LogEntry['type']): LogEntry[] {
    return this.db.logs.filter(log => log.type === type).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getLogsByStatus(status: LogEntry['status']): LogEntry[] {
    return this.db.logs.filter(log => log.status === status).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getLogsBySource(source: LogEntry['source']): LogEntry[] {
    return this.db.logs.filter(log => log.source === source).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getLogsBySession(sessionName: string): LogEntry[] {
    return this.db.logs.filter(log => log.sessionName === sessionName).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getLogsWithFilters(filters: {
    type?: LogEntry['type'];
    status?: LogEntry['status'];
    source?: LogEntry['source'];
    connectionId?: string;
    sessionName?: string;
    dateFrom?: string;
    dateTo?: string;
  }): LogEntry[] {
    let filteredLogs = [...this.db.logs];

    if (filters.type) {
      filteredLogs = filteredLogs.filter(log => log.type === filters.type);
    }
    if (filters.status) {
      filteredLogs = filteredLogs.filter(log => log.status === filters.status);
    }
    if (filters.source) {
      filteredLogs = filteredLogs.filter(log => log.source === filters.source);
    }
    if (filters.connectionId) {
      filteredLogs = filteredLogs.filter(log => log.connection_id === filters.connectionId);
    }
    if (filters.sessionName) {
      filteredLogs = filteredLogs.filter(log => log.sessionName === filters.sessionName);
    }
    if (filters.dateFrom) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.dateTo!);
    }

    return filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // 🔍 FUNCIÓN PARA DETECTAR STATUS AUTOMÁTICAMENTE
  private detectLogStatus(message: string, error?: string, type?: string): LogEntry['status'] {
    const text = `${message} ${error || ''} ${type || ''}`.toLowerCase();
    
    // Palabras clave para errores
    const errorKeywords = [
      'error', 'failed', 'fail', 'fallo', 'falló', 'timeout', 'exception', 
      'crash', 'crashed', 'network error', 'connection lost', 'perdida', 
      'perdió', 'malformed', 'malformado', 'invalid', 'inválido', 'not found',
      'no encontrado', 'refused', 'rechazado', 'unauthorized', 'forbidden',
      '404', '500', '502', '503', 'bad gateway', 'internal server error',
      'syntax error', 'reference error', 'type error', 'range error',
      'conexión perdida', 'sistema de monitoreo', 'error de sistema'
    ];
    
    // Palabras clave para éxitos
    const successKeywords = [
      'success', 'successful', 'exitoso', 'exitosamente', 'éxito', 'ok', 
      'completed', 'completado', 'generated', 'generado', 'created', 'creado',
      'restored', 'restaurado', 'established', 'establecido', 'connected',
      'conectado', 'sent', 'enviado', 'received', 'recibido', 'procesado',
      'processed', 'qr generado', 'conexión restaurada', 'correctamente',
      'con éxito', 'automática exitosa'
    ];
    
    // Palabras clave para warnings
    const warningKeywords = [
      'warning', 'warn', 'advertencia', 'caution', 'cuidado', 'deprecated',
      'obsoleto', 'retry', 'reintentar', 'timeout', 'slow', 'lento'
    ];
    
    // Detectar errores
    if (error || errorKeywords.some(keyword => text.includes(keyword))) {
      return 'error';
    }
    
    // Detectar éxitos
    if (successKeywords.some(keyword => text.includes(keyword))) {
      return 'success';
    }
    
    // Detectar warnings
    if (warningKeywords.some(keyword => text.includes(keyword))) {
      return 'warning';
    }
    
    // Por defecto, info
    return 'info';
  }

  // 🔧 FUNCIÓN PARA RECALCULAR TODOS LOS LOGS EXISTENTES
  public recalculateLogStatuses(): number {
    let updatedCount = 0;
    
    this.db.logs.forEach(log => {
      const detectedStatus = this.detectLogStatus(log.message, log.error, log.type);
      
      if (log.status !== detectedStatus) {
        log.status = detectedStatus;
        updatedCount++;
      }
    });
    
    if (updatedCount > 0) {
      this.saveDatabase();
      this.notifySubscribers('logs', this.db.logs);
      console.log(`🔄 Se actualizaron ${updatedCount} logs con status detectado automáticamente`);
    }
    
    return updatedCount;
  }

  public getLogStats() {
    // Primero recalcular los status automáticamente
    this.recalculateLogStatuses();
    
    const logs = this.db.logs;
    const stats = {
      total: logs.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
      recentErrors: logs.filter(l => l.status === 'error').slice(-5),
      todayCount: logs.filter(l => {
        const today = new Date().toDateString();
        const logDate = new Date(l.timestamp).toDateString();
        return today === logDate;
      }).length,
      // Nuevas estadísticas dinámicas
      errorCount: logs.filter(l => l.status === 'error').length,
      successCount: logs.filter(l => l.status === 'success').length,
      warningCount: logs.filter(l => l.status === 'warning').length,
      infoCount: logs.filter(l => l.status === 'info').length
    };

    logs.forEach(log => {
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
      stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;
      stats.bySource[log.source] = (stats.bySource[log.source] || 0) + 1;
    });

    return stats;
  }

  // 🎯 FUNCIÓN DE DEMOSTRACIÓN - Crear logs de ejemplo
  public async addDemoLogs(): Promise<void> {
    const now = new Date();
    
    // Función helper para crear fechas anteriores
    const daysAgo = (days: number) => {
      const date = new Date(now);
      date.setDate(date.getDate() - days);
      return date.toISOString();
    };

    const demoLogs: Omit<LogEntry, 'id' | 'timestamp'>[] = [
      // === LOGS DE HACE 5 DÍAS ===
      {
        type: 'webhook_error',
        message: 'Error de timeout en webhook personalizado',
        status: 'error',
        source: 'webhook',
        level: 'error',
        sessionName: 'ErrorConnection_Viejo',
        phoneNumber: '+34600111222',
        error: 'TimeoutError: El webhook no respondió en 30 segundos',
        metadata: {
          url: 'https://n8n-n8n.5raxun.easypanel.host/webhook-test/f2666a61-db14-45e0-ab5b-4bb895adb3c2',
          method: 'POST',
          response_time: 30000
        }
      },
      {
        type: 'connection_lost',
        message: 'Conexión perdida inesperadamente',
        status: 'error',
        source: 'connection',
        level: 'error',
        sessionName: 'ConexionFallida_01',
        phoneNumber: '+34600222333',
        error: 'Error de red: Connection reset by peer',
        metadata: {
          response_time: 0
        }
      },
      {
        type: 'system_error',
        message: 'Fallo en el sistema de monitoreo',
        status: 'error',
        source: 'system',
        level: 'error',
        error: 'ReferenceError: monitor is not defined',
        data: {
          stack_trace: 'at ConnectionMonitor.check (monitor.js:45:12)'
        }
      },
      
      // === LOGS DE HACE 3 DÍAS ===
      {
        type: 'webhook_response',
        message: 'QR generado exitosamente desde webhook',
        status: 'success',
        source: 'webhook',
        level: 'info',
        sessionName: 'ExitoAntiguo_01',
        phoneNumber: '+34600333444',
        data: { 
          success: true, 
          base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVwAAA...',
          qr_generated: true
        },
        metadata: {
          url: 'https://n8n-n8n.5raxun.easypanel.host/webhook-test/f2666a61-db14-45e0-ab5b-4bb895adb3c2',
          method: 'POST',
          response_time: 245
        }
      },
      {
        type: 'connection_restored',
        message: 'Conexión WhatsApp restaurada correctamente',
        status: 'success',
        source: 'connection',
        level: 'info',
        sessionName: 'ConexionExitosa_02',
        phoneNumber: '+34600444555',
        data: {
          instance_name: 'ConexionExitosa_02',
          state: 'open',
          previous_status: 'closed'
        },
        metadata: {
          response_time: 156
        }
      },
      {
        type: 'form_submission',
        message: 'Formulario de conexión procesado con éxito',
        status: 'success',
        source: 'user',
        level: 'info',
        sessionName: 'FormularioOK_03',
        phoneNumber: '+34600555666',
        data: {
          connection_name: 'FormularioOK_03',
          phone_number: '+34600555666',
          account_protection: true
        }
      },

      // === LOGS DE HACE 2 DÍAS ===
      {
        type: 'webhook_error',
        message: 'Respuesta malformada del webhook',
        status: 'error',
        source: 'webhook',
        level: 'error',
        sessionName: 'ErrorJSON_04',
        phoneNumber: '+34600666777',
        error: 'SyntaxError: Unexpected token in JSON at position 123',
        metadata: {
          url: 'https://n8n-n8n.5raxun.easypanel.host/webhook-test/f2666a61-db14-45e0-ab5b-4bb895adb3c2',
          method: 'POST',
          response_time: 890
        }
      },
      {
        type: 'qr_generated',
        message: 'Código QR generado exitosamente',
        status: 'success',
        source: 'system',
        level: 'info',
        sessionName: 'QRExitoso_05',
        phoneNumber: '+34600777888',
        data: {
          qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVwAAA...',
          format: 'png'
        }
      },

      // === LOGS DE AYER ===
      {
        type: 'webhook_error',
        message: 'Error 500 en el servidor del webhook',
        status: 'error',
        source: 'webhook',
        level: 'error',
        sessionName: 'Error500_06',
        phoneNumber: '+34600888999',
        error: 'HTTPError: 500 Internal Server Error',
        metadata: {
          url: 'https://n8n-n8n.5raxun.easypanel.host/webhook-test/f2666a61-db14-45e0-ab5b-4bb895adb3c2',
          method: 'POST',
          response_time: 5000
        }
      },
      {
        type: 'message_sent',
        message: 'Mensaje de bienvenida enviado correctamente',
        status: 'success',
        source: 'system',
        level: 'info',
        sessionName: 'MensajeOK_07',
        phoneNumber: '+34600999000',
        data: {
          message_id: 'msg_123456789',
          recipient: '+34600999000',
          content: 'Bienvenido a WhatsApp Manager'
        },
        metadata: {
          response_time: 230
        }
      },
      {
        type: 'connection_restored',
        message: 'Reconexión automática exitosa',
        status: 'success',
        source: 'connection',
        level: 'info',
        sessionName: 'AutoReconect_08',
        phoneNumber: '+34601000111',
        data: {
          instance_name: 'AutoReconect_08',
          state: 'open',
          reconnection_attempt: 3
        }
      },

      // === LOGS DE HOY ===
      {
        type: 'webhook_request',
        message: 'Solicitud enviada al webhook de verificación',
        status: 'info',
        source: 'webhook',
        level: 'info',
        sessionName: 'HoyRequest_01',
        phoneNumber: '+34601111222',
        data: { request_payload: { connection_name: 'HoyRequest_01' } },
        metadata: {
          url: 'https://n8n-n8n.5raxun.easypanel.host/webhook-test/f2666a61-db14-45e0-ab5b-4bb895adb3c2',
          method: 'POST',
          response_time: 125
        }
      },
      {
        type: 'webhook_response',
        message: 'Respuesta exitosa del webhook recibida',
        status: 'success',
        source: 'webhook',
        level: 'info',
        sessionName: 'HoySuccess_02',
        phoneNumber: '+34601222333',
        data: { 
          success: true,
          data: {
            pairingCode: null,
            code: "2@j4N6Y1l64+r42o2vpDzZe7Qpe8b+7SRFgZG3bKvMiN4zbhK0gI948kzPYkkrGOK6HC3zot5fwDNVxvsQXk6iKFjryfwO2HOcCNc=",
            base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVwAAAFcCAYAAACEFgYs...",
            count: 1
          }
        },
        metadata: {
          url: 'https://n8n-n8n.5raxun.easypanel.host/webhook-test/f2666a61-db14-45e0-ab5b-4bb895adb3c2',
          method: 'POST',
          response_time: 189,
          response_size: 1256
        }
      },
      {
        type: 'form_submission',
        message: 'Nueva conexión creada desde formulario',
        status: 'success',
        source: 'user',
        level: 'info',
        sessionName: 'HoyForm_03',
        phoneNumber: '+34601333444',
        data: {
          connection_name: 'HoyForm_03',
          phone_number: '+34601333444',
          account_protection: true,
          message_logging: true
        }
      },
      {
        type: 'webhook_error',
        message: 'Error de conexión en webhook actual',
        status: 'error',
        source: 'webhook',
        level: 'error',
        sessionName: 'HoyError_04',
        phoneNumber: '+34601444555',
        error: 'NetworkError: Failed to fetch - ERR_NETWORK_CHANGED',
        metadata: {
          url: 'https://n8n-n8n.5raxun.easypanel.host/webhook-test/f2666a61-db14-45e0-ab5b-4bb895adb3c2',
          method: 'POST'
        }
      }
    ];

    console.log('🎯 Creando logs de demostración con fechas variadas...');
    
    for (let i = 0; i < demoLogs.length; i++) {
      const logData = demoLogs[i];
      
      // Asignar timestamps basados en la posición del log
      let timestamp: string;
      if (i < 3) {
        // Primeros 3 logs: hace 5 días
        timestamp = daysAgo(5);
      } else if (i < 6) {
        // Siguiente 3 logs: hace 3 días
        timestamp = daysAgo(3);
      } else if (i < 8) {
        // Siguiente 2 logs: hace 2 días
        timestamp = daysAgo(2);
      } else if (i < 11) {
        // Siguiente 3 logs: ayer
        timestamp = daysAgo(1);
      } else {
        // Últimos logs: hoy
        timestamp = now.toISOString();
      }
      
      // Crear el log con timestamp específico
      const logEntry: LogEntry = {
        id: this.generateId(),
        timestamp,
        ...logData
      };
      
      this.db.logs.push(logEntry);
      
      // Pequeña pausa para evitar problemas de procesamiento
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    this.saveDatabase();
    this.notifySubscribers('logs', this.db.logs);
    
    console.log(`✅ Se crearon ${demoLogs.length} logs de demostración con fechas variadas`);
    console.log(`📊 Logs por estado: 
    - Éxitos: ${demoLogs.filter(l => l.status === 'success').length}
    - Errores: ${demoLogs.filter(l => l.status === 'error').length}
    - Info: ${demoLogs.filter(l => l.status === 'info').length}`);
  }

  // 🧹 FUNCIÓN PARA LIMPIAR SOLO LOS LOGS
  public clearAllLogs(): void {
    console.log('🧹 Limpiando todos los logs de la base de datos...');
    this.db.logs = [];
    this.saveDatabase();
    this.notifySubscribers('logs', this.db.logs);
    console.log('✅ Todos los logs han sido eliminados de la base de datos');
  }

  // 🔧 UTILIDADES
  public exportDatabase(): string {
    return JSON.stringify(this.db, null, 2);
  }

  public importDatabase(jsonData: string): boolean {
    try {
      const importedData = JSON.parse(jsonData);
      this.db = importedData;
      this.saveDatabase();
      
      // Notificar a todos los suscriptores
      this.notifySubscribers('whatsapp_connections', this.db.whatsapp_connections);
      this.notifySubscribers('logs', this.db.logs);
      
      console.log('📂 Base de datos importada exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error importando base de datos:', error);
      return false;
    }
  }

  public clearDatabase(): void {
    this.db = {
      whatsapp_connections: [],
      logs: [],
      companies: [] // Limpiar también las empresas
    };
    this.saveDatabase();
    
    // Notificar a todos los suscriptores
    this.notifySubscribers('whatsapp_connections', this.db.whatsapp_connections);
    this.notifySubscribers('logs', this.db.logs);
    
    console.log('🧹 Base de datos limpiada');
  }

  // 🆕 FUNCIÓN PARA CREAR LOGS ESPECÍFICOS DE HOY (para testing de filtros)
  public async createTodayTestLogs(): Promise<void> {
    console.log('🧪 Creando logs de prueba para HOY específicamente...');
    
    const today = new Date();
    const todayTimestamps = [
      new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30, 0).toISOString(),
      new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 45, 15).toISOString(),
      new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 20, 30).toISOString(),
      new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 15, 45).toISOString(),
      new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0, 0).toISOString()
    ];

    const todayLogs: Array<Omit<LogEntry, 'id'>> = [
      {
        timestamp: todayTimestamps[0],
        type: 'webhook_request',
        message: 'Test: Solicitud webhook de esta mañana',
        status: 'info',
        source: 'webhook',
        level: 'info',
        sessionName: 'TestHoy_01',
        phoneNumber: '+34700111222'
      },
      {
        timestamp: todayTimestamps[1],
        type: 'webhook_response',
        message: 'Test: QR generado exitosamente hoy',
        status: 'success',
        source: 'webhook',
        level: 'info',
        sessionName: 'TestHoy_02',
        phoneNumber: '+34700222333'
      },
      {
        timestamp: todayTimestamps[2],
        type: 'webhook_error',
        message: 'Test: Error de timeout en webhook hoy',
        status: 'error',
        source: 'webhook',
        level: 'error',
        sessionName: 'TestHoy_03',
        phoneNumber: '+34700333444',
        error: 'TimeoutError: Webhook timeout'
      },
      {
        timestamp: todayTimestamps[3],
        type: 'form_submission',
        message: 'Test: Formulario enviado con éxito hoy',
        status: 'success',
        source: 'user',
        level: 'info',
        sessionName: 'TestHoy_04',
        phoneNumber: '+34700444555'
      },
      {
        timestamp: todayTimestamps[4],
        type: 'connection_restored',
        message: 'Test: Conexión restaurada esta tarde',
        status: 'success',
        source: 'connection',
        level: 'info',
        sessionName: 'TestHoy_05',
        phoneNumber: '+34700555666'
      }
    ];

    // Agregar logs específicos de hoy
    todayLogs.forEach(logData => {
      this.db.logs.push({
        id: this.generateId(),
        ...logData
      });
    });

    this.saveDatabase();
    this.notifySubscribers('logs', this.db.logs);
    
    console.log(`✅ Se crearon ${todayLogs.length} logs específicos para HOY`);
    console.log(`📅 Fecha de hoy: ${today.toISOString().split('T')[0]}`);
  }

  // === GESTIÓN DE EMPRESAS ===

  async createCompany(companyData: CreateCompanyRequest): Promise<Company> {
    // Verificar si ya existe una empresa con ese email
    const existingCompany = this.db.companies.find(c => c.email === companyData.email);
    if (existingCompany) {
      throw new Error('Ya existe una empresa registrada con este correo electrónico');
    }

    const company: Company = {
      id: this.generateId(),
      name: companyData.name,
      email: companyData.email,
      phone: companyData.phone,
      password: companyData.password, // En producción debería hashearse
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.db.companies.push(company);
    this.saveDatabase();
    
    console.log('✅ Nueva empresa creada:', company.name);
    return company;
  }

  async getCompany(companyId: string): Promise<Company | null> {
    return this.db.companies.find(c => c.id === companyId) || null;
  }

  async getCompanyByEmail(email: string): Promise<Company | null> {
    return this.db.companies.find(c => c.email === email) || null;
  }

  async updateCompany(companyId: string, updates: Partial<Company>): Promise<Company | null> {
    const index = this.db.companies.findIndex(c => c.id === companyId);
    if (index === -1) {
      return null;
    }

    this.db.companies[index] = {
      ...this.db.companies[index],
      ...updates,
      updatedAt: new Date()
    };

    this.saveDatabase();
    console.log('📝 Empresa actualizada:', this.db.companies[index].name);
    return this.db.companies[index];
  }

  async deleteCompany(companyId: string): Promise<boolean> {
    const index = this.db.companies.findIndex(c => c.id === companyId);
    if (index === -1) {
      return false;
    }

    const deletedCompany = this.db.companies.splice(index, 1)[0];
    this.saveDatabase();
    
    console.log('🗑️ Empresa eliminada:', deletedCompany.name);
    return true;
  }

  async getAllCompanies(): Promise<Company[]> {
    return [...this.db.companies];
  }

  // === AUTENTICACIÓN ===

  async authenticateCompany(email: string, password: string): Promise<Company | null> {
    console.log('🔐 Intentando autenticar empresa:', email);
    
    const company = await this.getCompanyByEmail(email);
    if (!company) {
      console.log('❌ Empresa no encontrada:', email);
      return null;
    }

    if (company.status !== 'active') {
      console.log('❌ Empresa no está activa:', email);
      return null;
    }

    // En producción, aquí compararías con un hash
    if (company.password !== password) {
      console.log('❌ Contraseña incorrecta para:', email);
      return null;
    }

    console.log('✅ Autenticación exitosa para:', company.name);
    return company;
  }
}

// Instancia singleton con configuración por defecto
const defaultConfig: DatabaseConfig = {
  connectionString: 'local://wazzap_manager.db',
  type: 'sqlite'
};

export const databaseService = new DatabaseService(defaultConfig);

// Tipos exportados
export type { WhatsAppConnection, DatabaseSchema, LogEntry };