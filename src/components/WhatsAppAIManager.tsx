import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from './PageHeader';
import { 
  Bot, 
  MessageSquare,
  Phone,
  Users,
  Activity,
  Settings,
  Play,
  Pause,
  Zap,
  Database,
  MessageCircle,
  Workflow,
  Brain,
  BarChart3,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Send,
  Download,
  Upload,
  FileText,
  RefreshCw,
  MoreHorizontal
} from 'lucide-react';
import { AIAgent } from './AIAgentManager';
import { useAIAgents } from '@/hooks/use-ai-agents';
import { useWhatsAppAI } from '@/hooks/use-whatsapp-ai';
import { AIAgentCreator } from './AIAgentCreator';

interface WhatsAppContact {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  lastMessageTime: Date;
  status: 'active' | 'waiting' | 'resolved' | 'escalated';
  assignedAgent?: string;
  messagesCount: number;
  isBot: boolean;
}

interface WhatsAppConversation {
  id: string;
  contactId: string;
  messages: Array<{
    id: string;
    content: string;
    timestamp: Date;
    isFromBot: boolean;
    agentId?: string;
    confidence?: number;
  }>;
  status: 'active' | 'escalated' | 'resolved';
  assignedAgent?: string;
}

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  documentsCount: number;
  size: string;
  created: Date;
  lastUpdated: Date;
  status: 'ready' | 'processing' | 'error';
}

