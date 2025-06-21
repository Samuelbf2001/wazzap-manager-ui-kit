import { EvolutionAPIWebhookEvent, EvolutionAPIMessage, EvolutionAPIContact } from '../types/evolution-api';
import { Message, Contact, Conversation, WebhookLog } from '../types/database';
import EvolutionAPIService from './evolution-api.service';
import N8NService from './n8n.service';
import HubSpotService from './hubspot.service';

export interface WebhookHandlerConfig {
  evolutionApi: {
    service: EvolutionAPIService;
    enabled: boolean;
  };
  n8n: {
    service: N8NService;
    enabled: boolean;
    defaultWorkflowId?: string;
  };
  hubspot: {
    service: HubSpotService;
    enabled: boolean;
    autoSync: boolean;
  };
  database: {
    saveMessages: boolean;
    saveContacts: boolean;
    saveLogs: boolean;
  };
}

export interface ProcessingResult {
  success: boolean;
  messageId?: string;
  contactId?: string;
  conversationId?: string;
  flowExecuted?: boolean;
  hubspotSynced?: boolean;
  n8nProcessed?: boolean;
  error?: string;
  processingTime: number;
}

class WebhookHandlerService {
  private config: WebhookHandlerConfig;
  private processingQueue: Map<string, Promise<ProcessingResult>> = new Map();

  constructor(config: WebhookHandlerConfig) {
    this.config = config;
  }

  // === PROCESAR WEBHOOKS DE EVOLUTION API ===

