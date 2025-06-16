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
  Search, 
  Settings, 
  Building2, 
  User, 
  Save, 
  Plus, 
  Trash2, 
  X,
  Eye,
  Database,
  Filter,
  Target,
  CheckCircle,
  AlertCircle,
  Users,
  Briefcase
} from 'lucide-react';

interface RecognitionData {
  label: string;
  
  // Configuración de búsqueda
  searchType: 'contact' | 'company' | 'deal' | 'ticket' | 'custom_object';
  hubspotConnection: string;
  
  // Criterios de búsqueda
  searchCriteria: Array<{
    id: string;
    property: string;
    operator: 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'is_known' | 'is_unknown';
    value: string;
    valueType: 'static' | 'variable' | 'user_input';
    logicalOperator?: 'AND' | 'OR';
  }>;
  
  // Propiedades a recuperar
  propertiesToRetrieve: Array<{
    id: string;
    property: string;
    alias?: string;
    required: boolean;
  }>;
  
  // Configuración de resultados
  resultHandling: {
    maxResults: number;
    sortBy?: string;
    sortOrder: 'ASC' | 'DESC';
    saveResults: boolean;
    resultsVariable: string;
    saveFirstResult: boolean;
    firstResultVariable: string;
  };
  
  // Filtros avanzados
  advancedFilters: {
    dateRange?: {
      property: string;
      startDate: string;
      endDate: string;
    };
    associatedObjects?: Array<{
      objectType: 'contact' | 'company' | 'deal' | 'ticket';
      associationProperty: string;
      value: string;
    }>;
  };
  
  // Configuración de salida
  outputConditions: Array<{
    id: string;
    condition: 'found' | 'not_found' | 'count_gt' | 'count_lt' | 'count_eq' | 'property_match';
    value?: string;
    property?: string;
    outputHandle: string;
  }>;
  
  // Configuración avanzada
  cacheResults: boolean;
  cacheDuration: number;
  errorHandling: 'ignore' | 'retry' | 'stop_flow';
  maxRetries: number;
  retryDelay: number;
}

const hubspotObjects = {
  contact: {
    label: 'Contacto',
    icon: User,
    properties: [
      { value: 'firstname', label: 'Nombre' },
      { value: 'lastname', label: 'Apellido' },
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Teléfono' },
      { value: 'company', label: 'Empresa' },
      { value: 'jobtitle', label: 'Cargo' },
      { value: 'lifecyclestage', label: 'Etapa del Ciclo de Vida' },
      { value: 'lead_status', label: 'Estado del Lead' },
      { value: 'createdate', label: 'Fecha de Creación' },
      { value: 'lastmodifieddate', label: 'Última Modificación' }
    ]
  },
  company: {
    label: 'Empresa',
    icon: Building2,
    properties: [
      { value: 'name', label: 'Nombre de la Empresa' },
      { value: 'domain', label: 'Dominio' },
      { value: 'industry', label: 'Industria' },
      { value: 'phone', label: 'Teléfono' },
      { value: 'city', label: 'Ciudad' },
      { value: 'state', label: 'Estado/Provincia' },
      { value: 'country', label: 'País' },
      { value: 'numberofemployees', label: 'Número de Empleados' }
    ]
  },
  deal: {
    label: 'Deal',
    icon: Briefcase,
    properties: [
      { value: 'dealname', label: 'Nombre del Deal' },
      { value: 'amount', label: 'Monto' },
      { value: 'dealstage', label: 'Etapa del Deal' },
      { value: 'pipeline', label: 'Pipeline' },
      { value: 'closedate', label: 'Fecha de Cierre' },
      { value: 'dealtype', label: 'Tipo de Deal' },
      { value: 'createdate', label: 'Fecha de Creación' }
    ]
  },
  ticket: {
    label: 'Ticket',
    icon: AlertCircle,
    properties: [
      { value: 'subject', label: 'Asunto' },
      { value: 'content', label: 'Contenido' },
      { value: 'hs_ticket_priority', label: 'Prioridad' },
      { value: 'hs_pipeline_stage', label: 'Estado' },
      { value: 'source_type', label: 'Tipo de Fuente' },
      { value: 'createdate', label: 'Fecha de Creación' }
    ]
  }
};

