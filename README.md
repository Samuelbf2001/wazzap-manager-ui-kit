# WhatsApp Manager UI Kit

**Una completa suite de gestión y automatización para WhatsApp Business Platform**

## 📋 Descripción

WhatsApp Manager UI Kit es una aplicación web avanzada diseñada para gestionar, automatizar y optimizar las operaciones de WhatsApp Business. La aplicación proporciona herramientas completas para el manejo de conversaciones, construcción de flujos automatizados, integración con CRM, y análisis de rendimiento.

## 🚀 Características Principales

### 🔧 **Constructor de Flujos Avanzado**
- **Interfaz Visual Drag & Drop**: Crea flujos de conversación complejos arrastrando y soltando nodos
- **20+ Tipos de Nodos Especializados**: Desde mensajes simples hasta integraciones avanzadas con IA
- **Lógica Condicional Avanzada**: Evaluación con IA y reglas tradicionales con operadores AND/OR
- **Integración con WhatsApp Flows**: Soporte nativo para flujos estructurados de Meta

### 🤖 **Inteligencia Artificial Integrada**
- **Múltiples Modelos de IA**: Soporte para GPT-3.5, GPT-4, Claude 3
- **Extracción Inteligente de Datos**: IA para extraer información específica de respuestas naturales
- **Evaluación de Condiciones con IA**: Análisis inteligente de intenciones y sentimientos
- **Formateo Automático**: Conversión de datos estructurados a texto legible

### 🔗 **Integraciones Empresariales**
- **HubSpot CRM**: Sincronización bidireccional completa
- **Meta Conversions API**: Tracking de eventos y conversiones
- **APIs REST Personalizadas**: Conectores HTTP flexibles
- **Webhooks**: Integración en tiempo real con sistemas externos

### 📊 **Gestión de Datos Avanzada**
- **Recopilación Inteligente**: Formularios dinámicos con validación
- **Base de Datos Flexible**: Múltiples tablas y tipos de datos
- **Reconocimiento en HubSpot**: Búsqueda y recuperación automática de datos
- **Asignación de Propiedades**: Mapeo automático de datos

### 💬 **Gestión de Conversaciones**
- **Mensajes Enriquecidos**: Formato, emojis, variables dinámicas
- **Botones Interactivos**: Respuestas rápidas y menús
- **Encuestas y Formularios**: Recopilación de feedback estructurado
- **Localización**: Solicitud y manejo de ubicaciones

## 🏗️ Arquitectura Técnica

### **Frontend**
- **React 18** con TypeScript
- **React Flow** para el constructor visual
- **Tailwind CSS** para estilos responsive
- **shadcn/ui** para componentes de UI
- **Lucide React** para iconografía

### **Estructura de Componentes**

```
src/
├── components/
│   ├── FlowBuilder/           # Constructor de flujos
│   │   ├── FlowBuilder.tsx    # Componente principal
│   │   └── nodes/             # Nodos especializados
│   │       ├── EnhancedMessageNode.tsx
│   │       ├── AdvancedConditionNode.tsx
│   │       ├── WhatsAppFlowNode.tsx
│   │       ├── DatabaseNode.tsx
│   │       ├── AIResponseNode.tsx
│   │       ├── FormatterNode.tsx
│   │       ├── AssignmentNode.tsx
│   │       ├── HttpRequestNode.tsx
│   │       ├── RecognitionNode.tsx
│   │       ├── MetaConversionsNode.tsx
│   │       └── [más nodos...]
│   ├── Sidebar.tsx            # Navegación principal
│   ├── SidebarContext.tsx     # Estado global del sidebar
│   └── [otros componentes...]
├── pages/
│   └── Index.tsx              # Página principal
└── [configuración...]
```

## 📚 Módulos y Funcionalidades

### **1. Módulo Formateador (FormatterNode)**
Convierte datos estructurados en texto legible usando IA o plantillas.

**Características:**
- Formateo con IA (GPT-3.5, GPT-4, Claude)
- Plantillas predefinidas
- Procesamiento JSON
- Variables dinámicas con transformaciones
- Múltiples fuentes de entrada
- Formatos de salida (texto, markdown, HTML, JSON)

### **2. Módulo Asignación (AssignmentNode)**
Asigna propiedades de conversación en HubSpot CRM.

**Características:**
- Múltiples tipos de objetos HubSpot (contacto, deal, empresa, ticket)
- Configuración de conexión HubSpot
- Asignaciones de propiedades con diferentes tipos de fuente
- Métodos de identificación de contactos
- Reglas de validación
- Actualizaciones en lote

### **3. Módulo Petición HTTP (HttpRequestNode)**
Realiza peticiones HTTP completas a APIs externas.

