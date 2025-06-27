import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { databaseService } from '@/services/database.service';
import type { WhatsAppConnection } from '@/services/database.service';

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

const AGENT_OPTIONS = ["Sin asignar", "Agent A", "Agent B", "Agent C"];

export function ConnectionsTable() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [editing, setEditing] = useState<Connection | null>(null);
  const [deletingConnection, setDeletingConnection] = useState<Connection | null>(null);

  // 🔄 SUSCRIBIRSE A CAMBIOS DE LA BASE DE DATOS
  useEffect(() => {
    const handleConnectionsUpdate = () => {
      loadConnections();
    };

    // Suscribirse a cambios en la tabla de conexiones
    databaseService.subscribe('whatsapp_connections', handleConnectionsUpdate);

    // Cargar conexiones iniciales
    loadConnections();

    // Cleanup
    return () => {
      databaseService.unsubscribe('whatsapp_connections', handleConnectionsUpdate);
    };
  }, []);

  const loadConnections = () => {
    try {
      const dbConnections = databaseService.getAllConnections();
      
      // Convertir datos de la BD al formato de la tabla
      const tableConnections: Connection[] = dbConnections.map(conn => ({
        id: conn.id,
        number: conn.phone_number || 'N/A',
        name: conn.name,
        connected: conn.status === 'connected' && conn.instance_state === 'open',
        features: conn.features || ['Bot', 'Webhook', 'Variables', 'Logs'],
        agent: conn.agent_assigned || 'Sin asignar',
        status: conn.status,
        instance_state: conn.instance_state,
        instance_name: conn.instance_name,
        created_at: conn.created_at
      }));
      
      console.log('🔄 Conexiones actualizadas desde BD:', tableConnections.length);
      setConnections(tableConnections);
    } catch (error) {
      console.error('❌ Error cargando conexiones:', error);
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
      // Eliminar de la base de datos
      const deleted = await databaseService.deleteConnection(deletingConnection.id);
      
      if (deleted) {
        console.log(`🗑️ Conexión eliminada: ${deletingConnection.name}`);
      } else {
        console.error('❌ Error eliminando conexión');
      }
    } catch (error) {
      console.error('❌ Error eliminando conexión:', error);
    } finally {
      setDeletingConnection(null);
    }
  };

  const handleEditSave = async () => {
    if (!editing) return;
    
    try {
      // Actualizar en la base de datos
      await databaseService.updateConnection(editing.id, {
        name: editing.name,
        agent_assigned: editing.agent,
        status: editing.connected ? 'connected' : 'inactive'
      });
      
      setEditing(null);
      console.log('✅ Conexión actualizada');
    } catch (error) {
      console.error('❌ Error actualizando conexión:', error);
    }
  };

  const handleReconnect = async (connectionId: string) => {
    try {
      await databaseService.updateConnection(connectionId, {
        status: 'active'
      });
      console.log('🔄 Reconectando:', connectionId);
    } catch (error) {
      console.error('❌ Error reconectando:', error);
    }
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
