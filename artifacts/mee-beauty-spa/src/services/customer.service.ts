import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";
import { Customer } from "../types/domain";

export type CustomerInput = {
  organization_id?: string;
  branch_id?: string;
  full_name?: string;
  name?: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  birth_date?: string | null;
  total_spend?: number;
  last_visit?: string | null;
};

// --- CORE IMPLEMENTATIONS ---

export async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customers from Supabase:", error);
    throw new Error(
      error.message || "Lỗi tải danh sách khách hàng từ cơ sở dữ liệu",
    );
  }

  return (data as Customer[]) || [];
}

export async function fetchCustomerById(id: string): Promise<Customer | null> {
  if (!id) return null;

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching customer with id ${id}:`, error);
    throw new Error(error.message || "Lỗi tải thông tin chi tiết khách hàng");
  }

  return data as Customer;
}

export async function createCustomer(
  payload: CustomerInput,
): Promise<Customer> {
  const fullName = payload.full_name || payload.name || "Khách hàng mới";

  // Tự động đính kèm context Organization & Branch từ Source of Truth
  const insertData: Record<string, unknown> = {
    organization_id: payload.organization_id || DEFAULT_ORG_ID,
    branch_id: payload.branch_id || DEFAULT_BRANCH_ID,
    full_name: fullName,
    phone: payload.phone,
  };

  const { data, error } = await supabase
    .from("customers")
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error("Error creating customer in Supabase:", error);
    throw new Error(
      error.message || "Không thể tạo khách hàng trong cơ sở dữ liệu",
    );
  }

  return data as Customer;
}

export async function updateCustomer(
  id: string,
  payload: Partial<CustomerInput>,
): Promise<Customer> {
  const updateData: Record<string, unknown> = {};

  const fullName = payload.full_name || payload.name;
  if (fullName) {
    updateData.full_name = fullName;
  }
  if (payload.phone) {
    updateData.phone = payload.phone;
  }

  const { data, error } = await supabase
    .from("customers")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating customer ${id}:`, error);
    throw new Error(error.message || "Không thể cập nhật thông tin khách hàng");
  }

  return data as Customer;
}

export async function deleteCustomer(id: string): Promise<boolean> {
  const { error } = await supabase.from("customers").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting customer ${id}:`, error);
    throw new Error(error.message || "Không thể xóa khách hàng");
  }

  return true;
}

// Alias helper
export const getCustomers = fetchCustomers;
export const getCustomerById = fetchCustomerById;

// --- OBJECT & DEFAULT EXPORTS ---

export const customerService = {
  getAll: fetchCustomers,
  getById: fetchCustomerById,
  create: createCustomer,
  update: updateCustomer,
  delete: deleteCustomer,
  fetchCustomers,
  fetchCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomers,
  getCustomerById,
};

export default customerService;
