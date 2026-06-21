'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cost: number | null;
  isActive: boolean;
  category: { name: string };
}

interface Category {
  id: string;
  name: string;
  _count: { items: number };
}

const API = 'http://localhost:4000/api/v1';

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', cost: '', categoryId: '' });

  const load = () => {
    fetch(`${API}/menu`).then(r => r.json()).then(data => {
      const allItems: MenuItem[] = [];
      const allCats: Category[] = [];
      for (const cat of data.categories || []) {
        allCats.push({ id: cat.id, name: cat.name, _count: { items: cat.items?.length || 0 } });
        for (const item of cat.items || []) {
          allItems.push({ ...item, category: { name: cat.name } });
        }
      }
      setItems(allItems);
      setCategories(allCats);
    }).catch(() => {
      setItems([
        { id: '1', name: 'Classic Burger', description: 'Angus beef patty', price: 12.99, cost: 4.50, isActive: true, category: { name: 'Mains' } },
        { id: '2', name: 'Caesar Salad', description: 'Romaine, parmesan', price: 9.99, cost: 3.00, isActive: true, category: { name: 'Starters' } },
        { id: '3', name: 'Margherita Pizza', description: 'Fresh basil', price: 14.99, cost: 5.00, isActive: true, category: { name: 'Mains' } },
      ]);
      setCategories([
        { id: 'c1', name: 'Starters', _count: { items: 1 } },
        { id: 'c2', name: 'Mains', _count: { items: 2 } },
      ]);
    });
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = { ...form, price: parseFloat(form.price), cost: form.cost ? parseFloat(form.cost) : null };
    if (editing) {
      await fetch(`${API}/menu/items/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } else {
      await fetch(`${API}/menu/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', description: '', price: '', cost: '', categoryId: '' });
    load();
  };

  const edit = (item: MenuItem) => {
    setEditing(item);
    setForm({ name: item.name, description: item.description || '', price: String(item.price), cost: item.cost ? String(item.cost) : '', categoryId: '' });
    setShowForm(true);
  };

  return (
    <DashboardShell active="Menu">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">📋 Menu Management</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', description: '', price: '', cost: '', categoryId: '' }); }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-bold transition">
          + Add Item
        </button>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="font-bold">{cat.name}</div>
            <div className="text-sm text-slate-500">{cat._count.items} items</div>
          </div>
        ))}
      </div>

      {/* Items Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500">
              <th className="text-left p-3">Item</th>
              <th className="text-left p-3">Category</th>
              <th className="text-right p-3">Price</th>
              <th className="text-right p-3">Cost</th>
              <th className="text-center p-3">Status</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="p-3">
                  <div className="font-medium">{item.name}</div>
                  {item.description && <div className="text-xs text-slate-500">{item.description}</div>}
                </td>
                <td className="p-3 text-slate-400">{item.category.name}</td>
                <td className="p-3 text-right text-emerald-500 font-medium">${item.price.toFixed(2)}</td>
                <td className="p-3 text-right text-slate-400">{item.cost ? `$${item.cost.toFixed(2)}` : '-'}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs ${item.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => edit(item)} className="text-blue-400 hover:text-blue-300 text-xs mr-3">Edit</button>
                </td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Item' : 'New Menu Item'}</h2>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Item name"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
              <div className="flex gap-3">
                <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Price" type="number" step="0.01"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
                <input value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} placeholder="Cost" type="number" step="0.01"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
              </div>
              <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={save} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold text-sm transition">Save</button>
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
