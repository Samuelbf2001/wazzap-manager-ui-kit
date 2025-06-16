import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Star, ThumbsUp, MessageCircle, CheckCircle } from 'lucide-react';

export function SurveyNode({ data }: { data: any }) {
  const getSurveyIcon = (type: string) => {
    switch (type) {
      case 'rating': return <Star className="w-3 h-3" />;
      case 'satisfaction': return <ThumbsUp className="w-3 h-3" />;
      case 'feedback': return <MessageCircle className="w-3 h-3" />;
      case 'nps': return <CheckCircle className="w-3 h-3" />;
      default: return <ClipboardList className="w-3 h-3" />;
    }
  };

  const getSurveyColor = (type: string) => {
    const colors = {
      'rating': 'bg-yellow-500',
      'satisfaction': 'bg-green-500',
      'feedback': 'bg-blue-500',
      'nps': 'bg-purple-500',
      'custom': 'bg-gray-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <Card className="p-4 min-w-[280px] shadow-lg border-l-4 border-l-pink-500">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center space-x-2 mb-3">
        <div className="p-2 bg-pink-50 rounded-lg">
          <ClipboardList className="w-4 h-4 text-pink-600" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-900">Encuesta WhatsApp</h3>
          <p className="text-xs text-gray-500">{data.label}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Tipo:</span>
          <Badge className={`text-xs text-white ${getSurveyColor(data.surveyType)}`}>
            <div className="flex items-center space-x-1">
              {getSurveyIcon(data.surveyType)}
              <span>{data.surveyType || 'custom'}</span>
            </div>
          </Badge>
        </div>

        {data.title && (
          <div className="bg-pink-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-pink-800 mb-1">{data.title}</h4>
            {data.description && (
              <p className="text-xs text-pink-600 line-clamp-2">{data.description}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <span className="text-xs font-medium text-gray-700">Preguntas:</span>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {data.questions?.map((question: any, index: number) => (
              <div key={index} className="bg-white border rounded-lg p-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">{question.text}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {question.type}
                      </Badge>
                      {question.required && (
                        <Badge variant="destructive" className="text-xs">
                          Requerida
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {question.options && question.options.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {question.options.slice(0, 3).map((option: string, optIndex: number) => (
                      <Badge key={optIndex} variant="secondary" className="text-xs">
                        {option}
                      </Badge>
                    ))}
                    {question.options.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{question.options.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {(!data.questions || data.questions.length === 0) && (
            <div className="text-center py-4 text-gray-400">
              <ClipboardList className="w-8 h-8 mx-auto mb-2" />
              <p className="text-xs">Sin preguntas configuradas</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Progreso:</span>
          <Badge variant="outline" className="text-xs">
            {data.questions?.length || 0} preguntas
          </Badge>
        </div>

        {data.saveToDatabase && (
          <div className="bg-blue-50 p-2 rounded flex items-center space-x-2">
            <CheckCircle className="w-3 h-3 text-blue-500" />
            <span className="text-xs text-blue-700">Guardar en base de datos</span>
          </div>
        )}
      </div>

      {/* Handles de salida */}
      <div className="flex justify-between mt-4">
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="completed"
          style={{ left: '25%' }}
          className="w-3 h-3"
        />
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="abandoned"
          style={{ left: '75%' }}
          className="w-3 h-3"
        />
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-xs text-green-600">Completada</span>
        <span className="text-xs text-red-600">Abandonada</span>
      </div>
    </Card>
  );
} 