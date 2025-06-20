import { Handle, Position } from 'reactflow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

export function TemplateNode({ data }: { data: any }) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <Card className="w-80 bg-blue-50 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-blue-100 rounded-full flex-shrink-0">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm font-medium text-gray-900 truncate">Plantilla</CardTitle>
              <Badge variant="secondary" className="text-xs mt-1">
                {data.label || 'Plantilla WhatsApp'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 pb-4">
          <div className="text-sm">
            {data.templateName ? (
              <div className="font-medium text-gray-800 truncate">{data.templateName}</div>
            ) : (
              <div className="text-gray-500 text-xs">Sin plantilla seleccionada</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </>
  );
} 