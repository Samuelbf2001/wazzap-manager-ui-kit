# WhatsApp Manager UI Kit

Una aplicación React completa que funciona como interfaz frontend para **Evolution API**, proporcionando una experiencia de usuario moderna y completa para la gestión de WhatsApp Business.

## 🌟 Características Principales

### 📱 Gestión Completa de WhatsApp
- **Múltiples Instancias**: Crea y gestiona múltiples conexiones de WhatsApp
- **Envío de Mensajes**: Texto, media, ubicación, contactos, encuestas y más
- **Gestión de Chats**: Conversaciones, contactos y grupos
- **Monitoreo en Tiempo Real**: Estado de conexión y eventos

### 🎯 Funcionalidades Avanzadas
- **Flow Builder**: Constructor visual de flujos de conversación
- **HubSpot Integration**: Sincronización bidireccional con CRM
- **Live Inbox**: Bandeja de entrada en tiempo real
- **Analytics**: Métricas y estadísticas detalladas
- **Webhook Management**: Manejo completo de eventos

### 🚀 Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Shadcn/ui
- **Motor**: Evolution API (backend WhatsApp)
- **Estado**: React Hooks + Context API
- **Integraciones**: HubSpot, Typebot, Chatwoot

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│        WhatsApp Manager UI              │
│     (Este Frontend React)               │
├─────────────────────────────────────────┤
│  • Dashboard y Analytics                │
│  • Flow Builder                         │
│  • Live Inbox                          │
│  • Gestión de Campañas                 │
└─────────────────────────────────────────┘
                    │
                    │ REST API + Webhooks
                    ▼
┌─────────────────────────────────────────┐
│          Evolution API                  │
│        (Motor Principal)                │
├─────────────────────────────────────────┤
│  • Conexiones WhatsApp                 │
│  • Procesamiento de mensajes            │
│  • Gestión de instancias               │
│  • Eventos y webhooks                  │
└─────────────────────────────────────────┘
                    │
                    │ WhatsApp Business API
                    ▼
┌─────────────────────────────────────────┐
│           WhatsApp                      │
└─────────────────────────────────────────┘
```

## 🚀 Instalación Rápida

### Prerrequisitos
- Node.js 18+
- Evolution API instalado y configurado
- npm o yarn

### 1. Clonar e Instalar
```bash
git clone <repository-url>
cd wazzap-manager-ui-kit
npm install
```

### 2. Configurar Variables de Entorno
```bash
cp .env.example .env
```

Edita `.env` con tu configuración:
```env
# Evolution API Configuration
VITE_EVOLUTION_API_URL=http://localhost:8080
VITE_EVOLUTION_API_KEY=tu-api-key-aqui
VITE_WEBHOOK_URL=http://localhost:3000/webhook

# HubSpot (opcional)
VITE_HUBSPOT_API_KEY=tu-hubspot-key
VITE_HUBSPOT_PORTAL_ID=tu-portal-id
```

### 3. Ejecutar
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🎯 Uso Principal

### Panel de Control de Evolution API
Accede a `/evolution-demo` para el panel completo que incluye:

1. **Gestión de Instancias**
   - Crear nuevas instancias
   - Conectar/desconectar
   - Monitoreo de estado

2. **Envío de Mensajes**
   - Mensajes de texto y multimedia
   - Ubicaciones y contactos
   - Encuestas y listas interactivas

3. **Gestión de Chats**
   - Ver conversaciones
   - Marcar como leído
   - Archivar chats

4. **Contactos y Grupos**
   - Gestión de contactos
   - Creación y administración de grupos
   - Configuración de permisos

### Usando los Servicios

```typescript
import { evolutionAPIService } from './services/evolution-api.service';
import { useInstances, useMessages } from './hooks/use-evolution-api';

// En cualquier componente
const MyComponent = () => {
  const { instances, createInstance } = useInstances();
  const { sendTextMessage } = useMessages('mi-instancia');
  
  // Crear instancia
  const handleCreateInstance = async () => {
    await createInstance({
      instanceName: 'nueva-instancia',
      qrcode: true,
      webhook: 'http://localhost:3000/webhook'
    });
  };
  
  // Enviar mensaje
  const handleSendMessage = async () => {
    await sendTextMessage({
      number: '5511999999999',
      text: '¡Hola desde WhatsApp Manager!'
    });
  };
};
```

## 📦 Componentes Principales

### 🏠 Dashboard
- `src/pages/Index.tsx` - Panel principal con métricas
- `src/components/MetricsCards.tsx` - Tarjetas de estadísticas
- `src/components/DashboardHeader.tsx` - Encabezado con navegación

### 📨 Inbox y Mensajería
- `src/components/LiveInbox.tsx` - Bandeja de entrada en vivo
- `src/components/inbox/` - Componentes del inbox
- `src/components/MessageManager.tsx` - Gestión de mensajes

### 🔄 Flow Builder
- `src/components/FlowBuilder/` - Constructor de flujos
- `src/components/FlowBuilder/nodes/` - Nodos especializados
- `src/services/flow-engine.service.ts` - Motor de ejecución

### 🔗 Integraciones
- `src/components/HubSpotIntegration.tsx` - Integración con HubSpot
- `src/hubspot-extension/` - Extensión para HubSpot
- `src/services/hubspot.service.ts` - Servicio de HubSpot

## 🛠️ Servicios Disponibles

### Evolution API Service
```typescript
// Gestión de instancias
await evolutionAPIService.createInstance(config);
await evolutionAPIService.fetchInstances();
await evolutionAPIService.connectInstance(name);

// Envío de mensajes
await evolutionAPIService.sendTextMessage(instance, data);
await evolutionAPIService.sendMediaMessage(instance, data);

// Control de chats
await evolutionAPIService.findChats(instance);
await evolutionAPIService.markMessageAsRead(instance, data);
```

### Webhook Handler
```typescript
import { webhookHandlerService } from './services/webhook-handler.service';

// Registrar manejadores
webhookHandlerService.registerHandler('MESSAGE_RECEIVED', (event) => {
  console.log('Nuevo mensaje:', event.data);
});

// Procesar webhooks
app.post('/webhook', webhookHandlerService.createExpressEndpoint());
```

## 🎨 Personalización

### Temas y Estilos
- Modifica `src/index.css` para temas globales
- Usa `tailwind.config.js` para configuración de Tailwind
- Componentes UI en `src/components/ui/`

### Agregar Nuevas Funcionalidades
1. Crea nuevos hooks en `src/hooks/`
2. Añade componentes en `src/components/`
3. Extiende servicios en `src/services/`

## 📚 Documentación Completa

- 📖 [Integración Evolution API](./EVOLUTION_API_INTEGRATION.md)
- 🔧 [Configuración Avanzada](./docs/configuration.md)
- 🎯 [Guía de Componentes](./docs/components.md)
- 🔌 [API Reference](./docs/api-reference.md)

## 🚀 Despliegue

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm run preview
```

### Docker
```bash
docker build -t whatsapp-manager .
docker run -p 3000:3000 whatsapp-manager
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

- 📧 Email: soporte@whatsappmanager.com
- 💬 Discord: [Únete a nuestra comunidad](https://discord.gg/whatsappmanager)
- 📚 Docs: [Documentación completa](https://docs.whatsappmanager.com)

## 🌟 Características Próximas

- [ ] Dashboard de Analytics avanzado
- [ ] Integración con más CRMs
- [ ] Automatizaciones avanzadas
- [ ] Plantillas de mensajes
- [ ] Reportes detallados
- [ ] API pública

---

**¡Construido con ❤️ para hacer WhatsApp Business más poderoso!**
