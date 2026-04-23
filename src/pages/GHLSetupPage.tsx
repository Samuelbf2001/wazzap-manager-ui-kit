import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Building2, AlertCircle } from 'lucide-react';
import { WhatsAppConnectionModal } from '@/components/WhatsAppConnectionModal';
import { ConnectionsTable } from '@/components/ConnectionsTable';

export default function GHLSetupPage() {
  const [searchParams] = useSearchParams();
  const locationId = searchParams.get('locationId');
  const companyId  = searchParams.get('companyId');

  const [selectedLocation, setSelectedLocation] = useState<string>(locationId || '');
  const [manualLocationId, setManualLocationId] = useState<string>('');
  const [showModal, setShowModal]              = useState(false);
  const [refreshKey, setRefreshKey]            = useState(0);

  const activeLocation = selectedLocation || manualLocationId || locationId || '';

  const handleSuccess = () => {
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-12 px-4">
      <div className="w-full max-w-3xl space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.122 1.532 5.856L0 24l6.335-1.525A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.37l-.36-.213-3.76.906.949-3.668-.234-.375A9.818 9.818 0 1112 21.818z"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">WhatsApp → GHL</span>
          </div>
          <p className="text-gray-500 text-sm">Conecta números de WhatsApp a GoHighLevel</p>
          <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
            {locationId && <Badge variant="secondary">Location: {locationId}</Badge>}
            {companyId  && <Badge variant="secondary">Agency: {companyId}</Badge>}
            {activeLocation && activeLocation !== locationId && (
              <Badge variant="outline">Subcuenta: {activeLocation}</Badge>
            )}
          </div>
        </div>

        {/* Agency install: ingresar locationId manualmente */}
        {companyId && !locationId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Ingresa el ID de la subcuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <input
                type="text"
                value={manualLocationId}
                onChange={e => setManualLocationId(e.target.value.trim())}
                placeholder="ej: dMX4yw4WB0RZFivUhgyG"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400">
                Encuéntralo en GHL → Settings → Business Info → Location ID.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Sin location */}
        {!activeLocation && !companyId && (
          <Card>
            <CardContent className="py-10 text-center text-gray-400">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No se encontró un locationId en la URL.</p>
              <p className="text-xs mt-1">Instala la app desde el Marketplace de GoHighLevel.</p>
            </CardContent>
          </Card>
        )}

        {/* Tabla de conexiones + botón nueva */}
        {activeLocation && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Números conectados</h2>
              <Button
                onClick={() => setShowModal(true)}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva conexión
              </Button>
            </div>

            <ConnectionsTable mode="ghl" locationId={activeLocation} key={refreshKey} />
          </div>
        )}
      </div>

      {/* Modal reutilizable en modo GHL */}
      <WhatsAppConnectionModal
        open={showModal}
        onOpenChange={setShowModal}
        onConnectionSuccess={handleSuccess}
        mode="ghl"
        locationId={activeLocation}
        companyId={companyId || undefined}
      />
    </div>
  );
}
