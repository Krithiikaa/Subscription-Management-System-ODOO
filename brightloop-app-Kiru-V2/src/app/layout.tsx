import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Brightloop — Subscription Management",
    template: "%s | Brightloop",
  },
  description:
    "One platform for products, plans, subscriptions, invoices, payments and revenue reporting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="antialiased">{children}</body>
    </html>
  );
}
