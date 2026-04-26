import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Building2, AlertCircle, Loader2, ChevronDown, LayoutGrid } from 'lucide-react';
import { WhatsAppConnectionModal } from '@/components/WhatsAppConnectionModal';
import { ConnectionsTable } from '@/components/ConnectionsTable';
import { whatsfullApi } from '@/services/whatsfull-api.service';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

interface GHLLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export default function GHLSetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const locationId = searchParams.get('locationId');
  const companyId  = searchParams.get('companyId');

  const [selectedLocation, setSelectedLocation] = useState<string>(locationId || '');
  const [locations, setLocations]               = useState<GHLLocation[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [locationsError, setLocationsError]     = useState('');
  const [showModal, setShowModal]               = useState(false);
  const [refreshKey, setRefreshKey]             = useState(0);

  // Nuevos estados para validación automática
  const [validating, setValidating]             = useState(false);
  const [validationError, setValidationError]   = useState('');
  const [showAutoQRModal, setShowAutoQRModal]   = useState(false);

  // Cargar locations cuando hay companyId (instalación agency)
  useEffect(() => {
    if (!companyId || locationId) return;
    setLoadingLocations(true);
    setLocationsError('');
    fetch(`${BACKEND_URL}/api/ghl-company/locations?companyId=${companyId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setLocations(data.locations || []);
        } else {
          setLocationsError(data.error || 'Error cargando subcuentas');
        }
      })
      .catch(() => setLocationsError('No se pudieron cargar las subcuentas'))
      .finally(() => setLoadingLocations(false));
  }, [companyId, locationId]);

  // Validar automáticamente locationId si viene en URL (instalación directa)
  useEffect(() => {
    if (!locationId) return;
    setValidating(true);
    setValidationError('');
    whatsfullApi
      .validateGHLLocation(locationId)
      .then((result) => {
        if (!result.readyForQR) {
          setValidationError(result.error || 'Location no está lista para conectar');
        }
        // Auto-abrir modal SOLO si no hay instancia existente (primera instalación)
        // Si ya hay instancia, el usuario ve la tabla y decide desde ahí
        if (result.readyForQR && !result.instanceExists) {
          setTimeout(() => setShowAutoQRModal(true), 500);
        }
      })
      .catch((err) => {
        setValidationError(err instanceof Error ? err.message : 'Error validando location');
      })
      .finally(() => setValidating(false));
  }, [locationId]);

  const activeLocation = selectedLocation || locationId || '';

  const selectedLocationName = locations.find(l => l.id === selectedLocation)?.name || '';

  const handleSuccess = () => {
    setRefreshKey(k => k + 1);
    setShowModal(false);
    setShowAutoQRModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-12 px-4">
      <div className="w-full max-w-3xl space-y-6">

        {/* Nav GHL admin */}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/ghl-admin')}
            className="text-gray-500 hover:text-gray-700 text-xs"
          >
            <LayoutGrid className="w-3 h-3 mr-1" />
            Ver todas las instancias
          </Button>
        </div>

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
            {locationId  && <Badge variant="secondary">Location: {locationId}</Badge>}
            {companyId   && <Badge variant="secondary">Agency: {companyId}</Badge>}
            {activeLocation && activeLocation !== locationId && selectedLocationName && (
              <Badge variant="outline">{selectedLocationName}</Badge>
            )}
          </div>
        </div>

        {/* Agency install: selector de subcuentas */}
        {companyId && !locationId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Selecciona la subcuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingLocations ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando subcuentas…
                </div>
              ) : locationsError ? (
                <div className="text-sm text-red-500 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {locationsError}
                </div>
              ) : locations.length === 0 ? (
                <div className="text-sm text-gray-400">No se encontraron subcuentas para esta agencia.</div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedLocation}
                    onChange={e => setSelectedLocation(e.target.value)}
                    className="w-full appearance-none px-3 py-2 pr-8 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value="">— Elige una subcuenta —</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.id})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              )}

              {selectedLocation && (
                <p className="text-xs text-green-600 font-mono">
                  Location ID: {selectedLocation}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Validando locationId */}
        {locationId && validating && (
          <Card>
            <CardContent className="py-10 text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-3 text-green-600 animate-spin" />
              <p className="text-sm text-gray-600">Validando location...</p>
            </CardContent>
          </Card>
        )}

        {/* Error de validación */}
        {locationId && validationError && !validating && (
          <Card>
            <CardContent className="py-10 text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <p className="text-sm text-red-600">{validationError}</p>
              <p className="text-xs text-gray-400 mt-2">
                Intenta hacer click en el botón "Agregar número" a continuación.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Sin location ni company */}
        {!activeLocation && !companyId && !locationId && (
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
              <h2 className="font-semibold text-gray-900">
                Números conectados
                {selectedLocationName && (
                  <span className="ml-2 text-sm text-gray-400 font-normal">— {selectedLocationName}</span>
                )}
              </h2>
              <Button
                onClick={() => setShowModal(true)}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva conexión
              </Button>
            </div>

            <ConnectionsTable mode="ghl" locationId={activeLocation} key={refreshKey} hideTitle />
          </div>
        )}
      </div>

      {/* Modal manual (botón "Nueva conexión") */}
      <WhatsAppConnectionModal
        open={showModal}
        onOpenChange={setShowModal}
        onConnectionSuccess={handleSuccess}
        mode="ghl"
        locationId={activeLocation}
        companyId={companyId || undefined}
      />

      {/* Modal automático (se abre si locationId se valida exitosamente) */}
      <WhatsAppConnectionModal
        open={showAutoQRModal}
        onOpenChange={setShowAutoQRModal}
        onConnectionSuccess={handleSuccess}
        mode="ghl"
        locationId={locationId || ''}
        companyId={companyId || undefined}
      />
    </div>
  );
}
