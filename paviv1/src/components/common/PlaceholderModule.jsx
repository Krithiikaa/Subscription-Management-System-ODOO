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
    <div className="space-y-6">
      {/* Top Banner & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1.5">
            <Link to="/" className="hover:text-indigo-600 transition-colors">
              Brightloop
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-semibold">{config.title}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            {config.title}
            <Badge variant="primary" size="sm">
              Module Scaffold
            </Badge>
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">{config.description}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/">
            <Button variant="outline" size="sm" icon={ChevronRight} iconPosition="left">
              Back to Dashboard
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
              className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-subtle flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{stat.value}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-between p-2.5">
                <IconComponent className="w-full h-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Placeholder Container */}
      <Card className="border-dashed border-2 border-slate-200 bg-white">
        <CardContent className="py-14 px-6 text-center max-w-2xl mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm mb-5">
            <IconComponent className="w-8 h-8" />
          </div>

          <Badge variant="primary" size="sm" className="mb-3">
            Foundation Ready • Module 1 Complete
          </Badge>

          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            {config.title} Management Ready for Data Architecture
          </h2>

          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            This module workspace has been initialized with full route mapping, responsive layout
            integration, and enterprise styling standards. Live CRUD records, database schemas, and
            APIs will be integrated in upcoming build modules.
          </p>

          {/* Planned Capabilities */}
          {config.features && (
            <div className="mt-8 w-full bg-slate-50 border border-slate-200/80 rounded-xl p-5 text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Target Enterprise Features in Module Pipeline:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {config.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/">
              <Button variant="secondary" size="sm">
                Return to Overview
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => {
                alert(`Viewing specifications for Brightloop ${config.title} module.`);
              }}
            >
              View Module Blueprint
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
