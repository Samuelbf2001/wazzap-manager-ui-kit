import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from "./SidebarContext";
import {
  MessageSquare,
  Settings,
  Activity,
  Database,
  Megaphone,
  CreditCard,
  Brain,
  Building2,
  Mail,
  GitBranch,
  Menu,
  ChevronLeft,
  X,
  Play
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
}

/**
 * Componente Sidebar Responsivo
 * 
 * Barra lateral de navegación que se adapta a diferentes tamaños de pantalla:
 * - Desktop: Sidebar fijo, colapsable
 * - Tablet: Sidebar overlay, deslizable
 * - Mobile: Sidebar overlay, menú hamburguesa
 */
export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { 
    isCollapsed, 
    isMobile, 
    isOpen, 
    toggleCollapse, 
    toggleOpen 
  } = useSidebar();

  // Configuración de los elementos del menú
  const menuItems = [
    {
      id: 'connections',
      icon: MessageSquare,
      label: 'Conexiones',
      description: 'Gestiona conexiones de WhatsApp'
    },
    {
      id: 'configuration', 
      icon: Settings,
      label: 'Configuración',
      description: 'Configuración general del sistema'
    },
    {
      id: 'logs',
      icon: Activity,
      label: 'Registros',
      description: 'Logs y actividad del sistema'
    },
    {
      id: 'properties',
      icon: Database,
      label: 'Propiedades',
      description: 'Propiedades de contactos y datos'
    },
    {
      id: 'campañas',
      icon: Megaphone,
      label: 'Campañas',
      description: 'Campañas de marketing'
    },
    {
      id: 'flujos',
      icon: GitBranch,
      label: 'Constructor de Flujos',
      description: 'Diseña flujos de conversación'
    },
    {
      id: 'demo',
      icon: Play,
      label: 'Demo Flujos',
      description: 'Demostración del sistema de flujos'
    },
    {
      id: 'suscripcion',
      icon: CreditCard,
      label: 'Suscripción',
      description: 'Gestión de suscripción y facturación'
    },
    {
      id: 'whatsia',
      icon: Brain,
      label: 'WhatsIA',
      description: 'Asistente de inteligencia artificial'
    },
    {
      id: 'hubspot',
      icon: Building2,
      label: 'HubSpot',
      description: 'Integración con HubSpot CRM'
    },
    {
      id: 'mensajes',
      icon: Mail,
      label: 'Mensajes',
      description: 'Gestión de mensajes y conversaciones'
    }
  ];

  const handleMenuItemClick = (itemId: string) => {
    onTabChange(itemId);
    
    // En móvil, cerrar el sidebar después de seleccionar
    if (isMobile) {
      toggleOpen();
    }
  };

  // Overlay para móvil
  const renderOverlay = () => {
    if (!isMobile || !isOpen) return null;
    
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={toggleOpen}
      />
    );
  };

  // Obtener clases CSS responsivas
  const getSidebarClasses = () => {
    let classes = "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-50";
    
    if (isMobile) {
      // Móvil: Sidebar overlay
      classes += ` ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-64`;
    } else {
      // Desktop: Sidebar fijo
      classes += ` ${isCollapsed ? 'w-16' : 'w-64'}`;
    }
    
    return classes;
  };

  const getToggleButton = () => {
    if (isMobile) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleOpen}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-4 w-4" />
        </Button>
      );
    }
    
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleCollapse}
        className={`
          p-2 hover:bg-gray-100 rounded-lg transition-colors
          ${isCollapsed ? 'w-8 h-8' : ''}
        `}
      >
        {isCollapsed ? (
          <Menu className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    );
  };

  return (
    <TooltipProvider>
      {renderOverlay()}
      
      <aside className={getSidebarClasses()}>
        {/* Header */}
        <div className={`p-6 flex items-center justify-between ${(isCollapsed && !isMobile) ? 'px-3' : ''}`}>
          {(!isCollapsed || isMobile) && (
            <h1 className="text-2xl font-bold text-gray-900">WhatsFull</h1>
          )}
          
          {getToggleButton()}
        </div>

        {/* Navegación */}
        <nav className={`${(isCollapsed && !isMobile) ? 'px-1' : 'px-4'} space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto`}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            
            const buttonContent = (
              <Button
                variant={activeTab === item.id ? 'secondary' : 'ghost'}
                className={`
                  w-full transition-all duration-200
                  ${(isCollapsed && !isMobile)
                    ? 'justify-center px-2 py-2 mx-auto' 
                    : 'justify-start'
                  }
                  ${activeTab === item.id 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'hover:bg-gray-50'
                  }
                `}
                onClick={() => handleMenuItemClick(item.id)}
              >
                <IconComponent className={`h-4 w-4 ${(!isCollapsed || isMobile) ? 'mr-2' : ''}`} />
                {(!isCollapsed || isMobile) && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Button>
            );

            // Si está colapsado en desktop, mostrar tooltip
            if (isCollapsed && !isMobile) {
              return (
                <Tooltip key={item.id} delayDuration={0}>
                  <TooltipTrigger asChild>
                    {buttonContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.id}>{buttonContent}</div>;
          })}
        </nav>

        {/* Footer info cuando está expandido */}
        {(!isCollapsed || isMobile) && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">WhatsApp Manager</div>
              <div className="text-xs text-gray-500">v2.0.0</div>
              <div className="text-xs text-gray-400 mt-1">
                {isMobile ? 'Móvil' : isCollapsed ? 'Colapsado' : 'Expandido'}
              </div>
            </div>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
