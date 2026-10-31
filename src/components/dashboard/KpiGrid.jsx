import React from 'react';
import { KpiCard } from './KpiCard';
import { KPI_DATA } from '../../lib/mockData';

export function KpiGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {KPI_DATA.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  );
}
