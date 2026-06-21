'use client';

type Accent = 'indigo' | 'green' | 'amber' | 'red' | 'blue';

type MetricProps = {
  title: string;
  value: string;
  helper?: string;
  trend?: string;
  accent?: Accent;
};

const accentConfig: Record<Accent, { glow: string; text: string; badge: string }> = {
  indigo: {
    glow: 'bg-indigo-500/5',
    text: 'text-indigo-500',
    badge: 'bg-indigo-500/10 text-indigo-500 border-accent/20',
  },
  green: {
    glow: 'bg-emerald-500/5',
    text: 'text-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-500 border-success/20',
  },
  amber: {
    glow: 'bg-warning/5',
    text: 'text-amber-500',
    badge: 'bg-amber-500/10 text-amber-500 border-warning/20',
  },
  red: {
    glow: 'bg-danger/5',
    text: 'text-red-500',
    badge: 'bg-red-500/10 text-red-500 border-danger/20',
  },
  blue: {
    glow: 'bg-info/5',
    text: 'text-blue-500',
    badge: 'bg-blue-500/10 text-blue-500 border-info/20',
  },
};

export default function MetricCard({
  title,
  value,
  helper,
  trend,
  accent = 'indigo',
}: MetricProps) {
  const cfg = accentConfig[accent];

  return (
    <div className="relative overflow-hidden rounded-lg border border-drim bg-ds p-5">
      <div className={`absolute inset-0 ${cfg.glow}`} />
      <div className="relative">
        <div className="text-xs font-medium text-dlo uppercase tracking-wider">{title}</div>
        <div className={`mt-2 text-2xl font-semibold tabular-nums ${cfg.text}`}>{value}</div>
        {(helper || trend) && (
          <div className="mt-2 flex items-center gap-2">
            {helper && <span className="text-xs text-dlo">{helper}</span>}
            {trend && (
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border ${cfg.badge}`}>
                {trend}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
