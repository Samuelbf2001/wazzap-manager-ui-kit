import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { GitBranch } from 'lucide-react';

export function ConditionNode({ data }: { data: any }) {
  return (
    <Card className="p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} />
      
      <div className="flex items-center space-x-2">
        <GitBranch className="w-5 h-5 text-purple-500" />
        <div>
          <h3 className="font-medium">Condición</h3>
          <p className="text-sm text-gray-500">{data.label}</p>
        </div>
      </div>

      <div className="mt-2 text-sm">
        {data.condition || 'Sin condición definida'}
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="true"
        style={{ left: '25%' }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="false"
        style={{ left: '75%' }}
      />
    </Card>
  );
} 