'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
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

const shiftStatusVariant: Record<string, 'success' | 'neutral' | 'warning'> = {
  'clocked-in': 'success',
  scheduled: 'neutral',
  'clocked-out': 'warning',
};

export default function LaborPage() {
  const [summary, setSummary] = useState<LaborSummary>({ scheduled: 0, clockedIn: 0, laborPct: 0, laborCost: 0 });
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'today' | 'week'>('today');
  const orgId = getOrgId();

  const load = async () => {
    setLoading(true);
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

  useEffect(() => {
    load();
  }, [view]);

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

  const laborPctColor = summary.laborPct > 35 ? 'text-red-500' : summary.laborPct > 28 ? 'text-amber-500' : 'text-emerald-500';

  return (
    <DashboardShell active="Labor">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-dhi">Labor</h1>
            <p className="text-xs text-dlo mt-0.5">Shift scheduling and labor cost tracking</p>
          </div>
          <div className="flex gap-1.5">
            {(['today', 'week'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                  view === v ? 'bg-indigo-500 text-white' : 'bg-dr text-dmid hover:text-dhi border border-dedge'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-danger/5 border border-danger/20 rounded-lg px-4 py-3 text-sm text-red-500">{error}</div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-ds border border-drim animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="bg-ds border border-drim rounded-lg p-5">
                <div className="text-xs font-medium text-dlo uppercase tracking-wider">Scheduled</div>
                <div className="mt-2 text-2xl font-semibold text-dhi">{summary.scheduled}</div>
              </div>
              <div className="bg-ds border border-drim rounded-lg p-5">
                <div className="text-xs font-medium text-dlo uppercase tracking-wider">Clocked In</div>
                <div className="mt-2 text-2xl font-semibold text-emerald-500">{summary.clockedIn}</div>
              </div>
              <div className="bg-ds border border-drim rounded-lg p-5">
                <div className="text-xs font-medium text-dlo uppercase tracking-wider">Labor %</div>
                <div className={`mt-2 text-2xl font-semibold ${laborPctColor}`}>{summary.laborPct}%</div>
                <div className="text-xs text-dlo mt-1">target 28%</div>
              </div>
              <div className="bg-ds border border-drim rounded-lg p-5">
                <div className="text-xs font-medium text-dlo uppercase tracking-wider">Labor Cost</div>
                <div className="mt-2 text-2xl font-semibold text-dhi">${summary.laborCost.toLocaleString()}</div>
              </div>
            </div>

            {/* Additional metrics */}
            {summary.totalHours !== undefined && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="bg-ds border border-drim rounded-lg p-5">
                  <div className="text-sm font-medium text-dmid">Total Hours</div>
                  <div className="mt-2 text-xl font-semibold text-dhi">{summary.totalHours}h</div>
                </div>
                <div className="bg-ds border border-drim rounded-lg p-5">
                  <div className="text-sm font-medium text-dmid">Overtime Hours</div>
                  <div className="mt-2 text-xl font-semibold text-red-500">{summary.overtimeHours || 0}h</div>
                </div>
                <div className="bg-ds border border-drim rounded-lg p-5">
                  <div className="text-sm font-medium text-dmid">Est. Weekly Cost</div>
                  <div className="mt-2 text-xl font-semibold text-dhi">${(summary.laborCost * 7).toLocaleString()}</div>
                </div>
              </div>
            )}

            {/* Shifts table */}
            <div className="bg-ds border border-drim rounded-lg overflow-hidden">
              <div className="border-b border-drim px-5 py-3.5 flex items-center justify-between">
                <span className="text-sm font-medium text-dhi">Shifts</span>
                <span className="text-xs text-dlo">{shifts.length} total</span>
              </div>
              {shifts.length === 0 ? (
                <EmptyState title="No shifts scheduled" description="No shifts scheduled for this period." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-drim text-xs uppercase tracking-wider text-dlo">
                        <th className="text-left px-5 py-3">Employee</th>
                        <th className="text-left px-5 py-3">Role</th>
                        <th className="text-left px-5 py-3">Start</th>
                        <th className="text-left px-5 py-3">End</th>
                        <th className="text-left px-5 py-3">Hours</th>
                        <th className="text-left px-5 py-3">Status</th>
                        <th className="text-left px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shifts.map((s) => (
                        <tr key={s.id} className="border-b border-drim/50 hover:bg-dr/40 transition-colors">
                          <td className="px-5 py-3 text-dmid font-medium">{s.employeeName}</td>
                          <td className="px-5 py-3 text-dlo">{s.role}</td>
                          <td className="px-5 py-3 font-mono text-xs text-dlo">{s.startTime}</td>
                          <td className="px-5 py-3 font-mono text-xs text-dlo">{s.endTime}</td>
                          <td className="px-5 py-3 text-dlo">{s.hours ?? '—'}</td>
                          <td className="px-5 py-3">
                            <Badge variant={shiftStatusVariant[s.status] ?? 'neutral'}>
                              {s.status.replace('-', ' ')}
                            </Badge>
                          </td>
                          <td className="px-5 py-3">
                            {s.status === 'scheduled' && (
                              <button
                                onClick={() => handleClockIn(s.id)}
                                className="text-xs text-emerald-500 hover:text-dhi font-medium transition-colors"
                              >
                                Clock In
                              </button>
                            )}
                            {s.status === 'clocked-in' && (
                              <button
                                onClick={() => handleClockOut(s.id)}
                                className="text-xs text-amber-500 hover:text-dhi font-medium transition-colors"
                              >
                                Clock Out
                              </button>
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
