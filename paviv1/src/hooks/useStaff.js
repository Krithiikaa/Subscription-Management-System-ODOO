import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import { DEMO_STAFF } from '../lib/demoData';

const DEMO_STAFF_STORAGE_KEY = 'brightloop_demo_staff_custom';
const DEMO_INVITATIONS_STORAGE_KEY = 'brightloop_demo_invitations_custom';

const INITIAL_DEMO_INVITES = [
  {
    id: 'inv-tn-01',
    token: 'inv-tok-kavitha-ramesh',
    name: 'Kavitha Ramesh',
    email: 'kavitha.ramesh@brightloop.in',
    role: 'Customer Success Specialist',
    department: 'Customer Success',
    office: 'Coimbatore Tidel',
    status: 'pending',
    createdAt: '2026-10-29T11:20:00Z',
    expiresAt: '2026-11-05T11:20:00Z',
  },
  {
    id: 'inv-tn-02',
    token: 'inv-tok-saravanan-r',
    name: 'Saravanan Rajendran',
    email: 'saravanan.r@brightloop.in',
    role: 'Solutions Architect',
    department: 'Platform Engineering',
    office: 'T. Nagar HQ',
    status: 'accepted',
    createdAt: '2026-10-20T09:00:00Z',
    expiresAt: '2026-10-27T09:00:00Z',
  },
  {
    id: 'inv-tn-03',
    token: 'inv-tok-manoj-kumar',
    name: 'Manoj Kumar',
    email: 'manoj.kumar@brightloop.in',
    role: 'Infrastructure Specialist',
    department: 'Platform Engineering',
    office: 'T. Nagar HQ',
    status: 'expired',
    createdAt: '2026-10-10T08:00:00Z',
    expiresAt: '2026-10-17T08:00:00Z',
  },
];

