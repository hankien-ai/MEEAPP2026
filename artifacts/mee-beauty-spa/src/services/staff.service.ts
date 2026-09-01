// src/services/staff.service.ts
import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";
import {
  StaffMemberDomain,
  CreateStaffInput,
  UpdateStaffInput,
} from "../types/domain";
import { format, eachDayOfInterval } from "date-fns";

// ============================================================
// HÀM BỎ DẤU (removeAccents)
// ============================================================
function removeAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

// ============================================================
// FETCH STAFF – CÓ HỖ TRỢ ARCHIVED VÀ TÌM KIẾM KHÔNG DẤU
// ============================================================
export const fetchStaff = async (
  searchQuery?: string,
  includeInactive: boolean = true,
  includeArchived: boolean = false,
): Promise<StaffMemberDomain[]> => {
  let query = supabase
    .from("staff")
    .select("*")
    .eq("organization_id", DEFAULT_ORG_ID)
    .eq("branch_id", DEFAULT_BRANCH_ID);

  // Lọc archived
  if (!includeArchived) {
    query = query.is("archived_at", null);
  }

  // Lọc trạng thái
  if (!includeInactive) {
    query = query.eq("status", "ACTIVE");
  }

  // Lấy tất cả dữ liệu (không lọc search ở DB)
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw new Error(`Lỗi khi lấy dữ liệu nhân viên: ${error.message}`);

  let results = data as StaffMemberDomain[];

  // Client-side search (không dấu)
  if (searchQuery && searchQuery.trim() !== "") {
    const keyword = removeAccents(searchQuery.trim().toLowerCase());
    results = results.filter((staff) => {
      const name = removeAccents(staff.full_name.toLowerCase());
      const phone = staff.phone || "";
      const role = removeAccents(staff.role.toLowerCase());
      return name.includes(keyword) || phone.includes(keyword) || role.includes(keyword);
    });
  }

  return results;
};

// ============================================================
// CÁC HÀM KHÁC (GIỮ NGUYÊN)
// ============================================================

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

// ============================================================
// STAFF DETAIL STATS
// ============================================================

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
  commission_amount: number;
}

export interface StaffCommissionItem {
  id: string;
  invoice_id: string;
  invoice_code: string;
  commission_type: string;
  amount: number;
  description: string;
  created_at: string;
  customer_name: string;
  total_amount?: number;
}

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

  // Attendance
  const { data: attendances, error: attErr } = await supabase
    .from("attendance")
    .select("*")
    .eq("staff_id", staffId)
    .gte("work_date", startStr)
    .lte("work_date", endStr);
  if (attErr) throw attErr;
  const workingDays = (attendances || []).filter(a => a.check_in !== null).length;
  const leaveDays = (attendances || []).filter(a => a.check_in === null).length;

  // Service sessions
  const { data: sessions, error: sessErr } = await supabase
    .from("service_sessions")
    .select("*")
    .eq("staff_id", staffId)
    .gte("performed_at", startTimestamp)
    .lte("performed_at", endTimestamp);
  if (sessErr) throw sessErr;
  const totalServices = (sessions || []).length;

  // Invoices
  const { data: invoiceItems, error: invErr } = await supabase
    .from("invoice_items")
    .select(`
      invoice_id,
      total_amount,
      invoices:invoice_id (id, customer_id, total_amount, payment_method, status, customers:customer_id (full_name))
    `)
    .eq("performing_staff_id", staffId)
    .gte("created_at", startTimestamp)
    .lte("created_at", endTimestamp);
  if (invErr) throw invErr;
  const invoicesMap = new Map();
  (invoiceItems || []).forEach((item: any) => {
    const inv = item.invoices;
    if (inv && !invoicesMap.has(inv.id)) {
      invoicesMap.set(inv.id, {
        id: inv.id,
        total_amount: inv.total_amount || 0,
        customer_name: inv.customers?.full_name || "Khách vãng lai",
      });
    }
  });
  const uniqueInvoices = Array.from(invoicesMap.values());
  const totalInvoices = uniqueInvoices.length;
  const totalServiceRevenue = uniqueInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

  // Commission
  const { data: commissions, error: commErr } = await supabase
    .from("staff_commissions")
    .select("amount")
    .eq("staff_id", staffId)
    .gte("created_at", startTimestamp)
    .lte("created_at", endTimestamp);
  if (commErr) throw commErr;
  const totalCommission = (commissions || []).reduce((sum, c) => sum + Number(c.amount || 0), 0);

  return {
    total_working_days: workingDays,
    total_leave_days: leaveDays,
    total_invoices: totalInvoices,
    total_services: totalServices,
    total_service_revenue: totalServiceRevenue,
    total_commission: totalCommission,
    paid_commission: 0,
    unpaid_commission: totalCommission,
  };
};

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
  (data || []).forEach((att: any) => attMap.set(att.work_date, att));
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

