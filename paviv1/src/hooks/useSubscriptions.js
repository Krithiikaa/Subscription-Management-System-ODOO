import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import { DEMO_SUBSCRIPTIONS, DEMO_CUSTOMERS, DEMO_PLANS } from '../lib/demoData';

const DEMO_SUBSCRIPTIONS_STORAGE_KEY = 'brightloop_demo_subscriptions_custom';
const DEMO_QUOTATIONS_STORAGE_KEY = 'brightloop_demo_quotations_custom';

export function useSubscriptions() {
  const { user, role: currentUserRole } = useAuth();
  const { isDemoMode } = useDemoMode();

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | draft | quotation | confirmed | active | in_trial | paused | past_due | canceled | closed
  const [cycleFilter, setCycleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Load Subscriptions
  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (isDemoMode) {
      try {
        const stored = localStorage.getItem(DEMO_SUBSCRIPTIONS_STORAGE_KEY);
        let list = stored ? JSON.parse(stored) : null;

        if (!list || !Array.isArray(list) || list.length === 0) {
          list = DEMO_SUBSCRIPTIONS.map((s, index) => {
            const customer = DEMO_CUSTOMERS.find((c) => c.id === s.customerId);
            const plan = DEMO_PLANS.find((p) => p.id === s.planId);
            const subNum = `SUB-2026-BL-${String(index + 1).padStart(3, '0')}`;

            return {
              ...s,
              subscriptionNumber: subNum,
              customerName: customer?.name || 'Enterprise Customer',
              customerEmail: customer?.email || 'billing@enterprise.in',
              customerCompany: customer?.company || 'Enterprise SaaS Client',
              planName: s.planName || plan?.name || 'Scale Monthly',
              billingCycle: s.billingCycle || 'Monthly',
              quantity: 1,
              unitPrice: s.amount,
              discountAmount: 0,
              totalAmount: s.amount,
              autoRenew: s.autoRenew ?? true,
              cancelAtPeriodEnd: false,
              closureReason: null,
              linkedQuotationId: index < 24 ? `quote-bl-${String(index + 1).padStart(2, '0')}` : null,
              history: [
                {
                  timestamp: s.startDate ? `${s.startDate}T10:00:00Z` : '2026-01-15T10:00:00Z',
                  event: 'Created',
                  actor: 'System Admin',
                  note: `Subscription initialized on ${s.billingCycle || 'Monthly'} cycle`,
                },
                {
                  timestamp: s.startDate ? `${s.startDate}T10:05:00Z` : '2026-01-15T10:05:00Z',
                  event: 'Activated',
                  actor: 'Billing Automation',
                  note: `Contract active and recurring billing scheduled for ${s.nextBilling}`,
                },
              ],
            };
          });
          localStorage.setItem(DEMO_SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(list));
        }

        setSubscriptions(list);
      } catch (err) {
        console.error('Error loading demo subscriptions:', err);
        setSubscriptions(DEMO_SUBSCRIPTIONS);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Live Database Mode
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured.');
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error: sErr } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (sErr) {
        if (sErr.code === 'PGRST205' || sErr.message?.includes('not find')) {
          setError('Live "subscriptions" table pending migration (07_create_quotations_and_subscriptions.sql).');
          setSubscriptions([]);
        } else {
          setError(sErr.message);
        }
      } else {
        const normalized = (data || []).map((s) => ({
          id: s.id,
          subscriptionNumber: s.subscription_number,
          customerId: s.customer_id,
          customerName: s.customer_name,
          customerEmail: s.customer_email,
          linkedQuotationId: s.linked_quotation_id,
          planId: s.plan_id,
          planName: s.plan_name,
          billingCycle: s.billing_cycle,
          quantity: s.quantity,
          unitPrice: Number(s.unit_price || 0),
          discountAmount: Number(s.discount_amount || 0),
          totalAmount: Number(s.total_amount || 0),
          startDate: s.start_date,
          endDate: s.end_date,
          nextBillingDate: s.next_billing_date,
          autoRenew: s.auto_renew,
          cancelAtPeriodEnd: s.cancel_at_period_end,
          status: s.status,
          closureReason: s.closure_reason,
          history: s.history || [],
        }));
        setSubscriptions(normalized);
      }
    } catch (err) {
      setError(err.message || 'Error fetching subscriptions.');
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Convert Quotation into Subscription (Prevents duplicate conversion)
  const convertQuotationToSubscription = async (quotation) => {
    setError(null);
    setSuccessMsg(null);

    if (!quotation) throw new Error('Quotation data is required for conversion.');

    // Duplicate Conversion Guard
    if (quotation.status === 'converted' || quotation.convertedSubscriptionId) {
      throw new Error(`Quotation ${quotation.quotationNumber || quotation.number} has already been converted into a subscription.`);
    }

    const subNumber = `SUB-2026-BL-${String(subscriptions.length + 1).padStart(3, '0')}`;
    const nowIso = new Date().toISOString();
    const today = nowIso.split('T')[0];

    // Compute next billing date (30 days from now)
    const nextBill = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const historyEntry = {
      timestamp: nowIso,
      event: 'Converted from Quotation',
      actor: user?.email || 'Sales Specialist',
      note: `Converted from Sales Quotation ${quotation.quotationNumber || quotation.number} (Total: ₹${quotation.grandTotal})`,
    };

    if (isDemoMode) {
      const newSub = {
        id: `sub-user-${Date.now()}`,
        subscriptionNumber: subNumber,
        customerId: quotation.customerId,
        customerName: quotation.customerName,
        customerEmail: quotation.customerEmail,
        customerCompany: quotation.customerCompany || 'Enterprise Client',
        linkedQuotationId: quotation.id,
        linkedQuotationNumber: quotation.quotationNumber || quotation.number,
        planName: quotation.items?.[0]?.productName || 'Enterprise Subscription',
        billingCycle: 'Monthly',
        quantity: 1,
        unitPrice: quotation.subtotal,
        discountAmount: quotation.discountAmount || 0,
        totalAmount: quotation.subtotal,
        startDate: today,
        nextBillingDate: nextBill,
        autoRenew: true,
        cancelAtPeriodEnd: false,
        status: 'confirmed', // Lifecycle starts at confirmed after conversion
        history: [
          historyEntry,
          {
            timestamp: nowIso,
            event: 'Confirmed',
            actor: user?.email || 'Operations Desk',
            note: 'Contract terms confirmed and ready for activation.',
          },
        ],
      };

      // 1. Add subscription
      const updatedSubs = [newSub, ...subscriptions];
      setSubscriptions(updatedSubs);
      localStorage.setItem(DEMO_SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(updatedSubs));

      // 2. Mark source quotation as converted in demo storage
      const storedQuotes = localStorage.getItem(DEMO_QUOTATIONS_STORAGE_KEY);
      if (storedQuotes) {
        try {
          const quotes = JSON.parse(storedQuotes);
          const updatedQuotes = quotes.map((q) =>
            q.id === quotation.id
              ? { ...q, status: 'converted', convertedSubscriptionId: newSub.id }
              : q
          );
          localStorage.setItem(DEMO_QUOTATIONS_STORAGE_KEY, JSON.stringify(updatedQuotes));
        } catch (e) {
          console.warn('Error updating quotation storage:', e);
        }
      }

      setSuccessMsg(`Quotation converted successfully into Subscription ${subNumber}.`);
      return newSub;
    }

    // Live Database Mode
    try {
      const { data: subData, error: subErr } = await supabase
        .from('subscriptions')
        .insert({
          subscription_number: subNumber,
          customer_id: quotation.customerId || null,
          customer_name: quotation.customerName,
          customer_email: quotation.customerEmail,
          linked_quotation_id: quotation.id,
          plan_name: quotation.items?.[0]?.productName || 'Enterprise SaaS Plan',
          billing_cycle: 'Monthly',
          quantity: 1,
          unit_price: quotation.subtotal,
          total_amount: quotation.subtotal,
          start_date: today,
          next_billing_date: nextBill,
          auto_renew: true,
          status: 'confirmed',
          history: [historyEntry],
        })
        .select()
        .single();

      if (subErr) throw subErr;

      // Update quotation to converted
      await supabase
        .from('quotations')
        .update({
          status: 'converted',
          converted_subscription_id: subData.id,
        })
        .eq('id', quotation.id);

      await fetchSubscriptions();
      setSuccessMsg(`Quotation converted successfully into Subscription ${subNumber}.`);
      return subData;
    } catch (err) {
      setError(err.message || 'Failed to convert quotation.');
      throw err;
    }
  };

  // Lifecycle Transitions Helper
  const transitionSubscription = async (id, newStatus, eventName, note = '') => {
    setError(null);
    setSuccessMsg(null);

    const nowIso = new Date().toISOString();
    const newEntry = {
      timestamp: nowIso,
      event: eventName,
      actor: user?.email || 'Operations Admin',
      note: note || `Status transitioned to ${newStatus}`,
    };

    if (isDemoMode) {
      const updated = subscriptions.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            status: newStatus,
            history: [newEntry, ...(s.history || [])],
          };
        }
        return s;
      });

      setSubscriptions(updated);
      localStorage.setItem(DEMO_SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(updated));
      setSuccessMsg(`Subscription status updated to ${newStatus}.`);
      return;
    }

    // Live Supabase
    try {
      const targetSub = subscriptions.find((s) => s.id === id);
      const updatedHistory = [newEntry, ...(targetSub?.history || [])];

      const { error: updErr } = await supabase
        .from('subscriptions')
        .update({
          status: newStatus,
          history: updatedHistory,
        })
        .eq('id', id);

      if (updErr) throw updErr;

      await fetchSubscriptions();
      setSuccessMsg(`Subscription is now ${newStatus}.`);
    } catch (err) {
      setError(err.message || 'Failed to update subscription status.');
      throw err;
    }
  };

  // Specific Lifecycle Actions
  const confirmSubscription = (id) => transitionSubscription(id, 'confirmed', 'Confirmed', 'Contract validated and accepted by client.');
  const activateSubscription = (id) => transitionSubscription(id, 'active', 'Activated', 'Billing cycle active and services provisioned.');
  const pauseSubscription = (id) => transitionSubscription(id, 'paused', 'Paused', 'Service temporarily suspended upon client request.');
  const resumeSubscription = (id) => transitionSubscription(id, 'active', 'Resumed', 'Subscription resumed and regular billing re-enabled.');

  // Renew Subscription (Advances next billing date)
  const renewSubscription = async (id) => {
    setError(null);
    setSuccessMsg(null);

    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return;

    // Calculate advance date
    const currentNext = sub.nextBillingDate ? new Date(sub.nextBillingDate) : new Date();
    currentNext.setMonth(currentNext.getMonth() + (sub.billingCycle === 'Annual' ? 12 : 1));
    const nextBillStr = currentNext.toISOString().split('T')[0];

    const nowIso = new Date().toISOString();
    const renewEntry = {
      timestamp: nowIso,
      event: 'Renewed',
      actor: user?.email || 'Automated Recurring Engine',
      note: `Subscription successfully renewed for another cycle. Next billing: ${nextBillStr}`,
    };

    if (isDemoMode) {
      const updated = subscriptions.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            status: 'active',
            nextBillingDate: nextBillStr,
            history: [renewEntry, ...(s.history || [])],
          };
        }
        return s;
      });

      setSubscriptions(updated);
      localStorage.setItem(DEMO_SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(updated));
      setSuccessMsg(`Subscription renewed. Next renewal scheduled for ${nextBillStr}.`);
      return;
    }

    try {
      const updatedHistory = [renewEntry, ...(sub.history || [])];
      const { error: updErr } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          next_billing_date: nextBillStr,
          history: updatedHistory,
        })
        .eq('id', id);

      if (updErr) throw updErr;

      await fetchSubscriptions();
      setSuccessMsg(`Subscription renewed. Next renewal: ${nextBillStr}.`);
    } catch (err) {
      setError(err.message || 'Failed to renew subscription.');
    }
  };

  // Close Subscription (Immediate vs End of Billing Period)
  const closeSubscription = async (id, { immediate = true, reason = '' } = {}) => {
    setError(null);
    setSuccessMsg(null);

    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return;

    const nowIso = new Date().toISOString();

    if (immediate) {
      const closeEntry = {
        timestamp: nowIso,
        event: 'Closed Early',
        actor: user?.email || 'Operations Desk',
        note: `Subscription terminated immediately. Reason: ${reason || 'Client request'}`,
      };

      if (isDemoMode) {
        const updated = subscriptions.map((s) =>
          s.id === id
            ? {
                ...s,
                status: 'closed',
                autoRenew: false,
                closureReason: reason,
                history: [closeEntry, ...(s.history || [])],
              }
            : s
        );

        setSubscriptions(updated);
        localStorage.setItem(DEMO_SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(updated));
        setSuccessMsg(`Subscription closed immediately.`);
        return;
      }

      try {
        const updatedHistory = [closeEntry, ...(sub.history || [])];
        const { error: updErr } = await supabase
          .from('subscriptions')
          .update({
            status: 'closed',
            auto_renew: false,
            closure_reason: reason,
            history: updatedHistory,
          })
          .eq('id', id);

        if (updErr) throw updErr;
        await fetchSubscriptions();
        setSuccessMsg(`Subscription closed.`);
      } catch (err) {
        setError(err.message);
      }
    } else {
      // Closure at Period End
      const scheduleEntry = {
        timestamp: nowIso,
        event: 'Cancellation Scheduled at Period End',
        actor: user?.email || 'Customer / Operations',
        note: `Set to terminate at end of current period (${sub.nextBillingDate}). Reason: ${reason || 'Non-renewal'}`,
      };

      if (isDemoMode) {
        const updated = subscriptions.map((s) =>
          s.id === id
            ? {
                ...s,
                cancelAtPeriodEnd: true,
                autoRenew: false,
                closureReason: reason,
                history: [scheduleEntry, ...(s.history || [])],
              }
            : s
        );

        setSubscriptions(updated);
        localStorage.setItem(DEMO_SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(updated));
        setSuccessMsg(`Subscription scheduled to terminate at period end (${sub.nextBillingDate}).`);
        return;
      }

      try {
        const updatedHistory = [scheduleEntry, ...(sub.history || [])];
        const { error: updErr } = await supabase
          .from('subscriptions')
          .update({
            cancel_at_period_end: true,
            auto_renew: false,
            closure_reason: reason,
            history: updatedHistory,
          })
          .eq('id', id);

        if (updErr) throw updErr;
        await fetchSubscriptions();
        setSuccessMsg(`Cancellation scheduled for ${sub.nextBillingDate}.`);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Filtered Subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((s) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        s.subscriptionNumber?.toLowerCase().includes(query) ||
        s.customerName?.toLowerCase().includes(query) ||
        s.customerEmail?.toLowerCase().includes(query) ||
        s.planName?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        s.status?.toLowerCase() === statusFilter.toLowerCase();

      const matchesCycle =
        cycleFilter === 'all' ||
        s.billingCycle?.toLowerCase() === cycleFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesCycle;
    });
  }, [subscriptions, searchQuery, statusFilter, cycleFilter]);

  // Pagination
  const totalItems = filteredSubscriptions.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedSubscriptions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSubscriptions.slice(start, start + pageSize);
  }, [filteredSubscriptions, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, cycleFilter]);

  return {
    subscriptions,
    filteredSubscriptions,
    paginatedSubscriptions,
    totalItems,
    totalPages,
    currentPage,
    setCurrentPage,
    pageSize,
    loading,
    error,
    successMsg,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    cycleFilter,
    setCycleFilter,
    convertQuotationToSubscription,
    confirmSubscription,
    activateSubscription,
    pauseSubscription,
    resumeSubscription,
    renewSubscription,
    closeSubscription,
    refreshSubscriptions: fetchSubscriptions,
    clearFeedback: () => {
      setError(null);
      setSuccessMsg(null);
    },
  };
}
