import express from 'express';
import HubSpotSyncService, { SyncConfig, SyncResult } from './hubspot-sync.service';

interface WebhookConfig {
  port: number;
  path: string;
  secret?: string;
}

interface HubSpotWebhookEvent {
  eventId: number;
  subscriptionId: number;
  portalId: number;
  appId: number;
  eventType: string;
  subscriptionType: string;
  attemptNumber: number;
  objectId: number;
  changeSource: string;
  changeFlag: string;
  propertyName?: string;
  propertyValue?: string;
  occurredAt: number;
}

interface WhatsAppWebhookEvent {
  event: string;
  data: {
    instanceName?: string;
    key?: {
      id: string;
      remoteJid: string;
      fromMe: boolean;
    };
    message?: {
      conversation?: string;
      extendedTextMessage?: {
        text: string;
      };
      imageMessage?: any;
      audioMessage?: any;
      videoMessage?: any;
      documentMessage?: any;
    };
    messageTimestamp?: number;
    pushName?: string;
    status?: string;
  };
}

class HubSpotWebhookHandler {
  private app: express.Application;
  private syncService: HubSpotSyncService;
  private config: WebhookConfig;
  private server: any;

  constructor(syncService: HubSpotSyncService, config: WebhookConfig) {
    this.syncService = syncService;
    this.config = config;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Parse JSON bodies
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // CORS para permitir requests desde HubSpot
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }
      
