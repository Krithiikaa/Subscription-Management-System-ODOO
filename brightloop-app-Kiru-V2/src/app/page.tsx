import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";

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
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <ThemeToggle />
      </div>

      <div style={{ textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "var(--accent)",
            color: "var(--accent-contrast)",
            marginBottom: "16px",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M8 12c-2.5 0-4-2-4-4s1.5-4 4-4 4 2 4 4-1.5 4-4 4z" />
            <path d="M16 12c2.5 0 4 2 4 4s-1.5 4-4 4-4-2-4-4 1.5-4 4-4z" />
          </svg>
        </div>
        <h1
          className="font-serif"
          style={{
            fontSize: "var(--text-3xl)",
            color: "var(--text)",
            fontWeight: 700,
            margin: 0,
          }}
        >
          Brightloop
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            marginTop: "10px",
            fontSize: "var(--text-base)",
            maxWidth: "440px",
          }}
        >
          One platform to run plans, subscriptions and recurring billing — end to end.
        </p>
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/login" className="btn-primary">
          Sign in
        </Link>
        <Link href="/signup" className="btn-ghost">
          Create account
        </Link>
      </div>
    </main>
  );
}
