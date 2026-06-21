'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardShell from '@/components/DashboardShell';

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

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'border-yellow-500 bg-yellow-500/10',
  IN_PROGRESS: 'border-blue-500 bg-blue-500/10',
  READY: 'border-emerald-500 bg-emerald-500/10',
  COMPLETED: 'border-slate-600 bg-slate-800/50',
  CANCELLED: 'border-red-500 bg-red-500/10',
};

const ITEM_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  FIRED: 'bg-orange-500/20 text-orange-400',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
  READY: 'bg-emerald-500/20 text-emerald-400',
  COMPLETED: 'bg-slate-600/20 text-slate-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
};

export default function KDSPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<string>('active');

  const loadTickets = useCallback(() => {
    const status = filter === 'active' ? '' : filter.toUpperCase();
    fetch(`${API}/kds/tickets${status ? `?status=${status}` : ''}`)
      .then(r => r.json())
      .then(data => setTickets(data))
      .catch(() => {
        // Demo data
        setTickets([
          {
            id: 't1', ticketNumber: 'KT-001', status: 'PENDING', priority: 1,
            tableLabel: 'Table 5', serverName: 'John D.', firedAt: new Date().toISOString(),
            order: { orderNumber: '20260621-0001' },
            items: [
              { id: 'ti1', menuItem: { name: 'Classic Burger' }, quantity: 2, status: 'PENDING', notes: 'No pickles' },
              { id: 'ti2', menuItem: { name: 'Buffalo Wings' }, quantity: 1, status: 'PENDING', notes: null },
            ],
          },
          {
            id: 't2', ticketNumber: 'KT-002', status: 'IN_PROGRESS', priority: 0,
            tableLabel: 'Table 2', serverName: 'Sarah M.', firedAt: new Date(Date.now() - 300000).toISOString(),
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

  return (
    <DashboardShell active="KDS">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">🍳 Kitchen Display System</h1>
        <div className="flex gap-2">
          {['active', 'pending', 'in_progress', 'ready', 'completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-sm capitalize transition ${filter === f ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center text-slate-600 py-20">No tickets — waiting for orders</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {tickets.map(ticket => (
            <div key={ticket.id} className={`border-2 rounded-xl p-4 ${STATUS_COLORS[ticket.status] || 'border-slate-700'}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-bold text-lg">{ticket.ticketNumber}</span>
                  {ticket.tableLabel && <span className="ml-2 text-sm opacity-70">{ticket.tableLabel}</span>}
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-60">{elapsed(ticket.firedAt)}</div>
                  <div className="text-xs font-medium">{ticket.serverName}</div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {ticket.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{item.quantity}x</span>
                      <span className="text-sm">{item.menuItem.name}</span>
                      {item.notes && <span className="text-xs opacity-50">({item.notes})</span>}
                    </div>
                    <button onClick={() => {
                      const next = item.status === 'PENDING' ? 'IN_PROGRESS' : item.status === 'IN_PROGRESS' ? 'READY' : 'COMPLETED';
                      updateItemStatus(item.id, next);
                    }} className={`text-xs px-2 py-0.5 rounded font-medium ${ITEM_STATUS_COLORS[item.status] || ''}`}>
                      {item.status.replace('_', ' ')}
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                {ticket.status === 'PENDING' && (
                  <button onClick={() => updateTicketStatus(ticket.id, 'IN_PROGRESS')}
                    className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-bold transition">
                    Start
                  </button>
                )}
                {ticket.status === 'IN_PROGRESS' && (
                  <button onClick={() => updateTicketStatus(ticket.id, 'READY')}
                    className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-bold transition">
                    Ready
                  </button>
                )}
                {ticket.status === 'READY' && (
                  <button onClick={() => updateTicketStatus(ticket.id, 'COMPLETED')}
                    className="flex-1 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-sm font-bold transition">
                    Complete
                  </button>
                )}
                <button onClick={() => updateTicketStatus(ticket.id, 'CANCELLED')}
                  className="px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-sm transition">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
