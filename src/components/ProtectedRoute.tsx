import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { hubspotApi, clearHubSpotAuth, getHubSpotAuth } from '@/lib/hubspotApi';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const auth = getHubSpotAuth();
        if (!auth?.token || !auth?.portalId) {
          setIsAuthenticated(false);
          return;
        }

        // Verificar con el backend que el token no expiró
        const result = await hubspotApi.verifyAuth(auth.token);
        if (result.authenticated) {
          setIsAuthenticated(true);
        } else {
          clearHubSpotAuth();
          setIsAuthenticated(false);
        }
      } catch {
        // Si el backend no responde, confiar en el token local
        const auth = getHubSpotAuth();
        setIsAuthenticated(!!(auth?.token && auth?.portalId));
      }
    };

    checkAuthentication();
  }, []);

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

  if (!isAuthenticated) {
    return <Navigate to="/oauth/login" replace />;
  }

  return <>{children}</>;
}