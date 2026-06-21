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
            <h1 className="text-xl font-semibold text-white">Command Center</h1>
            <p className="mt-1 text-sm text-slate-500">Realtime view · Main St. location</p>
          </div>
          <div className="text-xs text-slate-500">Live</div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <MetricCard title="Revenue Today" value={m.revenue} helper="vs yesterday" trend="+2.1%" accent="green" />
          <MetricCard title="Guest Count" value={String(m.guests)} helper="covers" trend="+1.4%" accent="blue" />
          <MetricCard title="Average Ticket" value={m.avgTicket} helper="per guest today" accent="blue" />
          <MetricCard title="Labor %" value={m.laborPct} helper="target 28%" accent="amber" />
          <MetricCard title="Food Cost %" value={m.foodCostPct} helper="target 31%" accent="red" />
          <MetricCard title="Prime Cost %" value={m.primeCostPct} helper="target <60%" accent="amber" />
          <MetricCard title="Marketing ROI" value={w.marketingROI} helper="trailing 7 days" accent="green" />
          <MetricCard title="Revenue This Week" value={w.revenue} helper={w.vsLastWeek} accent="green" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-5">
            <div className="text-sm font-medium text-white">Top Selling Items</div>
            <ul className="mt-3 space-y-2">
              {m.topItems.map((x) => (
                <li key={x} className="flex items-center justify-between text-sm text-slate-400">
                  <span>{x}</span>
                  <span className="text-slate-500">—</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-5">
            <div className="text-sm font-medium text-white">Labor Snapshot</div>
            <div className="mt-3 space-y-1.5 text-sm text-slate-400">
              <div>Clocked in now: <span className="text-emerald-500 font-medium">9</span></div>
              <div>Scheduled today: <span className="text-white font-medium">18</span></div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-5">
            <div className="text-sm font-medium text-white">Alerts</div>
            <div className="mt-3 space-y-2">
              <div className="border-l-2 border-warning rounded-r-md bg-warning/5 px-3 py-2 text-xs text-amber-500">
                Low inventory: House-made ranch
              </div>
              <div className="border-l-2 border-danger rounded-r-md bg-danger/5 px-3 py-2 text-xs text-red-500">
                Overtime risk: prep station
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
