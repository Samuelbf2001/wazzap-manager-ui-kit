import axios from 'axios';

const HUBSPOT_API_URL = 'https://api.hubapi.com';

interface HubSpotConfig {
  apiKey: string;
  portalId: string;
  webhookUrl?: string;
}

interface HubSpotProperty {
  name: string;
  label: string;
  type: string;
  fieldType: string;
  groupName?: string;
  description?: string;
  options?: Array<{
    label: string;
    value: string;
  }>;
}

interface HubSpotContact {
  id?: string;
  properties: {
    [key: string]: string;
  };
}

interface HubSpotDeal {
  id?: string;
  properties: {
    dealname: string;
    amount?: string;
    pipeline?: string;
    dealstage?: string;
    closedate?: string;
    [key: string]: string;
  };
  associations?: {
    contactIds?: string[];
    companyIds?: string[];
  };
}

interface HubSpotCompany {
  id?: string;
  properties: {
    name: string;
    domain?: string;
    phone?: string;
    [key: string]: string;
  };
}

class HubSpotService {
  private config: HubSpotConfig;

  constructor(config: HubSpotConfig) {
    this.config = config;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  // =================== PROPIEDADES ===================

  async getProperties(objectType: string): Promise<HubSpotProperty[]> {
    try {
      const response = await axios.get(
        `${HUBSPOT_API_URL}/crm/v3/properties/${objectType}`,
        {
          headers: this.getHeaders()
        }
      );
      return response.data.results;
    } catch (error) {
      console.error('Error fetching HubSpot properties:', error);
      throw error;
    }
  }

  async createProperty(objectType: string, property: HubSpotProperty) {
    try {
      const response = await axios.post(
        `${HUBSPOT_API_URL}/crm/v3/properties/${objectType}`,
        property,
        {
          headers: this.getHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating HubSpot property:', error);
      throw error;
    }
  }

  async updateProperty(objectType: string, propertyName: string, property: Partial<HubSpotProperty>) {
    try {
      const response = await axios.patch(
        `${HUBSPOT_API_URL}/crm/v3/properties/${objectType}/${propertyName}`,
        property,
        {
          headers: this.getHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating HubSpot property:', error);
      throw error;
    }
  }

  async deleteProperty(objectType: string, propertyName: string) {
    try {
      await axios.delete(
        `${HUBSPOT_API_URL}/crm/v3/properties/${objectType}/${propertyName}`,
        {
          headers: this.getHeaders()
        }
      );
      return true;
    } catch (error) {
      console.error('Error deleting HubSpot property:', error);
      throw error;
    }
  }

  // =================== CONTACTOS ===================

  async getContacts(properties: string[] = [], limit: number = 100): Promise<HubSpotContact[]> {
    try {
      const response = await axios.get(
        `${HUBSPOT_API_URL}/crm/v3/objects/contacts`,
        {
          headers: this.getHeaders(),
          params: {
            properties: properties.join(','),
            limit
          }
        }
      );
      return response.data.results;
    } catch (error) {
      console.error('Error fetching HubSpot contacts:', error);
      throw error;
    }
  }

  async searchContacts(query: string, properties: string[] = []): Promise<HubSpotContact[]> {
    try {
      const response = await axios.post(
        `${HUBSPOT_API_URL}/crm/v3/objects/contacts/search`,
        {
          query,
          properties,
          limit: 100
        },
        {
          headers: this.getHeaders()
        }
      );
      return response.data.results;
    } catch (error) {
      console.error('Error searching HubSpot contacts:', error);
      throw error;
    }
  }

  async getContactByEmail(email: string): Promise<HubSpotContact | null> {
    try {
      const response = await axios.post(
        `${HUBSPOT_API_URL}/crm/v3/objects/contacts/search`,
        {
          filterGroups: [{
            filters: [{
              propertyName: 'email',
              operator: 'EQ',
              value: email
            }]
          }],
          properties: ['email', 'firstname', 'lastname', 'phone', 'whatsapp_number']
        },
        {
          headers: this.getHeaders()
        }
      );
      return response.data.results[0] || null;
    } catch (error) {
      console.error('Error fetching contact by email:', error);
      return null;
    }
  }

  async getContactByPhone(phone: string): Promise<HubSpotContact | null> {
    try {
      const response = await axios.post(
        `${HUBSPOT_API_URL}/crm/v3/objects/contacts/search`,
        {
          filterGroups: [{
            filters: [
              {
                propertyName: 'phone',
                operator: 'EQ',
                value: phone
              }
            ]
          }, {
            filters: [
              {
                propertyName: 'whatsapp_number',
                operator: 'EQ',
                value: phone
              }
            ]
          }]
        },
        {
          headers: this.getHeaders()
        }
      );
      return response.data.results[0] || null;
    } catch (error) {
      console.error('Error fetching contact by phone:', error);
      return null;
    }
  }

  async createContact(contact: HubSpotContact): Promise<HubSpotContact> {
    try {
      const response = await axios.post(
        `${HUBSPOT_API_URL}/crm/v3/objects/contacts`,
        contact,
        {
          headers: this.getHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating HubSpot contact:', error);
      throw error;
    }
  }

  async updateContact(contactId: string, contact: Partial<HubSpotContact>): Promise<HubSpotContact> {
    try {
      const response = await axios.patch(
        `${HUBSPOT_API_URL}/crm/v3/objects/contacts/${contactId}`,
        contact,
        {
          headers: this.getHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating HubSpot contact:', error);
      throw error;
    }
  }

  async deleteContact(contactId: string): Promise<boolean> {
    try {
      await axios.delete(
        `${HUBSPOT_API_URL}/crm/v3/objects/contacts/${contactId}`,
        {
          headers: this.getHeaders()
        }
      );
      return true;
    } catch (error) {
      console.error('Error deleting HubSpot contact:', error);
      throw error;
    }
  }

  // =================== NEGOCIOS (DEALS) ===================

  async getDeals(properties: string[] = [], limit: number = 100): Promise<HubSpotDeal[]> {
    try {
      const response = await axios.get(
        `${HUBSPOT_API_URL}/crm/v3/objects/deals`,
        {
          headers: this.getHeaders(),
          params: {
            properties: properties.join(','),
            limit
          }
        }
      );
      return response.data.results;
    } catch (error) {
      console.error('Error fetching HubSpot deals:', error);
      throw error;
    }
  }

  async createDeal(deal: HubSpotDeal): Promise<HubSpotDeal> {
    try {
      const response = await axios.post(
        `${HUBSPOT_API_URL}/crm/v3/objects/deals`,
        deal,
        {
          headers: this.getHeaders()
        }
      );

      // Si hay asociaciones, crearlas
      if (deal.associations && response.data.id) {
        await this.createDealAssociations(response.data.id, deal.associations);
      }

      return response.data;
    } catch (error) {
      console.error('Error creating HubSpot deal:', error);
      throw error;
    }
  }

  async updateDeal(dealId: string, deal: Partial<HubSpotDeal>): Promise<HubSpotDeal> {
    try {
      const response = await axios.patch(
        `${HUBSPOT_API_URL}/crm/v3/objects/deals/${dealId}`,
        { properties: deal.properties },
        {
          headers: this.getHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating HubSpot deal:', error);
      throw error;
    }
  }

  // =================== EMPRESAS (COMPANIES) ===================

  async getCompanies(properties: string[] = [], limit: number = 100): Promise<HubSpotCompany[]> {
    try {
      const response = await axios.get(
        `${HUBSPOT_API_URL}/crm/v3/objects/companies`,
        {
          headers: this.getHeaders(),
          params: {
            properties: properties.join(','),
            limit
          }
        }
      );
      return response.data.results;
    } catch (error) {
      console.error('Error fetching HubSpot companies:', error);
      throw error;
    }
  }

  async createCompany(company: HubSpotCompany): Promise<HubSpotCompany> {
    try {
      const response = await axios.post(
        `${HUBSPOT_API_URL}/crm/v3/objects/companies`,
        company,
        {
          headers: this.getHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating HubSpot company:', error);
      throw error;
    }
  }

  async updateCompany(companyId: string, company: Partial<HubSpotCompany>): Promise<HubSpotCompany> {
    try {
      const response = await axios.patch(
        `${HUBSPOT_API_URL}/crm/v3/objects/companies/${companyId}`,
        company,
        {
          headers: this.getHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating HubSpot company:', error);
      throw error;
    }
  }

  // =================== ASOCIACIONES ===================

  async createDealAssociations(dealId: string, associations: { contactIds?: string[]; companyIds?: string[] }) {
    try {
      if (associations.contactIds?.length) {
        for (const contactId of associations.contactIds) {
          await axios.put(
            `${HUBSPOT_API_URL}/crm/v3/objects/deals/${dealId}/associations/contacts/${contactId}/3`,
            {},
            { headers: this.getHeaders() }
          );
        }
      }

      if (associations.companyIds?.length) {
        for (const companyId of associations.companyIds) {
          await axios.put(
            `${HUBSPOT_API_URL}/crm/v3/objects/deals/${dealId}/associations/companies/${companyId}/5`,
            {},
            { headers: this.getHeaders() }
          );
        }
      }
    } catch (error) {
      console.error('Error creating deal associations:', error);
      throw error;
    }
  }

  // =================== PIPELINES ===================

  async getPipelines(objectType: string = 'deals') {
    try {
      const response = await axios.get(
        `${HUBSPOT_API_URL}/crm/v3/pipelines/${objectType}`,
        {
          headers: this.getHeaders()
        }
      );
      return response.data.results;
    } catch (error) {
      console.error('Error fetching pipelines:', error);
      throw error;
    }
  }

  // =================== CUSTOM CHANNELS ===================

  async createCustomChannelIntegration() {
    try {
      // Crear propiedades personalizadas para WhatsApp
      const whatsappProperties: HubSpotProperty[] = [
        {
          name: 'whatsapp_number',
          label: 'Número de WhatsApp',
          type: 'string',
          fieldType: 'text',
          groupName: 'whatsapp_info',
          description: 'Número de teléfono de WhatsApp del contacto'
        },
        {
          name: 'whatsapp_conversation_id',
          label: 'ID de Conversación WhatsApp',
          type: 'string',
          fieldType: 'text',
          groupName: 'whatsapp_info',
          description: 'ID único de la conversación de WhatsApp'
        },
        {
          name: 'whatsapp_last_message_date',
          label: 'Última fecha de mensaje WhatsApp',
          type: 'datetime',
          fieldType: 'date',
          groupName: 'whatsapp_info',
          description: 'Fecha del último mensaje de WhatsApp'
        },
        {
          name: 'whatsapp_status',
          label: 'Estado WhatsApp',
          type: 'enumeration',
          fieldType: 'select',
          groupName: 'whatsapp_info',
          description: 'Estado actual de la conversación de WhatsApp',
          options: [
            { label: 'Activo', value: 'active' },
            { label: 'Inactivo', value: 'inactive' },
            { label: 'Bloqueado', value: 'blocked' }
          ]
        }
      ];

      // Crear propiedades en contactos
      for (const property of whatsappProperties) {
        try {
          await this.createProperty('contacts', property);
        } catch (error) {
          // Ignorar si la propiedad ya existe
          if (!error.response?.data?.message?.includes('already exists')) {
            console.error(`Error creating property ${property.name}:`, error);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error creating custom channel integration:', error);
      throw error;
    }
  }

  // =================== COMUNICACIONES ===================

  async logCommunication(contactId: string, communication: {
    type: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'TASK' | 'WHATSAPP_MESSAGE';
    subject: string;
    body: string;
    timestamp?: string;
    metadata?: any;
  }) {
    try {
      const response = await axios.post(
        `${HUBSPOT_API_URL}/communications/v3/communications`,
        {
          associations: {
            contact: contactId
          },
          definition: {
            type: communication.type,
            subject: communication.subject,
            body: communication.body
          },
          timestamp: communication.timestamp || new Date().toISOString(),
          metadata: communication.metadata
        },
        {
          headers: this.getHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error logging communication:', error);
      throw error;
    }
  }

  // =================== WEBHOOKS ===================

  async setupWebhooks() {
    try {
      if (!this.config.webhookUrl) {
        throw new Error('Webhook URL no configurada');
      }

      const webhooks = [
        {
          eventType: 'contact.creation',
          webhookUrl: `${this.config.webhookUrl}/hubspot/contact-created`
        },
        {
          eventType: 'contact.propertyChange',
          webhookUrl: `${this.config.webhookUrl}/hubspot/contact-updated`
        },
        {
          eventType: 'deal.creation',
          webhookUrl: `${this.config.webhookUrl}/hubspot/deal-created`
        },
        {
          eventType: 'deal.propertyChange',
          webhookUrl: `${this.config.webhookUrl}/hubspot/deal-updated`
        }
      ];

      const results = [];
      for (const webhook of webhooks) {
        try {
          const response = await axios.post(
            `${HUBSPOT_API_URL}/webhooks/v3/${this.config.portalId}/subscriptions`,
            webhook,
            {
              headers: this.getHeaders()
            }
          );
          results.push(response.data);
        } catch (error) {
          console.error(`Error creating webhook for ${webhook.eventType}:`, error);
        }
      }

      return results;
    } catch (error) {
      console.error('Error setting up webhooks:', error);
      throw error;
    }
  }

  // =================== SINCRONIZACIÓN ===================

  async syncWhatsAppContact(whatsappNumber: string, contactData: any) {
    try {
      // Buscar contacto existente por número de WhatsApp
      let contact = await this.getContactByPhone(whatsappNumber);

      const properties = {
        whatsapp_number: whatsappNumber,
        whatsapp_last_message_date: new Date().toISOString(),
        whatsapp_status: 'active',
        ...contactData.properties
      };

      if (contact) {
        // Actualizar contacto existente
        return await this.updateContact(contact.id!, { properties });
      } else {
        // Crear nuevo contacto
        return await this.createContact({ properties });
      }
    } catch (error) {
      console.error('Error syncing WhatsApp contact:', error);
      throw error;
    }
  }

  async syncWhatsAppConversation(conversationId: string, contactId: string, messages: any[]) {
    try {
      // Actualizar último mensaje
      await this.updateContact(contactId, {
        properties: {
          whatsapp_conversation_id: conversationId,
          whatsapp_last_message_date: new Date().toISOString()
        }
      });

      // Registrar comunicaciones
      for (const message of messages) {
        await this.logCommunication(contactId, {
          type: 'WHATSAPP_MESSAGE',
          subject: 'Mensaje de WhatsApp',
          body: message.body || '',
          timestamp: message.timestamp,
          metadata: {
            messageId: message.id,
            conversationId,
            direction: message.fromMe ? 'outbound' : 'inbound'
          }
        });
      }

      return true;
    } catch (error) {
      console.error('Error syncing WhatsApp conversation:', error);
      throw error;
    }
  }
}

export default HubSpotService;
export type { HubSpotConfig, HubSpotContact, HubSpotDeal, HubSpotCompany, HubSpotProperty }; 