-- ============================================================
-- MEE BEAUTY SPA - CATALOG FIX
-- Chuẩn hóa Catalog + hỗ trợ Product Package
-- ============================================================

-- ------------------------------------------------------------
-- 1. CATALOG ITEMS
-- ------------------------------------------------------------

alter table public.catalog_items
  add column if not exists code text;

create index if not exists catalog_items_org_branch_idx
  on public.catalog_items (organization_id, branch_id);

create index if not exists catalog_items_type_idx
  on public.catalog_items (organization_id, item_type);

-- ------------------------------------------------------------
-- 2. SERVICES
-- ------------------------------------------------------------

-- Các field dùng chung nằm ở catalog_items.
-- services chỉ giữ thông tin riêng của dịch vụ.

-- ------------------------------------------------------------
-- 3. PRODUCTS
-- ------------------------------------------------------------

alter table public.products
  add column if not exists cost_price numeric(12,2)
    not null default 0;

alter table public.products
  add constraint products_cost_price_check
  check (cost_price >= 0);

-- ------------------------------------------------------------
-- 4. PACKAGES
-- ------------------------------------------------------------

alter table public.packages
  add column if not exists code text;

alter table public.packages
  add column if not exists type public.catalog_item_type
    not null default 'SERVICE';

create index if not exists packages_org_branch_type_idx
  on public.packages (organization_id, branch_id, type);

-- ------------------------------------------------------------
-- 5. PACKAGE ITEMS
-- ------------------------------------------------------------

-- Hiện tại package_items chỉ hỗ trợ service_id.
-- Đổi thành mô hình hỗ trợ SERVICE hoặc PRODUCT.

alter table public.package_items
  add column if not exists item_type public.catalog_item_type
    not null default 'SERVICE';

alter table public.package_items
  add column if not exists product_id uuid
    references public.products(id) on delete restrict;

-- Cho phép package item là service hoặc product.
alter table public.package_items
  alter column service_id drop not null;

-- Đảm bảo mỗi item phải là service hoặc product.
alter table public.package_items
  drop constraint if exists package_items_item_check;

alter table public.package_items
  add constraint package_items_item_check
  check (
    (item_type = 'SERVICE' and service_id is not null and product_id is null)
    or
    (item_type = 'PRODUCT' and product_id is not null and service_id is null)
  );

-- Xóa unique cũ vì nó chỉ phù hợp service.
alter table public.package_items
  drop constraint if exists package_items_package_id_service_id_key;

-- Unique service trong cùng package.
create unique index if not exists package_items_package_service_uidx
  on public.package_items (package_id, service_id)
  where service_id is not null;

-- Unique product trong cùng package.
create unique index if not exists package_items_package_product_uidx
  on public.package_items (package_id, product_id)
  where product_id is not null;

-- ------------------------------------------------------------
-- 6. TRIGGER VALIDATE PACKAGE TYPE
-- ------------------------------------------------------------

create or replace function public.validate_package_item_type()
returns trigger
language plpgsql
as $$
begin

  if new.item_type = 'SERVICE' then
    if new.service_id is null or new.product_id is not null then
      raise exception
        'SERVICE package item must have service_id only';
    end if;
  elsif new.item_type = 'PRODUCT' then
    if new.product_id is null or new.service_id is not null then
      raise exception
        'PRODUCT package item must have product_id only';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists package_items_validate_type
on public.package_items;

create trigger package_items_validate_type
before insert or update
on public.package_items
for each row
execute function public.validate_package_item_type();

-- ------------------------------------------------------------
-- 7. UPDATE TIMESTAMP
-- ------------------------------------------------------------

drop trigger if exists catalog_items_set_updated_at
on public.catalog_items;

create trigger catalog_items_set_updated_at
before update on public.catalog_items
for each row
execute function public.set_updated_at();

drop trigger if exists services_set_updated_at
on public.services;

create trigger services_set_updated_at
before update on public.services
for each row
execute function public.set_updated_at();

drop trigger if exists products_set_updated_at
on public.products;

create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists packages_set_updated_at
on public.packages;

create trigger packages_set_updated_at
before update on public.packages
for each row
execute function public.set_updated_at();

