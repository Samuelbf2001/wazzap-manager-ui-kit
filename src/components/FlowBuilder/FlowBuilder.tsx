import { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Panel,
  MiniMap,
  BackgroundVariant,
  ConnectionMode,
  ConnectionLineType,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  GitBranch, 
  Clock, 
  Webhook, 
  MapPin, 
  User, 
  MousePointer,
  Database,
  Brain,
  Target,
  Tag,
  Users,
  Play,
  Save,
  Download,
  Upload,
  Eye,
  Trash2,
  Copy,
  Zap,
  MoreHorizontal,
  ClipboardList,
  Bell,
  Plus,
  Workflow,
  Settings2,
  Search,
  Code,
  BarChart3,
  Menu,
  X,
  Smartphone
} from 'lucide-react';

  // Importar nodos mejorados
import { MessageNode } from './nodes/MessageNode';
import { TypingNode } from './nodes/TypingNode';
import { CustomerStageNode } from './nodes/CustomerStageNode';
import { AdvancedConditionNode } from './nodes/AdvancedConditionNode';
import { AIResponseNode } from './nodes/AIResponseNode';
import { WebhookNode } from './nodes/WebhookNode';
import { SurveyNode } from './nodes/SurveyNode';
import { DatabaseNode } from './nodes/DatabaseNode';
import { LocationNode } from './nodes/LocationNode';
import { TagNode } from './nodes/TagNode';
import { TimeoutNode } from './nodes/TimeoutNode';
import { SmartonNode } from './nodes/SmartonNode';

// Importar nuevos módulos creados
import { FormatterNode } from './nodes/FormatterNode';
import { AssignmentNode } from './nodes/AssignmentNode';
import { HttpRequestNode } from './nodes/HttpRequestNode';
import { RecognitionNode } from './nodes/RecognitionNode';
import { MetaConversionsNode } from './nodes/MetaConversionsNode';
import { WhatsAppFlowNode } from './nodes/WhatsAppFlowNode';
import { AIAgentNode } from './nodes/AIAgentNode';

// Nodos básicos (mantener compatibilidad)
import { ConditionNode } from './nodes/ConditionNode';

// Tipos de nodos mejorados
const nodeTypes = {
  // Comunicación WhatsApp
  enhancedMessage: MessageNode,
  typing: TypingNode,
  survey: SurveyNode,
  location: LocationNode,
  whatsappFlow: WhatsAppFlowNode,
  
  // Lógica y Control
  smartCondition: AdvancedConditionNode,
  timeout: TimeoutNode,
  
  // IA y Automatización
  aiResponse: AIResponseNode,
  aiAgent: AIAgentNode,
  smarton: SmartonNode,
  formatter: FormatterNode,
  
  // Datos y CRM
  customerStage: CustomerStageNode,
  database: DatabaseNode,
  tag: TagNode,
  recognition: RecognitionNode,
  assignment: AssignmentNode,
  
  // Integraciones
  webhook: WebhookNode,
  httpRequest: HttpRequestNode,
  metaConversions: MetaConversionsNode,
  
  // Nodos básicos (compatibilidad)
  message: MessageNode,
  condition: ConditionNode,
};

