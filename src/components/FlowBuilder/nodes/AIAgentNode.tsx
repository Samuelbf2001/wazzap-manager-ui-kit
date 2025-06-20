import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Settings, 
  Plus, 
  Trash2, 
  X, 
  Brain,
  Zap,
  MessageCircle,
  Search,
  Database,
  Code,
  Globe,
  FileText,
  Calculator,
  Clock,
  Shield,
  Target,
  Workflow,
  GitBranch,
  Play
} from 'lucide-react';

interface AIAgentData {
  label: string;
  agentType: 'conversational' | 'tool_using' | 'reasoning' | 'workflow' | 'multi_agent';
  
  // Configuración del agente
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'claude-2' | 'custom';
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  
  // Herramientas disponibles
  tools: Array<{
    id: string;
    name: string;
    type: 'search' | 'database' | 'api' | 'calculator' | 'file' | 'webhook' | 'custom';
    description: string;
    config: Record<string, any>;
    enabled: boolean;
  }>;
  
  // Configuración de memoria
  useMemory: boolean;
  memoryType: 'conversation' | 'vector' | 'graph' | 'session';
  memorySize: number;
  
  // LangGraph configuración
  useLangGraph: boolean;
  graphNodes: Array<{
    id: string;
    name: string;
    type: 'start' | 'llm' | 'tool' | 'condition' | 'human' | 'end';
    config: Record<string, any>;
  }>;
  graphEdges: Array<{
    from: string;
    to: string;
    condition?: string;
  }>;
  
  // Multi-agente
  useMultiAgent: boolean;
  agents: Array<{
    id: string;
    name: string;
    role: string;
    model: string;
    systemPrompt: string;
    tools: string[];
  }>;
  
  // Configuración de ejecución
  timeout: number;
  maxIterations: number;
  fallbackBehavior: 'human_handoff' | 'default_response' | 'error';
  
  // Salidas
  saveConversation: boolean;
  outputFormat: 'text' | 'json' | 'structured';
  extractEntities: boolean;
  
  // Seguridad
  contentFilter: boolean;
  allowedDomains: string[];
  rateLimiting: boolean;
  maxRequestsPerMinute: number;
}

