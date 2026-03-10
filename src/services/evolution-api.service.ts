import { EVOLUTION_API_CONFIG, EVOLUTION_API_ENDPOINTS } from '../config/evolution-api';
import type {
  EvolutionAPIResponse,
  EvolutionAPIError,
  APIInfo,
  Instance,
  CreateInstanceRequest,
  CreateInstanceResponse,
  FetchInstancesResponse,
  ConnectionStateResponse,
  PresenceRequest,
  WebhookConfig,
  SettingsConfig,
  SendTextMessageRequest,
  SendMediaMessageRequest,
  SendLocationMessageRequest,
  SendContactMessageRequest,
  SendReactionMessageRequest,
  SendPollMessageRequest,
  SendListMessageRequest,
  SendStickerMessageRequest,
  SendStatusMessageRequest,
  SendMessageResponse,
  WhatsAppNumberCheck,
  MarkAsReadRequest,
  ArchiveChatRequest,
  DeleteMessageRequest,
  SendPresenceRequest,
  Contact,
  Message,
  Chat,
  FindContactsResponse,
  FindMessagesResponse,
  FindChatsResponse,
  Profile,
  BusinessProfile,
  ProfileResponse,
  BusinessProfileResponse,
  UpdateProfileNameRequest,
  UpdateProfileStatusRequest,
  UpdateProfilePictureRequest,
  PrivacySettings,
  PrivacySettingsResponse,
  CreateGroupRequest,
  Group,
  GroupResponse,
  GroupsResponse,
  UpdateGroupSubjectRequest,
  UpdateGroupDescriptionRequest,
  UpdateGroupPictureRequest,
  UpdateGroupMembersRequest,
  UpdateGroupSettingRequest,
  GroupInvite,
  GroupInviteResponse,
  TypebotConfig,
  TypebotStart,
  ChatwootConfig,
  SQSConfig,
  RabbitMQConfig,
  WebSocketConfig,
  WebhookEvent
} from '../types/evolution-api';

class EvolutionAPIService {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;
  private retryAttempts: number;

  constructor() {
    this.baseUrl = EVOLUTION_API_CONFIG.baseUrl;
    this.apiKey = EVOLUTION_API_CONFIG.apiKey;
    this.timeout = EVOLUTION_API_CONFIG.timeout;
    this.retryAttempts = EVOLUTION_API_CONFIG.retryAttempts;
  }

