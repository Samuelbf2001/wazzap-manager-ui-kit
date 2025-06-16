import { NodeExecutor, NodeExecutionContext, NodeExecutionResult, ConditionNodeData, ConditionRule } from '@/types/conversation';

/**
 * Ejecutor para nodos de condición
 * Evalúa reglas y condiciones para determinar el flujo de ejecución
 */
export class ConditionExecutor implements NodeExecutor {
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    try {
      const data = context.flowData as ConditionNodeData;
      
      let evaluationResult = false;
      let evaluationDetails: any = {};

      // Evaluar según el modo configurado
      switch (data.mode) {
        case 'ai':
          const aiResult = await this.evaluateWithAI(context, data);
          evaluationResult = aiResult.result;
          evaluationDetails = aiResult.details;
          break;
        case 'advanced':
          const advancedResult = this.evaluateAdvancedRules(context, data);
          evaluationResult = advancedResult.result;
          evaluationDetails = advancedResult.details;
          break;
        case 'simple':
        default:
          const simpleResult = this.evaluateSimpleRules(context, data);
          evaluationResult = simpleResult.result;
          evaluationDetails = simpleResult.details;
          break;
      }

      // Determinar el siguiente nodo basado en el resultado
      const nextNodeId = evaluationResult ? data.trueNodeId : data.falseNodeId;

      // Logging del resultado
      context.logStep({
        conditionType: data.mode,
        evaluationResult,
        evaluationDetails,
        nextNodeId,
        rulesEvaluated: data.rules.length
      });

      return {
        success: true,
        output: {
          conditionResult: evaluationResult,
          evaluationDetails,
          rulesEvaluated: data.rules,
          nextPath: evaluationResult ? 'true' : 'false'
        },
        nextNodeId,
        waitingForInput: false
      };
    } catch (error) {
      console.error('Error en ConditionExecutor:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error evaluando condición',
        waitingForInput: false
      };
    }
  }

  /**
   * Evalúa reglas simples
   */
  private evaluateSimpleRules(context: NodeExecutionContext, data: ConditionNodeData): { result: boolean; details: any } {
    const results: any[] = [];
    let finalResult = true;

    for (const rule of data.rules) {
      if (!rule.field) continue;

      const fieldValue = this.getFieldValue(rule.field, context);
      const ruleResult = this.evaluateRule(fieldValue, rule);
      
      results.push({
        field: rule.field,
        operator: rule.operator,
        value: rule.value,
        fieldValue,
        result: ruleResult,
        logicalOperator: rule.logicalOperator
      });

      // Aplicar lógica (AND/OR)
      if (results.length === 1) {
        finalResult = ruleResult;
      } else {
        if (rule.logicalOperator === 'OR') {
          finalResult = finalResult || ruleResult;
        } else { // AND por defecto
          finalResult = finalResult && ruleResult;
        }
      }
    }

    return {
      result: finalResult,
      details: {
        mode: 'simple',
        rulesEvaluated: results,
        finalLogic: finalResult
      }
    };
  }

  /**
   * Evalúa reglas avanzadas (grupos, lógica compleja)
   */
  private evaluateAdvancedRules(context: NodeExecutionContext, data: ConditionNodeData): { result: boolean; details: any } {
    // Por ahora usar la misma lógica simple
    // En el futuro implementar grupos de reglas, operadores avanzados, etc.
    const simpleResult = this.evaluateSimpleRules(context, data);
    
    return {
      result: simpleResult.result,
      details: {
        ...simpleResult.details,
        mode: 'advanced'
      }
    };
  }

  /**
   * Evalúa usando IA
   */
  private async evaluateWithAI(context: NodeExecutionContext, data: ConditionNodeData): Promise<{ result: boolean; details: any }> {
    try {
      if (!data.aiPrompt) {
        throw new Error('No hay prompt de IA configurado');
      }

      // Preparar contexto para la IA
      const aiContext = {
        userMessage: context.userMessage || '',
        variables: context.variables,
        prompt: data.aiPrompt,
        previousSteps: context.previousStep ? [context.previousStep] : []
      };

      console.log('🤖 Evaluando con IA:', aiContext);

      // Simular respuesta de IA (en producción sería una llamada real)
      const aiResponse = await this.simulateAIEvaluation(aiContext);

      return {
        result: aiResponse.result,
        details: {
          mode: 'ai',
          aiResponse,
          prompt: data.aiPrompt,
          confidence: aiResponse.confidence
        }
      };
    } catch (error) {
      console.error('Error en evaluación IA:', error);
      
      // Fallback a reglas simples si la IA falla
      console.log('🔄 Fallback a reglas simples...');
      const fallbackResult = this.evaluateSimpleRules(context, data);
      
      return {
        result: fallbackResult.result,
        details: {
          ...fallbackResult.details,
          mode: 'ai_fallback',
          aiError: error instanceof Error ? error.message : 'Error desconocido'
        }
      };
    }
  }

  /**
   * Simula evaluación con IA (placeholder)
   */
  private async simulateAIEvaluation(aiContext: any): Promise<{ result: boolean; confidence: number; reasoning: string }> {
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));

    const userMessage = aiContext.userMessage.toLowerCase();
    
    // Lógica simple de simulación basada en palabras clave
    let result = false;
    let confidence = 0.8;
    let reasoning = '';

    if (userMessage.includes('si') || userMessage.includes('sí') || userMessage.includes('ok') || userMessage.includes('acepto')) {
      result = true;
      reasoning = 'Usuario expresó confirmación';
    } else if (userMessage.includes('no') || userMessage.includes('cancel') || userMessage.includes('negar')) {
      result = false;
      reasoning = 'Usuario expresó negación';
    } else if (userMessage.includes('comprar') || userMessage.includes('producto') || userMessage.includes('precio')) {
      result = true;
      reasoning = 'Intención de compra detectada';
    } else {
      result = Math.random() > 0.5; // Resultado aleatorio para casos no definidos
      confidence = 0.5;
      reasoning = 'Evaluación basada en contexto general';
    }

    return { result, confidence, reasoning };
  }

  /**
   * Evalúa una regla individual
   */
  protected evaluateRule(fieldValue: any, rule: ConditionRule): boolean {
    const value = rule.value;

    switch (rule.operator) {
      case 'equals':
        return String(fieldValue) === String(value);
      
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
      
      case 'greater_than':
        return Number(fieldValue) > Number(value);
      
      case 'less_than':
        return Number(fieldValue) < Number(value);
      
      case 'is_empty':
        return !fieldValue || fieldValue === '' || fieldValue === null || fieldValue === undefined;
      
      case 'regex_match':
        try {
          const regex = new RegExp(value);
          return regex.test(String(fieldValue));
        } catch {
          return false;
        }
      
      default:
        console.warn(`Operador no reconocido: ${rule.operator}`);
        return false;
    }
  }

  /**
   * Obtiene el valor de un campo de las variables o contexto
   */
  protected getFieldValue(field: string, context: NodeExecutionContext): any {
    // Buscar en variables primero
    if (context.variables[field] !== undefined) {
      return context.variables[field];
    }

    // Buscar en mensaje del usuario
    if (field === 'userMessage' || field === 'message') {
      return context.userMessage || '';
    }

    // Buscar en input del usuario
    if (field === 'userInput' || field === 'input') {
      return context.userInput;
    }

    // Campos especiales
    switch (field) {
      case 'userId':
        return context.variables.userId;
      case 'phoneNumber':
        return context.variables.phoneNumber;
      case 'threadId':
        return context.threadId;
      case 'currentTime':
        return new Date().toISOString();
      case 'currentHour':
        return new Date().getHours();
      case 'currentDay':
        return new Date().getDay(); // 0 = Domingo
      default:
        return undefined;
    }
  }
}

