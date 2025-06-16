import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Settings,
  Activity,
  Database,
  Campaign,
  CreditCard,
  Brain,
  HubSpot,
  Mail
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">WhatsFull</h1>
      </div>

      <nav className="px-4 space-y-1">
        <Button
          variant={activeTab === 'connections' ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('connections')}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Conexiones
        </Button>

        <Button
          variant={activeTab === 'configuration' ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('configuration')}
        >
          <Settings className="mr-2 h-4 w-4" />
          Configuración
        </Button>

        <Button
          variant={activeTab === 'logs' ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('logs')}
        >
          <Activity className="mr-2 h-4 w-4" />
          Registros
        </Button>

        <Button
          variant={activeTab === 'properties' ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('properties')}
        >
          <Database className="mr-2 h-4 w-4" />
          Propiedades
        </Button>

        <Button
          variant={activeTab === 'campañas' ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('campañas')}
        >
          <Campaign className="mr-2 h-4 w-4" />
          Campañas
        </Button>

        <Button
          variant={activeTab === 'suscripcion' ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('suscripcion')}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Suscripción
        </Button>

        <Button
          variant={activeTab === 'whatsia' ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('whatsia')}
        >
          <Brain className="mr-2 h-4 w-4" />
          WhatsIA
        </Button>

        <Button
          variant={activeTab === 'hubspot' ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('hubspot')}
        >
          <HubSpot className="mr-2 h-4 w-4" />
          HubSpot
        </Button>

        <Button
          variant={activeTab === 'mensajes' ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('mensajes')}
        >
          <Mail className="mr-2 h-4 w-4" />
          Mensajes
        </Button>
      </nav>
    </aside>
  );
}
