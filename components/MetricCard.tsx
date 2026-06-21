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
    glow: 'bg-accent/5',
    text: 'text-accent',
    badge: 'bg-accent/10 text-accent border-accent/20',
  },
  green: {
    glow: 'bg-success/5',
    text: 'text-success',
    badge: 'bg-success/10 text-success border-success/20',
  },
  amber: {
    glow: 'bg-warning/5',
    text: 'text-warning',
    badge: 'bg-warning/10 text-warning border-warning/20',
  },
  red: {
    glow: 'bg-danger/5',
    text: 'text-danger',
    badge: 'bg-danger/10 text-danger border-danger/20',
  },
  blue: {
    glow: 'bg-info/5',
    text: 'text-info',
    badge: 'bg-info/10 text-info border-info/20',
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
    <div className="relative overflow-hidden rounded-lg border border-rim bg-surface p-5">
      <div className={`absolute inset-0 ${cfg.glow}`} />
      <div className="relative">
        <div className="text-xs font-medium text-lo uppercase tracking-wider">{title}</div>
        <div className={`mt-2 text-2xl font-semibold tabular-nums ${cfg.text}`}>{value}</div>
        {(helper || trend) && (
          <div className="mt-2 flex items-center gap-2">
            {helper && <span className="text-xs text-lo">{helper}</span>}
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
