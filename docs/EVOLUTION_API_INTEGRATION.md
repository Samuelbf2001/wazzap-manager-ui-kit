# Integración Completa con Evolution API

Esta aplicación ahora está completamente preparada para funcionar como una interfaz frontend para Evolution API, que actúa como el motor principal de WhatsApp.

## 🚀 Funcionalidades Implementadas

### 1. Configuración Completa (`src/config/evolution-api.ts`)
- Configuración centralizada de endpoints y parámetros
- Soporte para todas las funcionalidades de Evolution API v1.7.4
- Variables de entorno para configuración flexible

### 2. Tipos TypeScript Completos (`src/types/evolution-api.ts`)
Incluye tipado para todas las operaciones:
- ✅ Gestión de instancias
- ✅ Envío de mensajes (texto, media, ubicación, contactos, etc.)
- ✅ Control de chats y conversaciones
- ✅ Gestión de contactos
- ✅ Operaciones de grupos
- ✅ Configuración de perfil
- ✅ Webhooks y eventos
- ✅ Integraciones (Typebot, Chatwoot, SQS, RabbitMQ)

### 3. Servicio Principal (`src/services/evolution-api.service.ts`)
Servicio completo con:
- 🔄 Sistema de reintentos automáticos
- ⏱️ Timeout configurable
- 🛡️ Manejo robusto de errores
- 📡 Soporte para todas las operaciones de la API

### 4. Hooks de React (`src/hooks/use-evolution-api.ts`)
Hooks especializados para:
- `useInstances()` - Gestión de instancias
- `useMessages()` - Envío de mensajes
- `useChats()` - Gestión de chats
- `useContacts()` - Gestión de contactos
- `useGroups()` - Gestión de grupos
- `useConnectionMonitor()` - Monitoreo en tiempo real

### 5. Manejo de Webhooks (`src/services/webhook-handler.service.ts`)
Sistema completo para:
- 📨 Recepción y procesamiento de webhooks
- 🎯 Manejo de eventos específicos
- 🔒 Validación de webhooks
- 🔌 Integración con WebSockets

## 📋 Configuración

### Variables de Entorno
Crea un archivo `.env` basado en `.env.example`:

```env
# Evolution API Configuration
VITE_EVOLUTION_API_URL=http://localhost:8080
VITE_EVOLUTION_API_KEY=tu-api-key-aqui
VITE_WEBHOOK_URL=http://localhost:3000/webhook
```

### Configuración de Evolution API
1. Instala y configura Evolution API en tu servidor
2. Actualiza las variables de entorno
3. Asegúrate de que la aplicación pueda acceder a Evolution API

## 🛠️ Uso de los Servicios

### Ejemplo Básico - Crear Instancia y Enviar Mensaje

```typescript
import { evolutionAPIService } from './services/evolution-api.service';

// Crear una nueva instancia
const createInstance = async () => {
  try {
    const response = await evolutionAPIService.createInstance({
      instanceName: 'mi-instancia',
      qrcode: true,
      webhook: 'http://localhost:3000/webhook',
      webhook_by_events: true,
      events: ['MESSAGE_RECEIVED', 'MESSAGE_SENT']
    });
    console.log('Instancia creada:', response);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Enviar mensaje de texto
const sendMessage = async () => {
  try {
    const response = await evolutionAPIService.sendTextMessage('mi-instancia', {
      number: '5511999999999',
      text: '¡Hola desde Evolution API!'
    });
    console.log('Mensaje enviado:', response);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Usando Hooks en Componentes React

```typescript
import { useInstances, useMessages } from './hooks/use-evolution-api';

const MyComponent = () => {
  const { instances, fetchInstances, createInstance } = useInstances();
  const { sendTextMessage, loading } = useMessages('mi-instancia');

  const handleSendMessage = async () => {
    await sendTextMessage({
      number: '5511999999999',
      text: 'Mensaje desde React!'
    });
  };

  return (
    <div>
      <button onClick={fetchInstances}>Obtener Instancias</button>
      <button onClick={handleSendMessage} disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar Mensaje'}
      </button>
    </div>
  );
};
```

### Manejo de Webhooks

```typescript
import { webhookHandlerService } from './services/webhook-handler.service';

