import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Repeat, 
  Users, 
  CreditCard, 
  X, 
  Layers 
} from 'lucide-react';

export default function Sidebar({ 
  currentTab = 'invoices', 
  onSelectTab, 
  mobileOpen = false, 
  onCloseMobile,
  totalInvoices = 0
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices', label: 'Invoices', icon: FileText, badge: totalInvoices },
    { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard }
  ];

  return (
    <>
      <aside 
        className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}
        aria-label="Main Navigation"
      >
        {/* Sidebar Brand Header */}
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="brand-logo" aria-hidden="true">
              SD
            </div>
            <div className="brand-info">
              <span className="brand-title">Subscription Desk</span>
              <span className="brand-subtitle">Billing & Invoicing</span>
            </div>
          </div>
          <button 
            type="button" 
            className="sidebar-close-btn" 
            onClick={onCloseMobile}
            aria-label="Close navigation sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">Billing & Operations</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="nav-item-icon">
                  <Icon size={18} />
                </span>
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="nav-item-badge">{item.badge}</span>
                )}
              </button>
            );
          })}

          <div className="nav-section-title" style={{ marginTop: '1.25rem' }}>Integration Specs</div>
          <div 
            className="nav-item" 
            style={{ fontSize: '0.8rem', opacity: 0.85, cursor: 'default' }}
            title="Module 1: Invoice Generation Dashboard is currently loaded. Ready for Odoo XML-RPC / JSON-RPC endpoint."
          >
            <span className="nav-item-icon">
              <Layers size={16} />
            </span>
            <span>Module 1: Invoicing</span>
          </div>
        </nav>

        {/* Sidebar Footer with Odoo Connector Status & User Info */}
        <div className="sidebar-footer">
          <div className="odoo-status-pill" title="Code structured for Odoo 16/17/18 account.move integration">
            <div className="odoo-dot" aria-hidden="true" />
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Odoo Connector:</span>
            <span style={{ color: 'var(--text-muted)' }}>Ready (Mock)</span>
          </div>

          <div className="user-card">
            <div className="user-avatar" title="Current Active User">
              AV
            </div>
            <div className="user-info">
              <span className="user-name">Archana Admin</span>
              <span className="user-role">Finance Director</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      <div 
        className={`mobile-backdrop ${mobileOpen ? 'open' : ''}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />
    </>
  );
}
