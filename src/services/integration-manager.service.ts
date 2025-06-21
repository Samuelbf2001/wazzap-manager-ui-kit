// Servicio principal de gestión de integraciones
import EvolutionAPIService from './evolution-api.service';
import N8NService from './n8n.service';
import HubSpotService from './hubspot.service';
import DatabaseService from './database.service';
import WebhookHandlerService, { WebhookHandlerConfig } from './webhook-handler.service';

import { 
  EVOLUTION_API_CONFIG, 
  N8N_CONFIG, 
  HUBSPOT_CONFIG, 
  DATABASE_CONFIG 
} from '../config/evolution-api';

export interface IntegrationConfig {
  accountId: string;
  evolutionApi: {
    enabled: boolean;
    instances: string[];
  };
  n8n: {
    enabled: boolean;
    autoCreateWorkflows: boolean;
  };
  hubspot: {
    enabled: boolean;
    autoSync: boolean;
    portalId: string;
    accessToken: string;
  };
  database: {
    type: 'sqlite' | 'postgresql' | 'mysql';
    connectionString: string;
  };
}

export interface IntegrationStatus {
  evolutionApi: {
    connected: boolean;
    instances: Array<{
      name: string;
      status: string;
      qrCode?: string;
    }>;
  };
  n8n: {
    connected: boolean;
    activeWorkflows: number;
  };
  hubspot: {
    connected: boolean;
    portalId?: string;
  };
  database: {
    connected: boolean;
    type: string;
  };
}

class IntegrationManagerService {
  private evolutionApiService: EvolutionAPIService;
  private n8nService: N8NService;
  private hubspotService: HubSpotService;
  private databaseService: DatabaseService;
  private webhookHandler: WebhookHandlerService;
  private config: IntegrationConfig;
  private isInitialized: boolean = false;

  constructor(config: IntegrationConfig) {
    this.config = config;
    this.initializeServices();
  }

  private initializeServices(): void {
    // Inicializar servicios con configuración
    this.evolutionApiService = new EvolutionAPIService(EVOLUTION_API_CONFIG);
    
    this.n8nService = new N8NService(N8N_CONFIG);
    
    this.hubspotService = new HubSpotService({
      apiKey: this.config.hubspot.accessToken,
      portalId: this.config.hubspot.portalId
    });

    this.databaseService = new DatabaseService({
      connectionString: this.config.database.connectionString,
      type: this.config.database.type
    });

    // Configurar webhook handler
    const webhookConfig: WebhookHandlerConfig = {
      evolutionApi: {
        service: this.evolutionApiService,
        enabled: this.config.evolutionApi.enabled
      },
      n8n: {
        service: this.n8nService,
        enabled: this.config.n8n.enabled
      },
      hubspot: {
        service: this.hubspotService,
        enabled: this.config.hubspot.enabled,
        autoSync: this.config.hubspot.autoSync
      },
      database: {
        saveMessages: true,
        saveContacts: true,
        saveLogs: true
      }
    };

    this.webhookHandler = new WebhookHandlerService(webhookConfig);
  }

  // === INICIALIZACIÓN COMPLETA ===

  async initialize(): Promise<void> {
    try {
      console.log('Inicializando Integration Manager...');

      // 1. Inicializar base de datos
      if (this.config.database) {
        console.log('Inicializando base de datos...');
        await this.databaseService.initialize();
      }

      // 2. Verificar Evolution API
      if (this.config.evolutionApi.enabled) {
        console.log('Verificando conexión con Evolution API...');
        await this.initializeEvolutionAPI();
      }

      // 3. Configurar N8N workflows
      if (this.config.n8n.enabled && this.config.n8n.autoCreateWorkflows) {
        console.log('Configurando workflows de N8N...');
        await this.setupN8NWorkflows();
      }

      // 4. Verificar HubSpot
      if (this.config.hubspot.enabled) {
        console.log('Verificando conexión con HubSpot...');
        await this.initializeHubSpot();
      }

      this.isInitialized = true;
      console.log('Integration Manager inicializado correctamente');

    } catch (error) {
      console.error('Error inicializando Integration Manager:', error);
      throw error;
    }
  }

