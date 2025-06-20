import React, { useEffect, useState } from 'react';
import { LiveInbox } from './LiveInbox';
import { ConversationFilters } from '@/types/conversation';

interface HubSpotInboxWidgetProps {
  contactId?: string;
  dealId?: string;
  companyId?: string;
  agentId?: string;
  height?: string;
  width?: string;
}

export function HubSpotInboxWidget({
  contactId,
  dealId,
  companyId,
  agentId,
  height = '600px',
  width = '100%'
}: HubSpotInboxWidgetProps) {
  const [isReady, setIsReady] = useState(false);
  const [hubspotContext, setHubspotContext] = useState<any>(null);

  useEffect(() => {
    // Detectar si estamos en el contexto de HubSpot
    const detectHubSpotContext = () => {
      try {
        // Intentar acceder al API de HubSpot si está disponible
        if (window.parent !== window) {
          // Estamos en un iframe
          window.parent.postMessage({
            type: 'WAZZAP_INBOX_READY',
            payload: { contactId, dealId, companyId }
          }, '*');
        }

        // Escuchar mensajes de HubSpot
        const handleMessage = (event: MessageEvent) => {
          if (event.data?.type === 'HUBSPOT_CONTEXT') {
            setHubspotContext(event.data.payload);
          }
        };

        window.addEventListener('message', handleMessage);
        setIsReady(true);

        return () => {
          window.removeEventListener('message', handleMessage);
        };
      } catch (error) {
        console.error('Error detecting HubSpot context:', error);
        setIsReady(true); // Continuar de todos modos
      }
    };

    detectHubSpotContext();
  }, [contactId, dealId, companyId]);

  // Configurar filtros basados en el contexto de HubSpot
  const getInitialFilters = (): ConversationFilters => {
    const filters: ConversationFilters = {};

    if (contactId) {
      // Si tenemos un contactId, mostrar solo conversaciones de ese contacto
      filters.searchQuery = contactId;
    }

    if (dealId && hubspotContext?.deal) {
      // Filtrar por deal específico si está disponible
      filters.tags = [`deal:${dealId}`];
    }

    if (companyId && hubspotContext?.company) {
      // Filtrar por company específico si está disponible
      filters.tags = [...(filters.tags || []), `company:${companyId}`];
    }

    return filters;
  };

  // Funciones para comunicarse con HubSpot
  const notifyHubSpot = (event: string, data: any) => {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'WAZZAP_INBOX_EVENT',
        event,
        payload: data,
        context: { contactId, dealId, companyId }
      }, '*');
    }
  };

  // Configuración específica para HubSpot
  const hubspotConfig = {
    // Ocultar elementos que no son necesarios en el contexto de HubSpot
    hideHeader: true,
    hideAgentPanel: true,
    compactMode: true,
    // Callbacks para notificar a HubSpot sobre eventos importantes
    onConversationStart: (conversation: any) => {
      notifyHubSpot('conversation_started', { conversation });
    },
    onMessageSent: (message: any) => {
      notifyHubSpot('message_sent', { message });
    },
    onConversationResolved: (conversation: any) => {
      notifyHubSpot('conversation_resolved', { conversation });
    }
  };

  if (!isReady) {
    return (
      <div 
        style={{ height, width }}
        className="flex items-center justify-center bg-gray-50 rounded-lg"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Cargando bandeja de entrada...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height, width }} className="rounded-lg overflow-hidden border">
      {/* Header específico para HubSpot */}
      <div className="bg-white border-b p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">Conversaciones de WhatsApp</h3>
          {hubspotContext?.contact && (
            <div className="text-xs text-gray-500">
              Contacto: {hubspotContext.contact.name || 'Sin nombre'}
            </div>
          )}
        </div>
        
        {/* Indicadores de contexto */}
        <div className="flex items-center space-x-2 mt-2">
          {contactId && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              📱 Contacto vinculado
            </span>
          )}
          {dealId && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              💼 Deal vinculado
            </span>
          )}
          {companyId && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              🏢 Empresa vinculada
            </span>
          )}
        </div>
      </div>

      {/* Bandeja de entrada */}
      <div style={{ height: `calc(${height} - 80px)` }}>
        <LiveInbox
          isIframe={true}
          agentId={agentId}
          hubspotContactId={contactId}
          initialFilters={getInitialFilters()}
        />
      </div>
    </div>
  );
}

// Exportar también una versión que se puede montar directamente
export function HubSpotInboxMount() {
  const [config, setConfig] = useState<HubSpotInboxWidgetProps>({});

  useEffect(() => {
    // Obtener configuración de la URL o de los parámetros del iframe
    const urlParams = new URLSearchParams(window.location.search);
    const newConfig: HubSpotInboxWidgetProps = {
      contactId: urlParams.get('contactId') || undefined,
      dealId: urlParams.get('dealId') || undefined,
      companyId: urlParams.get('companyId') || undefined,
      agentId: urlParams.get('agentId') || undefined,
      height: urlParams.get('height') || '600px',
      width: urlParams.get('width') || '100%'
    };
    
    setConfig(newConfig);
  }, []);

  return <HubSpotInboxWidget {...config} />;
} 