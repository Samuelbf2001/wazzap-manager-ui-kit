-- Datos de ejemplo para la base de datos WazzAp Manager

-- Insertar usuarios de ejemplo
INSERT INTO users (name, email, phone, whatsapp_number, language, status) VALUES
('Juan Pérez', 'juan.perez@example.com', '+52-555-123-4567', '+525551234567', 'es', 'active'),
('María García', 'maria.garcia@example.com', '+52-555-987-6543', '+525559876543', 'es', 'active'),
('Carlos López', 'carlos.lopez@example.com', '+52-555-456-7890', '+525554567890', 'es', 'active'),
('Ana Martínez', 'ana.martinez@example.com', '+52-555-321-0987', '+525553210987', 'es', 'active'),
('Roberto Silva', 'roberto.silva@example.com', '+52-555-147-2583', '+525551472583', 'es', 'active');

-- Insertar productos de ejemplo
INSERT INTO products (name, description, price, currency, category, sku, stock) VALUES
('iPhone 15 Pro', 'Smartphone Apple iPhone 15 Pro 128GB', 29999.00, 'MXN', 'electronics', 'IP15P-128', 25),
('Samsung Galaxy S24', 'Smartphone Samsung Galaxy S24 256GB', 24999.00, 'MXN', 'electronics', 'SGS24-256', 30),
('MacBook Air M3', 'Laptop Apple MacBook Air M3 13 pulgadas', 34999.00, 'MXN', 'electronics', 'MBA-M3-13', 15),
('AirPods Pro 2', 'Auriculares inalámbricos Apple AirPods Pro 2', 6999.00, 'MXN', 'electronics', 'APP-2GEN', 50),
('Playera Nike', 'Playera deportiva Nike Dri-FIT', 899.00, 'MXN', 'clothing', 'NIKE-DF-001', 100),
('Tenis Adidas', 'Tenis Adidas Ultraboost 22', 3299.00, 'MXN', 'clothing', 'ADIDAS-UB22', 75),
('Mochila Escolar', 'Mochila escolar resistente 30L', 599.00, 'MXN', 'accessories', 'MOCH-ESC-30', 200),
('Botella de Agua', 'Botella de agua térmica 750ml', 399.00, 'MXN', 'accessories', 'BOT-TERM-750', 150);

-- Insertar pedidos de ejemplo
INSERT INTO orders (user_id, order_number, status, total, currency, items, payment_status) VALUES
(1, 'ORD-2024-001', 'completed', 29999.00, 'MXN', '[{"product_id": 1, "quantity": 1, "price": 29999.00}]', 'paid'),
(2, 'ORD-2024-002', 'pending', 31698.00, 'MXN', '[{"product_id": 4, "quantity": 1, "price": 6999.00}, {"product_id": 5, "quantity": 1, "price": 899.00}, {"product_id": 6, "quantity": 1, "price": 3299.00}]', 'pending'),
(3, 'ORD-2024-003', 'shipped', 34999.00, 'MXN', '[{"product_id": 3, "quantity": 1, "price": 34999.00}]', 'paid'),
(4, 'ORD-2024-004', 'completed', 998.00, 'MXN', '[{"product_id": 7, "quantity": 1, "price": 599.00}, {"product_id": 8, "quantity": 1, "price": 399.00}]', 'paid');

-- Insertar hilos de conversación de ejemplo
INSERT INTO conversation_threads (thread_id, user_id, phone_number, contact_name, status, priority, source, language) VALUES
('thread_001', 1, '+525551234567', 'Juan Pérez', 'active', 'high', 'whatsapp', 'es'),
('thread_002', 2, '+525559876543', 'María García', 'waiting', 'medium', 'whatsapp', 'es'),
('thread_003', 3, '+525554567890', 'Carlos López', 'resolved', 'low', 'whatsapp', 'es'),
('thread_004', 4, '+525553210987', 'Ana Martínez', 'active', 'medium', 'whatsapp', 'es'),
('thread_005', 5, '+525551472583', 'Roberto Silva', 'waiting', 'high', 'whatsapp', 'es');

