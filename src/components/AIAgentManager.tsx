import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Plus, 
  Search, 
  Settings, 
  Database, 
  FileText, 
  Brain, 
  Zap,
  MessageCircle,
  Workflow,
  Upload,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  BarChart3,
  Filter,
  Download,
  RefreshCw,
  MoreHorizontal,
  Activity,
  Clock,
  TrendingUp,
  Users
} from 'lucide-react';
import { KnowledgeBaseManager } from './KnowledgeBaseManager';
import { AIAgentCreator } from './AIAgentCreator';
import { AgentAnalytics } from './AgentAnalytics';
import { StorageStatus } from './StorageStatus';
import { useAIAgents } from '@/hooks/use-ai-agents';

export interface AIAgent {
  id: string;
  name: string;
  type: 'conversational' | 'tool_using' | 'reasoning' | 'workflow' | 'multi_agent';
  status: 'active' | 'inactive' | 'training' | 'error';
  model: string;
  knowledgeBases: string[];
  created: Date;
  lastUsed: Date;
  totalConversations: number;
  avgResponseTime: number;
  successRate: number;
  // Campos extendidos para FlowBuilder
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: Array<{
    id: string;
    name: string;
    type: 'search' | 'database' | 'api' | 'calculator' | 'file' | 'webhook' | 'mcp' | 'hubspot' | 'custom';
    description: string;
    config: Record<string, any>;
    enabled: boolean;
  }>;
  useMemory?: boolean;
  memoryType?: 'conversation' | 'vector' | 'graph' | 'session';
  memorySize?: number;
  timeout?: number;
  maxIterations?: number;
  fallbackBehavior?: 'human_handoff' | 'default_response' | 'error';
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

export function AIAgentManager() {
  const [activeTab, setActiveTab] = useState('agents');
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);

  // Usar el hook de agentes
  const { agents, loading, saveAgent, deleteAgent } = useAIAgents();

