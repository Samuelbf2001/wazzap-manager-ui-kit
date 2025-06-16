import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export function TemplateNode({ data }: { data: any }) {
  return (
    <Card className="p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} />
      
      <div className="flex items-center space-x-2">
        <FileText className="w-5 h-5 text-blue-500" />
        <div>
          <h3 className="font-medium">Plantilla</h3>
          <p className="text-sm text-gray-500">{data.label}</p>
        </div>
      </div>

      <div className="mt-2 text-sm">
        {data.templateName ? (
          <div className="truncate">{data.templateName}</div>
        ) : (
          'Sin plantilla seleccionada'
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
} 