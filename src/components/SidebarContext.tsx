import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Contexto del Sidebar
 * 
 * Proporciona estado global para manejar si el sidebar está
 * colapsado o expandido. Permite que otros componentes se
 * ajusten dinámicamente al estado del sidebar.
 */

interface SidebarContextType {
  isCollapsed: boolean;
  isMobile: boolean;
  isOpen: boolean;
  toggleCollapse: () => void;
  toggleOpen: () => void;
  setCollapsed: (collapsed: boolean) => void;
  getSidebarWidth: () => string;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      const wasMobile = isMobile;
      setIsMobile(mobile);
      
      // Solo cambiar el estado si realmente cambió el tipo de dispositivo
      if (wasMobile !== mobile) {
        if (mobile) {
          // Cambió a móvil: cerrar sidebar
          setIsOpen(false);
        } else {
          // Cambió a desktop: abrir sidebar si estaba cerrado
          setIsOpen(true);
        }
      }
    };

    checkMobile();
    
    // Usar passive para mejor rendimiento
    window.addEventListener('resize', checkMobile, { passive: true });
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile]); // Dependencia cambiada para evitar loops

  const toggleCollapse = () => {
    if (!isMobile) {
      console.log('🔧 SidebarContext: Toggle collapse:', !isCollapsed);
      setIsCollapsed(!isCollapsed);
    }
  };

  const toggleOpen = () => {
    console.log('🔧 SidebarContext: Toggle open:', !isOpen);
    setIsOpen(!isOpen);
  };

  const setCollapsed = (collapsed: boolean) => {
    if (!isMobile) {
      console.log('🔧 SidebarContext: Set collapsed:', collapsed);
      setIsCollapsed(collapsed);
    }
  };

  const getSidebarWidth = () => {
    if (isMobile) {
      return isOpen ? 'w-64' : 'w-0';
    }
    return isCollapsed ? 'w-16' : 'w-64';
  };

  const value = {
    isCollapsed,
    isMobile,
    isOpen,
    toggleCollapse,
    toggleOpen,
    setCollapsed,
    getSidebarWidth
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
} 