# Supabase foundation

The initial migration is in `migrations/0001_initial_foundation.sql`.

It creates the multi-tenant organization and branch hierarchy, profile/staff records, customer records, service/product catalog, packages, invoices, payments, commissions, attendance, payroll, loyalty, expenses, and audit logs. Payroll includes salary history, payroll periods, calculated employee snapshots, commission inclusion links, manual adjustments, and salary payments. Important records use archive, void, or status fields instead of requiring hard deletion.

The migration is intentionally schema-only:

- No demo records are inserted.
- No production authentication is enabled.
- No RLS policies are enabled yet, so development mode is not blocked.
- A private `customer-photos` Storage bucket is prepared, but upload workflows and access policies are not implemented.
- Payroll records store calculation snapshots so later salary or commission changes do not rewrite historical payroll values. Payroll payments are separate from customer invoices.

This migration has been prepared locally but is **not applied** until the existing Supabase project is connected and verified.