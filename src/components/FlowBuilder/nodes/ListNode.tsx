import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { List } from 'lucide-react';

export function ListNode({ data }: { data: any }) {
  return (
    <Card className="p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} />
      
      <div className="flex items-center space-x-2">
        <List className="w-5 h-5 text-indigo-500" />
        <div>
          <h3 className="font-medium">Lista</h3>
          <p className="text-sm text-gray-500">{data.label}</p>
        </div>
      </div>

      <div className="mt-2 text-sm">
        {data.title ? (
          <div>
            <div className="font-medium">{data.title}</div>
            {data.options && data.options.length > 0 && (
              <div className="mt-1 text-gray-500">
                {data.options.length} opciones
              </div>
            )}
          </div>
        ) : (
          'Sin lista definida'
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
} 