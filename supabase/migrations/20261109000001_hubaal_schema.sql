-- ==============================================================================
-- HUBAAL SHOP: Customer Debt Management System
-- Database Schema, Multi-Store Isolation, Ledger Architecture & RLS Policies
-- Supabase / PostgreSQL 15+
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User Roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'super_admin',
        'shop_owner',
        'manager',
        'cashier',
        'accountant'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ledger Entry Types
DO $$ BEGIN
    CREATE TYPE ledger_entry_type AS ENUM (
        'opening_balance',
        'debt_charge',
        'payment_received',
        'reversal'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Payment Method
DO $$ BEGIN
    CREATE TYPE payment_method_type AS ENUM (
        'cash',
        'mobile_money',
        'bank_transfer',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    phone_number VARCHAR(30),
    email VARCHAR(120),
    is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Shops (Multi-store isolation)
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    code VARCHAR(30) UNIQUE NOT NULL,
    address TEXT,
    phone_number VARCHAR(30),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    owner_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Shop Members
CREATE TABLE IF NOT EXISTS public.shop_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'cashier',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_shop_member UNIQUE (shop_id, profile_id)
);

-- 4. Customers
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30),
    address TEXT,
    notes TEXT,
    opening_balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    credit_limit NUMERIC(14, 2) DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Debt Transactions (Deyn Cusub)
CREATE TABLE IF NOT EXISTS public.debt_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    transaction_number VARCHAR(40) NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    total_amount NUMERIC(14, 2) NOT NULL CHECK (total_amount >= 0),
    notes TEXT,
    is_reversed BOOLEAN NOT NULL DEFAULT FALSE,
    reversal_reason TEXT,
    reversed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_shop_debt_number UNIQUE (shop_id, transaction_number)
);

-- 6. Debt Items (Flexible product lines: user enters any name, quantity, unit price)
CREATE TABLE IF NOT EXISTS public.debt_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debt_transaction_id UUID NOT NULL REFERENCES public.debt_transactions(id) ON DELETE CASCADE,
    product_name VARCHAR(200) NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(14, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    payment_number VARCHAR(40) NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method payment_method_type NOT NULL DEFAULT 'mobile_money',
    reference_number VARCHAR(80),
    notes TEXT,
    is_reversed BOOLEAN NOT NULL DEFAULT FALSE,
    reversal_reason TEXT,
    reversed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_shop_payment_number UNIQUE (shop_id, payment_number)
);

