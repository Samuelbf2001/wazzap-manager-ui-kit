# 🔧 Plan de Implementación Técnico - WhatsApp Manager UI Kit

## 📋 Resumen de Funcionalidades a Implementar

### 🚀 **Prioridad 1: Auto-Response Engine (Semana 1-2)**
### 📊 **Prioridad 2: Knowledge Base Inteligente (Semana 3-4)**  
### 💭 **Prioridad 3: Sentiment Analysis (Semana 5-6)**

---

## 🤖 **PRIORIDAD 1: Auto-Response Engine**

### **Estructura de Archivos a Crear**
```
src/
├── services/
│   └── auto-response/
│       ├── AutoResponseService.ts
│       ├── FAQMatcher.ts
│       ├── ComplexityEvaluator.ts
│       └── EscalationEngine.ts
├── components/
│   └── FlowBuilder/
│       └── nodes/
│           └── AutoResponseNode.tsx
└── types/
    └── auto-response.ts
```

### **1. Tipos TypeScript**
```typescript
// src/types/auto-response.ts
export interface AutoResponseConfig {
  enabled: boolean;
  workingHours: {
    timezone: string;
    enabled: boolean;
    schedule: {
      [day: string]: { start: string; end: string; enabled: boolean };
    };
  };
  faqDatabase: FAQ[];
  aiModel: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3';
  confidenceThreshold: number;
  maxAutoResponses: number;
  escalationTriggers: string[];
  fallbackMessage: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  category: string;
  confidence: number;
  usageCount: number;
  lastUsed: Date;
}

export interface AutoResponseResult {
  shouldRespond: boolean;
  response?: string;
  confidence: number;
  source: 'faq' | 'ai' | 'escalate';
  escalationReason?: string;
}

export interface IncomingMessage {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  timestamp: Date;
  context: {
    previousMessages: string[];
    userProfile: any;
    conversationState: string;
  };
}
```

### **2. Servicio Principal**
```typescript
// src/services/auto-response/AutoResponseService.ts
import { AutoResponseConfig, AutoResponseResult, IncomingMessage, FAQ } from '@/types/auto-response';
import { FAQMatcher } from './FAQMatcher';
import { ComplexityEvaluator } from './ComplexityEvaluator';
import { EscalationEngine } from './EscalationEngine';

export class AutoResponseService {
  private config: AutoResponseConfig;
  private faqMatcher: FAQMatcher;
  private complexityEvaluator: ComplexityEvaluator;
  private escalationEngine: EscalationEngine;

  constructor(config: AutoResponseConfig) {
    this.config = config;
    this.faqMatcher = new FAQMatcher(config.faqDatabase);
    this.complexityEvaluator = new ComplexityEvaluator(config.aiModel);
    this.escalationEngine = new EscalationEngine(config.escalationTriggers);
  }

  async handleIncomingMessage(message: IncomingMessage): Promise<AutoResponseResult> {
    // 1. Verificar si está habilitado
    if (!this.config.enabled) {
      return { shouldRespond: false, confidence: 0, source: 'escalate' };
    }

    // 2. Verificar horarios
    if (!this.isWithinWorkingHours()) {
      return {
        shouldRespond: true,
        response: this.getOutOfHoursMessage(),
        confidence: 1.0,
        source: 'faq'
      };
    }

    // 3. Verificar triggers de escalación
    if (this.escalationEngine.shouldEscalate(message)) {
      return {
        shouldRespond: false,
        confidence: 0,
        source: 'escalate',
        escalationReason: this.escalationEngine.getEscalationReason(message)
      };
    }

    // 4. Buscar en FAQ
    const faqMatch = await this.faqMatcher.findBestMatch(message.content);
    if (faqMatch && faqMatch.confidence >= this.config.confidenceThreshold) {
      return {
        shouldRespond: true,
        response: faqMatch.answer,
        confidence: faqMatch.confidence,
        source: 'faq'
      };
    }

    // 5. Evaluar complejidad
    const complexity = await this.complexityEvaluator.evaluate(message);
    if (complexity > 0.7) {
      return {
        shouldRespond: false,
        confidence: 0,
        source: 'escalate',
        escalationReason: 'high_complexity'
      };
    }

    // 6. Generar respuesta con IA
    const aiResponse = await this.generateAIResponse(message);
    return {
      shouldRespond: true,
      response: aiResponse,
      confidence: 0.8,
      source: 'ai'
    };
  }

  private isWithinWorkingHours(): boolean {
    const now = new Date();
    const dayOfWeek = now.toLocaleLowerCase('en-US', { weekday: 'long' });
    const schedule = this.config.workingHours.schedule[dayOfWeek];
    
    if (!schedule?.enabled) return false;
    
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = this.parseTime(schedule.start);
    const endTime = this.parseTime(schedule.end);
    
    return currentTime >= startTime && currentTime <= endTime;
  }

  private parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private getOutOfHoursMessage(): string {
    return "¡Hola! Nuestro horario de atención es de lunes a viernes de 9:00 AM a 6:00 PM. Te responderemos en cuanto estemos disponibles. ¿En qué puedo ayudarte mientras tanto?";
  }

  private async generateAIResponse(message: IncomingMessage): Promise<string> {
    // Integrar con el AIAgentNode existente
    // Por ahora, placeholder
    return "Gracias por tu mensaje. Un agente se pondrá en contacto contigo pronto.";
  }
}
```