/**
 * Ejecutor para condiciones avanzadas con múltiples grupos y lógica compleja
 */
export class AdvancedConditionExecutor extends ConditionExecutor {
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    try {
      const data = context.flowData;
      
      // Evaluar grupos de reglas
      const groupResults = await this.evaluateRuleGroups(context, data);
      
      // Aplicar lógica entre grupos
      const finalResult = this.combineGroupResults(groupResults, data.groupsLogic || 'AND');

      // Determinar siguiente nodo
      const nextNodeId = this.determineNextNode(finalResult, data);

      return {
        success: true,
        output: {
          conditionResult: finalResult,
          groupResults,
          mode: data.mode,
          nextPath: finalResult ? 'true' : 'false'
        },
        nextNodeId,
        waitingForInput: false
      };
    } catch (error) {
      console.error('Error en AdvancedConditionExecutor:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en condición avanzada',
        waitingForInput: false
      };
    }
  }

  /**
   * Evalúa grupos de reglas
   */
  private async evaluateRuleGroups(context: NodeExecutionContext, data: any): Promise<any[]> {
    const results = [];

    for (const group of data.ruleGroups || []) {
      if (!group.enabled) continue;

      const groupResult = await this.evaluateGroup(context, group);
      results.push({
        groupId: group.id,
        groupName: group.name,
        result: groupResult,
        enabled: group.enabled
      });
    }

    return results;
  }

  /**
   * Evalúa un grupo individual de reglas
   */
  private async evaluateGroup(context: NodeExecutionContext, group: any): Promise<boolean> {
    const ruleResults = [];

    for (const rule of group.rules || []) {
      if (!rule.enabled) continue;

      const fieldValue = this.getFieldValue(rule.field, context);
      const ruleResult = this.evaluateRule(fieldValue, rule);
      ruleResults.push(ruleResult);
    }

    // Aplicar lógica del grupo (AND/OR)
    if (group.groupLogic === 'OR') {
      return ruleResults.some(result => result);
    } else {
      return ruleResults.every(result => result);
    }
  }

  /**
   * Combina resultados de grupos
   */
  private combineGroupResults(groupResults: any[], groupsLogic: string): boolean {
    const enabledResults = groupResults.filter(g => g.enabled).map(g => g.result);

    if (enabledResults.length === 0) return false;

    if (groupsLogic === 'OR') {
      return enabledResults.some(result => result);
    } else {
      return enabledResults.every(result => result);
    }
  }

  /**
   * Determina el siguiente nodo basado en la configuración
   */
  private determineNextNode(result: boolean, data: any): string | undefined {
    if (result) {
      return data.outputs?.trueHandle || data.trueNodeId;
    } else {
      return data.outputs?.falseHandle || data.falseNodeId;
    }
  }

  // Sobrescribir métodos padre para acceso protegido
  protected getFieldValue(field: string, context: NodeExecutionContext): any {
    return super['getFieldValue'](field, context);
  }

  protected evaluateRule(fieldValue: any, rule: any): boolean {
    return super['evaluateRule'](fieldValue, rule);
  }
} 