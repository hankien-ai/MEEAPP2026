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

export interface CatalogItem {
  id: string;
  name: string;
  description: string | null;
  item_type: ItemType;
  price: number;
  duration_minutes: number | null;
  commission_rate: number | null;
  status: ItemStatus;
  created_at: string;
  updated_at: string;
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
  full_name: string;
  phone: string;
  email: string | null;
  birth_date: string | null;
  address: string | null;
  notes: string | null;
  total_spend: number;
  last_visit: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerInsert {
  full_name: string;
  phone: string;
  email?: string | null;
  birth_date?: string | null;
  address?: string | null;
  notes?: string | null;
  total_spend?: number;
  last_visit?: string | null;
}

export interface CustomerUpdate {
  full_name?: string;
  phone?: string;
  email?: string | null;
  birth_date?: string | null;
  address?: string | null;
  notes?: string | null;
  total_spend?: number;
  last_visit?: string | null;
}

export interface CustomerPackage {
  id: string;
  customer_id: string;
  catalog_item_id: string;
  total_sessions: number;
  remaining_sessions: number;
  price_paid: number;
  purchased_at: string;
  expires_at: string | null;
  status: PackageStatus;
  created_at: string;
  updated_at: string;
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
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
