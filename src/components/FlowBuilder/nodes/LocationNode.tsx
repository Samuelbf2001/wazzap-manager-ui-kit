import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Globe, Clock } from 'lucide-react';

export function LocationNode({ data }: { data: any }) {
  return (
    <Card className="p-4 min-w-[260px] shadow-lg border-l-4 border-l-red-500">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center space-x-2 mb-3">
        <div className="p-2 bg-red-50 rounded-lg">
          <MapPin className="w-4 h-4 text-red-600" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-900">Solicitar Ubicación</h3>
          <p className="text-xs text-gray-500">{data.label}</p>
        </div>
      </div>

      <div className="space-y-3">
        {data.requestMessage && (
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="text-sm text-red-800 line-clamp-2">
              {data.requestMessage}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Tipo:</span>
            <Badge variant="secondary" className="text-xs">
              {data.locationType === 'live' ? 'Ubicación en Vivo' : 'Ubicación Actual'}
            </Badge>
          </div>

          {data.locationType === 'live' && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Duración:</span>
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {data.liveDuration || 15} min
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Precisión:</span>
            <Badge variant="outline" className="text-xs">
              {data.accuracy || 'Alta'}
            </Badge>
          </div>
        </div>

        {data.saveLocation && (
          <div className="bg-blue-50 p-2 rounded">
            <div className="flex items-center space-x-2 mb-1">
              <Globe className="w-3 h-3 text-blue-500" />
              <span className="text-xs font-medium text-blue-700">Guardar Ubicación</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-600">Campo:</span>
                <Badge variant="outline" className="text-xs">
                  {data.locationField || 'user_location'}
                </Badge>
              </div>
              {data.saveAddress && (
                <div className="flex items-center space-x-2">
                  <Navigation className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-blue-600">Incluir dirección</span>
                </div>
              )}
            </div>
          </div>
        )}

        {data.radiusCheck && (
          <div className="bg-yellow-50 p-2 rounded">
            <div className="flex items-center space-x-2 mb-1">
              <MapPin className="w-3 h-3 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-700">Verificar Radio</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-yellow-600">Centro:</span>
                <span className="text-xs text-yellow-600">
                  {data.centerLat}, {data.centerLng}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-yellow-600">Radio:</span>
                <Badge variant="outline" className="text-xs">
                  {data.radius || 1} km
                </Badge>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Timeout:</span>
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {data.timeout || 60}s
          </Badge>
        </div>
      </div>

      {/* Handles de salida */}
      {data.radiusCheck ? (
        <>
          <div className="flex justify-between mt-4">
            <Handle 
              type="source" 
              position={Position.Bottom} 
              id="inside"
              style={{ left: '20%' }}
              className="w-3 h-3"
            />
            <Handle 
              type="source" 
              position={Position.Bottom} 
              id="outside"
              style={{ left: '50%' }}
              className="w-3 h-3"
            />
            <Handle 
              type="source" 
              position={Position.Bottom} 
              id="error"
              style={{ left: '80%' }}
              className="w-3 h-3"
            />
          </div>
          <div className="flex justify-between mt-1 text-xs">
            <span className="text-green-600">Dentro</span>
            <span className="text-yellow-600">Fuera</span>
            <span className="text-red-600">Error</span>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between mt-4">
            <Handle 
              type="source" 
              position={Position.Bottom} 
              id="received"
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
            <span className="text-green-600">Recibida</span>
            <span className="text-red-600">Timeout</span>
          </div>
        </>
      )}
    </Card>
  );
} 