### **3. FAQ Matcher**
```typescript
// src/services/auto-response/FAQMatcher.ts
import { FAQ } from '@/types/auto-response';

export class FAQMatcher {
  private faqs: FAQ[];

  constructor(faqs: FAQ[]) {
    this.faqs = faqs;
  }

  async findBestMatch(query: string): Promise<FAQ | null> {
    const cleanQuery = this.cleanText(query);
    let bestMatch: FAQ | null = null;
    let highestScore = 0;

    for (const faq of this.faqs) {
      const score = this.calculateSimilarity(cleanQuery, faq);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = faq;
      }
    }

    if (bestMatch) {
      bestMatch.confidence = highestScore;
      bestMatch.usageCount++;
      bestMatch.lastUsed = new Date();
    }

    return bestMatch;
  }

  private cleanText(text: string): string {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();
  }

  private calculateSimilarity(query: string, faq: FAQ): number {
    // Implementar algoritmo de similitud
    // Por ahora, similarity básica por keywords
    const queryWords = query.split(' ');
    const questionWords = this.cleanText(faq.question).split(' ');
    const keywords = faq.keywords.map(k => k.toLowerCase());

    let matches = 0;
    let totalWords = queryWords.length;

    for (const word of queryWords) {
      if (questionWords.includes(word) || keywords.includes(word)) {
        matches++;
      }
    }

    return matches / totalWords;
  }
}
```

### **4. Nodo de Auto-Response**
```typescript
// src/components/FlowBuilder/nodes/AutoResponseNode.tsx
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bot, Settings, Clock, Shield } from 'lucide-react';
import { AutoResponseConfig } from '@/types/auto-response';

interface AutoResponseNodeData extends AutoResponseConfig {
  label: string;
}

export function AutoResponseNode({ data, selected }: { data: AutoResponseNodeData; selected?: boolean }) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [localData, setLocalData] = useState<AutoResponseNodeData>({
    label: 'Auto-Response 24/7',
    enabled: true,
    workingHours: {
      timezone: 'America/Mexico_City',
      enabled: true,
      schedule: {
        monday: { start: '09:00', end: '18:00', enabled: true },
        tuesday: { start: '09:00', end: '18:00', enabled: true },
        wednesday: { start: '09:00', end: '18:00', enabled: true },
        thursday: { start: '09:00', end: '18:00', enabled: true },
        friday: { start: '09:00', end: '18:00', enabled: true },
        saturday: { start: '10:00', end: '14:00', enabled: false },
        sunday: { start: '10:00', end: '14:00', enabled: false }
      }
    },
    faqDatabase: [],
    aiModel: 'gpt-4',
    confidenceThreshold: 0.8,
    maxAutoResponses: 3,
    escalationTriggers: ['urgente', 'complaint', 'problema'],
    fallbackMessage: 'Un agente se pondrá en contacto contigo pronto.',
    ...data
  });

  return (
    <>
      <Handle type="target" position={Position.Top} />
      
      <Card className={`w-80 ${selected ? 'ring-2 ring-blue-500' : ''} border-l-4 border-l-blue-500 bg-blue-50`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm font-medium">{localData.label}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsConfigOpen(true)}
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={localData.enabled} readOnly size="sm" />
            <Badge variant={localData.enabled ? "default" : "secondary"} className="text-xs">
              {localData.enabled ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Horario: {localData.workingHours.enabled ? 'Configurado' : '24/7'}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Confianza: {localData.confidenceThreshold * 100}%</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Bot className="h-3 w-3" />
              <span>FAQs: {localData.faqDatabase.length} configuradas</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Settings className="h-3 w-3" />
              <span>Modelo: {localData.aiModel}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Handles de salida */}
      <Handle type="source" position={Position.Bottom} id="auto_response" className="w-3 h-3" />
      <Handle type="source" position={Position.Right} id="escalate" className="w-3 h-3" />
      <Handle type="source" position={Position.Left} id="out_of_hours" className="w-3 h-3" />

      {/* Modal de configuración - Implementar según necesidad */}
    </>
  );
}
```

