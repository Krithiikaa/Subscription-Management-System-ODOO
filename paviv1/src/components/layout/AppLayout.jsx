import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50/60 dark:bg-[#0c0e12] flex transition-colors duration-200 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Global Demo Status Banner with Golden Yellow Palette */}
        <div className="bg-amber-50/80 dark:bg-amber-950/30 border-b border-amber-200/70 dark:border-amber-900/40 px-4 sm:px-6 py-2 text-xs text-amber-950 dark:text-amber-200 flex flex-wrap items-center justify-between gap-2 transition-colors">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-semibold">Brightloop Software Preview:</span>
            <span className="text-amber-900 dark:text-amber-300">
              Interactive demonstration dataset for Subscription Management System.
            </span>
          </div>
          <span className="text-[10px] font-mono text-amber-800 dark:text-amber-300 bg-white/90 dark:bg-stone-900 px-2 py-0.5 rounded border border-amber-300/60 dark:border-amber-800">
            Tenant: brightloop-corp-global
          </span>
        </div>

        {/* Main Page View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Enterprise Footer */}
        <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-[#12151b] py-4 px-6 text-xs text-stone-500 dark:text-stone-400 flex flex-col sm:flex-row items-center justify-between gap-2 transition-colors">
          <div>
            &copy; 2026 <strong className="text-stone-900 dark:text-stone-200">Brightloop Software</strong> Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>Enterprise Billing OS</span>
            <span>&bull;</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">Module 1 Final</span>
            <span>&bull;</span>
            <span>SOC2 & GDPR Compliant</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
