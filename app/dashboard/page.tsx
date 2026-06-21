'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import Badge from '@/components/Badge';

const API = 'http://localhost:4000/api/v1';

function getAuthHeaders(): Record<string, string> {
  try {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

interface DashboardStats {
  ordersToday: number;
  revenueToday: number;
  activeTickets: number;
  tablesOccupied: number;
  tablesTotal: number;
  menuItems: number;
  recentOrders: { id: string; orderNumber: string; status: string; total: number; type: string }[];
  activeKdsTickets: { id: string; ticketNumber: string; status: string; tableLabel: string | null; items: number }[];
}

const ticketStatusMap: Record<string, 'info' | 'warning' | 'success' | 'neutral'> = {
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  READY: 'success',
};

function RefreshIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    ordersToday: 0,
    revenueToday: 0,
    activeTickets: 0,
    tablesOccupied: 0,
    tablesTotal: 0,
    menuItems: 0,
    recentOrders: [],
    activeKdsTickets: [],
  });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [ordersRes, ticketsRes, tablesRes, menuRes] = await Promise.all([
        fetch(`${API}/orders`, { headers: getAuthHeaders() }),
        fetch(`${API}/kds/tickets`, { headers: getAuthHeaders() }),
        fetch(`${API}/tables`, { headers: getAuthHeaders() }),
        fetch(`${API}/menu/items`, { headers: getAuthHeaders() }),
      ]);

      const orders = await ordersRes.json();
      const tickets = await ticketsRes.json();
      const tables = await tablesRes.json();
      const menuItems = await menuRes.json();

      const activeTickets = tickets.filter((t: any) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
      const occupied = tables.filter((t: any) => t.status === 'occupied');

      setStats({
        ordersToday: orders.length,
        revenueToday: orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
        activeTickets: activeTickets.length,
        tablesOccupied: occupied.length,
        tablesTotal: tables.length,
        menuItems: menuItems.length,
        recentOrders: orders.slice(-5).reverse(),
        activeKdsTickets: activeTickets.slice(0, 5),
      });
    } catch {
      // Keep zeros if API unavailable
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const id = setInterval(() => {
      load();
    }, 10000);
    return () => clearInterval(id);
  }, []);

  const metrics = [
    { label: 'Orders Today', value: String(stats.ordersToday), accent: 'indigo' as const },
    { label: 'Revenue', value: `$${stats.revenueToday.toFixed(2)}`, accent: 'green' as const },
    { label: 'Active Tickets', value: String(stats.activeTickets), accent: 'amber' as const },
    { label: 'Tables', value: `${stats.tablesOccupied}/${stats.tablesTotal}`, accent: 'blue' as const },
    { label: 'Menu Items', value: String(stats.menuItems), accent: 'indigo' as const },
  ];

  const accentTextMap: Record<string, string> = {
    indigo: 'text-accent',
    green: 'text-success',
    amber: 'text-warning',
    blue: 'text-info',
    red: 'text-danger',
  };

  return (
    <DashboardShell active="Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-hi">Command Center</h1>
            <p className="mt-0.5 text-sm text-lo">Live overview · Main St. location</p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-xs text-lo hover:text-hi transition-colors px-3 py-1.5 rounded-md hover:bg-raised border border-transparent hover:border-rim"
          >
            <RefreshIcon />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-surface border border-rim animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Metric cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {metrics.map((m) => (
                <div key={m.label} className="relative overflow-hidden rounded-lg border border-rim bg-surface p-5">
                  <div className="text-xs font-medium text-lo uppercase tracking-wider">{m.label}</div>
                  <div className={`mt-2 text-2xl font-semibold tabular-nums ${accentTextMap[m.accent]}`}>
                    {m.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom grid */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Recent Orders */}
              <div className="rounded-lg border border-rim bg-surface overflow-hidden">
                <div className="border-b border-rim px-5 py-3.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-hi">Recent Orders</span>
                  <span className="text-xs text-lo">{stats.recentOrders.length} orders</span>
                </div>
                {stats.recentOrders.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-lo">No orders yet</div>
                ) : (
                  <div className="divide-y divide-rim">
                    {stats.recentOrders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between px-5 py-3 hover:bg-raised/50 transition-colors">
                        <div>
                          <div className="text-sm font-mono text-hi">{o.orderNumber}</div>
                          <div className="text-xs text-lo">{o.type?.replace('_', ' ')}</div>
                        </div>
                        <div className="text-sm text-success font-medium">${o.total.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Kitchen Tickets */}
              <div className="rounded-lg border border-rim bg-surface overflow-hidden">
                <div className="border-b border-rim px-5 py-3.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-hi">Kitchen Tickets</span>
                  <span className="text-xs text-lo">{stats.activeKdsTickets.length} active</span>
                </div>
                {stats.activeKdsTickets.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-lo">No active tickets</div>
                ) : (
                  <div className="divide-y divide-rim">
                    {stats.activeKdsTickets.map((t) => (
                      <div key={t.id} className="flex items-center justify-between px-5 py-3 hover:bg-raised/50 transition-colors">
                        <div>
                          <div className="text-sm font-mono text-hi">{t.ticketNumber}</div>
                          <div className="text-xs text-lo">
                            {t.tableLabel || 'No table'} · {t.items} items
                          </div>
                        </div>
                        <Badge variant={ticketStatusMap[t.status] ?? 'neutral'}>
                          {t.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Alert panel */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="border-l-2 border-warning bg-warning/5 rounded-r-lg px-4 py-3 border border-l-warning border-rim">
                <div className="text-xs font-medium text-warning">Low Inventory Alert</div>
                <div className="text-xs text-lo mt-1">3 items below reorder threshold</div>
              </div>
              <div className="border-l-2 border-info bg-info/5 rounded-r-lg px-4 py-3 border border-l-info border-rim">
                <div className="text-xs font-medium text-info">Kitchen Load</div>
                <div className="text-xs text-lo mt-1">{stats.activeTickets} active ticket{stats.activeTickets !== 1 ? 's' : ''} in queue</div>
              </div>
              <div className="border-l-2 border-success bg-success/5 rounded-r-lg px-4 py-3 border border-l-success border-rim">
                <div className="text-xs font-medium text-success">Floor Status</div>
                <div className="text-xs text-lo mt-1">{stats.tablesOccupied}/{stats.tablesTotal} tables occupied</div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
