import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface N8NConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
}

export interface N8NWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: N8NNode[];
  connections: any;
  settings: any;
  staticData: any;
  pinData: any;
  versionId: string;
  tags: N8NTag[];
  createdAt: string;
  updatedAt: string;
}

export interface N8NNode {
  id: string;
  name: string;
  type: string;
  parameters: any;
  typeVersion: number;
  position: [number, number];
  credentials?: any;
}

export interface N8NTag {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface N8NExecution {
  id: string;
  workflowId: string;
  mode: 'manual' | 'trigger' | 'webhook';
  startedAt: string;
  stoppedAt?: string;
  status: 'running' | 'success' | 'error' | 'canceled' | 'waiting';
  data: any;
}

export interface N8NWebhookTrigger {
  workflowId: string;
  webhookId: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  isFullPath: boolean;
}

export interface N8NCredential {
  id: string;
  name: string;
  type: string;
  data: any;
  nodesAccess: Array<{
    nodeType: string;
    user: string;
    date: string;
  }>;
  sharedWith: Array<{
    user: string;
    date: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface N8NExecutionData {
  resultData: {
    runData: any;
    pinData?: any;
    lastNodeExecuted?: string;
  };
  executionData?: any;
}

class N8NService {
  private api: AxiosInstance;
  private config: N8NConfig;

  constructor(config: N8NConfig) {
    this.config = config;
    this.api = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'X-N8N-API-KEY': config.apiKey })
      }
    });

    // Interceptor para manejo de errores
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Error en N8N API:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // === GESTIÓN DE WORKFLOWS ===

  async getWorkflows(): Promise<N8NWorkflow[]> {
    try {
      const response: AxiosResponse = await this.api.get('/workflows');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error obteniendo workflows:', error);
      throw error;
    }
  }

  async getWorkflow(workflowId: string): Promise<N8NWorkflow> {
    try {
      const response: AxiosResponse = await this.api.get(`/workflows/${workflowId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error obteniendo workflow ${workflowId}:`, error);
      throw error;
    }
  }

  async createWorkflow(workflow: Partial<N8NWorkflow>): Promise<N8NWorkflow> {
    try {
      const response: AxiosResponse = await this.api.post('/workflows', workflow);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creando workflow:', error);
      throw error;
    }
  }

  async updateWorkflow(workflowId: string, workflow: Partial<N8NWorkflow>): Promise<N8NWorkflow> {
    try {
      const response: AxiosResponse = await this.api.put(`/workflows/${workflowId}`, workflow);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error actualizando workflow ${workflowId}:`, error);
      throw error;
    }
  }

  async deleteWorkflow(workflowId: string): Promise<boolean> {
    try {
      await this.api.delete(`/workflows/${workflowId}`);
      return true;
    } catch (error) {
      console.error(`Error eliminando workflow ${workflowId}:`, error);
      throw error;
    }
  }

  async activateWorkflow(workflowId: string): Promise<boolean> {
    try {
      await this.api.post(`/workflows/${workflowId}/activate`);
      return true;
    } catch (error) {
      console.error(`Error activando workflow ${workflowId}:`, error);
      throw error;
    }
  }

  async deactivateWorkflow(workflowId: string): Promise<boolean> {
    try {
      await this.api.post(`/workflows/${workflowId}/deactivate`);
      return true;
    } catch (error) {
      console.error(`Error desactivando workflow ${workflowId}:`, error);
      throw error;
    }
  }

  // === EJECUCIONES ===

  async executeWorkflow(workflowId: string, data?: any): Promise<N8NExecution> {
    try {
      const payload = {
        workflowData: data,
        runData: {}
      };

      const response: AxiosResponse = await this.api.post(`/workflows/${workflowId}/execute`, payload);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error ejecutando workflow ${workflowId}:`, error);
      throw error;
    }
  }

  async getExecutions(workflowId?: string, limit: number = 20): Promise<N8NExecution[]> {
    try {
      const params: any = { limit };
      if (workflowId) {
        params.workflowId = workflowId;
      }

      const response: AxiosResponse = await this.api.get('/executions', { params });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error obteniendo ejecuciones:', error);
      throw error;
    }
  }

  async getExecution(executionId: string): Promise<N8NExecution> {
    try {
      const response: AxiosResponse = await this.api.get(`/executions/${executionId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error obteniendo ejecución ${executionId}:`, error);
      throw error;
    }
  }

  async deleteExecution(executionId: string): Promise<boolean> {
    try {
      await this.api.delete(`/executions/${executionId}`);
      return true;
    } catch (error) {
      console.error(`Error eliminando ejecución ${executionId}:`, error);
      throw error;
    }
  }

  async retryExecution(executionId: string, loadWorkflow: boolean = true): Promise<N8NExecution> {
    try {
      const response: AxiosResponse = await this.api.post(`/executions/${executionId}/retry`, {
        loadWorkflow
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error reintentando ejecución ${executionId}:`, error);
      throw error;
    }
  }

  // === WEBHOOKS ===

  async getWebhooks(): Promise<N8NWebhookTrigger[]> {
    try {
      const response: AxiosResponse = await this.api.get('/webhooks');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error obteniendo webhooks:', error);
      throw error;
    }
  }

  async triggerWebhook(webhookPath: string, method: string = 'POST', data?: any): Promise<any> {
    try {
      const webhookUrl = `${this.config.baseUrl}/webhook/${webhookPath}`;
      const response: AxiosResponse = await axios({
        method: method.toLowerCase() as any,
        url: webhookUrl,
        data,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error enviando webhook a ${webhookPath}:`, error);
      throw error;
    }
  }

  // === CREDENCIALES ===

  async getCredentials(): Promise<N8NCredential[]> {
    try {
      const response: AxiosResponse = await this.api.get('/credentials');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error obteniendo credenciales:', error);
      throw error;
    }
  }

  async createCredential(credential: Partial<N8NCredential>): Promise<N8NCredential> {
    try {
      const response: AxiosResponse = await this.api.post('/credentials', credential);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creando credencial:', error);
      throw error;
    }
  }

  async updateCredential(credentialId: string, credential: Partial<N8NCredential>): Promise<N8NCredential> {
    try {
      const response: AxiosResponse = await this.api.put(`/credentials/${credentialId}`, credential);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error actualizando credencial ${credentialId}:`, error);
      throw error;
    }
  }

  async deleteCredential(credentialId: string): Promise<boolean> {
    try {
      await this.api.delete(`/credentials/${credentialId}`);
      return true;
    } catch (error) {
      console.error(`Error eliminando credencial ${credentialId}:`, error);
      throw error;
    }
  }

  // === UTILIDADES ===

  async testCredential(credentialId: string, nodeCredentials: any): Promise<boolean> {
    try {
      const response: AxiosResponse = await this.api.post(`/credentials/${credentialId}/test`, {
        credentials: nodeCredentials
      });
      return response.data.success || false;
    } catch (error) {
      console.error(`Error probando credencial ${credentialId}:`, error);
      return false;
    }
  }

  async getNodeTypes(): Promise<any[]> {
    try {
      const response: AxiosResponse = await this.api.get('/node-types');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error obteniendo tipos de nodos:', error);
      throw error;
    }
  }

  async getExecutionData(executionId: string): Promise<N8NExecutionData> {
    try {
      const response: AxiosResponse = await this.api.get(`/executions/${executionId}/data`);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error obteniendo datos de ejecución ${executionId}:`, error);
      throw error;
    }
  }

  // === INTEGRACIÓN ESPECÍFICA PARA WHATSAPP ===

  async createWhatsAppWorkflow(instanceName: string, webhookUrl: string): Promise<N8NWorkflow> {
    const workflowData = {
      name: `WhatsApp Integration - ${instanceName}`,
      active: true,
      nodes: [
        {
          id: 'webhook-trigger',
          name: 'WhatsApp Webhook',
          type: 'n8n-nodes-base.webhook',
          parameters: {
            httpMethod: 'POST',
            path: `whatsapp/${instanceName}`,
            responseMode: 'onReceived',
            responseData: 'allEntries'
          },
          typeVersion: 1,
                     position: [250, 300] as [number, number]
         },
         {
           id: 'process-message',
           name: 'Process Message',
           type: 'n8n-nodes-base.function',
           parameters: {
             functionCode: `
               const webhookData = items[0].json;
               
               // Procesar datos del webhook de Evolution API
               if (webhookData.event === 'messages.upsert') {
                 const message = webhookData.data.message;
                 return [{
                   json: {
                     instanceName: webhookData.instanceName,
                     messageId: message.messageId,
                     from: message.from,
                     to: message.to,
                     content: message.content,
                     type: message.type,
                     timestamp: message.timestamp,
                     isFromMe: message.isFromMe,
                     processed: true
                   }
                 }];
               }
               
               return items;
             `
           },
           typeVersion: 1,
           position: [450, 300] as [number, number]
        }
      ],
      connections: {
        'WhatsApp Webhook': {
          main: [
            [
              {
                node: 'Process Message',
                type: 'main',
                index: 0
              }
            ]
          ]
        }
      },
      settings: {
        errorWorkflow: {
          callerPolicy: 'workflowOwner'
        },
        timezone: 'America/Mexico_City'
      },
             tags: [
         {
           name: 'WhatsApp',
           id: 'whatsapp',
           createdAt: new Date().toISOString(),
           updatedAt: new Date().toISOString()
         },
         {
           name: 'Evolution API',
           id: 'evolution-api',
           createdAt: new Date().toISOString(),
           updatedAt: new Date().toISOString()
         }
       ]
    };

    return this.createWorkflow(workflowData);
  }

  async createHubSpotSyncWorkflow(): Promise<N8NWorkflow> {
    const workflowData = {
      name: 'HubSpot Contact Sync',
      active: true,
      nodes: [
        {
          id: 'webhook-trigger',
          name: 'Contact Update Webhook',
          type: 'n8n-nodes-base.webhook',
          parameters: {
            httpMethod: 'POST',
            path: 'hubspot/contact-sync',
            responseMode: 'onReceived'
          },
          typeVersion: 1,
                     position: [250, 300] as [number, number]
         },
         {
           id: 'hubspot-get-contact',
           name: 'Get HubSpot Contact',
           type: 'n8n-nodes-base.hubspot',
           parameters: {
             resource: 'contact',
             operation: 'get',
             contactId: '={{$json.hubspotContactId}}'
           },
           typeVersion: 1,
           position: [450, 300] as [number, number]
         },
         {
           id: 'update-local-contact',
           name: 'Update Local Contact',
           type: 'n8n-nodes-base.httpRequest',
           parameters: {
             url: `${this.config.baseUrl}/api/contacts/sync`,
             method: 'POST',
             sendBody: true,
             specifyBody: 'json',
             jsonBody: '={{$json}}'
           },
           typeVersion: 1,
           position: [650, 300] as [number, number]
        }
      ],
      connections: {
        'Contact Update Webhook': {
          main: [
            [
              {
                node: 'Get HubSpot Contact',
                type: 'main',
                index: 0
              }
            ]
          ]
        },
        'Get HubSpot Contact': {
          main: [
            [
              {
                node: 'Update Local Contact',
                type: 'main',
                index: 0
              }
            ]
          ]
        }
      },
             tags: [
         {
           name: 'HubSpot',
           id: 'hubspot',
           createdAt: new Date().toISOString(),
           updatedAt: new Date().toISOString()
         },
         {
           name: 'Sync',
           id: 'sync',
           createdAt: new Date().toISOString(),
           updatedAt: new Date().toISOString()
         }
       ]
    };

    return this.createWorkflow(workflowData);
  }

  // === MÉTODOS DE UTILIDAD ===

  getWebhookUrl(path: string): string {
    return `${this.config.baseUrl}/webhook/${path}`;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response: AxiosResponse = await this.api.get('/healthz');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export default N8NService;