-- Insertar mensajes de ejemplo
INSERT INTO messages (conversation_id, thread_id, message_type, content, sender_type, sender_name, status) VALUES
(1, 'thread_001', 'text', 'Hola, me interesa el iPhone 15 Pro', 'user', 'Juan Pérez', 'read'),
(1, 'thread_001', 'text', '¡Hola Juan! Te ayudo con información sobre el iPhone 15 Pro. Tenemos disponible en color natural titanio por $29,999 MXN', 'agent', 'Bot Assistant', 'read'),
(1, 'thread_001', 'text', '¿Qué colores tienen disponibles?', 'user', 'Juan Pérez', 'read'),
(2, 'thread_002', 'text', 'Buenos días, quisiera ver opciones de smartphones', 'user', 'María García', 'read'),
(2, 'thread_002', 'text', 'Buenos días María! Te muestro nuestros smartphones más populares:', 'agent', 'Bot Assistant', 'read'),
(3, 'thread_003', 'text', 'Necesito una laptop para trabajo', 'user', 'Carlos López', 'read'),
(3, 'thread_003', 'text', 'Perfecto Carlos, te recomiendo la MacBook Air M3, ideal para trabajo profesional', 'agent', 'Bot Assistant', 'read'),
(4, 'thread_004', 'text', 'Hola, busco ropa deportiva', 'user', 'Ana Martínez', 'read'),
(5, 'thread_005', 'text', '¿Tienen descuentos esta semana?', 'user', 'Roberto Silva', 'sent');

-- Insertar agentes de ejemplo
INSERT INTO agents (name, email, phone, status, max_conversations, skills, languages) VALUES
('Sofia Rodriguez', 'sofia.rodriguez@empresa.com', '+52-555-111-2222', 'online', 8, ARRAY['ventas', 'soporte_tecnico', 'productos_electronicos'], ARRAY['es', 'en']),
('Miguel Torres', 'miguel.torres@empresa.com', '+52-555-333-4444', 'away', 6, ARRAY['ventas', 'atencion_cliente'], ARRAY['es']),
('Laura Vega', 'laura.vega@empresa.com', '+52-555-555-6666', 'online', 10, ARRAY['soporte_tecnico', 'productos_tecnicos'], ARRAY['es', 'en']),
('David Morales', 'david.morales@empresa.com', '+52-555-777-8888', 'busy', 5, ARRAY['ventas', 'fashion'], ARRAY['es']);

-- Insertar contactos de ejemplo
INSERT INTO contacts (user_id, thread_id, first_name, last_name, full_name, email, phone, whatsapp_number, source, tags) VALUES
(1, 'thread_001', 'Juan', 'Pérez', 'Juan Pérez', 'juan.perez@example.com', '+525551234567', '+525551234567', 'whatsapp', ARRAY['cliente_vip', 'electronics']),
(2, 'thread_002', 'María', 'García', 'María García', 'maria.garcia@example.com', '+525559876543', '+525559876543', 'whatsapp', ARRAY['prospect', 'smartphones']),
(3, 'thread_003', 'Carlos', 'López', 'Carlos López', 'carlos.lopez@example.com', '+525554567890', '+525554567890', 'whatsapp', ARRAY['cliente', 'business']),
(4, 'thread_004', 'Ana', 'Martínez', 'Ana Martínez', 'ana.martinez@example.com', '+525553210987', '+525553210987', 'whatsapp', ARRAY['prospect', 'fashion']),
(5, 'thread_005', 'Roberto', 'Silva', 'Roberto Silva', 'roberto.silva@example.com', '+525551472583', '+525551472583', 'whatsapp', ARRAY['cliente', 'descuentos']);

-- Insertar flujos de ejemplo
INSERT INTO flows (name, description, status, nodes, edges, settings) VALUES
('Bienvenida Nuevos Clientes', 'Flujo de bienvenida para nuevos clientes que contactan por primera vez', 'active',
 '[{"id": "start", "type": "message", "data": {"message": "¡Bienvenido! Soy tu asistente virtual"}}, {"id": "collect_name", "type": "database", "data": {"operation": "collect", "fields": ["name", "email"]}}]',
 '[{"id": "e1", "source": "start", "target": "collect_name"}]',
 '{"timeout": 300, "maxSteps": 10}'
),
('Proceso de Ventas', 'Flujo completo para proceso de ventas de productos', 'active',
 '[{"id": "greeting", "type": "message", "data": {"message": "¡Hola! ¿En qué producto estás interesado?"}}, {"id": "show_products", "type": "interactive", "data": {"type": "catalog"}}]',
 '[{"id": "e1", "source": "greeting", "target": "show_products"}]',
 '{"timeout": 600, "maxSteps": 20}'
),
('Soporte Técnico', 'Flujo para resolver problemas técnicos de clientes', 'active',
 '[{"id": "problem_type", "type": "condition", "data": {"question": "¿Qué tipo de problema tienes?"}}, {"id": "technical_help", "type": "ai", "data": {"prompt": "Ayuda técnica especializada"}}]',
 '[{"id": "e1", "source": "problem_type", "target": "technical_help"}]',
 '{"timeout": 900, "maxSteps": 15}'
);