**Características:**
- Múltiples métodos HTTP (GET, POST, PUT, DELETE)
- Tipos de autenticación (Bearer, Basic, API Key, OAuth2)
- Gestión de headers y parámetros
- Diferentes tipos de body (JSON, form data, text, XML)
- Manejo de respuestas y extracción de datos
- Variables dinámicas

### **4. Módulo Reconocimiento (RecognitionNode)**
Busca información en HubSpot bajo propiedades específicas.

**Características:**
- Búsqueda en diferentes objetos HubSpot
- Criterios de búsqueda complejos con múltiples operadores
- Configuración de recuperación de propiedades
- Manejo de resultados con ordenamiento y límites
- Condiciones de salida para diferentes rutas de flujo
- Capacidades de caché

### **5. Módulo Conversiones Meta (MetaConversionsNode)**
Envía conversiones API a Meta/Facebook para tracking.

**Características:**
- Múltiples tipos de eventos (Purchase, AddToCart, ViewContent, Lead)
- Recolección y mapeo de datos de usuario
- Parámetros de eventos personalizados
- Transformación de datos (hash, formateo)
- Soporte de deduplicación
- Opciones de validación

### **6. Módulo WhatsApp Flow (WhatsAppFlowNode)**
Integración nativa con WhatsApp Flows de Meta.

**Características:**
- Templates predefinidos basados en casos de uso de Meta
- Constructor de formularios dinámico
- Validación de campos personalizable
- Integración con webhooks
- Manejo de autenticación
- Lógica condicional entre campos

### **7. Módulo Condición Avanzada (AdvancedConditionNode)**
Sistema de evaluación de condiciones con múltiples modos.

**Características:**
- **Modo Reglas**: Evaluación tradicional con campos y operadores
- **Modo IA**: Evaluación inteligente usando modelos de lenguaje
- **Modo Híbrido**: Combina IA con reglas como fallback
- Múltiples grupos de reglas con lógica AND/OR
- 15+ operadores de comparación
- Integración con diferentes fuentes de datos

### **8. Módulo Recopilación de Datos (DatabaseNode)**
Recopila y almacena información de usuarios con IA.

**Características:**
- Extracción inteligente con IA
- Múltiples tipos de campo
- Validación personalizada
- Configuración avanzada de base de datos
- Prompts de IA personalizables
- Ejemplos de entrenamiento

## 🛠️ Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+ 
- npm o yarn
- Navegador moderno con soporte ES6+

### **Instalación**

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/wazzap-manager-ui-kit.git

# Navegar al directorio
cd wazzap-manager-ui-kit

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### **Variables de Entorno**

Crear un archivo `.env.local` en la raíz del proyecto:

```env
# APIs de IA
VITE_OPENAI_API_KEY=tu_api_key_openai
VITE_ANTHROPIC_API_KEY=tu_api_key_anthropic

# HubSpot
VITE_HUBSPOT_API_KEY=tu_api_key_hubspot
VITE_HUBSPOT_PORTAL_ID=tu_portal_id

# Meta/Facebook
VITE_META_ACCESS_TOKEN=tu_access_token
VITE_META_PIXEL_ID=tu_pixel_id

# WhatsApp Business
VITE_WHATSAPP_TOKEN=tu_whatsapp_token
VITE_WHATSAPP_PHONE_ID=tu_phone_number_id
```

## 🎯 Casos de Uso

### **1. E-commerce**
- Flujos de abandono de carrito
- Recomendaciones de productos
- Seguimiento de pedidos
- Atención al cliente automatizada

### **2. Servicios Financieros**
- Solicitudes de préstamos pre-aprobados
- Cotizaciones de seguros
- Asesoría financiera automatizada
- Verificación de identidad

### **3. Salud y Bienestar**
- Citas médicas automatizadas
- Recordatorios de medicamentos
- Encuestas de satisfacción
- Triaje inicial

### **4. Educación**
- Inscripciones a cursos
- Seguimiento académico
- Comunicación con padres
- Soporte estudiantil

## 🔧 Desarrollo y Personalización

### **Crear un Nuevo Nodo**

1. **Crear el componente del nodo:**

```typescript
// src/components/FlowBuilder/nodes/MiNuevoNode.tsx
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
// ... más imports

interface MiNuevoNodeProps {
  data: {
    label: string;
    // ... propiedades específicas
  };
  selected?: boolean;
}

/**
 * Componente MiNuevoNode
 * 
 * Descripción detallada de lo que hace este nodo.
 * Incluye casos de uso y configuraciones importantes.
 */
export function MiNuevoNode({ data, selected }: MiNuevoNodeProps) {
  // ... implementación
  
  return (
    <>
      <Handle type="target" position={Position.Top} />
      {/* ... contenido del nodo */}
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
```

