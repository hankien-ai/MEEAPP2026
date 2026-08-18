import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";
import {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../types/domain";

export const customerService = {
  // 1. Fetch active customers with server-side search
  async getCustomers(searchQuery?: string): Promise<Customer[]> {
    let query = supabase
      .from("customers")
      .select("*")
      .eq("organization_id", DEFAULT_ORG_ID)
      .eq("branch_id", DEFAULT_BRANCH_ID)
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    if (searchQuery && searchQuery.trim() !== "") {
      const term = searchQuery.trim();
      query = query.or(`full_name.ilike.%${term}%,phone.ilike.%${term}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Lỗi tải dữ liệu Supabase: ${error.message}`);
    }

    return (data as Customer[]) || [];
  },

  // 2. Fetch single customer for profile view
  async getCustomerById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .eq("organization_id", DEFAULT_ORG_ID)
      .eq("branch_id", DEFAULT_BRANCH_ID)
      .is("archived_at", null)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Lỗi tải thông tin khách hàng: ${error.message}`);
    }

    return data as Customer;
  },

  // 3. Create customer
  async createCustomer(input: CreateCustomerInput): Promise<Customer> {
    const payload = {
      ...input,
      organization_id: DEFAULT_ORG_ID,
      branch_id: DEFAULT_BRANCH_ID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("customers")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Lỗi tạo khách hàng: ${error.message}`);
    }

    return data as Customer;
  },

  // 4. Update customer (giữ nguyên org_id & branch_id)
  async updateCustomer(
    id: string,
    input: UpdateCustomerInput,
  ): Promise<Customer> {
    const payload = {
      ...input,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("customers")
      .update(payload)
      .eq("id", id)
      .eq("organization_id", DEFAULT_ORG_ID)
      .eq("branch_id", DEFAULT_BRANCH_ID)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Lỗi cập nhật khách hàng: ${error.message}`);
    }

    return data as Customer;
  },

  // 5. Soft Archive customer
  async archiveCustomer(id: string): Promise<void> {
    const { error } = await supabase
      .from("customers")
      .update({
        archived_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("organization_id", DEFAULT_ORG_ID)
      .eq("branch_id", DEFAULT_BRANCH_ID);

    if (error) {
      throw new Error(`Lỗi lưu trữ khách hàng: ${error.message}`);
    }
  },
};
