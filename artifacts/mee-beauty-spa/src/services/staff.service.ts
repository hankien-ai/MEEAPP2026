import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";
import {
  StaffMemberDomain,
  CreateStaffInput,
  UpdateStaffInput,
} from "../types/domain";

/**
 * Tải danh sách nhân viên
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
 * Lấy chi tiết nhân viên
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
 * Tạo mới nhân viên
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
    base_salary: input.base_salary ?? 0,
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
 * Cập nhật thông tin nhân viên (bao gồm lương)
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
  if (input.base_salary !== undefined) payload.base_salary = input.base_salary;
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
 * Đổi trạng thái
 */
export const updateStaffStatus = async (
  id: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<StaffMemberDomain> => {
  return updateStaff(id, { status });
};

/**
 * Lưu trữ nhân viên
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