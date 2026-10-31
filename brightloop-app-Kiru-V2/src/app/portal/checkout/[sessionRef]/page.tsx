"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/utils";
import { DEMO_PAYMENT_METHODS } from "@/lib/validation";

type SessionInfo = { sessionRef: string; amount: string; status: string; expiresAt: string };
type InvoiceInfo = { id: number; number: string; total: string; amountPaid: string };

const METHOD_LABELS: Record<string, string> = {
  UPI: "UPI / QR",
  CARD: "Card",
  NETBANKING: "Net Banking",
  WALLET: "Wallet",
};

type Outcome = "SUCCESS" | "FAILURE" | "PENDING";
type CompleteResult =
  | { result: "success"; payment: { transactionRef: string } }
  | { result: "failed"; payment: { failureReason: string | null } }
  | { result: "pending" }
  | { result: "expired" }
  | { result: "already_processed" }
  | { result: "already_settled" };

export default function CheckoutPage({ params }: { params: Promise<{ sessionRef: string }> }) {
  const { sessionRef } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [invoice, setInvoice] = useState<InvoiceInfo | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [method, setMethod] = useState<(typeof DEMO_PAYMENT_METHODS)[number]>("UPI");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CompleteResult | null>(null);

  useEffect(() => {
    fetch(`/api/payments/sessions/${sessionRef}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Payment session not found");
          return;
        }
        setSession(data.session);
        setInvoice(data.invoice);
        setQrDataUrl(data.qrDataUrl ?? null);
      })
      .finally(() => setLoading(false));
  }, [sessionRef]);

  async function complete(outcome: Outcome) {
    setBusy(true);
    const res = await fetch(`/api/payments/sessions/${sessionRef}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, outcome }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Payment could not be processed");
      return;
    }
    setResult(data);
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading checkout…</p>
      </main>
    );
  }

  if (error || !session || !invoice) {
    return (
      <main style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div className="panel" style={{ padding: 32, maxWidth: 420, textAlign: "center" }}>
          <p style={{ color: "var(--danger)", marginBottom: 16 }}>{error ?? "Payment session not found"}</p>
          <Link href="/portal/invoices" className="btn-primary">Back to invoices</Link>
        </div>
      </main>
    );
  }

  if (result || session.status !== "PENDING") {
    const outcome = result?.result ?? (session.status === "EXPIRED" ? "expired" : "already_processed");
    return (
      <main style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div className="panel" style={{ padding: 32, maxWidth: 420, textAlign: "center" }}>
          {outcome === "success" && (
            <>
              <p style={{ color: "var(--success)", fontWeight: 700, marginBottom: 8 }}>Payment successful</p>
              <p className="font-mono" style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 16 }}>
                Ref: {result && "payment" in result ? (result.payment as { transactionRef: string }).transactionRef : ""}
              </p>
              <Link href="/portal/payments" className="btn-primary">View payment history</Link>
            </>
          )}
          {outcome === "failed" && (
            <>
              <p style={{ color: "var(--danger)", fontWeight: 700, marginBottom: 8 }}>Payment failed</p>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 16 }}>This was a simulated failure. No charge was made.</p>
              <Link href="/portal/invoices" className="btn-primary">Back to invoices</Link>
            </>
          )}
          {outcome === "pending" && (
            <>
              <p style={{ color: "var(--warning)", fontWeight: 700, marginBottom: 8 }}>Payment pending</p>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 16 }}>
                This demo does not auto-resolve pending payments. Contact support or try again to settle this invoice.
              </p>
              <Link href="/portal/invoices" className="btn-primary">Back to invoices</Link>
            </>
          )}
          {outcome === "expired" && (
            <>
              <p style={{ color: "var(--danger)", fontWeight: 700, marginBottom: 8 }}>This session has expired</p>
              <Link href="/portal/invoices" className="btn-primary">Start a new payment</Link>
            </>
          )}
          {outcome === "already_processed" && (
            <>
              <p style={{ fontWeight: 700, marginBottom: 8 }}>This payment session was already used</p>
              <Link href="/portal/invoices" className="btn-primary">Back to invoices</Link>
            </>
          )}
          {outcome === "already_settled" && (
            <>
              <p style={{ color: "var(--success)", fontWeight: 700, marginBottom: 8 }}>This invoice is already fully paid</p>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 16 }}>
                It looks like this was settled by another payment in the meantime.
              </p>
              <Link href="/portal/invoices" className="btn-primary">Back to invoices</Link>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="panel" style={{ padding: 32, maxWidth: 440, width: "100%" }}>
        <div className="badge badge-warning" style={{ width: "100%", textAlign: "center", marginBottom: 20, padding: "10px 0" }}>
          DEMO MODE — NO REAL MONEY WILL BE TRANSFERRED
        </div>
        <p className="label">Invoice</p>
        <p className="font-mono" style={{ marginBottom: 12 }}>{invoice.number}</p>
        <p className="label">Amount due</p>
        <p className="font-serif" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: 20 }}>{formatMoney(session.amount)}</p>

        <p className="label" style={{ marginBottom: 8 }}>Payment method</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {DEMO_PAYMENT_METHODS.map((m) => (
            <button
              key={m}
              className={method === m ? "btn-primary" : "btn-ghost"}
              onClick={() => setMethod(m)}
              type="button"
            >
              {METHOD_LABELS[m]}
            </button>
          ))}
        </div>

        {method === "UPI" && qrDataUrl && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="Demo UPI QR code" width={160} height={160} style={{ margin: "0 auto", borderRadius: 8 }} />
            <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", marginTop: 8 }}>
              Scan to open this checkout session on another device (demo only).
            </p>
          </div>
        )}

        <p className="label" style={{ marginBottom: 8 }}>Simulate outcome</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-primary" disabled={busy} onClick={() => complete("SUCCESS")}>Success</button>
          <button className="btn-danger" disabled={busy} onClick={() => complete("FAILURE")}>Failure</button>
          <button className="btn-ghost" disabled={busy} onClick={() => complete("PENDING")}>Pending</button>
        </div>
      </div>
    </main>
  );
}
