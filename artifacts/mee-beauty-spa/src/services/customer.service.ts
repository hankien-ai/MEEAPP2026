// src/services/customer.service.ts
import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";
import {
  Customer,
  CustomerPhoto,
  CustomerPackage,
  ServiceSession,
  Invoice,
  PhotoType,
  CustomerPackageItem,
} from "../types/domain";

export type CustomerInput = {
  full_name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  gender?: string | null;
  birthday?: string | null;
  notes?: string | null;
  total_spend?: number;
  total_spent?: number;
  total_visits?: number;
};

// ============ VALIDATION ============

export function isValidPhone(phone: string): boolean {
  return /^0\d{9}$/.test(phone);
}

export async function isPhoneExists(phone: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("customers")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

// ============ CUSTOMER CRUD ============

export async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Customer[]) || [];
}

export async function fetchCustomerById(id: string): Promise<Customer | null> {
  if (!id) return null;
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Customer;
}

export async function createCustomer(payload: CustomerInput): Promise<Customer> {
  if (!payload.phone) throw new Error("Số điện thoại là bắt buộc");
  if (!isValidPhone(payload.phone)) {
    throw new Error("Số điện thoại phải bắt đầu bằng 0 và đúng 10 số");
  }
  const exists = await isPhoneExists(payload.phone);
  if (exists) throw new Error("Số điện thoại này đã được đăng ký.");

  const insertData: any = {
    organization_id: DEFAULT_ORG_ID,
    branch_id: DEFAULT_BRANCH_ID,
    full_name: payload.full_name || "Khách hàng mới",
    name: payload.full_name || "Khách hàng mới",
    phone: payload.phone,
    total_spend: 0,
    total_spent: 0,
    total_visits: 0,
    updated_at: new Date().toISOString(),
  };
  if (payload.email) insertData.email = payload.email;
  if (payload.address) insertData.address = payload.address;
  if (payload.gender) insertData.gender = payload.gender;
  if (payload.birthday) insertData.birthday = payload.birthday;
  if (payload.notes) insertData.notes = payload.notes;

  const { data, error } = await supabase
    .from("customers")
    .insert([insertData])
    .select()
    .single();
  if (error) throw new Error(`Không thể tạo khách hàng: ${error.message}`);
  return data as Customer;
}

