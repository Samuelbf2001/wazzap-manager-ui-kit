import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Webhook } from 'lucide-react';

export function WebhookNode({ data }: { data: any }) {
  return (
    <Card className="p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} />
      
      <div className="flex items-center space-x-2">
        <Webhook className="w-5 h-5 text-purple-500" />
        <div>
          <h3 className="font-medium">Webhook</h3>
          <p className="text-sm text-gray-500">{data.label}</p>
        </div>
      </div>

      <div className="mt-2 text-sm">
        {data.url ? (
          <div className="truncate">{data.url}</div>
        ) : (
          'Sin URL definida'
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
} 