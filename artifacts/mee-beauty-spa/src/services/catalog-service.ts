import { supabase } from "./supabase";
import { CatalogItem } from "../types/domain";

// Helper domain interfaces for UI consumer pages
export interface ServiceItemDomain extends CatalogItem {
  category: string;
  service_details: {
    duration_minutes: number;
  };
}

export interface ProductItemDomain extends CatalogItem {
  category: string;
  product_details: {
    selling_price: number;
    stock_quantity: number;
    minimum_stock: number;
    unit: string;
  };
}

// --- CORE IMPLEMENTATIONS ---

export async function getCatalogItems(search?: string): Promise<CatalogItem[]> {
  let query = supabase
    .from("catalog_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (search && search.trim() !== "") {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching catalog items from Supabase:", error);
    throw error;
  }

  return (data as CatalogItem[]) || [];
}

export const fetchCatalogItems = getCatalogItems;

export async function fetchServices(
  search?: string,
): Promise<ServiceItemDomain[]> {
  let query = supabase
    .from("catalog_items")
    .select("*")
    .eq("item_type", "SERVICE")
    .order("created_at", { ascending: false });

  if (search && search.trim() !== "") {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching services from Supabase:", error);
    throw error;
  }

  const items = (data as any[]) || [];
  return items.map((item) => ({
    ...item,
    category: item.category || item.description || "Dịch vụ",
    service_details: {
      duration_minutes:
        item.duration_minutes || item.service_details?.duration_minutes || 60,
    },
  }));
}

export async function fetchProducts(
  search?: string,
): Promise<ProductItemDomain[]> {
  let query = supabase
    .from("catalog_items")
    .select("*")
    .eq("item_type", "PRODUCT")
    .order("created_at", { ascending: false });

  if (search && search.trim() !== "") {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products from Supabase:", error);
    throw error;
  }

  const items = (data as any[]) || [];
  return items.map((item) => ({
    ...item,
    category: item.category || item.description || "Sản phẩm",
    product_details: {
      selling_price: item.price || item.product_details?.selling_price || 0,
      stock_quantity:
        item.stock_quantity ?? item.product_details?.stock_quantity ?? 0,
      minimum_stock:
        item.minimum_stock ?? item.product_details?.minimum_stock ?? 0,
      unit: item.unit || item.product_details?.unit || "Chai",
    },
  }));
}

export async function toggleCatalogItemStatus(
  id: string,
  newStatus: "active" | "inactive",
): Promise<CatalogItem> {
  const { data, error } = await supabase
    .from("catalog_items")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating catalog item ${id} status:`, error);
    throw error;
  }

  return data as CatalogItem;
}

export async function createCatalogItem(
  payload: Partial<CatalogItem>,
): Promise<CatalogItem> {
  const insertData = {
    ...payload,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("catalog_items")
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error("Error creating catalog item:", error);
    throw error;
  }

  return data as CatalogItem;
}

export async function updateCatalogItem(
  id: string,
  payload: Partial<CatalogItem>,
): Promise<CatalogItem> {
  const updateData = {
    ...payload,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("catalog_items")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating catalog item ${id}:`, error);
    throw error;
  }

  return data as CatalogItem;
}

export async function deleteCatalogItem(id: string): Promise<boolean> {
  const { error } = await supabase.from("catalog_items").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting catalog item ${id}:`, error);
    throw error;
  }

  return true;
}

export const createService = (payload: Partial<CatalogItem>) =>
  createCatalogItem({ ...payload, item_type: "SERVICE" });

export const updateService = updateCatalogItem;

export const createProduct = (payload: Partial<CatalogItem>) =>
  createCatalogItem({ ...payload, item_type: "PRODUCT" });

export const updateProduct = updateCatalogItem;

// --- OBJECT & DEFAULT EXPORTS ---

export const catalogService = {
  getCatalogItems,
  fetchCatalogItems,
  fetchServices,
  fetchProducts,
  toggleCatalogItemStatus,
  createCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
  createService,
  updateService,
  createProduct,
  updateProduct,
};

export default catalogService;
