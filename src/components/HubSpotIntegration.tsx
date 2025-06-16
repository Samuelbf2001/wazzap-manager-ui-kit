import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { HubSpotProperties } from './HubSpotProperties';
import { HubSpotContacts } from './HubSpotContacts';
import { HubSpotCompanies } from './HubSpotCompanies';
import { HubSpotDeals } from './HubSpotDeals';

interface HubSpotConfig {
  apiKey: string;
  portalId: string;
}

export function HubSpotIntegration() {
  const [activeTab, setActiveTab] = useState('contacts');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [config, setConfig] = useState<HubSpotConfig>({
    apiKey: '',
    portalId: ''
  });

  const handleConfigSave = () => {
    // Aquí iría la lógica para guardar la configuración
    localStorage.setItem('hubspot_config', JSON.stringify(config));
    setShowConfigModal(false);
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
        <h1 className="text-2xl font-bold">Integración con HubSpot</h1>
        <Button onClick={() => setShowConfigModal(true)}>
          Configurar HubSpot
        </Button>
      </div>

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

      <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuración de HubSpot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>API Key</Label>
              <Input
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="Ingresa tu API Key de HubSpot"
                type="password"
              />
            </div>
            <div>
              <Label>Portal ID</Label>
              <Input
                value={config.portalId}
                onChange={(e) => setConfig({ ...config, portalId: e.target.value })}
                placeholder="Ingresa tu Portal ID de HubSpot"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleConfigSave}>Guardar configuración</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 