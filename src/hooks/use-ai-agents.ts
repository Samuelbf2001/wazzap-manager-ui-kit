import { useState, useEffect } from 'react';
import { aiAgentsService, FlowBuilderAgentData } from '@/services/ai-agents.service';
import { AIAgent } from '@/components/AIAgentManager';

export function useAIAgents() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar agentes al inicializar
  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedAgents = await aiAgentsService.getAgents();
      setAgents(loadedAgents);
    } catch (err) {
      setError('Error al cargar los agentes');
      console.error('Error loading agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAgentById = async (id: string): Promise<AIAgent | null> => {
    try {
      return await aiAgentsService.getAgentById(id);
    } catch (err) {
      console.error('Error getting agent by id:', err);
      return null;
    }
  };

  const getActiveAgents = async (): Promise<AIAgent[]> => {
    try {
      return await aiAgentsService.getActiveAgents();
    } catch (err) {
      console.error('Error getting active agents:', err);
      return [];
    }
  };

  const saveAgent = async (agent: AIAgent): Promise<void> => {
    try {
      await aiAgentsService.saveAgent(agent);
      await loadAgents(); // Recargar la lista
    } catch (err) {
      setError('Error al guardar el agente');
      throw err;
    }
  };

  const deleteAgent = async (id: string): Promise<void> => {
    try {
      await aiAgentsService.deleteAgent(id);
      await loadAgents(); // Recargar la lista
    } catch (err) {
      setError('Error al eliminar el agente');
      throw err;
    }
  };

  // Convertir AIAgent a FlowBuilderAgentData
  const convertToFlowBuilderData = (agent: AIAgent): FlowBuilderAgentData => {
    return {
      id: agent.id,
      name: agent.name,
      type: agent.type,
      model: agent.model,
      systemPrompt: agent.systemPrompt || '',
      temperature: agent.temperature || 0.7,
      maxTokens: agent.maxTokens || 2000,
      tools: agent.tools || [],
      useMemory: agent.useMemory || false,
      memoryType: agent.memoryType || 'conversation',
      memorySize: agent.memorySize || 1000,
      timeout: agent.timeout || 30000,
      maxIterations: agent.maxIterations || 10,
      fallbackBehavior: agent.fallbackBehavior || 'human_handoff',
      status: agent.status,
      successRate: agent.successRate,
      totalConversations: agent.totalConversations,
      avgResponseTime: agent.avgResponseTime
    };
  };

  // Obtener agentes listos para usar en FlowBuilder
  const getFlowBuilderAgents = (): FlowBuilderAgentData[] => {
    return agents
      .filter(agent => agent.status === 'active') // Solo agentes activos
      .map(convertToFlowBuilderData);
  };

  return {
    agents,
    loading,
    error,
    loadAgents,
    getAgentById,
    getActiveAgents,
    saveAgent,
    deleteAgent,
    convertToFlowBuilderData,
    getFlowBuilderAgents
  };
} 