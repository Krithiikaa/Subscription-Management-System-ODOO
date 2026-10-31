import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import {
  DEMO_CUSTOMERS,
  DEMO_QUOTATIONS,
  DEMO_SUBSCRIPTIONS,
  DEMO_INVOICES,
  DEMO_PAYMENTS,
} from '../lib/demoData';

const DEMO_CUSTOMERS_STORAGE_KEY = 'brightloop_demo_customers_custom';

export function useCustomers() {
  const { user, role } = useAuth();
  const { isDemoMode } = useDemoMode();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters and Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | inactive | suspended
  const [cityFilter, setCityFilter] = useState('all');
  const [segmentFilter, setSegmentFilter] = useState('all'); // all | Enterprise | Mid-Market | SME
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Load Customers
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (isDemoMode) {
      try {
        const stored = localStorage.getItem(DEMO_CUSTOMERS_STORAGE_KEY);
        let list = stored ? JSON.parse(stored) : null;

        if (!list || !Array.isArray(list) || list.length === 0) {
          list = DEMO_CUSTOMERS.map((c) => ({
            ...c,
            status: c.status || 'active',
          }));
          localStorage.setItem(DEMO_CUSTOMERS_STORAGE_KEY, JSON.stringify(list));
        }

        setCustomers(list);
      } catch (err) {
        console.error('Failed to load demo customers:', err);
        setCustomers(DEMO_CUSTOMERS);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Live Database Mode
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured.');
      setCustomers([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchErr } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchErr) {
        if (fetchErr.code === 'PGRST205' || fetchErr.message?.includes('not find')) {
          setError('Live "customers" table pending migration (06_create_customers_and_staff_enhancements.sql).');
          setCustomers([]);
        } else {
          setError(fetchErr.message);
        }
      } else {
        const normalized = (data || []).map((c) => ({
          id: c.id,
          userId: c.user_id,
          name: c.name,
          email: c.email,
          phone: c.phone || '',
          company: c.company || '',
          gstin: c.gstin || '',
          address: c.address || '',
          city: c.city || '',
          state: c.state || '',
          status: c.status || 'active',
          segment: c.segment || 'Mid-Market',
          createdAt: c.created_at,
          joinedDate: c.created_at ? c.created_at.split('T')[0] : '',
        }));
        setCustomers(normalized);
      }
    } catch (err) {
      setError(err.message || 'Error fetching customers.');
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Check for duplicate email
  const isDuplicateEmail = (email, excludeCustomerId = null) => {
    if (!email) return false;
    const cleanEmail = email.trim().toLowerCase();
    return customers.some(
      (c) => c.email?.trim().toLowerCase() === cleanEmail && c.id !== excludeCustomerId
    );
  };

  // Add Customer
  const addCustomer = async (formData) => {
    setError(null);
    setSuccessMsg(null);

    const email = formData.email?.trim().toLowerCase();
    if (!formData.name?.trim()) throw new Error('Customer full name is required.');
    if (!email) throw new Error('Customer email is required.');

    // Duplicate check
    if (isDuplicateEmail(email)) {
      throw new Error(`Customer email "${email}" is already registered. Duplicate emails are prohibited.`);
    }

    if (isDemoMode) {
      const newCustomer = {
        id: `cust-user-${Date.now()}`,
        name: formData.name.trim(),
        email,
        phone: formData.phone?.trim() || '+91 98400 00000',
        company: formData.company?.trim() || 'Independent Enterprise',
        gstin: formData.gstin?.trim() || '33DEMO9999A1Z9',
        address: formData.address?.trim() || 'Industrial Estate',
        city: formData.city?.trim() || 'Chennai',
        state: formData.state?.trim() || 'Tamil Nadu',
        pincode: formData.pincode?.trim() || '600001',
        status: formData.status || 'active',
        segment: formData.segment || 'Mid-Market',
        joinedDate: new Date().toISOString().split('T')[0],
        avatarColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      };

      const updated = [newCustomer, ...customers];
      setCustomers(updated);
      localStorage.setItem(DEMO_CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));
      setSuccessMsg(`Customer "${newCustomer.name}" added successfully.`);
      return newCustomer;
    }

    // Live Supabase Mode
    try {
      const { data, error: insertErr } = await supabase
        .from('customers')
        .insert({
          name: formData.name.trim(),
          email,
          phone: formData.phone?.trim() || null,
          company: formData.company?.trim() || null,
          gstin: formData.gstin?.trim() || null,
          address: formData.address?.trim() || null,
          city: formData.city?.trim() || null,
          state: formData.state?.trim() || null,
          status: formData.status || 'active',
        })
        .select()
        .single();

      if (insertErr) {
        if (insertErr.code === '23505') {
          throw new Error(`Customer with email "${email}" already exists.`);
        }
        throw insertErr;
      }

      await fetchCustomers();
      setSuccessMsg(`Customer "${formData.name}" added successfully.`);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update Customer
  const updateCustomer = async (id, formData) => {
    setError(null);
    setSuccessMsg(null);

    const email = formData.email?.trim().toLowerCase();
    if (!formData.name?.trim()) throw new Error('Customer full name is required.');
    if (!email) throw new Error('Customer email is required.');

    // Duplicate check excluding self
    if (isDuplicateEmail(email, id)) {
      throw new Error(`Another customer with email "${email}" already exists.`);
    }

    if (isDemoMode) {
      const updated = customers.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            name: formData.name.trim(),
            email,
            phone: formData.phone?.trim() || c.phone,
            company: formData.company?.trim() || c.company,
            gstin: formData.gstin?.trim() || c.gstin,
            address: formData.address?.trim() || c.address,
            city: formData.city?.trim() || c.city,
            state: formData.state?.trim() || c.state,
            status: formData.status || c.status,
            segment: formData.segment || c.segment,
          };
        }
        return c;
      });

      setCustomers(updated);
      localStorage.setItem(DEMO_CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));
      setSuccessMsg(`Customer "${formData.name}" updated successfully.`);
      return;
    }

    // Live Mode
    try {
      const { error: updateErr } = await supabase
        .from('customers')
        .update({
          name: formData.name.trim(),
          email,
          phone: formData.phone?.trim() || null,
          company: formData.company?.trim() || null,
          gstin: formData.gstin?.trim() || null,
          address: formData.address?.trim() || null,
          city: formData.city?.trim() || null,
          state: formData.state?.trim() || null,
          status: formData.status || 'active',
        })
        .eq('id', id);

      if (updateErr) throw updateErr;

      await fetchCustomers();
      setSuccessMsg(`Customer updated successfully.`);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Toggle Customer Status (Active / Inactive)
  const toggleCustomerStatus = async (customer) => {
    const nextStatus = customer.status === 'active' ? 'inactive' : 'active';

    if (isDemoMode) {
      const updated = customers.map((c) =>
        c.id === customer.id ? { ...c, status: nextStatus } : c
      );
      setCustomers(updated);
      localStorage.setItem(DEMO_CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));
      setSuccessMsg(`Customer "${customer.name}" is now ${nextStatus}.`);
      return;
    }

    try {
      const { error: statusErr } = await supabase
        .from('customers')
        .update({ status: nextStatus })
        .eq('id', customer.id);

      if (statusErr) throw statusErr;

      await fetchCustomers();
      setSuccessMsg(`Customer status changed to ${nextStatus}.`);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Fetch 360-degree Related Records for a Customer
  const getCustomerRelations = useCallback((customerId, customerEmail) => {
    if (!customerId) return { quotations: [], subscriptions: [], invoices: [], payments: [] };

    // In demo dataset, match primarily by customerId (e.g. 'cust-tn-01')
    const quotations = DEMO_QUOTATIONS.filter((q) => q.customerId === customerId);
    const subscriptions = DEMO_SUBSCRIPTIONS.filter((s) => s.customerId === customerId);
    const invoices = DEMO_INVOICES.filter((inv) => inv.customerId === customerId);
    const payments = DEMO_PAYMENTS.filter((p) => p.customerId === customerId);

    return { quotations, subscriptions, invoices, payments };
  }, []);

  // Filtered & Search Results
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // Search matching name, company, email, phone, gstin, city
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        c.name?.toLowerCase().includes(query) ||
        c.company?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query) ||
        c.gstin?.toLowerCase().includes(query) ||
        c.city?.toLowerCase().includes(query);

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        c.status?.toLowerCase() === statusFilter.toLowerCase();

      // City filter
      const matchesCity =
        cityFilter === 'all' ||
        c.city?.toLowerCase() === cityFilter.toLowerCase();

      // Segment filter
      const matchesSegment =
        segmentFilter === 'all' ||
        c.segment?.toLowerCase() === segmentFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesCity && matchesSegment;
    });
  }, [customers, searchQuery, statusFilter, cityFilter, segmentFilter]);

  // Pagination calculation
  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, cityFilter, segmentFilter]);

  // Unique cities list for filter dropdown
  const availableCities = useMemo(() => {
    const set = new Set();
    customers.forEach((c) => {
      if (c.city) set.add(c.city.trim());
    });
    return Array.from(set).sort();
  }, [customers]);

  return {
    customers,
    filteredCustomers,
    paginatedCustomers,
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
    cityFilter,
    setCityFilter,
    segmentFilter,
    setSegmentFilter,
    availableCities,
    addCustomer,
    updateCustomer,
    toggleCustomerStatus,
    getCustomerRelations,
    refreshCustomers: fetchCustomers,
    clearFeedback: () => {
      setError(null);
      setSuccessMsg(null);
    },
  };
}
