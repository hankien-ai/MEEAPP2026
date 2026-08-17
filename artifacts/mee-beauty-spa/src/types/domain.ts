export type ID = string;

export interface Organization {
  id: ID;
  name: string;
  phone: string;
  logoUrl?: string;
  defaultCurrency: 'VND';
}

export interface Branch {
  id: ID;
  organizationId: ID;
  name: string;
  address: string;
  phone: string;
  timezone: string;
}

export interface Customer {
  id: ID;
  fullName: string;
  phone: string;
  email?: string;
  birthday?: string;
  gender: 'Nữ' | 'Nam' | 'Khác';
  joinedAt: string;
  lastVisit?: string;
  visitCount: number;
  totalSpend: number;
  loyaltyPoints: number;
  note?: string;
  tags: string[];
}

export type CatalogKind = 'service' | 'product';
export interface CatalogItem {
  id: ID;
  organizationId: ID;
  branchId?: ID;
  name: string;
  kind: CatalogKind;
  category: string;
  price: number;
  durationMinutes?: number;
  active: boolean;
  description?: string;
  stock?: number;
  unit?: string;
}
export type Service = CatalogItem & { kind: 'service'; durationMinutes: number };
export type Product = CatalogItem & { kind: 'product'; stock: number; unit: string };

export interface PackageItem { catalogItemId: ID; quantity: number; }
export interface PackageTemplate {
  id: ID;
  name: string;
  description: string;
  price: number;
  validityDays: number;
  items: PackageItem[];
  active: boolean;
}
export interface CustomerPackage {
  id: ID;
  customerId: ID;
  templateId: ID;
  remainingUses: number;
  totalUses: number;
  expiresAt: string;
  status: 'Đang dùng' | 'Hết lượt' | 'Hết hạn';
}

export interface InvoiceItem { id: ID; catalogItemId: ID; name: string; quantity: number; unitPrice: number; total: number; }
export interface Payment { method: 'Tiền mặt' | 'Chuyển khoản' | 'QR' | 'Công nợ'; amount: number; paidAt?: string; }
export interface Invoice { id: ID; customerId?: ID; items: InvoiceItem[]; subtotal: number; discount: number; total: number; status: 'Nháp' | 'Đã thanh toán' | 'Đã hủy'; payment?: Payment; createdAt: string; }

export interface Staff { id: ID; fullName: string; role: string; phone: string; branchId: ID; status: 'Đang làm việc' | 'Tạm nghỉ'; startDate: string; commissionRate: number; }
export interface Commission { id: ID; staffId: ID; period: string; revenue: number; commission: number; status: 'Chờ duyệt' | 'Đã duyệt'; }
export interface Attendance { id: ID; staffId: ID; date: string; checkIn?: string; checkOut?: string; status: 'Có mặt' | 'Nghỉ phép' | 'Đi muộn'; }

export type LoyaltyMode = 'POINT' | 'SESSION';
export interface LoyaltyAccount { id: ID; customerId: ID; mode: LoyaltyMode; balance: number; tier: string; }
export interface LoyaltyTransaction { id: ID; accountId: ID; type: 'Tích điểm' | 'Đổi điểm' | 'Tặng buổi'; amount: number; note: string; createdAt: string; }
export interface Expense { id: ID; category: string; description: string; amount: number; date: string; status: 'Đã ghi nhận' | 'Chờ duyệt'; }
export interface AuditLog { id: ID; actor: string; action: string; entity: string; createdAt: string; }