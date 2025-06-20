// Tipos para el sistema de conversaciones y threads

export interface ConversationThread {
  id: string;
  userId: string;
  phoneNumber: string;
  status: 'active' | 'paused' | 'completed' | 'error';
  currentNodeId: string;
  startedAt: Date;
  lastActivity: Date;
  metadata: Record<string, any>;
  variables: Record<string, any>;
  history: ConversationStep[];
}

export interface ConversationStep {
  id: string;
  nodeId: string;
  nodeType: string;
  timestamp: Date;
  input: any;
  output: any;
  status: 'pending' | 'completed' | 'error' | 'skipped';
  executionTime?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface FlowExecution {
  threadId: string;
  flowId: string;
  currentNode: string;
  variables: Record<string, any>;
  userInputs: Record<string, any>;
  history: ExecutionStep[];
  status: 'running' | 'waiting_input' | 'completed' | 'error';
}

export interface ExecutionStep {
  nodeId: string;
  nodeType: string;
  timestamp: Date;
  input: any;
  output: any;
  nextNodeId?: string;
  error?: string;
}

export interface NodeExecutionContext {
  threadId: string;
  currentNode: string;
  variables: Record<string, any>;
  userMessage?: string;
  userInput?: any;
  previousStep?: ExecutionStep;
  flowData: any;
  executeNext: (nodeId: string, output?: any) => Promise<void>;
  setVariable: (key: string, value: any) => void;
  getVariable: (key: string) => any;
  waitForInput: (prompt?: string) => Promise<any>;
  logStep: (output: any, nextNodeId?: string) => void;
}

export interface NodeExecutor {
  execute(context: NodeExecutionContext): Promise<NodeExecutionResult>;
}

export interface NodeExecutionResult {
  success: boolean;
  output?: any;
  nextNodeId?: string;
  waitingForInput?: boolean;
  error?: string;
  variables?: Record<string, any>;
}

// Tipos específicos para diferentes tipos de nodos
export interface MessageNodeData {
  message: string;
  typing?: boolean;
  delay?: number;
  variables?: string[];
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    emoji?: boolean;
  };
}

export interface ConditionNodeData {
  rules: ConditionRule[];
  mode: 'simple' | 'advanced' | 'ai';
  aiPrompt?: string;
  trueNodeId?: string;
  falseNodeId?: string;
}

export interface ConditionRule {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'regex_match';
  value: string;
  logicalOperator?: 'AND' | 'OR';
}

export interface DatabaseNodeData {
  operation: 'select' | 'insert' | 'update' | 'delete';
  table: string;
  fields: string[];
  conditions: Record<string, any>;
  outputVariable?: string;
}

export interface WebhookNodeData {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  outputVariable?: string;
}

export interface AINodeData {
  prompt: string;
  model: 'gpt-3.5-turbo' | 'gpt-4' | 'claude-3-haiku' | 'claude-3-sonnet';
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  outputVariable?: string;
}

// Estados del flujo
export type FlowStatus = 'draft' | 'active' | 'paused' | 'archived';

export interface FlowDefinition {
  id: string;
  name: string;
  description?: string;
  version: number;
  status: FlowStatus;
  nodes: FlowNode[];
  edges: FlowEdge[];
  variables: FlowVariable[];
  settings: FlowSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
  executor?: NodeExecutor;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  condition?: string;
}

export interface FlowVariable {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  defaultValue?: any;
  description?: string;
  required?: boolean;
}

export interface FlowSettings {
  timeout?: number;
  maxSteps?: number;
  errorHandling: 'stop' | 'continue' | 'retry';
  logging: boolean;
  caching: boolean;
}

// Tipos para la bandeja de entrada de conversaciones en vivo
export interface LiveConversation {
  id: string;
  contactId: string;
  phoneNumber: string;
  contactName?: string;
  contactAvatar?: string;
  status: 'active' | 'waiting' | 'resolved' | 'transferred';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedAgent?: string;
  lastMessage: LiveMessage;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  metadata: {
    source: 'whatsapp' | 'telegram' | 'instagram' | 'facebook';
    language?: string;
    timezone?: string;
    hubspotContactId?: string;
    dealId?: string;
    companyId?: string;
  };
}

export interface LiveMessage {
  id: string;
  conversationId: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'system';
  content: string;
  mediaUrl?: string;
  mediaMetadata?: {
    filename?: string;
    size?: number;
    mimeType?: string;
    width?: number;
    height?: number;
    duration?: number;
  };
  sender: {
    id: string;
    name: string;
    type: 'customer' | 'agent' | 'system' | 'bot';
    avatar?: string;
  };
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  replyTo?: string;
  reactions?: MessageReaction[];
  metadata?: Record<string, any>;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: Date;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  activeConversations: number;
  maxConversations: number;
  skills: string[];
  languages: string[];
  lastActivity: Date;
}

export interface ConversationFilters {
  status?: 'active' | 'waiting' | 'resolved' | 'transferred';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedAgent?: string;
  source?: 'whatsapp' | 'telegram' | 'instagram' | 'facebook';
  unreadOnly?: boolean;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  searchQuery?: string;
}

export interface ConversationActions {
  assign: (conversationId: string, agentId: string) => Promise<void>;
  transfer: (conversationId: string, fromAgent: string, toAgent: string) => Promise<void>;
  resolve: (conversationId: string) => Promise<void>;
  reopen: (conversationId: string) => Promise<void>;
  addTag: (conversationId: string, tag: string) => Promise<void>;
  removeTag: (conversationId: string, tag: string) => Promise<void>;
  setPriority: (conversationId: string, priority: LiveConversation['priority']) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, message: Omit<LiveMessage, 'id' | 'timestamp'>) => Promise<void>;
}

export interface InboxSettings {
  autoAssignment: boolean;
  maxConversationsPerAgent: number;
  responseTimeTargets: {
    firstResponse: number; // minutos
    averageResponse: number; // minutos
  };
  workingHours: {
    enabled: boolean;
    timezone: string;
    schedule: {
      [key: string]: {
        start: string;
        end: string;
        enabled: boolean;
      };
    };
  };
  notifications: {
    newMessage: boolean;
    assignment: boolean;
    transfer: boolean;
    sound: boolean;
    desktop: boolean;
  };
  quickResponses: QuickResponse[];
}

export interface QuickResponse {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  language: string;
}

// Eventos de tiempo real para la bandeja de entrada
export interface InboxEvent {
  type: 'new_message' | 'conversation_assigned' | 'conversation_transferred' | 'conversation_resolved' | 'agent_status_changed';
  payload: any;
  timestamp: Date;
  conversationId?: string;
  agentId?: string;
}

// Estadísticas de la bandeja de entrada
export interface InboxStats {
  totalConversations: number;
  activeConversations: number;
  waitingConversations: number;
  resolvedToday: number;
  averageResponseTime: number;
  firstResponseTime: number;
  agentUtilization: number;
  customerSatisfaction: number;
} 