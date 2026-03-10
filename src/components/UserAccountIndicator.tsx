import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Building2, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuthenticatedCompany {
  id: string;
  name: string;
  email: string;
  loginTime: string;
}

export function UserAccountIndicator() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentCompany, setCurrentCompany] = useState<AuthenticatedCompany | null>(null);

  useEffect(() => {
    // Cargar información de la empresa autenticada
    const loadCurrentCompany = () => {
      try {
        const stored = localStorage.getItem('authenticated_company');
        if (stored) {
          const company = JSON.parse(stored);
          setCurrentCompany(company);
        }
      } catch (error) {
        console.error('Error cargando información de empresa:', error);
      }
    };

    loadCurrentCompany();
  }, []);

  const handleLogout = () => {
    try {
      // Limpiar sesión
      localStorage.removeItem('authenticated_company');
      
      // Limpiar otros datos específicos de la sesión si es necesario
      // localStorage.removeItem('user_preferences');
      
      toast({
        title: "Sesión cerrada",
        description: `Hasta luego, ${currentCompany?.name}`,
        variant: "default"
      });

      // Redirigir a la landing page
      setTimeout(() => {
        navigate('/');
      }, 1000);
      
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive"
      });
    }
  };

  // Si no hay empresa autenticada, no mostrar nada
  if (!currentCompany) {
    return null;
  }

  // Generar iniciales del nombre de la empresa
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Información de la empresa */}
      <div className="hidden md:flex flex-col items-end">
        <span className="text-sm font-medium text-gray-900">
          {currentCompany.name}
        </span>
        <span className="text-xs text-gray-500">
          {currentCompany.email}
        </span>
      </div>

      {/* Dropdown del usuario */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="relative h-10 w-auto px-2 py-1 hover:bg-gray-100"
          >
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/default-company-avatar.png" />
                <AvatarFallback className="bg-blue-500 text-white text-xs">
                  {getInitials(currentCompany.name)}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-64" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <p className="text-sm font-medium leading-none">
                  {currentCompany.name}
                </p>
              </div>
              <p className="text-xs leading-none text-muted-foreground">
                {currentCompany.email}
              </p>
              <Badge variant="secondary" className="w-fit text-xs mt-1">
                Sesión activa
              </Badge>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Perfil de empresa</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleLogout}
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 