export const EVOLUTION_API_CONFIG = {
  baseUrl: 'http://localhost:8080',
  apiKey: 'change-me', // Deberás cambiar esto por tu clave de API
  webhookUrl: 'http://localhost:3000/webhook', // URL donde recibirás las notificaciones
}

export const EVOLUTION_API_ENDPOINTS = {
  instance: {
    create: '/instance/create',
    connect: '/instance/connect',
    disconnect: '/instance/disconnect',
    delete: '/instance/delete',
    status: '/instance/status',
  },
  message: {
    sendText: '/message/sendText',
    sendImage: '/message/sendImage',
    sendDocument: '/message/sendDocument',
    sendAudio: '/message/sendAudio',
    sendVideo: '/message/sendVideo',
  },
  webhook: {
    set: '/webhook/set',
    get: '/webhook/get',
  }
} 