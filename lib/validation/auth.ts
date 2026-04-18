import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    account_name: z
      .string()
      .min(2, 'Mínimo 2 caracteres')
      .max(80, 'Máximo 80 caracteres'),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Al menos una mayúscula')
      .regex(/[0-9]/, 'Al menos un número'),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, { message: 'Debes aceptar los términos' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });
export type SignupInput = z.infer<typeof signupSchema>;