const searchOperators = [
  { value: 'eq', label: 'Igual a' },
  { value: 'neq', label: 'No igual a' },
  { value: 'lt', label: 'Menor que' },
  { value: 'lte', label: 'Menor o igual que' },
  { value: 'gt', label: 'Mayor que' },
  { value: 'gte', label: 'Mayor o igual que' },
  { value: 'contains', label: 'Contiene' },
  { value: 'not_contains', label: 'No contiene' },
  { value: 'starts_with', label: 'Comienza con' },
  { value: 'ends_with', label: 'Termina con' },
  { value: 'is_known', label: 'Tiene valor' },
  { value: 'is_unknown', label: 'No tiene valor' }
];

export function RecognitionNode({ data, selected }: NodeProps<RecognitionData>) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [localData, setLocalData] = useState<RecognitionData>({
    label: 'Reconocimiento HS',
    searchType: 'contact',
    hubspotConnection: '',
    searchCriteria: [],
    propertiesToRetrieve: [],
    resultHandling: {
      maxResults: 10,
      sortOrder: 'DESC',
      saveResults: true,
      resultsVariable: 'search_results',
      saveFirstResult: true,
      firstResultVariable: 'first_result'
    },
    advancedFilters: {},
    outputConditions: [],
    cacheResults: false,
    cacheDuration: 300,
    errorHandling: 'retry',
    maxRetries: 3,
    retryDelay: 1000,
    ...data
  });

  const updateData = useCallback((updates: Partial<RecognitionData>) => {
    setLocalData(prev => ({ ...prev, ...updates }));
  }, []);

  const addSearchCriterion = () => {
    const newCriterion = {
      id: Date.now().toString(),
      property: '',
      operator: 'eq' as const,
      value: '',
      valueType: 'static' as const,
      logicalOperator: 'AND' as const
    };
    updateData({
      searchCriteria: [...localData.searchCriteria, newCriterion]
    });
  };

  const removeSearchCriterion = (id: string) => {
    updateData({
      searchCriteria: localData.searchCriteria.filter(criterion => criterion.id !== id)
    });
  };

  const addPropertyToRetrieve = () => {
    const newProperty = {
      id: Date.now().toString(),
      property: '',
      required: false
    };
    updateData({
      propertiesToRetrieve: [...localData.propertiesToRetrieve, newProperty]
    });
  };

  const removePropertyToRetrieve = (id: string) => {
    updateData({
      propertiesToRetrieve: localData.propertiesToRetrieve.filter(prop => prop.id !== id)
    });
  };

  const addOutputCondition = () => {
    const newCondition = {
      id: Date.now().toString(),
      condition: 'found' as const,
      outputHandle: `output_${Date.now()}`
    };
    updateData({
      outputConditions: [...localData.outputConditions, newCondition]
    });
  };

  const removeOutputCondition = (id: string) => {
    updateData({
      outputConditions: localData.outputConditions.filter(condition => condition.id !== id)
    });
  };

  const getObjectIcon = () => {
    const objectConfig = hubspotObjects[localData.searchType as keyof typeof hubspotObjects];
    return objectConfig?.icon || Search;
  };

  const ObjectIcon = getObjectIcon();

  return (
    <>
      <Handle type="target" position={Position.Top} />
      
      <Card className={`w-80 ${selected ? 'ring-2 ring-blue-500' : ''} bg-cyan-50 border-cyan-200`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ObjectIcon className="h-4 w-4 text-cyan-600" />
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
            {hubspotObjects[localData.searchType as keyof typeof hubspotObjects]?.label || localData.searchType}
          </Badge>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              <span>HubSpot: {localData.hubspotConnection || 'No configurado'}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Filter className="h-3 w-3" />
              <span>{localData.searchCriteria.length} criterios</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{localData.propertiesToRetrieve.length} propiedades</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>Máx: {localData.resultHandling.maxResults} resultados</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Bottom} id="default" />
      {localData.outputConditions.map((condition, index) => (
        <Handle
          key={condition.id}
          type="source"
          position={Position.Right}
          id={condition.outputHandle}
          style={{ top: 60 + (index * 20) }}
        />
      ))}

      {/* Modal de configuración */}
      {isConfigOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-[900px] max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Configurar Reconocimiento HubSpot
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
                  <TabsTrigger value="criteria">Criterios</TabsTrigger>
                  <TabsTrigger value="properties">Propiedades</TabsTrigger>
                  <TabsTrigger value="results">Resultados</TabsTrigger>
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
                    <Label htmlFor="searchType">Tipo de Objeto</Label>
                    <Select
                      value={localData.searchType}
                      onValueChange={(value: 'contact' | 'company' | 'deal' | 'ticket' | 'custom_object') => 
                        updateData({ searchType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(hubspotObjects).map(([key, config]) => {
                          const IconComponent = config.icon;
                          return (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                {config.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                        <SelectItem value="custom_object">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Objeto Personalizado
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

                <TabsContent value="criteria" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Criterios de Búsqueda</Label>
                    <Button onClick={addSearchCriterion} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Criterio
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {localData.searchCriteria.map((criterion, index) => (
                      <Card key={criterion.id} className="p-4">
                        <div className="space-y-3">
                          {index > 0 && (
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">Operador Lógico:</Label>
                              <Select
                                value={criterion.logicalOperator || 'AND'}
                                onValueChange={(value: 'AND' | 'OR') => {
                                  const updated = localData.searchCriteria.map(c =>
                                    c.id === criterion.id ? { ...c, logicalOperator: value } : c
                                  );
                                  updateData({ searchCriteria: updated });
                                }}
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="AND">Y</SelectItem>
                                  <SelectItem value="OR">O</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div className="grid grid-cols-4 gap-3">
                            <div className="space-y-2">
                              <Label>Propiedad</Label>
                              <Select
                                value={criterion.property}
                                onValueChange={(value) => {
                                  const updated = localData.searchCriteria.map(c =>
                                    c.id === criterion.id ? { ...c, property: value } : c
                                  );
                                  updateData({ searchCriteria: updated });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                  {hubspotObjects[localData.searchType as keyof typeof hubspotObjects]?.properties.map((prop) => (
                                    <SelectItem key={prop.value} value={prop.value}>
                                      {prop.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Operador</Label>
                              <Select
                                value={criterion.operator}
                                onValueChange={(value: any) => {
                                  const updated = localData.searchCriteria.map(c =>
                                    c.id === criterion.id ? { ...c, operator: value } : c
                                  );
                                  updateData({ searchCriteria: updated });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {searchOperators.map((op) => (
                                    <SelectItem key={op.value} value={op.value}>
                                      {op.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Tipo de Valor</Label>
                              <Select
                                value={criterion.valueType}
                                onValueChange={(value: 'static' | 'variable' | 'user_input') => {
                                  const updated = localData.searchCriteria.map(c =>
                                    c.id === criterion.id ? { ...c, valueType: value } : c
                                  );
                                  updateData({ searchCriteria: updated });
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
                            </div>

                            <div className="space-y-2">
                              <Label>Valor</Label>
                              <div className="flex gap-1">
                                <Input
                                  placeholder={
                                    criterion.valueType === 'static' ? 'Valor fijo' :
                                    criterion.valueType === 'variable' ? '{{variable}}' :
                                    'Campo de entrada'
                                  }
                                  value={criterion.value}
                                  onChange={(e) => {
                                    const updated = localData.searchCriteria.map(c =>
                                      c.id === criterion.id ? { ...c, value: e.target.value } : c
                                    );
                                    updateData({ searchCriteria: updated });
                                  }}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSearchCriterion(criterion.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="properties" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Propiedades a Recuperar</Label>
                    <Button onClick={addPropertyToRetrieve} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Propiedad
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {localData.propertiesToRetrieve.map((property) => (
                      <Card key={property.id} className="p-3">
                        <div className="grid grid-cols-4 gap-3 items-center">
                          <Select
                            value={property.property}
                            onValueChange={(value) => {
                              const updated = localData.propertiesToRetrieve.map(p =>
                                p.id === property.id ? { ...p, property: value } : p
                              );
                              updateData({ propertiesToRetrieve: updated });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar propiedad" />
                            </SelectTrigger>
                            <SelectContent>
                              {hubspotObjects[localData.searchType as keyof typeof hubspotObjects]?.properties.map((prop) => (
                                <SelectItem key={prop.value} value={prop.value}>
                                  {prop.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Input
                            placeholder="Alias (opcional)"
                            value={property.alias || ''}
                            onChange={(e) => {
                              const updated = localData.propertiesToRetrieve.map(p =>
                                p.id === property.id ? { ...p, alias: e.target.value } : p
                              );
                              updateData({ propertiesToRetrieve: updated });
                            }}
                          />

                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`required-${property.id}`}
                              checked={property.required}
                              onCheckedChange={(checked) => {
                                const updated = localData.propertiesToRetrieve.map(p =>
                                  p.id === property.id ? { ...p, required: checked } : p
                                );
                                updateData({ propertiesToRetrieve: updated });
                              }}
                            />
                            <Label htmlFor={`required-${property.id}`} className="text-sm">Requerido</Label>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePropertyToRetrieve(property.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="results" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Máximo de Resultados</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={localData.resultHandling.maxResults}
                        onChange={(e) => updateData({
                          resultHandling: {
                            ...localData.resultHandling,
                            maxResults: parseInt(e.target.value) || 10
                          }
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Orden</Label>
                      <Select
                        value={localData.resultHandling.sortOrder}
                        onValueChange={(value: 'ASC' | 'DESC') => updateData({
                          resultHandling: {
                            ...localData.resultHandling,
                            sortOrder: value
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ASC">Ascendente</SelectItem>
                          <SelectItem value="DESC">Descendente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="saveResults"
                        checked={localData.resultHandling.saveResults}
                        onCheckedChange={(checked) => updateData({
                          resultHandling: {
                            ...localData.resultHandling,
                            saveResults: checked
                          }
                        })}
                      />
                      <Label htmlFor="saveResults">Guardar todos los resultados</Label>
                    </div>

                    {localData.resultHandling.saveResults && (
                      <div className="space-y-2 pl-6">
                        <Label>Variable para Resultados</Label>
                        <Input
                          value={localData.resultHandling.resultsVariable}
                          onChange={(e) => updateData({
                            resultHandling: {
                              ...localData.resultHandling,
                              resultsVariable: e.target.value
                            }
                          })}
                          placeholder="search_results"
                        />
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="saveFirstResult"
                        checked={localData.resultHandling.saveFirstResult}
                        onCheckedChange={(checked) => updateData({
                          resultHandling: {
                            ...localData.resultHandling,
                            saveFirstResult: checked
                          }
                        })}
                      />
                      <Label htmlFor="saveFirstResult">Guardar primer resultado</Label>
                    </div>

                    {localData.resultHandling.saveFirstResult && (
                      <div className="space-y-2 pl-6">
                        <Label>Variable para Primer Resultado</Label>
                        <Input
                          value={localData.resultHandling.firstResultVariable}
                          onChange={(e) => updateData({
                            resultHandling: {
                              ...localData.resultHandling,
                              firstResultVariable: e.target.value
                            }
                          })}
                          placeholder="first_result"
                        />
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Condiciones de Salida</Label>
                      <Button onClick={addOutputCondition} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar Condición
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {localData.outputConditions.map((condition) => (
                        <Card key={condition.id} className="p-3">
                          <div className="grid grid-cols-3 gap-3 items-center">
                            <Select
                              value={condition.condition}
                              onValueChange={(value: any) => {
                                const updated = localData.outputConditions.map(c =>
                                  c.id === condition.id ? { ...c, condition: value } : c
                                );
                                updateData({ outputConditions: updated });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="found">Encontrado</SelectItem>
                                <SelectItem value="not_found">No encontrado</SelectItem>
                                <SelectItem value="count_gt">Cantidad mayor que</SelectItem>
                                <SelectItem value="count_lt">Cantidad menor que</SelectItem>
                                <SelectItem value="count_eq">Cantidad igual a</SelectItem>
                                <SelectItem value="property_match">Propiedad coincide</SelectItem>
                              </SelectContent>
                            </Select>

                            {(condition.condition.includes('count_') || condition.condition === 'property_match') && (
                              <Input
                                placeholder="Valor"
                                value={condition.value || ''}
                                onChange={(e) => {
                                  const updated = localData.outputConditions.map(c =>
                                    c.id === condition.id ? { ...c, value: e.target.value } : c
                                  );
                                  updateData({ outputConditions: updated });
                                }}
                              />
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOutputCondition(condition.id)}
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
                        id="cacheResults"
                        checked={localData.cacheResults}
                        onCheckedChange={(checked) => updateData({ cacheResults: checked })}
                      />
                      <Label htmlFor="cacheResults">Cachear resultados</Label>
                    </div>

                    {localData.cacheResults && (
                      <div className="space-y-2 pl-6">
                        <Label>Duración del Cache (segundos)</Label>
                        <Input
                          type="number"
                          min="60"
                          max="3600"
                          value={localData.cacheDuration}
                          onChange={(e) => updateData({ cacheDuration: parseInt(e.target.value) || 300 })}
                        />
                      </div>
                    )}

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