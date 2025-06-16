import { flowEngine } from './flow-engine.service';

// Importar todos los ejecutores
import { MessageExecutor, EnhancedMessageExecutor } from './node-executors/message-executor';
import { ConditionExecutor, AdvancedConditionExecutor } from './node-executors/condition-executor';
import { DatabaseExecutor, HubSpotDatabaseExecutor } from './node-executors/database-executor';
import { WebhookExecutor } from './node-executors/webhook-executor';

/**
 * Registro de ejecutores para todos los tipos de nodos
 * Inicializa y conecta cada tipo de nodo con su ejecutor correspondiente
 */
export class ExecutorRegistry {
  /**
   * Registra todos los ejecutores disponibles
   */
  static registerAllExecutors(): void {
    console.log('🔧 Registrando ejecutores de nodos...');

    // Nodos de comunicación WhatsApp
    flowEngine.registerNodeExecutor('message', new MessageExecutor());
    flowEngine.registerNodeExecutor('enhancedMessage', new EnhancedMessageExecutor());
    flowEngine.registerNodeExecutor('typing', new TypingExecutor());
    flowEngine.registerNodeExecutor('buttons', new ButtonsExecutor());
    flowEngine.registerNodeExecutor('survey', new SurveyExecutor());
    flowEngine.registerNodeExecutor('location', new LocationExecutor());

    // Nodos de lógica y control
    flowEngine.registerNodeExecutor('condition', new ConditionExecutor());
    flowEngine.registerNodeExecutor('smartCondition', new ConditionExecutor());
    flowEngine.registerNodeExecutor('advancedCondition', new AdvancedConditionExecutor());
    flowEngine.registerNodeExecutor('timeout', new TimeoutExecutor());

    // Nodos de datos y CRM
    flowEngine.registerNodeExecutor('database', new DatabaseExecutor());
    flowEngine.registerNodeExecutor('customerStage', new CustomerStageExecutor());
    flowEngine.registerNodeExecutor('tag', new TagExecutor());
    flowEngine.registerNodeExecutor('assignment', new AssignmentExecutor());

    // Nodos de IA y automatización
    flowEngine.registerNodeExecutor('aiResponse', new AIResponseExecutor());
    flowEngine.registerNodeExecutor('recognition', new RecognitionExecutor());
    flowEngine.registerNodeExecutor('formatter', new FormatterExecutor());

    // Nodos de integraciones
    flowEngine.registerNodeExecutor('webhook', new WebhookExecutor());
    flowEngine.registerNodeExecutor('httpRequest', new WebhookExecutor());
    flowEngine.registerNodeExecutor('hubspot', new HubSpotDatabaseExecutor());
    flowEngine.registerNodeExecutor('metaConversions', new MetaConversionsExecutor());

    // Nodos especializados
    flowEngine.registerNodeExecutor('whatsappFlow', new WhatsAppFlowExecutor());
    flowEngine.registerNodeExecutor('smarton', new SmartonExecutor());

    console.log('✅ Todos los ejecutores registrados correctamente');
  }

  /**
   * Registra un ejecutor personalizado
   */
  static registerCustomExecutor(nodeType: string, executor: any): void {
    flowEngine.registerNodeExecutor(nodeType, executor);
  }
}

// Implementaciones de ejecutores adicionales

/**
 * Ejecutor para nodos de tipificación
 */
class TypingExecutor {
  async execute(context: any) {
    const data = context.flowData;
    const duration = data.duration || 2000;

    console.log(`⌨️ Simulando tipificación por ${duration}ms...`);
    
    // Simular delay de tipificación
    await new Promise(resolve => setTimeout(resolve, duration));

    return {
      success: true,
      output: {
        typingDuration: duration,
        timestamp: new Date().toISOString()
      },
      waitingForInput: false
    };
  }
}

/**
 * Ejecutor para nodos de botones interactivos
 */
