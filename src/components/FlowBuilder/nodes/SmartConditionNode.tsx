import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Brain, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function SmartConditionNode({ data }: { data: any }) {
  return (
    <Card className="p-4 min-w-[250px] shadow-lg border-l-4 border-l-indigo-500">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center space-x-2 mb-3">
        <div className="p-2 bg-indigo-50 rounded-lg">
          {data.useAI ? (
            <Brain className="w-4 h-4 text-indigo-600" />
          ) : (
            <GitBranch className="w-4 h-4 text-indigo-600" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-900">
            {data.useAI ? 'Condición IA' : 'Condición'}
          </h3>
          <p className="text-xs text-gray-500">{data.label}</p>
        </div>
      </div>

      <div className="space-y-3">
        {data.useAI ? (
          <div className="bg-indigo-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-3 h-3 text-indigo-600" />
              <span className="text-xs font-medium text-indigo-700">Evaluación IA</span>
            </div>
            <p className="text-xs text-indigo-600">
              {data.aiPrompt || 'Evalúa la intención del usuario y clasifica la respuesta'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.conditions?.map((condition: any, index: number) => (
              <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                <span className="font-medium">{condition.variable}</span>
                <span className="text-gray-500 mx-1">{condition.operator}</span>
                <span className="text-blue-600">"{condition.value}"</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Lógica:</span>
          <Badge variant="outline" className="text-xs">
            {data.logic || 'AND'}
          </Badge>
        </div>
      </div>

      {/* Handles de salida múltiples */}
      <div className="flex justify-between mt-4">
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="true"
          style={{ left: '25%' }}
          className="w-3 h-3"
        />
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="false"
          style={{ left: '75%' }}
          className="w-3 h-3"
        />
      </div>

      <div className="flex justify-between mt-1">
        <div className="flex items-center space-x-1">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span className="text-xs text-green-600">Verdadero</span>
        </div>
        <div className="flex items-center space-x-1">
          <XCircle className="w-3 h-3 text-red-500" />
          <span className="text-xs text-red-600">Falso</span>
        </div>
      </div>

      {data.fallback && (
        <Handle 
          type="source" 
          position={Position.Right} 
          id="fallback"
          className="w-3 h-3"
        />
      )}
    </Card>
  );
} 