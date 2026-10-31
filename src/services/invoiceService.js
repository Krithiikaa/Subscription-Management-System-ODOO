/**
 * INVOICE SERVICE LAYER
 * 
 * Prepares the application for seamless future integration with Odoo:
 * - Compatible with Odoo 16/17/18 JSON-RPC or REST API endpoints
 * - Currently manages in-memory local state with realistic seed data
 * - Computes dynamic aggregates: Total Invoices, Draft, Paid, Overdue, Total Amount, Outstanding Amount
 */

import { INITIAL_INVOICES } from '../data/mockInvoices';

const STORAGE_KEY = 'archana_v4_invoices_demo';

export const InvoiceService = {
  /**
   * Load invoices from localStorage if present, otherwise fallback to seed data
   */
  getInvoices: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // LocalStorage access fail or SSR fallback
    }
    return INITIAL_INVOICES;
  },

  /**
   * Save invoices to localStorage
   */
  saveInvoices: (invoices) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
    } catch (e) {
      console.warn('Unable to persist to localStorage:', e);
    }
  },

  /**
   * Reset to initial sample dataset
   */
  resetToSampleData: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Unable to clear localStorage:', e);
    }
    return INITIAL_INVOICES;
  },

  /**
   * Calculate dashboard metrics dynamically from an invoice array
   */
  computeMetrics: (invoices = []) => {
    const totalCount = invoices.length;
    let draftCount = 0;
    let paidCount = 0;
    let overdueCount = 0;

    let totalAmount = 0;
    let draftAmount = 0;
    let paidAmount = 0;
    let overdueAmount = 0;

    for (const inv of invoices) {
      const amount = Number(inv.amount) || 0;
      totalAmount += amount;

      const st = (inv.status || '').toLowerCase();
      if (st === 'paid') {
        paidCount++;
        paidAmount += amount;
      } else if (st === 'draft') {
        draftCount++;
        draftAmount += amount;
      } else if (st === 'overdue') {
        overdueCount++;
        overdueAmount += amount;
      }
    }

    // Outstanding amount = sum of unpaid invoices (draft + overdue)
    const outstandingAmount = draftAmount + overdueAmount;

    return {
      totalCount,
      draftCount,
      paidCount,
      overdueCount,
      totalAmount,
      paidAmount,
      draftAmount,
      overdueAmount,
      outstandingAmount,
      collectionRate: totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0
    };
  },

  /**
   * Format currency nicely
   */
  formatCurrency: (amount = 0, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  },

  /**
   * Format date for clean display
   */
  formatDate: (dateStr) => {
    if (!dateStr) return '—';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        // Avoid timezone shift issues by creating UTC date
        const d = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          timeZone: 'UTC'
        });
      }
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  },

  /**
   * Generates next invoice number in sequence (e.g. INV-2026-009)
   */
  generateNextInvoiceNumber: (invoices = []) => {
    const currentYear = new Date().getFullYear();
    let maxNum = 0;
    for (const inv of invoices) {
      const match = (inv.invoiceNumber || '').match(/INV-(\d+)-(\d+)/);
      if (match) {
        const num = parseInt(match[2], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    const nextSeq = String(maxNum + 1).padStart(3, '0');
    return `INV-${currentYear}-${nextSeq}`;
  },

  /**
   * Convert frontend invoice item to Odoo account.move payload structure
   * Useful for validating Odoo schema readiness
   */
  toOdooPayload: (invoice) => {
    return {
      model: 'account.move',
      values: {
        move_type: 'out_invoice',
        name: invoice.invoiceNumber,
        partner_id: invoice.customer?.odooPartnerId || false,
        invoice_date: invoice.invoiceDate,
        invoice_date_due: invoice.dueDate,
        amount_total: invoice.amount,
        state: invoice.status === 'draft' ? 'draft' : 'posted',
        payment_state: invoice.status === 'paid' ? 'paid' : (invoice.status === 'overdue' ? 'not_paid' : 'not_paid'),
        narration: invoice.notes || ''
      }
    };
  }
};
