import HubSpotService, { HubSpotConfig, HubSpotContact, HubSpotDeal, HubSpotCompany } from './hubspot.service';

// Mock para Evolution API Service - se puede reemplazar con la implementación real
interface EvolutionAPIService {
  sendMessage?(phoneNumber: string, message: string): Promise<any>;
  getConversations?(): Promise<any[]>;
}

class MockEvolutionAPIService implements EvolutionAPIService {
  constructor(config: any) {}
  
  async sendMessage(phoneNumber: string, message: string): Promise<any> {
    console.log(`Mock: Enviando mensaje a ${phoneNumber}: ${message}`);
    return { success: true };
  }
  
  async getConversations(): Promise<any[]> {
    console.log('Mock: Obteniendo conversaciones');
    return [];
  }
}

interface SyncConfig {
  hubspot: HubSpotConfig;
  evolutionApi: {
    baseUrl: string;
    apiKey: string;
  };
  autoSync: {
    contacts: boolean;
    deals: boolean;
    conversations: boolean;
  };
  mapping: {
    contactFields: { [hubspotField: string]: string };
    dealFields: { [hubspotField: string]: string };
  };
}

interface WhatsAppMessage {
  id: string;
  conversationId: string;
  fromMe: boolean;
  body: string;
  timestamp: string;
  phoneNumber: string;
  contactName?: string;
  messageType: 'text' | 'image' | 'audio' | 'video' | 'document';
  metadata?: any;
}

interface SyncResult {
  success: boolean;
  type: 'contact' | 'deal' | 'conversation';
  action: 'created' | 'updated' | 'synced';
  hubspotId?: string;
  whatsappId?: string;
  message?: string;
  error?: string;
}

class HubSpotSyncService {
  private hubspotService: HubSpotService;
  private evolutionApiService: EvolutionAPIService;
  private config: SyncConfig;
  private syncQueue: Array<() => Promise<SyncResult>> = [];
  private isProcessing = false;

  constructor(config: SyncConfig) {
    this.config = config;
    this.hubspotService = new HubSpotService(config.hubspot);
    this.evolutionApiService = new MockEvolutionAPIService(config.evolutionApi);
  }

  // =================== INICIALIZACIÓN ===================

  async initialize(): Promise<boolean> {
    try {
      console.log('🔄 Inicializando sincronización HubSpot...');

      // 1. Crear custom channel integration
      await this.hubspotService.createCustomChannelIntegration();
      console.log('✅ Custom channel properties creadas');

      // 2. Configurar webhooks
      await this.hubspotService.setupWebhooks();
      console.log('✅ Webhooks configurados');

      // 3. Sincronizar contactos existentes
      if (this.config.autoSync.contacts) {
        await this.syncExistingContacts();
        console.log('✅ Contactos existentes sincronizados');
      }

      // 4. Iniciar procesamiento de cola
      this.startQueueProcessor();
      console.log('✅ Procesador de cola iniciado');

      return true;
    } catch (error) {
      console.error('❌ Error inicializando sincronización:', error);
      throw error;
    }
  }

  // =================== SINCRONIZACIÓN DE CONTACTOS ===================

  async syncContactFromWhatsApp(phoneNumber: string, contactData?: any): Promise<SyncResult> {
    try {
      // Limpiar número de teléfono
      const cleanPhone = this.cleanPhoneNumber(phoneNumber);

      // Buscar contacto existente en HubSpot
      let hubspotContact = await this.hubspotService.getContactByPhone(cleanPhone);

      const contactProperties = {
        whatsapp_number: cleanPhone,
        whatsapp_status: 'active',
        whatsapp_last_message_date: new Date().toISOString(),
        ...this.mapContactData(contactData)
      };

      if (hubspotContact) {
        // Actualizar contacto existente
        const updatedContact = await this.hubspotService.updateContact(
          hubspotContact.id!,
          { properties: contactProperties }
        );

        return {
          success: true,
          type: 'contact',
          action: 'updated',
          hubspotId: updatedContact.id,
          whatsappId: cleanPhone,
          message: `Contacto actualizado: ${cleanPhone}`
        };
      } else {
        // Crear nuevo contacto
        const newContact = await this.hubspotService.createContact({
          properties: contactProperties
        });

        return {
          success: true,
          type: 'contact',
          action: 'created',
          hubspotId: newContact.id,
          whatsappId: cleanPhone,
          message: `Contacto creado: ${cleanPhone}`
        };
      }
    } catch (error) {
      console.error('Error sincronizando contacto desde WhatsApp:', error);
      return {
        success: false,
        type: 'contact',
        action: 'created',
        whatsappId: phoneNumber,
        error: error.message
      };
    }
  }

