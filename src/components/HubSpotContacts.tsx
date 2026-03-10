import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface HubSpotContact {
  id: string;
  properties: {
    [key: string]: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface HubSpotContactsProps {
  onContactSelect?: (contact: HubSpotContact) => void;
}

export function HubSpotContacts({ onContactSelect }: HubSpotContactsProps) {
  const [contacts, setContacts] = useState<HubSpotContact[]>([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [newContact, setNewContact] = useState<Partial<HubSpotContact>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Simulación de contactos de HubSpot
  const mockContacts: HubSpotContact[] = [
    {
      id: '1',
      properties: {
        firstname: 'Juan',
        lastname: 'Pérez',
        email: 'juan@ejemplo.com',
        phone: '+1234567890'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      properties: {
        firstname: 'María',
        lastname: 'García',
        email: 'maria@ejemplo.com',
        phone: '+0987654321'
      },
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    }
  ];

  useEffect(() => {
    // Aquí iría la llamada real a la API de HubSpot
    setContacts(mockContacts);
  }, []);

  const handleCreateContact = () => {
    if (newContact.properties?.firstname && newContact.properties?.email) {
      const contact: HubSpotContact = {
        id: Date.now().toString(),
        properties: newContact.properties,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setContacts([...contacts, contact]);
      setShowContactModal(false);
      setNewContact({});
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchTerm.toLowerCase();
    return Object.values(contact.properties).some(value => 
      value.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Contactos de HubSpot</h2>
        <Button onClick={() => setShowContactModal(true)}>
          + Nuevo contacto
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Buscar contactos..."
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
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  {contact.properties.firstname} {contact.properties.lastname}
                </TableCell>
                <TableCell>{contact.properties.email}</TableCell>
                <TableCell>{contact.properties.phone}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onContactSelect?.(contact)}
                  >
                    Seleccionar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nuevo contacto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={newContact.properties?.firstname || ''}
                onChange={(e) => setNewContact({
                  ...newContact,
                  properties: {
                    ...newContact.properties,
                    firstname: e.target.value
                  }
                })}
                placeholder="Nombre del contacto"
              />
            </div>
            <div>
              <Label>Apellido</Label>
              <Input
                value={newContact.properties?.lastname || ''}
                onChange={(e) => setNewContact({
                  ...newContact,
                  properties: {
                    ...newContact.properties,
                    lastname: e.target.value
                  }
                })}
                placeholder="Apellido del contacto"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={newContact.properties?.email || ''}
                onChange={(e) => setNewContact({
                  ...newContact,
                  properties: {
                    ...newContact.properties,
                    email: e.target.value
                  }
                })}
                placeholder="Email del contacto"
                type="email"
              />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input
                value={newContact.properties?.phone || ''}
                onChange={(e) => setNewContact({
                  ...newContact,
                  properties: {
                    ...newContact.properties,
                    phone: e.target.value
                  }
                })}
                placeholder="Teléfono del contacto"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateContact}>Crear contacto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 