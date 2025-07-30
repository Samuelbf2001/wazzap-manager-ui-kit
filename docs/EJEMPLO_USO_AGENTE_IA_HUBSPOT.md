# Ejemplo de Uso - Agente IA HubSpot MCP

## Configuración del Agente

### 1. Configuración Inicial

```typescript
import HubSpotAISyncService from './services/hubspot-ai-sync.service.simplified';

// Configurar el agente con credenciales de HubSpot
const agente = new HubSpotAISyncService({
  apiKey: process.env.HUBSPOT_API_KEY!,
  portalId: process.env.HUBSPOT_PORTAL_ID!
});
```

### 2. Propiedades Personalizadas en HubSpot

Antes de usar el agente, debes crear estas propiedades personalizadas en HubSpot:

#### Para Contactos:
```bash
# Ejecutar en HubSpot API o crear manualmente en el portal
curl -X POST https://api.hubapi.com/properties/v1/contacts/properties \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "whatsapp_phone_number",
    "label": "WhatsApp Phone Number",
    "type": "string",
    "fieldType": "text"
  }'

curl -X POST https://api.hubapi.com/properties/v1/contacts/properties \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "conversation_stage", 
    "label": "Conversation Stage",
    "type": "enumeration",
    "fieldType": "select",
    "options": [
      {"label": "Awareness", "value": "awareness"},
      {"label": "Consideration", "value": "consideration"}, 
      {"label": "Decision", "value": "decision"}
    ]
  }'

curl -X POST https://api.hubapi.com/properties/v1/contacts/properties \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "lead_quality_score",
    "label": "Lead Quality Score",
    "type": "number",
    "fieldType": "number"
  }'
```

## Ejemplos de Uso

### Ejemplo 1: Procesamiento de Mensaje Individual

```typescript
// Mensaje individual de un cliente
const mensajeIndividual = {
  type: 'single_message' as const,
  thread_id: 'whatsapp_thread_12345',
  message: {
    content: 'Hola, me llamo Juan Pérez y necesito información sobre sus servicios de marketing digital. Tengo un presupuesto de $5000 y necesito una solución urgente.',
    sender_type: 'user' as const,
    sender_name: 'Juan Pérez',
    timestamp: new Date().toISOString(),
    message_type: 'text' as const,
    metadata: {
      phone: '+52 55 1234 5678',
      source: 'whatsapp_web'
    }
  }
};

// Procesar con el agente de IA
const resultado = await agente.processConversationData(mensajeIndividual);

console.log('Resultado del procesamiento:', resultado);
/*
Resultado esperado:
{
  status: 'success',
  processed_items: {
    conversations: 0,
    messages: 1,
    contacts_updated: 1,
    deals_created: 1,
    deals_updated: 0
  },
  hubspot_sync: {
    contacts_synced: 1,
    deals_synced: 1,
    errors: [],
    warnings: []
  },
  insights: {
    lead_score: 7,  // Alto porque mencionó presupuesto y urgencia
    opportunity_identified: true,
    next_action_recommended: 'Enviar cotización o agendar llamada comercial',
    priority_level: 'urgent'
  },
  summary: 'Conversación con Juan - Lead Score: 7/10 - Tipo: sales - Etapa: decision - Prioridad: urgent'
}
*/
```

### Ejemplo 2: Conversación Completa

