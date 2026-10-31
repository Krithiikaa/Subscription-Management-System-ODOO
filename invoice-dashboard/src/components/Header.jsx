import { Menu, RefreshCw } from 'lucide-react';

export default function Header({ 
  onToggleMobile, 
  onResetDemoData,
  currentTab = 'invoices' 
}) {
  const getTabTitle = (tab) => {
    switch (tab) {
      case 'dashboard': return 'Executive Overview';
      case 'invoices': return 'Invoices & Billing';
      case 'subscriptions': return 'Subscription Plans';
      case 'customers': return 'Customer Directory';
      case 'payments': return 'Payment Logs';
      default: return 'Invoices';
    }
  };

  return (
    <header className="top-header" role="banner">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={onToggleMobile}
          aria-label="Open mobile navigation menu"
        >
          <Menu size={20} />
        </button>

        <nav aria-label="Breadcrumb" className="header-breadcrumbs">
          <span>Billing Engine</span>
          <span aria-hidden="true">/</span>
          <span className="breadcrumb-active">{getTabTitle(currentTab)}</span>
        </nav>
      </div>

      <div className="header-right">
        {/* Clearly identify demo sample data */}
        <div className="demo-chip" title="Demo mode active. Changes are stored in browser session memory.">
          <span className="demo-chip-dot" aria-hidden="true" />
          <span>Realistic Sample Data</span>
        </div>

        <button
          type="button"
          className="quick-action-btn"
          onClick={onResetDemoData}
          title="Reset back to initial sample invoices"
        >
          <RefreshCw size={14} />
          <span>Reset Demo</span>
        </button>
      </div>
    </header>
  );
}
