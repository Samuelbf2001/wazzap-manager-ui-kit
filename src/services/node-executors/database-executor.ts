import { NodeExecutor, NodeExecutionContext, NodeExecutionResult, DatabaseNodeData } from '@/types/conversation';

/**
 * Ejecutor para nodos de base de datos
 * Maneja operaciones CRUD (Create, Read, Update, Delete)
 */
export class DatabaseExecutor implements NodeExecutor {
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    try {
      const data = context.flowData as DatabaseNodeData;
      
      let result: any;
      
      // Ejecutar operación según el tipo
      switch (data.operation) {
        case 'select':
          result = await this.executeSelect(data, context);
          break;
        case 'insert':
          result = await this.executeInsert(data, context);
          break;
        case 'update':
          result = await this.executeUpdate(data, context);
          break;
        case 'delete':
          result = await this.executeDelete(data, context);
          break;
        default:
          throw new Error(`Operación no soportada: ${data.operation}`);
      }

      // Guardar resultado en variable si está configurado
      if (data.outputVariable && result) {
        context.setVariable(data.outputVariable, result);
      }

      // Logging
      context.logStep({
        operation: data.operation,
        table: data.table,
        result: result,
        rowsAffected: Array.isArray(result) ? result.length : (result ? 1 : 0)
      });

      return {
        success: true,
        output: {
          operation: data.operation,
          table: data.table,
          result,
          timestamp: new Date().toISOString()
        },
        waitingForInput: false,
        variables: data.outputVariable ? { [data.outputVariable]: result } : undefined
      };
    } catch (error) {
      console.error('Error en DatabaseExecutor:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en operación de base de datos',
        waitingForInput: false
      };
    }
  }

  /**
   * Ejecuta operación SELECT
   */
  private async executeSelect(data: DatabaseNodeData, context: NodeExecutionContext): Promise<any[]> {
    console.log(`📊 Ejecutando SELECT en tabla: ${data.table}`);
    
    // Procesar condiciones con variables
    const processedConditions = this.processConditions(data.conditions, context);
    
    // Simular consulta a base de datos
    const mockData = await this.simulateDatabase(data.table, 'select', processedConditions);
    
    console.log(`✅ SELECT completado: ${mockData.length} registros encontrados`);
    return mockData;
  }

  /**
   * Ejecuta operación INSERT
   */
  private async executeInsert(data: DatabaseNodeData, context: NodeExecutionContext): Promise<any> {
    console.log(`📝 Ejecutando INSERT en tabla: ${data.table}`);
    
    // Procesar datos a insertar con variables
    const processedData = this.processInsertData(data, context);
    
    // Simular inserción
    const result = await this.simulateDatabase(data.table, 'insert', processedData);
    
    console.log(`✅ INSERT completado: registro insertado con ID ${result.id}`);
    return result;
  }

  /**
   * Ejecuta operación UPDATE
   */
  private async executeUpdate(data: DatabaseNodeData, context: NodeExecutionContext): Promise<any> {
    console.log(`✏️ Ejecutando UPDATE en tabla: ${data.table}`);
    
    const processedConditions = this.processConditions(data.conditions, context);
    const processedData = this.processInsertData(data, context);
    
    // Simular actualización
    const result = await this.simulateDatabase(data.table, 'update', { ...processedData, ...processedConditions });
    
    console.log(`✅ UPDATE completado: ${result.rowsAffected} registros actualizados`);
    return result;
  }

  /**
   * Ejecuta operación DELETE
   */
  private async executeDelete(data: DatabaseNodeData, context: NodeExecutionContext): Promise<any> {
    console.log(`🗑️ Ejecutando DELETE en tabla: ${data.table}`);
    
    const processedConditions = this.processConditions(data.conditions, context);
    
    // Simular eliminación
    const result = await this.simulateDatabase(data.table, 'delete', processedConditions);
    
    console.log(`✅ DELETE completado: ${result.rowsAffected} registros eliminados`);
    return result;
  }

  /**
   * Procesa condiciones reemplazando variables
   */
  private processConditions(conditions: Record<string, any>, context: NodeExecutionContext): Record<string, any> {
    const processed: Record<string, any> = {};
    
    Object.entries(conditions).forEach(([key, value]) => {
      if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
        // Es una variable
        const varName = value.slice(1, -1);
        processed[key] = context.getVariable(varName);
      } else {
        processed[key] = value;
      }
    });
    
    return processed;
  }

  /**
   * Procesa datos de inserción/actualización
   */
  protected processInsertData(data: DatabaseNodeData, context: NodeExecutionContext): Record<string, any> {
    const processedData: Record<string, any> = {};
    
    // Procesar campos especificados
    data.fields.forEach(field => {
      const variableValue = context.getVariable(field);
      if (variableValue !== undefined) {
        processedData[field] = variableValue;
      }
    });
    
    // Agregar datos automáticos
    processedData.updated_at = new Date().toISOString();
    processedData.thread_id = context.threadId;
    
    return processedData;
  }

  /**
   * Simula operaciones de base de datos (placeholder)
   */
  private async simulateDatabase(table: string, operation: string, data: any): Promise<any> {
    // Simular delay de base de datos
    await new Promise(resolve => setTimeout(resolve, 200));
    
    switch (operation) {
      case 'select':
        return this.getMockData(table, data);
      case 'insert':
        return {
          id: Math.floor(Math.random() * 10000),
          ...data,
          created_at: new Date().toISOString()
        };
      case 'update':
        return { rowsAffected: Math.floor(Math.random() * 5) + 1 };
      case 'delete':
        return { rowsAffected: Math.floor(Math.random() * 3) + 1 };
      default:
        return null;
    }
  }

  /**
   * Genera datos mock para simulación
   */
  private getMockData(table: string, conditions: any): any[] {
    const mockTables: Record<string, any[]> = {
      users: [
        { id: 1, name: 'Juan Pérez', email: 'juan@example.com', phone: '+1234567890', created_at: '2024-01-01T00:00:00Z' },
        { id: 2, name: 'María García', email: 'maria@example.com', phone: '+1234567891', created_at: '2024-01-02T00:00:00Z' },
        { id: 3, name: 'Carlos López', email: 'carlos@example.com', phone: '+1234567892', created_at: '2024-01-03T00:00:00Z' }
      ],
      products: [
        { id: 1, name: 'Producto A', price: 100, category: 'electronics', stock: 50 },
        { id: 2, name: 'Producto B', price: 200, category: 'clothing', stock: 30 },
        { id: 3, name: 'Producto C', price: 150, category: 'electronics', stock: 20 }
      ],
      orders: [
        { id: 1, user_id: 1, product_id: 1, quantity: 2, status: 'pending', total: 200, created_at: '2024-01-01T10:00:00Z' },
        { id: 2, user_id: 2, product_id: 2, quantity: 1, status: 'completed', total: 200, created_at: '2024-01-02T10:00:00Z' }
      ],
      conversations: [
        { id: 1, thread_id: 'thread_123', user_id: 1, status: 'active', started_at: '2024-01-01T08:00:00Z' },
        { id: 2, thread_id: 'thread_456', user_id: 2, status: 'completed', started_at: '2024-01-02T08:00:00Z' }
      ]
    };

    const tableData = mockTables[table] || [];
    
    // Filtrar por condiciones si existen
    if (conditions && Object.keys(conditions).length > 0) {
      return tableData.filter(row => {
        return Object.entries(conditions).every(([key, value]) => {
          return row[key] === value;
        });
      });
    }
    
    return tableData;
  }
}

