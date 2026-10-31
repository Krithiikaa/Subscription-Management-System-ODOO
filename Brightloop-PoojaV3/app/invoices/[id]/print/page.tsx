"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney, formatDate } from "@/lib/utils";

export default function InvoicePrintPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!id) return;
    fetch(`/api/invoices/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.invoice) setData(json.invoice);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-500">
        Loading invoice statement...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-red-500">
        Invoice not found.
      </div>
    );
  }

  const isPaid = data.status === "PAID" || data.balanceDue <= 0;

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:p-0 print:bg-white text-slate-900">
      {/* Action Bar (Hidden on print) */}
      <div className="max-w-[210mm] mx-auto mb-6 flex items-center justify-between no-print">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <Button
          onClick={() => window.print()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm"
        >
          <Printer className="w-4 h-4" /> Print or Save as PDF
        </Button>
      </div>

      {/* A4 Sheet Container */}
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white p-8 sm:p-12 border border-slate-200 print:border-none shadow-sm print:shadow-none flex flex-col justify-between">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-8">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-heading font-bold flex items-center justify-center text-lg print:border print:border-black">
                  B
                </div>
                <span className="font-heading font-extrabold text-2xl tracking-tight text-slate-900">
                  BrightLoop Software
                </span>
              </div>
              <p className="text-xs text-slate-500">
                100 Innovation Park, Tech Hub, Bengaluru 560100
              </p>
              <p className="text-xs text-slate-500 font-mono">
                GSTIN: 29AAAAA0000A1Z5 &nbsp;|&nbsp; CIN: U72200KA2026PTC000000
              </p>
            </div>

            {/* Invoice Number & Stamp */}
            <div className="text-right space-y-2">
              <h1 className="text-xl font-bold font-heading text-slate-900">TAX INVOICE</h1>
              <p className="text-base font-mono font-semibold text-indigo-700 print:text-black">
                {data.number}
              </p>
              {/* Status Stamp */}
              <div className="inline-block">
                <span
                  className={`inline-block px-3 py-1 rounded text-xs font-extrabold tracking-wider border-2 uppercase ${
                    isPaid
                      ? "border-emerald-600 text-emerald-700 bg-emerald-50 print:border-black print:text-black"
                      : "border-red-600 text-red-700 bg-red-50 print:border-black print:text-black"
                  }`}
                >
                  {isPaid ? "PAID" : "BALANCE DUE"}
                </span>
              </div>
            </div>
          </div>

          {/* Bill-to & Dates Grid */}
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div>
              <p className="font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Billed To:
              </p>
              <p className="font-bold text-sm text-slate-900">{data.customer.name}</p>
              {data.customer.companyName && (
                <p className="font-medium text-slate-700">{data.customer.companyName}</p>
              )}
              {data.customer.address && <p className="text-slate-600">{data.customer.address}</p>}
              {(data.customer.city || data.customer.state) && (
                <p className="text-slate-600">
                  {data.customer.city}, {data.customer.state} {data.customer.pincode}
                </p>
              )}
              <p className="text-slate-600">{data.customer.email}</p>
              {data.customer.gstin && (
                <p className="font-mono text-slate-700 mt-1">GSTIN: {data.customer.gstin}</p>
              )}
            </div>

            <div className="text-right space-y-1">
              <p>
                <span className="text-slate-400">Invoice Date:</span>{" "}
                <span className="font-medium">{formatDate(data.createdAt)}</span>
              </p>
              <p>
                <span className="text-slate-400">Billing Period:</span>{" "}
                <span className="font-medium">
                  {formatDate(data.periodStart)} – {formatDate(data.periodEnd)}
                </span>
              </p>
              <p>
                <span className="text-slate-400">Due Date:</span>{" "}
                <span className="font-bold text-slate-900">{formatDate(data.dueDate)}</span>
              </p>
              <p>
                <span className="text-slate-400">Subscription Ref:</span>{" "}
                <span className="font-mono font-medium">{data.subscription.number}</span>
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 print:bg-transparent font-semibold text-slate-700">
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Discount</th>
                <th className="py-2.5 px-3 text-right">Tax Rate</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.lines.map((l: any, i: number) => (
                <tr key={i}>
                  <td className="py-3 px-3 font-medium text-slate-900">{l.description}</td>
                  <td className="py-3 px-3 text-center tabular-nums">{l.quantity}</td>
                  <td className="py-3 px-3 text-right tabular-nums">{formatMoney(l.unitPrice)}</td>
                  <td className="py-3 px-3 text-right tabular-nums text-slate-500">
                    {l.discount > 0 ? `-${formatMoney(l.discount)}` : "—"}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-slate-500">
                    {l.taxRate}%
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums font-semibold text-slate-900">
                    {formatMoney(l.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="flex justify-end pt-4">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Subtotal:</span>
                <span className="tabular-nums font-medium">{formatMoney(data.subtotal)}</span>
              </div>
              {data.discountTotal > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-600">
                  <span>Discount Total:</span>
                  <span className="tabular-nums font-medium">-{formatMoney(data.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">GST / Tax:</span>
                <span className="tabular-nums font-medium">{formatMoney(data.taxTotal)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b-2 border-slate-900 font-bold text-sm text-slate-900">
                <span>Grand Total:</span>
                <span className="tabular-nums">{formatMoney(data.grandTotal)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Amount Paid:</span>
                <span className="tabular-nums font-medium">{formatMoney(data.netPaid)}</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-sm text-indigo-700 print:text-black">
                <span>Balance Due:</span>
                <span className="tabular-nums">{formatMoney(data.balanceDue)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Terms & Bank Details */}
        <div className="border-t border-slate-200 pt-6 mt-12 text-[11px] text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">Payment Terms & Instructions:</p>
          <p>
            Payment is due within {data.paymentTerms || 30} days of invoice date. Bank transfer details:
            BrightLoop Technologies Inc | HDFC Bank Current A/C: 50200012345678 | IFSC: HDFC0001234.
          </p>
          <p className="pt-2 text-slate-400">
            This is a computer-generated invoice and requires no physical signature.
          </p>
        </div>
      </div>
    </div>
  );
}

