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
  Spinner,
  EmptyState,
} from "../components/primitives";
import { Customer } from "../types/domain";
import {
  fetchCustomers,
  createCustomer,
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchCustomerById(customerId)
      .then((data) => setCustomer(data))
      .catch((err) => {
        console.error("Lỗi tải thông tin khách hàng:", err);
        setError(err instanceof Error ? err.message : "Lỗi không xác định");
      })
      .finally(() => setLoading(false));
  }, [customerId]);

  if (loading) {
    return <Spinner className="py-12" />;
  }

  if (error || !customer) {
    return (
      <EmptyState
        title="Không tìm thấy khách hàng"
        description={
          error || "Thông tin khách hàng không tồn tại hoặc đã bị xóa."
        }
        action={onBack ? <Button onClick={onBack}>Quay lại</Button> : undefined}
      />
    );
  }

  const displayName = customer.full_name || "Khách hàng";
  const displayCode = customer.id ? customer.id.substring(0, 8) : "—";
  const totalSpend = customer.total_spend ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
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
              {displayCode}
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
                {totalSpend.toLocaleString("vi-VN")} đ
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-xs text-green-600 font-medium">
                Lần ghé gần nhất
              </p>
              <p className="text-xl font-bold text-green-900">
                {customer.last_visit
                  ? new Date(customer.last_visit).toLocaleDateString("vi-VN")
                  : "Chưa có"}
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
  const [pageError, setPageError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );

  // Modal State cho Create
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    setPageError(null);
    try {
      const data = await fetchCustomers();
      setCustomers(data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách khách hàng:", err);
      setPageError(
        err instanceof Error ? err.message : "Lỗi khi tải danh sách khách hàng",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    setSubmitting(true);
    setModalError(null);
    try {
      await createCustomer({
        full_name: formData.name.trim(),
        phone: formData.phone.trim(),
      });
      setIsAddModalOpen(false);
      setFormData({ name: "", phone: "" });
      await loadData();
    } catch (err) {
      console.error("Lỗi tạo khách hàng:", err);
      setModalError(
        err instanceof Error
          ? err.message
          : "Tạo khách hàng thất bại. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    const nameStr = (c.full_name || "").toLowerCase();
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
          <Button
            onClick={() => {
              setModalError(null);
              setFormData({ name: "", phone: "" });
              setIsAddModalOpen(true);
            }}
          >
            + Thêm khách hàng
          </Button>
        }
      />

      {pageError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {pageError}
        </div>
      )}

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
              renderRow={(item: Customer) => {
                const nameDisplay = item.full_name || "Khách hàng";
                const codeDisplay = item.id ? item.id.substring(0, 8) : "—";
                const spendDisplay = item.total_spend ?? 0;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 text-xs font-mono text-gray-500">
                      {codeDisplay}
                    </td>
                    <td className="p-3 font-medium text-gray-900">
                      {nameDisplay}
                    </td>
                    <td className="p-3 text-gray-600">{item.phone}</td>
                    <td className="p-3 text-gray-500 text-xs">
                      {item.address || "—"}
                    </td>
                    <td className="p-3 font-semibold text-blue-600">
                      {spendDisplay.toLocaleString("vi-VN")} đ
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
                );
              }}
            />
          )}
        </PanelContent>
      </Panel>

      {/* MODAL THÊM KHÁCH HÀNG TỐI GIẢN */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Khách Hàng Mới"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs font-medium">
              {modalError}
            </div>
          )}

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
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
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

export default CustomersPage;
