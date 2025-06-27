import { toast } from "sonner";
import { databaseService, type WhatsAppConnection } from './database.service';

interface Connection {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending' | 'connected';
  instance_state: string | null;
  instance_name: string | null;
  phone_number?: string;
  created_at: string;
  qr_code?: string;
}

class ConnectionMonitorService {
  private connections: Connection[] = [];
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();
  private qrUpdateCallbacks: Map<string, (qrCode: string) => void> = new Map();
  private modalCloseCallbacks: Map<string, () => void> = new Map();
  
  // URL del webhook para monitoreo de estado cada 15 segundos
  private webhookUrl = 'https://n8n-n8n.5raxun.easypanel.host/webhook/b84f89be-15fe-48e2-9dc7-bd6761393458';
  
  constructor() {
    this.loadConnectionsFromDatabase();
    console.log('🔧 ConnectionMonitorService iniciado');
  }

  private async loadConnectionsFromDatabase(): Promise<void> {
    try {
      const dbConnections = databaseService.getAllConnections();
      this.connections = dbConnections;
      console.log(`📊 Cargadas ${this.connections.length} conexiones desde la base de datos`);
      
      // Log de inicialización
      await databaseService.addAdvancedLog({
        type: 'system_error', // Usamos system_error como categoría general
        message: `Monitor de conexiones iniciado con ${this.connections.length} conexiones`,
        status: 'info',
        source: 'system',
        level: 'info',
        data: {
          total_connections: this.connections.length,
          active_connections: this.connections.filter(c => c.status === 'active').length
        }
      });
    } catch (error) {
      console.error('❌ Error cargando conexiones:', error);
      await databaseService.addAdvancedLog({
        type: 'system_error',
        message: 'Error al cargar conexiones desde la base de datos',
        status: 'error',
        source: 'system',
        level: 'error',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // Crear nueva conexión y iniciar monitoreo
  async createConnection(connectionData: Omit<Connection, 'id' | 'created_at'>): Promise<Connection> {
    try {
      const startTime = performance.now();
      
      // Crear en la base de datos
      const dbConnection = await databaseService.createConnection({
        ...connectionData,
        status: 'active', // Siempre empezamos como 'active' para el monitoreo
        features: ['Bot', 'Webhook', 'Variables', 'Logs'],
        agent_assigned: 'Sin asignar'
      });

      // Actualizar array local
      this.connections.push(dbConnection);

      const endTime = performance.now();
      
      // Log detallado de creación
      await databaseService.addAdvancedLog({
        connection_id: dbConnection.id,
        type: 'form_submission',
        sessionName: dbConnection.name,
        phoneNumber: dbConnection.phone_number,
        message: `Nueva conexión creada: ${dbConnection.name}`,
        status: 'success',
        source: 'user',
        level: 'info',
        data: {
          connection_id: dbConnection.id,
          connection_name: dbConnection.name,
          phone_number: dbConnection.phone_number,
          status: dbConnection.status,
          instance_state: dbConnection.instance_state
        },
        metadata: {
          response_time: Math.round(endTime - startTime),
          request_size: JSON.stringify(connectionData).length
        }
      });

      // Iniciar monitoreo automáticamente
      this.startMonitoring(dbConnection.id);
      
      console.log('✅ Conexión creada y monitoreo iniciado:', dbConnection);
      return dbConnection;
    } catch (error) {
      console.error('❌ Error creando conexión:', error);
      await databaseService.addAdvancedLog({
        type: 'system_error',
        message: `Error al crear conexión: ${connectionData.name}`,
        status: 'error',
        source: 'system',
        level: 'error',
        error: error instanceof Error ? error.message : String(error),
        data: connectionData
      });
      throw error;
    }
  }

  // Iniciar monitoreo de una conexión específica
  startMonitoring(connectionId: string): void {
    const connection = this.connections.find(c => c.id === connectionId);
    if (!connection) {
      console.error(`❌ Conexión no encontrada: ${connectionId}`);
      return;
    }

    // Si ya está siendo monitoreada, no hacer nada
    if (this.monitoringIntervals.has(connectionId)) {
      console.log(`⏭️ La conexión ${connection.name} ya está siendo monitoreada`);
      return;
    }

    console.log(`🚀 [${connection.name}] INICIANDO MONITOREO CADA 15 SEGUNDOS...`);
    console.log(`🔍 [${connection.name}] Connection ID: "${connectionId}"`);
    console.log(`📊 [${connection.name}] Intervalos activos antes de crear:`, Array.from(this.monitoringIntervals.keys()));
    
    console.log(`\n⏰ [${new Date().toLocaleTimeString()}] MONITOREO INICIADO para ${connection.name}`);
    console.log(`🔄 Se verificará cada 15 segundos hasta que se conecte exitosamente\n`);
    
    // Log de inicio de monitoreo
    databaseService.addAdvancedLog({
      connection_id: connectionId,
      type: 'system_error', // Categoría general del sistema
      sessionName: connection.name,
      phoneNumber: connection.phone_number,
      message: `Iniciando monitoreo automático cada 15 segundos`,
      status: 'info',
      source: 'system',
      level: 'info',
      data: {
        webhook_url: this.webhookUrl,
        monitoring_interval: 15000,
        connection_status: connection.status,
        connection_id: connectionId
      }
    });

    console.log(`⚙️ [${connection.name}] Creando setInterval cada 15 segundos...`);
    
    const interval = setInterval(async () => {
      const activeIntervals = Array.from(this.monitoringIntervals.keys());
      console.log(`🔄 [${new Date().toLocaleTimeString()}] ⏰ VERIFICACIÓN AUTOMÁTICA: ${connection.name} (cada 15 segundos)`);
      console.log(`📊 [${connection.name}] Intervalos activos: ${activeIntervals.length} | IDs: [${activeIntervals.join(', ')}]`);
      await this.checkConnection(connectionId);
    }, 15000); // 15 segundos

    console.log(`✅ [${connection.name}] setInterval creado exitosamente`);
    console.log(`💾 [${connection.name}] Guardando intervalo en Map con ID: "${connectionId}"`);
    
    this.monitoringIntervals.set(connectionId, interval);
    
    console.log(`✅ [${connection.name}] Intervalo guardado en Map`);
    console.log(`📊 [${connection.name}] Intervalos activos después de crear:`, Array.from(this.monitoringIntervals.keys()));
    console.log(`🎯 [${connection.name}] ¡MONITOREO ACTIVO! Cada 15 segundos verificará el estado\n`);
  }

  // Verificar estado de una conexión
  private async checkConnection(connectionId: string): Promise<void> {
    const connection = this.connections.find(c => c.id === connectionId);
    if (!connection) {
      console.error(`❌ Conexión no encontrada para verificar: ${connectionId}`);
      return;
    }

    console.log(`📡 [${new Date().toLocaleTimeString()}] Enviando GET al webhook para: ${connection.name}`);

    try {
      const startTime = performance.now();
      
      // 🎯 ENVIAR NOMBRE DE CONEXIÓN EN GET (corregido según usuario)
      const url = `${this.webhookUrl}?connection_name=${encodeURIComponent(connection.name)}`;
      
      console.log(`🌐 GET → ${url}`);
      
      // Log de request
      await databaseService.addAdvancedLog({
        connection_id: connectionId,
        type: 'webhook_request',
        sessionName: connection.name,
        phoneNumber: connection.phone_number,
        message: `Verificando estado de conexión cada 15 segundos`,
        status: 'info',
        source: 'webhook',
        level: 'info',
        metadata: {
          url: url,
          method: 'GET'
        }
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      console.log(`📊 [${new Date().toLocaleTimeString()}] Respuesta: ${response.status} ${response.statusText} (${responseTime}ms)`);

      if (response.status === 304) {
        // 304 = No modificado, continúa monitoreando silenciosamente
        console.log(`⏩ 304 Not Modified - Sin cambios para ${connection.name}`);
        return;
      } else {
        // 200 = Contenido nuevo, procesar respuesta
        let data: any;
        try {
          const rawText = await response.text();
          console.log(`📄 Respuesta recibida para ${connection.name} (${rawText.length} caracteres)`);
          
          if (rawText.trim()) {
            data = JSON.parse(rawText);
            console.log(`✅ JSON parseado exitosamente para ${connection.name}`);
            
            // Log de response exitosa
            await databaseService.addAdvancedLog({
              connection_id: connectionId,
              type: 'webhook_response',
              sessionName: connection.name,
              phoneNumber: connection.phone_number,
              message: `Respuesta recibida del webhook`,
              status: 'success',
              source: 'webhook',
              level: 'info',
              data: data,
              metadata: {
                url: url,
                method: 'GET',
                response_time: responseTime,
                response_size: rawText.length
              }
            });
          } else {
            console.log(`📭 Respuesta vacía para ${connection.name} - Continuando monitoreo`);
            console.log(`⚠️ [${connection.name}] El webhook respondió vacío. Si la conexión YA está establecida, ejecuta: stopMonitoringByName("${connection.name}")`);
            return;
          }
        } catch (error) {
          console.error(`💥 Error parseando JSON para ${connection.name}:`, error);
          
          await databaseService.addAdvancedLog({
            connection_id: connectionId,
            type: 'webhook_error',
            sessionName: connection.name,
            phoneNumber: connection.phone_number,
            message: `Error al procesar respuesta del webhook`,
            status: 'error',
            source: 'webhook',
            level: 'error',
            error: error instanceof Error ? error.message : String(error),
            metadata: {
              url: url,
              method: 'GET',
              response_time: responseTime
            }
          });
          return;
        }

        // ✅ VERIFICAR RESPUESTA ESPECÍFICA DEL USUARIO
        // Formatos soportados:
        // 1. {"instanceName": "test", "state": "open"} - FORMATO REAL
        // 2. [{"instance": {"instanceName": "test", "state": "open"}}] - FORMATO ALTERNATIVO
        let isConnected = false;
        let instanceName = null;
        let newQR = null;
        
        console.log(`🔍 [${connection.name}] Analizando respuesta del webhook...`);
        console.log(`📦 [${connection.name}] Estructura recibida:`, JSON.stringify(data, null, 2));
        
        // 🎯 FORMATO 1: DIRECTO {"instanceName": "...", "state": "..."}
        if (data && typeof data === 'object' && data.instanceName && data.state) {
          instanceName = data.instanceName;
          const state = data.state;
          
          console.log(`📋 [${connection.name}] ✅ FORMATO DIRECTO DETECTADO!`);
          console.log(`📱 [${connection.name}] Instance Name: "${instanceName}"`);
          console.log(`🔌 [${connection.name}] State: "${state}"`);
          
          // ✅ VALIDAR QUE EL NOMBRE DE INSTANCIA COINCIDA
          if (instanceName === connection.name) {
            console.log(`✅ [${connection.name}] Instance name coincide perfectamente`);
          } else {
            console.log(`⚠️ [${connection.name}] ADVERTENCIA: Instance name "${instanceName}" ≠ connection name "${connection.name}"`);
            console.log(`🔄 [${connection.name}] Procesando de todas formas...`);
          }
          
          if (state === 'open') {
            isConnected = true;
            console.log(`🎉 [${connection.name}] ¡¡¡CONEXIÓN ESTABLECIDA!!! QR fue escaneado exitosamente`);
            console.log(`✅ [${connection.name}] WhatsApp conectado como instancia: "${instanceName}"`);
          } else {
            console.log(`⏳ [${connection.name}] Estado "${state}" - Esperando escaneo del QR...`);
            console.log(`🔄 [${connection.name}] Continuará verificando cada 15 segundos hasta que sea "open"`);
          }
        }
        // 🎯 FORMATO 2: ARRAY [{"instance": {"instanceName": "...", "state": "..."}}]
        else if (Array.isArray(data) && data.length > 0 && data[0]?.instance) {
          const instance = data[0].instance;
          instanceName = instance.instanceName;
          const state = instance.state;
          
          console.log(`📋 [${connection.name}] ✅ FORMATO ARRAY DETECTADO!`);
          console.log(`📱 [${connection.name}] Instance Name: "${instanceName}"`);
          console.log(`🔌 [${connection.name}] State: "${state}"`);
          
          // ✅ VALIDAR QUE EL NOMBRE DE INSTANCIA COINCIDA
          if (instanceName === connection.name) {
            console.log(`✅ [${connection.name}] Instance name coincide perfectamente`);
          } else {
            console.log(`⚠️ [${connection.name}] ADVERTENCIA: Instance name "${instanceName}" ≠ connection name "${connection.name}"`);
            console.log(`🔄 [${connection.name}] Procesando de todas formas...`);
          }
          
          if (state === 'open') {
            isConnected = true;
            console.log(`🎉 [${connection.name}] ¡¡¡CONEXIÓN ESTABLECIDA!!! QR fue escaneado exitosamente`);
            console.log(`✅ [${connection.name}] WhatsApp conectado como instancia: "${instanceName}"`);
          } else {
            console.log(`⏳ [${connection.name}] Estado "${state}" - Esperando escaneo del QR...`);
            console.log(`🔄 [${connection.name}] Continuará verificando cada 15 segundos hasta que sea "open"`);
          }
        } else {
          // Si no tiene el formato esperado, buscar QR en base64
          console.log(`🔄 Buscando QR en respuesta...`);
          
          // Buscar QR en diferentes ubicaciones posibles
          if (data?.base64) {
            newQR = data.base64;
          } else if (data?.qr_code) {
            newQR = data.qr_code;
          } else if (data?.data?.base64) {
            newQR = data.data.base64;
          } else if (Array.isArray(data)) {
            for (const item of data) {
              if (item?.base64 || item?.qr_code || item?.data?.base64) {
                newQR = item.base64 || item.qr_code || item.data?.base64;
                break;
              }
            }
          }
          
          if (newQR) {
            console.log(`🆕 QR actualizado para ${connection.name} - Continuando monitoreo`);
            
            // Log de nuevo QR
            await databaseService.addAdvancedLog({
              connection_id: connectionId,
              type: 'qr_generated',
              sessionName: connection.name,
              phoneNumber: connection.phone_number,
              message: `Nuevo QR recibido del webhook de monitoreo`,
              status: 'info',
              source: 'webhook',
              level: 'info',
              data: { qr_length: newQR.length }
            });
            
            // Actualizar QR usando callback
            const qrCallback = this.qrUpdateCallbacks.get(connectionId);
            if (qrCallback) {
              qrCallback(newQR);
            }
            
            // Continuar monitoreando después de actualizar QR
            return;
          } else {
            console.log(`❓ No se encontró QR ni estado "open" para ${connection.name} - Continuando monitoreo`);
          }
        }
        
        // 🎯 CUANDO SE DETECTA QUE EL QR FUE ESCANEADO (state: "open")
        if (isConnected && instanceName) {
          console.log(`\n🎉 ═══════════════════════════════════════════════════════════`);
          console.log(`🎉 [${connection.name}] ¡¡¡CONEXIÓN WHATSAPP ESTABLECIDA!!!`);
          console.log(`🎉 [${connection.name}] QR fue escaneado exitosamente`);
          console.log(`🎉 [${connection.name}] Instancia creada: "${instanceName}"`);
          
          // ✅ VALIDACIÓN FINAL DEL NOMBRE
          if (instanceName === connection.name) {
            console.log(`🎉 [${connection.name}] ✅ Nombres coinciden: "${connection.name}" = "${instanceName}"`);
          } else {
            console.log(`🎉 [${connection.name}] ⚠️ Nombres diferentes: "${connection.name}" ≠ "${instanceName}"`);
          }
          
          console.log(`🎉 ═══════════════════════════════════════════════════════════\n`);
          
          // 1️⃣ ACTUALIZAR ESTADO EN BASE DE DATOS A "CONECTADO"
          console.log(`💾 [${connection.name}] Actualizando estado en base de datos...`);
          await databaseService.updateConnection(connection.id, {
            status: 'connected',
            instance_state: 'open',
            instance_name: instanceName,
            phone_number: connection.phone_number
          });
          console.log(`✅ [${connection.name}] Estado actualizado a "connected" en BD`);

          // 2️⃣ ACTUALIZAR ESTADO LOCAL PARA REFRESCAR LA TABLA
          const localIndex = this.connections.findIndex(c => c.id === connection.id);
          if (localIndex > -1) {
            this.connections[localIndex] = {
              ...this.connections[localIndex],
              status: 'connected',
              instance_state: 'open',
              instance_name: instanceName
            };
            console.log(`🔄 [${connection.name}] Lista local actualizada - aparecerá como "Conectado"`);
          }

          // 3️⃣ GUARDAR LOG DE ÉXITO
          await databaseService.addAdvancedLog({
            connection_id: connectionId,
            type: 'connection_restored',
            sessionName: connection.name,
            phoneNumber: connection.phone_number,
            message: `¡QR escaneado! Conexión WhatsApp establecida como: ${instanceName}`,
            status: 'success',
            source: 'webhook',
            level: 'info',
            data: {
              instance_name: instanceName,
              state: 'open',
              connection_id: connectionId,
              previous_status: connection.status,
              webhook_response: data,
              detection_method: 'automatic_webhook_monitoring'
            },
            metadata: {
              response_time: responseTime,
              url: url
            }
          });

          // 4️⃣ MOSTRAR NOTIFICACIÓN DE ÉXITO
          toast.success(`🎉 ¡Conexión WhatsApp establecida!`, {
            description: `${instanceName} conectado exitosamente. El QR fue escaneado.`,
            duration: 7000,
          });

          // 5️⃣ CERRAR MODAL AUTOMÁTICAMENTE
          const modalCloseCallback = this.modalCloseCallbacks.get(connection.id);
          if (modalCloseCallback) {
            console.log(`🔄 [${connection.name}] Cerrando ventana/modal automáticamente...`);
            try {
              modalCloseCallback();
              console.log(`✅ [${connection.name}] Modal cerrado automáticamente - QR fue escaneado`);
              this.modalCloseCallbacks.delete(connection.id);
            } catch (error) {
              console.error(`❌ [${connection.name}] Error cerrando modal automáticamente:`, error);
            }
          } else {
            console.log(`⚠️ [${connection.name}] No se encontró callback para cerrar modal`);
          }

          // 6️⃣ DETENER MONITOREO AUTOMÁTICO DE 15 SEGUNDOS
          console.log(`🚨 [${connection.name}] ¡EJECUTANDO DETENCIÓN DE MONITOREO!`);
          console.log(`🚨 [${connection.name}] Connection ID que se usará: "${connection.id}"`);
          console.log(`🚨 [${connection.name}] Llamando a stopMonitoring...`);
          
          this.stopMonitoring(connection.id);
          
          console.log(`🚨 [${connection.name}] stopMonitoring() ejecutado`);
          console.log(`🛑 [${connection.name}] ¡El monitoreo de 15 segundos DEBE estar detenido ahora!\n`);
        }
      }
    } catch (error) {
      console.error(`💥 [${new Date().toLocaleTimeString()}] ERROR verificando ${connection.name}:`, error);
      console.log(`🔄 Continuando monitoreo cada 15 segundos para ${connection.name}...`);
      
      await databaseService.addAdvancedLog({
        connection_id: connectionId,
        type: 'webhook_error',
        sessionName: connection.name,
        phoneNumber: connection.phone_number,
        message: `Error de conexión al verificar estado`,
        status: 'error',
        source: 'webhook',
        level: 'error',
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          url: this.webhookUrl
        }
      });
    }
  }

  // Detener monitoreo de una conexión
  stopMonitoring(connectionId: string): void {
    console.log(`\n🛑 [${new Date().toLocaleTimeString()}] INTENTANDO DETENER MONITOREO...`);
    console.log(`🔍 Connection ID recibido: "${connectionId}"`);
    console.log(`📊 Intervalos activos actuales:`, Array.from(this.monitoringIntervals.keys()));
    
    const interval = this.monitoringIntervals.get(connectionId);
    if (interval) {
      console.log(`✅ INTERVALO ENCONTRADO para ID: "${connectionId}"`);
      console.log(`🛑 Ejecutando clearInterval...`);
      
      clearInterval(interval);
      this.monitoringIntervals.delete(connectionId);
      
      console.log(`✅ INTERVALO LIMPIADO Y ELIMINADO del Map`);
      console.log(`📊 Intervalos activos restantes:`, Array.from(this.monitoringIntervals.keys()));
      
      const connection = this.connections.find(c => c.id === connectionId);
      const connectionName = connection?.name || connectionId;
      
      console.log(`\n🎉 ===============================================`);
      console.log(`🎉 MONITOREO DETENIDO EXITOSAMENTE`);
      console.log(`🎉 Conexión: ${connectionName} (ID: ${connectionId})`);
      console.log(`🎉 Ya NO habrá más verificaciones cada 15 segundos`);
      console.log(`🎉 ===============================================\n`);
      
      // Log de detención de monitoreo
      databaseService.addAdvancedLog({
        connection_id: connectionId,
        type: 'system_error', // Categoría general
        sessionName: connectionName,
        message: `✅ Monitoreo automático detenido exitosamente - Conexión establecida`,
        status: 'info',
        source: 'system',
        level: 'info',
        data: {
          reason: 'Connection established - state: open detected',
          monitoring_duration: 'Variable',
          stopped_at: new Date().toISOString(),
          connection_id: connectionId
        }
      });
    } else {
      console.log(`❌ NO SE ENCONTRÓ INTERVALO para ID: "${connectionId}"`);
      console.log(`⚠️ El monitoreo podría no haberse iniciado correctamente o ya fue detenido`);
      console.log(`📊 Intervalos disponibles:`, Array.from(this.monitoringIntervals.keys()));
      
      const connection = this.connections.find(c => c.id === connectionId);
      const connectionName = connection?.name || connectionId;
      
      console.log(`⚠️ ADVERTENCIA: No se puede detener monitoreo de ${connectionName}`);
    }
  }

  // 🚨 FUNCIÓN DE EMERGENCIA: Detener TODOS los monitoreos de una conexión por nombre
  forceStopMonitoringByName(connectionName: string): void {
    console.log(`\n🚨 DETENCIÓN FORZADA DE TODOS LOS MONITOREOS PARA: "${connectionName}"`);
    console.log(`📊 Intervalos activos antes de limpiar:`, Array.from(this.monitoringIntervals.keys()));
    
    let stoppedCount = 0;
    const connectionsToStop = this.connections.filter(conn => conn.name === connectionName);
    
    for (const connection of connectionsToStop) {
      const interval = this.monitoringIntervals.get(connection.id);
      if (interval) {
        console.log(`🛑 Deteniendo intervalo para ID: "${connection.id}" (${connection.name})`);
        clearInterval(interval);
        this.monitoringIntervals.delete(connection.id);
        stoppedCount++;
      }
    }
    
    console.log(`✅ DETENCIÓN FORZADA COMPLETADA: ${stoppedCount} intervalos detenidos`);
    console.log(`📊 Intervalos activos restantes:`, Array.from(this.monitoringIntervals.keys()));
    
    if (stoppedCount > 0) {
      console.log(`🎉 ¡ÉXITO! Ya no habrá más verificaciones cada 15 segundos para "${connectionName}"`);
    } else {
      console.log(`⚠️ No se encontraron intervalos activos para "${connectionName}"`);
    }
  }

  // 🚨 FUNCIÓN DE EMERGENCIA: Detener ABSOLUTAMENTE TODOS los monitoreos
  forceStopAllMonitoring(): void {
    console.log(`\n🚨🚨🚨 DETENCIÓN FORZADA DE TODOS LOS MONITOREOS 🚨🚨🚨`);
    console.log(`📊 Intervalos activos:`, Array.from(this.monitoringIntervals.keys()));
    
    let stoppedCount = 0;
    for (const [connectionId, interval] of this.monitoringIntervals.entries()) {
      console.log(`🛑 Deteniendo intervalo para ID: "${connectionId}"`);
      clearInterval(interval);
      stoppedCount++;
    }
    
    this.monitoringIntervals.clear();
    
    console.log(`✅ TODOS LOS MONITOREOS DETENIDOS: ${stoppedCount} intervalos eliminados`);
    console.log(`📊 Intervalos activos restantes:`, Array.from(this.monitoringIntervals.keys()));
    console.log(`🎉 ¡Ya NO habrá más verificaciones cada 15 segundos!`);
  }

  // Registrar callback para actualización de QR
  registerQRUpdateCallback(connectionId: string, callback: (qrCode: string) => void): void {
    this.qrUpdateCallbacks.set(connectionId, callback);
    console.log(`📝 Callback de actualización QR registrado para conexión: ${connectionId}`);
  }

  // Registrar callback para cierre de modal
  registerModalCloseCallback(connectionId: string, callback: () => void): void {
    this.modalCloseCallbacks.set(connectionId, callback);
    console.log(`📝 Callback de cierre de modal registrado para conexión: ${connectionId}`);
  }

  // Limpiar callbacks pendientes
  clearCallbacks(connectionId: string): void {
    this.qrUpdateCallbacks.delete(connectionId);
    this.modalCloseCallbacks.delete(connectionId);
    console.log(`🧹 Callbacks limpiados para conexión: ${connectionId}`);
  }

  // Obtener todas las conexiones
  getConnections(): Connection[] {
    return [...this.connections];
  }

  // Eliminar conexión
  async deleteConnection(connectionId: string): Promise<boolean> {
    try {
      const connection = this.connections.find(c => c.id === connectionId);
      const connectionName = connection?.name || connectionId;
      
      // Detener monitoreo
      this.stopMonitoring(connectionId);
      
      // Limpiar callbacks
      this.clearCallbacks(connectionId);
      
      // Eliminar de base de datos
      const deleted = await databaseService.deleteConnection(connectionId);
      
      if (deleted) {
        // Actualizar array local
        this.connections = this.connections.filter(c => c.id !== connectionId);
        
        // Log de eliminación
        await databaseService.addAdvancedLog({
          connection_id: connectionId,
          type: 'system_error', // Categoría general
          sessionName: connectionName,
          message: `Conexión eliminada permanentemente`,
          status: 'warning',
          source: 'user',
          level: 'warn',
          data: {
            deleted_connection_id: connectionId,
            deleted_connection_name: connectionName,
            remaining_connections: this.connections.length
          }
        });
        
        console.log(`🗑️ Conexión eliminada: ${connectionName}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error eliminando conexión:', error);
      
      await databaseService.addAdvancedLog({
        connection_id: connectionId,
        type: 'system_error',
        message: `Error al eliminar conexión`,
        status: 'error',
        source: 'system',
        level: 'error',
        error: error instanceof Error ? error.message : String(error)
      });
      
      return false;
    }
  }

  // Obtener estadísticas
  getStats() {
    const stats = databaseService.getConnectionStats();
    console.log('📊 Estadísticas de conexiones:', stats);
    return stats;
  }
}

// Instancia singleton
export const connectionMonitorService = new ConnectionMonitorService();

// 🚨 FUNCIONES DE EMERGENCIA DISPONIBLES EN CONSOLA DEL NAVEGADOR
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.connectionMonitorService = connectionMonitorService;
  
  // @ts-ignore
  window.stopAllMonitoring = () => {
    console.log('🚨 Ejecutando detención forzada de TODOS los monitoreos...');
    connectionMonitorService.forceStopAllMonitoring();
  };
  
  // @ts-ignore
  window.stopMonitoringByName = (name: string) => {
    console.log(`🚨 Ejecutando detención forzada para: "${name}"`);
    connectionMonitorService.forceStopMonitoringByName(name);
  };
  
  // @ts-ignore
  window.showActiveMonitoring = () => {
    const intervals = Array.from(connectionMonitorService['monitoringIntervals'].keys());
    console.log('📊 Intervalos de monitoreo activos:', intervals);
    console.log('📋 Total de intervalos activos:', intervals.length);
    return intervals;
  };
  
  console.log('🔧 FUNCIONES DE EMERGENCIA DISPONIBLES EN CONSOLA:');
  console.log('• stopAllMonitoring() - Detiene TODOS los monitoreos');
  console.log('• stopMonitoringByName("nombre") - Detiene monitoreo por nombre');
  console.log('• showActiveMonitoring() - Muestra intervalos activos');
} 