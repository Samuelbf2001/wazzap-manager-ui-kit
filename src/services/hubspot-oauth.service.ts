import axios from 'axios';

export interface HubSpotOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface HubSpotTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  expires_at?: number;
}

export interface HubSpotTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

const HUBSPOT_AUTH_URL = 'https://auth.hubspot.com/oauth/authorize';
const HUBSPOT_TOKEN_URL = 'https://api.hubapi.com/oauth/v1/token';

class HubSpotOAuthService {
  private config: HubSpotOAuthConfig;
  private tokens: HubSpotTokens | null = null;

  constructor(config: HubSpotOAuthConfig) {
    this.config = config;
    this.loadTokensFromStorage();
  }

  /**
   * Genera la URL de autorización para iniciar el flujo OAuth
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      response_type: 'code',
      ...(state && { state })
    });

    return `${HUBSPOT_AUTH_URL}?${params.toString()}`;
  }

  /**
   * Intercambia el código de autorización por tokens de acceso
   */
  async exchangeCodeForTokens(code: string): Promise<HubSpotTokens> {
    try {
      const response = await axios.post<HubSpotTokenResponse>(
        HUBSPOT_TOKEN_URL,
        {
          grant_type: 'authorization_code',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.redirectUri,
          code: code
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const tokens: HubSpotTokens = {
        ...response.data,
        expires_at: Date.now() + (response.data.expires_in * 1000)
      };

      this.tokens = tokens;
      this.saveTokensToStorage();
      
      return tokens;
    } catch (error) {
      console.error('Error intercambiando código por tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  /**
   * Refresca el token de acceso usando el refresh token
   */
  async refreshAccessToken(): Promise<HubSpotTokens> {
    if (!this.tokens?.refresh_token) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post<HubSpotTokenResponse>(
        HUBSPOT_TOKEN_URL,
        {
          grant_type: 'refresh_token',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.tokens.refresh_token
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const newTokens: HubSpotTokens = {
        ...response.data,
        expires_at: Date.now() + (response.data.expires_in * 1000)
      };

      this.tokens = newTokens;
      this.saveTokensToStorage();
      
      return newTokens;
    } catch (error) {
      console.error('Error refrescando token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Obtiene un token de acceso válido, refrescándolo si es necesario
   */
  async getValidAccessToken(): Promise<string> {
    if (!this.tokens) {
      throw new Error('No tokens available. User needs to authenticate.');
    }

    // Verificar si el token expira en los próximos 5 minutos
    const expiresAt = this.tokens.expires_at || 0;
    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);

    if (expiresAt < fiveMinutesFromNow) {
      try {
        await this.refreshAccessToken();
      } catch (error) {
        // Si no se puede refrescar, limpiar tokens
        this.clearTokens();
        throw new Error('Token expired and refresh failed. User needs to re-authenticate.');
      }
    }

    return this.tokens!.access_token;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.tokens !== null && this.tokens.access_token !== undefined;
  }

  /**
   * Limpia los tokens almacenados
   */
  clearTokens(): void {
    this.tokens = null;
    localStorage.removeItem('hubspot_oauth_tokens');
  }

  /**
   * Obtiene información del token actual
   */
  getTokenInfo(): HubSpotTokens | null {
    return this.tokens;
  }

  /**
   * Revoca el token de acceso
   */
  async revokeToken(): Promise<void> {
    if (!this.tokens?.access_token) {
      return;
    }

    try {
      await axios.post(
        'https://api.hubapi.com/oauth/v1/token/revoke',
        {
          token: this.tokens.access_token
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
    } catch (error) {
      console.error('Error revocando token:', error);
    } finally {
      this.clearTokens();
    }
  }

  /**
   * Carga los tokens desde localStorage
   */
  private loadTokensFromStorage(): void {
    try {
      const storedTokens = localStorage.getItem('hubspot_oauth_tokens');
      if (storedTokens) {
        this.tokens = JSON.parse(storedTokens);
      }
    } catch (error) {
      console.error('Error cargando tokens desde storage:', error);
    }
  }

  /**
   * Guarda los tokens en localStorage
   */
  private saveTokensToStorage(): void {
    try {
      if (this.tokens) {
        localStorage.setItem('hubspot_oauth_tokens', JSON.stringify(this.tokens));
      }
    } catch (error) {
      console.error('Error guardando tokens en storage:', error);
    }
  }
}

export default HubSpotOAuthService;