
export function MetricsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* WhatsApp Limit Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Límite de WhatsApp</p>
            <p className="text-3xl font-bold text-gray-900">5/10</p>
          </div>
          <div className="text-right">
            <span className="text-sm text-green-600 font-medium">50% Utilizado</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }}></div>
          </div>
        </div>
      </div>

      {/* Messages Sent Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div>
          <p className="text-sm font-medium text-gray-600">Mensajes Enviados</p>
          <p className="text-3xl font-bold text-gray-900">12,543</p>
          <p className="text-sm text-gray-500 mt-1">+12% en las últimas 24 horas</p>
        </div>
      </div>

      {/* Service Status Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Estado del Servicio</p>
            <div className="flex items-center mt-2">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-lg font-semibold text-gray-900">Operativo</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">Última actualización: hace 5 minutos</p>
      </div>
    </div>
  );
}
