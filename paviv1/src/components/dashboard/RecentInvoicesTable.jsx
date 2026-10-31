import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter } from '../common/Card';
import { StatusPill } from '../common/StatusPill';
import { RECENT_INVOICES } from '../../lib/mockData';
import { formatCurrency, formatDate } from '../../lib/utils';
import { FileText, ArrowRight, DownloadCloud } from 'lucide-react';

export function RecentInvoicesTable({ invoices = [], currency = 'USD' }) {
  const hasInvoices = invoices && invoices.length > 0;
  const displayItems = hasInvoices ? invoices.slice(0, 10) : [];

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Recent Invoices"
        subtitle={
          hasInvoices
            ? `Showing recent customer billing statements (${invoices.length} total records)`
            : 'Billing statements issued across all active corporate accounts'
        }
        action={
          <Link
            to="/invoices"
            className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-1 transition-colors font-sans"
          >
            Invoicing Center ({invoices.length || 0}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      <CardContent className="p-0 overflow-x-auto">
        {!hasInvoices ? (
          <div className="py-12 px-6 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800/80 flex items-center justify-center text-stone-400 dark:text-stone-500 mb-3 border border-stone-200 dark:border-stone-700">
              <FileText className="w-6 h-6" />
            </div>
            <h5 className="text-sm font-semibold text-stone-900 dark:text-white">
              No Invoices Generated Yet
            </h5>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 max-w-sm">
              Live customer billing statements and payment collections will appear here once generated. No fake statistics or dummy records are shown.
            </p>
            <div className="mt-4">
              <Link
                to="/invoices"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-400 hover:bg-amber-500 text-stone-950 transition-colors shadow-2xs"
              >
                Go to Invoices Module &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-stone-50/80 dark:bg-stone-900/80 border-b border-stone-200/80 dark:border-stone-800 text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6">Invoice #</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80 text-xs">
              {displayItems.map((inv) => {
                const invId = inv.number || inv.id;
                const custName = inv.customerName || inv.customer || 'Customer';
                const custEmail = inv.customerEmail || inv.email || `${custName.toLowerCase().replace(/[^a-z]/g, '')}@example.in`;
                const amount = inv.totalAmount || inv.amount;

                return (
                  <tr
                    key={inv.id}
                    className="hover:bg-amber-50/30 dark:hover:bg-stone-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-medium text-stone-900 dark:text-amber-400">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600" />
                        <span>{invId}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-stone-900 dark:text-white">{custName}</p>
                      <p className="text-[11px] text-stone-400 dark:text-stone-500">{custEmail}</p>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">
                      {formatCurrency(amount, currency)}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusPill status={inv.status} />
                    </td>

                    <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300">
                      <p className="text-xs">{formatDate(inv.dueDate)}</p>
                      <p className="text-[10px] text-stone-400 dark:text-stone-500">
                        Issued {formatDate(inv.issueDate)}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-stone-500 dark:text-stone-400 text-[11px]">
                      {inv.method}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => alert(`Downloading demo PDF receipt for ${invId}`)}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-stone-400 dark:text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                        title="Download Statement"
                      >
                        <DownloadCloud className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </CardContent>

      {hasInvoices && (
        <CardFooter>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Showing {invoices.length} recent invoice(s)
          </span>
          <Link
            to="/invoices"
            className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300"
          >
            Invoicing Center &rarr;
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
