import React from 'react';
import { Link } from 'react-router-dom';
import {
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
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { MODULE_CONFIGS } from '../../lib/mockData';

const ICON_MAP = {
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
  Layers,
};

export function PlaceholderModule({ moduleKey }) {
  const config = MODULE_CONFIGS[moduleKey] || {
    title: moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1),
    description: 'Enterprise subscription operations and data management.',
    icon: 'Layers',
    stats: [
      { label: 'Status', value: 'Ready' },
      { label: 'Environment', value: 'Staging' },
    ],
    features: ['Configured routes', 'Enterprise design framework', 'Ready for data layer'],
  };

  const IconComponent = ICON_MAP[config.icon] || Layers;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-200/80 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">
            <Link to="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              Brightloop
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-900 dark:text-stone-100 font-semibold">{config.title}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white flex items-center gap-3 font-serif">
            {config.title}
            <Badge variant="primary" size="sm">
              Module Scaffold
            </Badge>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-2xl font-sans">
            {config.description}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link to="/">
            <Button variant="outline" size="sm" icon={ChevronRight} iconPosition="left">
              Overview
            </Button>
          </Link>
          <Button variant="primary" size="sm" icon={Sparkles}>
            Configure {config.singular || 'Module'}
          </Button>
        </div>
      </div>

      {/* Quick Context Stats */}
      {config.stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {config.stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#15181e] border border-stone-200/90 dark:border-stone-800 rounded-xl p-4 shadow-subtle flex items-center justify-between"
            >
              <div>
                <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-stone-900 dark:text-white mt-0.5 font-sans">
                  {stat.value}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center p-2.5 border border-amber-200/60 dark:border-amber-800/60">
                <IconComponent className="w-full h-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Placeholder Container */}
      <Card className="border-dashed border-2 border-stone-200 dark:border-stone-800 bg-white dark:bg-[#15181e]">
        <CardContent className="py-14 px-6 text-center max-w-2xl mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm mb-5">
            <IconComponent className="w-8 h-8" />
          </div>

          <Badge variant="primary" size="sm" className="mb-3">
            Module 1 Complete &bull; Foundation Ready
          </Badge>

          <h2 className="text-xl font-bold text-stone-900 dark:text-white tracking-tight font-serif">
            {config.title} Management Ready for Data Architecture
          </h2>

          <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 leading-relaxed font-sans">
            This module workspace has been initialized with full route mapping, responsive layout
            integration, and Brightloop Software enterprise styling standards. Live CRUD records, database schemas, and
            APIs will be integrated in upcoming build modules.
          </p>

          {/* Planned Capabilities */}
          {config.features && (
            <div className="mt-8 w-full bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-xl p-5 text-left font-sans">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-3 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-stone-400" />
                Target Enterprise Features in Module Pipeline:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {config.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/">
              <Button variant="secondary" size="sm">
                Return to Dashboard
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => {
                alert(`Viewing specifications for Brightloop Software ${config.title} module.`);
              }}
            >
              View Specifications
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
