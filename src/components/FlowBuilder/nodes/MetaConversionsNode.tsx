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
  Facebook, 
  Settings, 
  Target, 
  DollarSign, 
  Save, 
  Plus, 
  Trash2, 
  X,
  ShoppingCart,
  Eye,
  MousePointer,
  Heart,
  Share2,
  Download,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';

interface MetaConversionsData {
  label: string;
  
  // Configuración de Meta
  pixelId: string;
  accessToken: string;
  testEventCode?: string;
  
  // Configuración del evento
  eventName: 'Purchase' | 'AddToCart' | 'ViewContent' | 'Lead' | 'CompleteRegistration' | 'InitiateCheckout' | 'AddPaymentInfo' | 'AddToWishlist' | 'Search' | 'Contact' | 'CustomizeProduct' | 'Donate' | 'FindLocation' | 'Schedule' | 'StartTrial' | 'SubmitApplication' | 'Subscribe' | 'Custom';
  customEventName?: string;
  
  // Datos del usuario
  userData: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: 'M' | 'F';
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    externalId?: string;
    clientIpAddress?: string;
    clientUserAgent?: string;
    fbc?: string;
    fbp?: string;
  };
  
  // Datos personalizados
  customData: {
    value?: number;
    currency?: string;
    contentName?: string;
    contentCategory?: string;
    contentIds?: string[];
    contentType?: string;
    orderNumber?: string;
    predictedLtv?: number;
    numItems?: number;
    searchString?: string;
    status?: string;
  };
  
  // Parámetros personalizados
  customParameters: Array<{
    id: string;
    key: string;
    value: string;
    valueType: 'static' | 'variable' | 'user_input';
  }>;
  
  // Configuración de mapeo de datos
  dataMapping: Array<{
    id: string;
    metaField: string;
    sourceType: 'static' | 'variable' | 'flow_data' | 'user_input';
    sourceValue: string;
    transformation?: 'hash_sha256' | 'lowercase' | 'phone_format' | 'none';
  }>;
  
  // Configuración avanzada
  actionSource: 'website' | 'email' | 'app' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other';
  eventSourceUrl?: string;
  optOut: boolean;
  eventTime?: string;
  
  // Configuración de deduplicación
  deduplication: {
    enabled: boolean;
    eventId?: string;
    deduplicationKey?: string;
  };
  
  // Configuración de validación
  validation: {
    enabled: boolean;
    requiredFields: string[];
    validateEmail: boolean;
    validatePhone: boolean;
  };
  
  // Configuración de errores
  errorHandling: 'ignore' | 'retry' | 'stop_flow';
  maxRetries: number;
  retryDelay: number;
  
  // Configuración de logging
  logging: {
    enabled: boolean;
    logSuccessfulEvents: boolean;
    logFailedEvents: boolean;
    logUserData: boolean;
  };
}

const metaEvents = [
  { value: 'Purchase', label: 'Compra', icon: ShoppingCart, description: 'Cuando un usuario completa una compra' },
  { value: 'AddToCart', label: 'Agregar al Carrito', icon: Plus, description: 'Cuando un usuario agrega un producto al carrito' },
  { value: 'ViewContent', label: 'Ver Contenido', icon: Eye, description: 'Cuando un usuario ve una página de producto' },
  { value: 'Lead', label: 'Lead', icon: Target, description: 'Cuando un usuario se convierte en lead' },
  { value: 'CompleteRegistration', label: 'Registro Completo', icon: Users, description: 'Cuando un usuario completa el registro' },
  { value: 'InitiateCheckout', label: 'Iniciar Checkout', icon: MousePointer, description: 'Cuando un usuario inicia el proceso de compra' },
  { value: 'AddPaymentInfo', label: 'Agregar Pago', icon: DollarSign, description: 'Cuando un usuario agrega información de pago' },
  { value: 'AddToWishlist', label: 'Lista de Deseos', icon: Heart, description: 'Cuando un usuario agrega a lista de deseos' },
  { value: 'Search', label: 'Búsqueda', icon: Target, description: 'Cuando un usuario realiza una búsqueda' },
  { value: 'Contact', label: 'Contacto', icon: Share2, description: 'Cuando un usuario hace contacto' },
  { value: 'Schedule', label: 'Agendar', icon: Calendar, description: 'Cuando un usuario agenda una cita' },
  { value: 'StartTrial', label: 'Iniciar Prueba', icon: TrendingUp, description: 'Cuando un usuario inicia una prueba gratuita' },
  { value: 'Subscribe', label: 'Suscribirse', icon: Download, description: 'Cuando un usuario se suscribe' }
];

