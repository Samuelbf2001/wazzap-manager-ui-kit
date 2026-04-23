import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { hubspotApi } from '@/lib/hubspotApi';

interface Connection {
  id: string;
  number: string;
  name: string;
  connected: boolean;
  features: string[];
  agent: string;
  status: 'active' | 'inactive' | 'pending' | 'connected';
  instance_state: string | null;
  instance_name: string | null;
  created_at: string;
}

interface ConnectionsTableProps {
  mode?: 'hubspot' | 'ghl';
  locationId?: string;
}

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'https://whatsfull.sixteam.pro';
const AGENT_OPTIONS = ["Sin asignar", "Agent A", "Agent B", "Agent C"];

export function ConnectionsTable({ mode = 'hubspot', locationId }: ConnectionsTableProps) {
  const isGHL = mode === 'ghl';
  const [connections, setConnections] = useState<Connection[]>([]);
  const [editing, setEditing] = useState<Connection | null>(null);
  const [deletingConnection, setDeletingConnection] = useState<Connection | null>(null);

  useEffect(() => {
    loadConnections();
  }, [mode, locationId]);

  const loadConnections = async () => {
    try {
      if (isGHL) {
        // Cargar canales GHL desde /api/ghl-channels?locationId=
        const url = locationId
          ? `${BACKEND_URL}/api/ghl-channels?locationId=${locationId}`
          : `${BACKEND_URL}/api/ghl-channels`;
        const res  = await fetch(url);
        const data = await res.json();
        const channels = data.channels || [];

        // Para cada canal, consultar el estado real de Evolution
        const tableConnections: Connection[] = await Promise.all(
          channels.map(async (c: Record<string, string | boolean | null>) => {
            let instanceState = 'unknown';
            if (c.evolution_instance) {
              try {
                const stateRes = await fetch(
                  `${BACKEND_URL}/api/channels/state/${encodeURIComponent(c.evolution_instance as string)}`
                );
                const stateData = await stateRes.json();
                instanceState = stateData.state || 'unknown';
              } catch {}
            }
            const connected = instanceState === 'open';
            return {
              id:             String(c.id),
              number:         `+${c.whatsapp_phone_number}`,
              name:           (c.evolution_instance as string) || String(c.whatsapp_phone_number),
              connected,
              features:       ['Webhook', 'Logs'],
              agent:          'Sin asignar',
              status:         connected ? 'connected' : instanceState === 'connecting' ? 'active' : 'inactive',
              instance_state: instanceState,
              instance_name:  (c.evolution_instance as string) || null,
              created_at:     String(c.created_at),
            };
          })
        );
        setConnections(tableConnections);
      } else {
        // Cargar canales HubSpot desde /api/connections
        const res = await hubspotApi.getConnections();
        const tableConnections: Connection[] = res.connections.map(c => ({
          id:             c.channelAccountId,
          number:         c.phoneNumber || 'N/A',
          name:           c.phoneNumber || c.channelAccountId,
          connected:      c.connected,
          features:       ['Bot', 'Webhook', 'Variables', 'Logs'],
          agent:          'Sin asignar',
          status:         c.connected ? 'connected' : c.connectionState === 'connecting' ? 'active' : 'inactive',
          instance_state: c.connectionState,
          instance_name:  c.evolutionInstance,
          created_at:     c.createdAt,
        }));
        setConnections(tableConnections);
      }
    } catch (err) {
      console.error('❌ Error cargando conexiones:', err);
    }
  };

  const handleDelete = (id: string) => {
    const connection = connections.find(c => c.id === id);
    if (connection) {
      setDeletingConnection(connection);
    }
  };

  const confirmDelete = async () => {
    if (!deletingConnection) return;

    try {
      await hubspotApi.deleteChannel(deletingConnection.id);
      setConnections(prev => prev.filter(c => c.id !== deletingConnection.id));
      console.log(`🗑️ Conexión eliminada: ${deletingConnection.name}`);
    } catch (error) {
      console.error('❌ Error eliminando conexión:', error);
    } finally {
      setDeletingConnection(null);
    }
  };

  const handleEditSave = () => {
    if (!editing) return;
    // Actualizar estado local (nombre y agente son solo UI, no se persisten en backend aún)
    setConnections(prev => prev.map(c => c.id === editing.id ? { ...c, name: editing.name, agent: editing.agent } : c));
    setEditing(null);
  };

  const handleReconnect = (connectionId: string) => {
    // Fuerza recarga del estado real desde Evolution
    loadConnections();
    console.log('🔄 Recargando estado de conexión:', connectionId);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Números de WhatsApp Conectados</h2>
      <p className="text-sm text-gray-600 mb-4">Administra tus conexiones de WhatsApp y su estado actual.</p>
      
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-2 text-left">Estado</th>
            <th className="px-4 py-2 text-center">Número</th>
            <th className="px-4 py-2 text-left">Nombre</th>
            <th className="px-4 py-2 text-center">Características</th>
            <th className="px-4 py-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {connections.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                <div>
                  <p className="text-lg font-medium">No hay conexiones</p>
                  <p className="text-sm mt-1">Haz clic en "Nueva conexión" para agregar tu primera conexión de WhatsApp.</p>
                </div>
              </td>
            </tr>
          ) : (
            connections.map(conn => (
              <tr key={conn.id} className="border-t">
                <td className="px-4 py-2 text-left">
                  {conn.connected && conn.instance_state === 'open' ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ● Conectado
                    </span>
                  ) : conn.status === 'active' ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      ⏳ Conectando...
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      ● Desconectado
                    </span>
                  )}
                  {conn.instance_name && (
                    <div className="text-xs text-gray-500 mt-1">
                      Instancia: {conn.instance_name}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    Creado: {new Date(conn.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-4 py-2 text-center">{conn.number}</td>
                <td className="px-4 py-2 text-left">{conn.name}</td>
                <td className="px-4 py-2 text-center space-x-1">
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
                <td className="px-4 py-2 text-center">
                  <div className="flex gap-2 justify-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditing(conn)}
                    >
                      Editar
                    </Button>
                    {!conn.connected && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReconnect(conn.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Reconectar
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(conn.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
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
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditing(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleEditSave}>
                  Guardar cambios
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de confirmación de eliminación */}
      {deletingConnection && (
        <Dialog open={true} onOpenChange={() => setDeletingConnection(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-red-600">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                ¿Eliminar conexión de WhatsApp?
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 mb-4">
                Estás a punto de eliminar permanentemente la conexión:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-red-500">
                <div className="font-semibold text-gray-900">{deletingConnection.name}</div>
                <div className="text-sm text-gray-600">{deletingConnection.number}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Creado: {new Date(deletingConnection.created_at).toLocaleDateString()}
                </div>
              </div>
              <p className="text-sm text-red-600 mt-4 font-medium">
                ⚠️ Esta acción no se puede deshacer
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setDeletingConnection(null)}
                className="px-6"
              >
                No, mantener
              </Button>
              <Button 
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-6"
              >
                Sí, eliminar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
