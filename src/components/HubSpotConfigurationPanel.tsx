import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Settings, Webhook, RotateCcw, Database, Phone, Mail, Users, Building } from 'lucide-react';

interface HubSpotConfig {
  apiKey: string;
  portalId: string;
  webhookUrl: string;
  isConfigured: boolean;
}

interface SyncSettings {
  autoSync: {
    contacts: boolean;
    deals: boolean;
    conversations: boolean;
  };
  mapping: {
    contactFields: { [key: string]: string };
    dealFields: { [key: string]: string };
  };
  webhooks: {
    enabled: boolean;
    port: number;
    path: string;
  };
}

interface ConnectionStatus {
  isConnected: boolean;
  lastSync: string | null;
  syncInProgress: boolean;
  queueLength: number;
  errors: string[];
}

interface PropertyMapping {
  hubspotField: string;
  whatsappField: string;
  fieldType: 'text' | 'number' | 'date' | 'select';
  required: boolean;
}

export function HubSpotConfigurationPanel() {
  const [activeTab, setActiveTab] = useState('connection');
  const [config, setConfig] = useState<HubSpotConfig>({
    apiKey: '',
    portalId: '',
    webhookUrl: '',
    isConfigured: false
  });
  const [syncSettings, setSyncSettings] = useState<SyncSettings>({
    autoSync: {
      contacts: true,
      deals: true,
      conversations: true
    },
    mapping: {
      contactFields: {
        firstname: 'name',
        phone: 'phoneNumber',
        email: 'email',
        whatsapp_number: 'phoneNumber'
      },
      dealFields: {
        dealname: 'title',
        amount: 'value',
        dealstage: 'stage'
      }
    },
    webhooks: {
      enabled: true,
      port: 3001,
      path: '/webhooks'
    }
  });
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastSync: null,
    syncInProgress: false,
    queueLength: 0,
    errors: []
  });
  const [showTestModal, setShowTestModal] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [syncProgress, setSyncProgress] = useState(0);

  // Cargar configuración desde localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('hubspot_config');
    const savedSyncSettings = localStorage.getItem('hubspot_sync_settings');
    
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
    
    if (savedSyncSettings) {
      setSyncSettings(JSON.parse(savedSyncSettings));
    }
  }, []);

  // Guardar configuración
  const saveConfiguration = async () => {
    try {
      localStorage.setItem('hubspot_config', JSON.stringify(config));
      localStorage.setItem('hubspot_sync_settings', JSON.stringify(syncSettings));
      
      // Aquí iría la llamada real para configurar HubSpot
      setConfig({ ...config, isConfigured: true });
      setConnectionStatus({ ...connectionStatus, isConnected: true });
      
      console.log('✅ Configuración guardada correctamente');
    } catch (error) {
      console.error('❌ Error guardando configuración:', error);
    }
  };

  // Configurar custom channels
  const setupCustomChannels = async () => {
    try {
      // Simular configuración de custom channels
      setSyncProgress(25);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSyncProgress(50);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSyncProgress(75);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSyncProgress(100);
      
      console.log('✅ Custom channels configurados correctamente');
    } catch (error) {
      console.error('❌ Error configurando custom channels:', error);
    }
  };

  // Test de conexión
  const testConnection = async () => {
    try {
      setShowTestModal(true);
      setTestResults(null);
      
      // Simular test de conexión
      const results = {
        apiConnection: { success: true, message: 'API Key válida' },
        portalAccess: { success: true, message: 'Portal accesible' },
        webhookSetup: { success: true, message: 'Webhooks configurados' },
        propertiesSync: { success: true, message: 'Propiedades sincronizadas' }
      };
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestResults(results);
    } catch (error) {
      console.error('Error en test de conexión:', error);
      setTestResults({
        apiConnection: { success: false, message: 'Error de conexión' }
      });
    }
  };

  // Sincronización forzada
  const forceSync = async (type: 'contact' | 'deal' | 'conversation') => {
    try {
      setSyncProgress(0);
      setConnectionStatus({ ...connectionStatus, syncInProgress: true });
      
      // Simular sincronización
      for (let i = 0; i <= 100; i += 10) {
        setSyncProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      setConnectionStatus({
        ...connectionStatus,
        syncInProgress: false,
        lastSync: new Date().toISOString()
      });
      
      console.log(`✅ Sincronización de ${type} completada`);
    } catch (error) {
      console.error(`❌ Error en sincronización de ${type}:`, error);
      setConnectionStatus({
        ...connectionStatus,
        syncInProgress: false,
        errors: [...connectionStatus.errors, `Error sincronizando ${type}`]
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configuración HubSpot</h1>
          <p className="text-gray-600 mt-2">
            Configura la integración completa con HubSpot incluyendo custom channels y sincronización automática
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {config.isConfigured && (
            <Badge variant={connectionStatus.isConnected ? "default" : "destructive"} className="px-3 py-1">
              {connectionStatus.isConnected ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Conectado
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Desconectado
                </>
              )}
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="connection" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Conexión</span>
          </TabsTrigger>
          <TabsTrigger value="channels" className="flex items-center space-x-2">
            <Phone className="w-4 h-4" />
            <span>Channels</span>
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4" />
            <span>Sincronización</span>
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center space-x-2">
            <Webhook className="w-4 h-4" />
            <span>Webhooks</span>
          </TabsTrigger>
          <TabsTrigger value="properties" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Propiedades</span>
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Conexión */}
        <TabsContent value="connection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Configuración Básica</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="apiKey">API Key de HubSpot</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </div>
                <div>
                  <Label htmlFor="portalId">Portal ID</Label>
                  <Input
                    id="portalId"
                    value={config.portalId}
                    onChange={(e) => setConfig({ ...config, portalId: e.target.value })}
                    placeholder="12345678"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="webhookUrl">URL de Webhooks</Label>
                <Input
                  id="webhookUrl"
                  value={config.webhookUrl}
                  onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                  placeholder="https://tu-dominio.com/webhooks"
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL donde HubSpot enviará los webhooks. Debe ser HTTPS en producción.
                </p>
              </div>

              <Separator />

              <div className="flex space-x-4">
                <Button onClick={saveConfiguration} className="flex-1">
                  Guardar Configuración
                </Button>
                <Button variant="outline" onClick={testConnection}>
                  Test de Conexión
                </Button>
              </div>

              {connectionStatus.isConnected && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Conexión establecida correctamente. Última sincronización: {
                      connectionStatus.lastSync 
                        ? new Date(connectionStatus.lastSync).toLocaleString()
                        : 'Nunca'
                    }
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Custom Channels */}
        <TabsContent value="channels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Custom Channels de WhatsApp</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Configura las propiedades personalizadas de WhatsApp en HubSpot para un seguimiento completo de las conversaciones.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Propiedades que se crearán:</h4>
                  <ul className="space-y-2 text-sm">
                    <li>✅ whatsapp_number - Número de WhatsApp</li>
                    <li>✅ whatsapp_conversation_id - ID de conversación</li>
                    <li>✅ whatsapp_last_message_date - Última fecha de mensaje</li>
                    <li>✅ whatsapp_status - Estado de la conversación</li>
                  </ul>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Comunicaciones que se registrarán:</h4>
                  <ul className="space-y-2 text-sm">
                    <li>📱 Mensajes de WhatsApp entrantes</li>
                    <li>📤 Mensajes de WhatsApp salientes</li>
                    <li>🔔 Notificaciones de estado</li>
                    <li>📋 Historial de conversación</li>
                  </ul>
                </Card>
              </div>

              {syncProgress > 0 && syncProgress < 100 && (
                <div className="space-y-2">
                  <Label>Configurando custom channels...</Label>
                  <Progress value={syncProgress} className="h-2" />
                  <p className="text-sm text-gray-500">{syncProgress}% completado</p>
                </div>
              )}

              <Button onClick={setupCustomChannels} className="w-full" disabled={syncProgress > 0 && syncProgress < 100}>
                {syncProgress === 100 ? 'Custom Channels Configurados ✅' : 'Configurar Custom Channels'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Sincronización */}
        <TabsContent value="sync" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                               <CardTitle className="flex items-center space-x-2">
                 <RotateCcw className="w-5 h-5" />
                 <span>Configuración de Sincronización</span>
               </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sync-contacts">Sincronizar Contactos</Label>
                    <Switch
                      id="sync-contacts"
                      checked={syncSettings.autoSync.contacts}
                      onCheckedChange={(checked) => 
                        setSyncSettings({
                          ...syncSettings,
                          autoSync: { ...syncSettings.autoSync, contacts: checked }
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sync-deals">Sincronizar Negocios</Label>
                    <Switch
                      id="sync-deals"
                      checked={syncSettings.autoSync.deals}
                      onCheckedChange={(checked) => 
                        setSyncSettings({
                          ...syncSettings,
                          autoSync: { ...syncSettings.autoSync, deals: checked }
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sync-conversations">Sincronizar Conversaciones</Label>
                    <Switch
                      id="sync-conversations"
                      checked={syncSettings.autoSync.conversations}
                      onCheckedChange={(checked) => 
                        setSyncSettings({
                          ...syncSettings,
                          autoSync: { ...syncSettings.autoSync, conversations: checked }
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado de Sincronización</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">En cola:</span>
                    <Badge variant="outline">{connectionStatus.queueLength} elementos</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Última sincronización:</span>
                    <span className="text-sm text-gray-500">
                      {connectionStatus.lastSync 
                        ? new Date(connectionStatus.lastSync).toLocaleString()
                        : 'Nunca'
                      }
                    </span>
                  </div>

                  {connectionStatus.syncInProgress && (
                    <div className="space-y-2">
                      <Label>Sincronizando...</Label>
                      <Progress value={syncProgress} className="h-2" />
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button 
                    onClick={() => forceSync('contact')} 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    disabled={connectionStatus.syncInProgress}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Sincronizar Contactos
                  </Button>
                  
                  <Button 
                    onClick={() => forceSync('deal')} 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    disabled={connectionStatus.syncInProgress}
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Sincronizar Negocios
                  </Button>
                  
                  <Button 
                    onClick={() => forceSync('conversation')} 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    disabled={connectionStatus.syncInProgress}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Sincronizar Conversaciones
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña de Webhooks */}
        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Webhook className="w-5 h-5" />
                <span>Configuración de Webhooks</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="webhook-port">Puerto</Label>
                  <Input
                    id="webhook-port"
                    type="number"
                    value={syncSettings.webhooks.port}
                    onChange={(e) => 
                      setSyncSettings({
                        ...syncSettings,
                        webhooks: { ...syncSettings.webhooks, port: parseInt(e.target.value) }
                      })
                    }
                  />
                </div>
                
                <div>
                  <Label htmlFor="webhook-path">Ruta Base</Label>
                  <Input
                    id="webhook-path"
                    value={syncSettings.webhooks.path}
                    onChange={(e) => 
                      setSyncSettings({
                        ...syncSettings,
                        webhooks: { ...syncSettings.webhooks, path: e.target.value }
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="webhooks-enabled">Habilitar Webhooks</Label>
                <Switch
                  id="webhooks-enabled"
                  checked={syncSettings.webhooks.enabled}
                  onCheckedChange={(checked) => 
                    setSyncSettings({
                      ...syncSettings,
                      webhooks: { ...syncSettings.webhooks, enabled: checked }
                    })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">Endpoints de Webhook Configurados:</h4>
                <div className="space-y-2 text-sm font-mono bg-gray-50 p-3 rounded">
                  <div>POST {config.webhookUrl}{syncSettings.webhooks.path}/hubspot/contact-created</div>
                  <div>POST {config.webhookUrl}{syncSettings.webhooks.path}/hubspot/contact-updated</div>
                  <div>POST {config.webhookUrl}{syncSettings.webhooks.path}/hubspot/deal-created</div>
                  <div>POST {config.webhookUrl}{syncSettings.webhooks.path}/hubspot/deal-updated</div>
                  <div>POST {config.webhookUrl}{syncSettings.webhooks.path}/whatsapp/message-received</div>
                  <div>POST {config.webhookUrl}{syncSettings.webhooks.path}/whatsapp/message-sent</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Propiedades */}
        <TabsContent value="properties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Mapeo de Propiedades</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="contacts" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="contacts">Contactos</TabsTrigger>
                  <TabsTrigger value="deals">Negocios</TabsTrigger>
                </TabsList>

                <TabsContent value="contacts">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campo HubSpot</TableHead>
                        <TableHead>Campo WhatsApp</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Requerido</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(syncSettings.mapping.contactFields).map(([hubspotField, whatsappField]) => (
                        <TableRow key={hubspotField}>
                          <TableCell className="font-medium">{hubspotField}</TableCell>
                          <TableCell>{whatsappField}</TableCell>
                          <TableCell>
                            <Badge variant="outline">text</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={hubspotField === 'whatsapp_number' ? 'default' : 'secondary'}>
                              {hubspotField === 'whatsapp_number' ? 'Sí' : 'No'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="deals">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campo HubSpot</TableHead>
                        <TableHead>Campo WhatsApp</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Requerido</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(syncSettings.mapping.dealFields).map(([hubspotField, whatsappField]) => (
                        <TableRow key={hubspotField}>
                          <TableCell className="font-medium">{hubspotField}</TableCell>
                          <TableCell>{whatsappField}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {hubspotField === 'amount' ? 'number' : 'text'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={hubspotField === 'dealname' ? 'default' : 'secondary'}>
                              {hubspotField === 'dealname' ? 'Sí' : 'No'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Test de Conexión */}
      <Dialog open={showTestModal} onOpenChange={setShowTestModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Test de Conexión HubSpot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {testResults ? (
              Object.entries(testResults).map(([key, result]: [string, any]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="font-medium">{key}:</span>
                  <div className="flex items-center space-x-2">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm">{result.message}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Probando conexión...</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowTestModal(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}