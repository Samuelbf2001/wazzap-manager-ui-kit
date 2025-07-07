import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

export function SubscriptionPanel() {
  const [currentPlan, setCurrentPlan] = useState("Pro");
  const [whatsAppLimit, setWhatsAppLimit] = useState(10);
  const [iaAgents, setIaAgents] = useState(2);

  const [newWhatsAppLimit, setNewWhatsAppLimit] = useState("10");
  const [newIaAgents, setNewIaAgents] = useState("2");

  const { toast } = useToast();

  // Cargar configuración guardada al inicializar
  useEffect(() => {
    const savedConfig = localStorage.getItem('subscription_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setWhatsAppLimit(config.whatsAppLimit || 10);
        setCurrentPlan(config.currentPlan || 'Pro');
        setNewWhatsAppLimit(String(config.whatsAppLimit || 10));
        
        // También cargar agentes IA si está guardado
        if (config.iaAgents !== undefined) {
          setIaAgents(config.iaAgents);
          setNewIaAgents(String(config.iaAgents));
        }
      } catch (error) {
        console.error('Error al cargar configuración:', error);
      }
    }
  }, []);

  // Función para guardar cambios
  const handleSaveChanges = () => {
    const newConfig = {
      whatsAppLimit: parseInt(newWhatsAppLimit),
      iaAgents: parseInt(newIaAgents),
      currentPlan: currentPlan
    };

    // Guardar en localStorage
    localStorage.setItem('subscription_config', JSON.stringify(newConfig));

    // Actualizar estado local
    setWhatsAppLimit(newConfig.whatsAppLimit);
    setIaAgents(newConfig.iaAgents);

    // Disparar evento personalizado para notificar cambios
    window.dispatchEvent(new CustomEvent('subscription-config-updated', {
      detail: newConfig
    }));

    // Mostrar notificación
    toast({
      title: "✅ Configuración actualizada",
      description: `Límite de WhatsApp: ${newConfig.whatsAppLimit}, Agentes IA: ${newConfig.iaAgents}`,
      duration: 3000,
    });

    console.log('🔄 Configuración actualizada:', newConfig);
  };

  return (
    <div className="space-y-10">
      {/* Visual del plan actual */}
      <section className="bg-white p-6 border rounded shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Tu plan actual</h2>
        <p className="text-gray-600 mb-4">Estás en el plan <strong>{currentPlan}</strong>.</p>
        <ul className="text-sm text-gray-700 space-y-1">
          <li><strong>{whatsAppLimit}</strong> número(s) de WhatsApp permitidos</li>
          <li><strong>{iaAgents}</strong> agente(s) IA conectados</li>
        </ul>
      </section>

      {/* Modificar plan */}
      <section className="bg-white p-6 border rounded shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Modificar tu plan</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <Label className="block mb-1">Números de WhatsApp a conectar</Label>
            <Select value={newWhatsAppLimit} onValueChange={setNewWhatsAppLimit}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 5, 10, 15, 20, 50].map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n} número{n > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block mb-1">Agentes IA</Label>
            <Select value={newIaAgents} onValueChange={setNewIaAgents}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 5, 10].map((a) => (
                  <SelectItem key={a} value={a.toString()}>
                    {a} agente{a !== 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="mt-2 bg-green-600 hover:bg-green-700"
            onClick={handleSaveChanges}
          >
            Guardar cambios
          </Button>
        </div>
      </section>

      {/* Cards de planes */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Planes disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: "Inicial",
              limit: "1 número / 0 IA",
              price: "$19/mes",
              whatsAppLimit: 1,
              iaLimit: 0,
              features: [
                "3 usuarios incluidos",
                "2.000 contactos activos",
                "1 número WhatsApp",
                "Sin API ni Webhooks",
                "✅ Zapier, HubSpot, Apps móviles"
              ],
              button: "Seleccionar"
            },
            {
              name: "Pro",
              limit: "10 números / 2 IA",
              price: "$49/mes",
              whatsAppLimit: 10,
              iaLimit: 2,
              features: [
                "6 usuarios incluidos",
                "6.000 contactos activos",
                "10 números WhatsApp",
                "API & Webhooks incluidos",
                "✅ Zapier, HubSpot, Apps móviles"
              ],
              button: "Seleccionar"
            },
            {
              name: "Enterprise",
              limit: "∞ números / ∞ IA",
              price: "A convenir",
              whatsAppLimit: 999,
              iaLimit: 999,
              features: [
                "Usuarios y contactos personalizados",
                "Números y agentes ilimitados",
                "Prioridad + Integraciones personalizadas",
                "✅ Todo incluido + soporte dedicado"
              ],
              button: "Consultar"
            }
          ].map((plan, index) => (
            <div key={index} className="border rounded p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg">{plan.name}</h3>
              <p className="text-gray-600 text-sm">{plan.limit}</p>
              <p className="text-2xl font-bold text-green-600 my-2">{plan.price}</p>
              <ul className="text-sm text-gray-700 space-y-1 mb-4">
                {plan.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
              <Button 
                variant={plan.name === currentPlan ? "default" : "outline"} 
                className="w-full"
                onClick={() => {
                  if (plan.name !== "Enterprise") {
                    setCurrentPlan(plan.name);
                    setNewWhatsAppLimit(String(plan.whatsAppLimit));
                    setNewIaAgents(String(plan.iaLimit));
                    
                    // Auto-guardar cuando selecciona un plan
                    const newConfig = {
                      whatsAppLimit: plan.whatsAppLimit,
                      iaAgents: plan.iaLimit,
                      currentPlan: plan.name
                    };
                    localStorage.setItem('subscription_config', JSON.stringify(newConfig));
                    setWhatsAppLimit(plan.whatsAppLimit);
                    setIaAgents(plan.iaLimit);
                    
                    window.dispatchEvent(new CustomEvent('subscription-config-updated', {
                      detail: newConfig
                    }));

                    toast({
                      title: `Plan ${plan.name} seleccionado`,
                      description: `Límite actualizado a ${plan.whatsAppLimit} números de WhatsApp`,
                      duration: 3000,
                    });
                  }
                }}
                disabled={plan.name === currentPlan}
              >
                {plan.name === currentPlan ? "Plan actual" : plan.button}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Información adicional */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="billing">
          <AccordionTrigger>💳 Información de facturación</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Próxima facturación:</strong> 15 de diciembre de 2024</p>
              <p><strong>Método de pago:</strong> **** **** **** 1234 (Visa)</p>
              <p><strong>Email de facturación:</strong> usuario@empresa.com</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="usage">
          <AccordionTrigger>📊 Uso actual</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Números conectados:</strong> {whatsAppLimit}/10 disponibles</p>
              <p><strong>Mensajes enviados este mes:</strong> 1,245</p>
              <p><strong>Agentes IA activos:</strong> {iaAgents}/2 disponibles</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}