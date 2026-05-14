// src/services/database.ts
import { mockClients } from '../features/clients/data/mockClients';
import { mockAssessments } from '../features/clients/data/mockAssessments';
import type { Client } from '../features/clients/types/client.types';
import type { Assessment } from '../features/assessment/types/assessment.types';

const DB_KEYS = {
  clients: 'bioimpedance_db_clients',
  assessments: 'bioimpedance_db_assessments',
};

// Inicializa o banco com dados mock se ainda não existir
function initializeDatabase() {
  if (!localStorage.getItem(DB_KEYS.clients)) {
    localStorage.setItem(DB_KEYS.clients, JSON.stringify(mockClients));
  }

  if (!localStorage.getItem(DB_KEYS.assessments)) {
    localStorage.setItem(DB_KEYS.assessments, JSON.stringify(mockAssessments));
  }
}

// Chama a inicialização
initializeDatabase();

// ─── CLIENTES ────────────────────────────────────────────────

export function getAllClients(): Client[] {
  const data = localStorage.getItem(DB_KEYS.clients);
  return data ? JSON.parse(data) : [];
}

export function getClientById(id: string): Client | undefined {
  const clients = getAllClients();
  return clients.find((c) => c.id === id);
}

export function addClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client {
  const clients = getAllClients();
  const now = new Date().toISOString();

  const newClient: Client = {
    ...clientData,
    id: crypto.randomUUID?.() || String(Date.now()),
    createdAt: now,
    updatedAt: now,
  };

  clients.push(newClient);
  localStorage.setItem(DB_KEYS.clients, JSON.stringify(clients));
  return newClient;
}

export function updateClient(id: string, updates: Partial<Client>): Client | undefined {
  const clients = getAllClients();
  const index = clients.findIndex((c) => c.id === id);

  if (index === -1) return undefined;

  clients[index] = {
    ...clients[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(DB_KEYS.clients, JSON.stringify(clients));
  return clients[index];
}

export function deleteClient(id: string): boolean {
  const clients = getAllClients();
  const filtered = clients.filter((c) => c.id !== id);

  if (filtered.length === clients.length) return false;

  localStorage.setItem(DB_KEYS.clients, JSON.stringify(filtered));

  // Também remove as avaliações do cliente
  const assessments = getAllAssessments();
  const filteredAssessments = assessments.filter((a) => a.clientId !== id);
  localStorage.setItem(DB_KEYS.assessments, JSON.stringify(filteredAssessments));

  return true;
}

// ─── AVALIAÇÕES ─────────────────────────────────────────────

export function getAllAssessments(): Assessment[] {
  const data = localStorage.getItem(DB_KEYS.assessments);
  return data ? JSON.parse(data) : [];
}

export function getAssessmentById(id: string): Assessment | undefined {
  const assessments = getAllAssessments();
  return assessments.find((a) => a.id === id);
}

export function getClientAssessments(clientId: string): Assessment[] {
  const assessments = getAllAssessments();
  return assessments
    .filter((a) => a.clientId === clientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function addAssessment(
  assessmentData: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>
): Assessment {
  const assessments = getAllAssessments();
  const now = new Date().toISOString();

  const newAssessment: Assessment = {
    ...assessmentData,
    id: crypto.randomUUID?.() || String(Date.now()),
    createdAt: now,
    updatedAt: now,
  };

  assessments.push(newAssessment);
  localStorage.setItem(DB_KEYS.assessments, JSON.stringify(assessments));
  return newAssessment;
}

export function updateAssessment(id: string, updates: Partial<Assessment>): Assessment | undefined {
  const assessments = getAllAssessments();
  const index = assessments.findIndex((a) => a.id === id);

  if (index === -1) return undefined;

  assessments[index] = {
    ...assessments[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(DB_KEYS.assessments, JSON.stringify(assessments));
  return assessments[index];
}

export function deleteAssessment(id: string): boolean {
  const assessments = getAllAssessments();
  const filtered = assessments.filter((a) => a.id !== id);

  if (filtered.length === assessments.length) return false;

  localStorage.setItem(DB_KEYS.assessments, JSON.stringify(filtered));
  return true;
}

function isValidForComparison(assessment: Assessment): boolean {
  // Verifica se a avaliação tem dados mínimos para comparação
  if (!assessment.results) return false;

  // IMC não tem gordura corporal, massa magra, etc.
  if (assessment.method === 'imc') return false;

  // Verifica se tem bodyFat > 0 (indica que foi calculado)
  if (!assessment.results.bodyFat || assessment.results.bodyFat <= 0) return false;

  // Verifica se tem leanMass > 0
  if (!assessment.results.leanMass || assessment.results.leanMass <= 0) return false;

  // Verifica se tem fatMass > 0
  if (!assessment.results.fatMass || assessment.results.fatMass <= 0) return false;

  return true;
}

// ─── COMPARAÇÃO ─────────────────────────────────────────────

export function getAssessmentComparison(clientId: string) {
  const allAssessments = getClientAssessments(clientId);

  // Filtra apenas avaliações válidas para comparação
  const validAssessments = allAssessments.filter(isValidForComparison);

  // Precisa de pelo menos 2 avaliações válidas
  if (validAssessments.length < 2) return null;

  // Pega as 2 últimas avaliações VÁLIDAS
  const latest = validAssessments[0];
  const previous = validAssessments[1];

  // Validações adicionais de segurança
  if (latest.weight <= 0 || previous.weight <= 0) return null;
  if (latest.results.bodyFat <= 0 || previous.results.bodyFat <= 0) return null;

  return {
    weightDiff: latest.weight - previous.weight,
    bodyFatDiff: latest.results.bodyFat - previous.results.bodyFat,
    leanMassDiff: latest.results.leanMass - previous.results.leanMass,
    fatMassDiff: latest.results.fatMass - previous.results.fatMass,
    imcDiff: latest.results.imc - previous.results.imc,
    latest,
    previous,
  };
}

// ─── DUPLICAÇÃO ─────────────────────────────────────────────

export function duplicateAssessment(assessmentId: string): Assessment | undefined {
  const original = getAssessmentById(assessmentId);
  if (!original) return undefined;

  const { id, createdAt, updatedAt, ...assessmentData } = original;

  return addAssessment({
    ...assessmentData,
    date: new Date().toISOString().split('T')[0],
    observations: `${original.observations ? original.observations + ' ' : ''}(Duplicado de ${original.date})`,
  });
}

// ─── EXPORT PARA DEBUG ──────────────────────────────────────

// @ts-ignore
window.db = {
  getAllClients,
  getClientById,
  addClient,
  updateClient,
  deleteClient,
  getAllAssessments,
  getAssessmentById,
  getClientAssessments,
  addAssessment,
  updateAssessment,
  deleteAssessment,
  getAssessmentComparison,
  duplicateAssessment,
};
