'use client';
import { ReactNode } from 'react';

type MetricProps = {
  title: string;
  value: string;
  helper?: string;
  trend?: string;
  accent?: 'blue' | 'emerald' | 'amber' | 'rose';
};

const accentClasses: Record<string, string> = {
  blue: 'border-blue-500/40 bg-blue-500/10',
  emerald: 'border-emerald-500/40 bg-emerald-500/10',
  amber: 'border-amber-500/40 bg-amber-500/10',
  rose: 'border-rose-500/40 bg-rose-500/10',
};

export default function MetricCard({ title, value, helper, trend, accent = 'blue' }: MetricProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl border ${accentClasses[accent]} p-5 shadow-sm`}>
      <div className="text-xs uppercase tracking-wider text-slate-300">{title}</div>
      <div className="mt-2 text-3xl font-semibold tabular-nums">{value}</div>
      {(helper || trend) && <div className="mt-2 text-xs text-slate-400">{helper}{trend ? ` · ${trend}` : ''}</div>}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
    </div>
  );
}
