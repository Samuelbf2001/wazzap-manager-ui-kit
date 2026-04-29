/**
 * GHLMonitorPage — Monitor en tiempo real de instancias GHL/WhatsApp.
 * Incluye configuración de alertas de desconexión por instancia.
 */
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Wifi,
  WifiOff,
  Phone,
  Building2,
  Clock,
  Trash2,
  QrCode,
  Bell,
  BellOff,
  History,
  Send,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { whatsfullApi, alertApi } from '@/services/whatsfull-api.service';
import type { AlertConfig, DisconnectEvent } from '@/services/whatsfull-api.service';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'https://whatsfull.sixteam.pro';
const POLL_INTERVAL_MS = 30_000;

interface GHLChannel {
  id: number;
  location_id: string;
  whatsapp_phone_number: string;
  evolution_instance: string;
  provider: string;
  company_id: string;
  authorized: boolean;
  created_at: string;
}

type InstanceState = 'open' | 'connecting' | 'close' | 'unknown';

interface ChannelWithState extends GHLChannel {
  state: InstanceState;
  stateLoading: boolean;
}

// ─── Badge de estado ──────────────────────────────────────────────────────────

function StateBadge({ state, loading }: { state: InstanceState; loading: boolean }) {
  if (loading) {
    return (
      <Badge variant="outline" className="text-gray-500 border-gray-300">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Verificando
      </Badge>
    );
  }
  switch (state) {
    case 'open':
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Conectado
        </Badge>
      );
    case 'connecting':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Conectando...
        </Badge>
      );
    case 'close':
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <WifiOff className="w-3 h-3 mr-1" />
          Desconectado
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-gray-500 border-gray-300">
          Desconocido
        </Badge>
      );
  }
}

// ─── Badge de evento ──────────────────────────────────────────────────────────

function EventBadge({ type }: { type: string }) {
  if (type === 'reconnected') {
    return <Badge className="bg-green-100 text-green-800 text-xs">Reconectado</Badge>;
  }
  if (type === 'test') {
    return <Badge className="bg-blue-100 text-blue-800 text-xs">Prueba</Badge>;
  }
  return <Badge className="bg-red-100 text-red-800 text-xs">Desconectado</Badge>;
}

// ─── Modal de Alertas ─────────────────────────────────────────────────────────

interface AlertModalProps {
  channel: ChannelWithState;
  onClose: () => void;
}

