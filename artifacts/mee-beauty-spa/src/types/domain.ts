export type CatalogItemType = "SERVICE" | "PRODUCT";
export type ItemStatus = "active" | "inactive";

export interface CatalogItemDB {
  id: string;
  organization_id: string;
  branch_id: string;
  item_type: CatalogItemType;
  name: string;
  category: string;
  description: string | null;
  price: number;
  status: ItemStatus;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceDB {
  id: string;
  catalog_item_id: string;
  duration_minutes: number;
  sales_commission_rate: number;
  performance_commission_rate: number;
  created_at?: string;
}

export interface ProductDB {
  id: string;
  catalog_item_id: string;
  selling_price: number;
  stock_quantity: number;
  minimum_stock: number;
  unit: string;
  created_at?: string;
}

export interface ServiceItemDomain extends CatalogItemDB {
  item_type: "SERVICE";
  service_details: Omit<ServiceDB, "id" | "catalog_item_id">;
}

export interface ProductItemDomain extends CatalogItemDB {
  item_type: "PRODUCT";
  product_details: Omit<ProductDB, "id" | "catalog_item_id">;
}

export type CatalogDomainItem = ServiceItemDomain | ProductItemDomain;

export interface CreateServiceInput {
  name: string;
  category: string;
  description?: string;
  price: number;
  status?: ItemStatus;
  duration_minutes: number;
  sales_commission_rate?: number;
  performance_commission_rate?: number;
}

export interface UpdateServiceInput extends Partial<CreateServiceInput> {}

export interface CreateProductInput {
  name: string;
  category: string;
  description?: string;
  selling_price: number;
  status?: ItemStatus;
  stock_quantity: number;
  minimum_stock: number;
  unit: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}