-- Insertar respuestas rápidas de ejemplo
INSERT INTO quick_responses (title, content, category, tags, language) VALUES
('Saludo Inicial', '¡Hola! Gracias por contactarnos. ¿En qué puedo ayudarte hoy?', 'greeting', ARRAY['saludo', 'bienvenida'], 'es'),
('Horarios de Atención', 'Nuestro horario de atención es de lunes a viernes de 9:00 AM a 6:00 PM, y sábados de 9:00 AM a 2:00 PM.', 'info', ARRAY['horarios', 'atencion'], 'es'),
('Métodos de Pago', 'Aceptamos todos los métodos de pago: tarjetas de crédito/débito, transferencias bancarias, PayPal y pago en efectivo.', 'payment', ARRAY['pago', 'metodos'], 'es'),
('Tiempos de Entrega', 'Los tiempos de entrega son: CDMX 24-48hrs, interior de la república 3-5 días hábiles. Envío gratis en compras mayores a $999.', 'shipping', ARRAY['envio', 'delivery'], 'es'),
('Política de Devoluciones', 'Tienes 30 días para devolver tu producto. Debe estar en condiciones originales con empaque y accesorios completos.', 'returns', ARRAY['devolucion', 'garantia'], 'es'),
('Contacto Directo', 'Si necesitas hablar directamente con un agente, escribe "AGENTE" y te conectaré inmediatamente.', 'support', ARRAY['agente', 'soporte'], 'es');

-- Insertar configuraciones del sistema
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
('whatsapp_enabled', 'true', 'Habilitar integración con WhatsApp', 'integrations', false),
('ai_enabled', 'true', 'Habilitar funcionalidades de IA', 'ai', false),
('max_conversations_per_agent', '10', 'Máximo de conversaciones por agente', 'limits', false),
('default_language', '"es"', 'Idioma por defecto del sistema', 'general', true),
('business_hours', '{"monday": {"start": "09:00", "end": "18:00"}, "tuesday": {"start": "09:00", "end": "18:00"}, "wednesday": {"start": "09:00", "end": "18:00"}, "thursday": {"start": "09:00", "end": "18:00"}, "friday": {"start": "09:00", "end": "18:00"}, "saturday": {"start": "09:00", "end": "14:00"}}', 'Horarios de atención del negocio', 'general', true),
('auto_assignment_enabled', 'true', 'Habilitar asignación automática de conversaciones', 'inbox', false),
('webhook_urls', '{"evolution_api": "http://localhost:8080", "hubspot": ""}', 'URLs de webhooks para integraciones', 'integrations', false);

-- Insertar algunos pasos de conversación de ejemplo
INSERT INTO conversation_steps (conversation_id, thread_id, node_id, node_type, input_data, output_data, status) VALUES
(1, 'thread_001', 'greeting', 'message', '{}', '{"message": "Hola, me interesa el iPhone 15 Pro"}', 'completed'),
(1, 'thread_001', 'product_info', 'database', '{"product": "iPhone 15 Pro"}', '{"product_details": "iPhone 15 Pro 128GB - $29,999 MXN"}', 'completed'),
(2, 'thread_002', 'greeting', 'message', '{}', '{"message": "Buenos días, quisiera ver opciones de smartphones"}', 'completed'),
(3, 'thread_003', 'greeting', 'message', '{}', '{"message": "Necesito una laptop para trabajo"}', 'completed'),
(3, 'thread_003', 'recommend_laptop', 'ai', '{"user_need": "laptop trabajo"}', '{"recommendation": "MacBook Air M3 ideal para trabajo profesional"}', 'completed');

-- Insertar algunos logs de auditoría de ejemplo
INSERT INTO audit_logs (entity_type, entity_id, action, new_values, user_id) VALUES
('user', '1', 'created', '{"name": "Juan Pérez", "email": "juan.perez@example.com"}', 'system'),
('order', '1', 'created', '{"order_number": "ORD-2024-001", "total": 29999.00}', '1'),
('conversation_thread', '1', 'created', '{"thread_id": "thread_001", "status": "active"}', 'system'),
('message', '1', 'created', '{"content": "Hola, me interesa el iPhone 15 Pro", "sender_type": "user"}', '1');