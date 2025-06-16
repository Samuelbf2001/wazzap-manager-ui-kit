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
  AlertCircle
} from 'lucide-react';

interface AssignmentData {
  label: string;
  assignmentType: 'property' | 'contact' | 'deal' | 'company' | 'ticket';
  
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
    { value: 'lead_status', label: 'Estado del Lead' }
  ],
  deal: [
    { value: 'dealname', label: 'Nombre del Deal' },
    { value: 'amount', label: 'Monto' },
    { value: 'dealstage', label: 'Etapa del Deal' },
    { value: 'pipeline', label: 'Pipeline' },
    { value: 'closedate', label: 'Fecha de Cierre' },
    { value: 'dealtype', label: 'Tipo de Deal' }
  ],
  company: [
    { value: 'name', label: 'Nombre de la Empresa' },
    { value: 'domain', label: 'Dominio' },
    { value: 'industry', label: 'Industria' },
    { value: 'phone', label: 'Teléfono' },
    { value: 'city', label: 'Ciudad' },
    { value: 'state', label: 'Estado/Provincia' }
  ],
  ticket: [
    { value: 'subject', label: 'Asunto' },
    { value: 'content', label: 'Contenido' },
    { value: 'hs_ticket_priority', label: 'Prioridad' },
    { value: 'hs_pipeline_stage', label: 'Estado' },
    { value: 'source_type', label: 'Tipo de Fuente' }
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
      default: return UserCheck;
    }
  };

  const AssignmentIcon = getAssignmentIcon();

  return (
    <>
      <Handle type="target" position={Position.Top} />
      
      <Card className={`w-80 ${selected ? 'ring-2 ring-blue-500' : ''} bg-blue-50 border-blue-200`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AssignmentIcon className="h-4 w-4 text-blue-600" />
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
            {localData.assignmentType === 'contact' && 'Contacto'}
            {localData.assignmentType === 'deal' && 'Deal'}
            {localData.assignmentType === 'company' && 'Empresa'}
            {localData.assignmentType === 'ticket' && 'Ticket'}
            {localData.assignmentType === 'property' && 'Propiedad'}
          </Badge>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              <span>HubSpot: {localData.hubspotConnection || 'No configurado'}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              <span>{localData.propertyAssignments.length} propiedades</span>
            </div>
            
            {localData.validateData && (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                <span>{localData.validationRules.length} validaciones</span>
              </div>
            )}
            
            {localData.batchUpdate && (
              <div className="flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                <span>Actualización en lote</span>
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
            
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="properties">Propiedades</TabsTrigger>
                  <TabsTrigger value="target">Objetivo</TabsTrigger>
                  <TabsTrigger value="validation">Validación</TabsTrigger>
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
                    <Label htmlFor="assignmentType">Tipo de Asignación</Label>
                    <Select
                      value={localData.assignmentType}
                      onValueChange={(value: 'property' | 'contact' | 'deal' | 'company' | 'ticket') => 
                        updateData({ assignmentType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contact">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Contacto
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

                  <div className="space-y-2">
                    <Label htmlFor="hubspotConnection">Conexión HubSpot</Label>
                    <Select
                      value={localData.hubspotConnection}
                      onValueChange={(value) => updateData({ hubspotConnection: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar conexión" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Conexión Principal</SelectItem>
                        <SelectItem value="secondary">Conexión Secundaria</SelectItem>
                        <SelectItem value="sandbox">Sandbox</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="properties" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Propiedades a Asignar</Label>
                    <Button onClick={addPropertyAssignment} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Propiedad
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {localData.propertyAssignments.map((assignment) => (
                      <Card key={assignment.id} className="p-4">
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
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
                                <SelectContent>
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
                                <SelectContent>
                                  <SelectItem value="static">Valor Estático</SelectItem>
                                  <SelectItem value="variable">Variable del Flujo</SelectItem>
                                  <SelectItem value="flow_data">Datos del Flujo</SelectItem>
                                  <SelectItem value="user_input">Entrada del Usuario</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
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
                                <SelectContent>
                                  <SelectItem value="string">Texto</SelectItem>
                                  <SelectItem value="number">Número</SelectItem>
                                  <SelectItem value="boolean">Booleano</SelectItem>
                                  <SelectItem value="date">Fecha</SelectItem>
                                  <SelectItem value="enumeration">Enumeración</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-end gap-2">
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removePropertyAssignment(assignment.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="target" className="space-y-4">
                  {localData.assignmentType === 'contact' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
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
                            <SelectContent>
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

                  {localData.assignmentType === 'deal' && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="associateWithContact"
                          checked={localData.associateWithContact}
                          onCheckedChange={(checked) => updateData({ associateWithContact: checked })}
                        />
                        <Label htmlFor="associateWithContact">Asociar con contacto</Label>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
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
                      <div className="grid grid-cols-2 gap-4">
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
                            <SelectContent>
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
                            <SelectContent>
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

                <TabsContent value="validation" className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="validateData"
                      checked={localData.validateData}
                      onCheckedChange={(checked) => updateData({ validateData: checked })}
                    />
                    <Label htmlFor="validateData">Validar datos antes de asignar</Label>
                  </div>

                  {localData.validateData && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Reglas de Validación</Label>
                        <Button onClick={addValidationRule} size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Agregar Regla
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {localData.validationRules.map((rule) => (
                          <Card key={rule.id} className="p-3">
                            <div className="grid grid-cols-4 gap-3">
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
                                <SelectContent>
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
                                <SelectContent>
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

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeValidationRule(rule.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
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