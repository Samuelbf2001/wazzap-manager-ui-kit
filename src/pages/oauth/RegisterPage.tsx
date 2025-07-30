import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { databaseService } from '@/services/database.service';
import { CreateCompanyRequest } from '@/types/database';
import { ArrowLeft, Building2, Mail, Phone, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<CreateCompanyRequest>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validaciones en tiempo real
  const validateField = (field: keyof CreateCompanyRequest, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'El nombre de la empresa es obligatorio';
        if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
        return undefined;
        
      case 'email':
        if (!value.trim()) return 'El correo electrónico es obligatorio';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Por favor ingresa un correo válido';
        return undefined;
        
      case 'phone':
        if (!value.trim()) return 'El número de teléfono es obligatorio';
        const phoneRegex = /^[+]?[\d\s\-\(\)]{8,}$/;
        if (!phoneRegex.test(value)) return 'Por favor ingresa un número de teléfono válido';
        return undefined;
        
      case 'password':
        if (!value) return 'La contraseña es obligatoria';
        if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
        }
        return undefined;
        
      case 'confirmPassword':
        if (!value) return 'Confirma tu contraseña';
        if (value !== formData.password) return 'Las contraseñas no coinciden';
        return undefined;
        
      default:
        return undefined;
    }
  };

  const handleInputChange = (field: keyof CreateCompanyRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validar el campo actual
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
    
    // Si estamos validando confirmPassword, también revisar si password cambió
    if (field === 'password' && formData.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    Object.keys(formData).forEach(key => {
      const field = key as keyof CreateCompanyRequest;
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
    
    try {
      const newCompany = await databaseService.createCompany(formData);
      
      toast({
        title: "¡Registro exitoso!",
        description: `Bienvenida ${newCompany.name}. Tu empresa ha sido registrada correctamente.`,
        variant: "default"
      });
      
      // Redirigir al inicio de sesión después del registro exitoso
      setTimeout(() => {
        navigate('/oauth/login');
      }, 2000);
      
    } catch (error) {
      console.error('Error en registro:', error);
      toast({
        title: "Error en el registro",
        description: error instanceof Error ? error.message : "Ha ocurrido un error inesperado",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const getFieldIcon = (field: keyof CreateCompanyRequest) => {
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
        <div className="w-full max-w-lg mx-auto">
          <Card className="w-full bg-white/90 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Registro de Empresa
            </CardTitle>
            <CardDescription className="text-gray-600">
              Crea tu cuenta empresarial para comenzar
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {/* Nombre de la empresa */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nombre de la empresa *
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ej: Mi Empresa S.L."
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`pr-10 ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                    autoComplete="off"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getFieldIcon('name')}
                  </div>
                </div>
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

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

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Número de teléfono *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+34 600 123 456"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`pl-10 pr-10 ${errors.phone ? 'border-red-500 focus:border-red-500' : ''}`}
                    autoComplete="off"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getFieldIcon('phone')}
                  </div>
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone}</p>
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
                    placeholder="Mínimo 8 caracteres"
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

              {/* Confirmar contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmar contraseña *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`pl-10 pr-20 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                    autoComplete="new-password"
                  />
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    {getFieldIcon('confirmPassword')}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Info de seguridad */}
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-sm text-blue-800">
                  Tu información está protegida con encriptación de grado empresarial.
                  Nunca compartiremos tus datos con terceros.
                </AlertDescription>
              </Alert>

              {/* Botón de envío */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando cuenta...
                  </>
                ) : (
                  'Crear cuenta empresarial'
                )}
              </Button>
            </form>

            {/* Link para iniciar sesión */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Button
                  variant="link"
                  onClick={() => navigate('/oauth/login')}
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
                >
                  Iniciar sesión
                </Button>
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