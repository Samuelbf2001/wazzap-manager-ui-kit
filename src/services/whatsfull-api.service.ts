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
  companyId?: string;
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
  qrBase64?: string | null;
  instanceState?: string;
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
        companyId: params.companyId || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.details || data.error || 'Error configurando canal GHL');
    // Normalizar respuesta al mismo formato que ChannelSetupResult
    // backend devuelve instanceName (no evolutionInstance) desde el refactor
    return {
      success: data.success,
      channelId: data.locationId,
      channelAccountId: data.locationId,
      inboxId: '',
      phoneNumber: data.phoneNumber,
      provider: data.provider,
      evolutionInstance: data.instanceName ?? data.evolutionInstance,
      evolutionApikey: data.evolutionApikey,
      qrBase64: data.qrBase64 ?? null,
      instanceState: data.instanceState,
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

  /** QR de una instancia GHL — no requiere HubSpot auth */
  async getGHLQRCode(instanceName: string): Promise<QRCodeResult> {
    const res = await fetch(`${BACKEND_URL}/api/ghl-channels/qr/${encodeURIComponent(instanceName)}`);
    if (!res.ok) throw new Error(`QR GHL error ${res.status}`);
    return await res.json() as QRCodeResult;
  }

  /** Estado de conexión de una instancia GHL — no requiere HubSpot auth */
  async getGHLConnectionState(instanceName: string): Promise<string> {
    try {
      const res = await fetch(`${BACKEND_URL}/api/ghl-channels/state/${encodeURIComponent(instanceName)}`);
      if (!res.ok) return 'unknown';
      const data = await res.json();
      return data.state || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /** Actualiza display_name o marca como predeterminado un canal GHL */
  async updateGHLChannel(id: string, payload: { displayName?: string; isDefault?: boolean }): Promise<void> {
    const res = await fetch(`${BACKEND_URL}/api/ghl-channels/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Error actualizando canal GHL: ${res.status}`);
    }
  }

  /** Elimina un canal GHL por id — no requiere HubSpot auth */
  async deleteGHLChannel(id: string): Promise<void> {
    const res = await fetch(`${BACKEND_URL}/api/ghl-channels/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Error eliminando canal GHL: ${res.status}`);
    }
  }

  /**
   * Valida si una locationId de GHL tiene tokens OAuth y si existe una instancia Evolution.
   * Retorna objeto con estado completo incluyendo readyForQR.
   */
  async validateGHLLocation(locationId: string): Promise<{
    readyForQR: boolean;
    hasTokens?: boolean;
    instanceExists?: boolean;
    instanceName?: string;
    instanceState?: string;
    phoneNumber?: string;
    error?: string;
  }> {
    try {
      const res = await fetch(`${BACKEND_URL}/api/ghl-channels/validate/${encodeURIComponent(locationId)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { readyForQR: false, error: data.error || 'Error validando location' };
      }
      const data = await res.json();
      return {
        readyForQR: data.readyForQR ?? false,
        hasTokens: data.hasTokens,
        instanceExists: data.instanceExists,
        instanceName: data.instanceName,
        instanceState: data.instanceState,
        phoneNumber: data.phoneNumber,
      };
    } catch (err) {
      return { readyForQR: false, error: err instanceof Error ? err.message : 'Error desconocido' };
    }
  }
}

// ─── Alert Config types ───────────────────────────────────────────────────────

export interface AlertConfig {
  id?: number;
  instance_name: string;
  location_id?: string | null;
  alert_enabled: boolean;
  notify_on_disconnect: boolean;
  notify_on_reconnect: boolean;
  webhook_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DisconnectEvent {
  id: number;
  instance_name: string;
  location_id?: string | null;
  event_type: 'disconnected' | 'reconnected' | 'test';
  previous_state?: string | null;
  new_state: string;
  alert_sent: boolean;
  alert_webhook_status?: number | null;
  created_at: string;
}

// ─── Alert Config methods ─────────────────────────────────────────────────────

class AlertApiService {
  async getAlertConfig(instanceName: string): Promise<AlertConfig> {
    const res = await fetch(`${BACKEND_URL}/api/alert-configs/${encodeURIComponent(instanceName)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error obteniendo configuración de alertas');
    return data.config as AlertConfig;
  }

  async upsertAlertConfig(instanceName: string, config: Partial<AlertConfig> & { locationId?: string }): Promise<AlertConfig> {
    const res = await fetch(`${BACKEND_URL}/api/alert-configs/${encodeURIComponent(instanceName)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locationId:          config.location_id,
        alertEnabled:        config.alert_enabled,
        notifyOnDisconnect:  config.notify_on_disconnect,
        notifyOnReconnect:   config.notify_on_reconnect,
        webhookUrl:          config.webhook_url,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error guardando configuración de alertas');
    return data.config as AlertConfig;
  }

  async getDisconnectEvents(instanceName: string, limit = 20): Promise<DisconnectEvent[]> {
    const res = await fetch(
      `${BACKEND_URL}/api/alert-configs/${encodeURIComponent(instanceName)}/events?limit=${limit}`
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error obteniendo historial de eventos');
    return data.events as DisconnectEvent[];
  }

  async testAlertWebhook(instanceName: string, webhookUrl: string): Promise<{ success: boolean; status?: number; error?: string }> {
    const res = await fetch(`${BACKEND_URL}/api/alert-configs/${encodeURIComponent(instanceName)}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl }),
    });
    return await res.json();
  }
}

export const alertApi = new AlertApiService();

export const whatsfullApi = new WhatsfullApiService();
