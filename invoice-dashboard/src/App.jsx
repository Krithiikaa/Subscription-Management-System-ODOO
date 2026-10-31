import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  CheckCircle, 
  Info
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import InvoiceFilters from './components/InvoiceFilters';
import InvoiceTable from './components/InvoiceTable';
import InvoiceModal from './components/InvoiceModal';
import InvoiceDetailsModal from './components/InvoiceDetailsModal';
import { InvoiceService } from './services/invoiceService';
import './styles/dashboard.css';

export default function App() {
  // Main state
  const [invoices, setInvoices] = useState(() => InvoiceService.getInvoices());
  const [currentTab, setCurrentTab] = useState('invoices');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'paid' | 'draft' | 'overdue'

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync state changes to persistence
  useEffect(() => {
    InvoiceService.saveInvoices(invoices);
  }, [invoices]);

  // Dynamic Metrics Computation
  const metrics = useMemo(() => {
    return InvoiceService.computeMetrics(invoices);
  }, [invoices]);

  // Next Invoice sequence
  const nextInvoiceNumber = useMemo(() => {
    return InvoiceService.generateNextInvoiceNumber(invoices);
  }, [invoices]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // 1. Status Filter
      if (statusFilter !== 'all' && (inv.status || '').toLowerCase() !== statusFilter) {
        return false;
      }

      // 2. Search Query (invoice number or customer name)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const invNum = (inv.invoiceNumber || '').toLowerCase();
        const custName = (inv.customer?.name || '').toLowerCase();
        const custEmail = (inv.customer?.email || '').toLowerCase();
        const plan = (inv.subscription?.plan || '').toLowerCase();

        return invNum.includes(query) || 
               custName.includes(query) || 
               custEmail.includes(query) ||
               plan.includes(query);
      }

      return true;
    });
  }, [invoices, statusFilter, searchQuery]);

  // Handle adding new invoice
  const handleCreateInvoice = (newInvoice) => {
    setInvoices(prev => [newInvoice, ...prev]);
    showToast(`Invoice ${newInvoice.invoiceNumber} successfully created.`);
  };

  // Handle marking invoice as paid
  const handleMarkPaid = (invoiceId) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: 'paid',
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'Manual Confirmation / Direct ACH'
        };
      }
      return inv;
    }));
    showToast('Invoice marked as Paid.');
  };

  // Handle resetting back to initial sample demo data
  const handleResetDemoData = () => {
    const freshData = InvoiceService.resetToSampleData();
    setInvoices(freshData);
    setSearchQuery('');
    setStatusFilter('all');
    showToast('Reset to original realistic sample dataset.');
  };

  // Handle resetting filters only
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  return (
    <div className="app-layout">
      {/* Sidebar Component */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        totalInvoices={invoices.length}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onToggleMobile={() => setMobileSidebarOpen(prev => !prev)}
          onResetDemoData={handleResetDemoData}
        />

        {/* Dashboard Page Body */}
        <main className="page-container" id="main-content">
          {/* Top Intro Bar */}
          <div className="page-intro">
            <div className="page-title-group">
              <h1>Invoice Generation Dashboard</h1>
              <p>
                Subscription management, billing generation, and revenue collection hub
              </p>
            </div>

            <div className="page-actions-group">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsNewModalOpen(true)}
                id="btn-new-invoice"
              >
                <Plus size={18} />
                <span>New Invoice</span>
              </button>
            </div>
          </div>

          {/* Realistic Demo Data Banner */}
          <div className="notice-banner" role="region" aria-label="Demo environment notice">
            <div className="notice-content">
              <div className="notice-icon-box" aria-hidden="true">
                <Info size={18} />
              </div>
              <div>
                <strong>Sample Demo Environment:</strong> Displaying realistic recurring subscription invoices.
                All records follow the official Odoo <code>account.move</code> and <code>sale.subscription</code> schemas.
              </div>
            </div>
            <div className="notice-badge">
              Odoo Ready • Module 1
            </div>
          </div>

          {/* Summary Metric Cards */}
          <SummaryCards
            metrics={metrics}
            activeStatus={statusFilter}
            onSelectStatus={(status) => setStatusFilter(status)}
          />

          {/* Main Invoices Section */}
          <section className="main-card" aria-label="Invoices List and Controls">
            {/* Search and Filters Toolbar */}
            <InvoiceFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              metrics={metrics}
              filteredCount={filteredInvoices.length}
              totalCount={invoices.length}
              onResetFilters={handleResetFilters}
            />

            {/* Invoices Table */}
            <InvoiceTable
              invoices={filteredInvoices}
              onViewInvoice={(inv) => setSelectedInvoice(inv)}
              onMarkPaid={handleMarkPaid}
              onResetFilters={handleResetFilters}
            />
          </section>
        </main>
      </div>

      {/* "New Invoice" Modal Form */}
      <InvoiceModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreateInvoice={handleCreateInvoice}
        nextInvoiceNumber={nextInvoiceNumber}
      />

      {/* Invoice Details Inspector Modal */}
      <InvoiceDetailsModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onMarkPaid={handleMarkPaid}
      />

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <aside className="toast-container" aria-live="polite">
          <div className="toast">
            <CheckCircle size={18} color="#74C0FC" />
            <span>{toastMessage}</span>
          </div>
        </aside>
      )}
    </div>
  );
}
