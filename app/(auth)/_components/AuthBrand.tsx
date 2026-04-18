import Link from 'next/link';

export default function AuthBrand() {
  return (
    <Link href="/" className="auth-brand" aria-label="WhaleMetric — Inicio">
      <img src="/imgs/LogoLargoWhaleMetric.png" alt="WhaleMetric" />
    </Link>
  );
}
