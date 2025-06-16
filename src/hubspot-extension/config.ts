export const config = {
  appId: 'whatsfull-hubspot-integration',
  name: 'WhatsFull HubSpot Integration',
  description: 'Integración de WhatsApp con HubSpot para gestión de contactos y mensajes',
  actions: {
    sendWhatsAppMessage: {
      url: process.env.WHATSAPP_API_URL || 'http://localhost:3000/api/whatsapp/send',
      method: 'POST'
    },
    syncContact: {
      url: process.env.WHATSAPP_API_URL || 'http://localhost:3000/api/whatsapp/sync',
      method: 'POST'
    }
  }
}; 