      next();
    });

    // Logging middleware
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, {
        body: req.body,
        headers: req.headers,
        query: req.query
      });
      next();
    });
  }

  private setupRoutes(): void {
    // =================== WEBHOOKS DE HUBSPOT ===================

    // Webhook para contactos creados
    this.app.post(`${this.config.path}/hubspot/contact-created`, async (req, res) => {
      try {
        console.log('📞 Webhook: Contacto creado en HubSpot', req.body);
        
        const events = Array.isArray(req.body) ? req.body : [req.body];
        const results: SyncResult[] = [];

        for (const event of events) {
          const syncResults = await this.syncService.handleHubSpotWebhook('contact.creation', event);
          results.push(...syncResults);
        }

        res.status(200).json({
          success: true,
          message: 'Contactos procesados correctamente',
          results
        });
      } catch (error) {
        console.error('Error procesando webhook de contacto creado:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Webhook para contactos actualizados
    this.app.post(`${this.config.path}/hubspot/contact-updated`, async (req, res) => {
      try {
        console.log('📝 Webhook: Contacto actualizado en HubSpot', req.body);
        
        const events = Array.isArray(req.body) ? req.body : [req.body];
        const results: SyncResult[] = [];

        for (const event of events) {
          const syncResults = await this.syncService.handleHubSpotWebhook('contact.propertyChange', event);
          results.push(...syncResults);
        }

        res.status(200).json({
          success: true,
          message: 'Contactos actualizados procesados correctamente',
          results
        });
      } catch (error) {
        console.error('Error procesando webhook de contacto actualizado:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Webhook para deals creados
    this.app.post(`${this.config.path}/hubspot/deal-created`, async (req, res) => {
      try {
        console.log('💼 Webhook: Deal creado en HubSpot', req.body);
        
        const events = Array.isArray(req.body) ? req.body : [req.body];
        const results: SyncResult[] = [];

        for (const event of events) {
          const syncResults = await this.syncService.handleHubSpotWebhook('deal.creation', event);
          results.push(...syncResults);
        }

        res.status(200).json({
          success: true,
          message: 'Deals procesados correctamente',
          results
        });
      } catch (error) {
        console.error('Error procesando webhook de deal creado:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Webhook para deals actualizados
    this.app.post(`${this.config.path}/hubspot/deal-updated`, async (req, res) => {
      try {
        console.log('💼 Webhook: Deal actualizado en HubSpot', req.body);
        
        const events = Array.isArray(req.body) ? req.body : [req.body];
        const results: SyncResult[] = [];

        for (const event of events) {
          const syncResults = await this.syncService.handleHubSpotWebhook('deal.propertyChange', event);
          results.push(...syncResults);
        }

        res.status(200).json({
          success: true,
          message: 'Deals actualizados procesados correctamente',
          results
        });
      } catch (error) {
        console.error('Error procesando webhook de deal actualizado:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // =================== WEBHOOKS DE WHATSAPP ===================

    // Webhook para mensajes recibidos de WhatsApp
    this.app.post(`${this.config.path}/whatsapp/message-received`, async (req, res) => {
      try {
        console.log('💬 Webhook: Mensaje recibido en WhatsApp', req.body);
        
        const event: WhatsAppWebhookEvent = req.body;
        const results = await this.syncService.handleWhatsAppWebhook('message.received', event);

        res.status(200).json({
          success: true,
          message: 'Mensaje procesado correctamente',
          results
        });
      } catch (error) {
        console.error('Error procesando webhook de mensaje WhatsApp:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Webhook para mensajes enviados de WhatsApp
    this.app.post(`${this.config.path}/whatsapp/message-sent`, async (req, res) => {
      try {
        console.log('📤 Webhook: Mensaje enviado desde WhatsApp', req.body);
        
        const event: WhatsAppWebhookEvent = req.body;
        const results = await this.syncService.handleWhatsAppWebhook('message.sent', event);

        res.status(200).json({
          success: true,
          message: 'Mensaje enviado procesado correctamente',
          results
        });
      } catch (error) {
        console.error('Error procesando webhook de mensaje enviado:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Webhook para conversaciones resueltas
    this.app.post(`${this.config.path}/whatsapp/conversation-resolved`, async (req, res) => {
      try {
        console.log('✅ Webhook: Conversación resuelta en WhatsApp', req.body);
        
        const event: WhatsAppWebhookEvent = req.body;
        const results = await this.syncService.handleWhatsAppWebhook('conversation.resolved', event);

        res.status(200).json({
          success: true,
          message: 'Conversación resuelta procesada correctamente',
          results
        });
      } catch (error) {
        console.error('Error procesando webhook de conversación resuelta:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // =================== ENDPOINTS DE ESTADO Y CONTROL ===================

    // Estado de la sincronización
    this.app.get(`${this.config.path}/status`, async (req, res) => {
      try {
        const status = await this.syncService.getStatus();
        res.status(200).json({
          success: true,
          status,
          webhook: {
            isRunning: !!this.server,
            port: this.config.port,
            path: this.config.path
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Forzar sincronización
    this.app.post(`${this.config.path}/sync/:type`, async (req, res) => {
      try {
        const { type } = req.params;
        
        if (!['contact', 'deal', 'conversation'].includes(type)) {
          return res.status(400).json({
            success: false,
            error: 'Tipo de sincronización no válido. Use: contact, deal, conversation'
          });
        }

        const results = await this.syncService.forceSync(type as 'contact' | 'deal' | 'conversation');
        
        res.status(200).json({
          success: true,
          message: `Sincronización de ${type} iniciada`,
          results
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Verificación de webhook (para HubSpot)
    this.app.get(`${this.config.path}/hubspot/*`, (req, res) => {
      console.log('🔍 Verificación de webhook de HubSpot:', req.path);
      res.status(200).json({
        success: true,
        message: 'Webhook activo',
        timestamp: new Date().toISOString()
      });
    });

    // Verificación de webhook (para WhatsApp)
    this.app.get(`${this.config.path}/whatsapp/*`, (req, res) => {
      console.log('🔍 Verificación de webhook de WhatsApp:', req.path);
      res.status(200).json({
        success: true,
        message: 'Webhook activo',
        timestamp: new Date().toISOString()
      });
    });

    // Health check general
    this.app.get(`${this.config.path}/health`, (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Servicio de webhooks funcionando correctamente',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Endpoint para testing
    this.app.post(`${this.config.path}/test`, (req, res) => {
      console.log('🧪 Test webhook recibido:', req.body);
      res.status(200).json({
        success: true,
        message: 'Test webhook recibido correctamente',
        data: req.body,
        timestamp: new Date().toISOString()
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint no encontrado',
        path: req.path,
        method: req.method
      });
    });

    // Error handler
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Error en webhook handler:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    });
  }

  // =================== MÉTODOS PÚBLICOS ===================

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.config.port, () => {
          console.log(`🚀 Webhook server iniciado en puerto ${this.config.port}`);
          console.log(`📡 Endpoints disponibles en ${this.config.path}:`);
          console.log(`   - GET  ${this.config.path}/health`);
          console.log(`   - GET  ${this.config.path}/status`);
          console.log(`   - POST ${this.config.path}/sync/:type`);
          console.log(`   - POST ${this.config.path}/hubspot/contact-created`);
          console.log(`   - POST ${this.config.path}/hubspot/contact-updated`);
          console.log(`   - POST ${this.config.path}/hubspot/deal-created`);
          console.log(`   - POST ${this.config.path}/hubspot/deal-updated`);
          console.log(`   - POST ${this.config.path}/whatsapp/message-received`);
          console.log(`   - POST ${this.config.path}/whatsapp/message-sent`);
          console.log(`   - POST ${this.config.path}/whatsapp/conversation-resolved`);
          resolve();
        });

        this.server.on('error', (error: Error) => {
          console.error('Error en webhook server:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('🛑 Webhook server detenido');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  getApp(): express.Application {
    return this.app;
  }

  isRunning(): boolean {
    return !!this.server;
  }
}

export default HubSpotWebhookHandler;
export type { WebhookConfig, HubSpotWebhookEvent, WhatsAppWebhookEvent };