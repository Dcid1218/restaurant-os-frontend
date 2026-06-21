'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { apiFetch, getOrgId } from '@/lib/api';

interface SalesSummary {
  revenue: number;
  orders: number;
  avgTicket: number;
  tax: number;
  tips: number;
}

interface ChannelBreakdown {
  channel: string;
  revenue: number;
  pct: number;
}

interface OrderRow {
  id: string;
  orderNumber: string;
  channel: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function SalesPage() {
  const [summary, setSummary] = useState<SalesSummary>({ revenue: 0, orders: 0, avgTicket: 0, tax: 0, tips: 0 });
  const [channels, setChannels] = useState<ChannelBreakdown[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const orgId = getOrgId();

  const load = async () => {
    try {
      const [summaryRes, ordersRes] = await Promise.all([
        apiFetch(`/sales/summary?period=${period}&organizationId=${orgId || ''}`),
        apiFetch(`/sales/orders?organizationId=${orgId || ''}&limit=20`),
      ]);
      setSummary(summaryRes || { revenue: 0, orders: 0, avgTicket: 0, tax: 0, tips: 0 });
      setChannels(summaryRes?.channels || summaryRes?.byChannel || []);
      const orders = Array.isArray(ordersRes) ? ordersRes : ordersRes.orders || ordersRes.data || [];
      setRecentOrders(orders);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [period]);

  const statusColors: Record<string, string> = {
    COMPLETED: 'bg-emerald-500/10 text-emerald-400',
    PREPARING: 'bg-amber-500/10 text-amber-400',
    PENDING: 'bg-yellow-500/10 text-yellow-400',
    IN_TRANSIT: 'bg-blue-500/10 text-blue-400',
    CANCELLED: 'bg-rose-500/10 text-rose-400',
  };

  return (
    <DashboardShell active="Sales">
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Sales</h1>
            <p className="mt-1 text-sm text-slate-400">Revenue, orders, and channel breakdown</p>
          </div>
          <div className="flex gap-2">
            {(['today', 'week', 'month'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${period === p ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>}

        {loading ? (
          <div className="text-center text-slate-500 py-12">Loading sales data...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                <div className="text-xs uppercase tracking-wider text-slate-400">Revenue</div>
                <div className="mt-2 text-2xl font-semibold text-white">${summary.revenue.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                <div className="text-xs uppercase tracking-wider text-slate-400">Orders</div>
                <div className="mt-2 text-2xl font-semibold text-white">{summary.orders}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                <div className="text-xs uppercase tracking-wider text-slate-400">Avg Ticket</div>
                <div className="mt-2 text-2xl font-semibold text-white">${summary.avgTicket.toFixed(2)}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                <div className="text-xs uppercase tracking-wider text-slate-400">Tax</div>
                <div className="mt-2 text-2xl font-semibold text-white">${summary.tax.toFixed(2)}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                <div className="text-xs uppercase tracking-wider text-slate-400">Tips</div>
                <div className="mt-2 text-2xl font-semibold text-white">${summary.tips.toFixed(2)}</div>
              </div>
            </div>

            {channels.length > 0 && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {channels.map((ch) => (
                  <div key={ch.channel} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-slate-200">{ch.channel}</div>
                      <div className="text-xs text-slate-400">{ch.pct}%</div>
                    </div>
                    <div className="mt-2 text-xl font-semibold text-white">${ch.revenue.toLocaleString()}</div>
                    <div className="mt-3 h-2 rounded-full bg-slate-800">
                      <div className="h-2 rounded-full bg-blue-500" style={{ width: `${ch.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="border-b border-slate-800 px-5 py-4">
                <div className="text-sm font-medium text-slate-200">Recent Orders ({recentOrders.length})</div>
              </div>
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No orders found for this period.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                        <th className="px-5 py-3">Order</th>
                        <th className="px-5 py-3">Channel</th>
                        <th className="px-5 py-3">Total</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((o) => (
                        <tr key={o.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="px-5 py-3 font-mono text-slate-300">{o.orderNumber || o.id}</td>
                          <td className="px-5 py-3 text-slate-300">{o.channel || '—'}</td>
                          <td className="px-5 py-3 text-emerald-400 font-medium">${(o.total || 0).toFixed(2)}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[o.status] ?? 'bg-slate-700 text-slate-300'}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-slate-500">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}</td>
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
