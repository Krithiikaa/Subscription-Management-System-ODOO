import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, getAuthRedirectUrl } from '../lib/supabase';

const AuthContext = createContext({
  user: null,
  profile: null,
  role: null,
  loading: true,
  error: null,
  isConfigured: false,
  login: async () => {},
  signUpCustomer: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch full profile record from public.profiles
  const fetchProfile = useCallback(async (userId) => {
    if (!isSupabaseConfigured || !userId) {
      setProfile(null);
      return null;
    }

    try {
      const { data, error: profileErr } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, account_status, created_at')
        .eq('id', userId)
        .single();

      if (profileErr) {
        console.warn('Profile fetch note:', profileErr.message);
        // Fallback: create or wait for trigger
        return null;
      }

      setProfile(data);
      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  }, []);

  // Initialize session and listen for auth state changes
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      if (!isSupabaseConfigured) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && mounted) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    // Listen to Supabase auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user || null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      } else if (event === 'PASSWORD_RECOVERY') {
        setUser(session?.user || null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  // Robust Password Validation Helper
  const validatePasswordStrength = (password) => {
    if (!password || password.length <= 8) {
      return 'Password must contain more than 8 characters.';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter.';
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=~`]/.test(password)) {
      return 'Password must contain at least one special character.';
    }
    return null;
  };

  // Sign In with database role verification
  const login = async (email, password, expectedRole = null) => {
    setError(null);
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase is not configured yet. Please enter your Project URL and Publishable Key into paviv1/.env'
      );
    }

    const { data, error: signInErr } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signInErr) {
      setError(signInErr.message);
      throw signInErr;
    }

    if (!data.user) {
      throw new Error('Authentication succeeded but user was not returned.');
    }

    // Verify role in public.profiles table
    const profileData = await fetchProfile(data.user.id);

    // Check account status
    if (profileData && profileData.account_status === 'suspended') {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      const suspendedMsg = 'Account suspended. Please contact Brightloop system administration.';
      setError(suspendedMsg);
      throw new Error(suspendedMsg);
    }

    // Strict Role Guard if user selected a specific portal (Admin vs Staff vs Customer)
    if (expectedRole && profileData) {
      if (profileData.role !== expectedRole) {
        // Sign out if role does not match selected portal to prevent portal mixups
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        const roleMismatchMsg = `Access Denied: Your account role is '${profileData.role}', which cannot access the ${expectedRole} portal.`;
        setError(roleMismatchMsg);
        throw new Error(roleMismatchMsg);
      }
    }

    setUser(data.user);
    return { user: data.user, profile: profileData };
  };

  // Public Customer Registration
  const signUpCustomer = async (email, password, fullName) => {
    setError(null);
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase is not configured yet. Please configure your credentials in paviv1/.env'
      );
    }

    // Validate password rules
    const passwordErr = validatePasswordStrength(password);
    if (passwordErr) {
      setError(passwordErr);
      throw new Error(passwordErr);
    }

    // Dynamic email verification redirect URL (uses active window.location.origin or VITE_SITE_URL / VITE_APP_URL)
    const redirectUrl = getAuthRedirectUrl('/login?verified=true');

    const { data, error: signUpErr } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
        emailRedirectTo: redirectUrl,
      },
    });

    if (signUpErr) {
      setError(signUpErr.message);
      throw signUpErr;
    }

    return data;
  };

  // Logout
  const logout = async () => {
    setError(null);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  // Forgot password
  const resetPassword = async (email) => {
    setError(null);
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured yet. Please check paviv1/.env');
    }

    const redirectUrl = getAuthRedirectUrl('/reset-password');

    const { data, error: resetErr } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: redirectUrl,
      }
    );

    if (resetErr) {
      setError(resetErr.message);
      throw resetErr;
    }

    return data;
  };

  // Update password after recovery link click
  const updatePassword = async (newPassword) => {
    setError(null);
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured yet. Please check paviv1/.env');
    }

    const passwordErr = validatePasswordStrength(newPassword);
    if (passwordErr) {
      setError(passwordErr);
      throw new Error(passwordErr);
    }

    const { data, error: updateErr } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateErr) {
      setError(updateErr.message);
      throw updateErr;
    }

    return data;
  };

  const refreshProfile = async () => {
    if (user?.id) {
      return await fetchProfile(user.id);
    }
    return null;
  };

  const value = {
    user,
    profile,
    role: profile?.role || null,
    accountStatus: profile?.account_status || 'active',
    loading,
    error,
    isConfigured: isSupabaseConfigured,
    login,
    signUpCustomer,
    logout,
    resetPassword,
    updatePassword,
    refreshProfile,
    validatePasswordStrength,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
