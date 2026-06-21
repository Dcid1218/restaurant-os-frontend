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
        <label htmlFor={inputId} className="text-xs font-medium text-[#a0a0b8]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-[#1a1a26] border ${
          error ? 'border-danger' : 'border-[#3a3a4f]'
        } rounded-md px-3 py-2 text-sm text-[#f0f0f5] placeholder-lo focus:outline-none focus:border-indigo-500 transition-colors duration-150 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
