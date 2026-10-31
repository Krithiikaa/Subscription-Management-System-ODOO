import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { BrightloopLogo } from '../components/common/BrightloopLogo';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { StatusPill } from '../components/common/StatusPill';
import { useStaff } from '../hooks/useStaff';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Building2,
  MapPin,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Briefcase,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '../lib/utils';

export function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getInvitationDetails, acceptStaffInvitation } = useStaff();
  const { setCustomSession, validatePasswordStrength } = useAuth();

  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [tokenInput, setTokenInput] = useState(tokenParam);
  const [emailInput, setEmailInput] = useState(emailParam);

  const [invitation, setInvitation] = useState(null);
  const [checked, setChecked] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password rules
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=~`]/.test(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasSpecial && passwordsMatch;

  // Check invitation on mount or param changes
  useEffect(() => {
    const details = getInvitationDetails(tokenParam || tokenInput, emailParam || emailInput);
    if (details) {
      setInvitation(details);
      setFullName(details.name || '');
    } else {
      setInvitation(null);
    }
    setChecked(true);
  }, [tokenParam, emailParam, tokenInput, emailInput, getInvitationDetails]);

  const handleLookup = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const details = getInvitationDetails(tokenInput.trim(), emailInput.trim());
    if (details) {
      setInvitation(details);
      setFullName(details.name || '');
    } else {
      setErrorMsg('No invitation found for the specified token or email.');
      setInvitation(null);
    }
  };

  const handleAcceptSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMsg('Please ensure all password security rules are met.');
      return;
    }

    setLoading(true);

    try {
      const result = await acceptStaffInvitation({
        token: invitation.token,
        email: invitation.email,
        password,
        name: fullName.trim(),
      });

      setSuccessMsg(
        `Welcome aboard, ${fullName}! Your staff account has been activated with operational permissions.`
      );

      // Authenticate active session as staff operator
      if (result?.staff) {
        setCustomSession(
          {
            id: result.staff.id,
            email: result.staff.email,
            user_metadata: { full_name: result.staff.name },
          },
          {
            id: result.staff.id,
            email: result.staff.email,
            full_name: result.staff.name,
            role: 'staff',
            account_status: 'active',
            department: result.staff.department,
            office: result.staff.office,
          }
        );
      }

      // Redirect to staff dashboard after brief confirmation
      setTimeout(() => {
        navigate('/staff');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to accept invitation. Please try again.');
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
          Accept Staff Invitation
        </h2>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          Complete your onboarding to access the Brightloop Operations Workspace
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white dark:bg-[#15181e] py-8 px-6 sm:px-8 shadow-card rounded-2xl border border-stone-200/90 dark:border-stone-800 space-y-6">
          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <p className="font-semibold">{successMsg}</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Redirecting to Staff Operations Dashboard...
                </p>
              </div>
            </div>
          )}

          {/* Invitation Lookup if not pre-detected */}
          {!invitation && checked && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Invitation Token Required
                </p>
                <p className="mt-1 text-[11px]">
                  Please enter the staff invitation token and email provided in your administrator onboarding email.
                </p>
              </div>

              <form onSubmit={handleLookup} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Staff Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@brightloop.in"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Invitation Token
                  </label>
                  <input
                    type="text"
                    required
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="e.g. inv-tok-kavitha-ramesh"
                    className="w-full px-3 py-2 font-mono bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <Button type="submit" variant="primary" size="md" className="w-full">
                  Verify Invitation
                </Button>
              </form>
            </div>
          )}

          {/* Invitation Details & Acceptance Form */}
          {invitation && (
            <div className="space-y-6">
              {/* Invitation Header Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50/50 to-stone-50 dark:from-amber-950/20 dark:to-stone-900 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Verified Staff Invitation
                  </span>
                  <StatusPill status={invitation.status} />
                </div>

                <div className="pt-1">
                  <h3 className="text-base font-bold text-stone-900 dark:text-white font-serif">
                    {invitation.name}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-mono mt-0.5">
                    {invitation.email}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-stone-400" />
                    {invitation.department}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-stone-400" />
                    {invitation.role}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    {invitation.office}
                  </span>
                </div>

                <p className="text-[10px] text-stone-400 pt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-400" />
                  Invitation valid until {formatDate(invitation.expiresAt)}
                </p>
              </div>

              {/* Status Checks: Expired or Already Accepted */}
              {invitation.isExpired && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 space-y-2">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    This Invitation Has Expired
                  </p>
                  <p className="text-[11px]">
                    Invitations are valid for 7 days. Please ask your System Administrator to reissue your invitation token.
                  </p>
                  <Link to="/login" className="inline-block text-amber-700 dark:text-amber-400 underline font-medium">
                    Return to Login
                  </Link>
                </div>
              )}

              {invitation.isAccepted && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 space-y-2">
                  <p className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Invitation Already Accepted
                  </p>
                  <p className="text-[11px]">
                    This staff account is already active. You can sign in using your work email and password.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Go to Staff Login <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Active Pending Form */}
              {invitation.isPending && (
                <form onSubmit={handleAcceptSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Confirm Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Set Secure Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-10 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Password Security Checklist */}
                  <div className="p-3 bg-stone-50 dark:bg-stone-900/60 rounded-xl border border-stone-200/80 dark:border-stone-800 text-[11px] space-y-1.5">
                    <p className="font-semibold text-stone-700 dark:text-stone-300">
                      Security Policy Checklist:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 text-stone-500">
                      <div className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>8+ Characters</span>
                      </div>
                      <div className={`flex items-center gap-1 ${hasUppercase ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Uppercase Letter</span>
                      </div>
                      <div className={`flex items-center gap-1 ${hasLowercase ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Lowercase Letter</span>
                      </div>
                      <div className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Special Character</span>
                      </div>
                    </div>
                    {password && confirmPassword && (
                      <p className={`pt-1 text-[11px] font-medium ${passwordsMatch ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
                      </p>
                    )}
                  </div>

                  {/* Submit button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={loading || !isPasswordValid}
                    className="w-full mt-2"
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    {loading ? 'Activating Profile...' : 'Activate Staff Account & Access Dashboard'}
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* Footer Back Link */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 text-center">
            <Link
              to="/login"
              className="text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
            >
              &larr; Already have active credentials? Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
