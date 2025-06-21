import { EvolutionAPIConfig } from '../types/evolution-api';

// Configuración por defecto - estos valores deben ser configurados según el entorno
export const EVOLUTION_API_CONFIG: EvolutionAPIConfig = {
  baseUrl: 'http://localhost:8080',
  apiKey: 'change-me', // Deberás cambiar esto por tu clave de API
  webhookUrl: 'http://localhost:3000/webhook/evolution',
  defaultEvents: [
    'messages.upsert',
    'messages.update',
    'messages.delete',
    'send.message',
    'contacts.upsert',
    'contacts.update',
    'presence.update',
    'chats.upsert',
    'chats.update',
    'chats.delete',
    'groups.upsert',
    'groups.update',
    'group-participants.update',
    'connection.update'
  ],
  timeout: 30000,
  retries: 3
};

export const N8N_CONFIG = {
  baseUrl: 'http://localhost:5678',
  apiKey: '', // Configurar según necesidades
  timeout: 30000
};

export const HUBSPOT_CONFIG = {
  apiKey: '', // Configurar con tu API key de HubSpot
  portalId: '' // Configurar con tu Portal ID de HubSpot
};

export const DATABASE_CONFIG = {
  saveMessages: true,
  saveContacts: true,
  saveLogs: true,
  connectionString: 'sqlite://./data/app.db'
};

export const WEBHOOK_ENDPOINTS = {
  evolution: '/webhook/evolution',
  n8n: '/webhook/n8n',
  hubspot: '/webhook/hubspot'
};

export const EVOLUTION_API_ENDPOINTS = {
  instance: {
    create: '/instance/create',
    connect: '/instance/connect',
    disconnect: '/instance/disconnect',
    delete: '/instance/delete',
    status: '/instance/status',
    fetchInstances: '/instance/fetchInstances',
    connectionState: '/instance/connectionState'
  },
  message: {
    sendText: '/message/sendText',
    sendMedia: '/message/sendMedia',
    sendWhatsAppAudio: '/message/sendWhatsAppAudio',
    findMessages: '/chat/findMessages'
  },
  chat: {
    findContacts: '/chat/findContacts',
    whatsappProfile: '/chat/whatsappProfile'
  },
  group: {
    findGroupInfos: '/group/findGroupInfos'
  },
  webhook: {
    set: '/webhook/set',
    find: '/webhook/find'
  }
}; 