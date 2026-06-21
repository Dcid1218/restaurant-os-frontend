'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import { apiFetch, getOrgId } from '@/lib/api';

interface Campaign {
  id: string;
  name: string;
  channel: string;
  spend: number;
  conversions: number;
  roi: number;
  status: string;
}

interface MarketingSummary {
  totalSpend: number;
  roi: number;
  impressions: number;
  conversions: number;
}

const channelIcons: Record<string, React.ReactNode> = {
  Email: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Instagram: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  SMS: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  Google: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <circle cx="11" cy="11" r="8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
    </svg>
  ),
};

const inputCls =
  'w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors';

export default function MarketingPage() {
  const [summary, setSummary] = useState<MarketingSummary>({ totalSpend: 0, roi: 0, impressions: 0, conversions: 0 });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', channel: '', spend: '', status: 'active' });
  const [saving, setSaving] = useState(false);
  const orgId = getOrgId();

  const load = async () => {
    try {
      const [summaryRes, campaignsRes] = await Promise.all([
        apiFetch(`/marketing/summary?organizationId=${orgId || ''}`),
        apiFetch(`/marketing/campaigns?organizationId=${orgId || ''}`),
      ]);
      setSummary(summaryRes || { totalSpend: 0, roi: 0, impressions: 0, conversions: 0 });
      setCampaigns(Array.isArray(campaignsRes) ? campaignsRes : campaignsRes.campaigns || campaignsRes.data || []);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/marketing/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          spend: parseFloat(form.spend) || 0,
          organizationId: orgId,
        }),
      });
      setForm({ name: '', channel: '', spend: '', status: 'active' });
      setShowForm(false);
      await load();
    } catch (err: any) {
      alert(err.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      await apiFetch(`/marketing/campaigns/${id}`, { method: 'DELETE' });
      await load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const roiColor = (roi: number) =>
    roi >= 4 ? 'text-emerald-500' : roi >= 3 ? 'text-blue-500' : 'text-amber-500';

  return (
    <DashboardShell active="Marketing">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white">Marketing</h1>
            <p className="text-xs text-slate-500 mt-0.5">Campaign performance and ROI tracking</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'secondary' : 'primary'}>
            {showForm ? 'Cancel' : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Campaign
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-500">{error}</div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-slate-900 border border-slate-700 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-5">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Spend</div>
                <div className="mt-2 text-2xl font-semibold text-white">${summary.totalSpend.toLocaleString()}</div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-5">
                <div className="text-xs font-medium text-emerald-500 uppercase tracking-wider">ROI</div>
                <div className="mt-2 text-2xl font-semibold text-emerald-500">{summary.roi}x</div>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-5">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Impressions</div>
                <div className="mt-2 text-2xl font-semibold text-white">{summary.impressions.toLocaleString()}</div>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-5">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Conversions</div>
                <div className="mt-2 text-2xl font-semibold text-white">{summary.conversions}</div>
              </div>
            </div>

            {/* New campaign form */}
            {showForm && (
              <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-700 rounded-lg p-5 space-y-4">
                <div className="text-sm font-medium text-white">New Campaign</div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Name</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Channel</label>
                    <select
                      value={form.channel}
                      onChange={(e) => setForm({ ...form, channel: e.target.value })}
                      required
                      className={inputCls}
                    >
                      <option value="">Select...</option>
                      <option value="Email">Email</option>
                      <option value="Instagram">Instagram</option>
                      <option value="SMS">SMS</option>
                      <option value="Google">Google</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Budget</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.spend}
                      onChange={(e) => setForm({ ...form, spend: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className={inputCls}
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" loading={saving}>
                  Create Campaign
                </Button>
              </form>
            )}

            {/* Campaigns table */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
              <div className="border-b border-slate-700 px-5 py-3.5 flex items-center justify-between">
                <span className="text-sm font-medium text-white">Campaigns</span>
                <span className="text-xs text-slate-500">{campaigns.length} total</span>
              </div>
              {campaigns.length === 0 ? (
                <EmptyState
                  title="No campaigns yet"
                  description="Create your first campaign to start tracking ROI."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-xs uppercase tracking-wider text-slate-500">
                        <th className="text-left px-5 py-3">Campaign</th>
                        <th className="text-left px-5 py-3">Channel</th>
                        <th className="text-left px-5 py-3">Spend</th>
                        <th className="text-left px-5 py-3">Conversions</th>
                        <th className="text-left px-5 py-3">ROI</th>
                        <th className="text-left px-5 py-3">Status</th>
                        <th className="text-left px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((c) => (
                        <tr key={c.id} className="border-b border-slate-700/50 hover:bg-slate-700/40 transition-colors">
                          <td className="px-5 py-3 text-slate-400 font-medium">{c.name}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2 text-slate-500">
                              {channelIcons[c.channel] ?? null}
                              <span>{c.channel}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-slate-500">${(c.spend || 0).toLocaleString()}</td>
                          <td className="px-5 py-3 text-slate-500">{c.conversions || 0}</td>
                          <td className={`px-5 py-3 font-semibold ${roiColor(c.roi || 0)}`}>
                            {c.roi || 0}x
                          </td>
                          <td className="px-5 py-3">
                            <Badge variant={c.status === 'active' ? 'success' : 'neutral'}>
                              {c.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-3">
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="text-xs text-slate-500 hover:text-red-500 transition-colors font-medium"
                            >
                              Delete
                            </button>
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
