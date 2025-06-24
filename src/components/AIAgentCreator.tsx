import React, { useState, useRef } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Code,
  Upload,
  X,
  File,
  Link,
  Building2,
  Sparkles,
  Copy,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { AIAgent } from './AIAgentManager';

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
  type: 'search' | 'database' | 'api' | 'calculator' | 'file' | 'webhook' | 'mcp' | 'hubspot' | 'custom';
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
  console.log('🧙‍♂️ AIAgentCreator iniciado');
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

  // Estados para manejo de Knowledge Base en el wizard
  const [showCreateKB, setShowCreateKB] = useState(false);
  const [showUploadDocs, setShowUploadDocs] = useState(false);
  const [selectedKBForUpload, setSelectedKBForUpload] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para configuración de herramientas
  const [showToolConfig, setShowToolConfig] = useState(false);
  const [selectedToolType, setSelectedToolType] = useState<string | null>(null);

  // Estados para el Asistente de Prompts IA
  const [showPromptAssistant, setShowPromptAssistant] = useState(false);
  const [promptRequirements, setPromptRequirements] = useState('');
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);

  // Estado para nueva KB
  const [newKBData, setNewKBData] = useState({
    name: '',
    description: '',
    chunkSize: 1000,
    overlap: 200,
    embeddingModel: 'text-embedding-ada-002',
    indexType: 'hybrid' as 'semantic' | 'keyword' | 'hybrid'
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
    { id: 'webhook', name: 'Webhook', type: 'webhook' as const, description: 'Enviar notificaciones HTTP', icon: Code },
    { id: 'mcp', name: 'MCP (Model Context Protocol)', type: 'mcp' as const, description: 'Conectar con herramientas MCP estándar', icon: Link },
    { id: 'hubspot', name: 'HubSpot CRM', type: 'hubspot' as const, description: 'Integración con HubSpot para gestión de contactos y deals', icon: Building2 }
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
    // Para herramientas que requieren configuración especial, abrir modal
    if (toolTemplate.type === 'mcp' || toolTemplate.type === 'hubspot') {
      setSelectedToolType(toolTemplate.type);
      setShowToolConfig(true);
      return;
    }

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

  const handleToolConfig = (config: any) => {
    if (!selectedToolType) return;

    let toolName = '';
    let description = '';
    
    if (selectedToolType === 'mcp') {
      toolName = `MCP: ${config.serverName || 'Servidor MCP'}`;
      description = `Conexión con servidor MCP: ${config.serverUrl || 'URL no especificada'}`;
    } else if (selectedToolType === 'hubspot') {
      toolName = `HubSpot: ${config.features?.join(', ') || 'CRM'}`;
      description = `Integración HubSpot para ${config.features?.join(', ') || 'gestión general'}`;
    }

    const newTool: Tool = {
      id: Date.now().toString(),
      name: toolName,
      type: selectedToolType as any,
      description: description,
      config: config,
      enabled: true
    };

    updateAgentData({ tools: [...agentData.tools, newTool] });
    setShowToolConfig(false);
    setSelectedToolType(null);
  };

  const createAgent = () => {
    console.log('🤖 Creando agente con datos:', agentData);
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
      successRate: 0,
      // Campos extendidos para FlowBuilder
      systemPrompt: agentData.systemPrompt,
      temperature: agentData.temperature,
      maxTokens: agentData.maxTokens,
      tools: agentData.tools,
      useMemory: agentData.useMemory,
      memoryType: agentData.memoryType as any,
      memorySize: 1000,
      timeout: 30000,
      maxIterations: 10,
      fallbackBehavior: 'human_handoff'
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
    switch (type) {
      case 'search': return Search;
      case 'database': return Database;
      case 'api': return Globe;
      case 'calculator': return Calculator;
      case 'file': return FileText;
      case 'webhook': return Code;
      case 'mcp': return Link;
      case 'hubspot': return Building2;
      default: return Code;
    }
  };

  // Funciones para manejo de Knowledge Base en wizard
  const handleCreateKB = () => {
    // Simular creación de KB
    const newKB: KnowledgeBase = {
      id: Date.now().toString(),
      name: newKBData.name,
      description: newKBData.description,
      documentsCount: 0,
      size: '0 MB',
      created: new Date(),
      lastUpdated: new Date(),
      status: 'ready'
    };

    // Agregar a la lista de KBs disponibles (simulado)
    knowledgeBases.push(newKB);
    
    // Seleccionar automáticamente la nueva KB
    updateAgentData({ 
      knowledgeBases: [...agentData.knowledgeBases, newKB.id] 
    });

    // Resetear formulario y cerrar modal
    setNewKBData({
      name: '',
      description: '',
      chunkSize: 1000,
      overlap: 200,
      embeddingModel: 'text-embedding-ada-002',
      indexType: 'hybrid' as 'semantic' | 'keyword' | 'hybrid'
    });
    setShowCreateKB(false);
  };

  // Función para generar prompts con IA
  const generateAIPrompt = async () => {
    setGeneratingPrompt(true);
    console.log('🧠 Generando prompt con IA:', { 
      agentType: agentData.type, 
      requirements: promptRequirements,
      selectedTools: agentData.tools.map(t => t.name),
      knowledgeBases: agentData.knowledgeBases.length
    });

    try {
      // Simular procesamiento inteligente
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Contexto para generar prompts más inteligentes
      const context = {
        agentType: agentData.type,
        agentName: agentData.name,
        description: agentData.description,
        requirements: promptRequirements,
        hasKnowledgeBase: agentData.knowledgeBases.length > 0,
        tools: agentData.tools,
        temperature: agentData.temperature,
        useMemory: agentData.useMemory
      };

      const generateIntelligentPrompts = () => {
        const basePromptTemplates = {
          conversational: {
            personality: 'empático, profesional y orientado a la ayuda',
            approach: 'mantener conversaciones naturales y resolver dudas de manera clara',
            structure: 'saludo, comprensión del problema, solución paso a paso, verificación de entendimiento'
          },
          tool_using: {
            personality: 'analítico, eficiente y orientado a resultados',
            approach: 'identificar qué herramientas usar para cada situación y explicar el proceso',
            structure: 'análisis del problema, selección de herramientas, ejecución, validación de resultados'
          },
          reasoning: {
            personality: 'metódico, reflexivo y basado en evidencia',
            approach: 'desglosar problemas complejos y mostrar el razonamiento paso a paso',
            structure: 'identificación del problema, análisis multi-perspectiva, evaluación de opciones, conclusión fundamentada'
          },
          workflow: {
            personality: 'organizativo, sistemático y orientado a procesos',
            approach: 'automatizar y optimizar flujos de trabajo complejos',
            structure: 'planificación, secuenciación de tareas, ejecución coordinada, monitoreo y ajustes'
          },
          multi_agent: {
            personality: 'colaborativo, coordinador y comunicativo',
            approach: 'gestionar equipos de agentes especializados y sintetizar resultados',
            structure: 'distribución de tareas, coordinación inter-agente, consolidación de resultados, presentación unificada'
          }
        };

        const template = basePromptTemplates[agentData.type as keyof typeof basePromptTemplates];
        
        const prompts = [];

        // Prompt 1: Profesional y detallado
        prompts.push(`# ROL Y PERSONALIDAD
Eres ${agentData.name || 'un asistente especializado'}, un agente IA ${template.personality}. ${promptRequirements ? `Tu especialidad es: ${promptRequirements}.` : ''}

# OBJETIVO PRINCIPAL
Tu misión es ${template.approach}. ${agentData.description ? `Específicamente: ${agentData.description}` : ''}

# CAPACIDADES Y HERRAMIENTAS
${agentData.tools.length > 0 ? `Tienes acceso a las siguientes herramientas: ${agentData.tools.map(t => t.name).join(', ')}. Úsalas estratégicamente para proporcionar las mejores respuestas.` : 'Basas tus respuestas en tu conocimiento entrenado y razonamiento.'}
${context.hasKnowledgeBase ? 'Tienes acceso a bases de conocimiento especializadas que complementan tu información.' : ''}
${agentData.useMemory ? 'Mantienes memoria de las conversaciones para proporcionar contexto continuo.' : ''}

# METODOLOGÍA DE TRABAJO
${template.structure}

# INSTRUCCIONES ESPECÍFICAS
${promptRequirements || 'Mantén siempre un enfoque profesional, claro y orientado a resolver las necesidades del usuario.'}

# LIMITACIONES Y ÉTICA
- Siempre sé honesto sobre lo que puedes y no puedes hacer
- Si algo está fuera de tu expertise, dirígelo apropiadamente
- Respeta la privacidad y confidencialidad
- No generes contenido dañino o inapropiado`);

        // Prompt 2: Conversacional y amigable
        prompts.push(`Hola, soy ${agentData.name || 'tu asistente IA'}, ${template.personality}. ${promptRequirements ? `Me especializo en ${promptRequirements} y ` : ''}estoy aquí para ayudarte de la mejor manera posible.

Mi enfoque es ${template.approach}. ${agentData.description ? agentData.description + ' ' : ''}

${agentData.tools.length > 0 ? `Puedo usar herramientas como ${agentData.tools.map(t => t.name).join(', ')} para darte respuestas más precisas y completas. ` : ''}${context.hasKnowledgeBase ? 'También tengo acceso a información especializada actualizada. ' : ''}

Cuando interactúes conmigo, seguiré esta metodología: ${template.structure}.

${promptRequirements ? `Mis directrices específicas son: ${promptRequirements}` : 'Siempre buscaré entender exactamente lo que necesitas y te guiaré paso a paso hacia la solución.'}

¿En qué puedo ayudarte hoy?`);

        // Prompt 3: Técnico y estructurado
        prompts.push(`CONFIGURACIÓN DEL AGENTE: ${agentData.name || 'Asistente Especializado'}

TIPO: ${agentTypes.find(t => t.id === agentData.type)?.name}
PERSONALIDAD: ${template.personality}
ESPECIALIZACIÓN: ${promptRequirements || 'Asistencia general'}

PROTOCOLO DE OPERACIÓN:
1. ${template.structure.split(', ')[0] || 'Análisis inicial'}
2. ${template.structure.split(', ')[1] || 'Procesamiento de información'}
3. ${template.structure.split(', ')[2] || 'Generación de respuesta'}
4. ${template.structure.split(', ')[3] || 'Verificación y seguimiento'}

RECURSOS DISPONIBLES:
${agentData.tools.length > 0 ? `- Herramientas: ${agentData.tools.map(t => `${t.name} (${t.description || t.type})`).join(', ')}` : '- Conocimiento base entrenado'}
${context.hasKnowledgeBase ? '- Bases de conocimiento especializadas' : ''}
${agentData.useMemory ? '- Sistema de memoria conversacional' : ''}

DIRECTRICES DE EJECUCIÓN:
${promptRequirements ? promptRequirements.split('.').map(req => `- ${req.trim()}`).join('\n') : '- Proporcionar respuestas precisas y útiles\n- Mantener un tono profesional\n- Verificar la comprensión del usuario'}

PARÁMETROS TÉCNICOS:
- Creatividad: ${agentData.temperature}/2.0
- Memoria: ${agentData.useMemory ? 'Activada' : 'Desactivada'}
- Modo de respuesta: ${template.approach}`);

        return prompts;
      };

      const intelligentPrompts = generateIntelligentPrompts();
      setSuggestedPrompts(intelligentPrompts);
      
    } catch (error) {
      console.error('Error generando prompts:', error);
      setSuggestedPrompts(['Error al generar prompts. Por favor, intenta nuevamente.']);
    }
    
    setGeneratingPrompt(false);
  };

  // Función para aplicar prompt sugerido
  const applyPrompt = (prompt: string) => {
    updateAgentData({ systemPrompt: prompt });
    setShowPromptAssistant(false);
    setPromptRequirements('');
    setSuggestedPrompts([]);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !selectedKBForUpload) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simular upload progresivo
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      await new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress((i / files.length) * 100 + (progress / files.length));
          if (progress >= 100) {
            clearInterval(interval);
            resolve(true);
          }
        }, 200);
      });

      // Actualizar contador de documentos en la KB
      const kbIndex = knowledgeBases.findIndex(kb => kb.id === selectedKBForUpload);
      if (kbIndex !== -1) {
        knowledgeBases[kbIndex].documentsCount += 1;
        knowledgeBases[kbIndex].lastUpdated = new Date();
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
    setShowUploadDocs(false);
    setSelectedKBForUpload(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
                <div className="flex items-center justify-between">
                  <Label>Prompt del Sistema</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPromptAssistant(true)}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Asistente IA
                  </Button>
                </div>
                <Textarea
                  value={agentData.systemPrompt}
                  onChange={(e) => updateAgentData({ systemPrompt: e.target.value })}
                  rows={6}
                  placeholder="Define el comportamiento, personalidad y objetivo del agente..."
                />
                <p className="text-xs text-gray-500">
                  Tip: Usa el Asistente IA para generar prompts optimizados según tu tipo de agente
                </p>
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
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Bases de Conocimiento</h2>
                  <p className="text-gray-600">Selecciona, crea o actualiza las bases de conocimiento que el agente debe usar</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateKB(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nueva KB
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowUploadDocs(true)}
                    disabled={agentData.knowledgeBases.length === 0}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Subir Documentos
                  </Button>
                </div>
              </div>
              
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
                          <div className="flex items-center gap-2">
                            {isSelected && <Check className="h-5 w-5 text-blue-600" />}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedKBForUpload(kb.id);
                                setShowUploadDocs(true);
                              }}
                              className="p-1 h-auto"
                            >
                              <Upload className="h-3 w-3" />
                            </Button>
                          </div>
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
                        
                        <div className="mt-2 text-xs text-gray-500">
                          Actualizado: {kb.lastUpdated.toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {agentData.knowledgeBases.length === 0 && knowledgeBases.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay bases de conocimiento seleccionadas</p>
                  <p className="text-sm">El agente usará solo su conocimiento base</p>
                </div>
              )}

              {knowledgeBases.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Database className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No hay bases de conocimiento disponibles</p>
                  <p className="text-sm mb-4">Crea tu primera base de conocimiento para potenciar tu agente</p>
                  <Button onClick={() => setShowCreateKB(true)} className="flex items-center gap-2 mx-auto">
                    <Plus className="h-4 w-4" />
                    Crear Primera Knowledge Base
                  </Button>
                </div>
              )}

              {agentData.knowledgeBases.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Knowledge Bases Seleccionadas ({agentData.knowledgeBases.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {agentData.knowledgeBases.map(kbId => {
                      const kb = knowledgeBases.find(k => k.id === kbId);
                      if (!kb) return null;
                      return (
                        <div key={kbId} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full">
                          <Database className="h-3 w-3 text-blue-600" />
                          <span className="text-sm">{kb.name}</span>
                          <span className="text-xs text-gray-500">({kb.documentsCount} docs)</span>
                        </div>
                      );
                    })}
                  </div>
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

      {/* Modal Asistente de Prompts IA */}
      {showPromptAssistant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Asistente IA para Generación de Prompts
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPromptAssistant(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900">¿Cómo funciona?</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      Describe qué quieres que haga tu agente y el asistente IA generará prompts optimizados 
                      específicamente para el tipo de agente que estás creando ({agentTypes.find(t => t.id === agentData.type)?.name}).
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="requirements">Describe los requisitos de tu agente:</Label>
                  <Textarea
                    id="requirements"
                    value={promptRequirements}
                    onChange={(e) => setPromptRequirements(e.target.value)}
                    rows={4}
                    placeholder="Ej: Quiero un agente que ayude a los usuarios con soporte técnico de software, que sea empático, que pueda derivar casos complejos a humanos, y que tenga conocimiento sobre productos de nuestra empresa..."
                    className="mt-2"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={generateAIPrompt}
                    disabled={generatingPrompt || !promptRequirements.trim()}
                    className="flex items-center gap-2"
                  >
                    {generatingPrompt ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {generatingPrompt ? 'Generando...' : 'Generar Prompts IA'}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setPromptRequirements('');
                      setSuggestedPrompts([]);
                    }}
                    disabled={generatingPrompt}
                  >
                    Limpiar
                  </Button>
                </div>
              </div>

              {suggestedPrompts.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Prompts Sugeridos:</h3>
                  <div className="space-y-3">
                    {suggestedPrompts.map((prompt, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">Opción {index + 1}</Badge>
                                <span className="text-sm text-gray-500">
                                  {prompt.length} caracteres
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">
                                {prompt}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                onClick={() => applyPrompt(prompt)}
                                className="flex items-center gap-1"
                              >
                                <Check className="h-3 w-3" />
                                Usar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(prompt);
                                }}
                                className="flex items-center gap-1"
                              >
                                <Copy className="h-3 w-3" />
                                Copiar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">💡 Consejos para optimizar tu prompt:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Sé específico sobre el rol y personalidad del agente</li>
                      <li>• Define claramente qué debe y no debe hacer</li>
                      <li>• Incluye ejemplos de respuestas deseadas</li>
                      <li>• Menciona el tono y estilo de comunicación</li>
                      <li>• Especifica cómo manejar casos límite o errores</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPromptAssistant(false)}
                >
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal para crear nueva Knowledge Base */}
      {showCreateKB && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Crear Nueva Knowledge Base
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateKB(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newKbName">Nombre</Label>
                <Input
                  id="newKbName"
                  value={newKBData.name}
                  onChange={(e) => setNewKBData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Conocimientos de Producto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newKbDescription">Descripción</Label>
                <Textarea
                  id="newKbDescription"
                  value={newKBData.description}
                  onChange={(e) => setNewKBData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe el contenido y propósito de esta base de conocimiento..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Modelo de Embeddings</Label>
                  <Select
                    value={newKBData.embeddingModel}
                    onValueChange={(value) => setNewKBData(prev => ({ ...prev, embeddingModel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-embedding-ada-002">Ada-002 (OpenAI)</SelectItem>
                      <SelectItem value="text-embedding-3-small">Embedding-3-Small</SelectItem>
                      <SelectItem value="text-embedding-3-large">Embedding-3-Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Índice</Label>
                  <Select
                    value={newKBData.indexType}
                    onValueChange={(value: 'semantic' | 'keyword' | 'hybrid') => setNewKBData(prev => ({ ...prev, indexType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semantic">Semántico</SelectItem>
                      <SelectItem value="keyword">Palabras Clave</SelectItem>
                      <SelectItem value="hybrid">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowCreateKB(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateKB} 
                  disabled={!newKBData.name}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Crear Knowledge Base
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal para subir documentos */}
      {showUploadDocs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Subir Documentos
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowUploadDocs(false);
                    setSelectedKBForUpload(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {selectedKBForUpload ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-900">
                    Subir a: {knowledgeBases.find(kb => kb.id === selectedKBForUpload)?.name}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Seleccionar Knowledge Base</Label>
                  <Select
                    value={selectedKBForUpload || ''}
                    onValueChange={setSelectedKBForUpload}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una knowledge base" />
                    </SelectTrigger>
                    <SelectContent>
                      {agentData.knowledgeBases.map(kbId => {
                        const kb = knowledgeBases.find(k => k.id === kbId);
                        if (!kb) return null;
                        return (
                          <SelectItem key={kbId} value={kbId}>
                            {kb.name} ({kb.documentsCount} documentos)
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Documentos</Label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <File className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-1">
                    Haz clic para seleccionar archivos
                  </p>
                  <p className="text-xs text-gray-500">
                    Soporta PDF, DOCX, TXT, HTML
                  </p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt,.html"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Subiendo documentos...</span>
                    <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowUploadDocs(false);
                    setSelectedKBForUpload(null);
                  }}
                  disabled={isUploading}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal para configuración de herramientas MCP/HubSpot */}
      {showToolConfig && selectedToolType && (
        <ToolConfigModal
          toolType={selectedToolType}
          onSave={handleToolConfig}
          onCancel={() => {
            setShowToolConfig(false);
            setSelectedToolType(null);
          }}
        />
      )}
    </div>
  );
}

// Componente para configuración de herramientas
interface ToolConfigModalProps {
  toolType: string;
  onSave: (config: any) => void;
  onCancel: () => void;
}

function ToolConfigModal({ toolType, onSave, onCancel }: ToolConfigModalProps) {
  const [config, setConfig] = useState<any>({});

  const handleSave = () => {
    onSave(config);
  };

  if (toolType === 'mcp') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Configurar MCP (Model Context Protocol)
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serverName">Nombre del Servidor MCP</Label>
              <Input
                id="serverName"
                value={config.serverName || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, serverName: e.target.value }))}
                placeholder="Ej: servidor-datos-empresa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serverUrl">URL del Servidor</Label>
              <Input
                id="serverUrl"
                value={config.serverUrl || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, serverUrl: e.target.value }))}
                placeholder="Ej: https://mcp-server.empresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="authToken">Token de Autenticación (opcional)</Label>
              <Input
                id="authToken"
                type="password"
                value={config.authToken || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, authToken: e.target.value }))}
                placeholder="Token para autenticación"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={config.description || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe qué tipo de herramientas o funcionalidades proporciona este servidor MCP..."
                rows={3}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">¿Qué es MCP?</h4>
              <p className="text-sm text-blue-700">
                Model Context Protocol permite a los agentes conectarse con herramientas y recursos externos 
                de manera estándar. Esto incluye bases de datos, APIs, sistemas de archivos y más.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!config.serverName || !config.serverUrl}
                className="flex items-center gap-2"
              >
                <Link className="h-4 w-4" />
                Configurar MCP
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (toolType === 'hubspot') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Configurar Integración HubSpot
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Funcionalidades de HubSpot</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'contacts', label: 'Gestión de Contactos' },
                  { id: 'deals', label: 'Gestión de Deals' },
                  { id: 'companies', label: 'Gestión de Empresas' },
                  { id: 'tickets', label: 'Tickets de Soporte' },
                  { id: 'tasks', label: 'Tareas y Actividades' },
                  { id: 'notes', label: 'Notas y Comentarios' },
                  { id: 'emails', label: 'Envío de Emails' },
                  { id: 'reports', label: 'Reportes y Analytics' }
                ].map((feature) => (
                  <div key={feature.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={feature.id}
                      checked={config.features?.includes(feature.id) || false}
                      onChange={(e) => {
                        const features = config.features || [];
                        if (e.target.checked) {
                          setConfig(prev => ({ 
                            ...prev, 
                            features: [...features, feature.id] 
                          }));
                        } else {
                          setConfig(prev => ({ 
                            ...prev, 
                            features: features.filter((f: string) => f !== feature.id) 
                          }));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={feature.id} className="text-sm">
                      {feature.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key de HubSpot (opcional)</Label>
              <Input
                id="apiKey"
                type="password"
                value={config.apiKey || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Su API key de HubSpot"
              />
              <p className="text-xs text-gray-500">
                Si no se proporciona, se usará la configuración global de HubSpot
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="portal">Portal ID (opcional)</Label>
              <Input
                id="portal"
                value={config.portalId || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, portalId: e.target.value }))}
                placeholder="ID del portal de HubSpot"
              />
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-2">Integración HubSpot</h4>
              <p className="text-sm text-orange-700">
                Esta integración permite al agente interactuar con tu CRM HubSpot para gestionar 
                contactos, deals, empresas y más. El agente podrá consultar y actualizar información 
                según los permisos configurados.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!config.features || config.features.length === 0}
                className="flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                Configurar HubSpot
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}