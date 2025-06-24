import { AIAgent } from '@/components/AIAgentManager';
import HubSpotService from './hubspot.service';

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'document' | 'audio' | 'video';
  metadata?: Record<string, any>;
}

export interface AIResponse {
  agentId: string;
  response: string;
  confidence: number;
  shouldEscalate: boolean;
  usedKnowledgeBase: boolean;
  processingTime: number;
}

export interface AutoResponseConfig {
  enabled: boolean;
  workingHours: {
    start: string;
    end: string;
    timezone: string;
    workDays: number[];
  };
  escalationRules: {
    lowConfidenceThreshold: number;
    maxAutoResponses: number;
    complexityThreshold: number;
  };
  fallbackMessages: {
    outOfHours: string;
    highComplexity: string;
    noAgentAvailable: string;
    maxRetriesReached: string;
  };
}

class WhatsAppAIIntegrationService {
  private agents: Map<string, AIAgent> = new Map();
  private hubspotService: HubSpotService;
  private config: AutoResponseConfig;
  private conversationHistory: Map<string, WhatsAppMessage[]> = new Map();

  constructor(hubspotService: HubSpotService, config: AutoResponseConfig) {
    this.hubspotService = hubspotService;
    this.config = config;
  }

  /**
   * Registra un agente IA para auto-respuestas
   */
  registerAgent(agent: AIAgent): void {
    this.agents.set(agent.id, agent);
    console.log(`Agente ${agent.name} registrado para auto-respuestas`);
  }

  /**
   * Procesa un mensaje entrante de WhatsApp
   */
  async processIncomingMessage(message: WhatsAppMessage): Promise<AIResponse | null> {
    try {
      // 1. Verificar si está habilitado
      if (!this.config.enabled) {
        return null;
      }

      // 2. Verificar horarios de trabajo
      if (!this.isWithinWorkingHours()) {
        await this.sendOutOfHoursResponse(message);
        return null;
      }

      // 3. Obtener historial del contacto
      const conversationHistory = await this.getConversationHistory(message.from);

      // 4. Verificar límite de auto-respuestas
      if (this.hasExceededAutoResponseLimit(conversationHistory)) {
        await this.escalateToHuman(message, 'max_retries_reached');
        return null;
      }

      // 5. Seleccionar el mejor agente para responder
      const selectedAgent = await this.selectBestAgent(message, conversationHistory);
      if (!selectedAgent) {
        await this.sendFallbackResponse(message, 'no_agent_available');
        return null;
      }

      // 6. Generar respuesta con IA
      const aiResponse = await this.generateAIResponse(selectedAgent, message, conversationHistory);

      // 7. Evaluar si debe escalar a humano
      if (aiResponse.shouldEscalate) {
        await this.escalateToHuman(message, 'low_confidence');
        return aiResponse;
      }

      // 8. Enviar respuesta automática
      await this.sendWhatsAppMessage(message.from, aiResponse.response);

      // 9. Guardar en HubSpot
      await this.saveToHubSpot(message, aiResponse);

      // 10. Actualizar métricas del agente
      await this.updateAgentMetrics(selectedAgent.id, aiResponse);

      return aiResponse;

    } catch (error) {
      console.error('Error procesando mensaje:', error);
      await this.sendFallbackResponse(message, 'processing_error');
      return null;
    }
  }

  /**
   * Selecciona el mejor agente para responder según el contexto
   */
  private async selectBestAgent(message: WhatsAppMessage, history: WhatsAppMessage[]): Promise<AIAgent | null> {
    const activeAgents = Array.from(this.agents.values()).filter(agent => agent.status === 'active');
    
    if (activeAgents.length === 0) {
      return null;
    }

    // Análisis simple: por ahora tomar el primer agente conversacional
    const conversationalAgent = activeAgents.find(agent => agent.type === 'conversational');
    const multiAgent = activeAgents.find(agent => agent.type === 'multi_agent');
    
    // Priorizar multi-agent para casos complejos, conversacional para simples
    if (this.isComplexQuery(message.content)) {
      return multiAgent || conversationalAgent || activeAgents[0];
    }
    
    return conversationalAgent || activeAgents[0];
  }

  /**
   * Genera respuesta usando el agente IA seleccionado
   */
  private async generateAIResponse(agent: AIAgent, message: WhatsAppMessage, history: WhatsAppMessage[]): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      // Preparar contexto para el agente
      const context = {
        currentMessage: message.content,
        conversationHistory: history.slice(-10), // Últimos 10 mensajes
        userPhone: message.from,
        timestamp: message.timestamp,
        knowledgeBases: agent.knowledgeBases
      };

