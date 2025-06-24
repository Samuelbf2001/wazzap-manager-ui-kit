import axios from 'axios';
import HubSpotOAuthService, { HubSpotOAuthConfig } from './hubspot-oauth.service';

const HUBSPOT_API_URL = 'https://api.hubapi.com';

interface HubSpotConfig {
  // Mantener compatibilidad con API Key para casos específicos
  apiKey?: string;
  portalId?: string;
  // Nueva configuración OAuth
  oauth?: HubSpotOAuthConfig;
}

class HubSpotService {
  private config: HubSpotConfig;
  private oauthService?: HubSpotOAuthService;

  constructor(config: HubSpotConfig) {
    this.config = config;
    
    // Inicializar OAuth si está configurado
    if (config.oauth) {
      this.oauthService = new HubSpotOAuthService(config.oauth);
    }
  }

  private async getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.oauthService && this.oauthService.isAuthenticated()) {
      // Usar OAuth 2.0
      try {
        const accessToken = await this.oauthService.getValidAccessToken();
        headers['Authorization'] = `Bearer ${accessToken}`;
      } catch (error) {
        console.error('Error obteniendo token de acceso:', error);
        throw new Error('Authentication required. Please re-authenticate with HubSpot.');
      }
    } else if (this.config.apiKey) {
      // Fallback a API Key (deprecated)
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    } else {
      throw new Error('No authentication method configured. Please set up OAuth or API Key.');
    }

    return headers;
  }

  /**
   * Inicia el flujo de autenticación OAuth
   */
  getAuthorizationUrl(state?: string): string {
    if (!this.oauthService) {
      throw new Error('OAuth no está configurado');
    }
    return this.oauthService.getAuthorizationUrl(state);
  }

  /**
   * Completa el flujo de autenticación OAuth
   */
  async handleAuthorizationCallback(code: string) {
    if (!this.oauthService) {
      throw new Error('OAuth no está configurado');
    }
    return await this.oauthService.exchangeCodeForTokens(code);
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    if (this.oauthService) {
      return this.oauthService.isAuthenticated();
    }
    return !!this.config.apiKey;
  }

  /**
   * Desconecta al usuario
   */
  async disconnect(): Promise<void> {
    if (this.oauthService) {
      await this.oauthService.revokeToken();
    }
  }

  async getProperties(objectType: string) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(
        `${HUBSPOT_API_URL}/properties/v1/${objectType}/properties`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching HubSpot properties:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async createProperty(objectType: string, property: any) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${HUBSPOT_API_URL}/properties/v1/${objectType}/properties`,
        property,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating HubSpot property:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async updateProperty(objectType: string, propertyName: string, property: any) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.put(
        `${HUBSPOT_API_URL}/properties/v1/${objectType}/properties/named/${propertyName}`,
        property,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating HubSpot property:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async deleteProperty(objectType: string, propertyName: string) {
    try {
      const headers = await this.getHeaders();
      await axios.delete(
        `${HUBSPOT_API_URL}/properties/v1/${objectType}/properties/named/${propertyName}`,
        { headers }
      );
      return true;
    } catch (error) {
      console.error('Error deleting HubSpot property:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async getContacts(properties: string[] = []) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(
        `${HUBSPOT_API_URL}/crm/v3/objects/contacts`,
        {
          headers,
          params: {
            properties: properties.join(',')
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching HubSpot contacts:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async createContact(contact: any) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${HUBSPOT_API_URL}/crm/v3/objects/contacts`,
        contact,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating HubSpot contact:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async updateContact(contactId: string, contact: any) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.patch(
        `${HUBSPOT_API_URL}/crm/v3/objects/contacts/${contactId}`,
        contact,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating HubSpot contact:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async getCompanies(properties: string[] = []) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(
        `${HUBSPOT_API_URL}/crm/v3/objects/companies`,
        {
          headers,
          params: {
            properties: properties.join(',')
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching HubSpot companies:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async getDeals(properties: string[] = []) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(
        `${HUBSPOT_API_URL}/crm/v3/objects/deals`,
        {
          headers,
          params: {
            properties: properties.join(',')
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching HubSpot deals:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  /**
   * Maneja errores de la API y determina si se necesita reautenticación
   */
  private handleApiError(error: any): void {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        // Token expirado o inválido
        if (this.oauthService) {
          this.oauthService.clearTokens();
        }
        throw new Error('Authentication expired. Please re-authenticate with HubSpot.');
      }
    }
  }
}

export default HubSpotService; 