  private async initializeEvolutionAPI(): Promise<void> {
    // Obtener instancias existentes
    const instancesResult = await this.evolutionApiService.getAllInstances();
    
    if (!instancesResult.success) {
      console.error('Error obteniendo instancias de Evolution API:', instancesResult.error);
      return;
    }

    // Configurar webhooks para instancias existentes
    if (instancesResult.data) {
      for (const instance of instancesResult.data) {
        await this.evolutionApiService.setWebhook(instance.instanceName, {
          url: EVOLUTION_API_CONFIG.webhookUrl,
          events: EVOLUTION_API_CONFIG.defaultEvents,
          enabled: true
        });
      }
    }

    // Crear instancias configuradas si no existen
    for (const instanceName of this.config.evolutionApi.instances) {
      const statusResult = await this.evolutionApiService.getInstanceStatus(instanceName);
      
      if (!statusResult.success) {
        console.log(`Creando instancia: ${instanceName}`);
        await this.evolutionApiService.createInstance({
          instanceName,
          webhookUrl: EVOLUTION_API_CONFIG.webhookUrl,
          events: EVOLUTION_API_CONFIG.defaultEvents,
          qrcode: true,
          markMessagesRead: false,
          delayMessage: 1000
        });
      }
    }
  }

  private async setupN8NWorkflows(): Promise<void> {
    // Crear workflows para cada instancia de WhatsApp
    for (const instanceName of this.config.evolutionApi.instances) {
      try {
        const workflow = await this.n8nService.createWhatsAppWorkflow(
          instanceName, 
          EVOLUTION_API_CONFIG.webhookUrl
        );
        
        await this.n8nService.activateWorkflow(workflow.id);
        console.log(`Workflow creado y activado para instancia: ${instanceName}`);
        
      } catch (error) {
        console.error(`Error creando workflow para ${instanceName}:`, error);
      }
    }

    // Crear workflow de sincronización con HubSpot
    if (this.config.hubspot.enabled) {
      try {
        const hubspotWorkflow = await this.n8nService.createHubSpotSyncWorkflow();
        await this.n8nService.activateWorkflow(hubspotWorkflow.id);
        console.log('Workflow de HubSpot creado y activado');
        
      } catch (error) {
        console.error('Error creando workflow de HubSpot:', error);
      }
    }
  }

  private async initializeHubSpot(): Promise<void> {
    try {
      // Verificar conexión obteniendo propiedades
      await this.hubspotService.getProperties('contacts');
      console.log('Conexión con HubSpot verificada');
      
    } catch (error) {
      console.error('Error verificando conexión con HubSpot:', error);
      throw error;
    }
  }

  // === GESTIÓN DE INSTANCIAS DE WHATSAPP ===

