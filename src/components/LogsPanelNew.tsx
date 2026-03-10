import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { databaseService, type LogEntry } from '@/services/database.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Trash2, 
  Download, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Info,
  Server,
  Webhook,
  User,
  Database
} from 'lucide-react';

interface LogFilters {
  type?: LogEntry['type'];
  status?: LogEntry['status'];
  source?: LogEntry['source'];
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function LogsPanelNew() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<LogFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Suscribirse a cambios en logs
    const handleLogsUpdate = (newLogs: LogEntry[]) => {
      setLogs(newLogs);
      setLoading(false);
    };

    databaseService.subscribe('logs', handleLogsUpdate);
    
    // Cargar logs iniciales
    const initialLogs = databaseService.getAllLogs();
    setLogs(initialLogs);
    setLoading(false);

    return () => {
      databaseService.unsubscribe('logs', handleLogsUpdate);
    };
  }, []);

  const toggleExpanded = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const clearAllLogs = () => {
    if (confirm('¿Estás seguro de que quieres eliminar todos los registros?')) {
      // Acceso directo a la base de datos para limpiar logs
      (databaseService as any).db.logs = [];
      (databaseService as any).saveDatabase();
      (databaseService as any).notifySubscribers('logs', []);
    }
  };

  const exportLogs = () => {
    const filteredLogs = getFilteredLogs();
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wazzap-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getFilteredLogs = (): LogEntry[] => {
    let filteredLogs = [...logs];

    if (filters.type) {
      filteredLogs = filteredLogs.filter(log => log.type === filters.type);
    }
    if (filters.status) {
      filteredLogs = filteredLogs.filter(log => log.status === filters.status);
    }
    if (filters.source) {
      filteredLogs = filteredLogs.filter(log => log.source === filters.source);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        log.sessionName?.toLowerCase().includes(searchLower) ||
        log.phoneNumber?.toLowerCase().includes(searchLower)
      );
    }
    if (filters.dateFrom) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.dateTo!);
    }

    return filteredLogs;
  };

  const getLogTypeIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'webhook_request':
      case 'webhook_response':
      case 'webhook_error':
        return <Webhook className="w-4 h-4" />;
      case 'connection_lost':
      case 'connection_restored':
        return <Server className="w-4 h-4" />;
      case 'system_error':
        return <Database className="w-4 h-4" />;
      case 'form_submission':
        return <User className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: LogEntry['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getLogTypeColor = (type: LogEntry['type'], status: LogEntry['status']) => {
    if (status === 'error') return 'bg-red-100 text-red-800 border-red-200';
    if (status === 'success') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'warning') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    
    switch (type) {
      case 'webhook_request':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'webhook_response':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'webhook_error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'qr_generated':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'connection_lost':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'connection_restored':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLogTypeLabel = (type: LogEntry['type']) => {
    switch (type) {
      case 'webhook_request': return 'Webhook Request';
      case 'webhook_response': return 'Webhook Response';
      case 'webhook_error': return 'Webhook Error';
      case 'qr_generated': return 'QR Generado';
      case 'qr_scanned': return 'QR Escaneado';
      case 'form_submission': return 'Formulario';
      case 'connection_lost': return 'Conexión Perdida';
      case 'connection_restored': return 'Conexión Restaurada';
      case 'message_sent': return 'Mensaje Enviado';
      case 'system_error': return 'Error Sistema';
      default: return type.replace('_', ' ').toUpperCase();
    }
  };

  const filteredLogs = getFilteredLogs();
  const logStats = databaseService.getLogStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-gray-600">Cargando registros...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Registros del Sistema</h2>
            <p className="text-gray-600">Monitoreo detallado de actividad en tiempo real</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" size="sm" onClick={exportLogs}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="destructive" size="sm" onClick={clearAllLogs}>
              <Trash2 className="w-4 h-4 mr-2" />
              Limpiar Todo
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{logStats.total}</p>
                </div>
                <Database className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Hoy</p>
                  <p className="text-2xl font-bold">{logStats.todayCount}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Errores</p>
                  <p className="text-2xl font-bold text-red-600">{logStats.byStatus.error || 0}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Éxitos</p>
                  <p className="text-2xl font-bold text-green-600">{logStats.byStatus.success || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filtros expandibles */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10"
                />
              </div>
              
              <Select value={filters.type || ''} onValueChange={(value) => setFilters({...filters, type: value as LogEntry['type'] || undefined})}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los tipos</SelectItem>
                  <SelectItem value="webhook_request">Webhook Request</SelectItem>
                  <SelectItem value="webhook_response">Webhook Response</SelectItem>
                  <SelectItem value="webhook_error">Webhook Error</SelectItem>
                  <SelectItem value="connection_lost">Conexión Perdida</SelectItem>
                  <SelectItem value="connection_restored">Conexión Restaurada</SelectItem>
                  <SelectItem value="form_submission">Formulario</SelectItem>
                  <SelectItem value="system_error">Error Sistema</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.status || ''} onValueChange={(value) => setFilters({...filters, status: value as LogEntry['status'] || undefined})}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los estados</SelectItem>
                  <SelectItem value="success">Éxito</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Advertencia</SelectItem>
                  <SelectItem value="info">Información</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.source || ''} onValueChange={(value) => setFilters({...filters, source: value as LogEntry['source'] || undefined})}>
                <SelectTrigger>
                  <SelectValue placeholder="Origen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los orígenes</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="connection">Conexión</SelectItem>
                  <SelectItem value="user">Usuario</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="Fecha desde"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              />

              <Input
                type="date"
                placeholder="Fecha hasta"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              />
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setFilters({})}
              >
                Limpiar Filtros
              </Button>
              <div className="text-sm text-gray-600 flex items-center">
                Mostrando {filteredLogs.length} de {logs.length} registros
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de logs */}
      <div className="space-y-2">
        {filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">
                <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No hay registros</p>
                <p className="text-sm mt-1">
                  {logs.length === 0 
                    ? 'Los registros aparecerán aquí cuando se produzcan eventos'
                    : 'Ajusta los filtros para ver registros'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredLogs.map((log) => (
            <Card key={log.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Fila principal del log */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpanded(log.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Icono de expansión */}
                      <div className="flex-shrink-0">
                        {expandedLogs.has(log.id) ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      {/* Icono de estado */}
                      <div className="flex-shrink-0">
                        {getStatusIcon(log.status)}
                      </div>

                      {/* Información principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline" className={`${getLogTypeColor(log.type, log.status)} text-xs`}>
                            {getLogTypeIcon(log.type)}
                            <span className="ml-1">{getLogTypeLabel(log.type)}</span>
                          </Badge>
                          {log.sessionName && (
                            <Badge variant="secondary" className="text-xs">
                              {log.sessionName}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 truncate">{log.message}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span>{format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: es })}</span>
                          {log.phoneNumber && <span>📱 {log.phoneNumber}</span>}
                          <Badge variant="outline" className="text-xs">
                            {log.source}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalles expandidos */}
                {expandedLogs.has(log.id) && (
                  <div className="border-t bg-gray-50 p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Información básica */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Información del Registro</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">ID:</span>
                            <span className="font-mono text-xs">{log.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nivel:</span>
                            <span>{log.level}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Origen:</span>
                            <span>{log.source}</span>
                          </div>
                          {log.connection_id && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Conexión ID:</span>
                              <span className="font-mono text-xs">{log.connection_id}</span>
                            </div>
                          )}
                          {log.sessionName && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Sesión:</span>
                              <span>{log.sessionName}</span>
                            </div>
                          )}
                          {log.phoneNumber && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Teléfono:</span>
                              <span>{log.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Metadatos */}
                      {log.metadata && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Metadatos</h4>
                          <div className="space-y-2 text-sm">
                            {log.metadata.url && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">URL:</span>
                                <span className="font-mono text-xs truncate max-w-40">{log.metadata.url}</span>
                              </div>
                            )}
                            {log.metadata.method && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Método:</span>
                                <Badge variant="outline" className="text-xs">{log.metadata.method}</Badge>
                              </div>
                            )}
                            {log.metadata.response_time && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Tiempo respuesta:</span>
                                <span>{log.metadata.response_time}ms</span>
                              </div>
                            )}
                            {log.metadata.ip_address && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">IP:</span>
                                <span className="font-mono text-xs">{log.metadata.ip_address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Datos adicionales */}
                    {log.data && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Datos</h4>
                        <div className="bg-white rounded border p-3 max-h-40 overflow-auto">
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                            {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Error details */}
                    {log.error && (
                      <div className="mt-4">
                        <h4 className="font-medium text-red-900 mb-2">Error</h4>
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                          <pre className="text-xs text-red-700 whitespace-pre-wrap">{log.error}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 