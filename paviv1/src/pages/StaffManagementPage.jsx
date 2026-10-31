import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { StatusPill } from '../components/common/StatusPill';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import { useStaff } from '../hooks/useStaff';
import { StaffFormModal } from '../components/staff/StaffFormModal';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Building2,
  MapPin,
  Phone,
  Search,
  Filter,
  RefreshCw,
  Ban,
  CheckCircle2,
  AlertCircle,
  Send,
  RotateCcw,
  Edit2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Database,
  Copy,
  ExternalLink,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '../lib/utils';

export function StaffManagementPage() {
  const { role: currentUserRole } = useAuth();
  const { isDemoMode } = useDemoMode();

  const {
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
    resendInvitation,
    toggleStaffStatus,
    updateStaffProfile,
    clearFeedback,
  } = useStaff();

  // Invite Form State (All required fields: Name, Email, Department, Role, Office)
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDept, setInviteDept] = useState('Customer Success');
  const [inviteRole, setInviteRole] = useState('Support Engineer');
  const [inviteOffice, setInviteOffice] = useState('T. Nagar HQ');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [lastIssuedInviteUrl, setLastIssuedInviteUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit Staff Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState(null);

  const isAdmin = currentUserRole === 'admin';

  // Handle Send Invitation (Strictly Admin Only)
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setInviteError('');
    setLastIssuedInviteUrl('');
    setCopiedLink(false);
    clearFeedback();

    if (!isAdmin) {
      setInviteError('Access Denied: Only System Administrators can issue staff invitations.');
      return;
    }

    if (!inviteName.trim()) {
      setInviteError('Please provide the full name for the staff member.');
      return;
    }

    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      setInviteError('Please enter a valid work email address.');
      return;
    }

    setInviteLoading(true);
    try {
      const result = await inviteStaff({
        name: inviteName.trim(),
        email: inviteEmail.trim().toLowerCase(),
        department: inviteDept,
        role: inviteRole.trim(),
        office: inviteOffice,
      });

      if (result?.inviteUrl) {
        setLastIssuedInviteUrl(result.inviteUrl);
      }

      setInviteName('');
      setInviteEmail('');
      setInviteRole('Support Engineer');
    } catch (err) {
      setInviteError(err.message || 'Failed to issue staff invitation.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOpenEdit = (staff) => {
    if (!isAdmin) {
      alert('Only System Administrators can modify staff records.');
      return;
    }
    setSelectedStaffForEdit(staff);
    setIsEditModalOpen(true);
  };

  const handleUpdateStaff = async (staffId, updatedData) => {
    await updateStaffProfile(staffId, updatedData);
  };

  const handleToggle = async (staff) => {
    if (!isAdmin) {
      alert('Only System Administrators can modify staff status.');
      return;
    }
    await toggleStaffStatus(staff);
  };

  const hasActiveFilters =
    searchQuery ||
    departmentFilter !== 'all' ||
    officeFilter !== 'all' ||
    statusFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('all');
    setOfficeFilter('all');
    setStatusFilter('all');
  };

  // Invitation counts for tabs
  const pendingInvitesCount = invitationsList.filter(
    (i) => i.status === 'pending' && new Date(i.expiresAt) >= new Date()
  ).length;
  const acceptedInvitesCount = invitationsList.filter((i) => i.status === 'accepted').length;
  const expiredInvitesCount = invitationsList.filter(
    (i) => i.status === 'expired' || new Date(i.expiresAt) < new Date()
  ).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-200/80 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-md flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              Administrative Governance & RBAC
            </span>

            {isDemoMode ? (
              <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 px-2 py-0.5 rounded-md">
                Demo Dataset (32 Regional Staff Records)
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-600" />
                Live Database Mode
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white font-serif">
            Staff & Regional Team Management
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Administer internal personnel, department rosters, office branches, and secure tokenized staff onboarding.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isAdmin ? 'primary' : 'secondary'} size="md">
            {isAdmin ? 'Admin Authorization Active' : 'Read-Only Mode (Staff Operator)'}
          </Badge>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {(successMsg || error || inviteError) && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2.5 ${
            error || inviteError
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {error || inviteError ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            )}
            <span>{inviteError || error || successMsg}</span>
          </div>
          <button
            onClick={() => {
              clearFeedback();
              setInviteError('');
            }}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 font-bold px-2 py-0.5"
          >
            &times;
          </button>
        </div>
      )}

      {/* Newly Issued Invitation Link Notification Banner */}
      {lastIssuedInviteUrl && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Staff Invitation Link Issued & Ready to Test
            </span>
            <span className="text-[11px] text-stone-400">Valid for 7 Days</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              readOnly
              value={lastIssuedInviteUrl}
              className="flex-1 px-3 py-1.5 bg-white dark:bg-stone-900 border border-amber-200 dark:border-amber-900 rounded-lg text-xs font-mono text-stone-800 dark:text-stone-200 select-all"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Copy}
              onClick={() => handleCopyLink(lastIssuedInviteUrl)}
              className="shrink-0"
            >
              {copiedLink ? 'Copied!' : 'Copy Link'}
            </Button>
            <Link
              to={lastIssuedInviteUrl.replace(window.location.origin, '')}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 transition-colors shrink-0"
            >
              Open Invite Page <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Admin-Only Staff Invitation Console */}
      <Card className="border-amber-200/70 dark:border-amber-900/40 bg-gradient-to-r from-amber-50/30 via-white to-stone-50/50 dark:from-stone-900 dark:via-stone-900 dark:to-amber-950/20">
        <CardHeader
          title="Invite Operational Staff Member"
          subtitle="Staff cannot register via public sign up. Only verified System Administrators can issue invitation tokens."
        />
        <CardContent>
          {!isAdmin ? (
            <div className="p-4 bg-stone-100 dark:bg-stone-800/60 rounded-xl text-xs text-stone-500 flex items-center gap-2">
              <Lock className="w-4 h-4 text-stone-400" />
              <span>You are viewing in staff operator mode. Only Administrators have permission to issue staff invitations.</span>
            </div>
          ) : (
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {/* Staff Full Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Staff Member Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Anandhi Soundararajan"
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Staff Work Email */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Staff Work Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@brightloop.in"
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Department
                  </label>
                  <select
                    value={inviteDept}
                    onChange={(e) => setInviteDept(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Customer Success">Customer Success</option>
                    <option value="Platform Engineering">Platform Engineering</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                    <option value="Sales & Onboarding">Sales & Onboarding</option>
                    <option value="Legal & Compliance">Legal & Compliance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                {/* Functional Role */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Functional Role
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    placeholder="e.g. Solutions Architect"
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Regional Office */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Regional Desk
                  </label>
                  <select
                    value={inviteOffice}
                    onChange={(e) => setInviteOffice(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="T. Nagar HQ">T. Nagar HQ (Chennai)</option>
                    <option value="Coimbatore Tidel">Coimbatore Tidel</option>
                    <option value="Madurai Tech Hub">Madurai Tech Hub</option>
                    <option value="Trichy Office">Trichy Office</option>
                    <option value="Salem Branch">Salem Branch</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={inviteLoading}
                  icon={Send}
                  className="shrink-0"
                >
                  {inviteLoading ? 'Issuing Token...' : 'Send Staff Invitation'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Search and Filters Toolbar */}
      <Card>
        <div className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff by name, email, department, role, or office..."
                className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Departments</option>
              {availableDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Office Filter */}
            <select
              value={officeFilter}
              onChange={(e) => setOfficeFilter(e.target.value)}
              className="px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Regional Desks</option>
              {availableOffices.map((off) => (
                <option key={off} value={off}>
                  {off}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                onClick={resetFilters}
                className="text-stone-500 hover:text-stone-900 dark:hover:text-white"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Two Column Layout: Staff Roster & Issued Invitations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Authorized Active Staff Roster Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Authorized Personnel Roster"
              subtitle={`Showing ${paginatedStaff.length} of ${totalItems} staff members (Page ${currentPage} of ${totalPages})`}
            />
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-900/60 text-stone-500 dark:text-stone-400 font-semibold border-b border-stone-200 dark:border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Department & Role</th>
                      <th className="py-3 px-4">Regional Desk</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-stone-400">
                          Loading personnel roster...
                        </td>
                      </tr>
                    ) : paginatedStaff.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-stone-400">
                          No staff members found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedStaff.map((staff) => (
                        <tr
                          key={staff.id}
                          className="hover:bg-stone-50/70 dark:hover:bg-stone-900/40 transition-colors"
                        >
                          {/* Name & Email */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs font-serif shrink-0 border border-amber-500/20">
                                {staff.name?.charAt(0) || 'S'}
                              </div>
                              <div>
                                <p className="font-semibold text-stone-900 dark:text-white">
                                  {staff.name}
                                </p>
                                <p className="text-[11px] font-mono text-stone-400">
                                  {staff.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Department & Functional Role */}
                          <td className="py-3 px-4">
                            <p className="font-medium text-stone-900 dark:text-white">
                              {staff.department || 'Operations'}
                            </p>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400">
                              {staff.role || 'Staff Operator'}
                            </p>
                          </td>

                          {/* Office */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-[11px] text-stone-700 dark:text-stone-300 font-medium">
                              <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                              {staff.office || 'T. Nagar HQ'}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <StatusPill status={staff.accountStatus || 'active'} />
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {isAdmin && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(staff)}
                                    title="Edit Department / Assignment"
                                    className="p-1.5 rounded-lg text-stone-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleToggle(staff)}
                                    title={staff.accountStatus === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      staff.accountStatus === 'active'
                                        ? 'text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                        : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                    }`}
                                  >
                                    <Ban className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
                  <p>
                    Showing {(currentPage - 1) * pageSize + 1} to{' '}
                    {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
                  </p>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="xs"
                      icon={ChevronLeft}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    >
                      Prev
                    </Button>
                    <span className="px-2 text-stone-700 dark:text-stone-300 font-medium">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="xs"
                      icon={ChevronRight}
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Pending / Accepted / Expired Invitations */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Staff Onboarding Pipeline"
              subtitle="Review issued invitation tokens and onboarding statuses"
            />
            {/* Status Filter Tabs */}
            <div className="px-4 pt-1 pb-3 border-b border-stone-200 dark:border-stone-800 flex gap-1.5 text-xs overflow-x-auto">
              <button
                type="button"
                onClick={() => setInvitationStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  invitationStatusFilter === 'all'
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                All ({invitationsList.length})
              </button>
              <button
                type="button"
                onClick={() => setInvitationStatusFilter('pending')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  invitationStatusFilter === 'pending'
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                Pending ({pendingInvitesCount})
              </button>
              <button
                type="button"
                onClick={() => setInvitationStatusFilter('accepted')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  invitationStatusFilter === 'accepted'
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                Accepted ({acceptedInvitesCount})
              </button>
              <button
                type="button"
                onClick={() => setInvitationStatusFilter('expired')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  invitationStatusFilter === 'expired'
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                Expired ({expiredInvitesCount})
              </button>
            </div>

            <CardContent className="p-0">
              <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
                {filteredInvitations.length === 0 ? (
                  <p className="p-4 text-center text-stone-400">
                    No invitations found with status '{invitationStatusFilter}'.
                  </p>
                ) : (
                  filteredInvitations.map((inv) => {
                    const isExpired =
                      inv.status === 'expired' || new Date(inv.expiresAt) < new Date();
                    const inviteUrl = `${window.location.origin}/accept-invitation?token=${inv.token}&email=${encodeURIComponent(inv.email)}`;

                    return (
                      <div key={inv.id} className="p-3.5 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-stone-900 dark:text-white">
                              {inv.name}
                            </p>
                            <p className="font-mono text-stone-500 dark:text-stone-400 text-[11px]">
                              {inv.email}
                            </p>
                          </div>
                          <StatusPill status={isExpired && inv.status !== 'accepted' ? 'expired' : inv.status} />
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-400">
                          <span className="font-medium text-stone-700 dark:text-stone-300">
                            {inv.department}
                          </span>
                          <span>&bull;</span>
                          <span>{inv.role}</span>
                          <span>&bull;</span>
                          <span>{inv.office}</span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-800/60">
                          <span>
                            {inv.status === 'accepted'
                              ? 'Account activated'
                              : isExpired
                              ? `Expired on ${formatDate(inv.expiresAt)}`
                              : `Expires ${formatDate(inv.expiresAt)}`}
                          </span>

                          <div className="flex items-center gap-2">
                            {inv.status === 'pending' && !isExpired && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(inviteUrl)}
                                  className="text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                                >
                                  <Copy className="w-3 h-3" />
                                  Copy Link
                                </button>
                                <Link
                                  to={`/accept-invitation?token=${inv.token}&email=${encodeURIComponent(inv.email)}`}
                                  className="text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Test
                                </Link>
                              </>
                            )}

                            {(isExpired || inv.status === 'expired') && isAdmin && (
                              <button
                                type="button"
                                onClick={() => resendInvitation(inv.id)}
                                className="text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                              >
                                <RefreshCw className="w-3 h-3" />
                                Reissue
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security & RBAC Guidelines */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-200">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>RBAC Staff Creation Security</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-stone-600 dark:text-stone-300 text-[11px]">
              <li>Only Admin accounts can generate staff invitation tokens.</li>
              <li>Public customer signup (`/register`) cannot create staff accounts.</li>
              <li>Database trigger <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">protect_profile_roles()</code> prevents non-admin role escalation.</li>
              <li>Staff members must set their password via the tokenized invitation link to activate their account.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Staff Edit Modal */}
      <StaffFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateStaff}
        staff={selectedStaffForEdit}
      />
    </div>
  );
}