  async createWhatsAppInstance(instanceName: string): Promise<{success: boolean; qrCode?: string; error?: string}> {
    try {
      if (!this.config.evolutionApi.enabled) {
        return { success: false, error: 'Evolution API no está habilitado' };
      }

      // Crear instancia
      const result = await this.evolutionApiService.createInstance({
        instanceName,
        webhookUrl: EVOLUTION_API_CONFIG.webhookUrl,
        events: EVOLUTION_API_CONFIG.defaultEvents,
        qrcode: true
      });

      if (!result.success) {
        return { success: false, error: result.error?.message };
      }

      // Obtener QR code
      const connectResult = await this.evolutionApiService.connectInstance(instanceName);
      
      // Crear workflow en N8N si está habilitado
      if (this.config.n8n.enabled && this.config.n8n.autoCreateWorkflows) {
        try {
          const workflow = await this.n8nService.createWhatsAppWorkflow(
            instanceName,
            EVOLUTION_API_CONFIG.webhookUrl
          );
          await this.n8nService.activateWorkflow(workflow.id);
        } catch (error) {
          console.error('Error creando workflow N8N:', error);
        }
      }

      // Guardar en base de datos
      if (this.databaseService) {
        // Aquí puedes guardar la instancia en la base de datos
      }

      return { 
        success: true, 
        qrCode: connectResult.data?.qrCode 
      };

    } catch (error) {
      console.error('Error creando instancia de WhatsApp:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  async deleteWhatsAppInstance(instanceName: string): Promise<{success: boolean; error?: string}> {
    try {
      if (!this.config.evolutionApi.enabled) {
        return { success: false, error: 'Evolution API no está habilitado' };
      }

      // Desconectar y eliminar instancia
      await this.evolutionApiService.disconnectInstance(instanceName);
      const result = await this.evolutionApiService.deleteInstance(instanceName);

      if (!result.success) {
        return { success: false, error: result.error?.message };
      }

      // Desactivar workflows relacionados en N8N
      if (this.config.n8n.enabled) {
        try {
          const workflows = await this.n8nService.getWorkflows();
          for (const workflow of workflows) {
            if (workflow.name.includes(instanceName)) {
              await this.n8nService.deactivateWorkflow(workflow.id);
            }
          }
        } catch (error) {
          console.error('Error desactivando workflows N8N:', error);
        }
      }

      return { success: true };

    } catch (error) {
      console.error('Error eliminando instancia de WhatsApp:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  async getWhatsAppInstanceStatus(instanceName: string): Promise<any> {
    if (!this.config.evolutionApi.enabled) {
      return { error: 'Evolution API no está habilitado' };
    }

    const result = await this.evolutionApiService.getInstanceStatus(instanceName);
    return result.data;
  }

  // === MANEJO DE WEBHOOKS ===

  async processEvolutionWebhook(webhookData: any): Promise<any> {
    return await this.webhookHandler.processEvolutionWebhook(webhookData);
  }

  async processN8NWebhook(workflowId: string, executionId: string, data: any): Promise<any> {
    return await this.webhookHandler.processN8NWebhook(workflowId, executionId, data);
  }

  async processHubSpotWebhook(subscriptionType: string, data: any): Promise<any> {
    return await this.webhookHandler.processHubSpotWebhook(subscriptionType, data);
  }

  // === ENVÍO DE MENSAJES ===

  async sendMessage(instanceName: string, to: string, message: string, type: 'text' | 'image' | 'video' | 'audio' | 'document' = 'text', mediaUrl?: string): Promise<any> {
    if (!this.config.evolutionApi.enabled) {
      return { success: false, error: 'Evolution API no está habilitado' };
    }

    const result = await this.evolutionApiService.sendMessage({
      instanceName,
      to,
      type,
      content: message,
      mediaUrl,
      options: {
        delay: 1000,
        typing: true
      }
    });

    // Registrar en base de datos si fue exitoso
    if (result.success && this.databaseService && result.data) {
      try {
                 await this.databaseService.createMessage({
           conversationId: result.data.conversationId,
           instanceId: instanceName,
           type: this.mapMessageType(result.data.type),
           content: result.data.content,
          mediaUrl: result.data.mediaUrl,
          sender: {
            id: instanceName,
            type: 'agent',
            name: 'Sistema'
          },
          recipient: {
            id: to,
            type: 'customer',
            name: 'Cliente'
          },
          timestamp: result.data.timestamp,
          status: result.data.status,
          direction: 'outbound',
          reactions: [],
          metadata: {
            messageId: result.data.messageId,
            source: 'api'
          },
          processingStatus: {
            flowProcessed: false,
            aiProcessed: false,
            hubspotSynced: false,
            n8nProcessed: false
          }
        });
      } catch (error) {
        console.error('Error guardando mensaje en base de datos:', error);
      }
    }

    return result;
  }

  // === SINCRONIZACIÓN CON HUBSPOT ===

  async syncContactToHubSpot(contactId: string): Promise<any> {
    if (!this.config.hubspot.enabled || !this.databaseService) {
      return { success: false, error: 'HubSpot no está habilitado o base de datos no disponible' };
    }

    try {
      const contact = await this.databaseService.getContact(contactId);
      if (!contact) {
        return { success: false, error: 'Contacto no encontrado' };
      }

      const hubspotContact = await this.hubspotService.createContact({
        properties: {
          firstname: contact.name?.split(' ')[0] || 'Unknown',
          lastname: contact.name?.split(' ').slice(1).join(' ') || '',
          phone: contact.phoneNumber,
          whatsapp_phone: contact.phoneNumber,
          lifecyclestage: 'lead'
        }
      });

      if (hubspotContact?.id) {
        await this.databaseService.updateContact(contactId, {
          hubspotContactId: hubspotContact.id
        });

        return { success: true, hubspotContactId: hubspotContact.id };
      }

      return { success: false, error: 'Error creando contacto en HubSpot' };

    } catch (error) {
      console.error('Error sincronizando contacto con HubSpot:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  // === ESTADÍSTICAS E INFORMACIÓN ===

  async getIntegrationStatus(): Promise<IntegrationStatus> {
    const status: IntegrationStatus = {
      evolutionApi: {
        connected: false,
        instances: []
      },
      n8n: {
        connected: false,
        activeWorkflows: 0
      },
      hubspot: {
        connected: false
      },
      database: {
        connected: await this.databaseService.healthCheck(),
        type: this.config.database.type
      }
    };

    // Estado de Evolution API
    if (this.config.evolutionApi.enabled) {
      try {
        const instancesResult = await this.evolutionApiService.getAllInstances();
        status.evolutionApi.connected = instancesResult.success;
        
        if (instancesResult.data) {
          status.evolutionApi.instances = instancesResult.data.map(instance => ({
            name: instance.instanceName,
            status: instance.status,
            qrCode: instance.qrCode
          }));
        }
      } catch (error) {
        console.error('Error obteniendo estado de Evolution API:', error);
      }
    }

    // Estado de N8N
    if (this.config.n8n.enabled) {
      try {
        status.n8n.connected = await this.n8nService.healthCheck();
        
        if (status.n8n.connected) {
          const workflows = await this.n8nService.getWorkflows();
          status.n8n.activeWorkflows = workflows.filter(w => w.active).length;
        }
      } catch (error) {
        console.error('Error obteniendo estado de N8N:', error);
      }
    }

    // Estado de HubSpot
    if (this.config.hubspot.enabled) {
      try {
        await this.hubspotService.getProperties('contacts');
        status.hubspot.connected = true;
        status.hubspot.portalId = this.config.hubspot.portalId;
      } catch (error) {
        console.error('Error obteniendo estado de HubSpot:', error);
      }
    }

    return status;
  }

  async getStats(period: 'day' | 'week' | 'month' = 'day'): Promise<any> {
    if (!this.databaseService) {
      return null;
    }

    const [conversationStats, messageStats] = await Promise.all([
      this.databaseService.getConversationStats(this.config.accountId, period),
      this.databaseService.getMessageStats(this.config.accountId, period)
    ]);

    return {
      conversations: conversationStats,
      messages: messageStats,
      period
    };
  }

  // === CONFIGURACIÓN ===

  updateConfig(newConfig: Partial<IntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Reinicializar servicios si es necesario
    if (newConfig.hubspot || newConfig.n8n || newConfig.evolutionApi) {
      this.initializeServices();
    }
  }

  getConfig(): IntegrationConfig {
    return { ...this.config };
  }

  // === UTILIDADES ===

  private mapMessageType(evolutionType: string): 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'system' {
    switch (evolutionType) {
      case 'text':
        return 'text';
      case 'image':
        return 'image';
      case 'video':
        return 'video';
      case 'audio':
        return 'audio';
      case 'document':
        return 'document';
      case 'location':
        return 'location';
      case 'contact':
        return 'contact';
      case 'list':
      case 'button':
        return 'text'; // Mapear tipos especiales a texto
      default:
        return 'text';
    }
  }

  // === LIMPIEZA ===

  async cleanup(): Promise<void> {
    console.log('Limpiando Integration Manager...');
    
    if (this.databaseService) {
      await this.databaseService.close();
    }

    this.isInitialized = false;
  }
}

export default IntegrationManagerService;