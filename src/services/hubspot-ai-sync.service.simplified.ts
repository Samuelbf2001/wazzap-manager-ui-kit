import HubSpotService from './hubspot.service';

// Tipos simplificados para el agente de sincronización
interface ConversationData {
  type: 'single_message' | 'complete_conversation';
  thread_id: string;
  message?: MessageData;
  conversation?: CompleteConversationData;
}

interface MessageData {
  content: string;
  sender_type: 'user' | 'agent' | 'system';
  sender_name: string;
  timestamp: string;
  message_type: 'text' | 'image' | 'document' | 'audio' | 'video';
  metadata?: Record<string, any>;
}

interface CompleteConversationData {
  contact_info: any;
  messages: MessageData[];
  metadata: Record<string, any>;
}

interface ExtractedContactInfo {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  location?: string;
  language: string;
  source: string;
}

interface BusinessInsights {
  buyer_journey_stage: 'awareness' | 'consideration' | 'decision';
  query_type: 'information' | 'support' | 'sales' | 'complaint';
  products_interest: string[];
  budget_mentioned?: number;
  urgency_level: 'low' | 'medium' | 'high' | 'urgent';
  decision_authority: boolean;
  estimated_value?: number;
  timeframe?: string;
  competitors_mentioned: string[];
  pain_points: string[];
  objections: string[];
  next_action: string;
}

interface LeadScore {
  score: number; // 1-10
  authority_points: number; // 0-3
  budget_points: number; // 0-2
  need_points: number; // 0-2
  timeframe_points: number; // 0-2
  engagement_points: number; // 0-1
}

interface SyncResult {
  status: 'success' | 'error';
  processed_items: {
    conversations: number;
    messages: number;
    contacts_updated: number;
    deals_created: number;
    deals_updated: number;
  };
  hubspot_sync: {
    contacts_synced: number;
    deals_synced: number;
    errors: string[];
    warnings: string[];
  };
  insights: {
    lead_score: number;
    opportunity_identified: boolean;
    next_action_recommended: string;
    priority_level: 'low' | 'medium' | 'high' | 'urgent';
  };
  summary: string;
}

/**
 * Servicio de IA para sincronización con HubSpot
 * 
 * Este servicio implementa la lógica del agente de IA descrita en el prompt,
 * procesando conversaciones de WhatsApp y sincronizando datos con HubSpot.
 */
export class HubSpotAISyncService {
  private hubspotService: HubSpotService;

  constructor(hubspotConfig: { apiKey: string; portalId: string }) {
    this.hubspotService = new HubSpotService(hubspotConfig);
  }

  /**
   * Procesa datos de conversación usando IA y sincroniza con HubSpot
   * 
   * Esta es la función principal que implementa el flujo descrito en el prompt:
   * 1. Analiza conversación con IA
   * 2. Guarda en base de datos local  
   * 3. Sincroniza con HubSpot
   * 4. Genera insights y recomendaciones
   */
  async processConversationData(data: ConversationData): Promise<SyncResult> {
    const result: SyncResult = {
      status: 'success',
      processed_items: {
        conversations: 0,
        messages: 0,
        contacts_updated: 0,
        deals_created: 0,
        deals_updated: 0
      },
      hubspot_sync: {
        contacts_synced: 0,
        deals_synced: 0,
        errors: [],
        warnings: []
      },
      insights: {
        lead_score: 0,
        opportunity_identified: false,
        next_action_recommended: '',
        priority_level: 'low'
      },
      summary: ''
    };

    try {
      let messages: MessageData[] = [];

      // Extraer mensajes según el tipo de datos
      if (data.type === 'single_message' && data.message) {
        messages = [data.message];
      } else if (data.type === 'complete_conversation' && data.conversation) {
        messages = data.conversation.messages;
      }

      // 1. Análizar conversación con IA
      const extractedInfo = await this.analyzeConversationWithAI(messages);
      const businessInsights = await this.extractBusinessInsights(messages);
      const leadScore = this.calculateLeadScore(businessInsights, extractedInfo);

      // 2. Guardar en base de datos local (simulado)
      console.log('Guardando conversación en base de datos local:', {
        threadId: data.thread_id,
        extractedInfo,
        businessInsights,
        leadScore
      });
      
      result.processed_items.conversations = data.type === 'complete_conversation' ? 1 : 0;
      result.processed_items.messages = messages.length;

      // 3. Sincronizar con HubSpot
      const hubspotSyncResult = await this.syncWithHubSpot(
        data.thread_id,
        extractedInfo,
        businessInsights,
        leadScore
      );

      result.hubspot_sync = hubspotSyncResult;
      result.processed_items.contacts_updated = hubspotSyncResult.contacts_synced;
      result.processed_items.deals_created = hubspotSyncResult.deals_synced;

      // 4. Generar insights y recomendaciones
      result.insights = {
        lead_score: leadScore.score,
        opportunity_identified: this.isOpportunityIdentified(businessInsights),
        next_action_recommended: businessInsights.next_action,
        priority_level: this.determinePriorityLevel(leadScore, businessInsights)
      };

      result.summary = this.generateConversationSummary(extractedInfo, businessInsights, leadScore);

    } catch (error) {
      result.status = 'error';
      result.hubspot_sync.errors.push(`Error processing conversation: ${error}`);
    }

    return result;
  }

