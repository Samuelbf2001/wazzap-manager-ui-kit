import React, { useCallback, useState } from "react";
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
  NodeToolbar,
  ReactFlowProvider,
} from "reactflow";
import { FaRobot, FaQuestion, FaCommentDots, FaClock, FaBolt, FaUser, FaStop, FaTrash, FaPlus } from "react-icons/fa";
import "reactflow/dist/style.css";

// ---- NODE COMPONENTS ---- //
const baseStyle = { borderRadius: 8, padding: 12, minWidth: 140, minHeight: 58, position: "relative", fontSize: 13 };

function MessageNode({ data }: any) {
  return (
    <div style={{ ...baseStyle, background: "#e0ffe0", border: "2px solid #34d399" }}>
      <Handle type="target" position={Position.Left} />
      <FaCommentDots className="inline mr-2 text-green-600" />
      <strong>Mensaje</strong>
      <div className="mt-1">{data.label}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
function DecisionNode({ data }: any) {
  return (
    <div style={{ ...baseStyle, background: "#e0f0ff", border: "2px solid #60a5fa" }}>
      <Handle type="target" position={Position.Left} />
      <FaQuestion className="inline mr-2 text-blue-600" />
      <strong>Decisión</strong>
      <div className="mt-1">{data.label}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
function WaitNode({ data }: any) {
  return (
    <div style={{ ...baseStyle, background: "#fffde0", border: "2px solid #fbbf24" }}>
      <Handle type="target" position={Position.Left} />
      <FaClock className="inline mr-2 text-yellow-600" />
      <strong>Esperar</strong>
      <div className="mt-1">{data.label}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
function InputNode({ data }: any) {
  return (
    <div style={{ ...baseStyle, background: "#f0fff0", border: "2px solid #10b981" }}>
      <Handle type="source" position={Position.Right} />
      <FaUser className="inline mr-2 text-emerald-600" />
      <strong>Inicio</strong>
      <div className="mt-1">{data.label}</div>
    </div>
  );
}
function ActionNode({ data }: any) {
  return (
    <div style={{ ...baseStyle, background: "#f0e0ff", border: "2px solid #a78bfa" }}>
      <Handle type="target" position={Position.Left} />
      <FaBolt className="inline mr-2 text-purple-600" />
      <strong>Acción</strong>
      <div className="mt-1">{data.label}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
function IANode({ data }: any) {
  return (
    <div style={{ ...baseStyle, background: "#e0f7ff", border: "2px solid #06b6d4" }}>
      <Handle type="target" position={Position.Left} />
      <FaRobot className="inline mr-2 text-cyan-600" />
      <strong>IA</strong>
      <div className="mt-1">{data.label}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
function EndNode({ data }: any) {
  return (
    <div style={{ ...baseStyle, background: "#ffe0e0", border: "2px solid #f87171" }}>
      <Handle type="target" position={Position.Left} />
      <FaStop className="inline mr-2 text-red-600" />
      <strong>Fin</strong>
      <div className="mt-1">{data.label}</div>
    </div>
  );
}

const nodeTypes = {
  message: MessageNode,
  decision: DecisionNode,
  wait: WaitNode,
  input: InputNode,
  action: ActionNode,
  ia: IANode,
  end: EndNode,
};

// ---- MAIN COMPONENT ---- //
const defaultNodes: Node[] = [
  {
    id: "1",
    type: "input",
    position: { x: 60, y: 200 },
    data: { label: "Inicio" },
  },
];

const defaultEdges: Edge[] = [];

function getNextId(nodes: Node[]) {
  let max = 0;
  nodes.forEach(n => {
    const num = parseInt(n.id, 10);
    if (!isNaN(num) && num > max) max = num;
  });
  return (max + 1).toString();
}

export default function FlowVisualBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [editNode, setEditNode] = useState<Node | null>(null);
  const [modalLabel, setModalLabel] = useState("");
  const [modalType, setModalType] = useState("");

  // Para exportar/importar
  const handleExport = () => {
    const data = { nodes, edges };
    const json = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(json);
    alert("¡Flujo copiado como JSON! (ya puedes pegarlo en un backup o importador)");
  };
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const { nodes: n, edges: e } = JSON.parse(evt.target?.result as string);
        setNodes(n || []);
        setEdges(e || []);
      } catch (err) {
        alert("JSON inválido");
      }
    };
    reader.readAsText(file);
  };
  const handleClear = () => {
    setNodes(defaultNodes);
    setEdges([]);
  };

  // ---- Para agregar nodos ----
  const [newType, setNewType] = useState("message");
  const [newLabel, setNewLabel] = useState("");
  const handleAddNode = () => {
    if (!newLabel.trim()) return;
    const id = getNextId(nodes);
    const y = nodes.length * 80 + 40;
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: newType,
        data: { label: newLabel },
        position: { x: 250, y },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
    ]);
    setNewLabel("");
  };

  // ---- Editar/eliminar nodos ----
  const onNodeClick = (_: any, node: Node) => {
    setEditNode(node);
    setModalLabel(node.data.label);
    setModalType(node.type || "");
  };
  const handleSaveEdit = () => {
    if (editNode) {
      setNodes((nds) =>
        nds.map((n) => (n.id === editNode.id ? { ...n, data: { ...n.data, label: modalLabel } } : n))
      );
      setEditNode(null);
    }
  };
  const handleDeleteNode = () => {
    if (editNode) {
      setEdges((eds) => eds.filter(e => e.source !== editNode.id && e.target !== editNode.id));
      setNodes((nds) => nds.filter(n => n.id !== editNode.id));
      setEditNode(null);
    }
  };

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <ReactFlowProvider>
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <select
          value={newType}
          onChange={e => setNewType(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="message">💬 Mensaje</option>
          <option value="decision">🔀 Decisión</option>
          <option value="wait">⏳ Esperar</option>
          <option value="action">⚡ Acción</option>
          <option value="ia">🤖 IA</option>
          <option value="end">⏹️ Fin</option>
        </select>
        <input
          className="border rounded px-2 py-1"
          type="text"
          placeholder="Texto del nodo..."
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
        />
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-2"
          onClick={handleAddNode}
        >
          <FaPlus /> Agregar nodo
        </button>
        <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleExport}>Exportar JSON</button>
        <label className="bg-gray-200 text-gray-800 px-3 py-1 rounded cursor-pointer">
          Importar JSON
          <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </label>
        <button className="bg-red-400 text-white px-3 py-1 rounded" onClick={handleClear}>Limpiar flujo</button>
      </div>
      <div style={{ width: "100%", height: 500 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      {/* MODAL Edición nodo */}
      {editNode && (
        <div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-40 z-50"
          onClick={() => setEditNode(null)}
        >
          <div
            className="bg-white rounded-lg p-6 shadow-lg min-w-[300px] z-60"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg mb-2">Editar nodo</h3>
            <p className="mb-2">Tipo: <span className="font-mono">{modalType}</span></p>
            <input
              className="border rounded px-2 py-1 w-full mb-2"
              type="text"
              value={modalLabel}
              onChange={e => setModalLabel(e.target.value)}
            />
            <div className="flex gap-2 justify-between">
              <button
                className="bg-green-500 text-white px-3 py-1 rounded"
                onClick={handleSaveEdit}
              >
                Guardar
              </button>
              <button
                className="bg-gray-300 px-3 py-1 rounded"
                onClick={() => setEditNode(null)}
              >
                Cancelar
              </button>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded flex items-center gap-2"
                onClick={handleDeleteNode}
              >
                <FaTrash /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </ReactFlowProvider>
  );
}
