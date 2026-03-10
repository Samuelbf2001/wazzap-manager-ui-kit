import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface HubSpotProperty {
  name: string;
  label: string;
  type: string;
  fieldType: string;
  groupName: string;
  description: string;
  options?: Array<{ label: string; value: string }>;
}

interface HubSpotPropertiesProps {
  onPropertySelect: (property: HubSpotProperty) => void;
}

export function HubSpotProperties({ onPropertySelect }: HubSpotPropertiesProps) {
  const [properties, setProperties] = useState<HubSpotProperty[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [newProperty, setNewProperty] = useState<Partial<HubSpotProperty>>({});

  // Simulación de propiedades de HubSpot
  const mockProperties: HubSpotProperty[] = [
    {
      name: 'firstname',
      label: 'Nombre',
      type: 'string',
      fieldType: 'text',
      groupName: 'contact',
      description: 'Nombre del contacto'
    },
    {
      name: 'lastname',
      label: 'Apellido',
      type: 'string',
      fieldType: 'text',
      groupName: 'contact',
      description: 'Apellido del contacto'
    },
    {
      name: 'email',
      label: 'Correo electrónico',
      type: 'string',
      fieldType: 'text',
      groupName: 'contact',
      description: 'Correo electrónico del contacto'
    },
    {
      name: 'phone',
      label: 'Teléfono',
      type: 'string',
      fieldType: 'text',
      groupName: 'contact',
      description: 'Número de teléfono del contacto'
    }
  ];

  useEffect(() => {
    // Aquí iría la llamada real a la API de HubSpot
    setProperties(mockProperties);
  }, []);

  const handleCreateProperty = () => {
    if (newProperty.name && newProperty.label && newProperty.type) {
      const property: HubSpotProperty = {
        name: newProperty.name,
        label: newProperty.label,
        type: newProperty.type,
        fieldType: newProperty.fieldType || 'text',
        groupName: newProperty.groupName || 'contact',
        description: newProperty.description || '',
        options: newProperty.options
      };
      setProperties([...properties, property]);
      setShowPropertyModal(false);
      setNewProperty({});
    }
  };

  const filteredProperties = selectedGroup === 'all' 
    ? properties 
    : properties.filter(p => p.groupName === selectedGroup);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Propiedades de HubSpot</h2>
        <Button onClick={() => setShowPropertyModal(true)}>
          + Nueva propiedad
        </Button>
      </div>

      <Select value={selectedGroup} onValueChange={setSelectedGroup}>
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por grupo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los grupos</SelectItem>
          <SelectItem value="contact">Contactos</SelectItem>
          <SelectItem value="company">Empresas</SelectItem>
          <SelectItem value="deal">Negocios</SelectItem>
        </SelectContent>
      </Select>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProperties.map((property) => (
          <Card key={property.name} className="p-4">
            <div className="space-y-2">
              <h3 className="font-medium">{property.label}</h3>
              <p className="text-sm text-gray-500">{property.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{property.type}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onPropertySelect(property)}
                >
                  Seleccionar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showPropertyModal} onOpenChange={setShowPropertyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nueva propiedad</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre interno</Label>
              <Input
                value={newProperty.name || ''}
                onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                placeholder="ej: firstname"
              />
            </div>
            <div>
              <Label>Etiqueta</Label>
              <Input
                value={newProperty.label || ''}
                onChange={(e) => setNewProperty({ ...newProperty, label: e.target.value })}
                placeholder="ej: Nombre"
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select
                value={newProperty.type || ''}
                onValueChange={(value) => setNewProperty({ ...newProperty, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">Texto</SelectItem>
                  <SelectItem value="number">Número</SelectItem>
                  <SelectItem value="boolean">Booleano</SelectItem>
                  <SelectItem value="date">Fecha</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Grupo</Label>
              <Select
                value={newProperty.groupName || ''}
                onValueChange={(value) => setNewProperty({ ...newProperty, groupName: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contact">Contactos</SelectItem>
                  <SelectItem value="company">Empresas</SelectItem>
                  <SelectItem value="deal">Negocios</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descripción</Label>
              <Input
                value={newProperty.description || ''}
                onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
                placeholder="Descripción de la propiedad"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateProperty}>Crear propiedad</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 