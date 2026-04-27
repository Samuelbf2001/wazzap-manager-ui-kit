import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Loader2, RefreshCw, Plus, Star } from 'lucide-react';
import { WhatsAppConnectionModal } from '@/components/WhatsAppConnectionModal';
import { QRCodeSVG } from 'qrcode.react';
import { hubspotApi } from '@/lib/hubspotApi';
import { whatsfullApi } from '@/services/whatsfull-api.service';

interface Connection {
  id: string;
  number: string;
  name: string;
  display_name: string;
  is_default: boolean;
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
  hideTitle?: boolean;
  companyId?: string;
}

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'https://whatsfull.sixteam.pro';
const AGENT_OPTIONS = ["Sin asignar", "Agent A", "Agent B", "Agent C"];

export function ConnectionsTable({ mode = 'hubspot', locationId, hideTitle = false, companyId }: ConnectionsTableProps) {
  const isGHL = mode === 'ghl';
  const [connections, setConnections] = useState<Connection[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState<Connection | null>(null);
  const [deletingConnection, setDeletingConnection] = useState<Connection | null>(null);
  const [reconnecting, setReconnecting] = useState<Connection | null>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [qrLoading, setQrLoading] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadConnections();
  }, [mode, locationId]);

  // Limpiar polling al desmontar
  useEffect(() => {
    return () => { if (pollingInterval) clearInterval(pollingInterval); };
  }, [pollingInterval]);

  const loadConnections = async () => {
    try {
      if (isGHL) {
        const url = locationId
          ? `${BACKEND_URL}/api/ghl-channels?locationId=${locationId}`
          : `${BACKEND_URL}/api/ghl-channels`;
        const res  = await fetch(url);
        const data = await res.json();
        const channels = data.channels || [];

        const tableConnections: Connection[] = await Promise.all(
          channels.map(async (c: Record<string, string | boolean | null>) => {
            let instanceState = 'unknown';
            if (c.evolution_instance) {
              try {
                const stateRes = await fetch(
                  `${BACKEND_URL}/api/ghl-channels/state/${encodeURIComponent(c.evolution_instance as string)}`
                );
                const stateData = await stateRes.json();
                instanceState = stateData.state || 'unknown';
              } catch {}
            }
            const connected = instanceState === 'open';
            return {
              id:             String(c.id),
              number:         `+${c.whatsapp_phone_number}`,
              name:           (c.display_name as string) || (c.evolution_instance as string) || String(c.whatsapp_phone_number),
              display_name:   (c.display_name as string) || (c.evolution_instance as string) || String(c.whatsapp_phone_number),
              is_default:     Boolean(c.is_default),
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
    if (connection) setDeletingConnection(connection);
  };

  const confirmDelete = async () => {
    if (!deletingConnection) return;
    try {
      if (isGHL) {
        await whatsfullApi.deleteGHLChannel(deletingConnection.id);
      } else {
        await hubspotApi.deleteChannel(deletingConnection.id);
      }
      setConnections(prev => prev.filter(c => c.id !== deletingConnection.id));
    } catch (error) {
      console.error('❌ Error eliminando conexión:', error);
    } finally {
      setDeletingConnection(null);
    }
  };

  const handleEditSave = async () => {
    if (!editing) return;
    if (isGHL) {
      try {
        await whatsfullApi.updateGHLChannel(editing.id, { displayName: editing.name });
      } catch (err) {
        console.error('❌ Error guardando nombre:', err);
      }
    }
    setConnections(prev => prev.map(c => c.id === editing.id ? { ...c, name: editing.name, display_name: editing.name, agent: editing.agent } : c));
    setEditing(null);
  };

  const handleSetDefault = async (conn: Connection) => {
    if (!isGHL) return;
    try {
      await whatsfullApi.updateGHLChannel(conn.id, { isDefault: true });
      setConnections(prev => prev.map(c => ({ ...c, is_default: c.id === conn.id })));
    } catch (err) {
      console.error('❌ Error marcando como predeterminado:', err);
    }
  };

  const handleReconnect = async (conn: Connection) => {
    if (!conn.instance_name) return;
    setReconnecting(conn);
    setQrCode('');
    setQrLoading(true);

    try {
      const qr = isGHL
        ? await whatsfullApi.getGHLQRCode(conn.instance_name)
        : await whatsfullApi.getQRCode(conn.instance_name);
      setQrCode(qr.base64 || qr.code || '');
    } catch {
      // QR puede tardar unos segundos en estar disponible
    } finally {
      setQrLoading(false);
    }

    // Polling hasta detectar conexión
    if (pollingInterval) clearInterval(pollingInterval);
    const interval = setInterval(async () => {
      try {
        const state = isGHL
          ? await whatsfullApi.getGHLConnectionState(conn.instance_name!)
          : await whatsfullApi.getConnectionState(conn.instance_name!);
        if (state === 'open') {
          clearInterval(interval);
          setPollingInterval(null);
          setReconnecting(null);
          setQrCode('');
          loadConnections();
        }
        // Refrescar QR si sigue pendiente
        if (!qrCode && state !== 'open') {
          try {
            const qr = isGHL
              ? await whatsfullApi.getGHLQRCode(conn.instance_name!)
              : await whatsfullApi.getQRCode(conn.instance_name!);
            if (qr.base64 || qr.code) setQrCode(qr.base64 || qr.code || '');
          } catch {}
        }
      } catch {}
    }, 5000);
    setPollingInterval(interval);
  };

  const handleCloseReconnect = () => {
    if (pollingInterval) { clearInterval(pollingInterval); setPollingInterval(null); }
    setReconnecting(null);
    setQrCode('');
  };

  return (
    <div>
      {!hideTitle && (
        <>
          <h2 className="text-xl font-bold mb-2">Números de WhatsApp Conectados</h2>
          <p className="text-sm text-gray-600 mb-4">Administra tus conexiones de WhatsApp y su estado actual.</p>
        </>
      )}

      {isGHL && locationId && (
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg font-medium"
          >
            <Plus className="w-3 h-3" />
            Agregar número
          </button>
        </div>
      )}

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
                  {isGHL && locationId && (
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar número
                    </button>
                  )}
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
                    <div className="text-xs text-gray-500 mt-1">Instancia: {conn.instance_name}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    Creado: {new Date(conn.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-4 py-2 text-center">{conn.number}</td>
                <td className="px-4 py-2 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-sm">{conn.name}</span>
                    {isGHL && conn.is_default && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                        Predeterminado
                      </span>
                    )}
                  </div>
                  {isGHL && conn.instance_name && (
                    <div className="text-xs text-gray-400 mt-0.5 font-mono">
                      Comando: <span className="text-gray-600">/{conn.instance_name}/</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 text-center space-x-1">
                  {conn.features.map((f, i) => (
                    <span key={i} className={
                      `px-2 py-1 rounded-full text-xs font-medium ` +
                      (f === 'Bot' ? 'bg-blue-100 text-blue-700 ' :
                       f === 'Webhook' ? 'bg-purple-100 text-purple-700 ' :
                       f === 'Variables' ? 'bg-yellow-100 text-yellow-800 ' :
                       f === 'Logs' ? 'bg-green-100 text-green-700 ' : '')
                    }>
                      {f}
                    </span>
                  ))}
                </td>
                <td className="px-4 py-2 text-center">
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => setEditing(conn)}>
                      Editar
                    </Button>
                    {isGHL && !conn.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(conn)}
                        className="text-amber-600 hover:text-amber-700 hover:border-amber-300"
                        title="Usar como número predeterminado para enviar mensajes desde GHL"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Predeterminar
                      </Button>
                    )}
                    {!conn.connected && conn.instance_name && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReconnect(conn)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
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

      {/* Modal QR de reconexión */}
      {reconnecting && (
        <Dialog open={true} onOpenChange={handleCloseReconnect}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reconectar WhatsApp</DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-500">
                Instancia: <span className="font-mono">{reconnecting.instance_name}</span>
              </p>
              <div className="flex justify-center">
                {qrLoading ? (
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Generando QR…</p>
                    </div>
                  </div>
                ) : !qrCode ? (
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Esperando QR…</p>
                    </div>
                  </div>
                ) : qrCode.startsWith('data:image/') ? (
                  <img src={qrCode} alt="QR Code" className="w-48 h-48 border rounded" />
                ) : (
                  <QRCodeSVG value={qrCode} size={200} />
                )}
              </div>
              <p className="text-sm text-gray-600">
                WhatsApp → Ajustes → Dispositivos vinculados → Vincular dispositivo
              </p>
              <p className="text-xs text-gray-400">Verificando conexión automáticamente…</p>
              <Button variant="outline" onClick={handleCloseReconnect} className="w-full">
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de edición */}
      {editing && (
        <Dialog open={true} onOpenChange={() => setEditing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar conexión</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nombre del número</label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="Ej: Ventas, Soporte, Ernesto..."
                />
                {isGHL && editing.instance_name && (
                  <p className="text-xs text-gray-400">
                    Comando para usar desde GHL:{' '}
                    <span className="font-mono text-gray-600 bg-gray-100 px-1 rounded">
                      /{editing.instance_name}/
                    </span>{' '}
                    al inicio del mensaje
                  </p>
                )}
              </div>
              {!isGHL && (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editing.connected}
                    onCheckedChange={(value) => setEditing({ ...editing, connected: value })}
                  />
                  <span>{editing.connected ? 'Conectado' : 'Desconectado'}</span>
                </div>
              )}
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
                <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                <Button onClick={handleEditSave}>Guardar cambios</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal agregar número desde dentro de la tabla */}
      {showAddModal && isGHL && locationId && (
        <WhatsAppConnectionModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          onConnectionSuccess={() => {
            setShowAddModal(false);
            loadConnections();
          }}
          mode="ghl"
          locationId={locationId}
          companyId={companyId}
        />
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
              <p className="text-gray-600 mb-4">Estás a punto de eliminar permanentemente la conexión:</p>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-red-500">
                <div className="font-semibold text-gray-900">{deletingConnection.name}</div>
                <div className="text-sm text-gray-600">{deletingConnection.number}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Creado: {new Date(deletingConnection.created_at).toLocaleDateString()}
                </div>
              </div>
              <p className="text-sm text-red-600 mt-4 font-medium">⚠️ Esta acción no se puede deshacer</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeletingConnection(null)} className="px-6">
                No, mantener
              </Button>
              <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white px-6">
                Sí, eliminar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
