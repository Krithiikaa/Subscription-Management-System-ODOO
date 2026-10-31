import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  CheckCircle2,
  Clock,
  Sparkles,
  Command,
} from 'lucide-react';

const ROUTE_TITLES = {
  '/': 'Enterprise Dashboard',
  '/products': 'Products Catalog',
  '/plans': 'Subscription Plans',
  '/customers': 'Customer Accounts',
  '/subscriptions': 'Subscription Management',
  '/quotations': 'Quotations & CPQ',
  '/invoices': 'Invoices & Billing',
  '/discounts': 'Discounts & Promotions',
  '/payments': 'Payments & Gateways',
  '/settings': 'System Settings',
};

export function Topbar({ onOpenSidebar }) {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTitle = ROUTE_TITLES[location.pathname] || 'Dashboard';

  const notifications = [
    {
      id: 1,
      title: 'Invoice Overdue Notice',
      desc: 'Apex Global Logistics is 14 days overdue ($149.00).',
      time: '12m ago',
      unread: true,
      type: 'warning',
    },
    {
      id: 2,
      title: 'New Enterprise Subscription',
      desc: 'Acme Corporation upgraded to Enterprise Cloud Plus ($4,800/yr).',
      time: '1h ago',
      unread: true,
      type: 'success',
    },
    {
      id: 3,
      title: 'Automated Billing Run Complete',
      desc: '142 subscription invoices processed with 99.1% success.',
      time: '3h ago',
      unread: false,
      type: 'info',
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0 shadow-subtle">
      {/* Left: Mobile hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {currentTitle}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            Brightloop Operations &bull; Real-time billing metrics
          </p>
        </div>
      </div>

      {/* Right: Search + Notifications + User Menu */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search Field (UI Only) */}
        <div className="relative hidden md:block w-64 lg:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search subscriptions, customers, invoices..."
            className="w-full pl-9 pr-12 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
            <span className="text-[10px] text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs font-mono">
              ⌘K
            </span>
          </div>
        </div>

        {/* Notification Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900">Notifications</span>
                  <span className="px-2 py-0.2 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-700">
                    2 New
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Mark all read
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        {notif.unread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                        )}
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">{notif.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 pl-3">{notif.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  View notification history &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* User Profile Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="User profile menu"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-semibold flex items-center justify-center text-xs shadow-sm">
                SJ
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                Sarah Jenkins
              </div>
              <div className="text-[11px] text-slate-500">Enterprise Admin</div>
            </div>

            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">Brightloop Enterprise</p>
                <p className="text-[11px] text-slate-500 truncate">sarah.jenkins@brightloop.io</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Account Profile
                </button>
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Billing & Organization
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
