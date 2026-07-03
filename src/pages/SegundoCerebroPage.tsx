import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Building2, Users, RefreshCw, Loader2, Plus, Search, CalendarClock, Zap } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

interface Company { id: number; name: string; domain?: string; industry?: string; contact_count: number; }
interface Contact {
  id: number; phone: string; name?: string; is_group: boolean; lead_status?: string;
  company_id?: number; company_name?: string; owner_name?: string;
  msg_in_count: number; msg_out_count: number; last_message_at?: string;
}
interface Stats { total_contacts: number; total_inbound: number; total_outbound: number; active_7d: number; }
interface Meeting { id: number; title: string; source: string; meeting_date?: string; company_name?: string; }

interface GoogleAccount {
  email: string; active: boolean; lastError: string | null;
  expiresAt?: string | null; updatedAt?: string | null;
}
interface PipelineMeeting {
  id: number; title: string; source: string; meetingDate?: string | null;
  notionSyncedAt?: string | null; processingError?: string | null; createdAt?: string;
}
interface PipelineStatus {
  google: {
    configured: boolean; pollEnabled: boolean; pollIntervalMs: number;
    accounts: GoogleAccount[];
    driveDocsPending: number; driveDocsFailed: number; driveDocsLastError: string | null;
  };
  notion: { configured: boolean; tasksDbId?: string; projectsDbId?: string; meetingsDbId?: string };
  fathom: { webhookSecretConfigured: boolean; lastReceivedAt: string | null; count7d: number };
  meetings: {
    total: number; bySource: Record<string, number>;
    pendingNotion: number; failed: number;
    recent: PipelineMeeting[];
  };
}

const LEAD_COLORS: Record<string, string> = {
  hot: 'bg-red-100 text-red-700', warm: 'bg-orange-100 text-orange-700',
  cool: 'bg-blue-100 text-blue-700', nurture: 'bg-gray-100 text-gray-600',
  'sin-respuesta': 'bg-gray-100 text-gray-400', new: 'bg-green-100 text-green-700',
};