  async processEvolutionWebhook(event: EvolutionAPIWebhookEvent): Promise<ProcessingResult> {
    const startTime = Date.now();
    const eventKey = `${event.instanceName}_${event.event}_${Date.now()}`;

    try {
      // Evitar procesamiento duplicado
      if (this.processingQueue.has(eventKey)) {
        return await this.processingQueue.get(eventKey)!;
      }

      const processingPromise = this.handleEvolutionEvent(event, startTime);
      this.processingQueue.set(eventKey, processingPromise);

      const result = await processingPromise;
      
      // Limpiar la cola después del procesamiento
      setTimeout(() => {
        this.processingQueue.delete(eventKey);
      }, 30000); // 30 segundos

      return result;

    } catch (error) {
      console.error('Error procesando webhook de Evolution API:', error);
      
      const result: ProcessingResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        processingTime: Date.now() - startTime
      };

      // Guardar log de error
      if (this.config.database.saveLogs) {
        await this.saveWebhookLog({
          source: 'evolution-api',
          event,
          error: result.error,
          processingTime: result.processingTime
        });
      }

      return result;
    }
  }

  private async handleEvolutionEvent(event: EvolutionAPIWebhookEvent, startTime: number): Promise<ProcessingResult> {
    const result: ProcessingResult = {
      success: true,
      processingTime: 0
    };

    switch (event.event) {
      case 'messages.upsert':
        if (event.data.message) {
          result.messageId = await this.processMessage(event.data.message, event.instanceName);
          result.conversationId = event.data.message.conversationId;
        }
        break;

      case 'contacts.upsert':
        if (event.data.contact) {
          result.contactId = await this.processContact(event.data.contact, event.instanceName);
        }
        break;

      case 'connection.update':
        await this.processConnectionUpdate(event.data.instance!, event.instanceName);
        break;

      default:
        console.log(`Evento no manejado: ${event.event}`);
    }

    // Procesar con N8N si está habilitado
    if (this.config.n8n.enabled && result.messageId) {
      result.n8nProcessed = await this.processWithN8N(event);
    }

    result.processingTime = Date.now() - startTime;

    // Guardar log de procesamiento exitoso
    if (this.config.database.saveLogs) {
      await this.saveWebhookLog({
        source: 'evolution-api',
        event,
        result,
        processingTime: result.processingTime
      });
    }

    return result;
  }

  private async processMessage(message: EvolutionAPIMessage, instanceName: string): Promise<string> {
    try {
      // Verificar si el mensaje ya existe
      const existingMessage = await this.findMessageById(message.messageId);
      if (existingMessage) {
        console.log(`Mensaje ya procesado: ${message.messageId}`);
        return existingMessage.id;
      }

      // Buscar o crear contacto
      const contactId = await this.findOrCreateContact(message.from, instanceName);
      
      // Buscar o crear conversación
      const conversationId = await this.findOrCreateConversation(contactId, instanceName);

             // Crear mensaje en la base de datos
       const messageData: Partial<Message> = {
         id: this.generateId(),
         conversationId,
         instanceId: instanceName,
         type: this.mapMessageType(message.type),
         content: message.content,
         mediaUrl: message.mediaUrl,
         mediaMetadata: message.mediaUrl ? {
           filename: message.fileName,
           mimeType: message.mediaType
         } : undefined,
         sender: {
           id: message.from,
           type: message.isFromMe ? 'agent' : 'customer',
           name: message.senderName || 'Unknown',
           phoneNumber: message.from
         },
         recipient: {
           id: message.to,
           type: message.isFromMe ? 'customer' : 'agent',
           name: 'System',
           phoneNumber: message.to
         },
         timestamp: message.timestamp,
         status: message.status,
         direction: message.isFromMe ? 'outbound' : 'inbound',
         metadata: {
           messageId: message.messageId,
           quotedMessageId: message.quotedMessage?.messageId,
           source: 'api'
         },
         processingStatus: {
           flowProcessed: false,
           aiProcessed: false,
           hubspotSynced: false,
           n8nProcessed: false
         },
         createdAt: new Date()
       };

      if (this.config.database.saveMessages) {
        await this.saveMessage(messageData);
      }

      // Sincronizar con HubSpot si está habilitado
      if (this.config.hubspot.enabled && this.config.hubspot.autoSync && !message.isFromMe) {
        try {
          await this.syncMessageToHubSpot(messageData, contactId);
          messageData.processingStatus!.hubspotSynced = true;
        } catch (error) {
          console.error('Error sincronizando con HubSpot:', error);
        }
      }

      return messageData.id!;

    } catch (error) {
      console.error('Error procesando mensaje:', error);
      throw error;
    }
  }

  private async processContact(contact: EvolutionAPIContact, instanceName: string): Promise<string> {
    try {
      const contactData: Partial<Contact> = {
        id: this.generateId(),
        accountId: 'default', // Esto debería venir de la configuración
        phoneNumber: contact.phoneNumber,
        name: contact.name,
        profilePictureUrl: contact.profilePictureUrl,
        isGroup: contact.isGroup,
        preferences: {
          language: 'es',
          timezone: 'America/Mexico_City',
          communicationChannel: ['whatsapp'],
          doNotDisturb: {
            enabled: false
          },
          marketingOptIn: false,
          notificationOptIn: true
        },
        demographics: {},
        interactions: {
          totalConversations: 0,
          totalMessages: 0,
          averageResponseTime: 0
        },
        tags: [],
        customFields: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (this.config.database.saveContacts) {
        await this.saveContact(contactData);
      }

      return contactData.id!;

    } catch (error) {
      console.error('Error procesando contacto:', error);
      throw error;
    }
  }

  private async processConnectionUpdate(instance: any, instanceName: string): Promise<void> {
    console.log(`Estado de conexión actualizado para ${instanceName}:`, instance);
    
    // Aquí puedes implementar lógica para actualizar el estado de la instancia
    // Por ejemplo, actualizar en la base de datos, notificar a los usuarios, etc.
  }

  // === PROCESAMIENTO CON N8N ===

  private async processWithN8N(event: EvolutionAPIWebhookEvent): Promise<boolean> {
    try {
      if (!this.config.n8n.service) {
        return false;
      }

      // Buscar workflow específico para la instancia o usar el por defecto
      const workflowPath = `whatsapp/${event.instanceName}`;
      
      await this.config.n8n.service.triggerWebhook(workflowPath, 'POST', event);
      
      return true;

    } catch (error) {
      console.error('Error procesando con N8N:', error);
      return false;
    }
  }

  // === SINCRONIZACIÓN CON HUBSPOT ===

  private async syncMessageToHubSpot(message: Partial<Message>, contactId: string): Promise<void> {
    try {
      if (!this.config.hubspot.service) {
        return;
      }

      // Buscar contacto de HubSpot asociado
      const contact = await this.findContactById(contactId);
      if (!contact?.hubspotContactId) {
        // Crear contacto en HubSpot si no existe
        const hubspotContact = await this.config.hubspot.service.createContact({
          properties: {
            firstname: contact?.name?.split(' ')[0] || 'Unknown',
            lastname: contact?.name?.split(' ').slice(1).join(' ') || '',
            phone: contact?.phoneNumber,
            whatsapp_phone: contact?.phoneNumber,
            lifecyclestage: 'lead'
          }
        });

        if (hubspotContact?.id) {
          contact!.hubspotContactId = hubspotContact.id;
          await this.updateContact(contactId, { hubspotContactId: hubspotContact.id });
        }
      }

      // Crear actividad en HubSpot
      // Esto dependería de la implementación específica de tu HubSpot service

    } catch (error) {
      console.error('Error sincronizando mensaje con HubSpot:', error);
      throw error;
    }
  }

  // === PROCESAMIENTO DE WEBHOOKS DE N8N ===

  async processN8NWebhook(workflowId: string, executionId: string, data: any): Promise<ProcessingResult> {
    const startTime = Date.now();

    try {
      console.log(`Procesando webhook de N8N - Workflow: ${workflowId}, Execution: ${executionId}`);

      // Procesar datos según el tipo de workflow
      let result: ProcessingResult = {
        success: true,
        processingTime: 0
      };

             // Aquí puedes implementar lógica específica según el workflow
       if (data.instanceName && data.messageId) {
         // Es un resultado de procesamiento de mensaje
         await this.updateMessageProcessingStatus(data.messageId, {
           n8nProcessed: true
         });
         
         result.messageId = data.messageId;
         result.n8nProcessed = true;
       }

      result.processingTime = Date.now() - startTime;
      return result;

    } catch (error) {
      console.error('Error procesando webhook de N8N:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        processingTime: Date.now() - startTime
      };
    }
  }

  // === PROCESAMIENTO DE WEBHOOKS DE HUBSPOT ===

  async processHubSpotWebhook(subscriptionType: string, data: any): Promise<ProcessingResult> {
    const startTime = Date.now();

    try {
      console.log(`Procesando webhook de HubSpot - Tipo: ${subscriptionType}`);

      let result: ProcessingResult = {
        success: true,
        processingTime: 0
      };

      switch (subscriptionType) {
        case 'contact.propertyChange':
          result.contactId = await this.processHubSpotContactUpdate(data);
          break;

        case 'deal.propertyChange':
          await this.processHubSpotDealUpdate(data);
          break;

        default:
          console.log(`Tipo de webhook de HubSpot no manejado: ${subscriptionType}`);
      }

      result.processingTime = Date.now() - startTime;
      return result;

    } catch (error) {
      console.error('Error procesando webhook de HubSpot:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        processingTime: Date.now() - startTime
      };
    }
  }

  private async processHubSpotContactUpdate(data: any): Promise<string | undefined> {
    try {
      // Buscar contacto local por HubSpot ID
      const localContact = await this.findContactByHubSpotId(data.objectId);
      
      if (localContact) {
        // Actualizar contacto local con datos de HubSpot
        await this.updateContact(localContact.id, {
          name: `${data.properties?.firstname || ''} ${data.properties?.lastname || ''}`.trim(),
          email: data.properties?.email,
          customFields: {
            ...localContact.customFields,
            hubspotProperties: data.properties
          },
          updatedAt: new Date()
        });

        return localContact.id;
      }

      return undefined;

    } catch (error) {
      console.error('Error procesando actualización de contacto de HubSpot:', error);
      throw error;
    }
  }

  private async processHubSpotDealUpdate(data: any): Promise<void> {
    console.log('Procesando actualización de deal de HubSpot:', data);
    // Implementar lógica según necesidades
  }

  // === MÉTODOS DE BASE DE DATOS (SIMULADOS) ===
  // Estos métodos deberían conectarse a tu base de datos real

  private async findMessageById(messageId: string): Promise<Message | null> {
    // Implementar búsqueda en base de datos
    return null;
  }

  private async saveMessage(message: Partial<Message>): Promise<void> {
    console.log('Guardando mensaje:', message.id);
    // Implementar guardado en base de datos
  }

  private async updateMessageProcessingStatus(messageId: string, status: Partial<Message['processingStatus']>): Promise<void> {
    console.log(`Actualizando estado de procesamiento del mensaje ${messageId}:`, status);
    // Implementar actualización en base de datos
  }

  private async findOrCreateContact(phoneNumber: string, instanceName: string): Promise<string> {
    // Implementar búsqueda/creación de contacto
    return this.generateId();
  }

  private async findContactById(contactId: string): Promise<Contact | null> {
    // Implementar búsqueda en base de datos
    return null;
  }

  private async findContactByHubSpotId(hubspotId: string): Promise<Contact | null> {
    // Implementar búsqueda en base de datos
    return null;
  }

  private async saveContact(contact: Partial<Contact>): Promise<void> {
    console.log('Guardando contacto:', contact.id);
    // Implementar guardado en base de datos
  }

  private async updateContact(contactId: string, updates: Partial<Contact>): Promise<void> {
    console.log(`Actualizando contacto ${contactId}:`, updates);
    // Implementar actualización en base de datos
  }

  private async findOrCreateConversation(contactId: string, instanceName: string): Promise<string> {
    // Implementar búsqueda/creación de conversación
    return this.generateId();
  }

  private async saveWebhookLog(logData: any): Promise<void> {
    console.log('Guardando log de webhook:', logData);
    // Implementar guardado de log en base de datos
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

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // === MÉTODOS PÚBLICOS DE CONFIGURACIÓN ===

  updateConfig(newConfig: Partial<WebhookHandlerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getProcessingStats(): { totalProcessing: number; queueSize: number } {
    return {
      totalProcessing: this.processingQueue.size,
      queueSize: this.processingQueue.size
    };
  }

  async healthCheck(): Promise<{
    evolutionApi: boolean;
    n8n: boolean;
    hubspot: boolean;
  }> {
    return {
      evolutionApi: this.config.evolutionApi.enabled,
      n8n: this.config.n8n.enabled && (await this.config.n8n.service?.healthCheck() || false),
      hubspot: this.config.hubspot.enabled
    };
  }
}

export default WebhookHandlerService;