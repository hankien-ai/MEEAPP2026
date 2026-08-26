// src/services/staff.service.ts
import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";
import {
  StaffMemberDomain,
  CreateStaffInput,
  UpdateStaffInput,
} from "../types/domain";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

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
  if (error) throw new Error(`Lỗi khi lấy dữ liệu nhân viên: ${error.message}`);
  return (data as StaffMemberDomain[]) || [];
};

export const getStaffById = async (id: string): Promise<StaffMemberDomain> => {
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .eq("id", id)
    .eq("organization_id", DEFAULT_ORG_ID)
    .eq("branch_id", DEFAULT_BRANCH_ID)
    .single();
  if (error) throw new Error(`Lỗi khi lấy thông tin nhân viên: ${error.message}`);
  return data as StaffMemberDomain;
};

export const createStaff = async (input: CreateStaffInput): Promise<StaffMemberDomain> => {
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
  const { data, error } = await supabase.from("staff").insert(payload).select().single();
  if (error) throw new Error(`Lỗi khi thêm nhân viên mới: ${error.message}`);
  return data as StaffMemberDomain;
};

export const updateStaff = async (id: string, input: UpdateStaffInput): Promise<StaffMemberDomain> => {
  const payload: Record<string, any> = { updated_at: new Date().toISOString() };
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
  if (error) throw new Error(`Lỗi khi cập nhật nhân viên: ${error.message}`);
  return data as StaffMemberDomain;
};

export const updateStaffStatus = async (id: string, status: "ACTIVE" | "INACTIVE"): Promise<StaffMemberDomain> => {
  return updateStaff(id, { status });
};

export const archiveStaff = async (id: string): Promise<StaffMemberDomain> => {
  const { data, error } = await supabase
    .from("staff")
    .update({ archived_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("organization_id", DEFAULT_ORG_ID)
    .eq("branch_id", DEFAULT_BRANCH_ID)
    .select()
    .single();
  if (error) throw new Error(`Lỗi khi lưu trữ nhân viên: ${error.message}`);
  return data as StaffMemberDomain;
};

// ============ STAFF DETAIL STATS (sửa lỗi join) ============

export interface StaffDetailStats {
  total_working_days: number;
  total_leave_days: number;
  total_invoices: number;
  total_services: number;
  total_service_revenue: number;
  total_commission: number;
  paid_commission: number;
  unpaid_commission: number;
}

export interface StaffAttendanceDay {
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string | null;
  notes: string | null;
}

export interface StaffInvoiceItem {
  id: string;
  invoice_code: string;
  customer_name: string;
  created_at: string;
  total_amount: number;
  payment_method: string;
  status: string;
  items: any[];
  commission_amount?: number;
}

export interface StaffCommissionItem {
  id: string;
  invoice_id: string;
  invoice_code: string;
  commission_type: string;
  amount: number;
  description: string;
  created_at: string;
  service_name?: string;
  customer_name?: string;
}

/**
 * Lấy thống kê của nhân viên trong tháng
 */
export const getStaffDetailStats = async (
  staffId: string,
  month: number,
  year: number
): Promise<StaffDetailStats> => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];
  const startTimestamp = startDate.toISOString();
  const endTimestamp = endDate.toISOString();

  // 1. Attendance
  const { data: attendances, error: attErr } = await supabase
    .from("attendance")
    .select("*")
    .eq("staff_id", staffId)
    .gte("work_date", startStr)
    .lte("work_date", endStr);
  if (attErr) throw attErr;

  const workingDays = (attendances || []).filter(a => a.check_in !== null).length;
  const leaveDays = (attendances || []).filter(a => a.check_in === null).length;

  // 2. Invoices – lấy từ invoice_items, sau đó query riêng từng invoice để tránh join lỗi
  const { data: invoiceItems, error: invErr } = await supabase
    .from("invoice_items")
    .select("invoice_id, total_amount, created_at")
    .eq("performing_staff_id", staffId)
    .gte("created_at", startTimestamp)
    .lte("created_at", endTimestamp);
  if (invErr) throw invErr;

  // Lấy danh sách invoice_id duy nhất
  const invoiceIds = [...new Set((invoiceItems || []).map(item => item.invoice_id).filter(Boolean))];

  let totalInvoices = 0;
  let totalServiceRevenue = 0;

  if (invoiceIds.length > 0) {
    // Query từng invoice (không join)
    const { data: invoices, error: invDetailErr } = await supabase
      .from("invoices")
      .select("id, total_amount, payment_method, status, customer_id")
      .in("id", invoiceIds);
    if (invDetailErr) throw invDetailErr;
    totalInvoices = invoices?.length || 0;
    totalServiceRevenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
  }

  // 3. Service sessions
  const { data: sessions, error: sessErr } = await supabase
    .from("service_sessions")
    .select("*")
    .eq("staff_id", staffId)
    .gte("performed_at", startTimestamp)
    .lte("performed_at", endTimestamp);
  if (sessErr) throw sessErr;
  const totalServices = (sessions || []).length;

  // 4. Commission logs – không join, query riêng
  const { data: commissions, error: commErr } = await supabase
    .from("commission_logs")
    .select("*")
    .eq("staff_id", staffId)
    .gte("created_at", startTimestamp)
    .lte("created_at", endTimestamp);
  if (commErr) throw commErr;

  const totalCommission = (commissions || []).reduce((sum, c) => sum + (c.amount || 0), 0);
  // Giả định chưa có phân biệt paid/unpaid, tạm để cả hai bằng 0
  const paidCommission = 0;
  const unpaidCommission = totalCommission;

  return {
    total_working_days: workingDays,
    total_leave_days: leaveDays,
    total_invoices: totalInvoices,
    total_services: totalServices,
    total_service_revenue: totalServiceRevenue,
    total_commission: totalCommission,
    paid_commission: paidCommission,
    unpaid_commission: unpaidCommission,
  };
};

