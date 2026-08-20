export type CatalogType = 'service' | 'product';
export type ItemStatus = 'active' | 'inactive';

export interface Category {
  id: string;
  organization_id: string;
  branch_id: string;
  name: string;
  type: CatalogType;
  status: ItemStatus;
  created_at?: string;
}

export interface ServiceItem {
  id: string;
  organization_id: string;
  branch_id: string;
  category_id: string | null;
  code: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  status: ItemStatus;
  categories?: Partial<Category>;
  created_at?: string;
}

export interface ProductItem {
  id: string;
  organization_id: string;
  branch_id: string;
  category_id: string | null;
  sku: string;
  name: string;
  cost_price: number;
  selling_price: number;
  unit: string;
  description: string;
  status: ItemStatus;
  categories?: Partial<Category>;
  created_at?: string;
}

export interface PackageItemDetail {
  id?: string;
  package_id?: string;
  organization_id: string;
  branch_id: string;
  item_type: CatalogType;
  item_id: string;
  quantity: number;
  unit_price: number;
  // Dynamic joined labels
  item_name?: string;
  item_code?: string;
}

export interface ServicePackage {
  id: string;
  organization_id: string;
  branch_id: string;
  code: string;
  name: string;
  type: CatalogType;
  price: number;
  validity_days: number;
  description: string;
  status: ItemStatus;
  items?: PackageItemDetail[];
  created_at?: string;
}

export interface TenantContext {
  organizationId: string;
  branchId: string;
}