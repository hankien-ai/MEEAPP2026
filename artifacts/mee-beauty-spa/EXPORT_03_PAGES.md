
============================================================
FILE: src/pages/catalog.tsx
============================================================
import React, { useState, useEffect, useCallback } from "react";
import {
  fetchServices,
  fetchProducts,
  toggleCatalogItemStatus,
} from "../services/catalog-service";
import { ServiceItemDomain, ProductItemDomain } from "../types/domain";

export const CatalogPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"SERVICES" | "PRODUCTS">(
    "SERVICES",
  );
  const [services, setServices] = useState<ServiceItemDomain[]>([]);
  const [products, setProducts] = useState<ProductItemDomain[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (activeTab === "SERVICES") {
        const data = await fetchServices(search);
        setServices(data);
      } else {
        const data = await fetchProducts(search);
        setProducts(data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi khi tải dữ liệu từ Supabase");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleStatus = async (
    id: string,
    currentStatus: "active" | "inactive",
  ) => {
    try {
      const nextStatus = currentStatus === "active" ? "inactive" : "active";
      await toggleCatalogItemStatus(id, nextStatus);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Catalog Management</h1>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded ${activeTab === "SERVICES" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => setActiveTab("SERVICES")}
          >
            Services
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === "PRODUCTS" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => setActiveTab("PRODUCTS")}
          >
            Products
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder={`Tìm kiếm ${activeTab === "SERVICES" ? "dịch vụ" : "sản phẩm"}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-3 py-2 border rounded"
        />
      </div>

      {errorMessage && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded border border-red-300">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <p>Đang tải dữ liệu từ Supabase...</p>
      ) : activeTab === "SERVICES" ? (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-2 text-left border">Tên dịch vụ</th>
              <th className="p-2 text-left border">Danh mục</th>
              <th className="p-2 text-right border">Giá (VNĐ)</th>
              <th className="p-2 text-right border">Thời lượng (phút)</th>
              <th className="p-2 text-center border">Trạng thái</th>
              <th className="p-2 text-center border">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {services.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-2 border">{item.name}</td>
                <td className="p-2 border">{item.category}</td>
                <td className="p-2 border text-right">
                  {item.price.toLocaleString()}
                </td>
                <td className="p-2 border text-right">
                  {item.service_details.duration_minutes}
                </td>
                <td className="p-2 border text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs ${item.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => handleToggleStatus(item.id, item.status)}
                    className="text-sm text-blue-600 underline"
                  >
                    Đổi trạng thái
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-2 text-left border">Tên sản phẩm</th>
              <th className="p-2 text-left border">Danh mục</th>
              <th className="p-2 text-right border">Giá bán (VNĐ)</th>
              <th className="p-2 text-right border">Tồn kho</th>
              <th className="p-2 text-right border">Tồn tối thiểu</th>
              <th className="p-2 text-left border">Đơn vị</th>
              <th className="p-2 text-center border">Trạng thái</th>
              <th className="p-2 text-center border">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-2 border">{item.name}</td>
                <td className="p-2 border">{item.category}</td>
                <td className="p-2 border text-right">
                  {item.product_details.selling_price.toLocaleString()}
                </td>
                <td className="p-2 border text-right font-medium">
                  {item.product_details.stock_quantity}
                </td>
                <td className="p-2 border text-right">
                  {item.product_details.minimum_stock}
                </td>
                <td className="p-2 border">{item.product_details.unit}</td>
                <td className="p-2 border text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs ${item.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => handleToggleStatus(item.id, item.status)}
                    className="text-sm text-blue-600 underline"
                  >
                    Đổi trạng thái
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Thêm export default để sửa lỗi Vite runtime error

export const ServicesPage = CatalogPage;
export const ProductsPage = CatalogPage;
export const CombosPage = CatalogPage;
export const PricingPage = CatalogPage;
export default CatalogPage;

============================================================
FILE: src/pages/customers.tsx
============================================================
import React, { useEffect, useState, useCallback } from "react";
import { customerService } from "../services/customer.service";
import { Customer, CreateCustomerInput } from "../types/domain";

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState<CreateCustomerInput>({
    full_name: "",
    phone: "",
    email: "",
    date_of_birth: "",
    gender: "",
    address: "",
    notes: "",
  });

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerService.getCustomers(searchQuery);
      setCustomers(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Đã có lỗi xảy ra khi tải danh sách khách hàng.",
      );
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        full_name: customer.full_name || "",
        phone: customer.phone || "",
        email: customer.email || "",
        date_of_birth: customer.date_of_birth || "",
        gender: customer.gender || "",
        address: customer.address || "",
        notes: customer.notes || "",
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        full_name: "",
        phone: "",
        email: "",
        date_of_birth: "",
        gender: "",
        address: "",
        notes: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone) {
      alert("Vui lòng điền Họ tên và Số điện thoại.");
      return;
    }

    try {
      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.id, formData);
      } else {
        await customerService.createCustomer(formData);
      }
      handleCloseModal();
      loadCustomers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Thao tác không thành công.");
    }
  };

  const handleArchive = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn lưu trữ khách hàng này?")) {
      try {
        await customerService.archiveCustomer(id);
        loadCustomers();
      } catch (err: unknown) {
        alert(
          err instanceof Error ? err.message : "Không thể lưu trữ khách hàng.",
        );
      }
    }
  };

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>Quản lý Khách hàng</h2>
        <button
          onClick={() => handleOpenModal()}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          + Thêm khách hàng
        </button>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Tìm theo tên, điện thoại, email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <button
          onClick={loadCustomers}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Làm mới
        </button>
      </div>

      {loading && <div>Đang tải danh sách khách hàng...</div>}
      {error && (
        <div style={{ color: "red", marginBottom: "16px" }}>{error}</div>
      )}

      {!loading && !error && customers.length === 0 && (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            border: "1px dashed #ccc",
            borderRadius: "4px",
          }}
        >
          Không tìm thấy khách hàng nào.
        </div>
      )}

      {!loading && !error && customers.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#f8f9fa",
                borderBottom: "2px solid #dee2e6",
              }}
            >
              <th style={{ padding: "12px" }}>Họ tên</th>
              <th style={{ padding: "12px" }}>Điện thoại</th>
              <th style={{ padding: "12px" }}>Email</th>
              <th style={{ padding: "12px" }}>Ngày sinh</th>
              <th style={{ padding: "12px" }}>Giới tính</th>
              <th style={{ padding: "12px" }}>Tổng chi tiêu</th>
              <th style={{ padding: "12px" }}>Điểm tích lũy</th>
              <th style={{ padding: "12px" }}>Lần ghé gần nhất</th>
              <th style={{ padding: "12px" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                <td style={{ padding: "12px" }}>{c.full_name || c.fullName}</td>
                <td style={{ padding: "12px" }}>{c.phone}</td>
                <td style={{ padding: "12px" }}>{c.email || "—"}</td>
                <td style={{ padding: "12px" }}>{c.date_of_birth || "—"}</td>
                <td style={{ padding: "12px" }}>{c.gender || "—"}</td>
                <td style={{ padding: "12px" }}>
                  {(c.total_spend ?? c.totalSpend) !== undefined
                    ? `${(c.total_spend ?? c.totalSpend ?? 0).toLocaleString("vi-VN")} đ`
                    : "Chưa có dữ liệu"}
                </td>
                <td style={{ padding: "12px" }}>
                  {(c.loyalty_points ?? c.loyaltyPoints) !== undefined
                    ? (c.loyalty_points ?? c.loyaltyPoints)
                    : "Chưa có dữ liệu"}
                </td>
                <td style={{ padding: "12px" }}>
                  {c.last_visit || c.lastVisit || "Chưa có dữ liệu"}
                </td>
                <td style={{ padding: "12px" }}>
                  <button
                    onClick={() => handleOpenModal(c)}
                    style={{
                      marginRight: "8px",
                      padding: "4px 8px",
                      backgroundColor: "#ffc107",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleArchive(c.id)}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#dc3545",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Lưu trữ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h3>
              {editingCustomer ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "12px" }}>
                <label>Họ tên *</label>
                <input
                  type="text"
                  required
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Số điện thoại *</label>
                <input
                  type="text"
                  required
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Email</label>
                <input
                  type="email"
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Ngày sinh</label>
                <input
                  type="date"
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                  value={formData.date_of_birth || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, date_of_birth: e.target.value })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Giới tính</label>
                <select
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                  value={formData.gender || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                >
                  <option value="">Chưa chọn</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Địa chỉ</label>
                <input
                  type="text"
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Ghi chú</label>
                <textarea
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{ padding: "8px 16px" }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;

============================================================
FILE: src/pages/dashboard.tsx
============================================================
import { ArrowUpRight, CalendarClock, ChevronRight, CircleDollarSign, Clock3, Plus, ReceiptText, Sparkles, UserPlus, UsersRound } from 'lucide-react';
import { Link } from 'wouter';
import { demoCustomers, demoStaff, formatVnd, initials } from '@/data/demo';
import { Badge, PageHeader, Panel, PanelHeader } from '@/components/primitives';

const appointments = [
  { id: 'apt-1', time: '09:30', name: 'Nguyễn Minh Anh', service: 'Chăm sóc da chuyên sâu', staff: 'Thảo Vy', status: 'Đã xác nhận' },
  { id: 'apt-2', time: '10:45', name: 'Võ Khánh Linh', service: 'Gội đầu dưỡng sinh', staff: 'Thanh Trúc', status: 'Đã xác nhận' },
  { id: 'apt-3', time: '13:30', name: 'Phạm Gia Hân', service: 'Massage trị liệu cổ vai gáy', staff: 'Thảo Vy', status: 'Chờ khách đến' },
  { id: 'apt-4', time: '15:00', name: 'Trần Ngọc Mai', service: 'Điều trị mụn cơ bản', staff: 'Thanh Trúc', status: 'Đã xác nhận' },
];

export default function DashboardPage() {
  return <div className="page-wrap">
    <PageHeader kicker="Thứ Hai · 01.07.2024" title="Tổng quan hôm nay" subtitle="Một nhịp vận hành gọn gàng cho MEE Quận 1." actions={<><Link href="/pos" className="btn btn-soft" data-testid="link-dashboard-pos"><ReceiptText size={15} /> Mở POS</Link><Link href="/booking" className="btn btn-primary" data-testid="link-dashboard-booking"><Plus size={15} /> Tạo lịch hẹn</Link></>} />
    <section className="hero-dashboard mb-5" data-testid="card-dashboard-hero">
      <div className="max-w-lg"><div className="font-mono-app text-[10px] uppercase tracking-[.16em] opacity-70">Điểm chạm đầu ngày</div><h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">Giữ mọi thứ<br /><em>thật nhẹ nhàng.</em></h2><p className="mt-3 max-w-sm text-xs leading-relaxed opacity-75">4 liệu trình đang chờ đón khách. Quầy lễ tân đã sẵn sàng cho một ngày chỉn chu.</p><div className="mt-5 flex items-center gap-3"><Link href="/attendance" className="btn bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25" data-testid="link-hero-attendance"><Clock3 size={14} /> Xem chấm công</Link><span className="text-[11px] opacity-65">Cập nhật lúc 08:42</span></div></div>
    </section>
    <div className="section-grid three-col mb-5">
      <div className="panel metric-card" data-testid="metric-revenue"><div className="metric-label">Doanh thu hôm nay</div><div className="metric-value">12.840.000 ₫</div><div className="metric-note flex items-center gap-1"><ArrowUpRight size={13} /> +12,4% so với thứ Hai trước</div></div>
      <div className="panel metric-card" data-testid="metric-visits"><div className="metric-label">Lượt phục vụ</div><div className="metric-value">18 <span className="text-sm font-sans text-muted-foreground">/ 24</span></div><div className="metric-note">75% công suất hôm nay</div></div>
      <div className="panel metric-card" data-testid="metric-new-customers"><div className="metric-label">Khách mới</div><div className="metric-value">06</div><div className="metric-note flex items-center gap-1"><UsersRound size={13} /> 3 khách quay lại trong tuần</div></div>
    </div>
    <div className="section-grid two-col">
      <Panel testId="panel-today-appointments"><PanelHeader title="Lịch hẹn hôm nay" caption="4 lịch hẹn · 18 khách dự kiến" actions={<Link href="/booking" className="text-xs font-bold text-primary" data-testid="link-view-all-appointments">Xem lịch đầy đủ <ChevronRight size={13} className="inline" /></Link>} />
        <div>{appointments.map((item, index) => <div className="timeline-item" key={item.id} data-testid={`appointment-${item.id}`}><div className="w-12 shrink-0 font-mono-app text-xs font-medium text-muted-foreground">{item.time}</div><div className="timeline-dot" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><div className="avatar small">{initials(item.name)}</div><span className="text-xs font-bold" data-testid={`text-appointment-customer-${index}`}>{item.name}</span></div><Badge tone={item.status === 'Chờ khách đến' ? 'coral' : 'green'}>{item.status}</Badge></div><div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground"><span>{item.service}</span><span>·</span><span>{item.staff}</span></div></div></div>)}</div>
      </Panel>
      <div className="space-y-[18px]">
        <Panel testId="panel-quick-actions"><PanelHeader title="Thao tác nhanh" caption="Những việc thường dùng nhất" /><div className="grid grid-cols-2 gap-2 p-3">{[{ label: 'Thêm khách mới', href: '/customers', icon: UserPlus }, { label: 'Bán sản phẩm', href: '/pos', icon: CircleDollarSign }, { label: 'Ghi nhận chi phí', href: '/expenses', icon: ReceiptText }, { label: 'Ghi điểm loyalty', href: '/loyalty', icon: Sparkles }].map(({ label, href, icon: Icon }) => <Link className="quick-action" href={href} key={label} data-testid={`quick-action-${label}`}><Icon size={17} /><span className="text-[11px] font-bold">{label}</span></Link>)}</div></Panel>
        <Panel testId="panel-team-status"><PanelHeader title="Đội ngũ hôm nay" caption="3 / 4 đang có mặt" actions={<Link href="/attendance" className="text-xs font-bold text-primary" data-testid="link-team-attendance">Chấm công</Link>} /><div className="p-4">{demoStaff.slice(0, 3).map((staff) => <div className="mb-3 flex items-center gap-3 last:mb-0" key={staff.id} data-testid={`staff-status-${staff.id}`}><div className="avatar small">{initials(staff.fullName)}</div><div className="min-w-0 flex-1"><div className="truncate text-xs font-bold">{staff.fullName}</div><div className="text-[10px] text-muted-foreground">{staff.role}</div></div><span className="h-2 w-2 rounded-full bg-primary" /></div>)}</div></Panel>
      </div>
    </div>
    <Panel className="mt-[18px]" testId="panel-recent-customers"><PanelHeader title="Khách hàng gần đây" caption="Những vị khách vừa ghé MEE" actions={<Link href="/customers" className="text-xs font-bold text-primary" data-testid="link-dashboard-customers">Mở danh sách</Link>} /><div className="grid gap-0 sm:grid-cols-3">{demoCustomers.slice(0, 3).map((customer) => <Link href={`/customers/${customer.id}`} className="flex items-center gap-3 border-t border-border p-4 first:border-0 sm:border-t-0 sm:border-l sm:first:border-l-0" key={customer.id} data-testid={`customer-recent-${customer.id}`}><div className="avatar">{initials(customer.fullName)}</div><div className="min-w-0"><div className="truncate text-xs font-bold">{customer.fullName}</div><div className="mt-1 text-[10px] text-muted-foreground">{customer.visitCount} lần ghé · {formatVnd(customer.totalSpend)}</div></div></Link>)}</div></Panel>
  </div>;
}
============================================================
FILE: src/pages/not-found.tsx
============================================================
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">
              404 Page Not Found
            </h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

============================================================
FILE: src/pages/operations.tsx
============================================================
import React, { useEffect, useState, useCallback } from "react";
import {
  packageService,
  CreatePackageInput,
} from "../services/package.service";
import {
  expenseService,
  CreateExpenseInput,
} from "../services/expense.service";
import { catalogService } from "../services/catalog-service";
import { customerService } from "../services/customer.service";
import { PackageTemplate, Expense } from "../types/domain";

export const OperationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "packages" | "expenses" | "overview"
  >("packages");

  // State Packages
  const [packages, setPackages] = useState<PackageTemplate[]>([]);
  const [pkgLoading, setPkgLoading] = useState<boolean>(false);
  const [pkgError, setPkgError] = useState<string | null>(null);
  const [pkgSearch, setPkgSearch] = useState<string>("");
  const [isPkgModalOpen, setIsPkgModalOpen] = useState<boolean>(false);
  const [editingPkg, setEditingPkg] = useState<PackageTemplate | null>(null);
  const [pkgFormData, setPkgFormData] = useState<CreatePackageInput>({
    name: "",
    description: "",
    price: 0,
    total_sessions: 1,
    validity_days: 30,
  });

  // State Expenses
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expLoading, setExpLoading] = useState<boolean>(false);
  const [expError, setExpError] = useState<string | null>(null);
  const [expSearch, setExpSearch] = useState<string>("");
  const [expCategory, setExpCategory] = useState<string>("");
  const [expDate, setExpDate] = useState<string>("");
  const [isExpModalOpen, setIsExpModalOpen] = useState<boolean>(false);
  const [editingExp, setEditingExp] = useState<Expense | null>(null);
  const [expFormData, setExpFormData] = useState<CreateExpenseInput>({
    category: "",
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
    payment_method: "Tiền mặt",
  });

  // State Overview KPI
  const [overviewMetrics, setOverviewMetrics] = useState<{
    totalCustomers: number | null;
    totalServices: number | null;
    totalProducts: number | null;
    totalExpenses: number | null;
  }>({
    totalCustomers: null,
    totalServices: null,
    totalProducts: null,
    totalExpenses: null,
  });
  const [overviewLoading, setOverviewLoading] = useState<boolean>(false);

  // Load Packages
  const loadPackages = useCallback(async () => {
    try {
      setPkgLoading(true);
      setPkgError(null);
      const data = await packageService.getPackages(pkgSearch);
      setPackages(data);
    } catch (err: unknown) {
      setPkgError(
        err instanceof Error ? err.message : "Đã có lỗi tải gói liệu trình.",
      );
    } finally {
      setPkgLoading(false);
    }
  }, [pkgSearch]);

  // Load Expenses
  const loadExpenses = useCallback(async () => {
    try {
      setExpLoading(true);
      setExpError(null);
      const data = await expenseService.getExpenses({
        category: expCategory || undefined,
        date: expDate || undefined,
        searchQuery: expSearch || undefined,
      });
      setExpenses(data);
    } catch (err: unknown) {
      setExpError(
        err instanceof Error ? err.message : "Đã có lỗi tải danh sách chi phí.",
      );
    } finally {
      setExpLoading(false);
    }
  }, [expCategory, expDate, expSearch]);

  // Load Overview Data
  const loadOverview = useCallback(async () => {
    try {
      setOverviewLoading(true);
      const [customers, catalog, expList] = await Promise.all([
        customerService.getCustomers(),
        catalogService.getCatalogItems(),
        expenseService.getExpenses(),
      ]);

      const servicesCount = catalog.filter(
        (item) => item.item_type === "SERVICE",
      ).length;
      const productsCount = catalog.filter(
        (item) => item.item_type === "PRODUCT",
      ).length;
      const sumExpense = expList.reduce(
        (acc, curr) => acc + (curr.amount || 0),
        0,
      );

      setOverviewMetrics({
        totalCustomers: customers.length,
        totalServices: servicesCount,
        totalProducts: productsCount,
        totalExpenses: sumExpense,
      });
    } catch {
      setOverviewMetrics({
        totalCustomers: null,
        totalServices: null,
        totalProducts: null,
        totalExpenses: null,
      });
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "packages") loadPackages();
    if (activeTab === "expenses") loadExpenses();
    if (activeTab === "overview") loadOverview();
  }, [activeTab, loadPackages, loadExpenses, loadOverview]);

  // Package Modal Handlers
  const handleOpenPkgModal = (pkg?: PackageTemplate) => {
    if (pkg) {
      setEditingPkg(pkg);
      setPkgFormData({
        name: pkg.name || "",
        description: pkg.description || "",
        price: pkg.price || 0,
        total_sessions: pkg.total_sessions || 1,
        validity_days: pkg.validity_days || 30,
      });
    } else {
      setEditingPkg(null);
      setPkgFormData({
        name: "",
        description: "",
        price: 0,
        total_sessions: 1,
        validity_days: 30,
      });
    }
    setIsPkgModalOpen(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPkg) {
        await packageService.updatePackage(editingPkg.id, pkgFormData);
      } else {
        await packageService.createPackage(pkgFormData);
      }
      setIsPkgModalOpen(false);
      loadPackages();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Thao tác thất bại.");
    }
  };

  const handleArchivePackage = async (id: string) => {
    if (window.confirm("Lưu trữ gói liệu trình này?")) {
      try {
        await packageService.archivePackage(id);
        loadPackages();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Lỗi lưu trữ.");
      }
    }
  };

  // Expense Modal Handlers
  const handleOpenExpModal = (exp?: Expense) => {
    if (exp) {
      setEditingExp(exp);
      setExpFormData({
        category: exp.category || "",
        amount: exp.amount || 0,
        description: exp.description || "",
        date: exp.date || new Date().toISOString().split("T")[0],
        payment_method: exp.payment_method || "Tiền mặt",
      });
    } else {
      setEditingExp(null);
      setExpFormData({
        category: "",
        amount: 0,
        description: "",
        date: new Date().toISOString().split("T")[0],
        payment_method: "Tiền mặt",
      });
    }
    setIsExpModalOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExp) {
        await expenseService.updateExpense(editingExp.id, expFormData);
      } else {
        await expenseService.createExpense(expFormData);
      }
      setIsExpModalOpen(false);
      loadExpenses();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Thao tác thất bại.");
    }
  };

  const handleArchiveExpense = async (id: string) => {
    if (window.confirm("Lưu trữ khoản chi phí này?")) {
      try {
        await expenseService.archiveExpense(id);
        loadExpenses();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Lỗi lưu trữ.");
      }
    }
  };

  const totalExpenseAmount = expenses.reduce(
    (acc, c) => acc + (c.amount || 0),
    0,
  );

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
      <h2>Quản lý Vận hành</h2>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          borderBottom: "2px solid #eee",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setActiveTab("packages")}
          style={{
            padding: "10px 20px",
            borderBottom:
              activeTab === "packages" ? "3px solid #007bff" : "none",
            fontWeight: activeTab === "packages" ? "bold" : "normal",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Gói liệu trình
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          style={{
            padding: "10px 20px",
            borderBottom:
              activeTab === "expenses" ? "3px solid #007bff" : "none",
            fontWeight: activeTab === "expenses" ? "bold" : "normal",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Chi phí vận hành
        </button>
        <button
          onClick={() => setActiveTab("overview")}
          style={{
            padding: "10px 20px",
            borderBottom:
              activeTab === "overview" ? "3px solid #007bff" : "none",
            fontWeight: activeTab === "overview" ? "bold" : "normal",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Tổng quan
        </button>
      </div>

      {/* TAB 1: PACKAGES */}
      {activeTab === "packages" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", gap: "8px", flex: 1 }}>
              <input
                type="text"
                placeholder="Tìm gói liệu trình..."
                value={pkgSearch}
                onChange={(e) => setPkgSearch(e.target.value)}
                style={{
                  padding: "8px",
                  width: "300px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              <button onClick={loadPackages} style={{ padding: "8px 16px" }}>
                Làm mới
              </button>
            </div>
            <button
              onClick={() => handleOpenPkgModal()}
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              + Thêm gói
            </button>
          </div>

          {pkgLoading && <div>Đang tải gói liệu trình...</div>}
          {pkgError && <div style={{ color: "red" }}>{pkgError}</div>}
          {!pkgLoading && !pkgError && packages.length === 0 && (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                border: "1px dashed #ccc",
              }}
            >
              Chưa có dữ liệu gói liệu trình.
            </div>
          )}

          {!pkgLoading && !pkgError && packages.length > 0 && (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #dee2e6",
                  }}
                >
                  <th style={{ padding: "10px" }}>Tên gói</th>
                  <th style={{ padding: "10px" }}>Giá</th>
                  <th style={{ padding: "10px" }}>Số buổi</th>
                  <th style={{ padding: "10px" }}>Thời hạn (Ngày)</th>
                  <th style={{ padding: "10px" }}>Trạng thái</th>
                  <th style={{ padding: "10px" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                    <td style={{ padding: "10px" }}>
                      <strong>{p.name}</strong>
                      {p.description && (
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {p.price ? `${p.price.toLocaleString("vi-VN")} đ` : "0 đ"}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {p.total_sessions || "—"}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {p.validity_days || "—"}
                    </td>
                    <td style={{ padding: "10px" }}>{p.status || "active"}</td>
                    <td style={{ padding: "10px" }}>
                      <button
                        onClick={() => handleOpenPkgModal(p)}
                        style={{ marginRight: "8px", padding: "4px 8px" }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleArchivePackage(p.id)}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#dc3545",
                          color: "#fff",
                          border: "none",
                        }}
                      >
                        Lưu trữ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 2: EXPENSES */}
      {activeTab === "expenses" && (
        <div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "16px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder="Tìm mô tả, danh mục..."
              value={expSearch}
              onChange={(e) => setExpSearch(e.target.value)}
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <input
              type="text"
              placeholder="Lọc danh mục..."
              value={expCategory}
              onChange={(e) => setExpCategory(e.target.value)}
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <input
              type="date"
              value={expDate}
              onChange={(e) => setExpDate(e.target.value)}
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <button onClick={loadExpenses} style={{ padding: "8px 16px" }}>
              Làm mới
            </button>
            <div style={{ marginLeft: "auto" }}>
              <button
                onClick={() => handleOpenExpModal()}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                + Thêm chi phí
              </button>
            </div>
          </div>

          <div
            style={{
              marginBottom: "16px",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            Tổng chi phí: {totalExpenseAmount.toLocaleString("vi-VN")} đ
          </div>

          {expLoading && <div>Đang tải chi phí...</div>}
          {expError && <div style={{ color: "red" }}>{expError}</div>}
          {!expLoading && !expError && expenses.length === 0 && (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                border: "1px dashed #ccc",
              }}
            >
              Chưa có dữ liệu chi phí.
            </div>
          )}

          {!expLoading && !expError && expenses.length > 0 && (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #dee2e6",
                  }}
                >
                  <th style={{ padding: "10px" }}>Ngày</th>
                  <th style={{ padding: "10px" }}>Danh mục</th>
                  <th style={{ padding: "10px" }}>Số tiền</th>
                  <th style={{ padding: "10px" }}>Phương thức</th>
                  <th style={{ padding: "10px" }}>Mô tả</th>
                  <th style={{ padding: "10px" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                    <td style={{ padding: "10px" }}>{e.date}</td>
                    <td style={{ padding: "10px" }}>{e.category}</td>
                    <td style={{ padding: "10px", fontWeight: "bold" }}>
                      {e.amount
                        ? `${e.amount.toLocaleString("vi-VN")} đ`
                        : "0 đ"}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {e.payment_method || "—"}
                    </td>
                    <td style={{ padding: "10px" }}>{e.description || "—"}</td>
                    <td style={{ padding: "10px" }}>
                      <button
                        onClick={() => handleOpenExpModal(e)}
                        style={{ marginRight: "8px", padding: "4px 8px" }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleArchiveExpense(e.id)}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#dc3545",
                          color: "#fff",
                          border: "none",
                        }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 3: OVERVIEW */}
      {activeTab === "overview" && (
        <div>
          {overviewLoading ? (
            <div>Đang tính toán chỉ số...</div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#666" }}>
                  Tổng khách hàng
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginTop: "8px",
                  }}
                >
                  {overviewMetrics.totalCustomers !== null
                    ? overviewMetrics.totalCustomers
                    : "Chưa có dữ liệu"}
                </div>
              </div>
              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#666" }}>
                  Tổng dịch vụ
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginTop: "8px",
                  }}
                >
                  {overviewMetrics.totalServices !== null
                    ? overviewMetrics.totalServices
                    : "Chưa có dữ liệu"}
                </div>
              </div>
              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#666" }}>
                  Tổng sản phẩm
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginTop: "8px",
                  }}
                >
                  {overviewMetrics.totalProducts !== null
                    ? overviewMetrics.totalProducts
                    : "Chưa có dữ liệu"}
                </div>
              </div>
              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#666" }}>
                  Tổng chi phí
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginTop: "8px",
                  }}
                >
                  {overviewMetrics.totalExpenses !== null
                    ? `${overviewMetrics.totalExpenses.toLocaleString("vi-VN")} đ`
                    : "Chưa có dữ liệu"}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL PACKAGE */}
      {isPkgModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h3>
              {editingPkg ? "Sửa gói liệu trình" : "Thêm gói liệu trình mới"}
            </h3>
            <form onSubmit={handleSavePackage}>
              <div style={{ marginBottom: "12px" }}>
                <label>Tên gói *</label>
                <input
                  type="text"
                  required
                  style={{ width: "100%", padding: "8px" }}
                  value={pkgFormData.name}
                  onChange={(e) =>
                    setPkgFormData({ ...pkgFormData, name: e.target.value })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Giá *</label>
                <input
                  type="number"
                  required
                  style={{ width: "100%", padding: "8px" }}
                  value={pkgFormData.price}
                  onChange={(e) =>
                    setPkgFormData({
                      ...pkgFormData,
                      price: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Số buổi</label>
                <input
                  type="number"
                  style={{ width: "100%", padding: "8px" }}
                  value={pkgFormData.total_sessions || 1}
                  onChange={(e) =>
                    setPkgFormData({
                      ...pkgFormData,
                      total_sessions: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Thời hạn (ngày)</label>
                <input
                  type="number"
                  style={{ width: "100%", padding: "8px" }}
                  value={pkgFormData.validity_days || 30}
                  onChange={(e) =>
                    setPkgFormData({
                      ...pkgFormData,
                      validity_days: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Mô tả</label>
                <textarea
                  style={{ width: "100%", padding: "8px" }}
                  value={pkgFormData.description || ""}
                  onChange={(e) =>
                    setPkgFormData({
                      ...pkgFormData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                }}
              >
                <button type="button" onClick={() => setIsPkgModalOpen(false)}>
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                  }}
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EXPENSE */}
      {isExpModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h3>{editingExp ? "Sửa khoản chi" : "Thêm khoản chi mới"}</h3>
            <form onSubmit={handleSaveExpense}>
              <div style={{ marginBottom: "12px" }}>
                <label>Danh mục *</label>
                <input
                  type="text"
                  required
                  style={{ width: "100%", padding: "8px" }}
                  value={expFormData.category}
                  onChange={(e) =>
                    setExpFormData({ ...expFormData, category: e.target.value })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Số tiền *</label>
                <input
                  type="number"
                  required
                  style={{ width: "100%", padding: "8px" }}
                  value={expFormData.amount}
                  onChange={(e) =>
                    setExpFormData({
                      ...expFormData,
                      amount: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Ngày chi *</label>
                <input
                  type="date"
                  required
                  style={{ width: "100%", padding: "8px" }}
                  value={expFormData.date}
                  onChange={(e) =>
                    setExpFormData({ ...expFormData, date: e.target.value })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Phương thức thanh toán</label>
                <input
                  type="text"
                  style={{ width: "100%", padding: "8px" }}
                  value={expFormData.payment_method || ""}
                  onChange={(e) =>
                    setExpFormData({
                      ...expFormData,
                      payment_method: e.target.value,
                    })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Mô tả</label>
                <textarea
                  style={{ width: "100%", padding: "8px" }}
                  value={expFormData.description || ""}
                  onChange={(e) =>
                    setExpFormData({
                      ...expFormData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                }}
              >
                <button type="button" onClick={() => setIsExpModalOpen(false)}>
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                  }}
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Router compatibility exports
export const AttendancePage = OperationsPage;
export const BookingPage = OperationsPage;
export const ExpensesPage = OperationsPage;
export const LoyaltyPage = OperationsPage;
export const PackagesPage = OperationsPage;
export const PosPage = OperationsPage;
export const ReportsPage = OperationsPage;
export const SettingsPage = OperationsPage;
export const StaffPage = OperationsPage;

export default OperationsPage;

============================================================
FILE: src/pages/staff.tsx
============================================================
import React, { useState, useEffect, useCallback } from "react";
import {
  fetchStaff,
  createStaff,
  updateStaff,
  updateStaffStatus,
  archiveStaff,
} from "../services/staff.service";
import { StaffMemberDomain, CreateStaffInput } from "../types/domain";

export const StaffPage: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffMemberDomain[]>([]);
  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMemberDomain | null>(
    null,
  );
  const [formData, setFormData] = useState<CreateStaffInput>({
    full_name: "",
    role: "Kỹ thuật viên",
    phone: "",
    status: "ACTIVE",
    started_on: new Date().toISOString().split("T")[0],
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchStaff(search, includeInactive);
      setStaffList(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi khi kết nối tới hệ thống Supabase");
    } finally {
      setLoading(false);
    }
  }, [search, includeInactive]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenModal = (staff?: StaffMemberDomain) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        full_name: staff.full_name,
        role: staff.role,
        phone: staff.phone,
        status: staff.status,
        started_on: staff.started_on ? staff.started_on.split("T")[0] : "",
      });
    } else {
      setEditingStaff(null);
      setFormData({
        full_name: "",
        role: "Kỹ thuật viên",
        phone: "",
        status: "ACTIVE",
        started_on: new Date().toISOString().split("T")[0],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, formData);
        setSuccessMessage("Cập nhật nhân viên thành công!");
      } else {
        await createStaff(formData);
        setSuccessMessage("Thêm mới nhân viên thành công!");
      }
      handleCloseModal();
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleToggleStatus = async (
    id: string,
    currentStatus: "ACTIVE" | "INACTIVE",
  ) => {
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateStaffStatus(id, nextStatus);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleArchive = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn lưu trữ (archive) nhân viên "${name}"?`,
      )
    )
      return;
    try {
      await archiveStaff(id);
      setSuccessMessage(`Đã lưu trữ nhân viên ${name}`);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý Nhân viên (Staff)
          </h1>
          <p className="text-sm text-gray-500">Dữ liệu thực tế từ Supabase</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
        >
          + Thêm nhân viên
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="Tìm theo tên, SĐT, hoặc chức danh..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-3 py-2 border rounded text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
            className="rounded"
          />
          Hiển thị cả nhân viên Tạm ngưng (INACTIVE)
        </label>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded border border-red-300 text-sm">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="p-4 mb-4 text-green-700 bg-green-100 rounded border border-green-300 text-sm">
          {successMessage}
        </div>
      )}

      {/* Main Table */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">
          Đang tải danh sách nhân viên từ Supabase...
        </div>
      ) : staffList.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 border rounded text-gray-500">
          Không tìm thấy nhân viên nào phù hợp.
        </div>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3 font-semibold text-gray-700">Họ và tên</th>
                <th className="p-3 font-semibold text-gray-700">
                  Chức danh / Role
                </th>
                <th className="p-3 font-semibold text-gray-700">
                  Số điện thoại
                </th>
                <th className="p-3 font-semibold text-gray-700">
                  Ngày bắt đầu
                </th>
                <th className="p-3 font-semibold text-gray-700 text-center">
                  Trạng thái
                </th>
                <th className="p-3 font-semibold text-gray-700 text-center">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff) => (
                <tr
                  key={staff.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium text-gray-900">
                    {staff.full_name}
                  </td>
                  <td className="p-3 text-gray-600">{staff.role}</td>
                  <td className="p-3 text-gray-600">{staff.phone}</td>
                  <td className="p-3 text-gray-600">
                    {staff.started_on || "N/A"}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        staff.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {staff.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleOpenModal(staff)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() =>
                          handleToggleStatus(staff.id, staff.status)
                        }
                        className="text-gray-600 hover:underline"
                      >
                        {staff.status === "ACTIVE" ? "Tạm ngưng" : "Kích hoạt"}
                      </button>
                      <button
                        onClick={() => handleArchive(staff.id, staff.full_name)}
                        className="text-red-600 hover:underline"
                      >
                        Lưu trữ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {editingStaff ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chức danh / Role *
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Kỹ thuật viên, Lễ tân, Quản lý..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={formData.started_on}
                  onChange={(e) =>
                    setFormData({ ...formData, started_on: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "ACTIVE" | "INACTIVE",
                    })
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">ACTIVE (Hoạt động)</option>
                  <option value="INACTIVE">INACTIVE (Tạm ngưng)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingStaff ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;
