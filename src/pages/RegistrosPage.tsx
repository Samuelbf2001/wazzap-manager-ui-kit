import { PageHeader } from '@/components/PageHeader';
import { HubSpotLogsPanel } from '@/components/HubSpotLogsPanel';
import { getHubSpotAuth } from '@/lib/hubspotApi';

export default function RegistrosPage() {
  const hubAuth = getHubSpotAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Registros"
        subtitle={
          hubAuth
            ? `Mensajes WhatsApp ↔ HubSpot · Portal ${hubAuth.portalId}`
            : 'Registros de mensajes WhatsApp ↔ HubSpot'
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <HubSpotLogsPanel />
      </div>
    </div>
  );
}