# 📬 Bandeja de Entrada de Conversaciones - WhatsApp Manager

## 🚀 Características Principales

### ✨ Funcionalidades Generales
- **Conversaciones en tiempo real** con interfaz moderna y responsiva
- **Múltiples plataformas**: WhatsApp, Telegram, Instagram, Facebook
- **Sistema de prioridades** (Urgente, Alta, Media, Baja)
- **Estados de conversación** (Activa, Esperando, Resuelta, Transferida)
- **Asignación automática** de conversaciones a agentes
- **Filtros avanzados** y búsqueda en tiempo real
- **Respuestas rápidas** predefinidas
- **Métricas en tiempo real** y dashboard de rendimiento

### 🎯 Integración con HubSpot
- **Widget iframe** integrado en contactos, deals y empresas
- **Sincronización bidireccional** de datos
- **Contexto automático** del contacto/deal/empresa
- **Notificaciones** a HubSpot sobre eventos importantes
- **Historial completo** de conversaciones vinculadas

## 🏗️ Arquitectura del Sistema

### 📁 Estructura de Componentes

```
src/
├── components/
│   ├── LiveInbox.tsx                 # Componente principal
│   ├── HubSpotInboxWidget.tsx        # Widget para HubSpot
│   └── inbox/
│       ├── ConversationList.tsx      # Lista de conversaciones
│       ├── ChatWindow.tsx            # Ventana de chat
│       ├── InboxHeader.tsx           # Header con estadísticas
│       ├── InboxSidebar.tsx          # Sidebar con filtros
│       └── AgentPanel.tsx            # Panel de información del agente
├── types/
│   └── conversation.ts               # Tipos TypeScript
├── pages/
│   └── LiveInboxPage.tsx             # Página principal
└── hubspot-extension/
    ├── WhatsAppInboxExtension.tsx    # Extensión HubSpot
    └── manifest.json                 # Configuración HubSpot
```

### 🔗 Rutas Disponibles

- `/bandeja` - Bandeja principal (aplicación standalone)
- `/hubspot-inbox` - Widget para HubSpot (iframe)

## 📋 Tipos de Datos Principales

### LiveConversation
```typescript
interface LiveConversation {
  id: string;
  contactId: string;
  phoneNumber: string;
  contactName?: string;
  contactAvatar?: string;
  status: 'active' | 'waiting' | 'resolved' | 'transferred';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedAgent?: string;
  lastMessage: LiveMessage;
  unreadCount: number;
  tags: string[];
  metadata: {
    source: 'whatsapp' | 'telegram' | 'instagram' | 'facebook';
    hubspotContactId?: string;
    dealId?: string;
    companyId?: string;
  };
}
```

### LiveMessage
```typescript
interface LiveMessage {
  id: string;
  conversationId: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'system';
  content: string;
  mediaUrl?: string;
  sender: {
    id: string;
    name: string;
    type: 'customer' | 'agent' | 'system' | 'bot';
    avatar?: string;
  };
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}
```

## 🎨 Características de UI/UX

### 📱 Diseño Responsivo
- **Desktop**: Layout de 3 paneles (sidebar, lista, chat)
- **Tablet**: Layout adaptativo con panels redimensionables
- **Mobile**: Layout colapsable optimizado para touch

### 🎯 Filtros y Búsqueda
- **Búsqueda en tiempo real** por nombre, teléfono o contenido
- **Filtros por estado** (activas, esperando, resueltas)
- **Filtros por prioridad** (urgente, alta, media, baja)
- **Filtros por agente** asignado
- **Solo conversaciones no leídas**
- **Filtros por fuente** (WhatsApp, Telegram, etc.)

### ⚡ Funciones Avanzadas
- **Auto-scroll** a nuevos mensajes
- **Indicadores de estado** de mensajes (enviado, entregado, leído)
- **Indicador de escritura** en tiempo real
- **Previews de archivos** multimedia
- **Reactions** a mensajes
- **Respuestas rápidas** configurables

## 🔧 Integración con HubSpot

### 📦 Configuración del Widget

1. **Instalación**:
   ```json
   {
     "name": "whatsapp-inbox",
     "url": "/hubspot-inbox",
     "placement": ["contact.sidebar", "deal.sidebar"]
   }
   ```

