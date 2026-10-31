-- ==============================================================================
-- 02_CREATE_STAFF_INVITATIONS.SQL
-- Brightloop Software – Subscription Management System
-- Module 2: Staff Invitations & Administrative Invitation Workflows
-- ==============================================================================

-- 1. Create Staff Invitations Table
CREATE TABLE IF NOT EXISTS public.staff_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + INTERVAL '7 days')
);

-- Index for lookup & performance
CREATE INDEX IF NOT EXISTS idx_staff_invitations_email ON public.staff_invitations(email);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_status ON public.staff_invitations(status);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.staff_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Only verified Admins can read staff invitations
DROP POLICY IF EXISTS "staff_invitations_select_admin" ON public.staff_invitations;
CREATE POLICY "staff_invitations_select_admin"
  ON public.staff_invitations
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Policy: Only verified Admins can create invitations
DROP POLICY IF EXISTS "staff_invitations_insert_admin" ON public.staff_invitations;
CREATE POLICY "staff_invitations_insert_admin"
  ON public.staff_invitations
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- Policy: Only verified Admins can update invitations (e.g. cancel or resend)
DROP POLICY IF EXISTS "staff_invitations_update_admin" ON public.staff_invitations;
CREATE POLICY "staff_invitations_update_admin"
  ON public.staff_invitations
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Policy: Only verified Admins can delete invitations
DROP POLICY IF EXISTS "staff_invitations_delete_admin" ON public.staff_invitations;
CREATE POLICY "staff_invitations_delete_admin"
  ON public.staff_invitations
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- 3. Stored Procedure for Admin to Safely Invite Staff Member
CREATE OR REPLACE FUNCTION public.invite_staff_member(target_email TEXT)
RETURNS JSONB AS $$
DECLARE
  current_user_id UUID;
  new_invitation_id UUID;
BEGIN
  current_user_id := auth.uid();

  -- Verify caller is an active Admin
  IF NOT public.is_admin(current_user_id) THEN
    RAISE EXCEPTION 'Access Denied: Only Admins can invite staff members.';
  END IF;

  target_email := LOWER(TRIM(target_email));

  -- Check if user already exists as an active user
  IF EXISTS (SELECT 1 FROM public.profiles WHERE LOWER(email) = target_email AND account_status = 'active') THEN
    RAISE EXCEPTION 'User with this email already has an active account.';
  END IF;

  -- Invalidate any previous pending invitations for this email
  UPDATE public.staff_invitations
  SET status = 'cancelled'
  WHERE LOWER(email) = target_email AND status = 'pending';

  -- Create fresh invitation
  INSERT INTO public.staff_invitations (email, invited_by, status, expires_at)
  VALUES (target_email, current_user_id, 'pending', now() + INTERVAL '7 days')
  RETURNING id INTO new_invitation_id;

  RETURN jsonb_build_object(
    'success', true,
    'invitation_id', new_invitation_id,
    'email', target_email,
    'message', 'Staff invitation issued successfully.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
