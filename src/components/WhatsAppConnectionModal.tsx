/**
 * Modal para crear una nueva conexión WhatsApp.
 * Flujo:
 *  1. Usuario llena nombre, teléfono e inbox de HubSpot
 *  2. POST /api/channels/setup → backend crea instancia Evolution + canal HubSpot
 *  3. GET Evolution API /instance/connect/{name} → obtiene QR
 *  4. Usuario escanea QR → conexión establecida
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
}

export function WhatsAppConnectionModal({ open, onOpenChange, onConnectionSuccess }: WhatsAppConnectionModalProps) {
  const { toast } = useToast();
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
    inboxId: ''
  });

  // Cargar inboxes al abrir el modal
  useEffect(() => {
    if (open) {
      loadInboxes();
    }
  }, [open]);

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
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, inboxId: data[0].id }));
      }
    } catch (err) {
      console.error('Error cargando inboxes:', err);
      toast({ title: "Aviso", description: "No se pudieron cargar los inboxes de HubSpot.", variant: "destructive" });
    } finally {
      setLoadingInboxes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      // 1. Crear canal en backend (Evolution + HubSpot)
      const result = await whatsfullApi.setupChannel({
        phoneNumber: formData.phone_number,
        displayName: formData.name,
        inboxId: formData.inboxId,
        evolutionInstance: formData.name.toLowerCase().replace(/\s+/g, '_')
      });

      setSetupResult(result);
      console.log('✅ Canal creado:', result);

      // 2. Obtener QR de Evolution API
      if (result.evolutionInstance && result.evolutionApikey) {
        try {
          const qr = await whatsfullApi.getQRCode(result.evolutionInstance, result.evolutionApikey);
          const qrData = qr.base64 || qr.code || '';
          setQrCode(qrData);
          setStep('qr');

          // 3. Polling de estado cada 5s
          const interval = setInterval(async () => {
            try {
              const state = await whatsfullApi.getConnectionState(result.evolutionInstance!, result.evolutionApikey!);
              if (state === 'open') {
                clearInterval(interval);
                setPollingInterval(null);
                handleAutomaticSuccess();
              }
            } catch {}
          }, 5000);
          setPollingInterval(interval);

          toast({ title: "✅ QR generado", description: "Escanea con tu WhatsApp para conectar." });
        } catch (qrErr) {
          console.warn('No se pudo obtener QR inmediatamente:', qrErr);
          setStep('qr');
          toast({ title: "Canal creado", description: "El QR estará disponible en unos segundos. Refresca si no aparece." });
        }
      } else {
        // Canal creado pero sin Evolution (ej. Gupshup)
        handleAutomaticSuccess();
      }

    } catch (error) {
      console.error('Error creando canal:', error);
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "No se pudo crear el canal.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAutomaticSuccess = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setStep('success');
    toast({ title: "🎉 ¡Conectado!", description: "WhatsApp vinculado correctamente con HubSpot." });
    setTimeout(() => {
      onConnectionSuccess();
      onOpenChange(false);
      resetForm();
    }, 2000);
  };

  const resetForm = () => {
    setStep('form');
    setQrCode('');
    setSetupResult(null);
    setFormData({ name: '', phone_number: '', inboxId: inboxes[0]?.id || '' });
  };

  const handleClose = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Conectar WhatsApp</DialogTitle>
        </DialogHeader>

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la conexión *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Soporte Principal"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Número de WhatsApp *</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="Ej: +521234567890"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inboxId">Inbox de HubSpot *</Label>
              <Select
                value={formData.inboxId}
                onValueChange={(val) => setFormData({ ...formData, inboxId: val })}
                disabled={loadingInboxes}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingInboxes ? "Cargando inboxes..." : "Selecciona un inbox"} />
                </SelectTrigger>
                <SelectContent>
                  {inboxes.map(inbox => (
                    <SelectItem key={inbox.id} value={inbox.id}>{inbox.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.inboxId}
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
            <p className="text-sm text-gray-600">WhatsApp vinculado con HubSpot correctamente.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
