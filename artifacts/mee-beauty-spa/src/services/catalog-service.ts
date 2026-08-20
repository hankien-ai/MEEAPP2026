import { supabase } from "../lib/supabase";
import {
  Category,
  ServiceItem,
  ProductItem,
  ServicePackage,
  PackageItemDetail,
  TenantContext,
  CatalogType,
} from "../types/catalog";

export const catalogService = {
  // --- CATEGORIES ---
  async getCategories(
    tenant: TenantContext,
    type?: CatalogType,
  ): Promise<Category[]> {
    let query = supabase
      .from("categories")
      .select("*")
      .eq("organization_id", tenant.organizationId)
      .eq("branch_id", tenant.branchId);

    if (type) query = query.eq("type", type);

    const { data, error } = await query.order("name");
    if (error) throw error;
    return data || [];
  },

  async saveCategory(
    tenant: TenantContext,
    category: Partial<Category>,
  ): Promise<Category> {
    const payload = {
      ...category,
      organization_id: tenant.organizationId,
      branch_id: tenant.branchId,
    };

    const { data, error } = category.id
      ? await supabase
          .from("categories")
          .update(payload)
          .eq("id", category.id)
          .select()
          .single()
      : await supabase.from("categories").insert(payload).select().single();

    if (error) throw error;
    return data;
  },

  async deleteCategory(tenant: TenantContext, id: string): Promise<void> {
    // Kiểm tra xem có service/product nào đang gán category này không
    const { count: serviceCount } = await supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);

    const { count: productCount } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);

    if ((serviceCount || 0) > 0 || (productCount || 0) > 0) {
      throw new Error(
        "Không thể xóa danh mục đang có sản phẩm hoặc dịch vụ liên kết.",
      );
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("organization_id", tenant.organizationId)
      .eq("branch_id", tenant.branchId);

    if (error) throw error;
  },

  // --- SERVICES ---
  async getServices(
    tenant: TenantContext,
    filters?: { search?: string; categoryId?: string; status?: string },
  ): Promise<ServiceItem[]> {
    let query = supabase
      .from("services")
      .select("*, categories(name)")
      .eq("organization_id", tenant.organizationId)
      .eq("branch_id", tenant.branchId);

    if (filters?.categoryId)
      query = query.eq("category_id", filters.categoryId);
    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`,
      );
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw error;
    return data || [];
  },

  async saveService(
    tenant: TenantContext,
    service: Partial<ServiceItem>,
  ): Promise<ServiceItem> {
    const payload = {
      ...service,
      organization_id: tenant.organizationId,
      branch_id: tenant.branchId,
    };

    const { data, error } = service.id
      ? await supabase
          .from("services")
          .update(payload)
          .eq("id", service.id)
          .select()
          .single()
      : await supabase.from("services").insert(payload).select().single();

    if (error) throw error;
    return data;
  },

  async deleteService(tenant: TenantContext, id: string): Promise<void> {
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", id)
      .eq("organization_id", tenant.organizationId)
      .eq("branch_id", tenant.branchId);

    if (error) throw error;
  },

  // --- PRODUCTS ---
  async getProducts(
    tenant: TenantContext,
    filters?: { search?: string; categoryId?: string; status?: string },
  ): Promise<ProductItem[]> {
    let query = supabase
      .from("products")
      .select("*, categories(name)")
      .eq("organization_id", tenant.organizationId)
      .eq("branch_id", tenant.branchId);

    if (filters?.categoryId)
      query = query.eq("category_id", filters.categoryId);
    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`,
      );
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw error;
    return data || [];
  },

  async saveProduct(
    tenant: TenantContext,
    product: Partial<ProductItem>,
  ): Promise<ProductItem> {
    const payload = {
      ...product,
      organization_id: tenant.organizationId,
      branch_id: tenant.branchId,
    };

    const { data, error } = product.id
      ? await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id)
          .select()
          .single()
      : await supabase.from("products").insert(payload).select().single();

    if (error) throw error;
    return data;
  },

  async deleteProduct(tenant: TenantContext, id: string): Promise<void> {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .eq("organization_id", tenant.organizationId)
      .eq("branch_id", tenant.branchId);

    if (error) throw error;
  },

  // --- PACKAGES (GÓI DỊCH VỤ / GÓI SẢN PHẨM) ---
  async getPackages(
    tenant: TenantContext,
    type: CatalogType,
    filters?: { search?: string; status?: string },
  ): Promise<ServicePackage[]> {
    let query = supabase
      .from("packages")
      .select("*, package_items(*)")
      .eq("organization_id", tenant.organizationId)
      .eq("branch_id", tenant.branchId)
      .eq("type", type);

    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`,
      );
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw error;
    return data || [];
  },

  async savePackage(
    tenant: TenantContext,
    pkg: Partial<ServicePackage>,
    items: PackageItemDetail[],
  ): Promise<ServicePackage> {
    const pkgPayload = {
      code: pkg.code || "",
      name: pkg.name || "",
      type: pkg.type || "service",
      price: pkg.price || 0,
      validity_days: pkg.validity_days || 30,
      description: pkg.description || "",
      status: pkg.status || "active",
      organization_id: tenant.organizationId,
      branch_id: tenant.branchId,
    };

    let savedPackageId = pkg.id;

    if (pkg.id) {
      const { error } = await supabase
        .from("packages")
        .update(pkgPayload)
        .eq("id", pkg.id)
        .eq("organization_id", tenant.organizationId)
        .eq("branch_id", tenant.branchId);

      if (error) throw error;

      // Xóa sạch các package_items cũ để ghi đè item mới, tránh nhân đôi
      const { error: deleteItemsErr } = await supabase
        .from("package_items")
        .delete()
        .eq("package_id", pkg.id)
        .eq("organization_id", tenant.organizationId)
        .eq("branch_id", tenant.branchId);

      if (deleteItemsErr) throw deleteItemsErr;
    } else {
      const { data, error } = await supabase
        .from("packages")
        .insert(pkgPayload)
        .select()
        .single();
      if (error) throw error;
      savedPackageId = data.id;
    }

    if (items.length > 0 && savedPackageId) {
      const itemPayloads = items.map((it) => ({
        package_id: savedPackageId,
        organization_id: tenant.organizationId,
        branch_id: tenant.branchId,
        item_type: it.item_type,
        item_id: it.item_id,
        quantity: Number(it.quantity) || 1,
        unit_price: Number(it.unit_price) || 0,
      }));

      const { error: insertErr } = await supabase
        .from("package_items")
        .insert(itemPayloads);
      if (insertErr) throw insertErr;
    }

    // Fetch lại full package bao gồm items
    const { data: updated, error: fetchErr } = await supabase
      .from("packages")
      .select("*, package_items(*)")
      .eq("id", savedPackageId)
      .single();

    if (fetchErr) throw fetchErr;
    return updated;
  },

  async deletePackage(tenant: TenantContext, id: string): Promise<void> {
    const { error } = await supabase
      .from("packages")
      .delete()
      .eq("id", id)
      .eq("organization_id", tenant.organizationId)
      .eq("branch_id", tenant.branchId);

    if (error) throw error;
  },
};
