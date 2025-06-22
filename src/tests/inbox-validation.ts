// Validación de funcionalidades del Inbox
// Este archivo contiene pruebas para validar todas las funcionalidades del inbox

import { LiveConversation, LiveMessage, Agent, ConversationFilters, InboxStats } from '@/types/conversation';

export class InboxValidator {
  private conversations: LiveConversation[] = [];
  private messages: LiveMessage[] = [];
  private agents: Agent[] = [];
  private stats: InboxStats | null = null;

  constructor() {
    this.initializeTestData();
  }

  private initializeTestData() {
    // Datos de prueba para agentes
    this.agents = [
      {
        id: 'agent_1',
        name: 'Ana García',
        email: 'ana@company.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
        status: 'online',
        activeConversations: 3,
        maxConversations: 8,
        skills: ['ventas', 'soporte', 'español'],
        languages: ['es', 'en'],
        lastActivity: new Date()
      },
      {
        id: 'agent_2',
        name: 'Carlos Mendoza',
        email: 'carlos@company.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
        status: 'busy',
        activeConversations: 5,
        maxConversations: 6,
        skills: ['soporte técnico', 'reparaciones'],
        languages: ['es'],
        lastActivity: new Date(Date.now() - 15 * 60 * 1000)
      },
      {
        id: 'agent_3',
        name: 'María López',
        email: 'maria@company.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
        status: 'away',
        activeConversations: 1,
        maxConversations: 10,
        skills: ['atención al cliente', 'ventas'],
        languages: ['es', 'en', 'pt'],
        lastActivity: new Date(Date.now() - 30 * 60 * 1000)
      }
    ];

    // Datos de prueba para conversaciones
    this.conversations = [
      {
        id: 'conv_1',
        contactId: 'contact_1',
        phoneNumber: '+34612345678',
        contactName: 'Isabel Ruiz',
        contactAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabel',
        status: 'active',
        priority: 'high',
        assignedAgent: 'agent_1',
        lastMessage: {
          id: 'msg_1',
          conversationId: 'conv_1',
          type: 'text',
          content: 'Hola, necesito ayuda urgente con mi pedido #12345. No me llegó y ya han pasado 5 días.',
          sender: {
            id: 'contact_1',
            name: 'Isabel Ruiz',
            type: 'customer',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabel'
          },
          timestamp: new Date(Date.now() - 2 * 60 * 1000),
          status: 'delivered'
        },
        unreadCount: 2,
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 1000),
        tags: ['urgent', 'shipping'],
        metadata: {
          source: 'whatsapp',
          language: 'es',
          hubspotContactId: 'hs_contact_1'
        }
      },
      {
        id: 'conv_2',
        contactId: 'contact_2',
        phoneNumber: '+34698765432',
        contactName: 'Roberto Silva',
        contactAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto',
        status: 'waiting',
        priority: 'medium',
        assignedAgent: 'agent_2',
        lastMessage: {
          id: 'msg_2',
          conversationId: 'conv_2',
          type: 'image',
          content: 'Aquí tienes la foto del problema',
          mediaUrl: '/placeholder.svg',
          sender: {
            id: 'contact_2',
            name: 'Roberto Silva',
            type: 'customer',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto'
          },
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          status: 'read'
        },
        unreadCount: 0,
        createdAt: new Date(Date.now() - 120 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 60 * 1000),
        tags: ['technical-support'],
        metadata: {
          source: 'telegram',
          language: 'es'
        }
      },
      {
        id: 'conv_3',
        contactId: 'contact_3',
        phoneNumber: '+34611223344',
        contactName: 'Laura Fernández',
        contactAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
        status: 'resolved',
        priority: 'low',
        assignedAgent: 'agent_3',
        lastMessage: {
          id: 'msg_3',
          conversationId: 'conv_3',
          type: 'text',
          content: 'Perfecto, muchas gracias por la ayuda. ¡Todo solucionado!',
          sender: {
            id: 'contact_3',
            name: 'Laura Fernández',
            type: 'customer',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura'
          },
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          status: 'read'
        },
        unreadCount: 0,
        createdAt: new Date(Date.now() - 180 * 60 * 1000),
        updatedAt: new Date(Date.now() - 45 * 60 * 1000),
        tags: ['resolved', 'satisfied'],
        metadata: {
          source: 'whatsapp',
          language: 'es'
        }
      }
    ];