---

## 🧠 **PRIORIDAD 2: Knowledge Base Inteligente**

### **Estructura de Archivos**
```
src/
├── services/
│   └── knowledge-base/
│       ├── KnowledgeBaseService.ts
│       ├── SemanticSearch.ts
│       └── AutoLearning.ts
└── components/
    └── FlowBuilder/
        └── nodes/
            └── KnowledgeBaseNode.tsx
```

### **1. Tipos TypeScript**
```typescript
// src/types/knowledge-base.ts
export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  lastUpdated: Date;
  usageCount: number;
  rating: number;
  source: 'manual' | 'conversation' | 'imported';
}

export interface KnowledgeSearchResult {
  item: KnowledgeItem;
  score: number;
  matchType: 'semantic' | 'keyword' | 'tag';
  excerpt: string;
}

export interface KnowledgeBaseConfig {
  searchMode: 'semantic' | 'keyword' | 'hybrid';
  confidenceThreshold: number;
  maxResults: number;
  categories: string[];
  autoLearn: boolean;
  fallbackToAI: boolean;
}
```

### **2. Servicio Principal**
```typescript
// src/services/knowledge-base/KnowledgeBaseService.ts
import { KnowledgeItem, KnowledgeSearchResult, KnowledgeBaseConfig } from '@/types/knowledge-base';
import { SemanticSearch } from './SemanticSearch';

export class KnowledgeBaseService {
  private items: KnowledgeItem[] = [];
  private semanticSearch: SemanticSearch;
  private config: KnowledgeBaseConfig;

  constructor(config: KnowledgeBaseConfig) {
    this.config = config;
    this.semanticSearch = new SemanticSearch();
  }

  async search(query: string): Promise<KnowledgeSearchResult[]> {
    let results: KnowledgeSearchResult[] = [];

    switch (this.config.searchMode) {
      case 'semantic':
        results = await this.semanticSearch.search(query, this.items);
        break;
      case 'keyword':
        results = this.keywordSearch(query);
        break;
      case 'hybrid':
        const semanticResults = await this.semanticSearch.search(query, this.items);
        const keywordResults = this.keywordSearch(query);
        results = this.combineResults(semanticResults, keywordResults);
        break;
    }

    return results
      .filter(r => r.score >= this.config.confidenceThreshold)
      .slice(0, this.config.maxResults);
  }

  async addKnowledgeItem(item: Omit<KnowledgeItem, 'id' | 'lastUpdated' | 'usageCount' | 'rating'>): Promise<KnowledgeItem> {
    const newItem: KnowledgeItem = {
      ...item,
      id: this.generateId(),
      lastUpdated: new Date(),
      usageCount: 0,
      rating: 0
    };

    this.items.push(newItem);
    await this.semanticSearch.indexItem(newItem);
    
    return newItem;
  }

  async learnFromConversation(conversation: any[]): Promise<void> {
    if (!this.config.autoLearn) return;

    // Analizar conversación para extraer conocimiento útil
    // Implementar lógica de machine learning
  }

  private keywordSearch(query: string): KnowledgeSearchResult[] {
    const queryWords = query.toLowerCase().split(' ');
    
    return this.items.map(item => {
      const content = `${item.title} ${item.content} ${item.tags.join(' ')}`.toLowerCase();
      let matches = 0;
      
      for (const word of queryWords) {
        if (content.includes(word)) matches++;
      }
      
      const score = matches / queryWords.length;
      
      return {
        item,
        score,
        matchType: 'keyword' as const,
        excerpt: this.generateExcerpt(item.content, query)
      };
    }).filter(r => r.score > 0);
  }

  private combineResults(semantic: KnowledgeSearchResult[], keyword: KnowledgeSearchResult[]): KnowledgeSearchResult[] {
    // Combinar y reponderar resultados
    const combined = new Map<string, KnowledgeSearchResult>();
    
    semantic.forEach(result => {
      combined.set(result.item.id, { ...result, score: result.score * 0.7 });
    });
    
    keyword.forEach(result => {
      const existing = combined.get(result.item.id);
      if (existing) {
        existing.score += result.score * 0.3;
      } else {
        combined.set(result.item.id, { ...result, score: result.score * 0.3 });
      }
    });
    
    return Array.from(combined.values()).sort((a, b) => b.score - a.score);
  }

  private generateExcerpt(content: string, query: string): string {
    const words = content.split(' ');
    const queryWords = query.toLowerCase().split(' ');
    
    // Encontrar la primera ocurrencia de alguna palabra de la query
    for (let i = 0; i < words.length; i++) {
      if (queryWords.some(qw => words[i].toLowerCase().includes(qw))) {
        const start = Math.max(0, i - 10);
        const end = Math.min(words.length, i + 10);
        return words.slice(start, end).join(' ') + '...';
      }
    }
    
    return words.slice(0, 20).join(' ') + '...';
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}
```

