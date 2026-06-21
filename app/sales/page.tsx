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
    { label: 'Revenue', value: `$${summary.revenue.toLocaleString()}`, accent: 'text-success' },
    { label: 'Orders', value: String(summary.orders), accent: 'text-accent' },
    { label: 'Avg Ticket', value: `$${summary.avgTicket.toFixed(2)}`, accent: 'text-info' },
    { label: 'Tax Collected', value: `$${summary.tax.toFixed(2)}`, accent: 'text-mid' },
    { label: 'Tips', value: `$${summary.tips.toFixed(2)}`, accent: 'text-warning' },
  ];

  return (
    <DashboardShell active="Sales">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-hi">Sales</h1>
            <p className="text-xs text-lo mt-0.5">Revenue, orders, and channel breakdown</p>
          </div>
          <div className="flex gap-1.5">
            {(['today', 'week', 'month'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                  period === p ? 'bg-accent text-white' : 'bg-raised text-mid hover:text-hi border border-edge'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-danger/5 border border-danger/20 rounded-lg px-4 py-3 text-sm text-danger">{error}</div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-surface border border-rim animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Metric cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {metrics.map((m) => (
                <div key={m.label} className="bg-surface border border-rim rounded-lg p-5">
                  <div className="text-xs font-medium text-lo uppercase tracking-wider">{m.label}</div>
                  <div className={`mt-2 text-xl font-semibold ${m.accent}`}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Channel breakdown */}
            {channels.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {channels.map((ch) => (
                  <div key={ch.channel} className="bg-surface border border-rim rounded-lg p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-hi">{ch.channel}</span>
                      <span className="text-xs text-lo">{ch.pct}%</span>
                    </div>
                    <div className="text-xl font-semibold text-hi">${ch.revenue.toLocaleString()}</div>
                    <div className="mt-3 h-1.5 rounded-full bg-raised overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${Math.min(ch.pct, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Orders table */}
            <div className="bg-surface border border-rim rounded-lg overflow-hidden">
              <div className="border-b border-rim px-5 py-3.5 flex items-center justify-between">
                <span className="text-sm font-medium text-hi">Recent Orders</span>
                <span className="text-xs text-lo">{recentOrders.length} orders</span>
              </div>
              {recentOrders.length === 0 ? (
                <EmptyState title="No orders found" description="No orders match the selected period." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-rim text-xs uppercase tracking-wider text-lo">
                        <th className="text-left px-5 py-3">Order</th>
                        <th className="text-left px-5 py-3">Channel</th>
                        <th className="text-left px-5 py-3">Total</th>
                        <th className="text-left px-5 py-3">Status</th>
                        <th className="text-left px-5 py-3">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((o) => (
                        <tr key={o.id} className="border-b border-rim/50 hover:bg-raised/40 transition-colors">
                          <td className="px-5 py-3 font-mono text-sm text-mid">{o.orderNumber || o.id}</td>
                          <td className="px-5 py-3 text-mid">{o.channel || '—'}</td>
                          <td className="px-5 py-3 text-success font-medium">${(o.total || 0).toFixed(2)}</td>
                          <td className="px-5 py-3">
                            <Badge variant={statusVariant[o.status] ?? 'neutral'}>{o.status}</Badge>
                          </td>
                          <td className="px-5 py-3 text-lo text-xs">
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
