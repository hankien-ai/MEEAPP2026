import { supabase } from "./supabase";
import {
  ServiceItemDomain,
  ProductItemDomain,
  CreateServiceInput,
  UpdateServiceInput,
  CreateProductInput,
  UpdateProductInput,
} from "../types/domain";

export const CURRENT_ORG_ID = "4fc2ef26-2fa6-43c1-9e7f-7362ac747a26";
export const CURRENT_BRANCH_ID = "677f6f26-77d1-4a26-ab13-7c2f5a2994f9";

// ==========================================
// SERVICE OPERATIONS
// ==========================================

export async function fetchServices(
  searchQuery?: string,
): Promise<ServiceItemDomain[]> {
  let query = supabase
    .from("catalog_items")
    .select(
      `
      *,
      services!inner (
        duration_minutes,
        sales_commission_rate,
        performance_commission_rate
      )
    `,
    )
    .eq("organization_id", CURRENT_ORG_ID)
    .eq("branch_id", CURRENT_BRANCH_ID)
    .eq("item_type", "SERVICE")
    .order("created_at", { ascending: false });

  if (searchQuery && searchQuery.trim() !== "") {
    query = query.ilike("name", `%${searchQuery.trim()}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Lỗi tải danh sách dịch vụ: ${error.message}`);

  return (data || []).map((item: any) => ({
    id: item.id,
    organization_id: item.organization_id,
    branch_id: item.branch_id,
    item_type: "SERVICE",
    name: item.name,
    category: item.category,
    description: item.description,
    price: item.price,
    status: item.status,
    created_at: item.created_at,
    updated_at: item.updated_at,
    service_details: {
      duration_minutes: item.services[0]?.duration_minutes ?? 0,
      sales_commission_rate: item.services[0]?.sales_commission_rate ?? 0,
      performance_commission_rate:
        item.services[0]?.performance_commission_rate ?? 0,
    },
  }));
}

export async function createService(
  input: CreateServiceInput,
): Promise<ServiceItemDomain> {
  const { data: catalogItem, error: catalogError } = await supabase
    .from("catalog_items")
    .insert({
      organization_id: CURRENT_ORG_ID,
      branch_id: CURRENT_BRANCH_ID,
      item_type: "SERVICE",
      name: input.name,
      category: input.category,
      description: input.description || null,
      price: input.price,
      status: input.status || "active",
    })
    .select()
    .single();

  if (catalogError || !catalogItem) {
    throw new Error(`Lỗi tạo catalog item dịch vụ: ${catalogError?.message}`);
  }

  const { error: serviceError } = await supabase.from("services").insert({
    catalog_item_id: catalogItem.id,
    duration_minutes: input.duration_minutes,
    sales_commission_rate: input.sales_commission_rate || 0,
    performance_commission_rate: input.performance_commission_rate || 0,
  });

  if (serviceError) {
    await supabase.from("catalog_items").delete().eq("id", catalogItem.id);
    throw new Error(`Lỗi tạo chi tiết dịch vụ: ${serviceError.message}`);
  }

  return {
    ...catalogItem,
    item_type: "SERVICE",
    service_details: {
      duration_minutes: input.duration_minutes,
      sales_commission_rate: input.sales_commission_rate || 0,
      performance_commission_rate: input.performance_commission_rate || 0,
    },
  };
}

export async function updateService(
  catalogItemId: string,
  input: UpdateServiceInput,
): Promise<void> {
  const catalogUpdates: Record<string, any> = {};
  if (input.name !== undefined) catalogUpdates.name = input.name;
  if (input.category !== undefined) catalogUpdates.category = input.category;
  if (input.description !== undefined)
    catalogUpdates.description = input.description;
  if (input.price !== undefined) catalogUpdates.price = input.price;
  if (input.status !== undefined) catalogUpdates.status = input.status;

  if (Object.keys(catalogUpdates).length > 0) {
    const { error: catalogError } = await supabase
      .from("catalog_items")
      .update(catalogUpdates)
      .eq("id", catalogItemId)
      .eq("organization_id", CURRENT_ORG_ID)
      .eq("branch_id", CURRENT_BRANCH_ID);

    if (catalogError)
      throw new Error(
        `Lỗi cập nhật catalog item dịch vụ: ${catalogError.message}`,
      );
  }

  const serviceUpdates: Record<string, any> = {};
  if (input.duration_minutes !== undefined)
    serviceUpdates.duration_minutes = input.duration_minutes;
  if (input.sales_commission_rate !== undefined)
    serviceUpdates.sales_commission_rate = input.sales_commission_rate;
  if (input.performance_commission_rate !== undefined)
    serviceUpdates.performance_commission_rate =
      input.performance_commission_rate;

  if (Object.keys(serviceUpdates).length > 0) {
    const { error: serviceError } = await supabase
      .from("services")
      .update(serviceUpdates)
      .eq("catalog_item_id", catalogItemId);

    if (serviceError)
      throw new Error(`Lỗi cập nhật chi tiết dịch vụ: ${serviceError.message}`);
  }
}

// ==========================================
// PRODUCT OPERATIONS
// ==========================================

export async function fetchProducts(
  searchQuery?: string,
): Promise<ProductItemDomain[]> {
  let query = supabase
    .from("catalog_items")
    .select(
      `
      *,
      products!inner (
        selling_price,
        stock_quantity,
        minimum_stock,
        unit
      )
    `,
    )
    .eq("organization_id", CURRENT_ORG_ID)
    .eq("branch_id", CURRENT_BRANCH_ID)
    .eq("item_type", "PRODUCT")
    .order("created_at", { ascending: false });

  if (searchQuery && searchQuery.trim() !== "") {
    query = query.ilike("name", `%${searchQuery.trim()}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Lỗi tải danh sách sản phẩm: ${error.message}`);

  return (data || []).map((item: any) => ({
    id: item.id,
    organization_id: item.organization_id,
    branch_id: item.branch_id,
    item_type: "PRODUCT",
    name: item.name,
    category: item.category,
    description: item.description,
    price: item.price,
    status: item.status,
    created_at: item.created_at,
    updated_at: item.updated_at,
    product_details: {
      selling_price: item.products[0]?.selling_price ?? item.price,
      stock_quantity: item.products[0]?.stock_quantity ?? 0,
      minimum_stock: item.products[0]?.minimum_stock ?? 0,
      unit: item.products[0]?.unit ?? "cái",
    },
  }));
}

export async function createProduct(
  input: CreateProductInput,
): Promise<ProductItemDomain> {
  const { data: catalogItem, error: catalogError } = await supabase
    .from("catalog_items")
    .insert({
      organization_id: CURRENT_ORG_ID,
      branch_id: CURRENT_BRANCH_ID,
      item_type: "PRODUCT",
      name: input.name,
      category: input.category,
      description: input.description || null,
      price: input.selling_price,
      status: input.status || "active",
    })
    .select()
    .single();

  if (catalogError || !catalogItem) {
    throw new Error(`Lỗi tạo catalog item sản phẩm: ${catalogError?.message}`);
  }

  const { error: productError } = await supabase.from("products").insert({
    catalog_item_id: catalogItem.id,
    selling_price: input.selling_price,
    stock_quantity: input.stock_quantity,
    minimum_stock: input.minimum_stock,
    unit: input.unit,
  });

  if (productError) {
    await supabase.from("catalog_items").delete().eq("id", catalogItem.id);
    throw new Error(`Lỗi tạo chi tiết sản phẩm: ${productError.message}`);
  }

  return {
    ...catalogItem,
    item_type: "PRODUCT",
    product_details: {
      selling_price: input.selling_price,
      stock_quantity: input.stock_quantity,
      minimum_stock: input.minimum_stock,
      unit: input.unit,
    },
  };
}

export async function updateProduct(
  catalogItemId: string,
  input: UpdateProductInput,
): Promise<void> {
  const catalogUpdates: Record<string, any> = {};
  if (input.name !== undefined) catalogUpdates.name = input.name;
  if (input.category !== undefined) catalogUpdates.category = input.category;
  if (input.description !== undefined)
    catalogUpdates.description = input.description;
  if (input.selling_price !== undefined)
    catalogUpdates.price = input.selling_price;
  if (input.status !== undefined) catalogUpdates.status = input.status;

  if (Object.keys(catalogUpdates).length > 0) {
    const { error: catalogError } = await supabase
      .from("catalog_items")
      .update(catalogUpdates)
      .eq("id", catalogItemId)
      .eq("organization_id", CURRENT_ORG_ID)
      .eq("branch_id", CURRENT_BRANCH_ID);

    if (catalogError)
      throw new Error(
        `Lỗi cập nhật catalog item sản phẩm: ${catalogError.message}`,
      );
  }

  const productUpdates: Record<string, any> = {};
  if (input.selling_price !== undefined)
    productUpdates.selling_price = input.selling_price;
  if (input.stock_quantity !== undefined)
    productUpdates.stock_quantity = input.stock_quantity;
  if (input.minimum_stock !== undefined)
    productUpdates.minimum_stock = input.minimum_stock;
  if (input.unit !== undefined) productUpdates.unit = input.unit;

  if (Object.keys(productUpdates).length > 0) {
    const { error: productError } = await supabase
      .from("products")
      .update(productUpdates)
      .eq("catalog_item_id", catalogItemId);

    if (productError)
      throw new Error(
        `Lỗi cập nhật chi tiết sản phẩm: ${productError.message}`,
      );
  }
}

export async function toggleCatalogItemStatus(
  catalogItemId: string,
  newStatus: "active" | "inactive",
): Promise<void> {
  const { error } = await supabase
    .from("catalog_items")
    .update({ status: newStatus })
    .eq("id", catalogItemId)
    .eq("organization_id", CURRENT_ORG_ID)
    .eq("branch_id", CURRENT_BRANCH_ID);

  if (error) throw new Error(`Lỗi thay đổi trạng thái: ${error.message}`);
}
