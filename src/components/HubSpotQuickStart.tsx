import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Settings, Phone, RotateCcw, Database, Webhook } from 'lucide-react';

interface QuickStartStep {
  id: number;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  action?: string;
}

export function HubSpotQuickStart() {
  const [steps, setSteps] = useState<QuickStartStep[]>([
    {
      id: 1,
      title: 'Configurar Conexión',
      description: 'Conecta tu cuenta de HubSpot con API Key y Portal ID',
      icon: Settings,
      completed: false,
      action: 'Ir a Configuración'
    },
    {
      id: 2,
      title: 'Configurar Custom Channels',
      description: 'Crea propiedades personalizadas de WhatsApp en HubSpot',
      icon: Phone,
      completed: false,
      action: 'Configurar Channels'
    },
    {
      id: 3,
      title: 'Activar Sincronización',
      description: 'Habilita la sincronización automática de contactos y deals',
      icon: RotateCcw,
      completed: false,
      action: 'Activar Sync'
    },
    {
      id: 4,
      title: 'Configurar Webhooks',
      description: 'Establece webhooks bidireccionales para tiempo real',
      icon: Webhook,
      completed: false,
      action: 'Configurar Webhooks'
    },
    {
      id: 5,
      title: 'Mapear Propiedades',
      description: 'Define cómo se mapean los campos entre WhatsApp y HubSpot',
      icon: Database,
      completed: false,
      action: 'Configurar Mapeo'
    }
  ]);

  const toggleStep = (stepId: number) => {
    setSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    );
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">🚀 Inicio Rápido HubSpot</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Configura tu integración completa HubSpot + WhatsApp en 5 simples pasos
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Badge variant="outline" className="px-3 py-1">
            {completedSteps} de {steps.length} completados
          </Badge>
          <Badge 
            variant={progress === 100 ? "default" : "secondary"}
            className="px-3 py-1"
          >
            {Math.round(progress)}% Completo
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-blue-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="grid gap-4">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          
          return (
            <Card 
              key={step.id}
              className={`transition-all duration-200 ${
                step.completed 
                  ? 'bg-green-50 border-green-200' 
                  : 'hover:shadow-md cursor-pointer'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      ${step.completed 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-blue-100 text-blue-600'
                      }
                    `}>
                      {step.completed ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <IconComponent className="w-6 h-6" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Paso {step.id}: {step.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {!step.completed && step.action && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleStep(step.id)}
                        className="flex items-center space-x-2"
                      >
                        <span>{step.action}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant={step.completed ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => toggleStep(step.id)}
                    >
                      {step.completed ? 'Completado ✓' : 'Marcar como completado'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion Message */}
      {progress === 100 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="text-6xl">🎉</div>
              <h2 className="text-2xl font-bold text-green-800">
                ¡Integración HubSpot Completa!
              </h2>
              <p className="text-green-700 max-w-md mx-auto">
                Tu integración HubSpot + WhatsApp está lista. Ahora puedes sincronizar contactos, 
                crear deals automáticamente y gestionar conversaciones en tiempo real.
              </p>
              <Button className="bg-green-600 hover:bg-green-700">
                Comenzar a Usar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center space-x-2 p-4 h-auto">
              <Settings className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Configuración</div>
                <div className="text-sm text-gray-500">API Keys y conexión</div>
              </div>
            </Button>
            
            <Button variant="outline" className="flex items-center space-x-2 p-4 h-auto">
              <RotateCcw className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Sincronizar Ahora</div>
                <div className="text-sm text-gray-500">Forzar sincronización</div>
              </div>
            </Button>
            
            <Button variant="outline" className="flex items-center space-x-2 p-4 h-auto">
              <Database className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Ver Propiedades</div>
                <div className="text-sm text-gray-500">Mapeo de campos</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}