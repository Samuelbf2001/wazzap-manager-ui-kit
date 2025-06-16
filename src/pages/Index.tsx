import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricsCards } from "@/components/MetricsCards";
import { ConnectionsTable } from "@/components/ConnectionsTable";
import { ConfigurationPanel } from "@/components/ConfigurationPanel";
import { LogsPanel } from "@/components/LogsPanel";
import { WhatsAppConnectionModal } from "@/components/WhatsAppConnectionModal";
import { Button } from "@/components/ui/button";
import PropertiesPage from "../components/PropertiesPage";
import { WhatsIAStatsPanel } from "@/components/WhatsIAStatsPanel";
import { SubscriptionPanel } from "@/components/SubscriptionPanel";
import { CampaignsPanel } from "@/components/CampaignsPanel";
import { HubSpotIntegration } from "@/components/HubSpotIntegration";
import { MessageManager } from "@/components/MessageManager";

type ActiveTab = 'connections' | 'configuration' | 'logs' | 'properties' | 'campañas' | 'suscripcion' | 'whatsia' | 'hubspot' | 'mensajes';

const Index = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('connections');
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'connections':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Conexiones</h2>
              <Button onClick={() => setShowConnectionModal(true)}>
                + Nueva conexión
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
      case 'whatsia':
        return <WhatsIAStatsPanel />;
      case 'hubspot':
        return <HubSpotIntegration />;
      case 'mensajes':
        return <MessageManager />;
      default:
        return null;
    }
  };

  const handleConnectionSuccess = () => {
    console.log('Conexión exitosa - actualizar tabla');
  };

  const handleConnectClick = () => {
    setShowConnectionModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="pl-64">
        <main className="min-h-screen">
          <DashboardHeader onConnectClick={handleConnectClick} />
          
          <div className="max-w-7xl mx-auto">
            {activeTab === 'connections' && <MetricsCards />}
            
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
      
      {activeTab === 'connections' && (
        <div className="fixed bottom-8 right-8">
          <Button 
            onClick={handleConnectClick}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
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
};

export default Index;
