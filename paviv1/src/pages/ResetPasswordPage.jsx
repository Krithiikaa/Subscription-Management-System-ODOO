import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrightloopLogo } from '../components/common/BrightloopLogo';
import { Button } from '../components/common/Button';
import {
  Lock,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';

export function ResetPasswordPage() {
  const { updatePassword, isConfigured } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password rules validation checklist
  const hasMinLength = password.length > 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=~`]/.test(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasSpecial) {
      setErrorMsg('Please ensure your new password satisfies all security complexity requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await updatePassword(password);
      setSuccessMsg('Your password has been successfully updated! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password. Recovery link may have expired.');
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
          Set New Password
        </h2>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          Enter a new, strong password to secure your account
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
                Configure <code className="font-mono bg-white/60 dark:bg-stone-900 px-1 py-0.5 rounded">paviv1/.env</code> to enable live password reset.
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
                Password Updated
              </h3>
              <p className="text-[11px] leading-relaxed text-stone-600 dark:text-stone-300">
                {successMsg}
              </p>
              <div className="pt-2">
                <Link to="/login">
                  <Button variant="primary" size="sm" className="w-full">
                    Proceed to Sign In Now &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="w-full pl-9 pr-10 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Security Complexity Checklist */}
              <div className="bg-stone-50 dark:bg-stone-900/60 p-3 rounded-lg border border-stone-200/80 dark:border-stone-800 text-[11px] space-y-1">
                <p className="font-semibold text-stone-600 dark:text-stone-400 text-[10px] uppercase">
                  Complexity Requirements:
                </p>
                <div className="grid grid-cols-2 gap-1 text-stone-500 dark:text-stone-400">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>&gt; 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>1 uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>1 lowercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>1 special character</span>
                  </div>
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
                {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