  // Cargar datos de example para knowledge bases
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
      },
      {
        id: 'kb3',
        name: 'Documentación Técnica',
        description: 'Guías técnicas y solución de problemas',
        documentsCount: 67,
        size: '25.1 MB',
        created: new Date('2024-01-08'),
        lastUpdated: new Date('2024-01-20'),
        status: 'processing'
      }
    ]);
  }, []);

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
      case 'processing': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
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

  if (showCreateAgent) {
    return (
      <AIAgentCreator 
        onBack={() => setShowCreateAgent(false)}
        onAgentCreated={async (agent) => {
          try {
            await saveAgent(agent);
            setShowCreateAgent(false);
            console.log('Agente guardado exitosamente');
          } catch (error) {
            console.error('Error al guardar el agente:', error);
          }
        }}
        knowledgeBases={knowledgeBases}
      />
    );
  }

  if (showKnowledgeBase) {
    return (
      <KnowledgeBaseManager 
        onBack={() => setShowKnowledgeBase(false)}
        knowledgeBases={knowledgeBases}
        onKnowledgeBaseUpdated={(kbs) => setKnowledgeBases(kbs)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                Centro de Agentes IA
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Gestiona, entrena y despliega agentes de inteligencia artificial para automatizar 
                conversaciones y procesos de negocio
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => setShowKnowledgeBase(true)}
                variant="outline"
                size="lg"
                className="flex items-center gap-3 px-6 py-3 h-auto"
              >
                <Database className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Knowledge Base</div>
                  <div className="text-xs text-gray-500">Gestionar contenido</div>
                </div>
              </Button>
              <Button 
                onClick={() => setShowCreateAgent(true)}
                size="lg"
                className="flex items-center gap-3 px-6 py-3 h-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Crear Agente</div>
                  <div className="text-xs opacity-90">Nuevo agente IA</div>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-600">Total Agentes</p>
                  <p className="text-3xl font-bold text-blue-900">{agents.length}</p>
                  <p className="text-xs text-blue-600/70">+2 este mes</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-emerald-600">Agentes Activos</p>
                  <p className="text-3xl font-bold text-emerald-900">
                    {agents.filter(a => a.status === 'active').length}
                  </p>
                  <p className="text-xs text-emerald-600/70">85% del total</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Activity className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-purple-600">Knowledge Bases</p>
                  <p className="text-3xl font-bold text-purple-900">{knowledgeBases.length}</p>
                  <p className="text-xs text-purple-600/70">
                    {knowledgeBases.reduce((sum, kb) => sum + kb.documentsCount, 0)} documentos
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Database className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-orange-600">Conversaciones</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {(agents.reduce((sum, agent) => sum + agent.totalConversations, 0) / 1000).toFixed(1)}K
                  </p>
                  <p className="text-xs text-orange-600/70">+12% esta semana</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-100 px-8 pt-8">
              <TabsList className="grid w-full max-w-md grid-cols-3 bg-gray-50 p-1 rounded-lg">
                <TabsTrigger 
                  value="agents" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Bot className="h-4 w-4" />
                  Agentes IA
                </TabsTrigger>
                <TabsTrigger 
                  value="knowledge"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Database className="h-4 w-4" />
                  Knowledge Base
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="agents" className="p-8 space-y-6">
              {/* Search and Filters */}
              <div className="flex items-center gap-6">
                <div className="flex-1 relative max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Buscar agentes por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-base border-gray-200 focus:border-blue-300 rounded-xl"
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
                <Button variant="outline" className="h-12 px-4 rounded-xl border-gray-200">
                  <Filter className="h-5 w-5" />
                </Button>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <Bot className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600">Cargando agentes...</p>
                  </div>
                </div>
              )}

              {/* Agents Grid */}
              {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAgents.map((agent) => {
                  const AgentIcon = getAgentTypeIcon(agent.type);
                  const statusColors = getStatusColor(agent.status);
                  const typeColors = getAgentTypeColor(agent.type);
                  
                  return (
                    <Card key={agent.id} className="group hover:shadow-lg transition-all duration-300 border-gray-100 hover:border-gray-200 bg-white">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${typeColors.bg} ${typeColors.border} border`}>
                              <AgentIcon className={`h-6 w-6 ${typeColors.text}`} />
                            </div>
                            <div className="space-y-1">
                              <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {agent.name}
                              </CardTitle>
                              <p className="text-sm text-gray-600 font-medium">
                                {getAgentTypeLabel(agent.type)}
                              </p>
                              <p className="text-sm text-gray-500">
                                Modelo: {agent.model}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text} ${statusColors.border} border`}>
                              {agent.status === 'active' && 'Activo'}
                              {agent.status === 'inactive' && 'Inactivo'}
                              {agent.status === 'training' && 'Entrenando'}
                              {agent.status === 'error' && 'Error'}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0 space-y-6">
                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">
                              {agent.totalConversations.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600 mt-1 flex items-center justify-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              Conversaciones
                            </div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-emerald-600">
                              {agent.successRate}%
                            </div>
                            <div className="text-xs text-gray-600 mt-1 flex items-center justify-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Tasa de éxito
                            </div>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Tiempo respuesta
                            </span>
                            <span className="font-medium text-gray-900">{agent.avgResponseTime}s</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 flex items-center gap-2">
                              <Database className="h-4 w-4" />
                              Knowledge Bases
                            </span>
                            <span className="font-medium text-gray-900">{agent.knowledgeBases.length}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Último uso
                            </span>
                            <span className="font-medium text-gray-900">
                              {agent.lastUsed.toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            {agent.status === 'active' ? (
                              <Button variant="outline" size="sm" className="h-8 px-3 text-orange-600 border-orange-200 hover:bg-orange-50">
                                <Pause className="h-3 w-3 mr-1" />
                                Pausar
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" className="h-8 px-3 text-green-600 border-green-200 hover:bg-green-50">
                                <Play className="h-3 w-3 mr-1" />
                                Activar
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                </div>
              )}

              {!loading && filteredAgents.length === 0 && (
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

            <TabsContent value="knowledge" className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Bases de Conocimiento</h2>
                  <p className="text-gray-600 mt-1">Gestiona el contenido que alimenta a tus agentes IA</p>
                </div>
                <Button onClick={() => setShowKnowledgeBase(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Knowledge Base
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {knowledgeBases.map((kb) => {
                  const statusColors = getStatusColor(kb.status);
                  
                  return (
                    <Card key={kb.id} className="group hover:shadow-lg transition-all duration-300 border-gray-100 hover:border-gray-200">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                              <Database className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="space-y-1">
                              <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                {kb.name}
                              </CardTitle>
                              <p className="text-sm text-gray-600">
                                {kb.description}
                              </p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text} ${statusColors.border} border`}>
                            {kb.status === 'ready' && 'Listo'}
                            {kb.status === 'processing' && 'Procesando'}
                            {kb.status === 'error' && 'Error'}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">{kb.documentsCount}</div>
                            <div className="text-xs text-gray-600 mt-1 flex items-center justify-center gap-1">
                              <FileText className="h-3 w-3" />
                              Documentos
                            </div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{kb.size}</div>
                            <div className="text-xs text-gray-600 mt-1 flex items-center justify-center gap-1">
                              <Database className="h-3 w-3" />
                              Tamaño
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Creado</span>
                            <span className="font-medium text-gray-900">{kb.created.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Última actualización</span>
                            <span className="font-medium text-gray-900">{kb.lastUpdated.toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-purple-50">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-purple-50">
                              <Upload className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-purple-50">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-green-50">
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

                                     <TabsContent value="analytics" className="p-8">
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-3">
                  <AgentAnalytics agents={agents} />
                </div>
                <div className="xl:col-span-1">
                  <div className="space-y-4">
                    <StorageStatus />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}