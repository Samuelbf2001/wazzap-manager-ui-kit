import {
  ConversationThread,
  ConversationStep,
  FlowExecution,
  ExecutionStep,
  NodeExecutionContext,
  NodeExecutionResult,
  FlowDefinition,
  FlowNode,
  NodeExecutor
} from '@/types/conversation';

/**
 * Motor de ejecución de flujos basado en conversaciones
 * Maneja la ejecución paso a paso de flujos con persistencia de estado
 */
export class FlowEngine {
  private activeThreads = new Map<string, ConversationThread>();
  private nodeExecutors = new Map<string, NodeExecutor>();
  private flowDefinitions = new Map<string, FlowDefinition>();

  /**
   * Registra un ejecutor para un tipo de nodo específico
   */
  registerNodeExecutor(nodeType: string, executor: NodeExecutor) {
    this.nodeExecutors.set(nodeType, executor);
    console.log(`✅ Ejecutor registrado para nodo tipo: ${nodeType}`);
  }

  /**
   * Registra una definición de flujo
   */
  registerFlow(flow: FlowDefinition) {
    this.flowDefinitions.set(flow.id, flow);
    console.log(`✅ Flujo registrado: ${flow.name} (${flow.id})`);
  }

  /**
   * Inicia una nueva conversación y thread
   */
  async startConversation(
    userId: string,
    phoneNumber: string,
    flowId: string,
    startNodeId?: string,
    initialVariables?: Record<string, any>
  ): Promise<ConversationThread> {
    const threadId = this.generateThreadId();
    const flow = this.flowDefinitions.get(flowId);
    
    if (!flow) {
      throw new Error(`Flujo no encontrado: ${flowId}`);
    }

    const startNode = startNodeId || this.findStartNode(flow);
    if (!startNode) {
      throw new Error(`Nodo de inicio no encontrado en flujo: ${flowId}`);
    }

    const thread: ConversationThread = {
      id: threadId,
      userId,
      phoneNumber,
      status: 'active',
      currentNodeId: startNode,
      startedAt: new Date(),
      lastActivity: new Date(),
      metadata: {
        flowId,
        flowName: flow.name,
        flowVersion: flow.version
      },
      variables: {
        userId,
        phoneNumber,
        threadId,
        startTime: new Date().toISOString(),
        ...initialVariables
      },
      history: []
    };

    this.activeThreads.set(threadId, thread);
    await this.saveThread(thread);

    console.log(`🚀 Nueva conversación iniciada: ${threadId} (${phoneNumber})`);
    
    // Ejecutar el primer nodo automáticamente
    await this.executeCurrentNode(threadId);
    
    return thread;
  }

  /**
   * Procesa un mensaje del usuario en una conversación existente
   */
  async processUserMessage(
    threadId: string,
    userMessage: string,
    userInput?: any
  ): Promise<ConversationThread> {
    const thread = this.activeThreads.get(threadId);
    if (!thread) {
      throw new Error(`Thread no encontrado: ${threadId}`);
    }

    if (thread.status !== 'active') {
      throw new Error(`Thread no está activo: ${thread.status}`);
    }

    // Actualizar última actividad
    thread.lastActivity = new Date();

    // Ejecutar nodo actual con el input del usuario
    await this.executeCurrentNode(threadId, userMessage, userInput);

    await this.saveThread(thread);
    return thread;
  }

  /**
   * Ejecuta el nodo actual del thread
   */
  private async executeCurrentNode(
    threadId: string,
    userMessage?: string,
    userInput?: any
  ): Promise<void> {
    const thread = this.activeThreads.get(threadId);
    if (!thread) {
      throw new Error(`Thread no encontrado: ${threadId}`);
    }

    const flow = this.flowDefinitions.get(thread.metadata.flowId);
    if (!flow) {
      throw new Error(`Flujo no encontrado: ${thread.metadata.flowId}`);
    }

    const currentNode = flow.nodes.find(n => n.id === thread.currentNodeId);
    if (!currentNode) {
      throw new Error(`Nodo no encontrado: ${thread.currentNodeId}`);
    }

    const executor = this.nodeExecutors.get(currentNode.type);
    if (!executor) {
      throw new Error(`Ejecutor no encontrado para tipo: ${currentNode.type}`);
    }

    const context: NodeExecutionContext = {
      threadId,
      currentNode: thread.currentNodeId,
      variables: thread.variables,
      userMessage,
      userInput,
      previousStep: thread.history[thread.history.length - 1],
      flowData: currentNode.data,
      executeNext: this.createExecuteNextFunction(threadId),
      setVariable: this.createSetVariableFunction(threadId),
      getVariable: this.createGetVariableFunction(threadId),
      waitForInput: this.createWaitForInputFunction(threadId),
      logStep: this.createLogStepFunction(threadId)
    };

    try {
      const startTime = Date.now();
      console.log(`🔄 Ejecutando nodo ${currentNode.type}: ${thread.currentNodeId}`);
      
      const result = await executor.execute(context);
      const executionTime = Date.now() - startTime;

      // Registrar el paso en el historial
      const step: ConversationStep = {
        id: this.generateStepId(),
        nodeId: thread.currentNodeId,
        nodeType: currentNode.type,
        timestamp: new Date(),
        input: { userMessage, userInput },
        output: result.output,
        status: result.success ? 'completed' : 'error',
        executionTime,
        error: result.error,
        metadata: {
          nextNodeId: result.nextNodeId,
          waitingForInput: result.waitingForInput
        }
      };

      thread.history.push(step);

      // Actualizar variables si las hay
      if (result.variables) {
        Object.assign(thread.variables, result.variables);
      }

      // Manejar resultado de la ejecución
      if (!result.success) {
        thread.status = 'error';
        console.error(`❌ Error en nodo ${thread.currentNodeId}: ${result.error}`);
      } else if (result.waitingForInput) {
        // El nodo está esperando input del usuario
        console.log(`⏳ Nodo ${thread.currentNodeId} esperando input del usuario`);
      } else if (result.nextNodeId) {
        // Continuar al siguiente nodo
        thread.currentNodeId = result.nextNodeId;
        console.log(`➡️ Avanzando al nodo: ${result.nextNodeId}`);
        
        // Ejecutar el siguiente nodo automáticamente si no requiere input
        const nextNode = flow.nodes.find(n => n.id === result.nextNodeId);
        if (nextNode && !this.nodeRequiresUserInput(nextNode.type)) {
          await this.executeCurrentNode(threadId);
        }
      } else {
        // Flujo completado
        thread.status = 'completed';
        console.log(`✅ Flujo completado para thread: ${threadId}`);
      }

    } catch (error) {
      console.error(`❌ Error ejecutando nodo ${thread.currentNodeId}:`, error);
      
      const step: ConversationStep = {
        id: this.generateStepId(),
        nodeId: thread.currentNodeId,
        nodeType: currentNode.type,
        timestamp: new Date(),
        input: { userMessage, userInput },
        status: 'error',
        error: error instanceof Error ? error.message : 'Error desconocido',
        executionTime: 0
      };

      thread.history.push(step);
      thread.status = 'error';
    }
  }

