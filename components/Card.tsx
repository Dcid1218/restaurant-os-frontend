import { ReactNode } from 'react';

type Padding = 'sm' | 'md' | 'lg';

const paddingClasses: Record<Padding, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: Padding;
};

export default function Card({ children, className = '', padding = 'md' }: CardProps) {
  return (
    <div className={`bg-surface border border-rim rounded-lg ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}
