import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Iniciar sesión — WhaleMetric',
};

export default function LoginPage() {
  return (
    <>
      <header style={{ marginBottom: 24 }}>
        <h1 className="auth-h1">Bienvenido de nuevo</h1>
        <p className="auth-subtitle">Accede a tu panel de WhaleMetric</p>
      </header>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </>
  );
}
