import { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-mid">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-inset border ${
          error ? 'border-danger' : 'border-edge'
        } rounded-md px-3 py-2 text-sm text-hi placeholder-lo focus:outline-none focus:border-accent transition-colors duration-150 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
