import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  CreditCard,
  Users,
  RefreshCw,
  FileText,
  Receipt,
  Tag,
  DollarSign,
  Settings,
  X,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Products', path: '/products', icon: Package },
  { name: 'Plans', path: '/plans', icon: CreditCard },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Subscriptions', path: '/subscriptions', icon: RefreshCw, badge: '1.2k' },
  { name: 'Quotations', path: '/quotations', icon: FileText },
  { name: 'Invoices', path: '/invoices', icon: Receipt, badgeAlert: true, badge: '7 due' },
  { name: 'Discounts', path: '/discounts', icon: Tag },
  { name: 'Payments', path: '/payments', icon: DollarSign },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 border-r border-slate-800 shadow-xl lg:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 shrink-0">
          <NavLink to="/" className="flex items-center gap-3 group" onClick={onClose}>
            {/* Custom Brightloop Logo Mark */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-md shadow-indigo-950/50 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950/40 rounded-[10px] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v4" />
                  <path d="m4.93 4.93 2.83 2.83" />
                  <path d="M2 12h4" />
                  <path d="m4.93 19.07 2.83-2.83" />
                  <path d="M12 22v-4" />
                  <path d="m19.07 19.07-2.83-2.83" />
                  <path d="M22 12h-4" />
                  <path d="m19.07 4.93-2.83 2.83" />
                </svg>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-white tracking-tight">Brightloop</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal truncate max-w-[130px]">
                Subscription OS
              </p>
            </div>
          </NavLink>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
            Platform Modules
          </div>

          <nav className="space-y-1">
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    'group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors relative',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-colors',
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      )}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0',
                        item.badgeAlert
                          ? isActive
                            ? 'bg-rose-500 text-white'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : isActive
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Quick Context Card */}
          <div className="pt-6 px-1">
            <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-3 text-xs">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Enterprise Tier</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Multi-tenant cloud billing engine with automated dunning & CPQ workflows.
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Systems Normal
                </span>
                <span className="text-slate-400 font-mono">v3.4.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer / User Mini Profile */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 transition-colors cursor-pointer">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center text-xs ring-2 ring-indigo-400/30">
                SJ
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Sarah Jenkins</p>
              <p className="text-[11px] text-slate-400 truncate">Enterprise Admin</p>
            </div>
            <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-200 shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
}
