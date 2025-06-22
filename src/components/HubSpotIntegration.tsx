import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { HubSpotProperties } from './HubSpotProperties';
import { HubSpotContacts } from './HubSpotContacts';
import { HubSpotCompanies } from './HubSpotCompanies';
import { HubSpotDeals } from './HubSpotDeals';
import HubSpotService from '@/services/hubspot.service';
import { HubSpotOAuthConfig } from '@/services/hubspot-oauth.service';
import { CheckCircle, XCircle, Settings, ExternalLink, AlertCircle } from 'lucide-react';

interface HubSpotConfig {
  // OAuth Configuration
  oauth?: HubSpotOAuthConfig;
  // Legacy API Key (for backwards compatibility)
  apiKey?: string;
  portalId?: string;
}

const DEFAULT_SCOPES = [
  'crm.objects.contacts.read',
  'crm.objects.contacts.write',
  'crm.objects.companies.read',
  'crm.objects.companies.write',
  'crm.objects.deals.read',
  'crm.objects.deals.write',
  'crm.schemas.contacts.read',
  'crm.schemas.contacts.write',
  'crm.schemas.companies.read',
  'crm.schemas.companies.write',
  'crm.schemas.deals.read',
  'crm.schemas.deals.write'
];

export function HubSpotIntegration() {
  const [activeTab, setActiveTab] = useState('contacts');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [authMethod, setAuthMethod] = useState<'oauth' | 'apikey'>('oauth');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hubspotService, setHubspotService] = useState<HubSpotService | null>(null);
  const [authStatus, setAuthStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const [config, setConfig] = useState<HubSpotConfig>({
    oauth: {
      clientId: '',
      clientSecret: '',
      redirectUri: `${window.location.origin}/hubspot/callback`,
      scopes: DEFAULT_SCOPES
    },
    apiKey: '',
    portalId: ''
  });

  useEffect(() => {
    // Cargar configuración desde localStorage
    loadConfigFromStorage();
    
    // Verificar si estamos en el callback de OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code) {
      handleOAuthCallback(code, state);
    }
  }, []);

  const loadConfigFromStorage = () => {
    try {
      const storedConfig = localStorage.getItem('hubspot_config');
      if (storedConfig) {
        const parsedConfig = JSON.parse(storedConfig);
        setConfig(parsedConfig);
        
        // Inicializar servicio si hay configuración
        if (parsedConfig.oauth?.clientId || parsedConfig.apiKey) {
          const service = new HubSpotService(parsedConfig);
          setHubspotService(service);
          setIsAuthenticated(service.isAuthenticated());
        }
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  const handleOAuthCallback = async (code: string, state: string | null) => {
    if (!hubspotService) {
      setErrorMessage('Servicio de HubSpot no inicializado');
      return;
    }

    try {
      setAuthStatus('loading');
      await hubspotService.handleAuthorizationCallback(code);
      setIsAuthenticated(true);
      setAuthStatus('success');
      
      // Limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Error en callback OAuth:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error de autenticación');
      setAuthStatus('error');
    }
  };

  const handleOAuthLogin = () => {
    if (!hubspotService) {
      setErrorMessage('Servicio de HubSpot no inicializado. Configure primero los datos de OAuth.');
      return;
    }

    try {
      const authUrl = hubspotService.getAuthorizationUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error iniciando OAuth:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error iniciando autenticación');
    }
  };

  const handleDisconnect = async () => {
    if (!hubspotService) return;

    try {
      await hubspotService.disconnect();
      setIsAuthenticated(false);
      setAuthStatus('idle');
    } catch (error) {
      console.error('Error desconectando:', error);
      setErrorMessage('Error al desconectar de HubSpot');
    }
  };

  const handleConfigSave = () => {
    try {
      // Validar configuración
      if (authMethod === 'oauth') {
        if (!config.oauth?.clientId || !config.oauth?.clientSecret) {
          setErrorMessage('Client ID y Client Secret son requeridos para OAuth');
          return;
        }
      } else {
        if (!config.apiKey) {
          setErrorMessage('API Key es requerida');
          return;
        }
      }

      // Guardar configuración
      localStorage.setItem('hubspot_config', JSON.stringify(config));
      
      // Inicializar servicio
      const service = new HubSpotService(config);
      setHubspotService(service);
      setIsAuthenticated(service.isAuthenticated());
      
      setShowConfigModal(false);
      setErrorMessage('');
    } catch (error) {
      console.error('Error guardando configuración:', error);
      setErrorMessage('Error guardando la configuración');
    }
  };

  const handlePropertySelect = (property: any) => {
    console.log('Propiedad seleccionada:', property);
  };

  const handleContactSelect = (contact: any) => {
    console.log('Contacto seleccionado:', contact);
  };

  const handleCompanySelect = (company: any) => {
    console.log('Empresa seleccionada:', company);
  };

  const handleDealSelect = (deal: any) => {
    console.log('Negocio seleccionado:', deal);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Integración con HubSpot</h1>
          <p className="text-muted-foreground">
            Conecta tu cuenta de HubSpot usando OAuth 2.0 para una integración segura
          </p>
        </div>
        <div className="flex gap-2">
          {isAuthenticated ? (
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Conectado
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-500" />
              Desconectado
            </Badge>
          )}
          <Button variant="outline" onClick={() => setShowConfigModal(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
        </div>
      </div>

      {/* Estado de autenticación */}
      {!isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Autenticación Requerida
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hubspotService ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Para acceder a tus datos de HubSpot, necesitas autenticarte primero.
                </p>
                <Button onClick={handleOAuthLogin} className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Conectar con HubSpot
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Configura tu integración con HubSpot para comenzar.
                </p>
                <Button onClick={() => setShowConfigModal(true)}>
                  Configurar HubSpot
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mensaje de error */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Contenido principal - solo mostrar si está autenticado */}
      {isAuthenticated && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="contacts">Contactos</TabsTrigger>
            <TabsTrigger value="companies">Empresas</TabsTrigger>
            <TabsTrigger value="deals">Negocios</TabsTrigger>
            <TabsTrigger value="properties">Propiedades</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts">
            <HubSpotContacts onContactSelect={handleContactSelect} />
          </TabsContent>

          <TabsContent value="companies">
            <HubSpotCompanies onCompanySelect={handleCompanySelect} />
          </TabsContent>

          <TabsContent value="deals">
            <HubSpotDeals onDealSelect={handleDealSelect} />
          </TabsContent>

          <TabsContent value="properties">
            <HubSpotProperties onPropertySelect={handlePropertySelect} />
          </TabsContent>
        </Tabs>
      )}

      {/* Modal de configuración */}
      <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configuración de HubSpot</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Selector de método de autenticación */}
            <div className="space-y-2">
              <Label>Método de Autenticación</Label>
              <div className="flex gap-4">
                <Button
                  variant={authMethod === 'oauth' ? 'default' : 'outline'}
                  onClick={() => setAuthMethod('oauth')}
                  className="flex-1"
                >
                  OAuth 2.0 (Recomendado)
                </Button>
                <Button
                  variant={authMethod === 'apikey' ? 'default' : 'outline'}
                  onClick={() => setAuthMethod('apikey')}
                  className="flex-1"
                >
                  API Key (Legacy)
                </Button>
              </div>
            </div>

            <Separator />

            {/* Configuración OAuth */}
            {authMethod === 'oauth' && (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    OAuth 2.0 es el método más seguro y recomendado para conectar con HubSpot.
                    Necesitarás crear una aplicación en HubSpot Developer Portal.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>Client ID *</Label>
                    <Input
                      value={config.oauth?.clientId || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        oauth: { ...config.oauth!, clientId: e.target.value }
                      })}
                      placeholder="Tu Client ID de HubSpot"
                    />
                  </div>
                  
                  <div>
                    <Label>Client Secret *</Label>
                    <Input
                      type="password"
                      value={config.oauth?.clientSecret || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        oauth: { ...config.oauth!, clientSecret: e.target.value }
                      })}
                      placeholder="Tu Client Secret de HubSpot"
                    />
                  </div>
                  
                  <div>
                    <Label>Redirect URI</Label>
                    <Input
                      value={config.oauth?.redirectUri || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        oauth: { ...config.oauth!, redirectUri: e.target.value }
                      })}
                      placeholder={`${window.location.origin}/hubspot/callback`}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Configura esta URL en tu aplicación de HubSpot
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Configuración API Key */}
            {authMethod === 'apikey' && (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertDescription>
                    ⚠️ Las API Keys están siendo descontinuadas por HubSpot. Se recomienda usar OAuth 2.0.
                  </AlertDescription>
                </Alert>
                
                <div>
                  <Label>API Key *</Label>
                  <Input
                    type="password"
                    value={config.apiKey || ''}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    placeholder="Ingresa tu API Key de HubSpot"
                  />
                </div>
                
                <div>
                  <Label>Portal ID</Label>
                  <Input
                    value={config.portalId || ''}
                    onChange={(e) => setConfig({ ...config, portalId: e.target.value })}
                    placeholder="Ingresa tu Portal ID de HubSpot"
                  />
                </div>
              </div>
            )}

            {/* Acciones del usuario autenticado */}
            {isAuthenticated && (
              <div className="space-y-4">
                <Separator />
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Cuenta Conectada</p>
                    <p className="text-sm text-muted-foreground">
                      Tu cuenta de HubSpot está conectada correctamente
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleDisconnect}>
                    Desconectar
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfigSave}>
              Guardar Configuración
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 