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
  Workflow, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3,
  FileText,
  CreditCard,
  DollarSign,
  Shield,
  Target,
  User,
  Calendar,
  Star,
  Heart
} from 'lucide-react';

/**
 * Interfaces para el nodo WhatsApp Flow
 * Basado en la documentación oficial de Meta WhatsApp Flows
 * https://developers.facebook.com/docs/whatsapp/flows/
 */

// Tipos de flows disponibles según Meta
interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'lead_generation' | 'insurance' | 'purchase_intent' | 'personalized_offer' | 'custom';
  icon: React.ComponentType;
  fields: FlowField[];
}

// Campos del flow
interface FlowField {
  id: string;
  type: 'text' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'slider' | 'image' | 'document';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  options?: string[]; // Para select, radio, etc.
  conditional?: {
    dependsOn: string;
    value: any;
  };
}

// Configuración del flow
interface FlowConfig {
  template: string;
  title: string;
  description: string;
  fields: FlowField[];
  settings: {
    allowMultipleSubmissions: boolean;
    savePartialData: boolean;
    requireAuthentication: boolean;
    customBranding: boolean;
    successMessage: string;
    errorMessage: string;
  };
  actions: {
    onComplete: 'redirect' | 'webhook' | 'continue_flow';
    redirectUrl?: string;
    webhookUrl?: string;
    nextNode?: string;
  };
}

// Templates predefinidos basados en casos de uso de Meta
const flowTemplates: FlowTemplate[] = [
  {
    id: 'pre_approved_loan',
    name: 'Préstamo Pre-aprobado',
    description: 'Captura leads para préstamos pre-aprobados con términos personalizables',
    category: 'lead_generation',
    icon: DollarSign,
    fields: [
      { id: 'full_name', type: 'text', label: 'Nombre Completo', required: true },
      { id: 'phone', type: 'phone', label: 'Teléfono', required: true },
      { id: 'email', type: 'email', label: 'Correo Electrónico', required: true },
      { id: 'loan_amount', type: 'slider', label: 'Monto del Préstamo', required: true },
      { id: 'repayment_period', type: 'select', label: 'Período de Pago', required: true, options: ['6 meses', '12 meses', '18 meses', '24 meses'] },
      { id: 'payment_method', type: 'radio', label: 'Método de Pago Preferido', required: true, options: ['Transferencia Bancaria', 'Tarjeta de Débito', 'Efectivo'] }
    ]
  },
  {
    id: 'insurance_quote',
    name: 'Cotización de Seguro',
    description: 'Recopila información para generar cotizaciones de seguro personalizadas',
    category: 'insurance',
    icon: Shield,
    fields: [
      { id: 'full_name', type: 'text', label: 'Nombre Completo', required: true },
      { id: 'age', type: 'number', label: 'Edad', required: true, validation: { min: 18, max: 80 } },
      { id: 'coverage_type', type: 'select', label: 'Tipo de Cobertura', required: true, options: ['Básica', 'Intermedia', 'Premium'] },
      { id: 'family_members', type: 'number', label: 'Miembros Familiares', required: true },
      { id: 'health_conditions', type: 'checkbox', label: 'Condiciones de Salud', required: false },
      { id: 'payment_frequency', type: 'radio', label: 'Frecuencia de Pago', required: true, options: ['Mensual', 'Trimestral', 'Anual'] }
    ]
  },
  {
    id: 'purchase_intent',
    name: 'Intención de Compra',
    description: 'Recopila información sobre productos de interés para campañas de marketing',
    category: 'purchase_intent',
    icon: Target,
    fields: [
      { id: 'full_name', type: 'text', label: 'Nombre Completo', required: true },
      { id: 'email', type: 'email', label: 'Correo Electrónico', required: true },
      { id: 'product_categories', type: 'multiselect', label: 'Categorías de Interés', required: true, options: ['Electrónicos', 'Ropa', 'Hogar', 'Deportes', 'Belleza'] },
      { id: 'budget_range', type: 'select', label: 'Rango de Presupuesto', required: true, options: ['Menos de $100', '$100-$500', '$500-$1000', 'Más de $1000'] },
      { id: 'purchase_timeline', type: 'radio', label: 'Cuándo Planeas Comprar', required: true, options: ['Esta semana', 'Este mes', 'En 3 meses', 'Solo explorando'] }
    ]
  },
  {
    id: 'personalized_offer',
    name: 'Oferta Personalizada',
    description: 'Recopila preferencias para ofertas y recomendaciones personalizadas',
    category: 'personalized_offer',
    icon: Star,
    fields: [
      { id: 'full_name', type: 'text', label: 'Nombre Completo', required: true },
      { id: 'interests', type: 'multiselect', label: 'Intereses', required: true, options: ['Tecnología', 'Moda', 'Viajes', 'Gastronomía', 'Fitness'] },
      { id: 'budget', type: 'slider', label: 'Presupuesto Máximo', required: true },
      { id: 'preferred_brands', type: 'text', label: 'Marcas Preferidas', required: false },
      { id: 'notification_preference', type: 'radio', label: 'Preferencia de Notificaciones', required: true, options: ['Diario', 'Semanal', 'Solo ofertas especiales'] }
    ]
  }
];