  /**
   * Analiza conversación usando IA para extraer información de contacto
   * 
   * En una implementación real, esto haría una llamada al modelo de IA
   * definido en el prompt (GPT-4, Claude, etc.) para extraer información
   * estructurada de la conversación.
   */
  private async analyzeConversationWithAI(messages: MessageData[]): Promise<ExtractedContactInfo> {
    const conversationText = messages.map(m => `${m.sender_name}: ${m.content}`).join('\n');
    
    // Simular análisis de IA - en producción esto sería una llamada al modelo
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phonePattern = /(\+?52)?[\s\-\.]?(\d{2,3})[\s\-\.]?(\d{3,4})[\s\-\.]?(\d{4})/;
    
    const email = conversationText.match(emailPattern)?.[0];
    const phone = conversationText.match(phonePattern)?.[0];

    // Detectar nombre usando patrones comunes en español
    const nameIndicators = ['me llamo', 'soy', 'mi nombre es', 'mi nombre'];
    let extractedName = '';
    
    for (const indicator of nameIndicators) {
      const nameMatch = conversationText.toLowerCase().match(new RegExp(`${indicator}\\s+([\\w\\s]{2,30})`));
      if (nameMatch) {
        extractedName = nameMatch[1].trim();
        break;
      }
    }

    const [firstName, ...lastNameParts] = extractedName.split(' ');
    const lastName = lastNameParts.join(' ');

    return {
      first_name: firstName || undefined,
      last_name: lastName || undefined,
      email: email || undefined,
      phone: phone || undefined,
      language: 'es',
      source: 'whatsapp'
    };
  }

  /**
   * Extrae insights de negocio de la conversación usando IA
   * 
   * Analiza la conversación para identificar oportunidades comerciales,
   * etapa del buyer journey, urgencia, etc.
   */
  private async extractBusinessInsights(messages: MessageData[]): Promise<BusinessInsights> {
    const conversationText = messages.map(m => m.content).join(' ').toLowerCase();

    return {
      buyer_journey_stage: this.determineBuyerJourneyStage(conversationText),
      query_type: this.determineQueryType(conversationText),
      products_interest: this.detectProductsOfInterest(conversationText),
      budget_mentioned: this.extractBudget(conversationText),
      urgency_level: this.detectUrgency(conversationText),
      decision_authority: this.detectDecisionAuthority(conversationText),
      pain_points: this.detectPainPoints(conversationText),
      objections: this.detectObjections(conversationText),
      competitors_mentioned: this.detectCompetitors(conversationText),
      next_action: this.determineNextAction(conversationText)
    };
  }

  /**
   * Calcula puntuación de lead basada en criterios de negocio del prompt
   */
  private calculateLeadScore(insights: BusinessInsights, contactInfo: ExtractedContactInfo): LeadScore {
    let authorityPoints = insights.decision_authority ? 3 : 1;
    let budgetPoints = insights.budget_mentioned ? 2 : 0;
    let needPoints = insights.pain_points.length > 0 ? 2 : 1;
    let timeframePoints = insights.urgency_level === 'urgent' ? 2 : 
                         insights.urgency_level === 'high' ? 1 : 0;
    let engagementPoints = insights.query_type === 'sales' ? 1 : 0;

    const totalScore = authorityPoints + budgetPoints + needPoints + timeframePoints + engagementPoints;

    return {
      score: totalScore,
      authority_points: authorityPoints,
      budget_points: budgetPoints,
      need_points: needPoints,
      timeframe_points: timeframePoints,
      engagement_points: engagementPoints
    };
  }

