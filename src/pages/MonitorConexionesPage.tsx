import { Layout } from '@/components/Layout';
import { PageHeader } from '@/components/PageHeader';
import { ConnectionMonitorPanel } from '@/components/ConnectionMonitorPanel';

export default function MonitorConexionesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Monitor de Conexiones"
        subtitle="Monitor en tiempo real de conexiones activas de WhatsApp"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ConnectionMonitorPanel />
      </div>
    </div>
  );
} 