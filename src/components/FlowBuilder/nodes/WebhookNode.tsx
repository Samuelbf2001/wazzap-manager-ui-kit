import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Webhook, Globe, Lock, AlertCircle, Plus, Trash2, Key, Settings, Code, Clock, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface WebhookNodeData {
  label: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  payload: string;
  payloadType: 'json' | 'form' | 'raw' | 'dynamic';
  timeout: number;
  retryOnFailure: boolean;
  maxRetries: number;
  retryDelay: number;
  authentication: {
    type: 'none' | 'bearer' | 'basic' | 'apikey';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyHeader?: string;
  };
  responseHandling: {
    successCondition: string;
    extractData: boolean;
    extractPath?: string;
    saveAs?: string;
  };
  variables: Array<{
    name: string;
    value: string;
    type: 'static' | 'dynamic';
  }>;
}

export function WebhookNode({ data, onChange }: { data: WebhookNodeData; onChange?: (data: WebhookNodeData) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDataChange = (updates: Partial<WebhookNodeData>) => {
    const newData = { ...data, ...updates };
    onChange?.(newData);
  };

  const addHeader = () => {
    const newHeaders = { ...data.headers, '': '' };
    handleDataChange({ headers: newHeaders });
  };

  const updateHeader = (oldKey: string, newKey: string, value: string) => {
    const newHeaders = { ...data.headers };
    if (oldKey !== newKey) {
      delete newHeaders[oldKey];
    }
    newHeaders[newKey] = value;
    handleDataChange({ headers: newHeaders });
  };

  const removeHeader = (key: string) => {
    const newHeaders = { ...data.headers };
    delete newHeaders[key];
    handleDataChange({ headers: newHeaders });
  };

  const addVariable = () => {
    const newVariables = [...(data.variables || []), { name: '', value: '', type: 'static' as const }];
    handleDataChange({ variables: newVariables });
  };

  const updateVariable = (index: number, updates: Partial<typeof data.variables[0]>) => {
    const newVariables = [...(data.variables || [])];
    newVariables[index] = { ...newVariables[index], ...updates };
    handleDataChange({ variables: newVariables });
  };

  const removeVariable = (index: number) => {
    const newVariables = [...(data.variables || [])];
    newVariables.splice(index, 1);
    handleDataChange({ variables: newVariables });
  };

  const getMethodColor = (method: string) => {
    const colors = {
      'GET': 'bg-green-500',
      'POST': 'bg-blue-500',
      'PUT': 'bg-yellow-500',
      'DELETE': 'bg-red-500',
      'PATCH': 'bg-purple-500'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-500';
  };

  const generatePayloadFromVariables = () => {
    const payload: Record<string, any> = {};
    (data.variables || []).forEach(variable => {
      if (variable.name) {
        payload[variable.name] = variable.type === 'dynamic' ? `{{${variable.value}}}` : variable.value;
      }
    });
    handleDataChange({ payload: JSON.stringify(payload, null, 2) });
  };

  if (!isExpanded) {
    return (
      <Card className="p-4 min-w-[280px] shadow-lg border-l-4 border-l-orange-500 cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setIsExpanded(true)}>
        <Handle type="target" position={Position.Top} className="w-3 h-3" />
        
        <div className="flex items-center space-x-2 mb-3">
          <div className="p-2 bg-orange-50 rounded-lg">
            <Webhook className="w-4 h-4 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-gray-900">Webhook</h3>
            <p className="text-xs text-gray-500">{data.label || 'Configurar webhook'}</p>
          </div>
          <Badge className={`text-xs text-white ${getMethodColor(data.method || 'POST')}`}>
            {data.method || 'POST'}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="bg-gray-50 p-2 rounded">
            <div className="flex items-center space-x-2 mb-1">
              <Globe className="w-3 h-3 text-gray-500" />
              <span className="text-xs font-medium text-gray-700">URL</span>
            </div>
            <p className="text-xs text-gray-600 break-all">
              {data.url || 'No configurada'}
            </p>
          </div>

          {data.payload && (
            <div className="bg-blue-50 p-2 rounded">
              <span className="text-xs font-medium text-blue-700">Datos a enviar configurados</span>
            </div>
          )}

          {data.authentication?.type !== 'none' && (
            <div className="flex items-center space-x-2">
              <Lock className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600">Autenticación: {data.authentication?.type}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-4">
          <Handle 
            type="source" 
            position={Position.Bottom} 
            id="success"
            style={{ left: '25%' }}
            className="w-3 h-3"
          />
          <Handle 
            type="source" 
            position={Position.Bottom} 
            id="error"
            style={{ left: '75%' }}
            className="w-3 h-3"
          />
        </div>

        <div className="flex justify-between mt-1">
          <span className="text-xs text-green-600">Éxito</span>
          <span className="text-xs text-red-600">Error</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0 min-w-[500px] max-w-[600px] shadow-lg border-l-4 border-l-orange-500">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="p-4 border-b bg-orange-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Webhook className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Configuración Webhook</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="h-8 w-8 p-0"
          >
            ×
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="basic" className="text-xs py-2 px-2">Básico</TabsTrigger>
            <TabsTrigger value="data" className="text-xs py-2 px-2">Datos</TabsTrigger>
            <TabsTrigger value="auth" className="text-xs py-2 px-2">Auth</TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs py-2 px-2">Avanzado</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="label" className="text-sm font-medium">Nombre del nodo</Label>
              <Input
                id="label"
                value={data.label || ''}
                onChange={(e) => handleDataChange({ label: e.target.value })}
                placeholder="Ej: Enviar datos a CRM"
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Método HTTP</Label>
                <Select value={data.method || 'POST'} onValueChange={(value) => handleDataChange({ method: value as any })}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="url" className="text-sm font-medium">URL del Webhook</Label>
                <Input
                  id="url"
                  value={data.url || ''}
                  onChange={(e) => handleDataChange({ url: e.target.value })}
                  placeholder="https://api.ejemplo.com/webhook"
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Headers HTTP</Label>
                <Button size="sm" variant="outline" onClick={addHeader} className="h-8">
                  <Plus className="w-3 h-3 mr-1" />
                  Agregar
                </Button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {Object.entries(data.headers || {}).map(([key, value], index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={key}
                      onChange={(e) => updateHeader(key, e.target.value, value)}
                      placeholder="Nombre header"
                      className="text-sm"
                    />
                    <Input
                      value={value}
                      onChange={(e) => updateHeader(key, key, e.target.value)}
                      placeholder="Valor"
                      className="text-sm"
                    />
                    <Button size="sm" variant="outline" onClick={() => removeHeader(key)} className="h-9 w-9 p-0">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo de datos</Label>
              <Select value={data.payloadType || 'json'} onValueChange={(value) => handleDataChange({ payloadType: value as any })}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="form">Form Data</SelectItem>
                  <SelectItem value="raw">Raw Text</SelectItem>
                  <SelectItem value="dynamic">Variables Dinámicas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.payloadType === 'dynamic' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Variables a enviar</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={generatePayloadFromVariables} className="h-8">
                      <Code className="w-3 h-3 mr-1" />
                      Generar JSON
                    </Button>
                    <Button size="sm" variant="outline" onClick={addVariable} className="h-8">
                      <Plus className="w-3 h-3 mr-1" />
                      Variable
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(data.variables || []).map((variable, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={variable.name}
                        onChange={(e) => updateVariable(index, { name: e.target.value })}
                        placeholder="nombre_campo"
                        className="text-sm"
                      />
                      <Input
                        value={variable.value}
                        onChange={(e) => updateVariable(index, { value: e.target.value })}
                        placeholder={variable.type === 'dynamic' ? 'user.email' : 'valor estático'}
                        className="text-sm"
                      />
                      <Select value={variable.type} onValueChange={(value) => updateVariable(index, { type: value as any })}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="static">Fijo</SelectItem>
                          <SelectItem value="dynamic">Var</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" onClick={() => removeVariable(index)} className="h-9 w-9 p-0">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="payload" className="text-sm font-medium">
                {data.payloadType === 'json' ? 'JSON Payload' : 'Datos a enviar'}
              </Label>
              <Textarea
                id="payload"
                value={data.payload || ''}
                onChange={(e) => handleDataChange({ payload: e.target.value })}
                placeholder={
                  data.payloadType === 'json' 
                    ? '{\n  "usuario": "{{user.name}}",\n  "email": "{{user.email}}",\n  "mensaje": "{{message.text}}"\n}'
                    : 'Datos a enviar al webhook'
                }
                className="text-sm font-mono min-h-[120px]"
              />
              <p className="text-xs text-gray-500">
                Puedes usar variables como {'{{'} user.name {'}'}, {'{{'} message.text {'}'}, {'{{'} flow.step {'}'}, etc.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="auth" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo de autenticación</Label>
              <Select 
                value={data.authentication?.type || 'none'} 
                onValueChange={(value) => handleDataChange({ 
                  authentication: { ...data.authentication, type: value as any } 
                })}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin autenticación</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                  <SelectItem value="apikey">API Key</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.authentication?.type === 'bearer' && (
              <div className="space-y-2">
                <Label htmlFor="token" className="text-sm font-medium">Bearer Token</Label>
                <Input
                  id="token"
                  type="password"
                  value={data.authentication.token || ''}
                  onChange={(e) => handleDataChange({ 
                    authentication: { ...data.authentication, token: e.target.value } 
                  })}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="text-sm"
                />
              </div>
            )}

            {data.authentication?.type === 'basic' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">Usuario</Label>
                  <Input
                    id="username"
                    value={data.authentication.username || ''}
                    onChange={(e) => handleDataChange({ 
                      authentication: { ...data.authentication, username: e.target.value } 
                    })}
                    placeholder="usuario"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={data.authentication.password || ''}
                    onChange={(e) => handleDataChange({ 
                      authentication: { ...data.authentication, password: e.target.value } 
                    })}
                    placeholder="contraseña"
                    className="text-sm"
                  />
                </div>
              </div>
            )}

            {data.authentication?.type === 'apikey' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="apiKeyHeader" className="text-sm font-medium">Nombre del Header</Label>
                  <Input
                    id="apiKeyHeader"
                    value={data.authentication.apiKeyHeader || 'X-API-Key'}
                    onChange={(e) => handleDataChange({ 
                      authentication: { ...data.authentication, apiKeyHeader: e.target.value } 
                    })}
                    placeholder="X-API-Key"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="text-sm font-medium">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={data.authentication.apiKey || ''}
                    onChange={(e) => handleDataChange({ 
                      authentication: { ...data.authentication, apiKey: e.target.value } 
                    })}
                    placeholder="tu-api-key-secreta"
                    className="text-sm"
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="timeout" className="text-sm font-medium">Timeout (segundos)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={data.timeout || 30}
                  onChange={(e) => handleDataChange({ timeout: parseInt(e.target.value) || 30 })}
                  min="1"
                  max="300"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Reintentos automáticos</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={data.retryOnFailure || false}
                    onCheckedChange={(checked) => handleDataChange({ retryOnFailure: checked })}
                  />
                  <span className="text-sm text-gray-600">Activar</span>
                </div>
              </div>
            </div>

            {data.retryOnFailure && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="maxRetries" className="text-sm font-medium">Máximo reintentos</Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    value={data.maxRetries || 3}
                    onChange={(e) => handleDataChange({ maxRetries: parseInt(e.target.value) || 3 })}
                    min="1"
                    max="10"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retryDelay" className="text-sm font-medium">Delay entre reintentos (ms)</Label>
                  <Input
                    id="retryDelay"
                    type="number"
                    value={data.retryDelay || 1000}
                    onChange={(e) => handleDataChange({ retryDelay: parseInt(e.target.value) || 1000 })}
                    min="100"
                    max="10000"
                    step="100"
                    className="text-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="successCondition" className="text-sm font-medium">Condición de éxito</Label>
              <Input
                id="successCondition"
                value={data.responseHandling?.successCondition || ''}
                onChange={(e) => handleDataChange({ 
                  responseHandling: { 
                    ...data.responseHandling, 
                    successCondition: e.target.value 
                  } 
                })}
                placeholder="status === 200 || response.success === true"
                className="text-sm"
              />
              <p className="text-xs text-gray-500">
                Condición JavaScript para determinar si la respuesta fue exitosa
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={data.responseHandling?.extractData || false}
                  onCheckedChange={(checked) => handleDataChange({ 
                    responseHandling: { 
                      ...data.responseHandling, 
                      extractData: checked 
                    } 
                  })}
                />
                <Label className="text-sm font-medium">Extraer datos de la respuesta</Label>
              </div>
              
              {data.responseHandling?.extractData && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="extractPath" className="text-sm">Ruta de extracción</Label>
                    <Input
                      id="extractPath"
                      value={data.responseHandling.extractPath || ''}
                      onChange={(e) => handleDataChange({ 
                        responseHandling: { 
                          ...data.responseHandling, 
                          extractPath: e.target.value 
                        } 
                      })}
                      placeholder="data.result.id"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="saveAs" className="text-sm">Guardar como variable</Label>
                    <Input
                      id="saveAs"
                      value={data.responseHandling.saveAs || ''}
                      onChange={(e) => handleDataChange({ 
                        responseHandling: { 
                          ...data.responseHandling, 
                          saveAs: e.target.value 
                        } 
                      })}
                      placeholder="webhook_response_id"
                      className="text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex justify-between p-4 border-t bg-gray-50">
        <div className="flex items-center space-x-4 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{data.timeout || 30}s</span>
          </div>
          {data.retryOnFailure && (
            <div className="flex items-center space-x-1">
              <RotateCcw className="w-3 h-3" />
              <span>{data.maxRetries || 3} reintentos</span>
            </div>
          )}
          {data.authentication?.type !== 'none' && (
            <div className="flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>{data.authentication?.type}</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-4">
          <Handle 
            type="source" 
            position={Position.Bottom} 
            id="success"
            className="w-3 h-3"
            style={{ position: 'relative', right: '40px', bottom: '-20px' }}
          />
          <Handle 
            type="source" 
            position={Position.Bottom} 
            id="error"
            className="w-3 h-3"
            style={{ position: 'relative', right: '-20px', bottom: '-20px' }}
          />
        </div>
      </div>

      <div className="flex justify-between px-4 pb-2">
        <span className="text-xs text-green-600">Éxito</span>
        <span className="text-xs text-red-600">Error</span>
      </div>
    </Card>
  );
} 