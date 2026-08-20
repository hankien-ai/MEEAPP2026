============================================================
CUSTOMER DEBUG SOURCE
============================================================

===== src/services/customer.service.ts =====
import { supabase } from "./supabase";
import { Customer } from "../types/domain";

export type CustomerInput = Omit<
  Partial<Customer>,
  "id" | "created_at" | "updated_at"
> & {
  full_name?: string;
  name?: string;
  phone: string;
};

// --- CORE IMPLEMENTATIONS ---

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
    ...payload,
    full_name: nameToUse,
    name: nameToUse,
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
  const updateData = {
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

// Alias helper for alternate naming conventions
export const getCustomers = fetchCustomers;
export const getCustomerById = fetchCustomerById;

// --- OBJECT & DEFAULT EXPORTS FOR COMPATIBILITY ---

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
};

export default customerService;

===== src/pages/customers.tsx =====
import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Panel,
  PanelHeader,
  PanelContent,
  PageHeader,
  Input,
  Modal,
  Table,
  Badge,
  Textarea,
  Spinner,
  EmptyState,
} from "../components/primitives";
import { Customer } from "../types/domain";
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  fetchCustomerById,
} from "../services/customer.service";

// --- CUSTOMER PROFILE PAGE COMPONENT ---
export interface CustomerProfilePageProps {
  customerId?: string;
  onBack?: () => void;
}