export default function SegundoCerebroPage() {
  const [searchParams] = useSearchParams();
  const locationId = searchParams.get('locationId') || '';

  const [stats, setStats] = useState<Stats | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [pipeline, setPipeline] = useState<PipelineStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [retryingId, setRetryingId] = useState<number | null>(null);

  const headers = { 'Content-Type': 'application/json' };

  const load = useCallback(async () => {
    if (!locationId) return;
    setLoading(true);
    try {
      const [s, c, ct, m, p] = await Promise.all([
        fetch(`${BACKEND_URL}/api/wiki/stats?locationId=${locationId}`).then(r => r.json()).catch(() => null),
        fetch(`${BACKEND_URL}/api/wiki/companies?locationId=${locationId}`).then(r => r.json()).catch(() => ({ companies: [] })),
        fetch(`${BACKEND_URL}/api/wiki/contacts?locationId=${locationId}&limit=300${q ? `&q=${encodeURIComponent(q)}` : ''}`).then(r => r.json()).catch(() => ({ contacts: [] })),
        fetch(`${BACKEND_URL}/api/meetings?locationId=${locationId}`).then(r => r.json()).catch(() => ({ meetings: [] })),
        fetch(`${BACKEND_URL}/api/pipeline/status`).then(r => r.json()).catch(() => null),
      ]);
      setStats(s && !s.error ? s : null);
      setCompanies(c.companies || []);
      setContacts(ct.contacts || []);
      setMeetings(m.meetings || []);
      setPipeline(p && !p.error ? p : null);
    } finally { setLoading(false); }
  }, [locationId, q]);

  useEffect(() => { load(); }, [load]);

  const createCompany = async () => {
    if (!newCompany.trim()) return;
    await fetch(`${BACKEND_URL}/api/wiki/companies`, {
      method: 'POST', headers, body: JSON.stringify({ locationId, name: newCompany.trim() }),
    });
    setNewCompany('');
    load();
  };

  const assign = async (contactId: number, fields: Record<string, unknown>) => {
    setSavingId(contactId);
    try {
      await fetch(`${BACKEND_URL}/api/wiki/contacts/${contactId}/assign`, {
        method: 'POST', headers, body: JSON.stringify(fields),
      });
      await load();
    } finally { setSavingId(null); }
  };

  const retryMeeting = async (meetingId: number) => {
    setRetryingId(meetingId);
    try {
      await fetch(`${BACKEND_URL}/api/meetings/${meetingId}/process`, {
        method: 'POST', headers,
      });
      await load();
    } finally { setRetryingId(null); }
  };

  if (!locationId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card><CardContent className="py-10 text-center text-gray-400">
          <Brain className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Falta <span className="font-mono">?locationId=</span> en la URL.</p>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="w-full max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Segundo Cerebro</h1>
              <Badge variant="secondary" className="text-xs font-mono mt-0.5">{locationId}</Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Contactos" value={stats.total_contacts} />
            <StatCard label="Mensajes recibidos" value={stats.total_inbound} />
            <StatCard label="Mensajes enviados" value={stats.total_outbound} />
            <StatCard label="Activos (7d)" value={stats.active_7d} />
          </div>
        )}

        {/* Empresas */}
        <Card>
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Empresas ({companies.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <input
                value={newCompany} onChange={e => setNewCompany(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createCompany()}
                placeholder="Nueva empresa…"
                className="px-2 py-1 border border-gray-200 rounded text-sm w-44 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <Button size="sm" onClick={createCompany} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 flex flex-wrap gap-2">
            {companies.length === 0 && <span className="text-xs text-gray-400">Sin empresas aún.</span>}
            {companies.map(c => (
              <Badge key={c.id} variant="outline" className="text-xs">
                {c.name} <span className="ml-1 text-gray-400">· {c.contact_count}</span>
              </Badge>
            ))}
          </CardContent>
        </Card>

        {/* Contactos + asignación */}
        <Card>
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4" /> Contactos ({contacts.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-gray-400" />
              <input
                value={q} onChange={e => setQ(e.target.value)}
                placeholder="Buscar nombre o teléfono…"
                className="pl-7 pr-2 py-1 border border-gray-200 rounded text-sm w-56 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b">
                    <th className="py-2 pr-2">Contacto</th>
                    <th className="py-2 px-2">Estado</th>
                    <th className="py-2 px-2">Empresa</th>
                    <th className="py-2 px-2">Msgs</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map(ct => (
                    <tr key={ct.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 pr-2">
                        <div className="font-medium text-gray-800 flex items-center gap-1">
                          {ct.is_group && <span title="Grupo">👥</span>}
                          {ct.name || ct.phone}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">{ct.phone}</div>
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={ct.lead_status || 'new'}
                          onChange={e => assign(ct.id, { leadStatus: e.target.value })}
                          className={`text-xs rounded px-1.5 py-0.5 border-0 ${LEAD_COLORS[ct.lead_status || 'new'] || ''}`}
                        >
                          {['hot', 'warm', 'cool', 'nurture', 'sin-respuesta', 'new'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={ct.company_id || ''}
                          onChange={e => assign(ct.id, { companyId: e.target.value ? Number(e.target.value) : null })}
                          disabled={savingId === ct.id}
                          className="text-xs border border-gray-200 rounded px-1.5 py-0.5 max-w-[160px] focus:outline-none focus:ring-1 focus:ring-purple-400"
                        >
                          <option value="">— sin empresa —</option>
                          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </td>
                      <td className="py-2 px-2 text-xs text-gray-500 whitespace-nowrap">
                        {ct.msg_in_count}/{ct.msg_out_count}
                      </td>
                    </tr>
                  ))}
                  {contacts.length === 0 && (
                    <tr><td colSpan={4} className="py-6 text-center text-gray-400 text-xs">
                      Sin contactos. Llegan al capturar conversaciones o tras el backfill GHL.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline 2Brain */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Pipeline 2Brain
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {!pipeline && <span className="text-xs text-gray-400">Sin datos de pipeline.</span>}
            {pipeline && (
              <>
                {/* Google */}
                <div className="flex flex-wrap items-center gap-2">
                  {pipeline.google.accounts.length === 0 && (
                    <span className="text-xs text-gray-400">Sin cuentas Google conectadas</span>
                  )}
                  {pipeline.google.accounts.map(acc => (
                    <Badge
                      key={acc.email}
                      title={acc.lastError || undefined}
                      className={`text-xs ${acc.active ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-red-100 text-red-700 hover:bg-red-100'}`}
                    >
                      {acc.email}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="text-xs">
                    {pipeline.google.pollEnabled
                      ? `Poller activo · cada ${Math.round(pipeline.google.pollIntervalMs / 60000)} min`
                      : 'Poller inactivo'}
                  </Badge>
                </div>

                {/* Notion */}
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${pipeline.notion.configured ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-100'}`}>
                    {pipeline.notion.configured ? 'Notion configurado' : 'Notion sin configurar'}
                  </Badge>
                </div>

                {/* Fathom */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`text-xs ${pipeline.fathom.webhookSecretConfigured ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-red-100 text-red-700 hover:bg-red-100'}`}>
                    {pipeline.fathom.webhookSecretConfigured ? 'Webhook configurado' : 'Webhook sin configurar'}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    última reunión: {pipeline.fathom.lastReceivedAt ? new Date(pipeline.fathom.lastReceivedAt).toLocaleString() : 'nunca'}
                    {' · '}{pipeline.fathom.count7d} en 7d
                  </span>
                </div>

                {/* Resumen de reuniones */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500">{pipeline.meetings.total} reuniones totales</span>
                  {pipeline.meetings.pendingNotion > 0 && (
                    <Badge className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-100">
                      {pipeline.meetings.pendingNotion} pendientes de Notion
                    </Badge>
                  )}
                  {pipeline.meetings.failed > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {pipeline.meetings.failed} con error
                    </Badge>
                  )}
                </div>

                {/* Reuniones con error */}
                {pipeline.meetings.recent.filter(m => m.processingError).length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-gray-100">
                    {pipeline.meetings.recent.filter(m => m.processingError).map(m => (
                      <div key={m.id} className="flex items-center justify-between gap-2 text-sm py-1">
                        <div className="min-w-0">
                          <div className="text-gray-700 truncate">{m.title}</div>
                          <div className="text-xs text-red-600 truncate">{m.processingError}</div>
                        </div>
                        <Button
                          size="sm" variant="outline"
                          onClick={() => retryMeeting(m.id)}
                          disabled={retryingId === m.id}
                        >
                          {retryingId === m.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Reintentar'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Reuniones */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CalendarClock className="w-4 h-4" /> Reuniones ({meetings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1.5">
            {meetings.length === 0 && <span className="text-xs text-gray-400">Sin reuniones aún (Fathom / Google Meet).</span>}
            {meetings.map(m => (
              <div key={m.id} className="flex items-center justify-between text-sm border-b border-gray-50 py-1">
                <span className="text-gray-700">{m.title}</span>
                <span className="text-xs text-gray-400">{m.source}{m.company_name ? ` · ${m.company_name}` : ''}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card><CardContent className="py-3">
      <div className="text-2xl font-bold text-gray-900">{value ?? 0}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </CardContent></Card>
  );
}
