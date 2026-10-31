import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlus,
  Users,
  RefreshCw,
  Receipt,
  CreditCard,
  Settings,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../common/Card';

const QUICK_ACTIONS = [
  {
    id: 'invite-staff',
    title: 'Invite Staff Member',
    description: 'Issue secure staff invitations with automatic role assignment',
    path: '/staff-management',
    icon: UserPlus,
    badge: 'Admin Only',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
  },
  {
    id: 'manage-customers',
    title: 'Customer Directory',
    description: 'Review registered accounts, profile status, and portal access',
    path: '/customers',
    icon: Users,
    badge: 'Directory',
    badgeColor: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700',
    iconBg: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700',
  },
  {
    id: 'view-subscriptions',
    title: 'Manage Subscriptions',
    description: 'Create and oversee active recurring SaaS agreements',
    path: '/subscriptions',
    icon: RefreshCw,
    badge: 'Contracts',
    badgeColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 border-sky-200 dark:border-sky-800',
  },
  {
    id: 'generate-invoice',
    title: 'Invoices & Billing',
    description: 'Review pending receivables and generate customer invoices',
    path: '/invoices',
    icon: Receipt,
    badge: 'Receivables',
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'configure-plans',
    title: 'Pricing & Plans',
    description: 'Adjust subscription tiers, billing cadences, and pricing models',
    path: '/plans',
    icon: CreditCard,
    badge: 'Catalog',
    badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  },
  {
    id: 'system-settings',
    title: 'Governance & Settings',
    description: 'Enterprise security controls, database policies, and system config',
    path: '/settings',
    icon: Settings,
    badge: 'Security',
    badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  },
];

export function AdminQuickActions() {
  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Administrative Quick Actions"
        subtitle="One-click workflows for high-frequency management and governance tasks"
      />
      <CardContent className="pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.id}
                to={action.path}
                className="group p-4 rounded-xl border border-stone-200/90 dark:border-stone-800/90 bg-stone-50/60 dark:bg-stone-900/40 hover:bg-white dark:hover:bg-stone-800/60 hover:shadow-card hover:border-amber-400/60 dark:hover:border-amber-500/50 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center border shadow-2xs group-hover:scale-105 transition-transform ${action.iconBg}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${action.badgeColor}`}
                    >
                      {action.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    {action.title}
                  </h4>
                  <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                    {action.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-xs font-semibold text-stone-600 dark:text-stone-400 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  <span>Open Module</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
