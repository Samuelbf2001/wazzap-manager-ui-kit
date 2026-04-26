import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  RefreshCw,
  Zap,
  Wifi,
  WifiOff,
  Phone,
  Building2,
  Plus,
  AlertCircle,
  Loader2,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'https://whatsfull.sixteam.pro';

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
  state?: InstanceState;
  stateLoading: boolean;
}

function StateBadge({ state, loading }: { state?: InstanceState; loading: boolean }) {
  if (loading) {
    return (
      <Badge variant="outline" className="text-gray-500 border-gray-300">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Cargando
      </Badge>
    );
  }
  switch (state) {
    case 'open':
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Conectado
        </Badge>
      );
    case 'connecting':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Conectando
        </Badge>
      );
    case 'close':
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
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

export default function GHLDashboardPage() {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<ChannelWithState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchChannels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ghl-channels`);
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Error al cargar los canales');

      const list: GHLChannel[] = data.channels || [];

      // Inicializar con stateLoading=true
      const initial: ChannelWithState[] = list.map((ch) => ({ ...ch, stateLoading: true }));
      setChannels(initial);
      setLastUpdated(new Date());

      // Obtener estado de cada instancia en paralelo
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

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // Stats derivadas
  const total = channels.length;
  const connected = channels.filter((c) => c.state === 'open').length;
  const disconnected = channels.filter((c) => c.state === 'close').length;
  const locations = new Set(channels.map((c) => c.location_id)).size;

  const formatDate = (iso: string) => {
    try {
      return format(new Date(iso), "dd/MM/yyyy HH:mm", { locale: es });
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="GoHighLevel"
        subtitle="Instancias WhatsApp conectadas a GoHighLevel via EvolutionAPI"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header acciones */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Conexiones WhatsApp</h2>
            <p className="text-sm text-gray-500">
              {lastUpdated && (
                <span className="text-xs text-gray-400">
                  Actualizado {format(lastUpdated, 'HH:mm:ss', { locale: es })}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchChannels} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button
              size="sm"
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => navigate('/ghl-monitor')}
            >
              <Zap className="h-4 w-4 mr-2" />
              Monitor completo
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total instancias</p>
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
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Locations activas</p>
                <p className="text-2xl font-bold text-orange-600">{locations}</p>
              </div>
              <Building2 className="w-8 h-8 text-orange-400" />
            </CardContent>
          </Card>
        </div>

        {/* Banner informativo */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm text-orange-800 flex items-center gap-2">
          <Zap className="h-4 w-4 flex-shrink-0" />
          Para agregar una nueva conexion, instala la app desde el Marketplace de GoHighLevel.
        </div>

        {/* Error */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <span>{error}</span>
              </div>
              <Button variant="outline" size="sm" onClick={fetchChannels}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tabla de canales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-700 flex items-center justify-between">
              <span>Canales GHL recientes {!loading && `(${channels.length})`}</span>
              {channels.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-orange-600 hover:text-orange-700 text-xs"
                  onClick={() => navigate('/ghl-monitor')}
                >
                  Ver todo →
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && channels.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Cargando instancias...
              </div>
            ) : channels.length === 0 && !error ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-2">
                <Zap className="h-8 w-8 text-gray-300" />
                <p className="font-medium">Sin instancias configuradas</p>
                <p className="text-sm">No se encontraron conexiones GHL activas.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Instala la app desde el Marketplace de GoHighLevel para comenzar.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Location ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Numero</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Instancia Evolution</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Provider</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Fecha creacion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channels.map((ch) => (
                      <tr
                        key={ch.id}
                        className={`border-b border-gray-50 hover:bg-gray-50 transition-colors border-l-4 ${
                          ch.state === 'open'
                            ? 'border-l-green-400'
                            : ch.state === 'connecting'
                            ? 'border-l-yellow-400'
                            : 'border-l-gray-200'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <StateBadge state={ch.state} loading={ch.stateLoading} />
                          {ch.state === 'open' && (
                            <div className="mt-1">
                              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
                            </div>
                          )}
                        </td>
                        <td
                          className="py-3 px-4 font-mono text-xs text-gray-700 max-w-[160px] truncate"
                          title={ch.location_id}
                        >
                          {ch.location_id}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {ch.whatsapp_phone_number ? (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              +{ch.whatsapp_phone_number}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Sin numero</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-700">
                          {ch.evolution_instance}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-xs capitalize">
                            {ch.provider || 'evolution'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(ch.created_at)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-orange-400"
            onClick={() => navigate('/ghl-monitor')}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Wifi className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Monitor de conexiones</p>
                <p className="text-sm text-gray-500">Estado en tiempo real con polling automático</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-400"
            onClick={() => navigate('/ghl-registros')}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Registros y tokens</p>
                <p className="text-sm text-gray-500">OAuth tokens y canales configurados</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
