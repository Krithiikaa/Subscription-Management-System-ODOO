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
  Globe,
  Settings,
  X,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { BrightloopLogo } from '../common/BrightloopLogo';

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
  { name: 'Customer Portal', path: '/portal', icon: Globe },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-950/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#111317] text-stone-700 dark:text-stone-300 flex flex-col transition-all duration-200 ease-in-out lg:static lg:translate-x-0 border-r border-stone-200/90 dark:border-stone-800 shadow-lg lg:shadow-none font-sans',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header with Original Brightloop Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-stone-200/80 dark:border-stone-800 shrink-0">
          <NavLink to="/" className="group" onClick={onClose}>
            <BrightloopLogo size="md" showSubtitle={true} />
          </NavLink>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider uppercase text-stone-400 dark:text-stone-500">
            Navigation Menu
          </div>

          <nav className="space-y-0.5">
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname === item.path ||
                    (item.path === '/portal' && location.pathname === '/customer-portal') ||
                    (item.path !== '/' && location.pathname.startsWith(item.path));

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    'group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all relative',
                    isActive
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-stone-950 dark:text-amber-300 border-l-[3px] border-amber-500 font-semibold shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100/80 dark:hover:bg-stone-800/60'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-colors',
                        isActive
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-stone-400 dark:text-stone-500 group-hover:text-stone-700 dark:group-hover:text-stone-300'
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
                            : 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : isActive
                          ? 'bg-amber-200 dark:bg-amber-900 text-stone-900 dark:text-amber-200'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700'
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
            <div className="rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 p-3 text-xs">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Enterprise Suite</span>
              </div>
              <p className="text-stone-500 dark:text-stone-400 text-[11px] leading-relaxed">
                Automated proration, billing cycles, tax handling, and customer self-serve.
              </p>
              <div className="mt-2.5 pt-2 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Engine Active
                </span>
                <span className="font-mono text-[10px]">v3.4.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer / User Mini Profile */}
        <div className="p-3 border-t border-stone-200/80 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-stone-50 dark:bg-stone-900/40 hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors cursor-pointer border border-stone-200/60 dark:border-stone-800/80">
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-xs shadow-2xs">
                SJ
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-stone-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-stone-900 dark:text-white truncate">
                Sarah Jenkins
              </p>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                Enterprise Admin
              </p>
            </div>
            <HelpCircle className="w-4 h-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
}
