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
    indigo: 'text-indigo-500',
    green: 'text-emerald-500',
    amber: 'text-amber-500',
    blue: 'text-blue-500',
    red: 'text-red-500',
  };

  return (
    <DashboardShell active="Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-dhi">Command Center</h1>
            <p className="mt-0.5 text-sm text-dlo">Live overview · Main St. location</p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-xs text-dlo hover:text-dhi transition-colors px-3 py-1.5 rounded-md hover:bg-dr border border-transparent hover:border-drim"
          >
            <RefreshIcon />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-ds border border-drim animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Metric cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {metrics.map((m) => (
                <div key={m.label} className="relative overflow-hidden rounded-lg border border-drim bg-ds p-5">
                  <div className="text-xs font-medium text-dlo uppercase tracking-wider">{m.label}</div>
                  <div className={`mt-2 text-2xl font-semibold tabular-nums ${accentTextMap[m.accent]}`}>
                    {m.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom grid */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Recent Orders */}
              <div className="rounded-lg border border-drim bg-ds overflow-hidden">
                <div className="border-b border-drim px-5 py-3.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-dhi">Recent Orders</span>
                  <span className="text-xs text-dlo">{stats.recentOrders.length} orders</span>
                </div>
                {stats.recentOrders.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-dlo">No orders yet</div>
                ) : (
                  <div className="divide-y divide-drim">
                    {stats.recentOrders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between px-5 py-3 hover:bg-dr/50 transition-colors">
                        <div>
                          <div className="text-sm font-mono text-dhi">{o.orderNumber}</div>
                          <div className="text-xs text-dlo">{o.type?.replace('_', ' ')}</div>
                        </div>
                        <div className="text-sm text-emerald-500 font-medium">${o.total.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Kitchen Tickets */}
              <div className="rounded-lg border border-drim bg-ds overflow-hidden">
                <div className="border-b border-drim px-5 py-3.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-dhi">Kitchen Tickets</span>
                  <span className="text-xs text-dlo">{stats.activeKdsTickets.length} active</span>
                </div>
                {stats.activeKdsTickets.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-dlo">No active tickets</div>
                ) : (
                  <div className="divide-y divide-drim">
                    {stats.activeKdsTickets.map((t) => (
                      <div key={t.id} className="flex items-center justify-between px-5 py-3 hover:bg-dr/50 transition-colors">
                        <div>
                          <div className="text-sm font-mono text-dhi">{t.ticketNumber}</div>
                          <div className="text-xs text-dlo">
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
              <div className="border-l-2 border-warning bg-warning/5 rounded-r-lg px-4 py-3 border border-l-warning border-drim">
                <div className="text-xs font-medium text-amber-500">Low Inventory Alert</div>
                <div className="text-xs text-dlo mt-1">3 items below reorder threshold</div>
              </div>
              <div className="border-l-2 border-info bg-info/5 rounded-r-lg px-4 py-3 border border-l-info border-drim">
                <div className="text-xs font-medium text-blue-500">Kitchen Load</div>
                <div className="text-xs text-dlo mt-1">{stats.activeTickets} active ticket{stats.activeTickets !== 1 ? 's' : ''} in queue</div>
              </div>
              <div className="border-l-2 border-success bg-emerald-500/5 rounded-r-lg px-4 py-3 border border-l-success border-drim">
                <div className="text-xs font-medium text-emerald-500">Floor Status</div>
                <div className="text-xs text-dlo mt-1">{stats.tablesOccupied}/{stats.tablesTotal} tables occupied</div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
