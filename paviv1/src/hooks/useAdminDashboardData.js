import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function useAdminDashboardData() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState(null);

  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    totalStaff: 0,
    pendingStaffInvitations: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    pendingInvoices: 0,
    overduePayments: 0,
  });

  const [tablesStatus, setTablesStatus] = useState({
    profiles: false,
    staffInvitations: false,
    subscriptions: false,
    invoices: false,
    payments: false,
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [staffList, setStaffList] = useState([]);

  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    if (!isSupabaseConfigured) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      let custCount = 0;
      let staffCount = 0;
      let pendingInvitesCount = 0;
      let activeSubsCount = 0;
      let revenueAmount = 0;
      let pendingInvCount = 0;
      let overduePayCount = 0;

      const discoveredTables = {
        profiles: false,
        staffInvitations: false,
        subscriptions: false,
        invoices: false,
        payments: false,
      };

      const activities = [];

      // 1. Fetch Real Profiles (Total Customers & Total Staff)
      try {
        const { data: profiles, error: profErr } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, account_status, created_at')
          .order('created_at', { ascending: false });

        if (!profErr && profiles) {
          discoveredTables.profiles = true;
          const customers = profiles.filter((p) => p.role === 'customer');
          const staff = profiles.filter((p) => p.role === 'staff');

          custCount = customers.length;
          staffCount = staff.length;
          setCustomersList(customers);
          setStaffList(staff);

          // Populate real activities from profiles
          profiles.forEach((p) => {
            let activityType = 'user_registered';
            let title = 'Customer Account Registered';

            if (p.role === 'admin') {
              activityType = 'admin_bootstrap';
              title = 'Enterprise Admin Setup';
            } else if (p.role === 'staff') {
              activityType = 'staff_joined';
              title = 'Staff Member Active';
            }

            activities.push({
              id: `prof-${p.id}`,
              type: activityType,
              title,
              description: `${p.full_name || p.email} (${p.email})`,
              timestamp: p.created_at,
              role: p.role,
              status: p.account_status,
            });
          });
        }
      } catch (err) {
        console.warn('Profiles query notice:', err.message);
      }

      // 2. Fetch Real Staff Invitations
      try {
        const { data: invites, error: inviteErr } = await supabase
          .from('staff_invitations')
          .select('id, email, status, created_at, expires_at')
          .order('created_at', { ascending: false });

        if (!inviteErr && invites) {
          discoveredTables.staffInvitations = true;
          const pending = invites.filter((inv) => inv.status === 'pending');
          pendingInvitesCount = pending.length;

          // Populate real activities from invitations
          invites.forEach((inv) => {
            activities.push({
              id: `inv-${inv.id}`,
              type: 'staff_invitation',
              title: `Staff Invitation (${inv.status})`,
              description: `Invitation sent to ${inv.email}`,
              timestamp: inv.created_at,
              role: 'staff',
              status: inv.status,
            });
          });
        }
      } catch (err) {
        console.warn('Staff invitations query notice:', err.message);
      }

      // 3. Attempt query for Subscriptions table (Graceful fallback if not yet implemented)
      try {
        const { data: subs, error: subsErr } = await supabase
          .from('subscriptions')
          .select('id, status, amount, created_at')
          .limit(100);

        if (!subsErr && subs) {
          discoveredTables.subscriptions = true;
          activeSubsCount = subs.filter((s) => s.status === 'active').length;
        }
      } catch (err) {
        // Table does not exist in schema yet; keep 0 and mark table not implemented
      }

      // 4. Attempt query for Invoices table (Graceful fallback)
      try {
        const { data: invoices, error: invErr } = await supabase
          .from('invoices')
          .select('id, status, total_amount, created_at')
          .limit(100);

        if (!invErr && invoices) {
          discoveredTables.invoices = true;
          pendingInvCount = invoices.filter((i) => i.status === 'pending' || i.status === 'draft').length;
          overduePayCount = invoices.filter((i) => i.status === 'overdue').length;
          revenueAmount = invoices
            .filter((i) => i.status === 'paid')
            .reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0);
        }
      } catch (err) {
        // Table does not exist in schema yet
      }

      // 5. Attempt query for Payments table (Graceful fallback)
      try {
        const { data: payments, error: payErr } = await supabase
          .from('payments')
          .select('id, status, amount, created_at')
          .limit(100);

        if (!payErr && payments) {
          discoveredTables.payments = true;
          const paidRevenue = payments
            .filter((p) => p.status === 'succeeded' || p.status === 'paid')
            .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
          if (paidRevenue > 0) {
            revenueAmount = paidRevenue;
          }
        }
      } catch (err) {
        // Table does not exist in schema yet
      }

      // Sort all combined activities descending by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setMetrics({
        totalCustomers: custCount,
        totalStaff: staffCount,
        pendingStaffInvitations: pendingInvitesCount,
        activeSubscriptions: activeSubsCount,
        monthlyRevenue: revenueAmount,
        pendingInvoices: pendingInvCount,
        overduePayments: overduePayCount,
      });

      setTablesStatus(discoveredTables);
      setRecentActivities(activities.slice(0, 8));
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load live admin metrics:', err);
      setError(err.message || 'Failed to communicate with database');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = () => {
    return fetchData(true);
  };

  return {
    loading,
    refreshing,
    lastUpdated,
    error,
    metrics,
    tablesStatus,
    recentActivities,
    customersList,
    staffList,
    refreshData,
  };
}