// Categorías de nodos para el panel de herramientas
const nodeCategories = {
  whatsapp: {
    title: 'WhatsApp',
    icon: Smartphone,
    color: 'bg-green-50 border-green-200',
    nodes: [
      {
        type: 'enhancedMessage',
        title: 'Mensaje Interactivo',
        description: 'Mensaje con botones, listas y media',
        icon: MessageSquare,
        color: 'text-green-600',
        defaultData: {
          label: 'Mensaje',
          message: 'Hola, ¿cómo puedo ayudarte?',
          messageType: 'text',
          interactiveType: 'none',
          hasButtons: false,
          buttons: [],
          hasListMenu: false,
          listMenu: { title: '', sections: [] },
          variables: [],
          formatting: { bold: false, emoji: true }
        }
      },
      {
        type: 'typing',
        title: 'Clasificación IA',
        description: 'Clasifica intenciones y estados',
        icon: Brain,
        color: 'text-purple-600',
        defaultData: {
          label: 'Clasificación',
          classificationTypes: ['intention', 'sentiment'],
          confidence: 0.8,
          aiProvider: 'openai'
        }
      },
      {
        type: 'survey',
        title: 'Encuesta',
        description: 'Recopila información con encuestas',
        icon: ClipboardList,
        color: 'text-pink-600',
        defaultData: {
          label: 'Encuesta',
          title: 'Encuesta de Satisfacción',
          surveyType: 'satisfaction',
          questions: []
        }
      },
      {
        type: 'location',
        title: 'Ubicación',
        description: 'Solicita ubicación del usuario',
        icon: MapPin,
        color: 'text-red-600',
        defaultData: {
          label: 'Ubicación',
          requestMessage: 'Por favor comparte tu ubicación',
          locationType: 'current'
        }
      },
      {
        type: 'whatsappFlow',
        title: 'WhatsApp Flow',
        description: 'Flujos estructurados de Meta',
        icon: Workflow,
        color: 'text-emerald-600',
        defaultData: {
          label: 'WhatsApp Flow',
          template: '',
          title: '',
          description: ''
        }
      }
    ]
  },
  logic: {
    title: 'Lógica',
    icon: GitBranch,
    color: 'bg-purple-50 border-purple-200',
    nodes: [
      {
        type: 'smartCondition',
        title: 'Condición Inteligente',
        description: 'Condiciones con IA y reglas avanzadas',
        icon: GitBranch,
        color: 'text-purple-600',
        defaultData: {
          label: 'Condición',
          mode: 'simple',
          rules: []
        }
      },
      {
        type: 'timeout',
        title: 'Timeout',
        description: 'Espera o timeout con acciones',
        icon: Clock,
        color: 'text-orange-600',
        defaultData: {
          label: 'Timeout',
          delay: 5000,
          timeoutAction: 'continue'
        }
      }
    ]
  },
  ai: {
    title: 'IA & Automatización',
    icon: Brain,
    color: 'bg-blue-50 border-blue-200',
    nodes: [
      {
        type: 'aiAgent',
        title: 'Agente IA',
        description: 'Agente IA completo con herramientas',
        icon: Brain,
        color: 'text-purple-600',
        defaultData: {
          label: 'Agente IA',
          agentType: 'conversational',
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000,
          systemPrompt: 'Eres un asistente virtual útil y amigable.',
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
          maxRequestsPerMinute: 60
        }
      },
      {
        type: 'aiResponse',
        title: 'Respuesta IA',
        description: 'Genera respuestas con IA',
        icon: Brain,
        color: 'text-blue-600',
        defaultData: {
          label: 'IA',
          prompt: 'Genera una respuesta apropiada',
          model: 'gpt-3.5-turbo'
        }
      },
      {
        type: 'recognition',
        title: 'Reconocimiento',
        description: 'Reconoce patrones e intenciones',
        icon: Target,
        color: 'text-cyan-600',
        defaultData: {
          label: 'Reconocimiento',
          patterns: [],
          confidence: 0.8
        }
      },
      {
        type: 'formatter',
        title: 'Formateador',
        description: 'Formatea y transforma datos',
        icon: Code,
        color: 'text-indigo-600',
        defaultData: {
          label: 'Formato',
          inputFormat: 'text',
          outputFormat: 'json'
        }
      }
    ]
  },
  data: {
    title: 'Datos & CRM',
    icon: Database,
    color: 'bg-gray-50 border-gray-200',
    nodes: [
      {
        type: 'database',
        title: 'Base de Datos',
        description: 'Operaciones CRUD en BD',
        icon: Database,
        color: 'text-gray-600',
        defaultData: {
          label: 'BD',
          operation: 'select',
          table: 'users'
        }
      },
      {
        type: 'customerStage',
        title: 'Etapa Cliente',
        description: 'Actualiza etapa del cliente',
        icon: Users,
        color: 'text-green-600',
        defaultData: {
          label: 'Etapa',
          stage: 'lead'
        }
      },
      {
        type: 'tag',
        title: 'Etiquetas',
        description: 'Gestiona etiquetas del contacto',
        icon: Tag,
        color: 'text-yellow-600',
        defaultData: {
          label: 'Tag',
          action: 'add',
          tags: []
        }
      },
      {
        type: 'assignment',
        title: 'Asignación',
        description: 'Asigna variables y valores',
        icon: Target,
        color: 'text-teal-600',
        defaultData: {
          label: 'Asignar',
          assignments: []
        }
      }
    ]
  },
  integrations: {
    title: 'Integraciones',
    icon: Zap,
    color: 'bg-yellow-50 border-yellow-200',
    nodes: [
      {
        type: 'webhook',
        title: 'Webhook',
        description: 'Llamadas HTTP a APIs externas',
        icon: Webhook,
        color: 'text-yellow-600',
        defaultData: {
          label: 'Webhook',
          url: 'https://api.ejemplo.com/webhook',
          method: 'POST'
        }
      },
      {
        type: 'httpRequest',
        title: 'HTTP Request',
        description: 'Peticiones HTTP avanzadas',
        icon: Zap,
        color: 'text-blue-600',
        defaultData: {
          label: 'HTTP',
          url: 'https://api.ejemplo.com',
          method: 'GET'
        }
      },
      {
        type: 'metaConversions',
        title: 'Meta Conversiones',
        description: 'Envía eventos a Meta/Facebook',
        icon: BarChart3,
        color: 'text-blue-700',
        defaultData: {
          label: 'Meta',
          eventType: 'Purchase',
          value: 0
        }
      }
    ]
  }
};

