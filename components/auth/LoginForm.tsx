'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/browser';
import { loginSchema, type LoginInput } from '@/lib/validation/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';

function mapSupabaseError(msg: string | undefined): string {
  if (!msg) return 'No se pudo iniciar sesión';
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Email o contraseña incorrectos';
  if (m.includes('email not confirmed')) return 'Confirma tu email para poder iniciar sesión';
  if (m.includes('too many requests')) return 'Demasiados intentos. Espera un momento y vuelve a intentarlo.';
  return msg;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/dashboard';
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      setServerError(mapSupabaseError(error.message));
      return;
    }
    router.push(nextPath);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && (
        <div className="auth-error-box" role="alert">
          {serverError}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="tu@empresa.com"
          disabled={isSubmitting}
          invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email && <span className="auth-field-error">{errors.email.message}</span>}
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
          <Label htmlFor="password" style={{ marginBottom: 0 }}>Contraseña</Label>
          <Link href="/login" className="auth-link-muted" aria-disabled>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="auth-input-wrap">
          <Input
            id="password"
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
            className="auth-input-with-icon"
            disabled={isSubmitting}
            invalid={!!errors.password}
            {...register('password')}
          />
          <button
            type="button"
            className="auth-input-icon-btn"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            tabIndex={-1}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <span className="auth-field-error">{errors.password.message}</span>}
      </div>

      <Button type="submit" loading={isSubmitting} fullWidth>
        {isSubmitting ? 'Entrando…' : 'Iniciar sesión'}
      </Button>

      <p className="auth-footer-link">
        ¿No tienes cuenta? <Link href="/signup">Regístrate</Link>
      </p>
    </form>
  );
}
