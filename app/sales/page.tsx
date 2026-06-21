'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
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

const statusVariant: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'neutral'> = {
  COMPLETED: 'success',
  PREPARING: 'warning',
  PENDING: 'neutral',
  IN_TRANSIT: 'info',
  CANCELLED: 'danger',
};

export default function SalesPage() {
  const [summary, setSummary] = useState<SalesSummary>({ revenue: 0, orders: 0, avgTicket: 0, tax: 0, tips: 0 });
  const [channels, setChannels] = useState<ChannelBreakdown[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const orgId = getOrgId();

  const load = async () => {
    setLoading(true);
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

  useEffect(() => {
    load();
  }, [period]);

  const metrics = [
    { label: 'Revenue', value: `$${summary.revenue.toLocaleString()}`, accent: 'text-emerald-500' },
    { label: 'Orders', value: String(summary.orders), accent: 'text-indigo-500' },
    { label: 'Avg Ticket', value: `$${summary.avgTicket.toFixed(2)}`, accent: 'text-blue-500' },
    { label: 'Tax Collected', value: `$${summary.tax.toFixed(2)}`, accent: 'text-[#a0a0b8]' },
    { label: 'Tips', value: `$${summary.tips.toFixed(2)}`, accent: 'text-amber-500' },
  ];

  return (
    <DashboardShell active="Sales">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[#f0f0f5]">Sales</h1>
            <p className="text-xs text-[#6a6a80] mt-0.5">Revenue, orders, and channel breakdown</p>
          </div>
          <div className="flex gap-1.5">
            {(['today', 'week', 'month'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                  period === p ? 'bg-indigo-500 text-white' : 'bg-[#22222f] text-[#a0a0b8] hover:text-[#f0f0f5] border border-[#3a3a4f]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-danger/5 border border-danger/20 rounded-lg px-4 py-3 text-sm text-red-500">{error}</div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-[#12121a] border border-[#2a2a3a] animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Metric cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {metrics.map((m) => (
                <div key={m.label} className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-5">
                  <div className="text-xs font-medium text-[#6a6a80] uppercase tracking-wider">{m.label}</div>
                  <div className={`mt-2 text-xl font-semibold ${m.accent}`}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Channel breakdown */}
            {channels.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {channels.map((ch) => (
                  <div key={ch.channel} className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#f0f0f5]">{ch.channel}</span>
                      <span className="text-xs text-[#6a6a80]">{ch.pct}%</span>
                    </div>
                    <div className="text-xl font-semibold text-[#f0f0f5]">${ch.revenue.toLocaleString()}</div>
                    <div className="mt-3 h-1.5 rounded-full bg-[#22222f] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${Math.min(ch.pct, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Orders table */}
            <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg overflow-hidden">
              <div className="border-b border-[#2a2a3a] px-5 py-3.5 flex items-center justify-between">
                <span className="text-sm font-medium text-[#f0f0f5]">Recent Orders</span>
                <span className="text-xs text-[#6a6a80]">{recentOrders.length} orders</span>
              </div>
              {recentOrders.length === 0 ? (
                <EmptyState title="No orders found" description="No orders match the selected period." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#2a2a3a] text-xs uppercase tracking-wider text-[#6a6a80]">
                        <th className="text-left px-5 py-3">Order</th>
                        <th className="text-left px-5 py-3">Channel</th>
                        <th className="text-left px-5 py-3">Total</th>
                        <th className="text-left px-5 py-3">Status</th>
                        <th className="text-left px-5 py-3">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((o) => (
                        <tr key={o.id} className="border-b border-[#2a2a3a]/50 hover:bg-[#22222f]/40 transition-colors">
                          <td className="px-5 py-3 font-mono text-sm text-[#a0a0b8]">{o.orderNumber || o.id}</td>
                          <td className="px-5 py-3 text-[#a0a0b8]">{o.channel || '—'}</td>
                          <td className="px-5 py-3 text-emerald-500 font-medium">${(o.total || 0).toFixed(2)}</td>
                          <td className="px-5 py-3">
                            <Badge variant={statusVariant[o.status] ?? 'neutral'}>{o.status}</Badge>
                          </td>
                          <td className="px-5 py-3 text-[#6a6a80] text-xs">
                            {o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}
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
