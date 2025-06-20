import React, { useEffect, useState } from 'react';
import { HubSpotInboxWidget } from '@/components/HubSpotInboxWidget';

interface HubSpotContact {
  vid: number;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  properties?: any;
}

interface HubSpotDeal {
  dealId: number;
  dealname?: string;
  amount?: number;
  dealstage?: string;
  properties?: any;
}

interface HubSpotCompany {
  companyId: number;
  name?: string;
  domain?: string;
  properties?: any;
}

export function WhatsAppInboxExtension() {
  const [contact, setContact] = useState<HubSpotContact | null>(null);
  const [deal, setDeal] = useState<HubSpotDeal | null>(null);
  const [company, setCompany] = useState<HubSpotCompany | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeHubSpotContext = async () => {
      try {
        // Verificar si estamos en el contexto de HubSpot
        if (typeof window !== 'undefined' && window.parent !== window) {
          // Solicitar contexto de HubSpot
          window.parent.postMessage({
            type: 'GET_HUBSPOT_CONTEXT',
            source: 'whatsapp-inbox'
          }, '*');

          // Escuchar respuesta de HubSpot
          const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'HUBSPOT_CONTEXT_RESPONSE') {
              const { contact: hsContact, deal: hsDeal, company: hsCompany } = event.data.payload;
              
              if (hsContact) setContact(hsContact);
              if (hsDeal) setDeal(hsDeal);
              if (hsCompany) setCompany(hsCompany);
              
              setIsLoading(false);
            }
          };

          window.addEventListener('message', handleMessage);

          // Timeout para evitar espera infinita
          setTimeout(() => {
            setIsLoading(false);
            setError('No se pudo obtener el contexto de HubSpot');
          }, 5000);

          return () => {
            window.removeEventListener('message', handleMessage);
          };
        } else {
          // No estamos en iframe, usar datos mock para desarrollo
          setContact({
            vid: 12345,
            email: 'test@ejemplo.com',
            phone: '+1234567890',
            firstName: 'María',
            lastName: 'García'
          });
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error inicializando contexto de HubSpot:', err);
        setError('Error de inicialización');
        setIsLoading(false);
      }
    };

    initializeHubSpotContext();
  }, []);

  // Función para buscar número de WhatsApp en propiedades del contacto
  const getWhatsAppNumber = () => {
    if (!contact) return undefined;
    
    // Buscar en diferentes propiedades comunes
    const phoneFields = [
      contact.phone,
      contact.properties?.phone,
      contact.properties?.mobilephone,
      contact.properties?.whatsapp_number,
      contact.properties?.hs_whatsapp_phone_number
    ];

    return phoneFields.find(phone => phone && phone.trim() !== '');
  };

  // Función para enviar eventos de vuelta a HubSpot
  const notifyHubSpot = (eventType: string, data: any) => {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'WHATSAPP_INBOX_EVENT',
        eventType,
        data,
        context: {
          contactId: contact?.vid,
          dealId: deal?.dealId,
          companyId: company?.companyId
        }
      }, '*');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Cargando Bandeja de WhatsApp</h3>
          <p className="text-sm text-gray-500">Conectando con el sistema de conversaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error de Conexión</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white">
      {/* Header con información del contexto */}
      <div className="border-b bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              💬 Conversaciones de WhatsApp
            </h2>
            {contact && (
              <p className="text-sm text-gray-600 mt-1">
                {contact.firstName} {contact.lastName} 
                {getWhatsAppNumber() && ` • ${getWhatsAppNumber()}`}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {contact && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                📱 Contacto
              </span>
            )}
            {deal && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                💼 Deal: {deal.dealname || `#${deal.dealId}`}
              </span>
            )}
            {company && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                🏢 {company.name || `#${company.companyId}`}
              </span>
            )}
          </div>
        </div>

        {/* Información adicional del contexto */}
        {(contact || deal || company) && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {contact && (
              <div className="bg-white p-2 rounded border">
                <div className="font-medium text-gray-900">Contacto</div>
                <div className="text-gray-600">ID: {contact.vid}</div>
                {contact.email && <div className="text-gray-600">Email: {contact.email}</div>}
                {getWhatsAppNumber() && <div className="text-gray-600">WhatsApp: {getWhatsAppNumber()}</div>}
              </div>
            )}
            
            {deal && (
              <div className="bg-white p-2 rounded border">
                <div className="font-medium text-gray-900">Deal</div>
                <div className="text-gray-600">ID: {deal.dealId}</div>
                {deal.dealname && <div className="text-gray-600">Nombre: {deal.dealname}</div>}
                {deal.amount && <div className="text-gray-600">Valor: ${deal.amount}</div>}
              </div>
            )}
            
            {company && (
              <div className="bg-white p-2 rounded border">
                <div className="font-medium text-gray-900">Empresa</div>
                <div className="text-gray-600">ID: {company.companyId}</div>
                {company.name && <div className="text-gray-600">Nombre: {company.name}</div>}
                {company.domain && <div className="text-gray-600">Dominio: {company.domain}</div>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Widget de la bandeja de entrada */}
      <div style={{ height: 'calc(100vh - 200px)' }}>
        <HubSpotInboxWidget
          contactId={contact?.vid?.toString()}
          dealId={deal?.dealId?.toString()}
          companyId={company?.companyId?.toString()}
          height="100%"
          width="100%"
        />
      </div>

      {/* Footer con información adicional */}
      <div className="border-t bg-gray-50 p-2 text-xs text-gray-500 text-center">
        🔗 Integración WhatsApp • Sincronizado con HubSpot • 
        <span className="text-green-600 font-medium"> Conectado</span>
      </div>
    </div>
  );
}

export default WhatsAppInboxExtension; 