import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FlowBuilder } from '@/components/FlowBuilder/FlowBuilder';
import { FlowsList } from '@/components/FlowBuilder/FlowsList';
import { CreateFlowModal } from '@/components/FlowBuilder/CreateFlowModal';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { FlowsService } from '@/services/flows.service';
import { FlowData, CreateFlowRequest } from '@/types/flow';

export default function FlowBuilderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'list' | 'builder' | 'viewer'>('list');
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);
  const [currentFlow, setCurrentFlow] = useState<FlowData | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Manejar parámetros de URL al cargar
  useEffect(() => {
    const action = searchParams.get('action'); // 'create', 'edit', 'view'
    const flowId = searchParams.get('flowId');

    if (action === 'create') {
      setCurrentView('builder');
      setCurrentFlowId(null);
      setCurrentFlow(null);
    } else if (action === 'edit' && flowId) {
      const flow = FlowsService.getFlowById(flowId);
      if (flow) {
        setCurrentView('builder');
        setCurrentFlowId(flowId);
        setCurrentFlow(flow);
      } else {
        // Flujo no encontrado, volver a lista
        navigate('/dashboard/constructor', { replace: true });
      }
    } else if (action === 'view' && flowId) {
      const flow = FlowsService.getFlowById(flowId);
      if (flow) {
        setCurrentView('viewer');
        setCurrentFlowId(flowId);
        setCurrentFlow(flow);
      } else {
        // Flujo no encontrado, volver a lista
        navigate('/dashboard/constructor', { replace: true });
      }
    } else {
      // Vista por defecto: lista
      setCurrentView('list');
      setCurrentFlowId(null);
      setCurrentFlow(null);
    }
  }, [searchParams, navigate]);

  // Navegar a lista de flujos
  const goToFlowsList = () => {
    setSearchParams({});
    setCurrentView('list');
    setCurrentFlowId(null);
    setCurrentFlow(null);
  };

  // Navegar a crear nuevo flujo
  const goToCreateFlow = () => {
    setSearchParams({ action: 'create' });
  };

  // Navegar a editar flujo
  const goToEditFlow = (flowId: string) => {
    setSearchParams({ action: 'edit', flowId });
  };

  // Navegar a ver flujo
  const goToViewFlow = (flowId: string) => {
    setSearchParams({ action: 'view', flowId });
  };

  // Manejar creación de flujo
  const handleCreateFlow = async (data: CreateFlowRequest) => {
    try {
      const newFlow = FlowsService.createFlow(data);
      // Navegar al editor del nuevo flujo
      setSearchParams({ action: 'edit', flowId: newFlow.id });
    } catch (error) {
      console.error('Error al crear flujo:', error);
    }
  };

  // Mostrar modal de crear flujo
  const handleShowCreateModal = () => {
    setShowCreateModal(true);
  };

  // Obtener título y subtítulo según la vista actual
  const getPageTitle = () => {
    switch (currentView) {
      case 'builder':
        if (currentFlow) {
          return {
            title: `Editando: ${currentFlow.name}`,
            subtitle: 'Diseña y modifica tu flujo de conversación'
          };
        } else {
          return {
            title: 'Nuevo Flujo',
            subtitle: 'Diseña tu flujo de conversación automatizado'
          };
        }
      case 'viewer':
        return {
          title: `Visualizando: ${currentFlow?.name || 'Flujo'}`,
          subtitle: 'Vista de solo lectura del flujo'
        };
      default:
        return {
          title: 'Constructor de Flujos',
          subtitle: 'Diseña y gestiona flujos de conversación automatizados'
        };
    }
  };

  const { title, subtitle } = getPageTitle();

  // Vista de lista de flujos
  if (currentView === 'list') {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title={title}
          subtitle={subtitle}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <FlowsList
            onCreateNew={handleShowCreateModal}
            onEditFlow={goToEditFlow}
            onViewFlow={goToViewFlow}
          />
        </div>

        {/* Modal de crear flujo */}
        <CreateFlowModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateFlow={handleCreateFlow}
        />
      </div>
    );
  }

  // Vista del constructor/editor o visualizador
  return (
    <div className="h-screen w-full overflow-hidden bg-gray-50 flex flex-col">
      <PageHeader 
        title={title}
        subtitle={subtitle}
        action={
          <Button 
            variant="outline" 
            onClick={goToFlowsList}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Lista
          </Button>
        }
      />
      <div className="flex-1 overflow-hidden">
        <FlowBuilder 
          flowId={currentFlowId}
          initialFlow={currentFlow}
          mode={currentView === 'viewer' ? 'readonly' : 'edit'}
        />
      </div>
    </div>
  );
} 