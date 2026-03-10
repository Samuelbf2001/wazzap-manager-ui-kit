import { NodeExecutor, NodeExecutionContext, NodeExecutionResult, WebhookNodeData } from '@/types/conversation';

/**
 * Ejecutor para nodos de webhook
 * Maneja llamadas HTTP a APIs externas
 */
export class WebhookExecutor implements NodeExecutor {
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    try {
      const data = context.flowData as WebhookNodeData;
      
      // Procesar URL con variables
      const processedUrl = this.processVariables(data.url, context.variables);
      
      // Procesar headers con variables
      const processedHeaders = this.processHeaders(data.headers, context.variables);
      
      // Procesar body con variables
      const processedBody = data.body ? this.processBody(data.body, context.variables) : undefined;
      
      // Ejecutar la llamada HTTP
      const response = await this.makeHttpRequest({
        url: processedUrl,
        method: data.method,
        headers: processedHeaders,
        body: processedBody,
        timeout: data.timeout || 10000,
        retries: data.retries || 0
      });

      // Guardar resultado en variable si está configurado
      if (data.outputVariable && response.data) {
        context.setVariable(data.outputVariable, response.data);
      }

      // Logging
      context.logStep({
        webhookType: 'http_request',
        method: data.method,
        url: processedUrl,
        statusCode: response.status,
        responseTime: response.responseTime,
        success: response.success
      });

      return {
        success: response.success,
        output: {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
          headers: response.headers,
          responseTime: response.responseTime,
          timestamp: new Date().toISOString()
        },
        waitingForInput: false,
        variables: data.outputVariable ? { [data.outputVariable]: response.data } : undefined,
        error: response.success ? undefined : response.error
      };
    } catch (error) {
      console.error('Error en WebhookExecutor:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en llamada webhook',
        waitingForInput: false
      };
    }
  }

  /**
   * Procesa variables en una cadena
   */
  private processVariables(text: string, variables: Record<string, any>): string {
    let processed = text;
    
    // Reemplazar variables con formato {{variable}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      processed = processed.replace(regex, String(value || ''));
    });

    return processed;
  }

  /**
   * Procesa headers con variables
   */
  private processHeaders(headers: Record<string, string>, variables: Record<string, any>): Record<string, string> {
    const processed: Record<string, string> = {};
    
    Object.entries(headers).forEach(([key, value]) => {
      processed[key] = this.processVariables(value, variables);
    });

    // Agregar headers por defecto
    if (!processed['Content-Type']) {
      processed['Content-Type'] = 'application/json';
    }

    return processed;
  }

  /**
   * Procesa body con variables
   */
  private processBody(body: any, variables: Record<string, any>): any {
    if (typeof body === 'string') {
      return this.processVariables(body, variables);
    } else if (typeof body === 'object' && body !== null) {
      return this.processObjectVariables(body, variables);
    }
    return body;
  }

  /**
   * Procesa variables en objetos recursivamente
   */
  private processObjectVariables(obj: any, variables: Record<string, any>): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.processObjectVariables(item, variables));
    } else if (typeof obj === 'object' && obj !== null) {
      const processed: any = {};
      Object.entries(obj).forEach(([key, value]) => {
        processed[key] = this.processObjectVariables(value, variables);
      });
      return processed;
    } else if (typeof obj === 'string') {
      return this.processVariables(obj, variables);
    }
    return obj;
  }

  /**
   * Realiza la llamada HTTP
   */
  private async makeHttpRequest(config: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: any;
    timeout: number;
    retries: number;
  }): Promise<{
    success: boolean;
    status: number;
    statusText: string;
    data: any;
    headers: Record<string, string>;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    console.log(`🌐 Ejecutando ${config.method} ${config.url}`);

    try {
      // Simular llamada HTTP
      const response = await this.simulateHttpCall(config);
      const responseTime = Date.now() - startTime;

      return {
        ...response,
        responseTime,
        success: response.status >= 200 && response.status < 300
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      return {
        success: false,
        status: 0,
        statusText: 'Network Error',
        data: null,
        headers: {},
        responseTime,
        error: errorMessage
      };
    }
  }

  /**
   * Simula llamada HTTP
   */
  private async simulateHttpCall(config: any): Promise<{
    status: number;
    statusText: string;
    data: any;
    headers: Record<string, string>;
  }> {
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockResponse = { 
      message: 'Success', 
      timestamp: new Date().toISOString(),
      received_data: config.body
    };

    return {
      status: 200,
      statusText: 'OK',
      data: mockResponse,
      headers: {
        'content-type': 'application/json'
      }
    };
  }
}

 