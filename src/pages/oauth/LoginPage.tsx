import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { databaseService } from '@/services/database.service';
import { LoginRequest } from '@/types/database';
import { ArrowLeft, LogIn, Mail, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

interface FormErrors {
  email?: string;
  password?: string;
  credentials?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validaciones en tiempo real
  const validateField = (field: keyof LoginRequest, value: string): string | undefined => {
    switch (field) {
      case 'email':
        if (!value.trim()) return 'El correo electrónico es obligatorio';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Por favor ingresa un correo válido';
        return undefined;
        
      case 'password':
        if (!value) return 'La contraseña es obligatoria';
        return undefined;
        
      default:
        return undefined;
    }
  };

  const handleInputChange = (field: keyof LoginRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar errores al escribir
    const error = validateField(field, value);
    setErrors(prev => ({ 
      ...prev, 
      [field]: error,
      credentials: undefined // Limpiar error de credenciales al escribir
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    Object.keys(formData).forEach(key => {
      const field = key as keyof LoginRequest;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Error en el formulario",
        description: "Por favor corrige los errores antes de continuar",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setErrors(prev => ({ ...prev, credentials: undefined }));
    
    try {
      const authenticatedCompany = await databaseService.authenticateCompany(
        formData.email, 
        formData.password
      );
      
      if (!authenticatedCompany) {
        setErrors(prev => ({ 
          ...prev, 
          credentials: 'Correo electrónico o contraseña incorrectos' 
        }));
        toast({
          title: "Error de autenticación",
          description: "Las credenciales proporcionadas no son válidas",
          variant: "destructive"
        });
        return;
      }
      
      // Guardar sesión (en localStorage por simplicidad)
      localStorage.setItem('authenticated_company', JSON.stringify({
        id: authenticatedCompany.id,
        name: authenticatedCompany.name,
        email: authenticatedCompany.email,
        loginTime: new Date().toISOString()
      }));
      
      toast({
        title: "¡Bienvenido!",
        description: `Hola ${authenticatedCompany.name}, has iniciado sesión correctamente.`,
        variant: "default"
      });
      
      // Redirigir al dashboard
      setTimeout(() => {
        navigate('/dashboard/conexiones');
      }, 1500);
      
    } catch (error) {
      console.error('Error en inicio de sesión:', error);
      toast({
        title: "Error del sistema",
        description: "Ha ocurrido un error inesperado. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleGoToRegister = () => {
    navigate('/oauth/register');
  };

  const getFieldIcon = (field: keyof LoginRequest) => {
    const hasError = errors[field];
    const hasValue = formData[field].trim().length > 0;
    const isValid = hasValue && !hasError;
    
    if (hasError) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else if (isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
      {/* Header */}
      <header className="w-full p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToHome}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </div>
          <div className="text-2xl font-bold text-gray-900">WhatsFull</div>
          <div className="text-sm text-gray-600">v2.0.0</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md mx-auto">
          <Card className="w-full bg-white/90 backdrop-blur-sm shadow-2xl border-0">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <LogIn className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Iniciar Sesión
              </CardTitle>
              <CardDescription className="text-gray-600">
                Accede a tu cuenta empresarial
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                {/* Error de credenciales */}
                {errors.credentials && (
                  <Alert className="bg-red-50 border-red-200">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-sm text-red-800">
                      {errors.credentials}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Correo electrónico *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="contacto@miempresa.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`pl-10 pr-10 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                      autoComplete="off"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getFieldIcon('email')}
                    </div>
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Contraseña *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tu contraseña"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`pl-10 pr-20 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                      autoComplete="new-password"
                    />
                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                      {getFieldIcon('password')}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Botón de envío */}
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Iniciar sesión
                    </>
                  )}
                </Button>
              </form>

              {/* Link para registro */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  ¿No tienes una cuenta?{' '}
                  <Button
                    variant="link"
                    onClick={handleGoToRegister}
                    className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
                  >
                    Registrate aquí
                  </Button>
                </p>
              </div>

              {/* Info adicional */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  ¿Olvidaste tu contraseña?{' '}
                  <span className="text-blue-600 cursor-pointer hover:underline">
                    Contáctanos
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
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