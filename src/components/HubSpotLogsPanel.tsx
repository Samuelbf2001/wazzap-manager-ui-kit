/**
 * Panel de registros conectado al backend WhatsAppHub.
 * Muestra logs reales de mensajes WhatsApp ↔ HubSpot por portal (hubId).
 */
import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  hubspotApi,
  getHubSpotAuth,
  type BackendLog,
  type LogsSummary,
  type LogsFilters,
} from '@/lib/hubspotApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Download,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Database,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Phone,
  Building2,
} from 'lucide-react';

const LOGS_PER_PAGE = 50;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusBadgeClass(status: BackendLog['status']) {
  if (status === 'success') return 'bg-green-100 text-green-800 border-green-200';
  if (status === 'error') return 'bg-red-100 text-red-800 border-red-200';
  if (status === 'blocked') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-gray-100 text-gray-800 border-gray-200';
}

function eventTypeLabel(eventType: string | null) {
  switch (eventType) {
    case 'MESSAGE_RECEIVED': return 'Mensaje recibido';
    case 'MESSAGE_SENT':     return 'Mensaje enviado';
    case 'TEMPLATE_SENT':    return 'Template enviado';
    case 'WINDOW_CLOSED':    return 'Ventana cerrada';
    case 'ERROR':            return 'Error';
    default:                 return eventType ?? '—';
  }
}

