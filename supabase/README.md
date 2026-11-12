# HUBAAL SHOP - Supabase & PostgreSQL Architecture Guide

This directory contains the production-grade PostgreSQL migrations, database functions, and security policies for **HUBAAL SHOP: Multi-Store Shop Management & Customer Debt Tracking System**.

---

## 1. How to Connect Your Supabase Project

1. **Create or Open a Supabase Project**:
   - Go to [Supabase Dashboard](https://app.supabase.com) and create a new project (e.g., `hubaal-shop-production`).
   - Copy your **Project URL** and **Anon Public Key** from `Settings` -> `API`.

2. **Run Migrations**:
   - In your Supabase dashboard, navigate to the **SQL Editor**.
   - Open and run the migration file located at:
     ```
     supabase/migrations/20261109000001_hubaal_schema.sql
     ```
   - (Optional for development/testing): Run the seed data file:
     ```
     supabase/seed.sql
     ```

3. **Configure Environment Variables**:
   In your client application or `.env` file, provide:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

---

## 2. Multi-Store Isolation & Row Level Security (RLS)

Every table in HUBAAL SHOP enforces data isolation through `shop_id`:

- **Super Admin**: Has global visibility and management privileges across all registered shops.
- **Shop Owner / Cashier / Manager / Accountant**: Restricted strictly to their assigned `shop_id` via `public.user_has_shop_access(shop_id)`.
- **Zero Frontend Leakage**: Even if a malicious client attempts to forge requests, PostgreSQL RLS rejects any query or mutation targeting an unauthorized `shop_id`.

---

## 3. Immutable Financial Ledger (Debt Formula)

HUBAAL SHOP enforces a double-entry style immutable ledger (`public.customer_ledger`):

$$\text{Outstanding Balance} = \text{Opening Balance} + \sum(\text{Credit Charges}) - \sum(\text{Payments Received}) \pm \text{Adjustments}$$

### Critical Financial Safeguards:
- Historical transactions are **never deleted or overwritten**.
- Corrections are made using explicit `reversal` entries with mandatory reason tracking.
- Every payment generates a verifiable reference number and audit log.
- Balance lookups use the database-level verified function `public.calculate_customer_balance(uuid)`.
