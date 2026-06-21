'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
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

const channelIcons: Record<string, string> = {
  Email: '📧',
  Instagram: '📸',
  SMS: '💬',
  Google: '🔍',
};

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

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/marketing/campaigns', {
        method: 'POST',
        body: JSON.stringify({ ...form, spend: parseFloat(form.spend) || 0, organizationId: orgId }),
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

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400',
    paused: 'bg-slate-700/50 text-slate-400',
  };

  return (
    <DashboardShell active="Marketing">
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Marketing</h1>
            <p className="mt-1 text-sm text-slate-400">Campaign performance and ROI tracking</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition">
            {showForm ? 'Cancel' : '+ New Campaign'}
          </button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>}

        {loading ? (
          <div className="text-center text-slate-500 py-12">Loading marketing data...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                <div className="text-xs uppercase tracking-wider text-slate-400">Total Spend</div>
                <div className="mt-2 text-2xl font-semibold text-white">${summary.totalSpend.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                <div className="text-xs uppercase tracking-wider text-emerald-400">ROI</div>
                <div className="mt-2 text-2xl font-semibold text-emerald-400">{summary.roi}x</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                <div className="text-xs uppercase tracking-wider text-slate-400">Impressions</div>
                <div className="mt-2 text-2xl font-semibold text-white">{summary.impressions.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                <div className="text-xs uppercase tracking-wider text-slate-400">Conversions</div>
                <div className="mt-2 text-2xl font-semibold text-white">{summary.conversions}</div>
              </div>
            </div>

            {showForm && (
              <form onSubmit={handleCreate} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
                <div className="text-sm font-medium text-slate-200">New Campaign</div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Name</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Channel</label>
                    <select value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })} required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500">
                      <option value="">Select...</option>
                      <option value="Email">Email</option>
                      <option value="Instagram">Instagram</option>
                      <option value="SMS">SMS</option>
                      <option value="Google">Google</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Budget</label>
                    <input type="number" step="0.01" value={form.spend} onChange={e => setForm({ ...form, spend: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Status</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500">
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 px-4 py-2 text-sm font-medium text-white transition">
                  {saving ? 'Saving...' : 'Create Campaign'}
                </button>
              </form>
            )}

            <div className="rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="border-b border-slate-800 px-5 py-4">
                <div className="text-sm font-medium text-slate-200">Campaigns ({campaigns.length})</div>
              </div>
              {campaigns.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No campaigns yet. Create your first campaign above.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                        <th className="px-5 py-3">Campaign</th>
                        <th className="px-5 py-3">Channel</th>
                        <th className="px-5 py-3">Spend</th>
                        <th className="px-5 py-3">Conversions</th>
                        <th className="px-5 py-3">ROI</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((c) => (
                        <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="px-5 py-3 text-slate-300">{c.name}</td>
                          <td className="px-5 py-3 text-slate-400">
                            <span className="mr-1">{channelIcons[c.channel] ?? '📢'}</span>
                            {c.channel}
                          </td>
                          <td className="px-5 py-3 text-slate-300">${(c.spend || 0).toLocaleString()}</td>
                          <td className="px-5 py-3 text-slate-300">{c.conversions || 0}</td>
                          <td className="px-5 py-3">
                            <span className={(c.roi || 0) >= 4 ? 'text-emerald-400' : (c.roi || 0) >= 3 ? 'text-blue-400' : 'text-amber-400'}>
                              {c.roi || 0}x
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[c.status] ?? 'bg-slate-700 text-slate-300'}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <button onClick={() => handleDelete(c.id)} className="text-rose-400 hover:text-rose-300 text-xs font-medium">Delete</button>
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
