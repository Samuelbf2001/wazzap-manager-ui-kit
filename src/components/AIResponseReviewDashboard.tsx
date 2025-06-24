import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  BarChart3, 
  Bot, 
  User, 
  Search,
  Eye,
  Calendar,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Target,
  Zap,
  Award,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Star,
  Download,
  Upload,
  Database,
  RefreshCw
} from 'lucide-react';
import { 
  aiResponseFeedbackService, 
  ReportAnalytics, 
  ImprovementSuggestion 
} from '@/services/ai-response-feedback.service';
import { AIResponseReport } from '@/components/AIResponseReporter';
import { useToast } from '@/hooks/use-toast';

interface ReportCardProps {
  report: AIResponseReport;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onReview: (reportId: string, approved: boolean, comments: string) => void;
}

function CompactReportCard({ report, isExpanded, onToggleExpand, onReview }: ReportCardProps) {
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewComments, setReviewComments] = useState('');

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'analyzing': 'bg-blue-50 text-blue-700 border-blue-200',
      'solution_proposed': 'bg-purple-50 text-purple-700 border-purple-200',
      'reviewed': 'bg-orange-50 text-orange-700 border-orange-200',
      'approved': 'bg-green-50 text-green-700 border-green-200',
      'rejected': 'bg-red-50 text-red-700 border-red-200',
      'implemented': 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'pending': 'Pendiente',
      'analyzing': 'Analizando',
      'solution_proposed': 'Solución Propuesta',
      'reviewed': 'Revisado',
      'approved': 'Aprobado',
      'rejected': 'Rechazado',
      'implemented': 'Implementado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getProblemTypeLabel = (type: string) => {
    const labels = {
      'incorrect_info': 'Información Incorrecta',
      'tone_inappropriate': 'Tono Inapropiado',
      'missing_context': 'Falta Contexto',
      'factual_error': 'Error Factual',
      'not_helpful': 'No es Útil',
      'other': 'Otro'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleReview = async (approved: boolean) => {
    if (!reviewComments.trim()) return;
    
    setIsReviewing(true);
    await onReview(report.id, approved, reviewComments);
    setIsReviewing(false);
    setReviewComments('');
  };

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      {/* Compact Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">#{report.id.slice(-8)}</span>
                <Badge className={`text-xs px-2 py-0.5 border ${getStatusColor(report.status)}`}>
                  {getStatusLabel(report.status)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getProblemTypeLabel(report.problemType)}
                </Badge>
                {report.aiProposedSolution && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">{report.aiProposedSolution.confidence}%</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Bot className="h-3 w-3" />
                  {report.agentName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {report.reportedAt.toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {report.reportedBy}
                </span>
              </div>
              
              <p className="text-sm text-gray-700 mt-1 truncate">
                {report.problemDescription}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            {report.status === 'solution_proposed' && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Requiere revisión</span>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              </div>
            )}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          <CardContent className="p-4 space-y-4">
            {/* Original Response */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Respuesta Original:
              </h4>
              <div className="p-3 bg-gray-50 rounded-lg text-sm border">
                {report.originalResponse}
              </div>
            </div>

            {/* Problem Description */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Problema Reportado:</h4>
              <p className="text-sm text-gray-700">{report.problemDescription}</p>
              {report.additionalContext && (
                <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                  <strong>Contexto adicional:</strong> {report.additionalContext}
                </div>
              )}
              {report.customerFeedback && (
                <div className="text-sm text-gray-600 bg-orange-50 p-2 rounded">
                  <strong>Feedback del cliente:</strong> {report.customerFeedback}
                </div>
              )}
            </div>

            {/* AI Proposed Solution */}
            {report.aiProposedSolution && (
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-500" />
                  Solución Propuesta por IA:
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    {report.aiProposedSolution.confidence}% Confianza
                  </Badge>
                </h4>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm">{report.aiProposedSolution.newResponse}</p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-1">Razón de la mejora:</p>
                  <p className="text-sm text-blue-700">{report.aiProposedSolution.improvementReason}</p>
                </div>

                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Acciones Sugeridas:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {report.aiProposedSolution.suggestedActions.map((action, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm p-2 bg-gray-50 rounded">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Review Section */}
            {report.status === 'solution_proposed' && (
              <div className="border-t pt-4 space-y-4 bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Revisión Humana Requerida:
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Comentarios de Revisión:</label>
                    <Textarea
                      value={reviewComments}
                      onChange={(e) => setReviewComments(e.target.value)}
                      placeholder="Proporciona comentarios detallados sobre la propuesta..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleReview(false)}
                      disabled={isReviewing || !reviewComments.trim()}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      {isReviewing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ThumbsDown className="h-4 w-4 mr-2" />}
                      Rechazar
                    </Button>
                    <Button
                      onClick={() => handleReview(true)}
                      disabled={isReviewing || !reviewComments.trim()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isReviewing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ThumbsUp className="h-4 w-4 mr-2" />}
                      Aprobar e Implementar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Review Result */}
            {report.humanReview && (
              <div className="border-t pt-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Revisión de {report.humanReview.reviewerName}</span>
                  <Badge className={report.humanReview.approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {report.humanReview.approved ? 'Aprobado' : 'Rechazado'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700">{report.humanReview.comments}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {report.humanReview.reviewedAt.toLocaleString()}
                </p>
              </div>
            )}

            {/* Implementation Result */}
            {report.implementationResult && (
              <div className="border-t pt-4 bg-emerald-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Estado de Implementación</span>
                  <Badge className={report.implementationResult.implemented ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {report.implementationResult.implemented ? 'Exitosa' : 'Fallida'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700">{report.implementationResult.notes}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {report.implementationResult.implementedAt.toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </div>
      )}
    </Card>
  );
}

export function AIResponseReviewDashboard() {
  const { toast } = useToast();
  const [reports, setReports] = useState<AIResponseReport[]>([]);
  const [analytics, setAnalytics] = useState<ReportAnalytics | null>(null);
  const [suggestions, setSuggestions] = useState<ImprovementSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgentFilter, setSelectedAgentFilter] = useState('all');
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allReports, analyticsData] = await Promise.all([
        aiResponseFeedbackService.getAllReports(),
        aiResponseFeedbackService.getReportAnalytics()
      ]);
      
      setReports(allReports);
      setAnalytics(analyticsData);
      
      // Cargar sugerencias para agentes con reportes
      const agentIds = [...new Set(allReports.map(r => r.agentId))];
      const agentSuggestions = await Promise.all(
        agentIds.map(id => aiResponseFeedbackService.getImprovementSuggestions(id))
      );
      setSuggestions(agentSuggestions);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportReview = async (reportId: string, approved: boolean, comments: string) => {
    try {
      await aiResponseFeedbackService.approveImprovement(reportId, approved, comments, 'current_reviewer');
      
      toast({
        title: approved ? "Propuesta Aprobada" : "Propuesta Rechazada",
        description: approved 
          ? "La mejora será implementada en el agente" 
          : "Se han registrado los comentarios de rechazo",
      });
      
      // Recargar datos
      await loadData();
      
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar la revisión",
        variant: "destructive"
      });
    }
  };

  const toggleReportExpansion = (reportId: string) => {
    const newExpanded = new Set(expandedReports);
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId);
    } else {
      newExpanded.add(reportId);
    }
    setExpandedReports(newExpanded);
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.problemDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAgent = selectedAgentFilter === 'all' || report.agentId === selectedAgentFilter;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'pending' && ['pending', 'analyzing', 'solution_proposed'].includes(report.status)) ||
                      (activeTab === 'reviewed' && ['reviewed', 'approved', 'rejected'].includes(report.status)) ||
                      (activeTab === 'implemented' && report.status === 'implemented');
                      
    return matchesSearch && matchesAgent && matchesTab;
  });

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'bg-green-50 text-green-700 border-green-200',
      'medium': 'bg-yellow-50 text-yellow-700 border-yellow-200', 
      'high': 'bg-orange-50 text-orange-700 border-orange-200',
      'critical': 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando dashboard de revisión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Dashboard de Revisión IA
              </h1>
              <p className="text-gray-600 mt-1">
                Supervisa, revisa y aprueba mejoras propuestas por IA
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => {
                  try {
                    const data = aiResponseFeedbackService.exportData();
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `ai-reports-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    
                    toast({
                      title: "Datos Exportados",
                      description: "Los reportes han sido descargados exitosamente",
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "No se pudieron exportar los datos",
                      variant: "destructive"
                    });
                  }
                }}
                variant="outline" 
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              
              <Button 
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.json';
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      try {
                        const text = await file.text();
                        aiResponseFeedbackService.importData(text);
                        await loadData();
                        
                        toast({
                          title: "Datos Importados",
                          description: "Los reportes han sido importados exitosamente",
                        });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Error al importar los datos",
                          variant: "destructive"
                        });
                      }
                    }
                  };
                  input.click();
                }}
                variant="outline" 
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
              
              <Button 
                onClick={() => {
                  if (confirm('¿Estás seguro de que quieres limpiar todos los datos? Esta acción no se puede deshacer.')) {
                    aiResponseFeedbackService.clearAllData();
                    setReports([]);
                    setAnalytics(null);
                    setSuggestions([]);
                    
                    toast({
                      title: "Datos Limpiados",
                      description: "Todos los reportes han sido eliminados",
                    });
                  }
                }}
                variant="outline" 
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Database className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
              
              <Button onClick={loadData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Reportes</p>
                    <p className="text-2xl font-bold text-blue-900">{analytics.totalReports}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Tasa de Resolución</p>
                    <p className="text-2xl font-bold text-green-900">{analytics.resolutionRate.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Tiempo Promedio</p>
                    <p className="text-2xl font-bold text-purple-900">{analytics.averageResolutionTime.toFixed(1)}h</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Agentes Afectados</p>
                    <p className="text-2xl font-bold text-orange-900">{Object.keys(analytics.reportsByAgent).length}</p>
                  </div>
                  <Bot className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-100 px-6 pt-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <TabsList className="grid grid-cols-4 bg-gray-50 p-1 rounded-lg w-full lg:w-auto">
                  <TabsTrigger value="pending" className="flex items-center gap-2 text-xs lg:text-sm">
                    <Clock className="h-4 w-4" />
                    Pendientes
                  </TabsTrigger>
                  <TabsTrigger value="reviewed" className="flex items-center gap-2 text-xs lg:text-sm">
                    <Eye className="h-4 w-4" />
                    Revisados
                  </TabsTrigger>
                  <TabsTrigger value="implemented" className="flex items-center gap-2 text-xs lg:text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Implementados
                  </TabsTrigger>
                  <TabsTrigger value="suggestions" className="flex items-center gap-2 text-xs lg:text-sm">
                    <Target className="h-4 w-4" />
                    Sugerencias
                  </TabsTrigger>
                </TabsList>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar reportes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  <select
                    value={selectedAgentFilter}
                    onChange={(e) => setSelectedAgentFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm min-w-0"
                  >
                    <option value="all">Todos los agentes</option>
                    {analytics && Object.keys(analytics.reportsByAgent).map(agentId => (
                      <option key={agentId} value={agentId}>
                        Agente {agentId}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="h-[calc(100vh-400px)] overflow-y-auto">
              <TabsContent value="pending" className="p-6 m-0">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold mb-4">Reportes Pendientes de Revisión</h2>
                  {filteredReports.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reportes pendientes</h3>
                      <p className="text-gray-600">Todos los reportes han sido procesados</p>
                    </div>
                  ) : (
                    filteredReports.map(report => (
                      <CompactReportCard
                        key={report.id}
                        report={report}
                        isExpanded={expandedReports.has(report.id)}
                        onToggleExpand={() => toggleReportExpansion(report.id)}
                        onReview={handleReportReview}
                      />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviewed" className="p-6 m-0">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold mb-4">Reportes Revisados</h2>
                  {filteredReports.map(report => (
                    <CompactReportCard
                      key={report.id}
                      report={report}
                      isExpanded={expandedReports.has(report.id)}
                      onToggleExpand={() => toggleReportExpansion(report.id)}
                      onReview={handleReportReview}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="implemented" className="p-6 m-0">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold mb-4">Mejoras Implementadas</h2>
                  {filteredReports.map(report => (
                    <CompactReportCard
                      key={report.id}
                      report={report}
                      isExpanded={expandedReports.has(report.id)}
                      onToggleExpand={() => toggleReportExpansion(report.id)}
                      onReview={handleReportReview}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="suggestions" className="p-6 m-0">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Sugerencias de Mejora por Agente</h2>
                  {suggestions.map(suggestion => (
                    <Card key={suggestion.agentId} className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">Agente {suggestion.agentId}</h3>
                          <Badge className={`mt-2 ${getPriorityColor(suggestion.priority)}`}>
                            Prioridad: {suggestion.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <Award className="h-6 w-6 text-yellow-500" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-red-600">Problemas Comunes:</h4>
                          <ul className="space-y-1">
                            {suggestion.commonIssues.map((issue, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                <AlertTriangle className="h-3 w-3 text-red-500 mt-1 flex-shrink-0" />
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-blue-600">Actualizaciones de Prompt:</h4>
                          <ul className="space-y-1">
                            {suggestion.suggestedPromptUpdates.map((update, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                <Bot className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
                                {update}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-green-600">Recomendaciones de Entrenamiento:</h4>
                          <ul className="space-y-1">
                            {suggestion.trainingRecommendations.map((rec, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                <Target className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}