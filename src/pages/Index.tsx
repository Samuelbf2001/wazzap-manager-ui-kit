
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricsCards } from "@/components/MetricsCards";
import { ConnectionsTable } from "@/components/ConnectionsTable";
import { ConfigurationPanel } from "@/components/ConfigurationPanel";
import { LogsPanel } from "@/components/LogsPanel";
import { Button } from "@/components/ui/button";

type ActiveTab = 'connections' | 'configuration' | 'logs';

const Index = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('connections');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'connections':
        return <ConnectionsTable />;
      case 'configuration':
        return <ConfigurationPanel />;
      case 'logs':
        return <LogsPanel />;
      default:
        return <ConnectionsTable />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <MetricsCards />
            
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('connections')}
                    className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'connections'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Conexiones
                  </button>
                  <button
                    onClick={() => setActiveTab('configuration')}
                    className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'configuration'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Configuración
                  </button>
                  <button
                    onClick={() => setActiveTab('logs')}
                    className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'logs'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Registros
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {renderActiveTab()}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Floating Action Button */}
      {activeTab === 'connections' && (
        <div className="fixed bottom-8 right-8">
          <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 shadow-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;
