import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
        padding: "24px",
      }}
    >
      {/* Wordmark */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--accent)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          ◈ brightloop
        </div>
        <h1
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-3xl)",
            color: "var(--text)",
            fontWeight: 600,
            margin: 0,
          }}
        >
          Subscription Management
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            marginTop: "12px",
            fontSize: "var(--text-base)",
            maxWidth: "480px",
          }}
        >
          One platform to run plans, subscriptions and recurring billing —
          end to end.
        </p>
      </div>

      {/* Status pill */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 14px",
          border: "1px solid var(--hairline)",
          borderRadius: "999px",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "var(--accent)",
            display: "inline-block",
          }}
        />
        Phase 0 — scaffold deployed
      </div>

      {/* CTA */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/login" className="btn-primary">
          Sign in →
        </Link>
        <Link href="/signup" className="btn-ghost">
          Create account
        </Link>
      </div>
    </main>
  );
}
