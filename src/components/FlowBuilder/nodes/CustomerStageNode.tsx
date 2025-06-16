import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Target } from 'lucide-react';

export function CustomerStageNode({ data }: { data: any }) {
  const getStageColor = (stage: string) => {
    const colors = {
      'lead': 'bg-blue-500',
      'prospect': 'bg-yellow-500',
      'customer': 'bg-green-500',
      'loyal': 'bg-purple-500'
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <Card className="p-4 min-w-[220px] shadow-lg border-l-4 border-l-purple-500">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center space-x-2 mb-3">
        <div className="p-2 bg-purple-50 rounded-lg">
          <Users className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-900">Etapa Cliente</h3>
          <p className="text-xs text-gray-500">{data.label}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Etapa Actual:</span>
          <Badge className={`text-xs text-white ${getStageColor(data.currentStage)}`}>
            {data.currentStage || 'No definida'}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Target className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-600">Nueva Etapa:</span>
            <Badge variant="outline" className="text-xs">
              {data.newStage || 'Sin cambio'}
            </Badge>
          </div>
          
          {data.scoreChange && (
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-gray-600">Score:</span>
              <Badge variant="secondary" className="text-xs">
                +{data.scoreChange}
              </Badge>
            </div>
          )}
        </div>

        <div className="bg-purple-50 p-2 rounded">
          <p className="text-xs text-purple-700">
            {data.description || 'Actualiza la etapa del cliente en el embudo de ventas'}
          </p>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  );
} 