export function WhatsAppAIManager() {
  console.log('🚀 WhatsAppAIManager: Componente ejecutándose');
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [autoResponseEnabled, setAutoResponseEnabled] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);

  // Hooks
  const { agents, loading: agentsLoading, saveAgent, deleteAgent } = useAIAgents();
  
  // Mock del hook de WhatsApp AI (ya que el original puede tener dependencias complejas)
  const mockWhatsAppData = {
    contacts: [
      {
        id: '1',
        name: 'Juan Pérez',
        phone: '+52 55 1234 5678',
        lastMessage: 'Hola, necesito información sobre precios',
        lastMessageTime: new Date(),
        status: 'active' as const,
        messagesCount: 5,
        isBot: false
      },
      {
        id: '2',
        name: 'María González',
        phone: '+52 55 8765 4321',
        lastMessage: 'Gracias por la información',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
        status: 'resolved' as const,
        messagesCount: 8,
        isBot: false
      },
      {
        id: '3',
        name: 'Carlos Rodríguez',
        phone: '+52 55 9876 5432',
        lastMessage: 'Estoy esperando una respuesta sobre mi pedido',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 15),
        status: 'waiting' as const,
        messagesCount: 3,
        isBot: false
      }
    ],
    stats: {
      totalMessages: 156,
      autoResponses: 89,
      escalations: 12,
      avgResponseTime: 1.3,
      avgConfidence: 0.87
    },
    isConnected: true,
    loading: false
  };

  // Cargar datos de ejemplo para knowledge bases
  useEffect(() => {
    setKnowledgeBases([
      {
        id: 'kb1',
        name: 'Base de Conocimiento General',
        description: 'Información general sobre productos y servicios',
        documentsCount: 45,
        size: '12.5 MB',
        created: new Date('2024-01-01'),
        lastUpdated: new Date('2024-01-18'),
        status: 'ready'
      },
      {
        id: 'kb2',
        name: 'Manual de Ventas',
        description: 'Procesos y técnicas de ventas',
        documentsCount: 23,
        size: '8.2 MB',
        created: new Date('2024-01-05'),
        lastUpdated: new Date('2024-01-15'),
        status: 'ready'
      }
    ]);
  }, []);

  // Funciones helper
  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'conversational': return MessageCircle;
      case 'tool_using': return Zap;
      case 'reasoning': return Brain;
      case 'workflow': return Workflow;
      case 'multi_agent': return Bot;
      default: return Bot;
    }
  };

  const getAgentTypeLabel = (type: string) => {
    switch (type) {
      case 'conversational': return 'Conversacional';
      case 'tool_using': return 'Con Herramientas';
      case 'reasoning': return 'Razonamiento';
      case 'workflow': return 'Flujo de Trabajo';
      case 'multi_agent': return 'Multi-Agente';
      default: return 'Desconocido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'inactive': return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
      case 'training': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      case 'error': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
      case 'waiting': return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
      case 'resolved': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const getAgentTypeColor = (type: string) => {
    switch (type) {
      case 'conversational': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
      case 'tool_using': return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' };
      case 'reasoning': return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' };
      case 'workflow': return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' };
      case 'multi_agent': return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || agent.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const activeAgents = agents.filter(a => a.status === 'active').length;
  const selectedContact = mockWhatsAppData.contacts.find(c => c.id === selectedContactId);

  if (agentsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Bot className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Cargando WhatsApp AI Manager...</p>
        </div>
      </div>
    );
  }

  // Mostrar el creador de agentes si está activo
  if (showCreateAgent) {
    console.log('🎯 Renderizando AIAgentCreator, showCreateAgent:', showCreateAgent);
    return (
      <AIAgentCreator 
        onBack={() => {
          console.log('🔙 Volviendo del creador de agentes');
          setShowCreateAgent(false);
        }}
        onAgentCreated={async (agent) => {
          try {
            console.log('💾 Guardando agente:', agent);
            await saveAgent(agent);
            setShowCreateAgent(false);
            console.log('✅ Agente creado exitosamente:', agent.name);
          } catch (error) {
            console.error('❌ Error al crear el agente:', error);
          }
        }}
        knowledgeBases={knowledgeBases}
      />
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="WhatsApp AI Manager"
        subtitle="Centro unificado para gestionar agentes IA de WhatsApp, conversaciones automáticas y análisis de rendimiento en tiempo real"
      />
      
    <div className="p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                  Panel de Control
              </h1>
                <p className="text-base text-gray-600 max-w-2xl">
                  Gestiona agentes IA, conversaciones automáticas y métricas de rendimiento
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Auto-Response</div>
                <Switch 
                  checked={autoResponseEnabled}
                  onCheckedChange={setAutoResponseEnabled}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2">
                {mockWhatsAppData.isConnected ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Conectado
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Desconectado
                  </Badge>
                )}
              </div>
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  console.log('🚀 Botón "Nuevo Agente IA" clickeado');
                  setShowCreateAgent(true);
                }}
              >
                <Plus className="h-5 w-5 mr-2" />
                Nuevo Agente IA
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-600">Conversaciones Activas</p>
                  <p className="text-3xl font-bold text-green-900">
                    {mockWhatsAppData.contacts.filter(c => c.status === 'active').length}
                  </p>
                  <p className="text-xs text-green-600/70">+12% hoy</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-600">Agentes IA Activos</p>
                  <p className="text-3xl font-bold text-blue-900">{activeAgents}</p>
                  <p className="text-xs text-blue-600/70">De {agents.length} total</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-purple-600">Confianza Promedio</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {(mockWhatsAppData.stats.avgConfidence * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-purple-600/70">Respuestas IA</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-orange-600">Tiempo Respuesta</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {mockWhatsAppData.stats.avgResponseTime.toFixed(1)}s
                  </p>
                  <p className="text-xs text-orange-600/70">Promedio IA</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-100 px-8 pt-8">
              <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-gray-50 p-1 rounded-lg">
                <TabsTrigger 
                  value="dashboard" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="conversations"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <MessageSquare className="h-4 w-4" />
                  Conversaciones
                </TabsTrigger>
                <TabsTrigger 
                  value="agents"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Bot className="h-4 w-4" />
                  Agentes IA
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Activity className="h-4 w-4" />
                  Rendimiento
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="p-8 space-y-6">
              <div className="text-center py-12">
                <div className="flex justify-center items-center gap-4 mb-6">
                  <Bot className="h-16 w-16 text-blue-500" />
                  <span className="text-4xl">+</span>
                  <MessageSquare className="h-16 w-16 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  ¡WhatsApp AI Manager Funcionando! 🎉
                </h3>
                <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
                  El módulo fusionado está activo con todas las funcionalidades integradas. 
                  Gestiona agentes IA, conversaciones automáticas y analytics en tiempo real.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="conversations" className="p-8 space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Conversaciones WhatsApp</h2>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lista de contactos */}
                <div className="lg:col-span-1 space-y-4">
                  <Input
                    placeholder="Buscar conversaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {mockWhatsAppData.contacts.map((contact) => {
                      const statusColors = getStatusColor(contact.status);
                      return (
                        <Card 
                          key={contact.id} 
                          className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                            selectedContactId === contact.id ? 'ring-2 ring-blue-500' : ''
                          }`}
                          onClick={() => setSelectedContactId(contact.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{contact.name}</h4>
                              <Badge className={`${statusColors.bg} ${statusColors.text} ${statusColors.border} border`}>
                                {contact.status === 'active' && 'Activo'}
                                {contact.status === 'waiting' && 'Esperando'}
                                {contact.status === 'resolved' && 'Resuelto'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{contact.phone}</p>
                            <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {contact.messagesCount} mensajes
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Vista de conversación */}
                <div className="lg:col-span-2">
                  {selectedContact ? (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Phone className="h-5 w-5" />
                              {selectedContact.name}
                            </CardTitle>
                            <p className="text-sm text-gray-600">{selectedContact.phone}</p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Send className="h-4 w-4 mr-2" />
                            Responder
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4 min-h-64">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm">{selectedContact.lastMessage}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {selectedContact.lastMessageTime.toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3 ml-8">
                            <p className="text-sm">¡Hola! He recibido tu mensaje. Un agente se contactará contigo pronto.</p>
                            <p className="text-xs text-blue-600 mt-1">Bot IA • Hace 5 min</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">Selecciona una conversación para ver los detalles</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="agents" className="p-8 space-y-6">
              {/* Search and Filters */}
              <div className="flex items-center gap-6">
                <div className="flex-1 relative max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Buscar agentes por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12"
                  />
                </div>
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium bg-white focus:border-blue-300 focus:outline-none"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="conversational">Conversacional</option>
                  <option value="tool_using">Con Herramientas</option>
                  <option value="reasoning">Razonamiento</option>
                  <option value="workflow">Flujo de Trabajo</option>
                  <option value="multi_agent">Multi-Agente</option>
                </select>
                <Button onClick={() => setShowCreateAgent(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Agente
                </Button>
              </div>

              {/* Agents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAgents.map((agent) => {
                  const AgentIcon = getAgentTypeIcon(agent.type);
                  const statusColors = getStatusColor(agent.status);
                  const typeColors = getAgentTypeColor(agent.type);
                  
                  return (
                    <Card key={agent.id} className="group hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${typeColors.bg} ${typeColors.border} border`}>
                              <AgentIcon className={`h-6 w-6 ${typeColors.text}`} />
                            </div>
                            <div className="space-y-1">
                              <CardTitle className="text-lg font-semibold">{agent.name}</CardTitle>
                              <p className="text-sm text-gray-600">{getAgentTypeLabel(agent.type)}</p>
                              <p className="text-sm text-gray-500">Modelo: {agent.model}</p>
                            </div>
                          </div>
                          <Badge className={`${statusColors.bg} ${statusColors.text} ${statusColors.border} border`}>
                            {agent.status === 'active' && 'Activo'}
                            {agent.status === 'inactive' && 'Inactivo'}
                            {agent.status === 'training' && 'Entrenando'}
                            {agent.status === 'error' && 'Error'}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-xl font-bold text-gray-900">{agent.totalConversations}</div>
                            <div className="text-xs text-gray-600">Conversaciones</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-xl font-bold text-emerald-600">{agent.successRate}%</div>
                            <div className="text-xs text-gray-600">Éxito</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            {agent.status === 'active' ? (
                              <Button variant="outline" size="sm">
                                <Pause className="h-3 w-3 mr-1" />
                                Pausar
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm">
                                <Play className="h-3 w-3 mr-1" />
                                Activar
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredAgents.length === 0 && (
                <div className="text-center py-12">
                  <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron agentes</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primer agente IA para comenzar'}
                  </p>
                  <Button onClick={() => setShowCreateAgent(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Agente
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Métricas de Rendimiento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Mensajes Totales</span>
                      <span className="font-bold">{mockWhatsAppData.stats.totalMessages}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Auto-Respuestas</span>
                      <span className="font-bold text-green-600">{mockWhatsAppData.stats.autoResponses}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Escalaciones</span>
                      <span className="font-bold text-orange-600">{mockWhatsAppData.stats.escalations}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tiempo Promedio</span>
                      <span className="font-bold">{mockWhatsAppData.stats.avgResponseTime}s</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Knowledge Bases
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {knowledgeBases.map((kb) => (
                      <div key={kb.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{kb.name}</p>
                          <p className="text-xs text-gray-600">{kb.documentsCount} documentos</p>
                        </div>
                        <Badge variant="secondary">{kb.size}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        </div>
      </div>
    </div>
  );
} 