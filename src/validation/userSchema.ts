import { z } from 'zod';

export const userSchema = z.object({
  weight: z.number().min(1),
  height: z.number().min(50).max(250),
  age: z.number().min(10).max(100),

  gender: z.enum(['male', 'female']),

  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),

  objective: z.enum(['cutting', 'maintenance', 'bulking']),

  waist: z.number().min(1),
  neck: z.number().min(1),
  hip: z.number().min(0),
});
