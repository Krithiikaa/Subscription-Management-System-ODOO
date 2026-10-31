-- ==============================================================================
-- 01_CREATE_PROFILES_AND_RBAC.SQL
-- Brightloop Software – Subscription Management System
-- Module 2: Profiles, Roles, Trigger & Row Level Security
-- ==============================================================================

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'staff', 'customer')),
  account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'invited', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for high-performance role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. Non-recursive Security Definer Helpers for RLS
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin' AND account_status = 'active'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_staff_or_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role IN ('admin', 'staff') AND account_status = 'active'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. Automatic Updated At Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Prevent Unauthorized Self-Role Modification Trigger
CREATE OR REPLACE FUNCTION public.protect_profile_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (OLD.role <> NEW.role OR OLD.account_status <> NEW.account_status) THEN
    -- Narrowly-scoped authorization: Allow ONLY during verified bootstrap transaction
    IF current_setting('app.bootstrap_auth', true) = 'brightloop_secure_bootstrap_active'
       AND LOWER(NEW.email) = 'admin.brightloopodoohack@gmail.com'
       AND LOWER(OLD.email) = 'admin.brightloopodoohack@gmail.com'
       AND auth.uid() IS NULL THEN
      RETURN NEW;
    END IF;

    -- Standard protection: Only active verified admins can modify roles or status
    IF NOT public.is_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Access Denied: Users cannot alter their own role or account status.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_profile_updates ON public.profiles;
CREATE TRIGGER check_profile_updates
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_roles();

-- 5. Automatic Profile Creation Trigger on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role TEXT := 'customer';
  assigned_status TEXT := 'active';
  user_full_name TEXT;
  is_invited_staff BOOLEAN := FALSE;
BEGIN
  -- Check if staff_invitations table exists and has a pending invite for this email
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'staff_invitations') THEN
    SELECT EXISTS (
      SELECT 1 FROM public.staff_invitations
      WHERE LOWER(email) = LOWER(NEW.email)
        AND status = 'pending'
        AND expires_at > now()
    ) INTO is_invited_staff;

    IF is_invited_staff THEN
      assigned_role := 'staff';
      assigned_status := 'active';
      UPDATE public.staff_invitations
      SET status = 'accepted'
      WHERE LOWER(email) = LOWER(NEW.email) AND status = 'pending';
    END IF;
  END IF;

  -- Default public registration is ALWAYS customer
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (id, full_name, email, role, account_status)
  VALUES (NEW.id, user_full_name, NEW.email, assigned_role, assigned_status)
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Enable Row Level Security (RLS) on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Admin can view all profiles
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
CREATE POLICY "profiles_select_admin"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Policy: Staff can view profiles for day-to-day operations
DROP POLICY IF EXISTS "profiles_select_staff" ON public.profiles;
CREATE POLICY "profiles_select_staff"
  ON public.profiles
  FOR SELECT
  USING (public.is_staff_or_admin(auth.uid()));

-- Policy: Users can update their own personal info (name only, role is protected by trigger)
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Admin can update any profile (e.g. suspend or manage staff)
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin"
  ON public.profiles
  FOR UPDATE
  USING (public.is_admin(auth.uid()));
