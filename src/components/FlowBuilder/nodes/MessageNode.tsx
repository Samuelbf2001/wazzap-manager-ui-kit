import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Settings, 
  Plus, 
  Trash2, 
  X, 
  MousePointer,
  Type,
  Image,
  Video,
  Mic,
  FileText,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Timer,
  Download,
  List,
  Eye,
  Copy,
  ArrowRight,
  Upload,
  Volume2,
  Smile
} from 'lucide-react';

// Tipos según WhatsApp Business API
interface ButtonConfig {
  id: string;
  type: 'reply' | 'url' | 'call';
  title: string;
  payload?: string; // Para reply buttons
  url?: string; // Para URL buttons  
  phoneNumber?: string; // Para call buttons
}

interface ListRow {
  id: string;
  title: string;
  description?: string;
}

interface ListSection {
  title: string;
  rows: ListRow[];
}

interface ListMenu {
  header?: {
    type: 'text';
    text: string;
  };
  body: {
    text: string;
  };
  footer?: {
    text: string;
  };
  button: string; // CTA button text
  sections: ListSection[];
}

interface MessageData {
  label: string;
  
  // Tipos de mensaje según WhatsApp API
  messageType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'sticker';
  
  // Tipo de interactividad
  interactiveType: 'none' | 'buttons' | 'list' | 'location_request';
  
  // Contenido básico
  text: string;
  
  // Header (opcional)
  hasHeader: boolean;
  header?: {
    type: 'text' | 'image' | 'video' | 'document';
    content: string;
  };
  
  // Footer (opcional)
  hasFooter: boolean;
  footer?: string;
  
  // Botones de respuesta (máximo 3)
  hasButtons: boolean;
  buttons: ButtonConfig[];
  
  // Lista interactiva (máximo 10 items)
  hasListMenu: boolean;
  listMenu: ListMenu;
  
  // Media específico
  mediaUrl?: string;
  mediaCaption?: string;
  mediaFile?: File;
  mediaFileName?: string;
  mediaFileSize?: number;
  mediaMimeType?: string;
  
  // Variables dinámicas
  hasVariables: boolean;
  variables: string[];
  
  // Configuración de vista previa de URL
  previewUrl: boolean;
  
  // New fields
  enableMedia?: boolean;
  mediaType?: 'image' | 'video' | 'audio' | 'document' | 'sticker';
}

