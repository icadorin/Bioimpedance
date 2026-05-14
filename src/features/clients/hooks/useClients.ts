import { useState, useCallback, useMemo } from 'react';
import * as db from '../../../service/database';
import type { Client } from '../types/client.types';
import type { Assessment } from '../../assessment/types/assessment.types';

export function useClients() {
  const [clients, setClients] = useState<Client[]>(() => db.getAllClients());
  const [search, setSearch] = useState('');

  const filteredClients = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return clients;

    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(term) || client.email?.toLowerCase().includes(term)
    );
  }, [clients, search]);

  const getClientById = useCallback((id: string) => {
    return db.getClientById(id);
  }, []);

  const getClientAssessments = useCallback((clientId: string): Assessment[] => {
    return db.getClientAssessments(clientId);
  }, []);

  const addClient = useCallback((clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient = db.addClient(clientData);
    setClients(db.getAllClients()); // Atualiza a lista
    return newClient;
  }, []);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    const updated = db.updateClient(id, updates);
    if (updated) setClients(db.getAllClients());
    return updated;
  }, []);

  const deleteClient = useCallback((id: string) => {
    const success = db.deleteClient(id);
    if (success) setClients(db.getAllClients());
    return success;
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
