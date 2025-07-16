import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PageHeader } from "./PageHeader";

interface Property {
  id: string;
  name: string;
  description?: string;
  objectType: string;
  fieldType: string;
  numberFormat?: string;
  dateWithTime?: boolean;
  dropdownOptions?: string[];
  related: Property[];
}

const OBJECT_TYPES = [
  { value: "contacto", label: "Contacto" },
  { value: "trato", label: "Trato" },
  { value: "empresa", label: "Empresa" },
  { value: "ticket", label: "Ticket" }
];

const FIELD_TYPES = [
  { value: "single_line_text", label: "Texto de una sola línea" },
  { value: "number", label: "Número" },
  { value: "date_picker", label: "Selector de fecha" },
  { value: "checkbox", label: "Casilla de verificación única" },
  { value: "dropdown", label: "Opciones desplegables" }
];

const NUMBER_FORMATS = [
  { value: "unformatted", label: "Número sin formato" },
  { value: "phone", label: "Teléfono" },
  { value: "currency", label: "Divisa" },
  { value: "percentage", label: "Porcentaje" },
  { value: "duration", label: "Duración" }
];

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formObject, setFormObject] = useState("");
  const [formName, setFormName] = useState("");
  const [formFieldType, setFormFieldType] = useState("");
  const [formNumberFormat, setFormNumberFormat] = useState("");
  const [formDateWithTime, setFormDateWithTime] = useState(false);
  const [formDropdownOptions, setFormDropdownOptions] = useState<string[]>([""]);
  const [formDescription, setFormDescription] = useState("");

  const handleCreate = () => {
    const newProp: Property = {
      id: Date.now().toString(),
      name: formName,
      description: formDescription,
      objectType: formObject,
      fieldType: formFieldType,
      numberFormat: formFieldType === "number" ? formNumberFormat : undefined,
      dateWithTime: formFieldType === "date_picker" ? formDateWithTime : undefined,
      dropdownOptions: formFieldType === "dropdown" ? formDropdownOptions.filter(opt => opt.trim() !== "") : undefined,
      related: [],
    };
    setProperties((prev) => [...prev, newProp]);
    
    // Limpiar formulario
    resetForm();
    setShowCreateModal(false);
  };

  const resetForm = () => {
    setFormObject("");
    setFormName("");
    setFormFieldType("");
    setFormNumberFormat("");
    setFormDateWithTime(false);
    setFormDropdownOptions([""]);
    setFormDescription("");
  };

  const addDropdownOption = () => {
    setFormDropdownOptions([...formDropdownOptions, ""]);
  };

  const removeDropdownOption = (index: number) => {
    if (formDropdownOptions.length > 1) {
      setFormDropdownOptions(formDropdownOptions.filter((_, i) => i !== index));
    }
  };

  const updateDropdownOption = (index: number, value: string) => {
    const newOptions = [...formDropdownOptions];
    newOptions[index] = value;
    setFormDropdownOptions(newOptions);
  };

  const isFormValid = () => {
    if (!formObject || !formName || !formFieldType) return false;
    
    if (formFieldType === "number" && !formNumberFormat) return false;
    
    if (formFieldType === "dropdown") {
      const validOptions = formDropdownOptions.filter(opt => opt.trim() !== "");
      return validOptions.length >= 1;
    }
    
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Propiedades de HubSpot"
        subtitle="Consulta, crea y gestiona propiedades personalizadas por objeto."
      />
      
    <div className="p-6">
        <div className="flex justify-end mb-4">
          <Button onClick={() => setShowCreateModal(true)}>+ Crear propiedad</Button>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-4 py-2">Nombre</th>
            <th className="text-left px-4 py-2">Tipo de objeto</th>
              <th className="text-left px-4 py-2">Tipo de campo</th>
              <th className="text-left px-4 py-2">Configuración</th>
            <th className="text-left px-4 py-2">Descripción</th>
            <th className="text-left px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((prop) => (
            <tr key={prop.id} className="border-t">
              <td className="px-4 py-2 font-medium">{prop.name}</td>
                <td className="px-4 py-2 capitalize">{OBJECT_TYPES.find(obj => obj.value === prop.objectType)?.label}</td>
                <td className="px-4 py-2">{FIELD_TYPES.find(type => type.value === prop.fieldType)?.label}</td>
                <td className="px-4 py-2">
                  {prop.numberFormat && NUMBER_FORMATS.find(format => format.value === prop.numberFormat)?.label}
                  {prop.fieldType === "date_picker" && (prop.dateWithTime ? "Con hora" : "Solo fecha")}
                  {prop.dropdownOptions && `${prop.dropdownOptions.length} opciones`}
                  {(prop.fieldType === "single_line_text" || prop.fieldType === "checkbox") && "-"}
                </td>
                <td className="px-4 py-2 text-gray-700">{prop.description || "-"}</td>
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
                <DialogTitle>Detalles de "{selectedProperty.name}"</DialogTitle>
            </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="font-medium">Tipo de objeto:</Label>
                  <p className="text-sm text-gray-600">{OBJECT_TYPES.find(obj => obj.value === selectedProperty.objectType)?.label}</p>
                </div>
                <div>
                  <Label className="font-medium">Tipo de campo:</Label>
                  <p className="text-sm text-gray-600">{FIELD_TYPES.find(type => type.value === selectedProperty.fieldType)?.label}</p>
                </div>
                {selectedProperty.numberFormat && (
                  <div>
                    <Label className="font-medium">Formato numérico:</Label>
                    <p className="text-sm text-gray-600">{NUMBER_FORMATS.find(format => format.value === selectedProperty.numberFormat)?.label}</p>
                  </div>
                )}
                {selectedProperty.fieldType === "date_picker" && (
                  <div>
                    <Label className="font-medium">Configuración de fecha:</Label>
                    <p className="text-sm text-gray-600">{selectedProperty.dateWithTime ? "Fecha y hora" : "Solo fecha"}</p>
                  </div>
                )}
                {selectedProperty.dropdownOptions && (
                  <div>
                    <Label className="font-medium">Opciones disponibles:</Label>
                    <ul className="text-sm text-gray-600 ml-4 list-disc">
                      {selectedProperty.dropdownOptions.map((option, index) => (
                        <li key={index}>{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedProperty.description && (
                  <div>
                    <Label className="font-medium">Descripción:</Label>
                    <p className="text-sm text-gray-600">{selectedProperty.description}</p>
                  </div>
                )}
              </div>
          </DialogContent>
        </Dialog>
      )}

        {/* Modal de creación */}
        <Dialog open={showCreateModal} onOpenChange={(open) => {
          setShowCreateModal(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
              <DialogTitle>Crear nueva propiedad</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
              {/* Tipo de objeto */}
            <div>
                <Label htmlFor="object-type" className="text-sm font-medium">
                  Objeto
                </Label>
              <Select value={formObject} onValueChange={setFormObject}>
                  <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona el objeto" />
                </SelectTrigger>
                <SelectContent>
                    {OBJECT_TYPES.map((obj) => (
                      <SelectItem key={obj.value} value={obj.value}>
                        {obj.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

              {/* Nombre de la propiedad */}
              <div>
                <Label htmlFor="property-name" className="text-sm font-medium">
                  Nombre de la propiedad
                </Label>
                <Input
                  id="property-name"
                  className="mt-1"
                  placeholder="Escribe el nombre de la propiedad"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              {/* Tipo de campo */}
              <div>
                <Label htmlFor="field-type" className="text-sm font-medium">
                  Tipo de campo
                </Label>
                <Select value={formFieldType} onValueChange={(value) => {
                  setFormFieldType(value);
                  if (value !== "number") {
                    setFormNumberFormat("");
                  }
                  if (value !== "date_picker") {
                    setFormDateWithTime(false);
                  }
                  if (value !== "dropdown") {
                    setFormDropdownOptions([""]);
                  }
                }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona el tipo de campo" />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Formato numérico (solo si es número) */}
              {formFieldType === "number" && (
                <div>
                  <Label htmlFor="number-format" className="text-sm font-medium">
                    Formato numérico
                  </Label>
                  <Select value={formNumberFormat} onValueChange={setFormNumberFormat}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecciona el formato" />
                    </SelectTrigger>
                    <SelectContent>
                      {NUMBER_FORMATS.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Configuración de fecha (solo si es selector de fecha) */}
              {formFieldType === "date_picker" && (
                <div>
                  <Label className="text-sm font-medium">Configuración de fecha</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      id="date-with-time"
                      checked={formDateWithTime}
                      onCheckedChange={setFormDateWithTime}
                    />
                    <Label htmlFor="date-with-time" className="text-sm">
                      Incluir selección de hora
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formDateWithTime ? "Los usuarios podrán seleccionar fecha y hora" : "Los usuarios solo podrán seleccionar fecha"}
                  </p>
                </div>
              )}

              {/* Opciones desplegables (solo si es dropdown) */}
              {formFieldType === "dropdown" && (
                <div>
                  <Label className="text-sm font-medium">Opciones desplegables</Label>
                  <p className="text-xs text-gray-500 mb-2">Agrega al menos una opción</p>
                  <div className="space-y-2">
                    {formDropdownOptions.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          placeholder={`Opción ${index + 1}`}
                          value={option}
                          onChange={(e) => updateDropdownOption(index, e.target.value)}
                          className="flex-1"
                        />
                        {formDropdownOptions.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeDropdownOption(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addDropdownOption}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar opción
                    </Button>
                  </div>
              </div>
            )}

              {/* Descripción (opcional) */}
              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Descripción (opcional)
                </Label>
                <Input
                  id="description"
                  className="mt-1"
                  placeholder="Describe el propósito de esta propiedad"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
              <Button
                  onClick={handleCreate}
                  disabled={!isFormValid()}
              >
                  Crear propiedad
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
