import React from 'react';
import { useDemoMode } from '../context/DemoModeContext';
import { DemoSectionTable } from '../components/common/DemoSectionTable';
import { PlaceholderModule } from '../components/common/PlaceholderModule';

export function PaymentsPage() {
  const { isDemoMode, toggleDemoMode, demoData, currency } = useDemoMode();

  if (isDemoMode) {
    return (
      <DemoSectionTable
        sectionKey="payments"
        title="Payment Gateways & Collections Ledger"
        subtitle="35 Transactions processed via Razorpay UPI Autopay, NPCI NACH Mandate, Cashfree & NetBanking"
        data={demoData.payments}
        currency={currency}
        onSwitchToLive={toggleDemoMode}
      />
    );
  }

  return <PlaceholderModule moduleKey="payments" />;
}