function AlertModal({ channel, onClose }: AlertModalProps) {
  const [config, setConfig]       = useState<AlertConfig | null>(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [testing, setTesting]     = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; status?: number; error?: string } | null>(null);
  const [events, setEvents]       = useState<DisconnectEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [saveMsg, setSaveMsg]     = useState('');

  const instanceName = channel.evolution_instance;

  useEffect(() => {
    Promise.all([
      alertApi.getAlertConfig(instanceName).then(setConfig).catch(() => {
        setConfig({
          instance_name:        instanceName,
          location_id:          channel.location_id,
          alert_enabled:        true,
          notify_on_disconnect: true,
          notify_on_reconnect:  false,
          webhook_url:          null,
        });
      }),
      alertApi.getDisconnectEvents(instanceName, 10).then(setEvents).catch(() => setEvents([])),
    ]).finally(() => {
      setLoading(false);
      setEventsLoading(false);
    });
  }, [instanceName, channel.location_id]);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const saved = await alertApi.upsertAlertConfig(instanceName, {
        ...config,
        location_id: channel.location_id,
      });
      setConfig(saved);
      setSaveMsg('Configuración guardada correctamente');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!config?.webhook_url) return;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await alertApi.testAlertWebhook(instanceName, config.webhook_url);
      setTestResult(result);
    } catch {
      setTestResult({ success: false, error: 'No se pudo conectar al backend' });
    } finally {
      setTesting(false);
    }
  };

  const refreshEvents = async () => {
    setEventsLoading(true);
    try {
      const evts = await alertApi.getDisconnectEvents(instanceName, 10);
      setEvents(evts);
    } finally {
      setEventsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Alertas de Desconexión
          </DialogTitle>
          <p className="text-sm text-gray-500 font-normal">
            Instancia: <span className="font-mono">{instanceName}</span>
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : config ? (
          <div className="space-y-5">
            {/* Alertas activas */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Alertas activas</Label>
                <p className="text-xs text-gray-500">Recibir notificaciones de cambios de estado</p>
              </div>
              <Switch
                checked={config.alert_enabled}
                onCheckedChange={(v) => setConfig({ ...config, alert_enabled: v })}
              />
            </div>

            <Separator />

            {/* Opciones de notificación */}
            <div className={`space-y-3 ${!config.alert_enabled ? 'opacity-40 pointer-events-none' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Notificar al desconectar</Label>
                  <p className="text-xs text-gray-500">Cuando WhatsApp pierde conexión</p>
                </div>
                <Switch
                  checked={config.notify_on_disconnect}
                  onCheckedChange={(v) => setConfig({ ...config, notify_on_disconnect: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Notificar al reconectar</Label>
                  <p className="text-xs text-gray-500">Cuando WhatsApp vuelve a conectarse</p>
                </div>
                <Switch
                  checked={config.notify_on_reconnect}
                  onCheckedChange={(v) => setConfig({ ...config, notify_on_reconnect: v })}
                />
              </div>
            </div>

            <Separator />

            {/* Webhook URL */}
            <div className={`space-y-2 ${!config.alert_enabled ? 'opacity-40 pointer-events-none' : ''}`}>
              <Label className="text-sm font-medium">URL del Webhook</Label>
              <p className="text-xs text-gray-500">
                Se enviará un POST con JSON al detectar el evento configurado
              </p>
              <Input
                placeholder="https://hooks.ejemplo.com/mi-webhook"
                value={config.webhook_url || ''}
                onChange={(e) => setConfig({ ...config, webhook_url: e.target.value || null })}
                className="font-mono text-sm"
              />
              {config.webhook_url && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTest}
                    disabled={testing}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {testing ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Probar webhook
                  </Button>
                  {testResult && (
                    <span className={`text-xs font-medium ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                      {testResult.success
                        ? `HTTP ${testResult.status}`
                        : testResult.error || 'Error'}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Guardar */}
            <div className="flex items-center gap-3 pt-1">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Guardar configuración
              </Button>
              {saveMsg && (
                <span className={`text-xs ${saveMsg.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                  {saveMsg}
                </span>
              )}
            </div>

            <Separator />

            {/* Historial */}
            <div>
              <button
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 w-full"
                onClick={() => { setShowHistory(!showHistory); if (!showHistory) refreshEvents(); }}
              >
                <History className="w-4 h-4" />
                Historial de eventos
                <span className="ml-auto text-xs text-gray-400">
                  {showHistory ? 'Ocultar' : 'Mostrar'}
                </span>
              </button>

              {showHistory && (
                <div className="mt-3 space-y-2">
                  {eventsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  ) : events.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      Sin eventos registrados aún
                    </p>
                  ) : (
                    events.map((evt) => (
                      <div
                        key={evt.id}
                        className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <EventBadge type={evt.event_type} />
                            <span className="text-gray-500 font-mono">
                              {evt.previous_state ?? '?'} → {evt.new_state}
                            </span>
                          </div>
                          <div className="text-gray-400">
                            {format(new Date(evt.created_at), "dd/MM/yyyy HH:mm:ss", { locale: es })}
                          </div>
                        </div>
                        <div className="text-right">
                          {evt.alert_sent ? (
                            <span className="text-green-600 font-medium">
                              Alerta enviada {evt.alert_webhook_status ? `[${evt.alert_webhook_status}]` : ''}
                            </span>
                          ) : (
                            <span className="text-gray-400">Sin alerta</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function GHLMonitorPage() {
  const navigate = useNavigate();

  const [channels, setChannels] = useState<ChannelWithState[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // QR modal
  const [reconnecting, setReconnecting]   = useState<ChannelWithState | null>(null);
  const [qrCode, setQrCode]               = useState<string>('');
  const [qrLoading, setQrLoading]         = useState(false);
  const [qrPolling, setQrPolling]         = useState<ReturnType<typeof setInterval> | null>(null);

  // Delete confirm
  const [deleting, setDeleting] = useState<ChannelWithState | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Alert config modal
  const [alertChannel, setAlertChannel] = useState<ChannelWithState | null>(null);

  // ─── Fetch channels + states ────────────────────────────────────────────────

  const fetchChannels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ghl-channels`);
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Error al cargar canales');

      const list: GHLChannel[] = data.channels || [];

      // Fase 1: mostrar lista con loading
      const initial: ChannelWithState[] = list.map((ch) => ({
        ...ch,
        state: 'unknown',
        stateLoading: true,
      }));
      setChannels(initial);
      setLastUpdated(new Date());

      // Fase 2: obtener estado de cada instancia en paralelo
      const stateResults = await Promise.allSettled(
        list.map((ch) =>
          fetch(`${BACKEND_URL}/api/ghl-channels/state/${encodeURIComponent(ch.evolution_instance)}`)
            .then((r) => r.json())
            .then((d) => ({ id: ch.id, state: (d.state as InstanceState) || 'unknown' }))
            .catch(() => ({ id: ch.id, state: 'unknown' as InstanceState }))
        )
      );

      setChannels((prev) =>
        prev.map((ch) => {
          const result = stateResults.find(
            (r) => r.status === 'fulfilled' && r.value.id === ch.id
          );
          if (result && result.status === 'fulfilled') {
            return { ...ch, state: result.value.state, stateLoading: false };
          }
          return { ...ch, state: 'unknown', stateLoading: false };
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial + polling cada 30s
  useEffect(() => {
    fetchChannels();
    const interval = setInterval(fetchChannels, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchChannels]);

  // Limpiar QR polling al desmontar
  useEffect(() => {
    return () => { if (qrPolling) clearInterval(qrPolling); };
  }, [qrPolling]);

  // ─── Stats ─────────────────────────────────────────────────────────────────

  const total        = channels.length;
  const connected    = channels.filter((c) => c.state === 'open').length;
  const disconnected = channels.filter((c) => c.state === 'close').length;

  // ─── Reconectar ────────────────────────────────────────────────────────────

  const handleReconnect = async (ch: ChannelWithState) => {
    setReconnecting(ch);
    setQrCode('');
    setQrLoading(true);

    try {
      const qr = await whatsfullApi.getGHLQRCode(ch.evolution_instance);
      setQrCode(qr.base64 || qr.code || '');
    } catch {
      // El QR puede tardar unos segundos
    } finally {
      setQrLoading(false);
    }

    // Polling hasta detectar 'open'
    if (qrPolling) clearInterval(qrPolling);
    const interval = setInterval(async () => {
      try {
        const state = await whatsfullApi.getGHLConnectionState(ch.evolution_instance);
        if (state === 'open') {
          clearInterval(interval);
          setQrPolling(null);
          setReconnecting(null);
          setQrCode('');
          fetchChannels();
        }
        // Refrescar QR si todavía está pendiente
        if (!qrCode && state !== 'open') {
          try {
            const qr = await whatsfullApi.getGHLQRCode(ch.evolution_instance);
            if (qr.base64 || qr.code) setQrCode(qr.base64 || qr.code || '');
          } catch {}
        }
      } catch {}
    }, 5_000);
    setQrPolling(interval);
  };

  const handleCloseReconnect = () => {
    if (qrPolling) { clearInterval(qrPolling); setQrPolling(null); }
    setReconnecting(null);
    setQrCode('');
  };

  // ─── Eliminar ──────────────────────────────────────────────────────────────

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await whatsfullApi.deleteGHLChannel(String(deleting.id));
      setChannels((prev) => prev.filter((c) => c.id !== deleting.id));
      setDeleting(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar la instancia');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Monitor de Conexiones GHL"
        subtitle="Estado en tiempo real de instancias WhatsApp · GoHighLevel · Polling cada 30s"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Header acciones */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Instancias WhatsApp</h2>
            <p className="text-sm text-gray-500">
              {lastUpdated && (
                <span className="text-xs text-gray-400">
                  · Actualizado {format(lastUpdated, 'HH:mm:ss', { locale: es })}
                </span>
              )}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchChannels} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <Phone className="w-8 h-8 text-blue-400" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Conectadas</p>
                <p className="text-2xl font-bold text-green-600">{connected}</p>
              </div>
              <Wifi className="w-8 h-8 text-green-400" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Desconectadas</p>
                <p className="text-2xl font-bold text-red-500">{disconnected}</p>
              </div>
              <WifiOff className="w-8 h-8 text-red-400" />
            </CardContent>
          </Card>
        </div>

        {/* Error */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </CardContent>
          </Card>
        )}

        {/* Lista de conexiones */}
        {loading && channels.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-3" />
            Consultando estado en EvolutionAPI...
          </div>
        ) : channels.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-400">
              <Phone className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="font-medium">Sin conexiones configuradas</p>
              <p className="text-sm mt-1">Instala la app desde el Marketplace de GoHighLevel.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {channels.map((ch) => (
              <Card
                key={ch.id}
                className={`border-l-4 ${
                  ch.state === 'open'
                    ? 'border-l-green-400'
                    : ch.state === 'connecting'
                    ? 'border-l-yellow-400'
                    : 'border-l-gray-300'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    {/* Info izquierda */}
                    <div className="flex items-center gap-4">
                      {/* Indicador visual */}
                      <div
                        className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          ch.state === 'open'
                            ? 'bg-green-400 animate-pulse'
                            : ch.state === 'connecting'
                            ? 'bg-yellow-400 animate-pulse'
                            : 'bg-gray-300'
                        }`}
                      />

                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-gray-900 flex items-center gap-1">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {ch.whatsapp_phone_number
                              ? `+${ch.whatsapp_phone_number}`
                              : <span className="text-gray-400 italic">Sin número</span>
                            }
                          </span>
                          <StateBadge state={ch.state} loading={ch.stateLoading} />
                          <Badge variant="secondary" className="text-xs capitalize">
                            {ch.provider || 'evolution'}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            Location: <span className="font-mono">{ch.location_id}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            Instancia: <span className="font-mono">{ch.evolution_instance}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Registrado:{' '}
                            {format(new Date(ch.created_at), 'dd/MM/yyyy', { locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones derecha */}
                    <div className="flex items-center gap-2">
                      {/* Estado raw */}
                      <span
                        className={`text-xs font-mono px-2 py-1 rounded ${
                          ch.state === 'open'
                            ? 'bg-green-50 text-green-700'
                            : ch.state === 'connecting'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-gray-50 text-gray-500'
                        }`}
                      >
                        {ch.stateLoading ? '...' : ch.state}
                      </span>

                      {/* Botón alertas */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAlertChannel(ch)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Configurar alertas de desconexión"
                      >
                        <Bell className="w-3.5 h-3.5 mr-1" />
                        Alertas
                      </Button>

                      {/* Botón reconectar (solo si no está open) */}
                      {ch.state !== 'open' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReconnect(ch)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <QrCode className="w-3.5 h-3.5 mr-1" />
                          Reconectar
                        </Button>
                      )}

                      {/* Botón eliminar */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                        onClick={() => setDeleting(ch)}
                        title="Eliminar instancia"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Alertas */}
      {alertChannel && (
        <AlertModal
          channel={alertChannel}
          onClose={() => setAlertChannel(null)}
        />
      )}

      {/* Modal QR de reconexión */}
      {reconnecting && (
        <Dialog open={true} onOpenChange={handleCloseReconnect}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reconectar WhatsApp</DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-500">
                Instancia: <span className="font-mono">{reconnecting.evolution_instance}</span>
              </p>
              <p className="text-xs text-gray-400">
                Location: <span className="font-mono">{reconnecting.location_id}</span>
              </p>
              <div className="flex justify-center">
                {qrLoading ? (
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Generando QR...</p>
                    </div>
                  </div>
                ) : !qrCode ? (
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Esperando QR...</p>
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
              <p className="text-xs text-gray-400">Verificando conexión automáticamente...</p>
              <Button variant="outline" onClick={handleCloseReconnect} className="w-full">
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal confirmación eliminación */}
      {deleting && (
        <Dialog open={true} onOpenChange={() => setDeleting(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-red-600">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                Eliminar instancia GHL
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 mb-4">
                Estas a punto de eliminar permanentemente la instancia:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-red-500">
                <div className="font-semibold text-gray-900 font-mono text-sm">
                  {deleting.evolution_instance}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Location: <span className="font-mono">{deleting.location_id}</span>
                </div>
                {deleting.whatsapp_phone_number && (
                  <div className="text-sm text-gray-600">
                    Numero: +{deleting.whatsapp_phone_number}
                  </div>
                )}
              </div>
              <p className="text-sm text-red-600 mt-4 font-medium">
                Esta accion no se puede deshacer
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleting(null)}
                disabled={deleteLoading}
                className="px-6"
              >
                No, mantener
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-6"
              >
                {deleteLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Si, eliminar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
