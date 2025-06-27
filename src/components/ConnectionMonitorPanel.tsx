import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Activity, Users, CheckCircle, AlertCircle, Clock, Database } from 'lucide-react';
import { databaseService } from '@/services/database.service';
import type { WhatsAppConnection } from '@/services/database.service';

export function ConnectionMonitorPanel() {
  const [connections, setConnections] = useState<WhatsAppConnection[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    connected: 0,
    active: 0,
    inactive: 0,
    pending: 0
  });

  useEffect(() => {
    const loadData = () => {
      // Cargar conexiones desde la base de datos
      const dbConnections = databaseService.getAllConnections();
      setConnections(dbConnections);

      // Calcular estadísticas
      const newStats = databaseService.getConnectionStats();
      setStats({
        total: newStats.total,
        connected: newStats.connected,
        active: newStats.active,
        inactive: newStats.inactive,
        pending: newStats.pending
      });
    };

    // Suscribirse a cambios en la base de datos
    const handleUpdate = () => {
      loadData();
    };

    databaseService.subscribe('whatsapp_connections', handleUpdate);
    
    // Cargar datos iniciales
    loadData();

    // Actualizar cada 30 segundos
    const interval = setInterval(loadData, 30000);

    return () => {
      databaseService.unsubscribe('whatsapp_connections', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const getStatusBadge = (connection: WhatsAppConnection) => {
    if (connection.status === 'connected' && connection.instance_state === 'open') {
      return <Badge className="bg-green-100 text-green-800">● Conectado</Badge>;
    } else if (connection.status === 'active') {
      return <Badge className="bg-yellow-100 text-yellow-800">⏳ Conectando</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">● Desconectado</Badge>;
    }
  };

  const exportData = () => {
    const data = databaseService.exportDatabase();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wazzap-connections-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearData = () => {
    if (confirm('¿Estás seguro de que quieres eliminar todas las conexiones?')) {
      databaseService.clearDatabase();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Monitor de Conexiones</h2>
        <p className="text-gray-600">Supervisa el estado de todas las conexiones de WhatsApp en tiempo real</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conexiones</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500">En la base de datos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conectadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.connected}</div>
            <p className="text-xs text-gray-500">Estado: Open</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conectando</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.active}</div>
            <p className="text-xs text-gray-500">En proceso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desconectadas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            <p className="text-xs text-gray-500">Inactivas</p>
          </CardContent>
        </Card>
      </div>

      {/* Configuración del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Configuración del Sistema
          </CardTitle>
          <CardDescription>
            Configuración de monitoreo y base de datos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">URL del Webhook</label>
              <div className="mt-1 p-2 bg-gray-50 rounded text-sm font-mono text-gray-600">
                https://n8n-n8n.5raxun.easypanel.host/webhook/b84f89be-15fe-48e2-9dc7-bd6761393458
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Intervalo de Verificación</label>
              <div className="mt-1 p-2 bg-gray-50 rounded text-sm font-mono text-gray-600">
                15 segundos
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Base de Datos</label>
              <div className="mt-1 p-2 bg-gray-50 rounded text-sm font-mono text-gray-600">
                localStorage (persistente)
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Última Actualización</label>
              <div className="mt-1 p-2 bg-gray-50 rounded text-sm font-mono text-gray-600">
                {new Date().toLocaleString()}
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportData}>
              Exportar Datos
            </Button>
            <Button variant="outline" onClick={clearData} className="text-red-600 hover:text-red-700">
              Limpiar BD
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Conexiones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Conexiones Activas
          </CardTitle>
          <CardDescription>
            Lista detallada de todas las conexiones monitoreadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No hay conexiones</p>
              <p className="text-sm">Crea una nueva conexión para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{connection.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>ID: {connection.id.substring(0, 8)}...</span>
                          {connection.phone_number && (
                            <>
                              <span>•</span>
                              <span>{connection.phone_number}</span>
                            </>
                          )}
                          {connection.instance_name && (
                            <>
                              <span>•</span>
                              <span>Instancia: {connection.instance_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        Creado: {new Date(connection.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Actualizado: {new Date(connection.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    {getStatusBadge(connection)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 