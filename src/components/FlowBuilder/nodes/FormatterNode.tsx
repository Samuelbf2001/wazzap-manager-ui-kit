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
  FileText, 
  Settings, 
  Brain, 
  Code, 
  Type, 
  Save, 
  Plus, 
  Trash2, 
  X,
  Wand2,
  Database,
  MessageSquare,
  Eye,
  Copy
} from 'lucide-react';

interface FormatterData {
  label: string;
  formatterType: 'ai' | 'template' | 'json';
  
  // Datos de entrada
  inputSource: 'json' | 'variables' | 'flow_data';
  inputData: string;
  inputVariables: Array<{
    id: string;
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    value: string;
  }>;
  
  // Configuración IA
  useAI: boolean;
  aiPrompt: string;
  aiModel: 'gpt-3.5-turbo' | 'gpt-4' | 'claude-3-haiku' | 'claude-3-sonnet';
  temperature: number;
  maxTokens: number;
  
  // Plantilla de formato
  template: string;
  outputFormat: 'text' | 'markdown' | 'html' | 'json';
  
  // Variables dinámicas
  dynamicVariables: Array<{
    id: string;
    name: string;
    source: string;
    transformation: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | 'date_format' | 'number_format';
    format?: string;
  }>;
  
  // Configuración avanzada
  preserveStructure: boolean;
  includeMetadata: boolean;
  errorHandling: 'ignore' | 'default_text' | 'show_error';
  defaultText: string;
}

const defaultTemplates = {
  contact: "Nombre: {{name}}\nEmail: {{email}}\nTeléfono: {{phone}}\nEmpresa: {{company}}",
  order: "Pedido #{{order_id}}\nCliente: {{customer_name}}\nTotal: ${{total}}\nFecha: {{date}}",
  appointment: "Cita programada para {{date}} a las {{time}}\nServicio: {{service}}\nCliente: {{client_name}}",
  custom: ""
};

const aiPrompts = {
  general: "Convierte los siguientes datos en un texto claro y legible para el usuario:",
  summary: "Resume la siguiente información de manera concisa y comprensible:",
  detailed: "Presenta la siguiente información de manera detallada y estructurada:",
  conversational: "Convierte estos datos en un mensaje conversacional y amigable:"
};

