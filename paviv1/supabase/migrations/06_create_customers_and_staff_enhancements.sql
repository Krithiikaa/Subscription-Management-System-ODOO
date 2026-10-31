-- ==============================================================================
-- 06_CREATE_CUSTOMERS_AND_STAFF_ENHANCEMENTS.SQL
-- Brightloop Software – Subscription Management System
-- Module 5: Customer & Staff Management
-- ==============================================================================

-- 1. Create Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  company TEXT,
  gstin TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_city ON public.customers(city);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);

-- 2. Enhance Profiles Table for Staff Department & Contact Management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'Operations';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS office TEXT DEFAULT 'T. Nagar HQ';

-- 3. Automatic Updated At Trigger on Customers
DROP TRIGGER IF EXISTS set_customers_updated_at ON public.customers;
CREATE TRIGGER set_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Row Level Security on Customers Table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Customers can view only their own record; staff and admin can view all
DROP POLICY IF EXISTS "Allow staff and admin to view all customers" ON public.customers;
CREATE POLICY "Allow staff and admin to view all customers"
  ON public.customers FOR SELECT
  USING (
    public.is_staff_or_admin(auth.uid()) OR user_id = auth.uid()
  );

-- Only staff or admin can create customer records
DROP POLICY IF EXISTS "Allow staff and admin to insert customers" ON public.customers;
CREATE POLICY "Allow staff and admin to insert customers"
  ON public.customers FOR INSERT
  WITH CHECK (public.is_staff_or_admin(auth.uid()));

-- Staff/admin can update all; customers can update their own profile
DROP POLICY IF EXISTS "Allow customer update" ON public.customers;
CREATE POLICY "Allow customer update"
  ON public.customers FOR UPDATE
  USING (
    public.is_staff_or_admin(auth.uid()) OR user_id = auth.uid()
  )
  WITH CHECK (
    public.is_staff_or_admin(auth.uid()) OR user_id = auth.uid()
  );

-- Only admin can delete customer records
DROP POLICY IF EXISTS "Allow admin delete on customers" ON public.customers;
CREATE POLICY "Allow admin delete on customers"
  ON public.customers FOR DELETE
  USING (public.is_admin(auth.uid()));
