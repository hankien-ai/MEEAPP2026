export type CatalogItemType = "SERVICE" | "PRODUCT";
export type CatalogStatus = "ACTIVE" | "INACTIVE";
export type CategoryType = "service" | "product";
export type CategoryStatus = "active" | "inactive";

// Catalog Item cơ sở trong DB
export interface CatalogItem {
  id: string;
  organization_id: string;
  branch_id?: string | null;
  item_type: CatalogItemType;
  name: string;
  code: string;
  category?: string | null;
  description?: string | null;
  price: number;
  status: CatalogStatus;
}

// Bảng services mở rộng
export interface ServiceDetail {
  id: string;
  catalog_item_id: string;
  duration_minutes: number;
  sales_commission_rate: number;
  performance_commission_rate: number;
}

// Bảng products mở rộng
export interface ProductDetail {
  id: string;
  catalog_item_id: string;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  minimum_stock: number;
  unit: string;
}

// Composite types dùng cho UI
export interface ServiceItem extends CatalogItem {
  service_id?: string; // id trong bảng services
  duration_minutes?: number;
  sales_commission_rate?: number;
  performance_commission_rate?: number;
}

export interface ProductItem extends CatalogItem {
  product_id?: string; // id trong bảng products
  cost_price?: number;
  selling_price?: number;
  stock_quantity?: number;
  minimum_stock?: number;
  unit?: string;
}

// Bảng categories
export interface Category {
  id: string;
  organization_id: string;
  branch_id: string;
  name: string;
  type: CategoryType;
  status: CategoryStatus;
}

// Bảng packages & package_items
export interface PackageItem {
  id?: string;
  package_id?: string;
  service_id: string; // Tham chiếu đến services.id
  quantity: number;
  price_override?: number | null;
  // Thông tin hiển thị JOIN
  service_name?: string;
  service_code?: string;
}

export interface Package {
  id: string;
  organization_id: string;
  branch_id?: string | null;
  code: string;
  name: string;
  type: "SERVICE" | "PRODUCT";
  description?: string | null;
  price: number;
  validity_days: number;
  is_active: boolean;
  package_items?: PackageItem[];
}
