-- ==============================================================================
-- HUBAAL SHOP: Seed Data for Customer Debt Management System
-- ==============================================================================

-- 1. Profiles
INSERT INTO public.profiles (id, full_name, phone_number, email, is_super_admin, is_active)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Admin Cabdirashiid', '+252 61 5000001', 'admin@hubaalshop.so', TRUE, TRUE),
    ('22222222-2222-2222-2222-222222222222', 'Jaamac Xaashi (Milkiile)', '+252 61 5000002', 'owner@hubaalshop.so', FALSE, TRUE),
    ('33333333-3333-3333-3333-333333333333', 'Faadumo Cali (Qasnaji)', '+252 61 5000003', 'cashier@hubaalshop.so', FALSE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. Shops
INSERT INTO public.shops (id, name, code, address, phone_number, currency, owner_profile_id, is_active)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Hubaal Shop (Hodan Branch)', 'HB-HODAN', 'Taleex St, Hodan, Mogadishu', '+252 61 5111111', 'USD', '22222222-2222-2222-2222-222222222222', TRUE),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Hubaal Shop (Waberi Branch)', 'HB-WABERI', 'Maka Al-Mukarama, Waberi', '+252 61 5222222', 'USD', '22222222-2222-2222-2222-222222222222', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 3. Shop Members
INSERT INTO public.shop_members (shop_id, profile_id, role, is_active)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'shop_owner', TRUE),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'cashier', TRUE)
ON CONFLICT (shop_id, profile_id) DO NOTHING;

-- 4. Customers
INSERT INTO public.customers (id, shop_id, name, phone_number, address, notes, opening_balance)
VALUES
    ('cust1111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Axmed Daahir (Ahmed)', '0612345678', 'Hodan, Laamiga Taleex', 'Regular credit customer', 0.00),
    ('cust2222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Saynab Xasan Warsame', '0618765432', 'Hodan, Seybiyaano', 'Cafeteria owner', 0.00),
    ('cust3333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Maxamed Shire Cilmi', '0619988776', 'Hodan, Tarabuunka', 'Local builder', 0.00)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Debt Transaction: Ahmed taken on credit:
-- Rice Basmati (2 @ $25 = $50), Sugar (3 @ $10 = $30), Cooking Oil (1 @ $15 = $15) -> Total: $95
INSERT INTO public.debt_transactions (id, shop_id, transaction_number, customer_id, user_id, total_amount, notes, created_at)
VALUES
    ('debt1111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'DYN-2026-001', 'cust1111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 95.00, 'Raashin bisha lagu qaatay deyn', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.debt_items (debt_transaction_id, product_name, quantity, unit_price, subtotal)
VALUES
    ('debt1111-1111-1111-1111-111111111111', 'Rice Basmati', 2, 25.00, 50.00),
    ('debt1111-1111-1111-1111-111111111111', 'Sugar', 3, 10.00, 30.00),
    ('debt1111-1111-1111-1111-111111111111', 'Cooking Oil', 1, 15.00, 15.00)
ON CONFLICT DO NOTHING;

INSERT INTO public.customer_ledger (shop_id, customer_id, user_id, entry_type, reference_id, description, charge_amount, payment_amount, running_balance, created_at)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cust1111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'debt_charge', 'debt1111-1111-1111-1111-111111111111', 'Deyn Cusub #DYN-2026-001 (Rice, Sugar, Oil)', 95.00, 0.00, 95.00, NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- 6. Partial Payment for Ahmed: $35 via EVC Plus -> Balance remaining: $60
INSERT INTO public.payments (id, shop_id, payment_number, customer_id, user_id, amount, payment_date, payment_method, reference_number, notes, created_at)
VALUES
    ('pay1111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PAY-2026-001', 'cust1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 35.00, CURRENT_DATE - 1, 'mobile_money', 'EVC-8849201', 'Qeyb bixin deyn', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.customer_ledger (shop_id, customer_id, user_id, entry_type, reference_id, description, charge_amount, payment_amount, running_balance, created_at)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cust1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'payment_received', 'pay1111-1111-1111-1111-111111111111', 'Lacag Bixin #PAY-2026-001 (EVC-8849201)', 0.00, 35.00, 60.00, NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;