### **3. FAQ Matcher**
```typescript
// src/services/auto-response/FAQMatcher.ts
import { FAQ } from '@/types/auto-response';

export class FAQMatcher {
  private faqs: FAQ[];

  constructor(faqs: FAQ[]) {
    this.faqs = faqs;
  }

  async findBestMatch(query: string): Promise<FAQ | null> {
    const cleanQuery = this.cleanText(query);
    let bestMatch: FAQ | null = null;
    let highestScore = 0;

    for (const faq of this.faqs) {
      const score = this.calculateSimilarity(cleanQuery, faq);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = faq;
      }
    }

    if (bestMatch) {
      bestMatch.confidence = highestScore;
      bestMatch.usageCount++;
      bestMatch.lastUsed = new Date();
    }

    return bestMatch;
  }

  private cleanText(text: string): string {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();
  }

  private calculateSimilarity(query: string, faq: FAQ): number {
    // Implementar algoritmo de similitud
    // Por ahora, similarity básica por keywords
    const queryWords = query.split(' ');
    const questionWords = this.cleanText(faq.question).split(' ');
    const keywords = faq.keywords.map(k => k.toLowerCase());

    let matches = 0;
    let totalWords = queryWords.length;

    for (const word of queryWords) {
      if (questionWords.includes(word) || keywords.includes(word)) {
        matches++;
      }
    }

    return matches / totalWords;
  }
}
```

