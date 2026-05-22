export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: 'male' | 'female';
  birthDate?: string;
  goal?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}
