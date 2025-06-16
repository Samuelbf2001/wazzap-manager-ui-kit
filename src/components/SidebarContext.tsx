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
      setIsMobile(mobile);
      
      // En móvil, empezar con sidebar cerrado
      if (mobile && isOpen) {
        setIsOpen(false);
      }
      
      // En desktop, si está cerrado en móvil, abrirlo
      if (!mobile && !isOpen) {
        setIsOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [isOpen]);

  const toggleCollapse = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const setCollapsed = (collapsed: boolean) => {
    if (!isMobile) {
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