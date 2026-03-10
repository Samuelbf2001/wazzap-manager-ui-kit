import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, Type, Smile } from 'lucide-react';

export function EnhancedMessageNode({ data }: { data: any }) {
  return (
    <Card className="p-4 min-w-[250px] max-w-[300px] shadow-lg border-l-4 border-l-blue-500">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900">Mensaje</h3>
            <p className="text-xs text-gray-500">{data.label}</p>
          </div>
        </div>
        {data.typing && (
          <Badge variant="secondary" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {data.delay}ms
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-800 line-clamp-3">
            {data.message || 'Sin mensaje configurado'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {data.formatting?.emoji && (
            <Badge variant="outline" className="text-xs">
              <Smile className="w-3 h-3 mr-1" />
              Emoji
            </Badge>
          )}
          {data.formatting?.bold && (
            <Badge variant="outline" className="text-xs">
              <Type className="w-3 h-3 mr-1" />
              Negrita
            </Badge>
          )}
          {data.variables?.length > 0 && (
            <Badge variant="outline" className="text-xs">
              Variables: {data.variables.length}
            </Badge>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  );
} 