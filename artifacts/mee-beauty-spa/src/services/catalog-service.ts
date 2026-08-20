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
    .order("created_at", { ascending: false });

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
    return {
      ...item,
      service_id: sDetail?.id,
      duration_minutes: sDetail?.duration_minutes ?? 0,
      sales_commission_rate: sDetail?.sales_commission_rate ?? 0,
      performance_commission_rate: sDetail?.performance_commission_rate ?? 0,
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
  sales_commission_rate?: number;
  performance_commission_rate?: number;
}): Promise<ServiceItem> {
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
    })
    .select()
    .single();

  if (itemErr) throw itemErr;

  const { data: sDetail, error: sErr } = await supabase
    .from("services")
    .insert({
      catalog_item_id: catItem.id,
      duration_minutes: payload.duration_minutes || 0,
      sales_commission_rate: payload.sales_commission_rate || 0,
      performance_commission_rate: payload.performance_commission_rate || 0,
    })
    .select()
    .single();

  if (sErr) throw sErr;

  return {
    ...catItem,
    service_id: sDetail.id,
    duration_minutes: sDetail.duration_minutes,
    sales_commission_rate: sDetail.sales_commission_rate,
    performance_commission_rate: sDetail.performance_commission_rate,
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
    sales_commission_rate?: number;
    performance_commission_rate?: number;
  },
): Promise<void> {
  const { error: itemErr } = await supabase
    .from("catalog_items")
    .update({
      code: payload.code,
      name: payload.name,
      category: payload.category || null,
      description: payload.description || null,
      price: payload.price,
    })
    .eq("id", catalogItemId)
    .eq("organization_id", DEFAULT_ORG_ID);

  if (itemErr) throw itemErr;

  const { error: sErr } = await supabase
    .from("services")
    .update({
      duration_minutes: payload.duration_minutes || 0,
      sales_commission_rate: payload.sales_commission_rate || 0,
      performance_commission_rate: payload.performance_commission_rate || 0,
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

// ==================== PRODUCTS ====================

export async function fetchProducts(): Promise<ProductItem[]> {
  const { data: items, error: itemErr } = await supabase
    .from("catalog_items")
    .select("*")
    .eq("organization_id", DEFAULT_ORG_ID)
    .eq("item_type", "PRODUCT")
    .order("created_at", { ascending: false });

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
    return {
      ...item,
      product_id: pDetail?.id,
      cost_price: pDetail?.cost_price ?? 0,
      selling_price: pDetail?.selling_price ?? item.price,
      stock_quantity: pDetail?.stock_quantity ?? 0,
      minimum_stock: pDetail?.minimum_stock ?? 0,
      unit: pDetail?.unit ?? "cái",
    };
  });
}

export async function createProduct(payload: {
  code: string;
  name: string;
  category?: string;
  description?: string;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  minimum_stock: number;
  unit: string;
}): Promise<ProductItem> {
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
    })
    .select()
    .single();

  if (itemErr) throw itemErr;

  const { data: pDetail, error: pErr } = await supabase
    .from("products")
    .insert({
      catalog_item_id: catItem.id,
      cost_price: payload.cost_price || 0,
      selling_price: payload.selling_price || 0,
      stock_quantity: payload.stock_quantity || 0,
      minimum_stock: payload.minimum_stock || 0,
      unit: payload.unit || "cái",
    })
    .select()
    .single();

  if (pErr) throw pErr;

  return {
    ...catItem,
    product_id: pDetail.id,
    cost_price: pDetail.cost_price,
    selling_price: pDetail.selling_price,
    stock_quantity: pDetail.stock_quantity,
    minimum_stock: pDetail.minimum_stock,
    unit: pDetail.unit,
  };
}

export async function updateProduct(
  catalogItemId: string,
  payload: {
    code: string;
    name: string;
    category?: string;
    description?: string;
    cost_price: number;
    selling_price: number;
    stock_quantity: number;
    minimum_stock: number;
    unit: string;
  },
): Promise<void> {
  const { error: itemErr } = await supabase
    .from("catalog_items")
    .update({
      code: payload.code,
      name: payload.name,
      category: payload.category || null,
      description: payload.description || null,
      price: payload.selling_price,
    })
    .eq("id", catalogItemId)
    .eq("organization_id", DEFAULT_ORG_ID);

  if (itemErr) throw itemErr;

  const { error: pErr } = await supabase
    .from("products")
    .update({
      cost_price: payload.cost_price || 0,
      selling_price: payload.selling_price || 0,
      stock_quantity: payload.stock_quantity || 0,
      minimum_stock: payload.minimum_stock || 0,
      unit: payload.unit || "cái",
    })
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

// ==================== SHARED CATALOG ITEM ACTIONS ====================

export async function toggleCatalogItemStatus(
  id: string,
  currentStatus: CatalogStatus,
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
    .select("*")
    .in("package_id", pkgIds);

  if (itemErr) throw itemErr;

  const serviceIds = (items || []).map((i) => i.service_id).filter(Boolean);
  let serviceNameMap = new Map<string, { name: string; code: string }>();

  if (serviceIds.length > 0) {
    const { data: sDetails } = await supabase
      .from("services")
      .select("id, catalog_item_id")
      .in("id", serviceIds);

    if (sDetails && sDetails.length > 0) {
      const cIds = sDetails.map((s) => s.catalog_item_id);
      const { data: cItems } = await supabase
        .from("catalog_items")
        .select("id, name, code")
        .in("id", cIds);

      const cMap = new Map((cItems || []).map((c) => [c.id, c]));
      sDetails.forEach((s) => {
        const c = cMap.get(s.catalog_item_id);
        if (c) {
          serviceNameMap.set(s.id, { name: c.name, code: c.code });
        }
      });
    }
  }

  const itemsByPkg = new Map<string, PackageItem[]>();
  (items || []).forEach((it) => {
    const list = itemsByPkg.get(it.package_id) || [];
    const info = serviceNameMap.get(it.service_id);
    list.push({
      ...it,
      service_name: info?.name || "Dịch vụ",
      service_code: info?.code || "",
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
  },
  items: Array<{
    service_id: string;
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
    })
    .select()
    .single();

  if (pkgErr) throw pkgErr;

  if (items.length > 0) {
    const packageItemsToInsert = items.map((it) => ({
      package_id: newPkg.id,
      service_id: it.service_id,
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
  },
  items: Array<{
    service_id: string;
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
    })
    .eq("id", packageId)
    .eq("organization_id", DEFAULT_ORG_ID);

  if (pkgErr) throw pkgErr;

  await supabase.from("package_items").delete().eq("package_id", packageId);

  if (items.length > 0) {
    const packageItemsToInsert = items.map((it) => ({
      package_id: packageId,
      service_id: it.service_id,
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
  toggleCatalogItemStatus,
  fetchPackages,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageStatus,
};
