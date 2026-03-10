# WhatsFull HubSpot Integration

Esta extensión permite integrar WhatsApp con HubSpot para gestionar contactos y mensajes de manera eficiente.

## Características

- Envío de mensajes de WhatsApp desde HubSpot
- Sincronización automática de contactos
- Registro de conversaciones en HubSpot
- Webhooks para nuevos mensajes
- Gestión de propiedades personalizadas

## Requisitos

- Node.js 14 o superior
- Cuenta de HubSpot con acceso a la API
- Cuenta de WhatsApp Business API

## Instalación

1. Clona este repositorio
2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

4. Configura las variables de entorno en el archivo `.env`:
- `HUBSPOT_ACCESS_TOKEN`: Token de acceso de HubSpot
- `HUBSPOT_CLIENT_ID`: ID de cliente de HubSpot
- `HUBSPOT_CLIENT_SECRET`: Secreto de cliente de HubSpot
- `WHATSAPP_API_KEY`: Clave API de WhatsApp
- `PORT`: Puerto del servidor (por defecto: 3000)
- `NODE_ENV`: Entorno de ejecución (development/production)

## Uso

1. Inicia el servidor:
```bash
npm start
```

2. La extensión estará disponible en:
- Endpoint de envío de mensajes: `POST /actions/send-message`
- Endpoint de sincronización: `POST /actions/sync-contact`
- Webhook de nuevos mensajes: `POST /webhooks/new-message`

## Endpoints

### Enviar Mensaje
```http
POST /actions/send-message
Content-Type: application/json
Authorization: Bearer <token>

{
  "contactId": "123",
  "message": "Hola, ¿cómo estás?"
}
```

### Sincronizar Contacto
```http
POST /actions/sync-contact
Content-Type: application/json
Authorization: Bearer <token>

{
  "contactId": "123"
}
```

### Webhook de Nuevo Mensaje
```http
POST /webhooks/new-message
Content-Type: application/json

{
  "messageId": "msg_123",
  "phone": "+1234567890",
  "message": "Hola",
  "timestamp": "2024-03-20T12:00:00Z"
}
```

## Propiedades de HubSpot

La extensión crea y utiliza las siguientes propiedades en HubSpot:

- `whatsapp_number`: Número de WhatsApp del contacto
- `last_whatsapp_message`: Último mensaje recibido
- `last_whatsapp_message_date`: Fecha del último mensaje
- `whatsapp_sync_status`: Estado de sincronización
- `whatsapp_sync_date`: Fecha de última sincronización

## Desarrollo

Para ejecutar en modo desarrollo:
```bash
npm run dev
```

## Licencia

MIT 