import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import type { Client } from '../types/client.types';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAllClients();
      setClients(data);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(search.toLowerCase()))
  );

  const addClient = async (clientData: any) => {
    const newClient = await api.createClient(clientData);
    setClients((prev) => [...prev, newClient]);
    return newClient;
  };

  return {
    clients,
    filteredClients,
    loading,
    error,
    search,
    setSearch,
    getClientById: (id: string) => clients.find((c) => c.id === id),
    getClientAssessments: api.getClientAssessments,
    addClient,
    loadClients,
  };
}