  /**
   * Sincroniza información con HubSpot según las reglas del prompt
   */
  private async syncWithHubSpot(
    threadId: string,
    contactInfo: ExtractedContactInfo,
    insights: BusinessInsights,
    leadScore: LeadScore
  ): Promise<{ contacts_synced: number; deals_synced: number; errors: string[]; warnings: string[] }> {
    const result = {
      contacts_synced: 0,
      deals_synced: 0,
      errors: [],
      warnings: []
    };

    try {
      // 1. Buscar o crear contacto en HubSpot
      if (contactInfo.email || contactInfo.phone) {
        const hubspotContact = await this.findOrCreateHubSpotContact(contactInfo, insights, leadScore);
        if (hubspotContact) {
          result.contacts_synced = 1;
        }

        // 2. Crear deal si se identifica oportunidad
        if (this.isOpportunityIdentified(insights)) {
          const deal = await this.createHubSpotDeal(hubspotContact?.id, insights, leadScore);
          if (deal) {
            result.deals_synced = 1;
          }
        }
      } else {
        result.warnings.push('No se encontró email o teléfono para sincronizar con HubSpot');
      }

    } catch (error) {
      result.errors.push(`Error sincronizando con HubSpot: ${error}`);
    }

    return result;
  }

  // === MÉTODOS DE ANÁLISIS DE TEXTO ===

  private detectProductsOfInterest(text: string): string[] {
    const productKeywords = ['producto', 'servicio', 'plan', 'paquete', 'suscripción'];
    return productKeywords.filter(keyword => text.includes(keyword));
  }

  private extractBudget(text: string): number | undefined {
    const budgetPattern = /\$?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/;
    const match = text.match(budgetPattern);
    return match ? parseFloat(match[1].replace(',', '')) : undefined;
  }

  private detectUrgency(text: string): 'low' | 'medium' | 'high' | 'urgent' {
    const urgentWords = ['urgente', 'inmediato', 'hoy', 'ahora'];
    const highWords = ['pronto', 'rápido', 'esta semana'];
    const mediumWords = ['próxima semana', 'este mes'];

    if (urgentWords.some(word => text.includes(word))) return 'urgent';
    if (highWords.some(word => text.includes(word))) return 'high';
    if (mediumWords.some(word => text.includes(word))) return 'medium';
    return 'low';
  }

  private detectPainPoints(text: string): string[] {
    const painPointIndicators = [
      'problema', 'dificultad', 'necesito', 'requiero',
      'no funciona', 'falla', 'error', 'lento'
    ];
    
    return painPointIndicators.filter(indicator => text.includes(indicator));
  }

  private detectObjections(text: string): string[] {
    const objectionIndicators = [
      'muy caro', 'no tengo presupuesto', 'lo pensaré',
      'necesito consultarlo', 'no estoy seguro'
    ];
    
    return objectionIndicators.filter(objection => text.includes(objection));
  }

  private detectCompetitors(text: string): string[] {
    // Lista configurable de competidores
    const competitors = ['competidor1', 'competidor2'];
    return competitors.filter(competitor => text.includes(competitor.toLowerCase()));
  }

  private detectDecisionAuthority(text: string): boolean {
    const authorityIndicators = [
      'soy el dueño', 'soy el gerente', 'tengo autoridad',
      'puedo decidir', 'está en mis manos'
    ];
    
    return authorityIndicators.some(indicator => text.includes(indicator));
  }

  private determineBuyerJourneyStage(text: string): 'awareness' | 'consideration' | 'decision' {
    const decisionWords = ['comprar', 'contratar', 'precio', 'costo', 'cotización'];
    const considerationWords = ['comparar', 'opciones', 'diferencias', 'características'];
    
    if (decisionWords.some(word => text.includes(word))) return 'decision';
    if (considerationWords.some(word => text.includes(word))) return 'consideration';
    return 'awareness';
  }

