/**
 * GHLRegistrosPage — Registros y tokens OAuth de GoHighLevel.
 * Inspirado en RegistrosPage + HubSpotLogsPanel.
 * Muestra: tokens OAuth activos por location, canales configurados, fecha de expiración.
 * Sin autenticación HubSpot.
 */
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  RefreshCw,
  AlertCircle,
  Loader2,
  Building2,
  Phone,
  Clock,
  Key,
  CheckCircle,
  XCircle,
  Search,
  Download,
  Database,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'https://whatsfull.sixteam.pro';

interface GHLToken {
  id: number;
  location_id: string;
  company_id: string | null;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

interface GHLChannel {
  id: number;
  location_id: string;
  whatsapp_phone_number: string;
  evolution_instance: string;
  provider: string;
  company_id: string | null;
  authorized: boolean;
  created_at: string;
}

interface DebugData {
  tokens: GHLToken[];
  channels: GHLChannel[];
}

function isTokenExpired(expiresAt: string): boolean {
  try {
    return new Date(expiresAt) < new Date();
  } catch {
    return false;
  }
}

function TokenStatusBadge({ expiresAt }: { expiresAt: string }) {
  const expired = isTokenExpired(expiresAt);
  if (expired) {
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200">
        <XCircle className="w-3 h-3 mr-1" />
        Expirado
      </Badge>
    );
  }
  return (
    <Badge className="bg-green-100 text-green-800 border-green-200">
      <CheckCircle className="w-3 h-3 mr-1" />
      Activo
    </Badge>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function GHLRegistrosPage() {
  const [data, setData]         = useState<DebugData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [search, setSearch]     = useState('');
  const [expandedTokens, setExpandedTokens] = useState<Set<number>>(new Set());
  const [expandedChannels, setExpandedChannels] = useState<Set<number>>(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ghl-debug`);
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setData({
        tokens: json.tokens || json.oauth_tokens || [],
        channels: json.channels || json.channel_accounts || [],
      });
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleToken = (id: number) => {
    setExpandedTokens((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleChannel = (id: number) => {
    setExpandedChannels((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const exportData = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ghl-registros-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (iso: string) => {
    try {
      return format(new Date(iso), 'dd/MM/yyyy HH:mm:ss', { locale: es });
    } catch {
      return iso;
    }
  };

  const maskToken = (token: string) =>
    token ? `${token.slice(0, 12)}...${token.slice(-6)}` : '—';

  // Filtrado por búsqueda
  const filteredTokens = (data?.tokens || []).filter(
    (t) =>
      !search ||
      t.location_id.toLowerCase().includes(search.toLowerCase()) ||
      (t.company_id || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredChannels = (data?.channels || []).filter(
    (c) =>
      !search ||
      c.location_id.toLowerCase().includes(search.toLowerCase()) ||
      c.evolution_instance.toLowerCase().includes(search.toLowerCase()) ||
      (c.whatsapp_phone_number || '').includes(search)
  );

  // Stats
  const totalTokens    = data?.tokens.length ?? 0;
  const activeTokens   = data?.tokens.filter((t) => !isTokenExpired(t.expires_at)).length ?? 0;
  const expiredTokens  = totalTokens - activeTokens;
  const totalChannels  = data?.channels.length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Registros GHL"
        subtitle="Tokens OAuth activos y canales configurados · GoHighLevel"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Header acciones */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Registros de GoHighLevel</h2>
            <p className="text-sm text-gray-500">
              {lastUpdated && (
                <span className="text-xs text-gray-400">
                  · Actualizado {format(lastUpdated, 'HH:mm:ss', { locale: es })}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportData} disabled={!data}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total tokens</p>
                <p className="text-2xl font-bold">{totalTokens}</p>
              </div>
              <Key className="w-8 h-8 text-blue-400" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tokens activos</p>
                <p className="text-2xl font-bold text-green-600">{activeTokens}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tokens expirados</p>
                <p className="text-2xl font-bold text-red-500">{expiredTokens}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Canales config.</p>
                <p className="text-2xl font-bold text-orange-600">{totalChannels}</p>
              </div>
              <Phone className="w-8 h-8 text-orange-400" />
            </CardContent>
          </Card>
        </div>

        {/* Búsqueda */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por Location ID, instancia, número..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
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

        {/* Loading */}
        {loading && !data && (
          <div className="flex items-center justify-center h-32 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-3" />
            Cargando registros de GHL...
          </div>
        )}

        {/* ── Sección Tokens OAuth ───────────────────────────────────────── */}
        {data && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-700 flex items-center gap-2">
                <Key className="w-4 h-4 text-orange-500" />
                Tokens OAuth GHL
                <Badge variant="secondary" className="ml-2">{filteredTokens.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTokens.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
                  <Database className="w-10 h-10 text-gray-200" />
                  <p className="font-medium">Sin tokens registrados</p>
                  <p className="text-sm">
                    {search ? 'No hay resultados para la búsqueda.' : 'No se encontraron tokens OAuth de GHL.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTokens.map((token) => {
                    const expired = isTokenExpired(token.expires_at);
                    const isExpanded = expandedTokens.has(token.id);
                    return (
                      <Card
                        key={token.id}
                        className={`overflow-hidden border-l-4 ${
                          expired ? 'border-l-red-400' : 'border-l-green-400'
                        }`}
                      >
                        <CardContent className="p-0">
                          {/* Fila principal */}
                          <div
                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleToken(token.id)}
                          >
                            <div className="flex items-center gap-4">
                              {/* Expand icon */}
                              <div className="flex-shrink-0 text-gray-400">
                                {isExpanded
                                  ? <ChevronDown className="w-4 h-4" />
                                  : <ChevronRight className="w-4 h-4" />}
                              </div>

                              {/* Status icon */}
                              <div className="flex-shrink-0">
                                {expired
                                  ? <XCircle className="w-4 h-4 text-red-500" />
                                  : <CheckCircle className="w-4 h-4 text-green-500" />}
                              </div>

                              {/* Info principal */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <TokenStatusBadge expiresAt={token.expires_at} />
                                  <span className="font-mono text-sm text-gray-700">
                                    {token.location_id}
                                  </span>
                                  {token.company_id && (
                                    <Badge variant="outline" className="text-xs">
                                      Agency: {token.company_id.slice(0, 12)}
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Expira: {formatDate(token.expires_at)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Actualizado: {formatDate(token.updated_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Detalles expandidos */}
                          {isExpanded && (
                            <div className="border-t bg-gray-50 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <h4 className="font-medium text-gray-800 mb-2">Información del token</h4>
                                <dl className="space-y-1">
                                  <div className="flex justify-between gap-2">
                                    <dt className="text-gray-500 flex-shrink-0">ID</dt>
                                    <dd className="font-mono">{token.id}</dd>
                                  </div>
                                  <div className="flex justify-between gap-2">
                                    <dt className="text-gray-500 flex-shrink-0">Location ID</dt>
                                    <dd className="font-mono text-xs break-all">{token.location_id}</dd>
                                  </div>
                                  {token.company_id && (
                                    <div className="flex justify-between gap-2">
                                      <dt className="text-gray-500 flex-shrink-0">Company ID</dt>
                                      <dd className="font-mono text-xs break-all">{token.company_id}</dd>
                                    </div>
                                  )}
                                  <div className="flex justify-between gap-2">
                                    <dt className="text-gray-500 flex-shrink-0">Estado</dt>
                                    <dd className={expired ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                                      {expired ? 'Expirado' : 'Activo'}
                                    </dd>
                                  </div>
                                </dl>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-800 mb-2">Tokens (enmascarados)</h4>
                                <dl className="space-y-1">
                                  <div className="flex justify-between gap-2">
                                    <dt className="text-gray-500 flex-shrink-0">Access token</dt>
                                    <dd className="font-mono text-xs text-gray-600">{maskToken(token.access_token)}</dd>
                                  </div>
                                  <div className="flex justify-between gap-2">
                                    <dt className="text-gray-500 flex-shrink-0">Refresh token</dt>
                                    <dd className="font-mono text-xs text-gray-600">{maskToken(token.refresh_token)}</dd>
                                  </div>
                                  <div className="flex justify-between gap-2">
                                    <dt className="text-gray-500 flex-shrink-0">Creado</dt>
                                    <dd className="text-xs">{formatDate(token.created_at)}</dd>
                                  </div>
                                  <div className="flex justify-between gap-2">
                                    <dt className="text-gray-500 flex-shrink-0">Expira</dt>
                                    <dd className={`text-xs ${expired ? 'text-red-600 font-medium' : ''}`}>
                                      {formatDate(token.expires_at)}
                                    </dd>
                                  </div>
                                </dl>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Sección Canales configurados ──────────────────────────────────── */}
        {data && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500" />
                Canales WhatsApp configurados
                <Badge variant="secondary" className="ml-2">{filteredChannels.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredChannels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
                  <Database className="w-10 h-10 text-gray-200" />
                  <p className="font-medium">Sin canales registrados</p>
                  <p className="text-sm">
                    {search ? 'No hay resultados para la búsqueda.' : 'No se encontraron canales configurados.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredChannels.map((ch) => {
                    const isExpanded = expandedChannels.has(ch.id);
                    return (
                      <Card
                        key={ch.id}
                        className="overflow-hidden border-l-4 border-l-blue-400"
                      >
                        <CardContent className="p-0">
                          {/* Fila principal */}
                          <div
                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleChannel(ch.id)}
                          >
                            <div className="flex items-center gap-4">
                              {/* Expand icon */}
                              <div className="flex-shrink-0 text-gray-400">
                                {isExpanded
                                  ? <ChevronDown className="w-4 h-4" />
                                  : <ChevronRight className="w-4 h-4" />}
                              </div>

                              {/* Status icon */}
                              <div className="flex-shrink-0">
                                {ch.authorized
                                  ? <Wifi className="w-4 h-4 text-green-500" />
                                  : <WifiOff className="w-4 h-4 text-gray-400" />}
                              </div>

                              {/* Info principal */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <Badge
                                    className={
                                      ch.authorized
                                        ? 'bg-green-100 text-green-800 border-green-200'
                                        : 'bg-gray-100 text-gray-600 border-gray-200'
                                    }
                                  >
                                    {ch.authorized ? 'Autorizado' : 'Sin autorizar'}
                                  </Badge>
                                  <span className="font-semibold text-gray-900 flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-gray-400" />
                                    {ch.whatsapp_phone_number
                                      ? `+${ch.whatsapp_phone_number}`
                                      : <span className="text-gray-400 italic font-normal text-sm">Sin número</span>
                                    }
                                  </span>
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
                                    Registrado: {formatDate(ch.created_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Detalles expandidos */}
                          {isExpanded && (
                            <div className="border-t bg-gray-50 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <h4 className="font-medium text-gray-800 mb-2">Información del canal</h4>
                                <dl className="space-y-1">
                                  <div className="flex justify-between gap-2">
                                    <dt className="text-gray-500 flex-shrink-0">ID</dt>
                                    <dd className="font-mono">{ch.id}</dd>
                                  </div>
                                  <div className="flex justify-between gap-2">
                                    <dt className="text-gray-500 flex-shrink-0">Location ID</dt>
                                    <dd className="font-mono text-xs break-all">{ch.location_id}</dd>
                                  </div>
                                  {ch.company_id && (
                                    <div className="flex justify-between gap-2">
                                      <dt className="text-gray-500 flex-shrink-0">Company ID</dt>
                                      <dd className="font-mono text-xs break-all">{ch.company_id}</dd>
                                    </div>
                                  )}
                                  <div className="flex justify-between gap-2">
                                    <dt className="text-gray-500 flex-shrink-0">Autorizado</dt>
                                    <dd className={ch.authorized ? 'text-green-600 font-medium' : 'text-gray-500'}>
                                      {ch.authorized ? 'Si' : 'No'}
                                    </dd>
                                  </div>
                                </dl>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-800 mb-2">WhatsApp / Evolution</h4>
                                <dl className="space-y-1">
                                  <div className="flex justify-between gap-2">
                                    <dt className="text-gray-500 flex-shrink-0">Numero</dt>
                                    <dd className="font-mono text-xs">
                                      {ch.whatsapp_phone_number ? `+${ch.whatsapp_phone_number}` : '—'}
                                    </dd>
                                  </div>
                                  <div className="flex justify-between gap-2">
                                    <dt className="text-gray-500 flex-shrink-0">Instancia</dt>
                                    <dd className="font-mono text-xs break-all">{ch.evolution_instance}</dd>
                                  </div>
                                  <div className="flex justify-between gap-2">
                                    <dt className="text-gray-500 flex-shrink-0">Provider</dt>
                                    <dd className="capitalize">{ch.provider || 'evolution'}</dd>
                                  </div>
                                  <div className="flex justify-between gap-2">
                                    <dt className="text-gray-500 flex-shrink-0">Creado</dt>
                                    <dd className="text-xs">{formatDate(ch.created_at)}</dd>
                                  </div>
                                </dl>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
