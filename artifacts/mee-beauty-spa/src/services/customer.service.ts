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

export type CustomerInput = Omit<
  Partial<Customer>,
  "id" | "created_at" | "updated_at"
> & {
  full_name?: string;
  name?: string;
  phone: string;
  email?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  address?: string | null;
  notes?: string | null;
};

// --- CUSTOMER CRUD ---

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
  const nameToUse = payload.full_name || payload.name || "Khách hàng mới";

  const insertData: any = {
    organization_id: DEFAULT_ORG_ID,
    branch_id: DEFAULT_BRANCH_ID,
    full_name: nameToUse,
    name: nameToUse,
    phone: payload.phone,
    email: payload.email || null,
    birth_date: payload.birth_date || null,
    gender: payload.gender || null,
    notes: payload.notes || null,
    total_spend: payload.total_spend || 0,
    total_spent: payload.total_spent || 0,
    total_visits: 0,
    updated_at: new Date().toISOString(),
  };

  if (payload.address) {
    insertData.address = payload.address;
  }

  const { data, error } = await supabase
    .from("customers")
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error("Error creating customer in Supabase:", error);
    throw error;
  }

  return data as Customer;
}

export async function updateCustomer(
  id: string,
  payload: Partial<CustomerInput>,
): Promise<Customer> {
  const updateData: Record<string, unknown> = {
    ...payload,
    updated_at: new Date().toISOString(),
  };

  if (payload.full_name && !payload.name) {
    updateData.name = payload.full_name;
  } else if (payload.name && !payload.full_name) {
    updateData.full_name = payload.name;
  }

  const { data, error } = await supabase
    .from("customers")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating customer ${id}:`, error);
    throw error;
  }

  return data as Customer;
}

export async function deleteCustomer(id: string): Promise<boolean> {
  const { error } = await supabase.from("customers").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting customer ${id}:`, error);
    throw error;
  }

  return true;
}

// --- CUSTOMER PHOTOS SERVICE ---

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
  const fileExt = file.name.split(".").pop() || "jpg";
  const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const storagePath = `${customerId}/${cleanFileName}`;

  const { error: uploadError } = await supabase.storage
    .from("customer-photos")
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Error uploading photo to storage:", uploadError);
    throw uploadError;
  }

  const insertPayload = {
    organization_id: DEFAULT_ORG_ID,
    branch_id: DEFAULT_BRANCH_ID,
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
    throw dbError;
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
    throw dbError;
  }

  return true;
}

// --- CUSTOMER PACKAGES SERVICE ---

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

/**
 * Sử dụng package (trừ 1 buổi) - phiên bản mới nhận customer_package_item_id
 * Dành cho UI gọi từ POS hoặc Customer Profile
 */
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

/**
 * Sử dụng package (trừ 1 buổi) - phiên bản tương thích với UI cũ
 * Nhận customer_package_id, package_item_id, service_id
 */
export async function usePackageSession(
  customerPackageId: string,
  packageItemId: string,
  serviceId: string,
  staffId?: string,
  notes?: string,
): Promise<{ success: boolean; message: string; remaining_quantity: number }> {
  // Tìm customer_package_item_id từ customerPackageId và packageItemId
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

/**
 * Tạo gift package
 */
export async function createGiftPackage(
  customerId: string,
  packageId: string,
  createdBy?: string,
): Promise<{ success: boolean; message: string; customer_package_id?: string }> {
  const { data, error } = await supabase.rpc("create_gift_package", {
    p_customer_id: customerId,
    p_package_id: packageId,
    p_created_by: createdBy || null,
  });

  if (error) {
    console.error("create_gift_package error:", error);
    return {
      success: false,
      message: error.message || "Lỗi tạo gift package",
    };
  }

  return data as { success: boolean; message: string; customer_package_id?: string };
}

// --- CUSTOMER SERVICE HISTORY ---

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

// --- CUSTOMER INVOICES ---

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

// Compatibility Helper Aliases
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
  usePackageSessionV2,
  usePackageSession,
  createGiftPackage,
};

export default customerService;