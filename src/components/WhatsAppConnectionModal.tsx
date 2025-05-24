
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

  const sendToN8n = async (action: string, data: any) => {
    try {
      console.log(`Enviando ${action} a n8n:`, formData.webhook_url);
      const response = await fetch(formData.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action,
          timestamp: new Date().toISOString(),
          app_source: 'whatsfull_frontend',
          ...data
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log(`Respuesta de n8n para ${action}:`, responseData);
        return responseData;
      } else {
        throw new Error(`Error en respuesta de n8n: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error enviando ${action} a n8n:`, error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Enviar toda la información de conexión a n8n
      const connectionData = {
        wasender_request: {
          create_session: {
            endpoint: 'https://app.wasenderapi.com/api/sessions/create-whatsapp-session',
            method: 'POST',
            payload: {
              name: formData.name,
              phone_number: formData.phone_number,
              account_protection: formData.account_protection,
              log_messages: formData.log_messages,
              webhook_url: formData.webhook_url,
              webhook_enabled: formData.webhook_enabled,
              webhook_events: formData.webhook_events.length > 0 ? formData.webhook_events : undefined
            }
          },
          connect_session: {
            endpoint: 'https://app.wasenderapi.com/api/sessions/connect-whatsapp-session',
            method: 'POST',
            payload: {
              name: formData.name
            }
          }
        },
        session_details: {
          name: formData.name,
          phone_number: formData.phone_number,
          account_protection: formData.account_protection,
          log_messages: formData.log_messages,
          webhook_url: formData.webhook_url,
          webhook_enabled: formData.webhook_enabled,
          webhook_events: formData.webhook_events
        }
      };

      const response = await sendToN8n('whatsapp_connection_request', connectionData);

      // Procesar respuesta de n8n
      if (response.status === 'success' && response.qr_code) {
        setQrCode(response.qr_code);
        setStep('qr');
        
        toast({
          title: "Código QR generado",
          description: "Escanea el código con tu WhatsApp para conectar.",
        });
      } else if (response.status === 'error') {
        throw new Error(response.message || 'Error en el proceso de conexión');
      } else {
        // Si n8n está procesando en background
        toast({
          title: "Procesando conexión",
          description: "La solicitud se está procesando. Espera el código QR.",
        });
        
        // Simular espera para código QR (esto sería manejado por websockets o polling en producción)
        setTimeout(() => {
          setQrCode('sample-qr-code-pending');
          setStep('qr');
        }, 3000);
      }

    } catch (error) {
      console.error('Error:', error);
      
      // Notificar error a n8n
      await sendToN8n('whatsapp_connection_error', {
        session_name: formData.name,
        phone_number: formData.phone_number,
        error: error instanceof Error ? error.message : 'Error desconocido',
        form_data: formData
      });

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
    try {
      // Notificar conexión exitosa a n8n
      await sendToN8n('whatsapp_connection_success', {
        session_name: formData.name,
        phone_number: formData.phone_number,
        timestamp: new Date().toISOString(),
        qr_scanned: true
      });

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
    } catch (error) {
      console.error('Error notificando éxito:', error);
      // Continuar con el flujo aunque falle la notificación
      setStep('success');
      setTimeout(() => {
        onConnectionSuccess();
        onOpenChange(false);
        resetForm();
      }, 2000);
    }
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
                  Procesando en n8n...
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
              {qrCode === 'sample-qr-code-pending' ? (
                <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Generando código QR...</p>
                  </div>
                </div>
              ) : (
                <QRCodeSVG value={qrCode} size={200} />
              )}
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
