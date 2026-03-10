import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag, Plus, Minus, Hash } from 'lucide-react';

export function TagNode({ data }: { data: any }) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'add': return <Plus className="w-3 h-3" />;
      case 'remove': return <Minus className="w-3 h-3" />;
      case 'replace': return <Hash className="w-3 h-3" />;
      default: return <Tag className="w-3 h-3" />;
    }
  };

  const getActionColor = (action: string) => {
    const colors = {
      'add': 'bg-green-500',
      'remove': 'bg-red-500',
      'replace': 'bg-blue-500'
    };
    return colors[action as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <Card className="p-4 min-w-[250px] shadow-lg border-l-4 border-l-violet-500">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center space-x-2 mb-3">
        <div className="p-2 bg-violet-50 rounded-lg">
          <Tag className="w-4 h-4 text-violet-600" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-900">Gestionar Etiquetas</h3>
          <p className="text-xs text-gray-500">{data.label}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Acción:</span>
          <Badge className={`text-xs text-white ${getActionColor(data.action)}`}>
            <div className="flex items-center space-x-1">
              {getActionIcon(data.action)}
              <span>{data.action || 'add'}</span>
            </div>
          </Badge>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-medium text-gray-700">Etiquetas:</span>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
            {data.tags?.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          {(!data.tags || data.tags.length === 0) && (
            <div className="text-center py-4 text-gray-400">
              <Tag className="w-8 h-8 mx-auto mb-2" />
              <p className="text-xs">Sin etiquetas configuradas</p>
            </div>
          )}
        </div>

        {data.conditions && data.conditions.length > 0 && (
          <div className="bg-violet-50 p-2 rounded">
            <span className="text-xs font-medium text-violet-700">Condiciones:</span>
            <div className="space-y-1 mt-1">
              {data.conditions.map((condition: any, index: number) => (
                <div key={index} className="text-xs text-violet-600">
                  <span className="font-medium">{condition.field}</span>
                  <span className="mx-1">{condition.operator}</span>
                  <span>"{condition.value}"</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Aplicar a:</span>
            <Badge variant="outline" className="text-xs">
              {data.applyTo === 'all' ? 'Todos los contactos' : 'Contacto actual'}
            </Badge>
          </div>

          {data.notifyChange && (
            <div className="bg-blue-50 p-2 rounded flex items-center space-x-2">
              <span className="text-xs text-blue-700">Notificar cambios al equipo</span>
            </div>
          )}

          {data.triggerAutomation && (
            <div className="bg-green-50 p-2 rounded flex items-center space-x-2">
              <span className="text-xs text-green-700">Activar automatizaciones</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Total Etiquetas:</span>
          <Badge variant="outline" className="text-xs">
            {data.tags?.length || 0}
          </Badge>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  );
} 