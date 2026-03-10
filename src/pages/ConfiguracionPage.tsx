import { Layout } from '@/components/Layout';
import { PageHeader } from '@/components/PageHeader';
import { ConfigurationPanel } from '@/components/ConfigurationPanel';

export default function ConfiguracionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Configuración"
        subtitle="Configuración general del sistema y parámetros"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ConfigurationPanel />
      </div>
    </div>
  );
} 