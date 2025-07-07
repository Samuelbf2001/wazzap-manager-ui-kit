import { Layout } from '@/components/Layout';
import { PageHeader } from '@/components/PageHeader';
import { LogsPanel } from '@/components/LogsPanel';

export default function RegistrosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Registros"
        subtitle="Logs y actividad del sistema en tiempo real"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <LogsPanel />
      </div>
    </div>
  );
} 