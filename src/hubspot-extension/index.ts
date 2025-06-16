import { Client } from '@hubspot/api-client';
import express from 'express';
import bodyParser from 'body-parser';
import { config } from './config';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Inicializar cliente de HubSpot
const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });

// Middleware para verificar autenticación
const authenticateRequest = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
};

// Endpoint para enviar mensaje de WhatsApp
app.post('/actions/send-message', authenticateRequest, async (req, res) => {
  try {
    const { contactId, message } = req.body;

    // Obtener información del contacto
    const contact = await hubspotClient.crm.contacts.basicApi.getById(contactId);
    const phoneNumber = contact.properties.phone;

    // Enviar mensaje de WhatsApp
    const response = await fetch(config.actions.sendWhatsAppMessage.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`
      },
      body: JSON.stringify({
        phone: phoneNumber,
        message
      })
    });

    const result = await response.json() as { messageId: string };

    // Actualizar el contacto en HubSpot con el ID del mensaje
    await hubspotClient.crm.contacts.basicApi.update(contactId, {
      properties: {
        last_whatsapp_message_id: result.messageId,
        last_whatsapp_message_date: new Date().toISOString()
      }
    });

    res.json({
      messageId: result.messageId,
      status: 'sent'
    });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
});

// Endpoint para sincronizar contacto
app.post('/actions/sync-contact', authenticateRequest, async (req, res) => {
  try {
    const { contactId } = req.body;

    // Obtener información del contacto
    const contact = await hubspotClient.crm.contacts.basicApi.getById(contactId);
    const phoneNumber = contact.properties.phone;

    // Verificar número en WhatsApp
    const response = await fetch(config.actions.syncContact.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`
      },
      body: JSON.stringify({
        phone: phoneNumber
      })
    });

    const result = await response.json() as { whatsappNumber: string; syncStatus: string };

    // Actualizar el contacto en HubSpot
    await hubspotClient.crm.contacts.basicApi.update(contactId, {
      properties: {
        whatsapp_number: result.whatsappNumber,
        whatsapp_sync_status: result.syncStatus,
        whatsapp_sync_date: new Date().toISOString()
      }
    });

    res.json({
      whatsappNumber: result.whatsappNumber,
      syncStatus: result.syncStatus
    });
  } catch (error) {
    console.error('Error al sincronizar contacto:', error);
    res.status(500).json({ error: 'Error al sincronizar contacto' });
  }
});

// Endpoint para recibir webhooks de nuevos mensajes
app.post('/webhooks/new-message', async (req, res) => {
  try {
    const { messageId, phone, message, timestamp } = req.body;

    // Buscar contacto por número de teléfono
    const searchResponse = await hubspotClient.crm.contacts.searchApi.doSearch({
      filterGroups: [{
        filters: [{
          propertyName: 'phone',
          operator: 'EQ',
          value: phone
        }]
      }],
      properties: ['phone', 'firstname', 'lastname'],
      limit: 1
    });

    if (searchResponse.total === 0) {
      // Crear nuevo contacto si no existe
      const newContact = await hubspotClient.crm.contacts.basicApi.create({
        properties: {
          phone,
          firstname: 'WhatsApp',
          lastname: 'Contact',
          whatsapp_number: phone,
          last_whatsapp_message: message,
          last_whatsapp_message_date: timestamp
        },
        associations: []
      });

      // Crear actividad de WhatsApp
      await hubspotClient.crm.associations.v4.basicApi.create(
        'contacts',
        parseInt(newContact.id),
        'whatsapp_messages',
        messageId,
        'whatsapp_message_to_contact'
      );
    } else {
      // Actualizar contacto existente
      const contact = searchResponse.results[0];
      await hubspotClient.crm.contacts.basicApi.update(contact.id, {
        properties: {
          last_whatsapp_message: message,
          last_whatsapp_message_date: timestamp
        }
      });

      // Crear actividad de WhatsApp
      await hubspotClient.crm.associations.v4.basicApi.create(
        'contacts',
        parseInt(contact.id),
        'whatsapp_messages',
        messageId,
        'whatsapp_message_to_contact'
      );
    }

    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error al procesar webhook:', error);
    res.status(500).json({ error: 'Error al procesar webhook' });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de extensión HubSpot ejecutándose en el puerto ${PORT}`);
}); 