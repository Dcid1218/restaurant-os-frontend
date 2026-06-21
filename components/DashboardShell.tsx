'use client';

import { ReactNode, useState } from 'react';
import { useAuth } from '@/lib/auth';

const nav = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'POS', href: '/pos', icon: '🖥️' },
  { label: 'KDS', href: '/kds', icon: '🍳' },
  { label: 'Menu', href: '/menu', icon: '📋' },
  { label: 'Tables', href: '/tables-view', icon: '🪑' },
  { label: 'Sales', href: '/sales', icon: '💰' },
  { label: 'Labor', href: '/labor', icon: '👷' },
  { label: 'Inventory', href: '/inventory', icon: '📦' },
  { label: 'Customers', href: '/customers', icon: '👥' },
  { label: 'Marketing', href: '/marketing', icon: '📣' },
  { label: 'Reports', href: '/reports', icon: '📈' },
  { label: 'Team', href: '/users', icon: '👤' },
];

export default function DashboardShell({ children, active = 'Dashboard' }: { children: ReactNode; active?: string }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-800 bg-slate-900/95 backdrop-blur transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6">
          <span className="text-lg font-semibold tracking-wide">🍽️ RestaurantOS</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white text-xl">✕</button>
        </div>
        <nav className="p-3 space-y-1">
          {nav.map((item) => {
            const isActive = item.label === active;
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                  isActive ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </aside>

      <main className="lg:ml-64">
        <header className="sticky top-0 z-30 h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white text-xl">☰</button>
            <div className="text-sm text-slate-400 hidden sm:block">RestaurantOS · All-in-one platform</div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">
              {user ? `${user.firstName} ${user.lastName}` : 'User'}
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">{user?.role}</span>
            <button
              onClick={logout}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1 text-slate-400 hover:text-white transition text-xs"
            >
              Logout
            </button>
          </div>
        </header>
        <section className="p-4 lg:p-6">{children}</section>
      </main>
    </div>
  );
}
