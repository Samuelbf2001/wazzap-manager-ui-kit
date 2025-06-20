import React, { useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Settings, 
  Database, 
  ShoppingCart, 
  Save, 
  Plus, 
  Trash2, 
  Clock,
  Target,
  MessageSquare,
  BookOpen,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

interface SmartonData {
  label: string;
  smartonType: 'generic' | 'catalog' | 'fieldSaver';
  
  // Configuración del prompt
  promptType: 'generic' | 'faq' | 'appointment';
  customPrompt: string;
  useKnowledgeBase: boolean;
  knowledgeBaseId?: string;
  
  // Catálogo de productos
  selectedCatalogs: string[];
  availableCatalogs: Array<{ id: string; name: string; }>;
  
  // Intenciones de salida
  outputIntentions: Array<{
    id: string;
    name: string;
    keywords: string[];
    description: string;
  }>;
  
  // Campos a guardar
  fieldsToSave: Array<{
    id: string;
    name: string;
    description: string;
    type: 'text' | 'number' | 'email' | 'phone' | 'date';
    required: boolean;
    maxLength?: number;
  }>;
  
  // Etapa del cliente
  updateClientStage: boolean;
  stageAction: 'prospect' | 'service';
  targetStage: 'awareness' | 'lead' | 'mql' | 'sql' | 'opportunity';
  stageConditions: Array<{
    field: string;
    condition: string;
  }>;
  
  // Tiempo de espera
  timeoutEnabled: boolean;
  timeoutDuration: number;
  timeoutUnit: 'minutes' | 'hours' | 'days' | 'weeks';
  timeoutAction: 'escalate' | 'retry' | 'end';
  
  // Configuración avanzada
  contextTransfer: boolean;
  maxRetries: number;
  temperature: number;
  maxTokens: number;
}

const defaultPrompts = {
  generic: "Eres un asistente virtual inteligente. Responde de manera útil y conversacional a las consultas del usuario.",
  faq: "Responde a las preguntas frecuentes basándote en la información proporcionada. Si no tienes la información, indica que puedes conectar con un asesor.",
  appointment: "Ayuda al usuario a agendar una cita. Solicita la información necesaria: fecha preferida, hora, tipo de servicio y datos de contacto."
};

export function SmartonNode({ data, selected }: NodeProps<SmartonData>) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [localData, setLocalData] = useState<SmartonData>({
    label: 'Smarton',
    smartonType: 'generic',
    promptType: 'generic',
    customPrompt: defaultPrompts.generic,
    useKnowledgeBase: false,
    selectedCatalogs: [],
    availableCatalogs: [
      { id: '1', name: 'Productos Electrónicos' },
      { id: '2', name: 'Ropa y Accesorios' },
      { id: '3', name: 'Servicios' }
    ],
    outputIntentions: [],
    fieldsToSave: [],
    updateClientStage: false,
    stageAction: 'prospect',
    targetStage: 'lead',
    stageConditions: [],
    timeoutEnabled: false,
    timeoutDuration: 30,
    timeoutUnit: 'minutes',
    timeoutAction: 'escalate',
    contextTransfer: true,
    maxRetries: 3,
    temperature: 0.7,
    maxTokens: 500,
    ...data
  });

  const updateData = useCallback((updates: Partial<SmartonData>) => {
    setLocalData(prev => ({ ...prev, ...updates }));
  }, []);

  const addOutputIntention = () => {
    const newIntention = {
      id: Date.now().toString(),
      name: '',
      keywords: [],
      description: ''
    };
    updateData({
      outputIntentions: [...localData.outputIntentions, newIntention]
    });
  };

  const removeOutputIntention = (id: string) => {
    updateData({
      outputIntentions: localData.outputIntentions.filter(intent => intent.id !== id)
    });
  };

  const addFieldToSave = () => {
    const newField = {
      id: Date.now().toString(),
      name: '',
      description: '',
      type: 'text' as const,
      required: false
    };
    updateData({
      fieldsToSave: [...localData.fieldsToSave, newField]
    });
  };

  const removeFieldToSave = (id: string) => {
    updateData({
      fieldsToSave: localData.fieldsToSave.filter(field => field.id !== id)
    });
  };

  const getSmartonIcon = () => {
    switch (localData.smartonType) {
      case 'catalog': return ShoppingCart;
      case 'fieldSaver': return Database;
      default: return Brain;
    }
  };

  const getSmartonColor = () => {
    switch (localData.smartonType) {
      case 'catalog': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'fieldSaver': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-purple-600 bg-purple-50 border-purple-200';
    }
  };

  const SmartonIcon = getSmartonIcon();

  return (
    <>
      <Handle type="target" position={Position.Top} />
      
      <Card className={`w-80 ${selected ? 'ring-2 ring-blue-500' : ''} ${getSmartonColor()} border-l-4 shadow-sm hover:shadow-md transition-shadow`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="p-1.5 bg-white/50 rounded-full flex-shrink-0">
                <SmartonIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm font-medium text-gray-900 truncate">{localData.label}</CardTitle>
                <Badge variant="secondary" className="text-xs mt-1">
                  {localData.smartonType === 'generic' && 'Genérico'}
                  {localData.smartonType === 'catalog' && 'Catálogo'}
                  {localData.smartonType === 'fieldSaver' && 'Guardado de Campos'}
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
        
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs text-gray-600">
            {localData.smartonType === 'generic' && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>Prompt: {localData.promptType}</span>
              </div>
            )}
            
            {localData.smartonType === 'catalog' && (
              <div className="flex items-center gap-1">
                <ShoppingCart className="h-3 w-3" />
                <span>{localData.selectedCatalogs.length} catálogos</span>
              </div>
            )}
            
            {localData.fieldsToSave.length > 0 && (
              <div className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                <span>{localData.fieldsToSave.length} campos</span>
              </div>
            )}
            
            {localData.outputIntentions.length > 0 && (
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                <span>{localData.outputIntentions.length} intenciones</span>
              </div>
            )}
            
            {localData.timeoutEnabled && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Timeout: {localData.timeoutDuration}{localData.timeoutUnit.charAt(0)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Handles de salida dinámicos */}
      <Handle type="source" position={Position.Bottom} id="default" />
      {localData.outputIntentions.map((intention, index) => (
        <Handle
          key={intention.id}
          type="source"
          position={Position.Right}
          id={intention.id}
          style={{ top: 60 + (index * 20) }}
        />
      ))}

      {/* Modal de configuración */}
      {isConfigOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-[800px] max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Configurar Smarton
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
            
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-5 h-auto">
                  <TabsTrigger value="basic" className="text-xs py-2 px-1">Básico</TabsTrigger>
                  <TabsTrigger value="prompt" className="text-xs py-2 px-1">Prompt</TabsTrigger>
                  <TabsTrigger value="intentions" className="text-xs py-2 px-1">Intents</TabsTrigger>
                  <TabsTrigger value="fields" className="text-xs py-2 px-1">Campos</TabsTrigger>
                  <TabsTrigger value="advanced" className="text-xs py-2 px-1">Avanzado</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="label">Nombre del Componente</Label>
                    <Input
                      id="label"
                      value={localData.label}
                      onChange={(e) => updateData({ label: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smartonType">Tipo de Smarton</Label>
                    <Select
                      value={localData.smartonType}
                      onValueChange={(value: 'generic' | 'catalog' | 'fieldSaver') => 
                        updateData({ smartonType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="generic">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            Smarton Genérico
                          </div>
                        </SelectItem>
                        <SelectItem value="catalog">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Smarton Catálogo de Productos
                          </div>
                        </SelectItem>
                        <SelectItem value="fieldSaver">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Smarton Guardado de Campos
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="contextTransfer"
                      checked={localData.contextTransfer}
                      onCheckedChange={(checked) => updateData({ contextTransfer: checked })}
                    />
                    <Label htmlFor="contextTransfer">Transferencia de Contexto</Label>
                  </div>
                </TabsContent>

                <TabsContent value="prompt" className="space-y-4">
                  {localData.smartonType === 'generic' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="promptType">Tipo de Prompt</Label>
                        <Select
                          value={localData.promptType}
                          onValueChange={(value: 'generic' | 'faq' | 'appointment') => {
                            updateData({ 
                              promptType: value,
                              customPrompt: defaultPrompts[value]
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="generic">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Prompt Genérico
                              </div>
                            </SelectItem>
                            <SelectItem value="faq">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                Preguntas Frecuentes
                              </div>
                            </SelectItem>
                            <SelectItem value="appointment">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Agendamiento de Citas
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customPrompt">Prompt Personalizado</Label>
                        <Textarea
                          id="customPrompt"
                          value={localData.customPrompt}
                          onChange={(e) => updateData({ customPrompt: e.target.value })}
                          rows={4}
                          placeholder="Describe cómo debe comportarse el Smarton..."
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="useKnowledgeBase"
                          checked={localData.useKnowledgeBase}
                          onCheckedChange={(checked) => updateData({ useKnowledgeBase: checked })}
                        />
                        <Label htmlFor="useKnowledgeBase">Usar Base de Conocimiento</Label>
                      </div>

                      {localData.useKnowledgeBase && (
                        <div className="space-y-2">
                          <Label htmlFor="knowledgeBaseId">Base de Conocimiento</Label>
                          <Select
                            value={localData.knowledgeBaseId || ''}
                            onValueChange={(value) => updateData({ knowledgeBaseId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar base de conocimiento" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kb1">Base de Conocimiento 1</SelectItem>
                              <SelectItem value="kb2">Base de Conocimiento 2</SelectItem>
                              <SelectItem value="kb3">Base de Conocimiento 3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}

                  {localData.smartonType === 'catalog' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Catálogos Seleccionados</Label>
                        <div className="space-y-2">
                          {localData.availableCatalogs.map((catalog) => (
                            <div key={catalog.id} className="flex items-center space-x-2">
                              <Switch
                                id={`catalog-${catalog.id}`}
                                checked={localData.selectedCatalogs.includes(catalog.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateData({
                                      selectedCatalogs: [...localData.selectedCatalogs, catalog.id]
                                    });
                                  } else {
                                    updateData({
                                      selectedCatalogs: localData.selectedCatalogs.filter(id => id !== catalog.id)
                                    });
                                  }
                                }}
                              />
                              <Label htmlFor={`catalog-${catalog.id}`}>{catalog.name}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="intentions" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Intenciones de Salida</Label>
                    <Button onClick={addOutputIntention} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {localData.outputIntentions.map((intention) => (
                      <Card key={intention.id} className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Input
                              placeholder="Nombre de la intención"
                              value={intention.name}
                              onChange={(e) => {
                                const updated = localData.outputIntentions.map(int =>
                                  int.id === intention.id ? { ...int, name: e.target.value } : int
                                );
                                updateData({ outputIntentions: updated });
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOutputIntention(intention.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            placeholder="Palabras clave (separadas por comas)"
                            value={intention.keywords.join(', ')}
                            onChange={(e) => {
                              const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
                              const updated = localData.outputIntentions.map(int =>
                                int.id === intention.id ? { ...int, keywords } : int
                              );
                              updateData({ outputIntentions: updated });
                            }}
                          />
                          <Textarea
                            placeholder="Descripción de la intención"
                            value={intention.description}
                            onChange={(e) => {
                              const updated = localData.outputIntentions.map(int =>
                                int.id === intention.id ? { ...int, description: e.target.value } : int
                              );
                              updateData({ outputIntentions: updated });
                            }}
                            rows={2}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="fields" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Campos a Guardar</Label>
                    <Button onClick={addFieldToSave} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Campo
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {localData.fieldsToSave.map((field) => (
                      <Card key={field.id} className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Input
                              placeholder="Nombre del campo"
                              value={field.name}
                              onChange={(e) => {
                                const updated = localData.fieldsToSave.map(f =>
                                  f.id === field.id ? { ...f, name: e.target.value } : f
                                );
                                updateData({ fieldsToSave: updated });
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFieldToSave(field.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <Select
                              value={field.type}
                              onValueChange={(value: 'text' | 'number' | 'email' | 'phone' | 'date') => {
                                const updated = localData.fieldsToSave.map(f =>
                                  f.id === field.id ? { ...f, type: value } : f
                                );
                                updateData({ fieldsToSave: updated });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Texto</SelectItem>
                                <SelectItem value="number">Número</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Teléfono</SelectItem>
                                <SelectItem value="date">Fecha</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`required-${field.id}`}
                                checked={field.required}
                                onCheckedChange={(checked) => {
                                  const updated = localData.fieldsToSave.map(f =>
                                    f.id === field.id ? { ...f, required: checked } : f
                                  );
                                  updateData({ fieldsToSave: updated });
                                }}
                              />
                              <Label htmlFor={`required-${field.id}`} className="text-sm">Requerido</Label>
                            </div>
                          </div>
                          
                          <Textarea
                            placeholder="Descripción del campo"
                            value={field.description}
                            onChange={(e) => {
                              const updated = localData.fieldsToSave.map(f =>
                                f.id === field.id ? { ...f, description: e.target.value } : f
                              );
                              updateData({ fieldsToSave: updated });
                            }}
                            rows={2}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="updateClientStage"
                        checked={localData.updateClientStage}
                        onCheckedChange={(checked) => updateData({ updateClientStage: checked })}
                      />
                      <Label htmlFor="updateClientStage">Actualizar Etapa del Cliente</Label>
                    </div>

                    {localData.updateClientStage && (
                      <div className="space-y-3 pl-6">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Acción</Label>
                            <Select
                              value={localData.stageAction}
                              onValueChange={(value: 'prospect' | 'service') => updateData({ stageAction: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="prospect">Etapa de Prospecto</SelectItem>
                                <SelectItem value="service">Servicio</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Etapa Objetivo</Label>
                            <Select
                              value={localData.targetStage}
                              onValueChange={(value: 'awareness' | 'lead' | 'mql' | 'sql' | 'opportunity') => 
                                updateData({ targetStage: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="awareness">Awareness</SelectItem>
                                <SelectItem value="lead">Lead</SelectItem>
                                <SelectItem value="mql">MQL</SelectItem>
                                <SelectItem value="sql">SQL</SelectItem>
                                <SelectItem value="opportunity">Opportunity</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="timeoutEnabled"
                        checked={localData.timeoutEnabled}
                        onCheckedChange={(checked) => updateData({ timeoutEnabled: checked })}
                      />
                      <Label htmlFor="timeoutEnabled">Habilitar Tiempo de Espera</Label>
                    </div>

                    {localData.timeoutEnabled && (
                      <div className="space-y-3 pl-6">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label>Duración</Label>
                            <Input
                              type="number"
                              value={localData.timeoutDuration}
                              onChange={(e) => updateData({ timeoutDuration: parseInt(e.target.value) || 30 })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Unidad</Label>
                            <Select
                              value={localData.timeoutUnit}
                              onValueChange={(value: 'minutes' | 'hours' | 'days' | 'weeks') => 
                                updateData({ timeoutUnit: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="minutes">Minutos</SelectItem>
                                <SelectItem value="hours">Horas</SelectItem>
                                <SelectItem value="days">Días</SelectItem>
                                <SelectItem value="weeks">Semanas</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Acción</Label>
                            <Select
                              value={localData.timeoutAction}
                              onValueChange={(value: 'escalate' | 'retry' | 'end') => 
                                updateData({ timeoutAction: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="escalate">Escalar</SelectItem>
                                <SelectItem value="retry">Reintentar</SelectItem>
                                <SelectItem value="end">Finalizar</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Máx. Reintentos</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={localData.maxRetries}
                          onChange={(e) => updateData({ maxRetries: parseInt(e.target.value) || 3 })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Temperatura IA</Label>
                        <Input
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          value={localData.temperature}
                          onChange={(e) => updateData({ temperature: parseFloat(e.target.value) || 0.7 })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Máx. Tokens</Label>
                        <Input
                          type="number"
                          min="50"
                          max="2000"
                          value={localData.maxTokens}
                          onChange={(e) => updateData({ maxTokens: parseInt(e.target.value) || 500 })}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsConfigOpen(false)}>
                  <Save className="h-4 w-4 mr-1" />
                  Guardar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}