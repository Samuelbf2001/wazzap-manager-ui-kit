import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Connection {
  id: string;
  number: string;
  name: string;
  connected: boolean;
  features: string[];
  agent: string;
}

const AGENT_OPTIONS = ["Sin asignar", "Agent A", "Agent B", "Agent C"];

export function ConnectionsTable() {
  const [connections, setConnections] = useState<Connection[]>([
    {
      id: '1',
      number: '+34535636325',
      name: 'Nair España',
      connected: false,
      features: ['Bot', 'Variables', 'Logs'],
      agent: 'Sin asignar'
    },
    {
      id: '2',
      number: '+525534394325',
      name: 'Tickets',
      connected: true,
      features: ['Bot', 'Webhook', 'Logs'],
      agent: 'Agent A'
    },
    {
      id: '3',
      number: '+34917944735',
      name: 'Osim - 8min',
      connected: true,
      features: ['Webhook', 'Variables'],
      agent: 'Agent B'
    }
  ]);

  const [editing, setEditing] = useState<Connection | null>(null);

  const handleDelete = (id: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
  };

  const handleEditSave = () => {
    if (!editing) return;
    setConnections(prev => prev.map(conn => (conn.id === editing.id ? editing : conn)));
    setEditing(null);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Números de WhatsApp Conectados</h2>
      <p className="text-sm text-gray-600 mb-4">Administra tus conexiones de WhatsApp y su estado actual.</p>
      
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-2">Estado</th>
            <th className="px-4 py-2">Número</th>
            <th className="px-4 py-2">Nombre</th>
            <th className="px-4 py-2">Características</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {connections.map(conn => (
            <tr key={conn.id} className="border-t">
              <td className="px-4 py-2">
                <span className={`inline-block w-3 h-3 rounded-full ${conn.connected ? 'bg-green-500' : 'bg-red-500'}`} />
              </td>
              <td className="px-4 py-2">{conn.number}</td>
              <td className="px-4 py-2">{conn.name}</td>
              <td className="px-4 py-2 space-x-1">
                {conn.features.map((f, i) => (
                  <span
                    key={i}
                    className={
                      `px-2 py-1 rounded-full text-xs font-medium ` +
                      (f === 'Bot' ? 'bg-blue-100 text-blue-700 ' :
                       f === 'Webhook' ? 'bg-purple-100 text-purple-700 ' :
                       f === 'Variables' ? 'bg-yellow-100 text-yellow-800 ' :
                       f === 'Logs' ? 'bg-green-100 text-green-700 ' : '')
                    }
                  >
                    {f}
                  </span>
                ))}
              </td>
              <td className="px-4 py-2">
                <button onClick={() => setEditing(conn)} className="text-blue-600 hover:underline mr-4">Editar</button>
                <button onClick={() => handleDelete(conn.id)} className="text-red-600 hover:underline">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de edición */}
      {editing && (
        <Dialog open={true} onOpenChange={() => setEditing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar conexión</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="Nombre"
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={editing.connected}
                  onCheckedChange={(value) => setEditing({ ...editing, connected: value })}
                />
                <span>{editing.connected ? 'Conectado' : 'Desconectado'}</span>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Agente IA asignado</label>
                <Select
                  value={editing.agent}
                  onValueChange={(value) => setEditing({ ...editing, agent: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar agente" />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENT_OPTIONS.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleEditSave}>Guardar cambios</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