export function useStaff() {
  const { user, role: currentUserRole } = useAuth();
  const { isDemoMode } = useDemoMode();

  const [staffList, setStaffList] = useState([]);
  const [invitationsList, setInvitationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [officeFilter, setOfficeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [invitationStatusFilter, setInvitationStatusFilter] = useState('all'); // all | pending | accepted | expired
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch staff and invitations
  const fetchStaffData = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (isDemoMode) {
      try {
        const storedStaff = localStorage.getItem(DEMO_STAFF_STORAGE_KEY);
        let sList = storedStaff ? JSON.parse(storedStaff) : null;
        if (!sList || !Array.isArray(sList) || sList.length === 0) {
          sList = DEMO_STAFF.map((s) => ({
            ...s,
            accountStatus: s.status || 'active',
          }));
          localStorage.setItem(DEMO_STAFF_STORAGE_KEY, JSON.stringify(sList));
        }

        const storedInvites = localStorage.getItem(DEMO_INVITATIONS_STORAGE_KEY);
        let iList = storedInvites ? JSON.parse(storedInvites) : null;
        if (!iList || !Array.isArray(iList) || iList.length === 0) {
          iList = INITIAL_DEMO_INVITES;
          localStorage.setItem(DEMO_INVITATIONS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_INVITES));
        }

        setStaffList(sList);
        setInvitationsList(iList);
      } catch (err) {
        console.error('Error loading demo staff:', err);
        setStaffList(DEMO_STAFF);
        setInvitationsList(INITIAL_DEMO_INVITES);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Live Database Mode
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured.');
      setStaffList([]);
      setInvitationsList([]);
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch Staff from public.profiles
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['staff', 'admin'])
        .order('created_at', { ascending: false });

      if (pErr) throw pErr;

      const normalizedStaff = (profiles || []).map((p) => ({
        id: p.id,
        name: p.full_name || p.email.split('@')[0],
        email: p.email,
        role: p.role === 'admin' ? 'System Administrator' : 'Staff Operator',
        rawRole: p.role,
        department: p.department || 'Operations',
        office: p.office || 'T. Nagar HQ',
        phone: p.phone || '',
        accountStatus: p.account_status || 'active',
        createdAt: p.created_at,
      }));

      setStaffList(normalizedStaff);

      // 2. Fetch Invitations
      const { data: invites, error: iErr } = await supabase
        .from('staff_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (iErr) {
        console.warn('Invitations load note:', iErr.message);
      } else {
        const normalizedInvites = (invites || []).map((inv) => ({
          id: inv.id,
          token: inv.token || `tok-${inv.id}`,
          name: inv.name || inv.email.split('@')[0],
          email: inv.email,
          role: inv.role_title || 'Staff Operator',
          department: inv.department || 'Operations',
          office: inv.office || 'T. Nagar HQ',
          status: inv.status,
          createdAt: inv.created_at,
          expiresAt: inv.expires_at,
        }));
        setInvitationsList(normalizedInvites);
      }
    } catch (err) {
      setError(err.message || 'Error loading staff members.');
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  // Invite Staff (Strictly Admin Only)
  const inviteStaff = async (formData) => {
    setError(null);
    setSuccessMsg(null);

    const email = formData.email?.trim().toLowerCase();
    const name = formData.name?.trim() || email.split('@')[0];
    const department = formData.department || 'Customer Success';
    const roleTitle = formData.role?.trim() || 'Staff Operator';
    const office = formData.office || 'T. Nagar HQ';

    if (!name) {
      throw new Error('Please enter the staff member full name.');
    }

    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    // Check duplicate in active staff
    const existsInStaff = staffList.some((s) => s.email?.toLowerCase() === email);
    if (existsInStaff) {
      throw new Error(`A staff member with email "${email}" already has an active account.`);
    }

    // Check duplicate in active pending invitations
    const pendingInvite = invitationsList.some(
      (inv) => inv.email?.toLowerCase() === email && inv.status === 'pending'
    );
    if (pendingInvite) {
      throw new Error(`An active pending invitation for "${email}" is already outstanding.`);
    }

    const secureToken = `tok_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    if (isDemoMode) {
      const newInvite = {
        id: `inv-${Date.now()}`,
        token: secureToken,
        name,
        email,
        role: roleTitle,
        department,
        office,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt,
      };

      const updated = [newInvite, ...invitationsList];
      setInvitationsList(updated);
      localStorage.setItem(DEMO_INVITATIONS_STORAGE_KEY, JSON.stringify(updated));

      const origin = window.location.origin;
      const inviteUrl = `${origin}/accept-invitation?token=${secureToken}&email=${encodeURIComponent(email)}`;

      setSuccessMsg(`Invitation successfully issued to ${email}. Token valid for 7 days.`);
      return { invite: newInvite, inviteUrl };
    }

    // Live Database Mode
    try {
      const { data, error: rpcErr } = await supabase.rpc('invite_staff_member', {
        target_email: email,
      });

      if (rpcErr) throw rpcErr;

      // Update name/dept/role on invitation row
      await supabase
        .from('staff_invitations')
        .update({
          name,
          department,
          role_title: roleTitle,
          office,
          token: secureToken,
        })
        .eq('email', email)
        .eq('status', 'pending');

      await fetchStaffData();
      const origin = window.location.origin;
      const inviteUrl = `${origin}/accept-invitation?token=${secureToken}&email=${encodeURIComponent(email)}`;
      setSuccessMsg(`Staff invitation issued to ${email}.`);
      return { inviteUrl };
    } catch (err) {
      setError(err.message || 'Failed to issue staff invitation.');
      throw err;
    }
  };

  // Get invitation details by token or email
  const getInvitationDetails = (token, email) => {
    let inv = null;
    if (token) {
      inv = invitationsList.find((i) => i.token === token);
    }
    if (!inv && email) {
      inv = invitationsList.find((i) => i.email?.toLowerCase() === email.toLowerCase());
    }

    if (!inv) return null;

    const isExpired = new Date(inv.expiresAt) < new Date();
    const isAccepted = inv.status === 'accepted';
    const isPending = inv.status === 'pending' && !isExpired;

    return {
      ...inv,
      isExpired,
      isAccepted,
      isPending,
    };
  };

  // Accept Staff Invitation (Set Password and activate profile)
  const acceptStaffInvitation = async ({ token, email, password, name }) => {
    setError(null);
    setSuccessMsg(null);

    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const inv = getInvitationDetails(token, email);
    if (!inv) {
      throw new Error('Invalid or non-existent staff invitation token.');
    }

    if (inv.isAccepted) {
      throw new Error('This invitation has already been accepted. Please sign in to your Staff Dashboard.');
    }

    if (inv.isExpired) {
      throw new Error('This staff invitation link has expired. Please contact your system administrator.');
    }

    if (isDemoMode) {
      // 1. Mark invitation as accepted
      const updatedInvites = invitationsList.map((i) =>
        i.id === inv.id ? { ...i, status: 'accepted' } : i
      );
      setInvitationsList(updatedInvites);
      localStorage.setItem(DEMO_INVITATIONS_STORAGE_KEY, JSON.stringify(updatedInvites));

      // 2. Create/Activate the new staff member
      const newStaff = {
        id: `staff-new-${Date.now()}`,
        name: name?.trim() || inv.name,
        email: inv.email,
        role: inv.role || 'Staff Operator',
        rawRole: 'staff',
        department: inv.department || 'Customer Success',
        office: inv.office || 'T. Nagar HQ',
        phone: '+91 98400 99000',
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
      };

      const updatedStaffList = [newStaff, ...staffList];
      setStaffList(updatedStaffList);
      localStorage.setItem(DEMO_STAFF_STORAGE_KEY, JSON.stringify(updatedStaffList));

      setSuccessMsg(`Welcome to Brightloop, ${newStaff.name}! Your staff account is activated.`);
      return { success: true, staff: newStaff };
    }

    // Live Database Mode
    try {
      // Complete Supabase Auth signup / activation with verified staff role
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: inv.email,
        password,
        options: {
          data: {
            full_name: name || inv.name,
          },
        },
      });

      if (authErr && !authErr.message.includes('already registered')) {
        throw authErr;
      }

      // Mark invitation as accepted in DB
      await supabase
        .from('staff_invitations')
        .update({ status: 'accepted' })
        .eq('id', inv.id);

      // Ensure profile role is staff and account status is active
      if (authData?.user) {
        await supabase
          .from('profiles')
          .update({
            role: 'staff',
            account_status: 'active',
            department: inv.department,
            office: inv.office,
            full_name: name || inv.name,
          })
          .eq('id', authData.user.id);
      }

      await fetchStaffData();
      return { success: true };
    } catch (err) {
      setError(err.message || 'Could not complete invitation acceptance.');
      throw err;
    }
  };

  // Resend or regenerate invitation
  const resendInvitation = async (invitationId) => {
    const freshToken = `tok_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    const freshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    if (isDemoMode) {
      const updated = invitationsList.map((i) =>
        i.id === invitationId
          ? { ...i, status: 'pending', token: freshToken, expiresAt: freshExpiry }
          : i
      );
      setInvitationsList(updated);
      localStorage.setItem(DEMO_INVITATIONS_STORAGE_KEY, JSON.stringify(updated));

      const inv = updated.find((i) => i.id === invitationId);
      const origin = window.location.origin;
      const inviteUrl = `${origin}/accept-invitation?token=${freshToken}&email=${encodeURIComponent(inv.email)}`;
      setSuccessMsg(`Invitation refreshed for ${inv.email}. New link generated.`);
      return { inviteUrl };
    }

    try {
      await supabase
        .from('staff_invitations')
        .update({
          status: 'pending',
          token: freshToken,
          expires_at: freshExpiry,
        })
        .eq('id', invitationId);

      await fetchStaffData();
      setSuccessMsg('Invitation token renewed.');
    } catch (err) {
      setError(err.message || 'Failed to resend invitation.');
    }
  };

  // Toggle Staff Suspension
  const toggleStaffStatus = async (staffMember) => {
    setError(null);
    setSuccessMsg(null);

    const nextStatus = staffMember.accountStatus === 'active' ? 'suspended' : 'active';

    if (isDemoMode) {
      const updated = staffList.map((s) =>
        s.id === staffMember.id ? { ...s, accountStatus: nextStatus } : s
      );
      setStaffList(updated);
      localStorage.setItem(DEMO_STAFF_STORAGE_KEY, JSON.stringify(updated));
      setSuccessMsg(`Staff account for ${staffMember.name} updated to ${nextStatus}.`);
      return;
    }

    try {
      const { error: updErr } = await supabase
        .from('profiles')
        .update({ account_status: nextStatus })
        .eq('id', staffMember.id);

      if (updErr) throw updErr;

      await fetchStaffData();
      setSuccessMsg(`Staff account ${staffMember.email} is now ${nextStatus}.`);
    } catch (err) {
      setError(err.message || 'Could not update staff account status.');
      throw err;
    }
  };

  // Update Staff Department / Office
  const updateStaffProfile = async (staffId, updateData) => {
    setError(null);
    setSuccessMsg(null);

    if (isDemoMode) {
      const updated = staffList.map((s) => {
        if (s.id === staffId) {
          return {
            ...s,
            name: updateData.name || s.name,
            role: updateData.role || s.role,
            department: updateData.department || s.department,
            office: updateData.office || s.office,
            phone: updateData.phone || s.phone,
          };
        }
        return s;
      });
      setStaffList(updated);
      localStorage.setItem(DEMO_STAFF_STORAGE_KEY, JSON.stringify(updated));
      setSuccessMsg(`Staff details updated.`);
      return;
    }

    try {
      const { error: updErr } = await supabase
        .from('profiles')
        .update({
          department: updateData.department,
          office: updateData.office,
          phone: updateData.phone,
          full_name: updateData.name,
        })
        .eq('id', staffId);

      if (updErr) throw updErr;

      await fetchStaffData();
      setSuccessMsg(`Staff profile updated successfully.`);
    } catch (err) {
      setError(err.message || 'Could not update staff profile.');
      throw err;
    }
  };

  // Filtered staff roster
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        s.name?.toLowerCase().includes(query) ||
        s.email?.toLowerCase().includes(query) ||
        s.role?.toLowerCase().includes(query) ||
        s.department?.toLowerCase().includes(query) ||
        s.office?.toLowerCase().includes(query);

      const matchesDept =
        departmentFilter === 'all' ||
        s.department?.toLowerCase() === departmentFilter.toLowerCase();

      const matchesOffice =
        officeFilter === 'all' ||
        s.office?.toLowerCase() === officeFilter.toLowerCase();

      const matchesStatus =
        statusFilter === 'all' ||
        s.accountStatus?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesDept && matchesOffice && matchesStatus;
    });
  }, [staffList, searchQuery, departmentFilter, officeFilter, statusFilter]);

  // Filtered invitations list
  const filteredInvitations = useMemo(() => {
    return invitationsList.filter((inv) => {
      if (invitationStatusFilter === 'all') return true;
      if (invitationStatusFilter === 'expired') {
        return inv.status === 'expired' || new Date(inv.expiresAt) < new Date();
      }
      return inv.status === invitationStatusFilter;
    });
  }, [invitationsList, invitationStatusFilter]);

  // Pagination calculation
  const totalItems = filteredStaff.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStaff.slice(start, start + pageSize);
  }, [filteredStaff, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, departmentFilter, officeFilter, statusFilter]);

  // Unique departments & offices
  const availableDepartments = useMemo(() => {
    const set = new Set();
    staffList.forEach((s) => {
      if (s.department) set.add(s.department.trim());
    });
    return Array.from(set).sort();
  }, [staffList]);

  const availableOffices = useMemo(() => {
    const set = new Set();
    staffList.forEach((s) => {
      if (s.office) set.add(s.office.trim());
    });
    return Array.from(set).sort();
  }, [staffList]);

  return {
    staffList,
    filteredStaff,
    paginatedStaff,
    invitationsList,
    filteredInvitations,
    invitationStatusFilter,
    setInvitationStatusFilter,
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
    departmentFilter,
    setDepartmentFilter,
    officeFilter,
    setOfficeFilter,
    statusFilter,
    setStatusFilter,
    availableDepartments,
    availableOffices,
    inviteStaff,
    getInvitationDetails,
    acceptStaffInvitation,
    resendInvitation,
    toggleStaffStatus,
    updateStaffProfile,
    refreshStaff: fetchStaffData,
    clearFeedback: () => {
      setError(null);
      setSuccessMsg(null);
    },
  };
}
