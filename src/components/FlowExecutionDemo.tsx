import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  Play, 
  Square, 
  RotateCcw, 
  MessageSquare, 
  Bot, 
  User,
  Settings,
  Activity,
  Database,
  Zap,
  Clock,
  Send,
  Phone,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

import { FlowEngine } from '../services/flow-engine.service';
import { ConversationThread } from '../types/conversation';

/**
 * Demo Responsivo del Sistema de Flujos
 * 
 * Simula conversaciones WhatsApp en tiempo real con:
 * - Vista móvil optimizada para WhatsApp
 * - Panel de debugging responsivo
 * - Métricas en tiempo real
 * - Interfaz adaptativa según dispositivo
 */
export function FlowExecutionDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentThread, setCurrentThread] = useState<ConversationThread | null>(null);
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState<Array<{
    id: string;
    type: 'user' | 'bot';
    content: string;
    timestamp: Date;
    nodeId?: string;
  }>>([]);
  const [flowEngine] = useState(() => new FlowEngine());
  const [metrics, setMetrics] = useState({
    totalMessages: 0,
    totalThreads: 0,
    activeThreads: 0,
    averageResponseTime: 0
  });
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto scroll a último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simular métricas
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        totalMessages: messages.length,
        totalThreads: currentThread ? 1 : 0,
        activeThreads: isRunning && currentThread ? 1 : 0,
        averageResponseTime: Math.random() * 2000 + 500
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [messages.length, currentThread, isRunning]);

  const startFlow = async () => {
    setIsRunning(true);
    setMessages([]);
    
    try {
      const phoneNumber = '+34612345678';
      const thread = await flowEngine.startConversation('demo-flow', {
        phoneNumber,
        userName: 'Usuario Demo',
        platform: 'whatsapp'
      });
      
      setCurrentThread(thread);
      
      // Mensaje de bienvenida
      setMessages([{
        id: 'welcome',
        type: 'bot',
        content: '¡Hola! 👋 Bienvenido al demo de nuestro sistema de flujos. ¿En qué puedo ayudarte?',
        timestamp: new Date()
      }]);
      
    } catch (error) {
      console.error('Error iniciando flujo:', error);
      setIsRunning(false);
    }
  };

  const stopFlow = () => {
    setIsRunning(false);
    setCurrentThread(null);
  };

  const resetFlow = () => {
    setIsRunning(false);
    setCurrentThread(null);
    setMessages([]);
    setUserMessage('');
  };

  const sendMessage = async () => {
    if (!userMessage.trim() || !currentThread || !isRunning) return;

    const newMessage = {
      id: `user_${Date.now()}`,
      type: 'user' as const,
      content: userMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    const messageToSend = userMessage.trim();
    setUserMessage('');

    try {
      const response = await flowEngine.processUserMessage(currentThread.id, messageToSend);
      
      if (response.botMessages && response.botMessages.length > 0) {
        const botMessages = response.botMessages.map((msg, index) => ({
          id: `bot_${Date.now()}_${index}`,
          type: 'bot' as const,
          content: msg.content,
          timestamp: new Date(),
          nodeId: msg.nodeId
        }));
        
        // Simular delay de tipificación
        setTimeout(() => {
          setMessages(prev => [...prev, ...botMessages]);
        }, 1000 + Math.random() * 1000);
      }
      
      // Actualizar thread actual
      const updatedThread = flowEngine.getActiveThread(currentThread.id);
      if (updatedThread) {
        setCurrentThread(updatedThread);
      }
      
    } catch (error) {
      console.error('Error procesando mensaje:', error);
      const errorMessage = {
        id: `error_${Date.now()}`,
        type: 'bot' as const,
        content: 'Lo siento, ha ocurrido un error. Por favor intenta de nuevo.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Componente de chat WhatsApp-like
  const ChatInterface = () => (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header de chat */}
      <div className="bg-green-600 text-white p-4 flex items-center space-x-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
          <Bot className="h-6 w-6 text-green-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Bot de Flujos</h3>
          <p className="text-sm text-green-100">
            {isRunning ? 'En línea' : 'Desconectado'}
          </p>
        </div>
        {isRunning && (
          <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse" />
        )}
      </div>

      {/* Área de mensajes */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                  message.type === 'user'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-800 border'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-green-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input de mensaje */}
      <div className="bg-white border-t p-4">
        <div className="flex space-x-2">
          <Input
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            disabled={!isRunning}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!isRunning || !userMessage.trim()}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Panel de métricas y debugging
  const DebugPanel = () => (
    <div className="space-y-4">
      {/* Métricas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Métricas en Tiempo Real
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.totalMessages}</div>
              <div className="text-xs text-gray-500">Mensajes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.activeThreads}</div>
              <div className="text-xs text-gray-500">Threads Activos</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-600">
              {Math.round(metrics.averageResponseTime)}ms
            </div>
            <div className="text-xs text-gray-500">Tiempo de Respuesta</div>
          </div>
        </CardContent>
      </Card>

      {/* Estado del thread */}
      {currentThread && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Estado del Thread
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xs space-y-1">
              <div><span className="font-medium">ID:</span> {currentThread.id}</div>
              <div><span className="font-medium">Usuario:</span> {currentThread.user.name}</div>
              <div><span className="font-medium">Teléfono:</span> {currentThread.user.phoneNumber}</div>
              <div><span className="font-medium">Nodo Actual:</span> {currentThread.currentNodeId || 'N/A'}</div>
              <div><span className="font-medium">Variables:</span> {Object.keys(currentThread.variables).length}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variables del contexto */}
      {currentThread && Object.keys(currentThread.variables).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Variables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs">
              {Object.entries(currentThread.variables).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium">{key}:</span>
                  <span className="text-gray-600">{String(value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Responsive Layout
  if (isMobile) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        {/* Header móvil */}
        <div className="bg-white border-b px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Demo de Flujos</h1>
            <div className="flex space-x-2">
              <Button
                onClick={isRunning ? stopFlow : startFlow}
                variant={isRunning ? "destructive" : "default"}
                size="sm"
              >
                {isRunning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button onClick={resetFlow} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs móviles */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 m-2 flex-shrink-0">
            <TabsTrigger value="chat" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="debug" className="flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Debug
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 m-2 min-h-0">
            <Card className="h-full">
              <ChatInterface />
            </Card>
          </TabsContent>

          <TabsContent value="debug" className="flex-1 m-2 overflow-auto min-h-0">
            <DebugPanel />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="h-full flex bg-gray-50">
      {/* Panel de control lateral */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        {/* Header de controles */}
        <div className="p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-semibold mb-4">Demo de Flujos</h2>
          
          <div className="space-y-2">
            <Button
              onClick={isRunning ? stopFlow : startFlow}
              variant={isRunning ? "destructive" : "default"}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Detener Flujo
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Flujo
                </>
              )}
            </Button>
            
            <Button onClick={resetFlow} variant="outline" className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reiniciar Demo
            </Button>
          </div>
        </div>

        {/* Panel de debugging */}
        <ScrollArea className="flex-1 p-4">
          <DebugPanel />
        </ScrollArea>
      </div>

      {/* Área principal de chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Monitor className="h-5 w-5 text-gray-600" />
                <span className="font-medium">Vista Desktop</span>
              </div>
              <Badge variant={isRunning ? "default" : "secondary"}>
                {isRunning ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="h-4 w-4" />
                <span>{metrics.averageResponseTime.toFixed(0)}ms</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-4xl mx-auto w-full p-6 min-h-0">
          <Card className="h-full shadow-lg">
            <ChatInterface />
          </Card>
        </div>
      </div>
    </div>
  );
} 