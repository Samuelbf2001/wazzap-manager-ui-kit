
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  onConnectClick: () => void;
}

export function DashboardHeader({ onConnectClick }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sub-Cuenta Wazzap</h1>
          <p className="text-gray-600 mt-1">Administra tus conexiones de WhatsApp</p>
        </div>
        
        <Button 
          onClick={onConnectClick}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          + Conectar WhatsApp
        </Button>
      </div>
    </header>
  );
}
