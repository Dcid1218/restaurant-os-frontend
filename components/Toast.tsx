'use client';

import { useToast } from '@/lib/toast';

const typeStyles = {
  error: 'bg-red-500/10 border-red-500/30 text-red-400',
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
};

const typeIcons = {
  error: '⚠️',
  success: '✅',
  info: 'ℹ️',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur ${typeStyles[toast.type]}`}
        >
          <span className="text-base mt-0.5">{typeIcons[toast.type]}</span>
          <p className="flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-500 hover:text-white text-xs mt-0.5 shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
