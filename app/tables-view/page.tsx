'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';

interface TableData {
  id: string;
  label: string;
  seats: number;
  status: string;
  section: { name: string };
  orders: { id: string }[];
}

const API = 'http://localhost:4000/api/v1';

const STATUS_STYLES: Record<string, string> = {
  available: 'bg-emerald-500/20 border-emerald-500 text-emerald-400',
  occupied: 'bg-red-500/20 border-red-500 text-red-400',
  reserved: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
  dirty: 'bg-slate-600/20 border-slate-500 text-slate-400',
};

export default function TablesViewPage() {
  const [tables, setTables] = useState<TableData[]>([]);

  const load = () => {
    fetch(`${API}/tables`).then(r => r.json()).then(setTables).catch(() => {
      setTables([
        { id: '1', label: 'T1', seats: 2, status: 'available', section: { name: 'Main' }, orders: [] },
        { id: '2', label: 'T2', seats: 4, status: 'occupied', section: { name: 'Main' }, orders: [{ id: 'o1' }] },
        { id: '3', label: 'T3', seats: 4, status: 'available', section: { name: 'Main' }, orders: [] },
        { id: '4', label: 'T4', seats: 6, status: 'reserved', section: { name: 'Main' }, orders: [] },
        { id: '5', label: 'T5', seats: 2, status: 'occupied', section: { name: 'Patio' }, orders: [{ id: 'o2' }] },
        { id: '6', label: 'T6', seats: 4, status: 'dirty', section: { name: 'Patio' }, orders: [] },
        { id: '7', label: 'T7', seats: 8, status: 'available', section: { name: 'Private' }, orders: [] },
        { id: '8', label: 'T8', seats: 4, status: 'available', section: { name: 'Bar' }, orders: [] },
      ]);
    });
  };

  useEffect(() => { load(); }, []);

  const cycleStatus = async (id: string, current: string) => {
    const flow: Record<string, string> = { available: 'occupied', occupied: 'dirty', dirty: 'available', reserved: 'available' };
    const next = flow[current] || 'available';
    await fetch(`${API}/tables/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) });
    load();
  };

  const sections = [...new Set(tables.map(t => t.section.name))];

  return (
    <DashboardShell active="Tables">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">🪑 Floor Plan</h1>
        <div className="flex gap-4 text-sm">
          {Object.entries(STATUS_STYLES).map(([status, style]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full border ${style}`} />
              <span className="capitalize text-slate-400">{status}</span>
            </div>
          ))}
        </div>
      </div>

      {sections.map(section => (
        <div key={section} className="mb-8">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">{section}</h2>
          <div className="grid grid-cols-4 gap-4">
            {tables.filter(t => t.section.name === section).map(table => (
              <button key={table.id} onClick={() => cycleStatus(table.id, table.status)}
                className={`border-2 rounded-xl p-4 text-center transition hover:scale-105 ${STATUS_STYLES[table.status] || ''}`}>
                <div className="text-2xl font-bold">{table.label}</div>
                <div className="text-xs opacity-60 mt-1">{table.seats} seats</div>
                {table.orders.length > 0 && <div className="text-xs mt-1">🔴 Active order</div>}
              </button>
            ))}
          </div>
        </div>
      ))}
    </DashboardShell>
  );
}
