
============================================================
FILE: src/services/catalog-service.ts
============================================================
import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";
import { CatalogItem } from "../types/domain";

export const catalogService = {
  async getAll(): Promise<CatalogItem[]> {
    const { data, error } = await supabase
      .from("catalog_items")
      .select("*")
      .order("code", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getByItemType(itemType: "service" | "product"): Promise<CatalogItem[]> {
    const { data, error } = await supabase
      .from("catalog_items")
      .select("*")
      .eq("item_type", itemType)
      .order("name");

    if (error) throw error;
    return data || [];
  },

  async create(
    item: Omit<CatalogItem, "id" | "created_at" | "updated_at">,
  ): Promise<CatalogItem> {
    const payload = {
      ...item,
      organization_id: item.organization_id || DEFAULT_ORG_ID,
      branch_id: item.branch_id || DEFAULT_BRANCH_ID,
    };

    const { data, error } = await supabase
      .from("catalog_items")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<CatalogItem>,
  ): Promise<CatalogItem> {
    const { data, error } = await supabase
      .from("catalog_items")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("catalog_items")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};

============================================================
FILE: src/services/customer.service.ts
============================================================
import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";
import {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../types/domain";

export const customerService = {
  async getCustomers(searchQuery?: string): Promise<Customer[]> {
    let query = supabase
      .from("customers")
      .select("*")
      .eq("organization_id", DEFAULT_ORG_ID)
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    if (searchQuery && searchQuery.trim() !== "") {
      const q = `%${searchQuery.trim()}%`;
      query = query.or(
        `full_name.ilike.${q},phone.ilike.${q},email.ilike.${q}`,
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as Customer[]) || [];
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .eq("organization_id", DEFAULT_ORG_ID)
      .single();

    if (error) throw error;
    return data as Customer;
  },

  async createCustomer(input: CreateCustomerInput): Promise<Customer> {
    const payload = {
      ...input,
      organization_id: input.organization_id || DEFAULT_ORG_ID,
      branch_id: input.branch_id || DEFAULT_BRANCH_ID,
      loyalty_points: input.loyalty_points ?? 0,
      total_spend: 0,
      status: input.status || "active",
    };

    const { data, error } = await supabase
      .from("customers")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data as Customer;
  },

  async updateCustomer(
    id: string,
    input: UpdateCustomerInput,
  ): Promise<Customer> {
    const { data, error } = await supabase
      .from("customers")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("organization_id", DEFAULT_ORG_ID)
      .select()
      .single();

    if (error) throw error;
    return data as Customer;
  },

  async archiveCustomer(id: string): Promise<void> {
    const { error } = await supabase
      .from("customers")
      .update({
        status: "archived",
        archived_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("organization_id", DEFAULT_ORG_ID);

    if (error) throw error;
  },
};

============================================================
FILE: src/services/demo-service.ts
============================================================
import { demoCatalog, demoCustomers, demoExpenses, demoPackages, demoStaff } from '@/data/demo';

const pause = (ms = 220) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const demoService = {
  async getCustomers() { await pause(); return demoCustomers; },
  async getCatalog() { await pause(120); return demoCatalog; },
  async getPackages() { await pause(160); return demoPackages; },
  async getStaff() { await pause(180); return demoStaff; },
  async getExpenses() { await pause(180); return demoExpenses; },
};
============================================================
FILE: src/services/expense.service.ts
============================================================
import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";
import { Expense } from "../types/domain";

export interface CreateExpenseInput {
  category: string;
  amount: number;
  description?: string | null;
  date: string;
  payment_method?: string;
}

export type UpdateExpenseInput = Partial<CreateExpenseInput>;

export const expenseService = {
  async getExpenses(filter?: {
    category?: string;
    date?: string;
    searchQuery?: string;
  }): Promise<Expense[]> {
    let query = supabase
      .from("expenses")
      .select("*")
      .eq("organization_id", DEFAULT_ORG_ID)
      .is("archived_at", null)
      .order("date", { ascending: false });

    if (filter?.category) {
      query = query.eq("category", filter.category);
    }
    if (filter?.date) {
      query = query.eq("date", filter.date);
    }
    if (filter?.searchQuery && filter.searchQuery.trim() !== "") {
      const q = `%${filter.searchQuery.trim()}%`;
      query = query.or(`category.ilike.${q},description.ilike.${q}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as Expense[]) || [];
  },

  async createExpense(input: CreateExpenseInput): Promise<Expense> {
    const payload = {
      ...input,
      organization_id: DEFAULT_ORG_ID,
      branch_id: DEFAULT_BRANCH_ID,
    };

    const { data, error } = await supabase
      .from("expenses")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data as Expense;
  },

  async updateExpense(id: string, input: UpdateExpenseInput): Promise<Expense> {
    const { data, error } = await supabase
      .from("expenses")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("organization_id", DEFAULT_ORG_ID)
      .select()
      .single();

    if (error) throw error;
    return data as Expense;
  },

  async archiveExpense(id: string): Promise<void> {
    const { error } = await supabase
      .from("expenses")
      .update({
        archived_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("organization_id", DEFAULT_ORG_ID);

    if (error) throw error;
  },
};

============================================================
FILE: src/services/operations.service.ts
============================================================
import { supabase } from "./supabase";
import { OperationsMetrics } from "../types/domain";

export const operationsService = {
  async getMetrics(): Promise<OperationsMetrics | null> {
    try {
      const { data: expenses, error: expError } = await supabase
        .from("expenses")
        .select("amount");

      if (expError) throw expError;

      const totalExpenses = expenses
        ? expenses.reduce((acc, cur) => acc + (cur.amount || 0), 0)
        : 0;

      const { count: bookingsCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      const { count: sessionsCount } = await supabase
        .from("sessions")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

      const { data: sales } = await supabase
        .from("sales")
        .select("total_amount");

      const totalRevenue = sales
        ? sales.reduce((acc, cur) => acc + (cur.total_amount || 0), 0)
        : 0;

      return {
        total_revenue: totalRevenue,
        active_bookings: bookingsCount || 0,
        completed_sessions: sessionsCount || 0,
        expenses_total: totalExpenses,
      };
    } catch {
      return null;
    }
  },
};

============================================================
FILE: src/services/package.service.ts
============================================================
import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";
import { PackageTemplate } from "../types/domain";

export interface CreatePackageInput {
  name: string;
  description?: string | null;
  price: number;
  total_sessions?: number;
  validity_days?: number;
  status?: string;
  items?: { catalog_item_id: string; quantity: number }[];
}

export type UpdatePackageInput = Partial<CreatePackageInput>;

export const packageService = {
  async getPackages(searchQuery?: string): Promise<PackageTemplate[]> {
    let query = supabase
      .from("package_templates")
      .select("*")
      .eq("organization_id", DEFAULT_ORG_ID)
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    if (searchQuery && searchQuery.trim() !== "") {
      query = query.ilike("name", `%${searchQuery.trim()}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as PackageTemplate[]) || [];
  },

  async getPackageById(id: string): Promise<PackageTemplate | null> {
    const { data, error } = await supabase
      .from("package_templates")
      .select("*")
      .eq("id", id)
      .eq("organization_id", DEFAULT_ORG_ID)
      .single();

    if (error) throw error;
    return data as PackageTemplate;
  },

  async createPackage(input: CreatePackageInput): Promise<PackageTemplate> {
    const payload = {
      ...input,
      organization_id: DEFAULT_ORG_ID,
      branch_id: DEFAULT_BRANCH_ID,
      status: input.status || "active",
    };

    const { data, error } = await supabase
      .from("package_templates")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data as PackageTemplate;
  },

  async updatePackage(
    id: string,
    input: UpdatePackageInput,
  ): Promise<PackageTemplate> {
    const { data, error } = await supabase
      .from("package_templates")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("organization_id", DEFAULT_ORG_ID)
      .select()
      .single();

    if (error) throw error;
    return data as PackageTemplate;
  },

  async archivePackage(id: string): Promise<void> {
    const { error } = await supabase
      .from("package_templates")
      .update({
        status: "archived",
        archived_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("organization_id", DEFAULT_ORG_ID);

    if (error) throw error;
  },
};

============================================================
FILE: src/services/seed.service.ts
============================================================
import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";

export const seedService = {
  async seedInitialDataIfEmpty(): Promise<void> {
    // 1. Seed Customers if empty
    const { count: customerCount } = await supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", DEFAULT_ORG_ID);

    if (customerCount === 0) {
      await supabase.from("customers").insert([
        {
          organization_id: DEFAULT_ORG_ID,
          branch_id: DEFAULT_BRANCH_ID,
          full_name: "Nguyễn Văn A",
          phone: "0901234567",
          email: "nguyenvana@example.com",
          gender: "Nam",
          status: "active",
          loyalty_points: 100,
          total_spend: 1500000,
        },
        {
          organization_id: DEFAULT_ORG_ID,
          branch_id: DEFAULT_BRANCH_ID,
          full_name: "Trần Thị B",
          phone: "0912345678",
          email: "tranthib@example.com",
          gender: "Nữ",
          status: "active",
          loyalty_points: 50,
          total_spend: 800000,
        },
        {
          organization_id: DEFAULT_ORG_ID,
          branch_id: DEFAULT_BRANCH_ID,
          full_name: "Lê Hoàng C",
          phone: "0987654321",
          email: "lehoangc@example.com",
          gender: "Nam",
          status: "active",
          loyalty_points: 0,
          total_spend: 0,
        },
      ]);
    }

    // 2. Seed Expenses if empty
    const { count: expenseCount } = await supabase
      .from("expenses")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", DEFAULT_ORG_ID);

    if (expenseCount === 0) {
      await supabase.from("expenses").insert([
        {
          organization_id: DEFAULT_ORG_ID,
          branch_id: DEFAULT_BRANCH_ID,
          category: "Mặt bằng",
          amount: 15000000,
          description: "Tiền thuê mặt bằng tháng này",
          date: new Date().toISOString().split("T")[0],
          payment_method: "Chuyển khoản",
        },
        {
          organization_id: DEFAULT_ORG_ID,
          branch_id: DEFAULT_BRANCH_ID,
          category: "Điện nước",
          amount: 2500000,
          description: "Thanh toán hóa đơn điện nước",
          date: new Date().toISOString().split("T")[0],
          payment_method: "Chuyển khoản",
        },
        {
          organization_id: DEFAULT_ORG_ID,
          branch_id: DEFAULT_BRANCH_ID,
          category: "Vật tư",
          amount: 4500000,
          description: "Mua bổ sung sản phẩm skincare",
          date: new Date().toISOString().split("T")[0],
          payment_method: "Tiền mặt",
        },
      ]);
    }

    // 3. Seed Packages if empty
    const { count: packageCount } = await supabase
      .from("package_templates")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", DEFAULT_ORG_ID);

    if (packageCount === 0) {
      await supabase.from("package_templates").insert([
        {
          organization_id: DEFAULT_ORG_ID,
          branch_id: DEFAULT_BRANCH_ID,
          name: "Gói Trị Mụn Chuẩn Y Khoa (10 Buổi)",
          description: "Liệu trình chăm sóc chuyên sâu 10 buổi",
          price: 3500000,
          total_sessions: 10,
          validity_days: 90,
          status: "active",
        },
        {
          organization_id: DEFAULT_ORG_ID,
          branch_id: DEFAULT_BRANCH_ID,
          name: "Gói Phục Hồi Da CO2 Detox (5 Buổi)",
          description: "Thải độc và phục hồi cấu trúc da",
          price: 2200000,
          total_sessions: 5,
          validity_days: 60,
          status: "active",
        },
        {
          organization_id: DEFAULT_ORG_ID,
          branch_id: DEFAULT_BRANCH_ID,
          name: "Gói Chăm Sóc Cơ Bản (3 Buổi)",
          description: "Chăm sóc da mặt duy trì hàng tuần",
          price: 900000,
          total_sessions: 3,
          validity_days: 30,
          status: "active",
        },
      ]);
    }
  },
};

============================================================
FILE: src/services/staff.service.ts
============================================================
import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";
import {
  StaffMemberDomain,
  CreateStaffInput,
  UpdateStaffInput,
} from "../types/domain";

/**
 * Tải danh sách nhân viên từ public.staff scoped theo organization_id & branch_id.
 * Chỉ lấy các bản ghi chưa lưu trữ (archived_at IS NULL).
 */
export const fetchStaff = async (
  searchQuery?: string,
  includeInactive: boolean = true,
): Promise<StaffMemberDomain[]> => {
  let query = supabase
    .from("staff")
    .select("*")
    .eq("organization_id", DEFAULT_ORG_ID)
    .eq("branch_id", DEFAULT_BRANCH_ID)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (!includeInactive) {
    query = query.eq("status", "ACTIVE");
  }

  if (searchQuery && searchQuery.trim() !== "") {
    const q = searchQuery.trim();
    // Tìm kiếm server-side theo full_name, phone, role
    query = query.or(
      `full_name.ilike.%${q}%,phone.ilike.%${q}%,role.ilike.%${q}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(
      `Lỗi khi lấy dữ liệu nhân viên từ Supabase: ${error.message}`,
    );
  }

  return (data as StaffMemberDomain[]) || [];
};

/**
 * Lấy chi tiết nhân viên theo id
 */
export const getStaffById = async (id: string): Promise<StaffMemberDomain> => {
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .eq("id", id)
    .eq("organization_id", DEFAULT_ORG_ID)
    .eq("branch_id", DEFAULT_BRANCH_ID)
    .single();

  if (error) {
    throw new Error(`Lỗi khi lấy thông tin nhân viên: ${error.message}`);
  }

  return data as StaffMemberDomain;
};

/**
 * Tạo mới nhân viên trực tiếp vào public.staff
 */
export const createStaff = async (
  input: CreateStaffInput,
): Promise<StaffMemberDomain> => {
  const payload = {
    organization_id: DEFAULT_ORG_ID,
    branch_id: DEFAULT_BRANCH_ID,
    profile_id: input.profile_id ?? null,
    full_name: input.full_name,
    role: input.role,
    phone: input.phone,
    status: input.status || "ACTIVE",
    started_on: input.started_on || new Date().toISOString().split("T")[0],
  };

  const { data, error } = await supabase
    .from("staff")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(`Lỗi khi thêm nhân viên mới: ${error.message}`);
  }

  return data as StaffMemberDomain;
};

/**
 * Cập nhật thông tin nhân viên
 */
export const updateStaff = async (
  id: string,
  input: UpdateStaffInput,
): Promise<StaffMemberDomain> => {
  const payload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (input.full_name !== undefined) payload.full_name = input.full_name;
  if (input.role !== undefined) payload.role = input.role;
  if (input.phone !== undefined) payload.phone = input.phone;
  if (input.status !== undefined) payload.status = input.status;
  if (input.started_on !== undefined) payload.started_on = input.started_on;
  if (input.profile_id !== undefined) payload.profile_id = input.profile_id;

  const { data, error } = await supabase
    .from("staff")
    .update(payload)
    .eq("id", id)
    .eq("organization_id", DEFAULT_ORG_ID)
    .eq("branch_id", DEFAULT_BRANCH_ID)
    .select()
    .single();

  if (error) {
    throw new Error(`Lỗi khi cập nhật nhân viên: ${error.message}`);
  }

  return data as StaffMemberDomain;
};

/**
 * Đổi trạng thái ACTIVE / INACTIVE
 */
export const updateStaffStatus = async (
  id: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<StaffMemberDomain> => {
  return updateStaff(id, { status });
};

/**
 * Soft Archive nhân viên (đặt archived_at)
 */
export const archiveStaff = async (id: string): Promise<StaffMemberDomain> => {
  const { data, error } = await supabase
    .from("staff")
    .update({
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", DEFAULT_ORG_ID)
    .eq("branch_id", DEFAULT_BRANCH_ID)
    .select()
    .single();

  if (error) {
    throw new Error(`Lỗi khi lưu trữ nhân viên: ${error.message}`);
  }

  return data as StaffMemberDomain;
};

============================================================
FILE: src/services/supabase.ts
============================================================
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const DEFAULT_ORG_ID = "4fc2ef26-2fa6-43c1-9e7f-7362ac747a26";
export const DEFAULT_BRANCH_ID = "677f6f26-77d1-4a26-ab13-7c2f5a2994f9";
