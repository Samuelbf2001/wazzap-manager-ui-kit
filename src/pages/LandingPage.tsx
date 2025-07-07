import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Zap, Users, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/conexiones');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
      {/* Header */}
      <header className="w-full p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-900">WhatsFull</div>
          <div className="text-sm text-gray-600">v2.0.0</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo/Title Section */}
          <div className="mb-12">
            <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-6">
              WhatsFull
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-4">
              Sub-Cuenta WhatsApp Manager
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Administra tus conexiones de WhatsApp, automatiza conversaciones con IA 
              y gestiona campañas desde una sola plataforma.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
              <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Conexiones</h3>
              <p className="text-sm text-gray-600">Gestiona múltiples números de WhatsApp</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
              <Zap className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Automatización</h3>
              <p className="text-sm text-gray-600">Flujos inteligentes con IA</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">CRM Integrado</h3>
              <p className="text-sm text-gray-600">Sincronización con HubSpot</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
              <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-sm text-gray-600">Métricas en tiempo real</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="space-y-4">
            <Button 
              onClick={handleStart}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Iniciar
            </Button>
            <p className="text-sm text-gray-500">
              Accede al panel de administración
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full p-6 text-center text-gray-500 text-sm">
        <div className="max-w-7xl mx-auto">
          © 2024 WhatsFull. Sistema de gestión WhatsApp empresarial.
        </div>
      </footer>
    </div>
  );
} 