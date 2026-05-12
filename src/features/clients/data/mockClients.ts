import type { Client } from '../types';

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '47999999999',
    gender: 'male',
    birthDate: '1995-02-10',
    goal: 'hipertrofia',
    status: 'active',
    createdAt: '2026-04-01T10:00:00Z',
    updatedAt: '2026-05-10T14:30:00Z',
  },
  {
    id: '2',
    name: 'Maria Souza',
    email: 'maria@email.com',
    phone: '47988888888',
    gender: 'female',
    birthDate: '1998-07-22',
    goal: 'emagrecimento',
    status: 'active',
    createdAt: '2026-04-15T09:00:00Z',
    updatedAt: '2026-05-08T11:20:00Z',
  },
];
