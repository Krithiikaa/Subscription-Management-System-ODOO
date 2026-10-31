import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import { DEMO_PLANS } from '../lib/demoData';

const DEMO_PLANS_STORAGE_KEY = 'brightloop_demo_plans_custom';

export function useSubscriptionPlans() {
  const { user, role } = useAuth();
  const { isDemoMode } = useDemoMode();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (isDemoMode) {
      try {
        const stored = localStorage.getItem(DEMO_PLANS_STORAGE_KEY);
        let customPlans = stored ? JSON.parse(stored) : null;

        if (!customPlans) {
          customPlans = DEMO_PLANS.map((p, idx) => ({
            id: p.id,
            name: p.name,
            code: p.code,
            productId: p.productId || `prod-bl-${String((idx % 30) + 1).padStart(2, '0')}`,
            billingCycle: p.billingCycle || 'Monthly',
            price: p.price,
            minQuantity: 1,
            availableFrom: '2026-01-01',
            availableUntil: '2027-12-31',
            closeAtEndOfPeriod: true,
            allowEarlyClosure: false,
            allowPause: true,
            allowRenewal: true,
            status: p.status || 'active',
            description: p.description || '',
            createdAt: '2026-01-15T10:00:00Z',
          }));
        }

        setPlans(customPlans);
      } catch (err) {
        console.error('Error loading demo plans:', err);
        setPlans([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Live Database Mode
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured.');
      setPlans([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchErr } = await supabase
        .from('subscription_plans')
        .select(`
          *,
          products ( id, name, code, sales_price )
        `)
        .order('created_at', { ascending: false });

      if (fetchErr) {
        if (fetchErr.code === 'PGRST205' || fetchErr.message?.includes('not find')) {
          setError('Live "subscription_plans" table pending migration (05_create_products_and_plans.sql).');
          setPlans([]);
        } else {
          setError(fetchErr.message);
        }
      } else {
        const normalized = (data || []).map((p) => ({
          id: p.id,
          name: p.name,
          code: p.code,
          productId: p.product_id,
          product: p.products,
          billingCycle: p.billing_cycle,
          price: Number(p.price),
          minQuantity: p.min_quantity,
          availableFrom: p.available_from,
          availableUntil: p.available_until,
          closeAtEndOfPeriod: p.close_at_end_of_period,
          allowEarlyClosure: p.allow_early_closure,
          allowPause: p.allow_pause,
          allowRenewal: p.allow_renewal,
          status: p.status,
          description: p.description,
          createdAt: p.created_at,
        }));
        setPlans(normalized);
      }
    } catch (err) {
      setError(err.message || 'Failed to query live subscription plans.');
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Persist demo plans in localStorage
  const saveDemoPlans = (newPlans) => {
    setPlans(newPlans);
    try {
      localStorage.setItem(DEMO_PLANS_STORAGE_KEY, JSON.stringify(newPlans));
    } catch (e) {
      console.warn('Could not persist demo plans to localStorage:', e);
    }
  };

  // Add Subscription Plan
  const addPlan = async (planData) => {
    setError(null);
    setSuccessMsg(null);

    if (!isDemoMode && role !== 'admin') {
      throw new Error('Unauthorized: Only administrators can create subscription plans.');
    }

    const {
      name,
      code,
      productId,
      billingCycle = 'Monthly',
      price = 0,
      minQuantity = 1,
      availableFrom,
      availableUntil,
      closeAtEndOfPeriod = true,
      allowEarlyClosure = false,
      allowPause = true,
      allowRenewal = true,
      status = 'active',
      description = '',
    } = planData;

    // Validation
    if (!name?.trim()) throw new Error('Plan name is required.');
    if (price < 0) throw new Error('Plan price cannot be negative.');
    if (minQuantity < 1) throw new Error('Minimum quantity must be at least 1.');
    if (availableFrom && availableUntil && new Date(availableUntil) < new Date(availableFrom)) {
      throw new Error('Available until date cannot be earlier than available from date.');
    }

    if (isDemoMode) {
      const newPlan = {
        id: `plan-custom-${Date.now()}`,
        name: name.trim(),
        code: code?.trim() || `PLN-${Date.now().toString().slice(-4)}`,
        productId: productId || null,
        billingCycle,
        price: Number(price),
        minQuantity: Number(minQuantity),
        availableFrom: availableFrom || null,
        availableUntil: availableUntil || null,
        closeAtEndOfPeriod: Boolean(closeAtEndOfPeriod),
        allowEarlyClosure: Boolean(allowEarlyClosure),
        allowPause: Boolean(allowPause),
        allowRenewal: Boolean(allowRenewal),
        status,
        description: description?.trim() || '',
        createdAt: new Date().toISOString(),
      };

      const updated = [newPlan, ...plans];
      saveDemoPlans(updated);
      setSuccessMsg(`Subscription Plan "${newPlan.name}" created successfully.`);
      return newPlan;
    }

    // Live Mode
    try {
      const { data, error: insErr } = await supabase
        .from('subscription_plans')
        .insert({
          name: name.trim(),
          code: code?.trim() || null,
          product_id: productId || null,
          billing_cycle: billingCycle.toLowerCase(),
          price: Number(price),
          min_quantity: Number(minQuantity),
          available_from: availableFrom || null,
          available_until: availableUntil || null,
          close_at_end_of_period: Boolean(closeAtEndOfPeriod),
          allow_early_closure: Boolean(allowEarlyClosure),
          allow_pause: Boolean(allowPause),
          allow_renewal: Boolean(allowRenewal),
          status,
          description: description?.trim() || null,
          created_by: user?.id,
        })
        .select()
        .single();

      if (insErr) throw insErr;
      await fetchPlans();
      setSuccessMsg(`Subscription Plan "${name}" created successfully in database.`);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Edit / Update Plan
  const updatePlan = async (id, updatedFields) => {
    setError(null);
    setSuccessMsg(null);

    if (!isDemoMode && role !== 'admin') {
      throw new Error('Unauthorized: Only administrators can modify subscription plans.');
    }

    // Validate dates if updated
    if (
      updatedFields.availableFrom &&
      updatedFields.availableUntil &&
      new Date(updatedFields.availableUntil) < new Date(updatedFields.availableFrom)
    ) {
      throw new Error('Available until date cannot be earlier than available from date.');
    }

    if (isDemoMode) {
      const updated = plans.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            ...updatedFields,
            price: updatedFields.price !== undefined ? Number(updatedFields.price) : p.price,
            minQuantity: updatedFields.minQuantity !== undefined ? Number(updatedFields.minQuantity) : p.minQuantity,
          };
        }
        return p;
      });

      saveDemoPlans(updated);
      setSuccessMsg('Subscription Plan updated successfully.');
      return;
    }

    // Live Mode
    try {
      const { error: updErr } = await supabase
        .from('subscription_plans')
        .update({
          name: updatedFields.name?.trim(),
          code: updatedFields.code?.trim() || null,
          product_id: updatedFields.productId || null,
          billing_cycle: updatedFields.billingCycle ? updatedFields.billingCycle.toLowerCase() : undefined,
          price: updatedFields.price !== undefined ? Number(updatedFields.price) : undefined,
          min_quantity: updatedFields.minQuantity !== undefined ? Number(updatedFields.minQuantity) : undefined,
          available_from: updatedFields.availableFrom || null,
          available_until: updatedFields.availableUntil || null,
          close_at_end_of_period: updatedFields.closeAtEndOfPeriod,
          allow_early_closure: updatedFields.allowEarlyClosure,
          allow_pause: updatedFields.allowPause,
          allow_renewal: updatedFields.allowRenewal,
          status: updatedFields.status,
          description: updatedFields.description,
        })
        .eq('id', id);

      if (updErr) throw updErr;
      await fetchPlans();
      setSuccessMsg('Subscription Plan updated successfully.');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Archive / Toggle Status
  const toggleArchivePlan = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'archived' : 'active';
    return updatePlan(id, { status: newStatus });
  };

  return {
    plans,
    loading,
    error,
    successMsg,
    setSuccessMsg,
    setError,
    addPlan,
    updatePlan,
    toggleArchivePlan,
    refreshPlans: fetchPlans,
  };
}
