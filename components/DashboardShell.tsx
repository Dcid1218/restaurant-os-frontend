'use client';

import { ReactNode, useState } from 'react';
import { useAuth } from '@/lib/auth';
import Avatar from '@/components/Avatar';

const nav = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'POS',
    href: '/pos',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'KDS',
    href: '/kds',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path d="M12 2a9 9 0 00-9 9c0 2.4.94 4.58 2.47 6.2L12 22l6.53-4.8A8.96 8.96 0 0021 11a9 9 0 00-9-9z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 6v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Menu',
    href: '/menu',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path strokeLinecap="round" d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    label: 'Tables',
    href: '/tables-view',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 5v14M14 5v14" />
        <rect x="3" y="5" width="18" height="14" rx="2" />
      </svg>
    ),
  },
  {
    label: 'Sales',
    href: '/sales',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    label: 'Labor',
    href: '/labor',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    label: 'Inventory',
    href: '/inventory',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <circle cx="12" cy="8" r="4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    label: 'Marketing',
    href: '/marketing',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: 'Team',
    href: '/users',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

export default function DashboardShell({
  children,
  active = 'Dashboard',
}: {
  children: ReactNode;
  active?: string;
}) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userName = user ? `${user.firstName} ${user.lastName}` : 'User';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col border-r border-[#2a2a3a] bg-[#12121a] transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-[#2a2a3a] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-indigo-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 5.4-5 9-9 9 4 0 7.8 3.6 9 9 1.2-5.4 5-9 9-9-4 0-7.8-3.6-9-9z" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-[#f0f0f5]">RestaurantOS</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-6 h-6 flex items-center justify-center text-[#6a6a80] hover:text-[#f0f0f5] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {nav.map((item) => {
            const isActive = item.label === active;
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150 ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-500 font-medium'
                    : 'text-[#a0a0b8] hover:bg-[#22222f] hover:text-[#f0f0f5]'
                }`}
              >
                <span className={isActive ? 'text-indigo-500' : 'text-[#6a6a80]'}>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-[#2a2a3a] shrink-0">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar name={userName} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-[#f0f0f5] truncate">{userName}</div>
              <div className="text-xs text-[#6a6a80] truncate">{user?.role}</div>
            </div>
            <button
              onClick={logout}
              className="text-[#6a6a80] hover:text-red-500 transition-colors"
              title="Sign out"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-60">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-14 border-b border-[#2a2a3a] bg-[#12121a]/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-md text-[#6a6a80] hover:text-[#f0f0f5] hover:bg-[#22222f] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-sm text-[#6a6a80] hidden sm:block">
              {active}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#22222f] border border-[#2a2a3a]">
              <svg className="w-3.5 h-3.5 text-[#6a6a80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
              </svg>
              <span className="text-xs text-[#6a6a80]">Search...</span>
              <kbd className="text-xs text-[#6a6a80] bg-[#1a1a26] px-1 rounded">⌘K</kbd>
            </div>
            <Avatar name={userName} size="sm" />
          </div>
        </header>

        <section className="p-4 lg:p-6">{children}</section>
      </main>
    </div>
  );
}
