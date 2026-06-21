'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { apiFetch, getOrgId, getStoredToken } from '@/lib/api';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  category: { name: string };
}

interface CartItem extends MenuItem {
  quantity: number;
  notes: string;
}

const TAX_RATE = parseFloat(process.env.NEXT_PUBLIC_TAX_RATE ?? '0.0825');

export default function POSPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableLabel, setTableLabel] = useState('Table 1');
  const [orderType, setOrderType] = useState('DINE_IN');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/menu')
      .then((data: any) => {
        const items: MenuItem[] = [];
        const cats = new Set<string>();
        for (const cat of data.categories || []) {
          cats.add(cat.name);
          for (const item of cat.items || []) {
            items.push({ ...item, category: { name: cat.name } });
          }
        }
        setMenuItems(items);
        setCategories(['all', ...Array.from(cats)]);
      })
      .catch(() => {
        // Fallback demo data
        setMenuItems([
          { id: '1', name: 'Classic Burger', price: 12.99, categoryId: '1', category: { name: 'Mains' } },
          { id: '2', name: 'Caesar Salad', price: 9.99, categoryId: '2', category: { name: 'Starters' } },
          { id: '3', name: 'Margherita Pizza', price: 14.99, categoryId: '1', category: { name: 'Mains' } },
          { id: '4', name: 'Fish & Chips', price: 15.99, categoryId: '1', category: { name: 'Mains' } },
          { id: '5', name: 'Chocolate Cake', price: 7.99, categoryId: '3', category: { name: 'Desserts' } },
          { id: '6', name: 'Iced Tea', price: 3.99, categoryId: '4', category: { name: 'Drinks' } },
          { id: '7', name: 'Buffalo Wings', price: 11.99, categoryId: '2', category: { name: 'Starters' } },
          { id: '8', name: 'Steak Frites', price: 24.99, categoryId: '1', category: { name: 'Mains' } },
        ]);
        setCategories(['all', 'Starters', 'Mains', 'Desserts', 'Drinks']);
      })
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1, notes: '' }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: c.quantity - 1 } : c).filter(c => c.quantity > 0));
  };

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const submitOrder = async () => {
    if (cart.length === 0) return;
    const orgId = getOrgId();
    if (!orgId) {
      alert('Authentication required. Please log in to place orders.');
      return;
    }
    try {
      const order = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          organizationId: orgId,
          type: orderType,
          tableLabel: tableLabel || undefined,
          items: cart.map(c => ({ menuItemId: c.id, quantity: c.quantity, notes: c.notes || undefined })),
        }),
      });
      if (order.id) {
        await apiFetch(`/orders/${order.id}/fire`, { method: 'POST' });
        setCart([]);
        alert(`Order ${order.orderNumber} sent to kitchen!`);
      } else {
        alert(`Order failed: ${order.message ?? 'Unknown error'}`);
      }
    } catch {
      alert('Failed to submit order. Check your connection and try again.');
    }
  };

  const filtered = activeCategory === 'all' ? menuItems : menuItems.filter(i => i.category.name === activeCategory);

  return (
    <DashboardShell active="POS">
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-7rem)]">
        {/* Menu Grid */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h1 className="text-xl font-bold">Point of Sale</h1>
            <div className="flex gap-2">
              {['DINE_IN', 'TAKEOUT', 'DELIVERY'].map(t => (
                <button key={t} onClick={() => setOrderType(t)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition ${orderType === t ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mb-4 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className={`px-3 py-1.5 rounded text-sm capitalize transition ${activeCategory === c ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">Loading menu...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto flex-1">
              {filtered.map(item => (
                <button key={item.id} onClick={() => addToCart(item)}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-left hover:border-emerald-500 hover:bg-slate-800 transition group">
                  <div className="text-sm text-slate-500 mb-1">{item.category.name}</div>
                  <div className="font-semibold text-slate-200 group-hover:text-emerald-400 transition">{item.name}</div>
                  <div className="text-emerald-500 font-bold mt-2">${item.price.toFixed(2)}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="w-full lg:w-96 bg-slate-900 border border-slate-800 rounded-lg flex flex-col max-h-[50vh] lg:max-h-none">
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Current Order</h2>
              <input value={tableLabel} onChange={e => setTableLabel(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm w-28 text-center" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {cart.length === 0 && <div className="text-slate-600 text-sm text-center mt-8">Tap items to add</div>}
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-emerald-500 text-sm">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded bg-slate-700 hover:bg-red-600 text-sm transition">-</button>
                  <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                  <button onClick={() => addToCart(item)} className="w-7 h-7 rounded bg-slate-700 hover:bg-emerald-600 text-sm transition">+</button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-800 space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>Tax</span><span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span><span className="text-emerald-500">${total.toFixed(2)}</span>
            </div>
            <button onClick={submitOrder} disabled={cart.length === 0}
              className="w-full py-3 rounded-lg font-bold text-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 transition">
              Send to Kitchen
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
