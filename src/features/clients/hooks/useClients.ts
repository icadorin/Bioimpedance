import { useState, useCallback, useMemo } from 'react';
import { mockClients } from '../data/mockClients';
import { mockAssessments } from '../data/mockAssessments';
import type { Client } from '../types/client.types';
import type { Assessment } from '../../assessment/types/assessment.types';

export function useClients() {
  const [clients] = useState<Client[]>(mockClients);
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

  return {
    clients,
    filteredClients,
    search,
    setSearch,
    getClientById,
    getClientAssessments,
  };
}
