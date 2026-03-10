import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { MousePointerClick } from 'lucide-react';

export function InteractiveNode({ data }: { data: any }) {
  return (
    <Card className="p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} />
      
      <div className="flex items-center space-x-2">
        <MousePointerClick className="w-5 h-5 text-yellow-500" />
        <div>
          <h3 className="font-medium">Botones</h3>
          <p className="text-sm text-gray-500">{data.label}</p>
        </div>
      </div>

      <div className="mt-2 text-sm">
        {data.buttons && data.buttons.length > 0 ? (
          <div className="space-y-1">
            {data.buttons.map((button: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span>{button.text}</span>
              </div>
            ))}
          </div>
        ) : (
          'Sin botones definidos'
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
} 