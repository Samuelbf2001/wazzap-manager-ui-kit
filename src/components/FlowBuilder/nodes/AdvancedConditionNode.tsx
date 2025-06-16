import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  GitBranch, 
  Brain, 
  Plus, 
  Trash2, 
  Settings,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Code2,
  Zap
} from 'lucide-react';

/**
 * Interfaces para el nodo de condición avanzada
 */

// Operadores disponibles para comparaciones
type ComparisonOperator = 
  | 'equals'          // Igual a
  | 'not_equals'      // No igual a
  | 'contains'        // Contiene
  | 'not_contains'    // No contiene
  | 'starts_with'     // Empieza con
  | 'ends_with'       // Termina con
  | 'greater_than'    // Mayor que
  | 'less_than'       // Menor que
  | 'greater_equal'   // Mayor o igual que
  | 'less_equal'      // Menor o igual que
  | 'in_list'         // Está en lista
  | 'not_in_list'     // No está en lista
  | 'is_empty'        // Está vacío
  | 'is_not_empty'    // No está vacío
  | 'regex_match';    // Coincide con regex

// Tipos de datos para validación
type DataType = 'text' | 'number' | 'date' | 'boolean' | 'email' | 'phone' | 'url';

// Fuente del valor a comparar
type ValueSource = 'static' | 'variable' | 'user_input' | 'system' | 'hubspot' | 'webhook';

// Operadores lógicos para combinar condiciones
type LogicalOperator = 'AND' | 'OR';

// Regla individual de condición
interface ConditionRule {
  id: string;
  field: string;                    // Campo o variable a evaluar
  operator: ComparisonOperator;     // Operador de comparación
  value: string;                    // Valor a comparar
  valueSource: ValueSource;         // Fuente del valor
  dataType: DataType;               // Tipo de dato para validación
  logicalOperator?: LogicalOperator; // Operador lógico (para reglas después de la primera)
  enabled: boolean;                 // Si la regla está activa
  description?: string;             // Descripción opcional de la regla
}

// Grupo de reglas con su lógica
interface RuleGroup {
  id: string;
  name: string;
  rules: ConditionRule[];
  groupLogic: LogicalOperator;      // Lógica dentro del grupo (AND/OR)
  enabled: boolean;
}

// Configuración de IA
interface AIConfig {
  enabled: boolean;
  model: 'gpt-3.5-turbo' | 'gpt-4' | 'claude-3-haiku' | 'claude-3-sonnet';
  prompt: string;
  examples: Array<{
    input: string;
    output: 'true' | 'false';
    explanation?: string;
  }>;
  fallbackToRules: boolean;         // Si falla IA, usar reglas tradicionales
  confidence: number;               // Nivel de confianza mínimo (0-100)
}

// Configuración completa del nodo
interface AdvancedConditionConfig {
  mode: 'rules' | 'ai' | 'hybrid';  // Modo de evaluación
  ruleGroups: RuleGroup[];          // Grupos de reglas
  groupsLogic: LogicalOperator;     // Lógica entre grupos (AND/OR)
  aiConfig: AIConfig;               // Configuración de IA
  outputs: {
    trueHandle: string;
    falseHandle: string;
    errorHandle?: string;           // Handle para errores
  };
  advanced: {
    timeout: number;                // Timeout en ms
    cacheResults: boolean;          // Cachear resultados
    cacheDuration: number;          // Duración del cache en segundos
    debugMode: boolean;             // Modo debug
    logEvaluations: boolean;        // Registrar evaluaciones
  };
}

interface AdvancedConditionNodeProps {
  data: {
    label: string;
    config?: AdvancedConditionConfig;
  };
  selected?: boolean;
}

// Operadores disponibles con sus etiquetas
const operators: Array<{ value: ComparisonOperator; label: string; description: string }> = [
  { value: 'equals', label: 'Igual a', description: 'Valor exactamente igual' },
  { value: 'not_equals', label: 'No igual a', description: 'Valor diferente' },
  { value: 'contains', label: 'Contiene', description: 'Texto contiene el valor' },
  { value: 'not_contains', label: 'No contiene', description: 'Texto no contiene el valor' },
  { value: 'starts_with', label: 'Empieza con', description: 'Texto empieza con el valor' },
  { value: 'ends_with', label: 'Termina con', description: 'Texto termina con el valor' },
  { value: 'greater_than', label: 'Mayor que', description: 'Número mayor que el valor' },
  { value: 'less_than', label: 'Menor que', description: 'Número menor que el valor' },
  { value: 'greater_equal', label: 'Mayor o igual', description: 'Número mayor o igual al valor' },
  { value: 'less_equal', label: 'Menor o igual', description: 'Número menor o igual al valor' },
  { value: 'in_list', label: 'En lista', description: 'Valor está en la lista (separado por comas)' },
  { value: 'not_in_list', label: 'No en lista', description: 'Valor no está en la lista' },
  { value: 'is_empty', label: 'Está vacío', description: 'Campo vacío o nulo' },
  { value: 'is_not_empty', label: 'No está vacío', description: 'Campo tiene valor' },
  { value: 'regex_match', label: 'Coincide regex', description: 'Coincide con expresión regular' }
];

