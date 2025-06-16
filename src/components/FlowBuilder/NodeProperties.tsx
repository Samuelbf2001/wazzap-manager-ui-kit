import { Node } from 'reactflow';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface NodePropertiesProps {
  node: Node;
  onUpdate: (nodeId: string, data: any) => void;
}

export function NodeProperties({ node, onUpdate }: NodePropertiesProps) {
  const handleChange = (field: string, value: any) => {
    onUpdate(node.id, { ...node.data, [field]: value });
  };

  const renderProperties = () => {
    switch (node.type) {
      case 'message':
        return (
          <div className="space-y-4">
            <div>
              <Label>Mensaje</Label>
              <Textarea
                value={node.data.message || ''}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                rows={4}
              />
            </div>
            <div>
              <Label>Variables</Label>
              <Select
                value={node.data.variables || 'none'}
                onValueChange={(value) => handleChange('variables', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona variables" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin variables</SelectItem>
                  <SelectItem value="name">Nombre del contacto</SelectItem>
                  <SelectItem value="phone">Número de teléfono</SelectItem>
                  <SelectItem value="custom">Variable personalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'condition':
        return (
          <div className="space-y-4">
            <div>
              <Label>Condición</Label>
              <Select
                value={node.data.conditionType || 'text'}
                onValueChange={(value) => handleChange('conditionType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de condición" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="number">Número</SelectItem>
                  <SelectItem value="date">Fecha</SelectItem>
                  <SelectItem value="variable">Variable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Operador</Label>
              <Select
                value={node.data.operator || 'equals'}
                onValueChange={(value) => handleChange('operator', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Operador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Igual a</SelectItem>
                  <SelectItem value="contains">Contiene</SelectItem>
                  <SelectItem value="greater">Mayor que</SelectItem>
                  <SelectItem value="less">Menor que</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valor</Label>
              <Input
                value={node.data.value || ''}
                onChange={(e) => handleChange('value', e.target.value)}
                placeholder="Valor a comparar"
              />
            </div>
          </div>
        );

      case 'delay':
        return (
          <div className="space-y-4">
            <div>
              <Label>Tiempo de espera</Label>
              <Input
                type="number"
                value={node.data.delay || 0}
                onChange={(e) => handleChange('delay', parseInt(e.target.value))}
                placeholder="Tiempo en segundos"
              />
            </div>
            <div>
              <Label>Unidad</Label>
              <Select
                value={node.data.unit || 'seconds'}
                onValueChange={(value) => handleChange('unit', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unidad de tiempo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seconds">Segundos</SelectItem>
                  <SelectItem value="minutes">Minutos</SelectItem>
                  <SelectItem value="hours">Horas</SelectItem>
                  <SelectItem value="days">Días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <Label>URL del Webhook</Label>
              <Input
                value={node.data.url || ''}
                onChange={(e) => handleChange('url', e.target.value)}
                placeholder="https://api.ejemplo.com/webhook"
              />
            </div>
            <div>
              <Label>Método</Label>
              <Select
                value={node.data.method || 'POST'}
                onValueChange={(value) => handleChange('method', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Método HTTP" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Headers</Label>
              <Textarea
                value={node.data.headers || ''}
                onChange={(e) => handleChange('headers', e.target.value)}
                placeholder="Headers en formato JSON"
                rows={4}
              />
            </div>
          </div>
        );

      case 'template':
        return (
          <div className="space-y-4">
            <div>
              <Label>Plantilla</Label>
              <Select
                value={node.data.templateName || ''}
                onValueChange={(value) => handleChange('templateName', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una plantilla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="template1">Plantilla 1</SelectItem>
                  <SelectItem value="template2">Plantilla 2</SelectItem>
                  <SelectItem value="template3">Plantilla 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Variables</Label>
              <Textarea
                value={node.data.variables || ''}
                onChange={(e) => handleChange('variables', e.target.value)}
                placeholder="Variables en formato JSON"
                rows={4}
              />
            </div>
          </div>
        );

      case 'media':
        return (
          <div className="space-y-4">
            <div>
              <Label>Tipo de medio</Label>
              <Select
                value={node.data.mediaType || 'image'}
                onValueChange={(value) => handleChange('mediaType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de medio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Imagen</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="document">Documento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>URL del medio</Label>
              <Input
                value={node.data.mediaUrl || ''}
                onChange={(e) => handleChange('mediaUrl', e.target.value)}
                placeholder="URL del archivo"
              />
            </div>
            <div>
              <Label>Pie de foto</Label>
              <Input
                value={node.data.caption || ''}
                onChange={(e) => handleChange('caption', e.target.value)}
                placeholder="Pie de foto opcional"
              />
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                value={node.data.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Título de la lista"
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <Input
                value={node.data.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descripción de la lista"
              />
            </div>
            <div>
              <Label>Botón</Label>
              <Input
                value={node.data.buttonText || ''}
                onChange={(e) => handleChange('buttonText', e.target.value)}
                placeholder="Texto del botón"
              />
            </div>
            <div>
              <Label>Opciones</Label>
              <Textarea
                value={node.data.options || ''}
                onChange={(e) => handleChange('options', e.target.value)}
                placeholder="Opciones en formato JSON"
                rows={4}
              />
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-4">
            <div>
              <Label>Nombre del lugar</Label>
              <Input
                value={node.data.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nombre del lugar"
              />
            </div>
            <div>
              <Label>Dirección</Label>
              <Input
                value={node.data.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Dirección completa"
              />
            </div>
            <div>
              <Label>Latitud</Label>
              <Input
                type="number"
                value={node.data.latitude || ''}
                onChange={(e) => handleChange('latitude', parseFloat(e.target.value))}
                placeholder="Latitud"
              />
            </div>
            <div>
              <Label>Longitud</Label>
              <Input
                type="number"
                value={node.data.longitude || ''}
                onChange={(e) => handleChange('longitude', parseFloat(e.target.value))}
                placeholder="Longitud"
              />
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={node.data.contact?.name || ''}
                onChange={(e) => handleChange('contact', { ...node.data.contact, name: e.target.value })}
                placeholder="Nombre del contacto"
              />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input
                value={node.data.contact?.phone || ''}
                onChange={(e) => handleChange('contact', { ...node.data.contact, phone: e.target.value })}
                placeholder="Número de teléfono"
              />
            </div>
          </div>
        );

      case 'interactive':
        return (
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                value={node.data.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Título del mensaje"
              />
            </div>
            <div>
              <Label>Botones</Label>
              <Textarea
                value={JSON.stringify(node.data.buttons || [], null, 2)}
                onChange={(e) => {
                  try {
                    const buttons = JSON.parse(e.target.value);
                    handleChange('buttons', buttons);
                  } catch (error) {
                    // Ignorar errores de JSON inválido
                  }
                }}
                placeholder="Botones en formato JSON"
                rows={4}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500">
            No hay propiedades disponibles para este tipo de nodo.
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Nombre del nodo</Label>
        <Input
          value={node.data.label || ''}
          onChange={(e) => handleChange('label', e.target.value)}
          placeholder="Nombre del nodo"
        />
      </div>
      {renderProperties()}
    </div>
  );
} 