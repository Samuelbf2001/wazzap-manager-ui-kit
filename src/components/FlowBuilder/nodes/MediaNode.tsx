import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Image } from 'lucide-react';

export function MediaNode({ data }: { data: any }) {
  return (
    <Card className="p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} />
      
      <div className="flex items-center space-x-2">
        <Image className="w-5 h-5 text-green-500" />
        <div>
          <h3 className="font-medium">Medio</h3>
          <p className="text-sm text-gray-500">{data.label}</p>
        </div>
      </div>

      <div className="mt-2 text-sm">
        {data.mediaType ? (
          <div className="flex items-center space-x-2">
            <span className="capitalize">{data.mediaType}</span>
            {data.caption && (
              <span className="text-gray-500">- {data.caption}</span>
            )}
          </div>
        ) : (
          'Sin medio seleccionado'
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
} 