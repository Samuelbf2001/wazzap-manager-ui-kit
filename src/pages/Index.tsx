import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { SidebarProvider, useSidebar } from "@/components/SidebarContext";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricsCards } from "@/components/MetricsCards";
import { ConnectionsTable } from "@/components/ConnectionsTable";
import { ConfigurationPanel } from "@/components/ConfigurationPanel";
import { LogsPanel } from "@/components/LogsPanel";
import { WhatsAppConnectionModal } from "@/components/WhatsAppConnectionModal";
import { Button } from "@/components/ui/button";
import PropertiesPage from "../components/PropertiesPage";
import { SubscriptionPanel } from "@/components/SubscriptionPanel";
import { CampaignsPanel } from "@/components/CampaignsPanel";
import { HubSpotIntegration } from "@/components/HubSpotIntegration";
import { MessageManager } from "@/components/MessageManager";
import { FlowBuilder } from "@/components/FlowBuilder/FlowBuilder";
import { FlowExecutionDemo } from "@/components/FlowExecutionDemo";
import { LiveInbox } from "@/components/LiveInbox";
import { Menu, Plus } from "lucide-react";

type ActiveTab = 'connections' | 'configuration' | 'logs' | 'properties' | 'campañas' | 'suscripcion' | 'hubspot' | 'mensajes' | 'flujos' | 'demo' | 'bandeja';

// Componente interno que usa el contexto del sidebar
function IndexContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('connections');
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const { isCollapsed, isMobile, isOpen, toggleOpen } = useSidebar();

  const renderContent = () => {
    switch (activeTab) {
      case 'connections':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h2 className="text-2xl font-bold">Conexiones</h2>
              <Button 
                onClick={() => setShowConnectionModal(true)}
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva conexión
              </Button>
            </div>
            <ConnectionsTable />
          </div>
        );
      case 'configuration':
        return <ConfigurationPanel />;
      case 'logs':
        return <LogsPanel />;
      case 'properties':
        return <PropertiesPage />;
      case 'campañas':
        return <CampaignsPanel />;
      case 'suscripcion':
        return <SubscriptionPanel />;

      case 'hubspot':
        return <HubSpotIntegration />;
      case 'mensajes':
        return <MessageManager />;
      case 'flujos':
        return <FlowBuilder />;
      case 'demo':
        return <FlowExecutionDemo />;
      case 'bandeja':
        return <LiveInbox />;
      default:
        return null;
    }
  };

  // Verificar si la pestaña actual necesita altura completa
  const isFullHeightTab = activeTab === 'flujos' || activeTab === 'demo' || activeTab === 'bandeja';

  const handleConnectionSuccess = () => {
    console.log('Conexión exitosa - actualizar tabla');
  };

  const handleConnectClick = () => {
    setShowConnectionModal(true);
  };

  // Calcular el margen izquierdo basado en el estado del sidebar
  const getMainContentClasses = () => {
    if (isMobile) {
      return "w-full"; // En móvil, ocupar todo el ancho
    }
    return isCollapsed ? "ml-16" : "ml-64"; // En desktop, ajustar según sidebar
  };

  // Renderizado especial para tabs de altura completa
  if (isFullHeightTab) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className={`flex-1 flex flex-col transition-all duration-300 ${getMainContentClasses()}`}>
          {/* Header móvil con botón de menú */}
          {isMobile && (
            <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleOpen}
                className="p-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">WhatsFull</h1>
              <div className="w-9" /> {/* Spacer para centrar el título */}
            </div>
          )}

          {/* Contenido de altura completa */}
          <div className="flex-1 overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className={`transition-all duration-300 ${getMainContentClasses()}`}>
        {/* Header móvil con botón de menú */}
        {isMobile && (
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleOpen}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">WhatsFull</h1>
            <div className="w-9" /> {/* Spacer para centrar el título */}
          </div>
        )}

        <main className="min-h-screen">
          <DashboardHeader onConnectClick={handleConnectClick} />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {activeTab === 'connections' && <MetricsCards />}
            
            <div className="py-6">
              <div className="w-full overflow-hidden">
                {renderContent()}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Botón flotante para nueva conexión - solo en connections */}
      {activeTab === 'connections' && (
        <div className="fixed bottom-8 right-8 z-30">
          <Button 
            onClick={handleConnectClick}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      )}

      <WhatsAppConnectionModal
        open={showConnectionModal}
        onOpenChange={setShowConnectionModal}
        onConnectionSuccess={handleConnectionSuccess}
      />
    </div>
  );
}

// Componente principal que provee el contexto
const Index = () => {
  return (
    <SidebarProvider>
      <IndexContent />
    </SidebarProvider>
  );
};

export default Index;