export function MessageNode({ data, selected }: { data: Partial<MessageData>; selected?: boolean }) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [localData, setLocalData] = useState<MessageData>({
    label: data.label || 'Mensaje WhatsApp',
    messageType: data.messageType || 'text',
    interactiveType: data.interactiveType || 'none',
    text: data.text || '¡Hola! ¿En qué puedo ayudarte hoy?',
    hasHeader: data.hasHeader || false,
    hasFooter: data.hasFooter || false,
    hasButtons: data.hasButtons || false,
    buttons: data.buttons || [],
    hasListMenu: data.hasListMenu || false,
    listMenu: data.listMenu || {
      body: { text: 'Selecciona una opción:' },
      button: 'Ver opciones',
      sections: []
    },
    hasVariables: data.hasVariables || false,
    variables: data.variables || [],
    previewUrl: data.previewUrl || false,
    enableMedia: data.enableMedia || false,
    ...data
  });

  const updateData = (updates: Partial<MessageData>) => {
    setLocalData(prev => ({ ...prev, ...updates }));
  };

  const addButton = () => {
    if (localData.buttons.length >= 3) return;
    
    const newButton: ButtonConfig = {
      id: Date.now().toString(),
      type: 'reply',
      title: `Opción ${localData.buttons.length + 1}`,
      payload: `option_${localData.buttons.length + 1}`
    };
    updateData({
      buttons: [...localData.buttons, newButton],
      hasButtons: true,
      interactiveType: 'buttons'
    });
  };

  const removeButton = (id: string) => {
    const newButtons = localData.buttons.filter(b => b.id !== id);
    updateData({
      buttons: newButtons,
      hasButtons: newButtons.length > 0,
      interactiveType: newButtons.length > 0 ? 'buttons' : 'none'
    });
  };

  const addListSection = () => {
    const newSection: ListSection = {
      title: `Sección ${localData.listMenu.sections.length + 1}`,
      rows: []
    };
    updateData({
      listMenu: {
        ...localData.listMenu,
        sections: [...localData.listMenu.sections, newSection]
      },
      hasListMenu: true,
      interactiveType: 'list'
    });
  };

  const addListRow = (sectionIndex: number) => {
    const sections = [...localData.listMenu.sections];
    const section = sections[sectionIndex];
    
    if (section.rows.length >= 10) return; // Límite WhatsApp
    
    const newRow: ListRow = {
      id: Date.now().toString(),
      title: `Opción ${section.rows.length + 1}`,
      description: 'Descripción de la opción'
    };
    
    section.rows.push(newRow);
    
    updateData({
      listMenu: {
        ...localData.listMenu,
        sections
      }
    });
  };

  const getMessageIcon = () => {
    switch (localData.messageType) {
      case 'text': return MessageSquare;
      case 'image': return Image;
      case 'video': return Video;
      case 'audio': return Mic;
      case 'document': return FileText;
      case 'location': return MapPin;
      case 'contact': return Phone;
      default: return MessageSquare;
    }
  };

  const getInteractiveIcon = () => {
    switch (localData.interactiveType) {
      case 'buttons': return MousePointer;
      case 'list': return List;
      case 'location_request': return MapPin;
      default: return null;
    }
  };

  const getTypeLabel = () => {
    let label = '';
    switch (localData.messageType) {
      case 'text': label = 'Texto'; break;
      case 'image': label = 'Imagen'; break;
      case 'video': label = 'Video'; break;
      case 'audio': label = 'Audio'; break;
      case 'document': label = 'Documento'; break;
      case 'location': label = 'Ubicación'; break;
      case 'contact': label = 'Contacto'; break;
      default: label = 'Texto';
    }
    
    if (localData.interactiveType !== 'none') {
      switch (localData.interactiveType) {
        case 'buttons': label += ' + Botones'; break;
        case 'list': label += ' + Lista'; break;
        case 'location_request': label += ' + Ubicación'; break;
      }
    }
    
    return label;
  };

  const MessageIcon = getMessageIcon();
  const InteractiveIcon = getInteractiveIcon();

  // Calcular outputs dinámicos
  const getOutputHandles = () => {
    const handles = [];
    
    // Handle principal
    handles.push({
      id: 'main',
      label: 'Principal',
      style: { left: '50%' }
    });
    
    // Handles para botones
    if (localData.hasButtons && localData.buttons.length > 0) {
      localData.buttons.forEach((button, index) => {
        handles.push({
          id: `button-${button.id}`,
          label: button.title,
          style: { left: `${20 + (index * 30)}%` }
        });
      });
    }
    
    // Handles para lista
    if (localData.hasListMenu && localData.listMenu.sections.length > 0) {
      localData.listMenu.sections.forEach((section, sectionIndex) => {
        section.rows.forEach((row, rowIndex) => {
          handles.push({
            id: `list-${row.id}`,
            label: row.title,
            style: { left: `${15 + ((sectionIndex * section.rows.length + rowIndex) * 20)}%` }
          });
        });
      });
    }
    
    return handles;
  };

  const getFileSizeLimits = () => {
    switch (localData.messageType) {
      case 'image': return 'Máximo 5 MB • Formatos: JPEG, PNG';
      case 'video': return 'Máximo 16 MB • Formatos: MP4, 3GP';
      case 'audio': return 'Máximo 16 MB • Formatos: AAC, MP3, MP4, AMR, OGG';
      case 'document': return 'Máximo 100 MB • Formatos: PDF, DOC, XLS, TXT, etc.';
      case 'sticker': return 'Máximo 500 KB (animado) o 100 KB (estático) • Formato: WebP';
      default: return '';
    }
  };

  const getMediaLimitsInfo = () => {
    switch (localData.messageType) {
      case 'image':
        return [
          '• Tamaño máximo: 5 MB',
          '• Formatos: JPEG, PNG (8-bit, RGB o RGBA)',
          '• El archivo debe ser accesible públicamente'
        ];
      case 'video':
        return [
          '• Tamaño máximo: 16 MB',
          '• Formatos: MP4, 3GP',
          '• Codec de video: H.264, Codec de audio: AAC',
          '• Solo un stream de audio o sin audio'
        ];
      case 'audio':
        return [
          '• Tamaño máximo: 16 MB',
          '• Formatos: AAC, MP3, MP4, AMR, OGG',
          '• Para OGG: solo codecs OPUS (mono)'
        ];
      case 'document':
        return [
          '• Tamaño máximo: 100 MB',
          '• Formatos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT',
          '• El archivo debe ser accesible públicamente'
        ];
      case 'sticker':
        return [
          '• Animado: máximo 500 KB',
          '• Estático: máximo 100 KB',
          '• Formato: WebP únicamente'
        ];
      default:
        return [];
    }
  };

  const getAcceptedFileTypes = () => {
    switch (localData.messageType) {
      case 'image': return 'JPEG, PNG hasta 5MB';
      case 'video': return 'MP4, 3GP hasta 16MB';
      case 'audio': return 'AAC, MP3, MP4, AMR, OGG hasta 16MB';
      case 'document': return 'PDF, DOC, XLS, TXT hasta 100MB';
      case 'sticker': return 'WebP hasta 500KB';
      default: return '';
    }
  };

  const getFileAccept = () => {
    switch (localData.messageType) {
      case 'image': return 'image/jpeg,image/png';
      case 'video': return 'video/mp4,video/3gpp';
      case 'audio': return 'audio/aac,audio/mp3,audio/mpeg,audio/mp4,audio/amr,audio/ogg';
      case 'document': return 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain';
      case 'sticker': return 'image/webp';
      default: return '';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = getFileAccept().split(',');
    if (!allowedTypes.includes(file.type)) {
      alert(`Tipo de archivo no soportado. Tipos permitidos: ${getAcceptedFileTypes()}`);
      return;
    }

    // Validar tamaño de archivo según tipo
    const maxSize = getMaxFileSize();
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / 1024 / 1024;
      alert(`El archivo es demasiado grande. Tamaño máximo permitido: ${maxSizeMB.toFixed(maxSizeMB < 1 ? 1 : 0)}${maxSizeMB < 1 ? ' KB' : ' MB'}`);
      return;
    }

    // Validaciones específicas para stickers
    if (localData.messageType === 'sticker') {
      if (file.type !== 'image/webp') {
        alert('Los stickers deben ser archivos WebP');
        return;
      }
    }

    // Crear URL del archivo para preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updateData({ 
        mediaFile: file,
        mediaFileName: file.name,
        mediaFileSize: file.size,
        mediaMimeType: file.type,
        mediaUrl: dataUrl // Para preview local
      });
    };
    reader.readAsDataURL(file);
  };

  const getMaxFileSize = () => {
    switch (localData.messageType) {
      case 'image': return 5 * 1024 * 1024; // 5 MB
      case 'video': return 16 * 1024 * 1024; // 16 MB  
      case 'audio': return 16 * 1024 * 1024; // 16 MB
      case 'document': return 100 * 1024 * 1024; // 100 MB
      case 'sticker': return 500 * 1024; // 500 KB (máximo para animados)
      default: return 5 * 1024 * 1024;
    }
  };

  // Función para obtener los tipos de archivo aceptados según el tipo de media
  const getAcceptedFileTypesForMediaType = (mediaType: string) => {
    switch (mediaType) {
      case 'image':
        return 'JPEG, PNG';
      case 'video':
        return 'MP4, 3GP';
      case 'audio':
        return 'MP3, AAC, OGG, AMR, MP4';
      case 'document':
        return 'PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT';
      case 'sticker':
        return 'WebP';
      default:
        return 'JPEG, PNG';
    }
  };

  // Función para obtener el accept attribute según el tipo de media
  const getFileAcceptForMediaType = (mediaType: string) => {
    switch (mediaType) {
      case 'image':
        return 'image/jpeg,image/png';
      case 'video':
        return 'video/mp4,video/3gpp';
      case 'audio':
        return 'audio/mpeg,audio/aac,audio/ogg,audio/amr,audio/mp4';
      case 'document':
        return 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain';
      case 'sticker':
        return 'image/webp';
      default:
        return 'image/jpeg,image/png';
    }
  };

  // Función para obtener los límites de tamaño según el tipo de media
  const getFileSizeLimitsForMediaType = (mediaType: string) => {
    switch (mediaType) {
      case 'image':
        return 'Tamaño máximo: 5MB';
      case 'video':
        return 'Tamaño máximo: 16MB';
      case 'audio':
        return 'Tamaño máximo: 16MB';
      case 'document':
        return 'Tamaño máximo: 100MB';
      case 'sticker':
        return 'Tamaño máximo: 500KB (animado), 100KB (estático)';
      default:
        return 'Tamaño máximo: 5MB';
    }
  };

  // Función para obtener el label del tipo de media
  const getMediaTypeLabel = (mediaType: string) => {
    switch (mediaType) {
      case 'image':
        return 'Imagen';
      case 'video':
        return 'Video';
      case 'audio':
        return 'Audio';
      case 'document':
        return 'Documento';
      case 'sticker':
        return 'Sticker';
      default:
        return 'Imagen';
    }
  };

  // Función para obtener información de límites específica por tipo
  const getMediaLimitsInfoForType = (mediaType: string) => {
    switch (mediaType) {
      case 'image':
        return [
          '• Formatos: JPEG, PNG',
          '• Tamaño máximo: 5MB',
          '• Colores: 8-bit RGB o RGBA'
        ];
      case 'video':
        return [
          '• Formatos: MP4, 3GP',
          '• Tamaño máximo: 16MB',
          '• Codec: H.264 + AAC audio'
        ];
      case 'audio':
        return [
          '• Formatos: AAC, MP3, MP4, AMR, OGG',
          '• Tamaño máximo: 16MB',
          '• OGG requiere OPUS codec'
        ];
      case 'document':
        return [
          '• Formatos: PDF, DOC, XLS, PPT, TXT',
          '• Tamaño máximo: 100MB',
          '• Office y documentos comunes'
        ];
      case 'sticker':
        return [
          '• Formato: WebP únicamente',
          '• Animado: 500KB máximo',
          '• Estático: 100KB máximo'
        ];
      default:
        return [
          '• Formatos: JPEG, PNG',
          '• Tamaño máximo: 5MB'
        ];
    }
  };

  return (
    <>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <Card className={`w-80 ${selected ? 'ring-2 ring-green-500' : ''} bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-100 rounded-full">
                <MessageIcon className="h-4 w-4 text-green-600" />
              </div>
              {InteractiveIcon && (
                <div className="p-1 bg-blue-100 rounded-full">
                  <InteractiveIcon className="h-3 w-3 text-blue-600" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm font-medium text-gray-900 truncate">{localData.label}</CardTitle>
                <Badge variant="secondary" className="text-xs mt-1">
                  {getTypeLabel()}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsConfigOpen(true)}
              className="h-8 w-8 p-0 hover:bg-green-100"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 pb-4">
          {/* Vista previa estilo WhatsApp */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3 max-h-32 overflow-y-auto">
            {/* Header si existe */}
            {localData.hasHeader && localData.header && (
              <div className="mb-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                📎 {localData.header.type}: {localData.header.content}
              </div>
            )}
            
            {/* Burbuja de mensaje principal */}
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-sm text-gray-800 leading-relaxed flex-1">
                {localData.text || 'Mensaje sin texto...'}
              </div>
            </div>
            
            {/* Footer si existe */}
            {localData.hasFooter && localData.footer && (
              <div className="mt-2 text-xs text-gray-500">
                {localData.footer}
              </div>
            )}
            
            {/* Botones interactivos */}
            {localData.hasButtons && localData.buttons.length > 0 && (
              <div className="mt-3 space-y-1">
                {localData.buttons.map((button) => (
                  <div key={button.id} className="flex items-center gap-2 p-1 bg-blue-50 rounded text-xs">
                    <MousePointer className="h-3 w-3 text-blue-600" />
                    <span className="text-blue-700 font-medium">{button.title || 'Sin título'}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Lista interactiva */}
            {localData.hasListMenu && localData.listMenu.sections.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded text-xs mb-2">
                  <List className="h-3 w-3 text-indigo-600" />
                  <span className="text-indigo-700 font-medium">{localData.listMenu.button}</span>
                </div>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {localData.listMenu.sections.map((section, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="font-medium text-gray-700">{section.title}</div>
                      {section.rows.map((row) => (
                        <div key={row.id} className="ml-2 text-gray-600">• {row.title}</div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Estadísticas del nodo */}
          <div className="space-y-1 text-xs text-gray-600">
            {localData.hasVariables && localData.variables.length > 0 && (
              <div className="flex items-center gap-1">
                <Type className="h-3 w-3" />
                <span>{localData.variables.length} variables</span>
              </div>
            )}
            
            {localData.hasButtons && (
              <div className="flex items-center gap-1">
                <MousePointer className="h-3 w-3" />
                <span>{localData.buttons.length} botones</span>
              </div>
            )}
            
            {localData.hasListMenu && (
              <div className="flex items-center gap-1">
                <List className="h-3 w-3" />
                <span>{localData.listMenu.sections.reduce((acc, s) => acc + s.rows.length, 0)} opciones</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Handles de salida dinámicos */}
      {getOutputHandles().map((handle, index) => (
        <Handle 
          key={handle.id}
          type="source" 
          position={Position.Bottom} 
          id={handle.id}
          style={handle.style}
          className="w-3 h-3"
        />
      ))}

      {/* Modal de configuración */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              Configurar Mensaje WhatsApp
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="content" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 mb-4 h-auto">
                <TabsTrigger value="content" className="text-xs py-2 px-2">Contenido</TabsTrigger>
                <TabsTrigger value="interactive" className="text-xs py-2 px-1">Interactivo</TabsTrigger>
                <TabsTrigger value="media" className="text-xs py-2 px-2">Media</TabsTrigger>
                <TabsTrigger value="advanced" className="text-xs py-2 px-2">Avanzado</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto">
                <TabsContent value="content" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="label">Título del Nodo</Label>
                        <Input
                          id="label"
                          value={localData.label}
                          onChange={(e) => updateData({ label: e.target.value })}
                          placeholder="Ej: Mensaje de bienvenida"
                        />
                      </div>

                      <div>
                        <Label htmlFor="messageType">Tipo de Mensaje</Label>
                        <Select value={localData.messageType} onValueChange={(value: any) => updateData({ messageType: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Texto</SelectItem>
                            <SelectItem value="image">Imagen</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="audio">Audio</SelectItem>
                            <SelectItem value="document">Documento</SelectItem>
                            <SelectItem value="location">Ubicación</SelectItem>
                            <SelectItem value="contact">Contacto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="text">Texto del Mensaje</Label>
                        <Textarea
                          id="text"
                          value={localData.text}
                          onChange={(e) => updateData({ text: e.target.value })}
                          placeholder="Escribe tu mensaje aquí..."
                          rows={4}
                          maxLength={1024}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {localData.text.length}/1024 caracteres
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Header opcional */}
                      <div className="flex items-center justify-between">
                        <Label>Incluir Header</Label>
                        <Switch
                          checked={localData.hasHeader}
                          onCheckedChange={(checked) => updateData({ hasHeader: checked })}
                        />
                      </div>
                      
                      {localData.hasHeader && (
                        <div className="space-y-2">
                          <Select 
                            value={localData.header?.type || 'text'} 
                            onValueChange={(value: any) => updateData({ 
                              header: { ...localData.header, type: value, content: localData.header?.content || '' }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Tipo de header" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Texto</SelectItem>
                              <SelectItem value="image">Imagen</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="document">Documento</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            value={localData.header?.content || ''}
                            onChange={(e) => updateData({ 
                              header: { ...localData.header!, content: e.target.value }
                            })}
                            placeholder="Contenido del header"
                            maxLength={60}
                          />
                        </div>
                      )}

                      {/* Footer opcional */}
                      <div className="flex items-center justify-between">
                        <Label>Incluir Footer</Label>
                        <Switch
                          checked={localData.hasFooter}
                          onCheckedChange={(checked) => updateData({ hasFooter: checked })}
                        />
                      </div>
                      
                      {localData.hasFooter && (
                        <Input
                          value={localData.footer || ''}
                          onChange={(e) => updateData({ footer: e.target.value })}
                          placeholder="Texto del footer (opcional)"
                          maxLength={60}
                        />
                      )}

                      {/* Vista previa URL */}
                      <div className="flex items-center justify-between">
                        <Label>Vista Previa de URLs</Label>
                        <Switch
                          checked={localData.previewUrl}
                          onCheckedChange={(checked) => updateData({ previewUrl: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="interactive" className="space-y-6">
                  <div className="space-y-6">
                    {/* Botones de Respuesta */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium">Botones de Respuesta</h3>
                          <p className="text-sm text-gray-500">Máximo 3 botones según WhatsApp API</p>
                        </div>
                        <Switch
                          checked={localData.hasButtons}
                          onCheckedChange={(checked) => updateData({ 
                            hasButtons: checked,
                            interactiveType: checked ? 'buttons' : 'none'
                          })}
                        />
                      </div>
                      
                      {localData.hasButtons && (
                        <div className="space-y-4">
                          <Button 
                            onClick={addButton} 
                            disabled={localData.buttons.length >= 3}
                            variant="outline" 
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Botón ({localData.buttons.length}/3)
                          </Button>
                          
                          <div className="space-y-3">
                            {localData.buttons.map((button, index) => (
                              <div key={button.id} className="border rounded p-3 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm">Botón {index + 1}</span>
                                  <Button
                                    onClick={() => removeButton(button.id)}
                                    variant="ghost"
                                    size="sm"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label>Tipo</Label>
                                    <Select 
                                      value={button.type} 
                                      onValueChange={(value: any) => {
                                        const updatedButtons = localData.buttons.map(b => 
                                          b.id === button.id ? { ...b, type: value } : b
                                        );
                                        updateData({ buttons: updatedButtons });
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="reply">Respuesta</SelectItem>
                                        <SelectItem value="url">URL</SelectItem>
                                        <SelectItem value="call">Llamada</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div>
                                    <Label>Título</Label>
                                    <Input
                                      value={button.title}
                                      onChange={(e) => {
                                        const updatedButtons = localData.buttons.map(b => 
                                          b.id === button.id ? { ...b, title: e.target.value } : b
                                        );
                                        updateData({ buttons: updatedButtons });
                                      }}
                                      placeholder="Título del botón"
                                      maxLength={20}
                                    />
                                  </div>
                                </div>
                                
                                {button.type === 'reply' && (
                                  <div>
                                    <Label>ID/Payload</Label>
                                    <Input
                                      value={button.payload || ''}
                                      onChange={(e) => {
                                        const updatedButtons = localData.buttons.map(b => 
                                          b.id === button.id ? { ...b, payload: e.target.value } : b
                                        );
                                        updateData({ buttons: updatedButtons });
                                      }}
                                      placeholder="ID único para webhook"
                                    />
                                  </div>
                                )}
                                
                                {button.type === 'url' && (
                                  <div>
                                    <Label>URL</Label>
                                    <Input
                                      value={button.url || ''}
                                      onChange={(e) => {
                                        const updatedButtons = localData.buttons.map(b => 
                                          b.id === button.id ? { ...b, url: e.target.value } : b
                                        );
                                        updateData({ buttons: updatedButtons });
                                      }}
                                      placeholder="https://..."
                                    />
                                  </div>
                                )}
                                
                                {button.type === 'call' && (
                                  <div>
                                    <Label>Número de Teléfono</Label>
                                    <Input
                                      value={button.phoneNumber || ''}
                                      onChange={(e) => {
                                        const updatedButtons = localData.buttons.map(b => 
                                          b.id === button.id ? { ...b, phoneNumber: e.target.value } : b
                                        );
                                        updateData({ buttons: updatedButtons });
                                      }}
                                      placeholder="+1234567890"
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Lista Interactiva */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium">Lista Interactiva</h3>
                          <p className="text-sm text-gray-500">Máximo 10 opciones por lista según WhatsApp API</p>
                        </div>
                        <Switch
                          checked={localData.hasListMenu}
                          onCheckedChange={(checked) => updateData({ 
                            hasListMenu: checked,
                            interactiveType: checked ? 'list' : (localData.hasButtons ? 'buttons' : 'none')
                          })}
                        />
                      </div>
                      
                      {localData.hasListMenu && (
                        <div className="space-y-4">
                          <div>
                            <Label>Texto del Botón CTA</Label>
                            <Input
                              value={localData.listMenu.button}
                              onChange={(e) => updateData({ 
                                listMenu: { ...localData.listMenu, button: e.target.value }
                              })}
                              placeholder="Ver opciones"
                              maxLength={20}
                            />
                          </div>
                          
                          <Button onClick={addListSection} variant="outline" className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Sección
                          </Button>
                          
                          <div className="space-y-4">
                            {localData.listMenu.sections.map((section, sectionIndex) => (
                              <div key={sectionIndex} className="border rounded p-3">
                                <div className="space-y-3">
                                  <div>
                                    <Label>Título de Sección</Label>
                                    <Input
                                      value={section.title}
                                      onChange={(e) => {
                                        const sections = [...localData.listMenu.sections];
                                        sections[sectionIndex].title = e.target.value;
                                        updateData({ 
                                          listMenu: { ...localData.listMenu, sections }
                                        });
                                      }}
                                      placeholder="Título de la sección"
                                      maxLength={24}
                                    />
                                  </div>
                                  
                                  <Button 
                                    onClick={() => addListRow(sectionIndex)}
                                    variant="outline" 
                                    size="sm"
                                    disabled={section.rows.length >= 10}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Agregar Opción ({section.rows.length}/10)
                                  </Button>
                                  
                                  <div className="space-y-2">
                                    {section.rows.map((row, rowIndex) => (
                                      <div key={row.id} className="bg-gray-50 rounded p-2 space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <Label className="text-xs">Título</Label>
                                            <Input
                                              value={row.title}
                                              onChange={(e) => {
                                                const sections = [...localData.listMenu.sections];
                                                sections[sectionIndex].rows[rowIndex].title = e.target.value;
                                                updateData({ 
                                                  listMenu: { ...localData.listMenu, sections }
                                                });
                                              }}
                                              placeholder="Título de la opción"
                                              maxLength={24}
                                              className="h-8"
                                            />
                                          </div>
                                          <div>
                                            <Label className="text-xs">Descripción</Label>
                                            <Input
                                              value={row.description || ''}
                                              onChange={(e) => {
                                                const sections = [...localData.listMenu.sections];
                                                sections[sectionIndex].rows[rowIndex].description = e.target.value;
                                                updateData({ 
                                                  listMenu: { ...localData.listMenu, sections }
                                                });
                                              }}
                                              placeholder="Descripción opcional"
                                              maxLength={72}
                                              className="h-8"
                                            />
                                          </div>
                                        </div>
                                        <Button
                                          onClick={() => {
                                            const sections = [...localData.listMenu.sections];
                                            sections[sectionIndex].rows.splice(rowIndex, 1);
                                            updateData({ 
                                              listMenu: { ...localData.listMenu, sections }
                                            });
                                          }}
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 text-red-600"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-4">Configuración de Media</h3>
                    
                    {/* Información sobre el tipo actual */}
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Tipo de mensaje actual:</strong> {getTypeLabel()}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Puedes agregar archivos multimedia a cualquier tipo de mensaje como contenido adicional
                      </p>
                    </div>

                    {/* Funcionalidad de media siempre disponible */}
                    <div className="space-y-6">
                      {/* Toggle para habilitar media */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Incluir Archivo Multimedia</Label>
                          <Switch
                            checked={localData.enableMedia || false}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateData({ 
                                  enableMedia: true,
                                  mediaType: 'image',
                                  mediaUrl: ''
                                });
                              } else {
                                updateData({ 
                                  enableMedia: false,
                                  mediaUrl: undefined, 
                                  mediaFile: undefined,
                                  mediaFileName: undefined,
                                  mediaFileSize: undefined,
                                  mediaMimeType: undefined,
                                  mediaCaption: undefined,
                                  mediaType: undefined
                                });
                              }
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Agrega una imagen, video, audio, documento o sticker a tu mensaje
                        </p>
                      </div>

                      {/* Configuración de media cuando está habilitada */}
                      {localData.enableMedia && (
                        <>
                          {/* Selector de tipo de archivo */}
                          <div className="space-y-2">
                            <Label>Tipo de Archivo</Label>
                            <Select 
                              value={localData.mediaType || 'image'} 
                              onValueChange={(value) => updateData({ mediaType: value as any })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="image">📷 Imagen (JPEG, PNG)</SelectItem>
                                <SelectItem value="video">🎥 Video (MP4, 3GP)</SelectItem>
                                <SelectItem value="audio">🎵 Audio (MP3, AAC, OGG)</SelectItem>
                                <SelectItem value="document">📄 Documento (PDF, DOC, XLS)</SelectItem>
                                <SelectItem value="sticker">😀 Sticker (WebP)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Selector de método de media */}
                          <div className="space-y-2">
                            <Label>Método de Media</Label>
                            <div className="flex gap-4">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name="mediaMethod"
                                  value="url"
                                  checked={!localData.mediaFile}
                                  onChange={() => updateData({ mediaFile: undefined, mediaFileName: undefined })}
                                  className="h-4 w-4"
                                />
                                <span>URL Externa</span>
                              </label>
                              <label className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name="mediaMethod"
                                  value="upload"
                                  checked={!!localData.mediaFile}
                                  onChange={() => updateData({ mediaUrl: '' })}
                                  className="h-4 w-4"
                                />
                                <span>Subir Archivo</span>
                              </label>
                            </div>
                          </div>

                          {/* URL Externa */}
                          {!localData.mediaFile && (
                            <div className="space-y-2">
                              <Label>URL del Archivo</Label>
                              <Input
                                value={localData.mediaUrl || ''}
                                onChange={(e) => updateData({ mediaUrl: e.target.value })}
                                placeholder="https://ejemplo.com/archivo"
                              />
                              <p className="text-xs text-gray-500">
                                Proporciona una URL pública y accesible del archivo
                              </p>
                            </div>
                          )}

                          {/* Subida de archivo */}
                          {localData.mediaFile && (
                            <div className="space-y-4">
                              <div>
                                <Label>Archivo Subido</Label>
                                <div className="mt-2 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="flex-shrink-0">
                                        {(localData.mediaType === 'image' || !localData.mediaType) && <Image className="h-8 w-8 text-blue-500" />}
                                        {localData.mediaType === 'video' && <Video className="h-8 w-8 text-purple-500" />}
                                        {localData.mediaType === 'audio' && <Volume2 className="h-8 w-8 text-green-500" />}
                                        {localData.mediaType === 'document' && <FileText className="h-8 w-8 text-orange-500" />}
                                        {localData.mediaType === 'sticker' && <Smile className="h-8 w-8 text-yellow-500" />}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{localData.mediaFileName}</p>
                                        <p className="text-xs text-gray-500">
                                          {(localData.mediaFileSize! / 1024 / 1024).toFixed(2)} MB • {localData.mediaMimeType}
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => updateData({ 
                                        mediaFile: undefined, 
                                        mediaFileName: undefined,
                                        mediaFileSize: undefined,
                                        mediaMimeType: undefined
                                      })}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Subir nuevo archivo */}
                          {!localData.mediaFile && (
                            <div>
                              <Label>Subir Archivo</Label>
                              <div className="mt-2">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                    <p className="mb-2 text-sm text-gray-500">
                                      <span className="font-semibold">Click para subir</span> o arrastra y suelta
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {getAcceptedFileTypesForMediaType(localData.mediaType || 'image')}
                                    </p>
                                  </div>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept={getFileAcceptForMediaType(localData.mediaType || 'image')}
                                    onChange={handleFileUpload}
                                  />
                                </label>
                              </div>
                              <div className="mt-2 text-xs text-gray-500">
                                {getFileSizeLimitsForMediaType(localData.mediaType || 'image')}
                              </div>
                            </div>
                          )}

                          {/* Caption/Leyenda */}
                          <div className="space-y-2">
                            <Label>Leyenda/Caption (opcional)</Label>
                            <Textarea
                              value={localData.mediaCaption || ''}
                              onChange={(e) => updateData({ mediaCaption: e.target.value })}
                              placeholder="Descripción del archivo..."
                              rows={3}
                              maxLength={1024}
                            />
                            <p className="text-xs text-gray-500">
                              {(localData.mediaCaption || '').length}/1024 caracteres
                            </p>
                          </div>

                          {/* Información de límites según tipo */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-blue-800 mb-2">
                              Límites para {getMediaTypeLabel(localData.mediaType || 'image')}
                            </h4>
                            <div className="text-xs text-blue-700 space-y-1">
                              {getMediaLimitsInfoForType(localData.mediaType || 'image').map((info, index) => (
                                <div key={index}>{info}</div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Configuración adicional para mensajes de texto */}
                      {localData.messageType === 'text' && (
                        <div className="border-t pt-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Vista Previa de URLs</Label>
                              <Switch
                                checked={localData.previewUrl}
                                onCheckedChange={(checked) => updateData({ previewUrl: checked })}
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              Cuando está habilitado, las URLs en el mensaje mostrarán una vista previa automática
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-4">Variables Dinámicas</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Usar Variables</Label>
                        <Switch
                          checked={localData.hasVariables}
                          onCheckedChange={(checked) => updateData({ hasVariables: checked })}
                        />
                      </div>
                      {localData.hasVariables && (
                        <div>
                          <Label>Variables (una por línea)</Label>
                          <Textarea
                            value={localData.variables.join('\n')}
                            onChange={(e) => updateData({ variables: e.target.value.split('\n').filter(Boolean) })}
                            placeholder="{{nombre}}&#10;{{email}}&#10;{{telefono}}"
                            rows={4}
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            Usa dobles llaves para las variables: {'{{variable}}'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsConfigOpen(false)} className="bg-green-600 hover:bg-green-700">
                  Guardar Configuración
                </Button>
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 