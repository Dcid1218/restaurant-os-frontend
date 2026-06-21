'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Avatar from '@/components/Avatar';
import EmptyState from '@/components/EmptyState';
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

const tagVariant: Record<string, 'warning' | 'info' | 'neutral' | 'danger' | 'success'> = {
  VIP: 'warning',
  'Wine Lover': 'info',
  Regular: 'neutral',
  'Birthday Club': 'danger',
  Events: 'info',
};

const inputCls =
  'w-full bg-di border border-dedge rounded-lg px-3 py-2 text-sm text-dhi placeholder-dlo focus:outline-none focus:border-indigo-500 transition-colors';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', tags: '' });
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
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

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/customers', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
          organizationId: orgId,
        }),
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

  const filtered = customers.filter((c) =>
    `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const totalCustomers = customers.length;
  const totalValue = customers.reduce((s, c) => s + (c.lifetimeValue || 0), 0);
  const avgValue = totalCustomers > 0 ? Math.round(totalValue / totalCustomers) : 0;
  const vipCount = customers.filter((c) => c.tags?.includes('VIP')).length;

  return (
    <DashboardShell active="Customers">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-dhi">Customers</h1>
            <p className="text-xs text-dlo mt-0.5">CRM, segments, and lifetime value tracking</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'secondary' : 'primary'}>
            {showForm ? 'Cancel' : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Customer
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="bg-danger/5 border border-danger/20 rounded-lg px-4 py-3 text-sm text-red-500">{error}</div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="bg-ds border border-drim rounded-lg p-5">
            <div className="text-xs font-medium text-dlo uppercase tracking-wider">Total Customers</div>
            <div className="mt-2 text-2xl font-semibold text-dhi">{totalCustomers.toLocaleString()}</div>
          </div>
          <div className="bg-ds border border-drim rounded-lg p-5">
            <div className="text-xs font-medium text-dlo uppercase tracking-wider">VIP Members</div>
            <div className="mt-2 text-2xl font-semibold text-amber-500">{vipCount}</div>
          </div>
          <div className="bg-ds border border-drim rounded-lg p-5">
            <div className="text-xs font-medium text-dlo uppercase tracking-wider">Total Lifetime Value</div>
            <div className="mt-2 text-2xl font-semibold text-emerald-500">${totalValue.toLocaleString()}</div>
          </div>
          <div className="bg-ds border border-drim rounded-lg p-5">
            <div className="text-xs font-medium text-dlo uppercase tracking-wider">Avg Lifetime Value</div>
            <div className="mt-2 text-2xl font-semibold text-dhi">${avgValue}</div>
          </div>
        </div>

        {/* Add form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-ds border border-drim rounded-lg p-5 space-y-4">
            <div className="text-sm font-medium text-dhi">New Customer</div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { key: 'firstName', label: 'First Name', required: true },
                { key: 'lastName', label: 'Last Name', required: true },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'phone', label: 'Phone' },
                { key: 'tags', label: 'Tags (comma-separated)', placeholder: 'VIP, Regular' },
              ].map(({ key, label, ...rest }) => (
                <div key={key}>
                  <label className="block text-xs text-dmid mb-1.5">{label}</label>
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className={inputCls}
                    {...rest}
                  />
                </div>
              ))}
            </div>
            <Button type="submit" loading={saving}>
              Save Customer
            </Button>
          </form>
        )}

        {/* Table */}
        <div className="bg-ds border border-drim rounded-lg overflow-hidden">
          <div className="border-b border-drim px-5 py-3.5 flex items-center justify-between">
            <span className="text-sm font-medium text-dhi">All Customers ({filtered.length})</span>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dlo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
              </svg>
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search..."
                className="bg-di border border-dedge rounded-lg pl-8 pr-3 py-1.5 text-xs text-dhi placeholder-dlo focus:outline-none focus:border-indigo-500 w-44 transition-colors"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-dlo text-sm">Loading customers...</div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No customers found" description="Add your first customer or try a different search." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-drim text-xs uppercase tracking-wider text-dlo">
                    <th className="text-left px-5 py-3">Name</th>
                    <th className="text-left px-5 py-3">Email</th>
                    <th className="text-left px-5 py-3">Phone</th>
                    <th className="text-left px-5 py-3">Lifetime Value</th>
                    <th className="text-left px-5 py-3">Tags</th>
                    <th className="text-left px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((c) => (
                    <tr key={c.id} className="border-b border-drim/50 hover:bg-dr/40 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={`${c.firstName} ${c.lastName}`} size="sm" />
                          <span className="text-dmid font-medium">{c.firstName} {c.lastName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-dlo">{c.email || '—'}</td>
                      <td className="px-5 py-3 text-dlo">{c.phone || '—'}</td>
                      <td className="px-5 py-3 text-emerald-500 font-medium">
                        ${(c.lifetimeValue || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {(c.tags || []).map((tag: string) => (
                            <Badge key={tag} variant={tagVariant[tag] ?? 'neutral'}>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-xs text-dlo hover:text-red-500 transition-colors font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-drim px-5 py-3">
                  <span className="text-xs text-dlo">
                    {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of{' '}
                    {filtered.length}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage <= 1}
                      className="px-3 py-1.5 rounded-md text-xs bg-dr text-dmid hover:text-dhi border border-dedge disabled:opacity-40 transition-colors"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage >= totalPages}
                      className="px-3 py-1.5 rounded-md text-xs bg-dr text-dmid hover:text-dhi border border-dedge disabled:opacity-40 transition-colors"
                    >
                      Next →
                    </button>
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
