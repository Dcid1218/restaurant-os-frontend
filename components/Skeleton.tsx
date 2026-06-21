'use client';

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/50 p-5 animate-pulse ${className}`}>
      <div className="h-3 w-24 rounded bg-slate-800 mb-3" />
      <div className="h-7 w-32 rounded bg-slate-700/60" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden animate-pulse">
      <div className="border-b border-slate-800 px-5 py-4">
        <div className="h-4 w-32 rounded bg-slate-800" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-5 py-3"><div className="h-3 w-20 rounded bg-slate-800" /></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, ri) => (
              <tr key={ri} className="border-b border-slate-800/50">
                {Array.from({ length: cols }).map((_, ci) => (
                  <td key={ci} className="px-5 py-3"><div className="h-3 w-full rounded bg-slate-800/60" /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ChartSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/50 p-5 animate-pulse ${className}`}>
      <div className="h-4 w-40 rounded bg-slate-800 mb-4" />
      <div className="flex items-end gap-2 h-40">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-slate-700/40"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <div className="h-3 w-24 rounded bg-slate-800 mb-2" />
          <div className="h-10 w-full rounded-lg bg-slate-800/60" />
        </div>
      ))}
      <div className="h-10 w-32 rounded-lg bg-slate-700/40" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 rounded bg-slate-800" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <ChartSkeleton />
      <TableSkeleton />
    </div>
  );
}