function directionIcon(direction: BackendLog['direction']) {
  return direction === 'incoming'
    ? <ArrowDownLeft className="w-4 h-4 text-blue-500" />
    : <ArrowUpRight className="w-4 h-4 text-purple-500" />;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function HubSpotLogsPanel() {
  const auth = getHubSpotAuth();

  const [logs, setLogs] = useState<BackendLog[]>([]);
  const [summary, setSummary] = useState<LogsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState<LogsFilters>({ page: 1, limit: LOGS_PER_PAGE });
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchLogs = useCallback(async () => {
    if (!auth) return;
    setLoading(true);
    setError(null);
    try {
      const [logsRes, summaryRes] = await Promise.all([
        hubspotApi.getLogs(filters),
        hubspotApi.getLogsSummary(),
      ]);
      setLogs(logsRes.logs);
      setTotal(logsRes.total);
      setTotalPages(logsRes.totalPages);
      setSummary(summaryRes.summary);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error cargando logs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const toggleExpanded = (id: number) => {
    const next = new Set(expandedLogs);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedLogs(next);
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setFilters(f => ({ ...f, page }));
  };

  const applySearch = () => {
    // El backend no tiene filtro de texto libre aún; filtrar localmente
    // en lo que ya está paginado. Para mejorar, agregar ?search= en el backend.
  };

  const exportLogs = () => {
    const filteredBySearch = search
      ? logs.filter(l =>
          l.customer_phone?.includes(search) ||
          l.business_phone?.includes(search) ||
          l.message_text?.toLowerCase().includes(search.toLowerCase())
        )
      : logs;
    const blob = new Blob([JSON.stringify(filteredBySearch, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hubspot-logs-${auth?.portalId}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Derived ──────────────────────────────────────────────────────────────

  const displayedLogs = search
    ? logs.filter(l =>
        l.customer_phone?.includes(search) ||
        l.business_phone?.includes(search) ||
        l.message_text?.toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!auth) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>No hay sesión HubSpot activa.</p>
          <p className="text-sm mt-1">Accede desde el link de configuración de tu portal.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Registros de Mensajes</h2>
            <p className="text-gray-500 text-sm">
              Portal HubSpot: <span className="font-mono font-medium">{auth.portalId}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(f => !f)}>
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" size="sm" onClick={exportLogs}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Últimas 24h</p>
                  <p className="text-2xl font-bold">{summary?.last_24h ?? '—'}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Entrantes</p>
                  <p className="text-2xl font-bold text-blue-600">{summary?.incoming_total ?? '—'}</p>
                </div>
                <ArrowDownLeft className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer hover:shadow-md transition-shadow ${filters.status === 'error' ? 'ring-2 ring-red-400' : ''}`}
            onClick={() => setFilters(f => ({ ...f, status: f.status === 'error' ? undefined : 'error', page: 1 }))}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Errores</p>
                  <p className="text-2xl font-bold text-red-600">{summary?.errors_total ?? '—'}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer hover:shadow-md transition-shadow ${filters.status === 'blocked' ? 'ring-2 ring-yellow-400' : ''}`}
            onClick={() => setFilters(f => ({ ...f, status: f.status === 'blocked' ? undefined : 'blocked', page: 1 }))}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Bloqueados</p>
                  <p className="text-2xl font-bold text-yellow-600">{summary?.blocked_total ?? '—'}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filtros expandibles */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar teléfono o texto..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={filters.direction ?? ''}
                onValueChange={v => setFilters(f => ({ ...f, direction: v as 'incoming' | 'outgoing' | undefined || undefined, page: 1 }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Dirección" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="incoming">Entrantes</SelectItem>
                  <SelectItem value="outgoing">Salientes</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.status ?? ''}
                onValueChange={v => setFilters(f => ({ ...f, status: v as 'success' | 'error' | 'blocked' | undefined || undefined, page: 1 }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="success">Éxito</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="blocked">Bloqueado</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => { setFilters({ page: 1, limit: LOGS_PER_PAGE }); setSearch(''); }}
              >
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      {/* Paginación info */}
      {!loading && total > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>
            {total} registros en total — página {filters.page} de {totalPages}
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => goToPage(1)} disabled={filters.page === 1}>
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => goToPage((filters.page ?? 1) - 1)} disabled={filters.page === 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-3">{filters.page} / {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => goToPage((filters.page ?? 1) + 1)} disabled={filters.page === totalPages}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => goToPage(totalPages)} disabled={filters.page === totalPages}>
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Lista de logs */}
      <div className="space-y-2 max-h-[600px] overflow-auto logs-container">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            <span className="ml-3 text-gray-500">Cargando registros...</span>
          </div>
        ) : displayedLogs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-400">
              <Database className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="font-medium">Sin registros</p>
              <p className="text-sm mt-1">Ajusta los filtros o espera nuevos mensajes</p>
            </CardContent>
          </Card>
        ) : (
          displayedLogs.map(log => (
            <Card key={log.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Fila principal */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpanded(log.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Expand icon */}
                    <div className="flex-shrink-0">
                      {expandedLogs.has(log.id)
                        ? <ChevronDown className="w-4 h-4 text-gray-400" />
                        : <ChevronRight className="w-4 h-4 text-gray-400" />}
                    </div>

                    {/* Status icon */}
                    <div className="flex-shrink-0">
                      {log.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {log.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                      {log.status === 'blocked' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant="outline" className={statusBadgeClass(log.status)}>
                          {directionIcon(log.direction)}
                          <span className="ml-1">{eventTypeLabel(log.event_type)}</span>
                        </Badge>
                        {log.provider && (
                          <Badge variant="secondary" className="text-xs capitalize">
                            {log.provider}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-800 truncate">
                        {log.message_text || log.error_message || '(sin texto)'}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>{format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: es })}</span>
                        {log.customer_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />{log.customer_phone}
                          </span>
                        )}
                        {log.business_phone && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />{log.business_phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalles expandidos */}
                {expandedLogs.has(log.id) && (
                  <div className="border-t bg-gray-50 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Información del registro</h4>
                      <dl className="space-y-1">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">ID</dt>
                          <dd className="font-mono">{log.id}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Dirección</dt>
                          <dd className="capitalize">{log.direction}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Estado</dt>
                          <dd className="capitalize">{log.status}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Proveedor</dt>
                          <dd className="capitalize">{log.provider ?? '—'}</dd>
                        </div>
                        {log.channel_account_id && (
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Canal ID</dt>
                            <dd className="font-mono text-xs truncate max-w-40">{log.channel_account_id}</dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    <div>
                      {log.message_text && (
                        <>
                          <h4 className="font-medium text-gray-800 mb-2">Mensaje</h4>
                          <div className="bg-white border rounded p-2 text-xs text-gray-700 break-words">
                            {log.message_text}
                          </div>
                        </>
                      )}
                      {log.error_message && (
                        <div className="mt-2">
                          <h4 className="font-medium text-red-700 mb-1">Error</h4>
                          <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700 break-words">
                            {log.error_message}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Paginación inferior */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={() => goToPage(1)} disabled={filters.page === 1}>
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => goToPage((filters.page ?? 1) - 1)} disabled={filters.page === 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-500 px-2">
            Página {filters.page} de {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => goToPage((filters.page ?? 1) + 1)} disabled={filters.page === totalPages}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => goToPage(totalPages)} disabled={filters.page === totalPages}>
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