const currencies = [
  'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR', 'BRL', 'MXN', 'ARS', 'CLP', 'COP', 'PEN'
];

const actionSources = [
  { value: 'website', label: 'Sitio Web' },
  { value: 'email', label: 'Email' },
  { value: 'app', label: 'Aplicación Móvil' },
  { value: 'phone_call', label: 'Llamada Telefónica' },
  { value: 'chat', label: 'Chat' },
  { value: 'physical_store', label: 'Tienda Física' },
  { value: 'system_generated', label: 'Generado por Sistema' },
  { value: 'other', label: 'Otro' }
];

export function MetaConversionsNode({ data, selected }: NodeProps<MetaConversionsData>) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [localData, setLocalData] = useState<MetaConversionsData>({
    label: 'Conversiones Meta',
    pixelId: '',
    accessToken: '',
    eventName: 'Purchase',
    userData: {},
    customData: {
      currency: 'USD'
    },
    customParameters: [],
    dataMapping: [],
    actionSource: 'website',
    optOut: false,
    deduplication: {
      enabled: false
    },
    validation: {
      enabled: true,
      requiredFields: ['email'],
      validateEmail: true,
      validatePhone: true
    },
    errorHandling: 'retry',
    maxRetries: 3,
    retryDelay: 1000,
    logging: {
      enabled: true,
      logSuccessfulEvents: true,
      logFailedEvents: true,
      logUserData: false
    },
    ...data
  });

  const updateData = useCallback((updates: Partial<MetaConversionsData>) => {
    setLocalData(prev => ({ ...prev, ...updates }));
  }, []);

  const addCustomParameter = () => {
    const newParameter = {
      id: Date.now().toString(),
      key: '',
      value: '',
      valueType: 'static' as const
    };
    updateData({
      customParameters: [...localData.customParameters, newParameter]
    });
  };

  const removeCustomParameter = (id: string) => {
    updateData({
      customParameters: localData.customParameters.filter(param => param.id !== id)
    });
  };

  const addDataMapping = () => {
    const newMapping = {
      id: Date.now().toString(),
      metaField: '',
      sourceType: 'static' as const,
      sourceValue: '',
      transformation: 'none' as const
    };
    updateData({
      dataMapping: [...localData.dataMapping, newMapping]
    });
  };

  const removeDataMapping = (id: string) => {
    updateData({
      dataMapping: localData.dataMapping.filter(mapping => mapping.id !== id)
    });
  };

  const getEventIcon = () => {
    const event = metaEvents.find(e => e.value === localData.eventName);
    return event?.icon || Facebook;
  };

  const EventIcon = getEventIcon();

  return (
    <>
      <Handle type="target" position={Position.Top} />
      
      <Card className={`w-80 ${selected ? 'ring-2 ring-blue-500' : ''} bg-blue-50 border-blue-200`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <EventIcon className="h-4 w-4 text-blue-600" />
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
            {localData.eventName === 'Custom' ? localData.customEventName : localData.eventName}
          </Badge>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Facebook className="h-3 w-3" />
              <span>Pixel: {localData.pixelId || 'No configurado'}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>Fuente: {actionSources.find(s => s.value === localData.actionSource)?.label}</span>
            </div>
            
            {localData.customData.value && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span>Valor: {localData.customData.currency} {localData.customData.value}</span>
              </div>
            )}
            
            {localData.deduplication.enabled && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>Deduplicación activa</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Bottom} id="success" />
      <Handle type="source" position={Position.Right} id="error" />

      {/* Modal de configuración */}
      {isConfigOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-[900px] max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Facebook className="h-5 w-5" />
                  Configurar Conversiones Meta
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
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="event">Evento</TabsTrigger>
                  <TabsTrigger value="user">Usuario</TabsTrigger>
                  <TabsTrigger value="custom">Personalizado</TabsTrigger>
                  <TabsTrigger value="mapping">Mapeo</TabsTrigger>
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
                    <Label htmlFor="pixelId">Pixel ID de Meta</Label>
                    <Input
                      id="pixelId"
                      value={localData.pixelId}
                      onChange={(e) => updateData({ pixelId: e.target.value })}
                      placeholder="123456789012345"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accessToken">Token de Acceso</Label>
                    <Input
                      id="accessToken"
                      type="password"
                      value={localData.accessToken}
                      onChange={(e) => updateData({ accessToken: e.target.value })}
                      placeholder="Token de acceso de la API de Meta"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="testEventCode">Código de Evento de Prueba (Opcional)</Label>
                    <Input
                      id="testEventCode"
                      value={localData.testEventCode || ''}
                      onChange={(e) => updateData({ testEventCode: e.target.value })}
                      placeholder="TEST12345"
                    />
                    <p className="text-xs text-gray-500">
                      Usar solo para pruebas. Los eventos con este código no afectarán las métricas de producción.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="actionSource">Fuente de Acción</Label>
                    <Select
                      value={localData.actionSource}
                      onValueChange={(value: any) => updateData({ actionSource: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {actionSources.map((source) => (
                          <SelectItem key={source.value} value={source.value}>
                            {source.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="event" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventName">Tipo de Evento</Label>
                    <Select
                      value={localData.eventName}
                      onValueChange={(value: any) => updateData({ eventName: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {metaEvents.map((event) => {
                          const IconComponent = event.icon;
                          return (
                            <SelectItem key={event.value} value={event.value}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                <div>
                                  <div>{event.label}</div>
                                  <div className="text-xs text-gray-500">{event.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                        <SelectItem value="Custom">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Evento Personalizado
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {localData.eventName === 'Custom' && (
                    <div className="space-y-2">
                      <Label htmlFor="customEventName">Nombre del Evento Personalizado</Label>
                      <Input
                        id="customEventName"
                        value={localData.customEventName || ''}
                        onChange={(e) => updateData({ customEventName: e.target.value })}
                        placeholder="mi_evento_personalizado"
                      />
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-4">
                    <Label>Datos del Evento</Label>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Valor</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={localData.customData.value || ''}
                          onChange={(e) => updateData({
                            customData: {
                              ...localData.customData,
                              value: parseFloat(e.target.value) || undefined
                            }
                          })}
                          placeholder="99.99"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Moneda</Label>
                        <Select
                          value={localData.customData.currency || 'USD'}
                          onValueChange={(value) => updateData({
                            customData: {
                              ...localData.customData,
                              currency: value
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem key={currency} value={currency}>
                                {currency}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nombre del Contenido</Label>
                        <Input
                          value={localData.customData.contentName || ''}
                          onChange={(e) => updateData({
                            customData: {
                              ...localData.customData,
                              contentName: e.target.value
                            }
                          })}
                          placeholder="Producto ABC"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Categoría del Contenido</Label>
                        <Input
                          value={localData.customData.contentCategory || ''}
                          onChange={(e) => updateData({
                            customData: {
                              ...localData.customData,
                              contentCategory: e.target.value
                            }
                          })}
                          placeholder="Electrónicos"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Número de Pedido</Label>
                      <Input
                        value={localData.customData.orderNumber || ''}
                        onChange={(e) => updateData({
                          customData: {
                            ...localData.customData,
                            orderNumber: e.target.value
                          }
                        })}
                        placeholder="ORD-12345"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="user" className="space-y-4">
                  <div className="space-y-4">
                    <Label>Datos del Usuario</Label>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={localData.userData.email || ''}
                          onChange={(e) => updateData({
                            userData: {
                              ...localData.userData,
                              email: e.target.value
                            }
                          })}
                          placeholder="usuario@ejemplo.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Teléfono</Label>
                        <Input
                          value={localData.userData.phone || ''}
                          onChange={(e) => updateData({
                            userData: {
                              ...localData.userData,
                              phone: e.target.value
                            }
                          })}
                          placeholder="+1234567890"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input
                          value={localData.userData.firstName || ''}
                          onChange={(e) => updateData({
                            userData: {
                              ...localData.userData,
                              firstName: e.target.value
                            }
                          })}
                          placeholder="Juan"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Apellido</Label>
                        <Input
                          value={localData.userData.lastName || ''}
                          onChange={(e) => updateData({
                            userData: {
                              ...localData.userData,
                              lastName: e.target.value
                            }
                          })}
                          placeholder="Pérez"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Ciudad</Label>
                        <Input
                          value={localData.userData.city || ''}
                          onChange={(e) => updateData({
                            userData: {
                              ...localData.userData,
                              city: e.target.value
                            }
                          })}
                          placeholder="Madrid"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Estado/Provincia</Label>
                        <Input
                          value={localData.userData.state || ''}
                          onChange={(e) => updateData({
                            userData: {
                              ...localData.userData,
                              state: e.target.value
                            }
                          })}
                          placeholder="Madrid"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>País</Label>
                        <Input
                          value={localData.userData.country || ''}
                          onChange={(e) => updateData({
                            userData: {
                              ...localData.userData,
                              country: e.target.value
                            }
                          })}
                          placeholder="ES"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Código Postal</Label>
                        <Input
                          value={localData.userData.zipCode || ''}
                          onChange={(e) => updateData({
                            userData: {
                              ...localData.userData,
                              zipCode: e.target.value
                            }
                          })}
                          placeholder="28001"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Género</Label>
                        <Select
                          value={localData.userData.gender || ''}
                          onValueChange={(value: 'M' | 'F' | '') => updateData({
                            userData: {
                              ...localData.userData,
                              gender: value || undefined
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No especificar</SelectItem>
                            <SelectItem value="M">Masculino</SelectItem>
                            <SelectItem value="F">Femenino</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>ID Externo</Label>
                      <Input
                        value={localData.userData.externalId || ''}
                        onChange={(e) => updateData({
                          userData: {
                            ...localData.userData,
                            externalId: e.target.value
                          }
                        })}
                        placeholder="ID único del usuario en tu sistema"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="custom" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Parámetros Personalizados</Label>
                    <Button onClick={addCustomParameter} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Parámetro
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {localData.customParameters.map((parameter) => (
                      <Card key={parameter.id} className="p-3">
                        <div className="grid grid-cols-4 gap-3 items-center">
                          <Input
                            placeholder="Clave"
                            value={parameter.key}
                            onChange={(e) => {
                              const updated = localData.customParameters.map(p =>
                                p.id === parameter.id ? { ...p, key: e.target.value } : p
                              );
                              updateData({ customParameters: updated });
                            }}
                          />

                          <Select
                            value={parameter.valueType}
                            onValueChange={(value: 'static' | 'variable' | 'user_input') => {
                              const updated = localData.customParameters.map(p =>
                                p.id === parameter.id ? { ...p, valueType: value } : p
                              );
                              updateData({ customParameters: updated });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="static">Valor Estático</SelectItem>
                              <SelectItem value="variable">Variable</SelectItem>
                              <SelectItem value="user_input">Entrada Usuario</SelectItem>
                            </SelectContent>
                          </Select>

                          <Input
                            placeholder={
                              parameter.valueType === 'static' ? 'Valor fijo' :
                              parameter.valueType === 'variable' ? '{{variable}}' :
                              'Campo de entrada'
                            }
                            value={parameter.value}
                            onChange={(e) => {
                              const updated = localData.customParameters.map(p =>
                                p.id === parameter.id ? { ...p, value: e.target.value } : p
                              );
                              updateData({ customParameters: updated });
                            }}
                          />

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomParameter(parameter.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="mapping" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Mapeo de Datos</Label>
                    <Button onClick={addDataMapping} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Mapeo
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {localData.dataMapping.map((mapping) => (
                      <Card key={mapping.id} className="p-3">
                        <div className="grid grid-cols-5 gap-3 items-center">
                          <Select
                            value={mapping.metaField}
                            onValueChange={(value) => {
                              const updated = localData.dataMapping.map(m =>
                                m.id === mapping.id ? { ...m, metaField: value } : m
                              );
                              updateData({ dataMapping: updated });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Campo Meta" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Teléfono</SelectItem>
                              <SelectItem value="first_name">Nombre</SelectItem>
                              <SelectItem value="last_name">Apellido</SelectItem>
                              <SelectItem value="value">Valor</SelectItem>
                              <SelectItem value="currency">Moneda</SelectItem>
                              <SelectItem value="content_name">Nombre Contenido</SelectItem>
                              <SelectItem value="content_category">Categoría</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select
                            value={mapping.sourceType}
                            onValueChange={(value: 'static' | 'variable' | 'flow_data' | 'user_input') => {
                              const updated = localData.dataMapping.map(m =>
                                m.id === mapping.id ? { ...m, sourceType: value } : m
                              );
                              updateData({ dataMapping: updated });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="static">Estático</SelectItem>
                              <SelectItem value="variable">Variable</SelectItem>
                              <SelectItem value="flow_data">Datos Flujo</SelectItem>
                              <SelectItem value="user_input">Entrada Usuario</SelectItem>
                            </SelectContent>
                          </Select>

                          <Input
                            placeholder="Valor fuente"
                            value={mapping.sourceValue}
                            onChange={(e) => {
                              const updated = localData.dataMapping.map(m =>
                                m.id === mapping.id ? { ...m, sourceValue: e.target.value } : m
                              );
                              updateData({ dataMapping: updated });
                            }}
                          />

                          <Select
                            value={mapping.transformation || 'none'}
                            onValueChange={(value: 'hash_sha256' | 'lowercase' | 'phone_format' | 'none') => {
                              const updated = localData.dataMapping.map(m =>
                                m.id === mapping.id ? { ...m, transformation: value } : m
                              );
                              updateData({ dataMapping: updated });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sin transformación</SelectItem>
                              <SelectItem value="hash_sha256">Hash SHA256</SelectItem>
                              <SelectItem value="lowercase">Minúsculas</SelectItem>
                              <SelectItem value="phone_format">Formato Teléfono</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDataMapping(mapping.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="deduplicationEnabled"
                        checked={localData.deduplication.enabled}
                        onCheckedChange={(checked) => updateData({
                          deduplication: {
                            ...localData.deduplication,
                            enabled: checked
                          }
                        })}
                      />
                      <Label htmlFor="deduplicationEnabled">Habilitar Deduplicación</Label>
                    </div>

                    {localData.deduplication.enabled && (
                      <div className="space-y-2 pl-6">
                        <Label>ID del Evento (para deduplicación)</Label>
                        <Input
                          value={localData.deduplication.eventId || ''}
                          onChange={(e) => updateData({
                            deduplication: {
                              ...localData.deduplication,
                              eventId: e.target.value
                            }
                          })}
                          placeholder="evento_unico_123"
                        />
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-4">
                      <Label>Validación</Label>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="validationEnabled"
                          checked={localData.validation.enabled}
                          onCheckedChange={(checked) => updateData({
                            validation: {
                              ...localData.validation,
                              enabled: checked
                            }
                          })}
                        />
                        <Label htmlFor="validationEnabled">Habilitar Validación</Label>
                      </div>

                      {localData.validation.enabled && (
                        <div className="space-y-4 pl-6">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="validateEmail"
                              checked={localData.validation.validateEmail}
                              onCheckedChange={(checked) => updateData({
                                validation: {
                                  ...localData.validation,
                                  validateEmail: checked
                                }
                              })}
                            />
                            <Label htmlFor="validateEmail">Validar formato de email</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id="validatePhone"
                              checked={localData.validation.validatePhone}
                              onCheckedChange={(checked) => updateData({
                                validation: {
                                  ...localData.validation,
                                  validatePhone: checked
                                }
                              })}
                            />
                            <Label htmlFor="validatePhone">Validar formato de teléfono</Label>
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="errorHandling">Manejo de Errores</Label>
                      <Select
                        value={localData.errorHandling}
                        onValueChange={(value: 'ignore' | 'retry' | 'stop_flow') => 
                          updateData({ errorHandling: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ignore">Ignorar errores</SelectItem>
                          <SelectItem value="retry">Reintentar</SelectItem>
                          <SelectItem value="stop_flow">Detener flujo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {localData.errorHandling === 'retry' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Máximo de Reintentos</Label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={localData.maxRetries}
                            onChange={(e) => updateData({ maxRetries: parseInt(e.target.value) || 3 })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Retraso entre Reintentos (ms)</Label>
                          <Input
                            type="number"
                            min="100"
                            max="10000"
                            value={localData.retryDelay}
                            onChange={(e) => updateData({ retryDelay: parseInt(e.target.value) || 1000 })}
                          />
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-4">
                      <Label>Configuración de Logging</Label>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="loggingEnabled"
                          checked={localData.logging.enabled}
                          onCheckedChange={(checked) => updateData({
                            logging: {
                              ...localData.logging,
                              enabled: checked
                            }
                          })}
                        />
                        <Label htmlFor="loggingEnabled">Habilitar Logging</Label>
                      </div>

                      {localData.logging.enabled && (
                        <div className="space-y-4 pl-6">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="logSuccessfulEvents"
                              checked={localData.logging.logSuccessfulEvents}
                              onCheckedChange={(checked) => updateData({
                                logging: {
                                  ...localData.logging,
                                  logSuccessfulEvents: checked
                                }
                              })}
                            />
                            <Label htmlFor="logSuccessfulEvents">Log eventos exitosos</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id="logFailedEvents"
                              checked={localData.logging.logFailedEvents}
                              onCheckedChange={(checked) => updateData({
                                logging: {
                                  ...localData.logging,
                                  logFailedEvents: checked
                                }
                              })}
                            />
                            <Label htmlFor="logFailedEvents">Log eventos fallidos</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id="logUserData"
                              checked={localData.logging.logUserData}
                              onCheckedChange={(checked) => updateData({
                                logging: {
                                  ...localData.logging,
                                  logUserData: checked
                                }
                              })}
                            />
                            <Label htmlFor="logUserData">Log datos de usuario (sensible)</Label>
                          </div>
                        </div>
                      )}
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