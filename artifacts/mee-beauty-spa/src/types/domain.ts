export type ItemType = "SERVICE" | "PRODUCT";
export type ItemStatus = "active" | "inactive";
export type PaymentMethod = "CASH" | "CARD" | "TRANSFER";
export type PackageStatus = "ACTIVE" | "EXPIRED" | "DEPLETED" | "CANCELLED";

// Staff role – các chức danh có sẵn trong hệ thống
export type StaffRole =
  | "Admin"
  | "Cửa hàng trưởng"
  | "Kỹ thuật viên"
  | "Trưởng ca";

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
export type PayrollStatus = "DRAFT" | "LOCKED" | "PAID";

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
  package_id?: string;
  package_name?: string;
  total_sessions: number;
  remaining_sessions: number;
  price_paid: number;
  purchased_at: string;
  expires_at: string | null;
  status: PackageStatus;
  is_gift?: boolean;
  created_at: string;
  updated_at: string;
  catalog_item?: CatalogItem;
  customer_package_items?: CustomerPackageItem[];
}

export interface CustomerPackageItem {
  id: string;
  customer_package_id: string;
  package_item_id: string;
  total_quantity: number;
  used_quantity: number;
  remaining_quantity: number;
  created_at: string;
  updated_at: string;
  package_item?: PackageItem;
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
  package_item_id?: string | null;
  customer_package_item_id?: string | null;
  service_id?: string | null;
  used_at: string;
  notes?: string | null;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  catalog_item_id?: string | null;
  package_id?: string | null;
  actual_service_id?: string | null;
  item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  discount_amount?: number;
  total_amount?: number;
  seller_staff_id?: string | null;
  performing_staff_id?: string | null;
  is_gift?: boolean;
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
  is_gift?: boolean;
  paid_amount?: number;
  created_at: string;
  items?: InvoiceItem[];
}

export interface InvoiceItemStaff {
  id: string;
  invoice_item_id: string;
  staff_id: string;
  share_percent: number;
  commission_amount: number;
  created_at: string;
}

// ============================================================
// STAFF & ATTENDANCE
// ============================================================

export interface Staff {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  role: StaffRole;
  status: StaffStatus;
  base_salary: number;       // Lương cơ bản tháng
  commission_rate: number;   // Tỷ lệ hoa hồng (có thể dùng sau)
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
  organization_id?: string;
  branch_id?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// PAYROLL & BONUS/PENALTY & SETTINGS
// ============================================================

export interface Payroll {
  id: string;
  staff_id: string;
  month: number;
  year: number;
  base_salary: number;
  total_working_days: number;      // Tổng số ngày trong tháng
  actual_working_days: number;     // Số ngày có check-in
  leave_days_taken: number;        // Số ngày nghỉ (không check-in)
  allowed_leave_days: number;      // Số ngày nghỉ được phép
  excess_leave_days: number;       // Số ngày nghỉ vượt quá cho phép
  excess_leave_deduction: number;  // Tiền trừ do nghỉ vượt
  total_commission: number;        // Tổng hoa hồng trong tháng
  total_bonus: number;             // Tổng thưởng
  total_penalty: number;           // Tổng phạt
  net_salary: number;              // Lương thực nhận
  status: PayrollStatus;           // DRAFT, LOCKED, PAID
  organization_id?: string;
  branch_id?: string;
  created_at: string;
  updated_at: string;
  staff?: Staff;
}

export interface BonusPenalty {
  id: string;
  staff_id: string;
  payroll_id?: string;            // Liên kết với bảng lương (nếu đã tính)
  type: "BONUS" | "PENALTY";
  amount: number;
  description: string;
  date: string;
  created_by?: string;            // staff_id người tạo
  created_at: string;
}

export interface SalarySetting {
  id: string;
  organization_id?: string;
  branch_id?: string;
  default_allowed_leave_days: number;  // Số ngày nghỉ mặc định
  attendance_enabled: boolean;          // Bật/tắt chấm công
  updated_by?: string;
  updated_at: string;
}

// ============================================================
// PACKAGE TEMPLATE & BOOKING (giữ nguyên)
// ============================================================

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

// ============================================================
// CUSTOMER SERVICE ENTITLEMENTS (Gift service lẻ)
// ============================================================

export interface CustomerServiceEntitlement {
  id: string;
  customer_id: string;
  service_id: string;
  total_quantity: number;
  used_quantity: number;
  remaining_quantity: number;
  invoice_id: string | null;
  is_gift: boolean;
  created_at: string;
  updated_at: string;
  services?: {
    catalog_item?: { name: string; code: string };
  };
}

// ============================================================
// CUSTOM TYPES (dùng chung)
// ============================================================

export type CreateStaffInput = {
  full_name: string;
  role: StaffRole;
  phone: string;
  base_salary?: number;
  status?: StaffStatus;
  started_on?: string;
};

export type UpdateStaffInput = Partial<CreateStaffInput>;