import { Layout } from '@/components/Layout';
import { PageHeader } from '@/components/PageHeader';
import { SubscriptionPanel } from '@/components/SubscriptionPanel';

export default function SuscripcionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Suscripción"
        subtitle="Gestión de suscripción y configuración de planes"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SubscriptionPanel />
      </div>
    </div>
  );
} 