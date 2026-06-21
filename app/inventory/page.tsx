'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
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

const inputCls =
  'w-full bg-inset border border-edge rounded-lg px-3 py-2 text-sm text-hi placeholder-lo focus:outline-none focus:border-accent transition-colors';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: '',
    onHand: '',
    unit: '',
    reorderPoint: '',
    cost: '',
    supplier: '',
  });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
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

  useEffect(() => {
    load();
  }, []);

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

  const lowStock = items.filter((i) => i.onHand <= i.reorderPoint && i.onHand > 0);
  const outOfStock = items.filter((i) => i.onHand <= 0);
  const totalValue = items.reduce((s, i) => s + (i.cost || 0) * (i.onHand || 0), 0);
  const categories = [...new Set(items.map((i) => i.category))];

  const filtered =
    filter === 'all'
      ? items
      : filter === 'low'
      ? lowStock
      : filter === 'out'
      ? outOfStock
      : items.filter((i) => i.category === filter);

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const stockVariant = (item: InventoryItem): 'danger' | 'warning' | 'success' => {
    if (item.onHand <= 0) return 'danger';
    if (item.onHand <= item.reorderPoint) return 'warning';
    return 'success';
  };

  return (
    <DashboardShell active="Inventory">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-hi">Inventory</h1>
            <p className="text-xs text-lo mt-0.5">Stock levels, categories, and reorder alerts</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'secondary' : 'primary'}>
            {showForm ? 'Cancel' : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Item
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="bg-danger/5 border border-danger/20 rounded-lg px-4 py-3 text-sm text-danger">{error}</div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="bg-surface border border-rim rounded-lg p-5">
            <div className="text-xs font-medium text-lo uppercase tracking-wider">Total Items</div>
            <div className="mt-2 text-2xl font-semibold text-hi">{items.length}</div>
          </div>
          <div className="bg-surface border border-warning/30 rounded-lg p-5 bg-warning/5">
            <div className="text-xs font-medium text-warning uppercase tracking-wider">Low Stock</div>
            <div className="mt-2 text-2xl font-semibold text-warning">{lowStock.length}</div>
          </div>
          <div className="bg-surface border border-danger/30 rounded-lg p-5 bg-danger/5">
            <div className="text-xs font-medium text-danger uppercase tracking-wider">Out of Stock</div>
            <div className="mt-2 text-2xl font-semibold text-danger">{outOfStock.length}</div>
          </div>
          <div className="bg-surface border border-rim rounded-lg p-5">
            <div className="text-xs font-medium text-lo uppercase tracking-wider">Total Value</div>
            <div className="mt-2 text-2xl font-semibold text-hi">${totalValue.toLocaleString()}</div>
          </div>
        </div>

        {/* Add form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-surface border border-rim rounded-lg p-5 space-y-4"
          >
            <div className="text-sm font-medium text-hi">New Inventory Item</div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { key: 'name', label: 'Name', placeholder: 'Tomatoes', required: true },
                { key: 'category', label: 'Category', placeholder: 'Produce', required: true },
                { key: 'onHand', label: 'On Hand', placeholder: '0', type: 'number', required: true },
                { key: 'unit', label: 'Unit', placeholder: 'lbs, cases, gal' },
                { key: 'reorderPoint', label: 'Reorder Point', placeholder: '0', type: 'number' },
                { key: 'cost', label: 'Cost / Unit', placeholder: '0.00', type: 'number', step: '0.01' },
                { key: 'supplier', label: 'Supplier', placeholder: 'Sysco' },
              ].map(({ key, label, ...rest }) => (
                <div key={key}>
                  <label className="block text-xs text-mid mb-1.5">{label}</label>
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
              {saving ? 'Saving...' : 'Save Item'}
            </Button>
          </form>
        )}

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: `All (${items.length})`, active: 'bg-accent text-white' },
            { key: 'low', label: `Low Stock (${lowStock.length})`, active: 'bg-warning text-white' },
            { key: 'out', label: `Out (${outOfStock.length})`, active: 'bg-danger text-white' },
            ...categories.map((cat) => ({ key: cat, label: cat, active: 'bg-info text-white' })),
          ].map(({ key, label, active }) => (
            <button
              key={key}
              onClick={() => { setFilter(key); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === key ? active : 'bg-raised text-mid hover:text-hi border border-edge'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-surface border border-rim rounded-lg overflow-hidden">
          <div className="border-b border-rim px-5 py-3.5 flex items-center justify-between">
            <span className="text-sm font-medium text-hi">Inventory Items</span>
            <span className="text-xs text-lo">{filtered.length} items</span>
          </div>
          {loading ? (
            <div className="p-8 text-center text-lo text-sm">Loading inventory...</div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No items found" description="Add your first inventory item above." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-rim text-xs uppercase tracking-wider text-lo">
                    <th className="text-left px-5 py-3">Item</th>
                    <th className="text-left px-5 py-3">Category</th>
                    <th className="text-left px-5 py-3">On Hand</th>
                    <th className="text-left px-5 py-3">Reorder At</th>
                    <th className="text-left px-5 py-3">Cost/Unit</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-left px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((item) => (
                    <tr key={item.id} className="border-b border-rim/50 hover:bg-raised/40 transition-colors">
                      <td className="px-5 py-3 text-mid font-medium">{item.name}</td>
                      <td className="px-5 py-3 text-lo">{item.category}</td>
                      <td className="px-5 py-3">
                        <span
                          className={
                            item.onHand <= 0
                              ? 'text-danger'
                              : item.onHand <= item.reorderPoint
                              ? 'text-warning'
                              : 'text-mid'
                          }
                        >
                          {item.onHand} {item.unit}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-lo">
                        {item.reorderPoint} {item.unit}
                      </td>
                      <td className="px-5 py-3 text-lo">${(item.cost || 0).toFixed(2)}</td>
                      <td className="px-5 py-3">
                        <Badge variant={stockVariant(item)}>
                          {item.onHand <= 0 ? 'Out' : item.onHand <= item.reorderPoint ? 'Low' : 'OK'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-xs text-lo hover:text-danger transition-colors font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-rim px-5 py-3">
                  <span className="text-xs text-lo">
                    {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of{' '}
                    {filtered.length}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage <= 1}
                      className="px-3 py-1.5 rounded-md text-xs bg-raised text-mid hover:text-hi border border-edge disabled:opacity-40 transition-colors"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage >= totalPages}
                      className="px-3 py-1.5 rounded-md text-xs bg-raised text-mid hover:text-hi border border-edge disabled:opacity-40 transition-colors"
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
