import { Layout } from '@/components/Layout';
import { PageHeader } from '@/components/PageHeader';
import { HubSpotIntegration } from '@/components/HubSpotIntegration';

export default function HubSpotPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="HubSpot"
        subtitle="Integración y sincronización con HubSpot CRM"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <HubSpotIntegration />
      </div>
    </div>
  );
} 