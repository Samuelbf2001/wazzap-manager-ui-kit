import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";

import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Nuevas páginas separadas
import RegistrosPage from './pages/RegistrosPage';
import MonitorConexionesPage from './pages/MonitorConexionesPage';

import ConfiguracionPage from './pages/ConfiguracionPage';
import RegisterPage from './pages/oauth/RegisterPage';
import LoginPage from './pages/oauth/LoginPage';
import { connectionMonitorService } from './services/connection-monitor.service';

// 🚀 INICIALIZAR SERVICIOS AL CARGAR LA APLICACIÓN
console.log('🚀 Inicializando servicios de la aplicación...');
console.log('✅ ConnectionMonitorService inicializado:', !!connectionMonitorService);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/oauth/register" element={<RegisterPage />} />
          <Route path="/oauth/login" element={<LoginPage />} />
          
          {/* Rutas protegidas del dashboard */}
          <Route path="/dashboard/conexiones" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          {/* Páginas principales del sidebar */}
          <Route path="/dashboard/registros" element={
            <ProtectedRoute>
              <Layout><RegistrosPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/monitor-conexiones" element={
            <ProtectedRoute>
              <Layout><MonitorConexionesPage /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/dashboard/configuracion" element={
            <ProtectedRoute>
              <Layout><ConfiguracionPage /></Layout>
            </ProtectedRoute>
          } />
          

          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