### **4. Nodo de Auto-Response**
```typescript
// src/components/FlowBuilder/nodes/AutoResponseNode.tsx
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bot, Settings, Clock, Shield } from 'lucide-react';
import { AutoResponseConfig } from '@/types/auto-response';

interface AutoResponseNodeData extends AutoResponseConfig {
  label: string;
}

export function AutoResponseNode({ data, selected }: { data: AutoResponseNodeData; selected?: boolean }) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [localData, setLocalData] = useState<AutoResponseNodeData>({
    label: 'Auto-Response 24/7',
    enabled: true,
    workingHours: {
      timezone: 'America/Mexico_City',
      enabled: true,
      schedule: {
        monday: { start: '09:00', end: '18:00', enabled: true },
        tuesday: { start: '09:00', end: '18:00', enabled: true },
        wednesday: { start: '09:00', end: '18:00', enabled: true },
        thursday: { start: '09:00', end: '18:00', enabled: true },
        friday: { start: '09:00', end: '18:00', enabled: true },
        saturday: { start: '10:00', end: '14:00', enabled: false },
        sunday: { start: '10:00', end: '14:00', enabled: false }
      }
    },
    faqDatabase: [],
    aiModel: 'gpt-4',
    confidenceThreshold: 0.8,
    maxAutoResponses: 3,
    escalationTriggers: ['urgente', 'complaint', 'problema'],
    fallbackMessage: 'Un agente se pondrá en contacto contigo pronto.',
    ...data
  });

  return (
    <>
      <Handle type="target" position={Position.Top} />
      
      <Card className={`w-80 ${selected ? 'ring-2 ring-blue-500' : ''} border-l-4 border-l-blue-500 bg-blue-50`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm font-medium">{localData.label}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsConfigOpen(true)}
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={localData.enabled} readOnly size="sm" />
            <Badge variant={localData.enabled ? "default" : "secondary"} className="text-xs">
              {localData.enabled ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Horario: {localData.workingHours.enabled ? 'Configurado' : '24/7'}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Confianza: {localData.confidenceThreshold * 100}%</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Bot className="h-3 w-3" />
              <span>FAQs: {localData.faqDatabase.length} configuradas</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Settings className="h-3 w-3" />
              <span>Modelo: {localData.aiModel}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Handles de salida */}
      <Handle type="source" position={Position.Bottom} id="auto_response" className="w-3 h-3" />
      <Handle type="source" position={Position.Right} id="escalate" className="w-3 h-3" />
      <Handle type="source" position={Position.Left} id="out_of_hours" className="w-3 h-3" />

      {/* Modal de configuración - Implementar según necesidad */}
    </>
  );
}
```

---

## 💭 **PRIORIDAD 3: Sentiment Analysis**

### **Estructura de Archivos**
```
src/
├── services/
│   └── sentiment/
│       ├── SentimentAnalyzer.ts
│       └── EmotionDetector.ts
└── components/
    └── FlowBuilder/
        └── nodes/
            └── SentimentAnalysisNode.tsx
```

### **1. Tipos TypeScript**
```typescript
// src/types/sentiment.ts
export interface SentimentAnalysis {
  score: number; // -1 (muy negativo) a 1 (muy positivo)
  confidence: number; // 0 a 1
  emotion: 'joy' | 'anger' | 'fear' | 'sadness' | 'surprise' | 'neutral';
  keywords: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface SentimentConfig {
  enabled: boolean;
  models: ('openai' | 'azure' | 'aws')[];
  alertThresholds: {
    negative: number;
    positive: number;
  };
  actions: {
    onNegative: 'escalate' | 'auto_resolve' | 'notify' | 'none';
    onPositive: 'upsell' | 'survey' | 'thank' | 'none';
  };
  saveToProperty: string;
  realTimeAlerts: boolean;
}
```

### **2. Sentiment Analyzer**
```typescript
// src/services/sentiment/SentimentAnalyzer.ts
import { SentimentAnalysis } from '@/types/sentiment';

export class SentimentAnalyzer {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-3.5-turbo') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    const prompt = `
Analiza el sentimiento del siguiente texto y responde SOLO con un JSON válido:

Texto: "${text}"

