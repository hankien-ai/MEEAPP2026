import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";
import {
  Customer,
  CustomerPhoto,
  CustomerPackage,
  ServiceSession,
  Invoice,
  PhotoType,
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

  const insertData = {
    organization_id: DEFAULT_ORG_ID,
    branch_id: DEFAULT_BRANCH_ID,
    full_name: nameToUse,
    name: nameToUse,
    phone: payload.phone,
    email: payload.email || null,
    birth_date: payload.birth_date || null,
    gender: payload.gender || null,
    address: payload.address || null,
    notes: payload.notes || null,
    total_spend: payload.total_spend || 0,
    total_spent: payload.total_spent || 0,
    total_visits: 0,
    updated_at: new Date().toISOString(),
  };

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

  // Generate private signed URLs for each photo
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

  // 1. Upload to private bucket customer-photos
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

  // 2. Insert record into database
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

  // 3. Generate signed URL for instant rendering
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
  // 1. Remove file from private storage
  if (storagePath) {
    const { error: storageError } = await supabase.storage
      .from("customer-photos")
      .remove([storagePath]);

    if (storageError) {
      console.warn("Storage deletion error (non-fatal):", storageError);
    }
  }

  // 2. Remove record from customer_photos
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
    .select("*, catalog_items(*)")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching packages for customer ${customerId}:`, error);
    return [];
  }

  return (data as CustomerPackage[]) || [];
}

export async function usePackageSession(
  packageId: string,
  staffId?: string,
  notes?: string,
): Promise<{ success: boolean; remaining_sessions: number }> {
  // Call Postgres RPC use_package_session
  const { data, error } = await supabase.rpc("use_package_session", {
    p_package_id: packageId,
    p_staff_id: staffId || null,
    p_notes: notes || null,
  });

  if (error) {
    console.error(
      `RPC use_package_session failed for package ${packageId}:`,
      error,
    );

    // Atomic fallback if RPC not installed yet
    const { data: pkg, error: fetchErr } = await supabase
      .from("customer_packages")
      .select("*")
      .eq("id", packageId)
      .single();

    if (fetchErr || !pkg)
      throw new Error("Không tìm thấy thông tin gói liệu trình");
    if (pkg.remaining_sessions <= 0)
      throw new Error("Gói liệu trình đã hết số buổi");

    const newRemaining = pkg.remaining_sessions - 1;
    const newStatus = newRemaining === 0 ? "DEPLETED" : pkg.status;

    // Create service session
    const { data: session, error: sessErr } = await supabase
      .from("service_sessions")
      .insert([
        {
          organization_id: pkg.organization_id || DEFAULT_ORG_ID,
          branch_id: pkg.branch_id || DEFAULT_BRANCH_ID,
          customer_id: pkg.customer_id,
          catalog_item_id: pkg.catalog_item_id,
          staff_id: staffId || null,
          source_type: "PACKAGE",
          package_id: packageId,
          price_charged: 0,
          notes: notes || "Sử dụng 1 buổi từ gói liệu trình",
        },
      ])
      .select()
      .single();

    if (sessErr) throw sessErr;

    // Create package usage log
    await supabase.from("package_usages").insert([
      {
        organization_id: pkg.organization_id || DEFAULT_ORG_ID,
        branch_id: pkg.branch_id || DEFAULT_BRANCH_ID,
        customer_id: pkg.customer_id,
        package_id: packageId,
        service_session_id: session?.id,
        notes: notes || null,
      },
    ]);

    // Update package
    await supabase
      .from("customer_packages")
      .update({
        remaining_sessions: newRemaining,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", packageId);

    return { success: true, remaining_sessions: newRemaining };
  }

  return {
    success: data?.success || true,
    remaining_sessions: data?.remaining_sessions ?? 0,
  };
}

// --- CUSTOMER SERVICE HISTORY ---

export async function fetchCustomerServiceHistory(
  customerId: string,
): Promise<ServiceSession[]> {
  const { data, error } = await supabase
    .from("service_sessions")
    .select("*, catalog_items(*), staff(*)")
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
    .select("*, items:invoice_items(*)")
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
  fetchCustomerPhotos,
  uploadCustomerPhoto,
  deleteCustomerPhoto,
  fetchCustomerServiceHistory,
  fetchCustomerInvoices,
  usePackageSession,
};

export default customerService;