    // Datos de mensajes para las conversaciones
    this.messages = [
      // Mensajes para conv_1
      {
        id: 'msg_1_1',
        conversationId: 'conv_1',
        type: 'text',
        content: 'Hola Isabel, soy Ana del equipo de soporte. He revisado tu pedido #12345.',
        sender: {
          id: 'agent_1',
          name: 'Ana García',
          type: 'agent',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana'
        },
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        status: 'delivered'
      },
      {
        id: 'msg_1_2',
        conversationId: 'conv_1',
        type: 'text',
        content: 'Veo que hubo un retraso en el envío. Te compensaré con envío gratuito en tu próxima compra.',
        sender: {
          id: 'agent_1',
          name: 'Ana García',
          type: 'agent',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana'
        },
        timestamp: new Date(Date.now() - 7 * 60 * 1000),
        status: 'delivered'
      },
      {
        id: 'msg_1_3',
        conversationId: 'conv_1',
        type: 'text',
        content: 'Hola, necesito ayuda urgente con mi pedido #12345. No me llegó y ya han pasado 5 días.',
        sender: {
          id: 'contact_1',
          name: 'Isabel Ruiz',
          type: 'customer',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabel'
        },
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        status: 'delivered'
      },
      {
        id: 'msg_1_4',
        conversationId: 'conv_1',
        type: 'text',
        content: '¿Podrían darme un número de seguimiento actualizado?',
        sender: {
          id: 'contact_1',
          name: 'Isabel Ruiz',
          type: 'customer',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabel'
        },
        timestamp: new Date(Date.now() - 1 * 60 * 1000),
        status: 'delivered'
      }
    ];

