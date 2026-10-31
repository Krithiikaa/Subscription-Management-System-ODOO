import React, { useRef, useEffect, useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Copy, Code, Check } from 'lucide-react';
import { InvoiceService } from '../services/invoiceService';

export default function InvoiceDetailsModal({ 
  invoice, 
  onClose, 
  onMarkPaid 
}) {
  const dialogRef = useRef(null);
  const [showOdooJson, setShowOdooJson] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (invoice) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [invoice]);

  if (!invoice) return null;

  const handleCancel = (e) => {
    e.preventDefault();
    onClose();
  };

  const odooPayload = InvoiceService.toOdooPayload(invoice);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(odooPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <dialog
      ref={dialogRef}
      className="custom-modal"
      onCancel={handleCancel}
      aria-labelledby="invoice-details-title"
    >
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-header-titles">
            <h2 id="invoice-details-title">Invoice Details: {invoice.invoiceNumber}</h2>
            <p>Odoo Model: account.move • ID #{invoice.odooId || '101'}</p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Status and Summary Header */}
          <div 
            style={{
              padding: '1rem',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                Total Invoiced
              </span>
              <strong style={{ fontSize: '1.45rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                {InvoiceService.formatCurrency(invoice.amount, invoice.currency)}
              </strong>
            </div>

            <span className={`status-badge ${invoice.status}`}>
              <span className="badge-dot" aria-hidden="true" />
              {invoice.status}
            </span>
          </div>

          {/* Customer & Subscription Information */}
          <div className="form-grid-2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span className="form-label">Customer / Partner</span>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                {invoice.customer?.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {invoice.customer?.email}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-caramel)' }}>
                Type: {invoice.customer?.type || 'Standard Customer'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span className="form-label">Subscription Contract</span>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                {invoice.subscription?.plan}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Cycle: {invoice.subscription?.billingCycle} • Ref: {invoice.subscription?.code}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Licensed Seats: {invoice.subscription?.seats || 1} users
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="form-grid-2">
            <div>
              <span className="form-label">Invoice Date</span>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {InvoiceService.formatDate(invoice.invoiceDate)}
              </div>
            </div>

            <div>
              <span className="form-label">Payment Due Date</span>
              <div style={{ fontSize: '0.88rem', marginTop: '0.2rem' }}>
                {invoice.status === 'overdue' ? (
                  <span className="due-danger">
                    <AlertTriangle size={14} />
                    {InvoiceService.formatDate(invoice.dueDate)} (Past Due)
                  </span>
                ) : (
                  <span>{InvoiceService.formatDate(invoice.dueDate)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div>
            <span className="form-label">Payment Information</span>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Method: <strong>{invoice.paymentMethod || 'Awaiting Payment'}</strong>
              {invoice.paymentDate && (
                <span> (Settled on {InvoiceService.formatDate(invoice.paymentDate)})</span>
              )}
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div>
              <span className="form-label">Notes & Terms</span>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'var(--bg-canvas)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginTop: '0.25rem' }}>
                {invoice.notes}
              </p>
            </div>
          )}

          {/* Odoo Schema Inspector Section */}
          <div style={{ marginTop: '0.5rem', borderTop: '1px dashed var(--border-medium)', paddingTop: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                onClick={() => setShowOdooJson(!showOdooJson)}
              >
                <Code size={13} />
                <span>{showOdooJson ? 'Hide Odoo RPC Payload' : 'View Odoo RPC Payload'}</span>
              </button>

              {showOdooJson && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                  onClick={handleCopyJson}
                >
                  {copied ? <Check size={13} color="green" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              )}
            </div>

            {showOdooJson && (
              <pre
                style={{
                  background: '#231F1D',
                  color: '#E6DECE',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.75rem',
                  overflowX: 'auto',
                  fontFamily: 'monospace'
                }}
              >
                {JSON.stringify(odooPayload, null, 2)}
              </pre>
            )}
          </div>
        </div>

        <div className="modal-footer">
          {invoice.status !== 'paid' && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                onMarkPaid(invoice.id);
                onClose();
              }}
              style={{ background: 'var(--status-paid-text)' }}
            >
              <CheckCircle2 size={16} />
              <span>Mark as Paid</span>
            </button>
          )}

          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
