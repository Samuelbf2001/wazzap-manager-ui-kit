import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthentication = () => {
      try {
        const stored = localStorage.getItem('authenticated_company');
        if (stored) {
          const company = JSON.parse(stored);
          // Verificar que la sesión tenga los datos necesarios
          if (company.id && company.name && company.email) {
            setIsAuthenticated(true);
            return;
          }
        }
        setIsAuthenticated(false);
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, []);

  // Mostrar loading mientras verifica
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Redirigir al login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/oauth/login" replace />;
  }

  // Renderizar contenido protegido
  return <>{children}</>;
} 