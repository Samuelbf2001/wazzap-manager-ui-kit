// Database configuration and types for the frontend
// This is a simplified version that doesn't include actual database connections
// The actual database operations should be handled by a backend API

/**
 * Database configuration for frontend
 */
export const dbConfig = {
  host: import.meta.env.VITE_DB_HOST || 'localhost',
  port: parseInt(import.meta.env.VITE_DB_PORT || '5432'),
  database: import.meta.env.VITE_DB_NAME || 'wazzap_manager',
  user: import.meta.env.VITE_DB_USER || 'wazzap_user',
  password: import.meta.env.VITE_DB_PASSWORD || 'wazzap_password_2024',
};

// Types para las tablas
export interface User {
  id: number;
  uuid: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp_number?: string;
  profile_picture?: string;
  language: string;
  timezone: string;
  status: string;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  category?: string;
  sku?: string;
  stock: number;
  images: string[];
  metadata: Record<string, any>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: number;
  uuid: string;
  user_id: number;
  order_number: string;
  status: string;
  total: number;
  currency: string;
  items: any[];
  shipping_address?: Record<string, any>;
  billing_address?: Record<string, any>;
  payment_method?: string;
  payment_status: string;
  notes?: string;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface ConversationThread {
  id: number;
  uuid: string;
  thread_id: string;
  user_id: number;
  phone_number: string;
  contact_name?: string;
  status: string;
  current_node_id?: string;
  flow_id?: string;
  priority: string;
  assigned_agent?: string;
  source: string;
  language: string;
  variables: Record<string, any>;
  metadata: Record<string, any>;
  tags: string[];
  started_at: Date;
  last_activity: Date;
  resolved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: number;
  uuid: string;
  conversation_id: number;
  thread_id: string;
  message_type: string;
  content: string;
  media_url?: string;
  media_metadata?: Record<string, any>;
  sender_type: string;
  sender_id?: string;
  sender_name?: string;
  timestamp: Date;
  status: string;
  reply_to?: string;
  reactions: any[];
  metadata: Record<string, any>;
  created_at: Date;
}

export interface Contact {
  id: number;
  uuid: string;
  user_id?: number;
  thread_id?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  whatsapp_number?: string;
  company?: string;
  position?: string;
  address?: Record<string, any>;
  birth_date?: Date;
  gender?: string;
  language: string;
  source: string;
  tags: string[];
  custom_fields: Record<string, any>;
  hubspot_contact_id?: string;
  hubspot_company_id?: string;
  hubspot_deal_id?: string;
  last_interaction?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Agent {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  status: string;
  active_conversations: number;
  max_conversations: number;
  skills: string[];
  languages: string[];
  working_hours: Record<string, any>;
  metadata: Record<string, any>;
  last_activity: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * Simulated database connection for frontend demo
 * In production, this would make API calls to a backend service
 */
export class DatabaseConnection {
  private static instance: DatabaseConnection;

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async query(text: string, params?: any[]): Promise<any> {
    console.log('🔍 Simulated Query:', { text, params });
    
    // This is a simulation for frontend demo
    // In production, this would make HTTP requests to your backend API
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      rows: this.getMockData(text, params),
      rowCount: 1
    };
  }

  private getMockData(query: string, params?: any[]): any[] {
    // Simple mock data based on query
    if (query.includes('users')) {
      return [
        { id: 1, name: 'Juan Pérez', email: 'juan@example.com', phone: '+525551234567' },
        { id: 2, name: 'María García', email: 'maria@example.com', phone: '+525559876543' }
      ];
    }
    
    if (query.includes('products')) {
      return [
        { id: 1, name: 'iPhone 15 Pro', price: 29999, category: 'electronics' },
        { id: 2, name: 'Samsung Galaxy S24', price: 24999, category: 'electronics' }
      ];
    }

    if (query.includes('contacts')) {
      return [
        { id: 1, first_name: 'Juan', last_name: 'Pérez', email: 'juan@example.com' }
      ];
    }
    
    return [{ id: 1, created_at: new Date().toISOString() }];
  }
}

// Export singleton instance
export const db = DatabaseConnection.getInstance();

// Helper functions para queries comunes (simuladas para frontend)
export class DatabaseHelpers {
  static async createUser(userData: Partial<User>): Promise<User> {
    console.log('Creating user:', userData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: Math.floor(Math.random() * 10000),
      uuid: crypto.randomUUID(),
      name: userData.name || 'Usuario',
      email: userData.email,
      phone: userData.phone,
      whatsapp_number: userData.whatsapp_number,
      profile_picture: userData.profile_picture,
      language: userData.language || 'es',
      timezone: userData.timezone || 'America/Mexico_City',
      status: userData.status || 'active',
      metadata: userData.metadata || {},
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  static async getUserByPhone(phone: string): Promise<User | null> {
    console.log('Getting user by phone:', phone);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock response
    return {
      id: 1,
      uuid: crypto.randomUUID(),
      name: 'Usuario Demo',
      phone,
      whatsapp_number: phone,
      language: 'es',
      timezone: 'America/Mexico_City',
      status: 'active',
      metadata: {},
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  static async createConversationThread(threadData: Partial<ConversationThread>): Promise<ConversationThread> {
    console.log('Creating conversation thread:', threadData);
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      id: Math.floor(Math.random() * 10000),
      uuid: crypto.randomUUID(),
      thread_id: threadData.thread_id || crypto.randomUUID(),
      user_id: threadData.user_id || 1,
      phone_number: threadData.phone_number || '',
      contact_name: threadData.contact_name,
      status: threadData.status || 'active',
      current_node_id: threadData.current_node_id,
      flow_id: threadData.flow_id,
      priority: threadData.priority || 'medium',
      assigned_agent: threadData.assigned_agent,
      source: threadData.source || 'whatsapp',
      language: threadData.language || 'es',
      variables: threadData.variables || {},
      metadata: threadData.metadata || {},
      tags: threadData.tags || [],
      started_at: new Date(),
      last_activity: new Date(),
      resolved_at: threadData.resolved_at,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  static async getConversationByThreadId(threadId: string): Promise<ConversationThread | null> {
    console.log('Getting conversation by thread ID:', threadId);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      id: 1,
      uuid: crypto.randomUUID(),
      thread_id: threadId,
      user_id: 1,
      phone_number: '+525551234567',
      contact_name: 'Usuario Demo',
      status: 'active',
      current_node_id: 'start',
      flow_id: 'demo_flow',
      priority: 'medium',
      assigned_agent: 'agent_1',
      source: 'whatsapp',
      language: 'es',
      variables: {},
      metadata: {},
      tags: [],
      started_at: new Date(),
      last_activity: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  static async createMessage(messageData: Partial<Message>): Promise<Message> {
    console.log('Creating message:', messageData);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      id: Math.floor(Math.random() * 10000),
      uuid: crypto.randomUUID(),
      conversation_id: messageData.conversation_id || 1,
      thread_id: messageData.thread_id || crypto.randomUUID(),
      message_type: messageData.message_type || 'text',
      content: messageData.content || '',
      media_url: messageData.media_url,
      media_metadata: messageData.media_metadata,
      sender_type: messageData.sender_type || 'user',
      sender_id: messageData.sender_id,
      sender_name: messageData.sender_name,
      timestamp: new Date(),
      status: messageData.status || 'sent',
      reply_to: messageData.reply_to,
      reactions: messageData.reactions || [],
      metadata: messageData.metadata || {},
      created_at: new Date()
    };
  }

  static async getMessages(threadId: string, limit: number = 50): Promise<Message[]> {
    console.log('Getting messages for thread:', threadId, 'limit:', limit);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock messages
    return [
      {
        id: 1,
        uuid: crypto.randomUUID(),
        conversation_id: 1,
        thread_id: threadId,
        message_type: 'text',
        content: 'Hola, me interesa un producto',
        sender_type: 'user',
        sender_name: 'Usuario Demo',
        timestamp: new Date(),
        status: 'read',
        reactions: [],
        metadata: {},
        created_at: new Date()
      }
    ];
  }

  static async createContact(contactData: Partial<Contact>): Promise<Contact> {
    console.log('Creating contact:', contactData);
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      id: Math.floor(Math.random() * 10000),
      uuid: crypto.randomUUID(),
      user_id: contactData.user_id,
      thread_id: contactData.thread_id,
      first_name: contactData.first_name,
      last_name: contactData.last_name,
      full_name: contactData.full_name,
      email: contactData.email,
      phone: contactData.phone,
      whatsapp_number: contactData.whatsapp_number,
      company: contactData.company,
      position: contactData.position,
      address: contactData.address,
      birth_date: contactData.birth_date,
      gender: contactData.gender,
      language: contactData.language || 'es',
      source: contactData.source || 'whatsapp',
      tags: contactData.tags || [],
      custom_fields: contactData.custom_fields || {},
      hubspot_contact_id: contactData.hubspot_contact_id,
      hubspot_company_id: contactData.hubspot_company_id,
      hubspot_deal_id: contactData.hubspot_deal_id,
      last_interaction: contactData.last_interaction,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  static async getProducts(filters?: { category?: string; active?: boolean }): Promise<Product[]> {
    console.log('Getting products with filters:', filters);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock products
    return [
      {
        id: 1,
        uuid: crypto.randomUUID(),
        name: 'iPhone 15 Pro',
        description: 'Smartphone Apple iPhone 15 Pro 128GB',
        price: 29999,
        currency: 'MXN',
        category: 'electronics',
        sku: 'IP15P-128',
        stock: 25,
        images: [],
        metadata: {},
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        uuid: crypto.randomUUID(),
        name: 'Samsung Galaxy S24',
        description: 'Smartphone Samsung Galaxy S24 256GB',
        price: 24999,
        currency: 'MXN',
        category: 'electronics',
        sku: 'SGS24-256',
        stock: 30,
        images: [],
        metadata: {},
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
  }

  static async updateConversationVariables(threadId: string, variables: Record<string, any>): Promise<void> {
    console.log('Updating conversation variables for thread:', threadId, 'variables:', variables);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Mock update
    console.log('✅ Variables updated successfully');
  }
}