import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Bot, 
  CheckCircle, 
  Clock, 
  FileText, 
  MessageSquare, 
  User, 
  Zap,
  ThumbsDown,
  Eye,
  Edit,
  Send,
  Loader2,
  Star,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface AIResponseReport {
  id: string;
  messageId: string;
  conversationId: string;
  agentId: string;
  agentName: string;
  originalResponse: string;
  problemType: 'incorrect_info' | 'tone_inappropriate' | 'missing_context' | 'factual_error' | 'not_helpful' | 'other';
  problemDescription: string;
  additionalContext: string;
  customerFeedback?: string;
  reportedBy: string;
  reportedAt: Date;
  status: 'pending' | 'analyzing' | 'solution_proposed' | 'reviewed' | 'approved' | 'rejected' | 'implemented';
  aiProposedSolution?: {
    newResponse: string;
    improvementReason: string;
    confidence: number;
    suggestedActions: string[];
    generatedAt: Date;
  };
  humanReview?: {
    reviewerId: string;
    reviewerName: string;
    approved: boolean;
    comments: string;
    modificationsRequired?: string;
    reviewedAt: Date;
  };
  implementationResult?: {
    implemented: boolean;
    implementedAt: Date;
    feedbackScore?: number;
    notes?: string;
  };
}

interface AIResponseReporterProps {
  messageId: string;
  conversationId: string;
  agentId: string;
  agentName: string;
  originalResponse: string;
  trigger?: React.ReactNode;
  onReportSubmitted?: (report: AIResponseReport) => void;
}

