/**
 * Página de callback del flujo OAuth/login de HubSpot.
 *
 * El backend redirige aquí después de autenticar:
 *   https://whatsfull.sixteam.pro/dashboard?token=<JWT>&portalId=<hubId>
 *
 * Esta página:
 *  1. Lee token y portalId de los query params
 *  2. Los guarda en localStorage (hubspot_auth)
 *  3. Redirige al dashboard de registros
 */
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { saveHubSpotAuth } from '@/lib/hubspotApi';

export default function HubSpotCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const portalId = searchParams.get('portalId');

    if (token && portalId) {
      saveHubSpotAuth(token, portalId);
      navigate('/dashboard/registros', { replace: true });
    } else {
      // Sin token — ir al login
      navigate('/oauth/login', { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
        <p className="text-gray-600">Autenticando con HubSpot...</p>
      </div>
    </div>
  );
}
