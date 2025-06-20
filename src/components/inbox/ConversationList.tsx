import React, { useState } from 'react';
import { LiveConversation, ConversationFilters } from '@/types/conversation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, MoreVertical, MessageCircle, Clock, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ConversationListProps {
  conversations: LiveConversation[];
  selectedConversation: LiveConversation | null;
  onConversationSelect: (conversation: LiveConversation) => void;
  isLoading: boolean;
  filters: ConversationFilters;
  onFilterChange: (filters: ConversationFilters) => void;
}

export function ConversationList({
  conversations,
  selectedConversation,
  onConversationSelect,
  isLoading,
  filters,
  onFilterChange
}: ConversationListProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onFilterChange({ ...filters, searchQuery: value });
  };

  const getPriorityColor = (priority: LiveConversation['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: LiveConversation['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'waiting': return 'text-yellow-600 bg-yellow-50';
      case 'resolved': return 'text-gray-600 bg-gray-50';
      case 'transferred': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'whatsapp': return '💬';
      case 'telegram': return '✈️';
      case 'instagram': return '📷';
      case 'facebook': return '📘';
      default: return '💬';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const ConversationItem = ({ conversation }: { conversation: LiveConversation }) => (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${
        selectedConversation?.id === conversation.id 
          ? 'bg-blue-50 border-l-blue-500 shadow-md' 
          : 'hover:bg-gray-50 border-l-transparent'
      }`}
      onClick={() => onConversationSelect(conversation)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={conversation.contactAvatar} />
                <AvatarFallback>
                  {conversation.contactName?.charAt(0) || conversation.phoneNumber.slice(-2)}
                </AvatarFallback>
              </Avatar>
              {/* Source indicator */}
              <div className="absolute -bottom-1 -right-1 text-xs">
                {getSourceIcon(conversation.metadata.source)}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-sm truncate">
                  {conversation.contactName || conversation.phoneNumber}
                </h3>
                <div className="flex items-center space-x-1">
                  {/* Priority indicator */}
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(conversation.priority)}`} />
                  {/* Unread count */}
                  {conversation.unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Last message */}
              <p className="text-xs text-gray-600 truncate mb-2">
                {conversation.lastMessage.content}
              </p>

              {/* Status and time */}
              <div className="flex items-center justify-between">
                <Badge className={`text-xs px-2 py-0.5 ${getStatusColor(conversation.status)}`}>
                  {conversation.status === 'active' && 'Activa'}
                  {conversation.status === 'waiting' && 'Esperando'}
                  {conversation.status === 'resolved' && 'Resuelta'}
                  {conversation.status === 'transferred' && 'Transferida'}
                </Badge>
                <span className="text-xs text-gray-500">
                  {formatTime(conversation.lastMessage.timestamp)}
                </span>
              </div>

              {/* Tags */}
              {conversation.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {conversation.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                  {conversation.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      +{conversation.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <MessageCircle className="mr-2 h-4 w-4" />
                Ver conversación
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Clock className="mr-2 h-4 w-4" />
                Marcar como resuelta
              </DropdownMenuItem>
              <DropdownMenuItem>
                <AlertCircle className="mr-2 h-4 w-4" />
                Cambiar prioridad
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Search and filters */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center space-x-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-blue-50 text-blue-600' : ''}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => 
                onFilterChange({ 
                  ...filters, 
                  status: value === 'all' ? undefined : value as LiveConversation['status']
                })
              }
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activas</SelectItem>
                <SelectItem value="waiting">Esperando</SelectItem>
                <SelectItem value="resolved">Resueltas</SelectItem>
                <SelectItem value="transferred">Transferidas</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priority || 'all'}
              onValueChange={(value) => 
                onFilterChange({ 
                  ...filters, 
                  priority: value === 'all' ? undefined : value as LiveConversation['priority']
                })
              }
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-sm font-medium">No hay conversaciones</h3>
            <p className="text-xs mt-1">
              {filters.searchQuery || filters.status || filters.priority
                ? 'No se encontraron conversaciones con los filtros aplicados'
                : 'Aún no hay conversaciones disponibles'
              }
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {conversations.map(conversation => (
              <ConversationItem key={conversation.id} conversation={conversation} />
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="p-3 border-t bg-gray-50 text-xs text-gray-600">
        {conversations.length} conversación{conversations.length !== 1 ? 'es' : ''}
        {filters.searchQuery && ` encontrada${conversations.length !== 1 ? 's' : ''}`}
      </div>
    </div>
  );
} 