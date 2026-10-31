import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { StatusPill } from '../components/common/StatusPill';
import {
  User,
  Mail,
  Shield,
  Key,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { formatDate } from '../lib/utils';

export function UserProfilePage() {
  const { user, profile, role, accountStatus, updatePassword, isConfigured } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setPasswordLoading(true);

    try {
      await updatePassword(newPassword);
      setFeedback({ type: 'success', message: 'Password updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Could not update password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Sarah Jenkins';
  const displayEmail = profile?.email || user?.email || 'sarah.jenkins@brightloop.io';
  const displayRole = role || 'admin';

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-200/80 dark:border-stone-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white font-serif">
            Security & Account Profile
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Manage your authenticated credentials, security role, and password.
          </p>
        </div>

        <Badge variant="primary" size="md">
          Role: {displayRole.toUpperCase()}
        </Badge>
      </div>

      {feedback.message && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
            feedback.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1">
          <Card className="text-center p-6">
            <div className="w-20 h-20 rounded-2xl bg-amber-400 text-stone-950 font-bold text-2xl flex items-center justify-center mx-auto shadow-md ring-4 ring-amber-200/50 dark:ring-amber-900/30">
              {displayName.substring(0, 2).toUpperCase()}
            </div>

            <h3 className="text-lg font-bold text-stone-900 dark:text-white mt-4 font-serif">
              {displayName}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-mono mt-0.5">
              {displayEmail}
            </p>

            <div className="mt-4 flex items-center justify-center gap-2">
              <StatusPill status={accountStatus} />
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 uppercase">
                {displayRole}
              </span>
            </div>

            <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800 text-left text-xs space-y-2 text-stone-500 dark:text-stone-400">
              <div className="flex items-center justify-between">
                <span>Account ID</span>
                <span className="font-mono text-[10px] text-stone-700 dark:text-stone-300 truncate max-w-[140px]">
                  {user?.id || 'usr-enterprise-admin'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Database RBAC</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  RLS Enforced
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tenant</span>
                <span className="font-medium text-stone-700 dark:text-stone-300">
                  Brightloop Global
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Update Credentials */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity Information */}
          <Card>
            <CardHeader
              title="Identity & Role Governance"
              subtitle="Your system authorization level is strictly verified by database constraints."
            />
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    disabled
                    className="w-full px-3 py-2 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-700 dark:text-stone-300 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={displayEmail}
                    disabled
                    className="w-full px-3 py-2 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-700 dark:text-stone-300 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                <Shield className="w-4 h-4 text-amber-600 inline mr-1.5" />
                Role assignment cannot be modified by the user. Administrators can invite staff, while customers are strictly sandboxed through Row Level Security.
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader
              title="Update Password"
              subtitle="Ensure your account uses a secure password with at least 8 characters, uppercase, lowercase, and symbols."
            />
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={passwordLoading}
                    icon={Save}
                  >
                    {passwordLoading ? 'Saving...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
