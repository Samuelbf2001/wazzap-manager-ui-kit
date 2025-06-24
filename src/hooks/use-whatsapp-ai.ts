import { useState, useEffect, useCallback } from 'react';
import { AIAgent } from '@/components/AIAgentManager';
import WhatsAppAIIntegrationService from '@/services/whatsapp-ai-integration.service';
import HubSpotService from '@/services/hubspot.service';

interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'document' | 'audio' | 'video';
  isFromBot: boolean;
  agentId?: string;
  confidence?: number;
}

interface WhatsAppContact {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  lastMessageTime: Date;
  status: 'active' | 'waiting' | 'resolved';
  assignedAgent?: string;
  messagesCount: number;
  isBot: boolean;
}

interface AutoResponseStats {
  totalMessages: number;
  autoResponses: number;
  escalations: number;
  avgResponseTime: number;
  avgConfidence: number;
}

export function useWhatsAppAI() {
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [stats, setStats] = useState<AutoResponseStats>({
    totalMessages: 0,
    autoResponses: 0,
    escalations: 0,
    avgResponseTime: 0,
    avgConfidence: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Configuración de integración
  const [integrationService, setIntegrationService] = useState<WhatsAppAIIntegrationService | null>(null);

  // Inicializar servicios
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Configurar HubSpot
        const hubspotService = new HubSpotService({
          oauth: {
            clientId: process.env.REACT_APP_HUBSPOT_CLIENT_ID || '',
            clientSecret: process.env.REACT_APP_HUBSPOT_CLIENT_SECRET || '',
            redirectUri: `${window.location.origin}/hubspot/callback`,
            scopes: [
              'crm.objects.contacts.read',
              'crm.objects.contacts.write',
              'crm.objects.companies.read',
              'crm.objects.companies.write'
            ]
          }
        });

        // Configurar auto-response
        const autoResponseConfig = {
          enabled: true,
          workingHours: {
            start: '09:00',
            end: '18:00',
            timezone: 'America/Mexico_City',
            workDays: [1, 2, 3, 4, 5]
          },
          escalationRules: {
            lowConfidenceThreshold: 0.7,
            maxAutoResponses: 3,
            complexityThreshold: 0.8
          },
          fallbackMessages: {
            outOfHours: '¡Hola! Nuestro horario de atención es de 9:00 AM a 6:00 PM. Te responderemos pronto.',
            highComplexity: 'Tu consulta requiere atención especializada. Un agente se contactará contigo.',
            noAgentAvailable: 'Todos nuestros agentes están ocupados. Te responderemos en breve.',
            maxRetriesReached: 'Un agente humano se contactará contigo para ayudarte mejor.'
          }
        };

        const service = new WhatsAppAIIntegrationService(hubspotService, autoResponseConfig);
        setIntegrationService(service);
        setIsConnected(true);
        
      } catch (error) {
        console.error('Error inicializando servicios:', error);
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };

    initializeServices();
  }, []);

  // Registrar agente IA
  const registerAgent = useCallback((agent: AIAgent) => {
    if (integrationService) {
      integrationService.registerAgent(agent);
    }
  }, [integrationService]);

  // Procesar mensaje entrante
  const processIncomingMessage = useCallback(async (message: Omit<WhatsAppMessage, 'id' | 'timestamp' | 'isFromBot'>) => {
    if (!integrationService) return null;

    const incomingMessage = {
      id: Date.now().toString(),
      from: message.from,
      to: message.to,
      content: message.content,
      timestamp: new Date(),
      type: message.type
    };

    try {
      const response = await integrationService.processIncomingMessage(incomingMessage);
      
      // Actualizar mensajes
      const newMessage: WhatsAppMessage = {
        ...incomingMessage,
        isFromBot: false
      };

      setMessages(prev => [...prev, newMessage]);

      // Si hay respuesta del bot, agregarla
      if (response) {
        const botMessage: WhatsAppMessage = {
          id: (Date.now() + 1).toString(),
          from: incomingMessage.to,
          to: incomingMessage.from,
          content: response.response,
          timestamp: new Date(),
          type: 'text',
          isFromBot: true,
          agentId: response.agentId,
          confidence: response.confidence
        };

        setMessages(prev => [...prev, botMessage]);

        // Actualizar estadísticas
        setStats(prev => ({
          totalMessages: prev.totalMessages + 1,
          autoResponses: prev.autoResponses + (response.shouldEscalate ? 0 : 1),
          escalations: prev.escalations + (response.shouldEscalate ? 1 : 0),
          avgResponseTime: (prev.avgResponseTime + response.processingTime) / 2,
          avgConfidence: (prev.avgConfidence + response.confidence) / 2
        }));
      }

      // Actualizar contacto
      updateOrCreateContact(incomingMessage);

      return response;
      
    } catch (error) {
      console.error('Error procesando mensaje:', error);
      return null;
    }
  }, [integrationService]);

  // Actualizar o crear contacto
  const updateOrCreateContact = useCallback((message: any) => {
    setContacts(prev => {
      const existingIndex = prev.findIndex(c => c.phone === message.from);
      
      if (existingIndex >= 0) {
        // Actualizar contacto existente
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastMessage: message.content,
          lastMessageTime: message.timestamp,
          messagesCount: updated[existingIndex].messagesCount + 1,
          status: 'active'
        };
        return updated;
      } else {
        // Crear nuevo contacto
        const newContact: WhatsAppContact = {
          id: Date.now().toString(),
          name: `Contacto ${message.from.slice(-4)}`,
          phone: message.from,
          lastMessage: message.content,
          lastMessageTime: message.timestamp,
          status: 'active',
          messagesCount: 1,
          isBot: false
        };
        return [...prev, newContact];
      }
    });
  }, []);

  // Enviar mensaje manual
  const sendMessage = useCallback(async (to: string, content: string, agentId?: string) => {
    const message: WhatsAppMessage = {
      id: Date.now().toString(),
      from: 'system',
      to: to,
      content: content,
      timestamp: new Date(),
      type: 'text',
      isFromBot: true,
      agentId: agentId
    };

    setMessages(prev => [...prev, message]);

    // Aquí iría la integración real con WhatsApp Business API
    console.log('Enviando mensaje:', { to, content, agentId });
    
    return message;
  }, []);

  // Obtener conversación por contacto
  const getConversation = useCallback((contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return [];

    return messages.filter(m => 
      m.from === contact.phone || m.to === contact.phone
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [contacts, messages]);

  // Obtener métricas de agente específico
  const getAgentMetrics = useCallback((agentId: string) => {
    const agentMessages = messages.filter(m => m.agentId === agentId);
    
    if (agentMessages.length === 0) {
      return {
        totalMessages: 0,
        avgConfidence: 0,
        avgResponseTime: 0,
        escalationRate: 0
      };
    }

    const totalConfidence = agentMessages.reduce((sum, m) => sum + (m.confidence || 0), 0);
    const avgConfidence = totalConfidence / agentMessages.length;
    
    return {
      totalMessages: agentMessages.length,
      avgConfidence,
      avgResponseTime: 1.2, // Simulated
      escalationRate: 0.15 // Simulated
    };
  }, [messages]);

  // Datos de ejemplo para desarrollo
  useEffect(() => {
    if (!loading && contacts.length === 0) {
      setContacts([
        {
          id: '1',
          name: 'Juan Pérez',
          phone: '+52 1 55 1234 5678',
          lastMessage: '¿Cuáles son sus horarios de atención?',
          lastMessageTime: new Date(),
          status: 'active',
          assignedAgent: 'ai-agent-1',
          messagesCount: 3,
          isBot: false
        },
        {
          id: '2',
          name: 'María García',
          phone: '+52 1 55 9876 5432',
          lastMessage: 'Necesito información sobre precios',
          lastMessageTime: new Date(Date.now() - 30000),
          status: 'waiting',
          messagesCount: 1,
          isBot: false
        }
      ]);

      setStats({
        totalMessages: 245,
        autoResponses: 198,
        escalations: 47,
        avgResponseTime: 1.2,
        avgConfidence: 0.82
      });
    }
  }, [loading, contacts.length]);

  return {
    // Estado
    contacts,
    messages,
    stats,
    isConnected,
    loading,
    
    // Acciones
    registerAgent,
    processIncomingMessage,
    sendMessage,
    getConversation,
    getAgentMetrics,
    
    // Utilidades
    updateOrCreateContact
  };
} 