import { useState, useCallback, useMemo } from 'react';
import { mockClients } from '../data/mockClients';
import { mockAssessments } from '../data/mockAssessments';
import type { Client } from '../types/client.types';
import type { Assessment } from '../../assessment/types/assessment.types';

export function useClients() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [assessments] = useState<Assessment[]>(mockAssessments);
  const [search, setSearch] = useState('');

  const filteredClients = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return clients;

    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(term) || client.email?.toLowerCase().includes(term)
    );
  }, [clients, search]);

  const getClientById = useCallback(
    (id: string) => {
      return clients.find((client) => client.id === id);
    },
    [clients]
  );

  const getClientAssessments = useCallback(
    (clientId: string): Assessment[] => {
      return assessments
        .filter((a) => a.clientId === clientId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    [assessments]
  );

  // Adicionar cliente
  const addClient = useCallback((clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newClient: Client = {
      ...clientData,
      id: String(Date.now()), // ID temporário
      createdAt: now,
      updatedAt: now,
    };

    setClients((prev) => [...prev, newClient]);
    return newClient;
  }, []);

  // Atualizar cliente (para edição futura)
  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((client) =>
        client.id === id ? { ...client, ...updates, updatedAt: new Date().toISOString() } : client
      )
    );
  }, []);

  // Remover cliente (editar mais além)
  const deleteClient = useCallback((id: string) => {
    setClients((prev) => prev.filter((client) => client.id !== id));
  }, []);

  return {
    clients,
    filteredClients,
    search,
    setSearch,
    getClientById,
    getClientAssessments,
    addClient,
    updateClient,
    deleteClient,
  };
}
