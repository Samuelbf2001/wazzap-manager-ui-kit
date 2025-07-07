import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from "./SidebarContext";
import { useNavigate, useLocation } from "react-router-dom";
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
  Play,
  Bot,
  ShieldCheck,
  MonitorSpeaker
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  onLogoClick?: () => void;
}

/**
 * Componente Sidebar Responsivo
 * 
 * Barra lateral de navegación que se adapta a diferentes tamaños de pantalla:
 * - Desktop: Sidebar fijo, colapsable
 * - Tablet: Sidebar overlay, deslizable
 * - Mobile: Sidebar overlay, menú hamburguesa
 */
export function Sidebar({ activeTab, onTabChange, onLogoClick }: SidebarProps) {
  const { 
    isCollapsed, 
    isMobile, 
    isOpen, 
    toggleCollapse, 
    toggleOpen 
  } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Función para determinar qué elemento está activo basándose en la ruta actual
  const getActiveItemId = (): string => {
    const pathname = location.pathname;
    
    // Mapear rutas a IDs de elementos del menú
    const routeToIdMap: { [key: string]: string } = {
      '/': '', // Página de bienvenida - no hay elemento activo
      '/conexiones': 'connections',
      '/registros': 'logs', 
      '/monitor-conexiones': 'monitor',
      '/propiedades': 'properties',
      '/campanas': 'campañas',
      '/constructor': 'flujos',
      '/demo-flujos': 'demo',
      '/suscripcion': 'suscripcion',
      '/hubspot': 'hubspot',
      '/mensajes': 'mensajes',
      '/bandeja': 'bandeja',
      '/whatsapp-ai': 'whatsapp-ai',
      '/ai-review': 'ai-review',
      '/configuracion': 'configuration'
    };

    return routeToIdMap[pathname] || ''; // Retorna string vacío si no encuentra la ruta
  };

  // Configuración de los elementos del menú
  const menuItems: Array<{
    id: string;
    icon: any;
    label: string;
    description: string;
    href?: string;
  }> = [
    {
      id: 'connections',
      icon: MessageSquare,
      label: 'Conexiones',
      description: 'Gestiona conexiones de WhatsApp',
      href: '/conexiones'
    },
    {
      id: 'logs',
      icon: Activity,
      label: 'Registros',
      description: 'Logs y actividad del sistema',
      href: '/registros'
    },
    {
      id: 'monitor',
      icon: MonitorSpeaker,
      label: 'Monitor Conexiones',
      description: 'Monitor en tiempo real de conexiones activas',
      href: '/monitor-conexiones'
    },
    {
      id: 'properties',
      icon: Database,
      label: 'Propiedades',
      description: 'Propiedades de contactos y datos',
      href: '/propiedades'
    },
    {
      id: 'campañas',
      icon: Megaphone,
      label: 'Campañas',
      description: 'Campañas de marketing',
      href: '/campanas'
    },
    {
      id: 'flujos',
      icon: GitBranch,
      label: 'Constructor de Flujos',
      description: 'Diseña flujos de conversación',
      href: '/constructor'
    },
    {
      id: 'demo',
      icon: Play,
      label: 'Demo Flujos',
      description: 'Demostración del sistema de flujos',
      href: '/demo-flujos'
    },
    {
      id: 'suscripcion',
      icon: CreditCard,
      label: 'Suscripción',
      description: 'Gestión de suscripción y facturación',
      href: '/suscripcion'
    },
    {
      id: 'hubspot',
      icon: Building2,
      label: 'HubSpot',
      description: 'Integración con HubSpot CRM',
      href: '/hubspot'
    },
    {
      id: 'mensajes',
      icon: Mail,
      label: 'Mensajes',
      description: 'Gestión de mensajes y conversaciones',
      href: '/mensajes'
    },
    {
      id: 'bandeja',
      icon: MessageSquare,
      label: 'Bandeja de Entrada',
      description: 'Conversaciones en vivo y chat en tiempo real',
      href: '/bandeja'
    },
    {
      id: 'whatsapp-ai',
      icon: Bot,
      label: 'WhatsApp AI Manager',
      description: 'Centro unificado de agentes IA y automatización WhatsApp',
      href: '/whatsapp-ai'
    },
    {
      id: 'ai-review',
      icon: ShieldCheck,
      label: 'Revisión IA',
      description: 'Dashboard para revisar y aprobar mejoras de respuestas IA',
      href: '/ai-review'
    },
    {
      id: 'configuration', 
      icon: Settings,
      label: 'Configuración',
      description: 'Configuración general del sistema',
      href: '/configuracion'
    }
  ];

  const handleMenuItemClick = (itemId: string, event?: React.MouseEvent) => {
    // Prevenir comportamientos por defecto
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log('🔧 Sidebar: Click en item:', itemId);

    // Buscar el item para obtener su href
    const item = menuItems.find(i => i.id === itemId);
    
    if (item && item.href) {
      // Navegar a la ruta específica
      console.log('🔧 Sidebar: Navegando a:', item.href);
      navigate(item.href);
    }
    
    // En móvil, cerrar el sidebar después de seleccionar
    if (isMobile && isOpen) {
      setTimeout(() => {
        toggleOpen();
      }, 100);
    }
  };



  // Overlay para móvil - Mejorado para evitar problemas de z-index
  const renderOverlay = () => {
    if (!isMobile || !isOpen) return null;
    
    return (
      <div 
        className="fixed inset-0 bg-black/50 z-[45] lg:hidden transition-opacity duration-300"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleOpen();
        }}
        style={{ pointerEvents: 'auto' }}
      />
    );
  };

  // Obtener clases CSS responsivas - Mejorado z-index
  const getSidebarClasses = () => {
    let classes = "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-[60] shadow-lg";
    
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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleOpen();
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors pointer-events-auto"
        >
          <X className="h-4 w-4" />
        </Button>
      );
    }
    
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleCollapse();
        }}
        className={`
          p-2 hover:bg-gray-100 rounded-lg transition-colors pointer-events-auto
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
    <TooltipProvider delayDuration={500}>
      {renderOverlay()}
      
      <aside className={getSidebarClasses()} style={{ pointerEvents: 'auto' }}>
        {/* Header */}
        <div className={`p-6 flex items-center justify-between ${(isCollapsed && !isMobile) ? 'px-3' : ''}`}>
          <h1 className={`
            font-bold text-gray-900
            ${(isCollapsed && !isMobile) 
              ? 'text-lg' 
              : 'text-2xl'
            }
          `}>
            {(isCollapsed && !isMobile) ? 'W' : 'WhatsFull'}
          </h1>
          
          {getToggleButton()}
        </div>

        {/* Navegación */}
        <nav className={`${(isCollapsed && !isMobile) ? 'px-1' : 'px-4'} space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto`}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const currentActiveId = getActiveItemId();
            const isActive = currentActiveId === item.id;
            
            const buttonContent = (
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={`
                  w-full transition-all duration-200 cursor-pointer
                  ${(isCollapsed && !isMobile)
                    ? 'justify-center px-2 py-2 mx-auto h-10 w-10' 
                    : 'justify-start h-10'
                  }
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' 
                    : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                  }
                  active:scale-95 active:bg-blue-100
                `}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔧 Button clicked for:', item.id);
                  handleMenuItemClick(item.id, e);
                }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onTouchStart={() => setHoveredItem(item.id)}
                onTouchEnd={() => setHoveredItem(null)}
                style={{ 
                  pointerEvents: 'auto',
                  touchAction: 'manipulation'
                }}
              >
                <IconComponent className={`h-4 w-4 ${(!isCollapsed || isMobile) ? 'mr-2' : ''} flex-shrink-0`} />
                {(!isCollapsed || isMobile) && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
              </Button>
            );

            // Si está colapsado en desktop, mostrar tooltip mejorado
            if (isCollapsed && !isMobile) {
              return (
                <div key={item.id} className="relative">
                  <Tooltip open={hoveredItem === item.id}>
                    <TooltipTrigger asChild>
                      {buttonContent}
                    </TooltipTrigger>
                    <TooltipContent 
                      side="right" 
                      className="ml-2 z-[70] pointer-events-none"
                      sideOffset={8}
                    >
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500 max-w-48">{item.description}</div>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
