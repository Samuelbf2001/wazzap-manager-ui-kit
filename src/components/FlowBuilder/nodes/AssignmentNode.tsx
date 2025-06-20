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
  UserCheck, 
  Settings, 
  Building2, 
  User, 
  Save, 
  Plus, 
  Trash2, 
  X,
  ArrowRight,
  Database,
  Calendar,
  Hash,
  Type,
  CheckCircle,
  AlertCircle,
  Users
} from 'lucide-react';

interface AssignmentData {
  label: string;
  assignmentType: 'property' | 'contact' | 'deal' | 'company' | 'ticket' | 'user';
  
  // Configuración HubSpot
  hubspotConnection: string;
  objectId?: string;
  
  // Propiedades a asignar
  propertyAssignments: Array<{
    id: string;
    hubspotProperty: string;
    sourceType: 'static' | 'variable' | 'flow_data' | 'user_input';
    sourceValue: string;
    dataType: 'string' | 'number' | 'boolean' | 'date' | 'enumeration';
    transformation?: 'none' | 'uppercase' | 'lowercase' | 'date_format' | 'number_format';
    required: boolean;
  }>;
  
  // Configuración de contacto
  contactIdentifier: 'email' | 'phone' | 'hubspot_id' | 'custom';
  contactValue: string;
  createIfNotExists: boolean;
  
  // Configuración de usuario HubSpot
  userIdentifier: 'email' | 'user_id' | 'custom';
  userValue: string;
  userRole?: 'admin' | 'sales' | 'marketing' | 'service' | 'custom';
  userTeam?: string;
  assignToTeam: boolean;
  
  // Configuración de deal/company/ticket
  associateWithContact: boolean;
  dealStage?: string;
  dealPipeline?: string;
  companyDomain?: string;
  ticketPriority?: 'LOW' | 'MEDIUM' | 'HIGH';
  ticketStatus?: 'NEW' | 'IN_PROGRESS' | 'WAITING' | 'CLOSED';
  
  // Configuración avanzada
  batchUpdate: boolean;
  errorHandling: 'ignore' | 'retry' | 'stop_flow';
  maxRetries: number;
  retryDelay: number;
  
  // Validaciones
  validateData: boolean;
  validationRules: Array<{
    id: string;
    property: string;
    rule: 'required' | 'email' | 'phone' | 'url' | 'regex';
    value?: string;
    errorMessage: string;
  }>;
}

