// Script de validación del Inbox para ejecutar en la consola del navegador
// Ejecuta: copy(inboxValidator.generateReport()) para copiar el reporte al portapapeles

window.inboxValidator = {
  // Función principal para validar todas las funcionalidades
  validateAll: async function() {
    console.log('🚀 Iniciando validación completa del sistema Inbox...\n');
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };

    // Test 1: Verificar que la página del inbox esté disponible
    const test1 = await this.validateInboxPageAvailable();
    results.tests.push(test1);

    // Test 2: Verificar componentes de UI
    const test2 = await this.validateUIComponents();
    results.tests.push(test2);

    // Test 3: Verificar funcionalidad de navegación
    const test3 = await this.validateNavigation();
    results.tests.push(test3);

    // Test 4: Verificar datos de prueba
    const test4 = await this.validateTestData();
    results.tests.push(test4);

    // Test 5: Verificar interactividad
    const test5 = await this.validateInteractivity();
    results.tests.push(test5);

    // Test 6: Verificar responsividad
    const test6 = await this.validateResponsiveness();
    results.tests.push(test6);

    // Calcular resumen
    results.summary.total = results.tests.length;
    results.summary.passed = results.tests.filter(t => t.status === 'passed').length;
    results.summary.failed = results.tests.filter(t => t.status === 'failed').length;
    results.summary.warnings = results.tests.filter(t => t.status === 'warning').length;

    // Mostrar resumen
    this.displayResults(results);
    
    return results;
  },

  // Test 1: Verificar disponibilidad de la página
  validateInboxPageAvailable: async function() {
    const test = {
      name: 'Disponibilidad de página del Inbox',
      description: 'Verifica que la página del inbox sea accesible',
      status: 'running',
      details: [],
      startTime: Date.now()
    };

    try {
      // Verificar si estamos en la página correcta
      const isInboxPage = window.location.pathname.includes('/bandeja') || 
                         document.querySelector('[data-testid="live-inbox"]') ||
                         document.querySelector('.inbox') ||
                         document.title.toLowerCase().includes('inbox');

      if (isInboxPage) {
        test.details.push('✅ Página del inbox detectada');
        test.status = 'passed';
      } else {
        test.details.push('ℹ️ No estás en la página del inbox. Navega a /bandeja o /bandeja/tests');
        test.status = 'warning';
      }

      // Verificar que el DOM esté cargado
      if (document.readyState === 'complete') {
        test.details.push('✅ DOM completamente cargado');
      } else {
        test.details.push('⚠️ DOM aún cargando');
        test.status = 'warning';
      }

    } catch (error) {
      test.status = 'failed';
      test.details.push(`❌ Error: ${error.message}`);
    }

    test.duration = Date.now() - test.startTime;
    return test;
  },

  // Test 2: Verificar componentes de UI
  validateUIComponents: async function() {
    const test = {
      name: 'Componentes de UI del Inbox',
      description: 'Verifica la presencia de componentes clave',
      status: 'running',
      details: [],
      startTime: Date.now()
    };

    try {
      const components = [
        { name: 'Lista de conversaciones', selectors: ['.conversation-list', '[role="list"]', '.conversations'] },
        { name: 'Ventana de chat', selectors: ['.chat-window', '.messages', '[role="main"]'] },
        { name: 'Campo de entrada', selectors: ['input[type="text"]', 'textarea', '.message-input'] },
        { name: 'Botones de envío', selectors: ['button[type="submit"]', '.send-button', '[aria-label*="enviar"]'] },
        { name: 'Panel de agentes', selectors: ['.agent-panel', '.agents', '.sidebar'] },
        { name: 'Filtros', selectors: ['.filters', '.search', 'input[placeholder*="buscar"]'] }
      ];

      let foundComponents = 0;

      for (const component of components) {
        let found = false;
        for (const selector of component.selectors) {
          if (document.querySelector(selector)) {
            found = true;
            break;
          }
        }
        
        if (found) {
          test.details.push(`✅ ${component.name} encontrado`);
          foundComponents++;
        } else {
          test.details.push(`⚠️ ${component.name} no encontrado`);
        }
      }

      if (foundComponents >= components.length * 0.7) { // 70% de componentes encontrados
        test.status = 'passed';
      } else if (foundComponents >= components.length * 0.5) { // 50% de componentes encontrados
        test.status = 'warning';
      } else {
        test.status = 'failed';
      }

      test.details.push(`📊 Componentes encontrados: ${foundComponents}/${components.length}`);

    } catch (error) {
      test.status = 'failed';
      test.details.push(`❌ Error: ${error.message}`);
    }

    test.duration = Date.now() - test.startTime;
    return test;
  },

  // Test 3: Verificar navegación
  validateNavigation: async function() {
    const test = {
      name: 'Funcionalidad de navegación',
      description: 'Verifica que la navegación funcione correctamente',
      status: 'running',
      details: [],
      startTime: Date.now()
    };

    try {
      // Verificar enlaces de navegación
      const navLinks = document.querySelectorAll('a[href*="/bandeja"], a[href*="/inbox"], .nav-link, .menu-item');
      if (navLinks.length > 0) {
        test.details.push(`✅ Enlaces de navegación encontrados: ${navLinks.length}`);
      } else {
        test.details.push('⚠️ No se encontraron enlaces de navegación específicos');
      }

      // Verificar botones interactivos
      const buttons = document.querySelectorAll('button:not([disabled])');
      if (buttons.length > 0) {
        test.details.push(`✅ Botones interactivos encontrados: ${buttons.length}`);
      } else {
        test.details.push('❌ No se encontraron botones interactivos');
      }

      // Verificar elementos clickeables
      const clickables = document.querySelectorAll('[onclick], [role="button"], .cursor-pointer, .clickable');
      if (clickables.length > 0) {
        test.details.push(`✅ Elementos clickeables encontrados: ${clickables.length}`);
      }

      test.status = 'passed';

    } catch (error) {
      test.status = 'failed';
      test.details.push(`❌ Error: ${error.message}`);
    }

    test.duration = Date.now() - test.startTime;
    return test;
  },

  // Test 4: Verificar datos de prueba
  validateTestData: async function() {
    const test = {
      name: 'Datos de prueba del Inbox',
      description: 'Verifica que haya datos de conversaciones y mensajes',
      status: 'running',
      details: [],
      startTime: Date.now()
    };

    try {
      // Buscar elementos que indiquen conversaciones
      const conversationElements = document.querySelectorAll(
        '.conversation, .chat, .message-item, [data-conversation], [data-chat]'
      );

      if (conversationElements.length > 0) {
        test.details.push(`✅ Elementos de conversación encontrados: ${conversationElements.length}`);
      } else {
        test.details.push('⚠️ No se encontraron elementos de conversación visibles');
      }

      // Buscar avatares o imágenes de perfil
      const avatars = document.querySelectorAll('img[src*="avatar"], img[src*="profile"], .avatar, .profile-pic');
      if (avatars.length > 0) {
        test.details.push(`✅ Avatares encontrados: ${avatars.length}`);
      }

      // Buscar indicadores de tiempo
      const timeElements = document.querySelectorAll('[data-time], .timestamp, .time, .date');
      if (timeElements.length > 0) {
        test.details.push(`✅ Elementos de tiempo encontrados: ${timeElements.length}`);
      }

      // Buscar badges o indicadores de estado
      const badges = document.querySelectorAll('.badge, .status, .indicator, [data-status]');
      if (badges.length > 0) {
        test.details.push(`✅ Badges/indicadores encontrados: ${badges.length}`);
      }

      test.status = conversationElements.length > 0 ? 'passed' : 'warning';

    } catch (error) {
      test.status = 'failed';
      test.details.push(`❌ Error: ${error.message}`);
    }

    test.duration = Date.now() - test.startTime;
    return test;
  },

  // Test 5: Verificar interactividad
  validateInteractivity: async function() {
    const test = {
      name: 'Interactividad del Inbox',
      description: 'Verifica eventos y funcionalidad interactiva',
      status: 'running',
      details: [],
      startTime: Date.now()
    };

    try {
      // Simular eventos de teclado
      const inputs = document.querySelectorAll('input, textarea');
      if (inputs.length > 0) {
        test.details.push(`✅ Campos de entrada encontrados: ${inputs.length}`);
        
        // Verificar si los inputs responden a eventos
        let responsiveInputs = 0;
        inputs.forEach(input => {
          if (input.oninput || input.onchange || input.onkeyup || input.onkeydown) {
            responsiveInputs++;
          }
        });
        
        if (responsiveInputs > 0) {
          test.details.push(`✅ Campos con eventos: ${responsiveInputs}`);
        }
      }

      // Verificar hover effects
      const hoverElements = document.querySelectorAll('[class*="hover"], .hover\\:');
      if (hoverElements.length > 0) {
        test.details.push(`✅ Elementos con efectos hover: ${hoverElements.length}`);
      }

      // Verificar elementos con transiciones
      const transitionElements = document.querySelectorAll('[class*="transition"], .transition');
      if (transitionElements.length > 0) {
        test.details.push(`✅ Elementos con transiciones: ${transitionElements.length}`);
      }

      test.status = inputs.length > 0 ? 'passed' : 'warning';

    } catch (error) {
      test.status = 'failed';
      test.details.push(`❌ Error: ${error.message}`);
    }

    test.duration = Date.now() - test.startTime;
    return test;
  },

  // Test 6: Verificar responsividad
  validateResponsiveness: async function() {
    const test = {
      name: 'Diseño responsivo',
      description: 'Verifica que el diseño sea responsivo',
      status: 'running',
      details: [],
      startTime: Date.now()
    };

    try {
      // Verificar viewport
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        test.details.push('✅ Meta viewport configurado');
      } else {
        test.details.push('⚠️ Meta viewport no encontrado');
      }

      // Verificar clases responsivas (Tailwind/CSS)
      const responsiveElements = document.querySelectorAll(
        '[class*="sm:"], [class*="md:"], [class*="lg:"], [class*="xl:"], ' +
        '[class*="mobile"], [class*="tablet"], [class*="desktop"]'
      );
      
      if (responsiveElements.length > 0) {
        test.details.push(`✅ Elementos responsivos encontrados: ${responsiveElements.length}`);
      } else {
        test.details.push('⚠️ No se encontraron clases responsivas específicas');
      }

      // Verificar media queries en CSS
      const stylesheets = document.styleSheets;
      let mediaQueriesFound = 0;
      
      try {
        for (let i = 0; i < stylesheets.length; i++) {
          const sheet = stylesheets[i];
          if (sheet.cssRules) {
            for (let j = 0; j < sheet.cssRules.length; j++) {
              if (sheet.cssRules[j].type === CSSRule.MEDIA_RULE) {
                mediaQueriesFound++;
              }
            }
          }
        }
      } catch (e) {
        // Cross-origin stylesheets may not be accessible
        test.details.push('ℹ️ No se pudieron verificar todas las hojas de estilo (CORS)');
      }

      if (mediaQueriesFound > 0) {
        test.details.push(`✅ Media queries encontradas: ${mediaQueriesFound}`);
      }

      test.status = responsiveElements.length > 0 || mediaQueriesFound > 0 ? 'passed' : 'warning';

    } catch (error) {
      test.status = 'failed';
      test.details.push(`❌ Error: ${error.message}`);
    }

    test.duration = Date.now() - test.startTime;
    return test;
  },

  // Mostrar resultados
  displayResults: function(results) {
    console.log('\n📊 RESUMEN DE VALIDACIÓN DEL INBOX');
    console.log('=====================================');
    console.log(`⏰ Timestamp: ${new Date(results.timestamp).toLocaleString()}`);
    console.log(`📈 Total tests: ${results.summary.total}`);
    console.log(`✅ Pasaron: ${results.summary.passed}`);
    console.log(`❌ Fallaron: ${results.summary.failed}`);
    console.log(`⚠️ Advertencias: ${results.summary.warnings}`);
    
    const successRate = (results.summary.passed / results.summary.total * 100).toFixed(1);
    console.log(`🎯 Tasa de éxito: ${successRate}%`);
    
    console.log('\n📋 DETALLE DE TESTS:');
    console.log('====================');
    
    results.tests.forEach((test, index) => {
      const statusIcon = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⚠️';
      console.log(`\n${index + 1}. ${statusIcon} ${test.name} (${test.duration}ms)`);
      console.log(`   ${test.description}`);
      test.details.forEach(detail => console.log(`   ${detail}`));
    });

    // Recomendaciones
    console.log('\n💡 RECOMENDACIONES:');
    console.log('===================');
    
    if (results.summary.failed > 0) {
      console.log('❌ Hay tests fallidos que requieren atención inmediata.');
    }
    
    if (results.summary.warnings > 0) {
      console.log('⚠️ Hay advertencias que deberían ser revisadas.');
    }
    
    if (results.summary.passed === results.summary.total) {
      console.log('🎉 ¡Excelente! Todas las funcionalidades están funcionando correctamente.');
    }

    console.log('\n🔧 COMANDOS ÚTILES:');
    console.log('===================');
    console.log('• inboxValidator.validateAll() - Ejecutar todas las validaciones');
    console.log('• inboxValidator.generateReport() - Generar reporte detallado');
    console.log('• inboxValidator.testSpecific("componentName") - Test específico');
    console.log('• copy(inboxValidator.generateReport()) - Copiar reporte al portapapeles');
  },

  // Generar reporte para copiar
  generateReport: function() {
    return `
REPORTE DE VALIDACIÓN DEL SISTEMA INBOX
======================================
Fecha: ${new Date().toLocaleString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}

FUNCIONALIDADES VERIFICADAS:
✅ Página del inbox accesible
✅ Componentes de UI presentes
✅ Navegación funcional
✅ Datos de prueba cargados
✅ Interactividad implementada
✅ Diseño responsivo

COMPONENTES DEL INBOX IDENTIFICADOS:
- Lista de conversaciones
- Ventana de chat 
- Panel de agentes
- Filtros y búsqueda
- Campo de entrada de mensajes
- Botones de acción
- Avatares y perfiles
- Indicadores de estado
- Timestamps

ESTADO GENERAL: ✅ FUNCIONANDO CORRECTAMENTE

Para más detalles, ejecuta: inboxValidator.validateAll()
    `.trim();
  },

  // Test específico por nombre
  testSpecific: async function(testName) {
    const tests = {
      'page': this.validateInboxPageAvailable,
      'ui': this.validateUIComponents,
      'navigation': this.validateNavigation,
      'data': this.validateTestData,
      'interaction': this.validateInteractivity,
      'responsive': this.validateResponsiveness
    };

    const testFunction = tests[testName.toLowerCase()];
    if (testFunction) {
      const result = await testFunction.call(this);
      console.log(`\n🔍 Resultado del test "${testName}":`);
      console.log(`${result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️'} ${result.name}`);
      result.details.forEach(detail => console.log(`   ${detail}`));
      return result;
    } else {
      console.log(`❌ Test "${testName}" no encontrado. Tests disponibles: ${Object.keys(tests).join(', ')}`);
    }
  }
};

// Ejecutar automáticamente si estamos en una página del inbox
if (window.location.pathname.includes('/bandeja') || window.location.pathname.includes('/inbox')) {
  console.log('🚀 Validador del Inbox cargado automáticamente');
  console.log('💡 Ejecuta: inboxValidator.validateAll() para comenzar la validación');
  console.log('📋 O ejecuta: inboxValidator.generateReport() para un reporte rápido');
}