import React, { useState, useRef, useEffect } from 'react';
import { LiveConversation, LiveMessage, Agent } from '@/types/conversation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Phone, 
  Video, 
  Info,
  CheckCheck,
  Check,
  Clock,
  AlertCircle,
  MessageCircle,
  ThumbsDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AIResponseReporter } from '@/components/AIResponseReporter';

interface ChatWindowProps {
  conversation: LiveConversation | null;
  messages: LiveMessage[];
  currentAgent: Agent | null;
  onSendMessage: (content: string, type?: LiveMessage['type']) => void;
  isConnected: boolean;
  isIframe?: boolean;
}

export function ChatWindow({
  conversation,
  messages,
  currentAgent,
  onSendMessage,
  isConnected,
  isIframe = false
}: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when conversation changes
  useEffect(() => {
    if (conversation && inputRef.current) {
      inputRef.current.focus();
    }
  }, [conversation]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !conversation) return;
    
    onSendMessage(messageInput.trim());
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageStatusIcon = (status: LiveMessage['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400" />;
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-500" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageContent = (message: LiveMessage) => {
    switch (message.type) {
      case 'text':
        return message.content;
      case 'image':
        return (
          <div className="space-y-2">
            <img 
              src={message.mediaUrl} 
              alt="Imagen"
              className="max-w-xs rounded-lg cursor-pointer"
              onClick={() => window.open(message.mediaUrl, '_blank')}
            />
            {message.content && <p>{message.content}</p>}
          </div>
        );
      case 'document':
        return (
          <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg max-w-xs">
            <Paperclip className="h-4 w-4 text-gray-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {message.mediaMetadata?.filename || 'Documento'}
              </p>
              <p className="text-xs text-gray-500">
                {message.mediaMetadata?.size && `${Math.round(message.mediaMetadata.size / 1024)} KB`}
              </p>
            </div>
          </div>
        );
      case 'location':
        return (
          <div className="space-y-2">
            <div className="bg-gray-100 p-3 rounded-lg max-w-xs">
              <p className="text-sm font-medium">📍 Ubicación compartida</p>
              <p className="text-xs text-gray-500">Toca para ver en el mapa</p>
            </div>
            {message.content && <p>{message.content}</p>}
          </div>
        );
      case 'system':
        return (
          <div className="text-xs text-gray-500 italic text-center py-2">
            {message.content}
          </div>
        );
      default:
        return message.content;
    }
  };

  const MessageBubble = ({ message }: { message: LiveMessage }) => {
    const isAgent = message.sender.type === 'agent';
    const isSystem = message.sender.type === 'system';

    if (isSystem) {
      return (
        <div className="flex justify-center my-4">
          <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
            {getMessageContent(message)}
          </div>
        </div>
      );
    }

    return (
      <div className={`group flex ${isAgent ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex ${isAgent ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[70%]`}>
          {/* Avatar */}
          <Avatar className="w-6 h-6 flex-shrink-0">
            <AvatarImage src={message.sender.avatar} />
            <AvatarFallback className="text-xs">
              {message.sender.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Message bubble container */}
          <div className="flex flex-col space-y-1">
            {/* Message bubble */}
            <div
              className={`px-3 py-2 rounded-lg ${
                isAgent
                  ? 'bg-blue-500 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-900 rounded-bl-sm'
              }`}
            >
              {/* Sender name for group chats */}
              {!isAgent && (
                <p className="text-xs font-medium text-gray-600 mb-1">
                  {message.sender.name}
                </p>
              )}
              
              {/* Message content */}
              <div className="text-sm">
                {getMessageContent(message)}
              </div>

              {/* Time and status */}
              <div className={`flex items-center justify-end space-x-1 mt-1 ${
                isAgent ? 'text-blue-100' : 'text-gray-500'
              }`}>
                <span className="text-xs">
                  {formatMessageTime(message.timestamp)}
                </span>
                {isAgent && getMessageStatusIcon(message.status)}
              </div>
            </div>

            {/* AI Response Reporter - Solo para mensajes de agente */}
            {isAgent && currentAgent && (
              <div className={`opacity-70 hover:opacity-100 transition-opacity duration-200 ${
                isAgent ? 'flex justify-end' : 'flex justify-start'
              }`}>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">¿Respuesta incorrecta?</span>
                  <AIResponseReporter
                    messageId={message.id}
                    conversationId={message.conversationId}
                    agentId={currentAgent.id}
                    agentName={currentAgent.name}
                    originalResponse={message.content}
                    trigger={
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 text-gray-400 hover:text-orange-600 hover:bg-orange-50"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    }
                    onReportSubmitted={(report) => {
                      console.log('Reporte de IA enviado:', report);
                      // Aquí se puede agregar lógica adicional
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Debug info - remove in production */}
            {isAgent && (
              <div className="text-xs text-gray-400 opacity-50">
                Debug: isAgent={isAgent.toString()}, currentAgent={currentAgent ? 'exists' : 'null'}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!conversation) {
    return (
      <Card className="h-full rounded-none flex items-center justify-center">
        <div className="text-center text-gray-500">
          <MessageCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">Selecciona una conversación</h3>
          <p className="text-sm">
            Elige una conversación de la lista para comenzar a chatear
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full rounded-none flex flex-col">
      {/* Header */}
      <CardHeader className="border-b py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Contact info */}
            <Avatar className="w-10 h-10">
              <AvatarImage src={conversation.contactAvatar} />
              <AvatarFallback>
                {conversation.contactName?.charAt(0) || conversation.phoneNumber.slice(-2)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">
                {conversation.contactName || conversation.phoneNumber}
              </h3>
              <div className="flex items-center space-x-2">
                <Badge className={`text-xs px-2 py-0.5 ${
                  conversation.status === 'active' ? 'bg-green-100 text-green-600' :
                  conversation.status === 'waiting' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {conversation.status === 'active' && 'Activa'}
                  {conversation.status === 'waiting' && 'Esperando'}
                  {conversation.status === 'resolved' && 'Resuelta'}
                  {conversation.status === 'transferred' && 'Transferida'}
                </Badge>
                {conversation.metadata.hubspotContactId && (
                  <Badge variant="secondary" className="text-xs">
                    HubSpot
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {!isIframe && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Llamar</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Videollamada</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Información del contacto</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Ver perfil del contacto</DropdownMenuItem>
                <DropdownMenuItem>Transferir conversación</DropdownMenuItem>
                <DropdownMenuItem>Marcar como resuelta</DropdownMenuItem>
                <DropdownMenuItem>Bloquear contacto</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Connection status */}
        {!isConnected && (
          <div className="bg-red-50 text-red-600 text-xs p-2 rounded-md mt-2">
            ⚠️ Sin conexión - Los mensajes se enviarán cuando se restablezca la conexión
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="text-xs text-gray-500 mt-2">
            {conversation.contactName || 'El contacto'} está escribiendo...
          </div>
        )}
      </CardHeader>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100% - 280px)' }}>
        <div className="space-y-1">
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t p-4 mt-auto">
        <div className="flex items-end space-x-2">
          <div className="flex space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Adjuntar archivo</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Emojis</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Textarea
            ref={inputRef}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="flex-1 min-h-[40px] max-h-[120px] resize-none"
            disabled={!isConnected}
          />

          <Button 
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || !isConnected}
            size="sm"
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick responses */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setMessageInput('Gracias por contactarnos. ¿En qué podemos ayudarte?')}
          >
            Saludo
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setMessageInput('Estoy revisando tu consulta. Te respondo en un momento.')}
          >
            Revisando
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setMessageInput('¿Hay algo más en lo que pueda ayudarte?')}
          >
            ¿Algo más?
          </Button>
        </div>
      </div>
    </Card>
  );
} 