// src/services/catalog-service.ts
import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";
import {
  ServiceItem,
  ProductItem,
  Category,
  Package,
  PackageItem,
  CategoryType,
  CatalogStatus,
  CategoryStatus,
  CommissionType,
  ProductType,
  InventoryTransactionType,
  InventoryTransaction,
} from "../types/catalog";

// ==================== CATEGORIES ====================

export async function fetchCategories(
  type?: CategoryType,
): Promise<Category[]> {
  let query = supabase
    .from("categories")
    .select("*")
    .eq("organization_id", DEFAULT_ORG_ID);

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query.order("name", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createCategory(payload: {
  name: string;
  type: CategoryType;
  status: CategoryStatus;
}): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .insert({
      organization_id: DEFAULT_ORG_ID,
      branch_id: DEFAULT_BRANCH_ID,
      name: payload.name.trim(),
      type: payload.type,
      status: payload.status,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(
  id: string,
  payload: { name: string; type: CategoryType; status: CategoryStatus },
): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .update({
      name: payload.name.trim(),
      type: payload.type,
      status: payload.status,
    })
    .eq("id", id)
    .eq("organization_id", DEFAULT_ORG_ID)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(
  id: string,
  categoryName: string,
): Promise<void> {
  const { count, error: checkErr } = await supabase
    .from("catalog_items")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", DEFAULT_ORG_ID)
    .eq("category", categoryName);

  if (checkErr) throw checkErr;
  if (count && count > 0) {
    throw new Error(
      "Danh mục đang được sử dụng bởi dịch vụ/sản phẩm, không thể xóa.",
    );
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("organization_id", DEFAULT_ORG_ID);

  if (error) throw error;
}

// ==================== SERVICES ====================

export async function fetchServices(): Promise<ServiceItem[]> {
  const { data: items, error: itemErr } = await supabase
    .from("catalog_items")
    .select("*")
    .eq("organization_id", DEFAULT_ORG_ID)
    .eq("item_type", "SERVICE")
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (itemErr) throw itemErr;
  if (!items || items.length === 0) return [];

  const catalogIds = items.map((i) => i.id);
  const { data: details, error: detailErr } = await supabase
    .from("services")
    .select("*")
    .in("catalog_item_id", catalogIds);

  if (detailErr) throw detailErr;

  const detailMap = new Map((details || []).map((d) => [d.catalog_item_id, d]));

  return items.map((item) => {
    const sDetail = detailMap.get(item.id);
    const salesType: CommissionType =
      sDetail?.sales_commission_type || "PERCENT";
    const salesVal = Number(
      sDetail?.sales_commission_value ?? sDetail?.sales_commission_rate ?? 0,
    );

    const perfType: CommissionType =
      sDetail?.performance_commission_type || "PERCENT";
    const perfVal = Number(
      sDetail?.performance_commission_value ??
        sDetail?.performance_commission_rate ??
        0,
    );

    return {
      ...item,
      service_id: sDetail?.id,
      duration_minutes: sDetail?.duration_minutes ?? 0,
      sales_commission_type: salesType,
      sales_commission_value: salesVal,
      sales_commission_rate: salesType === "PERCENT" ? salesVal : 0,
      performance_commission_type: perfType,
      performance_commission_value: perfVal,
      performance_commission_rate: perfType === "PERCENT" ? perfVal : 0,
      loyalty_points: item.loyalty_points ?? 0,
    };
  });
}

export async function createService(payload: {
  code: string;
  name: string;
  category?: string;
  description?: string;
  price: number;
  duration_minutes: number;
  sales_commission_type?: CommissionType;
  sales_commission_value?: number;
  performance_commission_type?: CommissionType;
  performance_commission_value?: number;
  loyalty_points?: number;
  sort_order?: number;
}): Promise<ServiceItem> {
  const salesType = payload.sales_commission_type || "PERCENT";
  const salesVal = Math.max(0, payload.sales_commission_value || 0);
  const legacySalesRate = salesType === "PERCENT" ? salesVal : 0;

  const perfType = payload.performance_commission_type || "PERCENT";
  const perfVal = Math.max(0, payload.performance_commission_value || 0);
  const legacyPerfRate = perfType === "PERCENT" ? perfVal : 0;

  const { data: catItem, error: itemErr } = await supabase
    .from("catalog_items")
    .insert({
      organization_id: DEFAULT_ORG_ID,
      branch_id: DEFAULT_BRANCH_ID,
      item_type: "SERVICE",
      code: payload.code,
      name: payload.name,
      category: payload.category || null,
      description: payload.description || null,
      price: payload.price,
      status: "ACTIVE",
      loyalty_points: payload.loyalty_points ?? 0,
      sort_order: payload.sort_order ?? 0,
    })
    .select()
    .single();

  if (itemErr) throw itemErr;

  const { data: sDetail, error: sErr } = await supabase
    .from("services")
    .insert({
      catalog_item_id: catItem.id,
      duration_minutes: payload.duration_minutes || 0,
      sales_commission_type: salesType,
      sales_commission_value: salesVal,
      sales_commission_rate: legacySalesRate,
      performance_commission_type: perfType,
      performance_commission_value: perfVal,
      performance_commission_rate: legacyPerfRate,
    })
    .select()
    .single();

  if (sErr) throw sErr;

  return {
    ...catItem,
    service_id: sDetail.id,
    duration_minutes: sDetail.duration_minutes,
    sales_commission_type: sDetail.sales_commission_type,
    sales_commission_value: Number(sDetail.sales_commission_value),
    sales_commission_rate: Number(sDetail.sales_commission_rate),
    performance_commission_type: sDetail.performance_commission_type,
    performance_commission_value: Number(sDetail.performance_commission_value),
    performance_commission_rate: Number(sDetail.performance_commission_rate),
  };
}

export async function updateService(
  catalogItemId: string,
  payload: {
    code: string;
    name: string;
    category?: string;
    description?: string;
    price: number;
    duration_minutes: number;
    sales_commission_type?: CommissionType;
    sales_commission_value?: number;
    performance_commission_type?: CommissionType;
    performance_commission_value?: number;
    loyalty_points?: number;
    sort_order?: number;
  },
): Promise<void> {
  const salesType = payload.sales_commission_type || "PERCENT";
  const salesVal = Math.max(0, payload.sales_commission_value || 0);
  const legacySalesRate = salesType === "PERCENT" ? salesVal : 0;

  const perfType = payload.performance_commission_type || "PERCENT";
  const perfVal = Math.max(0, payload.performance_commission_value || 0);
  const legacyPerfRate = perfType === "PERCENT" ? perfVal : 0;

  const { error: itemErr } = await supabase
    .from("catalog_items")
    .update({
      code: payload.code,
      name: payload.name,
      category: payload.category || null,
      description: payload.description || null,
      price: payload.price,
      loyalty_points: payload.loyalty_points ?? 0,
      sort_order: payload.sort_order ?? 0,
    })
    .eq("id", catalogItemId)
    .eq("organization_id", DEFAULT_ORG_ID);

  if (itemErr) throw itemErr;

  const { error: sErr } = await supabase
    .from("services")
    .update({
      duration_minutes: payload.duration_minutes || 0,
      sales_commission_type: salesType,
      sales_commission_value: salesVal,
      sales_commission_rate: legacySalesRate,
      performance_commission_type: perfType,
      performance_commission_value: perfVal,
      performance_commission_rate: legacyPerfRate,
    })
    .eq("catalog_item_id", catalogItemId);

  if (sErr) throw sErr;
}

export async function deleteService(catalogItemId: string): Promise<void> {
  const { data: sData, error: sFetchErr } = await supabase
    .from("services")
    .select("id")
    .eq("catalog_item_id", catalogItemId)
    .maybeSingle();

  if (sFetchErr) throw sFetchErr;

  if (sData?.id) {
    const { count, error: pkgCheckErr } = await supabase
      .from("package_items")
      .select("id", { count: "exact", head: true })
      .eq("service_id", sData.id);

    if (pkgCheckErr) throw pkgCheckErr;

    if (count && count > 0) {
      throw new Error("Dịch vụ đang nằm trong gói, không thể xóa.");
    }

    const { error: sDelErr } = await supabase
      .from("services")
      .delete()
      .eq("id", sData.id);
    if (sDelErr) throw sDelErr;
  }

  const { error: catDelErr } = await supabase
    .from("catalog_items")
    .delete()
    .eq("id", catalogItemId)
    .eq("organization_id", DEFAULT_ORG_ID);

  if (catDelErr) throw catDelErr;
}

// ==================== PRODUCTS & INVENTORY ====================

export async function fetchProducts(): Promise<ProductItem[]> {
  const { data: items, error: itemErr } = await supabase
    .from("catalog_items")
    .select("*")
    .eq("organization_id", DEFAULT_ORG_ID)
    .eq("item_type", "PRODUCT")
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (itemErr) throw itemErr;
  if (!items || items.length === 0) return [];

  const catalogIds = items.map((i) => i.id);
  const { data: details, error: detailErr } = await supabase
    .from("products")
    .select("*")
    .in("catalog_item_id", catalogIds);

  if (detailErr) throw detailErr;

  const detailMap = new Map((details || []).map((d) => [d.catalog_item_id, d]));

  return items.map((item) => {
    const pDetail = detailMap.get(item.id);
    const salesType: CommissionType =
      pDetail?.sales_commission_type || "PERCENT";
    const salesVal = Number(pDetail?.sales_commission_value ?? 0);

    return {
      ...item,
      product_id: pDetail?.id || "",
      product_type: (pDetail?.product_type as ProductType) || "RETAIL",
      cost_price: pDetail?.cost_price ?? 0,
      selling_price: pDetail?.selling_price ?? item.price,
      stock_quantity: pDetail?.stock_quantity ?? 0,
      minimum_stock: pDetail?.minimum_stock ?? 0,
      unit: pDetail?.unit ?? "cái",
      sales_commission_type: salesType,
      sales_commission_value: salesVal,
      loyalty_points: item.loyalty_points ?? 0,
    };
  });
}

export async function createProduct(payload: {
  code: string;
  name: string;
  category?: string;
  description?: string;
  product_type?: ProductType;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  minimum_stock: number;
  unit: string;
  sales_commission_type?: CommissionType;
  sales_commission_value?: number;
  loyalty_points?: number;
  sort_order?: number;
}): Promise<ProductItem> {
  const salesType = payload.sales_commission_type || "PERCENT";
  const salesVal = Math.max(0, payload.sales_commission_value || 0);
  const pType: ProductType = payload.product_type || "RETAIL";

  const { data: catItem, error: itemErr } = await supabase
    .from("catalog_items")
    .insert({
      organization_id: DEFAULT_ORG_ID,
      branch_id: DEFAULT_BRANCH_ID,
      item_type: "PRODUCT",
      code: payload.code,
      name: payload.name,
      category: payload.category || null,
      description: payload.description || null,
      price: payload.selling_price,
      status: "ACTIVE",
      loyalty_points: payload.loyalty_points ?? 0,
      sort_order: payload.sort_order ?? 0,
    })
    .select()
    .single();

  if (itemErr) throw itemErr;

  const { data: pDetail, error: pErr } = await supabase
    .from("products")
    .insert({
      catalog_item_id: catItem.id,
      product_type: pType,
      cost_price: payload.cost_price || 0,
      selling_price: payload.selling_price || 0,
      stock_quantity: payload.stock_quantity || 0,
      minimum_stock: payload.minimum_stock || 0,
      unit: payload.unit || "cái",
      sales_commission_type: salesType,
      sales_commission_value: salesVal,
    })
    .select()
    .single();

  if (pErr) throw pErr;

  return {
    ...catItem,
    product_id: pDetail.id,
    product_type: pDetail.product_type,
    cost_price: pDetail.cost_price,
    selling_price: pDetail.selling_price,
    stock_quantity: pDetail.stock_quantity,
    minimum_stock: pDetail.minimum_stock,
    unit: pDetail.unit,
    sales_commission_type: pDetail.sales_commission_type,
    sales_commission_value: Number(pDetail.sales_commission_value),
  };
}

export async function updateProduct(
  catalogItemId: string,
  payload: {
    code: string;
    name: string;
    category?: string;
    description?: string;
    product_type?: ProductType;
    cost_price: number;
    selling_price: number;
    stock_quantity: number;
    minimum_stock: number;
    unit: string;
    sales_commission_type?: CommissionType;
    sales_commission_value?: number;
    loyalty_points?: number;
    sort_order?: number;
  },
): Promise<void> {
  const salesType = payload.sales_commission_type || "PERCENT";
  const salesVal = Math.max(0, payload.sales_commission_value || 0);

  const { error: itemErr } = await supabase
    .from("catalog_items")
    .update({
      code: payload.code,
      name: payload.name,
      category: payload.category || null,
      description: payload.description || null,
      price: payload.selling_price,
      loyalty_points: payload.loyalty_points ?? 0,
      sort_order: payload.sort_order ?? 0,
    })
    .eq("id", catalogItemId)
    .eq("organization_id", DEFAULT_ORG_ID);

  if (itemErr) throw itemErr;

  const updateData: Record<string, any> = {
    cost_price: payload.cost_price || 0,
    selling_price: payload.selling_price || 0,
    stock_quantity: payload.stock_quantity || 0,
    minimum_stock: payload.minimum_stock || 0,
    unit: payload.unit || "cái",
    sales_commission_type: salesType,
    sales_commission_value: salesVal,
  };

  if (payload.product_type) {
    updateData.product_type = payload.product_type;
  }

  const { error: pErr } = await supabase
    .from("products")
    .update(updateData)
    .eq("catalog_item_id", catalogItemId);

  if (pErr) throw pErr;
}

export async function deleteProduct(catalogItemId: string): Promise<void> {
  const { error: pErr } = await supabase
    .from("products")
    .delete()
    .eq("catalog_item_id", catalogItemId);

  if (pErr) throw pErr;

  const { error: itemErr } = await supabase
    .from("catalog_items")
    .delete()
    .eq("id", catalogItemId)
    .eq("organization_id", DEFAULT_ORG_ID);

  if (itemErr) throw itemErr;
}

// ==================== INVENTORY TRANSACTIONS ====================

export async function processInventoryTransaction(input: {
  product_id: string;
  type: InventoryTransactionType;
  quantity: number;
  note?: string;
  created_by?: string | null;
}): Promise<void> {
  if (input.quantity <= 0) {
    throw new Error("Số lượng giao dịch phải lớn hơn 0");
  }

  const { error } = await supabase.rpc("process_inventory_transaction", {
    p_product_id: input.product_id,
    p_transaction_type: input.type,
    p_quantity: input.quantity,
    p_note: input.note?.trim() || null,
    p_created_by: input.created_by || null,
  });

  if (error) {
    throw new Error(error.message || "Lỗi xử lý giao dịch kho");
  }
}

export async function fetchInventoryHistory(
  productId: string,
): Promise<InventoryTransaction[]> {
  try {
    const { data, error } = await supabase.rpc('get_inventory_history', {
      p_product_id: productId,
    });

    if (error) {
      console.error('❌ Lỗi RPC get_inventory_history:', error);
      const { data: direct, error: directErr } = await supabase
        .from('inventory_transactions')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      if (directErr) throw directErr;
      return direct || [];
    }

    return data || [];
  } catch (err) {
    console.error('❌ fetchInventoryHistory exception:', err);
    throw new Error('Không thể tải lịch sử tồn kho');
  }
}

// ==================== SHARED CATALOG ITEM ACTIONS ====================

export async function toggleCatalogItemStatus(
  id: string,
  currentStatus: CatalogStatus,
  _type?: "service" | "product",
): Promise<CatalogStatus> {
  const newStatus: CatalogStatus =
    currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  const { error } = await supabase
    .from("catalog_items")
    .update({ status: newStatus })
    .eq("id", id)
    .eq("organization_id", DEFAULT_ORG_ID);

  if (error) throw error;
  return newStatus;
}

// ==================== PACKAGES ====================

export async function fetchPackages(): Promise<Package[]> {
  const { data: pkgs, error: pkgErr } = await supabase
    .from("packages")
    .select("*")
    .eq("organization_id", DEFAULT_ORG_ID)
    .order("created_at", { ascending: false });

  if (pkgErr) throw pkgErr;
  if (!pkgs || pkgs.length === 0) return [];

  const pkgIds = pkgs.map((p) => p.id);
  const { data: items, error: itemErr } = await supabase
    .from("package_items")
    .select(`
      *,
      service:service_id (
        id,
        catalog_item_id,
        catalog_item:catalog_items ( name, code )
      ),
      product:product_id (
        id,
        catalog_item_id,
        catalog_item:catalog_items ( name, code )
      )
    `)
    .in("package_id", pkgIds);

  if (itemErr) throw itemErr;

  const itemsByPkg = new Map<string, PackageItem[]>();
  (items || []).forEach((it) => {
    const list = itemsByPkg.get(it.package_id) || [];
    let serviceName = '', serviceCode = '';
    let productName = '', productCode = '';

    if (it.service) {
      serviceName = it.service.catalog_item?.name || '';
      serviceCode = it.service.catalog_item?.code || '';
    }
    if (it.product) {
      productName = it.product.catalog_item?.name || '';
      productCode = it.product.catalog_item?.code || '';
    }

    list.push({
      ...it,
      service_name: serviceName,
      service_code: serviceCode,
      product_name: productName,
      product_code: productCode,
    });
    itemsByPkg.set(it.package_id, list);
  });

  return pkgs.map((p) => ({
    ...p,
    package_items: itemsByPkg.get(p.id) || [],
  }));
}

export async function createPackage(
  pkgData: {
    code: string;
    name: string;
    price: number;
    validity_days: number;
    description?: string;
    is_active?: boolean;
    sales_commission_type?: CommissionType;
    sales_commission_value?: number;
  },
  items: Array<{
    service_id?: string;
    product_id?: string;
    item_type: 'SERVICE' | 'PRODUCT';
    quantity: number;
    price_override?: number;
  }>,
): Promise<Package> {
  const { data: newPkg, error: pkgErr } = await supabase
    .from("packages")
    .insert({
      organization_id: DEFAULT_ORG_ID,
      branch_id: DEFAULT_BRANCH_ID,
      code: pkgData.code,
      name: pkgData.name,
      type: "SERVICE",
      price: pkgData.price,
      validity_days: pkgData.validity_days,
      description: pkgData.description || null,
      is_active: pkgData.is_active ?? true,
      sales_commission_type: pkgData.sales_commission_type || 'PERCENT',
      sales_commission_value: pkgData.sales_commission_value || 0,
    })
    .select()
    .single();

  if (pkgErr) throw pkgErr;

  if (items.length > 0) {
    const packageItemsToInsert = items.map((it) => ({
      package_id: newPkg.id,
      service_id: it.item_type === 'SERVICE' ? it.service_id : null,
      product_id: it.item_type === 'PRODUCT' ? it.product_id : null,
      item_type: it.item_type,
      quantity: it.quantity,
      price_override: it.price_override || null,
    }));

    const { error: itemErr } = await supabase
      .from("package_items")
      .insert(packageItemsToInsert);

    if (itemErr) throw itemErr;
  }

  return newPkg;
}

export async function updatePackage(
  packageId: string,
  pkgData: {
    code: string;
    name: string;
    price: number;
    validity_days: number;
    description?: string;
    is_active?: boolean;
    sales_commission_type?: CommissionType;
    sales_commission_value?: number;
  },
  items: Array<{
    service_id?: string;
    product_id?: string;
    item_type: 'SERVICE' | 'PRODUCT';
    quantity: number;
    price_override?: number;
  }>,
): Promise<void> {
  const { error: pkgErr } = await supabase
    .from("packages")
    .update({
      code: pkgData.code,
      name: pkgData.name,
      price: pkgData.price,
      validity_days: pkgData.validity_days,
      description: pkgData.description || null,
      is_active: pkgData.is_active,
      sales_commission_type: pkgData.sales_commission_type || 'PERCENT',
      sales_commission_value: pkgData.sales_commission_value || 0,
    })
    .eq("id", packageId)
    .eq("organization_id", DEFAULT_ORG_ID);

  if (pkgErr) throw pkgErr;

  await supabase.from("package_items").delete().eq("package_id", packageId);

  if (items.length > 0) {
    const packageItemsToInsert = items.map((it) => ({
      package_id: packageId,
      service_id: it.item_type === 'SERVICE' ? it.service_id : null,
      product_id: it.item_type === 'PRODUCT' ? it.product_id : null,
      item_type: it.item_type,
      quantity: it.quantity,
      price_override: it.price_override || null,
    }));

    const { error: itemErr } = await supabase
      .from("package_items")
      .insert(packageItemsToInsert);

    if (itemErr) throw itemErr;
  }
}

export async function deletePackage(packageId: string): Promise<void> {
  await supabase.from("package_items").delete().eq("package_id", packageId);
  const { error } = await supabase
    .from("packages")
    .delete()
    .eq("id", packageId)
    .eq("organization_id", DEFAULT_ORG_ID);

  if (error) throw error;
}

export async function togglePackageStatus(
  packageId: string,
  currentIsActive: boolean,
): Promise<boolean> {
  const nextActive = !currentIsActive;
  const { error } = await supabase
    .from("packages")
    .update({ is_active: nextActive })
    .eq("id", packageId)
    .eq("organization_id", DEFAULT_ORG_ID);

  if (error) throw error;
  return nextActive;
}

export const catalogService = {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchServices,
  createService,
  updateService,
  deleteService,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  processInventoryTransaction,
  fetchInventoryHistory,
  toggleCatalogItemStatus,
  fetchPackages,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageStatus,
};