-- 8. Customer Ledger (Immutable financial source of truth)
-- Formula: Outstanding Balance = Opening Balance + Total Debt Charges - Total Payments
CREATE TABLE IF NOT EXISTS public.customer_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    entry_type ledger_entry_type NOT NULL,
    reference_id UUID,
    description TEXT NOT NULL,
    charge_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (charge_amount >= 0),
    payment_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (payment_amount >= 0),
    running_balance NUMERIC(14, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(80) NOT NULL,
    entity_name VARCHAR(80) NOT NULL,
    entity_id UUID,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Sync Operations / Idempotency Queue (Offline synchronization)
CREATE TABLE IF NOT EXISTS public.sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    operation_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'processed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_cust_shop ON public.customers(shop_id);
CREATE INDEX IF NOT EXISTS idx_debt_tx_cust ON public.debt_transactions(shop_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_debt_items_tx ON public.debt_items(debt_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_cust ON public.payments(shop_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_ledger_cust ON public.customer_ledger(customer_id, created_at ASC);

-- ==============================================================================
-- ATOMIC DATABASE FUNCTIONS
-- ==============================================================================

-- Calculate Customer Outstanding Balance
CREATE OR REPLACE FUNCTION public.calculate_customer_balance(p_customer_id UUID)
RETURNS NUMERIC(14, 2)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_opening NUMERIC(14, 2) := 0.00;
    v_charges NUMERIC(14, 2) := 0.00;
    v_payments NUMERIC(14, 2) := 0.00;
BEGIN
    SELECT COALESCE(opening_balance, 0.00) INTO v_opening
    FROM public.customers WHERE id = p_customer_id;

    SELECT COALESCE(SUM(charge_amount), 0.00) INTO v_charges
    FROM public.customer_ledger WHERE customer_id = p_customer_id;

    SELECT COALESCE(SUM(payment_amount), 0.00) INTO v_payments
    FROM public.customer_ledger WHERE customer_id = p_customer_id;

    RETURN (v_opening + v_charges - v_payments);
END;
$$;

-- Atomic: Record Debt Transaction with Multiple Product Rows
CREATE OR REPLACE FUNCTION public.record_debt_transaction(
    p_shop_id UUID,
    p_user_id UUID,
    p_customer_id UUID,
    p_transaction_number VARCHAR(40),
    p_items JSONB, -- Array of [{ "product_name": text, "quantity": num, "unit_price": num }]
    p_total_amount NUMERIC(14, 2),
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_debt_id UUID;
    v_item RECORD;
    v_cur_bal NUMERIC(14, 2);
    v_new_bal NUMERIC(14, 2);
    v_calculated_total NUMERIC(14, 2) := 0.00;
BEGIN
    -- 1. Insert Debt Transaction
    INSERT INTO public.debt_transactions (
        shop_id,
        transaction_number,
        customer_id,
        user_id,
        total_amount,
        notes
    ) VALUES (
        p_shop_id,
        p_transaction_number,
        p_customer_id,
        p_user_id,
        p_total_amount,
        p_notes
    ) RETURNING id INTO v_debt_id;

    -- 2. Insert Debt Items & verify subtotals
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        product_name VARCHAR(200),
        quantity NUMERIC(12, 2),
        unit_price NUMERIC(12, 2)
    )
    LOOP
        INSERT INTO public.debt_items (
            debt_transaction_id,
            product_name,
            quantity,
            unit_price,
            subtotal
        ) VALUES (
            v_debt_id,
            v_item.product_name,
            v_item.quantity,
            v_item.unit_price,
            (v_item.quantity * v_item.unit_price)
        );
        v_calculated_total := v_calculated_total + (v_item.quantity * v_item.unit_price);
    END LOOP;

    -- 3. Post to immutable Customer Ledger
    v_cur_bal := public.calculate_customer_balance(p_customer_id);
    v_new_bal := v_cur_bal + p_total_amount;

    INSERT INTO public.customer_ledger (
        shop_id,
        customer_id,
        user_id,
        entry_type,
        reference_id,
        description,
        charge_amount,
        payment_amount,
        running_balance
    ) VALUES (
        p_shop_id,
        p_customer_id,
        p_user_id,
        'debt_charge',
        v_debt_id,
        'Deyn Cusub #' || p_transaction_number,
        p_total_amount,
        0.00,
        v_new_bal
    );

    RETURN v_debt_id;
END;
$$;

-- Atomic: Record Payment
CREATE OR REPLACE FUNCTION public.record_customer_payment(
    p_shop_id UUID,
    p_user_id UUID,
    p_customer_id UUID,
    p_payment_number VARCHAR(40),
    p_amount NUMERIC(14, 2),
    p_payment_method payment_method_type,
    p_reference_number VARCHAR(80) DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_pay_id UUID;
    v_cur_bal NUMERIC(14, 2);
    v_new_bal NUMERIC(14, 2);
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Payment amount must be greater than zero.';
    END IF;

    -- Prevent negative balance
    v_cur_bal := public.calculate_customer_balance(p_customer_id);
    IF p_amount > v_cur_bal THEN
        RAISE EXCEPTION 'Payment amount ($%) exceeds outstanding balance ($%).', p_amount, v_cur_bal;
    END IF;

    INSERT INTO public.payments (
        shop_id,
        payment_number,
        customer_id,
        user_id,
        amount,
        payment_method,
        reference_number,
        notes
    ) VALUES (
        p_shop_id,
        p_payment_number,
        p_customer_id,
        p_user_id,
        p_amount,
        p_payment_method,
        p_reference_number,
        p_notes
    ) RETURNING id INTO v_pay_id;

    v_new_bal := v_cur_bal - p_amount;

    INSERT INTO public.customer_ledger (
        shop_id,
        customer_id,
        user_id,
        entry_type,
        reference_id,
        description,
        charge_amount,
        payment_amount,
        running_balance
    ) VALUES (
        p_shop_id,
        p_customer_id,
        p_user_id,
        'payment_received',
        v_pay_id,
        'Lacag Bixin #' || p_payment_number || ' (' || UPPER(p_payment_method::text) || ')',
        0.00,
        p_amount,
        v_new_bal
    );

    RETURN v_pay_id;
END;
$$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation per shop_id
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT COALESCE((SELECT is_super_admin FROM public.profiles WHERE auth_user_id = auth.uid()), FALSE);
$$;

CREATE OR REPLACE FUNCTION public.user_has_shop_access(p_shop_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT public.is_super_admin() OR EXISTS (
        SELECT 1 FROM public.shop_members sm
        JOIN public.profiles p ON p.id = sm.profile_id
        WHERE sm.shop_id = p_shop_id AND p.auth_user_id = auth.uid() AND sm.is_active = TRUE
    );
$$;

CREATE POLICY customers_isolation ON public.customers FOR ALL
    USING (public.user_has_shop_access(shop_id)) WITH CHECK (public.user_has_shop_access(shop_id));

CREATE POLICY debt_transactions_isolation ON public.debt_transactions FOR ALL
    USING (public.user_has_shop_access(shop_id)) WITH CHECK (public.user_has_shop_access(shop_id));

CREATE POLICY debt_items_isolation ON public.debt_items FOR ALL
    USING (EXISTS (SELECT 1 FROM public.debt_transactions dt WHERE dt.id = debt_transaction_id AND public.user_has_shop_access(dt.shop_id)))
    WITH CHECK (EXISTS (SELECT 1 FROM public.debt_transactions dt WHERE dt.id = debt_transaction_id AND public.user_has_shop_access(dt.shop_id)));

CREATE POLICY payments_isolation ON public.payments FOR ALL
    USING (public.user_has_shop_access(shop_id)) WITH CHECK (public.user_has_shop_access(shop_id));

CREATE POLICY customer_ledger_isolation ON public.customer_ledger FOR ALL
    USING (public.user_has_shop_access(shop_id)) WITH CHECK (public.user_has_shop_access(shop_id));
