'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/browser';
import { signupSchema, type SignupInput } from '@/lib/validation/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';

function mapSupabaseError(msg: string | undefined): string {
  if (!msg) return 'No se pudo crear la cuenta';
  const m = msg.toLowerCase();
  if (m.includes('user already registered') || m.includes('already registered')) {
    return 'Este email ya está registrado';
  }
  if (m.includes('password should be')) {
    return 'La contraseña no cumple los requisitos mínimos';
  }
  if (m.includes('rate limit') || m.includes('too many requests')) {
    return 'Demasiados intentos. Espera un momento y vuelve a intentarlo.';
  }
  return msg;
}

export default function SignupForm() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
  });

  async function onSubmit(values: SignupInput) {
    setServerError(null);
    const supabase = createClient();

    const redirectUrl = `${window.location.origin}/auth/callback?account_name=${encodeURIComponent(values.account_name)}`;

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { account_name: values.account_name },
      },
    });

    if (error) {
      setServerError(mapSupabaseError(error.message));
      return;
    }

    // If Supabase has email confirmation enabled, session is null.
    if (data.session) {
      // Insert the public.users row right away — no email confirmation.
      await supabase.from('users').upsert(
        { id: data.user!.id, account_name: values.account_name },
        { onConflict: 'id' }
      );
      router.push('/dashboard');
      router.refresh();
      return;
    }

    setEmailSentTo(values.email);
  }

  if (emailSentTo) {
    return (
      <div className="auth-success-box" role="status">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <CheckCircle2 size={20} strokeWidth={2} />
          <strong style={{ fontSize: 15 }}>Revisa tu correo</strong>
        </div>
        Hemos enviado un enlace de confirmación a <strong>{emailSentTo}</strong>.
        Abre el email y pincha el enlace para activar tu cuenta.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && (
        <div className="auth-error-box" role="alert">
          {serverError}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <Label htmlFor="account_name">Nombre</Label>
        <Input
          id="account_name"
          type="text"
          autoComplete="name"
          autoFocus
          placeholder="Nombre o equipo"
          disabled={isSubmitting}
          invalid={!!errors.account_name}
          {...register('account_name')}
        />
        {errors.account_name && <span className="auth-field-error">{errors.account_name.message}</span>}
      </div>

      <div style={{ marginBottom: 16 }}>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="tu@empresa.com"
          disabled={isSubmitting}
          invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email && <span className="auth-field-error">{errors.email.message}</span>}
      </div>

      <div style={{ marginBottom: 16 }}>
        <Label htmlFor="password">Contraseña</Label>
        <div className="auth-input-wrap">
          <Input
            id="password"
            type={showPw ? 'text' : 'password'}
            autoComplete="new-password"
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

      <div style={{ marginBottom: 20 }}>
        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
        <div className="auth-input-wrap">
          <Input
            id="confirmPassword"
            type={showPw2 ? 'text' : 'password'}
            autoComplete="new-password"
            className="auth-input-with-icon"
            disabled={isSubmitting}
            invalid={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
          <button
            type="button"
            className="auth-input-icon-btn"
            onClick={() => setShowPw2((v) => !v)}
            aria-label={showPw2 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            tabIndex={-1}
          >
            {showPw2 ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmPassword && <span className="auth-field-error">{errors.confirmPassword.message}</span>}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label className="auth-checkbox-row" htmlFor="acceptTerms">
          <input
            id="acceptTerms"
            type="checkbox"
            className="auth-checkbox"
            disabled={isSubmitting}
            {...register('acceptTerms')}
          />
          <span className="auth-checkbox-label">
            Acepto los <Link href="/legal/terms">Términos de servicio</Link> y la{' '}
            <Link href="/legal/privacy">Política de privacidad</Link>
          </span>
        </label>
        {errors.acceptTerms && <span className="auth-field-error">{errors.acceptTerms.message}</span>}
      </div>

      <Button type="submit" loading={isSubmitting} fullWidth>
        {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
      </Button>

      <p className="auth-footer-link">
        ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
      </p>
    </form>
  );
}
