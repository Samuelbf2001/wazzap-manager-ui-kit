import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { User } from 'lucide-react';

export function ContactNode({ data }: { data: any }) {
  return (
    <Card className="p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} />
      
      <div className="flex items-center space-x-2">
        <User className="w-5 h-5 text-blue-500" />
        <div>
          <h3 className="font-medium">Contacto</h3>
          <p className="text-sm text-gray-500">{data.label}</p>
        </div>
      </div>

      <div className="mt-2 text-sm">
        {data.contact ? (
          <div>
            <div className="font-medium">{data.contact.name}</div>
            <div className="text-gray-500">{data.contact.phone}</div>
          </div>
        ) : (
          'Sin contacto definido'
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
} 