import { useState, useEffect, useCallback } from 'react';
import { evolutionAPIService } from '../services/evolution-api.service';
import type {
  Instance,
  CreateInstanceRequest,
  SendTextMessageRequest,
  SendMediaMessageRequest,
  Contact,
  Message,
  Chat,
  Group,
  EvolutionAPIResponse,
} from '../types/evolution-api';

// Hook genérico para operaciones de API
export function useEvolutionAPI<T>(
  operation: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await operation();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  return { data, loading, error, execute, setData };
}

// Hook para gestión de instancias
export function useInstances() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInstances = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await evolutionAPIService.fetchInstances();
      setInstances(response.data || []);
      return response.data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener instancias';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createInstance = useCallback(async (data: CreateInstanceRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await evolutionAPIService.createInstance(data);
      if (response.data) {
        setInstances(prev => [...prev, response.data!]);
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear instancia';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteInstance = useCallback(async (instanceName: string) => {
    try {
      setLoading(true);
      setError(null);
      await evolutionAPIService.deleteInstance(instanceName);
      setInstances(prev => prev.filter(instance => instance.instanceName !== instanceName));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar instancia';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const connectInstance = useCallback(async (instanceName: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await evolutionAPIService.connectInstance(instanceName);
      await fetchInstances(); // Actualizar la lista
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al conectar instancia';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchInstances]);

  const getConnectionState = useCallback(async (instanceName: string) => {
    try {
      const response = await evolutionAPIService.getConnectionState(instanceName);
      return response.data;
    } catch (err) {
      console.error('Error al obtener estado de conexión:', err);
      return null;
    }
  }, []);

  return {
    instances,
    loading,
    error,
    fetchInstances,
    createInstance,
    deleteInstance,
    connectInstance,
    getConnectionState,
  };
}

// Hook para envío de mensajes
export function useMessages(instanceName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendTextMessage = useCallback(async (data: SendTextMessageRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await evolutionAPIService.sendTextMessage(instanceName, data);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar mensaje';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [instanceName]);

  const sendMediaMessage = useCallback(async (data: SendMediaMessageRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await evolutionAPIService.sendMediaMessage(instanceName, data);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar media';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [instanceName]);

  return {
    loading,
    error,
    sendTextMessage,
    sendMediaMessage,
  };
}

// Hook para gestión de chats
export function useChats(instanceName: string) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await evolutionAPIService.findChats(instanceName);
      setChats(response.data || []);
      return response.data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener chats';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [instanceName]);

  const findMessages = useCallback(async (filters?: { where?: any; limit?: number }) => {
    try {
      const response = await evolutionAPIService.findMessages(instanceName, filters);
      return response.data || [];
    } catch (err) {
      console.error('Error al buscar mensajes:', err);
      return [];
    }
  }, [instanceName]);

  const markAsRead = useCallback(async (messageKeys: Array<{ id: string; fromMe: boolean; remote: string }>) => {
    try {
      await evolutionAPIService.markMessageAsRead(instanceName, { readMessages: messageKeys });
    } catch (err) {
      console.error('Error al marcar como leído:', err);
    }
  }, [instanceName]);

  return {
    chats,
    loading,
    error,
    fetchChats,
    findMessages,
    markAsRead,
  };
}

// Hook para gestión de contactos
export function useContacts(instanceName: string) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async (filters?: { where?: any }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await evolutionAPIService.findContacts(instanceName, filters);
      setContacts(response.data || []);
      return response.data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener contactos';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [instanceName]);

  const checkWhatsAppNumbers = useCallback(async (numbers: string[]) => {
    try {
      const response = await evolutionAPIService.checkWhatsAppNumbers(instanceName, numbers);
      return response.data || [];
    } catch (err) {
      console.error('Error al verificar números:', err);
      return [];
    }
  }, [instanceName]);

  return {
    contacts,
    loading,
    error,
    fetchContacts,
    checkWhatsAppNumbers,
  };
}

// Hook para gestión de grupos
export function useGroups(instanceName: string) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async (getParticipants: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await evolutionAPIService.fetchAllGroups(instanceName, getParticipants);
      setGroups(response.data || []);
      return response.data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener grupos';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [instanceName]);

  const createGroup = useCallback(async (data: { subject: string; description?: string; participants: string[] }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await evolutionAPIService.createGroup(instanceName, data);
      if (response.data) {
        setGroups(prev => [...prev, response.data!]);
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear grupo';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [instanceName]);

  const leaveGroup = useCallback(async (groupJid: string) => {
    try {
      setLoading(true);
      setError(null);
      await evolutionAPIService.leaveGroup(instanceName, groupJid);
      setGroups(prev => prev.filter(group => group.id !== groupJid));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al salir del grupo';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [instanceName]);

  return {
    groups,
    loading,
    error,
    fetchGroups,
    createGroup,
    leaveGroup,
  };
}

// Hook para monitoreo de estado de conexión en tiempo real
export function useConnectionMonitor(instanceName: string, interval: number = 30000) {
  const [connectionState, setConnectionState] = useState<'open' | 'close' | 'connecting' | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    if (!instanceName) return;

    const checkConnection = async () => {
      try {
        const state = await evolutionAPIService.getConnectionState(instanceName);
        setConnectionState(state?.data?.state || null);
        setLastCheck(new Date());
      } catch (err) {
        console.error('Error al verificar conexión:', err);
        setConnectionState('close');
        setLastCheck(new Date());
      }
    };

    // Verificar inmediatamente
    checkConnection();

    // Configurar intervalo
    const intervalId = setInterval(checkConnection, interval);

    return () => clearInterval(intervalId);
  }, [instanceName, interval]);

  return { connectionState, lastCheck };
}