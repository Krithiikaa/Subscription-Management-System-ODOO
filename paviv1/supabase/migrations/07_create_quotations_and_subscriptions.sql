-- ==============================================================================
-- 07_CREATE_QUOTATIONS_AND_SUBSCRIPTIONS.SQL
-- Brightloop Software – Subscription Management System
-- Module 6: Quotation Management & Subscription Lifecycle
-- ==============================================================================

-- 1. Create Quotations Table
CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  sales_staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sales_staff_name TEXT,
  quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  cgst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0, -- 9% CGST
  sgst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0, -- 9% SGST
  total_tax NUMERIC(12, 2) NOT NULL DEFAULT 0,   -- 18% Total GST
  grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'expired', 'converted')),
  notes TEXT,
  terms_and_conditions TEXT DEFAULT '1. Quotation valid for 30 days from date of issue. 2. 18% GST applicable on all SaaS software licenses. 3. Disputes subject to Chennai jurisdiction.',
  converted_subscription_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_quotations_number ON public.quotations(quotation_number);
CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON public.quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON public.quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_date ON public.quotations(quotation_date);

-- 2. Create Quotation Items Table (Multi-line product breakdown)
CREATE TABLE IF NOT EXISTS public.quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  variant_name TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  line_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation ON public.quotation_items(quotation_id);

-- 3. Create Subscriptions Table (Lifecycle State Machine)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  linked_quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  plan_name TEXT NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'Monthly' CHECK (billing_cycle IN ('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual', 'Biennial')),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  next_billing_date DATE,
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'quotation', 'confirmed', 'active', 'in_trial', 'paused', 'past_due', 'canceled', 'closed'
  )),
  closure_reason TEXT,
  history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_number ON public.subscriptions(subscription_number);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON public.subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON public.subscriptions(next_billing_date);

-- 4. Foreign Key link back from Quotations to Converted Subscription
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_quotations_converted_sub'
  ) THEN
    ALTER TABLE public.quotations
      ADD CONSTRAINT fk_quotations_converted_sub
      FOREIGN KEY (converted_subscription_id)
      REFERENCES public.subscriptions(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 5. Updated At Triggers
DROP TRIGGER IF EXISTS set_quotations_updated_at ON public.quotations;
CREATE TRIGGER set_quotations_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 6. Row Level Security Configuration
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Quotations RLS Policies
DROP POLICY IF EXISTS "Allow staff and admin to manage all quotations" ON public.quotations;
CREATE POLICY "Allow staff and admin to manage all quotations"
  ON public.quotations FOR ALL
  USING (public.is_staff_or_admin(auth.uid()))
  WITH CHECK (public.is_staff_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow customers to view their own quotations" ON public.quotations;
CREATE POLICY "Allow customers to view their own quotations"
  ON public.quotations FOR SELECT
  USING (
    customer_email = auth.jwt()->>'email' OR
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
  );

-- Quotation Items RLS Policies
DROP POLICY IF EXISTS "Allow staff and admin to manage quotation items" ON public.quotation_items;
CREATE POLICY "Allow staff and admin to manage quotation items"
  ON public.quotation_items FOR ALL
  USING (public.is_staff_or_admin(auth.uid()))
  WITH CHECK (public.is_staff_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow customers to view quotation items" ON public.quotation_items;
CREATE POLICY "Allow customers to view quotation items"
  ON public.quotation_items FOR SELECT
  USING (
    quotation_id IN (
      SELECT id FROM public.quotations
      WHERE customer_email = auth.jwt()->>'email' OR
            customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
    )
  );

-- Subscriptions RLS Policies
DROP POLICY IF EXISTS "Allow staff and admin to manage all subscriptions" ON public.subscriptions;
CREATE POLICY "Allow staff and admin to manage all subscriptions"
  ON public.subscriptions FOR ALL
  USING (public.is_staff_or_admin(auth.uid()))
  WITH CHECK (public.is_staff_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow customers to view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Allow customers to view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (
    customer_email = auth.jwt()->>'email' OR
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
  );
