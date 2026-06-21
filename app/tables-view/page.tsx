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

const STATUS_CONFIG: Record<
  string,
  { label: string; border: string; bg: string; text: string; dot: string }
> = {
  available: {
    label: 'Available',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    text: 'text-emerald-500',
    dot: 'bg-emerald-500',
  },
  occupied: {
    label: 'Occupied',
    border: 'border-red-500/40',
    bg: 'bg-red-500/10 hover:bg-red-500/20',
    text: 'text-red-500',
    dot: 'bg-red-500',
  },
  reserved: {
    label: 'Reserved',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10 hover:bg-amber-500/20',
    text: 'text-amber-500',
    dot: 'bg-amber-500',
  },
  dirty: {
    label: 'Needs Cleaning',
    border: 'border-slate-600',
    bg: 'bg-slate-700/50 hover:bg-slate-700',
    text: 'text-slate-500',
    dot: 'bg-slate-500',
  },
};

function SeatsIcon() {
  return (
    <svg className="w-3 h-3 inline mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

export default function TablesViewPage() {
  const [tables, setTables] = useState<TableData[]>([]);

  const load = () => {
    fetch(`${API}/tables`)
      .then((r) => r.json())
      .then(setTables)
      .catch(() => {
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

  useEffect(() => {
    load();
  }, []);

  const cycleStatus = async (id: string, current: string) => {
    const flow: Record<string, string> = {
      available: 'occupied',
      occupied: 'dirty',
      dirty: 'available',
      reserved: 'available',
    };
    const next = flow[current] || 'available';
    await fetch(`${API}/tables/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    load();
  };

  const sections = [...new Set(tables.map((t) => t.section.name))];

  const statusSummary = Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
    key,
    label: cfg.label,
    dot: cfg.dot,
    count: tables.filter((t) => t.status === key).length,
  }));

  return (
    <DashboardShell active="Tables">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-white">Floor Plan</h1>
            <p className="text-xs text-slate-500 mt-0.5">Click a table to cycle its status</p>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 flex-wrap">
            {statusSummary.map((s) => (
              <div key={s.key} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                <span className="text-xs text-slate-400">{s.label}</span>
                <span className="text-xs text-slate-500">({s.count})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        {sections.map((section) => {
          const sectionTables = tables.filter((t) => t.section.name === section);
          return (
            <div key={section}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{section}</h2>
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-xs text-slate-500">{sectionTables.length} tables</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {sectionTables.map((table) => {
                  const cfg = STATUS_CONFIG[table.status] ?? STATUS_CONFIG.available;
                  return (
                    <button
                      key={table.id}
                      onClick={() => cycleStatus(table.id, table.status)}
                      className={`border-2 rounded-xl p-4 text-center transition-all duration-150 hover:scale-105 active:scale-95 ${cfg.border} ${cfg.bg}`}
                    >
                      <div className="text-2xl font-bold text-white">{table.label}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        <SeatsIcon />
                        {table.seats}
                      </div>
                      <div className={`text-xs font-medium mt-2 ${cfg.text}`}>{cfg.label}</div>
                      {table.orders.length > 0 && (
                        <div className="mt-1.5 flex items-center justify-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-xs text-red-500">Active</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
