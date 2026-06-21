'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
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

function DocumentIcon() {
  return (
    <svg className="w-6 h-6 text-lo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

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
      setAvailable([
        { id: 'daily-sales', name: 'Daily Sales Summary', description: 'Revenue, covers, avg ticket by day' },
        { id: 'labor-cost', name: 'Labor Cost Analysis', description: 'Hours, cost, percentage by period' },
        { id: 'customer-lifetime', name: 'Customer Lifetime Value', description: 'Cohort analysis and retention' },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleGenerate = async (reportId: string) => {
    setGenerating(reportId);
    setActiveReport(reportId);
    try {
      const data = await apiFetch(`/reports/${reportId}?organizationId=${orgId || ''}`);
      setReportData(data);
    } catch {
      setReportData({ message: 'Report data will appear here once connected to live data.', reportId });
    }
    setGenerating(null);
  };

  return (
    <DashboardShell active="Reports">
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-lg font-semibold text-hi">Reports</h1>
          <p className="text-xs text-lo mt-0.5">Generate and download operational reports</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 rounded-lg bg-surface border border-rim animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Available reports */}
            <div className="bg-surface border border-rim rounded-lg overflow-hidden">
              <div className="border-b border-rim px-5 py-3.5">
                <span className="text-sm font-medium text-hi">Available Reports</span>
              </div>
              {available.length === 0 ? (
                <EmptyState title="No reports available" description="Reports will appear here once configured." icon={<DocumentIcon />} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y divide-rim sm:divide-y-0 sm:divide-x">
                  {available.map((r) => (
                    <div
                      key={r.id}
                      className={`p-5 transition-colors ${activeReport === r.id ? 'bg-accent/5' : 'hover:bg-raised/40'}`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-raised border border-rim flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-lo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-hi">{r.name}</div>
                          <div className="text-xs text-lo mt-0.5">{r.description}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleGenerate(r.id)}
                        disabled={generating === r.id}
                        className="w-full py-1.5 rounded-md text-xs font-medium bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/20 hover:border-accent disabled:opacity-50 transition-colors"
                      >
                        {generating === r.id ? 'Generating...' : 'Generate Report'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Report output */}
            {reportData && (
              <div className="bg-surface border border-rim rounded-lg overflow-hidden">
                <div className="border-b border-rim px-5 py-3.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-hi">Report Output</span>
                  <button
                    onClick={() => { setReportData(null); setActiveReport(null); }}
                    className="flex items-center gap-1.5 text-xs text-lo hover:text-hi transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Close
                  </button>
                </div>
                <div className="p-5">
                  <pre className="text-xs text-mid overflow-x-auto whitespace-pre-wrap font-mono bg-base rounded-lg p-4 max-h-96 overflow-y-auto border border-rim">
                    {JSON.stringify(reportData, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Recent downloads */}
            {recent.length > 0 && (
              <div className="bg-surface border border-rim rounded-lg overflow-hidden">
                <div className="border-b border-rim px-5 py-3.5">
                  <span className="text-sm font-medium text-hi">Recent Downloads</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-rim text-xs uppercase tracking-wider text-lo">
                        <th className="text-left px-5 py-3">Report</th>
                        <th className="text-left px-5 py-3">Generated</th>
                        <th className="text-left px-5 py-3">Format</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((r, i) => (
                        <tr key={i} className="border-b border-rim/50 hover:bg-raised/40 transition-colors">
                          <td className="px-5 py-3 text-mid">{r.name}</td>
                          <td className="px-5 py-3 text-lo text-xs">{r.generated}</td>
                          <td className="px-5 py-3">
                            <Badge variant={r.format === 'PDF' ? 'danger' : r.format === 'CSV' ? 'success' : 'neutral'}>
                              {r.format}
                            </Badge>
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
