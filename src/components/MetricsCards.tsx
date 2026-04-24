import { useState, useEffect, memo } from 'react';
import { hubspotApi, getHubSpotAuth } from '@/lib/hubspotApi';

// Hook personalizado para obtener configuración del plan
const useSubscriptionConfig = () => {
  const [config, setConfig] = useState({
    whatsAppLimit: 10, // Límite por defecto
    currentPlan: 'Pro'
  });

  useEffect(() => {
    // Cargar configuración inicial
    const loadConfig = () => {
      const savedConfig = localStorage.getItem('subscription_config');
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          setConfig(parsed);
        } catch (error) {
          console.error('Error parsing subscription config:', error);
        }
      }
    };

    // Cargar configuración inicial
    loadConfig();

    // Escuchar cambios desde el panel de suscripción
    const handleConfigUpdate = (event: CustomEvent) => {
      setConfig(event.detail);
      console.log('📊 MetricsCards: Configuración actualizada:', event.detail);
    };

    // Agregar listener para eventos personalizados
    window.addEventListener('subscription-config-updated', handleConfigUpdate as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('subscription-config-updated', handleConfigUpdate as EventListener);
    };
  }, []);

  return config;
};

export const MetricsCards = memo(function MetricsCards() {
  const [connectionStats, setConnectionStats] = useState({
    total: 0,
    connected: 0,
    active: 0,
    pending: 0,
    inactive: 0
  });
  const [messageStats, setMessageStats] = useState<{ outgoing: string; last24h: string } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const subscriptionConfig = useSubscriptionConfig();

  useEffect(() => {
    const auth = getHubSpotAuth();
    if (!auth) return;

    const loadAll = async () => {
      try {
        const [connsRes, summaryRes] = await Promise.all([
          hubspotApi.getConnections(),
          hubspotApi.getLogsSummary()
        ]);

        const conns = connsRes.connections;
        setConnectionStats({
          total: conns.length,
          connected: conns.filter(c => c.connected).length,
          active: conns.filter(c => c.connectionState === 'connecting').length,
          pending: 0,
          inactive: conns.filter(c => !c.connected).length
        });

        setMessageStats({
          outgoing: summaryRes.summary.outgoing_total,
          last24h: summaryRes.summary.last_24h
        });

        setLastUpdated(new Date());
      } catch {
        // silencioso — no romper la UI si falla
      }
    };

    loadAll();
    const interval = setInterval(loadAll, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calcular porcentaje dinámicamente
  const usagePercentage = Math.round((connectionStats.connected / subscriptionConfig.whatsAppLimit) * 100);
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = usagePercentage >= 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* WhatsApp Limit Card - Dinámico */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Límite de WhatsApp</p>
            <p className="text-3xl font-bold text-gray-900">
              {connectionStats.connected}/{subscriptionConfig.whatsAppLimit}
            </p>
          </div>
          <div className="text-right">
            <span className={`text-sm font-medium ${
              isAtLimit ? 'text-red-600' : 
              isNearLimit ? 'text-yellow-600' : 
              'text-green-600'
            }`}>
              {usagePercentage}% Utilizado
            </span>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isAtLimit ? 'bg-red-500' : 
                isNearLimit ? 'bg-yellow-500' : 
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            ></div>
          </div>
        </div>
        {connectionStats.connected === 0 && (
          <div className="mt-2">
            <p className="text-xs text-blue-600">
              💡 Conecta tu primer número de WhatsApp
            </p>
          </div>
        )}
        {isAtLimit && (
          <div className="mt-2">
            <p className="text-xs text-red-600">
              ⚠️ Has alcanzado tu límite de conexiones
            </p>
          </div>
        )}
        {isNearLimit && !isAtLimit && connectionStats.connected > 0 && (
          <div className="mt-2">
            <p className="text-xs text-yellow-600">
              ⚡ Te acercas al límite de tu plan
            </p>
          </div>
        )}
      </div>

      {/* Messages Sent Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div>
          <p className="text-sm font-medium text-gray-600">Mensajes Enviados</p>
          <p className="text-3xl font-bold text-gray-900">
            {messageStats ? Number(messageStats.outgoing).toLocaleString() : '—'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {messageStats ? `${messageStats.last24h} en las últimas 24h` : 'Cargando...'}
          </p>
        </div>
      </div>

      {/* Service Status Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Estado del Servicio</p>
            <div className="flex items-center mt-2">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-lg font-semibold text-gray-900">Operativo</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {lastUpdated
            ? `Actualizado: ${lastUpdated.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`
            : 'Actualizando...'}
        </p>
      </div>
    </div>
  );
});

MetricsCards.displayName = 'MetricsCards';