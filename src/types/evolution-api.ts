// Tipos base para Evolution API
export interface EvolutionAPIResponse<T = any> {
  status: number;
  message: string;
  data?: T;
}

export interface EvolutionAPIError {
  status: number;
  message: string;
  error?: string;
}

// Información de la API
export interface APIInfo {
  status: number;
  message: string;
  version: string;
  swagger: string;
  manager: string;
  documentation: string;
}

// Instancias
export interface Instance {
  instanceName: string;
  instanceId: string;
  status: 'open' | 'close' | 'connecting' | 'qrcode';
  qrcode?: string;
  profilePictureUrl?: string;
  profileName?: string;
  integration?: string;
}

export interface CreateInstanceRequest {
  instanceName: string;
  token?: string;
  qrcode?: boolean;
  number?: string;
  webhook?: string;
  webhook_by_events?: boolean;
  webhook_base64?: boolean;
  events?: string[];
  reject_call?: boolean;
  msg_retry_count?: number;
  proxy?: {
    enabled: boolean;
    host: string;
    port: number;
    protocol: string;
    username?: string;
    password?: string;
  };
  chatwoot_account_id?: number;
  chatwoot_token?: string;
  chatwoot_url?: string;
  chatwoot_sign_msg?: boolean;
  chatwoot_reopen_conversation?: boolean;
  chatwoot_conversation_pending?: boolean;
}

export interface ConnectionState {
  instance: string;
  state: 'open' | 'close' | 'connecting';
}

export interface PresenceRequest {
  presence: 'available' | 'unavailable' | 'composing' | 'recording' | 'paused';
}

// Webhook
export interface WebhookConfig {
  webhook?: {
    url: string;
    by_events: boolean;
    base64: boolean;
    events: string[];
  };
}

// Configuraciones
export interface SettingsConfig {
  reject_call: boolean;
  msg_retry_count: number;
  groups_ignore: boolean;
  always_online: boolean;
  read_messages: boolean;
  read_status: boolean;
  sync_full_history: boolean;
}

// Mensajes
export interface SendTextMessageRequest {
  number: string;
  text: string;
  delay?: number;
  linkPreview?: boolean;
  mentionsEveryOne?: boolean;
  mentioned?: string[];
}

export interface SendMediaMessageRequest {
  number: string;
  mediatype: 'image' | 'document' | 'video' | 'audio';
  media: string; // URL o base64
  caption?: string;
  filename?: string;
  delay?: number;
  mentionsEveryOne?: boolean;
  mentioned?: string[];
}

export interface SendLocationMessageRequest {
  number: string;
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
  delay?: number;
}

export interface SendContactMessageRequest {
  number: string;
  contact: {
    fullName: string;
    wuid: string;
    phoneNumber: string;
    organization?: string;
  };
  delay?: number;
}

export interface SendReactionMessageRequest {
  reactionMessage: {
    id: string;
    fromMe: boolean;
    remote: string;
  };
  reaction: string;
}

export interface SendPollMessageRequest {
  number: string;
  name: string;
  selectableCount: number;
  values: string[];
}

export interface SendListMessageRequest {
  number: string;
  title: string;
  description: string;
  buttonText: string;
  footerText?: string;
  sections: {
    title: string;
    rows: {
      title: string;
      description: string;
      rowId: string;
    }[];
  }[];
}

export interface SendStickerMessageRequest {
  number: string;
  sticker: string; // URL o base64
}

export interface SendStatusMessageRequest {
  type: 'text' | 'image' | 'video';
  content: string;
  caption?: string;
  backgroundColor?: string;
  font?: number;
  allContacts?: boolean;
  statusJidList?: string[];
}

// Chat Controller
export interface WhatsAppNumberCheck {
  numberExists: boolean;
  jid: string;
}

export interface MarkAsReadRequest {
  readMessages: {
    id: string;
    fromMe: boolean;
    remote: string;
  }[];
}

export interface ArchiveChatRequest {
  chat: string;
  archive: boolean;
}

export interface DeleteMessageRequest {
  id: string;
  fromMe: boolean;
  remote: string;
}

export interface SendPresenceRequest {
  number: string;
  presence: 'available' | 'unavailable' | 'composing' | 'recording' | 'paused';
  delay?: number;
}

export interface Contact {
  id: string;
  name?: string;
  notify?: string;
  verifiedName?: string;
  imgUrl?: string;
  status?: string;
}

export interface Message {
  key: {
    id: string;
    fromMe: boolean;
    remote: string;
  };
  pushName?: string;
  message?: any;
  messageType: string;
  messageTimestamp: number;
  status?: 'ERROR' | 'PENDING' | 'SERVER_ACK' | 'DELIVERY_ACK' | 'READ' | 'PLAYED';
  participant?: string;
}

