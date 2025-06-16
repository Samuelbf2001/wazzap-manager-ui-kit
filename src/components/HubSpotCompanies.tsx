import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface HubSpotCompany {
  id: string;
  properties: {
    name: string;
    domain: string;
    industry: string;
    phone: string;
    [key: string]: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface HubSpotCompaniesProps {
  onCompanySelect?: (company: HubSpotCompany) => void;
}

export function HubSpotCompanies({ onCompanySelect }: HubSpotCompaniesProps) {
  const [companies, setCompanies] = useState<HubSpotCompany[]>([]);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [newCompany, setNewCompany] = useState<Partial<HubSpotCompany>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Simulación de empresas de HubSpot
  const mockCompanies: HubSpotCompany[] = [
    {
      id: '1',
      properties: {
        name: 'Empresa A',
        domain: 'empresaa.com',
        industry: 'Tecnología',
        phone: '+1234567890'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      properties: {
        name: 'Empresa B',
        domain: 'empresab.com',
        industry: 'Finanzas',
        phone: '+0987654321'
      },
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    }
  ];

  useEffect(() => {
    // Aquí iría la llamada real a la API de HubSpot
    setCompanies(mockCompanies);
  }, []);

  const handleCreateCompany = () => {
    if (newCompany.properties?.name && newCompany.properties?.domain) {
      const company: HubSpotCompany = {
        id: Date.now().toString(),
        properties: newCompany.properties,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCompanies([...companies, company]);
      setShowCompanyModal(false);
      setNewCompany({});
    }
  };

  const filteredCompanies = companies.filter(company => {
    const searchLower = searchTerm.toLowerCase();
    return Object.values(company.properties).some(value => 
      value.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Empresas de HubSpot</h2>
        <Button onClick={() => setShowCompanyModal(true)}>
          + Nueva empresa
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Buscar empresas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Dominio</TableHead>
              <TableHead>Industria</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies.map((company) => (
              <TableRow key={company.id}>
                <TableCell>{company.properties.name}</TableCell>
                <TableCell>{company.properties.domain}</TableCell>
                <TableCell>{company.properties.industry}</TableCell>
                <TableCell>{company.properties.phone}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCompanySelect?.(company)}
                  >
                    Seleccionar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showCompanyModal} onOpenChange={setShowCompanyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nueva empresa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={newCompany.properties?.name || ''}
                onChange={(e) => setNewCompany({
                  ...newCompany,
                  properties: {
                    ...newCompany.properties,
                    name: e.target.value
                  }
                })}
                placeholder="Nombre de la empresa"
              />
            </div>
            <div>
              <Label>Dominio</Label>
              <Input
                value={newCompany.properties?.domain || ''}
                onChange={(e) => setNewCompany({
                  ...newCompany,
                  properties: {
                    ...newCompany.properties,
                    domain: e.target.value
                  }
                })}
                placeholder="ej: empresa.com"
              />
            </div>
            <div>
              <Label>Industria</Label>
              <Input
                value={newCompany.properties?.industry || ''}
                onChange={(e) => setNewCompany({
                  ...newCompany,
                  properties: {
                    ...newCompany.properties,
                    industry: e.target.value
                  }
                })}
                placeholder="Industria de la empresa"
              />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input
                value={newCompany.properties?.phone || ''}
                onChange={(e) => setNewCompany({
                  ...newCompany,
                  properties: {
                    ...newCompany.properties,
                    phone: e.target.value
                  }
                })}
                placeholder="Teléfono de la empresa"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateCompany}>Crear empresa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 