  private determineQueryType(text: string): 'information' | 'support' | 'sales' | 'complaint' {
    const salesWords = ['comprar', 'precio', 'cotizar', 'contratar'];
    const supportWords = ['ayuda', 'problema', 'no funciona', 'error'];
    const complaintWords = ['reclamo', 'queja', 'insatisfecho', 'malo'];
    
    if (salesWords.some(word => text.includes(word))) return 'sales';
    if (complaintWords.some(word => text.includes(word))) return 'complaint';
    if (supportWords.some(word => text.includes(word))) return 'support';
    return 'information';
  }

  private determineNextAction(text: string): string {
    const queryType = this.determineQueryType(text);
    
    switch (queryType) {
      case 'sales':
        return 'Enviar cotización o agendar llamada comercial';
      case 'support':
        return 'Brindar soporte técnico o transferir a especialista';
      case 'complaint':
        return 'Atender reclamo y buscar solución';
      default:
        return 'Proporcionar información adicional';
    }
  }

  private isOpportunityIdentified(insights: BusinessInsights): boolean {
    return insights.query_type === 'sales' ||
           insights.budget_mentioned !== undefined ||
           insights.buyer_journey_stage === 'decision' ||
           insights.urgency_level === 'urgent';
  }

  private determinePriorityLevel(leadScore: LeadScore, insights: BusinessInsights): 'low' | 'medium' | 'high' | 'urgent' {
    if (leadScore.score >= 8 || insights.urgency_level === 'urgent') return 'urgent';
    if (leadScore.score >= 6 || insights.urgency_level === 'high') return 'high';
    if (leadScore.score >= 4 || insights.urgency_level === 'medium') return 'medium';
    return 'low';
  }

  private generateConversationSummary(
    contactInfo: ExtractedContactInfo,
    insights: BusinessInsights,
    leadScore: LeadScore
  ): string {
    return `Conversación con ${contactInfo.first_name || 'contacto'} - ` +
           `Lead Score: ${leadScore.score}/10 - ` +
           `Tipo: ${insights.query_type} - ` +
           `Etapa: ${insights.buyer_journey_stage} - ` +
           `Prioridad: ${this.determinePriorityLevel(leadScore, insights)}`;
  }

  // === MÉTODOS DE INTEGRACIÓN HUBSPOT ===

  private async findOrCreateHubSpotContact(
    contactInfo: ExtractedContactInfo,
    insights: BusinessInsights,
    leadScore: LeadScore
  ): Promise<any> {
    try {
      // Buscar contacto existente por email o teléfono
      const existingContacts = await this.hubspotService.getContacts([
        'firstname', 'lastname', 'email', 'phone'
      ]);
      
      const existingContact = existingContacts.results?.find((contact: any) => 
        contact.properties.email === contactInfo.email ||
        contact.properties.phone === contactInfo.phone
      );

      if (existingContact) {
        // Actualizar contacto existente con nuevas propiedades
        return await this.hubspotService.updateContact(existingContact.id, {
          properties: this.buildHubSpotContactProperties(contactInfo, insights, leadScore, true)
        });
      } else {
        // Crear nuevo contacto
        return await this.hubspotService.createContact({
          properties: this.buildHubSpotContactProperties(contactInfo, insights, leadScore, false)
        });
      }
    } catch (error) {
      console.error('Error finding or creating HubSpot contact:', error);
      return null;
    }
  }

  private buildHubSpotContactProperties(
    contactInfo: ExtractedContactInfo,
    insights: BusinessInsights,
    leadScore: LeadScore,
    isUpdate: boolean
  ): Record<string, any> {
    const baseProperties = {
      // Propiedades personalizadas definidas en el prompt
      whatsapp_phone_number: contactInfo.phone,
      last_whatsapp_activity: new Date().toISOString(),
      conversation_stage: insights.buyer_journey_stage,
      lead_quality_score: leadScore.score,
      pain_points: insights.pain_points.join(', '),
      budget_range: insights.budget_mentioned?.toString() || '',
      decision_timeframe: insights.urgency_level,
      conversation_sentiment: 'neutral', // Se podría analizar con IA
      products_of_interest: insights.products_interest.join(', ')
    };

    if (!isUpdate) {
      // Propiedades adicionales solo para contactos nuevos
      return {
        ...baseProperties,
        firstname: contactInfo.first_name,
        lastname: contactInfo.last_name,
        email: contactInfo.email,
        phone: contactInfo.phone,
        hs_lead_status: 'NEW',
        hs_analytics_source: 'OFFLINE',
        hs_analytics_source_data_1: 'WhatsApp'
      };
    }

    return baseProperties;
  }

