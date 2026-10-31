-- ==============================================================================
-- 04_FIX_ADMIN_BOOTSTRAP.SQL (FINAL REVIEWED & TRANSACTION-WRAPPED)
-- Brightloop Software – Subscription Management System
-- Corrective Migration: Resolve Trigger Conflict During Initial Admin Bootstrap
-- ==============================================================================
-- VERIFICATION SUMMARY:
-- 1. Explicit ownership set to `postgres` for both functions.
-- 2. `protect_profile_roles()` retains execute privileges for trigger execution.
-- 3. `bootstrap_initial_admin()` strictly revokes execute from PUBLIC, anon,
--    authenticated, and service_role; granted ONLY to `postgres`.
-- 4. Explicit `SET search_path = public, pg_temp` prevents search path hijacking.
-- 5. Safe against existing profile with role='customer' (graceful role elevation).
-- 6. No existing triggers or RLS policies are dropped or compromised.
-- 7. Entire migration is wrapped in a transactional block (BEGIN ... COMMIT).
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- Step 1: Update protect_profile_roles trigger function
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (OLD.role <> NEW.role OR OLD.account_status <> NEW.account_status) THEN
    -- Narrowly-scoped authorization: Allow ONLY during verified bootstrap transaction
    -- Requires valid token, strict designated email match, and non-client execution context
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

ALTER FUNCTION public.protect_profile_roles() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.protect_profile_roles() TO postgres, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- Step 2: Hardened bootstrap_initial_admin procedure
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bootstrap_initial_admin(admin_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  target_user_id UUID;
  existing_admin_count INT;
  is_target_suspended BOOLEAN := FALSE;
  result_profile RECORD;
BEGIN
  -- Defense-in-Depth: Reject execution from client-authenticated browser sessions
  IF auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'Access Denied: bootstrap_initial_admin cannot be executed from authenticated web sessions. It is restricted strictly to the Supabase SQL Editor.';
  END IF;

  admin_email := LOWER(TRIM(admin_email));

  -- Security Check 1: Strict email match for the designated initial enterprise admin
  IF admin_email <> 'admin.brightloopodoohack@gmail.com' THEN
    RAISE EXCEPTION 'Access Denied: Only the designated admin email can be bootstrapped.';
  END IF;

  -- Security Check 2: Prevent bootstrap takeover if another active admin already exists
  SELECT COUNT(*) INTO existing_admin_count
  FROM public.profiles
  WHERE role = 'admin' AND account_status = 'active' AND LOWER(email) <> admin_email;

  IF existing_admin_count > 0 THEN
    RAISE EXCEPTION 'Bootstrap Locked: An active enterprise admin already exists. Use Admin Staff Management to assign roles.';
  END IF;

  -- Security Check 3: Verify target user exists in auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE LOWER(email) = admin_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Target user not found in auth.users. Please create the user in Supabase Authentication first.';
  END IF;

  -- Security Check 4: Check if account is suspended (prevent illicit reactivation)
  SELECT (account_status = 'suspended') INTO is_target_suspended
  FROM public.profiles
  WHERE id = target_user_id;

  IF is_target_suspended THEN
    RAISE EXCEPTION 'Security Lock: This administrator account is suspended. Reactivation requires formal administrative unsuspension.';
  END IF;

  -- Idempotency Check: If already active admin, return success without unnecessary update
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = target_user_id AND role = 'admin' AND account_status = 'active'
  ) THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Initial enterprise admin is already bootstrapped and active.',
      'email', admin_email,
      'role', 'admin',
      'status', 'active',
      'user_id', target_user_id
    );
  END IF;

  -- Authorize this transaction for role elevation in protect_profile_roles()
  PERFORM set_config('app.bootstrap_auth', 'brightloop_secure_bootstrap_active', true);

  -- Upsert Admin Profile with confirmed active status
  INSERT INTO public.profiles (id, full_name, email, role, account_status, updated_at)
  VALUES (
    target_user_id,
    'Brightloop Admin',
    admin_email,
    'admin',
    'active',
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    role = 'admin',
    account_status = 'active',
    updated_at = now()
  RETURNING * INTO result_profile;

  -- Clean up session authorization setting immediately
  PERFORM set_config('app.bootstrap_auth', '', true);

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Initial enterprise admin bootstrapped successfully.',
    'email', result_profile.email,
    'role', result_profile.role,
    'status', result_profile.account_status,
    'user_id', result_profile.id
  );
END;
$$;

ALTER FUNCTION public.bootstrap_initial_admin(TEXT) OWNER TO postgres;

-- ------------------------------------------------------------------------------
-- Step 3: Strictly Restrict Execution Privileges (POSTGRES ONLY)
-- ------------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.bootstrap_initial_admin(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.bootstrap_initial_admin(TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.bootstrap_initial_admin(TEXT) FROM authenticated;
REVOKE ALL ON FUNCTION public.bootstrap_initial_admin(TEXT) FROM service_role;

GRANT EXECUTE ON FUNCTION public.bootstrap_initial_admin(TEXT) TO postgres;

-- ------------------------------------------------------------------------------
-- Step 4: Execute Bootstrap for the designated enterprise admin
-- ------------------------------------------------------------------------------
SELECT public.bootstrap_initial_admin('admin.brightloopodoohack@gmail.com');

COMMIT;

-- ------------------------------------------------------------------------------
-- Step 5: Verify Admin Profile in database
-- ------------------------------------------------------------------------------
SELECT id, full_name, email, role, account_status, updated_at
FROM public.profiles
WHERE LOWER(email) = 'admin.brightloopodoohack@gmail.com';
