export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'QR' | 'DEBT';
export type InvoiceStatus = 'DRAFT' | 'PARTIALLY_PAID' | 'PAID' | 'VOID';
export type CatalogItemType = 'SERVICE' | 'PRODUCT';
export type ProductType = 'CONSUMABLE' | 'RETAIL';
export type CommissionType = 'PERCENT' | 'FIXED';

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  avatar_url?: string;
}

export interface Staff {
  id: string;
  full_name: string;
  role?: string;
  avatar_url?: string;
}

export interface CatalogServiceItem {
  id: string;
  name: string;
  price: number;
  duration_minutes?: number;
  category_id?: string;
  is_active: boolean;
  sales_commission_type?: CommissionType;
  sales_commission_value?: number;
  performance_commission_type?: CommissionType;
  performance_commission_value?: number;
}

export interface CatalogProductItem {
  id: string; // product_id
  catalog_item_id: string;
  name: string;
  selling_price: number;
  stock_quantity: number;
  minimum_stock: number;
  unit?: string;
  product_type: ProductType;
  is_active: boolean;
  sales_commission_type?: CommissionType;
  sales_commission_value?: number;
}

export interface PackageItemDetail {
  package_id: string;
  service_id: string;
  service_name?: string;
  quantity: number;
  price_override?: number;
  item_type?: string;
  product_id?: string;
}

export interface CatalogPackageItem {
  id: string; // package_id
  name: string;
  price: number;
  validity_days?: number;
  description?: string;
  is_active: boolean;
  sales_commission_type?: CommissionType;
  sales_commission_value?: number;
  items: PackageItemDetail[];
}

export type POSCartItemType = 'SERVICE' | 'PRODUCT' | 'PACKAGE';

export interface CartItem {
  cart_item_id: string;
  item_type: POSCartItemType;
  catalog_item_id?: string;
  package_id?: string;
  actual_service_id?: string;
  product_id?: string;
  name: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_amount: number;
  seller_staff_id?: string;
  performing_staff_id?: string;
  stock_quantity?: number;
  unit?: string;
  product_type?: ProductType;
  package_items?: PackageItemDetail[];
}

export interface CreateInvoicePayload {
  organization_id: string;
  branch_id: string;
  customer_id?: string | null;
  seller_staff_id?: string | null;
  status: InvoiceStatus;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  notes?: string;
  items: {
    catalog_item_id?: string | null;
    package_id?: string | null;
    actual_service_id?: string | null;
    seller_staff_id?: string | null;
    performing_staff_id?: string | null;
    description: string;
    quantity: number;
    unit_price: number;
    discount_amount: number;
    total_amount: number;
  }[];
}

export interface CheckoutResult {
  success: boolean;
  invoice_id?: string;
  error?: string;
}