/**
 * Lấy lịch chấm công của nhân viên trong tháng (từng ngày)
 */
export const getStaffAttendanceCalendar = async (
  staffId: string,
  month: number,
  year: number
): Promise<StaffAttendanceDay[]> => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("staff_id", staffId)
    .gte("work_date", startStr)
    .lte("work_date", endStr)
    .order("work_date", { ascending: true });
  if (error) throw error;

  const attMap = new Map<string, any>();
  (data || []).forEach((att: any) => {
    attMap.set(att.work_date, att);
  });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const att = attMap.get(dateStr);
    return {
      date: dateStr,
      check_in: att?.check_in || null,
      check_out: att?.check_out || null,
      status: att?.status || null,
      notes: att?.notes || null,
    };
  });
};

/**
 * Lấy danh sách hóa đơn của nhân viên trong tháng (với chi tiết)
 */
export const getStaffInvoices = async (
  staffId: string,
  month: number,
  year: number
): Promise<StaffInvoiceItem[]> => {
  const startTimestamp = new Date(year, month - 1, 1).toISOString();
  const endTimestamp = new Date(year, month, 0, 23, 59, 59).toISOString();

  // Lấy invoice_items của staff
  const { data: invoiceItems, error: invErr } = await supabase
    .from("invoice_items")
    .select("invoice_id, total_amount, created_at")
    .eq("performing_staff_id", staffId)
    .gte("created_at", startTimestamp)
    .lte("created_at", endTimestamp)
    .order("created_at", { ascending: false });
  if (invErr) throw invErr;

  const invoiceIds = [...new Set((invoiceItems || []).map(item => item.invoice_id).filter(Boolean))];
  if (invoiceIds.length === 0) return [];

  // Lấy thông tin invoices
  const { data: invoices, error: invDetailErr } = await supabase
    .from("invoices")
    .select("id, total_amount, payment_method, status, created_at, customer_id")
    .in("id", invoiceIds)
    .order("created_at", { ascending: false });
  if (invDetailErr) throw invDetailErr;

  // Lấy tên khách hàng (nếu có)
  const customerIds = invoices?.map(inv => inv.customer_id).filter(Boolean) || [];
  let customerMap = new Map();
  if (customerIds.length > 0) {
    const { data: customers } = await supabase
      .from("customers")
      .select("id, full_name")
      .in("id", customerIds);
    (customers || []).forEach((c: any) => {
      customerMap.set(c.id, c.full_name);
    });
  }

  // Lấy commission cho từng invoice
  const { data: comms } = await supabase
    .from("commission_logs")
    .select("invoice_id, amount")
    .eq("staff_id", staffId)
    .in("invoice_id", invoiceIds);
  const commMap = new Map<string, number>();
  (comms || []).forEach((c: any) => {
    const current = commMap.get(c.invoice_id) || 0;
    commMap.set(c.invoice_id, current + c.amount);
  });

  return (invoices || []).map((inv: any) => ({
    id: inv.id,
    invoice_code: inv.id.slice(0, 8), // không có code, dùng id
    customer_name: customerMap.get(inv.customer_id) || "Khách vãng lai",
    created_at: inv.created_at,
    total_amount: inv.total_amount || 0,
    payment_method: inv.payment_method || "CASH",
    status: inv.status || "PAID",
    items: [],
    commission_amount: commMap.get(inv.id) || 0,
  }));
};

