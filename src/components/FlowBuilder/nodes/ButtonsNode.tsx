import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MousePointer, MessageSquare, ExternalLink, Phone } from 'lucide-react';

export function ButtonsNode({ data }: { data: any }) {
  const getButtonIcon = (type: string) => {
    switch (type) {
      case 'reply': return <MessageSquare className="w-3 h-3" />;
      case 'url': return <ExternalLink className="w-3 h-3" />;
      case 'call': return <Phone className="w-3 h-3" />;
      default: return <MousePointer className="w-3 h-3" />;
    }
  };

  const getButtonColor = (type: string) => {
    const colors = {
      'reply': 'bg-blue-500',
      'url': 'bg-green-500',
      'call': 'bg-purple-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <Card className="p-4 min-w-[280px] shadow-lg border-l-4 border-l-cyan-500">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center space-x-2 mb-3">
        <div className="p-2 bg-cyan-50 rounded-lg">
          <MousePointer className="w-4 h-4 text-cyan-600" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-900">Botones WhatsApp</h3>
          <p className="text-xs text-gray-500">{data.label}</p>
        </div>
      </div>

      <div className="space-y-3">
        {data.message && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-800 line-clamp-2">
              {data.message}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Tipo de Botones:</span>
            <Badge variant="secondary" className="text-xs">
              {data.buttonType === 'interactive' ? 'Interactivos' : 'Respuesta Rápida'}
            </Badge>
          </div>

          <div className="space-y-2">
            {data.buttons?.map((button: any, index: number) => (
              <div key={index} className="bg-white border rounded-lg p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1 rounded text-white ${getButtonColor(button.type)}`}>
                      {getButtonIcon(button.type)}
                    </div>
                    <span className="text-sm font-medium">{button.text}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {button.type}
                  </Badge>
                </div>
                
                {button.type === 'url' && button.url && (
                  <p className="text-xs text-blue-600 mt-1 truncate">
                    {button.url}
                  </p>
                )}
                
                {button.type === 'call' && button.phoneNumber && (
                  <p className="text-xs text-purple-600 mt-1">
                    {button.phoneNumber}
                  </p>
                )}
              </div>
            ))}
          </div>

          {(!data.buttons || data.buttons.length === 0) && (
            <div className="text-center py-4 text-gray-400">
              <MousePointer className="w-8 h-8 mx-auto mb-2" />
              <p className="text-xs">Sin botones configurados</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Max Botones:</span>
          <Badge variant="outline" className="text-xs">
            {data.buttons?.length || 0}/3
          </Badge>
        </div>
      </div>

      {/* Handles de salida múltiples para cada botón */}
      {data.buttons?.map((button: any, index: number) => (
        <Handle 
          key={index}
          type="source" 
          position={Position.Bottom} 
          id={`button-${index}`}
          style={{ left: `${20 + (index * 20)}%` }}
          className="w-3 h-3"
        />
      ))}

      {(!data.buttons || data.buttons.length === 0) && (
        <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
      )}
    </Card>
  );
} 