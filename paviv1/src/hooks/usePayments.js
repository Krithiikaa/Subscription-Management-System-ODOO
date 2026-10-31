import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import { DEMO_PAYMENTS, DEMO_INVOICES, DEMO_CUSTOMERS } from '../lib/demoData';

const DEMO_PAYMENTS_STORAGE_KEY = 'brightloop_demo_payments_custom';

export function usePayments() {
  const { user, role: currentUserRole } = useAuth();
  const { isDemoMode } = useDemoMode();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | succeeded | pending | failed | refunded
  const [methodFilter, setMethodFilter] = useState('all'); // all | UPI | NetBanking | NEFT | NACH | Card
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Load Payments
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (isDemoMode) {
      try {
        const stored = localStorage.getItem(DEMO_PAYMENTS_STORAGE_KEY);
        let list = stored ? JSON.parse(stored) : null;

        if (!list || !Array.isArray(list) || list.length === 0) {
          list = DEMO_PAYMENTS.map((p, index) => {
            const customer = DEMO_CUSTOMERS.find((c) => c.id === p.customerId);
            const invoice = DEMO_INVOICES.find((i) => i.id === p.invoiceId);

            return {
              ...p,
              customerCompany: customer?.company || `${p.customerName} Technologies`,
              customerEmail: customer?.email || 'accounts@enterprise.in',
              invoiceNumber: invoice?.number || `INV-2026-BL-${String(index + 1).padStart(3, '0')}`,
              gstinRef: p.gstinRef || customer?.gstin || `33DEMO00${String(index + 1).padStart(2, '0')}A1Z1`,
            };
          });
          localStorage.setItem(DEMO_PAYMENTS_STORAGE_KEY, JSON.stringify(list));
        }

        setPayments(list);
      } catch (err) {
        console.error('Error reading demo payments:', err);
        setPayments([]);
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
        .from('payments')
        .select(`
          *,
          invoices:invoice_id(invoice_number),
          customers:customer_id(name, company, email, gstin)
        `)
        .order('payment_date', { ascending: false });

      if (fetchErr) throw fetchErr;

      setPayments(
        (data || []).map((row) => ({
          id: row.id,
          txnRef: row.txn_ref,
          invoiceId: row.invoice_id,
          invoiceNumber: row.invoices?.invoice_number || 'Direct Collection',
          customerId: row.customer_id,
          customerName: row.customer_name || row.customers?.name,
          customerCompany: row.customers?.company,
          customerEmail: row.customers?.email,
          amount: Number(row.amount || 0),
          method: row.payment_method,
          gateway: row.payment_gateway,
          gstinRef: row.gstin_ref || row.customers?.gstin,
          status: row.status,
          date: row.payment_date,
          notes: row.notes,
        }))
      );
    } catch (err) {
      console.error('Error fetching payments from Supabase:', err);
      setError(err.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Record Manual Payment
  const recordPayment = async (data) => {
    setError(null);
    setSuccessMsg(null);

    const amount = Number(data.amount);
    const txnRef = data.txnRef || `TXN-IN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentDate = data.date || new Date().toISOString();

    if (isDemoMode) {
      const newPay = {
        id: `pay-custom-${Date.now()}`,
        txnRef,
        invoiceId: data.invoiceId || null,
        invoiceNumber: data.invoiceNumber || 'INV-2026-BL-MANUAL',
        customerId: data.customerId || 'cust-tn-01',
        customerName: data.customerName || 'Enterprise Client',
        customerCompany: data.customerCompany || 'Enterprise Client Pvt Ltd',
        customerEmail: data.customerEmail || 'billing@enterprise.in',
        amount,
        method: data.method || 'UPI AutoPay',
        gateway: data.gateway || 'Razorpay Gateway',
        status: data.status || 'succeeded',
        date: paymentDate,
        gstinRef: data.gstinRef || '33DEMO0001A1Z1',
        notes: data.notes || 'Recorded via Brightloop billing console',
      };

      const updated = [newPay, ...payments];
      setPayments(updated);
      localStorage.setItem(DEMO_PAYMENTS_STORAGE_KEY, JSON.stringify(updated));
      setSuccessMsg(`Payment ${txnRef} of ₹${amount.toLocaleString('en-IN')} recorded successfully.`);
      return { success: true, data: newPay };
    }

    // Live Supabase Mode
    try {
      const { data: row, error: payErr } = await supabase
        .from('payments')
        .insert({
          txn_ref: txnRef,
          invoice_id: data.invoiceId || null,
          customer_id: data.customerId,
          customer_name: data.customerName,
          amount,
          payment_method: data.method,
          payment_gateway: data.gateway || 'Razorpay UPI AutoPay',
          gstin_ref: data.gstinRef || null,
          status: data.status || 'succeeded',
          payment_date: paymentDate,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (payErr) throw payErr;

      await fetchPayments();
      setSuccessMsg(`Payment ${txnRef} recorded successfully.`);
      return { success: true, data: row };
    } catch (err) {
      setError(err.message || 'Failed to record payment');
      return { success: false, error: err.message };
    }
  };

  // Refund Payment
  const refundPayment = async (paymentId, reason) => {
    setError(null);
    setSuccessMsg(null);

    if (isDemoMode) {
      const updated = payments.map((p) => {
        if (p.id === paymentId) {
          return {
            ...p,
            status: 'refunded',
            notes: `${p.notes || ''} [Refunded: ${reason || 'Customer requested reversal'}]`,
          };
        }
        return p;
      });

      setPayments(updated);
      localStorage.setItem(DEMO_PAYMENTS_STORAGE_KEY, JSON.stringify(updated));
      setSuccessMsg('Payment marked as refunded.');
      return { success: true };
    }

    try {
      const { error: updErr } = await supabase
        .from('payments')
        .update({
          status: 'refunded',
          notes: reason ? `Refunded: ${reason}` : 'Refunded',
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (updErr) throw updErr;

      await fetchPayments();
      setSuccessMsg('Payment marked as refunded.');
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to process refund');
      return { success: false, error: err.message };
    }
  };

  // Generate Official Payment Receipt Voucher PDF
  const generateReceiptPdf = (payment) => {
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) {
      alert('Please allow popups to view and download the Payment Receipt.');
      return;
    }

    const formatINR = (val) =>
      Number(val || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const isSucceeded = payment.status === 'succeeded';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt Voucher - ${payment.txnRef}</title>
          <style>
            @page {
              size: A5 landscape;
              margin: 12mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #1c1917;
              background: #ffffff;
              padding: 24px;
              line-height: 1.4;
              font-size: 13px;
            }
            .header-banner {
              border-bottom: 2px solid #059669;
              padding-bottom: 12px;
              margin-bottom: 16px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .brand-title {
              font-size: 20px;
              font-weight: 800;
              color: #059669;
              letter-spacing: -0.02em;
              margin: 0 0 2px 0;
            }
            .receipt-badge {
              display: inline-block;
              background: #ecfdf5;
              color: #047857;
              border: 1px solid #a7f3d0;
              font-size: 11px;
              font-weight: 700;
              padding: 3px 8px;
              border-radius: 4px;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .grid-2 {
              display: grid;
              grid-template-columns: 1.2fr 1fr;
              gap: 16px;
              margin-bottom: 18px;
            }
            .card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 12px;
            }
            .amount-box {
              background: #f0fdf4;
              border: 2px dashed #059669;
              border-radius: 8px;
              padding: 14px;
              text-align: center;
              margin: 16px 0;
            }
            .amount-val {
              font-size: 28px;
              font-weight: 800;
              color: #059669;
              letter-spacing: -0.02em;
            }
            .table-details {
              width: 100%;
              border-collapse: collapse;
              margin: 12px 0;
            }
            .table-details td {
              padding: 7px 10px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 12.5px;
            }
            .footer-sign {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 24px;
              padding-top: 12px;
              border-top: 1px solid #e2e8f0;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 12px; text-align: right;">
            <button onclick="window.print()" style="background: #059669; color: white; border: none; padding: 7px 14px; font-weight: bold; border-radius: 6px; cursor: pointer;">
              🖨️ Print Receipt
            </button>
          </div>

          <div class="header-banner">
            <div>
              <span class="receipt-badge">Official E-Payment Acknowledgement</span>
              <h1 class="brand-title">BRIGHTLOOP TECHNOLOGIES PVT LTD</h1>
              <p style="margin: 2px 0; font-size: 11px; color: #64748b;">
                42, North Usman Road, T. Nagar, Chennai, Tamil Nadu – 600017<br>
                <strong>GSTIN:</strong> 33AABCB1234F1Z9 &bull; <strong>PAN:</strong> AABCB1234F
              </p>
            </div>
            <div style="text-align: right;">
              <span style="display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: 800; font-size: 12px; text-transform: uppercase; ${isSucceeded ? 'background: #ecfdf5; color: #047857; border: 1px solid #10b981;' : 'background: #fef2f2; color: #b91c1c; border: 1px solid #ef4444;'}">
                ${payment.status}
              </span>
              <h3 style="margin: 6px 0 2px 0; font-size: 14px; font-weight: 700;">Ref: ${payment.txnRef}</h3>
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                ${payment.date ? new Date(payment.date).toLocaleString('en-IN') : '-'}
              </p>
            </div>
          </div>

          <div class="amount-box">
            <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #166534; letter-spacing: 0.05em;">Total Amount Received</span>
            <div class="amount-val">₹${formatINR(payment.amount)}</div>
            <span style="font-size: 11px; color: #15803d;">Settled via ${payment.method} &bull; Gateway: ${payment.gateway || 'Direct'}</span>
          </div>

          <table class="table-details">
            <tr>
              <td style="width: 180px; color: #64748b;"><strong>Received From:</strong></td>
              <td><strong>${payment.customerCompany || payment.customerName}</strong> (${payment.customerName})</td>
            </tr>
            <tr>
              <td style="color: #64748b;"><strong>Client GSTIN:</strong></td>
              <td style="font-family: monospace;">${payment.gstinRef || '33DEMO0001A1Z1'}</td>
            </tr>
            <tr>
              <td style="color: #64748b;"><strong>Against Tax Invoice:</strong></td>
              <td><strong style="color: #ea580c;">${payment.invoiceNumber || 'INV-2026-BL-SETTLEMENT'}</strong></td>
            </tr>
            <tr>
              <td style="color: #64748b;"><strong>Payment Mode / Bank:</strong></td>
              <td>${payment.method} &bull; Transaction Gateway: ${payment.gateway || 'NPCI / AutoPay'}</td>
            </tr>
            <tr>
              <td style="color: #64748b;"><strong>Remarks / Purpose:</strong></td>
              <td>${payment.notes || 'Full settlement of cloud software licenses under SAC 997331'}</td>
            </tr>
          </table>

          <div class="footer-sign">
            <div>
              <p style="font-size: 10.5px; color: #94a3b8; margin: 0;">
                Electronically generated payment voucher &bull; No physical signature required.<br>
                For billing inquiries: billing@brightloop.in
              </p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0 0 2px 0; font-size: 10.5px; color: #64748b;">Brightloop Billing Operations</p>
              <br>
              <p style="margin: 0; font-weight: 700; font-size: 11px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
                Authorized Cashier / System Verified
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
  const paymentMetrics = useMemo(() => {
    let totalCollected = 0;
    let succeededCount = 0;
    let failedCount = 0;
    let refundedTotal = 0;

    payments.forEach((p) => {
      const amt = Number(p.amount || 0);
      if (p.status === 'succeeded') {
        totalCollected += amt;
        succeededCount++;
      } else if (p.status === 'refunded') {
        refundedTotal += amt;
      } else if (p.status === 'failed') {
        failedCount++;
      }
    });

    const totalCount = payments.length;
    const successRate = totalCount > 0 ? Math.round((succeededCount / totalCount) * 100) : 100;

    return {
      totalCollected,
      succeededCount,
      failedCount,
      refundedTotal,
      totalCount,
      successRate,
      pendingCount: payments.filter((p) => p.status === 'pending').length,
    };
  }, [payments]);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        p.txnRef?.toLowerCase().includes(query) ||
        p.invoiceNumber?.toLowerCase().includes(query) ||
        p.customerName?.toLowerCase().includes(query) ||
        p.customerCompany?.toLowerCase().includes(query) ||
        p.method?.toLowerCase().includes(query) ||
        p.gateway?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        p.status?.toLowerCase() === statusFilter.toLowerCase();

      const matchesMethod =
        methodFilter === 'all' ||
        p.method?.toLowerCase().includes(methodFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, searchQuery, statusFilter, methodFilter]);

  // Pagination
  const totalItems = filteredPayments.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, methodFilter]);

  return {
    payments,
    filteredPayments,
    paginatedPayments,
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
    methodFilter,
    setMethodFilter,
    paymentMetrics,
    recordPayment,
    refundPayment,
    generateReceiptPdf,
    refreshPayments: fetchPayments,
    clearFeedback: () => {
      setError(null);
      setSuccessMsg(null);
    },
  };
}
