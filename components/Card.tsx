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
    <div className={`bg-[#12121a] border border-[#2a2a3a] rounded-lg ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}
