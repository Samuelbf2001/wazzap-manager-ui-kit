import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { 
  Database, 
  Settings, 
  Plus, 
  Trash2, 
  Brain,
  Save, 
  Clock, 
  AlertTriangle,
  HelpCircle,
  Sparkles,
  User,
  Mail,
  Phone,
  Calendar,
  Hash,
  Type,
  ToggleLeft
} from 'lucide-react';

/**
 * Configuración de campos con soporte para IA
 */
interface FieldConfig {
  id: string;
  name: string;
  type: 'text' | 'number' | 'email' | 'phone' | 'date' | 'boolean' | 'select' | 'textarea';
  label: string;
  required: boolean;
  question: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
  defaultValue?: any;
  // Nueva funcionalidad de IA para extracción de datos
  useAIExtraction?: boolean;
  aiPrompt?: string;
  aiModel?: 'gpt-3.5-turbo' | 'gpt-4' | 'claude-3-haiku' | 'claude-3-sonnet';
  aiExamples?: Array<{
    input: string;
    output: string;
  }>;
}

/**
 * Configuración completa del nodo Database
 */
interface DatabaseConfig {
  tableName: string;
  introMessage: string;
  fields: FieldConfig[];
  settings: {
    timeout: number;
    allowSkip: boolean;
    saveIncomplete: boolean;
    retryAttempts: number;
    useGlobalAI: boolean;
    globalAIModel?: string;
  };
  advanced: {
    batchMode: boolean;
    duplicateHandling: 'allow' | 'skip' | 'update';
    encryption: boolean;
    auditLog: boolean;
  };
}

interface DatabaseNodeProps {
  data: {
    label: string;
    config?: DatabaseConfig;
  };
  selected?: boolean;
}

// Ejemplos predefinidos de IA para diferentes tipos de campos
const aiExamplesPresets = {
  name: [
    { input: "mi nombre es Juan Carlos Pérez", output: "Juan Carlos Pérez" },
    { input: "soy María del Carmen", output: "María del Carmen" },
    { input: "me llamo Pedro", output: "Pedro" }
  ],
  email: [
    { input: "mi correo es juan.perez@gmail.com", output: "juan.perez@gmail.com" },
    { input: "puedes escribir a maria123@hotmail.com", output: "maria123@hotmail.com" },
    { input: "contactame en pedro_silva@empresa.com", output: "pedro_silva@empresa.com" }
  ],
  phone: [
    { input: "mi número es +1 555 123 4567", output: "+1 555 123 4567" },
    { input: "llámame al 555-123-4567", output: "555-123-4567" },
    { input: "mi teléfono es 5551234567", output: "555-123-4567" }
  ],
  age: [
    { input: "tengo 25 años", output: "25" },
    { input: "soy de 30", output: "30" },
    { input: "mi edad es treinta y cinco", output: "35" }
  ]
};

/**
 * Componente DatabaseNode mejorado
 * 
 * Permite recopilar datos de usuarios con funcionalidades avanzadas:
 * - Extracción inteligente usando IA
 * - Validación personalizada
 * - Múltiples tipos de campo
 * - Configuración avanzada de base de datos
 */