// Ejemplos predefinidos de IA
const aiExamplesPresets = {
  intent_classification: [
    { input: "quiero comprar un producto", output: 'true' as const, explanation: "Intención de compra detectada" },
    { input: "solo estoy mirando", output: 'false' as const, explanation: "No hay intención de compra" },
    { input: "necesito ayuda con mi pedido", output: 'true' as const, explanation: "Necesita atención al cliente" }
  ],
  sentiment_analysis: [
    { input: "estoy muy contento con el servicio", output: 'true' as const, explanation: "Sentimiento positivo" },
    { input: "esto es terrible, quiero cancelar", output: 'false' as const, explanation: "Sentimiento negativo" },
    { input: "el producto está bien", output: 'true' as const, explanation: "Sentimiento neutral-positivo" }
  ],
  urgency_detection: [
    { input: "URGENTE: necesito ayuda ahora", output: 'true' as const, explanation: "Urgencia alta detectada" },
    { input: "cuando tengas tiempo, revisalo", output: 'false' as const, explanation: "No hay urgencia" },
    { input: "es importante pero no urgente", output: 'false' as const, explanation: "Importante pero no urgente" }
  ]
};

/**
 * Componente AdvancedConditionNode
 * 
 * Nodo de condición avanzada que soporta múltiples modos de evaluación:
 * 
 * 1. Modo Reglas: Evaluación tradicional con campos, operadores y lógica AND/OR
 * 2. Modo IA: Evaluación inteligente usando modelos de lenguaje
 * 3. Modo Híbrido: Combina IA con reglas tradicionales como fallback
 * 
 * Características principales:
 * - Múltiples grupos de reglas con lógica personalizable
 * - Operadores de comparación avanzados
 * - Integración con diferentes fuentes de datos
 * - Evaluación con IA y ejemplos de entrenamiento
 * - Sistema de cache y logging
 * - Manejo de errores y timeouts
 * - Modo debug para desarrollo
 */
