import { AIResponseReport } from '@/components/AIResponseReporter';
import { WazzapStorage, StorageService, STORAGE_KEYS } from '@/lib/storage';

export interface ReportAnalytics {
  totalReports: number;
  reportsByType: Record<string, number>;
  reportsByAgent: Record<string, number>;
  resolutionRate: number;
  averageResolutionTime: number;
  improvementTrends: {
    date: string;
    reports: number;
    resolved: number;
  }[];
}

export interface ImprovementSuggestion {
  agentId: string;
  commonIssues: string[];
  suggestedPromptUpdates: string[];
  trainingRecommendations: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

class AIResponseFeedbackService {
  private readonly STORAGE_KEY = 'wazzap-ai-response-reports';
  private readonly HISTORY_KEY = 'wazzap-ai-improvement-history';
  private reports: AIResponseReport[] = [];
  private improvementHistory: Map<string, any[]> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  // === MÉTODOS DE PERSISTENCIA ===
  
  private loadFromStorage(): void {
    try {
      // Cargar reportes usando el servicio de almacenamiento
      this.reports = WazzapStorage.getAIReports();

      // Cargar historial de mejoras
      const storedHistory = StorageService.getItem<Record<string, any[]>>(this.HISTORY_KEY, {});
      this.improvementHistory = new Map(Object.entries(storedHistory));

      console.log(`✅ Cargados ${this.reports.length} reportes desde localStorage`);
    } catch (error) {
      console.error('Error cargando datos desde localStorage:', error);
      this.reports = [];
      this.improvementHistory = new Map();
    }
  }

  private saveToStorage(): void {
    try {
      // Guardar reportes
      WazzapStorage.saveAIReports(this.reports);
      
      // Guardar historial de mejoras
      const historyObject = Object.fromEntries(this.improvementHistory);
      StorageService.setItem(this.HISTORY_KEY, historyObject);
      
      console.log(`💾 Guardados ${this.reports.length} reportes en localStorage`);
    } catch (error) {
      console.error('Error guardando datos en localStorage:', error);
    }
  }

  // === MÉTODOS PRINCIPALES ===

  async submitReport(report: Omit<AIResponseReport, 'id' | 'reportedAt' | 'status'>): Promise<AIResponseReport> {
    const newReport: AIResponseReport = {
      ...report,
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reportedAt: new Date(),
      status: 'pending'
    };

    this.reports.push(newReport);
    this.saveToStorage(); // 💾 Persistir inmediatamente
    
    // Simular guardado en base de datos
    await this.saveToDatabase(newReport);
    
    // Iniciar proceso de análisis automático
    setTimeout(() => {
      this.processReport(newReport.id);
    }, 500);

    return newReport;
  }

  async processReport(reportId: string): Promise<void> {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) return;

    try {
      // Actualizar estado a "analyzing"
      report.status = 'analyzing';
      this.saveToStorage(); // 💾 Persistir estado
      
      // Generar solución de IA
      const aiSolution = await this.generateAISolution(report);
      report.aiProposedSolution = aiSolution;
      report.status = 'solution_proposed';
      this.saveToStorage(); // 💾 Persistir solución

      // Notificar para revisión humana
      await this.notifyForHumanReview(report);
      
    } catch (error) {
      console.error('Error procesando reporte:', error);
      report.status = 'pending'; // Volver a estado anterior
      this.saveToStorage(); // 💾 Persistir rollback
    }
  }

  async generateAISolution(report: AIResponseReport): Promise<AIResponseReport['aiProposedSolution']> {
    // Simular llamada a API de IA para generar mejora
    await new Promise(resolve => setTimeout(resolve, 2000));

    const solution = {
      newResponse: this.generateImprovedResponse(report),
      improvementReason: this.getImprovementReason(report),
      confidence: this.calculateConfidence(report),
      suggestedActions: this.getSuggestedActions(report),
      generatedAt: new Date()
    };

    return solution;
  }