/**
 * Lấy danh sách hoa hồng của nhân viên trong tháng
 */
export const getStaffCommissions = async (
  staffId: string,
  month: number,
  year: number
): Promise<StaffCommissionItem[]> => {
  const startTimestamp = new Date(year, month - 1, 1).toISOString();
  const endTimestamp = new Date(year, month, 0, 23, 59, 59).toISOString();

  const { data, error } = await supabase
    .from("commission_logs")
    .select("*")
    .eq("staff_id", staffId)
    .gte("created_at", startTimestamp)
    .lte("created_at", endTimestamp)
    .order("created_at", { ascending: false });
  if (error) throw error;

  // Lấy thông tin invoice và customer cho từng commission (không join)
  const invoiceIds = [...new Set((data || []).map(c => c.invoice_id).filter(Boolean))];
  let invoiceMap = new Map();
  let customerMap = new Map();

  if (invoiceIds.length > 0) {
    const { data: invoices } = await supabase
      .from("invoices")
      .select("id, customer_id")
      .in("id", invoiceIds);
    (invoices || []).forEach((inv: any) => {
      invoiceMap.set(inv.id, inv);
    });

    const customerIds = invoices?.map(inv => inv.customer_id).filter(Boolean) || [];
    if (customerIds.length > 0) {
      const { data: customers } = await supabase
        .from("customers")
        .select("id, full_name")
        .in("id", customerIds);
      (customers || []).forEach((c: any) => {
        customerMap.set(c.id, c.full_name);
      });
    }
  }

  return (data || []).map((c: any) => {
    const inv = invoiceMap.get(c.invoice_id);
    return {
      id: c.id,
      invoice_id: c.invoice_id,
      invoice_code: c.invoice_id?.slice(0, 8) || "N/A",
      commission_type: c.commission_type || "PERFORMANCE",
      amount: c.amount || 0,
      description: c.description || "",
      created_at: c.created_at,
      customer_name: inv ? customerMap.get(inv.customer_id) || "Khách vãng lai" : "Khách vãng lai",
    };
  });
};

/**
 * Lấy hoạt động gần đây của nhân viên (tối đa 20)
 */
export const getStaffRecentActivity = async (staffId: string, limit: number = 20) => {
  const activities: any[] = [];

  // Lấy service sessions
  const { data: sessions } = await supabase
    .from("service_sessions")
    .select(`
      id,
      performed_at,
      catalog_items:catalog_item_id (name),
      customers:customer_id (full_name)
    `)
    .eq("staff_id", staffId)
    .order("performed_at", { ascending: false })
    .limit(limit);
  if (sessions) {
    sessions.forEach((s: any) => {
      activities.push({
        type: "SERVICE",
        id: s.id,
        time: s.performed_at,
        title: `Thực hiện dịch vụ`,
        description: `${s.customers?.full_name || "Khách"} - ${s.catalog_items?.name || "Dịch vụ"}`,
        icon: "💆"
      });
    });
  }

  // Lấy check-in/out
  const { data: attendances } = await supabase
    .from("attendance")
    .select("work_date, check_in, check_out")
    .eq("staff_id", staffId)
    .order("work_date", { ascending: false })
    .limit(limit);
  if (attendances) {
    attendances.forEach((a: any) => {
      if (a.check_in) {
        activities.push({
          type: "CHECK_IN",
          id: a.work_date + "-in",
          time: a.check_in,
          title: "Chấm công vào",
          description: format(new Date(a.check_in), "HH:mm"),
          icon: "🟢"
        });
      }
      if (a.check_out) {
        activities.push({
          type: "CHECK_OUT",
          id: a.work_date + "-out",
          time: a.check_out,
          title: "Chấm công ra",
          description: format(new Date(a.check_out), "HH:mm"),
          icon: "🔴"
        });
      }
    });
  }

  activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  return activities.slice(0, limit);
};