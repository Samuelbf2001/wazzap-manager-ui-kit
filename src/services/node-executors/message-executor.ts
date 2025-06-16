import { NodeExecutor, NodeExecutionContext, NodeExecutionResult, MessageNodeData } from '@/types/conversation';

/**
 * Ejecutor para nodos de mensaje
 * Maneja el envío de mensajes de WhatsApp con variables y formato
 */
export class MessageExecutor implements NodeExecutor {
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    try {
      const data = context.flowData as MessageNodeData;
      
      // Procesar variables en el mensaje
      const processedMessage = this.processVariables(data.message, context.variables);
      
      // Simular delay de tipificación si está habilitado
      if (data.typing && data.delay) {
        console.log(`⌨️ Simulando tipificación por ${data.delay}ms...`);
        await this.delay(data.delay);
      }

      // Aplicar formato si está configurado
      const formattedMessage = this.applyFormatting(processedMessage, data.formatting);

      // Simular envío de mensaje por WhatsApp
      await this.sendWhatsAppMessage(context.variables.phoneNumber, formattedMessage);

      // Logging del paso
      context.logStep({
        messageType: 'text',
        content: formattedMessage,
        phoneNumber: context.variables.phoneNumber,
        timestamp: new Date().toISOString()
      });

      // Buscar el siguiente nodo conectado
      const nextNodeId = this.findNextNode(context);

      return {
        success: true,
        output: {
          messageSent: formattedMessage,
          timestamp: new Date().toISOString(),
          recipient: context.variables.phoneNumber
        },
        nextNodeId,
        waitingForInput: false
      };
    } catch (error) {
      console.error('Error en MessageExecutor:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al enviar mensaje',
        waitingForInput: false
      };
    }
  }

  /**
   * Procesa variables en el texto del mensaje
   */
  private processVariables(message: string, variables: Record<string, any>): string {
    let processed = message;
    
    // Reemplazar variables con formato {{variable}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      processed = processed.replace(regex, String(value || ''));
    });

    // Reemplazar variables con formato {variable}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      processed = processed.replace(regex, String(value || ''));
    });

    return processed;
  }

  /**
   * Aplica formato al mensaje (bold, emoji, etc.)
   */
  private applyFormatting(message: string, formatting?: MessageNodeData['formatting']): string {
    if (!formatting) return message;

    let formatted = message;

    // Aplicar negritas si está habilitado
    if (formatting.bold) {
      // En WhatsApp Business API, se usa *texto* para negritas
      formatted = `*${formatted}*`;
    }

    // Aplicar cursiva si está habilitado
    if (formatting.italic) {
      // En WhatsApp Business API, se usa _texto_ para cursiva
      formatted = `_${formatted}_`;
    }

    // Agregar emojis si está habilitado
    if (formatting.emoji) {
      // Agregar emoji al final basado en el contexto
      const emojis = ['✨', '🤖', '💬', '👋', '😊'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      formatted = `${formatted} ${randomEmoji}`;
    }

    return formatted;
  }

  /**
   * Simula el envío de mensaje por WhatsApp Business API
   */
  private async sendWhatsAppMessage(phoneNumber: string, message: string): Promise<void> {
    // Aquí iría la integración real con WhatsApp Business API
    console.log(`📱 Enviando mensaje a ${phoneNumber}:`);
    console.log(`💬 ${message}`);
    
    // Simular delay de envío
    await this.delay(500);
    
    // Aquí se haría la llamada real a la API:
    // const response = await fetch(`${API_BASE_URL}/messages`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     messaging_product: 'whatsapp',
    //     to: phoneNumber,
    //     type: 'text',
    //     text: { body: message }
    //   })
    // });
  }

  /**
   * Encuentra el siguiente nodo conectado
   */
  protected findNextNode(context: NodeExecutionContext): string | undefined {
    // En un flujo real, buscaríamos en las edges del flujo
    // Por ahora retornamos undefined para indicar que no hay siguiente nodo
    return undefined;
  }

  /**
   * Utility para delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Ejecutor para nodos de mensaje mejorado/avanzado
 */
export class EnhancedMessageExecutor extends MessageExecutor {
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    try {
      const data = context.flowData;
      
      // Procesar mensaje con variables avanzadas
      const processedMessage = this.processAdvancedVariables(data.message, context.variables);
      
      // Manejar diferentes tipos de contenido
      if (data.messageType === 'template') {
        return await this.sendTemplateMessage(context, processedMessage);
      } else if (data.messageType === 'media') {
        return await this.sendMediaMessage(context, data);
      } else {
        // Mensaje de texto normal
        return await super.execute(context);
      }
    } catch (error) {
      console.error('Error en EnhancedMessageExecutor:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en mensaje avanzado',
        waitingForInput: false
      };
    }
  }

  /**
   * Procesa variables avanzadas con funciones
   */
  private processAdvancedVariables(message: string, variables: Record<string, any>): string {
    let processed = message;

    // Variables básicas
    processed = super['processVariables'](processed, variables);

    // Funciones especiales
    processed = processed.replace(/\{\{now\}\}/g, new Date().toISOString());
    processed = processed.replace(/\{\{date\}\}/g, new Date().toLocaleDateString('es-ES'));
    processed = processed.replace(/\{\{time\}\}/g, new Date().toLocaleTimeString('es-ES'));
    
    // Variables de usuario
    if (variables.userId) {
      processed = processed.replace(/\{\{userId\}\}/g, variables.userId);
    }

    return processed;
  }

  /**
   * Envía mensaje usando template de WhatsApp
   */
  private async sendTemplateMessage(context: NodeExecutionContext, message: string): Promise<NodeExecutionResult> {
    console.log(`📋 Enviando template a ${context.variables.phoneNumber}: ${message}`);
    
    return {
      success: true,
      output: {
        messageType: 'template',
        content: message,
        timestamp: new Date().toISOString()
      },
      nextNodeId: this.findNextNode(context),
      waitingForInput: false
    };
  }

  /**
   * Envía mensaje con media (imagen, video, documento)
   */
  private async sendMediaMessage(context: NodeExecutionContext, data: any): Promise<NodeExecutionResult> {
    console.log(`🖼️ Enviando media a ${context.variables.phoneNumber}:`, data.mediaUrl);
    
    return {
      success: true,
      output: {
        messageType: 'media',
        mediaType: data.mediaType,
        mediaUrl: data.mediaUrl,
        caption: data.caption,
        timestamp: new Date().toISOString()
      },
      nextNodeId: this.findNextNode(context),
      waitingForInput: false
    };
  }
} 