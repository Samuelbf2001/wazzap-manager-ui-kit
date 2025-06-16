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