export function AdvancedConditionNode({ data, selected }: AdvancedConditionNodeProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [config, setConfig] = useState<AdvancedConditionConfig>(data.config || {
    mode: 'rules',
    ruleGroups: [],
    groupsLogic: 'AND',
    aiConfig: {
      enabled: false,
      model: 'gpt-3.5-turbo',
      prompt: 'Evalúa la siguiente entrada y devuelve true o false basándote en el contexto.',
      examples: [],
      fallbackToRules: true,
      confidence: 70
    },
    outputs: {
      trueHandle: 'true',
      falseHandle: 'false',
      errorHandle: 'error'
    },
    advanced: {
      timeout: 5000,
      cacheResults: false,
      cacheDuration: 300,
      debugMode: false,
      logEvaluations: true
    }
  });

  // Agregar nuevo grupo de reglas
  const addRuleGroup = () => {
    const newGroup: RuleGroup = {
      id: `group_${Date.now()}`,
      name: `Grupo ${config.ruleGroups.length + 1}`,
      rules: [],
      groupLogic: 'AND',
      enabled: true
    };
    
    setConfig(prev => ({
      ...prev,
      ruleGroups: [...prev.ruleGroups, newGroup]
    }));
  };

  // Eliminar grupo de reglas
  const removeRuleGroup = (groupId: string) => {
    setConfig(prev => ({
      ...prev,
      ruleGroups: prev.ruleGroups.filter(g => g.id !== groupId)
    }));
  };

  // Agregar regla a un grupo
  const addRule = (groupId: string) => {
    const newRule: ConditionRule = {
      id: `rule_${Date.now()}`,
      field: '',
      operator: 'equals',
      value: '',
      valueSource: 'static',
      dataType: 'text',
      enabled: true,
      description: ''
    };

    setConfig(prev => ({
      ...prev,
      ruleGroups: prev.ruleGroups.map(group =>
        group.id === groupId
          ? { ...group, rules: [...group.rules, newRule] }
          : group
      )
    }));
  };

  // Eliminar regla
  const removeRule = (groupId: string, ruleId: string) => {
    setConfig(prev => ({
      ...prev,
      ruleGroups: prev.ruleGroups.map(group =>
        group.id === groupId
          ? { ...group, rules: group.rules.filter(r => r.id !== ruleId) }
          : group
      )
    }));
  };

  // Actualizar regla
  const updateRule = (groupId: string, ruleId: string, updates: Partial<ConditionRule>) => {
    setConfig(prev => ({
      ...prev,
      ruleGroups: prev.ruleGroups.map(group =>
        group.id === groupId
          ? {
              ...group,
              rules: group.rules.map(rule =>
                rule.id === ruleId ? { ...rule, ...updates } : rule
              )
            }
          : group
      )
    }));
  };

  // Aplicar preset de ejemplos de IA
  const applyAIPreset = (presetKey: keyof typeof aiExamplesPresets) => {
    const examples = aiExamplesPresets[presetKey];
    setConfig(prev => ({
      ...prev,
      aiConfig: {
        ...prev.aiConfig,
        examples
      }
    }));
  };

  // Agregar ejemplo de IA personalizado
  const addAIExample = () => {
    setConfig(prev => ({
      ...prev,
      aiConfig: {
        ...prev.aiConfig,
        examples: [
          ...prev.aiConfig.examples,
          { input: '', output: 'true', explanation: '' }
        ]
      }
    }));
  };

  // Obtener icono según el modo
  const getModeIcon = () => {
    switch (config.mode) {
      case 'ai': return Brain;
      case 'hybrid': return Zap;
      default: return GitBranch;
    }
  };

  const ModeIcon = getModeIcon();

  return (
    <>
      {/* Handles de conexión */}
      <Handle type="target" position={Position.Top} />
      
      {/* Tarjeta principal del nodo */}
      <Card className={`w-80 transition-all duration-200 ${
        selected ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-md'
      }`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <div className="p-1.5 bg-purple-50 rounded-lg">
              <ModeIcon className="h-4 w-4 text-purple-600" />
            </div>
            {data.label}
            <Badge variant="secondary" className="ml-auto text-xs">
              {config.mode === 'ai' ? 'IA' : config.mode === 'hybrid' ? 'Híbrido' : 'Reglas'}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Estadísticas de configuración */}
            <div className="flex gap-2 text-xs">
              {config.mode !== 'ai' && (
                <Badge variant="outline" className="text-xs">
                  {config.ruleGroups.length} grupos
                </Badge>
              )}
              {(config.mode === 'ai' || config.mode === 'hybrid') && config.aiConfig.enabled && (
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  IA: {config.aiConfig.model}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {config.groupsLogic}
              </Badge>
            </div>

            {/* Resumen de reglas */}
            {config.mode !== 'ai' && config.ruleGroups.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {config.ruleGroups.slice(0, 3).map((group, index) => (
                  <div key={group.id} className="bg-purple-50 p-2 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-purple-700">{group.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {group.rules.length} reglas
                      </Badge>
                    </div>
                    {group.rules.length > 0 && (
                      <div className="text-xs text-purple-600">
                        {group.rules[0].field} {operators.find(op => op.value === group.rules[0].operator)?.label}...
                      </div>
                    )}
                  </div>
                ))}
                {config.ruleGroups.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{config.ruleGroups.length - 3} grupos más...
                  </div>
                )}
              </div>
            )}

            {/* Información de IA */}
            {(config.mode === 'ai' || config.mode === 'hybrid') && config.aiConfig.enabled && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">Evaluación IA</span>
                </div>
                <p className="text-xs text-blue-600 line-clamp-2">
                  {config.aiConfig.prompt}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {config.aiConfig.examples.length} ejemplos
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Confianza: {config.aiConfig.confidence}%
                  </Badge>
                </div>
              </div>
            )}

            {/* Configuración avanzada visible */}
            <div className="space-y-2 text-xs">
              {config.advanced.cacheResults && (
                <div className="bg-gray-50 p-2 rounded flex items-center gap-2">
                  <span className="text-gray-700">Cache: {config.advanced.cacheDuration}s</span>
                </div>
              )}
              {config.advanced.debugMode && (
                <div className="bg-yellow-50 p-2 rounded flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-yellow-600" />
                  <span className="text-yellow-700">Modo Debug Activo</span>
                </div>
              )}
            </div>
            
            {/* Botón de configuración */}
            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Condición
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Configuración Condición Avanzada</DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue="mode" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="mode">Modo</TabsTrigger>
                    <TabsTrigger value="rules">Reglas</TabsTrigger>
                    <TabsTrigger value="ai">IA</TabsTrigger>
                    <TabsTrigger value="outputs">Salidas</TabsTrigger>
                    <TabsTrigger value="advanced">Avanzado</TabsTrigger>
                  </TabsList>
                  
                  {/* Tab: Selección de Modo */}
                  <TabsContent value="mode" className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Modo de Evaluación</Label>
                      <p className="text-sm text-gray-600 mb-4">
                        Selecciona cómo se evaluarán las condiciones
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        {
                          mode: 'rules',
                          title: 'Solo Reglas',
                          description: 'Evaluación tradicional con campos y operadores',
                          icon: GitBranch,
                          color: 'border-purple-200 bg-purple-50'
                        },
                        {
                          mode: 'ai',
                          title: 'Solo IA',
                          description: 'Evaluación inteligente usando modelos de lenguaje',
                          icon: Brain,
                          color: 'border-blue-200 bg-blue-50'
                        },
                        {
                          mode: 'hybrid',
                          title: 'Híbrido',
                          description: 'IA con fallback a reglas tradicionales',
                          icon: Zap,
                          color: 'border-green-200 bg-green-50'
                        }
                      ].map((modeOption) => {
                        const IconComponent = modeOption.icon;
                        return (
                          <Card 
                            key={modeOption.mode}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              config.mode === modeOption.mode ? 'ring-2 ring-blue-500' : ''
                            } ${modeOption.color}`}
                            onClick={() => setConfig(prev => ({ ...prev, mode: modeOption.mode as any }))}
                          >
                            <CardHeader className="pb-2">
                              <CardTitle className="flex items-center gap-2 text-sm">
                                <IconComponent className="h-5 w-5" />
                                {modeOption.title}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-xs text-gray-600">{modeOption.description}</p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </TabsContent>
                  
                  {/* Tab: Configuración de Reglas */}
                  <TabsContent value="rules" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label className="text-base font-medium">Grupos de Reglas</Label>
                        <p className="text-sm text-gray-600">Define reglas de evaluación con lógica personalizable</p>
                      </div>
                      <Button onClick={addRuleGroup} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Grupo
                      </Button>
                    </div>
                    
                    <div>
                      <Label>Lógica entre Grupos</Label>
                      <Select
                        value={config.groupsLogic}
                        onValueChange={(value: LogicalOperator) => setConfig(prev => ({ ...prev, groupsLogic: value }))}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">Y (AND)</SelectItem>
                          <SelectItem value="OR">O (OR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {config.ruleGroups.map((group, groupIndex) => (
                        <Card key={group.id} className="p-4">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <Input
                                  value={group.name}
                                  onChange={(e) => setConfig(prev => ({
                                    ...prev,
                                    ruleGroups: prev.ruleGroups.map(g =>
                                      g.id === group.id ? { ...g, name: e.target.value } : g
                                    )
                                  }))}
                                  placeholder="Nombre del grupo"
                                  className="mb-2"
                                />
                                <div className="flex gap-3 items-center">
                                  <div className="flex items-center gap-2">
                                    <Label>Lógica:</Label>
                                    <Select
                                      value={group.groupLogic}
                                      onValueChange={(value: LogicalOperator) => setConfig(prev => ({
                                        ...prev,
                                        ruleGroups: prev.ruleGroups.map(g =>
                                          g.id === group.id ? { ...g, groupLogic: value } : g
                                        )
                                      }))}
                                    >
                                      <SelectTrigger className="w-20">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="AND">Y</SelectItem>
                                        <SelectItem value="OR">O</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Switch
                                    checked={group.enabled}
                                    onCheckedChange={(checked) => setConfig(prev => ({
                                      ...prev,
                                      ruleGroups: prev.ruleGroups.map(g =>
                                        g.id === group.id ? { ...g, enabled: checked } : g
                                      )
                                    }))}
                                  />
                                  <span className="text-sm">Activo</span>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addRule(group.id)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeRuleGroup(group.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Reglas del grupo */}
                            <div className="space-y-3">
                              {group.rules.map((rule, ruleIndex) => (
                                <Card key={rule.id} className="p-3 bg-gray-50">
                                  <div className="space-y-3">
                                    {ruleIndex > 0 && (
                                      <div className="flex items-center gap-2">
                                        <Select
                                          value={rule.logicalOperator || 'AND'}
                                          onValueChange={(value: LogicalOperator) => 
                                            updateRule(group.id, rule.id, { logicalOperator: value })
                                          }
                                        >
                                          <SelectTrigger className="w-16">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="AND">Y</SelectItem>
                                            <SelectItem value="OR">O</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    )}
                                    
                                    <div className="grid grid-cols-4 gap-3">
                                      <div>
                                        <Label>Campo</Label>
                                        <Input
                                          value={rule.field}
                                          onChange={(e) => updateRule(group.id, rule.id, { field: e.target.value })}
                                          placeholder="nombre_campo"
                                        />
                                      </div>
                                      
                                      <div>
                                        <Label>Operador</Label>
                                        <Select
                                          value={rule.operator}
                                          onValueChange={(value: ComparisonOperator) => 
                                            updateRule(group.id, rule.id, { operator: value })
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {operators.map((op) => (
                                              <SelectItem key={op.value} value={op.value}>
                                                {op.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      
                                      <div>
                                        <Label>Valor</Label>
                                        <Input
                                          value={rule.value}
                                          onChange={(e) => updateRule(group.id, rule.id, { value: e.target.value })}
                                          placeholder="valor"
                                        />
                                      </div>
                                      
                                      <div className="flex items-end gap-2">
                                        <Switch
                                          checked={rule.enabled}
                                          onCheckedChange={(checked) => 
                                            updateRule(group.id, rule.id, { enabled: checked })
                                          }
                                        />
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => removeRule(group.id, rule.id)}
                                          className="text-red-600"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <Label>Fuente</Label>
                                        <Select
                                          value={rule.valueSource}
                                          onValueChange={(value: ValueSource) => 
                                            updateRule(group.id, rule.id, { valueSource: value })
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="static">Valor estático</SelectItem>
                                            <SelectItem value="variable">Variable</SelectItem>
                                            <SelectItem value="user_input">Entrada de usuario</SelectItem>
                                            <SelectItem value="system">Sistema</SelectItem>
                                            <SelectItem value="hubspot">HubSpot</SelectItem>
                                            <SelectItem value="webhook">Webhook</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      
                                      <div>
                                        <Label>Tipo</Label>
                                        <Select
                                          value={rule.dataType}
                                          onValueChange={(value: DataType) => 
                                            updateRule(group.id, rule.id, { dataType: value })
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="text">Texto</SelectItem>
                                            <SelectItem value="number">Número</SelectItem>
                                            <SelectItem value="date">Fecha</SelectItem>
                                            <SelectItem value="boolean">Booleano</SelectItem>
                                            <SelectItem value="email">Email</SelectItem>
                                            <SelectItem value="phone">Teléfono</SelectItem>
                                            <SelectItem value="url">URL</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <Label>Descripción (opcional)</Label>
                                      <Input
                                        value={rule.description || ''}
                                        onChange={(e) => updateRule(group.id, rule.id, { description: e.target.value })}
                                        placeholder="Describe qué evalúa esta regla"
                                      />
                                    </div>
                                  </div>
                                </Card>
                              ))}
                              
                              {group.rules.length === 0 && (
                                <div className="text-center py-4 text-gray-500">
                                  <Code2 className="h-8 w-8 mx-auto mb-2" />
                                  <p className="text-sm">Sin reglas configuradas</p>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => addRule(group.id)}
                                    className="mt-2"
                                  >
                                    Agregar Primera Regla
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                      
                      {config.ruleGroups.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <GitBranch className="h-12 w-12 mx-auto mb-4" />
                          <p className="text-sm mb-4">Sin grupos de reglas configurados</p>
                          <Button onClick={addRuleGroup}>
                            Crear Primer Grupo
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  {/* Otros tabs continuarían aquí... */}
                </Tabs>
                
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => {
                    // Guardar configuración
                    data.config = config;
                    setIsConfigOpen(false);
                  }}>
                    Guardar Configuración
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
      
      {/* Handles de salida */}
      <Handle type="source" position={Position.Bottom} id="true" style={{ left: '20%' }} />
      <Handle type="source" position={Position.Bottom} id="false" style={{ left: '50%' }} />
      <Handle type="source" position={Position.Bottom} id="error" style={{ left: '80%' }} />
      
      {/* Etiquetas de salida */}
      <div className="flex justify-between mt-1 text-xs px-2">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-green-600" />
          <span className="text-green-600">Verdadero</span>
        </div>
        <div className="flex items-center gap-1">
          <XCircle className="h-3 w-3 text-red-600" />
          <span className="text-red-600">Falso</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3 text-amber-600" />
          <span className="text-amber-600">Error</span>
        </div>
      </div>
    </>
  );
} 