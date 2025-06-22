// Tipos para la base de datos

export interface Account {
  id: string;
  name: string;
  type: 'individual' | 'business' | 'enterprise';
  status: 'active' | 'suspended' | 'trial' | 'cancelled';
  subscription: {
    plan: string;
    startDate: Date;
    endDate: Date;
    features: string[];
    limits: {
      instances: number;
      messages: number;
      agents: number;
      storage: number; // GB
    };
  };
  owner: {
    name: string;
    email: string;
    phone: string;
  };
  settings: AccountSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountSettings {
  timezone: string;
  language: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    sms: boolean;
    webhook: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    ipWhitelist: string[];
  };
  integrations: {
    hubspot: HubSpotIntegration;
    n8n: N8NIntegration;
    evolutionApi: EvolutionAPIIntegration;
  };
}

export interface HubSpotIntegration {
  enabled: boolean;
  accessToken?: string;
  refreshToken?: string;
  portalId?: string;
  scope: string[];
  expiresAt?: Date;
  mappings: {
    contactProperties: Record<string, string>;
    dealProperties: Record<string, string>;
    companyProperties: Record<string, string>;
  };
  syncSettings: {
    autoSync: boolean;
    syncInterval: number; // minutos
    syncDirection: 'bidirectional' | 'toHubSpot' | 'fromHubSpot';
  };
}

export interface N8NIntegration {
  enabled: boolean;
  baseUrl: string;
  apiKey?: string;
  webhookUrl: string;
  workflows: N8NWorkflow[];
  credentials: N8NCredential[];
}

