export interface FlowData {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'inactive';
  nodes: any[]; // ReactFlow nodes
  edges: any[]; // ReactFlow edges
  createdAt: Date;
  updatedAt: Date;
  version: number;
  tags?: string[];
  category?: string;
  statistics?: {
    totalExecutions: number;
    successRate: number;
    lastExecution?: Date;
  };
}

export interface CreateFlowRequest {
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
}

export interface UpdateFlowRequest {
  id: string;
  name?: string;
  description?: string;
  status?: 'draft' | 'active' | 'inactive';
  nodes?: any[];
  edges?: any[];
  tags?: string[];
  category?: string;
}

export interface FlowListItem {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  nodeCount: number;
  category?: string;
  tags?: string[];
  statistics?: {
    totalExecutions: number;
    successRate: number;
  };
} 