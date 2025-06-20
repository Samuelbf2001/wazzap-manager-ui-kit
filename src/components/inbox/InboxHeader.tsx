import React from 'react';
import { Agent, InboxStats } from '@/types/conversation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Clock, 
  Users, 
  CheckCircle, 
  Settings,
  Bell,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface InboxHeaderProps {
  stats: InboxStats | null;
  currentAgent: Agent | null;
  onAgentStatusChange: (status: Agent['status']) => void;
}

export function InboxHeader({ stats, currentAgent, onAgentStatusChange }: InboxHeaderProps) {
  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Agent['status']) => {
    switch (status) {
      case 'online': return 'Disponible';
      case 'away': return 'Ausente';
      case 'busy': return 'Ocupado';
      case 'offline': return 'Desconectado';
      default: return 'Desconocido';
    }
  };

  return (
    <Card className="rounded-none border-l-0 border-r-0 border-t-0">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left section - Stats */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">
                    {stats?.activeConversations || 0}
                  </p>
                  <p className="text-xs text-gray-500">Activas</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">
                    {stats?.waitingConversations || 0}
                  </p>
                  <p className="text-xs text-gray-500">Esperando</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">
                    {stats?.resolvedToday || 0}
                  </p>
                  <p className="text-xs text-gray-500">Resueltas hoy</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">
                    {stats?.averageResponseTime ? `${stats.averageResponseTime}m` : '-'}
                  </p>
                  <p className="text-xs text-gray-500">Tiempo promedio</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right section - Agent info and controls */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>

            {/* Agent status */}
            {currentAgent && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 h-auto p-2">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={currentAgent.avatar} />
                          <AvatarFallback className="text-xs">
                            {currentAgent.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(currentAgent.status)}`} />
                      </div>
                      
                      <div className="text-left">
                        <p className="text-sm font-medium">{currentAgent.name}</p>
                        <p className="text-xs text-gray-500">
                          {getStatusText(currentAgent.status)}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-48">
                  <div className="p-2">
                    <p className="text-sm font-medium">{currentAgent.name}</p>
                    <p className="text-xs text-gray-500">{currentAgent.email}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">Conversaciones:</span>
                      <Badge variant="outline" className="text-xs">
                        {currentAgent.activeConversations}/{currentAgent.maxConversations}
                      </Badge>
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => onAgentStatusChange('online')}>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>Disponible</span>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => onAgentStatusChange('away')}>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span>Ausente</span>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => onAgentStatusChange('busy')}>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span>Ocupado</span>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => onAgentStatusChange('offline')}>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500" />
                      <span>Desconectado</span>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem>
                    Ver perfil
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem>
                    Configuración
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="text-red-600">
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Performance indicators */}
        {stats && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-green-600">
                  {stats.customerSatisfaction?.toFixed(1) || '-'}
                </p>
                <p className="text-xs text-gray-600">Satisfacción</p>
              </div>
              
              <div>
                <p className="text-lg font-bold text-blue-600">
                  {stats.agentUtilization || 0}%
                </p>
                <p className="text-xs text-gray-600">Utilización</p>
              </div>
              
              <div>
                <p className="text-lg font-bold text-purple-600">
                  {stats.firstResponseTime ? `${stats.firstResponseTime}m` : '-'}
                </p>
                <p className="text-xs text-gray-600">Primera respuesta</p>
              </div>
              
              <div>
                <p className="text-lg font-bold text-orange-600">
                  {stats.totalConversations || 0}
                </p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 