export function FormatterNode({ data, selected }: NodeProps<FormatterData>) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [localData, setLocalData] = useState<FormatterData>({
    label: 'Formateador',
    formatterType: 'ai',
    inputSource: 'json',
    inputData: '{}',
    inputVariables: [],
    useAI: true,
    aiPrompt: aiPrompts.general,
    aiModel: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 500,
    template: defaultTemplates.contact,
    outputFormat: 'text',
    dynamicVariables: [],
    preserveStructure: false,
    includeMetadata: false,
    errorHandling: 'default_text',
    defaultText: 'No se pudieron procesar los datos',
    ...data
  });

  const updateData = useCallback((updates: Partial<FormatterData>) => {
    setLocalData(prev => ({ ...prev, ...updates }));
  }, []);

  const addInputVariable = () => {
    const newVariable = {
      id: Date.now().toString(),
      name: '',
      type: 'string' as const,
      value: ''
    };
    updateData({
      inputVariables: [...localData.inputVariables, newVariable]
    });
  };

  const removeInputVariable = (id: string) => {
    updateData({
      inputVariables: localData.inputVariables.filter(variable => variable.id !== id)
    });
  };

  const addDynamicVariable = () => {
    const newVariable = {
      id: Date.now().toString(),
      name: '',
      source: '',
      transformation: 'none' as const
    };
    updateData({
      dynamicVariables: [...localData.dynamicVariables, newVariable]
    });
  };

  const removeDynamicVariable = (id: string) => {
    updateData({
      dynamicVariables: localData.dynamicVariables.filter(variable => variable.id !== id)
    });
  };

  const getFormatterIcon = () => {
    switch (localData.formatterType) {
      case 'ai': return Brain;
      case 'template': return Type;
      case 'json': return Code;
      default: return FileText;
    }
  };

  const FormatterIcon = getFormatterIcon();

  return (
    <>
      <Handle type="target" position={Position.Top} />
      
      <Card className={`w-80 ${selected ? 'ring-2 ring-blue-500' : ''} bg-orange-50 border-orange-200`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FormatterIcon className="h-4 w-4 text-orange-600" />
              <CardTitle className="text-sm font-medium">{localData.label}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsConfigOpen(true)}
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
          <Badge variant="secondary" className="w-fit text-xs">
            {localData.formatterType === 'ai' && 'IA'}
            {localData.formatterType === 'template' && 'Plantilla'}
            {localData.formatterType === 'json' && 'JSON'}
          </Badge>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              <span>Entrada: {localData.inputSource}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>Salida: {localData.outputFormat}</span>
            </div>
            
            {localData.useAI && (
              <div className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                <span>Modelo: {localData.aiModel}</span>
              </div>
            )}
            
            {localData.dynamicVariables.length > 0 && (
              <div className="flex items-center gap-1">
                <Wand2 className="h-3 w-3" />
                <span>{localData.dynamicVariables.length} variables</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Bottom} />

      {/* Modal de configuración */}
      {isConfigOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-[800px] max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Configurar Formateador
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
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="input">Entrada</TabsTrigger>
                  <TabsTrigger value="format">Formato</TabsTrigger>
                  <TabsTrigger value="advanced">Avanzado</TabsTrigger>
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
                    <Label htmlFor="formatterType">Tipo de Formateador</Label>
                    <Select
                      value={localData.formatterType}
                      onValueChange={(value: 'ai' | 'template' | 'json') => 
                        updateData({ formatterType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ai">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            Formateador con IA
                          </div>
                        </SelectItem>
                        <SelectItem value="template">
                          <div className="flex items-center gap-2">
                            <Type className="h-4 w-4" />
                            Plantilla de Texto
                          </div>
                        </SelectItem>
                        <SelectItem value="json">
                          <div className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            Procesador JSON
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="outputFormat">Formato de Salida</Label>
                    <Select
                      value={localData.outputFormat}
                      onValueChange={(value: 'text' | 'markdown' | 'html' | 'json') => 
                        updateData({ outputFormat: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto Plano</SelectItem>
                        <SelectItem value="markdown">Markdown</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="input" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inputSource">Fuente de Datos</Label>
                    <Select
                      value={localData.inputSource}
                      onValueChange={(value: 'json' | 'variables' | 'flow_data') => 
                        updateData({ inputSource: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON Directo</SelectItem>
                        <SelectItem value="variables">Variables del Flujo</SelectItem>
                        <SelectItem value="flow_data">Datos del Flujo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {localData.inputSource === 'json' && (
                    <div className="space-y-2">
                      <Label htmlFor="inputData">Datos JSON</Label>
                      <Textarea
                        id="inputData"
                        value={localData.inputData}
                        onChange={(e) => updateData({ inputData: e.target.value })}
                        rows={6}
                        placeholder='{"name": "Juan", "email": "juan@email.com"}'
                        className="font-mono text-sm"
                      />
                    </div>
                  )}

                  {localData.inputSource === 'variables' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Variables de Entrada</Label>
                        <Button onClick={addInputVariable} size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Agregar
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {localData.inputVariables.map((variable) => (
                          <Card key={variable.id} className="p-3">
                            <div className="grid grid-cols-3 gap-2">
                              <Input
                                placeholder="Nombre"
                                value={variable.name}
                                onChange={(e) => {
                                  const updated = localData.inputVariables.map(v =>
                                    v.id === variable.id ? { ...v, name: e.target.value } : v
                                  );
                                  updateData({ inputVariables: updated });
                                }}
                              />
                              <Select
                                value={variable.type}
                                onValueChange={(value: 'string' | 'number' | 'boolean' | 'object' | 'array') => {
                                  const updated = localData.inputVariables.map(v =>
                                    v.id === variable.id ? { ...v, type: value } : v
                                  );
                                  updateData({ inputVariables: updated });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="string">Texto</SelectItem>
                                  <SelectItem value="number">Número</SelectItem>
                                  <SelectItem value="boolean">Booleano</SelectItem>
                                  <SelectItem value="object">Objeto</SelectItem>
                                  <SelectItem value="array">Array</SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="flex gap-1">
                                <Input
                                  placeholder="Valor"
                                  value={variable.value}
                                  onChange={(e) => {
                                    const updated = localData.inputVariables.map(v =>
                                      v.id === variable.id ? { ...v, value: e.target.value } : v
                                    );
                                    updateData({ inputVariables: updated });
                                  }}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeInputVariable(variable.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="format" className="space-y-4">
                  {localData.formatterType === 'ai' && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="useAI"
                          checked={localData.useAI}
                          onCheckedChange={(checked) => updateData({ useAI: checked })}
                        />
                        <Label htmlFor="useAI">Usar IA para Formatear</Label>
                      </div>

                      {localData.useAI && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="aiModel">Modelo de IA</Label>
                            <Select
                              value={localData.aiModel}
                              onValueChange={(value: 'gpt-3.5-turbo' | 'gpt-4' | 'claude-3-haiku' | 'claude-3-sonnet') => 
                                updateData({ aiModel: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                <SelectItem value="gpt-4">GPT-4</SelectItem>
                                <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="aiPrompt">Prompt de IA</Label>
                            <Textarea
                              id="aiPrompt"
                              value={localData.aiPrompt}
                              onChange={(e) => updateData({ aiPrompt: e.target.value })}
                              rows={3}
                              placeholder="Describe cómo quieres que la IA formatee los datos..."
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Temperatura</Label>
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
                      )}
                    </>
                  )}

                  {localData.formatterType === 'template' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Plantillas Predefinidas</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(defaultTemplates).map(([key, template]) => (
                            <Button
                              key={key}
                              variant="outline"
                              size="sm"
                              onClick={() => updateData({ template })}
                              className="justify-start"
                            >
                              {key === 'contact' && 'Contacto'}
                              {key === 'order' && 'Pedido'}
                              {key === 'appointment' && 'Cita'}
                              {key === 'custom' && 'Personalizado'}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="template">Plantilla de Formato</Label>
                        <Textarea
                          id="template"
                          value={localData.template}
                          onChange={(e) => updateData({ template: e.target.value })}
                          rows={6}
                          placeholder="Usa {{variable}} para insertar datos dinámicos"
                        />
                        <p className="text-xs text-gray-500">
                          Usa dobles llaves para variables: {`{{nombre}}, {{email}}, {{fecha}}`}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Variables Dinámicas</Label>
                      <Button onClick={addDynamicVariable} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {localData.dynamicVariables.map((variable) => (
                        <Card key={variable.id} className="p-3">
                          <div className="grid grid-cols-4 gap-2">
                            <Input
                              placeholder="Nombre"
                              value={variable.name}
                              onChange={(e) => {
                                const updated = localData.dynamicVariables.map(v =>
                                  v.id === variable.id ? { ...v, name: e.target.value } : v
                                );
                                updateData({ dynamicVariables: updated });
                              }}
                            />
                            <Input
                              placeholder="Fuente"
                              value={variable.source}
                              onChange={(e) => {
                                const updated = localData.dynamicVariables.map(v =>
                                  v.id === variable.id ? { ...v, source: e.target.value } : v
                                );
                                updateData({ dynamicVariables: updated });
                              }}
                            />
                            <Select
                              value={variable.transformation}
                              onValueChange={(value: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | 'date_format' | 'number_format') => {
                                const updated = localData.dynamicVariables.map(v =>
                                  v.id === variable.id ? { ...v, transformation: value } : v
                                );
                                updateData({ dynamicVariables: updated });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Sin cambios</SelectItem>
                                <SelectItem value="uppercase">MAYÚSCULAS</SelectItem>
                                <SelectItem value="lowercase">minúsculas</SelectItem>
                                <SelectItem value="capitalize">Capitalizar</SelectItem>
                                <SelectItem value="date_format">Formato Fecha</SelectItem>
                                <SelectItem value="number_format">Formato Número</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDynamicVariable(variable.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="preserveStructure"
                        checked={localData.preserveStructure}
                        onCheckedChange={(checked) => updateData({ preserveStructure: checked })}
                      />
                      <Label htmlFor="preserveStructure">Preservar Estructura Original</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="includeMetadata"
                        checked={localData.includeMetadata}
                        onCheckedChange={(checked) => updateData({ includeMetadata: checked })}
                      />
                      <Label htmlFor="includeMetadata">Incluir Metadatos</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="errorHandling">Manejo de Errores</Label>
                      <Select
                        value={localData.errorHandling}
                        onValueChange={(value: 'ignore' | 'default_text' | 'show_error') => 
                          updateData({ errorHandling: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ignore">Ignorar Errores</SelectItem>
                          <SelectItem value="default_text">Texto por Defecto</SelectItem>
                          <SelectItem value="show_error">Mostrar Error</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {localData.errorHandling === 'default_text' && (
                      <div className="space-y-2">
                        <Label htmlFor="defaultText">Texto por Defecto</Label>
                        <Input
                          id="defaultText"
                          value={localData.defaultText}
                          onChange={(e) => updateData({ defaultText: e.target.value })}
                          placeholder="Texto a mostrar cuando hay errores"
                        />
                      </div>
                    )}
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