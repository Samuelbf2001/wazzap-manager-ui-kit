import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface HubSpotDeal {
  id: string;
  properties: {
    dealname: string;
    amount: string;
    pipeline: string;
    dealstage: string;
    closedate: string;
    [key: string]: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface HubSpotDealsProps {
  onDealSelect?: (deal: HubSpotDeal) => void;
}

export function HubSpotDeals({ onDealSelect }: HubSpotDealsProps) {
  const [deals, setDeals] = useState<HubSpotDeal[]>([]);
  const [showDealModal, setShowDealModal] = useState(false);
  const [newDeal, setNewDeal] = useState<Partial<HubSpotDeal>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPipeline, setSelectedPipeline] = useState<string>('all');

  // Simulación de negocios de HubSpot
  const mockDeals: HubSpotDeal[] = [
    {
      id: '1',
      properties: {
        dealname: 'Implementación CRM',
        amount: '50000',
        pipeline: 'default',
        dealstage: 'presentation_scheduled',
        closedate: '2024-03-01'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      properties: {
        dealname: 'Suscripción Premium',
        amount: '25000',
        pipeline: 'default',
        dealstage: 'contract_sent',
        closedate: '2024-02-15'
      },
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    }
  ];

  useEffect(() => {
    // Aquí iría la llamada real a la API de HubSpot
    setDeals(mockDeals);
  }, []);

  const handleCreateDeal = () => {
    if (newDeal.properties?.dealname && newDeal.properties?.amount) {
      const deal: HubSpotDeal = {
        id: Date.now().toString(),
        properties: newDeal.properties,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setDeals([...deals, deal]);
      setShowDealModal(false);
      setNewDeal({});
    }
  };

  const filteredDeals = deals.filter(deal => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = Object.values(deal.properties).some(value => 
      value.toLowerCase().includes(searchLower)
    );
    const matchesPipeline = selectedPipeline === 'all' || deal.properties.pipeline === selectedPipeline;
    return matchesSearch && matchesPipeline;
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(parseFloat(amount));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Negocios de HubSpot</h2>
        <Button onClick={() => setShowDealModal(true)}>
          + Nuevo negocio
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <Input
          placeholder="Buscar negocios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={selectedPipeline} onValueChange={setSelectedPipeline}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por pipeline" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los pipelines</SelectItem>
            <SelectItem value="default">Pipeline por defecto</SelectItem>
            <SelectItem value="sales">Pipeline de ventas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Pipeline</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Fecha de cierre</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeals.map((deal) => (
              <TableRow key={deal.id}>
                <TableCell>{deal.properties.dealname}</TableCell>
                <TableCell>{formatCurrency(deal.properties.amount)}</TableCell>
                <TableCell>{deal.properties.pipeline}</TableCell>
                <TableCell>{deal.properties.dealstage}</TableCell>
                <TableCell>{new Date(deal.properties.closedate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDealSelect?.(deal)}
                  >
                    Seleccionar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showDealModal} onOpenChange={setShowDealModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nuevo negocio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre del negocio</Label>
              <Input
                value={newDeal.properties?.dealname || ''}
                onChange={(e) => setNewDeal({
                  ...newDeal,
                  properties: {
                    ...newDeal.properties,
                    dealname: e.target.value
                  }
                })}
                placeholder="Nombre del negocio"
              />
            </div>
            <div>
              <Label>Monto</Label>
              <Input
                value={newDeal.properties?.amount || ''}
                onChange={(e) => setNewDeal({
                  ...newDeal,
                  properties: {
                    ...newDeal.properties,
                    amount: e.target.value
                  }
                })}
                placeholder="Monto del negocio"
                type="number"
              />
            </div>
            <div>
              <Label>Pipeline</Label>
              <Select
                value={newDeal.properties?.pipeline || ''}
                onValueChange={(value) => setNewDeal({
                  ...newDeal,
                  properties: {
                    ...newDeal.properties,
                    pipeline: value
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar pipeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Pipeline por defecto</SelectItem>
                  <SelectItem value="sales">Pipeline de ventas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Etapa</Label>
              <Select
                value={newDeal.properties?.dealstage || ''}
                onValueChange={(value) => setNewDeal({
                  ...newDeal,
                  properties: {
                    ...newDeal.properties,
                    dealstage: value
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appointment_scheduled">Cita programada</SelectItem>
                  <SelectItem value="qualified_to_buy">Calificado para comprar</SelectItem>
                  <SelectItem value="presentation_scheduled">Presentación programada</SelectItem>
                  <SelectItem value="decision_maker_bought_in">Decisor convencido</SelectItem>
                  <SelectItem value="contract_sent">Contrato enviado</SelectItem>
                  <SelectItem value="closed_won">Cerrado ganado</SelectItem>
                  <SelectItem value="closed_lost">Cerrado perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fecha de cierre</Label>
              <Input
                value={newDeal.properties?.closedate || ''}
                onChange={(e) => setNewDeal({
                  ...newDeal,
                  properties: {
                    ...newDeal.properties,
                    closedate: e.target.value
                  }
                })}
                type="date"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateDeal}>Crear negocio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 