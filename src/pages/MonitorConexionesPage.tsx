import { PageHeader } from '@/components/PageHeader';
import { HubSpotConnectionsPanel } from '@/components/HubSpotConnectionsPanel';
import { getHubSpotAuth } from '@/lib/hubspotApi';

export default function MonitorConexionesPage() {
  const hubAuth = getHubSpotAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Monitor de Conexiones"
        subtitle={
          hubAuth
            ? `Estado en tiempo real vía EvolutionAPI · Portal ${hubAuth.portalId}`
            : 'Estado en tiempo real de conexiones WhatsApp'
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <HubSpotConnectionsPanel />
      </div>
    </div>
  );
}