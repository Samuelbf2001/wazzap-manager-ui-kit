/**
 * Servicio para comunicarse con el backend de WhatsAppHub (whatsfull.sixteam.pro)
 * Reemplaza las llamadas a n8n para gestión de canales.
 */

import { getHubSpotAuth } from '@/lib/hubspotApi';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'https://whatsfull.sixteam.pro';

export interface ChannelSetupParams {
  phoneNumber: string;
  displayName: string;
  inboxId: string;
  evolutionInstance?: string;
}

export interface GHLChannelSetupParams {
  locationId: string;
  phoneNumber: string;
  evolutionInstance?: string;
}

export interface ChannelSetupResult {
  success: boolean;
  channelId: string;
  channelAccountId: string;
  inboxId: string;
  phoneNumber: string;
  provider: string;
  evolutionInstance?: string;
  evolutionApikey?: string;
}

export interface HubSpotInbox {
  id: string;
  name: string;
}

export interface ChannelAccount {
  portal_id: string;
  channel_id: string;
  channel_account_id: string;
  inbox_id: string;
  whatsapp_phone_number: string;
  provider: string;
  evolution_instance: string | null;
  authorized: boolean;
  created_at: string;
}

export interface QRCodeResult {
  base64?: string;
  code?: string;
  pairingCode?: string | null;
}

class WhatsfullApiService {
  private getPortalId(): string {
    const auth = getHubSpotAuth();
    if (!auth?.portalId) throw new Error('No autenticado con HubSpot. Ve a /install primero.');
    return auth.portalId;
  }

  /** Crea una instancia Evolution + cuenta de canal HubSpot */
  async setupChannel(params: ChannelSetupParams): Promise<ChannelSetupResult> {
    const portalId = this.getPortalId();
    const phoneNumberId = `wp_${params.phoneNumber.replace(/\D/g, '')}`;

    const res = await fetch(`${BACKEND_URL}/api/channels/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        portalId,
        phoneNumberId,
        phoneNumber: params.phoneNumber,
        inboxId: params.inboxId,
        displayName: params.displayName,
        evolutionInstance: params.evolutionInstance || undefined,
        existingChannelId: import.meta.env.VITE_HUBSPOT_CHANNEL_ID || undefined
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.details || data.error || 'Error configurando canal');
    return data as ChannelSetupResult;
  }

  /** Obtiene todos los canales configurados para el portal autenticado */
  async getChannels(): Promise<ChannelAccount[]> {
    const portalId = this.getPortalId();
    const res = await fetch(`${BACKEND_URL}/api/channels?portalId=${portalId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error obteniendo canales');
    return (data.channels || []) as ChannelAccount[];
  }

  /** Lista los inboxes de HubSpot disponibles para el portal autenticado */
  async getInboxes(): Promise<HubSpotInbox[]> {
    const portalId = this.getPortalId();
    const res = await fetch(`${BACKEND_URL}/api/channels/inboxes?portalId=${portalId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error obteniendo inboxes');
    return (data.inboxes || []) as HubSpotInbox[];
  }

  /**
   * Obtiene el QR de una instancia Evolution vía proxy del backend (evita CORS).
   * Los parámetros de apikey son ignorados: el backend los lee de su DB.
   */
  async getQRCode(instanceName: string, _instanceApikey?: string): Promise<QRCodeResult> {
    const auth = getHubSpotAuth();
    if (!auth) throw new Error('No autenticado');
    const res = await fetch(`${BACKEND_URL}/api/channels/qr/${encodeURIComponent(instanceName)}`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    if (!res.ok) throw new Error(`QR proxy error ${res.status}`);
    return await res.json() as QRCodeResult;
  }

  /** Crea o actualiza un canal GHL (Evolution + webhook configurado automáticamente) */
  async setupGHLChannel(params: GHLChannelSetupParams): Promise<ChannelSetupResult> {
    const res = await fetch(`${BACKEND_URL}/api/ghl-channels/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locationId: params.locationId,
        phoneNumber: params.phoneNumber,
        evolutionInstance: params.evolutionInstance || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.details || data.error || 'Error configurando canal GHL');
    // Normalizar respuesta al mismo formato que ChannelSetupResult
    return {
      success: data.success,
      channelId: data.locationId,
      channelAccountId: data.locationId,
      inboxId: '',
      phoneNumber: data.phoneNumber,
      provider: data.provider,
      evolutionInstance: data.evolutionInstance,
      evolutionApikey: data.evolutionApikey,
    } as ChannelSetupResult;
  }

  /** Verifica el estado de conexión de una instancia vía proxy del backend */
  async getConnectionState(instanceName: string, _instanceApikey?: string): Promise<string> {
    const auth = getHubSpotAuth();
    if (!auth) return 'unknown';
    try {
      const res = await fetch(`${BACKEND_URL}/api/channels/state/${encodeURIComponent(instanceName)}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (!res.ok) return 'unknown';
      const data = await res.json();
      return data.state || 'unknown';
    } catch {
      return 'unknown';
    }
  }
}

export const whatsfullApi = new WhatsfullApiService();
