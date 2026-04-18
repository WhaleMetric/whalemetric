'use client';

import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={clsx(
        'auth-btn',
        variant === 'primary' ? 'auth-btn-primary' : 'auth-btn-secondary',
        fullWidth && 'auth-btn-full',
        className
      )}
    >
      {loading && <span className="auth-btn-spinner" aria-hidden />}
      <span>{children}</span>
    </button>
  );
}
