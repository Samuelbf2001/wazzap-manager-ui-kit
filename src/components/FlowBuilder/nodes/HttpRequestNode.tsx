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
  Globe, 
  Settings, 
  Send, 
  Key, 
  Save, 
  Plus, 
  Trash2, 
  X,
  Clock,
  Shield,
  AlertCircle,
  CheckCircle,
  Code,
  FileText,
  Lock
} from 'lucide-react';

interface HttpRequestData {
  label: string;
  
  // Configuración de la petición
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  
  // Headers
  headers: Array<{
    id: string;
    key: string;
    value: string;
    enabled: boolean;
  }>;
  
  // Autenticación
  authType: 'none' | 'bearer' | 'basic' | 'api_key' | 'oauth2';
  authConfig: {
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyLocation?: 'header' | 'query';
    apiKeyName?: string;
  };
  
  // Body de la petición
  bodyType: 'none' | 'json' | 'form' | 'text' | 'xml';
  bodyContent: string;
  bodyParams: Array<{
    id: string;
    key: string;
    value: string;
    type: 'text' | 'file';
    enabled: boolean;
  }>;
  
  // Query parameters
  queryParams: Array<{
    id: string;
    key: string;
    value: string;
    enabled: boolean;
  }>;
  
  // Variables dinámicas
  useVariables: boolean;
  variableMapping: Array<{
    id: string;
    placeholder: string;
    source: 'flow_data' | 'user_input' | 'static';
    value: string;
  }>;
  
  // Configuración de respuesta
  responseHandling: {
    saveResponse: boolean;
    responseVariable: string;
    parseJson: boolean;
    extractFields: Array<{
      id: string;
      jsonPath: string;
      variableName: string;
    }>;
  };
  
  // Configuración avanzada
  timeout: number;
  retries: number;
  retryDelay: number;
  followRedirects: boolean;
  validateSSL: boolean;
  
  // Manejo de errores
  errorHandling: 'ignore' | 'retry' | 'stop_flow' | 'custom';
  errorConditions: Array<{
    id: string;
    condition: 'status_code' | 'response_contains' | 'timeout';
    value: string;
    action: 'retry' | 'stop' | 'continue';
  }>;
}

const httpMethods = [
  { value: 'GET', label: 'GET', color: 'text-green-600' },
  { value: 'POST', label: 'POST', color: 'text-blue-600' },
  { value: 'PUT', label: 'PUT', color: 'text-orange-600' },
  { value: 'PATCH', label: 'PATCH', color: 'text-purple-600' },
  { value: 'DELETE', label: 'DELETE', color: 'text-red-600' }
];

const commonHeaders = [
  'Content-Type',
  'Authorization',
  'Accept',
  'User-Agent',
  'X-API-Key',
  'X-Requested-With'
];

