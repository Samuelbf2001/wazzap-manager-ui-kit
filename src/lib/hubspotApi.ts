/**
 * Cliente para el backend WhatsAppHub.
 * La autenticación usa JWT firmado que viene del flujo OAuth de HubSpot.
 * El token y portalId se guardan en localStorage bajo la clave 'hubspot_auth'.
 */

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'https://whatsapphub.cloud';

export interface HubSpotAuth {
  token: string;
  portalId: string;
}

export interface BackendLog {
  id: number;
  portal_id: string;
  channel_account_id: string | null;
  direction: 'incoming' | 'outgoing';
  customer_phone: string | null;
  business_phone: string | null;
  message_text: string | null;
  status: 'success' | 'error' | 'blocked';
  error_message: string | null;
  event_type: string | null;
  provider: string | null;
  created_at: string;
}

export interface LogsResponse {
  success: boolean;
  logs: BackendLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LogsSummary {
  incoming_total: string;
  outgoing_total: string;
  errors_total: string;
  blocked_total: string;
  last_24h: string;
  last_7d: string;
}

export interface LogsFilters {
  page?: number;
  limit?: number;
  direction?: 'incoming' | 'outgoing';
  status?: 'success' | 'error' | 'blocked';
  channelAccountId?: string;
}

// ─── Auth helpers ───────────────────────────────────────────────────────────

export function getHubSpotAuth(): HubSpotAuth | null {
  try {
    const stored = localStorage.getItem('hubspot_auth');
    if (stored) return JSON.parse(stored) as HubSpotAuth;
  } catch {}
  return null;
}

export function saveHubSpotAuth(token: string, portalId: string): void {
  localStorage.setItem('hubspot_auth', JSON.stringify({ token, portalId }));
}

export function clearHubSpotAuth(): void {
  localStorage.removeItem('hubspot_auth');
}

// ─── Fetch helper ────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const auth = getHubSpotAuth();
  if (!auth) throw new Error('No autenticado con HubSpot');

  const url = new URL(`${BACKEND_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') url.searchParams.set(k, v);
    });
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${auth.token}` }
  });

  if (res.status === 401) {
    clearHubSpotAuth();
    throw new Error('Sesión expirada — vuelve a autenticarte desde HubSpot');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error || `Error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── API methods ─────────────────────────────────────────────────────────────

export const hubspotApi = {
  getLogs: (filters: LogsFilters = {}): Promise<LogsResponse> => {
    const params: Record<string, string> = {};
    if (filters.page) params.page = String(filters.page);
    if (filters.limit) params.limit = String(filters.limit);
    if (filters.direction) params.direction = filters.direction;
    if (filters.status) params.status = filters.status;
    if (filters.channelAccountId) params.channelAccountId = filters.channelAccountId;
    return apiFetch<LogsResponse>('/api/logs', params);
  },

  getLogsSummary: (): Promise<{ success: boolean; portalId: string; summary: LogsSummary }> =>
    apiFetch('/api/logs/summary'),

  verifyAuth: (token: string): Promise<{ authenticated: boolean; portalId?: string; account?: unknown }> =>
    fetch(`${BACKEND_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()),
};
