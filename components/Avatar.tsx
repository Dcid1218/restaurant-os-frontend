type Size = 'sm' | 'md' | 'lg';

const sizeClasses: Record<Size, string> = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
};

type AvatarProps = {
  name: string;
  size?: Size;
  className?: string;
};

export default function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-indigo-500/20 text-indigo-500 font-semibold flex items-center justify-center shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}