  // Método privado para hacer peticiones HTTP con reintentos
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt = 1
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'apikey': this.apiKey,
    };

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        const errorData: EvolutionAPIError = await response.json().catch(() => ({
          status: response.status,
          message: response.statusText,
          error: 'Error desconocido'
        }));
        throw new Error(`Error ${errorData.status}: ${errorData.message}`);
      }

      const data: T = await response.json();
      return data;
    } catch (error) {
      if (attempt < this.retryAttempts && error instanceof Error && !error.name.includes('AbortError')) {
        console.warn(`Intento ${attempt} falló, reintentando...`, error.message);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return this.makeRequest<T>(endpoint, options, attempt + 1);
      }
      throw error;
    }
  }

  // Método para reemplazar parámetros en las URLs
  private replaceUrlParams(endpoint: string, params: Record<string, string>): string {
    let url = endpoint;
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    });
    return url;
  }

  // === INFORMACIÓN GENERAL ===
  async getAPIInfo(): Promise<APIInfo> {
    return this.makeRequest<APIInfo>(EVOLUTION_API_ENDPOINTS.info);
  }

  // === GESTIÓN DE INSTANCIAS ===
  async createInstance(data: CreateInstanceRequest): Promise<CreateInstanceResponse> {
    return this.makeRequest<CreateInstanceResponse>(
      EVOLUTION_API_ENDPOINTS.instance.create,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async fetchInstances(): Promise<FetchInstancesResponse> {
    return this.makeRequest<FetchInstancesResponse>(EVOLUTION_API_ENDPOINTS.instance.fetch);
  }

  async connectInstance(instanceName: string): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.instance.connect, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint);
  }

  async restartInstance(instanceName: string): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.instance.restart, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, { method: 'PUT' });
  }

  async getConnectionState(instanceName: string): Promise<ConnectionStateResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.instance.connectionState, {
      instance: instanceName
    });
    return this.makeRequest<ConnectionStateResponse>(endpoint);
  }

  async logoutInstance(instanceName: string): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.instance.logout, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, { method: 'DELETE' });
  }

  async deleteInstance(instanceName: string): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.instance.delete, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, { method: 'DELETE' });
  }

  async setPresence(instanceName: string, data: PresenceRequest): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.instance.setPresence, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // === WEBHOOKS ===
  async setWebhook(instanceName: string, config: WebhookConfig): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.webhook.set, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async findWebhook(instanceName: string): Promise<EvolutionAPIResponse<WebhookConfig>> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.webhook.find, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse<WebhookConfig>>(endpoint);
  }

  // === CONFIGURACIONES ===
  async setSettings(instanceName: string, config: SettingsConfig): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.settings.set, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async findSettings(instanceName: string): Promise<EvolutionAPIResponse<SettingsConfig>> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.settings.find, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse<SettingsConfig>>(endpoint);
  }

  // === ENVÍO DE MENSAJES ===
  async sendTextMessage(instanceName: string, data: SendTextMessageRequest): Promise<SendMessageResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.message.sendText, {
      instance: instanceName
    });
    return this.makeRequest<SendMessageResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendMediaMessage(instanceName: string, data: SendMediaMessageRequest): Promise<SendMessageResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.message.sendMedia, {
      instance: instanceName
    });
    return this.makeRequest<SendMessageResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendLocationMessage(instanceName: string, data: SendLocationMessageRequest): Promise<SendMessageResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.message.sendLocation, {
      instance: instanceName
    });
    return this.makeRequest<SendMessageResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendContactMessage(instanceName: string, data: SendContactMessageRequest): Promise<SendMessageResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.message.sendContact, {
      instance: instanceName
    });
    return this.makeRequest<SendMessageResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendReactionMessage(instanceName: string, data: SendReactionMessageRequest): Promise<SendMessageResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.message.sendReaction, {
      instance: instanceName
    });
    return this.makeRequest<SendMessageResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendPollMessage(instanceName: string, data: SendPollMessageRequest): Promise<SendMessageResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.message.sendPoll, {
      instance: instanceName
    });
    return this.makeRequest<SendMessageResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendListMessage(instanceName: string, data: SendListMessageRequest): Promise<SendMessageResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.message.sendList, {
      instance: instanceName
    });
    return this.makeRequest<SendMessageResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendStickerMessage(instanceName: string, data: SendStickerMessageRequest): Promise<SendMessageResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.message.sendSticker, {
      instance: instanceName
    });
    return this.makeRequest<SendMessageResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendStatusMessage(instanceName: string, data: SendStatusMessageRequest): Promise<SendMessageResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.message.sendStatus, {
      instance: instanceName
    });
    return this.makeRequest<SendMessageResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // === CONTROL DE CHAT ===
  async checkWhatsAppNumbers(instanceName: string, numbers: string[]): Promise<EvolutionAPIResponse<WhatsAppNumberCheck[]>> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.chat.checkWhatsApp, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse<WhatsAppNumberCheck[]>>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ numbers }),
    });
  }

  async markMessageAsRead(instanceName: string, data: MarkAsReadRequest): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.chat.markAsRead, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async archiveChat(instanceName: string, data: ArchiveChatRequest): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.chat.archiveChat, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMessage(instanceName: string, data: DeleteMessageRequest): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.chat.deleteMessage, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }

  async sendPresence(instanceName: string, data: SendPresenceRequest): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.chat.sendPresence, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async fetchProfilePicture(instanceName: string, number: string): Promise<EvolutionAPIResponse<{profilePictureUrl: string}>> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.chat.fetchProfilePicture, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse<{profilePictureUrl: string}>>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ number }),
    });
  }

  async findContacts(instanceName: string, filters?: { where?: any }): Promise<FindContactsResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.chat.findContacts, {
      instance: instanceName
    });
    return this.makeRequest<FindContactsResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(filters || {}),
    });
  }

  async findMessages(instanceName: string, filters?: { where?: any; limit?: number }): Promise<FindMessagesResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.chat.findMessages, {
      instance: instanceName
    });
    return this.makeRequest<FindMessagesResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(filters || {}),
    });
  }

  async findChats(instanceName: string): Promise<FindChatsResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.chat.findChats, {
      instance: instanceName
    });
    return this.makeRequest<FindChatsResponse>(endpoint);
  }

  // === PERFIL ===
  async fetchBusinessProfile(instanceName: string): Promise<BusinessProfileResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.profile.fetchBusiness, {
      instance: instanceName
    });
    return this.makeRequest<BusinessProfileResponse>(endpoint, { method: 'POST' });
  }

  async fetchProfile(instanceName: string, number?: string): Promise<ProfileResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.profile.fetch, {
      instance: instanceName
    });
    return this.makeRequest<ProfileResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(number ? { number } : {}),
    });
  }

  async updateProfileName(instanceName: string, data: UpdateProfileNameRequest): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.profile.updateName, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProfileStatus(instanceName: string, data: UpdateProfileStatusRequest): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.profile.updateStatus, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProfilePicture(instanceName: string, data: UpdateProfilePictureRequest): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.profile.updatePicture, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async removeProfilePicture(instanceName: string): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.profile.removePicture, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, { method: 'PUT' });
  }

  async fetchPrivacySettings(instanceName: string): Promise<PrivacySettingsResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.profile.fetchPrivacy, {
      instance: instanceName
    });
    return this.makeRequest<PrivacySettingsResponse>(endpoint);
  }

  async updatePrivacySettings(instanceName: string, settings: Partial<PrivacySettings>): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.profile.updatePrivacy, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // === GRUPOS ===
  async createGroup(instanceName: string, data: CreateGroupRequest): Promise<GroupResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.group.create, {
      instance: instanceName
    });
    return this.makeRequest<GroupResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGroupPicture(instanceName: string, groupJid: string, data: UpdateGroupPictureRequest): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.group.updatePicture, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ groupJid, ...data }),
    });
  }

  async updateGroupSubject(instanceName: string, groupJid: string, data: UpdateGroupSubjectRequest): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.group.updateSubject, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ groupJid, ...data }),
    });
  }

  async updateGroupDescription(instanceName: string, groupJid: string, data: UpdateGroupDescriptionRequest): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.group.updateDescription, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ groupJid, ...data }),
    });
  }

  async fetchGroupInviteCode(instanceName: string, groupJid: string): Promise<GroupInviteResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.group.fetchInviteCode, {
      instance: instanceName
    });
    return this.makeRequest<GroupInviteResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ groupJid }),
    });
  }

  async acceptGroupInvite(instanceName: string, inviteCode: string): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.group.acceptInviteCode, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    });
  }

  async fetchAllGroups(instanceName: string, getParticipants: boolean = false): Promise<GroupsResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.group.fetchAll, {
      instance: instanceName
    });
    return this.makeRequest<GroupsResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ getParticipants }),
    });
  }

  async updateGroupMembers(instanceName: string, groupJid: string, data: UpdateGroupMembersRequest): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.group.updateMembers, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ groupJid, ...data }),
    });
  }

  async leaveGroup(instanceName: string, groupJid: string): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.group.leave, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, {
      method: 'DELETE',
      body: JSON.stringify({ groupJid }),
    });
  }

  // === INTEGRACIONES ===
  async setTypebot(instanceName: string, config: TypebotConfig): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.typebot.set, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async startTypebot(instanceName: string, data: TypebotStart): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.typebot.start, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async setChatwoot(instanceName: string, config: ChatwootConfig): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.chatwoot.set, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async setSQS(instanceName: string, config: SQSConfig): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.sqs.set, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async setRabbitMQ(instanceName: string, config: RabbitMQConfig): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.rabbitmq.set, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async setWebSocket(instanceName: string, config: WebSocketConfig): Promise<EvolutionAPIResponse> {
    const endpoint = this.replaceUrlParams(EVOLUTION_API_ENDPOINTS.websocket.set, {
      instance: instanceName
    });
    return this.makeRequest<EvolutionAPIResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }
}

// Instancia singleton del servicio
export const evolutionAPIService = new EvolutionAPIService();
export default evolutionAPIService;