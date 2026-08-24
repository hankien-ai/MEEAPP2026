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
  birth_date?: string | null;
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

  if (error) {
    console.error("Error checking phone existence:", error);
    return false;
  }

  return !!data;
}

// ============ CUSTOMER CRUD ============

export async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customers from Supabase:", error);
    throw error;
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
    throw error;
  }

  return data as Customer;
}

export async function createCustomer(
  payload: CustomerInput,
): Promise<Customer> {
  if (!payload.phone) {
    throw new Error("Số điện thoại là bắt buộc");
  }

  if (!isValidPhone(payload.phone)) {
    throw new Error("Số điện thoại phải bắt đầu bằng 0 và đúng 10 số");
  }

  const exists = await isPhoneExists(payload.phone);
  if (exists) {
    throw new Error("Số điện thoại này đã được đăng ký. Vui lòng nhập số khác.");
  }

  const insertData: any = {
    organization_id: DEFAULT_ORG_ID,
    branch_id: DEFAULT_BRANCH_ID,
    full_name: payload.full_name || "Khách hàng mới",
    name: payload.full_name || "Khách hàng مới",
    phone: payload.phone,
    total_spend: 0,
    total_spent: 0,
    total_visits: 0,
    updated_at: new Date().toISOString(),
  };

  if (payload.email) insertData.email = payload.email;
  if (payload.address) insertData.address = payload.address;
  if (payload.gender) insertData.gender = payload.gender;
  if (payload.birth_date) insertData.birth_date = payload.birth_date;
  if (payload.notes) insertData.notes = payload.notes;

  const { data, error } = await supabase
    .from("customers")
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error("Error creating customer in Supabase:", error);
    throw new Error(`Không thể tạo khách hàng: ${error.message}`);
  }

  return data as Customer;
}

export async function updateCustomer(
  id: string,
  payload: Partial<CustomerInput>,
): Promise<Customer> {
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

    if (existing) {
      throw new Error("Số điện thoại này đã được đăng ký bởi khách hàng khác.");
    }
    updateData.phone = payload.phone;
  }
  if (payload.email !== undefined) updateData.email = payload.email;
  if (payload.address !== undefined) updateData.address = payload.address;
  if (payload.gender !== undefined) updateData.gender = payload.gender;
  if (payload.birth_date !== undefined) updateData.birth_date = payload.birth_date;
  if (payload.notes !== undefined) updateData.notes = payload.notes;

  const { data, error } = await supabase
    .from("customers")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating customer ${id}:`, error);
    throw new Error(`Không thể cập nhật khách hàng: ${error.message}`);
  }

  return data as Customer;
}

export async function deleteCustomer(id: string): Promise<boolean> {
  const { error } = await supabase.from("customers").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting customer ${id}:`, error);
    throw new Error(`Không thể xóa khách hàng: ${error.message}`);
  }

  return true;
}

// ============ CUSTOMER PHOTOS SERVICE ============

export async function fetchCustomerPhotos(
  customerId: string,
): Promise<CustomerPhoto[]> {
  const { data, error } = await supabase
    .from("customer_photos")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching photos for customer ${customerId}:`, error);
    return [];
  }

  const photos = (data as CustomerPhoto[]) || [];

  const photosWithSignedUrls = await Promise.all(
    photos.map(async (photo) => {
      if (!photo.storage_path) return photo;
      try {
        const { data: signedData, error: signedError } = await supabase.storage
          .from("customer-photos")
          .createSignedUrl(photo.storage_path, 3600);

        if (signedError) {
          console.error("Error creating signed URL:", signedError);
          return photo;
        }

        return {
          ...photo,
          signed_url: signedData?.signedUrl,
        };
      } catch (e) {
        console.error("Failed to generate signed URL:", e);
        return photo;
      }
    }),
  );

  return photosWithSignedUrls;
}

export async function uploadCustomerPhoto(
  customerId: string,
  file: File,
  photoType: PhotoType = "BEFORE",
  notes?: string,
): Promise<CustomerPhoto> {
  // Compress image before upload
  let fileToUpload = file;

  try {
    if (file.size > 1024 * 1024) {
      const compressed = await compressImage(file);
      if (compressed) {
        fileToUpload = compressed;
      }
    }
  } catch (e) {
    console.warn("Compression failed, using original file:", e);
  }

  const fileExt = fileToUpload.name.split(".").pop() || "jpg";
  const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const storagePath = `${customerId}/${cleanFileName}`;

  const { error: uploadError } = await supabase.storage
    .from("customer-photos")
    .upload(storagePath, fileToUpload, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Error uploading photo to storage:", uploadError);
    throw new Error(`Không thể tải ảnh lên: ${uploadError.message}`);
  }

  // CHỈ INSERT CÁC CỘT CÓ TRONG BẢNG customer_photos
  // Không có organization_id và branch_id
  const insertPayload = {
    customer_id: customerId,
    storage_path: storagePath,
    photo_type: photoType,
    notes: notes || null,
  };

  const { data, error: dbError } = await supabase
    .from("customer_photos")
    .insert([insertPayload])
    .select()
    .single();

  if (dbError) {
    console.error("Error saving photo metadata in DB:", dbError);
    // Rollback storage
    await supabase.storage.from("customer-photos").remove([storagePath]);
    throw new Error(`Không thể lưu thông tin ảnh: ${dbError.message}`);
  }

  const { data: signedData } = await supabase.storage
    .from("customer-photos")
    .createSignedUrl(storagePath, 3600);

  return {
    ...(data as CustomerPhoto),
    signed_url: signedData?.signedUrl,
  };
}

export async function deleteCustomerPhoto(
  photoId: string,
  storagePath: string,
): Promise<boolean> {
  if (storagePath) {
    const { error: storageError } = await supabase.storage
      .from("customer-photos")
      .remove([storagePath]);

    if (storageError) {
      console.warn("Storage deletion error (non-fatal):", storageError);
    }
  }

  const { error: dbError } = await supabase
    .from("customer_photos")
    .delete()
    .eq("id", photoId);

  if (dbError) {
    console.error(`Error deleting photo record ${photoId}:`, dbError);
    throw new Error(`Không thể xóa ảnh: ${dbError.message}`);
  }

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
                { type: "image/jpeg" },
              );
              resolve(compressedFile);
            } else {
              resolve(null);
            }
          },
          "image/jpeg",
          0.85,
        );
      };
      img.onerror = () => resolve(null);
    };
    reader.onerror = () => resolve(null);
  });
}

// ============ CUSTOMER PACKAGES SERVICE ============

export async function fetchCustomerPackages(
  customerId: string,
): Promise<CustomerPackage[]> {
  const { data, error } = await supabase
    .from("customer_packages")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching packages for customer ${customerId}:`, error);
    return [];
  }

  return (data as CustomerPackage[]) || [];
}