2. **Parámetros URL**:
   - `contactId` - ID del contacto HubSpot
   - `dealId` - ID del deal HubSpot  
   - `companyId` - ID de la empresa HubSpot
   - `agentId` - ID del agente asignado

### 🔄 Comunicación Iframe

```typescript
// Enviar contexto a HubSpot
window.parent.postMessage({
  type: 'WHATSAPP_INBOX_EVENT',
  eventType: 'message_sent',
  data: { message },
  context: { contactId, dealId }
}, '*');

// Recibir contexto de HubSpot
window.addEventListener('message', (event) => {
  if (event.data?.type === 'HUBSPOT_CONTEXT') {
    const { contact, deal, company } = event.data.payload;
    // Usar contexto...
  }
});
```

## 📊 Métricas y Estadísticas

### 📈 Dashboard de Rendimiento
- **Conversaciones activas** en tiempo real
- **Tiempo promedio de respuesta**
- **Tasa de resolución** diaria
- **Satisfacción del cliente**
- **Utilización de agentes**
- **Primera respuesta** promedio

### 👥 Gestión de Agentes
- **Estado en línea** (disponible, ausente, ocupado, desconectado)
- **Carga de trabajo** actual vs máxima
- **Métricas individuales** de rendimiento
- **Habilidades y certificaciones**
- **Idiomas soportados**

## 🚦 Estados y Flujos

### 📋 Estados de Conversación
1. **Active** - Conversación en curso
2. **Waiting** - Esperando respuesta del agente
3. **Resolved** - Conversación resuelta
4. **Transferred** - Transferida a otro agente

### 🔄 Flujo de Trabajo
1. **Nueva conversación** → Auto-asignación según reglas
2. **Mensaje recibido** → Notificación + actualización UI
3. **Agente responde** → Envío + actualización estado
4. **Resolución** → Cambio estado + métricas
5. **Transferencia** → Reasignación + notificación

## 🛠️ Configuración y Personalización

### ⚙️ Configuración de Inbox
```typescript
interface InboxSettings {
  autoAssignment: boolean;
  maxConversationsPerAgent: number;
  responseTimeTargets: {
    firstResponse: number; // minutos
    averageResponse: number; // minutos
  };
  workingHours: {
    enabled: boolean;
    schedule: { [day: string]: { start: string; end: string; enabled: boolean } };
  };
  notifications: {
    newMessage: boolean;
    assignment: boolean;
    sound: boolean;
    desktop: boolean;
  };
}
```

### 🎨 Temas y Personalización
- **Colores de prioridad** personalizables
- **Avatars** automáticos con Dicebear
- **Emojis** para fuentes de mensajes
- **Respuestas rápidas** configurables
- **Notificaciones** sonoras/visuales

## 🔒 Seguridad y Privacidad

### 🛡️ Medidas de Seguridad
- **Autenticación** de agentes requerida
- **Permisos granulares** por rol
- **Logs de auditoría** completos
- **Cifrado** de mensajes sensibles
- **Compliance** con regulaciones de datos

### 📝 Logs y Auditoría
- **Historial completo** de conversaciones
- **Acciones de agentes** registradas
- **Transferencias** documentadas
- **Cambios de estado** con timestamps
- **Métricas** históricas mantenidas

## 🚀 Próximas Funcionalidades

### 🎯 Roadmap
- [ ] **Chatbots IA** integrados
- [ ] **Video llamadas** desde la bandeja
- [ ] **Plantillas** de mensajes avanzadas
- [ ] **Encuestas** post-conversación
- [ ] **Integración** con más CRMs
- [ ] **Analytics** avanzados
- [ ] **API pública** para integraciones
- [ ] **Mobile app** nativa

### 🧪 Funciones Experimentales
- [ ] **Traducción automática** de mensajes
- [ ] **Sentiment analysis** en tiempo real
- [ ] **Sugerencias IA** de respuestas
- [ ] **Detección automática** de intent
- [ ] **Escalamiento inteligente** de conversaciones

## 📚 Documentación Adicional

- [API Reference](./API_REFERENCE.md)
- [Guía de Desarrollo](./DEVELOPMENT_GUIDE.md)
- [Configuración HubSpot](./HUBSPOT_SETUP.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

---

**🔥 ¡La bandeja de entrada está lista para manejar conversaciones de WhatsApp en tiempo real con integración completa a HubSpot!** 