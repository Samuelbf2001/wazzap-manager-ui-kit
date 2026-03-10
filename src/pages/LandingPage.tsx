import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Zap, Users, BarChart3, LogIn, UserPlus, ArrowRight, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { databaseService } from '@/services/database.service';
import { useToast } from '@/hooks/use-toast';

export default function LandingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasActiveSession, setHasActiveSession] = useState(false);

  useEffect(() => {
    // Verificar si hay una sesión activa
    const checkSession = () => {
      try {
        const stored = localStorage.getItem('authenticated_company');
        if (stored) {
          const company = JSON.parse(stored);
          setHasActiveSession(company.id && company.name && company.email);
        }
      } catch (error) {
        setHasActiveSession(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = () => {
    navigate('/oauth/login');
  };

  const handleRegister = () => {
    navigate('/oauth/register');
  };

  const handleDirectAccess = () => {
    if (hasActiveSession) {
      navigate('/dashboard/conexiones');
    } else {
      navigate('/oauth/login');
    }
  };

  const handleDemoAccess = async () => {
    try {
      // Intentar autenticación automática con usuario demo
      const authenticatedCompany = await databaseService.authenticateCompany(
        'admin@demo.com',
        '123456'
      );

      if (authenticatedCompany) {
        // Guardar sesión
        localStorage.setItem('authenticated_company', JSON.stringify({
          id: authenticatedCompany.id,
          name: authenticatedCompany.name,
          email: authenticatedCompany.email,
          loginTime: new Date().toISOString()
        }));

        toast({
          title: "¡Acceso demo activado!",
          description: `Bienvenido ${authenticatedCompany.name}, accediendo al dashboard...`,
          variant: "default"
        });

        // Redirigir al dashboard
        setTimeout(() => {
          navigate('/dashboard/conexiones');
        }, 1500);
      } else {
        toast({
          title: "Error en acceso demo",
          description: "No se pudo acceder con las credenciales de demostración",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error en acceso demo:', error);
      toast({
        title: "Error del sistema",
        description: "Ha ocurrido un error inesperado. Intenta nuevamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
      {/* Header */}
      <header className="w-full p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-900">WhatsFull</div>
          <div className="text-sm text-gray-600">v2.0.0</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo/Title Section */}
          <div className="mb-12">
            <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-6">
              WhatsFull
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-4">
              Sub-Cuenta WhatsApp Manager
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Administra tus conexiones de WhatsApp, automatiza conversaciones con IA 
              y gestiona campañas desde una sola plataforma.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
              <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Conexiones</h3>
              <p className="text-sm text-gray-600">Gestiona múltiples números de WhatsApp</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
              <Zap className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Automatización</h3>
              <p className="text-sm text-gray-600">Flujos inteligentes con IA</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">CRM Integrado</h3>
              <p className="text-sm text-gray-600">Sincronización con HubSpot</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
              <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-sm text-gray-600">Métricas en tiempo real</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-6">
            {/* Botón principal de acceso directo */}
            <div className="flex justify-center">
              <Button 
                onClick={handleDirectAccess}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-xl font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                <ArrowRight className="w-6 h-6 mr-3" />
                {hasActiveSession ? 'Ir al Dashboard' : 'Acceder a la Aplicación'}
              </Button>
            </div>
            
            {/* Botón demo */}
            <div className="flex justify-center">
              <Button 
                onClick={handleDemoAccess}
                size="lg"
                variant="outline"
                className="border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Play className="w-5 h-5 mr-2" />
                Acceso Demo Instantáneo
              </Button>
            </div>

            {/* Separador */}
            <div className="flex items-center justify-center space-x-4 my-6">
              <div className="h-px bg-gray-300 flex-1"></div>
              <span className="text-gray-500 text-sm">o accede con tu cuenta</span>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>

            {/* Botones de login y registro */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleLogin}
                size="lg"
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 w-full sm:w-auto"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Iniciar sesión
              </Button>
              <Button 
                onClick={handleRegister}
                size="lg"
                variant="outline"
                className="border-gray-400 text-gray-600 hover:bg-gray-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 w-full sm:w-auto"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Registro
              </Button>
            </div>
            
            <div className="space-y-2 text-sm text-gray-500">
              <p>Accede al panel de administración</p>
              <p className="text-xs">
                <strong>Demo:</strong> admin@demo.com | <strong>Contraseña:</strong> 123456
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full p-6 text-center text-gray-500 text-sm">
        <div className="max-w-7xl mx-auto">
          © 2024 WhatsFull. Sistema de gestión WhatsApp empresarial.
        </div>
      </footer>
    </div>
  );
} 