/**
 * Ejecutor especializado para operaciones HubSpot
 */
export class HubSpotDatabaseExecutor extends DatabaseExecutor {
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    try {
      const data = context.flowData;
      
      console.log('🔗 Ejecutando operación HubSpot:', data.operation);
      
      let result: any;
      
      switch (data.operation) {
        case 'create_contact':
          result = await this.createHubSpotContact(data, context);
          break;
        case 'update_contact':
          result = await this.updateHubSpotContact(data, context);
          break;
        case 'create_deal':
          result = await this.createHubSpotDeal(data, context);
          break;
        case 'get_contact':
          result = await this.getHubSpotContact(data, context);
          break;
        default:
          return await super.execute(context);
      }

      // Guardar en variable si está configurado
      if (data.outputVariable) {
        context.setVariable(data.outputVariable, result);
      }

      return {
        success: true,
        output: {
          hubspotOperation: data.operation,
          result,
          timestamp: new Date().toISOString()
        },
        waitingForInput: false,
        variables: data.outputVariable ? { [data.outputVariable]: result } : undefined
      };
    } catch (error) {
      console.error('Error en HubSpotDatabaseExecutor:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en operación HubSpot',
        waitingForInput: false
      };
    }
  }

  /**
   * Crea un contacto en HubSpot
   */
  private async createHubSpotContact(data: any, context: NodeExecutionContext): Promise<any> {
    const contactData = {
      email: context.getVariable('email') || context.getVariable('userEmail'),
      firstname: context.getVariable('firstName') || context.getVariable('nombre'),
      lastname: context.getVariable('lastName') || context.getVariable('apellido'),
      phone: context.getVariable('phoneNumber'),
      lifecyclestage: 'lead',
      whatsapp_thread_id: context.threadId
    };

    console.log('👤 Creando contacto HubSpot:', contactData);
    
    // Simular API call a HubSpot
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: Math.floor(Math.random() * 100000),
      ...contactData,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Actualiza un contacto en HubSpot
   */
  private async updateHubSpotContact(data: any, context: NodeExecutionContext): Promise<any> {
    const contactId = context.getVariable('hubspotContactId');
    const updateData = this.processInsertData(data, context);
    
    console.log(`✏️ Actualizando contacto HubSpot ${contactId}:`, updateData);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      id: contactId,
      ...updateData,
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Crea un deal en HubSpot
   */
  private async createHubSpotDeal(data: any, context: NodeExecutionContext): Promise<any> {
    const dealData = {
      dealname: context.getVariable('dealName') || 'Deal desde WhatsApp',
      amount: context.getVariable('amount') || 0,
      dealstage: context.getVariable('dealStage') || 'qualifiedtobuy',
      pipeline: 'default',
      whatsapp_thread_id: context.threadId,
      source: 'WhatsApp Bot'
    };

    console.log('💼 Creando deal HubSpot:', dealData);
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      id: Math.floor(Math.random() * 100000),
      ...dealData,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Obtiene un contacto de HubSpot
   */
  private async getHubSpotContact(data: any, context: NodeExecutionContext): Promise<any> {
    const email = context.getVariable('email') || context.getVariable('userEmail');
    
    console.log(`🔍 Buscando contacto HubSpot por email: ${email}`);
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Simular respuesta
    return {
      id: Math.floor(Math.random() * 100000),
      email,
      firstname: 'Usuario',
      lastname: 'Demo',
      phone: context.getVariable('phoneNumber'),
      lifecyclestage: 'lead',
      found: true
    };
  }
} 