  private generateImprovedResponse(report: AIResponseReport): string {
    const improvements = {
      incorrect_info: "He verificado la información y quiero corregir mi respuesta anterior:",
      tone_inappropriate: "Permíteme reformular mi respuesta de manera más apropiada:",
      missing_context: "Considerando toda la información de nuestra conversación:",
      factual_error: "Corrijo la información que proporcioné anteriormente:",
      not_helpful: "Te ofrezco una respuesta más útil y específica:",
      other: "He mejorado mi respuesta basándome en tu feedback:"
    };

    const contextualImprovements = {
      incorrect_info: [
        "Después de verificar las fuentes más actualizadas",
        "Consultando nuestra base de datos oficial",
        "Con información verificada y actualizada"
      ],
      tone_inappropriate: [
        "Con un enfoque más empático",
        "De manera más profesional y comprensiva", 
        "Con el tono adecuado para la situación"
      ],
      missing_context: [
        "Teniendo en cuenta el historial de nuestra conversación",
        "Considerando los detalles que mencionaste anteriormente",
        "Integrando toda la información disponible"
      ],
      factual_error: [
        "Con los datos correctos y verificados",
        "Usando información precisa y actualizada",
        "Corrigiendo cualquier inexactitud previa"
      ],
      not_helpful: [
        "Con pasos específicos que puedes seguir",
        "Con información más detallada y práctica",
        "Con alternativas concretas para tu situación"
      ],
      other: [
        "Incorporando tu feedback específico",
        "Con las mejoras que sugeriste",
        "Adaptándome mejor a tus necesidades"
      ]
    };

    const randomContext = contextualImprovements[report.problemType][
      Math.floor(Math.random() * contextualImprovements[report.problemType].length)
    ];

    let improvedResponse = `${improvements[report.problemType]} ${randomContext}, `;
    
    // Mejorar la respuesta original basándose en el contexto adicional
    if (report.additionalContext) {
      improvedResponse += `${report.additionalContext}. `;
    }

    // Agregar valor adicional
    improvedResponse += `

Para asegurarme de que tengas toda la información necesaria, también te sugiero:
• Contactar a nuestro equipo especializado si necesitas detalles específicos
• Revisar nuestros recursos actualizados en la base de conocimientos
• No dudar en preguntar si algo no queda claro

¿Hay algún aspecto específico que te gustaría que desarrolle más?`;

    return improvedResponse;
  }

  private getImprovementReason(report: AIResponseReport): string {
    const reasons = {
      incorrect_info: "Se identificó y corrigió información incorrecta mediante verificación de fuentes actualizadas",
      tone_inappropriate: "Se ajustó el tono para ser más empático, profesional y apropiado para el contexto",
      missing_context: "Se incorporó el contexto completo de la conversación y antecedentes relevantes",
      factual_error: "Se corrigieron datos erróneos con información verificada de fuentes oficiales",
      not_helpful: "Se reestructuró la respuesta para ser más práctica, específica y accionable",
      other: "Se mejoró la respuesta incorporando el feedback específico proporcionado por el usuario"
    };
    
    return reasons[report.problemType];
  }

  private calculateConfidence(report: AIResponseReport): number {
    // Calcular confianza basada en varios factores
    let confidence = 75; // Base
    
    // Factores que aumentan la confianza
    if (report.additionalContext.length > 50) confidence += 10;
    if (report.problemDescription.length > 100) confidence += 5;
    if (report.customerFeedback && report.customerFeedback.length > 20) confidence += 10;
    
    // Factores que disminuyen la confianza
    if (report.problemType === 'other') confidence -= 10;
    
    return Math.min(95, Math.max(60, confidence));
  }

  private getSuggestedActions(report: AIResponseReport): string[] {
    const baseActions = [
      "Actualizar la base de conocimientos del agente con la información corregida",
      "Revisar y optimizar el prompt del sistema para este tipo de consultas",
      "Agregar este ejemplo como caso de entrenamiento para mejorar respuestas futuras"
    ];
    
    const specificActions: Record<string, string[]> = {
      incorrect_info: [
        "Verificar y actualizar fuentes de información obsoletas",
        "Implementar sistema de verificación cruzada para datos críticos",
        "Establecer proceso de revisión periódica de contenido"
      ],
      tone_inappropriate: [
        "Revisar y actualizar guidelines de comunicación y tono",
        "Ajustar parámetros de personalidad del agente",
        "Entrenar en escenarios de comunicación sensible"
      ],
      missing_context: [
        "Mejorar el sistema de memoria conversacional del agente",
        "Optimizar la comprensión contextual y seguimiento de hilos",
        "Implementar mejores referencias a información previa"
      ],
      factual_error: [
        "Validar y actualizar la base de datos de hechos",
        "Implementar verificación automática de datos críticos",
        "Establecer alertas para información que requiere actualización frecuente"
      ],
      not_helpful: [
        "Mejorar la detección de intención y necesidades del usuario",
        "Ampliar respuestas con ejemplos prácticos y pasos específicos",
        "Entrenar en proporcionar alternativas y opciones adicionales"
      ],
      other: [
        "Realizar análisis específico del feedback proporcionado",
        "Implementar mejoras personalizadas según el caso",
        "Evaluar necesidad de ajustes en el modelo del agente"
      ]
    };
    
    return [...baseActions, ...specificActions[report.problemType]];
  }

  async approveImprovement(reportId: string, approved: boolean, reviewComments: string, reviewerId: string): Promise<void> {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) throw new Error('Reporte no encontrado');