interface WhatsAppFlowNodeProps {
  data: {
    label: string;
    config?: FlowConfig;
  };
  selected?: boolean;
}

/**
 * Componente WhatsApp Flow Node
 * 
 * Este componente permite crear flujos estructurados de WhatsApp Business
 * basados en los templates y mejores prácticas de Meta.
 * 
 * Características principales:
 * - Templates predefinidos para casos de uso comunes
 * - Constructor de formularios dinámico
 * - Validación de campos personalizable
 * - Integración con webhooks
 * - Manejo de autenticación
 * - Lógica condicional entre campos
 */
export function WhatsAppFlowNode({ data, selected }: WhatsAppFlowNodeProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [config, setConfig] = useState<FlowConfig>(data.config || {
    template: '',
    title: '',
    description: '',
    fields: [],
    settings: {
      allowMultipleSubmissions: false,
      savePartialData: true,
      requireAuthentication: false,
      customBranding: false,
      successMessage: '¡Gracias! Tu información ha sido recibida.',
      errorMessage: 'Hubo un error. Por favor intenta nuevamente.'
    },
    actions: {
      onComplete: 'continue_flow'
    }
  });

  // Manejar selección de template
  const handleTemplateSelect = (templateId: string) => {
    const template = flowTemplates.find(t => t.id === templateId);
    if (template) {
      setConfig(prev => ({
        ...prev,
        template: templateId,
        title: template.name,
        description: template.description,
        fields: template.fields
      }));
    }
  };

  // Agregar nuevo campo personalizado
  const addCustomField = () => {
    const newField: FlowField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'Nuevo Campo',
      required: false
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
  const updateField = (fieldId: string, updates: Partial<FlowField>) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
    }));
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
            <div className="p-1.5 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
              <Workflow className="h-4 w-4 text-white" />
            </div>
            {data.label}
            <Badge variant="secondary" className="ml-auto text-xs">
              WhatsApp Flow
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2">
            {/* Información del flow */}
            {config.title && (
              <div>
                <p className="text-sm font-medium text-gray-700">{config.title}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{config.description}</p>
              </div>
            )}
            
            {/* Estadísticas del flow */}
            <div className="flex gap-2 text-xs">
              <Badge variant="outline" className="text-xs">
                {config.fields.length} campos
              </Badge>
              {config.settings.requireAuthentication && (
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Autenticado
                </Badge>
              )}
            </div>
            
            {/* Botón de configuración */}
            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Flow
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Configuración WhatsApp Flow</DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue="template" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="template">Template</TabsTrigger>
                    <TabsTrigger value="fields">Campos</TabsTrigger>
                    <TabsTrigger value="settings">Configuración</TabsTrigger>
                    <TabsTrigger value="actions">Acciones</TabsTrigger>
                  </TabsList>
                  
                  {/* Tab: Selección de Template */}
                  <TabsContent value="template" className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Seleccionar Template</Label>
                      <p className="text-sm text-gray-600 mb-4">
                        Elige un template predefinido basado en casos de uso de WhatsApp Business
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {flowTemplates.map((template) => {
                        const IconComponent = template.icon;
                        return (
                          <Card 
                            key={template.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              config.template === template.id ? 'ring-2 ring-blue-500' : ''
                            }`}
                            onClick={() => handleTemplateSelect(template.id)}
                          >
                            <CardHeader className="pb-2">
                              <CardTitle className="flex items-center gap-2 text-sm">
                                <IconComponent className="h-5 w-5 text-blue-600" />
                                {template.name}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                              <Badge variant="outline" className="text-xs">
                                {template.fields.length} campos incluidos
                              </Badge>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    
                    {/* Información básica del flow */}
                    <div className="space-y-4 mt-6">
                      <div>
                        <Label htmlFor="title">Título del Flow</Label>
                        <Input
                          id="title"
                          value={config.title}
                          onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Ej: Solicitud de Préstamo Personal"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                          id="description"
                          value={config.description}
                          onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe el propósito de este flow..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Tab: Configuración de Campos */}
                  <TabsContent value="fields" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label className="text-base font-medium">Campos del Flow</Label>
                        <p className="text-sm text-gray-600">
                          Define los campos que los usuarios completarán
                        </p>
                      </div>
                      <Button onClick={addCustomField} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Campo
                      </Button>
                    </div>
                    
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {config.fields.map((field, index) => (
                        <Card key={field.id} className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 grid grid-cols-2 gap-3">
                                <div>
                                  <Label>Etiqueta</Label>
                                  <Input
                                    value={field.label}
                                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                                    placeholder="Nombre del campo"
                                  />
                                </div>
                                
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
                                      <SelectItem value="select">Selección</SelectItem>
                                      <SelectItem value="multiselect">Selección Múltiple</SelectItem>
                                      <SelectItem value="radio">Radio Button</SelectItem>
                                      <SelectItem value="checkbox">Checkbox</SelectItem>
                                      <SelectItem value="slider">Slider</SelectItem>
                                    </SelectContent>
                                  </Select>
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
                                <Label>Placeholder</Label>
                                <Input
                                  value={field.placeholder || ''}
                                  onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                  placeholder="Texto de ayuda"
                                />
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
                            
                            {/* Opciones para campos de selección */}
                            {(['select', 'multiselect', 'radio'].includes(field.type)) && (
                              <div>
                                <Label>Opciones (separadas por coma)</Label>
                                <Textarea
                                  value={field.options?.join(', ') || ''}
                                  onChange={(e) => updateField(field.id, { 
                                    options: e.target.value.split(',').map(opt => opt.trim()).filter(Boolean)
                                  })}
                                  placeholder="Opción 1, Opción 2, Opción 3"
                                  rows={2}
                                />
                              </div>
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
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Permitir múltiples envíos</Label>
                          <p className="text-sm text-gray-600">Permite al usuario enviar el formulario varias veces</p>
                        </div>
                        <Switch
                          checked={config.settings.allowMultipleSubmissions}
                          onCheckedChange={(checked) => setConfig(prev => ({
                            ...prev,
                            settings: { ...prev.settings, allowMultipleSubmissions: checked }
                          }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Guardar datos parciales</Label>
                          <p className="text-sm text-gray-600">Guarda el progreso aunque no complete todo</p>
                        </div>
                        <Switch
                          checked={config.settings.savePartialData}
                          onCheckedChange={(checked) => setConfig(prev => ({
                            ...prev,
                            settings: { ...prev.settings, savePartialData: checked }
                          }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Requerir autenticación</Label>
                          <p className="text-sm text-gray-600">Solicita verificación de identidad</p>
                        </div>
                        <Switch
                          checked={config.settings.requireAuthentication}
                          onCheckedChange={(checked) => setConfig(prev => ({
                            ...prev,
                            settings: { ...prev.settings, requireAuthentication: checked }
                          }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Branding personalizado</Label>
                          <p className="text-sm text-gray-600">Aplica colores y logo de la empresa</p>
                        </div>
                        <Switch
                          checked={config.settings.customBranding}
                          onCheckedChange={(checked) => setConfig(prev => ({
                            ...prev,
                            settings: { ...prev.settings, customBranding: checked }
                          }))}
                        />
                      </div>
                      
                      <div>
                        <Label>Mensaje de éxito</Label>
                        <Textarea
                          value={config.settings.successMessage}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            settings: { ...prev.settings, successMessage: e.target.value }
                          }))}
                          placeholder="Mensaje mostrado cuando se completa el flow"
                          rows={2}
                        />
                      </div>
                      
                      <div>
                        <Label>Mensaje de error</Label>
                        <Textarea
                          value={config.settings.errorMessage}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            settings: { ...prev.settings, errorMessage: e.target.value }
                          }))}
                          placeholder="Mensaje mostrado cuando hay un error"
                          rows={2}
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Tab: Acciones */}
                  <TabsContent value="actions" className="space-y-4">
                    <Label className="text-base font-medium">Acciones al Completar</Label>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Acción al completar el flow</Label>
                        <Select
                          value={config.actions.onComplete}
                          onValueChange={(value) => setConfig(prev => ({
                            ...prev,
                            actions: { ...prev.actions, onComplete: value as any }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="continue_flow">Continuar al siguiente nodo</SelectItem>
                            <SelectItem value="webhook">Enviar a webhook</SelectItem>
                            <SelectItem value="redirect">Redirigir a URL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {config.actions.onComplete === 'webhook' && (
                        <div>
                          <Label>URL del Webhook</Label>
                          <Input
                            value={config.actions.webhookUrl || ''}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              actions: { ...prev.actions, webhookUrl: e.target.value }
                            }))}
                            placeholder="https://api.ejemplo.com/webhook"
                          />
                        </div>
                      )}
                      
                      {config.actions.onComplete === 'redirect' && (
                        <div>
                          <Label>URL de Redirección</Label>
                          <Input
                            value={config.actions.redirectUrl || ''}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              actions: { ...prev.actions, redirectUrl: e.target.value }
                            }))}
                            placeholder="https://ejemplo.com/gracias"
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
                  <Button onClick={() => {
                    // Aquí se guardaría la configuración
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
      <Handle type="source" position={Position.Bottom} id="success" style={{ left: '25%' }} />
      <Handle type="source" position={Position.Bottom} id="error" style={{ left: '75%' }} />
    </>
  );
}