import { ReactNode } from 'react';

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const variantClasses: Record<Variant, string> = {
  success: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
  danger: 'bg-red-500/10 text-red-500 border border-red-500/20',
  info: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
  neutral: 'bg-slate-700 text-slate-400 border border-slate-600',
};

type BadgeProps = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

export default function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
