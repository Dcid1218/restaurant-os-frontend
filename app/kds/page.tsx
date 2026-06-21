'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardShell from '@/components/DashboardShell';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';

interface TicketItem {
  id: string;
  menuItem: { name: string };
  quantity: number;
  status: string;
  notes: string | null;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  status: string;
  priority: number;
  tableLabel: string | null;
  serverName: string | null;
  firedAt: string | null;
  items: TicketItem[];
  order: { orderNumber: string };
}

const API = 'http://localhost:4000/api/v1';

const TICKET_STATUS_CONFIG: Record<string, { badge: 'info' | 'warning' | 'success' | 'neutral' | 'danger'; border: string; bg: string }> = {
  PENDING: { badge: 'warning', border: 'border-amber-500/40', bg: 'bg-amber-500/10' },
  IN_PROGRESS: { badge: 'info', border: 'border-blue-500/40', bg: 'bg-blue-500/10' },
  READY: { badge: 'success', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' },
  COMPLETED: { badge: 'neutral', border: 'border-slate-700', bg: 'bg-slate-900/50' },
  CANCELLED: { badge: 'danger', border: 'border-red-500/40', bg: 'bg-red-500/10' },
};

const ITEM_STATUS_CONFIG: Record<string, { badge: 'info' | 'warning' | 'success' | 'neutral' | 'danger' }> = {
  PENDING: { badge: 'warning' },
  FIRED: { badge: 'warning' },
  IN_PROGRESS: { badge: 'info' },
  READY: { badge: 'success' },
  COMPLETED: { badge: 'neutral' },
  CANCELLED: { badge: 'danger' },
};

function KitchenIcon() {
  return (
    <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a9 9 0 00-9 9c0 2.4.94 4.58 2.47 6.2L12 22l6.53-4.8A8.96 8.96 0 0021 11a9 9 0 00-9-9z" />
    </svg>
  );
}

export default function KDSPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<string>('active');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadTickets = useCallback(() => {
    const status = filter === 'active' ? '' : filter.toUpperCase();
    fetch(`${API}/kds/tickets${status ? `?status=${status}` : ''}`)
      .then((r) => r.json())
      .then((data) => {
        setTickets(data);
        setLastRefresh(new Date());
      })
      .catch(() => {
        setTickets([
          {
            id: 't1',
            ticketNumber: 'KT-001',
            status: 'PENDING',
            priority: 1,
            tableLabel: 'Table 5',
            serverName: 'John D.',
            firedAt: new Date().toISOString(),
            order: { orderNumber: '20260621-0001' },
            items: [
              { id: 'ti1', menuItem: { name: 'Classic Burger' }, quantity: 2, status: 'PENDING', notes: 'No pickles' },
              { id: 'ti2', menuItem: { name: 'Buffalo Wings' }, quantity: 1, status: 'PENDING', notes: null },
            ],
          },
          {
            id: 't2',
            ticketNumber: 'KT-002',
            status: 'IN_PROGRESS',
            priority: 0,
            tableLabel: 'Table 2',
            serverName: 'Sarah M.',
            firedAt: new Date(Date.now() - 300000).toISOString(),
            order: { orderNumber: '20260621-0002' },
            items: [
              { id: 'ti3', menuItem: { name: 'Steak Frites' }, quantity: 1, status: 'IN_PROGRESS', notes: 'Medium rare' },
              { id: 'ti4', menuItem: { name: 'Caesar Salad' }, quantity: 1, status: 'READY', notes: null },
            ],
          },
        ]);
      });
  }, [filter]);

  useEffect(() => {
    loadTickets();
    const interval = setInterval(loadTickets, 5000);
    return () => clearInterval(interval);
  }, [loadTickets]);

  const updateTicketStatus = async (id: string, status: string) => {
    await fetch(`${API}/kds/tickets/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadTickets();
  };

  const updateItemStatus = async (id: string, status: string) => {
    await fetch(`${API}/kds/ticket-items/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadTickets();
  };

  const elapsed = (firedAt: string | null) => {
    if (!firedAt) return '0:00';
    const diff = Math.floor((Date.now() - new Date(firedAt).getTime()) / 1000);
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const filters = ['active', 'pending', 'in_progress', 'ready', 'completed'];

  return (
    <DashboardShell active="KDS">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-white">Kitchen Display</h1>
            <p className="text-xs text-slate-500">
              Auto-refreshing · Last update:{' '}
              {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors duration-150 ${
                  filter === f
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-700 text-slate-400 hover:text-white border border-slate-600'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets */}
        {tickets.length === 0 ? (
          <EmptyState
            title="No tickets"
            description="Waiting for orders to come in"
            icon={<KitchenIcon />}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tickets.map((ticket) => {
              const cfg = TICKET_STATUS_CONFIG[ticket.status] ?? TICKET_STATUS_CONFIG.PENDING;
              const elapsedTime = elapsed(ticket.firedAt);
              const [elapsedMin] = elapsedTime.split(':').map(Number);
              const isUrgent = elapsedMin >= 10;

              return (
                <div key={ticket.id} className={`border-2 rounded-xl p-4 flex flex-col gap-3 ${cfg.border} ${cfg.bg}`}>
                  {/* Ticket header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xl font-bold text-white tracking-tight">{ticket.ticketNumber}</div>
                      {ticket.tableLabel && (
                        <div className="text-xs text-slate-400">{ticket.tableLabel}</div>
                      )}
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className={`text-lg font-mono font-semibold ${isUrgent ? 'text-red-500' : 'text-slate-400'}`}>
                        {elapsedTime}
                      </span>
                      <Badge variant={cfg.badge}>{ticket.status.replace('_', ' ')}</Badge>
                    </div>
                  </div>

                  {ticket.serverName && (
                    <div className="text-xs text-slate-500">Server: {ticket.serverName}</div>
                  )}

                  {/* Items */}
                  <div className="space-y-1.5">
                    {ticket.items.map((item) => {
                      const itemCfg = ITEM_STATUS_CONFIG[item.status] ?? ITEM_STATUS_CONFIG.PENDING;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base font-bold text-white shrink-0">{item.quantity}×</span>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-white truncate">{item.menuItem.name}</div>
                              {item.notes && (
                                <div className="text-xs text-slate-500">{item.notes}</div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const next =
                                item.status === 'PENDING'
                                  ? 'IN_PROGRESS'
                                  : item.status === 'IN_PROGRESS'
                                  ? 'READY'
                                  : 'COMPLETED';
                              updateItemStatus(item.id, next);
                            }}
                            className="ml-2 shrink-0"
                          >
                            <Badge variant={itemCfg.badge}>{item.status.replace('_', ' ')}</Badge>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto pt-2">
                    {ticket.status === 'PENDING' && (
                      <button
                        onClick={() => updateTicketStatus(ticket.id, 'IN_PROGRESS')}
                        className="flex-1 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-600 text-blue-500 hover:text-white text-sm font-semibold border border-blue-500/30 transition-colors"
                      >
                        Start
                      </button>
                    )}
                    {ticket.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => updateTicketStatus(ticket.id, 'READY')}
                        className="flex-1 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-600 text-emerald-500 hover:text-white text-sm font-semibold border border-emerald-500/30 transition-colors"
                      >
                        Ready
                      </button>
                    )}
                    {ticket.status === 'READY' && (
                      <button
                        onClick={() => updateTicketStatus(ticket.id, 'COMPLETED')}
                        className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white text-sm font-semibold border border-slate-600 transition-colors"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => updateTicketStatus(ticket.id, 'CANCELLED')}
                      className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white text-sm border border-red-500/20 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
