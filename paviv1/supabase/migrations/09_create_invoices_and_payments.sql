-- ==============================================================================
-- 09_CREATE_INVOICES_AND_PAYMENTS.SQL
-- Brightloop Software – Subscription Management System
-- Module 7: Invoicing & Automated Billing (Indian GST Compliant)
-- ==============================================================================

-- 1. Create Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_company TEXT,
  customer_gstin TEXT,
  customer_address TEXT,
  customer_city TEXT,
  customer_state TEXT DEFAULT 'Tamil Nadu',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  paid_date DATE,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,       -- Taxable Value
  cgst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,    -- 9% CGST
  sgst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,    -- 9% SGST
  total_tax NUMERIC(12, 2) NOT NULL DEFAULT 0,      -- 18% Total GST
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,   -- Grand Total (INR)
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'cancelled')),
  payment_method TEXT,
  notes TEXT,
  terms TEXT DEFAULT '1. Goods/Services once sold are governed by Brightloop SaaS Terms of Service. 2. 18% GST (9% CGST + 9% SGST) applied under SAC Code 997331. 3. Disputes subject to Chennai jurisdiction.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_sub_id ON public.invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON public.invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);

-- 2. Create Invoice Items Table (Itemized SAC 997331 breakdown)
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  hsn_sac_code TEXT NOT NULL DEFAULT '997331',
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  line_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_items(invoice_id);

-- 3. Create Payments Table (Transaction Ledger)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  txn_ref TEXT UNIQUE NOT NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE RESTRICT,
  customer_id UUID REFERENCES public.customers(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL,
  payment_gateway TEXT DEFAULT 'Razorpay UPI AutoPay',
  gstin_ref TEXT,
  status TEXT NOT NULL DEFAULT 'succeeded' CHECK (status IN ('succeeded', 'pending', 'failed', 'refunded')),
  payment_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payments_txn_ref ON public.payments(txn_ref);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON public.payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);

-- 4. Automatic Updated At Triggers
DROP TRIGGER IF EXISTS set_invoices_updated_at ON public.invoices;
CREATE TRIGGER set_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_payments_updated_at ON public.payments;
CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. Row Level Security Configuration
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Invoices RLS Policies
DROP POLICY IF EXISTS "Allow staff and admin to manage all invoices" ON public.invoices;
CREATE POLICY "Allow staff and admin to manage all invoices"
  ON public.invoices FOR ALL
  USING (public.is_staff_or_admin(auth.uid()))
  WITH CHECK (public.is_staff_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow customers to view their own invoices" ON public.invoices;
CREATE POLICY "Allow customers to view their own invoices"
  ON public.invoices FOR SELECT
  USING (
    customer_email = auth.jwt()->>'email' OR
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
  );

-- Invoice Items RLS Policies
DROP POLICY IF EXISTS "Allow staff and admin to manage invoice items" ON public.invoice_items;
CREATE POLICY "Allow staff and admin to manage invoice items"
  ON public.invoice_items FOR ALL
  USING (public.is_staff_or_admin(auth.uid()))
  WITH CHECK (public.is_staff_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow customers to view their own invoice items" ON public.invoice_items;
CREATE POLICY "Allow customers to view their own invoice items"
  ON public.invoice_items FOR SELECT
  USING (
    invoice_id IN (
      SELECT id FROM public.invoices
      WHERE customer_email = auth.jwt()->>'email' OR
            customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
    )
  );

-- Payments RLS Policies
DROP POLICY IF EXISTS "Allow staff and admin to manage all payments" ON public.payments;
CREATE POLICY "Allow staff and admin to manage all payments"
  ON public.payments FOR ALL
  USING (public.is_staff_or_admin(auth.uid()))
  WITH CHECK (public.is_staff_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow customers to view their own payments" ON public.payments;
CREATE POLICY "Allow customers to view their own payments"
  ON public.payments FOR SELECT
  USING (
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()) OR
    invoice_id IN (
      SELECT id FROM public.invoices
      WHERE customer_email = auth.jwt()->>'email' OR
            customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
    )
  );