```typescript
const conversacionCompleta = {
  type: 'complete_conversation' as const,
  thread_id: 'whatsapp_thread_67890',
  conversation: {
    contact_info: {
      phone: '+52 55 9876 5432',
      name: 'María González'
    },
    messages: [
      {
        content: 'Hola, buenos días',
        sender_type: 'user' as const,
        sender_name: 'María González',
        timestamp: '2024-01-20T09:00:00Z',
        message_type: 'text' as const
      },
      {
        content: '¡Hola María! ¿En qué puedo ayudarte hoy?',
        sender_type: 'agent' as const,
        sender_name: 'Bot',
        timestamp: '2024-01-20T09:01:00Z',
        message_type: 'text' as const
      },
      {
        content: 'Tengo problemas con mi sitio web, necesito ayuda técnica rápido',
        sender_type: 'user' as const,
        sender_name: 'María González',
        timestamp: '2024-01-20T09:02:00Z',
        message_type: 'text' as const
      },
      {
        content: 'Mi email es maria.gonzalez@empresa.com y soy la gerente de marketing',
        sender_type: 'user' as const,
        sender_name: 'María González', 
        timestamp: '2024-01-20T09:03:00Z',
        message_type: 'text' as const
      }
    ],
    metadata: {
      source: 'whatsapp',
      language: 'es'
    }
  }
};

const resultado2 = await agente.processConversationData(conversacionCompleta);

console.log('Análisis de conversación completa:', resultado2);
/*
Resultado esperado:
{
  status: 'success',
  processed_items: {
    conversations: 1,
    messages: 4,
    contacts_updated: 1,
    deals_created: 0,  // No es venta, es soporte
    deals_updated: 0
  },
  insights: {
    lead_score: 4,  // Score medio - tiene autoridad pero es soporte
    opportunity_identified: false,
    next_action_recommended: 'Brindar soporte técnico o transferir a especialista',
    priority_level: 'high'  // Por la urgencia mencionada
  },
  summary: 'Conversación con María - Lead Score: 4/10 - Tipo: support - Etapa: awareness - Prioridad: high'
}
*/
```

### Ejemplo 3: Integración con Webhook de WhatsApp

```typescript
// Endpoint para recibir webhooks de WhatsApp
app.post('/webhook/whatsapp', async (req, res) => {
  try {
    const { message, thread_id } = req.body;
    
    // Convertir mensaje de webhook al formato del agente
    const conversationData = {
      type: 'single_message' as const,
      thread_id: thread_id,
      message: {
        content: message.text?.body || '',
        sender_type: 'user' as const,
        sender_name: message.from || 'Usuario',
        timestamp: new Date(message.timestamp * 1000).toISOString(),
        message_type: message.type as any,
        metadata: {
          phone: message.from,
          message_id: message.id
        }
      }
    };

    // Procesar con el agente de IA
    const resultado = await agente.processConversationData(conversationData);
    
    // Log del resultado
    console.log(`Mensaje procesado - Lead Score: ${resultado.insights.lead_score}/10`);
    
    // Si se identifica una oportunidad, notificar al equipo de ventas
    if (resultado.insights.opportunity_identified) {
      await notificarEquipoVentas({
        thread_id,
        lead_score: resultado.insights.lead_score,
        priority: resultado.insights.priority_level,
        next_action: resultado.insights.next_action_recommended
      });
    }

    res.status(200).json({ success: true, result: resultado });
  } catch (error) {
    console.error('Error procesando webhook:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
```

## Comandos Administrativos

### Sincronización Manual

```typescript
// Sincronizar conversación específica
try {
  const resultado = await agente.syncConversation('whatsapp_thread_12345');
  console.log('Sincronización completada:', resultado);
} catch (error) {
  console.error('Error en sincronización:', error.message);
}

// Sincronización masiva por rango de fechas
const fechaInicio = new Date('2024-01-01');
const fechaFin = new Date('2024-01-31');

try {
  const resultados = await agente.bulkSync({
    from: fechaInicio,
    to: fechaFin
  });
  console.log(`Sincronizadas ${resultados.length} conversaciones`);
} catch (error) {
  console.error('Error en sincronización masiva:', error.message);
}
```

### Validación y Análisis

```typescript
// Validar sincronización de contacto
const isValid = await agente.validateHubSpotSync('hubspot_contact_123');
console.log('Contacto sincronizado correctamente:', isValid);

// Análisis de sentimiento avanzado
const sentiment = await agente.analyzeSentiment('whatsapp_thread_12345');
console.log('Análisis de sentimiento:', sentiment);
```

## Monitoreo y Métricas

### Dashboard de Métricas

