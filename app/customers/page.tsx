'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { apiFetch, getOrgId } from '@/lib/api';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  lifetimeValue: number;
  tags: string[];
  createdAt: string;
  orderCount?: number;
}

const tagColors: Record<string, string> = {
  VIP: 'bg-amber-500/10 text-amber-400',
  'Wine Lover': 'bg-purple-500/10 text-purple-400',
  Regular: 'bg-slate-700/50 text-slate-400',
  'Birthday Club': 'bg-pink-500/10 text-pink-400',
  Events: 'bg-blue-500/10 text-blue-400',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', tags: '' });
  const [saving, setSaving] = useState(false);

  const orgId = getOrgId();

  const load = async () => {
    try {
      const data = await apiFetch(`/customers?organizationId=${orgId || ''}`);
      setCustomers(Array.isArray(data) ? data : data.customers || data.data || []);
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
      await apiFetch('/customers', {
        method: 'POST',
        body: JSON.stringify({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), organizationId: orgId }),
      });
      setForm({ firstName: '', lastName: '', email: '', phone: '', tags: '' });
      setShowForm(false);
      await load();
    } catch (err: any) {
      alert(err.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await apiFetch(`/customers/${id}`, { method: 'DELETE' });
      await load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = customers.filter(c =>
    `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const totalCustomers = customers.length;
  const totalValue = customers.reduce((s, c) => s + (c.lifetimeValue || 0), 0);
  const avgValue = totalCustomers > 0 ? Math.round(totalValue / totalCustomers) : 0;
  const vipCount = customers.filter(c => c.tags?.includes('VIP')).length;

  return (
    <DashboardShell active="Customers">
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Customers</h1>
            <p className="mt-1 text-sm text-slate-400">CRM, segments, and lifetime value tracking</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition">
            {showForm ? 'Cancel' : '+ Add Customer'}
          </button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="text-xs uppercase tracking-wider text-slate-400">Total Customers</div>
            <div className="mt-2 text-2xl font-semibold text-white">{totalCustomers.toLocaleString()}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="text-xs uppercase tracking-wider text-slate-400">VIP Members</div>
            <div className="mt-2 text-2xl font-semibold text-amber-400">{vipCount}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="text-xs uppercase tracking-wider text-slate-400">Total Lifetime Value</div>
            <div className="mt-2 text-2xl font-semibold text-emerald-400">${totalValue.toLocaleString()}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="text-xs uppercase tracking-wider text-slate-400">Avg Lifetime Value</div>
            <div className="mt-2 text-2xl font-semibold text-white">${avgValue}</div>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div className="text-sm font-medium text-slate-200">New Customer</div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">First Name</label>
                <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Last Name</label>
                <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Tags (comma-separated)</label>
                <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="VIP, Regular" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 px-4 py-2 text-sm font-medium text-white transition">
              {saving ? 'Saving...' : 'Save Customer'}
            </button>
          </form>
        )}

        <div className="rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="border-b border-slate-800 px-5 py-4 flex items-center justify-between">
            <div className="text-sm font-medium text-slate-200">All Customers ({filtered.length})</div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-48"
            />
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading customers...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No customers found. Add your first customer above.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Phone</th>
                    <th className="px-5 py-3">Lifetime Value</th>
                    <th className="px-5 py-3">Tags</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((c) => (
                    <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="px-5 py-3 text-slate-300">{c.firstName} {c.lastName}</td>
                      <td className="px-5 py-3 text-slate-400">{c.email || '—'}</td>
                      <td className="px-5 py-3 text-slate-400">{c.phone || '—'}</td>
                      <td className="px-5 py-3 text-emerald-400 font-medium">${(c.lifetimeValue || 0).toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {(c.tags || []).map((tag: string) => (
                            <span key={tag} className={`inline-block rounded-full px-2 py-0.5 text-xs ${tagColors[tag] ?? 'bg-slate-700 text-slate-300'}`}>{tag}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => handleDelete(c.id)} className="text-rose-400 hover:text-rose-300 text-xs font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-800 px-5 py-3">
                  <span className="text-xs text-slate-500">
                    {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage <= 1}
                      className="rounded px-2 py-1 text-xs bg-slate-800 text-slate-400 hover:text-white disabled:opacity-40 transition">← Prev</button>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}
                      className="rounded px-2 py-1 text-xs bg-slate-800 text-slate-400 hover:text-white disabled:opacity-40 transition">Next →</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
