import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";

const tenant = {
  organizationId: DEFAULT_ORG_ID,
  branchId: DEFAULT_BRANCH_ID,
};

export const fetchCategories = async (type?: "service" | "product") => {
  let query = supabase
    .from("categories")
    .select("*")
    .eq("organization_id", tenant.organizationId)
    .eq("branch_id", tenant.branchId)
    .order("name");

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) throw error;

  return data || [];
};

export const fetchServices = async (search = "") => {
  let query = supabase
    .from("catalog_items")
    .select(`
      *,
      services (
        id,
        duration_minutes,
        sales_commission_rate,
        performance_commission_rate
      )
    `)
    .eq("organization_id", tenant.organizationId)
    .eq("branch_id", tenant.branchId)
    .eq("item_type", "SERVICE")
    .order("created_at", { ascending: false });

  if (search.trim()) {
    query = query.or(
      `name.ilike.%${search}%,code.ilike.%${search}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    code: item.code || "",
    category: item.category || "",
    price: Number(item.price || 0),
    status: item.status === "ACTIVE" ? "active" : "inactive",
    service_details: {
      duration_minutes:
        Number(item.services?.[0]?.duration_minutes || 0),
      sales_commission_rate:
        Number(item.services?.[0]?.sales_commission_rate || 0),
      performance_commission_rate:
        Number(item.services?.[0]?.performance_commission_rate || 0),
    },
  }));
};

export const fetchProducts = async (search = "") => {
  let query = supabase
    .from("catalog_items")
    .select(`
      *,
      products (
        id,
        cost_price,
        selling_price,
        stock_quantity,
        minimum_stock,
        unit
      )
    `)
    .eq("organization_id", tenant.organizationId)
    .eq("branch_id", tenant.branchId)
    .eq("item_type", "PRODUCT")
    .order("created_at", { ascending: false });

  if (search.trim()) {
    query = query.or(
      `name.ilike.%${search}%,code.ilike.%${search}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    code: item.code || "",
    category: item.category || "",
    price: Number(item.price || 0),
    status: item.status === "ACTIVE" ? "active" : "inactive",
    product_details: {
      cost_price:
        Number(item.products?.[0]?.cost_price || 0),
      selling_price:
        Number(item.products?.[0]?.selling_price || 0),
      stock_quantity:
        Number(item.products?.[0]?.stock_quantity || 0),
      minimum_stock:
        Number(item.products?.[0]?.minimum_stock || 0),
      unit: item.products?.[0]?.unit || "unit",
    },
  }));
};

export const toggleCatalogItemStatus = async (
  id: string,
  nextStatus: "active" | "inactive",
) => {
  const { error } = await supabase
    .from("catalog_items")
    .update({
      status: nextStatus === "active" ? "ACTIVE" : "INACTIVE",
    })
    .eq("id", id)
    .eq("organization_id", tenant.organizationId)
    .eq("branch_id", tenant.branchId);

  if (error) throw error;
};

export const createService = async (input: {
  code: string;
  name: string;
  category?: string;
  description?: string;
  price: number;
  duration_minutes: number;
  sales_commission_rate?: number;
  performance_commission_rate?: number;
}) => {
  const { data: item, error: itemError } = await supabase
    .from("catalog_items")
    .insert({
      organization_id: tenant.organizationId,
      branch_id: tenant.branchId,
      item_type: "SERVICE",
      code: input.code,
      name: input.name,
      category: input.category || null,
      description: input.description || null,
      price: input.price,
      status: "ACTIVE",
    })
    .select()
    .single();

  if (itemError) throw itemError;

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .insert({
      catalog_item_id: item.id,
      duration_minutes: input.duration_minutes,
      sales_commission_rate: input.sales_commission_rate || 0,
      performance_commission_rate:
        input.performance_commission_rate || 0,
    })
    .select()
    .single();

  if (serviceError) {
    await supabase
      .from("catalog_items")
      .delete()
      .eq("id", item.id);

    throw serviceError;
  }

  return {
    ...item,
    service,
  };
};

export const createProduct = async (input: {
  code: string;
  name: string;
  category?: string;
  description?: string;
  cost_price: number;
  selling_price: number;
  stock_quantity?: number;
  minimum_stock?: number;
  unit?: string;
}) => {
  const { data: item, error: itemError } = await supabase
    .from("catalog_items")
    .insert({
      organization_id: tenant.organizationId,
      branch_id: tenant.branchId,
      item_type: "PRODUCT",
      code: input.code,
      name: input.name,
      category: input.category || null,
      description: input.description || null,
      price: input.selling_price,
      status: "ACTIVE",
    })
    .select()
    .single();

  if (itemError) throw itemError;

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      catalog_item_id: item.id,
      cost_price: input.cost_price,
      selling_price: input.selling_price,
      stock_quantity: input.stock_quantity || 0,
      minimum_stock: input.minimum_stock || 0,
      unit: input.unit || "unit",
    })
    .select()
    .single();

  if (productError) {
    await supabase
      .from("catalog_items")
      .delete()
      .eq("id", item.id);

    throw productError;
  }

  return {
    ...item,
    product,
  };
};

