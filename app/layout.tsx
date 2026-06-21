'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/lib/toast';
import ToastContainer from '@/components/Toast';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" style={{ colorScheme: 'dark' }}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root { --background: #0a0a0f !important; --foreground: #f0f0f5 !important; }
          body { background: #0a0a0f !important; color: #f0f0f5 !important; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        ` }} />
      </head>
      <body className="min-h-full flex flex-col bg-slate-950 text-white">
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  );
}