export async function fetchCustomerPackageItems(
  customerPackageId: string,
): Promise<CustomerPackageItem[]> {
  const { data, error } = await supabase
    .from("customer_package_items")
    .select(`
      *,
      services:service_id (
        id,
        name,
        catalog_item_id,
        duration_minutes
      )
    `)
    .eq("customer_package_id", customerPackageId);

  if (error) {
    console.error(`Error fetching package items for ${customerPackageId}:`, error);
    return [];
  }

  return (data as CustomerPackageItem[]) || [];
}

export async function fetchCustomerPackageWithItems(
  customerId: string,
): Promise<(CustomerPackage & { items: CustomerPackageItem[] })[]> {
  const packages = await fetchCustomerPackages(customerId);

  const result = await Promise.all(
    packages.map(async (pkg) => {
      const items = await fetchCustomerPackageItems(pkg.id);
      return {
        ...pkg,
        items,
      };
    }),
  );

  return result;
}

// ============ PACKAGE USAGE ============

export async function usePackageSessionV2(
  customerPackageItemId: string,
  staffId?: string,
  notes?: string,
): Promise<{ success: boolean; message: string; remaining_quantity: number }> {
  const { data, error } = await supabase.rpc("use_package_session_v2", {
    p_customer_package_item_id: customerPackageItemId,
    p_staff_id: staffId || null,
    p_notes: notes || null,
  });

  if (error) {
    console.error("use_package_session_v2 error:", error);
    return {
      success: false,
      message: error.message || "Lỗi sử dụng package",
      remaining_quantity: 0,
    };
  }

  return data as { success: boolean; message: string; remaining_quantity: number };
}

export async function usePackageSession(
  customerPackageId: string,
  packageItemId: string,
  serviceId: string,
  staffId?: string,
  notes?: string,
): Promise<{ success: boolean; message: string; remaining_quantity: number }> {
  const { data: cpi, error: cpiErr } = await supabase
    .from("customer_package_items")
    .select("id")
    .eq("customer_package_id", customerPackageId)
    .eq("package_item_id", packageItemId)
    .single();

  if (cpiErr || !cpi) {
    return {
      success: false,
      message: "Không tìm thấy service trong package",
      remaining_quantity: 0,
    };
  }

  return usePackageSessionV2(cpi.id, staffId, notes);
}

export const usePackageSessionLegacy = usePackageSession;

// ============ CUSTOMER SERVICE HISTORY ============

export async function fetchCustomerServiceHistory(
  customerId: string,
): Promise<ServiceSession[]> {
  const { data, error } = await supabase
    .from("service_sessions")
    .select(`
      *,
      catalog_items:catalog_item_id (
        id,
        name,
        price,
        duration_minutes,
        commission_rate
      ),
      staff:staff_id (
        id,
        full_name,
        role
      )
    `)
    .eq("customer_id", customerId)
    .order("performed_at", { ascending: false });

  if (error) {
    console.error(
      `Error fetching service history for customer ${customerId}:`,
      error,
    );
    return [];
  }

  return (data as ServiceSession[]) || [];
}

// ============ CUSTOMER INVOICES ============

export async function fetchCustomerInvoices(
  customerId: string,
): Promise<Invoice[]> {
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
        is_gift
      )
    `)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching invoices for customer ${customerId}:`, error);
    return [];
  }

  return (data as Invoice[]) || [];
}

// ============ CUSTOMER STATISTICS ============

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
    console.error("Error fetching customer stats:", error);
    return {
      total_spending: 0,
      total_visits: 0,
      last_visit: null,
    };
  }

  const total_spending = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
  const total_visits = invoices?.length || 0;
  const last_visit = invoices?.[0]?.created_at || null;

  return {
    total_spending,
    total_visits,
    last_visit,
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
};

export default customerService;