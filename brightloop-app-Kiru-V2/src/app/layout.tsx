import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Brightloop — Subscription Management",
    template: "%s | Brightloop",
  },
  description:
    "One platform for products, plans, subscriptions, invoices, payments and revenue reporting.",
  icons: {
    icon: [
      { url: "/brightloop-icon-256.png", sizes: "256x256", type: "image/png" },
      { url: "/brightloop-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
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
