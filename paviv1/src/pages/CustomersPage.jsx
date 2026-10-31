import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { StatusPill } from '../components/common/StatusPill';
import { useCustomers } from '../hooks/useCustomers';
import { useDemoMode } from '../context/DemoModeContext';
import { useAuth } from '../context/AuthContext';
import { CustomerFormModal } from '../components/customers/CustomerFormModal';
import { CustomerDetailsModal } from '../components/customers/CustomerDetailsModal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  Eye,
  Edit2,
  Power,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Database,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { formatDate } from '../lib/utils';

export function CustomersPage() {
  const { role } = useAuth();
  const { isDemoMode, toggleDemoMode, currency } = useDemoMode();

  const {
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
    clearFeedback,
  } = useCustomers();

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCustomerForEdit, setSelectedCustomerForEdit] = useState(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCustomerForDetails, setSelectedCustomerForDetails] = useState(null);
  const [selectedRelations, setSelectedRelations] = useState({
    quotations: [],
    subscriptions: [],
    invoices: [],
    payments: [],
  });

  // Open Add modal
  const handleOpenAdd = () => {
    setSelectedCustomerForEdit(null);
    setIsFormModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (customer) => {
    setSelectedCustomerForEdit(customer);
    setIsFormModalOpen(true);
  };

  // Open 360 Details modal
  const handleOpenDetails = (customer) => {
    setSelectedCustomerForDetails(customer);
    const rels = getCustomerRelations(customer.id, customer.email);
    setSelectedRelations(rels);
    setIsDetailsModalOpen(true);
  };

  // Handle Form Submit (Add or Edit)
  const handleFormSubmit = async (formData) => {
    if (selectedCustomerForEdit) {
      await updateCustomer(selectedCustomerForEdit.id, formData);
    } else {
      await addCustomer(formData);
    }
  };

  // Handle Status Toggle
  const handleToggle = async (customer) => {
    await toggleCustomerStatus(customer);
    if (selectedCustomerForDetails && selectedCustomerForDetails.id === customer.id) {
      setSelectedCustomerForDetails({
        ...selectedCustomerForDetails,
        status: selectedCustomerForDetails.status === 'active' ? 'inactive' : 'active',
      });
    }
  };

  // Stats calculation
  const activeCount = customers.filter((c) => c.status === 'active').length;
  const inactiveCount = customers.filter((c) => c.status !== 'active').length;
  const enterpriseCount = customers.filter((c) => c.segment === 'Enterprise').length;

  const hasActiveFilters =
    searchQuery ||
    statusFilter !== 'all' ||
    cityFilter !== 'all' ||
    segmentFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCityFilter('all');
    setSegmentFilter('all');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-200/80 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-md flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              Customer & Enterprise CRM
            </span>

            {isDemoMode ? (
              <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 px-2 py-0.5 rounded-md">
                Demo Dataset (35 Indian Accounts)
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-600" />
                Live Database Mode
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white font-serif">
            Customer Directory & 360° Ledgers
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Manage customer accounts, inspect GSTINs, prevent duplicate emails, and audit connected subscriptions, quotes, and invoices.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            icon={UserPlus}
            onClick={handleOpenAdd}
          >
            Add Customer
          </Button>
        </div>
      </div>

      {/* Feedback Alerts */}
      {(successMsg || error) && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2.5 ${
            error
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {error ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            )}
            <span>{error || successMsg}</span>
          </div>
          <button
            onClick={clearFeedback}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 font-bold px-2 py-0.5"
          >
            &times;
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-stone-50 to-amber-50/20 dark:from-stone-900 dark:to-amber-950/20 border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Total Accounts</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-serif text-stone-900 dark:text-white mt-2">
            {customers.length}
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">Tamil Nadu & Pan-India</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-stone-50 to-emerald-50/20 dark:from-stone-900 dark:to-emerald-950/20 border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Active Accounts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-serif text-emerald-700 dark:text-emerald-300 mt-2">
            {activeCount}
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">In good standing</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-stone-50 to-rose-50/20 dark:from-stone-900 dark:to-rose-950/20 border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Inactive / Suspended</span>
            <Power className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold font-serif text-stone-900 dark:text-white mt-2">
            {inactiveCount}
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">Churned or paused</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-stone-50 to-blue-50/20 dark:from-stone-900 dark:to-blue-950/20 border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Enterprise Clients</span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold font-serif text-blue-700 dark:text-blue-300 mt-2">
            {enterpriseCount}
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">High-tier SLA & volume</p>
        </Card>
      </div>

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
                placeholder="Search by customer name, company, email, phone, GSTIN, or city..."
                className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
                <option value="suspended">Suspended Only</option>
              </select>

              {/* City Filter */}
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Cities</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              {/* Segment Filter */}
              <select
                value={segmentFilter}
                onChange={(e) => setSegmentFilter(e.target.value)}
                className="px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Segments</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Mid-Market">Mid-Market</option>
                <option value="SME">SME</option>
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
        </div>
      </Card>

      {/* Customers Table Card */}
      <Card>
        <CardHeader
          title="Customer Accounts Roster"
          subtitle={`Showing ${paginatedCustomers.length} of ${totalItems} filtered records (Page ${currentPage} of ${totalPages})`}
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-900/60 text-stone-500 dark:text-stone-400 font-semibold border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-3 px-4">Customer & Company</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">GSTIN</th>
                  <th className="py-3 px-4">Segment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400">
                      Loading customer directory...
                    </td>
                  </tr>
                ) : paginatedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400">
                      No customer accounts match your search or filter parameters.
                    </td>
                  </tr>
                ) : (
                  paginatedCustomers.map((cust) => (
                    <tr
                      key={cust.id}
                      className="hover:bg-stone-50/70 dark:hover:bg-stone-900/40 transition-colors"
                    >
                      {/* Name & Company */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs font-serif shrink-0 border border-amber-500/20">
                            {cust.name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <p className="font-semibold text-stone-900 dark:text-white">
                              {cust.name}
                            </p>
                            <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3 text-stone-400" />
                              {cust.company || 'Enterprise Client'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        <p className="font-mono text-stone-800 dark:text-stone-200">
                          {cust.email}
                        </p>
                        <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                          {cust.phone || '—'}
                        </p>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4">
                        <p className="text-stone-800 dark:text-stone-200 font-medium">
                          {cust.city || 'Tamil Nadu'}
                        </p>
                        <p className="text-[11px] text-stone-400">
                          {cust.state || 'India'}
                        </p>
                      </td>

                      {/* GSTIN */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded">
                          {cust.gstin || 'Unregistered'}
                        </span>
                      </td>

                      {/* Segment */}
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            cust.segment === 'Enterprise'
                              ? 'primary'
                              : cust.segment === 'Mid-Market'
                              ? 'default'
                              : 'secondary'
                          }
                          size="sm"
                        >
                          {cust.segment || 'Mid-Market'}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <StatusPill status={cust.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 360 Profile Inspector */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(cust)}
                            title="Inspect 360° Profile & Ledgers"
                            className="p-1.5 rounded-lg text-stone-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Details */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cust)}
                            title="Edit Customer"
                            className="p-1.5 rounded-lg text-stone-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Quick Toggle Status */}
                          <button
                            type="button"
                            onClick={() => handleToggle(cust)}
                            title={cust.status === 'active' ? 'Deactivate Customer' : 'Activate Customer'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              cust.status === 'active'
                                ? 'text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
              <p>
                Showing <span className="font-medium text-stone-900 dark:text-white">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-medium text-stone-900 dark:text-white">
                  {Math.min(currentPage * pageSize, totalItems)}
                </span>{' '}
                of <span className="font-medium text-stone-900 dark:text-white">{totalItems}</span> customers
              </p>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="xs"
                  icon={ChevronLeft}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                >
                  Previous
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg font-medium text-xs transition-colors ${
                      currentPage === page
                        ? 'bg-amber-600 text-white'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}

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

      {/* Modals */}
      <CustomerFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        customer={selectedCustomerForEdit}
        existingCustomers={customers}
      />

      <CustomerDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        customer={selectedCustomerForDetails}
        relations={selectedRelations}
        onEdit={handleOpenEdit}
        onToggleStatus={handleToggle}
        currency={currency}
      />
    </div>
  );
}