export function CustomerProfilePage({
  customerId,
  onBack,
}: CustomerProfilePageProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchCustomerById(customerId)
      .then((data) => setCustomer(data))
      .catch((err) => console.error("Lỗi tải thông tin khách hàng:", err))
      .finally(() => setLoading(false));
  }, [customerId]);

  if (loading) {
    return <Spinner className="py-12" />;
  }

  if (!customer) {
    return (
      <EmptyState
        title="Không tìm thấy khách hàng"
        description="Thông tin khách hàng không tồn tại hoặc đã bị xóa."
        action={onBack ? <Button onClick={onBack}>Quay lại</Button> : undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {customer.full_name || customer.name}
          </h2>
          <p className="text-sm text-gray-500">
            {customer.phone} • {customer.email || "Chưa có email"}
          </p>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Quay lại danh sách
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Thông tin cá nhân">
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-semibold text-gray-600">Mã KH:</span>{" "}
              {customer.code || customer.id}
            </div>
            <div>
              <span className="font-semibold text-gray-600">
                Số điện thoại:
              </span>{" "}
              {customer.phone}
            </div>
            <div>
              <span className="font-semibold text-gray-600">Email:</span>{" "}
              {customer.email || "N/A"}
            </div>
            <div>
              <span className="font-semibold text-gray-600">Địa chỉ:</span>{" "}
              {customer.address || "N/A"}
            </div>
            <div>
              <span className="font-semibold text-gray-600">Ghi chú:</span>{" "}
              {customer.notes || "Không có"}
            </div>
          </div>
        </Card>

        <Card title="Thống kê mua hàng" className="md:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">Tổng chi tiêu</p>
              <p className="text-xl font-bold text-blue-900">
                {(customer.total_spent || 0).toLocaleString("vi-VN")} đ
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-xs text-green-600 font-medium">
                Số lượt dịch vụ
              </p>
              <p className="text-xl font-bold text-green-900">
                {customer.total_visits || 0} lượt
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// --- MAIN CUSTOMERS PAGE COMPONENT ---
export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchCustomers();
      setCustomers(data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách khách hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setSubmitting(true);
    try {
      await createCustomer({
        full_name: formData.name,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        notes: formData.notes,
      });
      setIsAddModalOpen(false);
      setFormData({ name: "", phone: "", email: "", address: "", notes: "" });
      await loadData();
    } catch (err) {
      console.error("Lỗi tạo khách hàng:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    const nameStr = (c.full_name || c.name || "").toLowerCase();
    const phoneStr = (c.phone || "").toLowerCase();
    return nameStr.includes(q) || phoneStr.includes(q);
  });

  if (selectedCustomerId) {
    return (
      <CustomerProfilePage
        customerId={selectedCustomerId}
        onBack={() => setSelectedCustomerId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Khách hàng"
        description="Danh sách hồ sơ khách hàng và lịch sử sử dụng dịch vụ"
        action={
          <Button onClick={() => setIsAddModalOpen(true)}>
            + Thêm khách hàng
          </Button>
        }
      />

      <Panel>
        <PanelHeader
          title="Danh sách hồ sơ"
          action={
            <div className="w-64">
              <Input
                placeholder="Tìm theo tên hoặc SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          }
        />
        <PanelContent>
          {loading ? (
            <Spinner className="py-8" />
          ) : filteredCustomers.length === 0 ? (
            <EmptyState
              title="Không tìm thấy khách hàng"
              description="Thử tìm kiếm với từ khóa khác hoặc thêm khách hàng mới."
            />
          ) : (
            <Table
              headers={[
                "Mã KH",
                "Họ & Tên",
                "Số điện thoại",
                "Địa chỉ",
                "Tổng chi tiêu",
                "Thao tác",
              ]}
              data={filteredCustomers}
              renderRow={(item: Customer) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 text-xs font-mono text-gray-500">
                    {item.code || item.id.substring(0, 8)}
                  </td>
                  <td className="p-3 font-medium text-gray-900">
                    {item.full_name || item.name}
                  </td>
                  <td className="p-3 text-gray-600">{item.phone}</td>
                  <td className="p-3 text-gray-500 text-xs">
                    {item.address || "—"}
                  </td>
                  <td className="p-3 font-semibold text-blue-600">
                    {(item.total_spent || 0).toLocaleString("vi-VN")} đ
                  </td>
                  <td className="p-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedCustomerId(item.id)}
                    >
                      Xem chi tiết
                    </Button>
                  </td>
                </tr>
              )}
            />
          )}
        </PanelContent>
      </Panel>

      {/* MODAL THÊM KHÁCH HÀNG */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Khách Hàng Mới"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <Input
            label="Họ và Tên *"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nguyễn Văn A"
          />
          <Input
            label="Số Điện Thoại *"
            required
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="0901234567"
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="example@mail.com"
          />
          <Input
            label="Địa chỉ"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="Số nhà, Tên đường, Quận/Huyện"
          />
          <Textarea
            label="Ghi chú"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Ghi chú tình trạng da hoặc yêu cầu đặc biệt..."
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" isLoading={submitting}>
              Lưu khách hàng
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// DEFAULT EXPORT (Cung cấp cả Named và Default Export Contract)
export default CustomersPage;

===== src/types/domain.ts =====
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

===== src/services/supabase.ts =====
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const DEFAULT_ORG_ID = "4fc2ef26-2fa6-43c1-9e7f-7362ac747a26";
export const DEFAULT_BRANCH_ID = "677f6f26-77d1-4a26-ab13-7c2f5a2994f9";

===== src/data/demo.ts =====
import type { Branch, CatalogItem, Customer, Expense, PackageTemplate, Staff } from '@/types/domain';

export const demoOrganization = { id: 'org-mee', name: 'MEE BEAUTY SPA', phone: '028 7300 6868', defaultCurrency: 'VND' as const };
export const demoBranch: Branch = { id: 'branch-q1', organizationId: 'org-mee', name: 'MEE · Quận 1', address: '42 Nguyễn Huệ, Bến Nghé, Quận 1, TP. HCM', phone: '028 7300 6868', timezone: 'Asia/Ho_Chi_Minh' };

export const demoCustomers: Customer[] = [
  { id: 'cus-001', fullName: 'Nguyễn Minh Anh', phone: '090 324 7816', email: 'minhanh.nguyen@example.vn', birthday: '1994-09-14', gender: 'Nữ', joinedAt: '2023-06-18', lastVisit: '2024-06-28', visitCount: 18, totalSpend: 14850000, loyaltyPoints: 1280, tags: ['Thân thiết', 'Da nhạy cảm'], note: 'Ưu tiên sản phẩm không hương liệu.' },
  { id: 'cus-002', fullName: 'Trần Ngọc Mai', phone: '091 824 0963', gender: 'Nữ', joinedAt: '2024-01-10', lastVisit: '2024-06-30', visitCount: 7, totalSpend: 6240000, loyaltyPoints: 540, tags: ['Mới quay lại'] },
  { id: 'cus-003', fullName: 'Phạm Gia Hân', phone: '093 117 4820', gender: 'Nữ', joinedAt: '2023-10-04', lastVisit: '2024-06-26', visitCount: 12, totalSpend: 9320000, loyaltyPoints: 860, tags: ['VIP'] },
  { id: 'cus-004', fullName: 'Lê Hoàng Nam', phone: '098 441 2207', gender: 'Nam', joinedAt: '2024-03-21', lastVisit: '2024-06-21', visitCount: 4, totalSpend: 3180000, loyaltyPoints: 270, tags: ['Chăm sóc da'] },
  { id: 'cus-005', fullName: 'Võ Khánh Linh', phone: '090 682 1134', gender: 'Nữ', joinedAt: '2024-05-02', lastVisit: '2024-06-29', visitCount: 3, totalSpend: 1870000, loyaltyPoints: 140, tags: ['Da dầu'] },
];

export const demoCatalog: CatalogItem[] = [
  { id: 'svc-001', organizationId: 'org-mee', name: 'Chăm sóc da chuyên sâu', kind: 'service', category: 'Facial', price: 680000, durationMinutes: 75, active: true, description: 'Làm sạch, cấp ẩm và phục hồi hàng rào da.' },
  { id: 'svc-002', organizationId: 'org-mee', name: 'Massage trị liệu cổ vai gáy', kind: 'service', category: 'Body', price: 520000, durationMinutes: 60, active: true, description: 'Thư giãn sâu với tinh dầu tràm.' },
  { id: 'svc-003', organizationId: 'org-mee', name: 'Gội đầu dưỡng sinh', kind: 'service', category: 'Wellness', price: 390000, durationMinutes: 45, active: true, description: 'Liệu trình làm sạch nhẹ và ấn huyệt đầu.' },
  { id: 'svc-004', organizationId: 'org-mee', name: 'Điều trị mụn cơ bản', kind: 'service', category: 'Treatment', price: 850000, durationMinutes: 90, active: true, description: 'Phác đồ làm dịu và hỗ trợ giảm viêm.' },
  { id: 'prd-001', organizationId: 'org-mee', name: 'Tinh chất phục hồi MEE', kind: 'product', category: 'Skincare', price: 790000, stock: 18, unit: 'chai', active: true, description: '30ml · Panthenol 5% và B5.' },
  { id: 'prd-002', organizationId: 'org-mee', name: 'Kem chống nắng Daily Veil', kind: 'product', category: 'Skincare', price: 420000, stock: 31, unit: 'tuýp', active: true, description: '50ml · SPF 50 PA++++.' },
  { id: 'prd-003', organizationId: 'org-mee', name: 'Dầu massage hoa trà', kind: 'product', category: 'Body care', price: 560000, stock: 9, unit: 'chai', active: true, description: '100ml · Dùng cho da nhạy cảm.' },
  { id: 'prd-004', organizationId: 'org-mee', name: 'Mặt nạ ngủ cấp ẩm', kind: 'product', category: 'Skincare', price: 350000, stock: 4, unit: 'hũ', active: true, description: '60g · Kết cấu gel mỏng nhẹ.' },
];

export const demoPackages: PackageTemplate[] = [
  { id: 'pkg-001', name: 'MEE Reset · 05 buổi', description: 'Gội đầu dưỡng sinh và massage cổ vai gáy', price: 4200000, validityDays: 90, items: [{ catalogItemId: 'svc-003', quantity: 5 }, { catalogItemId: 'svc-002', quantity: 2 }], active: true },
  { id: 'pkg-002', name: 'Da khoẻ mỗi ngày', description: 'Liệu trình làm sạch và phục hồi theo tháng', price: 5800000, validityDays: 120, items: [{ catalogItemId: 'svc-001', quantity: 4 }, { catalogItemId: 'svc-004', quantity: 2 }], active: true },
  { id: 'pkg-003', name: 'MEE Ritual · 10 buổi', description: 'Chăm sóc body và facial cho lịch trình bận rộn', price: 9600000, validityDays: 180, items: [{ catalogItemId: 'svc-001', quantity: 5 }, { catalogItemId: 'svc-002', quantity: 5 }], active: true },
];

export const demoStaff: Staff[] = [
  { id: 'stf-001', fullName: 'Đỗ Thu Hà', role: 'Quản lý chi nhánh', phone: '090 881 2290', branchId: 'branch-q1', status: 'Đang làm việc', startDate: '2022-08-15', commissionRate: 8 },
  { id: 'stf-002', fullName: 'Nguyễn Thảo Vy', role: 'Kỹ thuật viên', phone: '093 682 5517', branchId: 'branch-q1', status: 'Đang làm việc', startDate: '2023-03-10', commissionRate: 6 },
  { id: 'stf-003', fullName: 'Bùi Thanh Trúc', role: 'Kỹ thuật viên', phone: '097 411 8824', branchId: 'branch-q1', status: 'Đang làm việc', startDate: '2023-11-02', commissionRate: 6 },
  { id: 'stf-004', fullName: 'Lâm Mỹ Duyên', role: 'Lễ tân', phone: '090 511 3308', branchId: 'branch-q1', status: 'Tạm nghỉ', startDate: '2024-02-19', commissionRate: 2 },
];

export const demoExpenses: Expense[] = [
  { id: 'exp-001', category: 'Vật tư tiêu hao', description: 'Bông tẩy trang và khăn hấp', amount: 1260000, date: '2024-06-30', status: 'Đã ghi nhận' },
  { id: 'exp-002', category: 'Vận hành', description: 'Bảo trì máy lạnh tầng 2', amount: 850000, date: '2024-06-28', status: 'Chờ duyệt' },
  { id: 'exp-003', category: 'Hàng hoá', description: 'Nhập tinh chất phục hồi MEE', amount: 4740000, date: '2024-06-26', status: 'Đã ghi nhận' },
];

export const formatVnd = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
export const initials = (name: string) => name.split(' ').slice(-2).map((part) => part[0]).join('').toUpperCase();
export const formatDate = (value: string) => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
===== src/services/demo-service.ts =====
import { demoCatalog, demoCustomers, demoExpenses, demoPackages, demoStaff } from '@/data/demo';

const pause = (ms = 220) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const demoService = {
  async getCustomers() { await pause(); return demoCustomers; },
  async getCatalog() { await pause(120); return demoCatalog; },
  async getPackages() { await pause(160); return demoPackages; },
  async getStaff() { await pause(180); return demoStaff; },
  async getExpenses() { await pause(180); return demoExpenses; },
};