export async function updateCustomer(id: string, payload: Partial<CustomerInput>): Promise<Customer> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (payload.full_name !== undefined) {
    updateData.full_name = payload.full_name;
    updateData.name = payload.full_name;
  }
  if (payload.phone !== undefined) {
    if (!isValidPhone(payload.phone)) {
      throw new Error("Số điện thoại phải bắt đầu bằng 0 và đúng 10 số");
    }
    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", payload.phone)
      .neq("id", id)
      .maybeSingle();
    if (existing) throw new Error("Số điện thoại này đã được đăng ký bởi khách hàng khác.");
    updateData.phone = payload.phone;
  }
  if (payload.email !== undefined) updateData.email = payload.email;
  if (payload.address !== undefined) updateData.address = payload.address;
  if (payload.gender !== undefined) updateData.gender = payload.gender;
  if (payload.birthday !== undefined) updateData.birthday = payload.birthday;
  if (payload.notes !== undefined) updateData.notes = payload.notes;

  const { data, error } = await supabase
    .from("customers")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Không thể cập nhật khách hàng: ${error.message}`);
  return data as Customer;
}

export async function deleteCustomer(id: string): Promise<boolean> {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw new Error(`Không thể xóa khách hàng: ${error.message}`);
  return true;
}

// ============ CUSTOMER PHOTOS ============

export async function fetchCustomerPhotos(customerId: string): Promise<CustomerPhoto[]> {
  const { data, error } = await supabase
    .from("customer_photos")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error) return [];
  const photos = (data as CustomerPhoto[]) || [];
  const mappedPhotos = photos.map((photo) => ({
    ...photo,
    photo_type: (photo.caption as PhotoType) || "BEFORE",
    notes: photo.notes || null,
  }));
  const photosWithSignedUrls = await Promise.all(
    mappedPhotos.map(async (photo) => {
      if (!photo.storage_path) return photo;
      try {
        const { data: signedData } = await supabase.storage
          .from("customer-photos")
          .createSignedUrl(photo.storage_path, 3600);
        return { ...photo, signed_url: signedData?.signedUrl };
      } catch (e) {
        return photo;
      }
    })
  );
  return photosWithSignedUrls;
}

export async function uploadCustomerPhoto(
  customerId: string,
  file: File,
  photoType: PhotoType = "BEFORE",
  notes?: string
): Promise<CustomerPhoto> {
  let fileToUpload = file;
  try {
    if (file.size > 1024 * 1024) {
      const compressed = await compressImage(file);
      if (compressed) fileToUpload = compressed;
    }
  } catch (e) {
    console.warn("Compression failed:", e);
  }
  const fileExt = fileToUpload.name.split(".").pop() || "jpg";
  const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const storagePath = `${customerId}/${cleanFileName}`;
  const { error: uploadError } = await supabase.storage
    .from("customer-photos")
    .upload(storagePath, fileToUpload, { cacheControl: "3600", upsert: false });
  if (uploadError) throw new Error(`Không thể tải ảnh lên: ${uploadError.message}`);
  const insertPayload = {
    organization_id: DEFAULT_ORG_ID,
    branch_id: DEFAULT_BRANCH_ID,
    customer_id: customerId,
    storage_path: storagePath,
    caption: photoType,
    notes: notes || null,
    is_primary: false,
  };
  const { data, error: dbError } = await supabase
    .from("customer_photos")
    .insert([insertPayload])
    .select()
    .single();
  if (dbError) {
    await supabase.storage.from("customer-photos").remove([storagePath]);
    throw new Error(`Không thể lưu thông tin ảnh: ${dbError.message}`);
  }
  const { data: signedData } = await supabase.storage
    .from("customer-photos")
    .createSignedUrl(storagePath, 3600);
  return {
    ...(data as CustomerPhoto),
    photo_type: photoType,
    signed_url: signedData?.signedUrl,
  };
}

export async function deleteCustomerPhoto(photoId: string, storagePath: string): Promise<boolean> {
  if (storagePath) {
    await supabase.storage.from("customer-photos").remove([storagePath]);
  }
  const { error: dbError } = await supabase.from("customer_photos").delete().eq("id", photoId);
  if (dbError) throw new Error(`Không thể xóa ảnh: ${dbError.message}`);
  return true;
}

async function compressImage(file: File): Promise<File | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 1600;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, ".jpg"),
                { type: "image/jpeg" }
              );
              resolve(compressedFile);
            } else {
              resolve(null);
            }
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => resolve(null);
    };
    reader.onerror = () => resolve(null);
  });
}

// ============ CUSTOMER PACKAGES ============

export async function fetchCustomerPackages(customerId: string): Promise<CustomerPackage[]> {
  const { data, error } = await supabase
    .from("customer_packages")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as CustomerPackage[]) || [];
}

export async function fetchCustomerPackageItems(customerPackageId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from("customer_package_items")
    .select(`
      *,
      services:service_id (
        id,
        catalog_item_id,
        catalog_item:catalog_items (name, code)
      )
    `)
    .eq("customer_package_id", customerPackageId);

  if (error) {
    console.error("Lỗi fetchCustomerPackageItems:", error);
    const fallback = await supabase
      .from("customer_package_items")
      .select("*")
      .eq("customer_package_id", customerPackageId);
    if (fallback.error) return [];
    return fallback.data || [];
  }

  const items = (data || []).map((item: any) => {
    const serviceName = item.services?.catalog_item?.name || "Dịch vụ";
    return {
      ...item,
      service_name: serviceName,
      services: undefined,
    };
  });
  return items;
}

export async function fetchCustomerPackageWithItems(customerId: string): Promise<(CustomerPackage & { items: any[] })[]> {
  const packages = await fetchCustomerPackages(customerId);
  const result = await Promise.all(
    packages.map(async (pkg) => {
      const items = await fetchCustomerPackageItems(pkg.id);
      return { ...pkg, items };
    })
  );
  return result;
}

// ============ PACKAGE USAGE ============

export async function usePackageSessionV2(
  customerPackageItemId: string,
  staffId?: string,
  notes?: string
): Promise<{ success: boolean; message: string; remaining_quantity: number }> {
  try {
    console.log("📦 Gọi RPC use_package_session_v2 với ID:", customerPackageItemId);

    const { data, error } = await supabase.rpc("use_package_session_v2", {
      p_customer_package_item_id: customerPackageItemId,
      p_staff_id: staffId || null,
      p_notes: notes || null,
    });

    if (error) {
      console.error("❌ RPC use_package_session_v2 error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return {
        success: false,
        message: error.message || "Lỗi sử dụng package",
        remaining_quantity: 0,
      };
    }

    console.log("✅ RPC use_package_session_v2 raw data:", data);

    const result = Array.isArray(data) && data.length > 0 ? data[0] : data;

    if (!result) {
      console.error("❌ RPC không trả về kết quả");
      return {
        success: false,
        message: "Không nhận được phản hồi từ server",
        remaining_quantity: 0,
      };
    }

    console.log("📦 Kết quả RPC đã parse:", result);

    return {
      success: result.success === true,
      message: result.message || (result.success === true ? "Sử dụng thành công" : "Lỗi sử dụng package"),
      remaining_quantity: Number(result.remaining_quantity ?? 0),
    };
  } catch (err: any) {
    console.error("❌ RPC use_package_session_v2 exception:", err);
    return {
      success: false,
      message: err.message || "Lỗi kết nối",
      remaining_quantity: 0,
    };
  }
}

export async function usePackageSession(
  customerPackageId: string,
  customerPackageItemId: string,
  serviceId: string,
  staffId?: string,
  notes?: string
): Promise<{ success: boolean; message: string; remaining_quantity: number }> {
  return usePackageSessionV2(customerPackageItemId, staffId, notes);
}

export const usePackageSessionLegacy = usePackageSession;

// ============ SERVICE HISTORY ============

export async function fetchCustomerServiceHistory(customerId: string): Promise<ServiceSession[]> {
  const { data, error } = await supabase
    .from("service_sessions")
    .select(`
      *,
      catalog_items:catalog_item_id (id, name, price)
    `)
    .eq("customer_id", customerId)
    .order("performed_at", { ascending: false });

  if (error) {
    console.error("Lỗi fetchCustomerServiceHistory:", error);
    const fallback = await supabase
      .from("service_sessions")
      .select("*")
      .eq("customer_id", customerId)
      .order("performed_at", { ascending: false });
    if (fallback.error) return [];
    return (fallback.data || []).map((s: any) => ({ ...s, catalog_item: null }));
  }
  return (data || []) as ServiceSession[];
}

// ============ INVOICES ============

export async function fetchCustomerInvoices(customerId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      items:invoice_items (
        id,
        catalog_item_id,
        package_id,
        actual_service_id,
        description,
        quantity,
        unit_price,
        discount_amount,
        total_amount,
        is_gift,
        performing_staff_id
      )
    `)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as Invoice[]) || [];
}

