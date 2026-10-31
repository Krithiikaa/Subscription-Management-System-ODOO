import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  SearchX 
} from 'lucide-react';
import { InvoiceService } from '../services/invoiceService';

export default function InvoiceTable({ 
  invoices = [], 
  onViewInvoice, 
  onMarkPaid,
  onResetFilters 
}) {
  if (invoices.length === 0) {
    return (
      <div className="table-empty-state">
        <div className="empty-icon-box">
          <SearchX size={28} />
        </div>
        <h3 className="empty-title">No matching invoices found</h3>
        <p className="empty-desc">
          We couldn't find any invoices matching your search criteria or active status filter.
        </p>
        <button
          type="button"
          className="btn-secondary"
          onClick={onResetFilters}
          style={{ marginTop: '0.5rem' }}
        >
          Clear filters & search
        </button>
      </div>
    );
  }

  // Calculate sum of visible invoices
  const visibleTotal = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

  return (
    <div className="table-container">
      <table className="invoice-table" aria-label="Subscription Invoices">
        <thead>
          <tr>
            <th scope="col">Invoice Number</th>
            <th scope="col">Customer</th>
            <th scope="col">Subscription Plan</th>
            <th scope="col">Invoice Date</th>
            <th scope="col">Due Date</th>
            <th scope="col" style={{ textAlign: 'right' }}>Amount</th>
            <th scope="col" style={{ textAlign: 'center' }}>Status</th>
            <th scope="col" style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => {
            const isOverdue = inv.status === 'overdue';
            const isPaid = inv.status === 'paid';

            return (
              <tr key={inv.id} className="invoice-row">
                {/* 1. Invoice Number */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span 
                      className="inv-code"
                      style={{ cursor: 'pointer' }}
                      onClick={() => onViewInvoice(inv)}
                      title="Click to view invoice details"
                    >
                      {inv.invoiceNumber}
                    </span>
                    <span className="inv-odoo-badge" title="Odoo account.move ID">
                      #{inv.odooId || 'NEW'}
                    </span>
                  </div>
                </td>

                {/* 2. Customer */}
                <td>
                  <div className="customer-cell">
                    <div 
                      className="customer-avatar" 
                      style={{ backgroundColor: inv.customer?.avatarColor || '#9C8370' }}
                      aria-hidden="true"
                    >
                      {inv.customer?.initials || inv.customer?.name?.substring(0, 2).toUpperCase() || 'CU'}
                    </div>
                    <div className="customer-meta">
                      <span className="customer-name">{inv.customer?.name}</span>
                      <span className="customer-email">{inv.customer?.email}</span>
                    </div>
                  </div>
                </td>

                {/* 3. Subscription */}
                <td>
                  <div className="subscription-plan">
                    {inv.subscription?.plan || 'Standard Subscription'}
                  </div>
                  <span className="subscription-cycle">
                    {inv.subscription?.billingCycle || 'Monthly'} cycle • {inv.subscription?.code || 'SUB-REF'}
                  </span>
                </td>

                {/* 4. Invoice Date */}
                <td>
                  <span className="date-text">{InvoiceService.formatDate(inv.invoiceDate)}</span>
                </td>

                {/* 5. Due Date */}
                <td>
                  {isOverdue ? (
                    <span className="due-danger" title="Payment past due date">
                      <AlertTriangle size={13} />
                      {InvoiceService.formatDate(inv.dueDate)}
                    </span>
                  ) : (
                    <span className="date-text">{InvoiceService.formatDate(inv.dueDate)}</span>
                  )}
                </td>

                {/* 6. Amount */}
                <td style={{ textAlign: 'right' }}>
                  <span className="amount-text">
                    {InvoiceService.formatCurrency(inv.amount, inv.currency || 'USD')}
                  </span>
                </td>

                {/* 7. Status Badge */}
                <td style={{ textAlign: 'center' }}>
                  <span className={`status-badge ${inv.status}`}>
                    <span className="badge-dot" aria-hidden="true" />
                    {inv.status}
                  </span>
                </td>

                {/* 8. Actions */}
                <td style={{ textAlign: 'center' }}>
                  <div className="row-actions" style={{ justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="action-btn-icon"
                      title="View Invoice Details"
                      onClick={() => onViewInvoice(inv)}
                      aria-label={`View details for invoice ${inv.invoiceNumber}`}
                    >
                      <Eye size={15} />
                    </button>

                    {!isPaid && (
                      <button
                        type="button"
                        className="action-btn-icon"
                        title="Mark as Paid"
                        onClick={() => onMarkPaid(inv.id)}
                        aria-label={`Mark invoice ${inv.invoiceNumber} as paid`}
                        style={{ color: 'var(--status-paid-text)' }}
                      >
                        <CheckCircle2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Table Footer with visible sum */}
      <div className="table-footer">
        <div>
          Showing <strong>{invoices.length}</strong> {invoices.length === 1 ? 'record' : 'records'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>Filtered Total:</span>
          <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>
            {InvoiceService.formatCurrency(visibleTotal)}
          </strong>
        </div>
      </div>
    </div>
  );
}
