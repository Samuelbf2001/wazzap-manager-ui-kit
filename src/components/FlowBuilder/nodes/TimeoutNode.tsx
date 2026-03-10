import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Clock, 
  Timer, 
  AlertCircle, 
  Play, 
  Settings, 
  RefreshCw,
  UserX,
  XCircle,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

interface TimeoutData {
  // Configuración básica
  label: string;
  duration: number; // en segundos
  timeoutType: 'absolute' | 'inactivity';
  description?: string;
  
  // Advertencia previa
  showWarning: boolean;
  warningTime: number; // segundos antes del timeout
  warningMessage?: string;
  
  // Extensión de tiempo
  allowExtension: boolean;
  extensionTime: number; // segundos adicionales
  maxExtensions: number;
  
  // Acciones al timeout
  timeoutAction: 'continue' | 'end' | 'retry' | 'escalate' | 'custom';
  customPath?: string;
  
  // Reintentos
  maxRetries: number;
  retryDelay: number; // segundos entre reintentos
  
  // Mensajes personalizados
  timeoutMessage?: string;
  retryMessage?: string;
  finalTimeoutMessage?: string;
}

export function TimeoutNode({ data, selected }: { data: Partial<TimeoutData>; selected?: boolean }) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [localData, setLocalData] = useState<TimeoutData>({
    label: data.label || 'Tiempo de Espera',
    duration: data.duration || 30,
    timeoutType: data.timeoutType || 'inactivity',
    description: data.description || 'Esperando respuesta del usuario',
    showWarning: data.showWarning || false,
    warningTime: data.warningTime || 10,
    warningMessage: data.warningMessage || '⏰ Te quedan {time} segundos para responder',
    allowExtension: data.allowExtension || false,
    extensionTime: data.extensionTime || 30,
    maxExtensions: data.maxExtensions || 1,
    timeoutAction: data.timeoutAction || 'continue',
    maxRetries: data.maxRetries || 0,
    retryDelay: data.retryDelay || 5,
    timeoutMessage: data.timeoutMessage || '⏱️ Se agotó el tiempo de espera',
    retryMessage: data.retryMessage || '🔄 Reintentando... ({retry}/{maxRetries})',
    finalTimeoutMessage: data.finalTimeoutMessage || '❌ No se recibió respuesta después de varios intentos',
    ...data
  });

  const updateData = (updates: Partial<TimeoutData>) => {
    setLocalData(prev => ({ ...prev, ...updates }));
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getTimeoutTypeLabel = () => {
    switch (localData.timeoutType) {
      case 'absolute': return 'Tiempo Absoluto';
      case 'inactivity': return 'Inactividad';
      default: return 'Inactividad';
    }
  };

  const getActionLabel = () => {
    switch (localData.timeoutAction) {
      case 'continue': return 'Continuar Flujo';
      case 'end': return 'Finalizar';
      case 'retry': return 'Reintentar';
      case 'escalate': return 'Escalar a Humano';
      case 'custom': return 'Ruta Personalizada';
      default: return 'Continuar';
    }
  };

  const getActionIcon = () => {
    switch (localData.timeoutAction) {
      case 'continue': return ArrowRight;
      case 'end': return XCircle;
      case 'retry': return RefreshCw;
      case 'escalate': return UserX;
      case 'custom': return Play;
      default: return ArrowRight;
    }
  };

  const ActionIcon = getActionIcon();

  return (
    <div className={`bg-white rounded-lg border-2 transition-all ${
      selected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-amber-100 rounded">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="font-medium text-sm">{localData.label}</h3>
            <p className="text-xs text-gray-500">Tiempo: {formatTime(localData.duration)}</p>
          </div>
        </div>
        
        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configuración de Tiempo de Espera</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-auto">
                <TabsTrigger value="basic" className="text-xs py-2 px-1">Básico</TabsTrigger>
                <TabsTrigger value="warning" className="text-xs py-2 px-1">Advertencia</TabsTrigger>
                <TabsTrigger value="actions" className="text-xs py-2 px-1">Acciones</TabsTrigger>
                <TabsTrigger value="messages" className="text-xs py-2 px-1">Mensajes</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="label">Etiqueta del Nodo</Label>
                      <Input
                        id="label"
                        value={localData.label}
                        onChange={(e) => updateData({ label: e.target.value })}
                        placeholder="Tiempo de Espera"
                      />
                    </div>

                    <div>
                      <Label htmlFor="duration">Duración (segundos)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        max="3600"
                        value={localData.duration}
                        onChange={(e) => updateData({ duration: parseInt(e.target.value) || 30 })}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Formato legible: {formatTime(localData.duration)}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="timeoutType">Tipo de Timeout</Label>
                      <Select value={localData.timeoutType} onValueChange={(value) => updateData({ timeoutType: value as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inactivity">⏸️ Inactividad - Solo cuenta cuando no hay actividad</SelectItem>
                          <SelectItem value="absolute">⏱️ Tiempo Absoluto - Cuenta desde el momento de entrada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={localData.description || ''}
                        onChange={(e) => updateData({ description: e.target.value })}
                        placeholder="Descripción de lo que está esperando..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <h4 className="font-medium text-amber-800 mb-2">Vista Previa del Timeout</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Tipo:</span>
                          <span className="font-medium">{getTimeoutTypeLabel()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duración:</span>
                          <span className="font-medium">{formatTime(localData.duration)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Acción:</span>
                          <span className="font-medium">{getActionLabel()}</span>
                        </div>
                        {localData.showWarning && (
                          <div className="flex justify-between">
                            <span>Advertencia:</span>
                            <span className="font-medium">{formatTime(localData.warningTime)} antes</span>
                          </div>
                        )}
                        {localData.allowExtension && (
                          <div className="flex justify-between">
                            <span>Extensión:</span>
                            <span className="font-medium">+{formatTime(localData.extensionTime)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">💡 Consejos</h4>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• <strong>Inactividad:</strong> Ideal para esperar respuestas del usuario</li>
                        <li>• <strong>Tiempo Absoluto:</strong> Para procesos con límite de tiempo fijo</li>
                        <li>• Usa advertencias para mejorar la experiencia del usuario</li>
                        <li>• Las extensiones permiten que el usuario pida más tiempo</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="warning" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Mostrar Advertencia Previa</Label>
                      <Switch
                        checked={localData.showWarning}
                        onCheckedChange={(checked) => updateData({ showWarning: checked })}
                      />
                    </div>

                    {localData.showWarning && (
                      <>
                        <div>
                          <Label htmlFor="warningTime">Tiempo de Advertencia (segundos antes)</Label>
                          <Input
                            id="warningTime"
                            type="number"
                            min="1"
                            max={localData.duration - 1}
                            value={localData.warningTime}
                            onChange={(e) => updateData({ warningTime: parseInt(e.target.value) || 10 })}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Se enviará {formatTime(localData.warningTime)} antes del timeout
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="warningMessage">Mensaje de Advertencia</Label>
                          <Textarea
                            id="warningMessage"
                            value={localData.warningMessage || ''}
                            onChange={(e) => updateData({ warningMessage: e.target.value })}
                            placeholder="⏰ Te quedan {time} segundos para responder"
                            rows={3}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Variables disponibles: {'{time}'} (tiempo restante)
                          </p>
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-between">
                      <Label>Permitir Extensión de Tiempo</Label>
                      <Switch
                        checked={localData.allowExtension}
                        onCheckedChange={(checked) => updateData({ allowExtension: checked })}
                      />
                    </div>

                    {localData.allowExtension && (
                      <>
                        <div>
                          <Label htmlFor="extensionTime">Tiempo de Extensión (segundos)</Label>
                          <Input
                            id="extensionTime"
                            type="number"
                            min="1"
                            max="300"
                            value={localData.extensionTime}
                            onChange={(e) => updateData({ extensionTime: parseInt(e.target.value) || 30 })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="maxExtensions">Máximo de Extensiones</Label>
                          <Input
                            id="maxExtensions"
                            type="number"
                            min="1"
                            max="5"
                            value={localData.maxExtensions}
                            onChange={(e) => updateData({ maxExtensions: parseInt(e.target.value) || 1 })}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">⚠️ Configuración de Advertencias</h4>
                      <div className="space-y-2 text-sm text-yellow-700">
                        {localData.showWarning ? (
                          <>
                            <div>✅ Advertencia habilitada</div>
                            <div>⏰ Se enviará {formatTime(localData.warningTime)} antes</div>
                            <div className="bg-white p-2 rounded text-xs">
                              <strong>Vista previa:</strong><br />
                              {localData.warningMessage?.replace('{time}', formatTime(localData.warningTime))}
                            </div>
                          </>
                        ) : (
                          <div>❌ Sin advertencia previa</div>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">🔄 Extensiones</h4>
                      <div className="space-y-2 text-sm text-blue-700">
                        {localData.allowExtension ? (
                          <>
                            <div>✅ Extensiones permitidas</div>
                            <div>⏱️ +{formatTime(localData.extensionTime)} por extensión</div>
                            <div>🔢 Máximo {localData.maxExtensions} extensiones</div>
                            <div>⏰ Tiempo total máximo: {formatTime(localData.duration + (localData.extensionTime * localData.maxExtensions))}</div>
                          </>
                        ) : (
                          <div>❌ Sin extensiones</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="actions" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="timeoutAction">Acción al Timeout</Label>
                      <Select value={localData.timeoutAction} onValueChange={(value) => updateData({ timeoutAction: value as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="continue">➡️ Continuar Flujo - Seguir con el siguiente nodo</SelectItem>
                          <SelectItem value="end">❌ Finalizar - Terminar la conversación</SelectItem>
                          <SelectItem value="retry">🔄 Reintentar - Volver a esperar</SelectItem>
                          <SelectItem value="escalate">👨‍💼 Escalar a Humano - Transferir a agente</SelectItem>
                          <SelectItem value="custom">🎯 Ruta Personalizada - Ir a nodo específico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {localData.timeoutAction === 'custom' && (
                      <div>
                        <Label htmlFor="customPath">Nodo de Destino</Label>
                        <Input
                          id="customPath"
                          value={localData.customPath || ''}
                          onChange={(e) => updateData({ customPath: e.target.value })}
                          placeholder="ID del nodo de destino"
                        />
                      </div>
                    )}

                    {localData.timeoutAction === 'retry' && (
                      <>
                        <div>
                          <Label htmlFor="maxRetries">Máximo de Reintentos</Label>
                          <Input
                            id="maxRetries"
                            type="number"
                            min="0"
                            max="10"
                            value={localData.maxRetries}
                            onChange={(e) => updateData({ maxRetries: parseInt(e.target.value) || 0 })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="retryDelay">Delay entre Reintentos (segundos)</Label>
                          <Input
                            id="retryDelay"
                            type="number"
                            min="1"
                            max="60"
                            value={localData.retryDelay}
                            onChange={(e) => updateData({ retryDelay: parseInt(e.target.value) || 5 })}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">🎯 Acción Configurada</h4>
                      <div className="flex items-center space-x-2 mb-2">
                        <ActionIcon className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">{getActionLabel()}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {localData.timeoutAction === 'continue' && 'El flujo continuará con el siguiente nodo conectado'}
                        {localData.timeoutAction === 'end' && 'La conversación se terminará automáticamente'}
                        {localData.timeoutAction === 'retry' && `Se reintentará hasta ${localData.maxRetries} veces con ${formatTime(localData.retryDelay)} de espera`}
                        {localData.timeoutAction === 'escalate' && 'Se transferirá la conversación a un agente humano'}
                        {localData.timeoutAction === 'custom' && `Se dirigirá al nodo: ${localData.customPath || 'No definido'}`}
                      </div>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">⚠️ Importante</h4>
                      <ul className="text-xs text-red-700 space-y-1">
                        <li>• <strong>Continuar:</strong> Requiere un nodo conectado</li>
                        <li>• <strong>Finalizar:</strong> No hay vuelta atrás</li>
                        <li>• <strong>Reintentar:</strong> Puede crear bucles infinitos</li>
                        <li>• <strong>Escalar:</strong> Requiere agentes disponibles</li>
                        <li>• <strong>Personalizada:</strong> Verifica que el nodo exista</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="messages" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="timeoutMessage">Mensaje de Timeout</Label>
                      <Textarea
                        id="timeoutMessage"
                        value={localData.timeoutMessage || ''}
                        onChange={(e) => updateData({ timeoutMessage: e.target.value })}
                        placeholder="⏱️ Se agotó el tiempo de espera"
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Mensaje que se enviará cuando se agote el tiempo
                      </p>
                    </div>

                    {localData.timeoutAction === 'retry' && (
                      <>
                        <div>
                          <Label htmlFor="retryMessage">Mensaje de Reintento</Label>
                          <Textarea
                            id="retryMessage"
                            value={localData.retryMessage || ''}
                            onChange={(e) => updateData({ retryMessage: e.target.value })}
                            placeholder="🔄 Reintentando... ({retry}/{maxRetries})"
                            rows={3}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Variables: {'{retry}'} (intento actual), {'{maxRetries}'} (máximo de reintentos)
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="finalTimeoutMessage">Mensaje de Timeout Final</Label>
                          <Textarea
                            id="finalTimeoutMessage"
                            value={localData.finalTimeoutMessage || ''}
                            onChange={(e) => updateData({ finalTimeoutMessage: e.target.value })}
                            placeholder="❌ No se recibió respuesta después de varios intentos"
                            rows={3}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Mensaje cuando se agotan todos los reintentos
                          </p>
                        </div>
                      </>
                    )}

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">📝 Vista Previa de Mensajes</h4>
                      <div className="space-y-3 text-sm">
                        <div className="bg-white p-3 rounded border">
                          <div className="text-xs text-gray-500 mb-1">Mensaje de Timeout:</div>
                          <div>{localData.timeoutMessage}</div>
                        </div>
                        
                        {localData.timeoutAction === 'retry' && (
                          <>
                            <div className="bg-white p-3 rounded border">
                              <div className="text-xs text-gray-500 mb-1">Mensaje de Reintento:</div>
                              <div>{localData.retryMessage?.replace('{retry}', '1').replace('{maxRetries}', localData.maxRetries.toString())}</div>
                            </div>
                            
                            <div className="bg-white p-3 rounded border">
                              <div className="text-xs text-gray-500 mb-1">Mensaje Final:</div>
                              <div>{localData.finalTimeoutMessage}</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsConfigOpen(false)}>
                Guardar Configuración
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        <div className="bg-amber-50 p-3 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Timer className="w-4 h-4 text-amber-600" />
            <span className="text-lg font-bold text-amber-800">
              {formatTime(localData.duration)}
            </span>
          </div>
          <p className="text-xs text-amber-700">
            {localData.description}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Tipo:</span>
            <span className="font-medium">{getTimeoutTypeLabel()}</span>
          </div>

          {localData.showWarning && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Advertencia:</span>
              <span className="font-medium text-yellow-600">
                {formatTime(localData.warningTime)} antes
              </span>
            </div>
          )}

          {localData.allowExtension && (
            <div className="bg-blue-50 p-2 rounded flex items-center space-x-2">
              <Play className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-blue-700">
                Extensión: +{formatTime(localData.extensionTime)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Al timeout:</span>
            <div className="flex items-center space-x-1">
              <ActionIcon className="w-3 h-3" />
              <span className="font-medium">{getActionLabel()}</span>
            </div>
          </div>

          {localData.maxRetries > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Reintentos:</span>
              <span className="font-medium">{localData.maxRetries}</span>
            </div>
          )}
        </div>
      </div>

      {/* Output Handles */}
      <div className="flex justify-between p-2 pt-0">
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="continue"
          style={{ left: '25%' }}
          className="w-3 h-3"
        />
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="timeout"
          style={{ left: '75%' }}
          className="w-3 h-3"
        />
      </div>

      <div className="flex justify-between text-xs px-2 pb-2">
        <span className="text-green-600">Continuar</span>
        <span className="text-red-600">Timeout</span>
      </div>
    </div>
  );
} 