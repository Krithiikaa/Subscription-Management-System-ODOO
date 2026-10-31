import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
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
import { SettingsPage } from '../pages/SettingsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/quotations" element={<QuotationsPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/discounts" element={<DiscountsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/portal" element={<CustomerPortalPage />} />
        <Route path="/customer-portal" element={<CustomerPortalPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
