import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function SubscriptionPanel() {
  const [currentPlan, setCurrentPlan] = useState("Pro");
  const [whatsAppLimit, setWhatsAppLimit] = useState(3);
  const [iaAgents, setIaAgents] = useState(2);

  const [newWhatsAppLimit, setNewWhatsAppLimit] = useState("3");
  const [newIaAgents, setNewIaAgents] = useState("2");

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
      <section className="bg-white p-6 border rounded shadow-sm space-y-4">
        <h2 className="text-xl font-semibold mb-2">Modificar tu plan</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <Label className="block mb-1">Números de WhatsApp a conectar</Label>
            <Select value={newWhatsAppLimit} onValueChange={setNewWhatsAppLimit}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 5, 10].map((n) => (
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
                {[0, 1, 2, 3, 5].map((a) => (
                  <SelectItem key={a} value={a.toString()}>
                    {a} agente{a !== 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button className="mt-2 bg-green-600 hover:bg-green-700">
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
              limit: "3 números / 2 IA",
              price: "$49/mes",
              features: [
                "6 usuarios incluidos",
                "6.000 contactos activos",
                "2 números WhatsApp",
                "API & Webhooks incluidos",
                "✅ Zapier, HubSpot, Apps móviles"
              ],
              button: "Seleccionar"
            },
            {
              name: "Enterprise",
              limit: "∞ números / ∞ IA",
              price: "A convenir",
              features: [
                "Usuarios y contactos personalizados",
                "Números y agentes ilimitados",
                "Prioridad + Integraciones personalizadas",
                "✅ Todo incluido + soporte dedicado"
              ],
              button: "Consultar"
            }
          ].map((plan) => (
            <div key={plan.name} className="border rounded p-6 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{plan.limit}</p>
                <p className="text-green-600 font-bold text-lg mb-4">{plan.price}</p>

                <Accordion type="single" collapsible>
                  <AccordionItem value="features">
                    <AccordionTrigger className="text-sm text-gray-700 hover:underline">
                      Ver funcionalidades
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="text-sm text-gray-600 space-y-1 mt-2">
                        {plan.features.map((f, i) => (
                          <li key={i}>✅ {f}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              <Button variant={plan.name === "Enterprise" ? "outline" : "default"} className="mt-4">
                {plan.button}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Botón de facturas anteriores */}
      <section className="flex justify-start">
        <Button variant="outline" className="border-gray-300">
          Ver facturas anteriores
        </Button>
      </section>
    </div>
  );
}