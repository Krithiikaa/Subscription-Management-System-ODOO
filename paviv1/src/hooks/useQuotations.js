import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import { DEMO_QUOTATIONS, DEMO_CUSTOMERS, DEMO_STAFF, DEMO_PRODUCTS } from '../lib/demoData';

const DEMO_QUOTATIONS_STORAGE_KEY = 'brightloop_demo_quotations_custom';

export function useQuotations() {
  const { user, role: currentUserRole } = useAuth();
  const { isDemoMode } = useDemoMode();

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | draft | sent | accepted | declined | expired | converted
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Load Quotations
  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (isDemoMode) {
      try {
        const stored = localStorage.getItem(DEMO_QUOTATIONS_STORAGE_KEY);
        let list = stored ? JSON.parse(stored) : null;

        if (!list || !Array.isArray(list) || list.length === 0) {
          // Initialize from DEMO_QUOTATIONS with enriched metadata
          list = DEMO_QUOTATIONS.map((q) => {
            const customer = DEMO_CUSTOMERS.find((c) => c.id === q.customerId);
            const staff = DEMO_STAFF.find((s) => s.id === q.staffId);
            const product = DEMO_PRODUCTS.find((p) => p.id === q.productId);

            const cgst = Math.round((q.amount * 0.09) * 100) / 100;
            const sgst = Math.round((q.amount * 0.09) * 100) / 100;

            return {
              ...q,
              quotationNumber: q.number,
              customerName: customer?.name || 'Enterprise Customer',
              customerEmail: customer?.email || 'billing@enterprise.in',
              customerCompany: customer?.company || 'Enterprise Client',
              customerGstin: customer?.gstin || '33DEMO0001A1Z1',
              salesStaffName: staff?.name || 'Praveen Shankar',
              quotationDate: q.issueDate,
              expiryDate: q.validUntil,
              subtotal: q.amount,
              discountAmount: 0,
              cgstAmount: cgst,
              sgstAmount: sgst,
              totalTax: q.gstAmount || (cgst + sgst),
              grandTotal: q.totalAmount || (q.amount + cgst + sgst),
              notes: 'Includes standard Tamil Nadu SaaS enterprise SLA and priority onboarding.',
              termsAndConditions: '1. Quotation valid for 30 days from date of issue. 2. 18% GST (9% CGST + 9% SGST) applicable on all Indian SaaS licenses. 3. Disputes subject to Chennai jurisdiction.',
              items: [
                {
                  id: `item-${q.id}-1`,
                  productId: q.productId,
                  productName: product?.name || 'Brightloop SaaS Module',
                  variantName: 'Standard Enterprise License',
                  quantity: 1,
                  unitPrice: q.amount,
                  discountPercent: 0,
                  lineTotal: q.amount,
                },
              ],
            };
          });
          localStorage.setItem(DEMO_QUOTATIONS_STORAGE_KEY, JSON.stringify(list));
        }

        setQuotations(list);
      } catch (err) {
        console.error('Error loading demo quotations:', err);
        setQuotations(DEMO_QUOTATIONS);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Live Database Mode
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured.');
      setQuotations([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error: qErr } = await supabase
        .from('quotations')
        .select(`
          *,
          quotation_items (*)
        `)
        .order('created_at', { ascending: false });

      if (qErr) {
        if (qErr.code === 'PGRST205' || qErr.message?.includes('not find')) {
          setError('Live "quotations" table pending migration (07_create_quotations_and_subscriptions.sql).');
          setQuotations([]);
        } else {
          setError(qErr.message);
        }
      } else {
        const normalized = (data || []).map((q) => ({
          id: q.id,
          quotationNumber: q.quotation_number,
          number: q.quotation_number,
          customerId: q.customer_id,
          customerName: q.customer_name,
          customerEmail: q.customer_email,
          salesStaffId: q.sales_staff_id,
          salesStaffName: q.sales_staff_name,
          quotationDate: q.quotation_date,
          expiryDate: q.expiry_date,
          subtotal: Number(q.subtotal || 0),
          discountAmount: Number(q.discount_amount || 0),
          cgstAmount: Number(q.cgst_amount || 0),
          sgstAmount: Number(q.sgst_amount || 0),
          totalTax: Number(q.total_tax || 0),
          grandTotal: Number(q.grand_total || 0),
          status: q.status,
          notes: q.notes,
          termsAndConditions: q.terms_and_conditions,
          convertedSubscriptionId: q.converted_subscription_id,
          items: (q.quotation_items || []).map((it) => ({
            id: it.id,
            productId: it.product_id,
            productName: it.product_name,
            variantId: it.variant_id,
            variantName: it.variant_name,
            quantity: it.quantity,
            unitPrice: Number(it.unit_price || 0),
            discountPercent: Number(it.discount_percent || 0),
            lineTotal: Number(it.line_total || 0),
          })),
        }));
        setQuotations(normalized);
      }
    } catch (err) {
      setError(err.message || 'Error fetching quotations.');
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  // Create Quotation
  const createQuotation = async (formData) => {
    setError(null);
    setSuccessMsg(null);

    // Calculate totals automatically
    let subtotal = 0;
    const items = (formData.items || []).map((it, idx) => {
      const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
      const price = Math.max(0, parseFloat(it.unitPrice) || 0);
      const discount = Math.min(100, Math.max(0, parseFloat(it.discountPercent) || 0));
      const lineTotal = Math.round(qty * price * (1 - discount / 100) * 100) / 100;
      subtotal += lineTotal;
      return {
        ...it,
        id: it.id || `item-${Date.now()}-${idx}`,
        quantity: qty,
        unitPrice: price,
        discountPercent: discount,
        lineTotal,
      };
    });

    const cgst = Math.round((subtotal * 0.09) * 100) / 100;
    const sgst = Math.round((subtotal * 0.09) * 100) / 100;
    const totalTax = cgst + sgst;
    const grandTotal = Math.round((subtotal + totalTax) * 100) / 100;

    const count = quotations.length + 1;
    const quoteNumber = `QT-2026-TN-${String(count).padStart(3, '0')}`;

    if (isDemoMode) {
      const newQuote = {
        id: `quote-user-${Date.now()}`,
        quotationNumber: quoteNumber,
        number: quoteNumber,
        customerId: formData.customerId,
        customerName: formData.customerName || 'Selected Customer',
        customerEmail: formData.customerEmail || 'billing@customer.in',
        customerCompany: formData.customerCompany || 'Enterprise SaaS Client',
        customerGstin: formData.customerGstin || '33DEMO9999A1Z9',
        salesStaffId: formData.salesStaffId,
        salesStaffName: formData.salesStaffName || 'Sales Representative',
        quotationDate: formData.quotationDate || new Date().toISOString().split('T')[0],
        expiryDate: formData.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subtotal,
        discountAmount: 0,
        cgstAmount: cgst,
        sgstAmount: sgst,
        totalTax,
        grandTotal,
        status: 'draft',
        notes: formData.notes || 'Brightloop SaaS enterprise quotation.',
        termsAndConditions: formData.termsAndConditions || '1. Quotation valid for 30 days. 2. 18% GST applicable. 3. Disputes subject to Chennai jurisdiction.',
        items,
      };

      const updated = [newQuote, ...quotations];
      setQuotations(updated);
      localStorage.setItem(DEMO_QUOTATIONS_STORAGE_KEY, JSON.stringify(updated));
      setSuccessMsg(`Quotation ${quoteNumber} created successfully.`);
      return newQuote;
    }

    // Live Mode
    try {
      const { data: qData, error: insertQErr } = await supabase
        .from('quotations')
        .insert({
          quotation_number: quoteNumber,
          customer_id: formData.customerId || null,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          sales_staff_id: formData.salesStaffId || null,
          sales_staff_name: formData.salesStaffName,
          quotation_date: formData.quotationDate || new Date().toISOString().split('T')[0],
          expiry_date: formData.expiryDate,
          subtotal,
          cgst_amount: cgst,
          sgst_amount: sgst,
          total_tax: totalTax,
          grand_total: grandTotal,
          status: 'draft',
          notes: formData.notes,
          terms_and_conditions: formData.termsAndConditions,
        })
        .select()
        .single();

      if (insertQErr) throw insertQErr;

      // Insert line items
      if (items.length > 0) {
        const itemRows = items.map((it) => ({
          quotation_id: qData.id,
          product_id: it.productId || null,
          product_name: it.productName,
          variant_id: it.variantId || null,
          variant_name: it.variantName,
          quantity: it.quantity,
          unit_price: it.unitPrice,
          discount_percent: it.discountPercent,
          line_total: it.lineTotal,
        }));

        const { error: itemsErr } = await supabase.from('quotation_items').insert(itemRows);
        if (itemsErr) console.warn('Items insert note:', itemsErr.message);
      }

      await fetchQuotations();
      setSuccessMsg(`Quotation ${quoteNumber} created successfully.`);
      return qData;
    } catch (err) {
      setError(err.message || 'Failed to create quotation.');
      throw err;
    }
  };

  // Update Quotation Status
  const updateQuotationStatus = async (quotationId, newStatus) => {
    setError(null);
    setSuccessMsg(null);

    if (isDemoMode) {
      const updated = quotations.map((q) =>
        q.id === quotationId ? { ...q, status: newStatus } : q
      );
      setQuotations(updated);
      localStorage.setItem(DEMO_QUOTATIONS_STORAGE_KEY, JSON.stringify(updated));
      setSuccessMsg(`Quotation status updated to ${newStatus}.`);
      return;
    }

    try {
      const { error: updErr } = await supabase
        .from('quotations')
        .update({ status: newStatus })
        .eq('id', quotationId);

      if (updErr) throw updErr;

      await fetchQuotations();
      setSuccessMsg(`Quotation status updated to ${newStatus}.`);
    } catch (err) {
      setError(err.message || 'Failed to update quotation status.');
      throw err;
    }
  };

  // Cancel Quotation
  const cancelQuotation = async (quotationId) => {
    await updateQuotationStatus(quotationId, 'declined');
  };

  // Printable Quotation PDF generator
  const generateQuotationPdf = (quotation) => {
    const printWindow = window.open('', '_blank', 'width=850,height=1000');
    if (!printWindow) {
      alert('Please allow popups to view and download the quotation PDF.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Quotation ${quotation.quotationNumber || quotation.number} - Brightloop Software</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1c1917; margin: 0; padding: 20px; font-size: 12px; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f59e0b; padding-bottom: 15px; margin-bottom: 20px; }
            .brand h1 { margin: 0; color: #78350f; font-size: 24px; font-family: serif; }
            .brand p { margin: 2px 0; color: #78716c; font-size: 11px; }
            .meta { text-align: right; }
            .meta h2 { margin: 0; color: #1c1917; font-size: 18px; }
            .meta p { margin: 3px 0; color: #78716c; font-size: 11px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .card { background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; padding: 12px; }
            .card h4 { margin: 0 0 6px 0; color: #92400e; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11px; }
            th { background: #f5f5f4; border-bottom: 2px solid #d6d3d1; padding: 8px 10px; text-align: left; color: #44403c; }
            td { border-bottom: 1px solid #e7e5e4; padding: 8px 10px; }
            .text-right { text-align: right; }
            .totals-table { width: 320px; margin-left: auto; margin-top: 10px; }
            .totals-table td { padding: 5px 10px; }
            .grand-total { font-size: 14px; font-weight: bold; color: #78350f; border-top: 2px solid #f59e0b; }
            .terms { margin-top: 30px; padding: 12px; background: #fafaf9; border-left: 3px solid #f59e0b; font-size: 10px; color: #57534e; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; border-top: 1px solid #e7e5e4; padding-top: 20px; font-size: 10px; color: #78716c; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 10px; background: #fef3c7; color: #92400e; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 15px; text-align: right;">
            <button onclick="window.print()" style="background: #f59e0b; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
              Print / Save as PDF
            </button>
          </div>

          <div class="header">
            <div class="brand">
              <h1>Brightloop Software</h1>
              <p>Tamil Nadu Enterprise SaaS Subscription Platform</p>
              <p>GSTIN: 33BRIGHT0001Z9 &bull; T. Nagar HQ, Chennai, TN - 600017</p>
            </div>
            <div class="meta">
              <h2>SALES QUOTATION</h2>
              <p><strong>Quote #:</strong> ${quotation.quotationNumber || quotation.number}</p>
              <p><strong>Issue Date:</strong> ${quotation.quotationDate || quotation.issueDate}</p>
              <p><strong>Valid Until:</strong> ${quotation.expiryDate || quotation.validUntil}</p>
              <p><strong>Status:</strong> <span class="badge">${quotation.status}</span></p>
            </div>
          </div>

          <div class="details-grid">
            <div class="card">
              <h4>Customer / Billed To:</h4>
              <p style="font-weight: bold; margin: 0 0 3px 0;">${quotation.customerName}</p>
              <p style="margin: 2px 0;">${quotation.customerCompany || ''}</p>
              <p style="margin: 2px 0; font-family: monospace;">${quotation.customerEmail}</p>
              <p style="margin: 2px 0; font-family: monospace;">GSTIN: ${quotation.customerGstin || 'Unregistered'}</p>
            </div>
            <div class="card">
              <h4>Sales Representative:</h4>
              <p style="font-weight: bold; margin: 0 0 3px 0;">${quotation.salesStaffName || 'Sales Desk'}</p>
              <p style="margin: 2px 0;">Brightloop Regional Enterprise Sales</p>
              <p style="margin: 2px 0;">Place of Supply: Tamil Nadu (Code 33)</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px;">#</th>
                <th>Product Description & Variant</th>
                <th class="text-right" style="width: 60px;">Qty</th>
                <th class="text-right" style="width: 100px;">Rate (₹)</th>
                <th class="text-right" style="width: 70px;">Disc %</th>
                <th class="text-right" style="width: 110px;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${(quotation.items || []).map((it, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>
                    <strong>${it.productName}</strong>
                    ${it.variantName ? `<br><small style="color: #78716c;">${it.variantName}</small>` : ''}
                  </td>
                  <td class="text-right">${it.quantity}</td>
                  <td class="text-right">${Number(it.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td class="text-right">${it.discountPercent}%</td>
                  <td class="text-right">${Number(it.lineTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <table class="totals-table">
            <tr>
              <td>Subtotal (Taxable Value):</td>
              <td class="text-right">₹${Number(quotation.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td>CGST (9.0%):</td>
              <td class="text-right">₹${Number(quotation.cgstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td>SGST (9.0%):</td>
              <td class="text-right">₹${Number(quotation.sgstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr class="grand-total">
              <td>Grand Total (INR):</td>
              <td class="text-right">₹${Number(quotation.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          </table>

          <div class="terms">
            <strong>Terms & Notes:</strong><br>
            ${quotation.notes ? `<p style="margin: 3px 0;">${quotation.notes}</p>` : ''}
            <p style="margin: 3px 0;">${quotation.termsAndConditions || ''}</p>
          </div>

          <div class="footer">
            <div>
              <p>Generated by Brightloop Software CPQ System &bull; System Verified</p>
            </div>
            <div style="text-align: right;">
              <p>For Brightloop Technologies Pvt Ltd</p>
              <br><br>
              <p><strong>Authorized Signatory</strong></p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Filtered Quotations
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        q.quotationNumber?.toLowerCase().includes(query) ||
        q.number?.toLowerCase().includes(query) ||
        q.customerName?.toLowerCase().includes(query) ||
        q.customerEmail?.toLowerCase().includes(query) ||
        q.salesStaffName?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        q.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [quotations, searchQuery, statusFilter]);

  // Pagination
  const totalItems = filteredQuotations.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedQuotations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuotations.slice(start, start + pageSize);
  }, [filteredQuotations, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  return {
    quotations,
    filteredQuotations,
    paginatedQuotations,
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
    createQuotation,
    updateQuotationStatus,
    cancelQuotation,
    generateQuotationPdf,
    refreshQuotations: fetchQuotations,
    clearFeedback: () => {
      setError(null);
      setSuccessMsg(null);
    },
  };
}
