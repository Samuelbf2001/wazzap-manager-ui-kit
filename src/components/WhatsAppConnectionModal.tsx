
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";

interface WhatsAppConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnectionSuccess: () => void;
}

interface FormData {
  name: string;
  phone_number: string;
  account_protection: boolean;
  log_messages: boolean;
  webhook_url: string;
  webhook_enabled: boolean;
  webhook_events: string[];
}

export function WhatsAppConnectionModal({ open, onOpenChange, onConnectionSuccess }: WhatsAppConnectionModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'form' | 'qr' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone_number: '',
    account_protection: true,
    log_messages: true,
    webhook_url: 'https://n8n.srv823701.hstgr.cloud/webhook/cfe44692-83e5-40a8-ac76-ae24154419a1',
    webhook_enabled: true,
    webhook_events: ['message', 'status', 'qrcode']
  });

  const webhookEventOptions = [
    { value: 'message', label: 'Mensajes' },
    { value: 'status', label: 'Estados' },
    { value: 'qrcode', label: 'Código QR' }
  ];

  const sendWebhookNotification = async (data: any) => {
    try {
      console.log('Enviando datos al webhook:', formData.webhook_url);
      const response = await fetch(formData.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'whatsapp_connection_started',
          session_name: formData.name,
          phone_number: formData.phone_number,
          timestamp: new Date().toISOString(),
          ...data
        }),
      });

      if (response.ok) {
        console.log('Webhook enviado exitosamente');
      } else {
        console.warn('Error al enviar webhook:', response.status);
      }
    } catch (error) {
      console.error('Error enviando webhook:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Enviar notificación de webhook al inicio del proceso
      if (formData.webhook_enabled && formData.webhook_url) {
        await sendWebhookNotification({
          status: 'connection_initiated'
        });
      }

      // Paso 1: Crear sesión de WhatsApp
      const createResponse = await fetch('https://app.wasenderapi.com/api/sessions/create-whatsapp-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone_number: formData.phone_number,
          account_protection: formData.account_protection,
          log_messages: formData.log_messages,
          webhook_url: formData.webhook_url || undefined,
          webhook_enabled: formData.webhook_enabled,
          webhook_events: formData.webhook_events.length > 0 ? formData.webhook_events : undefined
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Error al crear la sesión de WhatsApp');
      }

      // Paso 2: Conectar sesión de WhatsApp
      const connectResponse = await fetch('https://app.wasenderapi.com/api/sessions/connect-whatsapp-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name
        }),
      });

      if (!connectResponse.ok) {
        throw new Error('Error al conectar con WhatsApp');
      }

      const connectData = await connectResponse.json();
      
      if (connectData.qr) {
        setQrCode(connectData.qr);
        setStep('qr');
        
        // Enviar webhook con el código QR generado
        if (formData.webhook_enabled && formData.webhook_url) {
          await sendWebhookNotification({
            status: 'qr_generated',
            qr_code: connectData.qr
          });
        }

        toast({
          title: "Código QR generado",
          description: "Escanea el código con tu WhatsApp para conectar.",
        });
      } else {
        throw new Error('No se recibió el código QR');
      }

    } catch (error) {
      console.error('Error:', error);
      
      // Enviar webhook de error
      if (formData.webhook_enabled && formData.webhook_url) {
        await sendWebhookNotification({
          status: 'connection_failed',
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }

      toast({
        title: "Error de conexión",
        description: "No fue posible conectar. Revisa los datos e intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = async () => {
    // Enviar webhook de conexión exitosa
    if (formData.webhook_enabled && formData.webhook_url) {
      await sendWebhookNotification({
        status: 'connection_successful',
        session_name: formData.name,
        phone_number: formData.phone_number
      });
    }

    setStep('success');
    toast({
      title: "¡Conexión exitosa!",
      description: "WhatsApp se ha conectado correctamente.",
    });
    setTimeout(() => {
      onConnectionSuccess();
      onOpenChange(false);
      resetForm();
    }, 2000);
  };

  const resetForm = () => {
    setStep('form');
    setQrCode('');
    setFormData({
      name: '',
      phone_number: '',
      account_protection: true,
      log_messages: true,
      webhook_url: 'https://n8n.srv823701.hstgr.cloud/webhook/cfe44692-83e5-40a8-ac76-ae24154419a1',
      webhook_enabled: true,
      webhook_events: ['message', 'status', 'qrcode']
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Conectar WhatsApp
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la sesión *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Soporte Principal"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Número de teléfono *</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="Ej: +34123456789"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="account_protection"
                checked={formData.account_protection}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, account_protection: checked as boolean })
                }
              />
              <Label htmlFor="account_protection">Protección de cuenta *</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="log_messages"
                checked={formData.log_messages}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, log_messages: checked as boolean })
                }
              />
              <Label htmlFor="log_messages">Registrar mensajes *</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook_url">URL del Webhook</Label>
              <Input
                id="webhook_url"
                value={formData.webhook_url}
                onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                placeholder="https://mi-servidor.com/webhook"
                readOnly
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="webhook_enabled"
                checked={formData.webhook_enabled}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, webhook_enabled: checked as boolean })
                }
              />
              <Label htmlFor="webhook_enabled">Activar notificaciones webhook</Label>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                'Conectar WhatsApp'
              )}
            </Button>
          </form>
        )}

        {step === 'qr' && (
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium">Escanea este código con tu WhatsApp</h3>
            <div className="flex justify-center">
              <QRCodeSVG value={qrCode} size={200} />
            </div>
            <p className="text-sm text-gray-600">
              Abre WhatsApp → Configuración → Dispositivos vinculados → Vincular un dispositivo
            </p>
            <Button onClick={handleSuccess} className="w-full bg-green-600 hover:bg-green-700">
              He escaneado el código
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
            <p className="text-sm text-gray-600">WhatsApp se ha conectado correctamente.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
