import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  User,
  Mail,
  Building2,
  MapPin,
  Phone,
  Briefcase,
  AlertCircle,
  Shield,
} from 'lucide-react';

const DEPARTMENTS = [
  'Platform Engineering',
  'Finance & Accounts',
  'Customer Success',
  'Sales & Onboarding',
  'Legal & Compliance',
  'Operations',
];

const OFFICES = [
  'T. Nagar HQ',
  'Coimbatore Tidel',
  'Madurai Tech Hub',
  'Trichy Office',
  'Salem Branch',
];

export function StaffFormModal({
  isOpen,
  onClose,
  onSubmit,
  staff = null,
}) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: 'Customer Success',
    office: 'T. Nagar HQ',
    phone: '',
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || '',
        role: staff.role || 'Staff Operator',
        department: staff.department || 'Customer Success',
        office: staff.office || 'T. Nagar HQ',
        phone: staff.phone || '',
      });
    }
    setFormError('');
  }, [staff, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Staff name is required.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(staff.id, formData);
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to update staff member.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!staff) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Staff Department & Assignment"
      subtitle={`Configure operational department, regional branch, and desk title for ${staff.name}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{formError}</span>
          </div>
        )}

        {/* Staff Email (Read-Only to preserve Supabase Auth integrity) */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Staff Work Email (System Identity)
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              readOnly
              disabled
              value={staff.email}
              className="w-full pl-9 pr-3 py-2 bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-500 font-mono cursor-not-allowed"
            />
          </div>
          <p className="text-[10px] text-stone-400 mt-1 flex items-center gap-1">
            <Shield className="w-3 h-3 text-amber-600" />
            Auth identity email is locked to prevent unauthorized privilege escalation.
          </p>
        </div>

        {/* Staff Full Name */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Role Title */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Functional Role / Title
          </label>
          <div className="relative">
            <Briefcase className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g. Solutions Architect, Billing Specialist"
              className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Department and Office */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Department
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Regional Branch / Office
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <select
                value={formData.office}
                onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {OFFICES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Work Extension / Phone (+91)
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98400 22001"
              className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Staff Profile'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
