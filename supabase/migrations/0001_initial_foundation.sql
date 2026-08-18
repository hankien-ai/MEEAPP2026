-- MEE BEAUTY SPA
-- Initial multi-tenant foundation.
-- This migration is intentionally schema-only: no demo records, auth flow, or RLS.

create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

create type public.catalog_item_type as enum ('SERVICE', 'PRODUCT');
create type public.catalog_item_status as enum ('ACTIVE', 'INACTIVE');
create type public.staff_status as enum ('ACTIVE', 'INACTIVE');
create type public.invoice_status as enum ('DRAFT', 'PARTIALLY_PAID', 'PAID', 'VOID');
create type public.payment_method as enum ('CASH', 'BANK_TRANSFER', 'QR', 'DEBT');
create type public.loyalty_mode as enum ('POINT', 'SESSION');
create type public.attendance_status as enum (
  'PRESENT',
  'LATE',
  'LEAVE_APPROVED',
  'LEAVE_UNAPPROVED'
);
create type public.salary_type as enum (
  'SALARY_MONTHLY',
  'SALARY_DAILY',
  'SALARY_HOURLY'
);
create type public.payroll_period_status as enum (
  'DRAFT',
  'CALCULATED',
  'APPROVED',
  'PAID',
  'VOID'
);
create type public.payroll_adjustment_type as enum ('BONUS', 'DEDUCTION');
create type public.payroll_payment_method as enum ('CASH', 'BANK_TRANSFER', 'QR');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  phone text,
  default_currency text not null default 'VND',
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text not null,
  address text,
  phone text,
  timezone text not null default 'Asia/Ho_Chi_Minh',
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, name)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  organization_id uuid references public.organizations(id) on delete restrict,
  branch_id uuid references public.branches(id) on delete restrict,
  full_name text not null,
  phone text,
  avatar_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.staff (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  branch_id uuid not null references public.branches(id) on delete restrict,
  profile_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  role text not null,
  phone text,
  status public.staff_status not null default 'ACTIVE',
  started_on date,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.staff_salary_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  branch_id uuid not null references public.branches(id) on delete restrict,
  staff_id uuid not null references public.staff(id) on delete restrict,
  salary_type public.salary_type not null,
  salary_amount numeric(12, 2) not null check (salary_amount >= 0),
  effective_from date not null,
  effective_to date,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (effective_to is null or effective_to > effective_from),
  exclude using gist (
    staff_id with =,
    daterange(effective_from, coalesce(effective_to, 'infinity'::date), '[)') with &&
  )
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  branch_id uuid not null references public.branches(id) on delete restrict,
  full_name text not null,
  phone text not null,
  email text,
  birthday date,
  gender text,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.customer_photos (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  storage_path text not null,
  caption text,
  is_primary boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.customer_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  note text not null,
  created_by uuid references public.profiles(id) on delete set null,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.customer_tags (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  tag text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (customer_id, tag)
);

create table public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  branch_id uuid references public.branches(id) on delete restrict,
  item_type public.catalog_item_type not null,
  name text not null,
  category text,
  description text,
  price numeric(12, 2) not null default 0 check (price >= 0),
  status public.catalog_item_status not null default 'ACTIVE',
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  catalog_item_id uuid not null unique references public.catalog_items(id) on delete restrict,
  duration_minutes integer not null check (duration_minutes > 0),
  sales_commission_rate numeric(5, 2) not null default 0 check (sales_commission_rate >= 0),
  performance_commission_rate numeric(5, 2) not null default 0 check (performance_commission_rate >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  catalog_item_id uuid not null unique references public.catalog_items(id) on delete restrict,
  selling_price numeric(12, 2) not null default 0 check (selling_price >= 0),
  stock_quantity numeric(12, 2) not null default 0 check (stock_quantity >= 0),
  minimum_stock numeric(12, 2) not null default 0 check (minimum_stock >= 0),
  unit text not null default 'unit',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.validate_catalog_item_type()
returns trigger
language plpgsql
as $$
declare
  expected_type public.catalog_item_type;
  actual_type public.catalog_item_type;
begin
  expected_type := case
    when tg_table_name = 'services' then 'SERVICE'::public.catalog_item_type
    else 'PRODUCT'::public.catalog_item_type
  end;

  select item_type
  into actual_type
  from public.catalog_items
  where id = new.catalog_item_id;

  if actual_type is distinct from expected_type then
    raise exception 'catalog item % must have type %, got %',
      new.catalog_item_id, expected_type, actual_type;
  end if;

  return new;
end;
$$;

create trigger services_validate_catalog_type
before insert or update on public.services
for each row execute function public.validate_catalog_item_type();

create trigger products_validate_catalog_type
before insert or update on public.products
for each row execute function public.validate_catalog_item_type();

create table public.packages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  branch_id uuid references public.branches(id) on delete restrict,
  name text not null,
  description text,
  price numeric(12, 2) not null default 0 check (price >= 0),
  validity_days integer not null default 90 check (validity_days > 0),
  is_active boolean not null default true,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.package_items (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price_override numeric(12, 2) check (price_override >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (package_id, service_id)
);

create table public.customer_packages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  branch_id uuid not null references public.branches(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  package_id uuid not null references public.packages(id) on delete restrict,
  purchased_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz,
  custom_items jsonb not null default '[]'::jsonb,
  remaining_uses integer not null default 0 check (remaining_uses >= 0),
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  branch_id uuid not null references public.branches(id) on delete restrict,
  customer_id uuid references public.customers(id) on delete restrict,
  seller_staff_id uuid references public.staff(id) on delete set null,
  status public.invoice_status not null default 'DRAFT',
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  discount_amount numeric(12, 2) not null default 0 check (discount_amount >= 0),
  total_amount numeric(12, 2) not null default 0 check (total_amount >= 0),
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete restrict,
  catalog_item_id uuid references public.catalog_items(id) on delete restrict,
  package_id uuid references public.packages(id) on delete restrict,
  actual_service_id uuid references public.services(id) on delete restrict,
  seller_staff_id uuid references public.staff(id) on delete set null,
  performing_staff_id uuid references public.staff(id) on delete set null,
  description text not null,
  quantity numeric(12, 2) not null default 1 check (quantity > 0),
  unit_price numeric(12, 2) not null default 0 check (unit_price >= 0),
  discount_amount numeric(12, 2) not null default 0 check (discount_amount >= 0),
  total_amount numeric(12, 2) not null default 0 check (total_amount >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  branch_id uuid not null references public.branches(id) on delete restrict,
  invoice_id uuid not null references public.invoices(id) on delete restrict,
  method public.payment_method not null,
  amount numeric(12, 2) not null check (amount >= 0),
  reference text,
  paid_at timestamptz not null default timezone('utc', now()),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.staff_commissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  branch_id uuid not null references public.branches(id) on delete restrict,
  staff_id uuid not null references public.staff(id) on delete restrict,
  invoice_item_id uuid references public.invoice_items(id) on delete restrict,
  commission_type text not null check (commission_type in ('SALES', 'PERFORMANCE')),
  amount numeric(12, 2) not null default 0 check (amount >= 0),
  period_start date,
  period_end date,
  approved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  branch_id uuid not null references public.branches(id) on delete restrict,
  staff_id uuid not null references public.staff(id) on delete restrict,
  work_date date not null,
  check_in_at timestamptz,
  check_out_at timestamptz,
  status public.attendance_status not null default 'PRESENT',
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (staff_id, work_date)
);

create table public.payroll_periods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  branch_id uuid not null references public.branches(id) on delete restrict,
  period_start date not null,
  period_end date not null,
  status public.payroll_period_status not null default 'DRAFT',
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (period_end >= period_start),
  unique (branch_id, period_start, period_end)
);

create table public.payroll_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  branch_id uuid not null references public.branches(id) on delete restrict,
  payroll_period_id uuid not null references public.payroll_periods(id) on delete restrict,
  staff_id uuid not null references public.staff(id) on delete restrict,
  base_salary numeric(12, 2) not null default 0 check (base_salary >= 0),
  attendance_salary numeric(12, 2) not null default 0 check (attendance_salary >= 0),
  overtime_amount numeric(12, 2) not null default 0 check (overtime_amount >= 0),
  commission_amount numeric(12, 2) not null default 0 check (commission_amount >= 0),
  bonus_amount numeric(12, 2) not null default 0 check (bonus_amount >= 0),
  deduction_amount numeric(12, 2) not null default 0 check (deduction_amount >= 0),
  total_amount numeric(12, 2) not null default 0 check (total_amount >= 0),
  worked_days numeric(8, 2) not null default 0 check (worked_days >= 0),
  worked_hours numeric(8, 2) not null default 0 check (worked_hours >= 0),
  late_count integer not null default 0 check (late_count >= 0),
  leave_approved_count integer not null default 0 check (leave_approved_count >= 0),
  leave_unapproved_count integer not null default 0 check (leave_unapproved_count >= 0),
  sales_revenue numeric(12, 2) not null default 0 check (sales_revenue >= 0),
  performance_revenue numeric(12, 2) not null default 0 check (performance_revenue >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (payroll_period_id, staff_id)
);

create table public.payroll_record_commissions (
  id uuid primary key default gen_random_uuid(),
  payroll_record_id uuid not null references public.payroll_records(id) on delete restrict,
  staff_commission_id uuid not null references public.staff_commissions(id) on delete restrict,
  amount numeric(12, 2) not null check (amount >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (payroll_record_id, staff_commission_id)
);

create table public.payroll_adjustments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  branch_id uuid not null references public.branches(id) on delete restrict,
  payroll_record_id uuid not null references public.payroll_records(id) on delete restrict,
  adjustment_type public.payroll_adjustment_type not null,
  amount numeric(12, 2) not null check (amount > 0),
  reason text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.payroll_payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  branch_id uuid not null references public.branches(id) on delete restrict,
  payroll_record_id uuid not null references public.payroll_records(id) on delete restrict,
  amount numeric(12, 2) not null check (amount > 0),
  payment_method public.payroll_payment_method not null,
  paid_at timestamptz not null default timezone('utc', now()),
  reference text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.loyalty_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  branch_id uuid not null references public.branches(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  mode public.loyalty_mode not null,
  balance numeric(12, 2) not null default 0 check (balance >= 0),
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (customer_id)
);

create table public.loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  branch_id uuid not null references public.branches(id) on delete restrict,
  loyalty_account_id uuid not null references public.loyalty_accounts(id) on delete restrict,
  invoice_id uuid references public.invoices(id) on delete set null,
  transaction_type text not null check (transaction_type in ('EARN', 'REDEEM', 'ADJUST')),
  amount numeric(12, 2) not null,
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  branch_id uuid not null references public.branches(id) on delete restrict,
  category text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  incurred_on date not null default current_date,
  note text,
  attachment_path text,
  created_by uuid references public.profiles(id) on delete set null,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete restrict,
  branch_id uuid references public.branches(id) on delete restrict,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index branches_organization_id_idx on public.branches (organization_id);
create index profiles_organization_id_idx on public.profiles (organization_id);
create index staff_organization_branch_idx on public.staff (organization_id, branch_id);
create index customers_organization_branch_idx on public.customers (organization_id, branch_id);
create index customers_phone_idx on public.customers (phone);
create index customer_photos_customer_id_idx on public.customer_photos (customer_id);
create index customer_notes_customer_id_idx on public.customer_notes (customer_id);
create index customer_tags_customer_id_idx on public.customer_tags (customer_id);
create index catalog_items_organization_type_idx on public.catalog_items (organization_id, item_type);
create index packages_organization_branch_idx on public.packages (organization_id, branch_id);
create index customer_packages_customer_id_idx on public.customer_packages (customer_id);
create index invoices_organization_branch_created_idx on public.invoices (organization_id, branch_id, created_at desc);
create index invoice_items_invoice_id_idx on public.invoice_items (invoice_id);
create index payments_invoice_id_idx on public.payments (invoice_id);
create index staff_commissions_staff_period_idx on public.staff_commissions (staff_id, period_start, period_end);
create index attendance_branch_date_idx on public.attendance (branch_id, work_date);
create index staff_salary_settings_staff_effective_idx
  on public.staff_salary_settings (staff_id, effective_from desc);
create index payroll_periods_organization_branch_status_idx
  on public.payroll_periods (organization_id, branch_id, status);
create index payroll_records_staff_period_idx
  on public.payroll_records (staff_id, payroll_period_id);
create index payroll_record_commissions_commission_idx
  on public.payroll_record_commissions (staff_commission_id);
create index payroll_adjustments_record_idx
  on public.payroll_adjustments (payroll_record_id);
create index payroll_payments_record_paid_idx
  on public.payroll_payments (payroll_record_id, paid_at desc);
create index loyalty_transactions_account_created_idx on public.loyalty_transactions (loyalty_account_id, created_at desc);
create index expenses_organization_branch_date_idx on public.expenses (organization_id, branch_id, incurred_on desc);
create index audit_logs_organization_created_idx on public.audit_logs (organization_id, created_at desc);

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create trigger branches_set_updated_at
before update on public.branches
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger staff_set_updated_at
before update on public.staff
for each row execute function public.set_updated_at();

create trigger staff_salary_settings_set_updated_at
before update on public.staff_salary_settings
for each row execute function public.set_updated_at();

create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

create trigger customer_photos_set_updated_at
before update on public.customer_photos
for each row execute function public.set_updated_at();

create trigger customer_notes_set_updated_at
before update on public.customer_notes
for each row execute function public.set_updated_at();

create trigger catalog_items_set_updated_at
before update on public.catalog_items
for each row execute function public.set_updated_at();

create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger packages_set_updated_at
before update on public.packages
for each row execute function public.set_updated_at();

create trigger customer_packages_set_updated_at
before update on public.customer_packages
for each row execute function public.set_updated_at();

create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

create trigger staff_commissions_set_updated_at
before update on public.staff_commissions
for each row execute function public.set_updated_at();

create trigger attendance_set_updated_at
before update on public.attendance
for each row execute function public.set_updated_at();

create trigger payroll_periods_set_updated_at
before update on public.payroll_periods
for each row execute function public.set_updated_at();

create trigger payroll_records_set_updated_at
before update on public.payroll_records
for each row execute function public.set_updated_at();

create trigger loyalty_accounts_set_updated_at
before update on public.loyalty_accounts
for each row execute function public.set_updated_at();

create trigger expenses_set_updated_at
before update on public.expenses
for each row execute function public.set_updated_at();

-- Storage architecture only. Upload workflows and access policies come later.
insert into storage.buckets (id, name, public)
values ('customer-photos', 'customer-photos', false)
on conflict (id) do nothing;