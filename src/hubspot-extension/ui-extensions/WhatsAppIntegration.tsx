import React, { useEffect, useState } from 'react';
import { useCrmObject } from '@hubspot/ui-extensions-react';
import {
  Button,
  Card,
  Form,
  Text,
  TextInput,
  Alert,
  Spinner,
} from '@hubspot/ui-extensions';

const WhatsAppIntegration = () => {
  const { crmObject } = useCrmObject();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendMessage = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch('/actions/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId: crmObject.id,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar mensaje');
      }

      setSuccess('Mensaje enviado correctamente');
      setMessage('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Text>Enviar mensaje de WhatsApp</Text>
      
      {error && (
        <Alert title="Error" variant="error">
          {error}
        </Alert>
      )}

      {success && (
        <Alert title="Éxito" variant="success">
          {success}
        </Alert>
      )}

      <Form onSubmit={handleSendMessage}>
        <TextInput
          label="Mensaje"
          name="message"
          value={message}
          onChange={setMessage}
          required
        />

        <Button
          type="submit"
          variant="primary"
          disabled={loading || !message}
        >
          {loading ? <Spinner size="sm" /> : 'Enviar mensaje'}
        </Button>
      </Form>
    </Card>
  );
};

export default WhatsAppIntegration; 