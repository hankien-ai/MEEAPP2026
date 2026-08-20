export type ItemType = "SERVICE" | "PRODUCT";
export type ItemStatus = "active" | "inactive";
export type PaymentMethod = "CASH" | "CARD" | "TRANSFER";
export type PackageStatus = "ACTIVE" | "EXPIRED" | "DEPLETED" | "CANCELLED";
export type StaffRole = "MANAGER" | "TECHNICIAN" | "RECEPTIONIST" | "ACCOUNTS";
export type StaffStatus = "ACTIVE" | "INACTIVE" | "ON_LEAVE";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";
export type BookingStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";
export type PhotoType = "BEFORE" | "PROGRESS" | "AFTER";
export type ServiceSourceType = "DIRECT" | "PACKAGE";
export type InvoiceStatus = "PAID" | "UNPAID" | "CANCELLED" | "REFUNDED";

export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  address: string;
  phone: string;
  timezone: string;
}

export interface CatalogItem {
  id: string;
  organization_id?: string;
  branch_id?: string;
  name: string;
  description: string | null;
  item_type: ItemType;
  kind?: string;
  category?: string;
  price: number;
  duration_minutes: number | null;
  commission_rate: number | null;
  status: ItemStatus;
  active?: boolean;
  stock?: number;
  unit?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CatalogItemInsert {
  name: string;
  description?: string | null;
  item_type: ItemType;
  price: number;
  duration_minutes?: number | null;
  commission_rate?: number | null;
  status?: ItemStatus;
}

export interface CatalogItemUpdate {
  name?: string;
  description?: string | null;
  item_type?: ItemType;
  price?: number;
  duration_minutes?: number | null;
  commission_rate?: number | null;
  status?: ItemStatus;
}

export interface Customer {
  id: string;
  organization_id?: string;
  branch_id?: string;
  code?: string | null;
  full_name: string;
  name?: string;
  phone: string;
  email: string | null;
  birth_date: string | null;
  gender?: string | null;
  address: string | null;
  notes: string | null;
  total_spend?: number;
  total_spent?: number;
  total_visits?: number;
  last_visit: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerInsert {
  organization_id?: string;
  branch_id?: string;
  code?: string;
  full_name: string;
  name?: string;
  phone: string;
  email?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  address?: string | null;
  notes?: string | null;
  total_spend?: number;
  total_spent?: number;
  total_visits?: number;
  last_visit?: string | null;
}

export interface CustomerUpdate {
  full_name?: string;
  name?: string;
  phone?: string;
  email?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  address?: string | null;
  notes?: string | null;
  total_spend?: number;
  total_spent?: number;
  total_visits?: number;
  last_visit?: string | null;
}

export interface CustomerPhoto {
  id: string;
  organization_id?: string;
  branch_id?: string;
  customer_id: string;
  storage_path: string;
  photo_type: PhotoType;
  notes: string | null;
  signed_url?: string;
  created_at: string;
}

export interface CustomerPackage {
  id: string;
  organization_id?: string;
  branch_id?: string;
  customer_id: string;
  catalog_item_id: string;
  package_name?: string;
  total_sessions: number;
  remaining_sessions: number;
  price_paid: number;
  purchased_at: string;
  expires_at: string | null;
  status: PackageStatus;
  created_at: string;
  updated_at: string;
  catalog_item?: CatalogItem;
}

export interface ServiceSession {
  id: string;
  organization_id?: string;
  branch_id?: string;
  customer_id: string;
  catalog_item_id?: string;
  staff_id?: string | null;
  source_type: ServiceSourceType;
  package_id?: string | null;
  price_charged: number;
  notes?: string | null;
  performed_at?: string;
  created_at: string;
  catalog_item?: CatalogItem;
  staff?: Staff;
}

export interface PackageUsage {
  id: string;
  organization_id?: string;
  branch_id?: string;
  customer_id: string;
  package_id: string;
  service_session_id?: string | null;
  used_at: string;
  notes?: string | null;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  catalog_item_id?: string | null;
  item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at?: string;
}

export interface Invoice {
  id: string;
  organization_id?: string;
  branch_id?: string;
  customer_id: string;
  code?: string;
  invoice_code?: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method: PaymentMethod;
  status: InvoiceStatus;
  notes?: string | null;
  created_at: string;
  items?: InvoiceItem[];
}

export interface Staff {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  role: StaffRole;
  status: StaffStatus;
  base_salary: number;
  commission_rate: number;
  started_on: string;
  created_at: string;
  updated_at: string;
}

export type StaffMemberDomain = Staff;

export interface PackageTemplateItem {
  catalogItemId: string;
  quantity: number;
}

export interface PackageTemplate {
  id: string;
  name: string;
  description: string;
  price: number;
  validityDays: number;
  items: PackageTemplateItem[];
  active: boolean;
}

export interface Attendance {
  id: string;
  staff_id: string;
  work_date: string;
  check_in: string | null;
  check_out: string | null;
  status: AttendanceStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  staff_id: string | null;
  service_id: string;
  booking_time: string;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string | null;
  expense_date: string;
  date?: string;
  status?: string;
  created_by: string | null;
  created_at?: string;
  updated_at?: string;
}
