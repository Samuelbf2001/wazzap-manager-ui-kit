import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  EvolutionAPIInstance,
  EvolutionAPIMessage,
  EvolutionAPIContact,
  EvolutionAPIResponse,
  SendMessageRequest,
  CreateInstanceRequest,
  InstanceConnectionStatus,
  EvolutionAPIConfig,
  WebhookConfig,
  GroupInfo,
  EvolutionAPIError
} from '../types/evolution-api';

class EvolutionAPIService {
  private api: AxiosInstance;
  private config: EvolutionAPIConfig;

  constructor(config: EvolutionAPIConfig) {
    this.config = config;
    this.api = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.apiKey
      }
    });

    // Interceptor para logging y manejo de errores
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          console.error('Error de autenticación con Evolution API');
        }
        
        if (this.config.retries && this.config.retries > 0) {
          return this.handleRetry(error);
        }
        
        return Promise.reject(this.formatError(error));
      }
    );
  }

  private async handleRetry(error: any): Promise<any> {
    const config = error.config;
    if (!config.retryCount) {
      config.retryCount = 0;
    }

    if (config.retryCount < this.config.retries) {
      config.retryCount++;
      
      // Espera exponencial
      const delay = Math.pow(2, config.retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return this.api.request(config);
    }

    return Promise.reject(this.formatError(error));
  }

  private formatError(error: any): EvolutionAPIError {
    return {
      error: error.response?.data?.error || 'Unknown error',
      message: error.response?.data?.message || error.message,
      statusCode: error.response?.status || 500,
      instanceName: error.config?.instanceName
    };
  }

  // === GESTIÓN DE INSTANCIAS ===

  async createInstance(data: CreateInstanceRequest): Promise<EvolutionAPIResponse<EvolutionAPIInstance>> {
    try {
      const response: AxiosResponse = await this.api.post('/instance/create', {
        instanceName: data.instanceName,
        token: this.config.apiKey,
        qrcode: data.qrcode || true,
        markMessagesRead: data.markMessagesRead || false,
        delayMessage: data.delayMessage || 1000,
        alwaysOnline: data.alwaysOnline || false,
        readReceipts: data.readReceipts || true,
        readStatus: data.readStatus || true,
        syncFullHistory: data.syncFullHistory || false,
        webhook: data.webhookUrl || this.config.webhookUrl,
        webhookByEvents: true,
        webhookBase64: false,
        events: data.events || this.config.defaultEvents
      });

      return {
        success: true,
        data: this.mapInstanceResponse(response.data),
        message: 'Instancia creada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error)
      };
    }
  }

  async connectInstance(instanceName: string): Promise<EvolutionAPIResponse<InstanceConnectionStatus>> {
    try {
      const response: AxiosResponse = await this.api.get(`/instance/connect/${instanceName}`);
      
      return {
        success: true,
        data: {
          instanceName,
          status: response.data.instance?.state || 'connecting',
          qrCode: response.data.qrcode?.code,
          connectionState: response.data.instance
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error)
      };
    }
  }

  async disconnectInstance(instanceName: string): Promise<EvolutionAPIResponse<boolean>> {
    try {
      await this.api.delete(`/instance/logout/${instanceName}`);
      
      return {
        success: true,
        data: true,
        message: 'Instancia desconectada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error)
      };
    }
  }

  async deleteInstance(instanceName: string): Promise<EvolutionAPIResponse<boolean>> {
    try {
      await this.api.delete(`/instance/delete/${instanceName}`);
      
      return {
        success: true,
        data: true,
        message: 'Instancia eliminada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error)
      };
    }
  }

  async getInstanceStatus(instanceName: string): Promise<EvolutionAPIResponse<InstanceConnectionStatus>> {
    try {
      const response: AxiosResponse = await this.api.get(`/instance/connectionState/${instanceName}`);
      
      return {
        success: true,
        data: {
          instanceName,
          status: this.mapConnectionState(response.data.state),
          connectionState: response.data
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error)
      };
    }
  }

  async getAllInstances(): Promise<EvolutionAPIResponse<EvolutionAPIInstance[]>> {
    try {
      const response: AxiosResponse = await this.api.get('/instance/fetchInstances');
      
      return {
        success: true,
        data: response.data.map((instance: any) => this.mapInstanceResponse(instance))
      };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error)
      };
    }
  }

  // === GESTIÓN DE MENSAJES ===

  async sendMessage(data: SendMessageRequest): Promise<EvolutionAPIResponse<EvolutionAPIMessage>> {
    try {
      let endpoint = '';
      let payload: any = {
        number: data.to,
        options: {
          delay: data.options?.delay || 1000,
          presence: data.options?.typing ? 'composing' : undefined,
          quoted: data.options?.quotedMessageId ? {
            key: {
              id: data.options.quotedMessageId
            }
          } : undefined
        }
      };

      switch (data.type) {
        case 'text':
          endpoint = `/message/sendText/${data.instanceName}`;
          payload.textMessage = {
            text: data.content
          };
          break;

        case 'image':
          endpoint = `/message/sendMedia/${data.instanceName}`;
          payload.mediaMessage = {
            mediatype: 'image',
            media: data.mediaUrl,
            caption: data.caption || data.content
          };
          break;

        case 'video':
          endpoint = `/message/sendMedia/${data.instanceName}`;
          payload.mediaMessage = {
            mediatype: 'video',
            media: data.mediaUrl,
            caption: data.caption || data.content
          };
          break;

        case 'audio':
          endpoint = `/message/sendWhatsAppAudio/${data.instanceName}`;
          payload.audioMessage = {
            audio: data.mediaUrl
          };
          break;

        case 'document':
          endpoint = `/message/sendMedia/${data.instanceName}`;
          payload.mediaMessage = {
            mediatype: 'document',
            media: data.mediaUrl,
            fileName: data.fileName,
            caption: data.caption
          };
          break;

        default:
          throw new Error(`Tipo de mensaje no soportado: ${data.type}`);
      }

      const response: AxiosResponse = await this.api.post(endpoint, payload);
      
      return {
        success: true,
        data: this.mapMessageResponse(response.data, data.instanceName),
        message: 'Mensaje enviado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error)
      };
    }
  }

  async getMessages(instanceName: string, chatId: string, limit: number = 50): Promise<EvolutionAPIResponse<EvolutionAPIMessage[]>> {
    try {
      const response: AxiosResponse = await this.api.get(`/chat/findMessages/${instanceName}`, {
        params: {
          id: chatId,
          limit
        }
      });
      
      return {
        success: true,
        data: response.data.map((msg: any) => this.mapMessageResponse(msg, instanceName))
      };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error)
      };
    }
  }

  // === GESTIÓN DE CONTACTOS ===

  async getContacts(instanceName: string): Promise<EvolutionAPIResponse<EvolutionAPIContact[]>> {
    try {
      const response: AxiosResponse = await this.api.get(`/chat/findContacts/${instanceName}`);
      
      return {
        success: true,
        data: response.data.map((contact: any) => this.mapContactResponse(contact, instanceName))
      };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error)
      };
    }
  }

  async getProfilePicture(instanceName: string, phoneNumber: string): Promise<EvolutionAPIResponse<string>> {
    try {
      const response: AxiosResponse = await this.api.get(`/chat/whatsappProfile/${instanceName}`, {
        params: {
          number: phoneNumber
        }
      });
      
      return {
        success: true,
        data: response.data.picture
      };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error)
      };
    }
  }

  // === GESTIÓN DE GRUPOS ===

  async getGroupInfo(instanceName: string, groupId: string): Promise<EvolutionAPIResponse<GroupInfo>> {
    try {
      const response: AxiosResponse = await this.api.get(`/group/findGroupInfos/${instanceName}`, {
        params: {
          groupJid: groupId
        }
      });
      
      return {
        success: true,
        data: this.mapGroupResponse(response.data[0])
      };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error)
      };
    }
  }

  // === GESTIÓN DE WEBHOOKS ===

  async setWebhook(instanceName: string, config: WebhookConfig): Promise<EvolutionAPIResponse<boolean>> {
    try {
      await this.api.post(`/webhook/set/${instanceName}`, {
        url: config.url,
        enabled: config.enabled,
        events: config.events,
        webhookByEvents: true,
        webhookBase64: false
      });
      
      return {
        success: true,
        data: true,
        message: 'Webhook configurado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error)
      };
    }
  }

  async getWebhook(instanceName: string): Promise<EvolutionAPIResponse<WebhookConfig>> {
    try {
      const response: AxiosResponse = await this.api.get(`/webhook/find/${instanceName}`);
      
      return {
        success: true,
        data: {
          url: response.data.url,
          events: response.data.events,
          enabled: response.data.enabled
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error)
      };
    }
  }

  // === MÉTODOS AUXILIARES ===

  private mapInstanceResponse(data: any): EvolutionAPIInstance {
    return {
      instanceName: data.instanceName || data.instance?.instanceName,
      status: this.mapConnectionState(data.connectionState || data.instance?.state),
      qrCode: data.qrcode?.code,
      profilePictureUrl: data.profilePictureUrl,
      profileName: data.profileName,
      phoneNumber: data.phoneNumber,
      webhookUrl: data.webhook?.url,
      events: data.webhook?.events || [],
      createdAt: new Date(data.createdAt || Date.now()),
      updatedAt: new Date(data.updatedAt || Date.now())
    };
  }

  private mapMessageResponse(data: any, instanceName: string): EvolutionAPIMessage {
    return {
      messageId: data.key?.id || data.messageId,
      conversationId: data.key?.remoteJid || data.chatId,
      instanceName,
      from: data.key?.fromMe ? instanceName : data.key?.remoteJid || data.from,
      to: data.key?.fromMe ? data.key?.remoteJid || data.to : instanceName,
      type: this.getMessageType(data),
      content: this.extractMessageContent(data),
      mediaUrl: this.extractMediaUrl(data),
      mediaType: this.extractMediaType(data),
      fileName: this.extractFileName(data),
      caption: this.extractCaption(data),
      timestamp: new Date(data.messageTimestamp * 1000 || data.timestamp || Date.now()),
      status: this.mapMessageStatus(data.status),
      isFromMe: data.key?.fromMe || false,
      senderName: data.pushName || data.senderName,
      quotedMessage: data.message?.extendedTextMessage?.contextInfo?.quotedMessage ? {
        messageId: data.message.extendedTextMessage.contextInfo.stanzaId,
        content: this.extractQuotedContent(data.message.extendedTextMessage.contextInfo.quotedMessage),
        from: data.message.extendedTextMessage.contextInfo.participant
      } : undefined,
      metadata: {
        messageTimestamp: data.messageTimestamp,
        status: data.status,
        participant: data.key?.participant
      }
    };
  }

  private mapContactResponse(data: any, instanceName: string): EvolutionAPIContact {
    return {
      id: data.id,
      name: data.name || data.pushName || data.verifiedName,
      phoneNumber: data.id.replace('@s.whatsapp.net', ''),
      profilePictureUrl: data.profilePictureUrl,
      isGroup: data.id.includes('@g.us'),
      lastSeen: data.lastSeen ? new Date(data.lastSeen * 1000) : undefined,
      isOnline: data.isOnline,
      instanceName
    };
  }

  private mapGroupResponse(data: any): GroupInfo {
    return {
      id: data.id,
      subject: data.subject,
      description: data.desc,
      owner: data.owner,
      creation: new Date(data.creation * 1000),
      participants: data.participants?.map((p: any) => ({
        id: p.id,
        admin: p.admin,
        name: p.name,
        phoneNumber: p.id.replace('@s.whatsapp.net', '')
      })) || [],
      announce: data.announce,
      restrict: data.restrict,
      inviteCode: data.inviteCode
    };
  }

  private mapConnectionState(state: string): 'connected' | 'disconnected' | 'connecting' | 'error' {
    switch (state) {
      case 'open':
        return 'connected';
      case 'close':
        return 'disconnected';
      case 'connecting':
        return 'connecting';
      default:
        return 'error';
    }
  }

  private mapMessageStatus(status: any): 'pending' | 'sent' | 'delivered' | 'read' | 'failed' {
    if (!status) return 'pending';
    
    switch (status) {
      case 1:
        return 'sent';
      case 2:
        return 'delivered';
      case 3:
        return 'read';
      default:
        return 'pending';
    }
  }

  private getMessageType(data: any): 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'list' | 'button' {
    const message = data.message || data;
    
    if (message.conversation || message.extendedTextMessage) return 'text';
    if (message.imageMessage) return 'image';
    if (message.videoMessage) return 'video';
    if (message.audioMessage) return 'audio';
    if (message.documentMessage) return 'document';
    if (message.locationMessage) return 'location';
    if (message.contactMessage) return 'contact';
    
    return 'text';
  }

  private extractMessageContent(data: any): string {
    const message = data.message || data;
    
    return message.conversation ||
           message.extendedTextMessage?.text ||
           message.imageMessage?.caption ||
           message.videoMessage?.caption ||
           message.documentMessage?.caption ||
           message.locationMessage?.name ||
           message.contactMessage?.displayName ||
           '';
  }

  private extractMediaUrl(data: any): string | undefined {
    const message = data.message || data;
    
    return message.imageMessage?.url ||
           message.videoMessage?.url ||
           message.audioMessage?.url ||
           message.documentMessage?.url;
  }

  private extractMediaType(data: any): string | undefined {
    const message = data.message || data;
    
    return message.imageMessage?.mimetype ||
           message.videoMessage?.mimetype ||
           message.audioMessage?.mimetype ||
           message.documentMessage?.mimetype;
  }

  private extractFileName(data: any): string | undefined {
    const message = data.message || data;
    
    return message.documentMessage?.fileName;
  }

  private extractCaption(data: any): string | undefined {
    const message = data.message || data;
    
    return message.imageMessage?.caption ||
           message.videoMessage?.caption ||
           message.documentMessage?.caption;
  }

  private extractQuotedContent(quotedMessage: any): string {
    return quotedMessage.conversation ||
           quotedMessage.extendedTextMessage?.text ||
           quotedMessage.imageMessage?.caption ||
           '';
  }
}

export default EvolutionAPIService;