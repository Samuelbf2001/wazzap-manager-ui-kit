/**
 * Modal para crear una nueva conexión WhatsApp.
 * Soporta dos modos:
 *  - 'hubspot': pide inbox de HubSpot, llama a /api/channels/setup
 *  - 'ghl':     pide locationId de GHL,  llama a /api/ghl-channels/setup
 *
 * Flujo común:
 *  1. Usuario llena el formulario
 *  2. Backend crea instancia Evolution + cuenta de canal
 *  3. GET /api/channels/qr/{name} → obtiene QR
 *  4. Usuario escanea QR → polling detecta estado 'open' → éxito
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
import { whatsfullApi, type HubSpotInbox, type ChannelSetupResult } from "@/services/whatsfull-api.service";

interface WhatsAppConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnectionSuccess: () => void;
  /** 'hubspot' (default) o 'ghl' */
  mode?: 'hubspot' | 'ghl';
  /** Solo en modo 'ghl': el locationId de la subcuenta */
  locationId?: string;
  /** Solo en modo 'ghl' agency install: el companyId para pre-generar location token */
  companyId?: string;
}

export function WhatsAppConnectionModal({
  open,
  onOpenChange,
  onConnectionSuccess,
  mode = 'hubspot',
  locationId,
  companyId,
}: WhatsAppConnectionModalProps) {
  const { toast } = useToast();
  const isGHL = mode === 'ghl';

  const [step, setStep] = useState<'form' | 'qr' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [inboxes, setInboxes] = useState<HubSpotInbox[]>([]);
  const [loadingInboxes, setLoadingInboxes] = useState(false);
  const [setupResult, setSetupResult] = useState<ChannelSetupResult | null>(null);
  const [pollingInterval, setPollingInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [submitError, setSubmitError] = useState<string>('');
  const [isAuthError, setIsAuthError] = useState(false);
  const [qrRefreshing, setQrRefreshing] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(40);
  const [waitSeconds, setWaitSeconds] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    inboxId: '',
  });

  // Cargar inboxes de HubSpot solo en modo hubspot
  useEffect(() => {
    if (open && !isGHL) {
      loadInboxes();
    }
  }, [open, isGHL]);

  // Limpiar polling al cerrar
  useEffect(() => {
    if (!open && pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [open]);

  const loadInboxes = async () => {
    setLoadingInboxes(true);
    try {
      const data = await whatsfullApi.getInboxes();
      setInboxes(data);
      if (data.length > 0) setFormData(prev => ({ ...prev, inboxId: data[0].id }));
    } catch {
      toast({ title: "Aviso", description: "No se pudieron cargar los inboxes.", variant: "destructive" });
    } finally {
      setLoadingInboxes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setSubmitError('');
    setIsAuthError(false);

    try {
      let result: ChannelSetupResult;

      if (isGHL) {
        // Modo GHL: llamar a /api/ghl-channels/setup
        result = await whatsfullApi.setupGHLChannel({
          locationId: locationId!,
          phoneNumber: formData.phone_number,
          evolutionInstance: formData.name.toLowerCase().replace(/\s+/g, '_') || undefined,
          companyId: companyId || undefined,
        });
      } else {
        // Modo HubSpot
        result = await whatsfullApi.setupChannel({
          phoneNumber: formData.phone_number,
          displayName: formData.name,
          inboxId: formData.inboxId,
          evolutionInstance: formData.name.toLowerCase().replace(/\s+/g, '_'),
        });
      }

      setSetupResult(result);

      // Si la instancia ya estaba conectada, ir directo a éxito
      if (result.evolutionInstance && result.instanceState === 'open') {
        handleAutomaticSuccess();
        return;
      }

      // Obtener QR si hay instancia Evolution
      if (result.evolutionInstance) {
        try {
          let qrValue = result.qrBase64 || '';
          if (!qrValue) {
            const qr = isGHL
              ? await whatsfullApi.getGHLQRCode(result.evolutionInstance)
              : await whatsfullApi.getQRCode(result.evolutionInstance, result.evolutionApikey);
            qrValue = qr.base64 || qr.code || '';
          }
          setQrCode(qrValue);
          setStep('qr');

          // Polling cada 5s para detectar conexión
          const interval = setInterval(async () => {
            try {
              const state = isGHL
                ? await whatsfullApi.getGHLConnectionState(result.evolutionInstance!)
                : await whatsfullApi.getConnectionState(result.evolutionInstance!, result.evolutionApikey);
              if (state === 'open') {
                clearInterval(interval);
                setPollingInterval(null);
                handleAutomaticSuccess();
              }
            } catch {}
          }, 5000);
          setPollingInterval(interval);

          toast({ title: "✅ QR generado", description: "Escanea con tu WhatsApp para conectar." });
        } catch {
          setStep('qr');
          toast({ title: "Canal creado", description: "El QR estará disponible en unos segundos." });
        }
      } else {
        handleAutomaticSuccess();
      }

    } catch (error) {
      const msg = error instanceof Error ? error.message : "No se pudo crear el canal.";
      const isAuth = msg.toLowerCase().includes('token') || msg.toLowerCase().includes('autorizado') || msg.toLowerCase().includes('oauth');
      setSubmitError(msg);
      setIsAuthError(isAuth);
      if (!isAuth) {
        toast({ title: "❌ Error", description: msg, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  // Re-genera el QR (los QR de WhatsApp expiran en ~30-60s)
  const refreshQR = async () => {
    if (!setupResult?.evolutionInstance || qrRefreshing) return;
    setQrRefreshing(true);
    try {
      const qr = isGHL
        ? await whatsfullApi.getGHLQRCode(setupResult.evolutionInstance)
        : await whatsfullApi.getQRCode(setupResult.evolutionInstance, setupResult.evolutionApikey);
      const qrValue = qr.base64 || qr.code || '';
      if (qrValue) { setQrCode(qrValue); setQrCountdown(40); }
    } catch {
      // silencioso: el siguiente intento o el botón manual reintentan
    } finally {
      setQrRefreshing(false);
    }
  };

  // En el paso QR: cuenta regresiva + auto-refresh del QR + cronómetro de espera
  useEffect(() => {
    if (step !== 'qr') return;
    setQrCountdown(40);
    setWaitSeconds(0);
    const tick = setInterval(() => {
      setWaitSeconds(s => s + 1);
      setQrCountdown(c => {
        if (c <= 1) { refreshQR(); return 40; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, setupResult?.evolutionInstance]);

  const handleAutomaticSuccess = () => {
    if (pollingInterval) { clearInterval(pollingInterval); setPollingInterval(null); }
    setStep('success');
    toast({ title: "🎉 ¡Conectado!", description: `WhatsApp vinculado correctamente con ${isGHL ? 'GoHighLevel' : 'HubSpot'}.` });
    setTimeout(() => { onConnectionSuccess(); onOpenChange(false); resetForm(); }, 2000);
  };

  const resetForm = () => {
    setStep('form');
    setQrCode('');
    setSetupResult(null);
    setSubmitError('');
    setIsAuthError(false);
    setQrRefreshing(false);
    setWaitSeconds(0);
    setQrCountdown(40);
    setFormData({ name: '', phone_number: '', inboxId: inboxes[0]?.id || '' });
  };

  const handleClose = () => {
    if (pollingInterval) { clearInterval(pollingInterval); setPollingInterval(null); }
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isGHL ? 'Conectar WhatsApp a GHL' : 'Conectar WhatsApp'}
          </DialogTitle>
          {isGHL && locationId && (
            <p className="text-xs text-gray-400 font-mono mt-1">Location: {locationId}</p>
          )}
        </DialogHeader>

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <StepIndicator current={1} />

            {/* Banner de error de autorización */}
            {submitError && isAuthError && (
              <div className="rounded-md bg-orange-50 border border-orange-200 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />
                  <p className="text-sm font-medium text-orange-700">Autorización requerida</p>
                </div>
                <p className="text-xs text-orange-600">{submitError}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100 w-full"
                  onClick={() => { window.location.href = `${BACKEND_URL}/ghl/install`; }}
                >
                  <RefreshCw className="w-3 h-3 mr-2" />
                  Re-autorizar app en GHL
                </Button>
              </div>
            )}

            {/* Banner de error genérico */}
            {submitError && !isAuthError && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-600">{submitError}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la instancia *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: ernesto_soporte"
                required
              />
              <p className="text-xs text-gray-400">Se usa como nombre de la instancia en EvolutionAPI.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Número de WhatsApp *</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="Ej: +573004188522"
                required
              />
            </div>

            {/* Selector de inbox solo en modo HubSpot */}
            {!isGHL && (
              <div className="space-y-2">
                <Label htmlFor="inboxId">Inbox de HubSpot *</Label>
                <Select
                  value={formData.inboxId}
                  onValueChange={(val) => setFormData({ ...formData, inboxId: val })}
                  disabled={loadingInboxes}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingInboxes ? "Cargando..." : "Selecciona un inbox"} />
                  </SelectTrigger>
                  <SelectContent>
                    {inboxes.map(inbox => (
                      <SelectItem key={inbox.id} value={inbox.id}>{inbox.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || (!isGHL && !formData.inboxId)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creando...</> : 'Conectar'}
              </Button>
            </div>
          </form>
        )}

        {step === 'qr' && (
          <div className="text-center space-y-4">
            <StepIndicator current={2} />
            <h3 className="text-lg font-medium">Escanea con tu WhatsApp</h3>
            <ol className="text-xs text-gray-500 text-left mx-auto max-w-[230px] space-y-0.5">
              <li>1. Abre WhatsApp en tu teléfono</li>
              <li>2. Ajustes → Dispositivos vinculados</li>
              <li>3. Vincular un dispositivo → escanea</li>
            </ol>
            <div className="flex justify-center">
              {!qrCode ? (
                <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Generando QR...</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {qrCode.startsWith('data:image/') ? (
                    <img src={qrCode} alt="QR Code" className={`w-48 h-48 border rounded transition-opacity ${qrRefreshing ? 'opacity-40' : ''}`} />
                  ) : (
                    <div className={qrRefreshing ? 'opacity-40 transition-opacity' : 'transition-opacity'}>
                      <QRCodeSVG value={qrCode} size={200} />
                    </div>
                  )}
                  {qrRefreshing && <Loader2 className="w-6 h-6 animate-spin absolute inset-0 m-auto text-green-600" />}
                </div>
              )}
            </div>

            {/* Estado en vivo: el QR expira, se regenera solo */}
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-gray-500">
                Esperando que escanees… {waitSeconds}s · QR se renueva en {qrCountdown}s
              </span>
            </div>

            {setupResult?.evolutionInstance && (
              <p className="text-xs text-gray-400 font-mono">Instancia: {setupResult.evolutionInstance}</p>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={refreshQR} disabled={qrRefreshing} className="flex-1">
                <RefreshCw className={`w-3 h-3 mr-2 ${qrRefreshing ? 'animate-spin' : ''}`} />
                Regenerar QR
              </Button>
              <Button type="button" variant="ghost" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <StepIndicator current={3} />
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-green-600">¡Conexión exitosa!</h3>
            <p className="text-sm text-gray-600">
              WhatsApp vinculado con {isGHL ? 'GoHighLevel' : 'HubSpot'} correctamente.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Indicador de pasos: Datos → Escanear → Listo */
function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = ['Datos', 'Escanear', 'Listo'];
  return (
    <div className="flex items-center justify-center gap-2 pb-1">
      {steps.map((label, i) => {
        const n = i + 1;
        const active = n === current;
        const done = n < current;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-full text-[10px] font-semibold flex items-center justify-center
                ${done ? 'bg-green-600 text-white' : active ? 'bg-green-100 text-green-700 ring-2 ring-green-500' : 'bg-gray-100 text-gray-400'}`}>
                {done ? '✓' : n}
              </span>
              <span className={`text-[11px] ${active ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>{label}</span>
            </div>
            {n < 3 && <span className={`w-4 h-px ${done ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        );
      })}
    </div>
  );
}
