import React, { useRef, useEffect, useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { DEMO_SUBSCRIPTION_PLANS } from '../data/mockInvoices';

export default function InvoiceModal({ 
  isOpen, 
  onClose, 
  onCreateInvoice, 
  nextInvoiceNumber 
}) {
  const dialogRef = useRef(null);

  const [formData, setFormData] = useState(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return {
      customerName: '',
      customerEmail: '',
      subscriptionPlan: DEMO_SUBSCRIPTION_PLANS[0],
      billingCycle: 'Annual',
      invoiceNumber: nextInvoiceNumber || 'INV-2026-009',
      invoiceDate: todayStr,
      dueDate: defaultDueDate,
      amount: '4500.00',
      status: 'draft',
      notes: 'Recurring SaaS Subscription Invoice'
    };
  });
  const [errorMsg, setErrorMsg] = useState('');

  // Synchronize modal state with native <dialog> element
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Handle native cancel (Esc key)
  const handleCancel = (e) => {
    e.preventDefault();
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.customerName.trim()) {
      setErrorMsg('Please enter a Customer Name.');
      return;
    }

    if (!formData.invoiceNumber.trim()) {
      setErrorMsg('Please enter an Invoice Number.');
      return;
    }

    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid invoice amount greater than $0.');
      return;
    }

    // Generate initials for avatar
    const nameParts = formData.customerName.trim().split(' ');
    const initials = nameParts.length > 1
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : formData.customerName.substring(0, 2).toUpperCase();

    // Assign a soft warm palette color for customer avatar
    const avatarPalette = ['#BFA588', '#8C7A6B', '#A4907C', '#9C8370', '#B09B82', '#78685A', '#957C66'];
    const randomColor = avatarPalette[Math.floor(Math.random() * avatarPalette.length)];

    const newInvoice = {
      id: `inv-${Date.now()}`,
      odooId: Math.floor(100 + Math.random() * 900),
      invoiceNumber: formData.invoiceNumber.trim(),
      customer: {
        name: formData.customerName.trim(),
        email: formData.customerEmail.trim() || `contact@${formData.customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        avatarColor: randomColor,
        initials: initials,
        type: 'Subscription Client',
        odooPartnerId: Math.floor(100 + Math.random() * 900)
      },
      subscription: {
        plan: formData.subscriptionPlan.split('(')[0].trim(),
        billingCycle: formData.billingCycle,
        code: `SUB-${formData.billingCycle.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`,
        seats: 10
      },
      invoiceDate: formData.invoiceDate,
      dueDate: formData.dueDate,
      amount: numAmount,
      currency: 'USD',
      status: formData.status,
      paymentDate: formData.status === 'paid' ? (new Date().toISOString().split('T')[0]) : null,
      paymentMethod: formData.status === 'paid' ? 'Stripe Gateway' : 'Awaiting Payment',
      notes: formData.notes
    };

    onCreateInvoice(newInvoice);
    setFormData({
      customerName: '',
      customerEmail: '',
      subscriptionPlan: DEMO_SUBSCRIPTION_PLANS[0],
      billingCycle: 'Annual',
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: '4500.00',
      status: 'draft',
      notes: 'Recurring SaaS Subscription Invoice'
    });
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="custom-modal"
      onCancel={handleCancel}
      aria-labelledby="new-invoice-title"
    >
      <div className="modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-titles">
            <h2 id="new-invoice-title">Generate New Invoice</h2>
            <p>Create a subscription invoice formatted for Odoo account.move</p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errorMsg && (
              <div 
                style={{
                  background: 'var(--status-overdue-bg)',
                  color: 'var(--status-overdue-text)',
                  border: '1px solid var(--status-overdue-border)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Row 1: Customer Details */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="inv-customer-name">
                  Customer / Company Name <span className="req">*</span>
                </label>
                <input
                  id="inv-customer-name"
                  type="text"
                  name="customerName"
                  className="form-input"
                  placeholder="e.g. Acme Global or Jane Doe"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="inv-customer-email">
                  Billing Email
                </label>
                <input
                  id="inv-customer-email"
                  type="email"
                  name="customerEmail"
                  className="form-input"
                  placeholder="billing@company.com"
                  value={formData.customerEmail}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Row 2: Subscription Plan & Billing Cycle */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="inv-subscription-plan">
                  Subscription Plan
                </label>
                <select
                  id="inv-subscription-plan"
                  name="subscriptionPlan"
                  className="form-select"
                  value={formData.subscriptionPlan}
                  onChange={handleChange}
                >
                  {DEMO_SUBSCRIPTION_PLANS.map((plan, idx) => (
                    <option key={idx} value={plan}>{plan}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="inv-billing-cycle">
                  Billing Cycle
                </label>
                <select
                  id="inv-billing-cycle"
                  name="billingCycle"
                  className="form-select"
                  value={formData.billingCycle}
                  onChange={handleChange}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annual">Annual</option>
                </select>
              </div>
            </div>

            {/* Row 3: Invoice Number & Amount */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="inv-number">
                  Invoice Number <span className="req">*</span>
                </label>
                <input
                  id="inv-number"
                  type="text"
                  name="invoiceNumber"
                  className="form-input"
                  placeholder="INV-2026-001"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  required
                />
                <span className="form-hint">Auto-sequenced or custom reference</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="inv-amount">
                  Amount ($ USD) <span className="req">*</span>
                </label>
                <input
                  id="inv-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  name="amount"
                  className="form-input"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Row 4: Dates & Initial Status */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="inv-date">
                  Invoice Date
                </label>
                <input
                  id="inv-date"
                  type="date"
                  name="invoiceDate"
                  className="form-input"
                  value={formData.invoiceDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="inv-due-date">
                  Due Date
                </label>
                <input
                  id="inv-due-date"
                  type="date"
                  name="dueDate"
                  className="form-input"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Row 5: Status Selection & Odoo Reference */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="inv-status">
                  Initial Status
                </label>
                <select
                  id="inv-status"
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="draft">Draft (Awaiting Dispatch)</option>
                  <option value="paid">Paid (Settled)</option>
                  <option value="overdue">Overdue (Payment Past Due)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Odoo Schema Target
                </label>
                <div style={{ padding: '0.55rem 0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="odoo-field-badge">account.move</span>
                  <span style={{ color: 'var(--text-muted)' }}>out_invoice</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label" htmlFor="inv-notes">
                Invoice Notes & Terms
              </label>
              <textarea
                id="inv-notes"
                name="notes"
                rows="2"
                className="form-textarea"
                placeholder="Payment terms, PO numbers or subscription line item details..."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              <Plus size={16} />
              <span>Create Invoice</span>
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