```typescript
// Función para obtener métricas del agente
async function obtenerMetricasAgente() {
  const metricas = {
    conversaciones_procesadas_hoy: 0,
    oportunidades_identificadas: 0,
    lead_score_promedio: 0,
    tiempo_sincronizacion_promedio: 0,
    errores_sincronizacion: 0
  };

  // Aquí implementarías la lógica para obtener métricas reales
  // desde tu base de datos o sistema de logging

  return metricas;
}

// Usar en un dashboard
setInterval(async () => {
  const metricas = await obtenerMetricasAgente();
  console.log('Métricas del agente IA:', metricas);
}, 300000); // Cada 5 minutos
```

## Configuración Avanzada

### Personalización de Reglas de Negocio

```typescript
class AgentePersonalizado extends HubSpotAISyncService {
  
  // Sobrescribir lógica de calificación de leads
  protected calculateLeadScore(insights: any, contactInfo: any): any {
    let score = super.calculateLeadScore(insights, contactInfo);
    
    // Agregar lógica personalizada
    if (contactInfo.company?.includes('Enterprise')) {
      score.score += 2; // Bonus para empresas enterprise
    }
    
    if (insights.products_interest.includes('premium')) {
      score.score += 1; // Bonus para interés en productos premium
    }
    
    return score;
  }

  // Personalizar detección de productos
  protected detectProductsOfInterest(text: string): string[] {
    const productosEspecificos = [
      'marketing automation',
      'crm integration', 
      'analytics dashboard',
      'whatsapp business api'
    ];
    
    return productosEspecificos.filter(producto => 
      text.toLowerCase().includes(producto)
    );
  }
}

// Usar agente personalizado
const agentePersonalizado = new AgentePersonalizado({
  apiKey: process.env.HUBSPOT_API_KEY!,
  portalId: process.env.HUBSPOT_PORTAL_ID!
});
```

## Consideraciones de Producción

### 1. Rate Limiting y Cola de Procesamiento

```typescript
import Bull from 'bull';

// Configurar cola para procesar mensajes
const colaHubSpot = new Bull('hubspot sync', {
  redis: process.env.REDIS_URL
});

// Procesar mensajes en cola para evitar rate limits
colaHubSpot.process(async (job) => {
  const { conversationData } = job.data;
  return await agente.processConversationData(conversationData);
});

// Agregar mensaje a la cola en lugar de procesar directamente
async function procesarMensajeAsync(conversationData: any) {
  await colaHubSpot.add('process message', { conversationData }, {
    delay: 1000, // Esperar 1 segundo entre procesamiento
    attempts: 3,  // Reintentar hasta 3 veces en caso de error
    backoff: 'exponential'
  });
}
```

### 2. Logging y Auditoría

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'hubspot-ai-agent.log' })
  ]
});

// Wrapper para logging de actividades del agente
class AgenteConLogging extends HubSpotAISyncService {
  async processConversationData(data: any) {
    const startTime = Date.now();
    
    try {
      logger.info('Iniciando procesamiento', {
        thread_id: data.thread_id,
        type: data.type
      });
      
      const resultado = await super.processConversationData(data);
      
      logger.info('Procesamiento completado', {
        thread_id: data.thread_id,
        lead_score: resultado.insights.lead_score,
        opportunity_identified: resultado.insights.opportunity_identified,
        processing_time: Date.now() - startTime
      });
      
      return resultado;
    } catch (error) {
      logger.error('Error en procesamiento', {
        thread_id: data.thread_id,
        error: error.message,
        processing_time: Date.now() - startTime
      });
      throw error;
    }
  }
}
```

### 3. Configuración de Variables de Entorno

```bash
# .env
HUBSPOT_API_KEY=your_hubspot_api_key_here
HUBSPOT_PORTAL_ID=your_portal_id_here
DATABASE_URL=postgresql://user:password@localhost:5432/wazzap_db
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_openai_key_for_ai_analysis
LOG_LEVEL=info
```

---

Este ejemplo muestra cómo implementar y usar el agente de IA con el prompt que creamos. El agente puede procesar conversaciones de WhatsApp, extraer información comercial relevante, y mantener HubSpot actualizado automáticamente con datos precisos y útiles para el seguimiento de leads.