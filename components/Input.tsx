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
        <label htmlFor={inputId} className="text-xs font-medium text-dmid">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-di border ${
          error ? 'border-danger' : 'border-dedge'
        } rounded-md px-3 py-2 text-sm text-dhi placeholder-dlo focus:outline-none focus:border-indigo-500 transition-colors duration-150 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