  async syncContactToWhatsApp(hubspotContactId: string): Promise<SyncResult> {
    try {
      // Obtener contacto de HubSpot
      const contact = await this.hubspotService.getContacts(['whatsapp_number', 'firstname', 'lastname', 'email'], 1);
      
      if (!contact.length || !contact[0].properties.whatsapp_number) {
        throw new Error('Contacto no tiene número de WhatsApp');
      }

      // Sincronizar con Evolution API si es necesario
      // Aquí puedes agregar lógica adicional para sincronizar datos del contacto

      return {
        success: true,
        type: 'contact',
        action: 'synced',
        hubspotId: hubspotContactId,
        whatsappId: contact[0].properties.whatsapp_number,
        message: 'Contacto sincronizado con WhatsApp'
      };
    } catch (error) {
      console.error('Error sincronizando contacto a WhatsApp:', error);
      return {
        success: false,
        type: 'contact',
        action: 'synced',
        hubspotId: hubspotContactId,
        error: error.message
      };
    }
  }

  // =================== SINCRONIZACIÓN DE CONVERSACIONES ===================

  async syncConversationToHubSpot(conversationId: string, messages: WhatsAppMessage[]): Promise<SyncResult> {
    try {
      if (!messages.length) {
        throw new Error('No hay mensajes para sincronizar');
      }

      const firstMessage = messages[0];
      const phoneNumber = this.cleanPhoneNumber(firstMessage.phoneNumber);

      // Obtener o crear contacto
      const contactResult = await this.syncContactFromWhatsApp(phoneNumber, {
        name: firstMessage.contactName
      });

      if (!contactResult.success || !contactResult.hubspotId) {
        throw new Error('No se pudo sincronizar el contacto');
      }

      // Sincronizar conversación
      await this.hubspotService.syncWhatsAppConversation(
        conversationId,
        contactResult.hubspotId,
        messages
      );

      // Crear deal si está configurado
      if (this.config.autoSync.deals) {
        await this.createDealFromConversation(contactResult.hubspotId, conversationId, messages);
      }

      return {
        success: true,
        type: 'conversation',
        action: 'synced',
        hubspotId: contactResult.hubspotId,
        whatsappId: conversationId,
        message: `Conversación sincronizada: ${messages.length} mensajes`
      };
    } catch (error) {
      console.error('Error sincronizando conversación:', error);
      return {
        success: false,
        type: 'conversation',
        action: 'synced',
        whatsappId: conversationId,
        error: error.message
      };
    }
  }

  // =================== SINCRONIZACIÓN DE NEGOCIOS ===================

  async createDealFromConversation(contactId: string, conversationId: string, messages: WhatsAppMessage[]): Promise<SyncResult> {
    try {
      // Verificar si ya existe un deal para esta conversación
      const existingDeals = await this.hubspotService.getDeals(['dealname', 'whatsapp_conversation_id']);
      const existingDeal = existingDeals.find(deal => 
        deal.properties.whatsapp_conversation_id === conversationId
      );

      if (existingDeal) {
        return {
          success: true,
          type: 'deal',
          action: 'updated',
          hubspotId: existingDeal.id,
          whatsappId: conversationId,
          message: 'Deal ya existe para esta conversación'
        };
      }

      // Crear nuevo deal
      const dealData: HubSpotDeal = {
        properties: {
          dealname: `Conversación WhatsApp - ${new Date().toLocaleDateString()}`,
          pipeline: 'default',
          dealstage: 'appointment_scheduled',
          whatsapp_conversation_id: conversationId,
          dealowner: '', // Se puede configurar
          createdate: new Date().toISOString()
        },
        associations: {
          contactIds: [contactId]
        }
      };

      const newDeal = await this.hubspotService.createDeal(dealData);

      return {
        success: true,
        type: 'deal',
        action: 'created',
        hubspotId: newDeal.id,
        whatsappId: conversationId,
        message: 'Deal creado desde conversación WhatsApp'
      };
    } catch (error) {
      console.error('Error creando deal desde conversación:', error);
      return {
        success: false,
        type: 'deal',
        action: 'created',
        whatsappId: conversationId,
        error: error.message
      };
    }
  }

  // =================== WEBHOOKS Y EVENTOS ===================

  async handleHubSpotWebhook(eventType: string, data: any): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    try {
      switch (eventType) {
        case 'contact.creation':
        case 'contact.propertyChange':
          if (data.properties?.whatsapp_number) {
            const result = await this.syncContactToWhatsApp(data.objectId);
            results.push(result);
          }
          break;

        case 'deal.creation':
        case 'deal.propertyChange':
          // Manejar cambios en deals
          break;

        default:
          console.log(`Evento no manejado: ${eventType}`);
      }
    } catch (error) {
      console.error('Error manejando webhook de HubSpot:', error);
      results.push({
        success: false,
        type: 'contact',
        action: 'synced',
        error: error.message
      });
    }

