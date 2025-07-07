import { Layout } from '@/components/Layout';
import { PageHeader } from '@/components/PageHeader';
import { MessageManager } from '@/components/MessageManager';

export default function MensajesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Mensajes"
        subtitle="Gestión de mensajes y conversaciones de WhatsApp"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <MessageManager />
      </div>
    </div>
  );
} 