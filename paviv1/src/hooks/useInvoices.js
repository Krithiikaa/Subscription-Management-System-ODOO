import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import { DEMO_INVOICES, DEMO_CUSTOMERS, DEMO_SUBSCRIPTIONS, DEMO_PAYMENTS } from '../lib/demoData';

const DEMO_INVOICES_STORAGE_KEY = 'brightloop_demo_invoices_custom';
const DEMO_PAYMENTS_STORAGE_KEY = 'brightloop_demo_payments_custom';
const DEMO_SUBSCRIPTIONS_STORAGE_KEY = 'brightloop_demo_subscriptions_custom';

export function useInvoices() {
  const { user, role: currentUserRole } = useAuth();
  const { isDemoMode } = useDemoMode();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | paid | pending | overdue | draft | cancelled
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Load Invoices
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (isDemoMode) {
      try {
        const stored = localStorage.getItem(DEMO_INVOICES_STORAGE_KEY);
        let list = stored ? JSON.parse(stored) : null;

        if (!list || !Array.isArray(list) || list.length === 0) {
          list = DEMO_INVOICES.map((inv, index) => {
            const customer = DEMO_CUSTOMERS.find((c) => c.id === inv.customerId);
            const subscription = DEMO_SUBSCRIPTIONS.find((s) => s.id === inv.subscriptionId);

            // Reconstruct 9% CGST and 9% SGST accurately from 18% GST
            const taxable = Number(inv.amount || 0);
            const cgst = Math.round((taxable * 0.09) * 100) / 100;
            const sgst = Math.round((taxable * 0.09) * 100) / 100;
            const totalTax = cgst + sgst;
            const grandTotal = taxable + totalTax;

            return {
              ...inv,
              invoiceNumber: inv.number,
              customerName: customer?.name || inv.customerName,
              customerCompany: customer?.company || `${inv.customerName} Pvt Ltd`,
              customerEmail: customer?.email || `accounts@${inv.customerName?.toLowerCase().replace(/\s+/g, '')}.in`,
              customerPhone: customer?.phone || '+91 98400 11000',
              customerGstin: customer?.gstin || `33DEMO00${String(index + 1).padStart(2, '0')}A1Z${(index % 9) + 1}`,
              customerAddress: customer?.address || 'T. Nagar, Chennai',
              customerCity: customer?.city || 'Chennai',
              customerState: customer?.state || 'Tamil Nadu',
              subscriptionNumber: subscription?.subscriptionNumber || `SUB-2026-BL-${String(index + 1).padStart(3, '0')}`,
              planName: subscription?.planName || 'Enterprise Scale Subscription',
              subtotal: taxable,
              cgstAmount: cgst,
              sgstAmount: sgst,
              totalTax: totalTax,
              totalAmount: grandTotal,
              paymentMethod: inv.method || 'UPI AutoPay',
              notes: 'Recurring SaaS Billing under HSN/SAC Code 997331. Monthly Cloud Platform usage.',
              items: [
                {
                  id: `it-${inv.id}-1`,
                  productName: subscription?.planName || 'Brightloop Enterprise SaaS License',
                  sacCode: '997331',
                  quantity: 1,
                  unitPrice: taxable,
                  discountPercent: 0,
                  lineTotal: taxable,
                },
              ],
            };
          });
          localStorage.setItem(DEMO_INVOICES_STORAGE_KEY, JSON.stringify(list));
        }

        setInvoices(list);
      } catch (err) {
        console.error('Error reading demo invoices:', err);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Live Supabase Mode
    if (!isSupabaseConfigured()) {
      setError('Supabase credentials are not configured.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchErr } = await supabase
        .from('invoices')
        .select(`
          *,
          items:invoice_items(*)
        `)
        .order('issue_date', { ascending: false });

      if (fetchErr) throw fetchErr;

      setInvoices(
        (data || []).map((row) => ({
          id: row.id,
          invoiceNumber: row.invoice_number,
          number: row.invoice_number,
          subscriptionId: row.subscription_id,
          customerId: row.customer_id,
          customerName: row.customer_name,
          customerCompany: row.customer_company,
          customerEmail: row.customer_email,
          customerGstin: row.customer_gstin,
          customerAddress: row.customer_address,
          customerCity: row.customer_city,
          customerState: row.customer_state,
          issueDate: row.issue_date,
          dueDate: row.due_date,
          paidDate: row.paid_date,
          subtotal: Number(row.subtotal || 0),
          cgstAmount: Number(row.cgst_amount || 0),
          sgstAmount: Number(row.sgst_amount || 0),
          totalTax: Number(row.total_tax || 0),
          totalAmount: Number(row.total_amount || 0),
          status: row.status,
          paymentMethod: row.payment_method,
          notes: row.notes,
          terms: row.terms,
          items: (row.items || []).map((it) => ({
            id: it.id,
            productId: it.product_id,
            productName: it.product_name,
            sacCode: it.hsn_sac_code || '997331',
            quantity: it.quantity,
            unitPrice: Number(it.unit_price || 0),
            discountPercent: Number(it.discount_percent || 0),
            lineTotal: Number(it.line_total || 0),
          })),
        }))
      );
    } catch (err) {
      console.error('Error fetching invoices from Supabase:', err);
      setError(err.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Create Invoice
  const createInvoice = async (formData) => {
    setError(null);
    setSuccessMsg(null);

    const items = formData.items || [];
    const subtotal = items.reduce((acc, it) => acc + (Number(it.lineTotal) || 0), 0);
    const cgstAmount = Math.round((subtotal * 0.09) * 100) / 100;
    const sgstAmount = Math.round((subtotal * 0.09) * 100) / 100;
    const totalTax = cgstAmount + sgstAmount;
    const totalAmount = subtotal + totalTax;

    if (isDemoMode) {
      try {
        const nextIdx = invoices.length + 1;
        const newInvoiceNumber = `INV-2026-BL-${String(nextIdx).padStart(3, '0')}`;

        const newInvoice = {
          id: `inv-custom-${Date.now()}`,
          number: newInvoiceNumber,
          invoiceNumber: newInvoiceNumber,
          subscriptionId: formData.subscriptionId || null,
          subscriptionNumber: formData.subscriptionNumber || 'On-Demand / One-Off',
          customerId: formData.customerId,
          customerName: formData.customerName,
          customerCompany: formData.customerCompany || '',
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone || '',
          customerGstin: formData.customerGstin || '33DEMO9999A1Z9',
          customerAddress: formData.customerAddress || 'Tamil Nadu',
          customerCity: formData.customerCity || 'Chennai',
          customerState: formData.customerState || 'Tamil Nadu',
          issueDate: formData.issueDate || new Date().toISOString().split('T')[0],
          dueDate: formData.dueDate,
          paidDate: formData.status === 'paid' ? new Date().toISOString().split('T')[0] : null,
          subtotal,
          cgstAmount,
          sgstAmount,
          totalTax,
          totalAmount,
          status: formData.status || 'draft',
          paymentMethod: formData.paymentMethod || (formData.status === 'paid' ? 'UPI AutoPay' : null),
          notes: formData.notes || 'Official GST Tax Invoice issued by Brightloop Technologies Pvt Ltd',
          terms: formData.terms || '18% GST applicable under SAC Code 997331. Payment due within specified due date.',
          items: items.map((it, idx) => ({
            id: `item-${Date.now()}-${idx}`,
            productName: it.productName,
            sacCode: it.sacCode || '997331',
            quantity: Number(it.quantity) || 1,
            unitPrice: Number(it.unitPrice) || 0,
            discountPercent: Number(it.discountPercent) || 0,
            lineTotal: Number(it.lineTotal) || 0,
          })),
        };

        const updated = [newInvoice, ...invoices];
        setInvoices(updated);
        localStorage.setItem(DEMO_INVOICES_STORAGE_KEY, JSON.stringify(updated));
        setSuccessMsg(`Invoice ${newInvoiceNumber} created successfully.`);
        return { success: true, data: newInvoice };
      } catch (err) {
        setError(err.message || 'Failed to create invoice in demo mode');
        return { success: false, error: err.message };
      }
    }

    // Live Supabase Mode
    try {
      const nextIdx = invoices.length + 1;
      const invoiceNumber = `INV-2026-BL-${String(nextIdx).padStart(3, '0')}`;

      const { data: invRow, error: invErr } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          subscription_id: formData.subscriptionId || null,
          customer_id: formData.customerId,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_company: formData.customerCompany || null,
          customer_gstin: formData.customerGstin || null,
          customer_address: formData.customerAddress || null,
          customer_city: formData.customerCity || null,
          customer_state: formData.customerState || 'Tamil Nadu',
          issue_date: formData.issueDate || new Date().toISOString().split('T')[0],
          due_date: formData.dueDate,
          paid_date: formData.status === 'paid' ? new Date().toISOString().split('T')[0] : null,
          subtotal,
          cgst_amount: cgstAmount,
          sgst_amount: sgstAmount,
          total_tax: totalTax,
          total_amount: totalAmount,
          status: formData.status || 'draft',
          payment_method: formData.paymentMethod || null,
          notes: formData.notes || null,
        })
        .select()
        .single();

      if (invErr) throw invErr;

      // Insert line items
      if (items.length > 0) {
        const itemRows = items.map((it) => ({
          invoice_id: invRow.id,
          product_id: it.productId || null,
          product_name: it.productName,
          hsn_sac_code: it.sacCode || '997331',
          quantity: it.quantity,
          unit_price: it.unitPrice,
          discount_percent: it.discountPercent || 0,
          line_total: it.lineTotal,
        }));

        const { error: itemsErr } = await supabase.from('invoice_items').insert(itemRows);
        if (itemsErr) throw itemsErr;
      }

      await fetchInvoices();
      setSuccessMsg(`Invoice ${invoiceNumber} created successfully.`);
      return { success: true, data: invRow };
    } catch (err) {
      setError(err.message || 'Failed to create invoice');
      return { success: false, error: err.message };
    }
  };

  // Update Status
  const updateInvoiceStatus = async (invoiceId, newStatus) => {
    setError(null);
    setSuccessMsg(null);

    if (isDemoMode) {
      const updated = invoices.map((inv) => {
        if (inv.id === invoiceId) {
          const isNowPaid = newStatus === 'paid';
          return {
            ...inv,
            status: newStatus,
            paidDate: isNowPaid ? (inv.paidDate || new Date().toISOString().split('T')[0]) : (newStatus === 'draft' || newStatus === 'pending' ? null : inv.paidDate),
          };
        }
        return inv;
      });

      setInvoices(updated);
      localStorage.setItem(DEMO_INVOICES_STORAGE_KEY, JSON.stringify(updated));
      setSuccessMsg(`Invoice status updated to ${newStatus.toUpperCase()}.`);
      return { success: true };
    }

    try {
      const isNowPaid = newStatus === 'paid';
      const updatePayload = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      if (isNowPaid) {
        updatePayload.paid_date = new Date().toISOString().split('T')[0];
      }

      const { error: updErr } = await supabase
        .from('invoices')
        .update(updatePayload)
        .eq('id', invoiceId);

      if (updErr) throw updErr;

      await fetchInvoices();
      setSuccessMsg(`Invoice status updated to ${newStatus.toUpperCase()}.`);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to update status');
      return { success: false, error: err.message };
    }
  };

  // Record Payment for Invoice
  const recordPaymentForInvoice = async (invoiceId, paymentInfo) => {
    setError(null);
    setSuccessMsg(null);

    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return { success: false, error: 'Invoice not found' };

    const paymentAmount = Number(paymentInfo.amount) || Number(invoice.totalAmount);
    const txnRef = paymentInfo.txnRef || `TXN-IN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentMethod = paymentInfo.paymentMethod || 'UPI AutoPay';
    const gateway = paymentInfo.gateway || 'Razorpay UPI AutoPay';
    const paymentDate = paymentInfo.paymentDate || new Date().toISOString();

    if (isDemoMode) {
      // 1. Mark Invoice as paid
      const updatedInvoices = invoices.map((inv) => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            status: 'paid',
            paidDate: paymentDate.split('T')[0],
            paymentMethod,
          };
        }
        return inv;
      });
      setInvoices(updatedInvoices);
      localStorage.setItem(DEMO_INVOICES_STORAGE_KEY, JSON.stringify(updatedInvoices));

      // 2. Add to Payments ledger
      try {
        const storedPayments = localStorage.getItem(DEMO_PAYMENTS_STORAGE_KEY);
        let paymentsList = storedPayments ? JSON.parse(storedPayments) : DEMO_PAYMENTS;
        const newPaymentRecord = {
          id: `pay-custom-${Date.now()}`,
          txnRef,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber || invoice.number,
          customerId: invoice.customerId,
          customerName: invoice.customerName,
          amount: paymentAmount,
          method: paymentMethod,
          gateway,
          status: 'succeeded',
          date: paymentDate,
          gstinRef: invoice.customerGstin || '33DEMO0001A1Z1',
          notes: paymentInfo.notes || 'Full settlement received via payment gateway',
        };
        paymentsList = [newPaymentRecord, ...paymentsList];
        localStorage.setItem(DEMO_PAYMENTS_STORAGE_KEY, JSON.stringify(paymentsList));
      } catch (e) {
        console.warn('Could not update demo payments storage:', e);
      }

      setSuccessMsg(`Payment of ₹${paymentAmount.toLocaleString('en-IN')} recorded against ${invoice.invoiceNumber || invoice.number}. Status marked as PAID.`);
      return { success: true, txnRef };
    }

    // Live Supabase Mode
    try {
      // 1. Insert Payment
      const { data: payRow, error: payErr } = await supabase
        .from('payments')
        .insert({
          txn_ref: txnRef,
          invoice_id: invoiceId,
          customer_id: invoice.customerId,
          customer_name: invoice.customerName,
          amount: paymentAmount,
          payment_method: paymentMethod,
          payment_gateway: gateway,
          gstin_ref: invoice.customerGstin,
          status: 'succeeded',
          notes: paymentInfo.notes || null,
        })
        .select()
        .single();

      if (payErr) throw payErr;

      // 2. Update Invoice to Paid
      const { error: invErr } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          paid_date: paymentDate.split('T')[0],
          payment_method: paymentMethod,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId);

      if (invErr) throw invErr;

      await fetchInvoices();
      setSuccessMsg(`Payment recorded successfully with reference ${txnRef}.`);
      return { success: true, txnRef };
    } catch (err) {
      setError(err.message || 'Failed to record payment');
      return { success: false, error: err.message };
    }
  };

  // Generate Invoice from Active Subscription
  const generateInvoiceFromSubscription = async (sub) => {
    setError(null);
    setSuccessMsg(null);

    const taxable = Number(sub.totalAmount || sub.amount || 0);
    const issueDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

    const invoiceData = {
      subscriptionId: sub.id,
      subscriptionNumber: sub.subscriptionNumber || sub.id,
      customerId: sub.customerId,
      customerName: sub.customerName,
      customerEmail: sub.customerEmail,
      customerCompany: sub.customerCompany,
      customerPhone: sub.customerPhone,
      customerGstin: sub.customerGstin,
      issueDate,
      dueDate,
      status: 'pending',
      paymentMethod: 'UPI AutoPay (Scheduled)',
      notes: `Recurring subscription billing for cycle ${sub.billingCycle || 'Monthly'}. Linked to ${sub.subscriptionNumber || sub.id}.`,
      items: [
        {
          productName: `${sub.planName} (${sub.billingCycle || 'Monthly'} Cycle)`,
          sacCode: '997331',
          quantity: sub.quantity || 1,
          unitPrice: taxable,
          discountPercent: 0,
          lineTotal: taxable,
        },
      ],
    };

    return await createInvoice(invoiceData);
  };

  // Automated Recurring Billing Batch Run
  const runRecurringBillingAutomation = async () => {
    setError(null);
    setSuccessMsg(null);

    if (isDemoMode) {
      try {
        const storedSubs = localStorage.getItem(DEMO_SUBSCRIPTIONS_STORAGE_KEY);
        const subs = storedSubs ? JSON.parse(storedSubs) : DEMO_SUBSCRIPTIONS;

        const activeSubs = subs.filter((s) => s.status === 'active' || s.status === 'in_trial');
        let generatedCount = 0;

        for (const sub of activeSubs.slice(0, 3)) {
          // Generate 1-3 cycle invoices for demo demonstration
          await generateInvoiceFromSubscription(sub);
          generatedCount++;
        }

        setSuccessMsg(`Automated Billing Engine executed: Generated ${generatedCount} cycle invoices for active subscriptions with next-period renewal stamps.`);
        return { success: true, count: generatedCount };
      } catch (err) {
        setError('Automated billing run failed');
        return { success: false, error: err.message };
      }
    }

    // Live Supabase Mode
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: dueSubs, error: subsErr } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active')
        .lte('next_billing_date', today);

      if (subsErr) throw subsErr;

      let generatedCount = 0;
      for (const sub of dueSubs || []) {
        await generateInvoiceFromSubscription(sub);
        // Advance next_billing_date by 1 month
        const nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth() + 1);
        await supabase
          .from('subscriptions')
          .update({
            next_billing_date: nextDate.toISOString().split('T')[0],
            updated_at: new Date().toISOString(),
          })
          .eq('id', sub.id);
        generatedCount++;
      }

      setSuccessMsg(`Automated Billing processed ${generatedCount} subscriptions due for renewal.`);
      return { success: true, count: generatedCount };
    } catch (err) {
      setError(err.message || 'Billing automation error');
      return { success: false, error: err.message };
    }
  };

  // Generate Official Indian GST Tax Invoice PDF
  const generateInvoicePdf = (invoice) => {
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
      alert('Please allow popups to view and download the GST Tax Invoice.');
      return;
    }

    const formatINR = (val) =>
      Number(val || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const isPaid = invoice.status === 'paid';
    const isOverdue = invoice.status === 'overdue';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>GST Tax Invoice - ${invoice.invoiceNumber || invoice.number}</title>
          <style>
            @page {
              size: A4;
              margin: 14mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #1c1917;
              background: #ffffff;
              padding: 24px;
              line-height: 1.45;
              font-size: 13px;
            }
            .header-banner {
              border-bottom: 2px solid #ea580c;
              padding-bottom: 14px;
              margin-bottom: 18px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .brand-title {
              font-size: 22px;
              font-weight: 800;
              color: #ea580c;
              letter-spacing: -0.02em;
              margin: 0 0 4px 0;
            }
            .tax-badge {
              display: inline-block;
              background: #fff7ed;
              color: #c2410c;
              border: 1px solid #fed7aa;
              font-size: 11px;
              font-weight: 700;
              padding: 3px 10px;
              border-radius: 4px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 6px;
            }
            .status-stamp {
              display: inline-block;
              padding: 6px 14px;
              border-radius: 6px;
              font-weight: 800;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              ${isPaid
                ? 'background: #ecfdf5; color: #047857; border: 2px solid #10b981;'
                : isOverdue
                ? 'background: #fef2f2; color: #b91c1c; border: 2px solid #ef4444;'
                : 'background: #eff6ff; color: #1d4ed8; border: 2px solid #3b82f6;'
              }
            }
            .grid-2 {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
            }
            .card {
              background: #fafaf9;
              border: 1px solid #e7e5e4;
              border-radius: 6px;
              padding: 12px 14px;
            }
            .card h4 {
              margin: 0 0 8px 0;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.06em;
              color: #78716c;
            }
            .table-invoice {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .table-invoice th {
              background: #f5f5f4;
              color: #44403c;
              border: 1px solid #e7e5e4;
              padding: 8px 10px;
              text-align: left;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .table-invoice td {
              border: 1px solid #e7e5e4;
              padding: 8px 10px;
              font-size: 12.5px;
            }
            .text-right {
              text-align: right;
            }
            .totals-container {
              display: flex;
              justify-content: flex-end;
              margin-top: 10px;
            }
            .totals-table {
              width: 380px;
              border-collapse: collapse;
            }
            .totals-table td {
              padding: 6px 10px;
              border-bottom: 1px solid #f5f5f4;
              font-size: 12.5px;
            }
            .grand-total-row td {
              border-top: 2px solid #ea580c;
              border-bottom: 2px solid #ea580c;
              font-size: 15px;
              font-weight: 800;
              color: #ea580c;
              padding: 10px;
              background: #fff7ed;
            }
            .bank-details {
              margin-top: 24px;
              padding: 12px 14px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              font-size: 11.5px;
              color: #334155;
            }
            .footer-sign {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 36px;
              padding-top: 18px;
              border-top: 1px solid #e7e5e4;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 16px; text-align: right;">
            <button onclick="window.print()" style="background: #ea580c; color: white; border: none; padding: 8px 16px; font-weight: bold; border-radius: 6px; cursor: pointer;">
              🖨️ Print / Save as PDF
            </button>
          </div>

          <div class="header-banner">
            <div>
              <span class="tax-badge">Original Tax Invoice &bull; Form GST INV-1</span>
              <h1 class="brand-title">BRIGHTLOOP TECHNOLOGIES PVT LTD</h1>
              <p style="margin: 2px 0; color: #57534e; font-size: 12px;">
                Software-as-a-Service &bull; Cloud Subscription Infrastructure<br>
                42, North Usman Road, T. Nagar, Chennai, Tamil Nadu – 600017<br>
                <strong>GSTIN:</strong> 33AABCB1234F1Z9 &bull; <strong>PAN:</strong> AABCB1234F &bull; <strong>State Code:</strong> 33 (Tamil Nadu)
              </p>
            </div>
            <div style="text-align: right;">
              <span class="status-stamp">${invoice.status || 'PENDING'}</span>
              <h2 style="margin: 8px 0 2px 0; font-size: 16px; font-weight: 700;">${invoice.invoiceNumber || invoice.number}</h2>
              <p style="margin: 2px 0; font-size: 12px; color: #57534e;">
                Date of Issue: <strong>${invoice.issueDate || '-'}</strong><br>
                Due Date: <strong>${invoice.dueDate || '-'}</strong><br>
                ${invoice.paidDate ? `Settled on: <strong>${invoice.paidDate}</strong>` : ''}
              </p>
            </div>
          </div>

          <div class="grid-2">
            <div class="card">
              <h4>Billed To (Client / Recipient):</h4>
              <p style="font-weight: 700; margin: 0 0 2px 0; font-size: 14px;">${invoice.customerCompany || invoice.customerName}</p>
              <p style="margin: 2px 0;">Attn: ${invoice.customerName}</p>
              <p style="margin: 2px 0;">${invoice.customerAddress || 'Tamil Nadu, India'}</p>
              <p style="margin: 2px 0;">${invoice.customerCity || 'Chennai'}, ${invoice.customerState || 'Tamil Nadu'}</p>
              <p style="margin: 4px 0 0 0; font-family: monospace;"><strong>GSTIN:</strong> ${invoice.customerGstin || 'Unregistered Consumer'}</p>
              <p style="margin: 2px 0; font-family: monospace;"><strong>Email:</strong> ${invoice.customerEmail}</p>
            </div>

            <div class="card">
              <h4>Supply & Billing Details:</h4>
              <p style="margin: 2px 0;"><strong>Place of Supply:</strong> Tamil Nadu (Code 33)</p>
              <p style="margin: 2px 0;"><strong>Reverse Charge Applicable:</strong> No</p>
              <p style="margin: 2px 0;"><strong>Linked Subscription:</strong> ${invoice.subscriptionNumber || 'On-Demand Service'}</p>
              <p style="margin: 2px 0;"><strong>Payment Terms:</strong> Net 15 Days</p>
              <p style="margin: 2px 0;"><strong>Settlement Method:</strong> ${invoice.paymentMethod || 'Awaiting Clearance'}</p>
            </div>
          </div>

          <table class="table-invoice">
            <thead>
              <tr>
                <th style="width: 32px;">#</th>
                <th>Service Description</th>
                <th style="width: 80px;">SAC Code</th>
                <th class="text-right" style="width: 50px;">Qty</th>
                <th class="text-right" style="width: 100px;">Rate (₹)</th>
                <th class="text-right" style="width: 60px;">Disc %</th>
                <th class="text-right" style="width: 110px;">Taxable (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${(invoice.items || []).map((it, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>
                    <strong>${it.productName}</strong>
                    <div style="font-size: 11px; color: #78716c;">Cloud SaaS software license access & platform maintenance</div>
                  </td>
                  <td>${it.sacCode || '997331'}</td>
                  <td class="text-right">${it.quantity || 1}</td>
                  <td class="text-right">${formatINR(it.unitPrice)}</td>
                  <td class="text-right">${it.discountPercent || 0}%</td>
                  <td class="text-right">${formatINR(it.lineTotal)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals-container">
            <table class="totals-table">
              <tr>
                <td>Taxable Subtotal (INR):</td>
                <td class="text-right">₹${formatINR(invoice.subtotal)}</td>
              </tr>
              <tr>
                <td>CGST (Central Tax @ 9.0%):</td>
                <td class="text-right">₹${formatINR(invoice.cgstAmount)}</td>
              </tr>
              <tr>
                <td>SGST (State Tax @ 9.0%):</td>
                <td class="text-right">₹${formatINR(invoice.sgstAmount)}</td>
              </tr>
              <tr>
                <td>Total GST Applicable (18.0%):</td>
                <td class="text-right">₹${formatINR(invoice.totalTax)}</td>
              </tr>
              <tr class="grand-total-row">
                <td>Grand Total (INR):</td>
                <td class="text-right">₹${formatINR(invoice.totalAmount)}</td>
              </tr>
            </table>
          </div>

          <div class="bank-details">
            <h4 style="margin: 0 0 6px 0; color: #1e293b; font-size: 11px; text-transform: uppercase;">Bank Remittance / NEFT / RTGS Details:</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <strong>Account Name:</strong> Brightloop Technologies Pvt Ltd<br>
                <strong>Bank Name:</strong> HDFC Bank Ltd (T. Nagar Branch)<br>
                <strong>Account Number:</strong> 50200088991122
              </div>
              <div>
                <strong>IFSC Code:</strong> HDFC0000128<br>
                <strong>UPI VPA:</strong> brightloop@hdfcbank<br>
                <strong>Corporate PAN:</strong> AABCB1234F
              </div>
            </div>
          </div>

          <div style="margin-top: 14px; font-size: 11px; color: #78716c;">
            <strong>Declaration:</strong> Certified that the particulars given above are true and correct, and the amount indicated represents the price actually charged for digital cloud software access.
          </div>

          <div class="footer-sign">
            <div>
              <p style="font-size: 11px; color: #a8a29e; margin: 0;">
                Generated electronically by Brightloop Software Billing Engine &bull; Ref: ${invoice.id}<br>
                Subject to Chennai Jurisdiction
              </p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0 0 2px 0; font-size: 11px; color: #78716c;">For Brightloop Technologies Pvt Ltd</p>
              <br>
              <p style="margin: 0; font-weight: 700; font-size: 12px; border-top: 1px dashed #d6d3d1; padding-top: 4px;">
                Authorized Financial Signatory
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // KPI Metrics
  const invoiceMetrics = useMemo(() => {
    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;

    invoices.forEach((inv) => {
      const amt = Number(inv.totalAmount || 0);
      totalInvoiced += amt;
      if (inv.status === 'paid') {
        totalPaid += amt;
      } else if (inv.status === 'overdue') {
        totalOverdue += amt;
      } else if (inv.status === 'pending') {
        totalPending += amt;
      }
    });

    return {
      totalInvoiced,
      totalPaid,
      totalPending,
      totalOverdue,
      totalCount: invoices.length,
      paidCount: invoices.filter((i) => i.status === 'paid').length,
      pendingCount: invoices.filter((i) => i.status === 'pending').length,
      overdueCount: invoices.filter((i) => i.status === 'overdue').length,
      draftCount: invoices.filter((i) => i.status === 'draft').length,
    };
  }, [invoices]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        inv.invoiceNumber?.toLowerCase().includes(query) ||
        inv.number?.toLowerCase().includes(query) ||
        inv.customerName?.toLowerCase().includes(query) ||
        inv.customerCompany?.toLowerCase().includes(query) ||
        inv.customerEmail?.toLowerCase().includes(query) ||
        inv.paymentMethod?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        inv.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  // Pagination
  const totalItems = filteredInvoices.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  return {
    invoices,
    filteredInvoices,
    paginatedInvoices,
    totalItems,
    totalPages,
    currentPage,
    setCurrentPage,
    pageSize,
    loading,
    error,
    successMsg,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    invoiceMetrics,
    createInvoice,
    updateInvoiceStatus,
    recordPaymentForInvoice,
    generateInvoiceFromSubscription,
    runRecurringBillingAutomation,
    generateInvoicePdf,
    refreshInvoices: fetchInvoices,
    clearFeedback: () => {
      setError(null);
      setSuccessMsg(null);
    },
  };
}
