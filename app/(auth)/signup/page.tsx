import SignupForm from '@/components/auth/SignupForm';

export const metadata = {
  title: 'Crear cuenta — WhaleMetric',
};

export default function SignupPage() {
  return (
    <>
      <header style={{ marginBottom: 24 }}>
        <h1 className="auth-h1">Crea tu cuenta</h1>
        <p className="auth-subtitle">
          Empieza a monitorizar tu presencia en medios en minutos
        </p>
      </header>

      <SignupForm />
    </>
  );
}