const hubspotProperties = {
  contact: [
    { value: 'firstname', label: 'Nombre' },
    { value: 'lastname', label: 'Apellido' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Teléfono' },
    { value: 'company', label: 'Empresa' },
    { value: 'jobtitle', label: 'Cargo' },
    { value: 'lifecyclestage', label: 'Etapa del Ciclo de Vida' },
    { value: 'lead_status', label: 'Estado del Lead' },
    { value: 'website', label: 'Sitio Web' },
    { value: 'city', label: 'Ciudad' },
    { value: 'state', label: 'Estado/Provincia' },
    { value: 'country', label: 'País' }
  ],
  user: [
    { value: 'firstName', label: 'Nombre' },
    { value: 'lastName', label: 'Apellido' },
    { value: 'email', label: 'Email' },
    { value: 'roleId', label: 'ID del Rol' },
    { value: 'primaryTeamId', label: 'ID del Equipo Principal' },
    { value: 'secondaryTeamIds', label: 'IDs de Equipos Secundarios' },
    { value: 'sendWelcomeEmail', label: 'Enviar Email de Bienvenida' },
    { value: 'superAdmin', label: 'Super Administrador' },
    { value: 'activeUser', label: 'Usuario Activo' },
    { value: 'userIdInclude', label: 'Incluir ID de Usuario' },
    { value: 'timezone', label: 'Zona Horaria' },
    { value: 'language', label: 'Idioma' }
  ],
  deal: [
    { value: 'dealname', label: 'Nombre del Deal' },
    { value: 'amount', label: 'Monto' },
    { value: 'dealstage', label: 'Etapa del Deal' },
    { value: 'pipeline', label: 'Pipeline' },
    { value: 'closedate', label: 'Fecha de Cierre' },
    { value: 'dealtype', label: 'Tipo de Deal' },
    { value: 'hubspot_owner_id', label: 'Propietario' }
  ],
  company: [
    { value: 'name', label: 'Nombre de la Empresa' },
    { value: 'domain', label: 'Dominio' },
    { value: 'industry', label: 'Industria' },
    { value: 'phone', label: 'Teléfono' },
    { value: 'city', label: 'Ciudad' },
    { value: 'state', label: 'Estado/Provincia' },
    { value: 'hubspot_owner_id', label: 'Propietario' }
  ],
  ticket: [
    { value: 'subject', label: 'Asunto' },
    { value: 'content', label: 'Contenido' },
    { value: 'hs_ticket_priority', label: 'Prioridad' },
    { value: 'hs_pipeline_stage', label: 'Estado' },
    { value: 'source_type', label: 'Tipo de Fuente' },
    { value: 'hubspot_owner_id', label: 'Propietario' }
  ]
};

export function AssignmentNode({ data, selected }: NodeProps<AssignmentData>) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [localData, setLocalData] = useState<AssignmentData>({
    label: 'Asignación HubSpot',
    assignmentType: 'contact',
    hubspotConnection: '',
    propertyAssignments: [],
    contactIdentifier: 'email',
    contactValue: '',
    createIfNotExists: true,
    userIdentifier: 'email',
    userValue: '',
    assignToTeam: false,
    associateWithContact: true,
    batchUpdate: false,
    errorHandling: 'retry',
    maxRetries: 3,
    retryDelay: 1000,
    validateData: true,
    validationRules: [],
    ...data
  });

  const updateData = useCallback((updates: Partial<AssignmentData>) => {
    setLocalData(prev => ({ ...prev, ...updates }));
  }, []);

  const addPropertyAssignment = () => {
    const newAssignment = {
      id: Date.now().toString(),
      hubspotProperty: '',
      sourceType: 'static' as const,
      sourceValue: '',
      dataType: 'string' as const,
      required: false
    };
    updateData({
      propertyAssignments: [...localData.propertyAssignments, newAssignment]
    });
  };

  const removePropertyAssignment = (id: string) => {
    updateData({
      propertyAssignments: localData.propertyAssignments.filter(assignment => assignment.id !== id)
    });
  };

  const addValidationRule = () => {
    const newRule = {
      id: Date.now().toString(),
      property: '',
      rule: 'required' as const,
      errorMessage: ''
    };
    updateData({
      validationRules: [...localData.validationRules, newRule]
    });
  };

  const removeValidationRule = (id: string) => {
    updateData({
      validationRules: localData.validationRules.filter(rule => rule.id !== id)
    });
  };

  const getAssignmentIcon = () => {
    switch (localData.assignmentType) {
      case 'contact': return User;
      case 'deal': return Database;
      case 'company': return Building2;
      case 'ticket': return AlertCircle;
      case 'user': return Users;
      default: return UserCheck;
    }
  };

  const AssignmentIcon = getAssignmentIcon();

  return (
    <>
      <Handle type="target" position={Position.Top} />
      
      <Card className={`w-80 ${selected ? 'ring-2 ring-blue-500' : ''} bg-blue-50 border-blue-200 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="p-1.5 bg-blue-100 rounded-full flex-shrink-0">
                <AssignmentIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm font-medium text-gray-900 truncate">{localData.label}</CardTitle>
                <Badge variant="secondary" className="text-xs mt-1">
                  {localData.assignmentType === 'contact' && 'Contacto'}
                  {localData.assignmentType === 'deal' && 'Deal'}
                  {localData.assignmentType === 'company' && 'Empresa'}
                  {localData.assignmentType === 'ticket' && 'Ticket'}
                  {localData.assignmentType === 'user' && 'Usuario'}
                  {localData.assignmentType === 'property' && 'Propiedad'}
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
              <Building2 className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">HubSpot: {localData.hubspotConnection || 'No configurado'}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Database className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{localData.propertyAssignments.length} propiedades</span>
            </div>
            
            {localData.validateData && (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{localData.validationRules.length} validaciones</span>
              </div>
            )}
            
            {localData.batchUpdate && (
              <div className="flex items-center gap-1">
                <ArrowRight className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">Actualización en lote</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Bottom} id="success" />
      <Handle type="source" position={Position.Right} id="error" />

      {/* Modal de configuración mejorado */}
      {isConfigOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <Card className="w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
            <CardHeader className="flex-shrink-0 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Configurar Asignación HubSpot
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
                <TabsList className="grid w-full grid-cols-5 mb-6 h-auto">
                  <TabsTrigger value="basic" className="text-xs py-2 px-1">Básico</TabsTrigger>
                  <TabsTrigger value="properties" className="text-xs py-2 px-1">Props</TabsTrigger>
                  <TabsTrigger value="target" className="text-xs py-2 px-1">Target</TabsTrigger>
                  <TabsTrigger value="validation" className="text-xs py-2 px-1">Valid</TabsTrigger>
                  <TabsTrigger value="advanced" className="text-xs py-2 px-1">Avanzado</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="label">Nombre del Componente</Label>
                      <Input
                        id="label"
                        value={localData.label}
                        onChange={(e) => updateData({ label: e.target.value })}
                        placeholder="Ej: Crear contacto en HubSpot"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hubspotConnection">Conexión HubSpot</Label>
                      <Select
                        value={localData.hubspotConnection}
                        onValueChange={(value) => updateData({ hubspotConnection: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar conexión" />
                        </SelectTrigger>
                        <SelectContent className="z-[10000]">
                          <SelectItem value="main">Conexión Principal</SelectItem>
                          <SelectItem value="secondary">Conexión Secundaria</SelectItem>
                          <SelectItem value="sandbox">Sandbox</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assignmentType">Tipo de Asignación</Label>
                    <Select
                      value={localData.assignmentType}
                      onValueChange={(value: 'property' | 'contact' | 'deal' | 'company' | 'ticket' | 'user') => 
                        updateData({ assignmentType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[10000]">
                        <SelectItem value="contact">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Contacto
                          </div>
                        </SelectItem>
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Usuario de HubSpot
                          </div>
                        </SelectItem>
                        <SelectItem value="deal">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Deal/Negocio
                          </div>
                        </SelectItem>
                        <SelectItem value="company">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Empresa
                          </div>
                        </SelectItem>
                        <SelectItem value="ticket">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Ticket
                          </div>
                        </SelectItem>
                        <SelectItem value="property">
                          <div className="flex items-center gap-2">
                            <Type className="h-4 w-4" />
                            Propiedad Personalizada
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="properties" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-medium">Propiedades a Asignar</Label>
                    <Button onClick={addPropertyAssignment} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Propiedad
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {localData.propertyAssignments.map((assignment, index) => (
                      <Card key={assignment.id} className="p-4 border-l-4 border-l-blue-500">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">Propiedad #{index + 1}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removePropertyAssignment(assignment.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Propiedad HubSpot</Label>
                              <Select
                                value={assignment.hubspotProperty}
                                onValueChange={(value) => {
                                  const updated = localData.propertyAssignments.map(a =>
                                    a.id === assignment.id ? { ...a, hubspotProperty: value } : a
                                  );
                                  updateData({ propertyAssignments: updated });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar propiedad" />
                                </SelectTrigger>
                                <SelectContent className="z-[10000]">
                                  {hubspotProperties[localData.assignmentType as keyof typeof hubspotProperties]?.map((prop) => (
                                    <SelectItem key={prop.value} value={prop.value}>
                                      {prop.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Tipo de Fuente</Label>
                              <Select
                                value={assignment.sourceType}
                                onValueChange={(value: 'static' | 'variable' | 'flow_data' | 'user_input') => {
                                  const updated = localData.propertyAssignments.map(a =>
                                    a.id === assignment.id ? { ...a, sourceType: value } : a
                                  );
                                  updateData({ propertyAssignments: updated });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[10000]">
                                  <SelectItem value="static">Valor Estático</SelectItem>
                                  <SelectItem value="variable">Variable del Flujo</SelectItem>
                                  <SelectItem value="flow_data">Datos del Flujo</SelectItem>
                                  <SelectItem value="user_input">Entrada del Usuario</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Valor/Variable</Label>
                              <Input
                                placeholder={
                                  assignment.sourceType === 'static' ? 'Valor fijo' :
                                  assignment.sourceType === 'variable' ? '{{variable}}' :
                                  'Nombre del campo'
                                }
                                value={assignment.sourceValue}
                                onChange={(e) => {
                                  const updated = localData.propertyAssignments.map(a =>
                                    a.id === assignment.id ? { ...a, sourceValue: e.target.value } : a
                                  );
                                  updateData({ propertyAssignments: updated });
                                }}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Tipo de Dato</Label>
                              <Select
                                value={assignment.dataType}
                                onValueChange={(value: 'string' | 'number' | 'boolean' | 'date' | 'enumeration') => {
                                  const updated = localData.propertyAssignments.map(a =>
                                    a.id === assignment.id ? { ...a, dataType: value } : a
                                  );
                                  updateData({ propertyAssignments: updated });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[10000]">
                                  <SelectItem value="string">Texto</SelectItem>
                                  <SelectItem value="number">Número</SelectItem>
                                  <SelectItem value="boolean">Booleano</SelectItem>
                                  <SelectItem value="date">Fecha</SelectItem>
                                  <SelectItem value="enumeration">Enumeración</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-end">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`required-${assignment.id}`}
                                  checked={assignment.required}
                                  onCheckedChange={(checked) => {
                                    const updated = localData.propertyAssignments.map(a =>
                                      a.id === assignment.id ? { ...a, required: checked } : a
                                    );
                                    updateData({ propertyAssignments: updated });
                                  }}
                                />
                                <Label htmlFor={`required-${assignment.id}`} className="text-sm">Requerido</Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                    
                    {localData.propertyAssignments.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No hay propiedades configuradas</p>
                        <p className="text-sm">Haz clic en "Agregar Propiedad" para comenzar</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="target" className="space-y-6">
                  {localData.assignmentType === 'contact' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Configuración de Contacto</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Identificador de Contacto</Label>
                          <Select
                            value={localData.contactIdentifier}
                            onValueChange={(value: 'email' | 'phone' | 'hubspot_id' | 'custom') => 
                              updateData({ contactIdentifier: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[10000]">
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Teléfono</SelectItem>
                              <SelectItem value="hubspot_id">ID de HubSpot</SelectItem>
                              <SelectItem value="custom">Personalizado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Valor del Identificador</Label>
                          <Input
                            placeholder="{{email}} o valor fijo"
                            value={localData.contactValue}
                            onChange={(e) => updateData({ contactValue: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="createIfNotExists"
                          checked={localData.createIfNotExists}
                          onCheckedChange={(checked) => updateData({ createIfNotExists: checked })}
                        />
                        <Label htmlFor="createIfNotExists">Crear contacto si no existe</Label>
                      </div>
                    </div>
                  )}

                  {localData.assignmentType === 'user' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Configuración de Usuario HubSpot</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Identificador de Usuario</Label>
                          <Select
                            value={localData.userIdentifier}
                            onValueChange={(value: 'email' | 'user_id' | 'custom') => 
                              updateData({ userIdentifier: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[10000]">
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="user_id">ID de Usuario</SelectItem>
                              <SelectItem value="custom">Personalizado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Valor del Identificador</Label>
                          <Input
                            placeholder="{{user_email}} o valor fijo"
                            value={localData.userValue}
                            onChange={(e) => updateData({ userValue: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Rol del Usuario</Label>
                          <Select
                            value={localData.userRole || ''}
                            onValueChange={(value: 'admin' | 'sales' | 'marketing' | 'service' | 'custom') => 
                              updateData({ userRole: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                            <SelectContent className="z-[10000]">
                              <SelectItem value="admin">Administrador</SelectItem>
                              <SelectItem value="sales">Ventas</SelectItem>
                              <SelectItem value="marketing">Marketing</SelectItem>
                              <SelectItem value="service">Servicio</SelectItem>
                              <SelectItem value="custom">Personalizado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Equipo</Label>
                          <Input
                            placeholder="{{team_id}} o ID del equipo"
                            value={localData.userTeam || ''}
                            onChange={(e) => updateData({ userTeam: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="assignToTeam"
                          checked={localData.assignToTeam}
                          onCheckedChange={(checked) => updateData({ assignToTeam: checked })}
                        />
                        <Label htmlFor="assignToTeam">Asignar automáticamente a equipo</Label>
                      </div>
                    </div>
                  )}

                  {localData.assignmentType === 'deal' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Configuración de Deal</h3>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="associateWithContact"
                          checked={localData.associateWithContact}
                          onCheckedChange={(checked) => updateData({ associateWithContact: checked })}
                        />
                        <Label htmlFor="associateWithContact">Asociar con contacto</Label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Pipeline</Label>
                          <Input
                            placeholder="ID del pipeline"
                            value={localData.dealPipeline || ''}
                            onChange={(e) => updateData({ dealPipeline: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Etapa</Label>
                          <Input
                            placeholder="ID de la etapa"
                            value={localData.dealStage || ''}
                            onChange={(e) => updateData({ dealStage: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {localData.assignmentType === 'company' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Configuración de Empresa</h3>
                      <div className="space-y-2">
                        <Label>Dominio de la Empresa</Label>
                        <Input
                          placeholder="{{company_domain}} o dominio fijo"
                          value={localData.companyDomain || ''}
                          onChange={(e) => updateData({ companyDomain: e.target.value })}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="associateWithContactCompany"
                          checked={localData.associateWithContact}
                          onCheckedChange={(checked) => updateData({ associateWithContact: checked })}
                        />
                        <Label htmlFor="associateWithContactCompany">Asociar con contacto</Label>
                      </div>
                    </div>
                  )}

                  {localData.assignmentType === 'ticket' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Configuración de Ticket</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Prioridad</Label>
                          <Select
                            value={localData.ticketPriority || 'MEDIUM'}
                            onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH') => 
                              updateData({ ticketPriority: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[10000]">
                              <SelectItem value="LOW">Baja</SelectItem>
                              <SelectItem value="MEDIUM">Media</SelectItem>
                              <SelectItem value="HIGH">Alta</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Estado</Label>
                          <Select
                            value={localData.ticketStatus || 'NEW'}
                            onValueChange={(value: 'NEW' | 'IN_PROGRESS' | 'WAITING' | 'CLOSED') => 
                              updateData({ ticketStatus: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[10000]">
                              <SelectItem value="NEW">Nuevo</SelectItem>
                              <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                              <SelectItem value="WAITING">Esperando</SelectItem>
                              <SelectItem value="CLOSED">Cerrado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="associateWithContactTicket"
                          checked={localData.associateWithContact}
                          onCheckedChange={(checked) => updateData({ associateWithContact: checked })}
                        />
                        <Label htmlFor="associateWithContactTicket">Asociar con contacto</Label>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="validation" className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="validateData"
                      checked={localData.validateData}
                      onCheckedChange={(checked) => updateData({ validateData: checked })}
                    />
                    <Label htmlFor="validateData" className="text-lg font-medium">Validar datos antes de asignar</Label>
                  </div>

                  {localData.validateData && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-lg font-medium">Reglas de Validación</Label>
                        <Button onClick={addValidationRule} size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Agregar Regla
                        </Button>
                      </div>

                      <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {localData.validationRules.map((rule, index) => (
                          <Card key={rule.id} className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-sm">Regla #{index + 1}</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeValidationRule(rule.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <Select
                                value={rule.property}
                                onValueChange={(value) => {
                                  const updated = localData.validationRules.map(r =>
                                    r.id === rule.id ? { ...r, property: value } : r
                                  );
                                  updateData({ validationRules: updated });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Propiedad" />
                                </SelectTrigger>
                                <SelectContent className="z-[10000]">
                                  {localData.propertyAssignments.map((assignment) => (
                                    <SelectItem key={assignment.id} value={assignment.hubspotProperty}>
                                      {assignment.hubspotProperty}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Select
                                value={rule.rule}
                                onValueChange={(value: 'required' | 'email' | 'phone' | 'url' | 'regex') => {
                                  const updated = localData.validationRules.map(r =>
                                    r.id === rule.id ? { ...r, rule: value } : r
                                  );
                                  updateData({ validationRules: updated });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[10000]">
                                  <SelectItem value="required">Requerido</SelectItem>
                                  <SelectItem value="email">Email válido</SelectItem>
                                  <SelectItem value="phone">Teléfono válido</SelectItem>
                                  <SelectItem value="url">URL válida</SelectItem>
                                  <SelectItem value="regex">Expresión regular</SelectItem>
                                </SelectContent>
                              </Select>

                              <Input
                                placeholder="Mensaje de error"
                                value={rule.errorMessage}
                                onChange={(e) => {
                                  const updated = localData.validationRules.map(r =>
                                    r.id === rule.id ? { ...r, errorMessage: e.target.value } : r
                                  );
                                  updateData({ validationRules: updated });
                                }}
                              />
                            </div>
                          </Card>
                        ))}
                        
                        {localData.validationRules.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No hay reglas de validación configuradas</p>
                            <p className="text-sm">Haz clic en "Agregar Regla" para comenzar</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Configuración Avanzada</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="batchUpdate"
                            checked={localData.batchUpdate}
                            onCheckedChange={(checked) => updateData({ batchUpdate: checked })}
                          />
                          <Label htmlFor="batchUpdate">Actualización en lote</Label>
                        </div>

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
                            <SelectContent className="z-[10000]">
                              <SelectItem value="ignore">Ignorar errores</SelectItem>
                              <SelectItem value="retry">Reintentar</SelectItem>
                              <SelectItem value="stop_flow">Detener flujo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {localData.errorHandling === 'retry' && (
                        <div className="space-y-4">
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
                    </div>
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
                  <Save className="h-4 w-4 mr-1" />
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