// Registrar manejador para mensajes recibidos
webhookHandlerService.registerHandler('MESSAGE_RECEIVED', (event) => {
  console.log('Nuevo mensaje:', event.data);
  // Actualizar UI, mostrar notificación, etc.
});

// Procesar webhook (en servidor Express)
app.post('/webhook', webhookHandlerService.createExpressEndpoint());
```

## 🎯 Operaciones Disponibles

### Gestión de Instancias
- ✅ Crear instancia
- ✅ Obtener lista de instancias
- ✅ Conectar/desconectar instancia
- ✅ Reiniciar instancia
- ✅ Obtener estado de conexión
- ✅ Eliminar instancia

### Envío de Mensajes
- ✅ Mensaje de texto
- ✅ Imagen, video, audio, documento
- ✅ Ubicación
- ✅ Contacto
- ✅ Reacciones
- ✅ Encuestas
- ✅ Listas interactivas
- ✅ Stickers
- ✅ Estados de WhatsApp

### Control de Chats
- ✅ Verificar números de WhatsApp
- ✅ Marcar mensajes como leídos
- ✅ Archivar chats
- ✅ Eliminar mensajes
- ✅ Enviar presencia (escribiendo, grabando)
- ✅ Obtener foto de perfil
- ✅ Buscar contactos y mensajes

### Gestión de Grupos
- ✅ Crear grupo
- ✅ Actualizar información del grupo
- ✅ Gestionar miembros
- ✅ Configurar permisos
- ✅ Códigos de invitación
- ✅ Salir de grupos

### Perfil y Privacidad
- ✅ Actualizar nombre y estado
- ✅ Cambiar foto de perfil
- ✅ Configurar privacidad
- ✅ Perfil de negocio

### Integraciones
- ✅ Typebot
- ✅ Chatwoot
- ✅ SQS (Amazon)
- ✅ RabbitMQ
- ✅ WebSockets

## 🔧 Arquitectura

```
┌─────────────────────────────────────────┐
│           Frontend (React)              │
├─────────────────────────────────────────┤
│  • Hooks (use-evolution-api.ts)         │
│  • Componentes de UI                    │
│  • Estado global                       │
└─────────────────────────────────────────┘
                    │
                    │ HTTP/HTTPS
                    ▼
┌─────────────────────────────────────────┐
│      Evolution API Service             │
├─────────────────────────────────────────┤
│  • Manejo de peticiones                │
│  • Reintentos automáticos              │
│  • Validación de respuestas            │
└─────────────────────────────────────────┘
                    │
                    │ REST API
                    ▼
┌─────────────────────────────────────────┐
│          Evolution API                  │
├─────────────────────────────────────────┤
│  • Motor de WhatsApp                   │
│  • Gestión de instancias               │
│  • Procesamiento de mensajes           │
└─────────────────────────────────────────┘
                    │
                    │ Webhooks
                    ▼
┌─────────────────────────────────────────┐
│       Webhook Handler                   │
├─────────────────────────────────────────┤
│  • Procesamiento de eventos            │
│  • Notificaciones en tiempo real       │
│  • Sincronización de estado            │
└─────────────────────────────────────────┘
```

## 🚀 Siguiente Pasos

1. **Configura Evolution API** en tu servidor
2. **Actualiza las variables de entorno** con tu configuración
3. **Integra el componente de demostración** (`EvolutionAPIDemo`) en tu aplicación
4. **Configura webhooks** para recibir eventos en tiempo real
5. **Personaliza los manejadores** según tus necesidades

## 🔒 Seguridad

- ✅ Validación de API keys
- ✅ Validación de webhooks
- ✅ Manejo seguro de errores
- ✅ Timeouts configurables
- ✅ Logs detallados para debugging

## 📚 Recursos Adicionales

- [Documentación oficial de Evolution API](https://doc.evolution-api.com)
- [GitHub de Evolution API](https://github.com/EvolutionAPI/evolution-api)
- Ejemplos de uso en `src/components/EvolutionAPIDemo.tsx`

---

**¡La aplicación está lista para ser el frontend completo de Evolution API!** 🎉