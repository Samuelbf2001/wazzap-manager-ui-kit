import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';

export function FlowNode({ data }: { data: any }) {
  return (
    <Card className="p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} />
      <div className="text-sm">{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
} 