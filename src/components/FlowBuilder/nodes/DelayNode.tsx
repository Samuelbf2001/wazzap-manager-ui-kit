import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';

export function DelayNode({ data }: { data: any }) {
  return (
    <Card className="p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} />
      
      <div className="flex items-center space-x-2">
        <Clock className="w-5 h-5 text-orange-500" />
        <div>
          <h3 className="font-medium">Espera</h3>
          <p className="text-sm text-gray-500">{data.label}</p>
        </div>
      </div>

      <div className="mt-2 text-sm">
        {data.delay ? `${data.delay} ${data.unit || 'segundos'}` : 'Sin tiempo definido'}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
} 