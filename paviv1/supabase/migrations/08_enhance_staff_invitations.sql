-- ==============================================================================
-- 08_ENHANCE_STAFF_INVITATIONS.SQL
-- Brightloop Software – Subscription Management System
-- Module 5 / Module 6: Staff Invitations Enhancements
-- ==============================================================================

-- 1. Add fields for Staff Name, Department, Functional Role, Office and Token
ALTER TABLE public.staff_invitations ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.staff_invitations ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'Operations';
ALTER TABLE public.staff_invitations ADD COLUMN IF NOT EXISTS role_title TEXT DEFAULT 'Staff Operator';
ALTER TABLE public.staff_invitations ADD COLUMN IF NOT EXISTS office TEXT DEFAULT 'T. Nagar HQ';
ALTER TABLE public.staff_invitations ADD COLUMN IF NOT EXISTS token TEXT;

CREATE INDEX IF NOT EXISTS idx_staff_invitations_token ON public.staff_invitations(token);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_dept ON public.staff_invitations(department);

-- 2. Enhanced procedure to invite staff member with complete metadata
CREATE OR REPLACE FUNCTION public.invite_staff_member(
  target_email TEXT,
  target_name TEXT DEFAULT NULL,
  target_dept TEXT DEFAULT 'Operations',
  target_role TEXT DEFAULT 'Staff Operator',
  target_office TEXT DEFAULT 'T. Nagar HQ'
)
RETURNS JSONB AS $$
DECLARE
  current_user_id UUID;
  new_invitation_id UUID;
  secure_token TEXT;
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

  -- Generate secure token
  secure_token := 'inv_' || encode(gen_random_bytes(16), 'hex');

  -- Create fresh invitation
  INSERT INTO public.staff_invitations (
    email,
    name,
    department,
    role_title,
    office,
    token,
    invited_by,
    status,
    expires_at
  )
  VALUES (
    target_email,
    COALESCE(target_name, split_part(target_email, '@', 1)),
    target_dept,
    target_role,
    target_office,
    secure_token,
    current_user_id,
    'pending',
    now() + INTERVAL '7 days'
  )
  RETURNING id INTO new_invitation_id;

  RETURN jsonb_build_object(
    'success', true,
    'invitation_id', new_invitation_id,
    'token', secure_token,
    'email', target_email,
    'message', 'Staff invitation issued successfully.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
