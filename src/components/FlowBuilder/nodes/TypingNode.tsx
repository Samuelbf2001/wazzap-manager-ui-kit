import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MoreHorizontal } from 'lucide-react';

export function TypingNode({ data }: { data: any }) {
  return (
    <Card className="p-4 min-w-[200px] shadow-lg border-l-4 border-l-yellow-500">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center space-x-2 mb-3">
        <div className="p-2 bg-yellow-50 rounded-lg">
          <MoreHorizontal className="w-4 h-4 text-yellow-600" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-900">Tipificación</h3>
          <p className="text-xs text-gray-500">{data.label}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Duración:</span>
          <Badge variant="secondary" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {data.duration || 2000}ms
          </Badge>
        </div>
        
        <div className="bg-yellow-50 p-2 rounded text-center">
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <p className="text-xs text-yellow-700 mt-1">Escribiendo...</p>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  );
} 