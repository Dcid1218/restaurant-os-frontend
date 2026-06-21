'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';

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
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', cost: '', categoryId: '' });

  const load = () => {
    fetch(`${API}/menu`)
      .then((r) => r.json())
      .then((data) => {
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
      })
      .catch(() => {
        setItems([
          { id: '1', name: 'Classic Burger', description: 'Angus beef patty', price: 12.99, cost: 4.5, isActive: true, category: { name: 'Mains' } },
          { id: '2', name: 'Caesar Salad', description: 'Romaine, parmesan', price: 9.99, cost: 3.0, isActive: true, category: { name: 'Starters' } },
          { id: '3', name: 'Margherita Pizza', description: 'Fresh basil', price: 14.99, cost: 5.0, isActive: true, category: { name: 'Mains' } },
          { id: '4', name: 'Chocolate Cake', description: 'Rich chocolate lava', price: 7.99, cost: 2.5, isActive: false, category: { name: 'Desserts' } },
        ]);
        setCategories([
          { id: 'c1', name: 'Starters', _count: { items: 1 } },
          { id: 'c2', name: 'Mains', _count: { items: 2 } },
          { id: 'c3', name: 'Desserts', _count: { items: 1 } },
        ]);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    const payload = {
      ...form,
      price: parseFloat(form.price),
      cost: form.cost ? parseFloat(form.cost) : null,
    };
    if (editing) {
      await fetch(`${API}/menu/items/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(`${API}/menu/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', description: '', price: '', cost: '', categoryId: '' });
    load();
  };

  const edit = (item: MenuItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      cost: item.cost ? String(item.cost) : '',
      categoryId: '',
    });
    setShowForm(true);
  };

  const filtered = activeCategory === 'all' ? items : items.filter((i) => i.category.name === activeCategory);

  const inputCls = 'w-full bg-[#1a1a26] border border-[#3a3a4f] rounded-lg px-3 py-2 text-sm text-[#f0f0f5] placeholder-lo focus:outline-none focus:border-indigo-500 transition-colors';

  return (
    <DashboardShell active="Menu">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[#f0f0f5]">Menu Management</h1>
            <p className="text-xs text-[#6a6a80] mt-0.5">{items.length} items across {categories.length} categories</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditing(null);
              setForm({ name: '', description: '', price: '', cost: '', categoryId: '' });
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Item
          </Button>
        </div>

        {/* Category summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.name ? 'all' : cat.name)}
              className={`bg-[#12121a] border rounded-lg p-3 text-left transition-colors ${
                activeCategory === cat.name ? 'border-accent bg-indigo-500/5' : 'border-[#2a2a3a] hover:border-[#3a3a4f]'
              }`}
            >
              <div className="text-sm font-medium text-[#f0f0f5]">{cat.name}</div>
              <div className="text-xs text-[#6a6a80] mt-0.5">{cat._count.items} items</div>
            </button>
          ))}
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeCategory === 'all' ? 'bg-indigo-500 text-white' : 'bg-[#22222f] text-[#a0a0b8] hover:text-[#f0f0f5] border border-[#3a3a4f]'
            }`}
          >
            All ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeCategory === cat.name
                  ? 'bg-indigo-500 text-white'
                  : 'bg-[#22222f] text-[#a0a0b8] hover:text-[#f0f0f5] border border-[#3a3a4f]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Items table */}
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg overflow-hidden">
          <div className="border-b border-[#2a2a3a] px-5 py-3.5 flex items-center justify-between">
            <span className="text-sm font-medium text-[#f0f0f5]">Items</span>
            <span className="text-xs text-[#6a6a80]">{filtered.length} results</span>
          </div>
          {filtered.length === 0 ? (
            <EmptyState title="No items found" description="Try selecting a different category or add your first item." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a2a3a] text-xs uppercase tracking-wider text-[#6a6a80]">
                    <th className="text-left px-5 py-3">Item</th>
                    <th className="text-left px-5 py-3">Category</th>
                    <th className="text-right px-5 py-3">Price</th>
                    <th className="text-right px-5 py-3">Cost</th>
                    <th className="text-center px-5 py-3">Status</th>
                    <th className="text-right px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-b border-[#2a2a3a]/50 hover:bg-[#22222f]/40 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="font-medium text-[#f0f0f5]">{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-[#6a6a80]">{item.description}</div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant="neutral">{item.category.name}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right text-emerald-500 font-medium">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-right text-[#6a6a80]">
                        {item.cost ? `$${item.cost.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <Badge variant={item.isActive ? 'success' : 'danger'}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => edit(item)}
                          className="text-xs text-[#6a6a80] hover:text-indigo-500 transition-colors font-medium opacity-0 group-hover:opacity-100"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-[#12121a] border border-[#3a3a4f] rounded-xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-[#f0f0f5]">{editing ? 'Edit Item' : 'New Menu Item'}</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-[#6a6a80] hover:text-[#f0f0f5] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#a0a0b8] mb-1.5">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Item name"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs text-[#a0a0b8] mb-1.5">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description"
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#a0a0b8] mb-1.5">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#a0a0b8] mb-1.5">Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    placeholder="0.00"
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#a0a0b8] mb-1.5">Category</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <Button onClick={save} className="flex-1">
                Save
              </Button>
              <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
