# 🤝 Contribuir a WhatsApp Manager UI Kit

¡Gracias por tu interés en contribuir a WhatsApp Manager UI Kit! Valoramos mucho las contribuciones de la comunidad.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Estándares de Código](#estándares-de-código)
- [Commits y Pull Requests](#commits-y-pull-requests)
- [Reportar Errores](#reportar-errores)
- [Solicitar Funcionalidades](#solicitar-funcionalidades)

## 📜 Código de Conducta

Este proyecto sigue el [Código de Conducta de Contribuyentes](https://www.contributor-covenant.org/). Al participar, se espera que respetes este código.

## 🚀 ¿Cómo puedo contribuir?

### 🐛 Reportar Errores
- Revisa si el error ya fue reportado en [Issues](https://github.com/Samuelbf2001/wazzap-manager-ui-kit/issues)
- Si no existe, crea un nuevo issue con el template de bug report
- Incluye información detallada: pasos para reproducir, comportamiento esperado vs actual, capturas de pantalla

### 💡 Solicitar Funcionalidades
- Revisa si la funcionalidad ya fue solicitada
- Crea un issue con el template de feature request
- Describe claramente el problema que resuelve y el beneficio esperado

### 🔧 Contribuir con Código
- Corrección de errores
- Nuevas funcionalidades
- Mejoras de rendimiento
- Mejoras de documentación
- Refactoring de código

## 🛠️ Configuración del Entorno

### Prerrequisitos
- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **Git** ([Descargar](https://git-scm.com/))
- **Evolution API** configurado localmente
- Editor de código (recomendamos VS Code)

### Configuración Inicial

```bash
# 1. Fork y clona el repositorio
git clone https://github.com/tu-usuario/wazzap-manager-ui-kit.git
cd wazzap-manager-ui-kit

# 2. Instala dependencias
npm install

# 3. Configura variables de entorno
cp .env.example .env
# Edita .env con tu configuración

# 4. Inicia el servidor de desarrollo
npm run dev
```

### Extensiones Recomendadas para VS Code

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json"
  ]
}
```

## 🔄 Flujo de Trabajo

### 1. Preparación
```bash
# Mantén tu fork actualizado
git remote add upstream https://github.com/Samuelbf2001/wazzap-manager-ui-kit.git
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. Crear Branch de Funcionalidad
```bash
# Usa nombres descriptivos
git checkout -b feature/nueva-funcionalidad
git checkout -b fix/corregir-error
git checkout -b docs/actualizar-readme
```

### 3. Desarrollo
- Haz commits pequeños y frecuentes
- Escribe mensajes de commit claros
- Ejecuta pruebas regularmente
- Mantén el código limpio y bien documentado

### 4. Antes de Enviar PR
```bash
# Ejecuta linting
npm run lint

# Ejecuta build para verificar
npm run build

# Asegúrate de que todo funcione
npm run dev
```

## 📏 Estándares de Código

### TypeScript
- Usa TypeScript para todo el código nuevo
- Define interfaces para props y estados
- Evita usar `any`, prefer tipos específicos

```typescript
// ✅ Bien
interface ButtonProps {
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick: () => void;
}

// ❌ Mal
interface ButtonProps {
  variant: any;
  children: any;
  onClick: any;
}
```

### React
- Usa componentes funcionales con hooks
- Implementa `React.memo()` para componentes que se re-renderizan frecuentemente
- Extrae custom hooks para lógica reutilizable

```typescript
// ✅ Componente optimizado
const MessageCard = React.memo(({ message, onReply }: MessageCardProps) => {
  return (
    <div className="message-card">
      {/* contenido */}
    </div>
  );
});

MessageCard.displayName = 'MessageCard';
```

### Estilos (Tailwind CSS)
- Usa las clases de utilidad de Tailwind
- Crea componentes reutilizables con `class-variance-authority`
- Mantén las clases organizadas y legibles

```typescript
// ✅ Bien organizado
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
    },
  }
);
```

### Estructura de Archivos
```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes básicos de UI
│   └── feature/        # Componentes específicos de funcionalidades
├── pages/              # Páginas/rutas
├── hooks/              # Custom hooks
├── services/           # Servicios y APIs
├── types/              # Definiciones de tipos
├── lib/                # Utilidades y configuraciones
└── config/             # Configuraciones
```

## 📝 Commits y Pull Requests

### Formato de Commits
Usa [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(scope): descripción breve

Descripción más detallada si es necesaria.

Fixes #123
```

**Tipos permitidos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de error
- `docs`: Documentación
- `style`: Cambios de formato
- `refactor`: Refactoring
- `test`: Pruebas
- `chore`: Tareas de mantenimiento

### Ejemplos de Commits
```bash
feat(inbox): añadir filtros de búsqueda en bandeja de entrada
fix(auth): corregir problema de redirección después del login
docs(readme): actualizar instrucciones de instalación
refactor(components): extraer hook personalizado para gestión de estado
```

### Pull Requests

#### Template de PR
```markdown
## 📝 Descripción
Breve descripción de los cambios realizados.

## 🔧 Tipo de Cambio
- [ ] Bug fix (cambio que corrige un error)
- [ ] Nueva funcionalidad (cambio que añade funcionalidad)
- [ ] Breaking change (cambio que puede romper funcionalidad existente)
- [ ] Documentación

## 🧪 ¿Cómo se ha probado?
- [ ] Pruebas unitarias
- [ ] Pruebas de integración
- [ ] Pruebas manuales

## 📋 Checklist
- [ ] Mi código sigue las convenciones del proyecto
- [ ] He realizado una auto-revisión del código
- [ ] He comentado el código, especialmente en áreas complejas
- [ ] He actualizado la documentación correspondiente
- [ ] Mis cambios no generan nuevas advertencias
```

## 🐛 Reportar Errores

### Template de Issue para Errores
```markdown
**Descripción del Error**
Descripción clara y concisa del error.

**Pasos para Reproducir**
1. Ve a '...'
2. Haz clic en '...'
3. Desplázate hacia '...'
4. Ve el error

**Comportamiento Esperado**
Descripción clara de lo que esperabas que sucediera.

**Capturas de Pantalla**
Si es aplicable, añade capturas de pantalla.

**Información del Entorno:**
- OS: [ej. Windows 10, macOS 12.0]
- Navegador: [ej. Chrome 98, Firefox 97]
- Versión de Node.js: [ej. 18.0.0]
- Versión del proyecto: [ej. 1.0.0]

**Contexto Adicional**
Cualquier otra información relevante sobre el problema.
```

## 💡 Solicitar Funcionalidades

### Template de Issue para Features
```markdown
**¿Tu solicitud de funcionalidad está relacionada con un problema?**
Descripción clara y concisa del problema. Ej. "Estoy frustrado porque..."

**Describe la solución que te gustaría**
Descripción clara y concisa de lo que quieres que suceda.

**Describe alternativas que hayas considerado**
Descripción de cualquier solución o funcionalidad alternativa.

**Contexto Adicional**
Añade cualquier otro contexto o capturas de pantalla sobre la solicitud de funcionalidad.

**Beneficio Esperado**
¿Cómo beneficiaría esta funcionalidad a los usuarios?
```

## 🎉 Reconocimiento

Los contribuidores serán reconocidos en:
- README del proyecto
- Release notes
- Hall of Fame (próximamente)

## 📞 ¿Necesitas Ayuda?

- 📧 **Email**: soporte@whatsappmanager.com
- 💬 **Discord**: [Únete a nuestra comunidad](https://discord.gg/your-invite)
- 📚 **Documentación**: [docs/](./docs/)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Samuelbf2001/wazzap-manager-ui-kit/issues)

---

¡Gracias por contribuir a hacer WhatsApp Manager UI Kit mejor para todos! 🚀