      // Simular llamada al agente IA (aquí iría la integración real con OpenAI/Claude)
      const response = await this.callAIAgent(agent, context);
      
      const processingTime = Date.now() - startTime;
      
      // Evaluar confianza de la respuesta
      const confidence = this.evaluateResponseConfidence(response, message.content);
      
      return {
        agentId: agent.id,
        response: response,
        confidence: confidence,
        shouldEscalate: confidence < this.config.escalationRules.lowConfidenceThreshold,
        usedKnowledgeBase: agent.knowledgeBases.length > 0,
        processingTime: processingTime
      };

    } catch (error) {
      console.error('Error generando respuesta IA:', error);
      return {
        agentId: agent.id,
        response: this.config.fallbackMessages.noAgentAvailable,
        confidence: 0,
        shouldEscalate: true,
        usedKnowledgeBase: false,
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Llama al agente IA con el contexto apropiado
   */
  private async callAIAgent(agent: AIAgent, context: any): Promise<string> {
    // Preparar prompt basado en el agente
    const systemPrompt = agent.systemPrompt || `Eres un asistente de WhatsApp especializado en atención al cliente. 
Responde de manera amigable, concisa y útil. Si no sabes algo, admítelo y ofrece alternativas.`;

    const userPrompt = `
Contexto de la conversación:
- Mensaje actual: ${context.currentMessage}
- Historial reciente: ${context.conversationHistory.map(m => `${m.from === context.userPhone ? 'Usuario' : 'Bot'}: ${m.content}`).join('\n')}
- Hora: ${context.timestamp.toLocaleString()}

Responde al mensaje actual del usuario.`;

    // Aquí iría la integración real con OpenAI, Claude, etc.
    // Por ahora simular respuesta basada en reglas
    return await this.simulateAIResponse(context.currentMessage, agent);
  }

  /**
   * Simula respuesta IA (reemplazar con integración real)
   */
  private async simulateAIResponse(message: string, agent: AIAgent): Promise<string> {
    const lowerMessage = message.toLowerCase();
    
    // Respuestas simuladas basadas en palabras clave
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos días') || lowerMessage.includes('buenas tardes')) {
      return `¡Hola! 👋 Soy ${agent.name}, tu asistente virtual. ¿En qué puedo ayudarte hoy?`;
    }
    
    if (lowerMessage.includes('precio') || lowerMessage.includes('costo') || lowerMessage.includes('cuanto cuesta')) {
      return 'Te puedo ayudar con información sobre precios. ¿Qué producto o servicio específico te interesa?';
    }
    
    if (lowerMessage.includes('horario') || lowerMessage.includes('abierto') || lowerMessage.includes('cerrado')) {
      return 'Nuestros horarios de atención son de lunes a viernes de 9:00 AM a 6:00 PM. Los fines de semana estamos cerrados.';
    }
    
    if (lowerMessage.includes('contacto') || lowerMessage.includes('teléfono') || lowerMessage.includes('dirección')) {
      return 'Puedes contactarnos por este WhatsApp o visitarnos en nuestra oficina. ¿Qué información específica necesitas?';
    }
    
    // Respuesta genérica
    return 'Gracias por tu mensaje. He registrado tu consulta y me aseguraré de que recibas una respuesta apropiada. ¿Hay algo específico en lo que pueda ayudarte ahora mismo?';
  }

  /**
   * Evalúa la confianza en la respuesta generada
   */
  private evaluateResponseConfidence(response: string, originalMessage: string): number {
    // Evaluación simple basada en longitud y contenido
    let confidence = 0.7; // Base
    
    // Aumentar confianza si la respuesta es específica
    if (response.length > 50 && response.length < 200) {
      confidence += 0.1;
    }
    
    // Reducir si parece muy genérica
    if (response.includes('no sé') || response.includes('no estoy seguro')) {
      confidence -= 0.3;
    }
    
    // Aumentar si incluye información específica
    if (response.includes('horario') || response.includes('precio') || response.includes('contacto')) {
      confidence += 0.2;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Envía mensaje de WhatsApp
   */
  private async sendWhatsAppMessage(to: string, message: string): Promise<void> {
    try {
      // Aquí iría la integración real con WhatsApp Business API
      console.log(`Enviando mensaje a ${to}: ${message}`);
      
      // Simular delay de envío
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Error enviando mensaje WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Escala conversación a agente humano
   */
  private async escalateToHuman(message: WhatsAppMessage, reason: string): Promise<void> {
    console.log(`Escalando conversación ${message.from} a humano. Razón: ${reason}`);
    
    // Notificar a bandeja de entrada
    // Crear ticket en HubSpot
    // Enviar notificación a agentes
    
    let escalationMessage = '';
    switch (reason) {
      case 'low_confidence':
        escalationMessage = 'Tu consulta requiere atención especializada. Un agente se contactará contigo pronto.';
        break;
      case 'max_retries_reached':
        escalationMessage = this.config.fallbackMessages.maxRetriesReached;
        break;
      case 'high_complexity':
        escalationMessage = this.config.fallbackMessages.highComplexity;
        break;
      default:
        escalationMessage = 'Un agente se contactará contigo para ayudarte mejor.';
    }
    
    await this.sendWhatsAppMessage(message.from, escalationMessage);
  }

  /**
   * Guarda interacción en HubSpot
   */
  private async saveToHubSpot(message: WhatsAppMessage, aiResponse: AIResponse): Promise<void> {
    try {
      // Buscar o crear contacto
      const contacts = await this.hubspotService.getContacts(['phone']);
      let contact = contacts.results?.find((c: any) => c.properties.phone === message.from);
      
      if (!contact) {
        contact = await this.hubspotService.createContact({
          properties: {
            phone: message.from,
            firstname: 'WhatsApp',
            lastname: 'Contact',
            hs_lead_status: 'NEW'
          }
        });
      }
      
      // Actualizar con información de la conversación
      await this.hubspotService.updateContact(contact.id, {
        properties: {
          last_whatsapp_message: message.content,
          last_whatsapp_response: aiResponse.response,
          last_ai_agent_used: aiResponse.agentId,
          last_contact_date: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('Error guardando en HubSpot:', error);
    }
  }

  /**
   * Actualiza métricas del agente
   */
  private async updateAgentMetrics(agentId: string, response: AIResponse): Promise<void> {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.totalConversations += 1;
      agent.avgResponseTime = (agent.avgResponseTime + response.processingTime) / 2;
      agent.lastUsed = new Date();
      
      // Actualizar tasa de éxito basada en confianza
      if (response.confidence > 0.7) {
        agent.successRate = Math.min(100, agent.successRate + 0.1);
      } else {
        agent.successRate = Math.max(0, agent.successRate - 0.1);
      }
    }
  }

  // Métodos auxiliares
  private isWithinWorkingHours(): boolean {
    const now = new Date();
    const hours = now.getHours();
    const day = now.getDay();
    
    return this.config.workingHours.workDays.includes(day) &&
           hours >= parseInt(this.config.workingHours.start) &&
           hours < parseInt(this.config.workingHours.end);
  }

  private async sendOutOfHoursResponse(message: WhatsAppMessage): Promise<void> {
    await this.sendWhatsAppMessage(message.from, this.config.fallbackMessages.outOfHours);
  }

  private async sendFallbackResponse(message: WhatsAppMessage, type: string): Promise<void> {
    const fallbackMessage = this.config.fallbackMessages[type as keyof typeof this.config.fallbackMessages] 
      || 'Estamos experimentando problemas técnicos. Intenta nuevamente en unos minutos.';
    
    await this.sendWhatsAppMessage(message.from, fallbackMessage);
  }

  private async getConversationHistory(phone: string): Promise<WhatsAppMessage[]> {
    // Aquí iría la consulta real a la base de datos
    return [];
  }

  private hasExceededAutoResponseLimit(history: WhatsAppMessage[]): boolean {
    const recent = history.filter(m => {
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return m.timestamp > hourAgo;
    });
    
    return recent.length >= this.config.escalationRules.maxAutoResponses;
  }

  private isComplexQuery(message: string): boolean {
    const complexKeywords = ['problema', 'error', 'reclamo', 'devolucion', 'cancelar', 'ayuda urgente'];
    return complexKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  // Agregar método para configurar webhooks
  async configureWebhooks() {
    // Configurar webhook para recibir mensajes de WhatsApp
    console.log('Configurando webhooks de WhatsApp...');
  }

  // Agregar método para validar configuración
  validateConfig(): boolean {
    return this.config.enabled && 
           this.agents.size > 0;
  }

  // Agregar método para obtener estadísticas
  getStats() {
    return {
      totalAgents: this.agents.size,
      totalMessages: this.conversationHistory.size,
      avgConfidence: 0.82, // Simulated
      avgResponseTime: 1.2 // Simulated
    };
  }
}

export default WhatsAppAIIntegrationService; 