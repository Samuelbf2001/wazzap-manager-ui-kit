import React, { useState } from 'react';
import { Agent, InboxStats, ConversationFilters } from '@/types/conversation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Star,
  Filter,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface InboxSidebarProps {
  agents: Agent[];
  currentAgent: Agent | null;
  stats: InboxStats | null;
  onFilterChange: (filters: ConversationFilters) => void;
}

export function InboxSidebar({ agents, currentAgent, stats, onFilterChange }: InboxSidebarProps) {
  const [showStats, setShowStats] = useState(true);
  const [showAgents, setShowAgents] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<ConversationFilters>({});

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
      case 'online': return 'En línea';
      case 'away': return 'Ausente';
      case 'busy': return 'Ocupado';
      case 'offline': return 'Desconectado';
      default: return 'Desconocido';
    }
  };

  const updateFilter = (key: keyof ConversationFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="h-full bg-gray-50 border-r p-4 space-y-4 overflow-y-auto">
      {/* Performance Stats */}
      <Collapsible open={showStats} onOpenChange={setShowStats}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Rendimiento</span>
            </div>
            {showStats ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <Card>
            <CardContent className="p-4 space-y-3">
              {stats && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Conversaciones activas</span>
                    <Badge variant="outline" className="text-xs">
                      {stats.activeConversations}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">En espera</span>
                    <Badge variant="secondary" className="text-xs">
                      {stats.waitingConversations}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Resueltas hoy</span>
                    <Badge variant="default" className="text-xs bg-green-600">
                      {stats.resolvedToday}
                    </Badge>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Tiempo respuesta</span>
                      <span className="text-xs font-medium">
                        {stats.averageResponseTime ? `${stats.averageResponseTime}m` : '-'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Satisfacción</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs font-medium">
                          {stats.customerSatisfaction?.toFixed(1) || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Agents List */}
      <Collapsible open={showAgents} onOpenChange={setShowAgents}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Agentes ({agents.length})</span>
            </div>
            {showAgents ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <Card>
            <CardContent className="p-3 space-y-3">
              {agents.map(agent => (
                <div 
                  key={agent.id}
                  className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                    currentAgent?.id === agent.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={agent.avatar} />
                      <AvatarFallback className="text-xs">
                        {agent.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(agent.status)}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{agent.name}</p>
                    <p className="text-xs text-gray-500">{getStatusText(agent.status)}</p>
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    {agent.activeConversations}/{agent.maxConversations}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Quick Filters */}
      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filtros rápidos</span>
            </div>
            {showFilters ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Unread only */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="unread-only"
                  checked={filters.unreadOnly || false}
                  onCheckedChange={(checked) => updateFilter('unreadOnly', checked)}
                />
                <Label htmlFor="unread-only" className="text-sm">
                  Solo no leídos
                </Label>
              </div>

              {/* My conversations */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="my-conversations"
                  checked={filters.assignedAgent === currentAgent?.id}
                  onCheckedChange={(checked) => 
                    updateFilter('assignedAgent', checked ? currentAgent?.id : undefined)
                  }
                />
                <Label htmlFor="my-conversations" className="text-sm">
                  Mis conversaciones
                </Label>
              </div>

              {/* Priority filters */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Prioridad</Label>
                <div className="space-y-2">
                  {['urgent', 'high', 'medium', 'low'].map(priority => (
                    <div key={priority} className="flex items-center space-x-2">
                      <Switch
                        id={`priority-${priority}`}
                        checked={filters.priority === priority}
                        onCheckedChange={(checked) => 
                          updateFilter('priority', checked ? priority : undefined)
                        }
                      />
                      <Label htmlFor={`priority-${priority}`} className="text-sm">
                        {priority === 'urgent' && 'Urgente'}
                        {priority === 'high' && 'Alta'}
                        {priority === 'medium' && 'Media'}
                        {priority === 'low' && 'Baja'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status filters */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Estado</Label>
                <div className="space-y-2">
                  {['active', 'waiting', 'resolved'].map(status => (
                    <div key={status} className="flex items-center space-x-2">
                      <Switch
                        id={`status-${status}`}
                        checked={filters.status === status}
                        onCheckedChange={(checked) => 
                          updateFilter('status', checked ? status : undefined)
                        }
                      />
                      <Label htmlFor={`status-${status}`} className="text-sm">
                        {status === 'active' && 'Activas'}
                        {status === 'waiting' && 'Esperando'}
                        {status === 'resolved' && 'Resueltas'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  setFilters({});
                  onFilterChange({});
                }}
              >
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Acciones rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Clock className="mr-2 h-4 w-4" />
            Mis conversaciones
          </Button>
          
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Users className="mr-2 h-4 w-4" />
            Sin asignar
          </Button>
          
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Star className="mr-2 h-4 w-4" />
            Favoritos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 