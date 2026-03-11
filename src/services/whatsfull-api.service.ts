/**
 * Servicio para comunicarse con el backend de WhatsAppHub (whatsfull.sixteam.pro)
 * Reemplaza las llamadas a n8n para gestión de canales.
 */

import { getHubSpotAuth } from '@/lib/hubspotApi';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'https://whatsfull.sixteam.pro';
const EVOLUTION_API_URL = (import.meta.env.VITE_EVOLUTION_API_URL as string) || '';

export interface ChannelSetupParams {
  phoneNumber: string;
  displayName: string;
  inboxId: string;
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
   * Conecta una instancia Evolution y obtiene el QR.
   * Llama directamente a Evolution API usando la apikey de la instancia.
   */
  async getQRCode(instanceName: string, instanceApikey: string): Promise<QRCodeResult> {
    const url = `${EVOLUTION_API_URL}/instance/connect/${instanceName}`;
    const res = await fetch(url, {
      headers: { apikey: instanceApikey }
    });
    if (!res.ok) throw new Error(`Evolution API error ${res.status}`);
    return await res.json() as QRCodeResult;
  }

  /** Verifica el estado de conexión de una instancia */
  async getConnectionState(instanceName: string, instanceApikey: string): Promise<string> {
    const url = `${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`;
    const res = await fetch(url, { headers: { apikey: instanceApikey } });
    if (!res.ok) return 'unknown';
    const data = await res.json();
    return data.instance?.state || data.state || 'unknown';
  }
}

export const whatsfullApi = new WhatsfullApiService();
