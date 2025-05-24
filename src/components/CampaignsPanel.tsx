import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import FlowVisualBuilder from "@/components/FlowVisualBuilder"; // <--- Ajusta la ruta según tu estructura

type CampaignType = "masivo" | "flujo" | "ia" | "webhooks";

interface Campaign {
  id: string;
  name: string;
  type: Exclude<CampaignType, "webhooks">;
  status: "activa" | "pausada" | "finalizada";
}

const mockCampaigns: Campaign[] = [
  { id: "1", name: "Promo Black Friday", type: "masivo", status: "activa" },
  { id: "2", name: "Onboarding Nuevos Clientes", type: "flujo", status: "pausada" },
  { id: "3", name: "Reenganche IA", type: "ia", status: "activa" },
];

export function CampaignsPanel() {
  const [tab, setTab] = useState<CampaignType>("masivo");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [webhooks, setWebhooks] = useState<{ campaign: string; url: string }[]>([]);
  const [showHubSpotModal, setShowHubSpotModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("manual");
  const [iaDetails, setIaDetails] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const filteredCampaigns = mockCampaigns.filter((c) => c.type === tab);

  const createWebhook = () => {
    if (!selectedCampaign) {
      toast({ title: "Selecciona una campaña", variant: "destructive" });
      return;
    }
    const campaign = mockCampaigns.find((c) => c.id === selectedCampaign);
    const url = `https://miapp.com/api/webhooks/campaign/${selectedCampaign}`;
    setWebhooks([...webhooks, { campaign: campaign?.name || "Campaña desconocida", url }]);
    toast({ title: "Webhook creado", description: "URL generada y lista para usar." });
  };

  const simulateSend = () => {
    toast({
      title: "Mensaje enviado",
      description: `Simulado con segmentación ${audience}.`,
    });
    setShowManualModal(false);
    setMessage("");
    setFiles([]);
    setIaDetails("");
    setCsvFile(null);
  };

  // Helpers para previews de archivos
  const renderFilePreview = (file: File) => {
    const url = URL.createObjectURL(file);
    if (file.type.startsWith("image/")) {
      return (
        <img
          src={url}
          alt={file.name}
          className="h-16 rounded border"
          onLoad={() => URL.revokeObjectURL(url)}
        />
      );
    } else if (file.type.startsWith("video/")) {
      return (
        <video
          src={url}
          controls
          className="h-16 rounded border"
          onLoadedData={() => URL.revokeObjectURL(url)}
        />
      );
    } else if (file.type === "application/pdf") {
      return (
        <span className="inline-flex items-center gap-2 text-red-500">
          📄 {file.name}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-2 text-gray-600">
          📎 {file.name}
        </span>
      );
    }
  };

  return (
    <section className="bg-white p-6 border rounded shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Campañas</h2>
          <p className="text-sm text-gray-500">Gestiona campañas masivas, flujos e integraciones con IA.</p>
        </div>
        {tab !== "webhooks" && (
          <Button onClick={() => tab === "masivo" ? setShowHubSpotModal(true) : toast({ title: "Funcionalidad en desarrollo" })}>
            + Crear campaña
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as CampaignType)}>
        <TabsList className="mb-4">
          <TabsTrigger value="masivo">📤 Masivo</TabsTrigger>
          <TabsTrigger value="flujo">🔁 Flujos</TabsTrigger>
          <TabsTrigger value="ia">🤖 IA</TabsTrigger>
          <TabsTrigger value="webhooks">🌐 Webhooks</TabsTrigger>
        </TabsList>

        {/* Masivo */}
        <TabsContent value="masivo">
          {filteredCampaigns.length === 0 ? (
            <div className="text-sm text-gray-500">No hay campañas de este tipo.</div>
          ) : (
            <div className="space-y-4">
              {filteredCampaigns.map((c) => (
                <div key={c.id} className="p-4 border rounded flex justify-between items-center bg-gray-50">
                  <div>
                    <h3 className="font-medium text-gray-800">{c.name}</h3>
                    <p className="text-xs text-gray-500">Tipo: {c.type}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={c.status === "activa" ? "default" : "outline"}>{c.status}</Badge>
                    <Button variant="outline" size="sm">Ver</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Flujos */}
        <TabsContent value="flujo">
          <FlowVisualBuilder />
          {filteredCampaigns.length === 0 ? (
            <div className="text-sm text-gray-500 mt-4">No hay campañas de este tipo.</div>
          ) : (
            <div className="space-y-4 mt-4">
              {filteredCampaigns.map((c) => (
                <div key={c.id} className="p-4 border rounded flex justify-between items-center bg-gray-50">
                  <div>
                    <h3 className="font-medium text-gray-800">{c.name}</h3>
                    <p className="text-xs text-gray-500">Tipo: {c.type}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={c.status === "activa" ? "default" : "outline"}>{c.status}</Badge>
                    <Button variant="outline" size="sm">Ver</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* IA */}
        <TabsContent value="ia">
          {filteredCampaigns.length === 0 ? (
            <div className="text-sm text-gray-500">No hay campañas de este tipo.</div>
          ) : (
            <div className="space-y-4">
              {filteredCampaigns.map((c) => (
                <div key={c.id} className="p-4 border rounded flex justify-between items-center bg-gray-50">
                  <div>
                    <h3 className="font-medium text-gray-800">{c.name}</h3>
                    <p className="text-xs text-gray-500">Tipo: {c.type}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={c.status === "activa" ? "default" : "outline"}>{c.status}</Badge>
                    <Button variant="outline" size="sm">Ver</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Selecciona campaña" />
                </SelectTrigger>
                <SelectContent>
                  {mockCampaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={createWebhook}>Crear Webhook</Button>
            </div>
            <div className="space-y-2">
              {webhooks.length === 0 ? (
                <p className="text-sm text-gray-500">No se han creado webhooks aún.</p>
              ) : (
                webhooks.map((w, i) => (
                  <div key={i} className="p-4 border rounded bg-gray-50 space-y-1">
                    <p className="text-sm text-gray-800 font-medium">{w.campaign}</p>
                    <div className="flex items-center gap-2">
                      <Input value={w.url} readOnly className="w-full" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(w.url)}
                      >
                        Copiar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal: Sugerencia HubSpot o crear manual */}
      <Dialog open={showHubSpotModal} onOpenChange={setShowHubSpotModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear campaña masiva</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Recomendamos crear esta campaña desde HubSpot para mayor control.
          </p>
          <Button className="mt-4" onClick={() => {
            setShowHubSpotModal(false);
            setShowManualModal(true);
          }}>
            Crear desde esta app
          </Button>
        </DialogContent>
      </Dialog>

      {/* Modal: Crear campaña manual */}
      <Dialog open={showManualModal} onOpenChange={setShowManualModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Campaña WhatsApp</DialogTitle>
          </DialogHeader>
          <Label>Mensaje para enviar:</Label>
          <Textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe tu mensaje de WhatsApp"
          />

          <Label className="mt-4">Archivos adjuntos:</Label>
          <Input
            type="file"
            multiple
            accept="image/*,application/pdf,video/*"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
          <div className="grid grid-cols-2 gap-2 mt-2">
            {files.map((file, index) => (
              <div key={index} className="flex flex-col items-center border p-2 rounded bg-gray-50">
                {renderFilePreview(file)}
                <p className="text-xs mt-1">{file.name}</p>
              </div>
            ))}
          </div>

          <Label className="mt-4">Segmentación:</Label>
          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona segmentación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="ia">Asistida por IA</SelectItem>
              <SelectItem value="hubspot">Desde propiedades HubSpot</SelectItem>
              <SelectItem value="app">Desde propiedades de la app</SelectItem>
            </SelectContent>
          </Select>

          {audience === "ia" && (
            <div className="mt-2">
              <Label>Describe cómo segmentar con IA:</Label>
              <Textarea
                rows={2}
                value={iaDetails}
                onChange={(e) => setIaDetails(e.target.value)}
                placeholder="Ej: Clientes que abandonaron carrito en los últimos 7 días"
              />
            </div>
          )}

          <Label className="mt-4">Importar CSV/Excel:</Label>
          <Input
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
          />
          {csvFile && (
            <p className="text-xs text-gray-500 mt-1">Archivo cargado: {csvFile.name}</p>
          )}

          <DialogFooter className="mt-4">
            <Button onClick={simulateSend}>Simular envío</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
