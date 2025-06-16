import axios from 'axios';

const HUBSPOT_API_URL = 'https://api.hubapi.com';

interface HubSpotConfig {
  apiKey: string;
  portalId: string;
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

  async getProperties(objectType: string) {
    try {
      const response = await axios.get(
        `${HUBSPOT_API_URL}/properties/v1/${objectType}/properties`,
        {
          headers: this.getHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching HubSpot properties:', error);
      throw error;
    }
  }

  async createProperty(objectType: string, property: any) {
    try {
      const response = await axios.post(
        `${HUBSPOT_API_URL}/properties/v1/${objectType}/properties`,
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

  async updateProperty(objectType: string, propertyName: string, property: any) {
    try {
      const response = await axios.put(
        `${HUBSPOT_API_URL}/properties/v1/${objectType}/properties/named/${propertyName}`,
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
        `${HUBSPOT_API_URL}/properties/v1/${objectType}/properties/named/${propertyName}`,
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

  async getContacts(properties: string[] = []) {
    try {
      const response = await axios.get(
        `${HUBSPOT_API_URL}/crm/v3/objects/contacts`,
        {
          headers: this.getHeaders(),
          params: {
            properties: properties.join(',')
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching HubSpot contacts:', error);
      throw error;
    }
  }

  async createContact(contact: any) {
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

  async updateContact(contactId: string, contact: any) {
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
}

export default HubSpotService; 