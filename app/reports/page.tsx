'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { apiFetch, getOrgId } from '@/lib/api';

interface ReportItem {
  id: string;
  name: string;
  description: string;
}

interface RecentReport {
  name: string;
  generated: string;
  format: string;
}

const formatColors: Record<string, string> = {
  PDF: 'bg-rose-500/10 text-rose-400',
  CSV: 'bg-emerald-500/10 text-emerald-400',
};

export default function ReportsPage() {
  const [available, setAvailable] = useState<ReportItem[]>([]);
  const [recent, setRecent] = useState<RecentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const orgId = getOrgId();

  const load = async () => {
    try {
      const data = await apiFetch(`/reports?organizationId=${orgId || ''}`);
      setAvailable(Array.isArray(data) ? data : data.reports || data.available || []);
      setRecent(data.recent || []);
    } catch {
      // Fallback to default reports list
      setAvailable([
        { id: 'daily-sales', name: 'Daily Sales Summary', description: 'Revenue, covers, avg ticket by day' },
        { id: 'labor-cost', name: 'Labor Cost Analysis', description: 'Hours, cost, percentage by period' },
        { id: 'customer-lifetime', name: 'Customer Lifetime Value', description: 'Cohort analysis and retention' },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async (reportId: string, reportName: string) => {
    setGenerating(reportId);
    setActiveReport(reportId);
    try {
      const data = await apiFetch(`/reports/${reportId}?organizationId=${orgId || ''}`);
      setReportData(data);
    } catch {
      // Show sample data structure
      setReportData({ message: 'Report data will appear here once connected to live data.', reportId });
    }
    setGenerating(null);
  };

  return (
    <DashboardShell active="Reports">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Reports</h1>
          <p className="mt-1 text-sm text-slate-400">Generate and download operational reports</p>
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-12">Loading reports...</div>
        ) : (
          <>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="border-b border-slate-800 px-5 py-4">
                <div className="text-sm font-medium text-slate-200">Available Reports</div>
              </div>
              <div className="grid grid-cols-1 gap-0 divide-y divide-slate-800/50 sm:grid-cols-2 lg:grid-cols-3">
                {available.map((r) => (
                  <div key={r.id} className={`p-5 hover:bg-slate-800/20 transition ${activeReport === r.id ? 'bg-slate-800/30' : ''}`}>
                    <div className="text-sm font-medium text-slate-200">{r.name}</div>
                    <div className="mt-1 text-xs text-slate-500">{r.description}</div>
                    <button
                      onClick={() => handleGenerate(r.id, r.name)}
                      disabled={generating === r.id}
                      className="mt-3 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {generating === r.id ? 'Generating...' : 'Generate'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {reportData && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50">
                <div className="border-b border-slate-800 px-5 py-4 flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-200">Report Output</div>
                  <button onClick={() => { setReportData(null); setActiveReport(null); }} className="text-xs text-slate-400 hover:text-white">✕ Close</button>
                </div>
                <div className="p-5">
                  <pre className="text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono bg-slate-950 rounded-lg p-4 max-h-96 overflow-y-auto">
                    {JSON.stringify(reportData, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {recent.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50">
                <div className="border-b border-slate-800 px-5 py-4">
                  <div className="text-sm font-medium text-slate-200">Recent Downloads</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                        <th className="px-5 py-3">Report</th>
                        <th className="px-5 py-3">Generated</th>
                        <th className="px-5 py-3">Format</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((r, i) => (
                        <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="px-5 py-3 text-slate-300">{r.name}</td>
                          <td className="px-5 py-3 text-slate-500">{r.generated}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${formatColors[r.format] ?? 'bg-slate-700 text-slate-300'}`}>
                              {r.format}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}
