import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { StatusPill } from '../components/common/StatusPill';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Clock,
  RefreshCw,
  Ban,
  CheckCircle2,
  AlertCircle,
  Send,
  XCircle,
} from 'lucide-react';
import { formatDate } from '../lib/utils';

export function StaffManagementPage() {
  const { role } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Initial demonstration and live state
  const [staffList, setStaffList] = useState([
    {
      id: 'staff-1',
      full_name: 'Marcus Vance',
      email: 'm.vance@brightloop.io',
      role: 'staff',
      account_status: 'active',
      created_at: '2026-09-12T10:00:00Z',
    },
    {
      id: 'staff-2',
      full_name: 'Elena Rostova',
      email: 'e.rostova@brightloop.io',
      role: 'staff',
      account_status: 'active',
      created_at: '2026-10-01T14:30:00Z',
    },
    {
      id: 'staff-3',
      full_name: 'David Kim',
      email: 'd.kim@brightloop.io',
      role: 'staff',
      account_status: 'suspended',
      created_at: '2026-08-15T09:15:00Z',
    },
  ]);

  const [invitationsList, setInvitationsList] = useState([
    {
      id: 'inv-1',
      email: 'clara.oswald@brightloop.io',
      status: 'pending',
      created_at: '2026-10-29T11:20:00Z',
      expires_at: '2026-11-05T11:20:00Z',
    },
    {
      id: 'inv-2',
      email: 'arthur.dent@brightloop.io',
      status: 'expired',
      created_at: '2026-10-10T08:00:00Z',
      expires_at: '2026-10-17T08:00:00Z',
    },
  ]);

  // Fetch real data from Supabase if configured
  useEffect(() => {
    async function loadStaffAndInvites() {
      if (!isSupabaseConfigured) return;

      try {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'staff')
          .order('created_at', { ascending: false });

        if (profilesData && profilesData.length > 0) {
          setStaffList(profilesData);
        }

        const { data: invitesData } = await supabase
          .from('staff_invitations')
          .select('*')
          .order('created_at', { ascending: false });

        if (invitesData && invitesData.length > 0) {
          setInvitationsList(invitesData);
        }
      } catch (err) {
        console.warn('Live staff load note:', err);
      }
    }

    loadStaffAndInvites();
  }, []);

  // Handle Send Invitation
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!inviteEmail || !inviteEmail.includes('@')) {
      setFeedback({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setInviteLoading(true);

    try {
      if (isSupabaseConfigured) {
        // Call RPC stored procedure
        const { data, error } = await supabase.rpc('invite_staff_member', {
          target_email: inviteEmail.trim().toLowerCase(),
        });

        if (error) throw error;
      }

      // Optimistic update
      const newInvite = {
        id: `inv-${Date.now()}`,
        email: inviteEmail.trim().toLowerCase(),
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      setInvitationsList([newInvite, ...invitationsList]);
      setFeedback({
        type: 'success',
        message: `Invitation successfully issued to ${inviteEmail}. Valid for 7 days.`,
      });
      setInviteEmail('');
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to issue staff invitation.',
      });
    } finally {
      setInviteLoading(false);
    }
  };

  // Toggle Staff Suspension
  const handleToggleStatus = async (staffMember) => {
    const nextStatus = staffMember.account_status === 'active' ? 'suspended' : 'active';

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('profiles')
          .update({ account_status: nextStatus })
          .eq('id', staffMember.id);

        if (error) throw error;
      }

      setStaffList(
        staffList.map((item) =>
          item.id === staffMember.id ? { ...item, account_status: nextStatus } : item
        )
      );

      setFeedback({
        type: 'success',
        message: `Account status for ${staffMember.email} updated to ${nextStatus}.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Could not update account status.',
      });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-200/80 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-md flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              Administrative Governance
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white font-serif">
            Staff & Team Access
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Invite operational staff members, manage account authorizations, and review pending invitations.
          </p>
        </div>

        <Badge variant="primary" size="md">
          Admin Authorization Only
        </Badge>
      </div>

      {/* Feedback Alert */}
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

      {/* Invite Staff Section */}
      <Card>
        <CardHeader
          title="Invite Operational Staff"
          subtitle="Staff accounts cannot register publicly. Only verified Admins can invite new operators."
        />
        <CardContent>
          <form onSubmit={handleInviteSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@brightloop.io"
                required
                className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={inviteLoading}
              icon={Send}
              className="shrink-0"
            >
              {inviteLoading ? 'Issuing Invite...' : 'Send Invitation'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Two Column Grid: Active Staff & Pending Invitations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Staff List */}
        <Card>
          <CardHeader
            title="Authorized Staff Members"
            subtitle={`Active and suspended staff accounts (${staffList.length})`}
          />
          <CardContent className="p-0">
            <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
              {staffList.map((staff) => (
                <div key={staff.id} className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-stone-900 dark:text-white">
                        {staff.full_name}
                      </p>
                      <StatusPill status={staff.account_status} />
                    </div>
                    <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                      {staff.email} &bull; Joined {formatDate(staff.created_at)}
                    </p>
                  </div>

                  <Button
                    variant={staff.account_status === 'active' ? 'outline' : 'secondary'}
                    size="xs"
                    onClick={() => handleToggleStatus(staff)}
                  >
                    {staff.account_status === 'active' ? 'Suspend' : 'Reactivate'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invitations List */}
        <Card>
          <CardHeader
            title="Issued Invitations"
            subtitle={`Recent invitation tokens and expiration status (${invitationsList.length})`}
          />
          <CardContent className="p-0">
            <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
              {invitationsList.map((inv) => (
                <div key={inv.id} className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-stone-900 dark:text-white font-mono">
                        {inv.email}
                      </p>
                      <StatusPill status={inv.status} />
                    </div>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Expires {formatDate(inv.expires_at)}
                    </p>
                  </div>

                  {inv.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => alert(`Resending staff invitation link to ${inv.email}`)}
                      icon={RefreshCw}
                    >
                      Resend
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