class ButtonsExecutor {
  async execute(context: any) {
    const data = context.flowData;
    const message = data.message || '¿Qué opción prefieres?';
    const buttons = data.buttons || [];

    console.log(`🔘 Enviando botones interactivos: ${message}`);
    console.log('Opciones:', buttons.map((b: any) => b.text).join(', '));

    // Simular envío de mensaje con botones
    await this.sendWhatsAppButtons(context.variables.phoneNumber, message, buttons);

    return {
      success: true,
      output: {
        messageType: 'interactive_buttons',
        message,
        buttons,
        timestamp: new Date().toISOString()
      },
      waitingForInput: true // Los botones esperan respuesta del usuario
    };
  }

  private async sendWhatsAppButtons(phoneNumber: string, message: string, buttons: any[]) {
    // Simular API call de WhatsApp Business
    console.log(`📱 Enviando a ${phoneNumber}:`);
    console.log(`💬 ${message}`);
    buttons.forEach((button: any, index: number) => {
      console.log(`  ${index + 1}. ${button.text}`);
    });
  }
}

/**
 * Ejecutor para nodos de encuesta
 */
class SurveyExecutor {
  async execute(context: any) {
    const data = context.flowData;
    const surveyType = data.surveyType || 'satisfaction';
    const questions = data.questions || [];

    console.log(`📊 Iniciando encuesta tipo: ${surveyType}`);

    // Obtener la pregunta actual
    const currentQuestionIndex = context.getVariable('surveyQuestionIndex') || 0;
    const currentQuestion = questions[currentQuestionIndex];

    if (!currentQuestion) {
      // Encuesta completada
      return {
        success: true,
        output: {
          surveyCompleted: true,
          responses: context.getVariable('surveyResponses') || {},
          timestamp: new Date().toISOString()
        },
        waitingForInput: false
      };
    }

    // Procesar respuesta anterior si existe
    if (context.userMessage && currentQuestionIndex > 0) {
      const responses = context.getVariable('surveyResponses') || {};
      const previousQuestion = questions[currentQuestionIndex - 1];
      responses[previousQuestion.id] = context.userMessage;
      context.setVariable('surveyResponses', responses);
    }

    // Enviar siguiente pregunta
    await this.sendSurveyQuestion(context.variables.phoneNumber, currentQuestion);

    // Actualizar índice para la siguiente pregunta
    context.setVariable('surveyQuestionIndex', currentQuestionIndex + 1);

    return {
      success: true,
      output: {
        currentQuestion: currentQuestion.text,
        questionIndex: currentQuestionIndex,
        totalQuestions: questions.length
      },
      waitingForInput: true
    };
  }

  private async sendSurveyQuestion(phoneNumber: string, question: any) {
    console.log(`📋 Pregunta: ${question.text}`);
    if (question.options) {
      console.log('Opciones:', question.options.join(', '));
    }
  }
}

/**
 * Ejecutor para nodos de ubicación
 */
class LocationExecutor {
  async execute(context: any) {
    const data = context.flowData;
    const requestMessage = data.requestMessage || 'Por favor comparte tu ubicación';

    console.log(`📍 Solicitando ubicación: ${requestMessage}`);

    // Simular solicitud de ubicación
    await this.requestLocation(context.variables.phoneNumber, requestMessage);

    return {
      success: true,
      output: {
        locationRequested: true,
        message: requestMessage,
        timestamp: new Date().toISOString()
      },
      waitingForInput: true // Espera que el usuario comparta ubicación
    };
  }

  private async requestLocation(phoneNumber: string, message: string) {
    console.log(`📱 Solicitando ubicación a ${phoneNumber}: ${message}`);
  }
}

/**
 * Ejecutor para nodos de timeout/delay
 */
