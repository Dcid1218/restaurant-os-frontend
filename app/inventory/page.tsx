'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { apiFetch, getOrgId } from '@/lib/api';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  onHand: number;
  unit: string;
  reorderPoint: number;
  cost: number;
  supplier?: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', onHand: '', unit: '', reorderPoint: '', cost: '', supplier: '' });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  const orgId = getOrgId();

  const load = async () => {
    try {
      const data = await apiFetch(`/inventory?organizationId=${orgId || ''}`);
      setItems(Array.isArray(data) ? data : data.items || data.data || []);
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
      await apiFetch('/inventory', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          onHand: parseFloat(form.onHand) || 0,
          reorderPoint: parseFloat(form.reorderPoint) || 0,
          cost: parseFloat(form.cost) || 0,
          organizationId: orgId,
        }),
      });
      setForm({ name: '', category: '', onHand: '', unit: '', reorderPoint: '', cost: '', supplier: '' });
      setShowForm(false);
      await load();
    } catch (err: any) {
      alert(err.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await apiFetch(`/inventory/${id}`, { method: 'DELETE' });
      await load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const lowStock = items.filter(i => i.onHand <= i.reorderPoint);
  const outOfStock = items.filter(i => i.onHand <= 0);
  const totalValue = items.reduce((s, i) => s + (i.cost || 0) * (i.onHand || 0), 0);
  const categories = [...new Set(items.map(i => i.category))];

  const filtered = filter === 'all' ? items : filter === 'low' ? lowStock : filter === 'out' ? outOfStock : items.filter(i => i.category === filter);

  // Pagination
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <DashboardShell active="Inventory">
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Inventory</h1>
            <p className="mt-1 text-sm text-slate-400">Stock levels, categories, and reorder alerts</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition">
            {showForm ? 'Cancel' : '+ Add Item'}
          </button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="text-xs uppercase tracking-wider text-slate-400">Total Items</div>
            <div className="mt-2 text-2xl font-semibold text-white">{items.length}</div>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
            <div className="text-xs uppercase tracking-wider text-amber-400">Low Stock</div>
            <div className="mt-2 text-2xl font-semibold text-amber-400">{lowStock.length}</div>
          </div>
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
            <div className="text-xs uppercase tracking-wider text-rose-400">Out of Stock</div>
            <div className="mt-2 text-2xl font-semibold text-rose-400">{outOfStock.length}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="text-xs uppercase tracking-wider text-slate-400">Total Value</div>
            <div className="mt-2 text-2xl font-semibold text-white">${totalValue.toLocaleString()}</div>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div className="text-sm font-medium text-slate-200">New Inventory Item</div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Category</label>
                <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">On Hand</label>
                <input type="number" step="0.01" value={form.onHand} onChange={e => setForm({ ...form, onHand: e.target.value })} required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Unit</label>
                <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="lbs, cases, gal" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Reorder Point</label>
                <input type="number" step="0.01" value={form.reorderPoint} onChange={e => setForm({ ...form, reorderPoint: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Cost per Unit</label>
                <input type="number" step="0.01" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Supplier</label>
                <input value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 px-4 py-2 text-sm font-medium text-white transition">
              {saving ? 'Saving...' : 'Save Item'}
            </button>
          </form>
        )}

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('all')} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filter === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            All ({items.length})
          </button>
          <button onClick={() => setFilter('low')} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filter === 'low' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-amber-400 hover:text-amber-300'}`}>
            Low Stock ({lowStock.length})
          </button>
          <button onClick={() => setFilter('out')} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filter === 'out' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-rose-400 hover:text-rose-300'}`}>
            Out ({outOfStock.length})
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filter === cat ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="border-b border-slate-800 px-5 py-4">
            <div className="text-sm font-medium text-slate-200">Inventory Items ({filtered.length})</div>
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading inventory...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No items found. Add your first item above.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3">Item</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">On Hand</th>
                    <th className="px-5 py-3">Reorder At</th>
                    <th className="px-5 py-3">Cost/Unit</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((item) => (
                    <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="px-5 py-3 text-slate-300">{item.name}</td>
                      <td className="px-5 py-3 text-slate-400">{item.category}</td>
                      <td className="px-5 py-3">
                        <span className={item.onHand <= 0 ? 'text-rose-400' : item.onHand <= item.reorderPoint ? 'text-amber-400' : 'text-slate-300'}>
                          {item.onHand} {item.unit}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-400">{item.reorderPoint} {item.unit}</td>
                      <td className="px-5 py-3 text-slate-300">${(item.cost || 0).toFixed(2)}</td>
                      <td className="px-5 py-3">
                        {item.onHand <= 0 ? (
                          <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-rose-500/10 text-rose-400">Out</span>
                        ) : item.onHand <= item.reorderPoint ? (
                          <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400">Low</span>
                        ) : (
                          <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400">OK</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => handleDelete(item.id)} className="text-rose-400 hover:text-rose-300 text-xs font-medium">Delete</button>
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
