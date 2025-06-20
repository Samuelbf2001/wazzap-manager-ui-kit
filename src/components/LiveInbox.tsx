import React, { useState, useEffect, useCallback } from 'react';
import { LiveConversation, LiveMessage, ConversationFilters, Agent, InboxStats } from '@/types/conversation';
import { ConversationList } from './inbox/ConversationList';
import { ChatWindow } from './inbox/ChatWindow';
import { InboxSidebar } from './inbox/InboxSidebar';
import { InboxHeader } from './inbox/InboxHeader';
import { AgentPanel } from './inbox/AgentPanel';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useToast } from '@/hooks/use-toast';

interface LiveInboxProps {
  isIframe?: boolean;
  agentId?: string;
  hubspotContactId?: string;
  initialFilters?: ConversationFilters;
}

export function LiveInbox({ 
  isIframe = false, 
  agentId, 
  hubspotContactId, 
  initialFilters 
}: LiveInboxProps) {
  const { toast } = useToast();
  
  // Estados principales
  const [conversations, setConversations] = useState<LiveConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<LiveConversation | null>(null);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [filters, setFilters] = useState<ConversationFilters>(initialFilters || {});
  const [stats, setStats] = useState<InboxStats | null>(null);
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [showAgentPanel, setShowAgentPanel] = useState(!isIframe);
  const [activeTab, setActiveTab] = useState('all');

  // Simular datos de ejemplo para desarrollo
  const mockConversations: LiveConversation[] = [
    {
      id: '1',
      contactId: 'contact_1',
      phoneNumber: '+1234567890',
      contactName: 'María García',
      contactAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      status: 'active',
      priority: 'high',
      assignedAgent: agentId || 'agent_1',
      lastMessage: {
        id: 'msg_1',
        conversationId: '1',
        type: 'text',
        content: 'Hola, necesito ayuda con mi pedido',
        sender: {
          id: 'contact_1',
          name: 'María García',
          type: 'customer',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
        },
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        status: 'delivered'
      },
      unreadCount: 2,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 60 * 1000),
      tags: ['support', 'urgent'],
      metadata: {
        source: 'whatsapp',
        language: 'es',
        hubspotContactId: hubspotContactId || 'hs_contact_1'
      }
    },
    {
      id: '2',
      contactId: 'contact_2',
      phoneNumber: '+0987654321',
      contactName: 'Juan Pérez',
      contactAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan',
      status: 'waiting',
      priority: 'medium',
      lastMessage: {
        id: 'msg_2',
        conversationId: '2',
        type: 'text',
        content: '¿Cuándo llegará mi envío?',
        sender: {
          id: 'contact_2',
          name: 'Juan Pérez',
          type: 'customer',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan'
        },
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        status: 'read'
      },
      unreadCount: 1,
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 15 * 60 * 1000),
      tags: ['shipping'],
      metadata: {
        source: 'telegram',
        language: 'es'
      }
    }
  ];

  const mockMessages: LiveMessage[] = [
    {
      id: 'msg_1',
      conversationId: '1',
      type: 'text',
      content: 'Hola, necesito ayuda con mi pedido #12345',
      sender: {
        id: 'contact_1',
        name: 'María García',
        type: 'customer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
      },
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      status: 'delivered'
    },
    {
      id: 'msg_2',
      conversationId: '1',
      type: 'text',
      content: 'No he recibido el producto y ya pasaron 5 días',
      sender: {
        id: 'contact_1',
        name: 'María García',
        type: 'customer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
      },
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: 'delivered'
    }
  ];

  const mockStats: InboxStats = {
    totalConversations: 25,
    activeConversations: 8,
    waitingConversations: 3,
    resolvedToday: 12,
    averageResponseTime: 2.5,
    firstResponseTime: 1.2,
    agentUtilization: 75,
    customerSatisfaction: 4.8
  };

  // Efectos
  useEffect(() => {
    loadConversations();
    loadAgents();
    loadStats();
    
    if (hubspotContactId) {
      // Filtrar por contacto específico de HubSpot
      setFilters(prev => ({ ...prev, searchQuery: hubspotContactId }));
    }
  }, [hubspotContactId]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  // Funciones de carga
  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Conectar con API real
      await new Promise(resolve => setTimeout(resolve, 500));
      setConversations(mockConversations);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las conversaciones",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadMessages = async (conversationId: string) => {
    try {
      // TODO: Conectar con API real
      setMessages(mockMessages.filter(msg => msg.conversationId === conversationId));
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes",
        variant: "destructive"
      });
    }
  };

  const loadAgents = async () => {
    try {
      // TODO: Conectar con API real
      const mockAgents: Agent[] = [
        {
          id: 'agent_1',
          name: 'Ana Martínez',
          email: 'ana@empresa.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
          status: 'online',
          activeConversations: 3,
          maxConversations: 5,
          skills: ['Spanish', 'Customer Support'],
          languages: ['es', 'en'],
          lastActivity: new Date()
        }
      ];
      setAgents(mockAgents);
      setCurrentAgent(mockAgents[0]);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const loadStats = async () => {
    try {
      // TODO: Conectar con API real
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Handlers
  const handleConversationSelect = (conversation: LiveConversation) => {
    setSelectedConversation(conversation);
    // Marcar como leída
    if (conversation.unreadCount > 0) {
      setConversations(prev => 
        prev.map(c => 
          c.id === conversation.id 
            ? { ...c, unreadCount: 0 }
            : c
        )
      );
    }
  };

  const handleSendMessage = async (content: string, type: LiveMessage['type'] = 'text') => {
    if (!selectedConversation || !currentAgent) return;

    const newMessage: LiveMessage = {
      id: `msg_${Date.now()}`,
      conversationId: selectedConversation.id,
      type,
      content,
      sender: {
        id: currentAgent.id,
        name: currentAgent.name,
        type: 'agent',
        avatar: currentAgent.avatar
      },
      timestamp: new Date(),
      status: 'sending'
    };

    // Agregar mensaje optimísticamente
    setMessages(prev => [...prev, newMessage]);

    // Actualizar última actividad de la conversación
    setConversations(prev =>
      prev.map(c =>
        c.id === selectedConversation.id
          ? { ...c, lastMessage: newMessage, updatedAt: new Date() }
          : c
      )
    );

    try {
      // TODO: Enviar a API real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar estado del mensaje
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id
            ? { ...msg, status: 'sent' }
            : msg
        )
      );

      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje ha sido enviado correctamente",
      });
    } catch (error) {
      // Revertir en caso de error
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
      
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive"
      });
    }
  };

  const handleFilterChange = (newFilters: ConversationFilters) => {
    setFilters(newFilters);
    // TODO: Aplicar filtros y recargar conversaciones
  };

  const filteredConversations = conversations.filter(conversation => {
    if (filters.status && conversation.status !== filters.status) return false;
    if (filters.assignedAgent && conversation.assignedAgent !== filters.assignedAgent) return false;
    if (filters.unreadOnly && conversation.unreadCount === 0) return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        conversation.contactName?.toLowerCase().includes(query) ||
        conversation.phoneNumber.includes(query) ||
        conversation.lastMessage.content.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className={`h-screen bg-gray-50 ${isIframe ? 'rounded-lg overflow-hidden' : ''}`}>
      {!isIframe && (
        <InboxHeader 
          stats={stats}
          currentAgent={currentAgent}
          onAgentStatusChange={(status) => {
            if (currentAgent) {
              setCurrentAgent({ ...currentAgent, status });
            }
          }}
        />
      )}
      
      <div className={`${isIframe ? 'h-full' : 'h-[calc(100vh-4rem)]'}`}>
        <ResizablePanelGroup direction="horizontal">
          {/* Sidebar */}
          {!isIframe && showAgentPanel && (
            <>
              <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
                <InboxSidebar 
                  agents={agents}
                  currentAgent={currentAgent}
                  stats={stats}
                  onFilterChange={handleFilterChange}
                />
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}

          {/* Lista de conversaciones */}
          <ResizablePanel defaultSize={isIframe ? 40 : 30} minSize={25} maxSize={50}>
            <Card className="h-full rounded-none border-r">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">Todas ({conversations.length})</TabsTrigger>
                  <TabsTrigger value="active">
                    Activas ({conversations.filter(c => c.status === 'active').length})
                  </TabsTrigger>
                  <TabsTrigger value="waiting">
                    Esperando ({conversations.filter(c => c.status === 'waiting').length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab} className="h-[calc(100%-3rem)] mt-0">
                  <ConversationList
                    conversations={filteredConversations}
                    selectedConversation={selectedConversation}
                    onConversationSelect={handleConversationSelect}
                    isLoading={isLoading}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                  />
                </TabsContent>
              </Tabs>
            </Card>
          </ResizablePanel>

          <ResizableHandle />

          {/* Ventana de chat */}
          <ResizablePanel defaultSize={isIframe ? 60 : 50}>
            <ChatWindow
              conversation={selectedConversation}
              messages={messages}
              currentAgent={currentAgent}
              onSendMessage={handleSendMessage}
              isConnected={isConnected}
              isIframe={isIframe}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
} 