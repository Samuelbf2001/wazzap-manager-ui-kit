import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";
import PropertiesPage from "./components/PropertiesPage";
import FlowBuilderPage from "./pages/FlowBuilderPage";
import { LiveInboxPage } from "./pages/LiveInboxPage";
import { InboxTestPage } from "./pages/InboxTestPage";
import { HubSpotInboxMount } from "./components/HubSpotInboxWidget";
import { WhatsAppAIManager } from './components/WhatsAppAIManager';
import { AIResponseReviewDashboard } from './components/AIResponseReviewDashboard';
import { Layout } from './components/Layout';

// Nuevas páginas separadas
import RegistrosPage from './pages/RegistrosPage';
import MonitorConexionesPage from './pages/MonitorConexionesPage';
import CampanasPage from './pages/CampanasPage';
import DemoFlujosPage from './pages/DemoFlujosPage';
import SuscripcionPage from './pages/SuscripcionPage';
import HubSpotPage from './pages/HubSpotPage';
import MensajesPage from './pages/MensajesPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
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
          <Route path="/conexiones" element={<DashboardPage />} />
          
          {/* Páginas principales del sidebar */}
          <Route path="/registros" element={<Layout><RegistrosPage /></Layout>} />
          <Route path="/monitor-conexiones" element={<Layout><MonitorConexionesPage /></Layout>} />
          <Route path="/campanas" element={<Layout><CampanasPage /></Layout>} />
          <Route path="/demo-flujos" element={<Layout><DemoFlujosPage /></Layout>} />
          <Route path="/suscripcion" element={<Layout><SuscripcionPage /></Layout>} />
          <Route path="/hubspot" element={<Layout><HubSpotPage /></Layout>} />
          <Route path="/mensajes" element={<Layout><MensajesPage /></Layout>} />
          <Route path="/configuracion" element={<Layout><ConfiguracionPage /></Layout>} />
          
          {/* Páginas especiales */}
          <Route path="/propiedades" element={<Layout><PropertiesPage /></Layout>} />
          <Route path="/constructor" element={<Layout><FlowBuilderPage /></Layout>} />
          <Route path="/bandeja" element={<Layout><LiveInboxPage /></Layout>} />
          <Route path="/bandeja/tests" element={<InboxTestPage />} />
          <Route path="/hubspot-inbox" element={<HubSpotInboxMount />} />
          <Route path="/whatsapp-ai" element={<Layout><WhatsAppAIManager /></Layout>} />
          <Route path="/ai-review" element={<Layout><AIResponseReviewDashboard /></Layout>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
