interface LogEntry {
  id: string;
  type: 'webhook_request' | 'webhook_response' | 'webhook_error' | 'connection_lost' | 'connection_restored' | 'message_sent' | 'qr_generated' | 'qr_scanned' | 'form_submission' | 'system_error';
  sessionName?: string;
  phoneNumber?: string;
  timestamp: string;
  message: string;
  data?: any;
  error?: string;
  status?: 'success' | 'error' | 'warning' | 'info';
}

class LoggerService {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Máximo número de logs a mantener en memoria
  private listeners: ((logs: LogEntry[]) => void)[] = [];

  // Agregar un log
  addLog(entry: Omit<LogEntry, 'id' | 'timestamp'>) {
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      status: 'info',
      ...entry
    };

    this.logs.unshift(newLog); // Agregar al inicio para mostrar los más recientes primero

    // Mantener solo los últimos maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Notificar a los listeners
    this.notifyListeners();

    // Log en consola para desarrollo
    console.log(`[${entry.type}]`, entry.message, entry.data || '');
  }

  // Logs específicos para webhook
  logWebhookRequest(data: any, sessionName?: string, phoneNumber?: string) {
    this.addLog({
      type: 'webhook_request',
      sessionName,
      phoneNumber,
      message: 'Enviando datos al webhook personalizado',
      data: {
        url: 'https://n8n-n8n.5raxun.easypanel.host/webhook-test/f2666a61-db14-45e0-ab5b-4bb895adb3c2',
        payload: data
      },
      status: 'info'
    });
  }

  logWebhookResponse(response: any, sessionName?: string, phoneNumber?: string) {
    this.addLog({
      type: 'webhook_response',
      sessionName,
      phoneNumber,
      message: 'Respuesta recibida del webhook',
      data: response,
      status: response?.data?.base64 ? 'success' : 'warning'
    });
  }

  logWebhookError(error: string, sessionName?: string, phoneNumber?: string) {
    this.addLog({
      type: 'webhook_error',
      sessionName,
      phoneNumber,
      message: 'Error en webhook personalizado',
      error,
      status: 'error'
    });
  }

  logQRGenerated(source: string, sessionName?: string, phoneNumber?: string) {
    this.addLog({
      type: 'qr_generated',
      sessionName,
      phoneNumber,
      message: `Código QR generado desde ${source}`,
      status: 'success'
    });
  }

  logQRScanned(sessionName?: string, phoneNumber?: string) {
    this.addLog({
      type: 'qr_scanned',
      sessionName,
      phoneNumber,
      message: 'Código QR escaneado exitosamente',
      status: 'success'
    });
  }

  logFormSubmission(formData: any) {
    this.addLog({
      type: 'form_submission',
      sessionName: formData.session_name,
      phoneNumber: formData.phone_number,
      message: 'Formulario de conexión enviado',
      data: formData,
      status: 'info'
    });
  }

  logConnectionLost(sessionName: string, phoneNumber: string) {
    this.addLog({
      type: 'connection_lost',
      sessionName,
      phoneNumber,
      message: 'Conexión de WhatsApp perdida',
      status: 'error'
    });
  }

  logConnectionRestored(sessionName: string, phoneNumber: string) {
    this.addLog({
      type: 'connection_restored',
      sessionName,
      phoneNumber,
      message: 'Conexión de WhatsApp restaurada',
      status: 'success'
    });
  }

  logSystemError(error: string, context?: any) {
    this.addLog({
      type: 'system_error',
      message: `Error del sistema: ${error}`,
      data: context,
      error,
      status: 'error'
    });
  }

  // Obtener todos los logs
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Obtener logs filtrados por tipo
  getLogsByType(type: LogEntry['type']): LogEntry[] {
    return this.logs.filter(log => log.type === type);
  }

  // Obtener logs de una sesión específica
  getLogsBySession(sessionName: string): LogEntry[] {
    return this.logs.filter(log => log.sessionName === sessionName);
  }

  // Limpiar logs
  clearLogs() {
    this.logs = [];
    this.notifyListeners();
  }

  // Suscribirse a cambios en los logs
  subscribe(listener: (logs: LogEntry[]) => void) {
    this.listeners.push(listener);
    // Enviar logs actuales inmediatamente
    listener(this.getLogs());
  }

  // Desuscribirse de cambios
  unsubscribe(listener: (logs: LogEntry[]) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.getLogs());
      } catch (error) {
        console.error('Error notificando listener de logs:', error);
      }
    });
  }

  // Exportar logs como JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Estadísticas de logs
  getStats() {
    const stats = {
      total: this.logs.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      recent: this.logs.slice(0, 10)
    };

    this.logs.forEach(log => {
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
      stats.byStatus[log.status || 'info'] = (stats.byStatus[log.status || 'info'] || 0) + 1;
    });

    return stats;
  }
}

// Instancia singleton
export const loggerService = new LoggerService();

// Agregar algunos logs de ejemplo al inicio
loggerService.addLog({
  type: 'system_error',
  message: 'Sistema de logs inicializado',
  status: 'info'
});

export default loggerService; 