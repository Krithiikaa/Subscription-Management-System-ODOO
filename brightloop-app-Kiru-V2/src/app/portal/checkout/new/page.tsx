"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function NewCheckoutInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("invoiceId");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!invoiceId) {
      setError("No invoice specified.");
      return;
    }
    let cancelled = false;
    fetch("/api/payments/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId: Number(invoiceId) }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Could not start checkout");
          return;
        }
        router.replace(`/portal/checkout/${data.session.sessionRef}`);
      })
      .catch(() => {
        if (!cancelled) setError("Could not start checkout");
      });
    return () => {
      cancelled = true;
    };
  }, [invoiceId, router]);

  return (
    <main style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="panel" style={{ padding: 32, maxWidth: 420, textAlign: "center" }}>
        {error ? (
          <>
            <p style={{ color: "var(--danger)", marginBottom: 16 }}>{error}</p>
            <Link href="/portal/invoices" className="btn-primary">Back to invoices</Link>
          </>
        ) : (
          <p style={{ color: "var(--text-muted)" }}>Starting your checkout…</p>
        )}
      </div>
    </main>
  );
}

export default function NewCheckoutPage() {
  return (
    <Suspense fallback={null}>
      <NewCheckoutInner />
    </Suspense>
  );
}
