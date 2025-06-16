import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Webhook, Globe, Lock, AlertCircle } from 'lucide-react';

export function WebhookNode({ data }: { data: any }) {
  const getMethodColor = (method: string) => {
    const colors = {
      'GET': 'bg-green-500',
      'POST': 'bg-blue-500',
      'PUT': 'bg-yellow-500',
      'DELETE': 'bg-red-500'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <Card className="p-4 min-w-[250px] shadow-lg border-l-4 border-l-orange-500">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center space-x-2 mb-3">
        <div className="p-2 bg-orange-50 rounded-lg">
          <Webhook className="w-4 h-4 text-orange-600" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-900">Webhook</h3>
          <p className="text-xs text-gray-500">{data.label}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Método:</span>
            <Badge className={`text-xs text-white ${getMethodColor(data.method)}`}>
              {data.method || 'POST'}
            </Badge>
          </div>
          
          <div className="bg-gray-50 p-2 rounded">
            <div className="flex items-center space-x-2 mb-1">
              <Globe className="w-3 h-3 text-gray-500" />
              <span className="text-xs font-medium text-gray-700">URL</span>
            </div>
            <p className="text-xs text-gray-600 break-all">
              {data.url || 'https://api.ejemplo.com/webhook'}
            </p>
          </div>
        </div>

        {data.headers && Object.keys(data.headers).length > 0 && (
          <div className="bg-blue-50 p-2 rounded">
            <div className="flex items-center space-x-2 mb-1">
              <Lock className="w-3 h-3 text-blue-500" />
              <span className="text-xs font-medium text-blue-700">Headers</span>
            </div>
            <div className="space-y-1">
              {Object.entries(data.headers).map(([key, value], index) => (
                <div key={index} className="text-xs text-blue-600">
                  <span className="font-medium">{key}:</span> {value as string}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.payload && (
          <div className="bg-gray-50 p-2 rounded">
            <span className="text-xs font-medium text-gray-700">Payload:</span>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {typeof data.payload === 'string' ? data.payload : JSON.stringify(data.payload)}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Timeout:</span>
          <Badge variant="outline" className="text-xs">
            {data.timeout || 30}s
          </Badge>
        </div>

        {data.retryOnFailure && (
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-3 h-3 text-yellow-500" />
            <span className="text-xs text-gray-600">
              Reintentos: {data.maxRetries || 3}
            </span>
          </div>
        )}
      </div>

      {/* Handles de salida múltiples */}
      <div className="flex justify-between mt-4">
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="success"
          style={{ left: '25%' }}
          className="w-3 h-3"
        />
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="error"
          style={{ left: '75%' }}
          className="w-3 h-3"
        />
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-xs text-green-600">Éxito</span>
        <span className="text-xs text-red-600">Error</span>
      </div>
    </Card>
  );
} 