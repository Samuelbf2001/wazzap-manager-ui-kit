import { registerExtension } from '@hubspot/ui-extensions-react';
import WhatsAppIntegration from './WhatsAppIntegration';

registerExtension('whatsapp-integration', () => <WhatsAppIntegration />); 