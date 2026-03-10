import { useState, useEffect } from 'react';
import { systemMessages } from '@/config/messages';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type MessageType = 'connectionLost' | 'connectionRestored' | 'connectionError';
type Language = 'es' | 'en' | 'pt';

export function MessageManager() {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<MessageType>('connectionLost');
  const [selectedLang, setSelectedLang] = useState<Language>('es');
  const [customMessage, setCustomMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!customMessage.trim()) {
      toast({
        title: "Error",
        description: "El mensaje no puede estar vacío.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Guardar en localStorage por ahora
      const storageKey = `message_${selectedType}_${selectedLang}`;
      localStorage.setItem(storageKey, customMessage);
      
      console.log(`Mensaje guardado: ${storageKey} = ${customMessage}`);
      
      toast({
        title: "Mensaje guardado",
        description: "El mensaje personalizado ha sido guardado correctamente.",
      });
    } catch (error) {
      console.error('Error saving message:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el mensaje personalizado.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    try {
      const defaultMessage = systemMessages[selectedType]?.custom?.[selectedLang] || '';
      setCustomMessage(defaultMessage);
      
      toast({
        title: "Mensaje restaurado",
        description: "Se ha restaurado el mensaje original.",
      });
    } catch (error) {
      console.error('Error resetting message:', error);
      toast({
        title: "Error",
        description: "No se pudo restaurar el mensaje original.",
        variant: "destructive"
      });
    }
  };

  const getCurrentMessage = () => {
    try {
      const storageKey = `message_${selectedType}_${selectedLang}`;
      const savedMessage = localStorage.getItem(storageKey);
      return savedMessage || systemMessages[selectedType]?.custom?.[selectedLang] || '';
    } catch (error) {
      console.error('Error getting current message:', error);
      return systemMessages[selectedType]?.custom?.[selectedLang] || '';
    }
  };

  // Actualizar el mensaje cuando cambie el tipo o idioma
  useEffect(() => {
    const message = getCurrentMessage();
    setCustomMessage(message);
  }, [selectedType, selectedLang]);

  // Cargar mensaje inicial
  useEffect(() => {
    const message = getCurrentMessage();
    setCustomMessage(message);
  }, []);

  const getPreviewMessage = () => {
    try {
      return customMessage.replace('{reconnectUrl}', 'https://ejemplo.com/reconectar');
    } catch (error) {
      console.error('Error generating preview:', error);
      return customMessage;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Gestión de Mensajes del Sistema</h2>
        <p className="text-sm text-gray-600">
          Personaliza los mensajes que se envían automáticamente cuando ocurren eventos en el sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="messageType">Tipo de Mensaje</Label>
          <Select
            value={selectedType}
            onValueChange={(value: MessageType) => {
              setSelectedType(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un tipo de mensaje" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="connectionLost">Conexión Perdida</SelectItem>
              <SelectItem value="connectionRestored">Conexión Restaurada</SelectItem>
              <SelectItem value="connectionError">Error de Conexión</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Idioma</Label>
          <Select
            value={selectedLang}
            onValueChange={(value: Language) => {
              setSelectedLang(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customMessage">Mensaje Personalizado</Label>
        <div className="space-y-2">
          <textarea
            id="customMessage"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Escribe tu mensaje personalizado..."
            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500">
            Variables disponibles: <code className="bg-gray-100 px-1 rounded">{'{reconnectUrl}'}</code> - URL para reconectar
          </p>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button 
          onClick={handleSave} 
          className="bg-green-600 hover:bg-green-700"
          disabled={isLoading || !customMessage.trim()}
        >
          {isLoading ? 'Guardando...' : 'Guardar Mensaje'}
        </Button>
        <Button 
          onClick={handleReset} 
          variant="outline"
          disabled={isLoading}
        >
          Restaurar Mensaje Original
        </Button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Vista Previa</h3>
        <div className="bg-white p-3 rounded border">
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {getPreviewMessage()}
          </p>
        </div>
      </div>
    </div>
  );
} 