"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-soft space-y-6">
        <div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to login
          </Link>
          <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
            Reset your password
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enter your email and we will send you a link to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-center space-y-3">
            <MailCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 font-heading">
              Check your inbox
            </h4>
            <p className="text-xs text-indigo-700 dark:text-indigo-300">
              If an account with that email exists, we have dispatched a password reset link valid for 30 minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <Input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 font-medium h-10"
              isLoading={loading}
            >
              Send Reset Link
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

