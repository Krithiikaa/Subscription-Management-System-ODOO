import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter } from '../common/Card';
import { StatusPill } from '../common/StatusPill';
import { RECENT_INVOICES } from '../../lib/mockData';
import { formatCurrency, formatDate } from '../../lib/utils';
import { FileText, ArrowRight, DownloadCloud } from 'lucide-react';

export function RecentInvoicesTable() {
  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Recent Invoices"
        subtitle="Billing statements issued across all active corporate accounts"
        action={
          <Link
            to="/invoices"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            All Invoices ({RECENT_INVOICES.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 sm:px-6">Invoice #</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Payment Method</th>
              <th className="py-3 px-4 text-right">PDF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {RECENT_INVOICES.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors group">
                <td className="py-3 px-4 sm:px-6 font-mono font-medium text-indigo-600">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                    <span>{inv.id}</span>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <p className="font-semibold text-slate-900">{inv.customer}</p>
                  <p className="text-[11px] text-slate-400">{inv.email}</p>
                </td>

                <td className="py-3 px-4 font-bold text-slate-900">
                  {formatCurrency(inv.amount)}
                </td>

                <td className="py-3 px-4">
                  <StatusPill status={inv.status} />
                </td>

                <td className="py-3 px-4 text-slate-600">
                  <p className="text-xs">{formatDate(inv.dueDate)}</p>
                  <p className="text-[10px] text-slate-400">Issued {formatDate(inv.issueDate)}</p>
                </td>

                <td className="py-3 px-4 text-slate-500 text-[11px]">
                  {inv.method}
                </td>

                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => alert(`Downloading demo PDF receipt for ${inv.id}`)}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Download Statement"
                  >
                    <DownloadCloud className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>

      <CardFooter>
        <span className="text-xs text-slate-500">
          Automated payment collection & reconciliation active &bull; Brightloop Billing
        </span>
        <Link to="/invoices" className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
          Invoicing Center &rarr;
        </Link>
      </CardFooter>
    </Card>
  );
}