export interface Chat {
  id: string;
  name?: string;
  isGroup: boolean;
  isReadOnly: boolean;
  isAnnounce: boolean;
  unreadCount: number;
  lastMessage?: Message;
  profilePictureUrl?: string;
}

// Perfil
export interface Profile {
  wuid: string;
  name: string;
  picture?: string;
  status?: string;
}

export interface BusinessProfile {
  wuid: string;
  name: string;
  category?: string;
  description?: string;
  website?: string[];
  email?: string;
  address?: string;
}

export interface UpdateProfileNameRequest {
  name: string;
}

export interface UpdateProfileStatusRequest {
  status: string;
}

export interface UpdateProfilePictureRequest {
  picture: string; // base64
}

export interface PrivacySettings {
  readreceipts: 'all' | 'contacts' | 'none';
  profile: 'all' | 'contacts' | 'none';
  status: 'all' | 'contacts' | 'none';
  online: 'all' | 'match_last_seen';
  last: 'all' | 'contacts' | 'none';
  groupadd: 'all' | 'contacts' | 'contact_blacklist' | 'none';
  calladd: 'all' | 'known';
}

// Grupos
export interface CreateGroupRequest {
  subject: string;
  description?: string;
  participants: string[];
}

export interface Group {
  id: string;
  subject: string;
  subjectOwner?: string;
  subjectTime?: number;
  creation?: number;
  owner?: string;
  desc?: string;
  descId?: string;
  descTime?: number;
  descOwner?: string;
  restrict?: boolean;
  announce?: boolean;
  isCommunity?: boolean;
  isCommunityAnnounce?: boolean;
  joinApprovalMode?: boolean;
  memberAddMode?: boolean;
  size?: number;
  participants?: GroupParticipant[];
  ephemeralDuration?: number;
}

export interface GroupParticipant {
  id: string;
  admin: 'admin' | 'superadmin' | null;
}

export interface UpdateGroupSubjectRequest {
  subject: string;
}

export interface UpdateGroupDescriptionRequest {
  description: string;
}

export interface UpdateGroupPictureRequest {
  picture: string; // base64
}

export interface UpdateGroupMembersRequest {
  action: 'add' | 'remove' | 'promote' | 'demote';
  participants: string[];
}

export interface UpdateGroupSettingRequest {
  action: 'announcement' | 'not_announcement' | 'locked' | 'unlocked';
}

export interface GroupInvite {
  inviteCode: string;
  inviteUrl: string;
}

// Typebot
export interface TypebotConfig {
  typebot: {
    url: string;
    typebot: string;
    expire: number;
    keyword_finish: string;
    delay_message: number;
    unknown_message: string;
    listening_from_me: boolean;
  };
}

export interface TypebotStart {
  url: string;
  typebot: string;
  remoteJid: string;
  variables?: Record<string, any>;
}

// Chatwoot
export interface ChatwootConfig {
  chatwoot: {
    account_id: number;
    token: string;
    url: string;
    sign_msg: boolean;
    reopen_conversation: boolean;
    conversation_pending: boolean;
  };
}

// Integraciones de cola
export interface SQSConfig {
  sqs: {
    enabled: boolean;
    access_key_id: string;
    secret_access_key: string;
    account_id: string;
    region: string;
  };
}

export interface RabbitMQConfig {
  rabbitmq: {
    enabled: boolean;
    uri: string;
  };
}

export interface WebSocketConfig {
  websocket: {
    enabled: boolean;
    events: string[];
  };
}

// Eventos de webhook
export interface WebhookEvent {
  event: string;
  instance: string;
  data: any;
  destination: string;
  date_time: string;
  sender: string;
  server_url: string;
  apikey: string;
}

// Tipos de respuesta específicos
export type CreateInstanceResponse = EvolutionAPIResponse<Instance>;
export type FetchInstancesResponse = EvolutionAPIResponse<Instance[]>;
export type ConnectionStateResponse = EvolutionAPIResponse<ConnectionState>;
export type SendMessageResponse = EvolutionAPIResponse<{ key: { id: string; fromMe: boolean; remote: string } }>;
export type FindContactsResponse = EvolutionAPIResponse<Contact[]>;
export type FindMessagesResponse = EvolutionAPIResponse<Message[]>;
export type FindChatsResponse = EvolutionAPIResponse<Chat[]>;
export type ProfileResponse = EvolutionAPIResponse<Profile>;
export type BusinessProfileResponse = EvolutionAPIResponse<BusinessProfile>;
export type PrivacySettingsResponse = EvolutionAPIResponse<PrivacySettings>;
export type GroupResponse = EvolutionAPIResponse<Group>;
export type GroupsResponse = EvolutionAPIResponse<Group[]>;
export type GroupInviteResponse = EvolutionAPIResponse<GroupInvite>;