export function AIAgentNode({ data, selected }: { data: AIAgentData; selected?: boolean }) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [localData, setLocalData] = useState<AIAgentData>({
    label: 'Agente IA',
    agentType: 'conversational',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: '',
    tools: [],
    useMemory: true,
    memoryType: 'conversation',
    memorySize: 1000,
    useLangGraph: false,
    graphNodes: [],
    graphEdges: [],
    useMultiAgent: false,
    agents: [],
    timeout: 30000,
    maxIterations: 10,
    fallbackBehavior: 'human_handoff',
    saveConversation: true,
    outputFormat: 'text',
    extractEntities: false,
    contentFilter: true,
    allowedDomains: [],
    rateLimiting: true,
    maxRequestsPerMinute: 60,
    ...data
  });

  const updateData = (updates: Partial<AIAgentData>) => {
    setLocalData(prev => ({ ...prev, ...updates }));
  };

  const addTool = () => {
    const newTool = {
      id: Date.now().toString(),
      name: '',
      type: 'search' as const,
      description: '',
      config: {},
      enabled: true
    };
    updateData({
      tools: [...localData.tools, newTool]
    });
  };

  const removeTool = (id: string) => {
    updateData({
      tools: localData.tools.filter(t => t.id !== id)
    });
  };

  const addAgent = () => {
    const newAgent = {
      id: Date.now().toString(),
      name: '',
      role: '',
      model: 'gpt-4',
      systemPrompt: '',
      tools: []
    };
    updateData({
      agents: [...localData.agents, newAgent]
    });
  };

  const removeAgent = (id: string) => {
    updateData({
      agents: localData.agents.filter(a => a.id !== id)
    });
  };

  const addGraphNode = () => {
    const newNode = {
      id: Date.now().toString(),
      name: '',
      type: 'llm' as const,
      config: {}
    };
    updateData({
      graphNodes: [...localData.graphNodes, newNode]
    });
  };

  const removeGraphNode = (id: string) => {
    updateData({
      graphNodes: localData.graphNodes.filter(n => n.id !== id),
      graphEdges: localData.graphEdges.filter(e => e.from !== id && e.to !== id)
    });
  };

  const getAgentIcon = () => {
    switch (localData.agentType) {
      case 'conversational': return MessageCircle;
      case 'tool_using': return Zap;
      case 'reasoning': return Brain;
      case 'workflow': return Workflow;
      case 'multi_agent': return Bot;
      default: return Bot;
    }
  };

  const getAgentColor = () => {
    switch (localData.agentType) {
      case 'conversational': return 'border-l-blue-500 bg-blue-50';
      case 'tool_using': return 'border-l-green-500 bg-green-50';
      case 'reasoning': return 'border-l-purple-500 bg-purple-50';
      case 'workflow': return 'border-l-orange-500 bg-orange-50';
      case 'multi_agent': return 'border-l-red-500 bg-red-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const AgentIcon = getAgentIcon();

  const getToolIcon = (type: string) => {
    switch (type) {
      case 'search': return Search;
      case 'database': return Database;
      case 'api': return Globe;
      case 'calculator': return Calculator;
      case 'file': return FileText;
      case 'webhook': return Zap;
      default: return Code;
    }
  };

  return (
    <>
      <Handle type="target" position={Position.Top} />
      
      <Card className={`w-80 ${selected ? 'ring-2 ring-blue-500' : ''} ${getAgentColor()} border-l-4`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AgentIcon className="h-4 w-4 text-gray-600" />
              <CardTitle className="text-sm font-medium">{localData.label}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsConfigOpen(true)}
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
          <Badge variant="secondary" className="w-fit text-xs">
            {localData.agentType === 'conversational' && 'Conversacional'}
            {localData.agentType === 'tool_using' && 'Con Herramientas'}
            {localData.agentType === 'reasoning' && 'Razonamiento'}
            {localData.agentType === 'workflow' && 'Flujo de Trabajo'}
            {localData.agentType === 'multi_agent' && 'Multi-Agente'}
          </Badge>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Brain className="h-3 w-3" />
              <span>Modelo: {localData.model}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>{localData.tools.filter(t => t.enabled).length} herramientas activas</span>
            </div>
            
            {localData.useMemory && (
              <div className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                <span>Memoria: {localData.memoryType}</span>
              </div>
            )}
            
            {localData.useLangGraph && (
              <div className="flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                <span>LangGraph: {localData.graphNodes.length} nodos</span>
              </div>
            )}
            
            {localData.useMultiAgent && (
              <div className="flex items-center gap-1">
                <Bot className="h-3 w-3" />
                <span>{localData.agents.length} agentes</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Timeout: {localData.timeout / 1000}s</span>
            </div>
          </div>

          {localData.tools.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-medium text-gray-700 mb-2">Herramientas:</div>
              <div className="space-y-1">
                {localData.tools.filter(t => t.enabled).slice(0, 3).map((tool) => {
                  const ToolIcon = getToolIcon(tool.type);
                  return (
                    <div key={tool.id} className="flex items-center gap-2">
                      <ToolIcon className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-600 truncate">{tool.name || tool.type}</span>
                    </div>
                  );
                })}
                {localData.tools.filter(t => t.enabled).length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{localData.tools.filter(t => t.enabled).length - 3} más...
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Handles de salida */}
      <Handle type="source" position={Position.Bottom} id="success" className="w-3 h-3" />
      <Handle type="source" position={Position.Right} id="human_handoff" className="w-3 h-3" />
      <Handle type="source" position={Position.Left} id="error" className="w-3 h-3" />

      {/* Modal de configuración */}
      {isConfigOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <Card className="w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
            <CardHeader className="flex-shrink-0 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Configurar Agente IA
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsConfigOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-6 mb-6 h-auto">
                  <TabsTrigger value="basic" className="text-xs py-2 px-1">Básico</TabsTrigger>
                  <TabsTrigger value="tools" className="text-xs py-2 px-1">Tools</TabsTrigger>
                  <TabsTrigger value="memory" className="text-xs py-2 px-1">Memoria</TabsTrigger>
                  <TabsTrigger value="graph" className="text-xs py-2 px-1">Graph</TabsTrigger>
                  <TabsTrigger value="agents" className="text-xs py-2 px-1">Multi</TabsTrigger>
                  <TabsTrigger value="security" className="text-xs py-2 px-1">Seguridad</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="label">Nombre del Agente</Label>
                      <Input
                        id="label"
                        value={localData.label}
                        onChange={(e) => updateData({ label: e.target.value })}
                        placeholder="Ej: Asistente de Ventas IA"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo de Agente</Label>
                      <Select
                        value={localData.agentType}
                        onValueChange={(value: any) => updateData({ agentType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[10000]">
                          <SelectItem value="conversational">
                            <div className="flex items-center gap-2">
                              <MessageCircle className="h-4 w-4" />
                              Conversacional
                            </div>
                          </SelectItem>
                          <SelectItem value="tool_using">
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4" />
                              Con Herramientas
                            </div>
                          </SelectItem>
                          <SelectItem value="reasoning">
                            <div className="flex items-center gap-2">
                              <Brain className="h-4 w-4" />
                              Razonamiento
                            </div>
                          </SelectItem>
                          <SelectItem value="workflow">
                            <div className="flex items-center gap-2">
                              <Workflow className="h-4 w-4" />
                              Flujo de Trabajo
                            </div>
                          </SelectItem>
                          <SelectItem value="multi_agent">
                            <div className="flex items-center gap-2">
                              <Bot className="h-4 w-4" />
                              Multi-Agente
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Modelo de IA</Label>
                      <Select
                        value={localData.model}
                        onValueChange={(value: any) => updateData({ model: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[10000]">
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                          <SelectItem value="claude-3">Claude 3</SelectItem>
                          <SelectItem value="claude-2">Claude 2</SelectItem>
                          <SelectItem value="custom">Modelo Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Temperatura</Label>
                      <div className="flex items-center space-x-4">
                        <Input
                          type="number"
                          min="0"
                          max="2"
                          step="0.1"
                          value={localData.temperature}
                          onChange={(e) => updateData({ temperature: parseFloat(e.target.value) || 0.7 })}
                        />
                        <span className="text-sm text-gray-600">{localData.temperature}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Tokens Máximos</Label>
                      <Input
                        type="number"
                        min="100"
                        max="8000"
                        value={localData.maxTokens}
                        onChange={(e) => updateData({ maxTokens: parseInt(e.target.value) || 2000 })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Prompt del Sistema</Label>
                    <Textarea
                      value={localData.systemPrompt}
                      onChange={(e) => updateData({ systemPrompt: e.target.value })}
                      placeholder="Eres un asistente IA especializado en... Tu objetivo es..."
                      rows={6}
                    />
                    <p className="text-xs text-gray-500">
                      Define el comportamiento, personalidad y objetivo del agente IA
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Timeout (ms)</Label>
                      <Input
                        type="number"
                        min="5000"
                        max="300000"
                        value={localData.timeout}
                        onChange={(e) => updateData({ timeout: parseInt(e.target.value) || 30000 })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Iteraciones Máximas</Label>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={localData.maxIterations}
                        onChange={(e) => updateData({ maxIterations: parseInt(e.target.value) || 10 })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Comportamiento de Respaldo</Label>
                      <Select
                        value={localData.fallbackBehavior}
                        onValueChange={(value: any) => updateData({ fallbackBehavior: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[10000]">
                          <SelectItem value="human_handoff">Derivar a Humano</SelectItem>
                          <SelectItem value="default_response">Respuesta por Defecto</SelectItem>
                          <SelectItem value="error">Mostrar Error</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tools" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-medium">Herramientas del Agente</Label>
                    <Button onClick={addTool} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Herramienta
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {localData.tools.map((tool, index) => {
                      const ToolIcon = getToolIcon(tool.type);
                      return (
                        <Card key={tool.id} className="p-4 border-l-4 border-l-green-500">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <ToolIcon className="h-4 w-4 text-green-600" />
                                <h4 className="font-medium text-sm">Herramienta #{index + 1}</h4>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={tool.enabled}
                                  onCheckedChange={(checked) => {
                                    const updated = localData.tools.map(t =>
                                      t.id === tool.id ? { ...t, enabled: checked } : t
                                    );
                                    updateData({ tools: updated });
                                  }}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeTool(tool.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label>Nombre</Label>
                                <Input
                                  value={tool.name}
                                  onChange={(e) => {
                                    const updated = localData.tools.map(t =>
                                      t.id === tool.id ? { ...t, name: e.target.value } : t
                                    );
                                    updateData({ tools: updated });
                                  }}
                                  placeholder="Ej: Búsqueda Web"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Tipo</Label>
                                <Select
                                  value={tool.type}
                                  onValueChange={(value: any) => {
                                    const updated = localData.tools.map(t =>
                                      t.id === tool.id ? { ...t, type: value } : t
                                    );
                                    updateData({ tools: updated });
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="z-[10000]">
                                    <SelectItem value="search">Búsqueda</SelectItem>
                                    <SelectItem value="database">Base de Datos</SelectItem>
                                    <SelectItem value="api">API REST</SelectItem>
                                    <SelectItem value="calculator">Calculadora</SelectItem>
                                    <SelectItem value="file">Archivo</SelectItem>
                                    <SelectItem value="webhook">Webhook</SelectItem>
                                    <SelectItem value="custom">Personalizado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Input
                                  value={tool.description}
                                  onChange={(e) => {
                                    const updated = localData.tools.map(t =>
                                      t.id === tool.id ? { ...t, description: e.target.value } : t
                                    );
                                    updateData({ tools: updated });
                                  }}
                                  placeholder="Qué hace esta herramienta"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Configuración JSON</Label>
                              <Textarea
                                value={JSON.stringify(tool.config, null, 2)}
                                onChange={(e) => {
                                  try {
                                    const config = JSON.parse(e.target.value);
                                    const updated = localData.tools.map(t =>
                                      t.id === tool.id ? { ...t, config } : t
                                    );
                                    updateData({ tools: updated });
                                  } catch (error) {
                                    // Ignore JSON parse errors while typing
                                  }
                                }}
                                placeholder='{"url": "https://api.example.com", "apiKey": "xxx"}'
                                rows={3}
                              />
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                    
                    {localData.tools.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Zap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No hay herramientas configuradas</p>
                        <p className="text-sm">Haz clic en "Agregar Herramienta" para comenzar</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="memory" className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="useMemory"
                        checked={localData.useMemory}
                        onCheckedChange={(checked) => updateData({ useMemory: checked })}
                      />
                      <Label htmlFor="useMemory" className="text-lg font-medium">Usar Memoria Persistente</Label>
                    </div>

                    {localData.useMemory && (
                      <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Tipo de Memoria</Label>
                            <Select
                              value={localData.memoryType}
                              onValueChange={(value: any) => updateData({ memoryType: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-[10000]">
                                <SelectItem value="conversation">Conversacional</SelectItem>
                                <SelectItem value="vector">Vectorial</SelectItem>
                                <SelectItem value="graph">Grafo de Conocimiento</SelectItem>
                                <SelectItem value="session">Sesión</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">
                              {localData.memoryType === 'conversation' && 'Guarda el historial de la conversación'}
                              {localData.memoryType === 'vector' && 'Búsqueda semántica en embeddings'}
                              {localData.memoryType === 'graph' && 'Red de entidades y relaciones'}
                              {localData.memoryType === 'session' && 'Memoria temporal por sesión'}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label>Tamaño de Memoria</Label>
                            <Input
                              type="number"
                              min="100"
                              max="10000"
                              value={localData.memorySize}
                              onChange={(e) => updateData({ memorySize: parseInt(e.target.value) || 1000 })}
                            />
                            <p className="text-xs text-gray-500">Número de tokens/mensajes a recordar</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="graph" className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="useLangGraph"
                        checked={localData.useLangGraph}
                        onCheckedChange={(checked) => updateData({ useLangGraph: checked })}
                      />
                      <Label htmlFor="useLangGraph" className="text-lg font-medium">Usar LangGraph</Label>
                    </div>

                    {localData.useLangGraph && (
                      <div className="space-y-4 pl-6 border-l-2 border-purple-200">
                        <div className="flex items-center justify-between">
                          <Label className="text-lg font-medium">Nodos del Grafo</Label>
                          <Button onClick={addGraphNode} size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar Nodo
                          </Button>
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                          {localData.graphNodes.map((node, index) => (
                            <Card key={node.id} className="p-3">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-sm">Nodo #{index + 1}</h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeGraphNode(node.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Input
                                  value={node.name}
                                  onChange={(e) => {
                                    const updated = localData.graphNodes.map(n =>
                                      n.id === node.id ? { ...n, name: e.target.value } : n
                                    );
                                    updateData({ graphNodes: updated });
                                  }}
                                  placeholder="Nombre del nodo"
                                />

                                <Select
                                  value={node.type}
                                  onValueChange={(value: any) => {
                                    const updated = localData.graphNodes.map(n =>
                                      n.id === node.id ? { ...n, type: value } : n
                                    );
                                    updateData({ graphNodes: updated });
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="z-[10000]">
                                    <SelectItem value="start">Inicio</SelectItem>
                                    <SelectItem value="llm">LLM</SelectItem>
                                    <SelectItem value="tool">Herramienta</SelectItem>
                                    <SelectItem value="condition">Condición</SelectItem>
                                    <SelectItem value="human">Humano</SelectItem>
                                    <SelectItem value="end">Fin</SelectItem>
                                  </SelectContent>
                                </Select>

                                <Input
                                  value={JSON.stringify(node.config)}
                                  onChange={(e) => {
                                    try {
                                      const config = JSON.parse(e.target.value);
                                      const updated = localData.graphNodes.map(n =>
                                        n.id === node.id ? { ...n, config } : n
                                      );
                                      updateData({ graphNodes: updated });
                                    } catch (error) {
                                      // Ignore JSON parse errors
                                    }
                                  }}
                                  placeholder='{"key": "value"}'
                                />
                              </div>
                            </Card>
                          ))}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>LangGraph</strong> permite crear flujos de trabajo complejos con múltiples nodos 
                            que pueden tomar decisiones, usar herramientas y ramificarse según condiciones.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="agents" className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="useMultiAgent"
                        checked={localData.useMultiAgent}
                        onCheckedChange={(checked) => updateData({ useMultiAgent: checked })}
                      />
                      <Label htmlFor="useMultiAgent" className="text-lg font-medium">Sistema Multi-Agente</Label>
                    </div>

                    {localData.useMultiAgent && (
                      <div className="space-y-4 pl-6 border-l-2 border-red-200">
                        <div className="flex items-center justify-between">
                          <Label className="text-lg font-medium">Agentes del Sistema</Label>
                          <Button onClick={addAgent} size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar Agente
                          </Button>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto">
                          {localData.agents.map((agent, index) => (
                            <Card key={agent.id} className="p-4 border-l-4 border-l-red-500">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-sm">Agente #{index + 1}</h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeAgent(agent.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <Input
                                    value={agent.name}
                                    onChange={(e) => {
                                      const updated = localData.agents.map(a =>
                                        a.id === agent.id ? { ...a, name: e.target.value } : a
                                      );
                                      updateData({ agents: updated });
                                    }}
                                    placeholder="Nombre del agente"
                                  />

                                  <Input
                                    value={agent.role}
                                    onChange={(e) => {
                                      const updated = localData.agents.map(a =>
                                        a.id === agent.id ? { ...a, role: e.target.value } : a
                                      );
                                      updateData({ agents: updated });
                                    }}
                                    placeholder="Rol (ej: Analista, Ejecutor)"
                                  />

                                  <Select
                                    value={agent.model}
                                    onValueChange={(value) => {
                                      const updated = localData.agents.map(a =>
                                        a.id === agent.id ? { ...a, model: value } : a
                                      );
                                      updateData({ agents: updated });
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="z-[10000]">
                                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                      <SelectItem value="claude-3">Claude 3</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <Textarea
                                  value={agent.systemPrompt}
                                  onChange={(e) => {
                                    const updated = localData.agents.map(a =>
                                      a.id === agent.id ? { ...a, systemPrompt: e.target.value } : a
                                    );
                                    updateData({ agents: updated });
                                  }}
                                  placeholder="Prompt específico para este agente..."
                                  rows={3}
                                />
                              </div>
                            </Card>
                          ))}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>Multi-Agente</strong> permite que diferentes agentes especializados 
                            trabajen en conjunto, cada uno con su propio modelo y prompt.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="contentFilter"
                        checked={localData.contentFilter}
                        onCheckedChange={(checked) => updateData({ contentFilter: checked })}
                      />
                      <Label htmlFor="contentFilter" className="text-lg font-medium">Filtro de Contenido</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="rateLimiting"
                        checked={localData.rateLimiting}
                        onCheckedChange={(checked) => updateData({ rateLimiting: checked })}
                      />
                      <Label htmlFor="rateLimiting" className="text-lg font-medium">Limitación de Rate</Label>
                    </div>

                    {localData.rateLimiting && (
                      <div className="pl-6 border-l-2 border-yellow-200">
                        <div className="space-y-2">
                          <Label>Máximo Requests por Minuto</Label>
                          <Input
                            type="number"
                            min="1"
                            max="1000"
                            value={localData.maxRequestsPerMinute}
                            onChange={(e) => updateData({ maxRequestsPerMinute: parseInt(e.target.value) || 60 })}
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Dominios Permitidos</Label>
                      <Textarea
                        value={localData.allowedDomains.join('\n')}
                        onChange={(e) => {
                          const domains = e.target.value.split('\n').map(d => d.trim()).filter(d => d);
                          updateData({ allowedDomains: domains });
                        }}
                        placeholder="ejemplo.com&#10;api.servicio.com"
                        rows={4}
                      />
                      <p className="text-xs text-gray-500">Un dominio por línea. Deja vacío para permitir todos.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="saveConversation"
                          checked={localData.saveConversation}
                          onCheckedChange={(checked) => updateData({ saveConversation: checked })}
                        />
                        <Label htmlFor="saveConversation">Guardar Conversaciones</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="extractEntities"
                          checked={localData.extractEntities}
                          onCheckedChange={(checked) => updateData({ extractEntities: checked })}
                        />
                        <Label htmlFor="extractEntities">Extraer Entidades</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Formato de Salida</Label>
                      <Select
                        value={localData.outputFormat}
                        onValueChange={(value: any) => updateData({ outputFormat: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[10000]">
                          <SelectItem value="text">Texto Plano</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="structured">Estructurado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <div className="flex-shrink-0 border-t p-6">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsConfigOpen(false)}>
                  <Play className="h-4 w-4 mr-1" />
                  Guardar Agente
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
} 