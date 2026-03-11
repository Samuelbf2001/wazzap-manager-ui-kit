/**
 * Panel de conexiones WhatsApp real — datos desde EvolutionAPI vía backend.
 * Reemplaza al ConnectionMonitorPanel local (datos demo).
 */
import { useEffect, useState, useCallback } from 'react';
import { hubspotApi, getHubSpotAuth, type Connection } from '@/lib/hubspotApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StateBadge({ state, connected }: { state: string; connected: boolean }) {
  if (connected) {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Conectado
      </Badge>
    );
  }
  if (state === 'connecting') {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        Conectando...
      </Badge>
    );
  }
  if (state === 'error' || state === 'unreachable') {
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200">
        <AlertCircle className="w-3 h-3 mr-1" />
        Error
      </Badge>
    );
  }
  return (
    <Badge className="bg-gray-100 text-gray-600 border-gray-200">
      <WifiOff className="w-3 h-3 mr-1" />
      {state === 'n/a' ? 'Gupshup' : 'Desconectado'}
    </Badge>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function HubSpotConnectionsPanel() {
  const auth = getHubSpotAuth();

  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchConnections = useCallback(async () => {
    if (!auth) return;
    setLoading(true);
    setError(null);
    try {
      const res = await hubspotApi.getConnections();
      setConnections(res.connections);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error cargando conexiones');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial + refresco cada 30s (igual que el n8n)
  useEffect(() => {
    fetchConnections();
    const interval = setInterval(fetchConnections, 30000);
    return () => clearInterval(interval);
  }, [fetchConnections]);

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const total = connections.length;
  const connected = connections.filter(c => c.connected).length;
  const disconnected = total - connected;

  // ─── No auth ───────────────────────────────────────────────────────────────
  if (!auth) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>No hay sesión HubSpot activa.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Conexiones WhatsApp</h2>
          <p className="text-sm text-gray-500">
            Portal <span className="font-mono">{auth.portalId}</span>
            {lastUpdated && (
              <span className="ml-3 text-xs text-gray-400">
                · Actualizado {format(lastUpdated, 'HH:mm:ss', { locale: es })}
              </span>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchConnections} disabled={loading}>
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
              <p className="text-sm text-gray-500">Conectados</p>
              <p className="text-2xl font-bold text-green-600">{connected}</p>
            </div>
            <Wifi className="w-8 h-8 text-green-400" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Desconectados</p>
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

      {/* Connections list */}
      {loading && connections.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-3" />
          Consultando estado en EvolutionAPI...
        </div>
      ) : connections.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-400">
            <Phone className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="font-medium">Sin conexiones configuradas</p>
            <p className="text-sm mt-1">Configura un número de WhatsApp desde el setup del canal.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {connections.map(conn => (
            <Card key={conn.id} className={`border-l-4 ${conn.connected ? 'border-l-green-400' : 'border-l-gray-300'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Estado visual */}
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${conn.connected ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`} />

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 flex items-center gap-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          +{conn.phoneNumber}
                        </span>
                        <StateBadge state={conn.connectionState} connected={conn.connected} />
                        <Badge variant="secondary" className="text-xs capitalize">
                          {conn.provider}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                        {conn.evolutionInstance && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            Instancia: <span className="font-mono">{conn.evolutionInstance}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Registrado: {format(new Date(conn.createdAt), 'dd/MM/yyyy', { locale: es })}
                        </span>
                        <span className="font-mono text-gray-300">
                          Canal: {conn.channelAccountId.slice(0, 12)}…
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Estado raw */}
                  <div className="text-right">
                    <span className={`text-xs font-mono px-2 py-1 rounded ${
                      conn.connectionState === 'open'
                        ? 'bg-green-50 text-green-700'
                        : conn.connectionState === 'error'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-gray-50 text-gray-500'
                    }`}>
                      {conn.connectionState}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
