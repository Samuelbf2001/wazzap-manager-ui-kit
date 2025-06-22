import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Database, 
  Upload, 
  FileText, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  Filter,
  RefreshCw,
  ArrowLeft,
  File,
  FileType,
  Calendar,
  HardDrive,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Settings
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'html';
  size: string;
  uploadDate: Date;
  status: 'processed' | 'processing' | 'error';
  chunks: number;
  extractedText?: string;
  metadata?: {
    pages?: number;
    language?: string;
    keywords?: string[];
  };
}

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  documentsCount: number;
  size: string;
  created: Date;
  lastUpdated: Date;
  status: 'ready' | 'processing' | 'error';
  documents?: Document[];
  settings?: {
    chunkSize: number;
    overlap: number;
    embeddingModel: string;
    indexType: 'semantic' | 'keyword' | 'hybrid';
  };
}

interface KnowledgeBaseManagerProps {
  onBack: () => void;
  knowledgeBases: KnowledgeBase[];
  onKnowledgeBaseUpdated: (kbs: KnowledgeBase[]) => void;
}

export function KnowledgeBaseManager({ onBack, knowledgeBases, onKnowledgeBaseUpdated }: KnowledgeBaseManagerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null);
  const [showCreateKB, setShowCreateKB] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formulario para nueva KB
  const [newKB, setNewKB] = useState({
    name: '',
    description: '',
    chunkSize: 1000,
    overlap: 200,
    embeddingModel: 'text-embedding-ada-002',
    indexType: 'hybrid' as const
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !selectedKB) return;

    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Simular proceso de upload
      await new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress((i / files.length) * 100 + (progress / files.length));
          if (progress >= 100) {
            clearInterval(interval);
            resolve(true);
          }
        }, 200);
      });

      // Crear documento simulado
      const newDocument: Document = {
        id: Date.now().toString() + i,
        name: file.name,
        type: file.name.split('.').pop() as any || 'pdf',
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadDate: new Date(),
        status: 'processing',
        chunks: 0,
        metadata: {
          pages: Math.floor(Math.random() * 50) + 1,
          language: 'es',
          keywords: ['producto', 'servicio', 'cliente']
        }
      };

      // Actualizar KB
      const updatedKBs = knowledgeBases.map(kb => {
        if (kb.id === selectedKB.id) {
          return {
            ...kb,
            documents: [...(kb.documents || []), newDocument],
            documentsCount: (kb.documents?.length || 0) + 1,
            lastUpdated: new Date()
          };
        }
        return kb;
      });

      onKnowledgeBaseUpdated(updatedKBs);
      setSelectedKB(prev => prev ? {
        ...prev,
        documents: [...(prev.documents || []), newDocument],
        documentsCount: (prev.documents?.length || 0) + 1
      } : null);
    }

    setIsUploading(false);
    setUploadProgress(0);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const createKnowledgeBase = () => {
    const newKnowledgeBase: KnowledgeBase = {
      id: Date.now().toString(),
      name: newKB.name,
      description: newKB.description,
      documentsCount: 0,
      size: '0 MB',
      created: new Date(),
      lastUpdated: new Date(),
      status: 'ready',
      documents: [],
      settings: {
        chunkSize: newKB.chunkSize,
        overlap: newKB.overlap,
        embeddingModel: newKB.embeddingModel,
        indexType: newKB.indexType
      }
    };

    onKnowledgeBaseUpdated([...knowledgeBases, newKnowledgeBase]);
    setShowCreateKB(false);
    setNewKB({
      name: '',
      description: '',
      chunkSize: 1000,
      overlap: 200,
      embeddingModel: 'text-embedding-ada-002',
      indexType: 'hybrid'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed': return CheckCircle;
      case 'processing': return Clock;
      case 'error': return AlertCircle;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'text-green-600';
      case 'processing': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (showCreateKB) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => setShowCreateKB(false)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Crear Nueva Knowledge Base</h1>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Configuración de Knowledge Base
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={newKB.name}
                  onChange={(e) => setNewKB(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Base de Conocimiento de Productos"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newKB.description}
                  onChange={(e) => setNewKB(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe el propósito y contenido de esta knowledge base..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chunkSize">Tamaño de Chunk</Label>
                  <Input
                    id="chunkSize"
                    type="number"
                    value={newKB.chunkSize}
                    onChange={(e) => setNewKB(prev => ({ ...prev, chunkSize: parseInt(e.target.value) }))}
                    min="100"
                    max="4000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overlap">Overlap</Label>
                  <Input
                    id="overlap"
                    type="number"
                    value={newKB.overlap}
                    onChange={(e) => setNewKB(prev => ({ ...prev, overlap: parseInt(e.target.value) }))}
                    min="0"
                    max="500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Modelo de Embeddings</Label>
                  <Select
                    value={newKB.embeddingModel}
                    onValueChange={(value) => setNewKB(prev => ({ ...prev, embeddingModel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-embedding-ada-002">Ada-002 (OpenAI)</SelectItem>
                      <SelectItem value="text-embedding-3-small">Embedding-3-Small</SelectItem>
                      <SelectItem value="text-embedding-3-large">Embedding-3-Large</SelectItem>
                      <SelectItem value="sentence-transformers">Sentence Transformers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Índice</Label>
                  <Select
                    value={newKB.indexType}
                    onValueChange={(value: 'semantic' | 'keyword' | 'hybrid') => setNewKB(prev => ({ ...prev, indexType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semantic">Semántico</SelectItem>
                      <SelectItem value="keyword">Palabras Clave</SelectItem>
                      <SelectItem value="hybrid">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateKB(false)}>
                Cancelar
              </Button>
              <Button onClick={createKnowledgeBase} disabled={!newKB.name}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Knowledge Base
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedKB) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedKB(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{selectedKB.name}</h1>
              <p className="text-gray-600">{selectedKB.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Subir Documentos
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.html"
          className="hidden"
          onChange={handleFileUpload}
        />

        {isUploading && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Subiendo documentos...</span>
                  <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Documentos</p>
                  <p className="text-2xl font-bold">{selectedKB.documents?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Procesados</p>
                  <p className="text-2xl font-bold">
                    {selectedKB.documents?.filter(d => d.status === 'processed').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Procesando</p>
                  <p className="text-2xl font-bold">
                    {selectedKB.documents?.filter(d => d.status === 'processing').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <HardDrive className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tamaño Total</p>
                  <p className="text-2xl font-bold">{selectedKB.size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos ({selectedKB.documents?.length || 0})
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar documentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {selectedKB.documents?.map((doc) => {
                const StatusIcon = getStatusIcon(doc.status);
                return (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <File className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{doc.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {doc.type.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <HardDrive className="h-3 w-3" />
                            {doc.size}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {doc.uploadDate.toLocaleDateString()}
                          </span>
                          {doc.metadata?.pages && (
                            <span className="flex items-center gap-1">
                              <FileType className="h-3 w-3" />
                              {doc.metadata.pages} páginas
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-1 ${getStatusColor(doc.status)}`}>
                        <StatusIcon className="h-4 w-4" />
                        <span className="text-xs font-medium">
                          {doc.status === 'processed' && 'Procesado'}
                          {doc.status === 'processing' && 'Procesando'}
                          {doc.status === 'error' && 'Error'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Knowledge Base Manager</h1>
            <p className="text-gray-600">Gestiona tus bases de conocimiento y documentos</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowCreateKB(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Knowledge Base
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {knowledgeBases.map((kb) => (
          <Card key={kb.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedKB(kb)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Database className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium">{kb.name}</CardTitle>
                    <p className="text-xs text-gray-500 line-clamp-2">{kb.description}</p>
                  </div>
                </div>
                <Badge variant="outline">
                  {kb.status === 'ready' && 'Listo'}
                  {kb.status === 'processing' && 'Procesando'}
                  {kb.status === 'error' && 'Error'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-gray-500">Documentos</p>
                    <p className="font-medium">{kb.documentsCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tamaño</p>
                    <p className="font-medium">{kb.size}</p>
                  </div>
                </div>
                
                <div className="text-xs">
                  <p className="text-gray-500">Última actualización</p>
                  <p className="font-medium">{kb.lastUpdated.toLocaleDateString()}</p>
                </div>

                <div className="flex items-center justify-end pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedKB(kb); }}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}