    return results;
  }

  async handleWhatsAppWebhook(eventType: string, data: any): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    try {
      switch (eventType) {
        case 'message.received':
        case 'message.sent':
          const message: WhatsAppMessage = this.transformWhatsAppMessage(data);
          
          // Agregar a cola de sincronización
          this.addToQueue(async () => {
            return await this.syncConversationToHubSpot(message.conversationId, [message]);
          });
          break;

        case 'conversation.resolved':
          // Actualizar deal en HubSpot
          break;

        default:
          console.log(`Evento WhatsApp no manejado: ${eventType}`);
      }
    } catch (error) {
      console.error('Error manejando webhook de WhatsApp:', error);
      results.push({
        success: false,
        type: 'conversation',
        action: 'synced',
        error: error.message
      });
    }

    return results;
  }

  // =================== UTILIDADES PRIVADAS ===================

  private cleanPhoneNumber(phone: string): string {
    // Remover espacios, guiones y otros caracteres
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // Agregar código de país si no existe
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  }

  private mapContactData(data: any): { [key: string]: string } {
    if (!data) return {};

    const mapped: { [key: string]: string } = {};

    // Mapear campos según configuración
    for (const [hubspotField, sourceField] of Object.entries(this.config.mapping.contactFields)) {
      if (data[sourceField]) {
        mapped[hubspotField] = data[sourceField];
      }
    }

    return mapped;
  }

  private transformWhatsAppMessage(data: any): WhatsAppMessage {
    return {
      id: data.id || data.messageId,
      conversationId: data.conversationId || data.chatId,
      fromMe: data.fromMe || false,
      body: data.body || data.message || '',
      timestamp: data.timestamp || new Date().toISOString(),
      phoneNumber: data.phoneNumber || data.from,
      contactName: data.contactName || data.pushName,
      messageType: data.type || 'text',
      metadata: data.metadata || {}
    };
  }

  private async syncExistingContacts(): Promise<void> {
    try {
      // Obtener contactos con números de WhatsApp
      const hubspotContacts = await this.hubspotService.getContacts([
        'whatsapp_number', 'firstname', 'lastname', 'email', 'phone'
      ], 1000);

      const contactsWithWhatsApp = hubspotContacts.filter(contact => 
        contact.properties.whatsapp_number
      );

      console.log(`📱 Sincronizando ${contactsWithWhatsApp.length} contactos existentes...`);

      for (const contact of contactsWithWhatsApp) {
        this.addToQueue(async () => {
          return await this.syncContactToWhatsApp(contact.id!);
        });
      }
    } catch (error) {
      console.error('Error sincronizando contactos existentes:', error);
    }
  }

  // =================== GESTIÓN DE COLA ===================

  private addToQueue(task: () => Promise<SyncResult>): void {
    this.syncQueue.push(task);
  }

  private async startQueueProcessor(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;

    const processQueue = async () => {
      while (this.syncQueue.length > 0) {
        const task = this.syncQueue.shift();
        if (task) {
          try {
            const result = await task();
            console.log('✅ Sincronización completada:', result);
          } catch (error) {
            console.error('❌ Error en sincronización:', error);
          }
        }
      }

      // Esperar 5 segundos antes de verificar nuevamente
      setTimeout(processQueue, 5000);
    };

    processQueue();
  }

  // =================== MÉTODOS PÚBLICOS DE GESTIÓN ===================

  async getStatus(): Promise<{
    isRunning: boolean;
    queueLength: number;
    lastSync: string;
    errors: any[];
  }> {
    return {
      isRunning: this.isProcessing,
      queueLength: this.syncQueue.length,
      lastSync: new Date().toISOString(),
      errors: []
    };
  }

  async forceSync(type: 'contact' | 'deal' | 'conversation'): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    try {
      switch (type) {
        case 'contact':
          await this.syncExistingContacts();
          break;
        case 'conversation':
          // Implementar sincronización forzada de conversaciones
          break;
        case 'deal':
          // Implementar sincronización forzada de deals
          break;
      }
    } catch (error) {
      results.push({
        success: false,
        type,
        action: 'synced',
        error: error.message
      });
    }

    return results;
  }

  stop(): void {
    this.isProcessing = false;
    this.syncQueue.length = 0;
  }
}

export default HubSpotSyncService;
export type { SyncConfig, WhatsAppMessage, SyncResult };