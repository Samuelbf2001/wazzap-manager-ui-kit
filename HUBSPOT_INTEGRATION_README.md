# 🚀 Integración Completa HubSpot + WhatsApp

Esta documentación describe la implementación completa de la integración bidireccional entre HubSpot y WhatsApp, incluyendo custom channels, sincronización automática y webhooks.

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Características Implementadas](#características-implementadas)
3. [Configuración Inicial](#configuración-inicial)
4. [Custom Channels de HubSpot](#custom-channels-de-hubspot)
5. [Sincronización de Datos](#sincronización-de-datos)
6. [Webhooks Bidireccionales](#webhooks-bidireccionales)
7. [Mapeo de Propiedades](#mapeo-de-propiedades)
8. [Uso de la Interfaz](#uso-de-la-interfaz)
9. [API Reference](#api-reference)
10. [Troubleshooting](#troubleshooting)

## 🎯 Descripción General

La integración permite:

- **Sincronización bidireccional** de contactos entre WhatsApp y HubSpot
- **Creación automática** de deals desde conversaciones de WhatsApp
- **Custom channels** para tracking avanzado de conversaciones
- **Registro de comunicaciones** en el timeline de HubSpot
- **Webhooks en tiempo real** para sincronización instantánea

## ✨ Características Implementadas

### 🔄 Servicios Principales

#### 1. HubSpotService (`src/services/hubspot.service.ts`)
```typescript
// Funcionalidades principales:
- ✅ Gestión completa de contactos (CRUD)
- ✅ Gestión completa de deals (CRUD)
- ✅ Gestión de empresas
- ✅ Gestión de propiedades personalizadas
- ✅ Búsqueda avanzada por email/teléfono
- ✅ Asociaciones entre objetos
- ✅ Configuración de pipelines
- ✅ Registro de comunicaciones
- ✅ Setup de webhooks automático
```

#### 2. HubSpotSyncService (`src/services/hubspot-sync.service.ts`)
```typescript
// Características de sincronización:
- ✅ Sincronización automática de contactos desde WhatsApp
- ✅ Creación automática de deals desde conversaciones
- ✅ Cola de procesamiento asíncrono
- ✅ Mapeo personalizable de campos
- ✅ Manejo de errores y reintentos
- ✅ Logs detallados de sincronización
```

#### 3. HubSpotWebhookHandler (`src/services/hubspot-webhook-handler.service.ts`)
```typescript
// Manejo de webhooks:
- ✅ Webhooks de HubSpot (contactos, deals)
- ✅ Webhooks de WhatsApp (mensajes, conversaciones)
- ✅ Endpoints de estado y control
- ✅ Validación y logging automático
- ✅ CORS y middleware de seguridad
```

### 🖥️ Componentes de UI

#### 1. HubSpotConfigurationPanel (`src/components/HubSpotConfigurationPanel.tsx`)
```typescript
// Panel de configuración completo:
- ✅ Configuración de conexión (API Key, Portal ID)
- ✅ Setup de custom channels
- ✅ Configuración de sincronización
- ✅ Gestión de webhooks
- ✅ Mapeo de propiedades
- ✅ Test de conexión
- ✅ Sincronización manual
```

## ⚙️ Configuración Inicial

### 1. Obtener Credenciales de HubSpot

1. **API Key**: 
   - Ve a HubSpot → Settings → Integrations → Private Apps
   - Crea una nueva Private App
   - Asigna permisos para: `contacts`, `deals`, `companies`, `communications`

2. **Portal ID**: 
   - Encuentra tu Portal ID en la URL de HubSpot: `app.hubspot.com/contacts/{PORTAL_ID}`

### 2. Configurar Variables de Entorno

```bash
# .env
HUBSPOT_API_KEY=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
HUBSPOT_PORTAL_ID=12345678
HUBSPOT_WEBHOOK_URL=https://tu-dominio.com/webhooks
WHATSAPP_API_URL=https://evolution-api.com
WHATSAPP_API_KEY=tu-api-key-whatsapp
```

### 3. Instalar Dependencias

```bash
npm install axios express @types/express
```

## 📱 Custom Channels de HubSpot

### Propiedades Personalizadas Creadas

```typescript
const whatsappProperties = [
  {
    name: 'whatsapp_number',
    label: 'Número de WhatsApp',
    type: 'string',
    description: 'Número de teléfono de WhatsApp del contacto'
  },
  {
    name: 'whatsapp_conversation_id',
    label: 'ID de Conversación WhatsApp',
    type: 'string',
    description: 'ID único de la conversación de WhatsApp'
  },
  {
    name: 'whatsapp_last_message_date',
    label: 'Última fecha de mensaje WhatsApp',
    type: 'datetime',
    description: 'Fecha del último mensaje de WhatsApp'
  },
  {
    name: 'whatsapp_status',
    label: 'Estado WhatsApp',
    type: 'enumeration',
    options: ['active', 'inactive', 'blocked'],
    description: 'Estado actual de la conversación de WhatsApp'
  }
];
```

### Setup Automático

```typescript
// Configurar custom channels
await hubspotService.createCustomChannelIntegration();
```

## 🔄 Sincronización de Datos

### Configuración de Sincronización

```typescript
const syncConfig: SyncConfig = {
  hubspot: {
    apiKey: process.env.HUBSPOT_API_KEY,
    portalId: process.env.HUBSPOT_PORTAL_ID,
    webhookUrl: process.env.HUBSPOT_WEBHOOK_URL
  },
  evolutionApi: {
    baseUrl: process.env.WHATSAPP_API_URL,
    apiKey: process.env.WHATSAPP_API_KEY
  },
  autoSync: {
    contacts: true,    // Sincronizar contactos automáticamente
    deals: true,       // Crear deals desde conversaciones
    conversations: true // Registrar todas las conversaciones
  },
  mapping: {
    contactFields: {
      firstname: 'name',
      phone: 'phoneNumber',
      email: 'email',
      whatsapp_number: 'phoneNumber'
    },
    dealFields: {
      dealname: 'title',
      amount: 'value',
      dealstage: 'stage'
    }
  }
};
```

### Inicialización del Servicio

```typescript
import HubSpotSyncService from './services/hubspot-sync.service';

const syncService = new HubSpotSyncService(syncConfig);

// Inicializar
await syncService.initialize();

// El servicio creará automáticamente:
// ✅ Custom channel properties
// ✅ Webhooks bidireccionales  
// ✅ Cola de sincronización
// ✅ Procesador en background
```

## 🪝 Webhooks Bidireccionales

### Endpoints Configurados Automáticamente

```typescript
// Webhooks de HubSpot → WhatsApp
POST /webhooks/hubspot/contact-created
POST /webhooks/hubspot/contact-updated
POST /webhooks/hubspot/deal-created
POST /webhooks/hubspot/deal-updated

// Webhooks de WhatsApp → HubSpot
POST /webhooks/whatsapp/message-received
POST /webhooks/whatsapp/message-sent
POST /webhooks/whatsapp/conversation-resolved

// Endpoints de control
GET  /webhooks/status
POST /webhooks/sync/:type
GET  /webhooks/health
```

### Configurar Servidor de Webhooks

```typescript
import HubSpotWebhookHandler from './services/hubspot-webhook-handler.service';

const webhookHandler = new HubSpotWebhookHandler(syncService, {
  port: 3001,
  path: '/webhooks',
  secret: 'opcional-webhook-secret'
});

// Iniciar servidor
await webhookHandler.start();
```

## 🗺️ Mapeo de Propiedades

### Configuración Personalizable

```typescript
// Mapeo de campos de contacto
const contactMapping = {
  // HubSpot Field → WhatsApp Field
  'firstname': 'name',
  'lastname': 'lastName', 
  'email': 'email',
  'phone': 'phoneNumber',
  'whatsapp_number': 'phoneNumber',
  'company': 'company',
  'jobtitle': 'title'
};

// Mapeo de campos de deal
const dealMapping = {
  'dealname': 'conversationTitle',
  'amount': 'estimatedValue',
  'dealstage': 'stage',
  'pipeline': 'pipeline',
  'closedate': 'expectedCloseDate'
};
```

### Tipos de Campo Soportados

- ✅ **String**: Texto simple
- ✅ **Number**: Valores numéricos
- ✅ **Date/DateTime**: Fechas y timestamps
- ✅ **Enumeration**: Listas de opciones
- ✅ **Boolean**: Valores verdadero/falso

## 🖥️ Uso de la Interfaz

### Panel de Configuración Principal

```typescript
import { HubSpotConfigurationPanel } from '@/components/HubSpotConfigurationPanel';

// Uso en tu aplicación
<HubSpotConfigurationPanel />
```

### Características del Panel:

#### 1. **Pestaña Conexión**
- Configurar API Key y Portal ID
- Test de conexión en tiempo real
- Validación de credenciales

#### 2. **Pestaña Custom Channels**
- Setup automático de propiedades WhatsApp
- Visualización de propiedades creadas
- Barra de progreso de configuración

#### 3. **Pestaña Sincronización**
- Toggle para activar/desactivar sincronización automática
- Botones de sincronización manual por tipo
- Estado de la cola de sincronización

#### 4. **Pestaña Webhooks**
- Configuración de puerto y rutas
- Lista de endpoints disponibles
- Estado del servidor de webhooks

#### 5. **Pestaña Propiedades**
- Visualización del mapeo de campos
- Tablas separadas para contactos y deals
- Indicadores de campos requeridos

## 📚 API Reference

### HubSpotService

```typescript
// Contactos
await hubspotService.getContacts(['firstname', 'email'], 100);
await hubspotService.createContact({ properties: { ... } });
await hubspotService.updateContact(contactId, { properties: { ... } });
await hubspotService.getContactByEmail('email@ejemplo.com');
await hubspotService.getContactByPhone('+1234567890');

// Deals
await hubspotService.getDeals(['dealname', 'amount'], 50);
await hubspotService.createDeal({ 
  properties: { dealname: 'Deal desde WhatsApp' },
  associations: { contactIds: ['123'] }
});
await hubspotService.updateDeal(dealId, { properties: { ... } });

// Propiedades
await hubspotService.getProperties('contacts');
await hubspotService.createProperty('contacts', propertyDefinition);

// Comunicaciones
await hubspotService.logCommunication(contactId, {
  type: 'WHATSAPP_MESSAGE',
  subject: 'Mensaje WhatsApp',
  body: 'Contenido del mensaje'
});
```

### HubSpotSyncService

```typescript
// Sincronización manual
await syncService.syncContactFromWhatsApp('+1234567890', contactData);
await syncService.syncConversationToHubSpot(conversationId, messages);
await syncService.createDealFromConversation(contactId, conversationId, messages);

// Control del servicio
await syncService.forceSync('contact');
const status = await syncService.getStatus();
syncService.stop();
```

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. **Error de API Key Inválida**
```
Error: 401 Unauthorized
```
**Solución**: Verificar que la API Key sea correcta y tenga los permisos necesarios.

#### 2. **Webhook No Recibido**
```
Error: Webhook timeout
```
**Solución**: 
- Verificar que la URL de webhook sea accesible desde internet
- Confirmar que el puerto esté abierto
- Revisar logs del servidor

#### 3. **Propiedades No Creadas**
```
Error: Property already exists
```
**Solución**: Este error es normal si las propiedades ya existen. Se ignorará automáticamente.

#### 4. **Sincronización Lenta**
```
Warning: Queue length > 1000
```
**Solución**: 
- Revisar configuración de `autoSync`
- Aumentar intervalo de procesamiento
- Verificar conexión a internet

### Logs y Debugging

```typescript
// Habilitar logs detallados
console.log('🔄 Sincronización iniciada');
console.log('✅ Contacto sincronizado:', result);
console.log('❌ Error en sincronización:', error);
```

### Verificación de Estado

```typescript
// Verificar estado del servicio
const status = await syncService.getStatus();
console.log('Estado:', status);

// Verificar webhooks
const response = await fetch('/webhooks/health');
console.log('Webhooks activos:', response.ok);
```

## 🎯 Próximos Pasos

1. **Implementar autenticación OAuth2** para mayor seguridad
2. **Agregar soporte para más objetos** (tickets, tareas)
3. **Crear dashboard de métricas** en tiempo real
4. **Implementar retry automático** con exponential backoff
5. **Agregar soporte para archivos adjuntos** en mensajes

## 📞 Soporte

Para soporte técnico o preguntas:
- Revisar logs en `/webhooks/status`
- Verificar configuración en el panel de HubSpot
- Consultar documentación de API de HubSpot: https://developers.hubspot.com/

---

## 🎉 ¡Integración Completa!

Tu integración HubSpot + WhatsApp está lista para:

✅ **Sincronización automática** de contactos  
✅ **Creación automática** de deals  
✅ **Custom channels** configurados  
✅ **Webhooks bidireccionales** activos  
✅ **Registro completo** de comunicaciones  
✅ **Panel de control** intuitivo  

**¡Comienza a sincronizar tus conversaciones de WhatsApp con HubSpot ahora mismo!** 🚀