Formato de respuesta:
{
  "score": número entre -1 y 1,
  "confidence": número entre 0 y 1,
  "emotion": "joy|anger|fear|sadness|surprise|neutral",
  "keywords": ["palabra1", "palabra2"],
  "severity": "low|medium|high"
}
`;

    try {
      // Integrar con el AIAgentNode existente para hacer la llamada
      const response = await this.callAI(prompt);
      const analysis = JSON.parse(response);
      
      return {
        score: analysis.score || 0,
        confidence: analysis.confidence || 0,
        emotion: analysis.emotion || 'neutral',
        keywords: analysis.keywords || [],
        severity: analysis.severity || 'low'
      };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return {
        score: 0,
        confidence: 0,
        emotion: 'neutral',
        keywords: [],
        severity: 'low'
      };
    }
  }

  private async callAI(prompt: string): Promise<string> {
    // Placeholder - integrar con el sistema AI existente
    // Usar el AIAgentNode o el servicio correspondiente
    return '{"score": 0, "confidence": 0, "emotion": "neutral", "keywords": [], "severity": "low"}';
  }

  async batchAnalyze(messages: string[]): Promise<SentimentAnalysis[]> {
    const results: SentimentAnalysis[] = [];
    
    for (const message of messages) {
      const analysis = await this.analyzeSentiment(message);
      results.push(analysis);
    }
    
    return results;
  }

  calculateTrendScore(analyses: SentimentAnalysis[]): number {
    if (analyses.length === 0) return 0;
    
    const totalScore = analyses.reduce((sum, analysis) => sum + analysis.score, 0);
    return totalScore / analyses.length;
  }
}
```

### **3. Nodo de Sentiment Analysis**
```typescript
// src/components/FlowBuilder/nodes/SentimentAnalysisNode.tsx
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, AlertTriangle, TrendingUp, Settings } from 'lucide-react';
import { SentimentConfig } from '@/types/sentiment';

interface SentimentAnalysisNodeData extends SentimentConfig {
  label: string;
}

export function SentimentAnalysisNode({ data, selected }: { data: SentimentAnalysisNodeData; selected?: boolean }) {
  const [localData, setLocalData] = useState<SentimentAnalysisNodeData>({
    label: 'Análisis de Sentimientos',
    enabled: true,
    models: ['openai'],
    alertThresholds: {
      negative: -0.5,
      positive: 0.7
    },
    actions: {
      onNegative: 'escalate',
      onPositive: 'thank'
    },
    saveToProperty: 'sentiment_score',
    realTimeAlerts: true,
    ...data
  });

  const getSentimentColor = () => {
    return 'border-l-purple-500 bg-purple-50';
  };

  return (
    <>
      <Handle type="target" position={Position.Top} />
      
      <Card className={`w-80 ${selected ? 'ring-2 ring-blue-500' : ''} ${getSentimentColor()} border-l-4`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-purple-600" />
              <CardTitle className="text-sm font-medium">{localData.label}</CardTitle>
            </div>
            <Button variant="ghost" size="sm">
              <Settings className="h-3 w-3" />
            </Button>
          </div>
          <Badge variant={localData.enabled ? "default" : "secondary"} className="w-fit text-xs">
            {localData.enabled ? 'Activo' : 'Inactivo'}
          </Badge>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>Modelos: {localData.models.join(', ')}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              <span>Umbral negativo: {localData.alertThresholds.negative}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>Umbral positivo: {localData.alertThresholds.positive}</span>
            </div>
            
            <div className="mt-3">
              <div className="text-xs font-medium text-gray-700 mb-1">Acciones:</div>
              <div className="space-y-1">
                <div className="text-xs">Negativo: {localData.actions.onNegative}</div>
                <div className="text-xs">Positivo: {localData.actions.onPositive}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Handles de salida */}
      <Handle type="source" position={Position.Bottom} id="neutral" className="w-3 h-3" />
      <Handle type="source" position={Position.Right} id="positive" className="w-3 h-3" />
      <Handle type="source" position={Position.Left} id="negative" className="w-3 h-3" />
    </>
  );
}
```

---

## 🔧 **Integración con Componentes Existentes**

