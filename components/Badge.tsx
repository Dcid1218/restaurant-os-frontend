import { ReactNode } from 'react';

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const variantClasses: Record<Variant, string> = {
  success: 'bg-emerald-500/10 text-emerald-500 border border-success/20',
  warning: 'bg-amber-500/10 text-amber-500 border border-warning/20',
  danger: 'bg-red-500/10 text-red-500 border border-danger/20',
  info: 'bg-blue-500/10 text-blue-500 border border-info/20',
  neutral: 'bg-[#22222f] text-[#a0a0b8] border border-[#3a3a4f]',
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
