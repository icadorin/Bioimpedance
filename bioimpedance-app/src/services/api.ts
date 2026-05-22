import type { Assessment, AssessmentMethod, AssessmentResult } from '../features/assessment/types';
import type { PhysicResult, RecommendationResult } from '../features/assessment/types';
import type {
  BillingPlan,
  BillingSubscription,
  CheckoutResponse,
  CustomerPortalResponse,
  Plan,
} from '../features/billing/types';
import type { Client } from '../features/clients/types';

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api').replace(
  /\/$/,
  ''
);

type BackendGender = 'MALE' | 'FEMALE';
type BackendAssessmentMethod = 'NAVY' | 'BIOIMPEDANCE' | 'SKINFOLD' | 'IMC';
type BackendClientStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';
type ClientGender = NonNullable<Client['gender']>;
type ClientStatus = NonNullable<Client['status']>;

type ClientRequest = {
  name: string;
  email: string;
  phone?: string;
  gender?: BackendGender;
  birthDate?: string;
  goal?: string;
  notes?: string;
};

type BackendClient = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: BackendGender;
  birthDate?: string;
  goal?: string;
  notes?: string;
  status?: BackendClientStatus;
  createdAt?: string;
  updatedAt?: string;
};

type BackendAssessmentResult = Omit<AssessmentResult, never> &
  Partial<RecommendationResult> & {
    methodDetails?: PhysicResult['methodDetails'];
  };

type BackendAssessment = {
  id: string;
  clientId?: string;
  date: string;
  method: BackendAssessmentMethod;
  weight: number;
  height: number;
  age: number;
  gender: BackendGender;
  result?: BackendAssessmentResult;
  results?: BackendAssessmentResult;
  observations?: string;
  createdAt?: string;
  updatedAt?: string;
};

type AssessmentPayload = {
  clientId?: string;
  date?: string;
  method: AssessmentMethod | BackendAssessmentMethod;
  weight: number;
  height: number;
  age: number;
  gender: Client['gender'] | BackendGender;
  activityLevel?: string;
  objective?: string;
  waist?: number;
  neck?: number;
  hip?: number;
  resistance?: number;
  reactance?: number;
  protocol?: string;
  biceps?: number;
  chest?: number;
  midaxillary?: number;
  triceps?: number;
  subscapular?: number;
  abdominal?: number;
  suprailiac?: number;
  thigh?: number;
  observations?: string;
};

export type CalculationResult = PhysicResult & RecommendationResult;

export type DashboardStatsResponse = {
  totalClients: number;
  activeClients: number;
  assessmentsThisMonth: number;
  averageBodyFatChange: number;
  averageLeanMassChange: number;
  clientsWithProgress: number;
};

export type ClientProgressResponse = {
  clientId: string;
  clientName: string;
  clientGoal?: string;
  weightDiff: number;
  bodyFatDiff: number;
  leanMassDiff: number;
  latestDate: string;
  previousDate: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      data?.message ??
      (data?.errors ? Object.values(data.errors).join(', ') : undefined) ??
      'Erro ao comunicar com o backend';
    throw new Error(message);
  }

  return data as T;
}

function toBackendEnum(value?: string): string | undefined {
  return value ? value.toUpperCase() : undefined;
}

function fromBackendEnum<T extends string>(value?: string): T | undefined {
  return value?.toLowerCase() as T | undefined;
}

function normalizeClient(client: BackendClient): Client {
  return {
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    gender: fromBackendEnum<ClientGender>(client.gender),
    birthDate: client.birthDate,
    goal: client.goal,
    notes: client.notes,
    status: fromBackendEnum<ClientStatus>(client.status) ?? 'active',
    createdAt: client.createdAt ?? '',
    updatedAt: client.updatedAt ?? client.createdAt ?? '',
  };
}

function normalizeAssessmentResult(result?: BackendAssessmentResult): AssessmentResult {
  return {
    imc: result?.imc ?? 0,
    bodyFat: result?.bodyFat ?? 0,
    leanMass: result?.leanMass ?? 0,
    fatMass: result?.fatMass ?? 0,
    ffmi: result?.ffmi,
    bmr: result?.bmr ?? 0,
    tdee: result?.tdee ?? 0,
    targetCalories: result?.targetCalories,
    bodyFatLevel: result?.bodyFatLevel ?? 'Sem dados',
  };
}

