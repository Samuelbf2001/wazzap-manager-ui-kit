import type { WebhookEvent } from '../types/evolution-api';

export type WebhookEventType = 
  | 'MESSAGE_RECEIVED'
  | 'MESSAGE_SENT'
  | 'MESSAGE_UPDATE'
  | 'MESSAGE_DELETE'
  | 'CONNECTION_UPDATE'
  | 'PRESENCE_UPDATE'
  | 'CHAT_UPDATE'
  | 'GROUP_UPDATE'
  | 'CONTACT_UPDATE';

export interface WebhookHandler {
  eventType: WebhookEventType;
  handler: (event: WebhookEvent) => void | Promise<void>;
}

class WebhookHandlerService {
  private handlers: Map<WebhookEventType, ((event: WebhookEvent) => void | Promise<void>)[]> = new Map();
  private eventListeners: ((event: WebhookEvent) => void)[] = [];

  // Registrar un manejador para un tipo de evento específico
  registerHandler(eventType: WebhookEventType, handler: (event: WebhookEvent) => void | Promise<void>) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  // Remover un manejador
  removeHandler(eventType: WebhookEventType, handler: (event: WebhookEvent) => void | Promise<void>) {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Registrar un listener para todos los eventos
  addEventListener(listener: (event: WebhookEvent) => void) {
    this.eventListeners.push(listener);
  }

  // Remover un listener
  removeEventListener(listener: (event: WebhookEvent) => void) {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  // Procesar un webhook recibido
  async processWebhook(event: WebhookEvent) {
    console.log('Webhook recibido:', event);

    // Notificar a todos los listeners generales
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error en event listener:', error);
      }
    });

    // Ejecutar manejadores específicos del tipo de evento
    const eventHandlers = this.handlers.get(event.event as WebhookEventType);
    if (eventHandlers) {
      for (const handler of eventHandlers) {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Error en handler para ${event.event}:`, error);
        }
      }
    }
  }

  // Validar que el webhook viene de Evolution API
  validateWebhook(headers: Record<string, string>, body: any, expectedApiKey?: string): boolean {
    // Verificar API key si se proporciona
    if (expectedApiKey && headers['apikey'] !== expectedApiKey) {
      console.warn('API key inválida en webhook');
      return false;
    }

    // Verificar estructura básica del webhook
    if (!body || typeof body !== 'object') {
      console.warn('Cuerpo del webhook inválido');
        return false;
      }

    if (!body.event || !body.instance) {
      console.warn('Estructura del webhook incompleta');
      return false;
    }

    return true;
  }

  // Manejadores predefinidos comunes
  setupDefaultHandlers() {
    // Manejador para mensajes recibidos
    this.registerHandler('MESSAGE_RECEIVED', (event) => {
      console.log('Nuevo mensaje recibido:', event.data);
      // Aquí puedes agregar lógica para mostrar notificaciones, actualizar UI, etc.
    });

    // Manejador para cambios de conexión
    this.registerHandler('CONNECTION_UPDATE', (event) => {
      console.log('Estado de conexión actualizado:', event.data);
      // Aquí puedes actualizar el estado de la UI
    });

    // Manejador para actualizaciones de presencia
    this.registerHandler('PRESENCE_UPDATE', (event) => {
      console.log('Presencia actualizada:', event.data);
    });

    // Manejador para actualizaciones de grupos
    this.registerHandler('GROUP_UPDATE', (event) => {
      console.log('Grupo actualizado:', event.data);
    });
  }

  // Crear endpoint para Express.js (si se usa en backend)
  createExpressEndpoint() {
    return async (req: any, res: any) => {
      try {
        // Validar webhook
        if (!this.validateWebhook(req.headers, req.body)) {
          return res.status(400).json({ error: 'Webhook inválido' });
        }

        // Procesar webhook
        await this.processWebhook(req.body);

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error procesando webhook:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    };
  }

  // Para usar con WebSockets o Server-Sent Events
  createWebSocketHandler(ws: WebSocket) {
    const listener = (event: WebhookEvent) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(event));
      }
    };

    this.addEventListener(listener);

    // Retornar función de limpieza
    return () => {
      this.removeEventListener(listener);
    };
  }
}

// Instancia singleton
export const webhookHandlerService = new WebhookHandlerService();

// Configurar manejadores predeterminados
webhookHandlerService.setupDefaultHandlers();

export default webhookHandlerService;