export interface N8NWorkflow {
  id: string;
  name: string;
  active: boolean;
  trigger: 'webhook' | 'schedule' | 'manual';
  description?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface N8NCredential {
  id: string;
  name: string;
  type: string;
  data: Record<string, any>;
}

export interface EvolutionAPIIntegration {
  enabled: boolean;
  baseUrl: string;
  apiKey: string;
  instances: EvolutionInstance[];
  defaultWebhookUrl: string;
}

export interface EvolutionInstance {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  phoneNumber?: string;
  profileName?: string;
  qrCode?: string;
  webhookUrl: string;
  events: string[];
  settings: {
    markMessagesRead: boolean;
    delayMessage: number;
    alwaysOnline: boolean;
    readReceipts: boolean;
  };
  createdAt: Date;
  lastConnection?: Date;
}

export interface Conversation {
  id: string;
  accountId: string;
  instanceId: string;
  contactId: string;
  status: 'active' | 'paused' | 'resolved' | 'transferred';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channel: 'whatsapp' | 'telegram' | 'instagram' | 'facebook' | 'sms';
  assignedAgentId?: string;
  transferHistory: ConversationTransfer[];
  tags: string[];
  metadata: ConversationMetadata;
  statistics: ConversationStatistics;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface ConversationTransfer {
  id: string;
  fromAgentId?: string;
  toAgentId: string;
  reason: string;
  timestamp: Date;
  transferredBy: string;
}

export interface ConversationMetadata {
  source: string;
  language?: string;
  timezone?: string;
  customerSatisfaction?: number;
  hubspotContactId?: string;
  hubspotDealId?: string;
  hubspotCompanyId?: string;
  customFields: Record<string, any>;
  flowExecutionId?: string;
  lastFlowNode?: string;
}

export interface ConversationStatistics {
  messageCount: number;
  firstResponseTime?: number; // segundos
  averageResponseTime?: number; // segundos
  resolutionTime?: number; // segundos
  agentInteractions: number;
  customerInteractions: number;
  transferCount: number;
}

export interface Contact {
  id: string;
  accountId: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  profilePictureUrl?: string;
  isGroup: boolean;
  groupInfo?: {
    subject: string;
    description?: string;
    participantCount: number;
  };
  preferences: ContactPreferences;
  demographics: ContactDemographics;
  interactions: ContactInteractionSummary;
  tags: string[];
  customFields: Record<string, any>;
  hubspotContactId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastInteraction?: Date;
}

export interface ContactPreferences {
  language: string;
  timezone: string;
  communicationChannel: string[];
  doNotDisturb: {
    enabled: boolean;
    start?: string;
    end?: string;
    days?: number[];
  };
  marketingOptIn: boolean;
  notificationOptIn: boolean;
}

export interface ContactDemographics {
  age?: number;
  gender?: 'male' | 'female' | 'other';
  location?: {
    country: string;
    state?: string;
    city?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  occupation?: string;
  industry?: string;
}

export interface ContactInteractionSummary {
  totalConversations: number;
  totalMessages: number;
  averageResponseTime: number;
  lastMessageDate?: Date;
  mostActiveHour?: number;
  mostActiveDay?: string;
  satisfactionScore?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  instanceId: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'system';
  content: string;
  mediaUrl?: string;
  mediaMetadata?: MessageMediaMetadata;
  sender: MessageSender;
  recipient: MessageRecipient;
  timestamp: Date;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  direction: 'inbound' | 'outbound';
  replyTo?: string;
  reactions: MessageReaction[];
  metadata: MessageMetadata;
  processingStatus: {
    flowProcessed: boolean;
    aiProcessed: boolean;
    hubspotSynced: boolean;
    n8nProcessed: boolean;
  };
  createdAt: Date;
}

export interface MessageMediaMetadata {
  filename?: string;
  size?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnailUrl?: string;
}

export interface MessageSender {
  id: string;
  type: 'customer' | 'agent' | 'system' | 'bot';
  name: string;
  phoneNumber?: string;
  avatar?: string;
}

export interface MessageRecipient {
  id: string;
  type: 'customer' | 'agent' | 'system' | 'broadcast';
  name: string;
  phoneNumber?: string;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: Date;
}

export interface MessageMetadata {
  messageId: string; // ID original del canal
  quotedMessageId?: string;
  contextInfo?: any;
  forwardingScore?: number;
  isForwarded?: boolean;
  mentionedJids?: string[];
  source: 'manual' | 'flow' | 'campaign' | 'api' | 'n8n';
  campaignId?: string;
  flowExecutionId?: string;
  n8nWorkflowId?: string;
  hubspotActivityId?: string;
}

export interface Agent {
  id: string;
  accountId: string;
  name: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  role: 'admin' | 'supervisor' | 'agent' | 'viewer';
  status: 'online' | 'away' | 'busy' | 'offline';
  permissions: AgentPermissions;
  settings: AgentSettings;
  statistics: AgentStatistics;
  workSchedule: WorkSchedule;
  createdAt: Date;
  updatedAt: Date;
  lastActivity?: Date;
}

export interface AgentPermissions {
  canCreateFlows: boolean;
  canEditFlows: boolean;
  canDeleteFlows: boolean;
  canManageAgents: boolean;
  canViewReports: boolean;
  canManageIntegrations: boolean;
  canManageCampaigns: boolean;
  maxConversations: number;
  accessibleInstances: string[];
}

export interface AgentSettings {
  notifications: {
    newMessage: boolean;
    assignment: boolean;
    transfer: boolean;
    mentions: boolean;
    sound: boolean;
    desktop: boolean;
  };
  autoResponses: {
    enabled: boolean;
    awayMessage?: string;
    busyMessage?: string;
  };
  workingHours: {
    enabled: boolean;
    timezone: string;
    schedule: Record<string, { start: string; end: string; enabled: boolean }>;
  };
}

export interface AgentStatistics {
  totalConversations: number;
  activeConversations: number;
  resolvedConversations: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  customerSatisfactionScore: number;
  messagesHandled: number;
  onlineHours: number;
}

export interface WorkSchedule {
  timezone: string;
  schedule: {
    monday: WorkDay;
    tuesday: WorkDay;
    wednesday: WorkDay;
    thursday: WorkDay;
    friday: WorkDay;
    saturday: WorkDay;
    sunday: WorkDay;
  };
}

export interface WorkDay {
  enabled: boolean;
  start: string;
  end: string;
  breaks?: {
    start: string;
    end: string;
  }[];
}

export interface Campaign {
  id: string;
  accountId: string;
  name: string;
  description?: string;
  type: 'broadcast' | 'drip' | 'trigger' | 'survey';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
  targetAudience: CampaignAudience;
  message: CampaignMessage;
  schedule: CampaignSchedule;
  settings: CampaignSettings;
  statistics: CampaignStatistics;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface CampaignAudience {
  type: 'all' | 'segment' | 'list' | 'custom';
  filters?: {
    tags?: string[];
    customFields?: Record<string, any>;
    lastInteraction?: {
      operator: 'before' | 'after';
      date: Date;
    };
    location?: {
      country?: string;
      state?: string;
      city?: string;
    };
  };
  contactIds?: string[];
  excludeIds?: string[];
  estimatedReach: number;
}

export interface CampaignMessage {
  type: 'text' | 'template' | 'media';
  content: string;
  mediaUrl?: string;
  templateName?: string;
  templateVariables?: Record<string, string>;
  personalization: {
    useContactName: boolean;
    customVariables: string[];
  };
}

export interface CampaignSchedule {
  type: 'immediate' | 'scheduled' | 'recurring';
  startDate?: Date;
  endDate?: Date;
  timezone: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  interval?: number;
  daysOfWeek?: number[];
  time?: string;
}

export interface CampaignSettings {
  respectDoNotDisturb: boolean;
  respectWorkingHours: boolean;
  maxSendRate: number; // mensajes por minuto
  retryFailedSends: boolean;
  trackOpens: boolean;
  trackClicks: boolean;
  optOutKeyword: string;
}

export interface CampaignStatistics {
  totalTargeted: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  optOuts: number;
  responses: number;
  conversions: number;
  clicks: number;
  deliveryRate: number;
  readRate: number;
  responseRate: number;
  conversionRate: number;
}

export interface SystemLog {
  id: string;
  accountId: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'api' | 'webhook' | 'flow' | 'campaign' | 'integration' | 'system';
  message: string;
  details?: Record<string, any>;
  source: string;
  userId?: string;
  instanceId?: string;
  conversationId?: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface WebhookLog {
  id: string;
  accountId: string;
  source: 'evolution-api' | 'n8n' | 'hubspot' | 'external';
  endpoint: string;
  method: string;
  headers: Record<string, string>;
  payload: any;
  response?: {
    status: number;
    body: any;
    headers: Record<string, string>;
  };
  processingTime: number;
  status: 'success' | 'failed' | 'retry';
  error?: string;
  retryCount: number;
  timestamp: Date;
}