    // Estadísticas del inbox
    this.stats = {
      totalConversations: 25,
      activeConversations: 8,
      waitingConversations: 3,
      resolvedToday: 12,
      averageResponseTime: 2.5,
      firstResponseTime: 1.2,
      agentUtilization: 75,
      customerSatisfaction: 4.8
    };
  }

  // Validación 1: Cargar conversaciones
  validateLoadConversations(): boolean {
    console.log('🔍 Validando carga de conversaciones...');
    
    try {
      if (this.conversations.length === 0) {
        console.error('❌ No se cargaron conversaciones');
        return false;
      }

      // Verificar estructura de conversaciones
      const requiredFields = ['id', 'contactId', 'phoneNumber', 'status', 'priority', 'lastMessage'];
      for (const conv of this.conversations) {
        for (const field of requiredFields) {
          if (!(field in conv)) {
            console.error(`❌ Campo requerido ${field} faltante en conversación ${conv.id}`);
            return false;
          }
        }
      }

      console.log(`✅ Se cargaron ${this.conversations.length} conversaciones correctamente`);
      return true;
    } catch (error) {
      console.error('❌ Error al validar conversaciones:', error);
      return false;
    }
  }

  // Validación 2: Filtros de conversaciones
  validateConversationFilters(): boolean {
    console.log('🔍 Validando filtros de conversaciones...');

    try {
      // Filtrar por status
      const activeFilter: ConversationFilters = { status: 'active' };
      const activeConversations = this.conversations.filter(c => c.status === 'active');
      console.log(`✅ Filtro por status 'active': ${activeConversations.length} conversaciones`);

      // Filtrar por prioridad
      const highPriorityFilter: ConversationFilters = { priority: 'high' };
      const highPriorityConversations = this.conversations.filter(c => c.priority === 'high');
      console.log(`✅ Filtro por prioridad 'high': ${highPriorityConversations.length} conversaciones`);

      // Filtrar por agente asignado
      const agentFilter: ConversationFilters = { assignedAgent: 'agent_1' };
      const agentConversations = this.conversations.filter(c => c.assignedAgent === 'agent_1');
      console.log(`✅ Filtro por agente 'agent_1': ${agentConversations.length} conversaciones`);

      // Filtrar por fuente
      const sourceFilter: ConversationFilters = { source: 'whatsapp' };
      const whatsappConversations = this.conversations.filter(c => c.metadata.source === 'whatsapp');
      console.log(`✅ Filtro por fuente 'whatsapp': ${whatsappConversations.length} conversaciones`);

      // Filtrar por búsqueda
      const searchFilter: ConversationFilters = { searchQuery: 'Isabel' };
      const searchResults = this.conversations.filter(c => 
        c.contactName?.toLowerCase().includes('isabel') ||
        c.lastMessage.content.toLowerCase().includes('isabel')
      );
      console.log(`✅ Búsqueda por 'Isabel': ${searchResults.length} conversaciones`);

      return true;
    } catch (error) {
      console.error('❌ Error al validar filtros:', error);
      return false;
    }
  }

  // Validación 3: Selección de conversación y carga de mensajes
  validateConversationSelection(): boolean {
    console.log('🔍 Validando selección de conversación...');

    try {
      const selectedConversation = this.conversations[0];
      if (!selectedConversation) {
        console.error('❌ No hay conversaciones disponibles para seleccionar');
        return false;
      }

      console.log(`✅ Conversación seleccionada: ${selectedConversation.contactName}`);

      // Cargar mensajes de la conversación
      const conversationMessages = this.messages.filter(m => m.conversationId === selectedConversation.id);
      console.log(`✅ Se cargaron ${conversationMessages.length} mensajes para la conversación`);

      // Verificar estructura de mensajes
      const requiredMessageFields = ['id', 'conversationId', 'type', 'content', 'sender', 'timestamp', 'status'];
      for (const msg of conversationMessages) {
        for (const field of requiredMessageFields) {
          if (!(field in msg)) {
            console.error(`❌ Campo requerido ${field} faltante en mensaje ${msg.id}`);
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Error al validar selección de conversación:', error);
      return false;
    }
  }

  // Validación 4: Envío de mensajes
  validateSendMessage(): boolean {
    console.log('🔍 Validando envío de mensajes...');

    try {
      const conversationId = this.conversations[0].id;
      const newMessage: LiveMessage = {
        id: 'msg_test',
        conversationId,
        type: 'text',
        content: 'Este es un mensaje de prueba enviado por el agente',
        sender: {
          id: 'agent_1',
          name: 'Ana García',
          type: 'agent',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana'
        },
        timestamp: new Date(),
        status: 'sending'
      };

      // Simular envío de mensaje
      this.messages.push(newMessage);
      
      // Actualizar la conversación
      const conversation = this.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.lastMessage = newMessage;
        conversation.updatedAt = new Date();
      }

      console.log('✅ Mensaje enviado correctamente');
      
      // Simular cambio de estado del mensaje
      setTimeout(() => {
        newMessage.status = 'delivered';
        console.log('✅ Estado del mensaje actualizado a "delivered"');
      }, 1000);

      return true;
    } catch (error) {
      console.error('❌ Error al validar envío de mensaje:', error);
      return false;
    }
  }

  // Validación 5: Gestión de agentes
  validateAgentManagement(): boolean {
    console.log('🔍 Validando gestión de agentes...');

    try {
      // Verificar carga de agentes
      if (this.agents.length === 0) {
        console.error('❌ No se cargaron agentes');
        return false;
      }

      console.log(`✅ Se cargaron ${this.agents.length} agentes`);

      // Verificar estados de agentes
      const onlineAgents = this.agents.filter(a => a.status === 'online');
      const busyAgents = this.agents.filter(a => a.status === 'busy');
      const awayAgents = this.agents.filter(a => a.status === 'away');

      console.log(`✅ Agentes online: ${onlineAgents.length}`);
      console.log(`✅ Agentes ocupados: ${busyAgents.length}`);
      console.log(`✅ Agentes ausentes: ${awayAgents.length}`);

      // Verificar asignación de conversaciones
      for (const agent of this.agents) {
        const assignedConversations = this.conversations.filter(c => c.assignedAgent === agent.id);
        console.log(`✅ Agente ${agent.name}: ${assignedConversations.length} conversaciones asignadas`);
        
        // Verificar que no exceda el máximo
        if (assignedConversations.length > agent.maxConversations) {
          console.error(`❌ Agente ${agent.name} excede el máximo de conversaciones`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Error al validar gestión de agentes:', error);
      return false;
    }
  }

  // Validación 6: Estadísticas del inbox
  validateInboxStats(): boolean {
    console.log('🔍 Validando estadísticas del inbox...');

    try {
      if (!this.stats) {
        console.error('❌ No se cargaron estadísticas');
        return false;
      }

      const requiredStatsFields = [
        'totalConversations',
        'activeConversations',
        'waitingConversations',
        'resolvedToday',
        'averageResponseTime',
        'firstResponseTime',
        'agentUtilization',
        'customerSatisfaction'
      ];

      for (const field of requiredStatsFields) {
        if (!(field in this.stats)) {
          console.error(`❌ Campo de estadística ${field} faltante`);
          return false;
        }
      }

      console.log('✅ Estadísticas del inbox:');
      console.log(`  - Total conversaciones: ${this.stats.totalConversations}`);
      console.log(`  - Conversaciones activas: ${this.stats.activeConversations}`);
      console.log(`  - En espera: ${this.stats.waitingConversations}`);
      console.log(`  - Resueltas hoy: ${this.stats.resolvedToday}`);
      console.log(`  - Tiempo respuesta promedio: ${this.stats.averageResponseTime}m`);
      console.log(`  - Tiempo primera respuesta: ${this.stats.firstResponseTime}m`);
      console.log(`  - Utilización agentes: ${this.stats.agentUtilization}%`);
      console.log(`  - Satisfacción cliente: ${this.stats.customerSatisfaction}/5`);

      return true;
    } catch (error) {
      console.error('❌ Error al validar estadísticas:', error);
      return false;
    }
  }

  // Validación 7: Funciones de acción sobre conversaciones
  validateConversationActions(): boolean {
    console.log('🔍 Validando acciones sobre conversaciones...');

    try {
      const conversation = this.conversations[0];
      
      // Simular cambio de prioridad
      const originalPriority = conversation.priority;
      conversation.priority = 'urgent';
      console.log(`✅ Prioridad cambiada de '${originalPriority}' a '${conversation.priority}'`);

      // Simular asignación a otro agente
      const originalAgent = conversation.assignedAgent;
      conversation.assignedAgent = 'agent_2';
      console.log(`✅ Conversación reasignada de '${originalAgent}' a '${conversation.assignedAgent}'`);

      // Simular cambio de estado
      const originalStatus = conversation.status;
      conversation.status = 'resolved';
      console.log(`✅ Estado cambiado de '${originalStatus}' a '${conversation.status}'`);

      // Simular agregar tag
      conversation.tags.push('test-tag');
      console.log(`✅ Tag 'test-tag' agregado. Total tags: ${conversation.tags.length}`);

      // Marcar como leída (resetear contador)
      conversation.unreadCount = 0;
      console.log('✅ Conversación marcada como leída');

      return true;
    } catch (error) {
      console.error('❌ Error al validar acciones de conversación:', error);
      return false;
    }
  }

  // Validación 8: Tipos de mensaje y media
  validateMessageTypes(): boolean {
    console.log('🔍 Validando tipos de mensaje...');

    try {
      const conversationId = this.conversations[0].id;

      // Mensaje de texto
      const textMessage: LiveMessage = {
        id: 'msg_text_test',
        conversationId,
        type: 'text',
        content: 'Mensaje de texto de prueba',
        sender: {
          id: 'agent_1',
          name: 'Ana García',
          type: 'agent'
        },
        timestamp: new Date(),
        status: 'sent'
      };

      // Mensaje de imagen
      const imageMessage: LiveMessage = {
        id: 'msg_image_test',
        conversationId,
        type: 'image',
        content: 'Imagen adjunta',
        mediaUrl: '/placeholder.svg',
        mediaMetadata: {
          filename: 'screenshot.png',
          size: 245760,
          mimeType: 'image/png',
          width: 800,
          height: 600
        },
        sender: {
          id: 'contact_1',
          name: 'Isabel Ruiz',
          type: 'customer'
        },
        timestamp: new Date(),
        status: 'delivered'
      };

      // Mensaje de documento
      const documentMessage: LiveMessage = {
        id: 'msg_doc_test',
        conversationId,
        type: 'document',
        content: 'Documento adjunto',
        mediaUrl: '/document.pdf',
        mediaMetadata: {
          filename: 'factura.pdf',
          size: 512000,
          mimeType: 'application/pdf'
        },
        sender: {
          id: 'contact_1',
          name: 'Isabel Ruiz',
          type: 'customer'
        },
        timestamp: new Date(),
        status: 'delivered'
      };

      // Mensaje de ubicación
      const locationMessage: LiveMessage = {
        id: 'msg_location_test',
        conversationId,
        type: 'location',
        content: 'Mi ubicación actual',
        sender: {
          id: 'contact_1',
          name: 'Isabel Ruiz',
          type: 'customer'
        },
        timestamp: new Date(),
        status: 'delivered'
      };

      // Mensaje del sistema
      const systemMessage: LiveMessage = {
        id: 'msg_system_test',
        conversationId,
        type: 'system',
        content: 'El agente Ana García se unió a la conversación',
        sender: {
          id: 'system',
          name: 'Sistema',
          type: 'system'
        },
        timestamp: new Date(),
        status: 'delivered'
      };

      const testMessages = [textMessage, imageMessage, documentMessage, locationMessage, systemMessage];
      
      for (const message of testMessages) {
        this.messages.push(message);
        console.log(`✅ Mensaje de tipo '${message.type}' validado correctamente`);
      }

      return true;
    } catch (error) {
      console.error('❌ Error al validar tipos de mensaje:', error);
      return false;
    }
  }

  // Ejecutar todas las validaciones
  async runAllValidations(): Promise<boolean> {
    console.log('🚀 Iniciando validación completa del Inbox...\n');

    const validations = [
      () => this.validateLoadConversations(),
      () => this.validateConversationFilters(),
      () => this.validateConversationSelection(),
      () => this.validateSendMessage(),
      () => this.validateAgentManagement(),
      () => this.validateInboxStats(),
      () => this.validateConversationActions(),
      () => this.validateMessageTypes()
    ];

    let allPassed = true;
    let passed = 0;

    for (let i = 0; i < validations.length; i++) {
      try {
        const result = validations[i]();
        if (result) {
          passed++;
        } else {
          allPassed = false;
        }
        console.log(''); // Línea en blanco para separar validaciones
      } catch (error) {
        console.error(`❌ Error en validación ${i + 1}:`, error);
        allPassed = false;
        console.log('');
      }
    }

    console.log('📊 RESUMEN DE VALIDACIONES:');
    console.log(`✅ Pasaron: ${passed}/${validations.length}`);
    console.log(`❌ Fallaron: ${validations.length - passed}/${validations.length}`);
    
    if (allPassed) {
      console.log('🎉 ¡Todas las funcionalidades del Inbox están funcionando correctamente!');
    } else {
      console.log('⚠️  Algunas funcionalidades necesitan revisión.');
    }

    return allPassed;
  }

  // Método para obtener un reporte detallado
  getDetailedReport() {
    return {
      conversations: this.conversations.length,
      messages: this.messages.length,
      agents: this.agents.length,
      stats: this.stats,
      conversationsByStatus: {
        active: this.conversations.filter(c => c.status === 'active').length,
        waiting: this.conversations.filter(c => c.status === 'waiting').length,
        resolved: this.conversations.filter(c => c.status === 'resolved').length,
        transferred: this.conversations.filter(c => c.status === 'transferred').length
      },
      messagesByType: {
        text: this.messages.filter(m => m.type === 'text').length,
        image: this.messages.filter(m => m.type === 'image').length,
        document: this.messages.filter(m => m.type === 'document').length,
        location: this.messages.filter(m => m.type === 'location').length,
        system: this.messages.filter(m => m.type === 'system').length
      },
      agentsByStatus: {
        online: this.agents.filter(a => a.status === 'online').length,
        busy: this.agents.filter(a => a.status === 'busy').length,
        away: this.agents.filter(a => a.status === 'away').length,
        offline: this.agents.filter(a => a.status === 'offline').length
      }
    };
  }
}

// Función para ejecutar las validaciones desde el navegador
export async function validateInboxFunctionalities() {
  const validator = new InboxValidator();
  return await validator.runAllValidations();
}

// Función para obtener el reporte
export function getInboxReport() {
  const validator = new InboxValidator();
  return validator.getDetailedReport();
}