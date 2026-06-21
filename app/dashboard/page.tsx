'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';

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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    ordersToday: 0, revenueToday: 0, activeTickets: 0,
    tablesOccupied: 0, tablesTotal: 0, menuItems: 0,
    recentOrders: [], activeKdsTickets: [],
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
    const id = setInterval(() => { load(); }, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <DashboardShell active="Dashboard">
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Command center</h1>
            <p className="mt-1 text-sm text-slate-400">Live overview — Main St. location</p>
          </div>
          <button onClick={load} className="text-sm text-slate-400 hover:text-white transition">
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-12">Loading live data...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <StatCard label="Orders Today" value={String(stats.ordersToday)} accent="blue" />
              <StatCard label="Revenue Today" value={`$${stats.revenueToday.toFixed(2)}`} accent="emerald" />
              <StatCard label="Active Tickets" value={String(stats.activeTickets)} accent="orange" />
              <StatCard label="Tables Occupied" value={`${stats.tablesOccupied}/${stats.tablesTotal}`} accent="amber" />
              <StatCard label="Menu Items" value={String(stats.menuItems)} accent="purple" />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Recent Orders */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/50">
                <div className="border-b border-slate-800 px-5 py-4">
                  <div className="text-sm font-medium text-slate-200">Recent Orders</div>
                </div>
                {stats.recentOrders.length === 0 ? (
                  <div className="p-5 text-sm text-slate-500">No orders yet</div>
                ) : (
                  <div className="divide-y divide-slate-800/50">
                    {stats.recentOrders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between px-5 py-3">
                        <div>
                          <div className="text-sm font-mono text-slate-300">{o.orderNumber}</div>
                          <div className="text-xs text-slate-500">{o.type}</div>
                        </div>
                        <div className="text-sm text-emerald-400 font-medium">${o.total.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active KDS Tickets */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/50">
                <div className="border-b border-slate-800 px-5 py-4">
                  <div className="text-sm font-medium text-slate-200">Kitchen Tickets</div>
                </div>
                {stats.activeKdsTickets.length === 0 ? (
                  <div className="p-5 text-sm text-slate-500">No active tickets</div>
                ) : (
                  <div className="divide-y divide-slate-800/50">
                    {stats.activeKdsTickets.map((t) => (
                      <div key={t.id} className="flex items-center justify-between px-5 py-3">
                        <div>
                          <div className="text-sm font-mono text-slate-300">{t.ticketNumber}</div>
                          <div className="text-xs text-slate-500">{t.tableLabel || 'No table'} · {t.items} items</div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          t.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                          t.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                          t.status === 'READY' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-slate-700 text-slate-400'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    orange: 'text-orange-400',
    amber: 'text-amber-400',
    purple: 'text-purple-400',
  };
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`mt-2 text-2xl font-semibold ${colors[accent] || 'text-white'}`}>{value}</div>
    </div>
  );
}
