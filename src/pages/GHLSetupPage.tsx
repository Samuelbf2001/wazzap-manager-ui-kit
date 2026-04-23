import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Loader2, Smartphone, Building2 } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

interface Location {
  id: string;
  name: string;
  address?: string;
}

interface ChannelAccount {
  id: number;
  location_id: string;
  whatsapp_phone_number: string;
  provider: string;
  evolution_instance: string | null;
  authorized: boolean;
}

export default function GHLSetupPage() {
  const [searchParams] = useSearchParams();
  const locationId = searchParams.get('locationId');
  const companyId  = searchParams.get('companyId');

  const [locations, setLocations]       = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>(locationId || '');
  const [phoneNumber, setPhoneNumber]   = useState('');
  const [evolutionInstance, setEvolutionInstance] = useState('');
  const [existingChannels, setExistingChannels] = useState<ChannelAccount[]>([]);
  const [loading, setLoading]           = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [result, setResult]             = useState<{ success: boolean; message: string } | null>(null);

  // Si hay companyId, cargar las locations de esa company
  useEffect(() => {
    if (companyId) {
      setLoadingLocations(true);
      fetch(`${BACKEND_URL}/api/ghl-company/locations?companyId=${companyId}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) setLocations(data.locations || []);
        })
        .catch(console.error)
        .finally(() => setLoadingLocations(false));
    }
  }, [companyId]);

  // Cuando se selecciona/conoce un locationId, cargar canales existentes
  useEffect(() => {
    const loc = selectedLocation || locationId;
    if (!loc) return;
    fetch(`${BACKEND_URL}/api/ghl-channels?locationId=${loc}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setExistingChannels(data.channels || []);
      })
      .catch(console.error);
  }, [selectedLocation, locationId]);

  const handleSetup = async () => {
    const loc = selectedLocation || locationId;
    if (!loc || !phoneNumber) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ghl-channels/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: loc,
          phoneNumber,
          evolutionInstance: evolutionInstance || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ success: true, message: `Canal configurado. Instancia Evolution: ${data.evolutionInstance || 'N/A'}` });
        // Recargar canales
        const chRes = await fetch(`${BACKEND_URL}/api/ghl-channels?locationId=${loc}`);
        const chData = await chRes.json();
        if (chData.success) setExistingChannels(chData.channels || []);
        setPhoneNumber('');
        setEvolutionInstance('');
      } else {
        setResult({ success: false, message: data.error || 'Error desconocido' });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error de conexión';
      setResult({ success: false, message: msg });
    } finally {
      setLoading(false);
    }
  };

  const activeLocation = selectedLocation || locationId;

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-12 px-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Smartphone className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">WhatsApp → GHL</span>
          </div>
          <p className="text-gray-500">Conecta tu número de WhatsApp a GoHighLevel</p>
          {locationId && (
            <Badge variant="secondary" className="mt-2">Location: {locationId}</Badge>
          )}
          {companyId && (
            <Badge variant="secondary" className="mt-2">Agency: {companyId}</Badge>
          )}
        </div>

        {/* Selección de location (solo para agency install) */}
        {companyId && !locationId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Selecciona una subcuenta
              </CardTitle>
              <CardDescription>Elige el location de GHL al que quieres conectar WhatsApp</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingLocations ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando subcuentas...
                </div>
              ) : locations.length === 0 ? (
                <p className="text-sm text-gray-500">No se encontraron subcuentas para esta agencia.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {locations.map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedLocation === loc.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="font-medium text-sm">{loc.name}</div>
                      <div className="text-xs text-gray-400">{loc.id}</div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Canales existentes */}
        {existingChannels.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Canales configurados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {existingChannels.map(ch => (
                <div key={ch.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
                  <div>
                    <div className="font-medium text-sm">+{ch.whatsapp_phone_number}</div>
                    {ch.evolution_instance && (
                      <div className="text-xs text-gray-400">Instancia: {ch.evolution_instance}</div>
                    )}
                  </div>
                  <Badge variant={ch.authorized ? 'default' : 'secondary'}>
                    {ch.authorized ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Formulario de setup */}
        {(activeLocation) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Conectar número de WhatsApp</CardTitle>
              <CardDescription>
                Asocia un número de WhatsApp Business a la subcuenta{' '}
                <span className="font-mono text-xs">{activeLocation}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Número de WhatsApp (sin +)</Label>
                <Input
                  id="phone"
                  placeholder="573004188522"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                />
                <p className="text-xs text-gray-400">Solo dígitos, con código de país. Ej: 573004188522</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instance">Nombre de instancia Evolution (opcional)</Label>
                <Input
                  id="instance"
                  placeholder={`ghl_${activeLocation?.slice(0, 8)}`}
                  value={evolutionInstance}
                  onChange={e => setEvolutionInstance(e.target.value)}
                />
                <p className="text-xs text-gray-400">
                  Si lo dejas vacío se genera automáticamente. Usa esto si ya tienes una instancia conectada.
                </p>
              </div>

              {result && (
                <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                  result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {result.success
                    ? <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    : <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  }
                  {result.message}
                </div>
              )}

              <Button
                onClick={handleSetup}
                disabled={loading || !phoneNumber}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Configurando...</>
                ) : (
                  'Conectar WhatsApp'
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Si no hay location seleccionado y tampoco companyId */}
        {!activeLocation && !companyId && (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No se encontró un locationId en la URL.</p>
              <p className="text-sm mt-1">Instala la app desde el Marketplace de GoHighLevel.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
