import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { SidebarProvider, useSidebar } from "@/components/SidebarContext";
import { MetricsCards } from "@/components/MetricsCards";
import { ConnectionsTable } from "@/components/ConnectionsTable";
import { WhatsAppConnectionModal } from "@/components/WhatsAppConnectionModal";
import { Button } from "@/components/ui/button";
import { Menu, Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

// Componente interno que usa el contexto del sidebar
function DashboardContent() {
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const { isCollapsed, isMobile, isOpen, toggleOpen } = useSidebar();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Conexiones"
        subtitle="Gestiona conexiones de WhatsApp y su estado actual"
      />
      
      <Sidebar activeTab="connections" onTabChange={() => {}} />
    
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <MetricsCards />
            
            <div className="py-6">
              <div className="w-full overflow-hidden">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <h2 className="text-2xl font-bold">Números de WhatsApp Conectados</h2>
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
              </div>
            </div>
          </div>
        </main>
      </div>

      <WhatsAppConnectionModal
        open={showConnectionModal}
        onOpenChange={setShowConnectionModal}
        onConnectionSuccess={handleConnectionSuccess}
      />
    </div>
  );
}

// Componente principal que provee el contexto
const DashboardPage = () => {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
};

export default DashboardPage; 