/**
 * Componente FlowBuilder Responsivo
 * 
 * Constructor de flujos completamente responsivo que se adapta a:
 * - Desktop: Panel lateral fijo + área de trabajo amplia
 * - Tablet: Panel lateral colapsable + controles táctiles
 * - Mobile: Panel lateral como sheet + vista optimizada
 */
interface FlowBuilderProps {
  flowId?: string | null;
  initialFlow?: any;
  mode?: 'edit' | 'readonly';
}

export function FlowBuilder({ flowId, initialFlow, mode = 'edit' }: FlowBuilderProps = {}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [flowName, setFlowName] = useState('Nuevo Flujo');
  const [isToolboxOpen, setIsToolboxOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar flujo inicial si se proporciona
  useEffect(() => {
    if (initialFlow) {
      setNodes(initialFlow.nodes || []);
      setEdges(initialFlow.edges || []);
      setFlowName(initialFlow.name || 'Flujo sin nombre');
    }
  }, [initialFlow, setNodes, setEdges]);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Función mejorada para manejar conexiones
  const onConnect = useCallback(
    (params: Connection) => {
      // Configurar el estilo de la conexión
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        style: { 
          stroke: '#3b82f6', 
          strokeWidth: 2,
          strokeDasharray: '0'
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#3b82f6',
          width: 20,
          height: 20,
        },
        // Configuraciones para mejorar la experiencia de conexión
        deletable: true,
        focusable: true,
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Función para validar conexiones (opcional - permite más flexibilidad)
  const isValidConnection = useCallback((connection: Connection) => {
    // Permitir todas las conexiones por defecto para mayor flexibilidad
    // Aquí se pueden agregar validaciones específicas si es necesario
    return true;
  }, []);

  // Función para manejar clics en edges (para facilitar desconexión)
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    // Agregar confirmación visual antes de eliminar
    const shouldDelete = window.confirm('¿Deseas eliminar esta conexión?');
    if (shouldDelete) {
      setEdges((edges) => edges.filter((e) => e.id !== edge.id));
    }
  }, [setEdges]);

  // Función para manejar hover en edges
  const onEdgeMouseEnter = useCallback((event: React.MouseEvent, edge: Edge) => {
    // Cambiar el cursor para indicar que es clickeable
    (event.currentTarget as HTMLElement).style.cursor = 'pointer';
    // Resaltar visualmente la conexión
    setEdges((edges) => 
      edges.map((e) => 
        e.id === edge.id 
          ? { ...e, style: { ...e.style, strokeWidth: 3, stroke: '#ef4444' } }
          : e
      )
    );
  }, [setEdges]);

  const onEdgeMouseLeave = useCallback((event: React.MouseEvent, edge: Edge) => {
    // Restaurar el estilo original
    setEdges((edges) => 
      edges.map((e) => 
        e.id === edge.id 
          ? { ...e, style: { ...e.style, strokeWidth: 2, stroke: '#3b82f6' } }
          : e
      )
    );
  }, [setEdges]);

  // Configuración del estilo de conexión mientras se arrastra
  const connectionLineStyle = {
    stroke: '#3b82f6',
    strokeWidth: 3,
    strokeDasharray: '5,5',
  };

  // Configuraciones por defecto para los edges
  const defaultEdgeOptions = {
    type: 'smoothstep',
    animated: true,
    style: { 
      stroke: '#3b82f6', 
      strokeWidth: 2 
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#3b82f6',
    },
  };

  const onDragStart = (event: React.DragEvent, nodeType: string, defaultData: any) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/nodedata', JSON.stringify(defaultData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const nodeDataStr = event.dataTransfer.getData('application/nodedata');
      
      if (!type) return;

      const position = {
        x: event.clientX - 250,
        y: event.clientY - 100,
      };

      let nodeData;
      try {
        nodeData = JSON.parse(nodeDataStr);
      } catch {
        nodeData = { label: type };
      }

      const newNode: Node = {
        id: `${type}_${Date.now()}`,
        type,
        position,
        data: nodeData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const saveFlow = () => {
    if (mode === 'readonly') return;
    
    if (flowId) {
      // Actualizar flujo existente
      try {
        const { FlowsService } = require('@/services/flows.service');
        FlowsService.updateFlow({
          id: flowId,
          name: flowName,
          nodes,
          edges
        });
        console.log('Flujo actualizado:', flowId);
      } catch (error) {
        console.error('Error al actualizar flujo:', error);
      }
    } else {
      // Guardar temporalmente para flujos nuevos
      const flowData = {
        name: flowName,
        nodes,
        edges,
        timestamp: new Date().toISOString()
      };
      console.log('Guardando flujo temporal:', flowData);
      localStorage.setItem('flowBuilder_currentFlow', JSON.stringify(flowData));
    }
  };

  const exportFlow = () => {
    const flowData = { name: flowName, nodes, edges };
    const dataStr = JSON.stringify(flowData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${flowName.replace(/\s+/g, '_')}.json`;
    link.click();
  };

  const clearFlow = () => {
    if (mode === 'readonly') return;
    
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
  };

  // Filtrar nodos por búsqueda
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return nodeCategories;
    
    const filtered = {} as any;
    Object.entries(nodeCategories).forEach(([key, category]) => {
      const filteredNodes = category.nodes.filter((node: any) => 
        node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (filteredNodes.length > 0) {
        filtered[key] = { ...category, nodes: filteredNodes };
      }
    });
    
    return filtered;
  }, [searchTerm]);

  // Render del panel de herramientas
  const renderToolbox = () => (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header del toolbox */}
      <div className="p-4 border-b bg-white flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Módulos</h3>
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsToolboxOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar módulos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de categorías */}
      <div className="flex-1 overflow-y-auto">
        <ScrollArea className="h-full toolbox-scroll">
          <div className="p-4 space-y-4">
            {Object.entries(filteredCategories).map(([categoryKey, category]: [string, any]) => (
              <Card key={categoryKey} className={`${category.color} border-2`}>
                <div className="p-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <category.icon className="h-5 w-5" />
                    <h4 className="font-medium text-sm">{category.title}</h4>
                  </div>
                  
                  <div className="grid gap-2">
                    {category.nodes.map((node: any) => (
                      <div
                        key={node.type}
                        draggable
                        onDragStart={(e) => onDragStart(e, node.type, node.defaultData)}
                        className="flex items-center space-x-3 p-2 bg-white rounded-lg border border-gray-200 cursor-move hover:shadow-sm hover:border-gray-300 transition-all"
                      >
                        <node.icon className={`h-4 w-4 ${node.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {node.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {node.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header responsivo */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0 min-h-[60px]">
        <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
            {/* Botón de menú móvil */}
            {isMobile && mode !== 'readonly' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsToolboxOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            
            {/* Título del flujo */}
            <div className="flex items-center space-x-3">
              <GitBranch className="h-6 w-6 text-blue-600" />
              {mode === 'readonly' ? (
                <h1 className="font-semibold text-lg text-gray-900">
                  {flowName}
                </h1>
              ) : (
                <Input
                  value={flowName}
                  onChange={(e) => setFlowName(e.target.value)}
                  className="font-semibold border-none p-0 h-auto bg-transparent focus:bg-white focus:border-gray-300"
                />
              )}
            </div>
          </div>

          {/* Acciones del header */}
          <div className="flex items-center space-x-2">
            {mode === 'readonly' ? (
              <>
                <Badge variant="secondary" className="mr-2">
                  <Eye className="h-3 w-3 mr-1" />
                  Solo lectura
                </Badge>
                <Button variant="outline" size="sm" onClick={exportFlow}>
                  <Download className="h-4 w-4 mr-1" />
                  {!isMobile && "Exportar"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={clearFlow}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  {!isMobile && "Limpiar"}
                </Button>
                <Button variant="outline" size="sm" onClick={saveFlow}>
                  <Save className="h-4 w-4 mr-1" />
                  {!isMobile && "Guardar"}
                </Button>
                <Button variant="outline" size="sm" onClick={exportFlow}>
                  <Download className="h-4 w-4 mr-1" />
                  {!isMobile && "Exportar"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex overflow-hidden min-h-0" style={{ height: 'calc(100vh - 60px)' }}>
        {/* Panel de herramientas - Desktop */}
        {!isMobile && mode !== 'readonly' && (
          <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-hidden flex-shrink-0 h-full">
            {renderToolbox()}
          </div>
        )}

        {/* Panel de herramientas - Mobile (Sheet) */}
        {isMobile && (
          <Sheet open={isToolboxOpen} onOpenChange={setIsToolboxOpen}>
            <SheetContent side="left" className="w-80 p-0 h-full">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Módulos del Flujo</SheetTitle>
                <SheetDescription>
                  Arrastra los módulos al área de trabajo para construir tu flujo
                </SheetDescription>
              </SheetHeader>
              {renderToolbox()}
            </SheetContent>
          </Sheet>
        )}

        {/* Área de trabajo principal */}
        <div className="flex-1 relative min-w-0 h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={mode === 'readonly' ? undefined : onNodesChange}
            onEdgesChange={mode === 'readonly' ? undefined : onEdgesChange}
            onConnect={mode === 'readonly' ? undefined : onConnect}
            onDrop={mode === 'readonly' ? undefined : onDrop}
            onDragOver={mode === 'readonly' ? undefined : onDragOver}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            connectionLineType={ConnectionLineType.SmoothStep}
            connectionLineStyle={connectionLineStyle}
            defaultEdgeOptions={defaultEdgeOptions}
            isValidConnection={mode === 'readonly' ? () => false : isValidConnection}
            onEdgeClick={mode === 'readonly' ? undefined : onEdgeClick}
            onEdgeMouseEnter={mode === 'readonly' ? undefined : onEdgeMouseEnter}
            onEdgeMouseLeave={mode === 'readonly' ? undefined : onEdgeMouseLeave}
            snapToGrid={true}
            snapGrid={[15, 15]}
            nodesDraggable={mode !== 'readonly'}
            nodesConnectable={mode !== 'readonly'}
            elementsSelectable={true}
            selectNodesOnDrag={false}
            panOnDrag={true}
            zoomOnDoubleClick={false}
            deleteKeyCode={mode === 'readonly' ? [] : ['Backspace', 'Delete']}
            multiSelectionKeyCode={['Control', 'Meta']}
            fitView
            fitViewOptions={{
              padding: 0.2,
              includeHiddenNodes: false,
            }}
            className="w-full h-full"
            style={{ height: '100%', width: '100%' }}
          >
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1}
              color="#e5e7eb"
            />
            
            {/* Controles */}
            <Controls 
              className="bg-white border border-gray-200 rounded-lg shadow-sm"
              showZoom={!isMobile}
              showFitView
              showInteractive={false}
            />
            
            {/* Mini mapa - solo en desktop */}
            {!isMobile && (
              <MiniMap 
                className="bg-white border border-gray-200 rounded-lg"
                zoomable
                pannable
                nodeColor="#3b82f6"
                maskColor="rgba(0, 0, 0, 0.2)"
              />
            )}

            {/* Panel de información */}
            <Panel position="top-right">
              <Card className="w-64 bg-white shadow-sm">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">Estado del Flujo</h4>
                    <Badge variant="outline">{nodes.length} nodos</Badge>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Conexiones: {edges.length}</div>
                    <div>Guardado: {new Date().toLocaleTimeString()}</div>
                  </div>
                </div>
              </Card>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      {/* Mensaje de ayuda para móvil */}
      {isMobile && nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Card className="p-6 text-center max-w-sm mx-4">
            <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">
              Constructor de Flujos Móvil
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Toca el botón de menú para acceder a los módulos y comenzar a construir tu flujo.
            </p>
            <Button onClick={() => setIsToolboxOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Módulos
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
} 