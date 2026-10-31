import React from 'react';
import { useDemoMode } from '../context/DemoModeContext';
import { DemoSectionTable } from '../components/common/DemoSectionTable';
import { PlaceholderModule } from '../components/common/PlaceholderModule';

export function InvoicesPage() {
  const { isDemoMode, toggleDemoMode, demoData, currency } = useDemoMode();

  if (isDemoMode) {
    return (
      <DemoSectionTable
        sectionKey="invoices"
        title="Billing Invoices & Receivables"
        subtitle="35 Corporate billing invoices across Paid, Pending, Overdue, and Draft lifecycles"
        data={demoData.invoices}
        currency={currency}
        onSwitchToLive={toggleDemoMode}
      />
    );
  }

  return <PlaceholderModule moduleKey="invoices" />;
}
