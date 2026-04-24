import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw, Zap } from 'lucide-react';

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
        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
        Cargando
      </Badge>
    );
  }
  switch (state) {
    case 'open':
      return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">Conectado</Badge>;
    case 'connecting':
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">Conectando</Badge>;
    case 'close':
      return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">Desconectado</Badge>;
    default:
      return <Badge variant="outline" className="text-gray-500 border-gray-300">Desconocido</Badge>;
  }
}

export default function GHLDashboardPage() {
  const [channels, setChannels] = useState<ChannelWithState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChannels = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ghl-channels`);
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Error al cargar los canales');

      const list: GHLChannel[] = data.channels || [];

      // Initialize channels with stateLoading=true
      const initial: ChannelWithState[] = list.map((ch) => ({ ...ch, stateLoading: true }));
      setChannels(initial);

      // Fetch state for each instance in parallel
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
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta instancia? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/ghl-channels/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Error al eliminar');
      // Reload list
      fetchChannels();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar la instancia');
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Zap className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">GoHighLevel — Instancias WhatsApp</h1>
            <p className="text-sm text-gray-500">Todas las locations con WhatsApp conectado via EvolutionAPI</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchChannels} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Help text */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm text-orange-800">
        Para agregar una nueva conexion, instala la app desde el Marketplace de GoHighLevel.
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-700">
            Instancias configuradas {!loading && `(${channels.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && channels.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Cargando instancias...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-red-600 gap-2">
              <p className="font-medium">Error al cargar los datos</p>
              <p className="text-sm text-red-500">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchChannels} className="mt-2">
                Reintentar
              </Button>
            </div>
          ) : channels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-2">
              <Zap className="h-8 w-8 text-gray-300" />
              <p className="font-medium">Sin instancias configuradas</p>
              <p className="text-sm">No se encontraron conexiones GHL activas.</p>
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
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {channels.map((ch) => (
                    <tr key={ch.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <StateBadge state={ch.state} loading={ch.stateLoading} />
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-700 max-w-[160px] truncate" title={ch.location_id}>
                        {ch.location_id}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {ch.whatsapp_phone_number || <span className="text-gray-400 italic">Sin numero</span>}
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
                        {formatDate(ch.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          onClick={() => handleDelete(ch.id)}
                          title="Eliminar instancia"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
