import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from './ui/use-toast';
import { 
  useInstances, 
  useMessages, 
  useChats, 
  useContacts, 
  useGroups,
  useConnectionMonitor 
} from '../hooks/use-evolution-api';
import { evolutionAPIService } from '../services/evolution-api.service';

const EvolutionAPIDemo: React.FC = () => {
  const { toast } = useToast();
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  
  // Hooks para instancias
  const {
    instances,
    loading: instancesLoading,
    error: instancesError,
    fetchInstances,
    createInstance,
    deleteInstance,
    connectInstance,
  } = useInstances();

  // Estados del formulario
  const [newInstanceName, setNewInstanceName] = useState('');
  const [messageNumber, setMessageNumber] = useState('');
  const [messageText, setMessageText] = useState('');

  // Hooks condicionales
  const { connectionState } = useConnectionMonitor(selectedInstance);
  const { loading: messageLoading, sendTextMessage } = useMessages(selectedInstance);
  const { chats, fetchChats } = useChats(selectedInstance);
  const { contacts, fetchContacts } = useContacts(selectedInstance);
  const { groups, fetchGroups } = useGroups(selectedInstance);

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  useEffect(() => {
    if (selectedInstance) {
      fetchChats();
      fetchContacts();
      fetchGroups();
    }
  }, [selectedInstance, fetchChats, fetchContacts, fetchGroups]);

  const handleCreateInstance = async () => {
    if (!newInstanceName.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa un nombre para la instancia',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createInstance({
        instanceName: newInstanceName,
        qrcode: true,
        webhook: 'http://localhost:3000/webhook',
        webhook_by_events: true,
        webhook_base64: false,
        events: ['MESSAGE_RECEIVED', 'MESSAGE_SENT', 'CONNECTION_UPDATE'],
      });
      
      setNewInstanceName('');
      toast({
        title: 'Éxito',
        description: 'Instancia creada correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al crear la instancia',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteInstance = async (instanceName: string) => {
    try {
      await deleteInstance(instanceName);
      if (selectedInstance === instanceName) {
        setSelectedInstance('');
      }
      toast({
        title: 'Éxito',
        description: 'Instancia eliminada correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al eliminar la instancia',
        variant: 'destructive',
      });
    }
  };

  const handleConnectInstance = async (instanceName: string) => {
    try {
      await connectInstance(instanceName);
      toast({
        title: 'Éxito',
        description: 'Instancia conectada correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al conectar la instancia',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async () => {
    if (!selectedInstance || !messageNumber.trim() || !messageText.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos',
        variant: 'destructive',
      });
      return;
    }

    try {
      await sendTextMessage({
        number: messageNumber,
        text: messageText,
      });
      
      setMessageNumber('');
      setMessageText('');
      toast({
        title: 'Éxito',
        description: 'Mensaje enviado correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al enviar el mensaje',
        variant: 'destructive',
      });
    }
  };

  const getConnectionBadge = (state: string | null) => {
    const variants = {
      open: 'default' as const,
      close: 'destructive' as const,
      connecting: 'secondary' as const,
    };
    
    const labels = {
      open: 'Conectado',
      close: 'Desconectado',
      connecting: 'Conectando...',
    };

    return (
      <Badge variant={variants[state as keyof typeof variants] || 'secondary'}>
        {labels[state as keyof typeof labels] || 'Desconocido'}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Evolution API - Panel de Control</CardTitle>
          <CardDescription>
            Gestiona instancias de WhatsApp y todas las funcionalidades de Evolution API
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="instances" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="instances">Instancias</TabsTrigger>
          <TabsTrigger value="messages">Mensajes</TabsTrigger>
          <TabsTrigger value="chats">Chats</TabsTrigger>
          <TabsTrigger value="contacts">Contactos</TabsTrigger>
          <TabsTrigger value="groups">Grupos</TabsTrigger>
        </TabsList>

        <TabsContent value="instances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nueva Instancia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Nombre de la instancia"
                  value={newInstanceName}
                  onChange={(e) => setNewInstanceName(e.target.value)}
                />
                <Button 
                  onClick={handleCreateInstance}
                  disabled={instancesLoading}
                >
                  Crear Instancia
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instancias Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              {instancesLoading ? (
                <p>Cargando instancias...</p>
              ) : instancesError ? (
                <p className="text-destructive">Error: {instancesError}</p>
              ) : instances.length === 0 ? (
                <p>No hay instancias disponibles</p>
              ) : (
                <div className="space-y-4">
                  {instances.map((instance) => (
                    <div key={instance.instanceName} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold">{instance.instanceName}</h3>
                          <p className="text-sm text-muted-foreground">ID: {instance.instanceId}</p>
                        </div>
                        <Badge variant={instance.status === 'open' ? 'default' : 'secondary'}>
                          {instance.status}
                        </Badge>
                        {selectedInstance === instance.instanceName && getConnectionBadge(connectionState)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInstance(instance.instanceName)}
                        >
                          Seleccionar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConnectInstance(instance.instanceName)}
                        >
                          Conectar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteInstance(instance.instanceName)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Mensaje de Texto</CardTitle>
              <CardDescription>
                Instancia seleccionada: {selectedInstance || 'Ninguna'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="messageNumber">Número de teléfono</Label>
                  <Input
                    id="messageNumber"
                    placeholder="5511999999999"
                    value={messageNumber}
                    onChange={(e) => setMessageNumber(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="messageText">Mensaje</Label>
                <Textarea
                  id="messageText"
                  placeholder="Escribe tu mensaje aquí..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleSendMessage}
                disabled={!selectedInstance || messageLoading}
              >
                {messageLoading ? 'Enviando...' : 'Enviar Mensaje'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chats Disponibles</CardTitle>
              <CardDescription>
                Instancia: {selectedInstance || 'Ninguna seleccionada'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedInstance ? (
                <p>Selecciona una instancia para ver los chats</p>
              ) : chats.length === 0 ? (
                <p>No hay chats disponibles</p>
              ) : (
                <div className="space-y-2">
                  {chats.slice(0, 10).map((chat) => (
                    <div key={chat.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <h4 className="font-medium">{chat.name || chat.id}</h4>
                        <p className="text-sm text-muted-foreground">
                          {chat.isGroup ? 'Grupo' : 'Chat individual'} - 
                          {chat.unreadCount > 0 && ` ${chat.unreadCount} no leídos`}
                        </p>
                      </div>
                      <Badge variant={chat.unreadCount > 0 ? 'destructive' : 'secondary'}>
                        {chat.unreadCount || 0}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contactos</CardTitle>
              <CardDescription>
                Instancia: {selectedInstance || 'Ninguna seleccionada'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedInstance ? (
                <p>Selecciona una instancia para ver los contactos</p>
              ) : contacts.length === 0 ? (
                <p>No hay contactos disponibles</p>
              ) : (
                <div className="space-y-2">
                  {contacts.slice(0, 10).map((contact) => (
                    <div key={contact.id} className="flex items-center gap-4 p-3 border rounded">
                      <div className="flex-1">
                        <h4 className="font-medium">{contact.name || contact.notify || contact.id}</h4>
                        <p className="text-sm text-muted-foreground">{contact.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grupos</CardTitle>
              <CardDescription>
                Instancia: {selectedInstance || 'Ninguna seleccionada'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedInstance ? (
                <p>Selecciona una instancia para ver los grupos</p>
              ) : groups.length === 0 ? (
                <p>No hay grupos disponibles</p>
              ) : (
                <div className="space-y-2">
                  {groups.map((group) => (
                    <div key={group.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <h4 className="font-medium">{group.subject}</h4>
                        <p className="text-sm text-muted-foreground">
                          {group.size || 0} participantes
                        </p>
                        {group.desc && (
                          <p className="text-xs text-muted-foreground mt-1">{group.desc}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {group.announce && <Badge variant="outline">Anuncio</Badge>}
                        {group.restrict && <Badge variant="outline">Restringido</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EvolutionAPIDemo;