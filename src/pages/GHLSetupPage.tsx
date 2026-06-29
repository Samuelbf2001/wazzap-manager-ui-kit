import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, ChevronDown, LayoutGrid, RefreshCw, Terminal, Brain } from 'lucide-react';
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
  const [refreshKey, setRefreshKey]             = useState(0);

  const [authError, setAuthError]               = useState(false);
  const [validationDone, setValidationDone]     = useState(false);

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

  // Validar en background (solo para detectar si hay error de auth)
  useEffect(() => {
    if (!locationId) return;
    whatsfullApi
      .validateGHLLocation(locationId)
      .then((result) => {
        if (!result.readyForQR && !result.hasTokens) setAuthError(true);
      })
      .catch(() => {})
      .finally(() => setValidationDone(true));
  }, [locationId]);

  const activeLocation = selectedLocation || locationId || '';
  const selectedLocationName = locations.find(l => l.id === selectedLocation)?.name || '';

  const handleSuccess = () => {
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-10 px-4">
      <div className="w-full max-w-3xl space-y-5">

        {/* Nav */}
        <div className="flex justify-end gap-1">
          {activeLocation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/ghl-cerebro?locationId=${activeLocation}`)}
              className="text-purple-600 hover:text-purple-700 text-xs"
            >
              <Brain className="w-3 h-3 mr-1" />
              Segundo Cerebro
            </Button>
          )}
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.122 1.532 5.856L0 24l6.335-1.525A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.37l-.36-.213-3.76.906.949-3.668-.234-.375A9.818 9.818 0 1112 21.818z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">WhatsApp → GHL</h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {locationId && (
                <Badge variant="secondary" className="text-xs font-mono">{locationId}</Badge>
              )}
              {companyId && !locationId && (
                <Badge variant="secondary" className="text-xs">Agency: {companyId}</Badge>
              )}
              {selectedLocationName && (
                <Badge variant="outline" className="text-xs">{selectedLocationName}</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Auth error banner */}
        {authError && validationDone && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="py-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-orange-700">Autorización requerida</p>
                <p className="text-xs text-orange-600 mt-0.5">
                  Los tokens de acceso de esta location expiraron. Re-autoriza la app para poder conectar números.
                </p>
              </div>
              <Button
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white flex-shrink-0"
                onClick={() => { window.location.href = `${BACKEND_URL}/ghl/install`; }}
              >
                <RefreshCw className="w-3 h-3 mr-1.5" />
                Re-autorizar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Agency install: selector de subcuentas */}
        {companyId && !locationId && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Selecciona la subcuenta</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {loadingLocations ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-1">
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
                <p className="text-xs text-green-600 font-mono">Location ID: {selectedLocation}</p>
              )}
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

        {/* Tabla de conexiones */}
        {activeLocation && (
          <>
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Números de WhatsApp conectados
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ConnectionsTable
                  mode="ghl"
                  locationId={activeLocation}
                  companyId={companyId || undefined}
                  key={refreshKey}
                  hideTitle
                  onConnectionSuccess={handleSuccess}
                />
              </CardContent>
            </Card>

            {/* Tip: comando multi-número */}
            <Card className="border-blue-100 bg-blue-50">
              <CardContent className="py-3 flex items-start gap-3">
                <Terminal className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-blue-700 mb-0.5">Comando para elegir número en GHL</p>
                  <p className="text-xs text-blue-600">
                    Escribe <span className="font-mono bg-blue-100 px-1 rounded">/nombre/</span> al inicio de tu mensaje en GHL para elegir qué número envía la respuesta.
                    El número <span className="font-medium">predeterminado</span> se usa automáticamente si no se especifica ninguno.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