export function AIResponseReporter({
  messageId,
  conversationId,
  agentId,
  agentName,
  originalResponse,
  trigger,
  onReportSubmitted
}: AIResponseReporterProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingSolution, setIsGeneratingSolution] = useState(false);
  const [currentStep, setCurrentStep] = useState<'report' | 'solution' | 'review'>('report');
  
  // Form state
  const [problemType, setProblemType] = useState<AIResponseReport['problemType']>('not_helpful');
  const [problemDescription, setProblemDescription] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [customerFeedback, setCustomerFeedback] = useState('');
  
  // Solution state
  const [proposedSolution, setProposedSolution] = useState<AIResponseReport['aiProposedSolution'] | null>(null);
  
  // Review state
  const [reviewComments, setReviewComments] = useState('');
  const [modificationRequirements, setModificationRequirements] = useState('');

  const problemTypeLabels = {
    incorrect_info: 'Información Incorrecta',
    tone_inappropriate: 'Tono Inapropiado',
    missing_context: 'Falta Contexto',
    factual_error: 'Error Factual',
    not_helpful: 'No es Útil',
    other: 'Otro'
  };

  const handleSubmitReport = async () => {
    if (!problemDescription.trim()) {
      toast({
        title: "Error",
        description: "Por favor describe el problema",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Usar el servicio para enviar el reporte
      const { aiResponseFeedbackService } = await import('@/services/ai-response-feedback.service');
      
      const report = await aiResponseFeedbackService.submitReport({
        messageId,
        conversationId,
        agentId,
        agentName,
        originalResponse,
        problemType,
        problemDescription,
        additionalContext,
        customerFeedback,
        reportedBy: 'current_user' // TODO: obtener del contexto de usuario
      });

      toast({
        title: "Reporte Enviado",
        description: "El problema ha sido reportado y será analizado por IA",
      });

      // Simular el proceso de análisis
      setCurrentStep('solution');
      setIsGeneratingSolution(true);
      
      // Esperar a que el servicio procese el reporte
      setTimeout(async () => {
        try {
          const updatedReport = await aiResponseFeedbackService.getReportById(report.id);
          if (updatedReport?.aiProposedSolution) {
            setProposedSolution(updatedReport.aiProposedSolution);
            toast({
              title: "Solución Generada",
              description: "La IA ha propuesto una mejora. Requiere revisión humana.",
            });
          }
        } catch (error) {
          console.error('Error obteniendo solución:', error);
        } finally {
          setIsGeneratingSolution(false);
        }
      }, 3000);
      
      onReportSubmitted?.(report);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el reporte",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateAISolution = async (report: AIResponseReport) => {
    setIsGeneratingSolution(true);
    setCurrentStep('solution');
    
    try {
      // Simular generación de solución por IA
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const solution: AIResponseReport['aiProposedSolution'] = {
        newResponse: generateImprovedResponse(report),
        improvementReason: generateImprovementReason(report),
        confidence: Math.round(75 + Math.random() * 20), // 75-95%
        suggestedActions: generateSuggestedActions(report),
        generatedAt: new Date()
      };
      
      setProposedSolution(solution);
      
      toast({
        title: "Solución Generada",
        description: "La IA ha propuesto una mejora. Requiere revisión humana.",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar la solución",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSolution(false);
    }
  };

  const generateImprovedResponse = (report: AIResponseReport): string => {
    // Lógica simplificada para generar respuesta mejorada
    const improvements = {
      incorrect_info: "He verificado la información y la respuesta correcta es:",
      tone_inappropriate: "Permíteme responder de manera más apropiada:",
      missing_context: "Considerando el contexto completo de la conversación:",
      factual_error: "Corrijo la información proporcionada:",
      not_helpful: "Te proporciono una respuesta más útil:",
      other: "He mejorado la respuesta considerando tu feedback:"
    };
    
    return `${improvements[report.problemType]} ${report.originalResponse.replace(/\b(no|nunca|imposible)\b/gi, '').trim()}. 

Además, ${report.additionalContext ? `teniendo en cuenta que ${report.additionalContext.toLowerCase()}, ` : ''}te sugiero que contactes a nuestro equipo especializado si necesitas información más específica.

¿Hay algo más en lo que pueda ayudarte?`;
  };

  const generateImprovementReason = (report: AIResponseReport): string => {
    const reasons = {
      incorrect_info: "Se corrigió la información incorrecta y se añadió verificación de fuentes",
      tone_inappropriate: "Se ajustó el tono para ser más empático y profesional",
      missing_context: "Se incorporó el contexto de la conversación previa",
      factual_error: "Se corrigieron los datos erróneos con información verificada",
      not_helpful: "Se reestructuró la respuesta para ser más útil y accionable",
      other: "Se mejoró basándose en el feedback específico proporcionado"
    };
    
    return reasons[report.problemType];
  };

  const generateSuggestedActions = (report: AIResponseReport): string[] => {
    const baseActions = [
      "Actualizar base de conocimiento del agente",
      "Revisar y ajustar el prompt del sistema",
      "Agregar ejemplo de respuesta correcta al entrenamiento"
    ];
    
    const specificActions = {
      incorrect_info: ["Verificar fuentes de información", "Actualizar datos obsoletos"],
      tone_inappropriate: ["Revisar guidelines de comunicación", "Ajustar parámetros de personalidad"],
      missing_context: ["Mejorar manejo de memoria conversacional", "Optimizar comprensión contextual"],
      factual_error: ["Validar base de datos de hechos", "Implementar verificación cruzada"],
      not_helpful: ["Mejorar detección de intención", "Ampliar respuestas con ejemplos"],
      other: ["Análisis específico del feedback", "Mejora personalizada"]
    };
    
    return [...baseActions, ...specificActions[report.problemType]];
  };

  const handleApproveProposal = async (approved: boolean) => {
    if (!reviewComments.trim()) {
      toast({
        title: "Error",
        description: "Por favor agrega comentarios de revisión",
        variant: "destructive"
      });
      return;
    }

    try {
      // Esta funcionalidad normalmente sería para administradores/supervisores
      // Por ahora simularemos el proceso para demostración
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: approved ? "Propuesta Aprobada" : "Propuesta Rechazada",
        description: approved 
          ? "La mejora será enviada para implementación por el supervisor" 
          : "Se han registrado los comentarios de rechazo",
      });
      
      setCurrentStep('review');
      
      if (approved) {
        // Simular que se envía para implementación
        setTimeout(() => {
          toast({
            title: "Enviado para Implementación",
            description: "Un supervisor revisará y aplicará la mejora al agente",
          });
          setIsOpen(false);
          resetForm();
        }, 2000);
      } else {
        // Si se rechaza, permitir cerrar después de un momento
        setTimeout(() => {
          setIsOpen(false);
          resetForm();
        }, 3000);
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar la revisión",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setProblemType('not_helpful');
    setProblemDescription('');
    setAdditionalContext('');
    setCustomerFeedback('');
    setProposedSolution(null);
    setReviewComments('');
    setModificationRequirements('');
    setCurrentStep('report');
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-orange-600 hover:bg-orange-50">
      <ThumbsDown className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Reportar Problema con Respuesta de IA
          </DialogTitle>
        </DialogHeader>

        <Tabs value={currentStep} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="report" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              1. Reportar
            </TabsTrigger>
            <TabsTrigger value="solution" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              2. Solución IA
            </TabsTrigger>
            <TabsTrigger value="review" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              3. Revisión
            </TabsTrigger>
          </TabsList>

          <TabsContent value="report" className="space-y-6">
            {/* Información del mensaje original */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Respuesta Original del Agente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Bot className="h-4 w-4" />
                    <span>Agente: {agentName}</span>
                    <Badge variant="outline" className="ml-2">ID: {agentId}</Badge>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm">{originalResponse}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formulario de reporte */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalles del Problema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="problemType">Tipo de Problema</Label>
                  <select
                    id="problemType"
                    value={problemType}
                    onChange={(e) => setProblemType(e.target.value as AIResponseReport['problemType'])}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(problemTypeLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="problemDescription">Descripción del Problema *</Label>
                  <Textarea
                    id="problemDescription"
                    placeholder="Describe específicamente qué está mal con la respuesta del agente..."
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalContext">Contexto Adicional</Label>
                  <Textarea
                    id="additionalContext"
                    placeholder="Proporciona contexto adicional que pueda ayudar a mejorar la respuesta..."
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerFeedback">Feedback del Cliente (opcional)</Label>
                  <Textarea
                    id="customerFeedback"
                    placeholder="Si el cliente proporcionó feedback específico, inclúyelo aquí..."
                    value={customerFeedback}
                    onChange={(e) => setCustomerFeedback(e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmitReport}
                disabled={isSubmitting || !problemDescription.trim()}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Reporte
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="solution" className="space-y-6">
            {isGeneratingSolution ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="relative">
                  <Bot className="h-12 w-12 text-blue-500" />
                  <div className="absolute -top-1 -right-1">
                    <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">Generando Solución...</h3>
                  <p className="text-gray-600">La IA está analizando el problema y generando una mejora</p>
                </div>
              </div>
            ) : proposedSolution ? (
              <div className="space-y-6">
                {/* Métricas de confianza */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Análisis de Mejora
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {proposedSolution.confidence}%
                        </div>
                        <div className="text-sm text-gray-600">Confianza</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {proposedSolution.suggestedActions.length}
                        </div>
                        <div className="text-sm text-gray-600">Acciones</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          <Star className="h-6 w-6 mx-auto" />
                        </div>
                        <div className="text-sm text-gray-600">Calidad</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Respuesta mejorada */}
                <Card>
                  <CardHeader>
                    <CardTitle>Respuesta Mejorada Propuesta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm">{proposedSolution.newResponse}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">Razón de la mejora:</p>
                        <p className="text-sm text-blue-700">{proposedSolution.improvementReason}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Acciones sugeridas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Acciones Sugeridas para el Agente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {proposedSolution.suggestedActions.map((action, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{action}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Esta propuesta requiere revisión y aprobación humana antes de ser implementada.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep('review')}>
                    <Eye className="h-4 w-4 mr-2" />
                    Revisar Propuesta
                  </Button>
                </div>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="review" className="space-y-6">
            {proposedSolution && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revisión Humana Requerida</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reviewComments">Comentarios de Revisión</Label>
                      <Textarea
                        id="reviewComments"
                        placeholder="Proporciona comentarios sobre la propuesta de mejora..."
                        value={reviewComments}
                        onChange={(e) => setReviewComments(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="modificationRequirements">Modificaciones Requeridas (si aplica)</Label>
                      <Textarea
                        id="modificationRequirements"
                        placeholder="Si la propuesta necesita modificaciones, describe qué cambios son necesarios..."
                        value={modificationRequirements}
                        onChange={(e) => setModificationRequirements(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => handleApproveProposal(false)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Rechazar Propuesta
                  </Button>
                  <Button 
                    onClick={() => handleApproveProposal(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprobar e Implementar
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}