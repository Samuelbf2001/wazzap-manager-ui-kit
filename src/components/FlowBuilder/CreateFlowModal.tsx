import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { CreateFlowRequest } from '@/types/flow';

interface CreateFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFlow: (data: CreateFlowRequest) => void;
  trigger?: React.ReactNode;
}

const FLOW_CATEGORIES = [
  { value: 'customer-service', label: 'Atención al Cliente' },
  { value: 'sales', label: 'Ventas' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'support', label: 'Soporte' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'booking', label: 'Reservas' },
  { value: 'lead-generation', label: 'Generación de Leads' },
  { value: 'survey', label: 'Encuestas' },
  { value: 'notifications', label: 'Notificaciones' },
  { value: 'other', label: 'Otro' }
];

const SUGGESTED_TAGS = [
  'whatsapp', 'automatización', 'ia', 'crm', 'ventas', 'soporte',
  'marketing', 'encuesta', 'lead', 'cliente', 'reserva', 'pago',
  'seguimiento', 'bienvenida', 'abandono', 'promoción'
];

export function CreateFlowModal({ isOpen, onClose, onCreateFlow, trigger }: CreateFlowModalProps) {
  const [formData, setFormData] = useState<CreateFlowRequest>({
    name: '',
    description: '',
    category: '',
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      tags: []
    });
    setNewTag('');
  };

  // Manejar cierre
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Manejar cambios en inputs
  const handleInputChange = (field: keyof CreateFlowRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Agregar tag
  const addTag = (tag: string) => {
    const tagValue = tag.trim().toLowerCase();
    if (tagValue && !formData.tags?.includes(tagValue)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagValue]
      }));
    }
    setNewTag('');
  };

  // Eliminar tag
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onCreateFlow(formData);
      handleClose();
    } catch (error) {
      console.error('Error al crear flujo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Crear Nuevo Flujo</DialogTitle>
        <DialogDescription>
          Define los detalles básicos de tu nuevo flujo de conversación automatizado.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre del flujo */}
        <div className="space-y-2">
          <Label htmlFor="flow-name">Nombre del Flujo *</Label>
          <Input
            id="flow-name"
            placeholder="ej: Atención al Cliente 24/7"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <Label htmlFor="flow-description">Descripción</Label>
          <Textarea
            id="flow-description"
            placeholder="Describe el propósito y funcionamiento de este flujo..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Categoría */}
        <div className="space-y-2">
          <Label htmlFor="flow-category">Categoría</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleInputChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {FLOW_CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <Label>Tags / Etiquetas</Label>
          
          {/* Tags seleccionados */}
          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:bg-gray-300 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Input para nuevo tag */}
          <div className="flex gap-2">
            <Input
              placeholder="Agregar tag personalizado"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(newTag);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addTag(newTag)}
              disabled={!newTag.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Tags sugeridos */}
          <div>
            <Label className="text-sm text-gray-600">Tags sugeridos:</Label>
            <div className="flex flex-wrap gap-1 mt-2">
              {SUGGESTED_TAGS
                .filter(tag => !formData.tags?.includes(tag))
                .slice(0, 8)
                .map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-gray-100"
                  onClick={() => addTag(tag)}
                >
                  {tag}
                  <Plus className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={!formData.name.trim() || isLoading}
          >
            {isLoading ? 'Creando...' : 'Crear Flujo'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );

  // Si se proporciona un trigger personalizado, úsalo
  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        {modalContent}
      </Dialog>
    );
  }

  // Modal controlado externamente
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      {modalContent}
    </Dialog>
  );
} 