export const getStaffInvoices = async (
  staffId: string,
  month: number,
  year: number
): Promise<StaffInvoiceItem[]> => {
  const startTimestamp = new Date(year, month - 1, 1).toISOString();
  const endTimestamp = new Date(year, month, 0, 23, 59, 59).toISOString();

  const { data: items, error } = await supabase
    .from("invoice_items")
    .select(`
      invoice_id,
      total_amount,
      invoices:invoice_id (id, created_at, customer_id, total_amount, payment_method, status, customers:customer_id (full_name))
    `)
    .eq("performing_staff_id", staffId)
    .gte("created_at", startTimestamp)
    .lte("created_at", endTimestamp)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Lỗi getStaffInvoices:", error);
    return [];
  }

  const invoiceIds = (items || []).map((item: any) => item.invoice_id).filter(Boolean);
  let commissionsMap = new Map<string, number>();
  if (invoiceIds.length > 0) {
    const { data: commData } = await supabase
      .from("staff_commissions")
      .select(`
        amount,
        invoice_items!inner ( invoice_id )
      `)
      .eq("staff_id", staffId)
      .eq("commission_type", "PERFORMANCE")
      .in("invoice_items.invoice_id", invoiceIds);

    if (commData) {
      commData.forEach((c: any) => {
        const invoiceId = c.invoice_items?.invoice_id;
        if (invoiceId) {
          const current = commissionsMap.get(invoiceId) || 0;
          commissionsMap.set(invoiceId, current + Number(c.amount || 0));
        }
      });
    }
  }

  return (items || [])
    .map((item: any) => {
      const inv = item.invoices;
      if (!inv) return null;
      return {
        id: inv.id,
        invoice_code: inv.id.slice(0, 8).toUpperCase(),
        customer_name: inv.customers?.full_name || "Khách vãng lai",
        created_at: inv.created_at,
        total_amount: inv.total_amount || 0,
        payment_method: inv.payment_method || "CASH",
        status: inv.status || "PAID",
        commission_amount: commissionsMap.get(inv.id) || 0,
      };
    })
    .filter(Boolean) as StaffInvoiceItem[];
};

export const getStaffCommissions = async (
  staffId: string,
  month: number,
  year: number
): Promise<StaffCommissionItem[]> => {
  const startTimestamp = new Date(year, month - 1, 1).toISOString();
  const endTimestamp = new Date(year, month, 0, 23, 59, 59).toISOString();

  const { data: comms, error } = await supabase
    .from("staff_commissions")
    .select("id, invoice_item_id, commission_type, amount, created_at")
    .eq("staff_id", staffId)
    .gte("created_at", startTimestamp)
    .lte("created_at", endTimestamp)
    .order("created_at", { ascending: false });

  if (error || !comms || comms.length === 0) {
    console.log("No commission found", error);
    return [];
  }

  const invoiceItemIds = comms.map(c => c.invoice_item_id).filter(Boolean);
  if (invoiceItemIds.length === 0) return [];

  const { data: items, error: itemsErr } = await supabase
    .from("invoice_items")
    .select(`
      id,
      invoice_id,
      total_amount,
      invoices (
        id,
        customers ( full_name )
      )
    `)
    .in("id", invoiceItemIds);

  if (itemsErr) {
    console.error("Lỗi lấy invoice_items:", itemsErr);
    return [];
  }

  const itemMap = new Map();
  items?.forEach((item: any) => {
    itemMap.set(item.id, {
      invoice_id: item.invoice_id,
      total_amount: item.total_amount,
      invoice: item.invoices,
    });
  });

  return comms.map((c: any) => {
    const itemInfo = itemMap.get(c.invoice_item_id);
    const inv = itemInfo?.invoice;
    const type = c.commission_type || "PERFORMANCE";
    let description = "";
    if (type === "SALES") description = "Hoa hồng bán hàng";
    else if (type === "PERFORMANCE") description = "Hoa hồng thực hiện dịch vụ";
    else description = "Hoa hồng";

    return {
      id: c.id,
      invoice_id: inv?.id || null,
      invoice_code: inv?.id?.slice(0, 8).toUpperCase() || "N/A",
      commission_type: type,
      amount: Number(c.amount) || 0,
      description: description,
      created_at: c.created_at,
      customer_name: inv?.customers?.full_name || "Khách vãng lai",
      total_amount: Number(itemInfo?.total_amount || 0),
    };
  });
};

export const getStaffRecentActivity = async (staffId: string, limit: number = 20) => {
  const activities: any[] = [];

  // Service sessions
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

  // Check-in/out
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
          description: new Date(a.check_in).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          icon: "🟢"
        });
      }
      if (a.check_out) {
        activities.push({
          type: "CHECK_OUT",
          id: a.work_date + "-out",
          time: a.check_out,
          title: "Chấm công ra",
          description: new Date(a.check_out).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          icon: "🔴"
        });
      }
    });
  }

  activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  return activities.slice(0, limit);
};