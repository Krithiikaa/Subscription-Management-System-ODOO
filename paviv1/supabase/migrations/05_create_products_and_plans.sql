-- ==============================================================================
-- 05_CREATE_PRODUCTS_AND_PLANS.SQL
-- Brightloop Software – Subscription Management System
-- Module 4: Product & Subscription Plan Management
-- ==============================================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT,
  category TEXT NOT NULL DEFAULT 'SaaS Core',
  sales_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (sales_price >= 0),
  cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (cost_price >= 0),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);

-- 2. Create Product Variants Table
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  additional_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (additional_price >= 0),
  sku TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);

-- 3. Create Subscription Plans Table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT,
  billing_cycle TEXT NOT NULL CHECK (LOWER(billing_cycle) IN ('daily', 'weekly', 'monthly', 'yearly')),
  price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
  min_quantity INTEGER NOT NULL DEFAULT 1 CHECK (min_quantity >= 1),
  available_from DATE,
  available_until DATE,
  close_at_end_of_period BOOLEAN NOT NULL DEFAULT true,
  allow_early_closure BOOLEAN NOT NULL DEFAULT false,
  allow_pause BOOLEAN NOT NULL DEFAULT true,
  allow_renewal BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT valid_date_range CHECK (available_until IS NULL OR available_from IS NULL OR available_until >= available_from)
);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_status ON public.subscription_plans(status);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_product ON public.subscription_plans(product_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_cycle ON public.subscription_plans(billing_cycle);

-- 4. Automatic Updated At Triggers (Reuses existing public.handle_updated_at from Migration 01)
DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER set_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_subscription_plans_updated_at ON public.subscription_plans;
CREATE TRIGGER set_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. Row Level Security (RLS) Configuration

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Products RLS
DROP POLICY IF EXISTS "Allow read access to products" ON public.products;
CREATE POLICY "Allow read access to products"
  ON public.products FOR SELECT
  USING (status = 'active' OR public.is_staff_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admin insert on products" ON public.products;
CREATE POLICY "Allow admin insert on products"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admin update on products" ON public.products;
CREATE POLICY "Allow admin update on products"
  ON public.products FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admin delete on products" ON public.products;
CREATE POLICY "Allow admin delete on products"
  ON public.products FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Product Variants RLS
DROP POLICY IF EXISTS "Allow read access to product_variants" ON public.product_variants;
CREATE POLICY "Allow read access to product_variants"
  ON public.product_variants FOR SELECT
  USING (
    status = 'active' OR public.is_staff_or_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Allow admin insert on product_variants" ON public.product_variants;
CREATE POLICY "Allow admin insert on product_variants"
  ON public.product_variants FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admin update on product_variants" ON public.product_variants;
CREATE POLICY "Allow admin update on product_variants"
  ON public.product_variants FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admin delete on product_variants" ON public.product_variants;
CREATE POLICY "Allow admin delete on product_variants"
  ON public.product_variants FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Subscription Plans RLS
DROP POLICY IF EXISTS "Allow read access to subscription_plans" ON public.subscription_plans;
CREATE POLICY "Allow read access to subscription_plans"
  ON public.subscription_plans FOR SELECT
  USING (status = 'active' OR public.is_staff_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admin insert on subscription_plans" ON public.subscription_plans;
CREATE POLICY "Allow admin insert on subscription_plans"
  ON public.subscription_plans FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admin update on subscription_plans" ON public.subscription_plans;
CREATE POLICY "Allow admin update on subscription_plans"
  ON public.subscription_plans FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admin delete on subscription_plans" ON public.subscription_plans;
CREATE POLICY "Allow admin delete on subscription_plans"
  ON public.subscription_plans FOR DELETE
  USING (public.is_admin(auth.uid()));