### **1. Modificar FlowBuilder.tsx**
```typescript
// src/components/FlowBuilder/FlowBuilder.tsx
import { AutoResponseNode } from './nodes/AutoResponseNode';
import { KnowledgeBaseNode } from './nodes/KnowledgeBaseNode';
import { SentimentAnalysisNode } from './nodes/SentimentAnalysisNode';

// Agregar a nodeTypes
const nodeTypes = {
  // ... nodos existentes
  autoResponse: AutoResponseNode,
  knowledgeBase: KnowledgeBaseNode,
  sentimentAnalysis: SentimentAnalysisNode,
};

// Agregar a nodeCategories
const nodeCategories = {
  // ... categorías existentes
  automation: {
    title: 'Automatización IA',
    icon: Bot,
    color: 'bg-purple-50 border-purple-200',
    nodes: [
      {
        type: 'autoResponse',
        title: 'Auto-Response 24/7',
        description: 'Respuestas automáticas inteligentes',
        icon: Bot,
        color: 'text-purple-600',
        defaultData: {
          label: 'Auto-Response 24/7',
          enabled: true,
          workingHours: { /* config por defecto */ },
          // ... más config
        }
      },
      {
        type: 'knowledgeBase',
        title: 'Knowledge Base',
        description: 'Base de conocimiento inteligente',
        icon: Database,
        color: 'text-purple-600',
        defaultData: {
          label: 'Knowledge Base',
          searchMode: 'hybrid',
          // ... más config
        }
      },
      {
        type: 'sentimentAnalysis',
        title: 'Sentiment Analysis',
        description: 'Análisis de emociones',
        icon: Heart,
        color: 'text-purple-600',
        defaultData: {
          label: 'Análisis de Sentimientos',
          enabled: true,
          // ... más config
        }
      }
    ]
  }
};
```

### **2. Ejecutores de Nodos**
```typescript
// src/services/node-executors/auto-response-executor.ts
export class AutoResponseExecutor {
  async execute(nodeData: any, context: any) {
    const service = new AutoResponseService(nodeData);
    const result = await service.handleIncomingMessage(context.message);
    
    if (result.shouldRespond) {
      // Enviar respuesta automática
      await context.sendMessage(result.response);
      return { success: true, response: result.response };
    } else {
      // Escalar a humano
      await context.escalateToHuman(result.escalationReason);
      return { success: true, escalated: true };
    }
  }
}

// Registrar en executor-registry.ts
```

---

## 📋 **Checklist de Implementación**

### **Semana 1-2: Auto-Response Engine**
- [ ] Crear tipos TypeScript (`auto-response.ts`)
- [ ] Implementar `AutoResponseService`
- [ ] Implementar `FAQMatcher`
- [ ] Implementar `ComplexityEvaluator`
- [ ] Implementar `EscalationEngine`
- [ ] Crear `AutoResponseNode` componente
- [ ] Integrar con `FlowBuilder`
- [ ] Crear ejecutor del nodo
- [ ] Testing básico

### **Semana 3-4: Knowledge Base**
- [ ] Crear tipos TypeScript (`knowledge-base.ts`)
- [ ] Implementar `KnowledgeBaseService`
- [ ] Implementar `SemanticSearch`
- [ ] Crear `KnowledgeBaseNode` componente
- [ ] Crear interfaz de gestión de FAQs
- [ ] Integrar con Auto-Response
- [ ] Testing y optimización

### **Semana 5-6: Sentiment Analysis**
- [ ] Crear tipos TypeScript (`sentiment.ts`)
- [ ] Implementar `SentimentAnalyzer`
- [ ] Crear `SentimentAnalysisNode` componente
- [ ] Integrar con dashboard existente
- [ ] Crear alertas automáticas
- [ ] Testing y ajustes finales

### **Semana 7: Integración y Testing**
- [ ] Testing integral de todas las funcionalidades
- [ ] Optimización de rendimiento
- [ ] Documentación
- [ ] Preparación para producción

---

## 🚀 **Comandos para Comenzar**

```bash
# 1. Crear estructura de carpetas
mkdir -p src/services/auto-response
mkdir -p src/services/knowledge-base  
mkdir -p src/services/sentiment
mkdir -p src/types

# 2. Crear archivos base
touch src/types/auto-response.ts
touch src/types/knowledge-base.ts
touch src/types/sentiment.ts
touch src/services/auto-response/AutoResponseService.ts
touch src/components/FlowBuilder/nodes/AutoResponseNode.tsx

# 3. Instalar dependencias adicionales (si es necesario)
npm install openai axios
```

**¡Listo para comenzar el desarrollo! 🎯**