import { NodeExecutor, NodeExecutionContext, NodeExecutionResult, DatabaseNodeData } from '@/types/conversation';
import { db, DatabaseHelpers } from '@/lib/database';

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
    
    try {
      // Procesar condiciones con variables
      const processedConditions = this.processConditions(data.conditions, context);
      
      // Construir query dinámicamente
      const { query, values } = this.buildSelectQuery(data.table, processedConditions);
      
      // Ejecutar query
      const result = await db.query(query, values);
      
      console.log(`✅ SELECT completado: ${result.rows.length} registros encontrados`);
      return result.rows;
    } catch (error) {
      console.error('Error en SELECT:', error);
      throw error;
    }
  }

  /**
   * Ejecuta operación INSERT
   */
  private async executeInsert(data: DatabaseNodeData, context: NodeExecutionContext): Promise<any> {
    console.log(`📝 Ejecutando INSERT en tabla: ${data.table}`);
    
    try {
      // Procesar datos a insertar con variables
      const processedData = this.processInsertData(data, context);
      
      // Construir query dinámicamente
      const { query, values } = this.buildInsertQuery(data.table, processedData);
      
      // Ejecutar query
      const result = await db.query(query, values);
      
      console.log(`✅ INSERT completado: registro insertado con ID ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error) {
      console.error('Error en INSERT:', error);
      throw error;
    }
  }

  /**
   * Ejecuta operación UPDATE
   */
  private async executeUpdate(data: DatabaseNodeData, context: NodeExecutionContext): Promise<any> {
    console.log(`✏️ Ejecutando UPDATE en tabla: ${data.table}`);
    
    try {
      const processedConditions = this.processConditions(data.conditions, context);
      const processedData = this.processInsertData(data, context);
      
      // Construir query dinámicamente
      const { query, values } = this.buildUpdateQuery(data.table, processedData, processedConditions);
      
      // Ejecutar query
      const result = await db.query(query, values);
      
      console.log(`✅ UPDATE completado: ${result.rowCount} registros actualizados`);
      return { rowsAffected: result.rowCount };
    } catch (error) {
      console.error('Error en UPDATE:', error);
      throw error;
    }
  }

  /**
   * Ejecuta operación DELETE
   */
  private async executeDelete(data: DatabaseNodeData, context: NodeExecutionContext): Promise<any> {
    console.log(`🗑️ Ejecutando DELETE en tabla: ${data.table}`);
    
    try {
      const processedConditions = this.processConditions(data.conditions, context);
      
      // Construir query dinámicamente
      const { query, values } = this.buildDeleteQuery(data.table, processedConditions);
      
      // Ejecutar query
      const result = await db.query(query, values);
      
      console.log(`✅ DELETE completado: ${result.rowCount} registros eliminados`);
      return { rowsAffected: result.rowCount };
    } catch (error) {
      console.error('Error en DELETE:', error);
      throw error;
    }
  }

  /**
   * Construir query SELECT dinámicamente
   */
  private buildSelectQuery(table: string, conditions: Record<string, any>): { query: string; values: any[] } {
    let query = `SELECT * FROM ${table}`;
    const values: any[] = [];
    
    if (Object.keys(conditions).length > 0) {
      const whereConditions: string[] = [];
      let paramIndex = 1;
      
      Object.entries(conditions).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          whereConditions.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });
      
      if (whereConditions.length > 0) {
        query += ` WHERE ${whereConditions.join(' AND ')}`;
      }
    }
    
    query += ' ORDER BY created_at DESC';
    
    return { query, values };
  }

  /**
   * Construir query INSERT dinámicamente
   */
  private buildInsertQuery(table: string, data: Record<string, any>): { query: string; values: any[] } {
    const keys = Object.keys(data).filter(key => data[key] !== undefined);
    const values = keys.map(key => data[key]);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    return { query, values };
  }

  /**
   * Construir query UPDATE dinámicamente
   */
  private buildUpdateQuery(
    table: string, 
    data: Record<string, any>, 
    conditions: Record<string, any>
  ): { query: string; values: any[] } {
    const dataKeys = Object.keys(data).filter(key => data[key] !== undefined);
    const values: any[] = [];
    let paramIndex = 1;
    
    // SET clause
    const setClause = dataKeys.map(key => {
      values.push(data[key]);
      return `${key} = $${paramIndex++}`;
    }).join(', ');
    
    // WHERE clause
    const whereConditions: string[] = [];
    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        whereConditions.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });
    
    let query = `UPDATE ${table} SET ${setClause}`;
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    return { query, values };
  }

  /**
   * Construir query DELETE dinámicamente
   */
  private buildDeleteQuery(table: string, conditions: Record<string, any>): { query: string; values: any[] } {
    const values: any[] = [];
    const whereConditions: string[] = [];
    let paramIndex = 1;
    
    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        whereConditions.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });
    
    let query = `DELETE FROM ${table}`;
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    return { query, values };
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
   * Crea un contacto en HubSpot y guarda en BD local
   */
  private async createHubSpotContact(data: any, context: NodeExecutionContext): Promise<any> {
    const contactData = {
      email: context.getVariable('email') || context.getVariable('userEmail'),
      first_name: context.getVariable('firstName') || context.getVariable('nombre'),
      last_name: context.getVariable('lastName') || context.getVariable('apellido'),
      phone: context.getVariable('phoneNumber'),
      whatsapp_number: context.getVariable('phoneNumber'),
      source: 'whatsapp',
      thread_id: context.threadId,
      custom_fields: {
        lifecyclestage: 'lead',
        whatsapp_thread_id: context.threadId
      }
    };

    console.log('👤 Creando contacto HubSpot:', contactData);
    
    try {
      // Crear contacto en base de datos local
      const localContact = await DatabaseHelpers.createContact(contactData);
      
      // Aquí iría la llamada real a HubSpot API
      // const hubspotContact = await this.callHubSpotAPI(contactData);
      
      // Simular respuesta de HubSpot por ahora
      const hubspotResponse = {
        id: Math.floor(Math.random() * 100000),
        ...contactData,
        created_at: new Date().toISOString()
      };
      
      // Actualizar contacto local con ID de HubSpot
      await db.query(
        'UPDATE contacts SET hubspot_contact_id = $1 WHERE id = $2',
        [hubspotResponse.id.toString(), localContact.id]
      );
      
      return { ...localContact, hubspot_contact_id: hubspotResponse.id };
    } catch (error) {
      console.error('Error creando contacto HubSpot:', error);
      throw error;
    }
  }

  /**
   * Actualiza un contacto en HubSpot
   */
  private async updateHubSpotContact(data: any, context: NodeExecutionContext): Promise<any> {
    const contactId = context.getVariable('hubspotContactId');
    const updateData = this.processInsertData(data, context);
    
    console.log(`✏️ Actualizando contacto HubSpot ${contactId}:`, updateData);
    
    // Simular delay de API
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
    
    // Simular delay de API
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
    
    try {
      // Buscar primero en BD local
      const localContact = await db.query(
        'SELECT * FROM contacts WHERE email = $1',
        [email]
      );
      
      if (localContact.rows.length > 0) {
        return localContact.rows[0];
      }
      
      // Si no existe, simular búsqueda en HubSpot
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return {
        id: Math.floor(Math.random() * 100000),
        email,
        first_name: 'Usuario',
        last_name: 'Demo',
        phone: context.getVariable('phoneNumber'),
        lifecyclestage: 'lead',
        found: true
      };
    } catch (error) {
      console.error('Error obteniendo contacto HubSpot:', error);
      throw error;
    }
  }
} 