2. **Registrar en FlowBuilder:**

```typescript
// src/components/FlowBuilder/FlowBuilder.tsx
import { MiNuevoNode } from './nodes/MiNuevoNode';

const nodeTypes = {
  // ... nodos existentes
  miNuevoNodo: MiNuevoNode,
};
```

3. **Agregar a la paleta de herramientas:**

```typescript
const nodeCategories = {
  miCategoria: {
    title: 'Mi Categoría',
    icon: MiIcono,
    color: 'bg-mi-color-50 border-mi-color-200',
    nodes: [
      {
        type: 'miNuevoNodo',
        title: 'Mi Nuevo Nodo',
        description: 'Descripción del nodo',
        icon: MiIcono,
        color: 'text-mi-color-600',
        defaultData: {
          label: 'Mi Nodo',
          // ... datos por defecto
        }
      }
    ]
  }
};
```

### **Mejores Prácticas de Desarrollo**

1. **Comentarios en Código:**
   - Documentar todas las interfaces TypeScript
   - Explicar la lógica compleja
   - Incluir ejemplos de uso en JSDoc

2. **Gestión de Estado:**
   - Usar hooks de React apropiados
   - Implementar contextos para estado global
   - Validar datos antes de guardado

3. **Manejo de Errores:**
   - Implementar try-catch en operaciones asíncronas
   - Mostrar mensajes de error útiles
   - Logging para debugging

4. **Performance:**
   - Usar useMemo y useCallback donde corresponde
   - Lazy loading para componentes pesados
   - Optimizar renders innecesarios

## 🔐 Seguridad

### **Autenticación y Autorización**
- Tokens JWT para APIs
- Encriptación de datos sensibles
- Validación de permisos por módulo

### **Protección de Datos**
- Sanitización de inputs
- Validación de schemas
- Logs de auditoría

### **APIs Externas**
- Rate limiting
- Timeouts configurables
- Fallbacks y reintentos

## 📊 Monitoreo y Analytics

### **Métricas de Flujos**
- Tasa de completado
- Puntos de abandono
- Tiempo de respuesta
- Errores frecuentes

### **Performance de IA**
- Precisión de clasificaciones
- Tiempo de respuesta
- Costos por modelo
- Uso de tokens

### **Integraciones**
- Estado de conexiones
- Latencia de APIs
- Volumen de datos sincronizados
- Errores de integración

## 🚀 Roadmap

### **Versión 2.1 - Q1 2024**
- [ ] Editor de código para nodos personalizados
- [ ] Plantillas de flujos predefinidas
- [ ] Testing A/B de flujos
- [ ] Analytics avanzados

### **Versión 2.2 - Q2 2024**
- [ ] Integración con más CRMs
- [ ] Soporte multiidioma
- [ ] Colaboración en tiempo real
- [ ] Mobile app companion

### **Versión 3.0 - Q3 2024**
- [ ] Marketplace de nodos
- [ ] IA propia entrenada
- [ ] Escalabilidad enterprise
- [ ] White-label solutions

## 📞 Soporte y Comunidad

### **Documentación**
- [Wiki completa](https://github.com/tu-usuario/wazzap-manager-ui-kit/wiki)
- [API Reference](https://docs.wazzap-manager.com)
- [Video tutoriales](https://youtube.com/wazzap-manager)

### **Comunidad**
- [Discord Server](https://discord.gg/wazzap-manager)
- [Stack Overflow Tag](https://stackoverflow.com/questions/tagged/wazzap-manager)
- [GitHub Discussions](https://github.com/tu-usuario/wazzap-manager-ui-kit/discussions)

### **Soporte Comercial**
- Email: soporte@wazzap-manager.com
- Whatsapp: +1-555-WAZZAP-1
- Calendly: [Agendar sesión](https://calendly.com/wazzap-manager)

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 👥 Equipo

- **Lead Developer**: [@tu-usuario](https://github.com/tu-usuario)
- **UI/UX Designer**: [@diseñador](https://github.com/diseñador)
- **DevOps Engineer**: [@devops](https://github.com/devops)

## 🙏 Agradecimientos

- Meta/Facebook por WhatsApp Business Platform
- HubSpot por su API robusta
- OpenAI y Anthropic por sus modelos de IA
- La comunidad React por las herramientas increíbles

---

**¿Listo para automatizar tu WhatsApp Business?** 🚀

[Comenzar ahora](https://github.com/tu-usuario/wazzap-manager-ui-kit) | [Demo en vivo](https://demo.wazzap-manager.com) | [Documentación](https://docs.wazzap-manager.com)
