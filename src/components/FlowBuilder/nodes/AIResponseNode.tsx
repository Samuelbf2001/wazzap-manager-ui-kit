import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, MessageCircle, Settings } from 'lucide-react';

export function AIResponseNode({ data }: { data: any }) {
  return (
    <Card className="p-4 min-w-[260px] shadow-lg border-l-4 border-l-emerald-500">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center space-x-2 mb-3">
        <div className="p-2 bg-emerald-50 rounded-lg">
          <Brain className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-900">Respuesta IA</h3>
          <p className="text-xs text-gray-500">{data.label}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-emerald-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <MessageCircle className="w-3 h-3 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">Prompt del Sistema</span>
          </div>
          <p className="text-xs text-emerald-600 line-clamp-2">
            {data.systemPrompt || 'Eres un asistente útil que responde preguntas de manera clara y concisa'}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Modelo:</span>
            <Badge variant="secondary" className="text-xs">
              {data.model || 'GPT-3.5'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Temperatura:</span>
            <Badge variant="outline" className="text-xs">
              {data.temperature || 0.7}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Max Tokens:</span>
            <Badge variant="outline" className="text-xs">
              {data.maxTokens || 150}
            </Badge>
          </div>
        </div>

        {data.contextVariables && data.contextVariables.length > 0 && (
          <div className="bg-gray-50 p-2 rounded">
            <div className="flex items-center space-x-2 mb-1">
              <Settings className="w-3 h-3 text-gray-500" />
              <span className="text-xs font-medium text-gray-700">Variables de Contexto</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {data.contextVariables.map((variable: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {variable}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Zap className="w-3 h-3 text-yellow-500" />
          <span className="text-xs text-gray-600">
            {data.streaming ? 'Respuesta en tiempo real' : 'Respuesta completa'}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  );
} 