export function DatabaseNode({ data, selected }: DatabaseNodeProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [config, setConfig] = useState<DatabaseConfig>(data.config || {
    tableName: 'contacts',
    introMessage: 'Voy a recopilar algunos datos importantes. Por favor responde las siguientes preguntas:',
    fields: [],
    settings: {
      timeout: 300,
      allowSkip: false,
      saveIncomplete: true,
      retryAttempts: 3,
      useGlobalAI: false
    },
    advanced: {
      batchMode: false,
      duplicateHandling: 'allow',
      encryption: false,
      auditLog: true
    }
  });

  // Iconos para tipos de campo
  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'text': return Type;
      case 'email': return Mail;
      case 'phone': return Phone;
      case 'number': return Hash;
      case 'date': return Calendar;
      case 'boolean': return ToggleLeft;
      default: return Type;
    }
  };

  // Agregar nuevo campo
  const addField = () => {
    const newField: FieldConfig = {
      id: `field_${Date.now()}`,
      name: 'nuevo_campo',
      type: 'text',
      label: 'Nuevo Campo',
      required: false,
      question: '¿Cuál es tu nuevo campo?',
      useAIExtraction: false,
      aiModel: 'gpt-3.5-turbo',
      aiPrompt: 'Extrae únicamente el valor solicitado de la respuesta del usuario.',
      aiExamples: []
    };
    
    setConfig(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  // Eliminar campo
  const removeField = (fieldId: string) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId)
    }));
  };

  // Actualizar campo
  const updateField = (fieldId: string, updates: Partial<FieldConfig>) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
    }));
  };

  // Aplicar preset de ejemplos de IA
  const applyAIPreset = (fieldId: string, presetType: keyof typeof aiExamplesPresets) => {
    const examples = aiExamplesPresets[presetType];
    updateField(fieldId, { aiExamples: examples });
  };

  return (
    <>
      {/* Handles de conexión */}
      <Handle type="target" position={Position.Top} />
      
      {/* Tarjeta principal del nodo */}
      <Card className={`w-80 transition-all duration-200 ${
        selected ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-md'
      }`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <div className="p-1.5 bg-teal-50 rounded-lg">
              <Database className="h-4 w-4 text-teal-600" />
            </div>
            {data.label}
            <Badge variant="secondary" className="ml-auto text-xs">
              Recopilar Datos
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Mensaje inicial */}
            {config.introMessage && (
              <div className="bg-teal-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <HelpCircle className="h-3 w-3 text-teal-600" />
                  <span className="text-xs font-medium text-teal-700">Mensaje Inicial</span>
                </div>
                <p className="text-xs text-teal-600 line-clamp-2">
                  {config.introMessage}
                </p>
              </div>
            )}

            {/* Estadísticas de campos */}
            <div className="flex gap-2 text-xs">
              <Badge variant="outline" className="text-xs">
                {config.fields.length} campos
              </Badge>
              <Badge variant="outline" className="text-xs">
                {config.tableName}
              </Badge>
              {config.fields.some(f => f.useAIExtraction) && (
                <Badge variant="outline" className="text-xs">
                  <Brain className="h-3 w-3 mr-1" />
                  IA Activada
                </Badge>
              )}
            </div>

            {/* Lista de campos */}
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {config.fields.map((field, index) => {
                const IconComponent = getFieldIcon(field.type);
                return (
                  <div key={field.id} className="bg-white border rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-3 w-3 text-gray-500" />
                        <div>
                          <p className="text-xs font-medium">{field.label}</p>
                          <p className="text-xs text-gray-500">{field.type}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {field.required && (
                          <Badge variant="destructive" className="text-xs">*</Badge>
                        )}
                        {field.useAIExtraction && (
                          <Badge variant="secondary" className="text-xs">
                            <Sparkles className="h-2 w-2" />
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {(!config.fields || config.fields.length === 0) && (
              <div className="text-center py-4 text-gray-400">
                <Database className="h-8 w-8 mx-auto mb-2" />
                <p className="text-xs">Sin campos configurados</p>
              </div>
            )}

            {/* Configuración básica */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Timeout:</span>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {config.settings.timeout}s
                </Badge>
              </div>
              
              {config.settings.saveIncomplete && (
                <div className="bg-blue-50 p-2 rounded flex items-center gap-2">
                  <Save className="h-3 w-3 text-blue-500" />
                  <span className="text-blue-700">Guardar datos incompletos</span>
                </div>
              )}
            </div>
            
            {/* Botón de configuración */}
            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Recopilación
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Configuración Recopilación de Datos</DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue="fields" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 h-auto">
                    <TabsTrigger value="fields" className="text-xs py-2 px-2">Campos</TabsTrigger>
                    <TabsTrigger value="ai" className="text-xs py-2 px-2">IA & Extract</TabsTrigger>
                    <TabsTrigger value="settings" className="text-xs py-2 px-1">Config</TabsTrigger>
                    <TabsTrigger value="advanced" className="text-xs py-2 px-1">Avanzado</TabsTrigger>
                  </TabsList>
                  
                  {/* Tab: Configuración de Campos */}
                  <TabsContent value="fields" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="tableName">Tabla de Destino</Label>
                        <Input
                          id="tableName"
                          value={config.tableName}
                          onChange={(e) => setConfig(prev => ({ ...prev, tableName: e.target.value }))}
                          placeholder="contacts"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="introMessage">Mensaje Inicial</Label>
                        <Textarea
                          id="introMessage"
                          value={config.introMessage}
                          onChange={(e) => setConfig(prev => ({ ...prev, introMessage: e.target.value }))}
                          placeholder="Mensaje que se mostrará antes de recopilar los datos"
                          rows={3}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <Label className="text-base font-medium">Campos a Recopilar</Label>
                        <p className="text-sm text-gray-600">Define qué información solicitar a los usuarios</p>
                      </div>
                      <Button onClick={addField} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Campo
                      </Button>
                    </div>
                    
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {config.fields.map((field) => (
                        <Card key={field.id} className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 grid grid-cols-2 gap-3">
                                <div>
                                  <Label>Nombre del Campo</Label>
                                  <Input
                                    value={field.name}
                                    onChange={(e) => updateField(field.id, { name: e.target.value })}
                                    placeholder="nombre_campo"
                                  />
                                </div>
                                
                                <div>
                                  <Label>Etiqueta</Label>
                                  <Input
                                    value={field.label}
                                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                                    placeholder="Nombre completo"
                                  />
                                </div>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeField(field.id)}
                                className="ml-2 text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label>Tipo</Label>
                                <Select
                                  value={field.type}
                                  onValueChange={(value) => updateField(field.id, { type: value as any })}
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
                                    <SelectItem value="boolean">Sí/No</SelectItem>
                                    <SelectItem value="select">Selección</SelectItem>
                                    <SelectItem value="textarea">Texto Largo</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`required-${field.id}`}
                                  checked={field.required}
                                  onCheckedChange={(checked) => updateField(field.id, { required: !!checked })}
                                />
                                <Label htmlFor={`required-${field.id}`}>Campo requerido</Label>
                              </div>
                            </div>
                            
                            <div>
                              <Label>Pregunta al Usuario</Label>
                              <Textarea
                                value={field.question}
                                onChange={(e) => updateField(field.id, { question: e.target.value })}
                                placeholder="¿Cuál es tu nombre completo?"
                                rows={2}
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  {/* Tab: Configuración de IA */}
                  <TabsContent value="ai" className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Extracción Inteligente con IA</Label>
                      <p className="text-sm text-gray-600 mb-4">
                        Utiliza IA para extraer información específica de respuestas naturales de los usuarios
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>IA Global</Label>
                          <p className="text-sm text-gray-600">Aplicar configuración de IA a todos los campos</p>
                        </div>
                        <Switch
                          checked={config.settings.useGlobalAI}
                          onCheckedChange={(checked) => setConfig(prev => ({
                            ...prev,
                            settings: { ...prev.settings, useGlobalAI: checked }
                          }))}
                        />
                      </div>
                      
                      {config.settings.useGlobalAI && (
                        <div>
                          <Label>Modelo de IA Global</Label>
                          <Select
                            value={config.settings.globalAIModel}
                            onValueChange={(value) => setConfig(prev => ({
                              ...prev,
                              settings: { ...prev.settings, globalAIModel: value }
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar modelo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Rápido)</SelectItem>
                              <SelectItem value="gpt-4">GPT-4 (Preciso)</SelectItem>
                              <SelectItem value="claude-3-haiku">Claude 3 Haiku (Eficiente)</SelectItem>
                              <SelectItem value="claude-3-sonnet">Claude 3 Sonnet (Avanzado)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {config.fields.map((field) => (
                        <Card key={field.id} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{field.label}</h4>
                              <Switch
                                checked={field.useAIExtraction}
                                onCheckedChange={(checked) => updateField(field.id, { useAIExtraction: checked })}
                              />
                            </div>
                            
                            {field.useAIExtraction && (
                              <>
                                <div>
                                  <Label>Modelo de IA</Label>
                                  <Select
                                    value={field.aiModel}
                                    onValueChange={(value) => updateField(field.id, { aiModel: value as any })}
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
                                
                                <div>
                                  <Label>Prompt de Extracción</Label>
                                  <Textarea
                                    value={field.aiPrompt}
                                    onChange={(e) => updateField(field.id, { aiPrompt: e.target.value })}
                                    placeholder="Extrae únicamente el nombre completo de la respuesta del usuario, sin incluir texto adicional."
                                    rows={3}
                                  />
                                </div>
                                
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <Label>Ejemplos de Entrenamiento</Label>
                                    <div className="flex gap-2">
                                      {field.type === 'text' && (
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => applyAIPreset(field.id, 'name')}
                                        >
                                          Preset Nombres
                                        </Button>
                                      )}
                                      {field.type === 'email' && (
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => applyAIPreset(field.id, 'email')}
                                        >
                                          Preset Email
                                        </Button>
                                      )}
                                      {field.type === 'phone' && (
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => applyAIPreset(field.id, 'phone')}
                                        >
                                          Preset Teléfono
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {field.aiExamples?.map((example, index) => (
                                      <div key={index} className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-gray-50 p-2 rounded">
                                          <strong>Input:</strong> {example.input}
                                        </div>
                                        <div className="bg-green-50 p-2 rounded">
                                          <strong>Output:</strong> {example.output}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  {/* Tab: Configuración General */}
                  <TabsContent value="settings" className="space-y-4">
                    <Label className="text-base font-medium">Configuración General</Label>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Timeout (segundos)</Label>
                        <Input
                          type="number"
                          value={config.settings.timeout}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            settings: { ...prev.settings, timeout: parseInt(e.target.value) || 300 }
                          }))}
                          placeholder="300"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Permitir saltar campos opcionales</Label>
                          <p className="text-sm text-gray-600">Los usuarios pueden omitir campos no requeridos</p>
                        </div>
                        <Switch
                          checked={config.settings.allowSkip}
                          onCheckedChange={(checked) => setConfig(prev => ({
                            ...prev,
                            settings: { ...prev.settings, allowSkip: checked }
                          }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Guardar datos incompletos</Label>
                          <p className="text-sm text-gray-600">Guarda información aunque no complete todos los campos</p>
                        </div>
                        <Switch
                          checked={config.settings.saveIncomplete}
                          onCheckedChange={(checked) => setConfig(prev => ({
                            ...prev,
                            settings: { ...prev.settings, saveIncomplete: checked }
                          }))}
                        />
                      </div>
                      
                      <div>
                        <Label>Intentos de reintento</Label>
                        <Input
                          type="number"
                          value={config.settings.retryAttempts}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            settings: { ...prev.settings, retryAttempts: parseInt(e.target.value) || 3 }
                          }))}
                          placeholder="3"
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Tab: Configuración Avanzada */}
                  <TabsContent value="advanced" className="space-y-4">
                    <Label className="text-base font-medium">Configuración Avanzada</Label>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Modo Lote</Label>
                          <p className="text-sm text-gray-600">Procesa múltiples registros simultáneamente</p>
                        </div>
                        <Switch
                          checked={config.advanced.batchMode}
                          onCheckedChange={(checked) => setConfig(prev => ({
                            ...prev,
                            advanced: { ...prev.advanced, batchMode: checked }
                          }))}
                        />
                      </div>
                      
                      <div>
                        <Label>Manejo de Duplicados</Label>
                        <Select
                          value={config.advanced.duplicateHandling}
                          onValueChange={(value) => setConfig(prev => ({
                            ...prev,
                            advanced: { ...prev.advanced, duplicateHandling: value as any }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="allow">Permitir duplicados</SelectItem>
                            <SelectItem value="skip">Omitir duplicados</SelectItem>
                            <SelectItem value="update">Actualizar existentes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Encriptación</Label>
                          <p className="text-sm text-gray-600">Encripta datos sensibles en la base de datos</p>
                        </div>
                        <Switch
                          checked={config.advanced.encryption}
                          onCheckedChange={(checked) => setConfig(prev => ({
                            ...prev,
                            advanced: { ...prev.advanced, encryption: checked }
                          }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Log de Auditoría</Label>
                          <p className="text-sm text-gray-600">Registra todas las operaciones para auditoría</p>
                        </div>
                        <Switch
                          checked={config.advanced.auditLog}
                          onCheckedChange={(checked) => setConfig(prev => ({
                            ...prev,
                            advanced: { ...prev.advanced, auditLog: checked }
                          }))}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => {
                    // Guardar configuración
                    data.config = config;
                    setIsConfigOpen(false);
                  }}>
                    Guardar Configuración
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
      
      {/* Handles de salida */}
      <Handle type="source" position={Position.Bottom} id="completed" style={{ left: '20%' }} />
      <Handle type="source" position={Position.Bottom} id="timeout" style={{ left: '50%' }} />
      <Handle type="source" position={Position.Bottom} id="error" style={{ left: '80%' }} />
    </>
  );
} 