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
import { Loader2 } from "lucide-react";
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

      // Obtener QR si hay instancia Evolution
      if (result.evolutionInstance) {
        try {
          const qr = isGHL
            ? await whatsfullApi.getGHLQRCode(result.evolutionInstance)
            : await whatsfullApi.getQRCode(result.evolutionInstance, result.evolutionApikey);
          setQrCode(qr.base64 || qr.code || '');
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
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "No se pudo crear el canal.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
            <h3 className="text-lg font-medium">Escanea con tu WhatsApp</h3>
            <div className="flex justify-center">
              {!qrCode ? (
                <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Generando QR...</p>
                  </div>
                </div>
              ) : qrCode.startsWith('data:image/') ? (
                <img src={qrCode} alt="QR Code" className="w-48 h-48 border rounded" />
              ) : (
                <QRCodeSVG value={qrCode} size={200} />
              )}
            </div>
            {setupResult?.evolutionInstance && (
              <p className="text-xs text-gray-400 font-mono">Instancia: {setupResult.evolutionInstance}</p>
            )}
            <p className="text-sm text-gray-600">
              WhatsApp → Ajustes → Dispositivos vinculados → Vincular dispositivo
            </p>
            <p className="text-xs text-gray-400">Verificando conexión automáticamente…</p>
            <Button type="button" variant="outline" onClick={handleClose} className="w-full">
              Cancelar
            </Button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
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
