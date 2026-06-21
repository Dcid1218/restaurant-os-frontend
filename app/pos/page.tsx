'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { apiFetch, getOrgId } from '@/lib/api';

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

const categoryColors = ['bg-indigo-500/10 text-indigo-500', 'bg-emerald-500/10 text-emerald-500', 'bg-amber-500/10 text-amber-500', 'bg-blue-500/10 text-blue-500', 'bg-red-500/10 text-red-500'];

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
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1, notes: '' }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) =>
      prev.map((c) => c.id === id ? { ...c, quantity: c.quantity - 1 } : c).filter((c) => c.quantity > 0)
    );
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
          items: cart.map((c) => ({ menuItemId: c.id, quantity: c.quantity, notes: c.notes || undefined })),
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

  const filtered = activeCategory === 'all' ? menuItems : menuItems.filter((i) => i.category.name === activeCategory);

  return (
    <DashboardShell active="POS">
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-7rem)]">
        {/* Menu panel */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h1 className="text-lg font-semibold text-white">Point of Sale</h1>
            <div className="flex gap-1.5">
              {['DINE_IN', 'TAKEOUT', 'DELIVERY'].map((t) => (
                <button
                  key={t}
                  onClick={() => setOrderType(t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 ${
                    orderType === t
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-700 text-slate-400 hover:text-white border border-slate-600'
                  }`}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors duration-150 ${
                  activeCategory === c
                    ? 'bg-slate-900 text-white border border-slate-600'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Product grid */}
          {loading ? (
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-24 rounded-lg bg-slate-900 border border-slate-700 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto flex-1 content-start">
              {filtered.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-left hover:border-slate-600 hover:bg-slate-700 transition-all duration-150 group"
                >
                  {/* Color placeholder for image */}
                  <div className={`w-full h-2 rounded-full mb-3 ${categoryColors[idx % categoryColors.length].split(' ')[0]}`} />
                  <div className="text-xs text-slate-500 mb-1">{item.category.name}</div>
                  <div className="text-sm font-medium text-white group-hover:text-indigo-500 transition-colors">
                    {item.name}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold text-emerald-500">${item.price.toFixed(2)}</span>
                    <span className="text-xs text-slate-500 bg-slate-700 rounded px-1.5 py-0.5 group-hover:bg-indigo-500/10 group-hover:text-indigo-500 transition-colors">
                      + Add
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart panel */}
        <div className="w-full lg:w-80 bg-slate-900 border border-slate-700 rounded-lg flex flex-col max-h-[50vh] lg:max-h-none">
          {/* Cart header */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white">Current Order</h2>
              <input
                value={tableLabel}
                onChange={(e) => setTableLabel(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded-md px-2 py-1 text-xs text-white w-24 text-center focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-700 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                </div>
                <p className="text-xs text-slate-500">Add items to get started</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-slate-700 rounded-lg px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">{item.name}</div>
                    <div className="text-xs text-emerald-500">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-6 h-6 rounded bg-slate-900 hover:bg-red-500/10 hover:text-red-500 text-slate-400 text-sm flex items-center justify-center transition-colors"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-xs font-semibold text-white">{item.quantity}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-6 h-6 rounded bg-slate-900 hover:bg-emerald-500/10 hover:text-emerald-500 text-slate-400 text-sm flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals + Pay */}
          <div className="p-4 border-t border-slate-700 space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Tax ({(TAX_RATE * 100).toFixed(2)}%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-white pt-1.5 border-t border-slate-700">
                <span>Total</span>
                <span className="text-emerald-500">${total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={submitOrder}
              disabled={cart.length === 0}
              className="w-full py-2.5 rounded-md text-sm font-semibold bg-indigo-500 hover:bg-indigo-500-light disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors duration-150"
            >
              Send to Kitchen
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
