import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Target, 
  Zap,
  Download,
  Eye,
  Calendar,
  Users,
  TrendingUp,
  Settings,
  Brain
} from 'lucide-react';

interface PlanningItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  estimatedHours: number;
  assignee?: string;
  deadline?: Date;
  dependencies?: string[];
  tags: string[];
}

interface DocumentSection {
  title: string;
  content: string;
  items?: PlanningItem[];
}

/**
 * Componente PlanningViewer
 * 
 * Visualiza la documentación de planificación, revisión y roadmap del proyecto
 * de manera organizada y fácil de navegar.
 */
export function PlanningViewer() {
  const [activeTab, setActiveTab] = useState('revision');
  const [loading, setLoading] = useState(false);

  // Plan de implementación técnico
  const technicalPlan: PlanningItem[] = [
    {
      id: 'autoresponse-service',
      title: 'Auto-Response Engine',
      description: 'Implementar motor de respuestas automáticas 24/7 con IA',
      priority: 'high',
      status: 'pending',
      estimatedHours: 80,
      assignee: 'Senior Developer',
      deadline: new Date('2024-02-15'),
      tags: ['IA', 'Automatización', 'Critical'],
      dependencies: []
    },
    {
      id: 'liveinbox-todos',
      title: 'Completar LiveInbox TODOs',
      description: 'Conectar todos los métodos marcados con TODO en LiveInbox con APIs reales',
      priority: 'high',
      status: 'pending',
      estimatedHours: 60,
      assignee: 'Full Stack Developer',
      deadline: new Date('2024-02-01'),
      tags: ['API', 'Critical', 'Backend'],
      dependencies: []
    },
    {
      id: 'typescript-strict',
      title: 'Configuración TypeScript Estricta',
      description: 'Activar strict mode y corregir errores de tipos',
      priority: 'high',
      status: 'pending',
      estimatedHours: 40,
      assignee: 'TypeScript Specialist',
      deadline: new Date('2024-02-10'),
      tags: ['TypeScript', 'Code Quality'],
      dependencies: []
    },
    {
      id: 'knowledge-base',
      title: 'Knowledge Base Inteligente',
      description: 'Implementar base de conocimiento con búsqueda semántica',
      priority: 'medium',
      status: 'pending',
      estimatedHours: 70,
      assignee: 'AI Developer',
      deadline: new Date('2024-03-01'),
      tags: ['IA', 'Knowledge Management'],
      dependencies: ['autoresponse-service']
    },
    {
      id: 'sentiment-analysis',
      title: 'Sentiment Analysis',
      description: 'Análisis de emociones en tiempo real para conversaciones',
      priority: 'medium',
      status: 'pending',
      estimatedHours: 50,
      assignee: 'AI Developer',
      deadline: new Date('2024-03-15'),
      tags: ['IA', 'Analytics'],
      dependencies: ['knowledge-base']
    },
    {
      id: 'testing-framework',
      title: 'Testing Framework',
      description: 'Configurar Vitest y Testing Library con coverage >80%',
      priority: 'medium',
      status: 'pending',
      estimatedHours: 45,
      assignee: 'QA Developer',
      deadline: new Date('2024-02-20'),
      tags: ['Testing', 'Quality'],
      dependencies: []
    }
  ];

  // Métricas de progreso
  const metrics = {
    totalTasks: technicalPlan.length,
    completedTasks: technicalPlan.filter(item => item.status === 'completed').length,
    inProgressTasks: technicalPlan.filter(item => item.status === 'in-progress').length,
    pendingTasks: technicalPlan.filter(item => item.status === 'pending').length,
    totalEstimatedHours: technicalPlan.reduce((acc, item) => acc + item.estimatedHours, 0),
    highPriorityTasks: technicalPlan.filter(item => item.priority === 'high').length,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'blocked': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📋 Planificación del Proyecto</h1>
          <p className="text-gray-600 mt-2">
            Revisión completa, roadmap técnico y seguimiento del progreso
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Vista Completa
          </Button>
        </div>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tareas</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalTasks}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Horas Estimadas</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalEstimatedHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alta Prioridad</p>
                <p className="text-2xl font-bold text-red-600">{metrics.highPriorityTasks}</p>
              </div>
              <Zap className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progreso</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round((metrics.completedTasks / metrics.totalTasks) * 100)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revision">
            <FileText className="h-4 w-4 mr-2" />
            Revisión Completa
          </TabsTrigger>
          <TabsTrigger value="roadmap">
            <Calendar className="h-4 w-4 mr-2" />
            Roadmap Técnico
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Brain className="h-4 w-4 mr-2" />
            Recomendaciones
          </TabsTrigger>
        </TabsList>

        {/* Tab: Revisión Completa */}
        <TabsContent value="revision" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Revisión Completa de la Aplicación
              </CardTitle>
              <CardDescription>
                Análisis detallado de 28,444 líneas de código y 100+ archivos TypeScript/React
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Resumen Ejecutivo */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">📊 Resumen Ejecutivo</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">✅ Fortalezas Identificadas</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Arquitectura sólida con separación clara</li>
                        <li>• Tecnologías modernas (React 18, TypeScript)</li>
                        <li>• Funcionalidades avanzadas de IA</li>
                        <li>• Diseño responsive excelente</li>
                        <li>• Documentación README completa</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">⚠️ Problemas Críticos</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• 50+ instancias de <code>any</code></li>
                        <li>• 8 TODOs críticos en LiveInbox</li>
                        <li>• Configuración TypeScript laxa</li>
                        <li>• Ausencia total de pruebas</li>
                        <li>• Vulnerabilidades de seguridad</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Análisis por Módulos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">🔍 Análisis por Módulos</h3>
                  
                  <div className="space-y-3">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-800">1. LiveInbox (Crítico)</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        8 TODOs sin implementar - APIs reales necesarias
                      </p>
                      <Badge className="mt-2 bg-red-100 text-red-800">Alta Prioridad</Badge>
                    </div>
                    
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-800">2. FlowBuilder (Excelente)</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        828 líneas - Funcionalidad completa pero necesita refactoring
                      </p>
                      <Badge className="mt-2 bg-yellow-100 text-yellow-800">Media Prioridad</Badge>
                    </div>
                    
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-800">3. Configuración TypeScript</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Modo strict desactivado - compromete type safety
                      </p>
                      <Badge className="mt-2 bg-red-100 text-red-800">Alta Prioridad</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Roadmap Técnico */}
        <TabsContent value="roadmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Plan de Implementación Técnico
              </CardTitle>
              <CardDescription>
                Tareas prioritarias y cronograma de desarrollo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {technicalPlan.map((item) => (
                  <Card key={item.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(item.status)}
                            <h4 className="font-semibold text-gray-900">{item.title}</h4>
                            <Badge className={getPriorityColor(item.priority)}>
                              {item.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {item.estimatedHours}h
                            </span>
                            {item.assignee && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {item.assignee}
                              </span>
                            )}
                            {item.deadline && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {item.deadline.toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3 mr-1" />
                          Detalles
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Recomendaciones */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Recomendaciones Estratégicas
              </CardTitle>
              <CardDescription>
                Análisis de oportunidades y próximos pasos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Recomendaciones prioritarias */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">🔥 Acciones Inmediatas (Semana 1-2)</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h5 className="font-medium text-red-800">1. Completar LiveInbox - APIs Reales</h5>
                      <p className="text-sm text-red-700 mt-1">
                        8 TODOs críticos sin implementar. Conectar con Evolution API real.
                      </p>
                      <div className="mt-2 text-xs text-red-600">
                        Impacto: Alto • Esfuerzo: 60h • ROI: Inmediato
                      </div>
                    </div>
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <h5 className="font-medium text-orange-800">2. Configuración TypeScript Estricta</h5>
                      <p className="text-sm text-orange-700 mt-1">
                        Activar strict mode y corregir 50+ instancias de 'any'.
                      </p>
                      <div className="mt-2 text-xs text-orange-600">
                        Impacto: Alto • Esfuerzo: 40h • ROI: Calidad de código
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Recomendaciones estratégicas */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">⚡ Funcionalidades Nuevas (Semana 3-8)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-medium text-blue-800">Auto-Response Engine</h5>
                      <p className="text-sm text-blue-700 mt-1">
                        Motor de respuestas automáticas 24/7 con IA
                      </p>
                      <div className="mt-2 text-xs text-blue-600">
                        ROI: $15,000-25,000/año por cliente
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h5 className="font-medium text-purple-800">Sentiment Analysis</h5>
                      <p className="text-sm text-purple-700 mt-1">
                        Análisis de emociones en tiempo real
                      </p>
                      <div className="mt-2 text-xs text-purple-600">
                        ROI: $8,000-15,000/año por cliente
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Métricas de éxito */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">🎯 Métricas de Éxito</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <div className="font-medium text-green-800">Calidad del Código</div>
                      <ul className="mt-1 text-green-700 space-y-1">
                        <li>• TypeScript strict: 100%</li>
                        <li>• Test coverage: &gt;80%</li>
                        <li>• ESLint errors: 0</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <div className="font-medium text-blue-800">Performance</div>
                      <ul className="mt-1 text-blue-700 space-y-1">
                        <li>• First Paint: &lt;2s</li>
                        <li>• Bundle size: &lt;2MB</li>
                        <li>• Core Web Vitals: ✅</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                      <div className="font-medium text-purple-800">Funcionalidad</div>
                      <ul className="mt-1 text-purple-700 space-y-1">
                        <li>• LiveInbox: 100% funcional</li>
                        <li>• FlowBuilder: sin errores</li>
                        <li>• APIs: todas conectadas</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 