import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrightloopLogo } from '../components/common/BrightloopLogo';
import { Button } from '../components/common/Button';
import {
  ShieldCheck,
  User,
  Users,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';

export function LoginPage() {
  const { login, isConfigured, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Active portal tab: 'customer' | 'staff' | 'admin'
  const [portalTab, setPortalTab] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [verifiedMsg, setVerifiedMsg] = useState('');

  // Detect email verification or auth redirect params from Supabase
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const hash = location.hash ? location.hash.replace(/^#/, '') : '';
    const hashParams = new URLSearchParams(hash);

    const isVerified = searchParams.get('verified') === 'true';
    const isSignupType = hashParams.get('type') === 'signup' || searchParams.get('type') === 'signup';
    const hasAccessToken = hashParams.has('access_token');

    // Check if Supabase returned an error during verification
    const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');
    if (errorDescription) {
      setErrorMsg(decodeURIComponent(errorDescription.replace(/\+/g, ' ')));
      setPortalTab('customer');
      return;
    }

    if (isVerified || isSignupType || hasAccessToken) {
      setVerifiedMsg(
        'Email verified successfully! Your account is activated. Please sign in below to access your Customer Portal.'
      );
      setPortalTab('customer');
    }
  }, [location]);

  // Handle Tab Change
  const handleTabChange = (tab) => {
    setPortalTab(tab);
    setErrorMsg('');
    setVerifiedMsg('');
    if (tab === 'admin') {
      setEmail('admin.brightloopodoohack@gmail.com');
    } else if (email === 'admin.brightloopodoohack@gmail.com') {
      setEmail('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    setLoading(true);

    try {
      // Login with expected portal verification
      const { profile } = await login(email, password, portalTab);

      // Successful redirect based on verified profile role
      const targetRole = profile?.role || portalTab;
      if (targetRole === 'admin') {
        navigate('/');
      } else if (targetRole === 'staff') {
        navigate('/staff');
      } else {
        navigate('/portal');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to sign in. Please check your credentials.');
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
          Sign In to Your Workspace
        </h2>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          Select your dedicated portal to authenticate your role
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-[#15181e] py-8 px-6 sm:px-8 shadow-card rounded-2xl border border-stone-200/90 dark:border-stone-800">
          {/* Portal Selector Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 dark:bg-stone-900 rounded-xl mb-6 border border-stone-200/80 dark:border-stone-800">
            <button
              type="button"
              onClick={() => handleTabChange('customer')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                portalTab === 'customer'
                  ? 'bg-amber-400 text-stone-950 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Customer
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('staff')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                portalTab === 'staff'
                  ? 'bg-amber-400 text-stone-950 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Staff
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('admin')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                portalTab === 'admin'
                  ? 'bg-amber-400 text-stone-950 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>

          {/* Config Alert if .env is missing */}
          {!isConfigured && (
            <div className="mb-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Supabase Connection Setup Required
              </p>
              <p className="mt-1 text-[11px] text-amber-800 dark:text-amber-400">
                Please add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to <code className="font-mono bg-white/60 dark:bg-stone-900 px-1 py-0.5 rounded">paviv1/.env</code> to enable live authentication.
              </p>
            </div>
          )}

          {/* Email Verification Success Alert */}
          {verifiedMsg && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-emerald-900 dark:text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Email Verified Successfully</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-300">
                {verifiedMsg}
              </p>
              {user && (
                <div className="pt-1">
                  <Link to="/portal">
                    <Button variant="primary" size="sm" className="w-full">
                      Enter Customer Portal &rarr;
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {portalTab === 'admin' ? 'Enterprise Admin Email' : 'Email Address'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    portalTab === 'admin'
                      ? 'admin.brightloopodoohack@gmail.com'
                      : 'name@company.com'
                  }
                  required
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
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

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              className="w-full mt-2"
              icon={ArrowRight}
              iconPosition="right"
            >
              {loading ? 'Authenticating...' : `Sign in as ${portalTab.charAt(0).toUpperCase() + portalTab.slice(1)}`}
            </Button>
          </form>

          {/* Portal Context Note */}
          <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800 text-center">
            {portalTab === 'customer' ? (
              <p className="text-xs text-stone-500 dark:text-stone-400">
                New customer?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  Create an account
                </Link>
              </p>
            ) : portalTab === 'staff' ? (
              <p className="text-[11px] text-stone-400 dark:text-stone-500">
                Staff accounts are invite-only. Contact your system admin if you have not received an invitation email.
              </p>
            ) : (
              <p className="text-[11px] text-stone-400 dark:text-stone-500">
                Admin access is verified through database role authorization. Public registration is prohibited.
              </p>
            )}
          </div>
        </div>

        {/* Back to Home Preview link */}
        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
          >
            &larr; Return to Dashboard Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
