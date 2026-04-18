import clsx from 'clsx';
import type { LabelHTMLAttributes, ReactNode } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
}

export default function Label({ className, children, ...rest }: LabelProps) {
  return (
    <label {...rest} className={clsx('auth-label', className)}>
      {children}
    </label>
  );
}
