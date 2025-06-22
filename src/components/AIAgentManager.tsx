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
  RefreshCw
} from 'lucide-react';
import { KnowledgeBaseManager } from './KnowledgeBaseManager';
import { AIAgentCreator } from './AIAgentCreator';
import { AgentAnalytics } from './AgentAnalytics';

interface AIAgent {
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
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);

  // Datos de ejemplo
  useEffect(() => {
    setAgents([
      {
        id: '1',
        name: 'Asistente de Ventas',
        type: 'conversational',
        status: 'active',
        model: 'GPT-4',
        knowledgeBases: ['kb1', 'kb2'],
        created: new Date('2024-01-15'),
        lastUsed: new Date('2024-01-20'),
        totalConversations: 1250,
        avgResponseTime: 2.3,
        successRate: 94.5
      },
      {
        id: '2',
        name: 'Soporte Técnico IA',
        type: 'tool_using',
        status: 'active',
        model: 'Claude-3',
        knowledgeBases: ['kb3'],
        created: new Date('2024-01-10'),
        lastUsed: new Date('2024-01-19'),
        totalConversations: 850,
        avgResponseTime: 3.1,
        successRate: 91.2
      },
      {
        id: '3',
        name: 'Analizador de Consultas',
        type: 'reasoning',
        status: 'training',
        model: 'GPT-4',
        knowledgeBases: ['kb1'],
        created: new Date('2024-01-18'),
        lastUsed: new Date('2024-01-18'),
        totalConversations: 45,
        avgResponseTime: 4.2,
        successRate: 87.8
      }
    ]);

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
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'training': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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
        onAgentCreated={(agent) => {
          setAgents(prev => [...prev, agent]);
          setShowCreateAgent(false);
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Agentes IA</h1>
          <p className="text-gray-600 mt-1">Crea, gestiona y monitorea tus agentes de inteligencia artificial</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowKnowledgeBase(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Knowledge Base
          </Button>
          <Button 
            onClick={() => setShowCreateAgent(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Crear Agente
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bot className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Agentes</p>
                <p className="text-2xl font-bold">{agents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Agentes Activos</p>
                <p className="text-2xl font-bold">{agents.filter(a => a.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Database className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Knowledge Bases</p>
                <p className="text-2xl font-bold">{knowledgeBases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MessageCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Conversaciones</p>
                <p className="text-2xl font-bold">
                  {agents.reduce((sum, agent) => sum + agent.totalConversations, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Agentes IA
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar agentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Todos los tipos</option>
              <option value="conversational">Conversacional</option>
              <option value="tool_using">Con Herramientas</option>
              <option value="reasoning">Razonamiento</option>
              <option value="workflow">Flujo de Trabajo</option>
              <option value="multi_agent">Multi-Agente</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent) => {
              const AgentIcon = getAgentTypeIcon(agent.type);
              return (
                <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <AgentIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-medium">{agent.name}</CardTitle>
                          <p className="text-xs text-gray-500">{getAgentTypeLabel(agent.type)}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status === 'active' && 'Activo'}
                        {agent.status === 'inactive' && 'Inactivo'}
                        {agent.status === 'training' && 'Entrenando'}
                        {agent.status === 'error' && 'Error'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-gray-500">Modelo</p>
                          <p className="font-medium">{agent.model}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Knowledge Bases</p>
                          <p className="font-medium">{agent.knowledgeBases.length}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-gray-500">Conversaciones</p>
                          <p className="font-medium">{agent.totalConversations.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Éxito</p>
                          <p className="font-medium">{agent.successRate}%</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-1">
                          {agent.status === 'active' ? (
                            <Button variant="ghost" size="sm">
                              <Pause className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm">
                              <Play className="h-3 w-3" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Bases de Conocimiento</h2>
            <Button onClick={() => setShowKnowledgeBase(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Knowledge Base
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {knowledgeBases.map((kb) => (
              <Card key={kb.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Database className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-medium">{kb.name}</CardTitle>
                        <p className="text-xs text-gray-500">{kb.description}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(kb.status)}>
                      {kb.status === 'ready' && 'Listo'}
                      {kb.status === 'processing' && 'Procesando'}
                      {kb.status === 'error' && 'Error'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-gray-500">Documentos</p>
                        <p className="font-medium">{kb.documentsCount}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Tamaño</p>
                        <p className="font-medium">{kb.size}</p>
                      </div>
                    </div>
                    
                    <div className="text-xs">
                      <p className="text-gray-500">Última actualización</p>
                      <p className="font-medium">{kb.lastUpdated.toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Upload className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AgentAnalytics agents={agents} />
        </TabsContent>
      </Tabs>
    </div>
  );
}