    // Agregar revisión humana
    report.humanReview = {
      reviewerId: reviewerId,
      reviewerName: reviewerId,
      approved,
      comments: reviewComments,
      reviewedAt: new Date()
    };

    report.status = approved ? 'approved' : 'rejected';
    this.saveToStorage(); // 💾 Persistir revisión

    if (approved) {
      // Implementar mejora automáticamente
      await this.implementImprovement(report);
    }
  }

  private async implementImprovement(report: AIResponseReport): Promise<void> {
    try {
      // Simular implementación de mejora
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      report.implementationResult = {
        implemented: true,
        implementedAt: new Date(),
        notes: 'Mejora implementada exitosamente en el agente de IA'
      };
      
      report.status = 'implemented';
      this.saveToStorage(); // 💾 Persistir implementación
      
      // Registrar en historial de mejoras
      this.recordImprovement(report);
      
    } catch (error) {
      console.error('Error implementando mejora:', error);
      report.implementationResult = {
        implemented: false,
        implementedAt: new Date(),
        notes: `Error en implementación: ${error.message}`
      };
      this.saveToStorage(); // 💾 Persistir error
    }
  }

  private recordImprovement(report: AIResponseReport): void {
    const agentHistory = this.improvementHistory.get(report.agentId) || [];
    agentHistory.push({
      reportId: report.id,
      improvementType: report.problemType,
      implementedAt: new Date(),
      success: report.implementationResult?.implemented || false
    });
    this.improvementHistory.set(report.agentId, agentHistory);
    this.saveToStorage(); // 💾 Persistir historial
  }

  // === MÉTODOS DE CONSULTA (sin cambios pero ahora con datos persistentes) ===

  async getReportAnalytics(agentId?: string): Promise<ReportAnalytics> {
    const filteredReports = agentId 
      ? this.reports.filter(r => r.agentId === agentId)
      : this.reports;

    const totalReports = filteredReports.length;
    const resolvedReports = filteredReports.filter(r => 
      ['approved', 'implemented'].includes(r.status)
    ).length;

    const reportsByType = filteredReports.reduce((acc, report) => {
      acc[report.problemType] = (acc[report.problemType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const reportsByAgent = filteredReports.reduce((acc, report) => {
      acc[report.agentId] = (acc[report.agentId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const resolutionRate = totalReports > 0 ? (resolvedReports / totalReports) * 100 : 0;

    // Calcular tiempo promedio de resolución
    const resolvedReportsWithTime = filteredReports.filter(r => 
      r.status === 'implemented' && r.implementationResult?.implementedAt
    );
    
    const totalResolutionTime = resolvedReportsWithTime.reduce((acc, report) => {
      const startTime = report.reportedAt.getTime();
      const endTime = report.implementationResult!.implementedAt.getTime();
      return acc + (endTime - startTime);
    }, 0);

    const averageResolutionTime = resolvedReportsWithTime.length > 0 
      ? totalResolutionTime / resolvedReportsWithTime.length / (1000 * 60 * 60) // en horas
      : 0;

    // Generar tendencias de mejora (últimos 30 días)
    const improvementTrends = this.generateImprovementTrends(filteredReports);

    return {
      totalReports,
      reportsByType,
      reportsByAgent,
      resolutionRate,
      averageResolutionTime,
      improvementTrends
    };
  }

  private generateImprovementTrends(reports: AIResponseReport[]): ReportAnalytics['improvementTrends'] {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last30Days.map(date => {
      const dayReports = reports.filter(r => 
        r.reportedAt.toISOString().split('T')[0] === date
      );
      const dayResolved = dayReports.filter(r => r.status === 'implemented');

      return {
        date,
        reports: dayReports.length,
        resolved: dayResolved.length
      };
    });
  }

  async getImprovementSuggestions(agentId: string): Promise<ImprovementSuggestion> {
    const agentReports = this.reports.filter(r => r.agentId === agentId);
    
    if (agentReports.length === 0) {
      return {
        agentId,
        commonIssues: [],
        suggestedPromptUpdates: [],
        trainingRecommendations: [],
        priority: 'low'
      };
    }

    // Analizar problemas comunes
    const problemFrequency = agentReports.reduce((acc, report) => {
      acc[report.problemType] = (acc[report.problemType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonIssues = Object.entries(problemFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([problem]) => this.getProblemDescription(problem));

    // Generar sugerencias de prompt
    const suggestedPromptUpdates = this.generatePromptSuggestions(agentReports);
    
    // Generar recomendaciones de entrenamiento
    const trainingRecommendations = this.generateTrainingRecommendations(agentReports);

    // Determinar prioridad
    const priority = this.calculatePriority(agentReports);

    return {
      agentId,
      commonIssues,
      suggestedPromptUpdates,
      trainingRecommendations,
      priority
    };
  }

  private getProblemDescription(problemType: string): string {
    const descriptions = {
      incorrect_info: 'Información incorrecta o desactualizada',
      tone_inappropriate: 'Tono inapropiado o poco empático',
      missing_context: 'Falta de contexto en las respuestas',
      factual_error: 'Errores factuales en la información',
      not_helpful: 'Respuestas poco útiles o específicas',
      other: 'Otros problemas reportados'
    };
    return descriptions[problemType as keyof typeof descriptions] || problemType;
  }

  private generatePromptSuggestions(reports: AIResponseReport[]): string[] {
    const suggestions = [];
    const problemTypes = [...new Set(reports.map(r => r.problemType))];

    if (problemTypes.includes('tone_inappropriate')) {
      suggestions.push('Agregar instrucciones específicas sobre tono empático y profesional');
    }
    
    if (problemTypes.includes('missing_context')) {
      suggestions.push('Incluir instrucciones para referenciar información previa de la conversación');
    }
    
    if (problemTypes.includes('not_helpful')) {
      suggestions.push('Enfatizar la importancia de proporcionar pasos específicos y ejemplos');
    }

    return suggestions;
  }

  private generateTrainingRecommendations(reports: AIResponseReport[]): string[] {
    const recommendations = [];
    const problemTypes = [...new Set(reports.map(r => r.problemType))];

    if (problemTypes.includes('incorrect_info') || problemTypes.includes('factual_error')) {
      recommendations.push('Entrenamiento adicional en verificación de información');
    }
    
    if (problemTypes.includes('tone_inappropriate')) {
      recommendations.push('Sesiones de entrenamiento en comunicación empática');
    }
    
    recommendations.push('Revisión de casos específicos reportados');
    
    return recommendations;
  }

  private calculatePriority(reports: AIResponseReport[]): ImprovementSuggestion['priority'] {
    const recentReports = reports.filter(r => {
      const daysDiff = (Date.now() - r.reportedAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });

    if (recentReports.length >= 5) return 'critical';
    if (recentReports.length >= 3) return 'high';
    if (recentReports.length >= 1) return 'medium';
    return 'low';
  }

  async getReportById(reportId: string): Promise<AIResponseReport | null> {
    return this.reports.find(r => r.id === reportId) || null;
  }

  async getAllReports(filters?: {
    agentId?: string;
    status?: AIResponseReport['status'];
    problemType?: AIResponseReport['problemType'];
  }): Promise<AIResponseReport[]> {
    let filtered = [...this.reports];

    if (filters?.agentId) {
      filtered = filtered.filter(r => r.agentId === filters.agentId);
    }
    
    if (filters?.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }
    
    if (filters?.problemType) {
      filtered = filtered.filter(r => r.problemType === filters.problemType);
    }

    return filtered.sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime());
  }

  // === MÉTODOS DE ADMINISTRACIÓN ===

  clearAllData(): void {
    this.reports = [];
    this.improvementHistory.clear();
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.HISTORY_KEY);
    console.log('🗑️ Todos los datos han sido eliminados');
  }

  exportData(): string {
    return JSON.stringify({
      reports: this.reports,
      improvementHistory: Object.fromEntries(this.improvementHistory),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      if (data.reports && Array.isArray(data.reports)) {
        this.reports = data.reports.map((report: any) => ({
          ...report,
          reportedAt: new Date(report.reportedAt),
          aiProposedSolution: report.aiProposedSolution ? {
            ...report.aiProposedSolution,
            generatedAt: new Date(report.aiProposedSolution.generatedAt)
          } : undefined,
          humanReview: report.humanReview ? {
            ...report.humanReview,
            reviewedAt: new Date(report.humanReview.reviewedAt)
          } : undefined,
          implementationResult: report.implementationResult ? {
            ...report.implementationResult,
            implementedAt: new Date(report.implementationResult.implementedAt)
          } : undefined
        }));
      }
      
      if (data.improvementHistory) {
        this.improvementHistory = new Map(Object.entries(data.improvementHistory));
      }
      
      this.saveToStorage();
      console.log(`📥 Importados ${this.reports.length} reportes`);
    } catch (error) {
      console.error('Error importando datos:', error);
      throw new Error('Formato de datos inválido');
    }
  }

  private async saveToDatabase(report: AIResponseReport): Promise<void> {
    // TODO: Implementar guardado real en base de datos cuando esté disponible
    console.log('📄 Reporte guardado localmente:', report.id);
  }

  private async notifyForHumanReview(report: AIResponseReport): Promise<void> {
    // TODO: Implementar notificación real (email, webhook, etc.)
    console.log('🔔 Notificación de revisión para:', report.id);
  }
}

export const aiResponseFeedbackService = new AIResponseFeedbackService();