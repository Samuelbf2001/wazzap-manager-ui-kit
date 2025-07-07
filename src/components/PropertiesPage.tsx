import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { PageHeader } from "./PageHeader";

interface Property {
  id: string;
  name: string;
  description: string;
  objectType: string;
  related: Property[];
}

const AVAILABLE_PROPERTIES: Record<string, string[]> = {
  contacto: ["first_name", "last_name", "email"],
  trato: ["deal_stage", "amount", "close_date"],
  empresa: ["industry", "company_size"],
  ticket: ["status", "priority", "subject"]
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [formObject, setFormObject] = useState("");
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const handleAdd = () => {
    const newProp: Property = {
      id: Date.now().toString(),
      name: formName,
      description: formDescription,
      objectType: formObject,
      related: [],
    };
    setProperties((prev) => [...prev, newProp]);
    setFormObject("");
    setFormName("");
    setFormDescription("");
    setShowAssociateModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Propiedades de HubSpot"
        subtitle="Consulta, asocia y explora propiedades personalizadas por objeto."
      />
      
      <div className="p-6">
        <div className="flex justify-end mb-4">
          <Button onClick={() => setShowAssociateModal(true)}>+ Asociar nueva propiedad</Button>
        </div>

      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-4 py-2">Nombre</th>
            <th className="text-left px-4 py-2">Tipo de objeto</th>
            <th className="text-left px-4 py-2">Descripción</th>
            <th className="text-left px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((prop) => (
            <tr key={prop.id} className="border-t">
              <td className="px-4 py-2 font-medium">{prop.name}</td>
              <td className="px-4 py-2 capitalize">{prop.objectType}</td>
              <td className="px-4 py-2 text-gray-700">{prop.description}</td>
              <td className="px-4 py-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedProperty(prop)}
                >
                  Ver más
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de propiedades relacionadas */}
      {selectedProperty && (
        <Dialog open={true} onOpenChange={() => setSelectedProperty(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Propiedades relacionadas con "{selectedProperty.name}"</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-500">No hay propiedades relacionadas en esta simulación.</p>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de asociación */}
      <Dialog open={showAssociateModal} onOpenChange={setShowAssociateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asociar nueva propiedad</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Paso 1: seleccionar tipo de objeto */}
            <div>
              <label className="text-sm font-medium block mb-1">Tipo de objeto</label>
              <Select value={formObject} onValueChange={setFormObject}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el objeto" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(AVAILABLE_PROPERTIES).map((obj) => (
                    <SelectItem key={obj} value={obj}>
                      {obj.charAt(0).toUpperCase() + obj.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Paso 2: seleccionar propiedad existente */}
            {formObject && (
              <div>
                <label className="text-sm font-medium block mb-1">Propiedad existente</label>
                <Select value={formName} onValueChange={setFormName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la propiedad" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_PROPERTIES[formObject].map((propName) => (
                      <SelectItem key={propName} value={propName}>
                        {propName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Paso 3: ingresar descripción */}
            {formName && (
              <div>
                <label className="text-sm font-medium block mb-1">Descripción</label>
                <Input
                  placeholder="Describe cómo se usará esta propiedad"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleAdd}
                disabled={!formObject || !formName || !formDescription}
              >
                Asociar propiedad
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
