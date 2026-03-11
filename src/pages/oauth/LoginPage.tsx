import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'https://whatsapphub.cloud';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleHubSpotLogin = () => {
    // Redirige al backend, que gestiona OAuth con HubSpot
    window.location.href = `${BACKEND_URL}/auth/login`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
      {/* Header */}
      <header className="w-full p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>
          <div className="text-2xl font-bold text-gray-900">WhatsFull</div>
          <div className="text-sm text-gray-600">v2.0.0</div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md mx-auto">
          <Card className="w-full bg-white/90 backdrop-blur-sm shadow-2xl border-0">
            <CardHeader className="text-center pb-2">
              {/* HubSpot logo */}
              <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100">
                <svg viewBox="0 0 512 512" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M323.3 193.9v-52.2a38.4 38.4 0 0 0 22.1-34.7V106a38.4 38.4 0 0 0-38.3-38.4h-1a38.4 38.4 0 0 0-38.3 38.4v1a38.4 38.4 0 0 0 22.1 34.7v52.2a108.7 108.7 0 0 0-51.7 22.8L96.6 124.3a43.2 43.2 0 1 0-21.1 26.3l139.5 88.7a109.4 109.4 0 0 0 0 92.3L76.4 420.1a43.2 43.2 0 1 0 21.4 26l139.9-88.7a108.8 108.8 0 0 0 165.6-92.1c0-33.8-15.4-64-39.5-83.4Zm-17.2 149.8a65.6 65.6 0 1 1 0-131.3 65.6 65.6 0 0 1 0 131.3Z" fill="#FF7A59"/>
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Acceder a WhatsFull
              </CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                Usa tu cuenta de HubSpot para iniciar sesión
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              <Button
                onClick={handleHubSpotLogin}
                className="w-full bg-[#FF7A59] hover:bg-[#e8674a] text-white py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Entrar con HubSpot
              </Button>

              <p className="text-xs text-center text-gray-400">
                Al iniciar sesión autorizas a WhatsFull a acceder a tu portal de HubSpot
                para sincronizar conversaciones de WhatsApp.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="w-full p-6 text-center text-gray-400 text-xs">
        © 2024 WhatsFull · Integración WhatsApp Business + HubSpot
      </footer>
    </div>
  );
}
