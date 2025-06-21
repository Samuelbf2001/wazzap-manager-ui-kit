# Arquitectura de Integración - WhatsApp Manager

## Resumen Ejecutivo

Esta documentación describe la arquitectura completa para integrar **Evolution API**, **N8N** y **HubSpot** en una solución unificada de gestión de conversaciones de WhatsApp. El sistema permite manejar múltiples instancias de WhatsApp, automatizar flujos de trabajo y sincronizar datos con el CRM.

## Componentes Principales

### 1. Evolution API
- **Propósito**: Gestión de instancias de WhatsApp
- **Funcionalidades**:
  - Crear/eliminar instancias de WhatsApp
  - Enviar/recibir mensajes
  - Gestionar contactos y grupos
  - Webhooks en tiempo real

### 2. N8N
- **Propósito**: Automatización de workflows
- **Funcionalidades**:
  - Procesamiento automático de mensajes
  - Integración entre sistemas
  - Flujos de trabajo personalizables
  - Triggers y acciones

### 3. HubSpot
- **Propósito**: CRM y gestión de contactos
- **Funcionalidades**:
  - Sincronización de contactos
  - Seguimiento de interacciones
  - Gestión de deals y actividades
  - Reportes y analytics

### 4. Base de Datos
- **Propósito**: Almacenamiento centralizado
- **Soporta**: SQLite, PostgreSQL, MySQL
- **Datos**:
  - Conversaciones y mensajes
  - Contactos y agentes
  - Logs y estadísticas
  - Configuraciones

## Arquitectura de Servicios

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Evolution API     │    │        N8N          │    │      HubSpot        │
│   (WhatsApp)        │    │   (Workflows)       │    │       (CRM)         │
└─────────┬───────────┘    └─────────┬───────────┘    └─────────┬───────────┘
          │                          │                          │
          │ Webhooks                 │ API Calls                │ API Sync
          │                          │                          │
          └──────────────────────────┼──────────────────────────┘
                                     │
                              ┌──────▼──────┐
                              │   Webhook   │
                              │   Handler   │
                              │   Service   │
                              └──────┬──────┘
                                     │
                              ┌──────▼──────┐
                              │ Integration │
                              │   Manager   │
                              │   Service   │
                              └──────┬──────┘
                                     │
                              ┌──────▼──────┐
                              │  Database   │
                              │   Service   │
                              └─────────────┘
```

## Estructura de Código

### Tipos (src/types/)
- `evolution-api.ts` - Tipos para Evolution API
- `database.ts` - Esquemas de base de datos
- `conversation.ts` - Tipos de conversaciones y flujos

### Servicios (src/services/)
- `evolution-api.service.ts` - Cliente Evolution API
- `n8n.service.ts` - Cliente N8N
- `hubspot.service.ts` - Cliente HubSpot
- `database.service.ts` - Gestión de base de datos
- `webhook-handler.service.ts` - Procesamiento de webhooks
- `integration-manager.service.ts` - Coordinador principal

### Configuración (src/config/)
- `evolution-api.ts` - Configuraciones centralizadas

## Flujo de Datos

### 1. Recepción de Mensajes
```mermaid
sequenceDiagram
    participant WA as WhatsApp
    participant EA as Evolution API
    participant WH as Webhook Handler
    participant DB as Database
    participant N8N as N8N
    participant HS as HubSpot

    WA->>EA: Mensaje entrante
    EA->>WH: Webhook Event
    WH->>DB: Guardar mensaje
    WH->>N8N: Procesar workflow
    WH->>HS: Sincronizar contacto
    N8N->>WH: Resultado de procesamiento
    WH->>DB: Actualizar estado
```

### 2. Envío de Mensajes
```mermaid
sequenceDiagram
    participant UI as UI/API
    participant IM as Integration Manager
    participant EA as Evolution API
    participant DB as Database
    participant WA as WhatsApp

    UI->>IM: Enviar mensaje
    IM->>EA: API call
    EA->>WA: Entregar mensaje
    EA->>IM: Confirmación
    IM->>DB: Guardar en BD
    IM->>UI: Respuesta
```

## Configuración e Instalación

### 1. Variables de Entorno
```bash
# Evolution API
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=tu-api-key

# N8N
N8N_URL=http://localhost:5678
N8N_API_KEY=tu-n8n-api-key

# HubSpot
HUBSPOT_API_KEY=tu-hubspot-api-key
HUBSPOT_PORTAL_ID=tu-portal-id

# Base de Datos
DATABASE_URL=postgresql://user:pass@localhost:5432/whatsapp_manager

# Webhooks
WEBHOOK_URL=https://tu-dominio.com/webhook
```

### 2. Inicialización del Sistema
```typescript
import IntegrationManagerService from './services/integration-manager.service';

