// Tipos para Evolution API

export interface EvolutionAPIInstance {
  instanceName: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  qrCode?: string;
  profilePictureUrl?: string;
  profileName?: string;
  phoneNumber?: string;
  webhookUrl?: string;
  events?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EvolutionAPIMessage {
  messageId: string;
  conversationId: string;
  instanceName: string;
  from: string;
  to: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'list' | 'button';
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  fileName?: string;
  caption?: string;
  timestamp: Date;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  isFromMe: boolean;
  senderName?: string;
  quotedMessage?: {
    messageId: string;
    content: string;
    from: string;
  };
  metadata?: Record<string, any>;
}

export interface EvolutionAPIContact {
  id: string;
  name: string;
  phoneNumber: string;
  profilePictureUrl?: string;
  isGroup: boolean;
  lastSeen?: Date;
  isOnline?: boolean;
  instanceName: string;
}

export interface EvolutionAPIWebhookEvent {
  instanceName: string;
  event: string;
  data: {
    message?: EvolutionAPIMessage;
    contact?: EvolutionAPIContact;
    instance?: EvolutionAPIInstance;
    status?: {
      status: string;
      qrCode?: string;
    };
  };
  timestamp: Date;
}

export interface SendMessageRequest {
  instanceName: string;
  to: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'list' | 'button';
  content: string;
  mediaUrl?: string;
  fileName?: string;
  caption?: string;
  options?: {
    delay?: number;
    typing?: boolean;
    quotedMessageId?: string;
  };
}

export interface CreateInstanceRequest {
  instanceName: string;
  webhookUrl?: string;
  events?: string[];
  qrcode?: boolean;
  markMessagesRead?: boolean;
  delayMessage?: number;
  alwaysOnline?: boolean;
  readReceipts?: boolean;
  readStatus?: boolean;
  syncFullHistory?: boolean;
}

export interface InstanceConnectionStatus {
  instanceName: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  qrCode?: string;
  error?: string;
  connectionState?: {
    state: string;
    statusReason?: string;
  };
}

export interface EvolutionAPIConfig {
  baseUrl: string;
  apiKey: string;
  webhookUrl: string;
  defaultEvents: string[];
  timeout: number;
  retries: number;
}

export interface WebhookConfig {
  url: string;
  events: string[];
  enabled: boolean;
  headers?: Record<string, string>;
}

export interface MessageOptions {
  delay?: number;
  typing?: boolean;
  markAsRead?: boolean;
  quotedMessageId?: string;
  mentionedJid?: string[];
}

export interface GroupInfo {
  id: string;
  subject: string;
  description?: string;
  owner: string;
  creation: Date;
  participants: GroupParticipant[];
  announce: boolean;
  restrict: boolean;
  inviteCode?: string;
}

export interface GroupParticipant {
  id: string;
  admin: 'admin' | 'superadmin' | null;
  name?: string;
  phoneNumber: string;
}

export interface EvolutionAPIError {
  error: string;
  message: string;
  statusCode: number;
  instanceName?: string;
}

// Eventos de webhook disponibles
export type EvolutionWebhookEvent = 
  | 'messages.upsert'
  | 'messages.update'
  | 'messages.delete'
  | 'send.message'
  | 'contacts.upsert'
  | 'contacts.update'
  | 'presence.update'
  | 'chats.upsert'
  | 'chats.update'
  | 'chats.delete'
  | 'groups.upsert'
  | 'groups.update'
  | 'group-participants.update'
  | 'connection.update'
  | 'call'
  | 'typebot.start'
  | 'typebot.change-status';

export interface EvolutionAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: EvolutionAPIError;
  message?: string;
}