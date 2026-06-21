import { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
};

function DefaultIcon() {
  return (
    <svg className="w-6 h-6 text-lo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  );
}

export default function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 w-12 h-12 rounded-full bg-raised flex items-center justify-center border border-rim">
        {icon ?? <DefaultIcon />}
      </div>
      <h3 className="text-sm font-medium text-hi">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-lo max-w-xs">{description}</p>
      )}
    </div>
  );
}
