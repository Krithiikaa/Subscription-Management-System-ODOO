import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrightloopLogo } from '../components/common/BrightloopLogo';
import { Button } from '../components/common/Button';
import { Mail, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export function ForgotPasswordPage() {
  const { resetPassword, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Please enter your account email address.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email);
      setSuccessMsg(
        `A password recovery link has been sent to ${email}. Please check your inbox and click the link to set a new password.`
      );
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send password recovery link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0c0e12] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block mb-4">
          <BrightloopLogo size="lg" showSubtitle={true} />
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white font-serif">
          Recover Your Password
        </h2>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          Enter your registered email address to receive recovery instructions
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-[#15181e] py-8 px-6 sm:px-8 shadow-card rounded-2xl border border-stone-200/90 dark:border-stone-800">
          {!isConfigured && (
            <div className="mb-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Supabase Credentials Required
              </p>
              <p className="mt-1 text-[11px]">
                Configure <code className="font-mono bg-white/60 dark:bg-stone-900 px-1 py-0.5 rounded">paviv1/.env</code> to trigger real recovery emails.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {successMsg ? (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 space-y-3 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                Recovery Link Dispatched
              </h3>
              <p className="text-[11px] leading-relaxed text-stone-600 dark:text-stone-300">
                {successMsg}
              </p>
              <div className="pt-2">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="w-full">
                    Return to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Account Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading}
                className="w-full mt-2"
                icon={ArrowRight}
                iconPosition="right"
              >
                {loading ? 'Sending Recovery Link...' : 'Send Password Reset Link'}
              </Button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800 text-center text-xs text-stone-500 dark:text-stone-400">
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-amber-700 dark:text-amber-400 hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
