import { Layout } from '@/components/Layout';
import { PageHeader } from '@/components/PageHeader';
import { CampaignsPanel } from '@/components/CampaignsPanel';

export default function CampanasPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Campañas"
        subtitle="Gestión y administración de campañas de marketing"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CampaignsPanel />
      </div>
    </div>
  );
} 