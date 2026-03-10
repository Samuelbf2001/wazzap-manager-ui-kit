import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  Edit,
  Copy,
  Download,
  Trash2,
  Eye,
  Calendar,
  Target,
  BarChart3,
  Workflow
} from 'lucide-react';
import { FlowListItem } from '@/types/flow';
import { FlowsService } from '@/services/flows.service';

interface FlowsListProps {
  onCreateNew: () => void;
  onEditFlow: (flowId: string) => void;
  onViewFlow: (flowId: string) => void;
}

export function FlowsList({ onCreateNew, onEditFlow, onViewFlow }: FlowsListProps) {
  const [flows, setFlows] = useState<FlowListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Cargar flujos
  const loadFlows = async () => {
    setLoading(true);
    try {
      // Inicializar datos de ejemplo si no hay flujos
      FlowsService.initializeSampleData();
      
      const flowsList = FlowsService.getFlows();
      setFlows(flowsList);
    } catch (error) {
      console.error('Error al cargar flujos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlows();
  }, []);

  // Filtrar flujos
  const filteredFlows = flows.filter(flow => {
    const matchesSearch = flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (flow.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = statusFilter === 'all' || flow.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || flow.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Obtener categorías únicas
  const categories = Array.from(new Set(flows.map(f => f.category).filter(Boolean)));

  // Manejar duplicación
  const handleDuplicate = async (flowId: string) => {
    try {
      const duplicated = FlowsService.duplicateFlow(flowId);
      if (duplicated) {
        await loadFlows(); // Recargar lista
      }
    } catch (error) {
      console.error('Error al duplicar flujo:', error);
    }
  };

  // Manejar eliminación
  const handleDelete = async (flowId: string) => {
    try {
      const success = FlowsService.deleteFlow(flowId);
      if (success) {
        await loadFlows(); // Recargar lista
      }
    } catch (error) {
      console.error('Error al eliminar flujo:', error);
    }
  };

  // Manejar cambio de estado
  const handleStatusChange = async (flowId: string, newStatus: 'draft' | 'active' | 'inactive') => {
    try {
      const success = FlowsService.changeFlowStatus(flowId, newStatus);
      if (success) {
        await loadFlows(); // Recargar lista
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  // Manejar exportación
  const handleExport = (flowId: string) => {
    try {
      const exportData = FlowsService.exportFlow(flowId);
      if (exportData) {
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flow_${flowId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error al exportar flujo:', error);
    }
  };

  // Obtener color del badge por estado
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'inactive': return 'outline';
      default: return 'secondary';
    }
  };

  // Formatear fecha
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Vista de estado vacío
  if (!loading && flows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="text-center space-y-2">
          <Workflow className="h-16 w-16 text-gray-400 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-900">No hay flujos creados</h3>
          <p className="text-gray-500 max-w-md">
            Comienza creando tu primer flujo de conversación automatizado para WhatsApp
          </p>
        </div>
        <Button onClick={onCreateNew} size="lg" className="mt-4">
          <Plus className="h-4 w-4 mr-2" />
          Crear Primer Flujo
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Flujos de Conversación</h2>
          <p className="text-gray-600 mt-1">
            Gestiona y organiza tus flujos automatizados de WhatsApp
          </p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Flujo
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{flows.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold">{flows.filter(f => f.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Edit className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Borrador</p>
                <p className="text-2xl font-bold">{flows.filter(f => f.status === 'draft').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ejecuciones</p>
                <p className="text-2xl font-bold">
                  {flows.reduce((sum, f) => sum + (f.statistics?.totalExecutions || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar flujos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="inactive">Inactivo</SelectItem>
          </SelectContent>
        </Select>
        {categories.length > 0 && (
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category || ''}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Lista de flujos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFlows.map((flow) => (
          <Card key={flow.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold truncate">
                    {flow.name}
                  </CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">
                    {flow.description || 'Sin descripción'}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onViewFlow(flow.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditFlow(flow.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(flow.id)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {flow.status === 'active' ? (
                      <DropdownMenuItem onClick={() => handleStatusChange(flow.id, 'inactive')}>
                        <Pause className="h-4 w-4 mr-2" />
                        Pausar
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => handleStatusChange(flow.id, 'active')}>
                        <Play className="h-4 w-4 mr-2" />
                        Activar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleExport(flow.id)}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar flujo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. El flujo "{flow.name}" será eliminado permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(flow.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Estado y métricas */}
                <div className="flex items-center justify-between">
                  <Badge variant={getStatusBadgeVariant(flow.status)}>
                    {flow.status === 'active' ? 'Activo' : 
                     flow.status === 'draft' ? 'Borrador' : 'Inactivo'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {flow.nodeCount} nodos
                  </span>
                </div>

                {/* Tags */}
                {flow.tags && flow.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {flow.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {flow.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{flow.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Estadísticas */}
                {flow.statistics && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{flow.statistics.totalExecutions} ejecuciones</span>
                    <span>{flow.statistics.successRate.toFixed(1)}% éxito</span>
                  </div>
                )}

                {/* Fechas */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Actualizado {formatDate(flow.updatedAt)}
                  </div>
                </div>

                {/* Botones de acción rápida */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onViewFlow(flow.id)}
                    className="flex-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => onEditFlow(flow.id)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Sin resultados */}
      {!loading && filteredFlows.length === 0 && flows.length > 0 && (
        <div className="text-center py-8">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No se encontraron flujos</h3>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}
    </div>
  );
} 