'use client';
import DashboardShell from '@/components/DashboardShell';
import MetricCard from '@/components/MetricCard';
import { metrics } from '@/lib/mockData';

export default function DashboardPage() {
  const m = metrics.today;
  const w = metrics.week;

  return (
    <DashboardShell active="Dashboard">
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Command center</h1>
            <p className="mt-1 text-sm text-slate-400">Realtime view for Main St. location</p>
          </div>
          <div className="text-sm text-slate-400">Last synced just now</div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <MetricCard title="Revenue Today" value={m.revenue} helper="vs yesterday" trend="+2.1%" accent="emerald" />
          <MetricCard title="Guest Count" value={String(m.guests)} helper="covers" trend="+1.4%" accent="blue" />
          <MetricCard title="Average Ticket" value={m.avgTicket} helper="per guest today" accent="blue" />
          <MetricCard title="Labor %" value={m.laborPct} helper="target 28%" accent="amber" />
          <MetricCard title="Food Cost %" value={m.foodCostPct} helper="target 31%" accent="rose" />
          <MetricCard title="Prime Cost %" value={m.primeCostPct} helper="target <60%" accent="amber" />
          <MetricCard title="Marketing ROI" value={w.marketingROI} helper="trailing 7 days" accent="emerald" />
          <MetricCard title="Revenue This Week" value={w.revenue} helper={w.vsLastWeek} accent="emerald" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="text-sm font-medium text-slate-200">Top selling items</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              {m.topItems.map((x) => (
                <li key={x} className="flex items-center justify-between">
                  <span>{x}</span>
                  <span className="text-slate-500">—</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="text-sm font-medium text-slate-200">Labor snapshot</div>
            <div className="mt-3 text-sm text-slate-400">Clocked in now: 9</div>
            <div className="mt-1 text-sm text-slate-400">Scheduled today: 18</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="text-sm font-medium text-slate-200">Alerts</div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="rounded-md bg-amber-500/10 p-3 text-amber-300">Low inventory: House-made ranch</div>
              <div className="rounded-md bg-rose-500/10 p-3 text-rose-300">Overtime risk: prep station</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
