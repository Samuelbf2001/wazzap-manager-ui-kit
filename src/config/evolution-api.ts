export const EVOLUTION_API_CONFIG = {
  baseUrl: 'http://localhost:8080', // Configurar en .env como VITE_EVOLUTION_API_URL
  apiKey: 'change-me', // Configurar en .env como VITE_EVOLUTION_API_KEY
  webhookUrl: 'http://localhost:3000/webhook', // Configurar en .env como VITE_WEBHOOK_URL
  timeout: 30000,
  retryAttempts: 3,
}

export const EVOLUTION_API_ENDPOINTS = {
  // Información general
  info: '/',
  
  // Instancias
  instance: {
    create: '/instance/create',
    fetch: '/instance/fetchInstances',
    connect: '/instance/connect/{instance}',
    restart: '/instance/restart/{instance}',
    connectionState: '/instance/connectionState/{instance}',
    logout: '/instance/logout/{instance}',
    delete: '/instance/delete/{instance}',
    setPresence: '/instance/setPresence/{instance}',
  },

  // Webhook
  webhook: {
    set: '/webhook/set/{instance}',
    find: '/webhook/find/{instance}',
  },

  // Configuraciones
  settings: {
    set: '/settings/set/{instance}',
    find: '/settings/find/{instance}',
  },

  // Envío de mensajes
  message: {
    sendTemplate: '/message/sendTemplate/{instance}',
    sendText: '/message/sendText/{instance}',
    sendStatus: '/message/sendStatus/{instance}',
    sendMedia: '/message/sendMedia/{instance}',
    sendWhatsAppAudio: '/message/sendWhatsAppAudio/{instance}',
    sendSticker: '/message/sendSticker/{instance}',
    sendLocation: '/message/sendLocation/{instance}',
    sendContact: '/message/sendContact/{instance}',
    sendReaction: '/message/sendReaction/{instance}',
    sendPoll: '/message/sendPoll/{instance}',
    sendList: '/message/sendList/{instance}',
  },

  // Chat Controller
  chat: {
    checkWhatsApp: '/chat/whatsappNumbers/{instance}',
    markAsRead: '/chat/markMessageAsRead/{instance}',
    archiveChat: '/chat/archiveChat/{instance}',
    deleteMessage: '/chat/deleteMessage/{instance}',
    sendPresence: '/chat/sendPresence/{instance}',
    fetchProfilePicture: '/chat/fetchProfilePicture/{instance}',
    findContacts: '/chat/findContacts/{instance}',
    findMessages: '/chat/findMessages/{instance}',
    findStatusMessage: '/chat/findStatusMessage/{instance}',
    updateMessage: '/chat/updateMessage/{instance}',
    findChats: '/chat/findChats/{instance}',
  },

  // Configuraciones de perfil
  profile: {
    fetchBusiness: '/profile/fetchBusinessProfile/{instance}',
    fetch: '/profile/fetchProfile/{instance}',
    updateName: '/profile/updateProfileName/{instance}',
    updateStatus: '/profile/updateProfileStatus/{instance}',
    updatePicture: '/profile/updateProfilePicture/{instance}',
    removePicture: '/profile/removeProfilePicture/{instance}',
    fetchPrivacy: '/profile/fetchPrivacySettings/{instance}',
    updatePrivacy: '/profile/updatePrivacySettings/{instance}',
  },

  // Grupos
  group: {
    create: '/group/createGroup/{instance}',
    updatePicture: '/group/updateGroupPicture/{instance}',
    updateSubject: '/group/updateGroupSubject/{instance}',
    updateDescription: '/group/updateGroupDescription/{instance}',
    fetchInviteCode: '/group/fetchInviteCode/{instance}',
    acceptInviteCode: '/group/acceptGroupInvite/{instance}',
    revokeInviteCode: '/group/revokeInviteCode/{instance}',
    sendInvite: '/group/sendGroupInvite/{instance}',
    findByInviteCode: '/group/findGroupByInviteCode/{instance}',
    findByJid: '/group/findGroupByJid/{instance}',
    fetchAll: '/group/fetchAllGroups/{instance}',
    findMembers: '/group/findGroupMembers/{instance}',
    updateMembers: '/group/updateGroupMembers/{instance}',
    updateSetting: '/group/updateGroupSetting/{instance}',
    toggleEphemeral: '/group/toggleEphemeral/{instance}',
    leave: '/group/leaveGroup/{instance}',
  },

  // Typebot
  typebot: {
    set: '/typebot/set/{instance}',
    start: '/typebot/start/{instance}',
    find: '/typebot/find/{instance}',
    changeStatus: '/typebot/changeStatus/{instance}',
  },

  // Chatwoot
  chatwoot: {
    set: '/chatwoot/set/{instance}',
    find: '/chatwoot/find/{instance}',
  },

  // SQS
  sqs: {
    set: '/sqs/set/{instance}',
    find: '/sqs/find/{instance}',
  },

  // RabbitMQ
  rabbitmq: {
    set: '/rabbitmq/set/{instance}',
    find: '/rabbitmq/find/{instance}',
  },

  // WebSocket
  websocket: {
    find: '/websocket/find/{instance}',
    set: '/websocket/set/{instance}',
  },
} 