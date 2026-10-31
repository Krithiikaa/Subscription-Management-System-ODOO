import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AlertCircle } from 'lucide-react';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Global Demo Status Banner */}
        <div className="bg-indigo-50/80 border-b border-indigo-100/80 px-4 sm:px-6 py-2 text-xs text-indigo-900 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="font-semibold">Enterprise Preview Mode:</span>
            <span className="text-indigo-700">
              Interactive demonstration dataset for Brightloop Subscription Management System (Module 1).
            </span>
          </div>
          <span className="text-[11px] font-mono text-indigo-600 bg-white/80 px-2 py-0.5 rounded border border-indigo-200">
            Tenant: brightloop-corp-global
          </span>
        </div>

        {/* Main Page View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Enterprise Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            &copy; 2026 <strong className="text-slate-700">Brightloop</strong> Inc. All rights reserved. Subscription Management System v3.4.
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>SaaS Architecture</span>
            <span>&bull;</span>
            <span>Module 1 Complete</span>
            <span>&bull;</span>
            <span>GDPR & SOC2 Ready</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
