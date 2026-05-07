import { z } from 'zod';

export const userSchema = z
  .object({
    weight: z.number().min(20).max(300),
    height: z.number().min(50).max(250),
    age: z.number().min(10).max(100),
    gender: z.enum(['male', 'female']),
    activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
    objective: z.enum(['cutting', 'maintenance', 'bulking']),
    waist: z.number().min(50).max(200),
    neck: z.number().min(20).max(60),
    hip: z.number().min(0).max(200),
  })
  .refine((data) => data.gender === 'male' || data.hip >= 50, {
    message: 'Informe a medida do quadril',
    path: ['hip'],
  });
