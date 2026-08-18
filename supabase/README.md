# Supabase foundation

The initial migration is in `migrations/0001_initial_foundation.sql`.

It creates the multi-tenant organization and branch hierarchy, profile/staff records, customer records, service/product catalog, packages, invoices, payments, commissions, attendance, loyalty, expenses, and audit logs. Important records use archive timestamps instead of requiring hard deletion.

The migration is intentionally schema-only:

- No demo records are inserted.
- No production authentication is enabled.
- No RLS policies are enabled yet, so development mode is not blocked.
- A private `customer-photos` Storage bucket is prepared, but upload workflows and access policies are not implemented.

This migration has been prepared locally but is **not applied** until the existing Supabase project is connected and verified.