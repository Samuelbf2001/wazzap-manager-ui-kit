import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Brain, 
  MessageCircle, 
  Zap, 
  Workflow,
  Settings,
  Database,
  Shield,
  Play,
  Plus,
  Trash2,
  Search,
  Globe,
  Calculator,
  FileText,
  Code
} from 'lucide-react';

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

interface Tool {
  id: string;
  name: string;
  type: 'search' | 'database' | 'api' | 'calculator' | 'file' | 'webhook' | 'custom';
  description: string;
  config: Record<string, any>;
  enabled: boolean;
}

interface AIAgentCreatorProps {
  onBack: () => void;
  onAgentCreated: (agent: AIAgent) => void;
  knowledgeBases: KnowledgeBase[];
}

export function AIAgentCreator({ onBack, onAgentCreated, knowledgeBases }: AIAgentCreatorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [agentData, setAgentData] = useState({
    name: '',
    type: 'conversational' as const,
    description: '',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: '',
    knowledgeBases: [] as string[],
    tools: [] as Tool[],
    useMemory: true,
    memoryType: 'conversation',
    contentFilter: true,
    rateLimiting: true,
    maxRequestsPerMinute: 60
  });

  const steps = [
    { id: 1, title: 'Información Básica', icon: Bot },
    { id: 2, title: 'Configuración IA', icon: Brain },
    { id: 3, title: 'Knowledge Base', icon: Database },
    { id: 4, title: 'Herramientas', icon: Zap },
    { id: 5, title: 'Seguridad', icon: Shield },
    { id: 6, title: 'Revisión', icon: Check }
  ];

  const agentTypes = [
    {
      id: 'conversational',
      name: 'Conversacional',
      description: 'Agente para interacciones naturales y fluidas con usuarios',
      icon: MessageCircle,
      features: ['Memoria de conversación', 'Personalidad configurable', 'Respuestas contextuales']
    },
    {
      id: 'tool_using',
      name: 'Con Herramientas',
      description: 'Agente que puede ejecutar tareas específicas usando herramientas',
      icon: Zap,
      features: ['Búsqueda web', 'APIs externas', 'Procesamiento de archivos']
    },
    {
      id: 'reasoning',
      name: 'Razonamiento',
      description: 'Agente para análisis complejo y toma de decisiones',
      icon: Brain,
      features: ['Pensamiento paso a paso', 'Evaluación de opciones', 'Justificación']
    },
    {
      id: 'workflow',
      name: 'Flujo de Trabajo',
      description: 'Agente para automatización de procesos complejos',
      icon: Workflow,
      features: ['LangGraph', 'Flujos condicionales', 'Paralelización']
    },
    {
      id: 'multi_agent',
      name: 'Multi-Agente',
      description: 'Sistema de múltiples agentes especializados',
      icon: Bot,
      features: ['Coordinación automática', 'Especialización', 'Escalabilidad']
    }
  ];

  const availableTools = [
    { id: 'search', name: 'Búsqueda Web', type: 'search' as const, description: 'Buscar información en internet', icon: Search },
    { id: 'database', name: 'Base de Datos', type: 'database' as const, description: 'Consultar bases de datos', icon: Database },
    { id: 'api', name: 'API Externa', type: 'api' as const, description: 'Integrar con APIs externas', icon: Globe },
    { id: 'calculator', name: 'Calculadora', type: 'calculator' as const, description: 'Realizar cálculos matemáticos', icon: Calculator },
    { id: 'file', name: 'Procesador de Archivos', type: 'file' as const, description: 'Procesar y analizar archivos', icon: FileText },
    { id: 'webhook', name: 'Webhook', type: 'webhook' as const, description: 'Enviar notificaciones HTTP', icon: Code }
  ];

  const prompts = {
    conversational: "Eres un asistente virtual amigable y útil. Tu objetivo es ayudar a los usuarios de manera conversacional, proporcionando respuestas claras y útiles. Mantén un tono profesional pero cercano.",
    tool_using: "Eres un agente especializado en resolver problemas usando herramientas disponibles. Analiza las solicitudes del usuario y determina qué herramientas necesitas usar para proporcionar la mejor respuesta.",
    reasoning: "Eres un agente de razonamiento que piensa paso a paso para resolver problemas complejos. Explica tu proceso de pensamiento y justifica tus conclusiones con evidencia sólida.",
    workflow: "Eres un agente de automatización que ejecuta flujos de trabajo complejos. Coordina múltiples tareas y procesos para completar objetivos de manera eficiente.",
    multi_agent: "Eres parte de un sistema multi-agente. Colabora efectivamente con otros agentes especializados para resolver problemas complejos que requieren múltiples perspectivas."
  };

  const updateAgentData = (updates: any) => {
    setAgentData(prev => ({ ...prev, ...updates }));
  };

  const addTool = (toolTemplate: any) => {
    const newTool: Tool = {
      id: Date.now().toString(),
      name: toolTemplate.name,
      type: toolTemplate.type,
      description: toolTemplate.description,
      config: {},
      enabled: true
    };
    updateAgentData({ tools: [...agentData.tools, newTool] });
  };

  const removeTool = (toolId: string) => {
    updateAgentData({ tools: agentData.tools.filter(t => t.id !== toolId) });
  };

  const createAgent = () => {
    const newAgent: AIAgent = {
      id: Date.now().toString(),
      name: agentData.name,
      type: agentData.type,
      status: 'training',
      model: agentData.model,
      knowledgeBases: agentData.knowledgeBases,
      created: new Date(),
      lastUsed: new Date(),
      totalConversations: 0,
      avgResponseTime: 0,
      successRate: 0
    };

    onAgentCreated(newAgent);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return agentData.name && agentData.type;
      case 2: return agentData.model && agentData.systemPrompt;
      case 3: return true; // Knowledge base es opcional
      case 4: return true; // Tools son opcionales
      case 5: return true; // Configuración de seguridad tiene defaults
      case 6: return true;
      default: return false;
    }
  };

  const getToolIcon = (type: string) => {
    const tool = availableTools.find(t => t.type === type);
    return tool?.icon || Code;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Crear Nuevo Agente IA</h1>
          <p className="text-gray-600">Wizard paso a paso para configurar tu agente</p>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Progreso: Paso {currentStep} de {steps.length}</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / steps.length) * 100)}%</span>
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="mb-4" />
          
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div 
                  key={step.id} 
                  className={`flex flex-col items-center ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}
                >
                  <div className={`p-2 rounded-full mb-1 ${isActive ? 'bg-blue-100' : isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <StepIcon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium text-center">{step.title}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Información Básica del Agente</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Agente</Label>
                    <Input
                      id="name"
                      value={agentData.name}
                      onChange={(e) => updateAgentData({ name: e.target.value })}
                      placeholder="Ej: Asistente de Ventas IA"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={agentData.description}
                      onChange={(e) => updateAgentData({ description: e.target.value })}
                      placeholder="Describe el propósito y funcionalidades del agente..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Tipo de Agente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agentTypes.map((type) => {
                    const TypeIcon = type.icon;
                    const isSelected = agentData.type === type.id;
                    
                    return (
                      <Card 
                        key={type.id} 
                        className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
                        onClick={() => updateAgentData({ type: type.id, systemPrompt: prompts[type.id as keyof typeof prompts] })}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                              <TypeIcon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                            </div>
                            <div>
                              <h4 className="font-medium">{type.name}</h4>
                              <p className="text-sm text-gray-600">{type.description}</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {type.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Check className="h-3 w-3 text-green-600" />
                                <span className="text-xs text-gray-600">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Configuración del Modelo IA</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Modelo de IA</Label>
                  <Select value={agentData.model} onValueChange={(value) => updateAgentData({ model: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3">Claude 3</SelectItem>
                      <SelectItem value="claude-2">Claude 2</SelectItem>
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
                      value={agentData.temperature}
                      onChange={(e) => updateAgentData({ temperature: parseFloat(e.target.value) })}
                    />
                    <span className="text-sm text-gray-600">{agentData.temperature}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tokens Máximos</Label>
                  <Input
                    type="number"
                    min="100"
                    max="8000"
                    value={agentData.maxTokens}
                    onChange={(e) => updateAgentData({ maxTokens: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Memoria</Label>
                  <Select value={agentData.memoryType} onValueChange={(value) => updateAgentData({ memoryType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversation">Conversación</SelectItem>
                      <SelectItem value="vector">Vector</SelectItem>
                      <SelectItem value="graph">Grafo</SelectItem>
                      <SelectItem value="session">Sesión</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Prompt del Sistema</Label>
                <Textarea
                  value={agentData.systemPrompt}
                  onChange={(e) => updateAgentData({ systemPrompt: e.target.value })}
                  rows={6}
                  placeholder="Define el comportamiento, personalidad y objetivo del agente..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={agentData.useMemory}
                  onCheckedChange={(checked) => updateAgentData({ useMemory: checked })}
                />
                <Label>Usar memoria conversacional</Label>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Bases de Conocimiento</h2>
              <p className="text-gray-600">Selecciona las bases de conocimiento que el agente debe usar</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {knowledgeBases.map((kb) => {
                  const isSelected = agentData.knowledgeBases.includes(kb.id);
                  
                  return (
                    <Card 
                      key={kb.id} 
                      className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
                      onClick={() => {
                        const newKBs = isSelected 
                          ? agentData.knowledgeBases.filter(id => id !== kb.id)
                          : [...agentData.knowledgeBases, kb.id];
                        updateAgentData({ knowledgeBases: newKBs });
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                              <Database className={`h-4 w-4 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                            </div>
                            <div>
                              <h4 className="font-medium">{kb.name}</h4>
                              <p className="text-sm text-gray-600">{kb.description}</p>
                            </div>
                          </div>
                          {isSelected && <Check className="h-5 w-5 text-blue-600" />}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-gray-500">Documentos:</span>
                            <span className="font-medium ml-1">{kb.documentsCount}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Tamaño:</span>
                            <span className="font-medium ml-1">{kb.size}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {agentData.knowledgeBases.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay bases de conocimiento seleccionadas</p>
                  <p className="text-sm">El agente usará solo su conocimiento base</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Herramientas del Agente</h2>
                  <p className="text-gray-600">Configura las herramientas que el agente puede usar</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableTools.map((tool) => {
                  const ToolIcon = tool.icon;
                  const isAdded = agentData.tools.some(t => t.type === tool.type);
                  
                  return (
                    <Card key={tool.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <ToolIcon className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">{tool.name}</h4>
                              <p className="text-sm text-gray-600">{tool.description}</p>
                            </div>
                          </div>
                          
                          {isAdded ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeTool(agentData.tools.find(t => t.type === tool.type)?.id || '')}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => addTool(tool)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {agentData.tools.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Herramientas Seleccionadas ({agentData.tools.length})</h3>
                  <div className="space-y-2">
                    {agentData.tools.map((tool) => {
                      const ToolIcon = getToolIcon(tool.type);
                      return (
                        <div key={tool.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <ToolIcon className="h-4 w-4 text-gray-600" />
                            <span className="font-medium">{tool.name}</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeTool(tool.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Configuración de Seguridad</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Filtro de Contenido</h4>
                    <p className="text-sm text-gray-600">Activa filtros para contenido inapropiado</p>
                  </div>
                  <Switch
                    checked={agentData.contentFilter}
                    onCheckedChange={(checked) => updateAgentData({ contentFilter: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Rate Limiting</h4>
                    <p className="text-sm text-gray-600">Limita el número de requests por minuto</p>
                  </div>
                  <Switch
                    checked={agentData.rateLimiting}
                    onCheckedChange={(checked) => updateAgentData({ rateLimiting: checked })}
                  />
                </div>

                {agentData.rateLimiting && (
                  <div className="space-y-2">
                    <Label>Requests máximos por minuto</Label>
                    <Input
                      type="number"
                      min="1"
                      max="1000"
                      value={agentData.maxRequestsPerMinute}
                      onChange={(e) => updateAgentData({ maxRequestsPerMinute: parseInt(e.target.value) })}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Revisión y Confirmación</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información del Agente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500">Nombre:</span>
                      <p className="font-medium">{agentData.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Tipo:</span>
                      <p className="font-medium">{agentTypes.find(t => t.id === agentData.type)?.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Modelo:</span>
                      <p className="font-medium">{agentData.model}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Temperatura:</span>
                      <p className="font-medium">{agentData.temperature}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recursos Asignados</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500">Knowledge Bases:</span>
                      <p className="font-medium">{agentData.knowledgeBases.length}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Herramientas:</span>
                      <p className="font-medium">{agentData.tools.length}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Memoria:</span>
                      <p className="font-medium">{agentData.useMemory ? 'Habilitada' : 'Deshabilitada'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Seguridad:</span>
                      <p className="font-medium">{agentData.contentFilter ? 'Protegido' : 'Básico'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Prompt del Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{agentData.systemPrompt}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Anterior
        </Button>

        <div className="text-sm text-gray-500">
          Paso {currentStep} de {steps.length}
        </div>

        {currentStep < steps.length ? (
          <Button 
            onClick={nextStep} 
            disabled={!canProceed()}
            className="flex items-center gap-2"
          >
            Siguiente
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={createAgent}
            disabled={!canProceed()}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Crear Agente
          </Button>
        )}
      </div>
    </div>
  );
}