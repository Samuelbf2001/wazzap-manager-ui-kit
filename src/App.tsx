import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PropertiesPage from "./components/PropertiesPage";
import FlowBuilderPage from "./pages/FlowBuilderPage";
import { LiveInboxPage } from "./pages/LiveInboxPage";
import { InboxTestPage } from "./pages/InboxTestPage";
import { HubSpotInboxMount } from "./components/HubSpotInboxWidget";
import { AIAgentManager } from "./components/AIAgentManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/propiedades" element={<PropertiesPage />} />
          <Route path="/constructor" element={<FlowBuilderPage />} />
          <Route path="/bandeja" element={<LiveInboxPage />} />
          <Route path="/bandeja/tests" element={<InboxTestPage />} />
          <Route path="/hubspot-inbox" element={<HubSpotInboxMount />} />
          <Route path="/agentes-ia" element={<AIAgentManager />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
