import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  AlertCircle,
  Loader2,
  CheckCircle,
  Clock,
  Terminal,
  ChevronDown,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { ConnectionsTable } from '@/components/ConnectionsTable';
import { whatsfullApi } from '@/services/whatsfull-api.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'https://whatsfull.sixteam.pro';

interface GHLLocation {
  id: string;
  name: string;
}

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
interface ChannelWithState extends GHLChannel { state?: InstanceState; stateLoading: boolean; }

function StateBadge({ state, loading }: { state?: InstanceState; loading: boolean }) {
  if (loading) return <Badge variant="outline" className="text-gray-500 border-gray-300"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Cargando</Badge>;
  switch (state) {
    case 'open':       return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Conectado</Badge>;
    case 'connecting': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Conectando</Badge>;
    case 'close':      return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100"><WifiOff className="w-3 h-3 mr-1" />Desconectado</Badge>;
    default:           return <Badge variant="outline" className="text-gray-500 border-gray-300">Desconocido</Badge>;
  }
}

/* ──────────────────────────────────────────────────────────
   Vista de gestión por location (app embedded en GHL)
────────────────────────────────────────────────────────── */
function LocationManagementView({ locationId, companyId }: { locationId: string; companyId: string | null }) {
  const [refreshKey, setRefreshKey]         = useState(0);
  const [authError, setAuthError]           = useState(false);
  const [validationDone, setValidationDone] = useState(false);
  const [locations, setLocations]           = useState<GHLLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState(locationId);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Agency install: cargar lista de subcuentas
  useEffect(() => {
    if (!companyId || locationId) return;
    setLoadingLocations(true);
    fetch(`${BACKEND_URL}/api/ghl-company/locations?companyId=${companyId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setLocations(d.locations || []); })
      .catch(() => {})
      .finally(() => setLoadingLocations(false));
  }, [companyId, locationId]);

  // Validar tokens silenciosamente
  useEffect(() => {
    const loc = selectedLocation || locationId;
    if (!loc) return;
    whatsfullApi.validateGHLLocation(loc)
      .then(r => { if (!r.readyForQR && !r.hasTokens) setAuthError(true); })
      .catch(() => {})
      .finally(() => setValidationDone(true));
  }, [selectedLocation, locationId]);

  const activeLocation = selectedLocation || locationId;
  const selectedName = locations.find(l => l.id === selectedLocation)?.name || '';

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-10 px-4">
      <div className="w-full max-w-3xl space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.122 1.532 5.856L0 24l6.335-1.525A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.37l-.36-.213-3.76.906.949-3.668-.234-.375A9.818 9.818 0 1112 21.818z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">WhatsApp → GHL</h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {locationId && <Badge variant="secondary" className="text-xs font-mono">{locationId}</Badge>}
              {companyId && !locationId && <Badge variant="secondary" className="text-xs">Agency: {companyId}</Badge>}
              {selectedName && <Badge variant="outline" className="text-xs">{selectedName}</Badge>}
            </div>
          </div>
        </div>

        {/* Auth error banner */}
        {authError && validationDone && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="py-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-orange-700">Autorización requerida</p>
                <p className="text-xs text-orange-600 mt-0.5">Los tokens de esta location expiraron. Re-autoriza para poder conectar números.</p>
              </div>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white flex-shrink-0"
                onClick={() => { window.location.href = `${BACKEND_URL}/ghl/install`; }}>
                <RefreshCw className="w-3 h-3 mr-1.5" />Re-autorizar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Agency: selector de subcuenta */}
        {companyId && !locationId && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Selecciona la subcuenta</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {loadingLocations ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-1">
                  <Loader2 className="h-4 w-4 animate-spin" />Cargando subcuentas…
                </div>
              ) : (
                <div className="relative">
                  <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)}
                    className="w-full appearance-none px-3 py-2 pr-8 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                    <option value="">— Elige una subcuenta —</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name} ({loc.id})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              )}
              {selectedLocation && <p className="text-xs text-green-600 font-mono">Location ID: {selectedLocation}</p>}
            </CardContent>
          </Card>
        )}

        {/* Sin location */}
        {!activeLocation && !companyId && (
          <Card>
            <CardContent className="py-10 text-center text-gray-400">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No se encontró un locationId en la URL.</p>
              <p className="text-xs mt-1">Instala la app desde el Marketplace de GoHighLevel.</p>
            </CardContent>
          </Card>
        )}

        {/* Tabla */}
        {activeLocation && (
          <>
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Números de WhatsApp conectados</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ConnectionsTable
                  mode="ghl"
                  locationId={activeLocation}
                  companyId={companyId || undefined}
                  key={refreshKey}
                  hideTitle
                  onConnectionSuccess={() => setRefreshKey(k => k + 1)}
                />
              </CardContent>
            </Card>

            <Card className="border-blue-100 bg-blue-50">
              <CardContent className="py-3 flex items-start gap-3">
                <Terminal className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-blue-700 mb-0.5">Comando para elegir número en GHL</p>
                  <p className="text-xs text-blue-600">
                    Escribe <span className="font-mono bg-blue-100 px-1 rounded">/nombre/</span> al inicio de tu mensaje para elegir qué número envía la respuesta.
                    El número <span className="font-medium">predeterminado</span> se usa automáticamente si no se especifica ninguno.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Vista admin global (sin locationId en URL)
────────────────────────────────────────────────────────── */
function AdminOverviewView() {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<ChannelWithState[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchChannels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ghl-channels`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Error al cargar los canales');
      const list: GHLChannel[] = data.channels || [];
      const initial: ChannelWithState[] = list.map(ch => ({ ...ch, stateLoading: true }));
      setChannels(initial);
      setLastUpdated(new Date());

      const stateResults = await Promise.allSettled(
        list.map(ch =>
          fetch(`${BACKEND_URL}/api/ghl-channels/state/${encodeURIComponent(ch.evolution_instance)}`)
            .then(r => r.json())
            .then(d => ({ id: ch.id, state: (d.state as InstanceState) || 'unknown' }))
            .catch(() => ({ id: ch.id, state: 'unknown' as InstanceState }))
        )
      );

      setChannels(prev => prev.map(ch => {
        const result = stateResults.find(r => r.status === 'fulfilled' && r.value.id === ch.id);
        if (result && result.status === 'fulfilled') return { ...ch, state: result.value.state, stateLoading: false };
        return { ...ch, state: 'unknown', stateLoading: false };
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchChannels(); }, [fetchChannels]);

  const total       = channels.length;
  const connected   = channels.filter(c => c.state === 'open').length;
  const disconnected = channels.filter(c => c.state === 'close').length;
  const locationCount = new Set(channels.map(c => c.location_id)).size;

  const formatDate = (iso: string) => {
    try { return format(new Date(iso), 'dd/MM/yyyy HH:mm', { locale: es }); }
    catch { return iso; }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="GoHighLevel" subtitle="Instancias WhatsApp conectadas a GoHighLevel via EvolutionAPI" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Conexiones WhatsApp</h2>
            {lastUpdated && (
              <p className="text-xs text-gray-400">Actualizado {format(lastUpdated, 'HH:mm:ss', { locale: es })}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchChannels} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => navigate('/ghl-monitor')}>
              <Zap className="h-4 w-4 mr-2" />Monitor completo
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total instancias', value: total, icon: <Phone className="w-8 h-8 text-blue-400" />, color: '' },
            { label: 'Conectadas', value: connected, icon: <Wifi className="w-8 h-8 text-green-400" />, color: 'text-green-600' },
            { label: 'Desconectadas', value: disconnected, icon: <WifiOff className="w-8 h-8 text-red-400" />, color: 'text-red-500' },
            { label: 'Locations activas', value: locationCount, icon: <Building2 className="w-8 h-8 text-orange-400" />, color: 'text-orange-600' },
          ].map(({ label, value, icon, color }) => (
            <Card key={label}>
              <CardContent className="p-4 flex items-center justify-between">
                <div><p className="text-sm text-gray-500">{label}</p><p className={`text-2xl font-bold ${color}`}>{value}</p></div>
                {icon}
              </CardContent>
            </Card>
          ))}
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <Button variant="outline" size="sm" onClick={fetchChannels}>Reintentar</Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-700 flex items-center justify-between">
              <span>Canales GHL {!loading && `(${channels.length})`}</span>
              {channels.length > 0 && (
                <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 text-xs" onClick={() => navigate('/ghl-monitor')}>
                  Ver todo →
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && channels.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />Cargando instancias...
              </div>
            ) : channels.length === 0 && !error ? (
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
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Número</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Instancia</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Provider</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Creado</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Gestionar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channels.map(ch => (
                      <tr key={ch.id} className={`border-b border-gray-50 hover:bg-gray-50 border-l-4 ${ch.state === 'open' ? 'border-l-green-400' : ch.state === 'connecting' ? 'border-l-yellow-400' : 'border-l-gray-200'}`}>
                        <td className="py-3 px-4"><StateBadge state={ch.state} loading={ch.stateLoading} /></td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-700 max-w-[160px] truncate" title={ch.location_id}>{ch.location_id}</td>
                        <td className="py-3 px-4 text-gray-700">
                          {ch.whatsapp_phone_number
                            ? <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" />+{ch.whatsapp_phone_number}</span>
                            : <span className="text-gray-400 italic">Sin número</span>}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-700">{ch.evolution_instance}</td>
                        <td className="py-3 px-4"><Badge variant="outline" className="text-xs capitalize">{ch.provider || 'evolution'}</Badge></td>
                        <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(ch.created_at)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm" className="text-xs"
                            onClick={() => navigate(`/ghl-admin?locationId=${ch.location_id}`)}>
                            Gestionar
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-orange-400" onClick={() => navigate('/ghl-monitor')}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg"><Wifi className="h-5 w-5 text-orange-600" /></div>
              <div><p className="font-semibold text-gray-900">Monitor de conexiones</p><p className="text-sm text-gray-500">Estado en tiempo real con polling automático</p></div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-400" onClick={() => navigate('/ghl-registros')}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg"><Building2 className="h-5 w-5 text-blue-600" /></div>
              <div><p className="font-semibold text-gray-900">Registros y tokens</p><p className="text-sm text-gray-500">OAuth tokens y canales configurados</p></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Componente raíz — elige la vista según URL params
────────────────────────────────────────────────────────── */
export default function GHLDashboardPage() {
  const [searchParams] = useSearchParams();
  const locationId = searchParams.get('locationId');
  const companyId  = searchParams.get('companyId');

  if (locationId || companyId) {
    return <LocationManagementView locationId={locationId || ''} companyId={companyId} />;
  }

  return <AdminOverviewView />;
}
