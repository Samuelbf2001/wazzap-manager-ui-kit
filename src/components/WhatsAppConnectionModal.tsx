/**
 * 🔧 WHATSAPP CONNECTION MODAL - VERSIÓN OPTIMIZADA
 * 
 * ✅ CORRECCIONES IMPLEMENTADAS:
 * - Solo UNA petición al webhook personalizado (antes eran 8)
 * - Manejo correcto de respuestas JSON vacías
 * - Prevención de múltiples envíos simultáneos
 * - Eliminación de llamadas redundantes a n8n
 * - Logging mejorado para debugging
 * 
 * 🎯 FLUJO SIMPLIFICADO:
 * 1. Usuario envía formulario → 1 llamada al webhook
 * 2. Webhook responde con QR → Se muestra en pantalla
 * 3. Usuario escanea QR → Solo logging interno (sin más llamadas)
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { loggerService } from "@/services/logger.service";
import { connectionMonitorService } from "@/services/connection-monitor.service";

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



  const sendToCustomWebhook = async (sessionName: string, phoneNumber: string) => {
    try {
      // ✅ URL CORREGIDA: /webhook/ en lugar de /webhook-test/
      const webhookUrl = 'https://n8n-n8n.5raxun.easypanel.host/webhook/f2666a61-db14-45e0-ab5b-4bb895adb3c2';
      
      // 🎯 PAYLOAD SIMPLIFICADO: Solo nombre y número como solicitaste
      const simplePayload = {
        session_name: sessionName,
        phone_number: phoneNumber,
        timestamp: new Date().toISOString(),
        app_source: 'whatsfull_frontend'
      };
      
      // Log del request
      loggerService.logWebhookRequest(simplePayload, sessionName, phoneNumber);
      
      console.log('📤 Enviando datos al webhook:', webhookUrl);
      console.log('📦 Payload simplificado:', simplePayload);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simplePayload),
      });

      if (response.ok) {
        let responseData = null;
        
        try {
          const responseText = await response.text();
          console.log('📄 Respuesta raw del webhook:', responseText);
          
          if (responseText.trim()) {
            responseData = JSON.parse(responseText);
            console.log('✅ Respuesta parseada del webhook:', responseData);
          } else {
            console.log('📭 Respuesta vacía del webhook (200 OK sin contenido)');
            responseData = { success: true, message: 'Webhook procesado sin contenido' };
          }
        } catch (parseError) {
          console.warn('⚠️ Error parseando JSON del webhook, usando respuesta por defecto');
          responseData = { success: true, message: 'Webhook procesado sin JSON válido' };
        }
        
        // Log de la respuesta exitosa
        loggerService.logWebhookResponse(responseData, sessionName, phoneNumber);
        
        return responseData;
      } else {
        const errorMsg = `Webhook respondió con error HTTP: ${response.status}`;
        console.warn(errorMsg);
        
        // Log del error HTTP
        loggerService.logWebhookError(errorMsg, sessionName, phoneNumber);
        
        return null;
      }
    } catch (error) {
      console.error('❌ Error enviando al webhook:', error);
      
      // Log del error de red
      loggerService.logWebhookError(
        `Error de red: ${error instanceof Error ? error.message : 'Error desconocido'}`, 
        sessionName, 
        phoneNumber
      );
      
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🚫 PREVENIR MÚLTIPLES ENVÍOS
    if (loading) {
      console.log('⚠️ Ya hay una petición en curso, ignorando...');
      return;
    }
    
    setLoading(true);

    try {
      // Log del envío del formulario
      loggerService.logFormSubmission({
        session_name: formData.name,
        phone_number: formData.phone_number,
        account_protection: formData.account_protection,
        log_messages: formData.log_messages
      });

      console.log('🚀 Enviando petición al webhook con datos simplificados...');
      console.log('📋 Datos: Sesión:', formData.name, '| Teléfono:', formData.phone_number);
      
      // 🔥 UNA SOLA PETICIÓN AL WEBHOOK CON DATOS SIMPLIFICADOS
      const webhookResponse = await sendToCustomWebhook(formData.name, formData.phone_number);
      
      if (webhookResponse) {
        console.log('=== 🔍 PROCESANDO RESPUESTA DEL WEBHOOK ===');
        console.log('Respuesta completa:', webhookResponse);
        
        // Verificar diferentes estructuras de respuesta
        const webhookData = Array.isArray(webhookResponse) ? webhookResponse[0] : webhookResponse;
        
        console.log('Datos procesados:', webhookData);
        
        // Buscar QR en diferentes ubicaciones posibles
        let qrBase64 = null;
        
        if (webhookData?.success && webhookData?.data?.base64) {
          qrBase64 = webhookData.data.base64;
          console.log('✅ QR encontrado en: webhookData.data.base64');
        } else if (webhookData?.data?.base64) {
          qrBase64 = webhookData.data.base64;
          console.log('✅ QR encontrado en: webhookData.data.base64 (sin success)');
        } else if (webhookData?.base64) {
          qrBase64 = webhookData.base64;
          console.log('✅ QR encontrado en: webhookData.base64');
        } else if (Array.isArray(webhookResponse)) {
          // Buscar en todos los elementos del array
          for (const item of webhookResponse) {
            if (item?.data?.base64) {
              qrBase64 = item.data.base64;
              console.log('✅ QR encontrado en array, elemento:', item);
              break;
            }
          }
        }
        
        if (qrBase64) {
          console.log('🎉 QR Code encontrado exitosamente!');
          console.log('📱 Aplicando QR al modal...');
          setQrCode(qrBase64);
          setStep('qr');
          
          // Log específico para QR generado
          loggerService.logQRGenerated('webhook personalizado', formData.name, formData.phone_number);

          // 🚀 CREAR CONEXIÓN INMEDIATAMENTE Y COMENZAR MONITOREO CADA 15 SEGUNDOS
          console.log('🔄 Creando conexión en connectionMonitorService...');
          
          try {
            const newConnection = await connectionMonitorService.createConnection({
              name: formData.name,
              phone_number: formData.phone_number,
              status: 'active',
              instance_state: null,
              instance_name: null
            });
            
            console.log('✅ Conexión creada exitosamente:', newConnection);
            console.log('⏰ Monitoreo cada 15 segundos iniciado automáticamente');
            
            // 📝 REGISTRAR CALLBACKS PARA ACTUALIZACIÓN AUTOMÁTICA
            connectionMonitorService.registerQRUpdateCallback(newConnection.id, (newQR: string) => {
              console.log('🆕 Nuevo QR recibido del monitoreo, actualizando...');
              setQrCode(newQR);
              loggerService.logQRGenerated('monitoreo automático', formData.name, formData.phone_number);
            });
            
            connectionMonitorService.registerModalCloseCallback(newConnection.id, () => {
              console.log('🎉 Conexión establecida exitosamente - Cerrando modal automáticamente');
              handleAutomaticSuccess();
            });
            
            console.log('📞 Callbacks registrados para actualizaciones automáticas');
            
          } catch (connectionError) {
            console.error('❌ Error creando conexión en monitor:', connectionError);
            // Continuar mostrando QR aunque falle el monitoreo
          }
          
          toast({
            title: "✅ Código QR generado",
            description: "Escanea el código con tu WhatsApp para conectar. Se verificará automáticamente cada 15 segundos.",
          });
          
          return; // ✅ ÉXITO - Salir aquí
        } else {
          console.log('❌ No se encontró QR en la respuesta del webhook');
          console.log('🔍 Estructura de respuesta recibida:', JSON.stringify(webhookResponse, null, 2));
        }
      } else {
        console.log('❌ El webhook no respondió o respondió con error');
      }
      
      // 🚫 Si llegamos aquí, algo salió mal
      throw new Error('No se pudo generar el código QR. Intenta nuevamente.');

    } catch (error) {
      console.error('💥 Error en handleSubmit:', error);
      
      // Solo loggear el error, NO hacer más peticiones
      loggerService.logWebhookError(
        error instanceof Error ? error.message : 'Error desconocido en conexión',
        formData.name,
        formData.phone_number
      );

      toast({
        title: "❌ Error de conexión",
        description: "No fue posible conectar. Revisa los datos e intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = async () => {
    try {
      // Log del escaneo del QR (solo informativo)
      loggerService.addLog({
        type: 'qr_scanned',
        sessionName: formData.name,
        phoneNumber: formData.phone_number,
        message: 'Usuario confirmó escaneo del código QR manualmente',
        status: 'success'
      });

      // 🎉 ÉXITO: La conexión ya fue creada en handleSubmit
      // El monitoreo ya está funcionando cada 15 segundos
      console.log('🎉 Usuario confirmó escaneo manual. Monitoreo continúa automáticamente cada 15 segundos');

      setStep('success');
      toast({
        title: "¡Conexión en proceso!",
        description: "Se está verificando automáticamente la conexión cada 15 segundos.",
      });
      
      // No cerrar el modal inmediatamente - dejar que el monitoreo lo cierre automáticamente
      // cuando detecte que el estado cambió a "open"
      console.log('⏳ Esperando confirmación automática del webhook...');
      
    } catch (error) {
      console.error('Error en confirmación manual:', error);
    }
  };

  // 🎉 FUNCIÓN LLAMADA AUTOMÁTICAMENTE CUANDO EL MONITOREO DETECTA CONEXIÓN EXITOSA
  const handleAutomaticSuccess = () => {
    console.log('🎉 ¡Conexión WhatsApp establecida automáticamente!');
    
    // Log del éxito automático
    loggerService.addLog({
      type: 'connection_restored',
      sessionName: formData.name,
      phoneNumber: formData.phone_number,
      message: 'Conexión establecida automáticamente por monitoreo',
      status: 'success'
    });

    toast({
      title: "🎉 ¡Conexión exitosa!",
      description: "WhatsApp se ha conectado automáticamente.",
    });
    
    // Cerrar modal y resetear después de un breve delay
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
      webhook_url: 'https://n8n-n8n.5raxun.easypanel.host/webhook/f2666a61-db14-45e0-ab5b-4bb895adb3c2',
      webhook_enabled: true,
      webhook_events: ['message', 'status', 'qrcode']
    });
  };

  const handleClose = () => {
    // 🛑 LIMPIAR CALLBACKS Y DETENER MONITOREO AL CERRAR MODAL
    console.log('❌ Cerrando modal - Deteniendo monitoreo y limpiando callbacks');
    
    // Buscar conexiones activas con el nombre de sesión actual y limpiar
    const connections = connectionMonitorService.getConnections();
    const activeConnection = connections.find(conn => 
      conn.name === formData.name && conn.status === 'active'
    );
    
    if (activeConnection) {
      console.log(`🛑 Deteniendo monitoreo para: ${activeConnection.name}`);
      connectionMonitorService.stopMonitoring(activeConnection.id);
      connectionMonitorService.clearCallbacks(activeConnection.id);
    }
    
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Conectar WhatsApp
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

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Conectar'
                )}
              </Button>
            </div>
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
              ) : qrCode.startsWith('data:image/') ? (
                // Mostrar imagen base64 recibida del webhook
                <img 
                  src={qrCode} 
                  alt="QR Code WhatsApp" 
                  className="w-48 h-48 border rounded"
                  style={{ maxWidth: '200px', maxHeight: '200px' }}
                />
              ) : (
                // Mostrar QR SVG generado (fallback)
                <QRCodeSVG value={qrCode} size={200} />
              )}
            </div>
            <p className="text-sm text-gray-600">
              Abre WhatsApp → Configuración → Dispositivos vinculados → Vincular un dispositivo
            </p>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleSuccess} className="flex-1 bg-green-600 hover:bg-green-700">
                He escaneado el código
              </Button>
            </div>
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
