'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { apiFetch, getOrgId } from '@/lib/api';

interface Shift {
  id: string;
  employeeName: string;
  role: string;
  startTime: string;
  endTime: string;
  status: string;
  hours?: number;
}

interface LaborSummary {
  scheduled: number;
  clockedIn: number;
  laborPct: number;
  laborCost: number;
  totalHours?: number;
  overtimeHours?: number;
}

export default function LaborPage() {
  const [summary, setSummary] = useState<LaborSummary>({ scheduled: 0, clockedIn: 0, laborPct: 0, laborCost: 0 });
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'today' | 'week'>('today');
  const orgId = getOrgId();

  const load = async () => {
    try {
      const [summaryRes, shiftsRes] = await Promise.all([
        apiFetch(`/labor/overview?period=${view}&organizationId=${orgId || ''}`),
        apiFetch(`/labor/shifts?organizationId=${orgId || ''}`),
      ]);
      setSummary(summaryRes || { scheduled: 0, clockedIn: 0, laborPct: 0, laborCost: 0 });
      setShifts(Array.isArray(shiftsRes) ? shiftsRes : shiftsRes.shifts || shiftsRes.data || []);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [view]);

  const handleClockIn = async (shiftId: string) => {
    try {
      await apiFetch(`/labor/shifts/${shiftId}/clock-in`, { method: 'POST' });
      await load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleClockOut = async (shiftId: string) => {
    try {
      await apiFetch(`/labor/shifts/${shiftId}/clock-out`, { method: 'POST' });
      await load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const statusColors: Record<string, string> = {
    'clocked-in': 'bg-emerald-500/10 text-emerald-400',
    scheduled: 'bg-slate-700/50 text-slate-400',
    'clocked-out': 'bg-slate-600/30 text-slate-500',
  };

  return (
    <DashboardShell active="Labor">
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Labor</h1>
            <p className="mt-1 text-sm text-slate-400">Shift scheduling and labor cost tracking</p>
          </div>
          <div className="flex gap-2">
            {(['today', 'week'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${view === v ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>}

        {loading ? (
          <div className="text-center text-slate-500 py-12">Loading labor data...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                <div className="text-xs uppercase tracking-wider text-slate-400">Scheduled</div>
                <div className="mt-2 text-2xl font-semibold text-white">{summary.scheduled}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                <div className="text-xs uppercase tracking-wider text-slate-400">Clocked In</div>
                <div className="mt-2 text-2xl font-semibold text-emerald-400">{summary.clockedIn}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                <div className="text-xs uppercase tracking-wider text-slate-400">Labor %</div>
                <div className="mt-2 text-2xl font-semibold text-amber-400">{summary.laborPct}%</div>
                <div className="mt-1 text-xs text-slate-500">target 28%</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                <div className="text-xs uppercase tracking-wider text-slate-400">Labor Cost</div>
                <div className="mt-2 text-2xl font-semibold text-white">${summary.laborCost.toLocaleString()}</div>
              </div>
            </div>

            {summary.totalHours !== undefined && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                  <div className="text-sm font-medium text-slate-200">Total Hours</div>
                  <div className="mt-2 text-xl font-semibold text-white">{summary.totalHours}h</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                  <div className="text-sm font-medium text-slate-200">Overtime Hours</div>
                  <div className="mt-2 text-xl font-semibold text-rose-400">{summary.overtimeHours || 0}h</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                  <div className="text-sm font-medium text-slate-200">Est. Weekly Cost</div>
                  <div className="mt-2 text-xl font-semibold text-white">${(summary.laborCost * 7).toLocaleString()}</div>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="border-b border-slate-800 px-5 py-4">
                <div className="text-sm font-medium text-slate-200">Shifts ({shifts.length})</div>
              </div>
              {shifts.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No shifts scheduled.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                        <th className="px-5 py-3">Employee</th>
                        <th className="px-5 py-3">Role</th>
                        <th className="px-5 py-3">Start</th>
                        <th className="px-5 py-3">End</th>
                        <th className="px-5 py-3">Hours</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shifts.map((s) => (
                        <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="px-5 py-3 text-slate-300">{s.employeeName}</td>
                          <td className="px-5 py-3 text-slate-400">{s.role}</td>
                          <td className="px-5 py-3 font-mono text-slate-400">{s.startTime}</td>
                          <td className="px-5 py-3 font-mono text-slate-400">{s.endTime}</td>
                          <td className="px-5 py-3 text-slate-400">{s.hours || '—'}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[s.status] ?? 'bg-slate-700 text-slate-300'}`}>
                              {s.status.replace('-', ' ')}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            {s.status === 'scheduled' && (
                              <button onClick={() => handleClockIn(s.id)} className="text-emerald-400 hover:text-emerald-300 text-xs font-medium mr-2">Clock In</button>
                            )}
                            {s.status === 'clocked-in' && (
                              <button onClick={() => handleClockOut(s.id)} className="text-amber-400 hover:text-amber-300 text-xs font-medium">Clock Out</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
