import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, profile, role, loading, isConfigured } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
            Verifying security session...
          </p>
        </div>
      </div>
    );
  }

  // If Supabase is not yet configured, allow navigation with preview context
  if (!isConfigured) {
    return children;
  }

  // Not logged in -> redirect to login with return url
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      // Redirect to the user's appropriate portal based on their actual role
      if (role === 'customer') {
        return <Navigate to="/portal" replace />;
      } else if (role === 'staff') {
        return <Navigate to="/staff" replace />;
      } else if (role === 'admin') {
        return <Navigate to="/" replace />;
      } else {
        return <Navigate to="/login" state={{ from: location }} replace />;
      }
    }
  }

  return children;
}
