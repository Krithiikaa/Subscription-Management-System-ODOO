import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

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
  '/portal': 'Customer Portal',
  '/customer-portal': 'Customer Portal',
  '/settings': 'System Settings',
};

export function Topbar({ onOpenSidebar }) {
  const location = useLocation();
  const { theme, toggleTheme, isDark } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
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
      title: 'New Enterprise Plan Activated',
      desc: 'Acme Corporation upgraded to Enterprise Cloud Plus ($4,800/yr).',
      time: '1h ago',
      unread: true,
      type: 'success',
    },
    {
      id: 3,
      title: 'Billing Engine Cycle Complete',
      desc: '142 subscription invoices generated without errors.',
      time: '3h ago',
      unread: false,
      type: 'info',
    },
  ];

  return (
    <header className="h-16 bg-white dark:bg-[#12151b] border-b border-stone-200/80 dark:border-stone-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0 transition-colors duration-200">
      {/* Left: Hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-stone-900 dark:text-white tracking-tight leading-tight font-serif">
            {currentTitle}
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block font-sans">
            Brightloop Software &bull; Subscription Engine
          </p>
        </div>
      </div>

      {/* Right: Search + Theme Toggle + Notifications + User Menu */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Search Field (UI Only) */}
        <div className="relative hidden md:block w-56 lg:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search subscriptions, invoices..."
            className="w-full pl-9 pr-12 py-1.5 bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white dark:focus:bg-stone-900 transition-all font-sans"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
            <span className="text-[10px] text-stone-400 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-1.5 py-0.5 rounded font-mono">
              ⌘K
            </span>
          </div>
        </div>

        {/* Working Light/Dark Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          id="theme-toggle-button"
          className="p-2 rounded-lg text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white bg-stone-50 hover:bg-stone-100 dark:bg-stone-900/80 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-stone-700 transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-stone-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xl z-50 overflow-hidden font-sans">
              <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-stone-900 dark:text-white">
                    Notifications
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400">
                    2 New
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
                >
                  Mark all read
                </button>
              </div>

              <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3.5 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        {notif.unread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        )}
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-stone-400 shrink-0">{notif.time}</span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 pl-3">
                      {notif.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-2.5 bg-stone-50 dark:bg-stone-900/80 border-t border-stone-100 dark:border-stone-800 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
                >
                  View notification history &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-stone-200 dark:bg-stone-800" />

        {/* User Profile Section */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="User account menu"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-xs shadow-sm ring-2 ring-amber-300/40">
                SJ
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-stone-900" />
            </div>

            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 leading-tight">
                Sarah Jenkins
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400">
                Enterprise Admin
              </div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xl z-50 py-1 font-sans">
              <div className="px-4 py-2.5 border-b border-stone-100 dark:border-stone-800">
                <p className="text-xs font-semibold text-stone-900 dark:text-white">
                  Brightloop Software
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                  sarah.jenkins@brightloop.io
                </p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full px-4 py-2 text-left text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2.5"
                >
                  <User className="w-4 h-4 text-stone-400" />
                  Account Settings
                </button>
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full px-4 py-2 text-left text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2.5"
                >
                  <Settings className="w-4 h-4 text-stone-400" />
                  Billing Rules & Org
                </button>
              </div>

              <div className="border-t border-stone-100 dark:border-stone-800 pt-1">
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full px-4 py-2 text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5"
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
