import React, { useState } from 'react';
import { Agent, LiveConversation } from '@/types/conversation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  MessageCircle, 
  CheckCircle, 
  TrendingUp,
  Star,
  Award,
  Target
} from 'lucide-react';

interface AgentPanelProps {
  agent: Agent;
  conversations: LiveConversation[];
  onConversationSelect: (conversation: LiveConversation) => void;
}

export function AgentPanel({ agent, conversations, onConversationSelect }: AgentPanelProps) {
  const [activeTab, setActiveTab] = useState<'performance' | 'conversations' | 'skills'>('performance');

  const agentConversations = conversations.filter(c => c.assignedAgent === agent.id);
  const activeConversations = agentConversations.filter(c => c.status === 'active');
  const resolvedToday = agentConversations.filter(c => 
    c.status === 'resolved' && 
    new Date(c.updatedAt).toDateString() === new Date().toDateString()
  );

  const utilizationPercentage = (agent.activeConversations / agent.maxConversations) * 100;

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

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="w-12 h-12">
              <AvatarImage src={agent.avatar} />
              <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(agent.status)}`} />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold">{agent.name}</h3>
            <p className="text-sm text-gray-500">{agent.email}</p>
            <Badge variant="outline" className="text-xs mt-1">
              {getStatusText(agent.status)}
            </Badge>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">{agent.activeConversations}</p>
            <p className="text-xs text-gray-500">Activas</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{resolvedToday.length}</p>
            <p className="text-xs text-gray-500">Resueltas</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-purple-600">{utilizationPercentage.toFixed(0)}%</p>
            <p className="text-xs text-gray-500">Utilización</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-4">
          <Button
            variant={activeTab === 'performance' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('performance')}
            className="flex-1"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Rendimiento
          </Button>
          <Button
            variant={activeTab === 'conversations' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('conversations')}
            className="flex-1"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Chats
          </Button>
          <Button
            variant={activeTab === 'skills' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('skills')}
            className="flex-1"
          >
            <Star className="mr-2 h-4 w-4" />
            Skills
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 overflow-y-auto">
        {activeTab === 'performance' && (
          <div className="space-y-4">
            {/* Workload */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Carga de trabajo</span>
                <span className="text-sm text-gray-500">
                  {agent.activeConversations}/{agent.maxConversations}
                </span>
              </div>
              <Progress value={utilizationPercentage} className="h-2" />
            </div>

            {/* Performance metrics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Tiempo respuesta</span>
                </div>
                <span className="text-sm font-medium">2.3m</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Tasa resolución</span>
                </div>
                <span className="text-sm font-medium">94%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Satisfacción</span>
                </div>
                <span className="text-sm font-medium">4.8/5</span>
              </div>
            </div>

            {/* Goals */}
            <div>
              <h4 className="text-sm font-medium mb-3">Objetivos del día</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Conversaciones resueltas</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium">{resolvedToday.length}/20</span>
                    <Progress value={(resolvedToday.length / 20) * 100} className="w-16 h-1" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Tiempo respuesta &lt; 3m</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium">85%</span>
                    <Progress value={85} className="w-16 h-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'conversations' && (
          <div className="space-y-3">
            {agentConversations.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p className="text-sm">No hay conversaciones asignadas</p>
              </div>
            ) : (
              agentConversations.map(conversation => (
                <Card
                  key={conversation.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onConversationSelect(conversation)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={conversation.contactAvatar} />
                        <AvatarFallback className="text-xs">
                          {conversation.contactName?.charAt(0) || conversation.phoneNumber.slice(-2)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {conversation.contactName || conversation.phoneNumber}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-1">
                        <Badge className={`text-xs ${
                          conversation.status === 'active' ? 'bg-green-100 text-green-600' :
                          conversation.status === 'waiting' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {conversation.status}
                        </Badge>
                        
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-4">
            {/* Skills */}
            <div>
              <h4 className="text-sm font-medium mb-3">Habilidades</h4>
              <div className="flex flex-wrap gap-2">
                {agent.skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <h4 className="text-sm font-medium mb-3">Idiomas</h4>
              <div className="flex flex-wrap gap-2">
                {agent.languages.map(language => (
                  <Badge key={language} variant="outline" className="text-xs">
                    {language.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <h4 className="text-sm font-medium mb-3">Certificaciones</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs">Customer Service Expert</span>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-xs">WhatsApp Business Certified</span>
                </div>
              </div>
            </div>

            {/* Activity */}
            <div>
              <h4 className="text-sm font-medium mb-3">Actividad reciente</h4>
              <div className="text-xs text-gray-500">
                Última actividad: {new Date(agent.lastActivity).toLocaleString('es-ES')}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 