export function HttpRequestNode({ data, selected }: NodeProps<HttpRequestData>) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [localData, setLocalData] = useState<HttpRequestData>({
    label: 'Petición HTTP',
    method: 'GET',
    url: '',
    headers: [],
    authType: 'none',
    authConfig: {},
    bodyType: 'none',
    bodyContent: '',
    bodyParams: [],
    queryParams: [],
    useVariables: false,
    variableMapping: [],
    responseHandling: {
      saveResponse: true,
      responseVariable: 'http_response',
      parseJson: true,
      extractFields: []
    },
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
    followRedirects: true,
    validateSSL: true,
    errorHandling: 'retry',
    errorConditions: [],
    ...data
  });

  const updateData = useCallback((updates: Partial<HttpRequestData>) => {
    setLocalData(prev => ({ ...prev, ...updates }));
  }, []);

  const addHeader = () => {
    const newHeader = {
      id: Date.now().toString(),
      key: '',
      value: '',
      enabled: true
    };
    updateData({
      headers: [...localData.headers, newHeader]
    });
  };

  const removeHeader = (id: string) => {
    updateData({
      headers: localData.headers.filter(header => header.id !== id)
    });
  };

  const addQueryParam = () => {
    const newParam = {
      id: Date.now().toString(),
      key: '',
      value: '',
      enabled: true
    };
    updateData({
      queryParams: [...localData.queryParams, newParam]
    });
  };

  const removeQueryParam = (id: string) => {
    updateData({
      queryParams: localData.queryParams.filter(param => param.id !== id)
    });
  };

  const addBodyParam = () => {
    const newParam = {
      id: Date.now().toString(),
      key: '',
      value: '',
      type: 'text' as const,
      enabled: true
    };
    updateData({
      bodyParams: [...localData.bodyParams, newParam]
    });
  };

  const removeBodyParam = (id: string) => {
    updateData({
      bodyParams: localData.bodyParams.filter(param => param.id !== id)
    });
  };

  const addVariableMapping = () => {
    const newMapping = {
      id: Date.now().toString(),
      placeholder: '',
      source: 'flow_data' as const,
      value: ''
    };
    updateData({
      variableMapping: [...localData.variableMapping, newMapping]
    });
  };

  const removeVariableMapping = (id: string) => {
    updateData({
      variableMapping: localData.variableMapping.filter(mapping => mapping.id !== id)
    });
  };

  const addExtractField = () => {
    const newField = {
      id: Date.now().toString(),
      jsonPath: '',
      variableName: ''
    };
    updateData({
      responseHandling: {
        ...localData.responseHandling,
        extractFields: [...localData.responseHandling.extractFields, newField]
      }
    });
  };

  const removeExtractField = (id: string) => {
    updateData({
      responseHandling: {
        ...localData.responseHandling,
        extractFields: localData.responseHandling.extractFields.filter(field => field.id !== id)
      }
    });
  };

  const getMethodColor = () => {
    const method = httpMethods.find(m => m.value === localData.method);
    return method?.color || 'text-gray-600';
  };

  return (
    <>
      <Handle type="target" position={Position.Top} />
      
      <Card className={`w-80 ${selected ? 'ring-2 ring-blue-500' : ''} bg-indigo-50 border-indigo-200`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-600" />
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
          <Badge variant="secondary" className={`w-fit text-xs ${getMethodColor()}`}>
            {localData.method}
          </Badge>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              <span className="truncate">{localData.url || 'URL no configurada'}</span>
            </div>
            
            {localData.authType !== 'none' && (
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>Auth: {localData.authType}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Timeout: {localData.timeout}ms</span>
            </div>
            
            {localData.responseHandling.saveResponse && (
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>Guardar respuesta</span>
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
                  <Globe className="h-5 w-5" />
                  Configurar Petición HTTP
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
                <TabsList className="grid w-full grid-cols-6 h-auto">
                  <TabsTrigger value="basic" className="text-xs py-2 px-1">Básico</TabsTrigger>
                  <TabsTrigger value="auth" className="text-xs py-2 px-1">Auth</TabsTrigger>
                  <TabsTrigger value="body" className="text-xs py-2 px-1">Body</TabsTrigger>
                  <TabsTrigger value="response" className="text-xs py-2 px-1">Response</TabsTrigger>
                  <TabsTrigger value="variables" className="text-xs py-2 px-1">Variables</TabsTrigger>
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

                  <div className="grid grid-cols-4 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="method">Método</Label>
                      <Select
                        value={localData.method}
                        onValueChange={(value: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE') => 
                          updateData({ method: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {httpMethods.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              <span className={method.color}>{method.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-3 space-y-2">
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        value={localData.url}
                        onChange={(e) => updateData({ url: e.target.value })}
                        placeholder="https://api.ejemplo.com/endpoint"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Headers</Label>
                      <Button onClick={addHeader} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar Header
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {localData.headers.map((header) => (
                        <div key={header.id} className="grid grid-cols-5 gap-2 items-center">
                          <Select
                            value={header.key}
                            onValueChange={(value) => {
                              const updated = localData.headers.map(h =>
                                h.id === header.id ? { ...h, key: value } : h
                              );
                              updateData({ headers: updated });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Header" />
                            </SelectTrigger>
                            <SelectContent>
                              {commonHeaders.map((h) => (
                                <SelectItem key={h} value={h}>{h}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Clave personalizada"
                            value={header.key}
                            onChange={(e) => {
                              const updated = localData.headers.map(h =>
                                h.id === header.id ? { ...h, key: e.target.value } : h
                              );
                              updateData({ headers: updated });
                            }}
                          />
                          <Input
                            placeholder="Valor"
                            value={header.value}
                            onChange={(e) => {
                              const updated = localData.headers.map(h =>
                                h.id === header.id ? { ...h, value: e.target.value } : h
                              );
                              updateData({ headers: updated });
                            }}
                          />
                          <Switch
                            checked={header.enabled}
                            onCheckedChange={(checked) => {
                              const updated = localData.headers.map(h =>
                                h.id === header.id ? { ...h, enabled: checked } : h
                              );
                              updateData({ headers: updated });
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeHeader(header.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Query Parameters</Label>
                      <Button onClick={addQueryParam} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar Parámetro
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {localData.queryParams.map((param) => (
                        <div key={param.id} className="grid grid-cols-4 gap-2 items-center">
                          <Input
                            placeholder="Clave"
                            value={param.key}
                            onChange={(e) => {
                              const updated = localData.queryParams.map(p =>
                                p.id === param.id ? { ...p, key: e.target.value } : p
                              );
                              updateData({ queryParams: updated });
                            }}
                          />
                          <Input
                            placeholder="Valor"
                            value={param.value}
                            onChange={(e) => {
                              const updated = localData.queryParams.map(p =>
                                p.id === param.id ? { ...p, value: e.target.value } : p
                              );
                              updateData({ queryParams: updated });
                            }}
                          />
                          <Switch
                            checked={param.enabled}
                            onCheckedChange={(checked) => {
                              const updated = localData.queryParams.map(p =>
                                p.id === param.id ? { ...p, enabled: checked } : p
                              );
                              updateData({ queryParams: updated });
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQueryParam(param.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="auth" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="authType">Tipo de Autenticación</Label>
                    <Select
                      value={localData.authType}
                      onValueChange={(value: 'none' | 'bearer' | 'basic' | 'api_key' | 'oauth2') => 
                        updateData({ authType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin autenticación</SelectItem>
                        <SelectItem value="bearer">Bearer Token</SelectItem>
                        <SelectItem value="basic">Basic Auth</SelectItem>
                        <SelectItem value="api_key">API Key</SelectItem>
                        <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {localData.authType === 'bearer' && (
                    <div className="space-y-2">
                      <Label htmlFor="token">Token</Label>
                      <Input
                        id="token"
                        type="password"
                        value={localData.authConfig.token || ''}
                        onChange={(e) => updateData({ 
                          authConfig: { ...localData.authConfig, token: e.target.value }
                        })}
                        placeholder="Bearer token"
                      />
                    </div>
                  )}

                  {localData.authType === 'basic' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Usuario</Label>
                        <Input
                          id="username"
                          value={localData.authConfig.username || ''}
                          onChange={(e) => updateData({ 
                            authConfig: { ...localData.authConfig, username: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                          id="password"
                          type="password"
                          value={localData.authConfig.password || ''}
                          onChange={(e) => updateData({ 
                            authConfig: { ...localData.authConfig, password: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  )}

                  {localData.authType === 'api_key' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Ubicación</Label>
                          <Select
                            value={localData.authConfig.apiKeyLocation || 'header'}
                            onValueChange={(value: 'header' | 'query') => updateData({ 
                              authConfig: { ...localData.authConfig, apiKeyLocation: value }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="header">Header</SelectItem>
                              <SelectItem value="query">Query Parameter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Nombre</Label>
                          <Input
                            value={localData.authConfig.apiKeyName || ''}
                            onChange={(e) => updateData({ 
                              authConfig: { ...localData.authConfig, apiKeyName: e.target.value }
                            })}
                            placeholder="X-API-Key"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Valor</Label>
                          <Input
                            type="password"
                            value={localData.authConfig.apiKey || ''}
                            onChange={(e) => updateData({ 
                              authConfig: { ...localData.authConfig, apiKey: e.target.value }
                            })}
                            placeholder="API Key"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="body" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bodyType">Tipo de Body</Label>
                    <Select
                      value={localData.bodyType}
                      onValueChange={(value: 'none' | 'json' | 'form' | 'text' | 'xml') => 
                        updateData({ bodyType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin body</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="form">Form Data</SelectItem>
                        <SelectItem value="text">Texto plano</SelectItem>
                        <SelectItem value="xml">XML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(localData.bodyType === 'json' || localData.bodyType === 'text' || localData.bodyType === 'xml') && (
                    <div className="space-y-2">
                      <Label htmlFor="bodyContent">Contenido del Body</Label>
                      <Textarea
                        id="bodyContent"
                        value={localData.bodyContent}
                        onChange={(e) => updateData({ bodyContent: e.target.value })}
                        rows={8}
                        placeholder={
                          localData.bodyType === 'json' ? '{\n  "key": "value"\n}' :
                          localData.bodyType === 'xml' ? '<root>\n  <element>value</element>\n</root>' :
                          'Contenido de texto'
                        }
                        className="font-mono text-sm"
                      />
                    </div>
                  )}

                  {localData.bodyType === 'form' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Parámetros del Form</Label>
                        <Button onClick={addBodyParam} size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Agregar Parámetro
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {localData.bodyParams.map((param) => (
                          <div key={param.id} className="grid grid-cols-5 gap-2 items-center">
                            <Input
                              placeholder="Clave"
                              value={param.key}
                              onChange={(e) => {
                                const updated = localData.bodyParams.map(p =>
                                  p.id === param.id ? { ...p, key: e.target.value } : p
                                );
                                updateData({ bodyParams: updated });
                              }}
                            />
                            <Input
                              placeholder="Valor"
                              value={param.value}
                              onChange={(e) => {
                                const updated = localData.bodyParams.map(p =>
                                  p.id === param.id ? { ...p, value: e.target.value } : p
                                );
                                updateData({ bodyParams: updated });
                              }}
                            />
                            <Select
                              value={param.type}
                              onValueChange={(value: 'text' | 'file') => {
                                const updated = localData.bodyParams.map(p =>
                                  p.id === param.id ? { ...p, type: value } : p
                                );
                                updateData({ bodyParams: updated });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Texto</SelectItem>
                                <SelectItem value="file">Archivo</SelectItem>
                              </SelectContent>
                            </Select>
                            <Switch
                              checked={param.enabled}
                              onCheckedChange={(checked) => {
                                const updated = localData.bodyParams.map(p =>
                                  p.id === param.id ? { ...p, enabled: checked } : p
                                );
                                updateData({ bodyParams: updated });
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBodyParam(param.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="response" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="saveResponse"
                        checked={localData.responseHandling.saveResponse}
                        onCheckedChange={(checked) => updateData({ 
                          responseHandling: { ...localData.responseHandling, saveResponse: checked }
                        })}
                      />
                      <Label htmlFor="saveResponse">Guardar respuesta en variable</Label>
                    </div>

                    {localData.responseHandling.saveResponse && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="responseVariable">Nombre de la Variable</Label>
                          <Input
                            id="responseVariable"
                            value={localData.responseHandling.responseVariable}
                            onChange={(e) => updateData({ 
                              responseHandling: { ...localData.responseHandling, responseVariable: e.target.value }
                            })}
                            placeholder="http_response"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="parseJson"
                            checked={localData.responseHandling.parseJson}
                            onCheckedChange={(checked) => updateData({ 
                              responseHandling: { ...localData.responseHandling, parseJson: checked }
                            })}
                          />
                          <Label htmlFor="parseJson">Parsear respuesta como JSON</Label>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>Extraer Campos Específicos</Label>
                            <Button onClick={addExtractField} size="sm">
                              <Plus className="h-4 w-4 mr-1" />
                              Agregar Campo
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {localData.responseHandling.extractFields.map((field) => (
                              <div key={field.id} className="grid grid-cols-3 gap-2 items-center">
                                <Input
                                  placeholder="$.data.name"
                                  value={field.jsonPath}
                                  onChange={(e) => {
                                    const updated = localData.responseHandling.extractFields.map(f =>
                                      f.id === field.id ? { ...f, jsonPath: e.target.value } : f
                                    );
                                    updateData({ 
                                      responseHandling: { ...localData.responseHandling, extractFields: updated }
                                    });
                                  }}
                                />
                                <Input
                                  placeholder="variable_name"
                                  value={field.variableName}
                                  onChange={(e) => {
                                    const updated = localData.responseHandling.extractFields.map(f =>
                                      f.id === field.id ? { ...f, variableName: e.target.value } : f
                                    );
                                    updateData({ 
                                      responseHandling: { ...localData.responseHandling, extractFields: updated }
                                    });
                                  }}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeExtractField(field.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="variables" className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="useVariables"
                      checked={localData.useVariables}
                      onCheckedChange={(checked) => updateData({ useVariables: checked })}
                    />
                    <Label htmlFor="useVariables">Usar variables dinámicas</Label>
                  </div>

                  {localData.useVariables && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Mapeo de Variables</Label>
                        <Button onClick={addVariableMapping} size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Agregar Variable
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {localData.variableMapping.map((mapping) => (
                          <div key={mapping.id} className="grid grid-cols-4 gap-2 items-center">
                            <Input
                              placeholder="{{placeholder}}"
                              value={mapping.placeholder}
                              onChange={(e) => {
                                const updated = localData.variableMapping.map(m =>
                                  m.id === mapping.id ? { ...m, placeholder: e.target.value } : m
                                );
                                updateData({ variableMapping: updated });
                              }}
                            />
                            <Select
                              value={mapping.source}
                              onValueChange={(value: 'flow_data' | 'user_input' | 'static') => {
                                const updated = localData.variableMapping.map(m =>
                                  m.id === mapping.id ? { ...m, source: value } : m
                                );
                                updateData({ variableMapping: updated });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="flow_data">Datos del Flujo</SelectItem>
                                <SelectItem value="user_input">Entrada del Usuario</SelectItem>
                                <SelectItem value="static">Valor Estático</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Valor"
                              value={mapping.value}
                              onChange={(e) => {
                                const updated = localData.variableMapping.map(m =>
                                  m.id === mapping.id ? { ...m, value: e.target.value } : m
                                );
                                updateData({ variableMapping: updated });
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariableMapping(mapping.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Timeout (ms)</Label>
                      <Input
                        type="number"
                        min="1000"
                        max="300000"
                        value={localData.timeout}
                        onChange={(e) => updateData({ timeout: parseInt(e.target.value) || 30000 })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Reintentos</Label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={localData.retries}
                        onChange={(e) => updateData({ retries: parseInt(e.target.value) || 3 })}
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

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="followRedirects"
                        checked={localData.followRedirects}
                        onCheckedChange={(checked) => updateData({ followRedirects: checked })}
                      />
                      <Label htmlFor="followRedirects">Seguir redirecciones</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="validateSSL"
                        checked={localData.validateSSL}
                        onCheckedChange={(checked) => updateData({ validateSSL: checked })}
                      />
                      <Label htmlFor="validateSSL">Validar certificados SSL</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="errorHandling">Manejo de Errores</Label>
                    <Select
                      value={localData.errorHandling}
                      onValueChange={(value: 'ignore' | 'retry' | 'stop_flow' | 'custom') => 
                        updateData({ errorHandling: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ignore">Ignorar errores</SelectItem>
                        <SelectItem value="retry">Reintentar automáticamente</SelectItem>
                        <SelectItem value="stop_flow">Detener flujo</SelectItem>
                        <SelectItem value="custom">Manejo personalizado</SelectItem>
                      </SelectContent>
                    </Select>
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