const integrationManager = new IntegrationManagerService({
  accountId: 'mi-cuenta',
  evolutionApi: {
    enabled: true,
    instances: ['instancia1', 'instancia2']
  },
  n8n: {
    enabled: true,
    autoCreateWorkflows: true
  },
  hubspot: {
    enabled: true,
    autoSync: true,
    portalId: 'mi-portal-id',
    accessToken: 'mi-access-token'
  },
  database: {
    type: 'postgresql',
    connectionString: 'postgresql://...'
  }
});

await integrationManager.initialize();
```

## API de Uso

### Crear Instancia de WhatsApp
```typescript
const result = await integrationManager.createWhatsAppInstance('mi-instancia');
if (result.success) {
  console.log('QR Code:', result.qrCode);
}
```

### Enviar Mensaje
```typescript
const result = await integrationManager.sendMessage(
  'mi-instancia',
  '5511999999999',
  'Hola, ¿cómo estás?'
);
```

### Procesar Webhook
```typescript
app.post('/webhook/evolution', async (req, res) => {
  const result = await integrationManager.processEvolutionWebhook(req.body);
  res.json(result);
});
```

### Obtener Estado del Sistema
```typescript
const status = await integrationManager.getIntegrationStatus();
console.log('Estado:', status);
```

## Webhooks y Eventos

### Eventos de Evolution API
- `messages.upsert` - Nuevo mensaje
- `messages.update` - Estado de mensaje actualizado
- `contacts.upsert` - Contacto nuevo/actualizado
- `connection.update` - Estado de conexión

### Procesamiento de Webhooks
1. **Validación** - Verificar origen y estructura
2. **Deduplicación** - Evitar procesamiento múltiple
3. **Procesamiento** - Guardar en BD, ejecutar workflows
4. **Sincronización** - Actualizar HubSpot y N8N
5. **Logging** - Registrar para auditoría

## Base de Datos

### Tablas Principales
- **accounts** - Cuentas de usuarios
- **contacts** - Contactos de WhatsApp
- **conversations** - Hilos de conversación
- **messages** - Mensajes individuales
- **agents** - Agentes del sistema
- **campaigns** - Campañas de marketing
- **system_logs** - Logs del sistema
- **webhook_logs** - Logs de webhooks

### Relaciones
```sql
accounts (1) -> (N) contacts
contacts (1) -> (N) conversations  
conversations (1) -> (N) messages
agents (1) -> (N) conversations
```

## Workflows de N8N

### Workflow de WhatsApp
1. **Trigger**: Webhook de Evolution API
2. **Procesamiento**: Extraer datos del mensaje
3. **Validación**: Verificar formato y contenido
4. **Enrutamiento**: Dirigir según reglas de negocio
5. **Respuesta**: Generar respuesta automática (opcional)

### Workflow de HubSpot
1. **Trigger**: Webhook de actualización de contacto
2. **Sincronización**: Obtener datos de HubSpot
3. **Mapeo**: Convertir campos entre sistemas
4. **Actualización**: Actualizar base de datos local

## Monitoreo y Logging

### Tipos de Logs
- **Sistema** - Errores y eventos importantes
- **Webhooks** - Procesamiento de webhooks
- **API** - Llamadas a servicios externos
- **Base de Datos** - Operaciones de BD

### Métricas
- Mensajes procesados por minuto
- Tiempo de respuesta promedio
- Tasa de error por servicio
- Estado de conexiones

## Seguridad

### Autenticación
- API Keys para servicios externos
- Tokens de webhook validados
- Conexiones HTTPS obligatorias

### Validaciones
- Verificación de origen de webhooks
- Sanitización de datos de entrada
- Rate limiting en endpoints

## Escalabilidad

### Horizontal
- Múltiples instancias del webhook handler
- Load balancer para distribución
- Bases de datos replicadas

### Vertical
- Pool de conexiones de BD
- Cache en memoria para datos frecuentes
- Procesamiento asíncrono de webhooks

## Mantenimiento

### Tareas Rutinarias
- Limpieza de logs antiguos
- Backup de base de datos
- Monitoreo de conexiones
- Actualización de tokens

### Troubleshooting
- Verificar logs de sistema
- Validar conectividad de servicios
- Revisar configuración de webhooks
- Comprobar estado de instancias

## Próximos Pasos

### Mejoras Planificadas
1. **Panel de Control** - Interfaz web para gestión
2. **Analytics Avanzados** - Reportes detallados
3. **AI Integration** - Respuestas automáticas inteligentes
4. **Multi-tenancy** - Soporte para múltiples cuentas
5. **Mobile App** - Aplicación móvil para agentes

### Integraciones Futuras
- Telegram
- Instagram Direct
- Facebook Messenger
- SMS/Email
- Slack/Teams

---

## Contacto y Soporte

Para dudas sobre implementación o configuración, consultar la documentación de cada servicio o contactar al equipo de desarrollo.