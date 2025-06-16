import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Timer, AlertCircle, Play } from 'lucide-react';

export function TimeoutNode({ data }: { data: any }) {
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <Card className="p-4 min-w-[240px] shadow-lg border-l-4 border-l-amber-500">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center space-x-2 mb-3">
        <div className="p-2 bg-amber-50 rounded-lg">
          <Clock className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-900">Tiempo de Espera</h3>
          <p className="text-xs text-gray-500">{data.label}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-amber-50 p-3 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Timer className="w-4 h-4 text-amber-600" />
            <span className="text-lg font-bold text-amber-800">
              {formatTime(data.duration || 30)}
            </span>
          </div>
          <p className="text-xs text-amber-700">
            {data.description || 'Esperando respuesta del usuario'}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Tipo:</span>
            <Badge variant="secondary" className="text-xs">
              {data.timeoutType === 'absolute' ? 'Tiempo Absoluto' : 'Inactividad'}
            </Badge>
          </div>

          {data.showWarning && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Advertencia:</span>
              <Badge variant="outline" className="text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                {formatTime(data.warningTime || 10)} antes
              </Badge>
            </div>
          )}

          {data.allowExtension && (
            <div className="bg-blue-50 p-2 rounded flex items-center space-x-2">
              <Play className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-blue-700">
                Permitir extensión: +{formatTime(data.extensionTime || 30)}
              </span>
            </div>
          )}
        </div>

        {data.warningMessage && (
          <div className="bg-yellow-50 p-2 rounded">
            <div className="flex items-center space-x-2 mb-1">
              <AlertCircle className="w-3 h-3 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-700">Mensaje de Advertencia</span>
            </div>
            <p className="text-xs text-yellow-600 line-clamp-2">
              {data.warningMessage}
            </p>
          </div>
        )}

        {data.timeoutAction && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-700">Acción al Timeout:</span>
            <Badge variant="outline" className="text-xs">
              {data.timeoutAction === 'end' ? 'Finalizar Flujo' : 
               data.timeoutAction === 'retry' ? 'Reintentar' : 
               data.timeoutAction === 'escalate' ? 'Escalar a Humano' : 'Continuar'}
            </Badge>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Reintentos:</span>
          <Badge variant="outline" className="text-xs">
            {data.maxRetries || 0}
          </Badge>
        </div>
      </div>

      {/* Handles de salida */}
      <div className="flex justify-between mt-4">
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="continue"
          style={{ left: '25%' }}
          className="w-3 h-3"
        />
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="timeout"
          style={{ left: '75%' }}
          className="w-3 h-3"
        />
      </div>

      <div className="flex justify-between mt-1 text-xs">
        <span className="text-green-600">Continuar</span>
        <span className="text-red-600">Timeout</span>
      </div>
    </Card>
  );
} 