  private async createHubSpotDeal(
    contactId: string | undefined,
    insights: BusinessInsights,
    leadScore: LeadScore
  ): Promise<any> {
    if (!contactId) return null;

    try {
      const dealProperties = {
        dealname: `WhatsApp Opportunity - ${new Date().toLocaleDateString()}`,
        dealstage: this.mapBuyerJourneyToDealStage(insights.buyer_journey_stage),
        amount: insights.budget_mentioned || insights.estimated_value || 0,
        closedate: this.calculateCloseDate(insights.urgency_level),
        dealtype: 'newbusiness',
        // Propiedades personalizadas de deal definidas en el prompt
        whatsapp_conversation_id: 'placeholder-thread-id',
        lead_source_detail: 'WhatsApp Conversation',
        conversation_notes: this.generateDealNotes(insights),
        next_followup_action: insights.next_action,
        customer_urgency_level: insights.urgency_level
      };

      console.log('Creating HubSpot deal:', dealProperties);
      // En implementación real, se usaría la API de deals de HubSpot
      return dealProperties;
    } catch (error) {
      console.error('Error creating HubSpot deal:', error);
      return null;
    }
  }

  private mapBuyerJourneyToDealStage(stage: string): string {
    switch (stage) {
      case 'awareness': return 'qualifiedtobuy';
      case 'consideration': return 'presentationscheduled';
      case 'decision': return 'decisionmakerboughtin';
      default: return 'qualifiedtobuy';
    }
  }

  private calculateCloseDate(urgency: string): string {
    const now = new Date();
    switch (urgency) {
      case 'urgent':
        now.setDate(now.getDate() + 7); // 1 semana
        break;
      case 'high':
        now.setDate(now.getDate() + 14); // 2 semanas
        break;
      case 'medium':
        now.setMonth(now.getMonth() + 1); // 1 mes
        break;
      default:
        now.setMonth(now.getMonth() + 3); // 3 meses
    }
    return now.toISOString().split('T')[0];
  }

  private generateDealNotes(insights: BusinessInsights): string {
    return `Oportunidad identificada desde WhatsApp.\n` +
           `Productos de interés: ${insights.products_interest.join(', ')}\n` +
           `Pain points: ${insights.pain_points.join(', ')}\n` +
           `Nivel de urgencia: ${insights.urgency_level}\n` +
           `Siguiente acción: ${insights.next_action}`;
  }

  // === COMANDOS ESPECÍFICOS DEL PROMPT ===

  /**
   * Implementa los comandos específicos mencionados en el prompt
   */
  async syncConversation(threadId: string): Promise<SyncResult> {
    console.log(`Ejecutando SYNC_CONVERSATION para thread: ${threadId}`);
    // Implementar sincronización específica
    throw new Error('No implementado - SYNC_CONVERSATION');
  }

  async bulkSync(dateRange: { from: Date; to: Date }): Promise<SyncResult[]> {
    console.log(`Ejecutando BULK_SYNC para rango: ${dateRange.from} - ${dateRange.to}`);
    // Implementar sincronización masiva
    throw new Error('No implementado - BULK_SYNC');
  }

  async validateHubSpotSync(contactId: string): Promise<boolean> {
    console.log(`Ejecutando VALIDATE_HUBSPOT para contacto: ${contactId}`);
    // Implementar validación de sincronización
    throw new Error('No implementado - VALIDATE_HUBSPOT');
  }

  async analyzeSentiment(threadId: string): Promise<{ sentiment: string; score: number }> {
    console.log(`Ejecutando ANALYZE_SENTIMENT para thread: ${threadId}`);
    // Implementar análisis de sentimiento detallado
    throw new Error('No implementado - ANALYZE_SENTIMENT');
  }
}

export default HubSpotAISyncService;