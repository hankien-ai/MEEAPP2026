export type CatalogItemType = "SERVICE" | "PRODUCT";
export type CatalogStatus = "ACTIVE" | "INACTIVE";
export type CategoryType = "service" | "product";
export type CategoryStatus = "active" | "inactive";

// Kiểu hoa hồng: % hoặc Tiền cố định
export type CommissionType = "PERCENT" | "FIXED";

// Loại sản phẩm và loại giao dịch tồn kho
export type ProductType = "CONSUMABLE" | "RETAIL";
export type InventoryTransactionType = "IN" | "OUT" | "ADJUSTMENT";

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
  sales_commission_type: CommissionType;
  sales_commission_value: number;
  performance_commission_type: CommissionType;
  performance_commission_value: number;
}

// Bảng products mở rộng
export interface ProductDetail {
  id: string;
  catalog_item_id: string;
  product_type: ProductType;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  minimum_stock: number;
  unit: string;
  sales_commission_type: CommissionType;
  sales_commission_value: number;
}

// Composite types dùng cho UI
export interface ServiceItem extends CatalogItem {
  service_id?: string;
  duration_minutes?: number;
  sales_commission_rate?: number;
  performance_commission_rate?: number;
  sales_commission_type?: CommissionType;
  sales_commission_value?: number;
  performance_commission_type?: CommissionType;
  performance_commission_value?: number;
}

export interface ProductItem extends CatalogItem {
  product_id: string;
  product_type: ProductType;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  minimum_stock: number;
  unit: string;
  sales_commission_type?: CommissionType;
  sales_commission_value?: number;
}

// Lịch sử biến động tồn kho
export interface InventoryTransaction {
  id: string;
  product_id: string;
  transaction_type: InventoryTransactionType;
  quantity: number;
  stock_before: number;
  stock_after: number;
  note?: string;
  created_at: string;
  created_by?: string;
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

// Bảng packages & package_items - ĐÃ CẬP NHẬT
export interface PackageItem {
  id?: string;
  package_id?: string;
  service_id?: string;          // Có thể null nếu là product
  product_id?: string;          // MỚI: ID sản phẩm
  item_type?: 'SERVICE' | 'PRODUCT'; // MỚI: Loại item
  quantity: number;
  price_override?: number | null;
  service_name?: string;
  service_code?: string;
  product_name?: string;        // MỚI: Tên sản phẩm để hiển thị
  product_code?: string;        // MỚI: Mã sản phẩm để hiển thị
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
  sales_commission_type?: CommissionType;  // MỚI
  sales_commission_value?: number;         // MỚI
  package_items?: PackageItem[];
}