  /**
   * Funciones de contexto para los nodos
   */
  private createExecuteNextFunction(threadId: string) {
    return async (nodeId: string, output?: any) => {
      const thread = this.activeThreads.get(threadId);
      if (thread) {
        thread.currentNodeId = nodeId;
        await this.executeCurrentNode(threadId);
      }
    };
  }

  private createSetVariableFunction(threadId: string) {
    return (key: string, value: any) => {
      const thread = this.activeThreads.get(threadId);
      if (thread) {
        thread.variables[key] = value;
        console.log(`📝 Variable actualizada: ${key} = ${JSON.stringify(value)}`);
      }
    };
  }

  private createGetVariableFunction(threadId: string) {
    return (key: string) => {
      const thread = this.activeThreads.get(threadId);
      return thread?.variables[key];
    };
  }

  private createWaitForInputFunction(threadId: string) {
    return async (prompt?: string) => {
      // Esta función se usa cuando un nodo necesita esperar input del usuario
      const thread = this.activeThreads.get(threadId);
      if (thread) {
        console.log(`⏳ Thread ${threadId} esperando input${prompt ? `: ${prompt}` : ''}`);
      }
      return new Promise(resolve => {
        // El input se resolverá cuando llegue el próximo mensaje del usuario
        // Por ahora solo logueamos
      });
    };
  }

  private createLogStepFunction(threadId: string) {
    return (output: any, nextNodeId?: string) => {
      console.log(`📊 Log del thread ${threadId}:`, { output, nextNodeId });
    };
  }

  /**
   * Obtiene el thread por ID
   */
  getThread(threadId: string): ConversationThread | undefined {
    return this.activeThreads.get(threadId);
  }

  /**
   * Obtiene todos los threads activos de un usuario
   */
  getUserThreads(userId: string): ConversationThread[] {
    return Array.from(this.activeThreads.values())
      .filter(thread => thread.userId === userId);
  }

  /**
   * Pausa un thread
   */
  pauseThread(threadId: string): void {
    const thread = this.activeThreads.get(threadId);
    if (thread) {
      thread.status = 'paused';
      console.log(`⏸️ Thread pausado: ${threadId}`);
    }
  }

  /**
   * Reanuda un thread pausado
   */
  resumeThread(threadId: string): void {
    const thread = this.activeThreads.get(threadId);
    if (thread && thread.status === 'paused') {
      thread.status = 'active';
      console.log(`▶️ Thread reanudado: ${threadId}`);
    }
  }

  /**
   * Utilidades privadas
   */
  private generateThreadId(): string {
    return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateStepId(): string {
    return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private findStartNode(flow: FlowDefinition): string | null {
    // Buscar nodo sin conexiones entrantes (nodo de inicio)
    const targetNodes = new Set(flow.edges.map(edge => edge.target));
    const startNode = flow.nodes.find(node => !targetNodes.has(node.id));
    return startNode?.id || null;
  }

  private nodeRequiresUserInput(nodeType: string): boolean {
    // Tipos de nodos que requieren input del usuario
    const inputRequiredTypes = [
      'buttons', 'survey', 'location', 'enhancedMessage', 
      'message', 'interactive', 'list'
    ];
    return inputRequiredTypes.includes(nodeType);
  }

  private async saveThread(thread: ConversationThread): Promise<void> {
    // Aquí se guardaría en base de datos
    // Por ahora solo actualizar en memoria
    this.activeThreads.set(thread.id, thread);
    
    // Simular guardado en BD
    console.log(`💾 Thread guardado: ${thread.id} (${thread.status})`);
  }

  /**
   * Limpia threads inactivos
   */
  cleanupInactiveThreads(maxAgeHours: number = 24): void {
    const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    
    for (const [threadId, thread] of this.activeThreads.entries()) {
      if (thread.lastActivity < cutoff && thread.status !== 'active') {
        this.activeThreads.delete(threadId);
        console.log(`🗑️ Thread limpiado: ${threadId}`);
      }
    }
  }
}

// Instancia singleton del motor
export const flowEngine = new FlowEngine(); 