import { Layout } from '@/components/Layout';
import { PageHeader } from '@/components/PageHeader';
import { FlowExecutionDemo } from '@/components/FlowExecutionDemo';

export default function DemoFlujosPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader 
        title="Demo de Flujos"
        subtitle="Demostración y testing del sistema de flujos de conversación"
      />
      
      <div className="flex-1 overflow-hidden">
        <FlowExecutionDemo />
      </div>
    </div>
  );
} 