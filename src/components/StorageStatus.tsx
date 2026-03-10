import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  HardDrive, 
  FileText, 
  BarChart3, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { WazzapStorage, StorageService } from '@/lib/storage';

export function StorageStatus() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = () => {
    setLoading(true);
    try {
      const storageStats = WazzapStorage.getStorageStats();
      
      // Obtener conteos específicos
      const aiAgents = WazzapStorage.getAIAgents();
      const aiReports = WazzapStorage.getAIReports();
      
      setStats({
        ...storageStats,
        aiAgents: aiAgents.length,
        aiReports: aiReports.length,
        isSupported: typeof(Storage) !== "undefined",
        lastUpdate: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Error cargando estadísticas de almacenamiento:', error);
      setStats({
        error: 'Error cargando estadísticas',
        isSupported: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Cargando estado...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats?.isSupported) {
    return (
      <Card className="w-full max-w-md border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {stats?.error || 'Almacenamiento no soportado'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Database className="h-5 w-5 text-green-600" />
          Estado de Persistencia
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Activo
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-blue-900">{stats.aiAgents}</div>
            <div className="text-xs text-blue-600 flex items-center justify-center gap-1">
              <FileText className="h-3 w-3" />
              Agentes IA
            </div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-lg font-bold text-purple-900">{stats.aiReports}</div>
            <div className="text-xs text-purple-600 flex items-center justify-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Reportes IA
            </div>
          </div>
        </div>

        {/* Información de almacenamiento */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              Espacio usado:
            </span>
            <span className="font-medium">{stats.totalSizeKB} KB</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Archivos de la app:</span>
            <span className="font-medium">{stats.appKeys}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total localStorage:</span>
            <span className="font-medium">{stats.totalKeys} archivos</span>
          </div>
        </div>

        {/* Archivos más grandes */}
        {stats.keysSizes && stats.keysSizes.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Archivos más grandes:
            </div>
            <div className="space-y-1">
              {stats.keysSizes.slice(0, 3).map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 truncate max-w-[150px]">
                    {item.key.replace('wazzap-', '')}
                  </span>
                  <span className="font-medium">{item.sizeKB} KB</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controles */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Última actualización: {stats.lastUpdate}
            </div>
            <Button 
              onClick={loadStats} 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 