export const fetchPackages = async (
  type: "SERVICE" | "PRODUCT",
  search = "",
) => {
  let query = supabase
    .from("packages")
    .select(`
      *,
      package_items (
        id,
        item_type,
        service_id,
        product_id,
        quantity,
        price_override
      )
    `)
    .eq("organization_id", tenant.organizationId)
    .eq("branch_id", tenant.branchId)
    .eq("type", type)
    .order("created_at", { ascending: false });

  if (search.trim()) {
    query = query.or(
      `name.ilike.%${search}%,code.ilike.%${search}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  return data || [];
};

export const createPackage = async (input: {
  code: string;
  name: string;
  type: "SERVICE" | "PRODUCT";
  price: number;
  validity_days: number;
  description?: string;
  items: Array<{
    item_type: "SERVICE" | "PRODUCT";
    service_id?: string;
    product_id?: string;
    quantity: number;
    price_override?: number | null;
  }>;
}) => {
  const { data: pkg, error: packageError } = await supabase
    .from("packages")
    .insert({
      organization_id: tenant.organizationId,
      branch_id: tenant.branchId,
      code: input.code,
      name: input.name,
      type: input.type,
      price: input.price,
      validity_days: input.validity_days,
      description: input.description || null,
      is_active: true,
    })
    .select()
    .single();

  if (packageError) throw packageError;

  if (input.items.length > 0) {
    const rows = input.items.map((item) => ({
      package_id: pkg.id,
      item_type: item.item_type,
      service_id: item.service_id || null,
      product_id: item.product_id || null,
      quantity: item.quantity,
      price_override: item.price_override ?? null,
    }));

    const { error: itemError } = await supabase
      .from("package_items")
      .insert(rows);

    if (itemError) {
      await supabase
        .from("packages")
        .delete()
        .eq("id", pkg.id);

      throw itemError;
    }
  }

  return pkg;
};

/**
 * Backward compatibility layer
 * Các màn hình cũ vẫn dùng catalogService.*
 * API mới vẫn dùng fetchServices/fetchProducts/...
 */
export const catalogService = {
  getCategories: async (
    tenantContext: {
      organizationId: string;
      branchId: string;
    },
    type?: "service" | "product",
  ) => {
    let query = supabase
      .from("categories")
      .select("*")
      .eq("organization_id", tenantContext.organizationId)
      .eq("branch_id", tenantContext.branchId)
      .order("name");

    if (type) {
      query = query.eq("type", type);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  },

  getServices: async (
    tenantContext: {
      organizationId: string;
      branchId: string;
    },
    filters?: {
      search?: string;
      categoryId?: string;
      status?: string;
    },
  ) => {
    let query = supabase
      .from("catalog_items")
      .select(`
        *,
        services (
          id,
          duration_minutes,
          sales_commission_rate,
          performance_commission_rate
        )
      `)
      .eq("organization_id", tenantContext.organizationId)
      .eq("branch_id", tenantContext.branchId)
      .eq("item_type", "SERVICE")
      .order("created_at", { ascending: false });

    if (filters?.search?.trim()) {
      query = query.or(
        `name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`,
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      organization_id: item.organization_id,
      branch_id: item.branch_id,
      category_id: null,
      code: item.code || "",
      name: item.name,
      price: Number(item.price || 0),
      duration: Number(
        item.services?.[0]?.duration_minutes || 0,
      ),
      description: item.description || "",
      status:
        item.status === "ACTIVE"
          ? "active"
          : "inactive",
      categories: item.category
        ? { name: item.category }
        : undefined,
      created_at: item.created_at,
    }));
  },

  getProducts: async (
    tenantContext: {
      organizationId: string;
      branchId: string;
    },
    filters?: {
      search?: string;
      categoryId?: string;
      status?: string;
    },
  ) => {
    let query = supabase
      .from("catalog_items")
      .select(`
        *,
        products (
          id,
          cost_price,
          selling_price,
          stock_quantity,
          minimum_stock,
          unit
        )
      `)
      .eq("organization_id", tenantContext.organizationId)
      .eq("branch_id", tenantContext.branchId)
      .eq("item_type", "PRODUCT")
      .order("created_at", { ascending: false });

    if (filters?.search?.trim()) {
      query = query.or(
        `name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`,
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      organization_id: item.organization_id,
      branch_id: item.branch_id,
      category_id: null,
      sku: item.code || "",
      name: item.name,
      cost_price: Number(
        item.products?.[0]?.cost_price || 0,
      ),
      selling_price: Number(
        item.products?.[0]?.selling_price || 0,
      ),
      unit: item.products?.[0]?.unit || "unit",
      description: item.description || "",
      status:
        item.status === "ACTIVE"
          ? "active"
          : "inactive",
      categories: item.category
        ? { name: item.category }
        : undefined,
      created_at: item.created_at,
    }));
  },

  deleteService: async (
    tenantContext: {
      organizationId: string;
      branchId: string;
    },
    id: string,
  ) => {
    const { data: service, error: findError } =
      await supabase
        .from("services")
        .select("catalog_item_id")
        .eq("id", id)
        .single();

    if (findError) throw findError;

    const { error } = await supabase
      .from("catalog_items")
      .delete()
      .eq("id", service.catalog_item_id)
      .eq(
        "organization_id",
        tenantContext.organizationId,
      )
      .eq("branch_id", tenantContext.branchId);

    if (error) throw error;
  },

  deleteProduct: async (
    tenantContext: {
      organizationId: string;
      branchId: string;
    },
    id: string,
  ) => {
    const { data: product, error: findError } =
      await supabase
        .from("products")
        .select("catalog_item_id")
        .eq("id", id)
        .single();

    if (findError) throw findError;

    const { error } = await supabase
      .from("catalog_items")
      .delete()
      .eq("id", product.catalog_item_id)
      .eq(
        "organization_id",
        tenantContext.organizationId,
      )
      .eq("branch_id", tenantContext.branchId);

    if (error) throw error;
  },
};