// ============ STATS ============

export async function fetchCustomerStats(customerId: string): Promise<{
  total_spending: number;
  total_visits: number;
  last_visit: string | null;
}> {
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("total_amount, created_at")
    .eq("customer_id", customerId)
    .in("status", ["PAID", "PARTIALLY_PAID"])
    .order("created_at", { ascending: false });
  if (error) {
    return { total_spending: 0, total_visits: 0, last_visit: null };
  }
  const total_spending = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
  const total_visits = invoices?.length || 0;
  const last_visit = invoices?.[0]?.created_at || null;
  return { total_spending, total_visits, last_visit };
}

// ============ DEBT PAYMENT ============

export async function payCustomerDebt(
  customerId: string,
  amount: number,
  paymentMethod: string,
  notes?: string
): Promise<{ success: boolean; remainingDebt: number; message: string }> {
  if (!customerId) throw new Error("Không có khách hàng");
  if (amount <= 0) throw new Error("Số tiền thanh toán phải lớn hơn 0");

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id, total_amount, paid_amount, status")
    .eq("customer_id", customerId)
    .eq("organization_id", DEFAULT_ORG_ID)
    .eq("branch_id", DEFAULT_BRANCH_ID)
    .eq("status", "PARTIALLY_PAID")
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Không thể lấy danh sách nợ: ${error.message}`);
  if (!invoices || invoices.length === 0) {
    return { success: false, remainingDebt: 0, message: "Khách hàng không có nợ" };
  }

  let remainingAmount = amount;
  const updates = [];

  for (const inv of invoices) {
    const debt = inv.total_amount - (inv.paid_amount || 0);
    if (debt <= 0) continue;

    if (remainingAmount >= debt) {
      updates.push({
        id: inv.id,
        paid_amount: inv.total_amount,
        status: "PAID",
        updated_at: new Date().toISOString(),
      });
      remainingAmount -= debt;
    } else {
      updates.push({
        id: inv.id,
        paid_amount: (inv.paid_amount || 0) + remainingAmount,
        status: "PARTIALLY_PAID",
        updated_at: new Date().toISOString(),
      });
      remainingAmount = 0;
      break;
    }
  }

  for (const upd of updates) {
    const { error: updErr } = await supabase
      .from("invoices")
      .update({
        paid_amount: upd.paid_amount,
        status: upd.status,
        updated_at: upd.updated_at,
      })
      .eq("id", upd.id);
    if (updErr) throw new Error(`Lỗi cập nhật hóa đơn: ${updErr.message}`);
  }

  const { data: remainingInvoices } = await supabase
    .from("invoices")
    .select("total_amount, paid_amount")
    .eq("customer_id", customerId)
    .eq("organization_id", DEFAULT_ORG_ID)
    .eq("branch_id", DEFAULT_BRANCH_ID)
    .eq("status", "PARTIALLY_PAID");

  const remainingDebt = (remainingInvoices || []).reduce(
    (sum, inv) => sum + (inv.total_amount - (inv.paid_amount || 0)),
    0
  );

  console.log("💳 Thanh toán nợ:", {
    customerId,
    amount,
    paymentMethod,
    remainingDebt,
    notes,
  });

  return {
    success: true,
    remainingDebt,
    message: `Đã thanh toán ${amount.toLocaleString()}đ. Còn nợ ${remainingDebt.toLocaleString()}đ.`,
  };
}

// ============ EXPORTS ============

export const getCustomers = fetchCustomers;
export const getCustomerById = fetchCustomerById;
export const getCustomer = fetchCustomerById;

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
  fetchCustomerPackages,
  fetchCustomerPackageItems,
  fetchCustomerPackageWithItems,
  fetchCustomerPhotos,
  uploadCustomerPhoto,
  deleteCustomerPhoto,
  fetchCustomerServiceHistory,
  fetchCustomerInvoices,
  fetchCustomerStats,
  usePackageSessionV2,
  usePackageSession,
  usePackageSessionLegacy,
  isValidPhone,
  isPhoneExists,
  payCustomerDebt,
};

export default customerService;