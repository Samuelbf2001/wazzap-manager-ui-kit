import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LiveConversation, LiveMessage, ConversationFilters, Agent, InboxStats } from '@/types/conversation';
import { InboxSidebar } from './inbox/InboxSidebar';
import { ConversationList } from './inbox/ConversationList';
import { ChatWindow } from './inbox/ChatWindow';

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
  const STORAGE_KEY = 'wazzap-live-inbox-conversations';
  
  // Estados
  const [conversations, setConversations] = useState<LiveConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<LiveConversation | null>(null);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [stats, setStats] = useState<InboxStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [filters, setFilters] = useState<ConversationFilters>(initialFilters || {});
  const [showAgentPanel, setShowAgentPanel] = useState(!isIframe);
  const [activeTab, setActiveTab] = useState('all');

  // Inicialización
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadConversations(),
        loadAgents(),
        loadStats()
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversations = async () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    let loadedConversations: LiveConversation[] = [];

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        loadedConversations = parsed.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          lastMessage: {
            ...conv.lastMessage,
            timestamp: new Date(conv.lastMessage.timestamp)
          }
        }));
      } catch (error) {
        console.error('Error cargando conversaciones:', error);
      }
    }

    // Datos de ejemplo si no hay nada guardado
    if (loadedConversations.length === 0) {
      loadedConversations = [
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
          assignedAgent: agentId || 'agent_1',
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
            status: 'delivered'
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
    }

    setConversations(loadedConversations);
    if (loadedConversations.length > 0) {
      setSelectedConversation(loadedConversations[0]);
    }
  };

  const loadMessages = async (conversationId: string) => {
    const defaultMessages = [
      {
        id: 'msg_1',
        conversationId: '1',
        type: 'text' as const,
        content: 'Hola, necesito ayuda con mi pedido #12345',
        sender: {
          id: 'contact_1',
          name: 'María García',
          type: 'customer' as const,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
        },
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        status: 'delivered' as const
      },
      {
        id: 'msg_2',
        conversationId: '1',
        type: 'text' as const,
        content: 'Hola María, lamento escuchar sobre los inconvenientes. Voy a revisar tu pedido.',
        sender: {
          id: 'agent_1',
          name: 'Agente IA',
          type: 'agent' as const,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Agent1'
        },
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        status: 'delivered' as const
      }
    ];

    setMessages(defaultMessages.filter(m => m.conversationId === conversationId));
  };

  const loadAgents = async () => {
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
  };

  const loadStats = async () => {
    setStats({
      totalConversations: 25,
      activeConversations: 8,
      waitingConversations: 3,
      resolvedToday: 12,
      averageResponseTime: 2.5,
      firstResponseTime: 1.2,
      agentUtilization: 75,
      customerSatisfaction: 4.8
    });
  };

  const handleConversationSelect = (conversation: LiveConversation) => {
    setSelectedConversation(conversation);
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

    setMessages(prev => [...prev, newMessage]);
    setConversations(prev =>
      prev.map(c =>
        c.id === selectedConversation.id
          ? { ...c, lastMessage: newMessage, updatedAt: new Date() }
          : c
      )
    );

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );
      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje ha sido enviado correctamente",
      });
    } catch (error) {
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
      {!isIframe && stats && (
        <div className="border-b border-gray-200 bg-white px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Total: {stats.totalConversations}</span>
              <span>Activas: {stats.activeConversations}</span>
              <span>Esperando: {stats.waitingConversations}</span>
            </div>
            {currentAgent && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  currentAgent.status === 'online' ? 'bg-green-500' : 
                  currentAgent.status === 'busy' ? 'bg-yellow-500' : 
                  currentAgent.status === 'away' ? 'bg-orange-500' : 'bg-gray-500'
                }`} />
                <span className="text-sm font-medium">{currentAgent.name}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className={`${isIframe ? 'h-full' : 'h-[calc(100vh-4rem)]'}`}>
        <ResizablePanelGroup direction="horizontal">
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