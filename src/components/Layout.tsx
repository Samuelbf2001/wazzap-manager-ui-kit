import React from 'react';
import { Sidebar } from './Sidebar';
import { SidebarProvider, useSidebar } from './SidebarContext';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

// Componente interno que usa el contexto del sidebar
function LayoutContent({ children }: LayoutProps) {
  const { isCollapsed, isMobile, isOpen, toggleOpen } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determinar el tab activo basado en la ruta actual
  const getActiveTabFromPath = (pathname: string) => {
    if (pathname === '/dashboard/whatsapp-ai') return 'whatsapp-ai';
    if (pathname === '/dashboard/ai-review') return 'ai-review';
    if (pathname === '/dashboard/bandeja') return 'bandeja';
    if (pathname === '/dashboard/constructor') return 'constructor';
    if (pathname === '/dashboard/propiedades') return 'properties';
    if (pathname === '/dashboard/hubspot-inbox') return 'hubspot';
    return 'connections'; // Default
  };

  const activeTab = getActiveTabFromPath(location.pathname);

  // Función dummy para el sidebar (no necesitamos cambio de tab aquí)
  const handleTabChange = (tab: string) => {
    // El sidebar se encarga de la navegación directamente
  };

  // Función para manejar click en el logo
  const handleLogoClick = () => {
    console.log('🏠 Logo clickeado desde Layout, navegando al inicio');
    navigate('/');
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
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} onLogoClick={handleLogoClick} />
      
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

        {/* Contenido principal */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}

// Componente principal que provee el contexto
export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
} 