class TimeoutExecutor {
  async execute(context: any) {
    const data = context.flowData;
    const delay = data.delay || 5000;
    const timeoutAction = data.timeoutAction || 'continue';

    console.log(`⏰ Ejecutando timeout de ${delay}ms...`);

    await new Promise(resolve => setTimeout(resolve, delay));

    return {
      success: true,
      output: {
        delayExecuted: delay,
        action: timeoutAction,
        timestamp: new Date().toISOString()
      },
      waitingForInput: false
    };
  }
}

/**
 * Ejecutor para nodos de etapa de cliente
 */
class CustomerStageExecutor {
  async execute(context: any) {
    const data = context.flowData;
    const newStage = data.stage || 'lead';

    console.log(`👤 Actualizando etapa del cliente a: ${newStage}`);

    // Actualizar etapa en variables
    context.setVariable('customerStage', newStage);
    context.setVariable('stageUpdatedAt', new Date().toISOString());

    return {
      success: true,
      output: {
        previousStage: context.getVariable('customerStage'),
        newStage,
        timestamp: new Date().toISOString()
      },
      waitingForInput: false,
      variables: {
        customerStage: newStage,
        stageUpdatedAt: new Date().toISOString()
      }
    };
  }
}

/**
 * Ejecutor para nodos de etiquetas
 */
class TagExecutor {
  async execute(context: any) {
    const data = context.flowData;
    const action = data.action || 'add'; // add, remove, set
    const tags = data.tags || [];

    console.log(`🏷️ Ejecutando acción de etiquetas: ${action}`, tags);

    let currentTags = context.getVariable('userTags') || [];

    switch (action) {
      case 'add':
        currentTags = [...new Set([...currentTags, ...tags])];
        break;
      case 'remove':
        currentTags = currentTags.filter((tag: string) => !tags.includes(tag));
        break;
      case 'set':
        currentTags = tags;
        break;
    }

    context.setVariable('userTags', currentTags);

    return {
      success: true,
      output: {
        action,
        tags,
        currentTags,
        timestamp: new Date().toISOString()
      },
      waitingForInput: false,
      variables: {
        userTags: currentTags
      }
    };
  }
}

/**
 * Ejecutores placeholder para nodos complejos
 * Estos serían implementados completamente según las necesidades específicas
 */
class AssignmentExecutor {
  async execute(context: any) {
    const data = context.flowData;
    console.log('📝 Ejecutando asignación de variables:', data);
    
    // Implementar lógica de asignación
    if (data.assignments) {
      data.assignments.forEach((assignment: any) => {
        context.setVariable(assignment.variable, assignment.value);
      });
    }

    return { success: true, output: { assigned: true }, waitingForInput: false };
  }
}

class AIResponseExecutor {
  async execute(context: any) {
    console.log('🤖 Ejecutando respuesta con IA...');
    // Simular llamada a IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const aiResponse = `Respuesta generada por IA basada en: "${context.userMessage}"`;
    
    return {
      success: true,
      output: { aiResponse, confidence: 0.85 },
      waitingForInput: false
    };
  }
}

class RecognitionExecutor {
  async execute(context: any) {
    console.log('🎯 Ejecutando reconocimiento de patrones...');
    return { success: true, output: { recognized: true }, waitingForInput: false };
  }
}

class FormatterExecutor {
  async execute(context: any) {
    console.log('🔧 Ejecutando formateo de datos...');
    return { success: true, output: { formatted: true }, waitingForInput: false };
  }
}

class MetaConversionsExecutor {
  async execute(context: any) {
    console.log('📊 Ejecutando conversiones Meta...');
    return { success: true, output: { conversionSent: true }, waitingForInput: false };
  }
}

class WhatsAppFlowExecutor {
  async execute(context: any) {
    console.log('📱 Ejecutando WhatsApp Flow...');
    return { success: true, output: { flowExecuted: true }, waitingForInput: false };
  }
}

class SmartonExecutor {
  async execute(context: any) {
    console.log('⚡ Ejecutando Smarton...');
    return { success: true, output: { smartonExecuted: true }, waitingForInput: false };
  }
} 