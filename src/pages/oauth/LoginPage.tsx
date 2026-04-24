import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, LogIn, Settings, ChevronDown } from 'lucide-react';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'https://whatsfull.sixteam.pro';

export default function LoginPage() {
  const navigate = useNavigate();
  const guideRef = useRef<HTMLDivElement>(null);

  const handleInstall = () => {
    window.location.href = `${BACKEND_URL}/auth/login`;
  };

  const handleLoginGuide = () => {
    guideRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        <div className="w-full max-w-md mx-auto space-y-4">
          <Card className="w-full bg-white/90 backdrop-blur-sm shadow-2xl border-0">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100">
                <svg viewBox="0 0 512 512" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M323.3 193.9v-52.2a38.4 38.4 0 0 0 22.1-34.7V106a38.4 38.4 0 0 0-38.3-38.4h-1a38.4 38.4 0 0 0-38.3 38.4v1a38.4 38.4 0 0 0 22.1 34.7v52.2a108.7 108.7 0 0 0-51.7 22.8L96.6 124.3a43.2 43.2 0 1 0-21.1 26.3l139.5 88.7a109.4 109.4 0 0 0 0 92.3L76.4 420.1a43.2 43.2 0 1 0 21.4 26l139.9-88.7a108.8 108.8 0 0 0 165.6-92.1c0-33.8-15.4-64-39.5-83.4Zm-17.2 149.8a65.6 65.6 0 1 1 0-131.3 65.6 65.6 0 0 1 0 131.3Z" fill="#FF7A59"/>
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Acceder a WhatsFull
              </CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                Conecta tu portal de HubSpot o accede desde tu cuenta existente
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              {/* Botón instalación / primera vez */}
              <Button
                onClick={handleInstall}
                className="w-full bg-[#FF7A59] hover:bg-[#e8674a] text-white py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Instalar en HubSpot
              </Button>
              <p className="text-xs text-center text-gray-400">
                Primera vez · Conecta tu portal de HubSpot y autoriza el acceso.
              </p>

              <div className="relative flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">ya tienes la app instalada?</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Botón ya instalado — guía */}
              <Button
                onClick={handleLoginGuide}
                variant="outline"
                className="w-full py-6 text-base font-semibold rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200"
              >
                <LogIn className="h-5 w-5 mr-2 text-gray-500" />
                Iniciar sesión
                <ChevronDown className="h-4 w-4 ml-auto text-gray-400" />
              </Button>
              <p className="text-xs text-center text-gray-400">
                Accede desde los ajustes de tu portal de HubSpot.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Guía de acceso desde HubSpot */}
      <section
        ref={guideRef}
        className="w-full max-w-2xl mx-auto px-6 pb-16"
      >
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Settings className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-base">Cómo acceder desde HubSpot</h2>
                <p className="text-gray-400 text-xs mt-0.5">Sigue estos pasos para abrir WhatsFull desde tu portal</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Paso 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-sm font-bold text-orange-600">1</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Abre los Ajustes de HubSpot</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Haz click en el ícono de engranaje <span className="inline-block bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded font-mono">⚙</span> en la barra superior de tu portal.
                </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-sm font-bold text-orange-600">2</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Ve a Integraciones → Apps conectadas</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  En el menú lateral izquierdo selecciona <span className="font-medium text-gray-700">Integraciones</span> → <span className="font-medium text-gray-700">Apps conectadas</span>.
                </p>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-sm font-bold text-orange-600">3</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Busca WhatsFull y haz click en "Abrir"</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Encuentra <span className="font-medium text-gray-700">WhatsFull</span> en la lista de apps instaladas y haz click en el botón de configuración o "Abrir". Esto te redirigirá automáticamente al dashboard con tu sesión iniciada.
                </p>
              </div>
            </div>

            {/* Separador + tip */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex gap-2 items-start bg-blue-50 rounded-xl p-4">
                <span className="text-blue-500 text-base mt-0.5">💡</span>
                <p className="text-xs text-blue-700 leading-relaxed">
                  <span className="font-semibold">¿No ves WhatsFull en apps conectadas?</span> Usa el botón <span className="font-semibold">"Instalar en HubSpot"</span> de arriba para autorizar la app por primera vez en tu portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full p-6 text-center text-gray-400 text-xs">
        © 2024 WhatsFull · Integración WhatsApp Business + HubSpot
      </footer>
    </div>
  );
}