function normalizeCalculationResult(result: BackendAssessmentResult): CalculationResult {
  return {
    imc: result.imc ?? 0,
    bodyFat: result.bodyFat ?? 0,
    leanMass: result.leanMass ?? 0,
    fatMass: result.fatMass ?? 0,
    ffmi: result.ffmi ?? 0,
    bmr: result.bmr ?? 0,
    tdee: result.tdee ?? 0,
    targetCalories: result.targetCalories ?? 0,
    bodyFatLevel: result.bodyFatLevel ?? 'Sem dados',
    methodDetails: result.methodDetails,
    protein: result.protein ?? 0,
    carbs: result.carbs ?? 0,
    fat: result.fat ?? 0,
    cardio: result.cardio ?? '',
    trainingType: result.trainingType ?? '',
    notes: [],
  };
}

function normalizeAssessment(assessment: BackendAssessment): Assessment {
  const result = assessment.result ?? assessment.results;

  return {
    id: assessment.id,
    clientId: assessment.clientId,
    date: assessment.date,
    method: fromBackendEnum<AssessmentMethod>(assessment.method) ?? 'imc',
    weight: assessment.weight,
    height: assessment.height,
    age: assessment.age,
    gender: fromBackendEnum<Assessment['gender']>(assessment.gender) ?? 'male',
    results: normalizeAssessmentResult(result),
    observations: assessment.observations,
    createdAt: assessment.createdAt ?? '',
    updatedAt: assessment.updatedAt ?? assessment.createdAt ?? '',
  };
}

function toClientRequest(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): ClientRequest {
  return {
    name: client.name,
    email: client.email ?? '',
    phone: client.phone,
    gender: toBackendEnum(client.gender) as BackendGender | undefined,
    birthDate: client.birthDate,
    goal: client.goal,
    notes: client.notes,
  };
}

function toAssessmentRequest(payload: AssessmentPayload) {
  return {
    ...payload,
    method: toBackendEnum(payload.method) as BackendAssessmentMethod,
    gender: toBackendEnum(payload.gender) as BackendGender,
    activityLevel: toBackendEnum(payload.activityLevel),
    objective: toBackendEnum(payload.objective),
  };
}

export const api = {
  async getAllClients(): Promise<Client[]> {
    const clients = await request<BackendClient[]>('/clients');
    return clients.map(normalizeClient);
  },

  async getClientById(id: string): Promise<Client> {
    const client = await request<BackendClient>(`/clients/${id}`);
    return normalizeClient(client);
  },

  async createClient(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const client = await request<BackendClient>('/clients', {
      method: 'POST',
      body: JSON.stringify(toClientRequest(data)),
    });
    return normalizeClient(client);
  },

  async updateClient(
    id: string,
    data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Client> {
    const client = await request<BackendClient>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toClientRequest(data)),
    });
    return normalizeClient(client);
  },

  async deleteClient(id: string): Promise<void> {
    await request<void>(`/clients/${id}`, { method: 'DELETE' });
  },

  async calculate(data: AssessmentPayload): Promise<CalculationResult> {
    const result = await request<BackendAssessmentResult>('/assessments/calculate', {
      method: 'POST',
      body: JSON.stringify(toAssessmentRequest(data)),
    });
    return normalizeCalculationResult(result);
  },

  async saveAssessment(data: AssessmentPayload): Promise<Assessment> {
    const assessment = await request<BackendAssessment>('/assessments', {
      method: 'POST',
      body: JSON.stringify(toAssessmentRequest(data)),
    });
    return normalizeAssessment(assessment);
  },

  async getClientAssessments(clientId: string): Promise<Assessment[]> {
    const assessments = await request<BackendAssessment[]>(`/assessments/client/${clientId}`);
    return assessments.map(normalizeAssessment);
  },

  async getDashboardStats(): Promise<DashboardStatsResponse> {
    return request<DashboardStatsResponse>('/dashboard/stats');
  },

  async getClientProgress(): Promise<ClientProgressResponse[]> {
    return request<ClientProgressResponse[]>('/dashboard/progress');
  },

  async getRecentAssessments(): Promise<Assessment[]> {
    const assessments = await request<BackendAssessment[]>('/dashboard/recent-assessments');
    return assessments.map(normalizeAssessment);
  },

  async getBillingPlans(): Promise<BillingPlan[]> {
    return request<BillingPlan[]>('/billing/plans');
  },

  async getBillingSubscription(): Promise<BillingSubscription> {
    return request<BillingSubscription>('/billing/subscription');
  },

  async createCheckoutSession(plan: Plan): Promise<CheckoutResponse> {
    return request<CheckoutResponse>('/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
  },

  async createCustomerPortalSession(): Promise<CustomerPortalResponse> {
    return request<CustomerPortalResponse>('/billing/portal', { method: 'POST' });
  },
};
