import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

// Application Pages
import { DashboardPage } from '../pages/DashboardPage';
import { ProductsPage } from '../pages/ProductsPage';
import { PlansPage } from '../pages/PlansPage';
import { CustomersPage } from '../pages/CustomersPage';
import { SubscriptionsPage } from '../pages/SubscriptionsPage';
import { QuotationsPage } from '../pages/QuotationsPage';
import { InvoicesPage } from '../pages/InvoicesPage';
import { DiscountsPage } from '../pages/DiscountsPage';
import { PaymentsPage } from '../pages/PaymentsPage';
import { CustomerPortalPage } from '../pages/CustomerPortalPage';
import { StaffDashboardPage } from '../pages/StaffDashboardPage';
import { StaffManagementPage } from '../pages/StaffManagementPage';
import { UserProfilePage } from '../pages/UserProfilePage';
import { SettingsPage } from '../pages/SettingsPage';

// Authentication Pages
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Main Protected Application Shell */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Core Dashboards */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <StaffDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Business Modules */}
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/quotations" element={<QuotationsPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/discounts" element={<DiscountsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />

        {/* Customer Self-Service Portal */}
        <Route
          path="/portal"
          element={
            <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
              <CustomerPortalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer-portal"
          element={
            <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
              <CustomerPortalPage />
            </ProtectedRoute>
          }
        />

        {/* Governance & Profile */}
        <Route
          path="/staff-management"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StaffManagementPage />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
