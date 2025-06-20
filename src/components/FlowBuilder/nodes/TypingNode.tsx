import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Settings, 
  Plus, 
  Trash2, 
  X, 
  Brain,
  Tag,
  MessageCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';

interface ClassificationData {
  label: string;
  classificationType: 'intent' | 'sentiment' | 'priority' | 'topic' | 'status' | 'custom';
  
  // Configuración de entrada
  inputSource: 'last_message' | 'conversation_history' | 'user_input' | 'custom_field';
  inputField?: string;
  
  // Configuraciones de clasificación
  classifications: Array<{
    id: string;
    name: string;
    keywords: string[];
    patterns: string[];
    confidence: number;
    description: string;
    color: string;
  }>;
  
  // Configuración IA
  useAI: boolean;
  aiModel: 'openai' | 'claude' | 'custom';
  aiPrompt?: string;
  confidenceThreshold: number;
  
  // Configuración de contexto
  useContext: boolean;
  contextWindow: number;
  considerHistory: boolean;
  
  // Salidas
  saveAsVariable: boolean;
  variableName?: string;
  fallbackClassification?: string;
  
  // Validación
  requireConfidence: boolean;
  minConfidence: number;
}

export function TypingNode({ data, selected }: { data: ClassificationData; selected?: boolean }) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [localData, setLocalData] = useState<ClassificationData>({
    label: 'Clasificación',
    classificationType: 'intent',
    inputSource: 'last_message',
    classifications: [],
    useAI: false,
    aiModel: 'openai',
    confidenceThreshold: 0.7,
    useContext: true,
    contextWindow: 5,
    considerHistory: true,
    saveAsVariable: true,
    variableName: 'classification_result',
    requireConfidence: true,
    minConfidence: 0.6,
    ...data
  });

  const updateData = (updates: Partial<ClassificationData>) => {
    setLocalData(prev => ({ ...prev, ...updates }));
  };

  const addClassification = () => {
    const newClassification = {
      id: Date.now().toString(),
      name: '',
      keywords: [],
      patterns: [],
      confidence: 0.8,
      description: '',
      color: '#3B82F6'
    };
    updateData({
      classifications: [...localData.classifications, newClassification]
    });
  };

  const removeClassification = (id: string) => {
    updateData({
      classifications: localData.classifications.filter(c => c.id !== id)
    });
  };

  const getClassificationIcon = () => {
    switch (localData.classificationType) {
      case 'intent': return Brain;
      case 'sentiment': return TrendingUp;
      case 'priority': return AlertTriangle;
      case 'topic': return Tag;
      case 'status': return CheckCircle;
      default: return Target;
    }
  };

  const getClassificationColor = () => {
    switch (localData.classificationType) {
      case 'intent': return 'border-l-blue-500 bg-blue-50';
      case 'sentiment': return 'border-l-green-500 bg-green-50';
      case 'priority': return 'border-l-red-500 bg-red-50';
      case 'topic': return 'border-l-purple-500 bg-purple-50';
      case 'status': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const ClassificationIcon = getClassificationIcon();

  return (
    <>
      <Handle type="target" position={Position.Top} />
      
      <Card className={`w-80 ${selected ? 'ring-2 ring-blue-500' : ''} ${getClassificationColor()} border-l-4 shadow-sm hover:shadow-md transition-shadow`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="p-1.5 bg-white/50 rounded-full flex-shrink-0">
                <ClassificationIcon className="h-4 w-4 text-gray-600" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm font-medium text-gray-900 truncate">{localData.label}</CardTitle>
                <Badge variant="secondary" className="text-xs mt-1">
                  {localData.classificationType === 'intent' && 'Intención'}
                  {localData.classificationType === 'sentiment' && 'Sentimiento'}
                  {localData.classificationType === 'priority' && 'Prioridad'}
                  {localData.classificationType === 'topic' && 'Tema'}
                  {localData.classificationType === 'status' && 'Estado'}
                  {localData.classificationType === 'custom' && 'Personalizado'}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsConfigOpen(true)}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 pb-4">
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">Entrada: {localData.inputSource === 'last_message' ? 'Último mensaje' : 'Historial'}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{localData.classifications.length} clasificaciones</span>
            </div>
            
            {localData.useAI && (
              <div className="flex items-center gap-1">
                <Brain className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">IA: {localData.aiModel}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">Confianza: {Math.round(localData.confidenceThreshold * 100)}%</span>
            </div>
          </div>

          {localData.classifications.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-medium text-gray-700 mb-2">Clasificaciones:</div>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {localData.classifications.slice(0, 3).map((classification) => (
                  <div key={classification.id} className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: classification.color }}
                    />
                    <span className="text-xs text-gray-700 truncate">{classification.name || 'Sin nombre'}</span>
                  </div>
                ))}
                {localData.classifications.length > 3 && (
                  <div className="text-xs text-gray-500">+{localData.classifications.length - 3} más...</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Handles de salida para cada clasificación */}
      {localData.classifications.map((classification, index) => (
        <Handle 
          key={classification.id}
          type="source" 
          position={Position.Bottom} 
          id={classification.id}
          style={{ left: `${20 + (index * 15)}%` }}
          className="w-3 h-3"
        />
      ))}
      
      {/* Handle por defecto para casos no clasificados */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="unclassified"
        className="w-3 h-3"
      />

      {/* Modal de configuración */}
      {isConfigOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <Card className="w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
            <CardHeader className="flex-shrink-0 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Configurar Clasificación
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsConfigOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6 h-auto">
                  <TabsTrigger value="basic" className="text-xs py-2 px-2">Básico</TabsTrigger>
                  <TabsTrigger value="classifications" className="text-xs py-2 px-1">Config</TabsTrigger>
                  <TabsTrigger value="ai" className="text-xs py-2 px-2">IA</TabsTrigger>
                  <TabsTrigger value="output" className="text-xs py-2 px-2">Salida</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="label">Nombre del Componente</Label>
                      <Input
                        id="label"
                        value={localData.label}
                        onChange={(e) => updateData({ label: e.target.value })}
                        placeholder="Ej: Clasificar intención del cliente"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo de Clasificación</Label>
                      <Select
                        value={localData.classificationType}
                        onValueChange={(value: any) => updateData({ classificationType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[10000]">
                          <SelectItem value="intent">
                            <div className="flex items-center gap-2">
                              <Brain className="h-4 w-4" />
                              Intención
                            </div>
                          </SelectItem>
                          <SelectItem value="sentiment">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Sentimiento
                            </div>
                          </SelectItem>
                          <SelectItem value="priority">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Prioridad
                            </div>
                          </SelectItem>
                          <SelectItem value="topic">
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4" />
                              Tema
                            </div>
                          </SelectItem>
                          <SelectItem value="status">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Estado
                            </div>
                          </SelectItem>
                          <SelectItem value="custom">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Personalizado
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Fuente de Entrada</Label>
                      <Select
                        value={localData.inputSource}
                        onValueChange={(value: any) => updateData({ inputSource: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[10000]">
                          <SelectItem value="last_message">Último Mensaje</SelectItem>
                          <SelectItem value="conversation_history">Historial de Conversación</SelectItem>
                          <SelectItem value="user_input">Entrada del Usuario</SelectItem>
                          <SelectItem value="custom_field">Campo Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {localData.inputSource === 'custom_field' && (
                      <div className="space-y-2">
                        <Label>Campo Personalizado</Label>
                        <Input
                          value={localData.inputField || ''}
                          onChange={(e) => updateData({ inputField: e.target.value })}
                          placeholder="{{variable_name}}"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Umbral de Confianza</Label>
                      <div className="flex items-center space-x-4">
                        <Input
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          value={localData.confidenceThreshold}
                          onChange={(e) => updateData({ confidenceThreshold: parseFloat(e.target.value) || 0.7 })}
                        />
                        <span className="text-sm text-gray-600">
                          {Math.round(localData.confidenceThreshold * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Confianza Mínima</Label>
                      <div className="flex items-center space-x-4">
                        <Input
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          value={localData.minConfidence}
                          onChange={(e) => updateData({ minConfidence: parseFloat(e.target.value) || 0.6 })}
                        />
                        <span className="text-sm text-gray-600">
                          {Math.round(localData.minConfidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="classifications" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-medium">Clasificaciones Disponibles</Label>
                    <Button onClick={addClassification} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Clasificación
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {localData.classifications.map((classification, index) => (
                      <Card key={classification.id} className="p-4 border-l-4" style={{ borderLeftColor: classification.color }}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">Clasificación #{index + 1}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeClassification(classification.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Nombre</Label>
                              <Input
                                value={classification.name}
                                onChange={(e) => {
                                  const updated = localData.classifications.map(c =>
                                    c.id === classification.id ? { ...c, name: e.target.value } : c
                                  );
                                  updateData({ classifications: updated });
                                }}
                                placeholder="Ej: Queja, Consulta, Elogio"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Color</Label>
                              <Input
                                type="color"
                                value={classification.color}
                                onChange={(e) => {
                                  const updated = localData.classifications.map(c =>
                                    c.id === classification.id ? { ...c, color: e.target.value } : c
                                  );
                                  updateData({ classifications: updated });
                                }}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Confianza Mínima</Label>
                              <Input
                                type="number"
                                min="0"
                                max="1"
                                step="0.1"
                                value={classification.confidence}
                                onChange={(e) => {
                                  const updated = localData.classifications.map(c =>
                                    c.id === classification.id ? { ...c, confidence: parseFloat(e.target.value) || 0.8 } : c
                                  );
                                  updateData({ classifications: updated });
                                }}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Palabras Clave (separadas por comas)</Label>
                            <Textarea
                              value={classification.keywords.join(', ')}
                              onChange={(e) => {
                                const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
                                const updated = localData.classifications.map(c =>
                                  c.id === classification.id ? { ...c, keywords } : c
                                );
                                updateData({ classifications: updated });
                              }}
                              placeholder="problema, error, falla, no funciona"
                              rows={2}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Patrones de Expresiones Regulares</Label>
                            <Textarea
                              value={classification.patterns.join('\n')}
                              onChange={(e) => {
                                const patterns = e.target.value.split('\n').map(p => p.trim()).filter(p => p);
                                const updated = localData.classifications.map(c =>
                                  c.id === classification.id ? { ...c, patterns } : c
                                );
                                updateData({ classifications: updated });
                              }}
                              placeholder="^(quiero|necesito|me gustaría).*(comprar|adquirir)"
                              rows={2}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Input
                              value={classification.description}
                              onChange={(e) => {
                                const updated = localData.classifications.map(c =>
                                  c.id === classification.id ? { ...c, description: e.target.value } : c
                                );
                                updateData({ classifications: updated });
                              }}
                              placeholder="Descripción de cuándo aplicar esta clasificación"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                    
                    {localData.classifications.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No hay clasificaciones configuradas</p>
                        <p className="text-sm">Haz clic en "Agregar Clasificación" para comenzar</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="ai" className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="useAI"
                        checked={localData.useAI}
                        onCheckedChange={(checked) => updateData({ useAI: checked })}
                      />
                      <Label htmlFor="useAI" className="text-lg font-medium">Usar Inteligencia Artificial</Label>
                    </div>

                    {localData.useAI && (
                      <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                        <div className="space-y-2">
                          <Label>Modelo de IA</Label>
                          <Select
                            value={localData.aiModel}
                            onValueChange={(value: any) => updateData({ aiModel: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[10000]">
                              <SelectItem value="openai">OpenAI GPT</SelectItem>
                              <SelectItem value="claude">Anthropic Claude</SelectItem>
                              <SelectItem value="custom">Modelo Personalizado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Prompt de Clasificación</Label>
                          <Textarea
                            value={localData.aiPrompt || ''}
                            onChange={(e) => updateData({ aiPrompt: e.target.value })}
                            placeholder="Clasifica el siguiente mensaje según las intenciones: [CLASIFICACIONES]. Responde solo con el nombre de la clasificación y el nivel de confianza."
                            rows={4}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="useContext"
                        checked={localData.useContext}
                        onCheckedChange={(checked) => updateData({ useContext: checked })}
                      />
                      <Label htmlFor="useContext" className="text-lg font-medium">Usar Contexto de Conversación</Label>
                    </div>

                    {localData.useContext && (
                      <div className="space-y-4 pl-6 border-l-2 border-green-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Ventana de Contexto</Label>
                            <Input
                              type="number"
                              min="1"
                              max="20"
                              value={localData.contextWindow}
                              onChange={(e) => updateData({ contextWindow: parseInt(e.target.value) || 5 })}
                            />
                            <p className="text-xs text-gray-500">Número de mensajes anteriores a considerar</p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id="considerHistory"
                              checked={localData.considerHistory}
                              onCheckedChange={(checked) => updateData({ considerHistory: checked })}
                            />
                            <Label htmlFor="considerHistory">Considerar historial completo</Label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="output" className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="saveAsVariable"
                        checked={localData.saveAsVariable}
                        onCheckedChange={(checked) => updateData({ saveAsVariable: checked })}
                      />
                      <Label htmlFor="saveAsVariable" className="text-lg font-medium">Guardar resultado en variable</Label>
                    </div>

                    {localData.saveAsVariable && (
                      <div className="space-y-2 pl-6 border-l-2 border-purple-200">
                        <Label>Nombre de la Variable</Label>
                        <Input
                          value={localData.variableName || ''}
                          onChange={(e) => updateData({ variableName: e.target.value })}
                          placeholder="classification_result"
                        />
                        <p className="text-xs text-gray-500">
                          La variable contendrá: {'{'}classification: "nombre", confidence: 0.95, type: "intent"{'}'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Clasificación de Respaldo</Label>
                    <Select
                      value={localData.fallbackClassification || ''}
                      onValueChange={(value) => updateData({ fallbackClassification: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar clasificación por defecto" />
                      </SelectTrigger>
                      <SelectContent className="z-[10000]">
                        {localData.classifications.map((classification) => (
                          <SelectItem key={classification.id} value={classification.name}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: classification.color }}
                              />
                              {classification.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Clasificación a usar cuando no se alcance el umbral de confianza
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireConfidence"
                      checked={localData.requireConfidence}
                      onCheckedChange={(checked) => updateData({ requireConfidence: checked })}
                    />
                    <Label htmlFor="requireConfidence">Requerir confianza mínima</Label>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <div className="flex-shrink-0 border-t p-6">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsConfigOpen(false)}>
                  <Target className="h-4 w-4 mr-1" />
                  Guardar Configuración
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
} 