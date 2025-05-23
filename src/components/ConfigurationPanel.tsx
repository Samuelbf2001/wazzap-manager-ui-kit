
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ConfigurationPanel() {
  const [webhookUrl, setWebhookUrl] = useState("https://sitename.com/webhook");
  const [apiKey, setApiKey] = useState("••••••••••••••••••••");
  const [whitelabelUrl, setWhitelabelUrl] = useState("https://sitename.com");
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    // Handle save logic here
    console.log("Saving configuration...");
  };

  const handleRegenerateKey = () => {
    // Handle API key regeneration
    setApiKey("••••••••••••••••••••");
    console.log("Regenerating API key...");
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Configuración General</h2>
        <p className="text-gray-600">Ajusta la configuración general de tu cuenta de Wazzap.</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Webhook URL */}
        <div className="space-y-2">
          <Label htmlFor="webhook">URL de Webhook</Label>
          <Input
            id="webhook"
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://sitename.com/webhook"
          />
        </div>

        {/* API Key */}
        <div className="space-y-2">
          <Label htmlFor="apikey">API Key</Label>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                id="apikey"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="API Key"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? "Ocultar" : "Mostrar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleRegenerateKey}
            >
              Regenerar
            </Button>
          </div>
        </div>

        {/* Whitelabel URL */}
        <div className="space-y-2">
          <Label htmlFor="whitelabel">Enlace de Whitelabel</Label>
          <Input
            id="whitelabel"
            type="url"
            value={whitelabelUrl}
            onChange={(e) => setWhitelabelUrl(e.target.value)}
            placeholder="https://tu-dominio.com"
          />
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button 
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
}
