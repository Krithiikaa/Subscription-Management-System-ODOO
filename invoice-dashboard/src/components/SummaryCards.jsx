import React from 'react';
import { 
  FileStack, 
  FileEdit, 
  CheckCircle, 
  AlertCircle, 
  DollarSign, 
  Hourglass
} from 'lucide-react';
import { InvoiceService } from '../services/invoiceService';

export default function SummaryCards({ metrics, activeStatus, onSelectStatus }) {
  const {
    totalCount = 0,
    draftCount = 0,
    paidCount = 0,
    overdueCount = 0,
    totalAmount = 0,
    paidAmount = 0,
    draftAmount = 0,
    overdueAmount = 0,
    outstandingAmount = 0,
    collectionRate = 0
  } = metrics;

  return (
    <section className="summary-grid" aria-label="Invoice and Financial Metrics Overview">
      {/* 1. Total Invoices */}
      <article 
        className={`stat-card card-total ${activeStatus === 'all' ? 'active-filter' : ''}`}
        onClick={() => onSelectStatus && onSelectStatus('all')}
        style={{ cursor: 'pointer' }}
        title="Click to view all invoices"
      >
        <div className="stat-header">
          <span className="stat-label">Total Invoices</span>
          <div className="stat-icon icon-total">
            <FileStack size={18} />
          </div>
        </div>
        <div className="stat-body">
          <div className="stat-value">{totalCount}</div>
          <div className="stat-subtext">
            <span>Across all subscriptions</span>
          </div>
        </div>
        <div className="stat-footer">
          <span>{paidCount} paid • {draftCount} draft • {overdueCount} overdue</span>
        </div>
      </article>

      {/* 2. Draft */}
      <article 
        className={`stat-card card-draft ${activeStatus === 'draft' ? 'active-filter' : ''}`}
        onClick={() => onSelectStatus && onSelectStatus('draft')}
        style={{ cursor: 'pointer' }}
        title="Click to filter draft invoices"
      >
        <div className="stat-header">
          <span className="stat-label">Draft Invoices</span>
          <div className="stat-icon icon-draft">
            <FileEdit size={18} />
          </div>
        </div>
        <div className="stat-body">
          <div className="stat-value">{draftCount}</div>
          <div className="stat-subtext">
            <span>Value: {InvoiceService.formatCurrency(draftAmount)}</span>
          </div>
        </div>
        <div className="stat-footer">
          <span>Awaiting review or dispatch</span>
        </div>
      </article>

      {/* 3. Paid */}
      <article 
        className={`stat-card card-paid ${activeStatus === 'paid' ? 'active-filter' : ''}`}
        onClick={() => onSelectStatus && onSelectStatus('paid')}
        style={{ cursor: 'pointer' }}
        title="Click to filter paid invoices"
      >
        <div className="stat-header">
          <span className="stat-label">Paid Invoices</span>
          <div className="stat-icon icon-paid">
            <CheckCircle size={18} />
          </div>
        </div>
        <div className="stat-body">
          <div className="stat-value">{paidCount}</div>
          <div className="stat-subtext">
            <span>Collected: {InvoiceService.formatCurrency(paidAmount)}</span>
          </div>
        </div>
        <div className="stat-footer">
          <span>Settled through gateway / ACH</span>
        </div>
      </article>

      {/* 4. Overdue */}
      <article 
        className={`stat-card card-overdue ${activeStatus === 'overdue' ? 'active-filter' : ''}`}
        onClick={() => onSelectStatus && onSelectStatus('overdue')}
        style={{ cursor: 'pointer' }}
        title="Click to filter overdue invoices"
      >
        <div className="stat-header">
          <span className="stat-label">Overdue</span>
          <div className="stat-icon icon-overdue">
            <AlertCircle size={18} />
          </div>
        </div>
        <div className="stat-body">
          <div className="stat-value">{overdueCount}</div>
          <div className="stat-subtext" style={{ color: 'var(--status-overdue-text)' }}>
            <span>Unpaid: {InvoiceService.formatCurrency(overdueAmount)}</span>
          </div>
        </div>
        <div className="stat-footer">
          <span>Requires dunning / follow-up</span>
        </div>
      </article>

      {/* 5. Total Invoice Amount */}
      <article className="stat-card card-revenue">
        <div className="stat-header">
          <span className="stat-label">Total Invoiced</span>
          <div className="stat-icon icon-revenue">
            <DollarSign size={18} />
          </div>
        </div>
        <div className="stat-body">
          <div className="stat-value" style={{ fontSize: '1.45rem' }}>
            {InvoiceService.formatCurrency(totalAmount)}
          </div>
          <div className="stat-subtext">
            <span>Gross billed subscription revenue</span>
          </div>
        </div>
        <div className="stat-footer">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Collection rate:</span>
            <strong style={{ color: 'var(--status-paid-text)' }}>{collectionRate}%</strong>
          </div>
          <div className="progress-mini" title={`Collection Rate: ${collectionRate}%`}>
            <div 
              className="progress-bar-fill" 
              style={{ width: `${Math.min(100, Math.max(0, collectionRate))}%` }}
            />
          </div>
        </div>
      </article>

      {/* 6. Outstanding Amount */}
      <article className="stat-card card-outstanding">
        <div className="stat-header">
          <span className="stat-label">Outstanding Amount</span>
          <div className="stat-icon icon-outstanding">
            <Hourglass size={18} />
          </div>
        </div>
        <div className="stat-body">
          <div className="stat-value" style={{ fontSize: '1.45rem', color: '#B45309' }}>
            {InvoiceService.formatCurrency(outstandingAmount)}
          </div>
          <div className="stat-subtext">
            <span>Unpaid balance (Draft + Overdue)</span>
          </div>
        </div>
        <div className="stat-footer">
          <span>Overdue: {InvoiceService.formatCurrency(overdueAmount)}</span>
        </div>
      </article>
    </section>
  );
}
