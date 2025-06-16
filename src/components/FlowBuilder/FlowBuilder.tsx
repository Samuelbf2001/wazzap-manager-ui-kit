import { useState, useCallback, useEffect } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { FlowNode } from './nodes/FlowNode';
import { MessageNode } from './nodes/MessageNode';
import { ConditionNode } from './nodes/ConditionNode';
import { DelayNode } from './nodes/DelayNode';
import { WebhookNode } from './nodes/WebhookNode';
import { TemplateNode } from './nodes/TemplateNode';
import { MediaNode } from './nodes/MediaNode';
import { ListNode } from './nodes/ListNode';
import { LocationNode } from './nodes/LocationNode';
import { ContactNode } from './nodes/ContactNode';
import { InteractiveNode } from './nodes/InteractiveNode';
import { NodeProperties } from './NodeProperties';

const nodeTypes = {
  message: MessageNode,
  condition: ConditionNode,
  delay: DelayNode,
  webhook: WebhookNode,
  template: TemplateNode,
  media: MediaNode,
  list: ListNode,
  location: LocationNode,
  contact: ContactNode,
  interactive: InteractiveNode,
};

// Flujo de ejemplo predeterminado
const defaultNodes: Node[] = [
  {
    id: 'start',
    type: 'message',
    position: { x: 250, y: 50 },
    data: { 
      label: 'Bienvenida',
      message: '¡Hola! Bienvenido a nuestro servicio. ¿En qué puedo ayudarte hoy?'
    },
  },
  {
    id: 'options',
    type: 'list',
    position: { x: 250, y: 200 },
    data: { 
      label: 'Opciones',
      title: 'Selecciona una opción',
      description: 'Elige el servicio que necesitas',
      buttonText: 'Ver opciones',
      options: [
        { id: '1', title: 'Información de productos' },
        { id: '2', title: 'Soporte técnico' },
        { id: '3', title: 'Contactar vendedor' }
      ]
    },
  },
  {
    id: 'condition',
    type: 'condition',
    position: { x: 250, y: 350 },
    data: { 
      label: 'Validar selección',
      conditionType: 'text',
      operator: 'equals',
      value: '1'
    },
  },
  {
    id: 'product-info',
    type: 'message',
    position: { x: 100, y: 500 },
    data: { 
      label: 'Info Productos',
      message: 'Aquí tienes información sobre nuestros productos...'
    },
  },
  {
    id: 'support',
    type: 'message',
    position: { x: 400, y: 500 },
    data: { 
      label: 'Soporte',
      message: 'Nuestro equipo de soporte te ayudará...'
    },
  },
  {
    id: 'contact',
    type: 'contact',
    position: { x: 250, y: 650 },
    data: { 
      label: 'Contacto Vendedor',
      contact: {
        name: 'Juan Pérez',
        phone: '+1234567890'
      }
    },
  }
];

const defaultEdges: Edge[] = [
  {
    id: 'start-to-options',
    source: 'start',
    target: 'options',
    type: 'smoothstep',
  },
  {
    id: 'options-to-condition',
    source: 'options',
    target: 'condition',
    type: 'smoothstep',
  },
  {
    id: 'condition-to-products',
    source: 'condition',
    target: 'product-info',
    type: 'smoothstep',
    sourceHandle: 'true',
  },
  {
    id: 'condition-to-support',
    source: 'condition',
    target: 'support',
    type: 'smoothstep',
    sourceHandle: 'false',
  },
  {
    id: 'products-to-contact',
    source: 'product-info',
    target: 'contact',
    type: 'smoothstep',
  },
  {
    id: 'support-to-contact',
    source: 'support',
    target: 'contact',
    type: 'smoothstep',
  }
];

export function FlowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNewNode = (type: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 100, y: 100 },
      data: { label: `Nuevo ${type}` },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const updateNodeData = (nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
            },
          };
        }
        return node;
      })
    );
  };

  return (
    <div className="h-screen w-full">
      <div className="flex h-full">
        {/* Panel de herramientas */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-4">Módulos</h2>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addNewNode('message')}
            >
              Mensaje de texto
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addNewNode('media')}
            >
              Imagen/Video
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addNewNode('template')}
            >
              Plantilla
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addNewNode('list')}
            >
              Lista de opciones
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addNewNode('condition')}
            >
              Condición
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addNewNode('delay')}
            >
              Espera
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addNewNode('webhook')}
            >
              Webhook
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addNewNode('location')}
            >
              Ubicación
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addNewNode('contact')}
            >
              Contacto
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addNewNode('interactive')}
            >
              Botones interactivos
            </Button>
          </div>
        </div>

        {/* Área de diseño */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => setSelectedNode(node)}
            fitView
          >
            <Background />
            <Controls />
            <Panel position="top-right">
              <Button
                variant="outline"
                onClick={() => {
                  console.log('Guardar flujo:', { nodes, edges });
                }}
              >
                Guardar flujo
              </Button>
            </Panel>
          </ReactFlow>
        </div>

        {/* Panel de propiedades */}
        {selectedNode && (
          <div className="w-80 bg-white border-l border-gray-200 p-4">
            <h2 className="text-lg font-semibold mb-4">Propiedades</h2>
            <NodeProperties
              node={selectedNode}
              onUpdate={updateNodeData}
            />
          </div>
        )}
      </div>
    </div>
  );
} 