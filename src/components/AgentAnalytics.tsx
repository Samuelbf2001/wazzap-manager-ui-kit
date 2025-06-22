import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  MessageCircle, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Activity,
  Zap
} from 'lucide-react';

interface AIAgent {
  id: string;
  name: string;
  type: 'conversational' | 'tool_using' | 'reasoning' | 'workflow' | 'multi_agent';
  status: 'active' | 'inactive' | 'training' | 'error';
  model: string;
  knowledgeBases: string[];
  created: Date;
  lastUsed: Date;
  totalConversations: number;
  avgResponseTime: number;
  successRate: number;
}

interface AgentAnalyticsProps {
  agents: AIAgent[];
}

export function AgentAnalytics({ agents }: AgentAnalyticsProps) {
  const activeAgents = agents.filter(a => a.status === 'active');
  const totalConversations = agents.reduce((sum, agent) => sum + agent.totalConversations, 0);
  const avgSuccessRate = agents.length > 0 
    ? agents.reduce((sum, agent) => sum + agent.successRate, 0) / agents.length 
    : 0;
  const avgResponseTime = agents.length > 0 
    ? agents.reduce((sum, agent) => sum + agent.avgResponseTime, 0) / agents.length 
    : 0;

  // Datos simulados para métricas detalladas
  const weeklyConversations = [120, 180, 240, 320, 280, 350, 420];
  const responseTimeData = [2.1, 2.3, 1.9, 2.4, 2.2, 2.0, 1.8];
  const successRateData = [94.2, 95.1, 93.8, 96.2, 94.9, 95.7, 96.8];

  const topPerformingAgents = [...agents]
    .sort((a, b) => b.successRate - a.successRate)
    .slice(0, 5);

  const agentTypeStats = agents.reduce((acc, agent) => {
    acc[agent.type] = (acc[agent.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'conversational': return 'Conversacional';
      case 'tool_using': return 'Con Herramientas';
      case 'reasoning': return 'Razonamiento';
      case 'workflow': return 'Flujo de Trabajo';
      case 'multi_agent': return 'Multi-Agente';
      default: return type;
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Analytics de Agentes IA</h2>
        <p className="text-gray-600">Métricas de rendimiento y uso de tus agentes</p>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Conversaciones</p>
                <p className="text-2xl font-bold">{totalConversations.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(totalConversations, totalConversations * 0.9)}
                  <span className="text-xs text-green-600">+12.5% vs semana anterior</span>
                </div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasa de Éxito Promedio</p>
                <p className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(avgSuccessRate, avgSuccessRate - 2)}
                  <span className="text-xs text-green-600">+2.1% vs semana anterior</span>
                </div>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tiempo Respuesta Promedio</p>
                <p className="text-2xl font-bold">{avgResponseTime.toFixed(1)}s</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(2.5, avgResponseTime)}
                  <span className="text-xs text-green-600">-0.3s vs semana anterior</span>
                </div>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Agentes Activos</p>
                <p className="text-2xl font-bold">{activeAgents.length}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(activeAgents.length, activeAgents.length - 1)}
                  <span className="text-xs text-blue-600">{((activeAgents.length / agents.length) * 100).toFixed(0)}% del total</span>
                </div>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y Análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversaciones por Semana */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Conversaciones por Día (Última Semana)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyConversations.map((conversations, index) => {
                const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
                const maxConversations = Math.max(...weeklyConversations);
                const percentage = (conversations / maxConversations) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{dayNames[index]}</span>
                      <span className="text-sm text-gray-600">{conversations}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Agents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Agentes por Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformingAgents.map((agent, index) => (
                <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
                      <span className="text-xs font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{agent.name}</p>
                      <p className="text-xs text-gray-500">{getTypeLabel(agent.type)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{agent.successRate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">{agent.totalConversations} conv.</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por Tipo y Métricas Detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribución por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Distribución por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(agentTypeStats).map(([type, count]) => {
                const percentage = (count / agents.length) * 100;
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{getTypeLabel(type)}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{count}</span>
                        <Badge variant="outline" className="text-xs">
                          {percentage.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tiempo de Respuesta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tiempo de Respuesta (7 días)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{avgResponseTime.toFixed(1)}s</p>
                <p className="text-sm text-gray-600">Promedio actual</p>
              </div>
              <div className="space-y-3">
                {responseTimeData.map((time, index) => {
                  const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
                  const isGood = time <= 2.5;
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{dayNames[index]}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{time.toFixed(1)}s</span>
                        <div className={`w-2 h-2 rounded-full ${isGood ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasa de Éxito */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Tasa de Éxito (7 días)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{avgSuccessRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Promedio actual</p>
              </div>
              <div className="space-y-3">
                {successRateData.map((rate, index) => {
                  const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
                  const isExcellent = rate >= 95;
                  const isGood = rate >= 90;
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{dayNames[index]}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{rate.toFixed(1)}%</span>
                        <div className={`w-2 h-2 rounded-full ${
                          isExcellent ? 'bg-green-500' : 
                          isGood ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas y Recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas y Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {agents.filter(a => a.status === 'error').length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">
                    {agents.filter(a => a.status === 'error').length} agente(s) con errores
                  </p>
                  <p className="text-sm text-red-600">
                    Revisa la configuración y logs de estos agentes
                  </p>
                </div>
              </div>
            )}

            {avgResponseTime > 3 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">
                    Tiempo de respuesta elevado
                  </p>
                  <p className="text-sm text-yellow-600">
                    Considera optimizar los prompts o reducir la complejidad
                  </p>
                </div>
              </div>
            )}

            {avgSuccessRate < 90 && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <TrendingDown className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">
                    Tasa de éxito por debajo del objetivo
                  </p>
                  <p className="text-sm text-orange-600">
                    Revisa el entrenamiento y las bases de conocimiento
                  </p>
                </div>
              </div>
            )}

            {agents.filter(a => a.status === 'active').length === agents.length && avgSuccessRate > 95 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">
                    ¡Excelente rendimiento!
                  </p>
                  <p className="text-sm text-green-600">
                    Todos los agentes funcionan correctamente con alta tasa de éxito
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}