import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
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
  Select,
} from "../components/primitives";
import {
  Customer,
  CustomerPhoto,
  CustomerPackage,
  ServiceSession,
  Invoice,
  PhotoType,
} from "../types/domain";
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  fetchCustomerById,
  fetchCustomerPhotos,
  uploadCustomerPhoto,
  deleteCustomerPhoto,
  fetchCustomerPackages,
  usePackageSession,
  fetchCustomerServiceHistory,
  fetchCustomerInvoices,
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
  const [activeTab, setActiveTab] = useState<
    "info" | "photos" | "packages" | "history"
  >("info");

  // Tab 1: Info Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
    gender: "",
    birth_date: "",
    notes: "",
  });
  const [updating, setUpdating] = useState<boolean>(false);

  // Tab 2: Photos State
  const [photos, setPhotos] = useState<CustomerPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState<boolean>(false);
  const [photoFilter, setPhotoFilter] = useState<string>("ALL");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPhotoType, setUploadPhotoType] = useState<PhotoType>("BEFORE");
  const [uploadNotes, setUploadNotes] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [previewPhoto, setPreviewPhoto] = useState<CustomerPhoto | null>(null);

  // Tab 3: Packages State
  const [packages, setPackages] = useState<CustomerPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState<boolean>(false);
  const [usingSessionId, setUsingSessionId] = useState<string | null>(null);

  // Tab 4: History State
  const [history, setHistory] = useState<ServiceSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Invoices State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const loadCustomerDetails = async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const data = await fetchCustomerById(customerId);
      setCustomer(data);
      if (data) {
        setEditFormData({
          full_name: data.full_name || data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          gender: data.gender || "",
          birth_date: data.birth_date || "",
          notes: data.notes || "",
        });
      }
    } catch (err) {
      console.error("Lỗi tải thông tin khách hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async () => {
    if (!customerId) return;
    setLoadingPhotos(true);
    try {
      const data = await fetchCustomerPhotos(customerId);
      setPhotos(data);
    } catch (err) {
      console.error("Lỗi tải ảnh khách hàng:", err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const loadPackages = async () => {
    if (!customerId) return;
    setLoadingPackages(true);
    try {
      const data = await fetchCustomerPackages(customerId);
      setPackages(data);
    } catch (err) {
      console.error("Lỗi tải gói liệu trình:", err);
    } finally {
      setLoadingPackages(false);
    }
  };

  const loadHistory = async () => {
    if (!customerId) return;
    setLoadingHistory(true);
    try {
      const data = await fetchCustomerServiceHistory(customerId);
      setHistory(data);
    } catch (err) {
      console.error("Lỗi tải lịch sử dịch vụ:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadInvoices = async () => {
    if (!customerId) return;
    setLoadingInvoices(true);
    try {
      const data = await fetchCustomerInvoices(customerId);
      setInvoices(data);
    } catch (err) {
      console.error("Lỗi tải hóa đơn khách hàng:", err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      loadCustomerDetails();
      loadPhotos();
      loadPackages();
      loadHistory();
      loadInvoices();
    }
  }, [customerId]);

  const handleUpdateInfo = async (e: FormEvent) => {
    e.preventDefault();
    if (!customerId) return;

    setUpdating(true);
    try {
      const updated = await updateCustomer(customerId, {
        full_name: editFormData.full_name,
        name: editFormData.full_name,
        phone: editFormData.phone,
        email: editFormData.email || null,
        address: editFormData.address || null,
        gender: editFormData.gender || null,
        birth_date: editFormData.birth_date || null,
        notes: editFormData.notes || null,
      });
      setCustomer(updated);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Lỗi cập nhật thông tin:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleUploadPhoto = async (e: FormEvent) => {
    e.preventDefault();
    if (!customerId || !selectedFile) return;

    setUploading(true);
    try {
      await uploadCustomerPhoto(
        customerId,
        selectedFile,
        uploadPhotoType,
        uploadNotes,
      );
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setUploadNotes("");
      await loadPhotos();
    } catch (err) {
      console.error("Lỗi upload ảnh:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photo: CustomerPhoto) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;
    try {
      await deleteCustomerPhoto(photo.id, photo.storage_path);
      if (previewPhoto?.id === photo.id) setPreviewPhoto(null);
      await loadPhotos();
    } catch (err) {
      console.error("Lỗi xóa ảnh:", err);
    }
  };

  const handleUsePackageSession = async (pkg: CustomerPackage) => {
    if (pkg.remaining_sessions <= 0) return;
    if (
      !window.confirm(
        `Xác nhận trừ 1 buổi từ gói "${pkg.package_name || pkg.catalog_item?.name || "Liệu trình"}"?`,
      )
    ) {
      return;
    }

    setUsingSessionId(pkg.id);
    try {
      await usePackageSession(pkg.id);
      await loadPackages();
      await loadHistory();
      await loadCustomerDetails();
    } catch (err) {
      console.error("Lỗi trừ buổi gói liệu trình:", err);
      alert(err instanceof Error ? err.message : "Thao tác thất bại");
    } finally {
      setUsingSessionId(null);
    }
  };

  if (loading) {
    return <Spinner className="py-12" />;
  }

  if (!customer) {
    return (
      <EmptyState
        title="Không tìm thấy khách hàng"
        description="Thông tin khách hàng không tồn tại hoặc đã bị xóa."
        action={
          onBack ? (
            <Button onClick={onBack}>Quay lại danh sách</Button>
          ) : undefined
        }
      />
    );
  }

  const totalSpentFormatted =
    (customer.total_spend || customer.total_spent || 0).toLocaleString(
      "vi-VN",
    ) + " đ";
  const filteredPhotos = photos.filter(
    (p) => photoFilter === "ALL" || p.photo_type === photoFilter,
  );

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              {customer.full_name || customer.name}
            </h2>
            {customer.code && <Badge variant="info">{customer.code}</Badge>}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            📱 {customer.phone} {customer.email ? `• ✉️ ${customer.email}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-gray-500">Tổng chi tiêu</p>
            <p className="text-lg font-bold text-blue-600">
              {totalSpentFormatted}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Lần ghé gần nhất</p>
            <p className="text-sm font-semibold text-gray-800">
              {customer.last_visit
                ? new Date(customer.last_visit).toLocaleDateString("vi-VN")
                : "Chưa có"}
            </p>
          </div>
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Quay lại
            </Button>
          )}
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-4 pt-2">
        <button
          onClick={() => setActiveTab("info")}
          className={`py-3 px-5 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === "info"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          1. THÔNG TIN
        </button>
        <button
          onClick={() => setActiveTab("photos")}
          className={`py-3 px-5 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === "photos"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          2. NHẬT KÝ ÁNH ({photos.length})
        </button>
        <button
          onClick={() => setActiveTab("packages")}
          className={`py-3 px-5 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === "packages"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          3. LIỆU TRÌNH ({packages.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`py-3 px-5 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          4. LỊCH SỬ DỊCH VỤ ({history.length})
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* TAB 1: THÔNG TIN */}
      {activeTab === "info" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            title="Thông tin chi tiết"
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditModalOpen(true)}
              >
                Chỉnh sửa
              </Button>
            }
          >
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-semibold text-gray-600">Họ và tên:</span>{" "}
                <span className="text-gray-900 font-medium">
                  {customer.full_name || customer.name}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-600">
                  Số điện thoại:
                </span>{" "}
                <span className="text-gray-900">{customer.phone}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Email:</span>{" "}
                <span className="text-gray-900">{customer.email || "—"}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Giới tính:</span>{" "}
                <span className="text-gray-900">{customer.gender || "—"}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Ngày sinh:</span>{" "}
                <span className="text-gray-900">
                  {customer.birth_date || "—"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Địa chỉ:</span>{" "}
                <span className="text-gray-900">{customer.address || "—"}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Ghi chú:</span>{" "}
                <p className="mt-1 p-2 bg-gray-50 rounded border border-gray-100 text-gray-700">
                  {customer.notes || "Không có ghi chú"}
                </p>
              </div>
            </div>
          </Card>

          <Card title="Thống kê tổng quan" className="md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-600 font-medium">
                  Tổng chi tiêu
                </p>
                <p className="text-xl font-bold text-blue-900 mt-1">
                  {totalSpentFormatted}
                </p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <p className="text-xs text-emerald-600 font-medium">
                  Số lượt ghé
                </p>
                <p className="text-xl font-bold text-emerald-900 mt-1">
                  {customer.total_visits || history.length} lượt
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-xs text-purple-600 font-medium">
                  Ngày tham gia
                </p>
                <p className="text-sm font-bold text-purple-900 mt-2">
                  {new Date(customer.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>

            {/* SECTIONS: HÓA ĐƠN GẦN ĐÂY */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3">
                Lịch sử Hóa đơn ({invoices.length})
              </h4>
              {loadingInvoices ? (
                <Spinner className="py-4" />
              ) : invoices.length === 0 ? (
                <p className="text-xs text-gray-500 italic">
                  Chưa có hóa đơn nào được tạo.
                </p>
              ) : (
                <Table
                  headers={[
                    "Mã HĐ",
                    "Ngày",
                    "Tổng tiền",
                    "Giảm giá",
                    "Thành tiền",
                    "Thanh toán",
                    "Chi tiết",
                  ]}
                  data={invoices}
                  renderRow={(inv: Invoice) => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="p-2 font-mono text-xs text-gray-600">
                        {inv.invoice_code || inv.code || inv.id.substring(0, 8)}
                      </td>
                      <td className="p-2 text-xs">
                        {new Date(inv.created_at).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="p-2 text-xs text-gray-500">
                        {inv.total_amount?.toLocaleString("vi-VN")} đ
                      </td>
                      <td className="p-2 text-xs text-red-500">
                        -{inv.discount_amount?.toLocaleString("vi-VN")} đ
                      </td>
                      <td className="p-2 text-xs font-bold text-blue-600">
                        {inv.final_amount?.toLocaleString("vi-VN")} đ
                      </td>
                      <td className="p-2 text-xs">
                        <Badge variant="info">{inv.payment_method}</Badge>
                      </td>
                      <td className="p-2 text-xs">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedInvoice(inv)}
                        >
                          Xem
                        </Button>
                      </td>
                    </tr>
                  )}
                />
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: NHẬT KÝ ÁNH */}
      {activeTab === "photos" && (
        <Panel>
          <PanelHeader
            title="Nhật ký hình ảnh điều trị"
            action={
              <div className="flex items-center gap-3">
                <Select
                  value={photoFilter}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setPhotoFilter(e.target.value)
                  }
                  className="w-36"
                >
                  <option value="ALL">Tất cả ảnh</option>
                  <option value="BEFORE">Trước điều trị (BEFORE)</option>
                  <option value="PROGRESS">Tiến trình (PROGRESS)</option>
                  <option value="AFTER">Sau điều trị (AFTER)</option>
                </Select>
                <Button onClick={() => setIsUploadModalOpen(true)}>
                  + Tải ảnh mới
                </Button>
              </div>
            }
          />
          <PanelContent>
            {loadingPhotos ? (
              <Spinner className="py-8" />
            ) : filteredPhotos.length === 0 ? (
              <EmptyState
                title="Chưa có hình ảnh nào"
                description="Tải ảnh điều trị BEFORE, PROGRESS, AFTER để theo dõi tiến trình làm đẹp của khách."
                action={
                  <Button onClick={() => setIsUploadModalOpen(true)}>
                    Tải ảnh ngay
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div
                      className="aspect-square bg-gray-100 overflow-hidden cursor-pointer"
                      onClick={() => setPreviewPhoto(photo)}
                    >
                      {photo.signed_url ? (
                        <img
                          src={photo.signed_url}
                          alt={photo.photo_type}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                          Lỗi tải ảnh
                        </div>
                      )}
                    </div>
                    <div className="p-2 flex items-center justify-between bg-white border-t">
                      <Badge
                        variant={
                          photo.photo_type === "BEFORE"
                            ? "danger"
                            : photo.photo_type === "PROGRESS"
                              ? "warning"
                              : "success"
                        }
                      >
                        {photo.photo_type}
                      </Badge>
                      <button
                        onClick={() => handleDeletePhoto(photo)}
                        className="text-gray-400 hover:text-red-600 text-xs font-semibold p-1"
                        title="Xóa ảnh"
                      >
                        Xóa
                      </button>
                    </div>
                    {photo.notes && (
                      <div
                        className="px-2 pb-2 text-[11px] text-gray-500 truncate"
                        title={photo.notes}
                      >
                        {photo.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </PanelContent>
        </Panel>
      )}

      {/* TAB 3: LIỆU TRÌNH */}
      {activeTab === "packages" && (
        <Panel>
          <PanelHeader title="Danh sách Gói liệu trình đã mua" />
          <PanelContent>
            {loadingPackages ? (
              <Spinner className="py-8" />
            ) : packages.length === 0 ? (
              <EmptyState
                title="Khách hàng chưa có gói liệu trình"
                description="Các gói dịch vụ hoặc thẻ liệu trình mua trước sẽ hiển thị tại đây."
              />
            ) : (
              <Table
                headers={[
                  "Tên Gói Liệu Trình",
                  "Tổng số buổi",
                  "Đã sử dụng",
                  "Còn lại",
                  "Giá mua",
                  "Ngày mua",
                  "Trạng thái",
                  "Thao tác",
                ]}
                data={packages}
                renderRow={(pkg: CustomerPackage) => {
                  const usedSessions =
                    pkg.total_sessions - pkg.remaining_sessions;
                  const isDepleted = pkg.remaining_sessions <= 0;

                  return (
                    <tr
                      key={pkg.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3 font-semibold text-gray-900">
                        {pkg.package_name ||
                          pkg.catalog_item?.name ||
                          "Liệu trình đặc biệt"}
                      </td>
                      <td className="p-3 text-gray-600 text-center">
                        {pkg.total_sessions} buổi
                      </td>
                      <td className="p-3 text-gray-600 text-center">
                        {usedSessions} buổi
                      </td>
                      <td className="p-3 font-bold text-blue-600 text-center">
                        {pkg.remaining_sessions} buổi
                      </td>
                      <td className="p-3 font-medium text-gray-900">
                        {(pkg.price_paid || 0).toLocaleString("vi-VN")} đ
                      </td>
                      <td className="p-3 text-xs text-gray-500">
                        {new Date(
                          pkg.purchased_at || pkg.created_at,
                        ).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            isDepleted
                              ? "danger"
                              : pkg.status === "ACTIVE"
                                ? "success"
                                : "warning"
                          }
                        >
                          {isDepleted ? "Đã hết" : pkg.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={isDepleted || usingSessionId === pkg.id}
                          isLoading={usingSessionId === pkg.id}
                          onClick={() => handleUsePackageSession(pkg)}
                        >
                          Trừ 1 buổi
                        </Button>
                      </td>
                    </tr>
                  );
                }}
              />
            )}
          </PanelContent>
        </Panel>
      )}

      {/* TAB 4: LỊCH SỬ DỊCH VỤ */}
      {activeTab === "history" && (
        <Panel>
          <PanelHeader title="Nhật ký & Lịch sử sử dụng dịch vụ" />
          <PanelContent>
            {loadingHistory ? (
              <Spinner className="py-8" />
            ) : history.length === 0 ? (
              <EmptyState
                title="Chưa có lịch sử dịch vụ"
                description="Toàn bộ lượt dịch vụ thanh toán trực tiếp và lượt trừ từ gói liệu trình sẽ hiển thị đầy đủ tại đây."
              />
            ) : (
              <Table
                headers={[
                  "Thời gian",
                  "Tên Dịch Vụ",
                  "Hình thức / Nguồn",
                  "Nhân viên thực hiện",
                  "Số tiền",
                  "Ghi chú",
                ]}
                data={history}
                renderRow={(item: ServiceSession) => {
                  const isPackage = item.source_type === "PACKAGE";
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-3 text-xs font-mono text-gray-600">
                        {new Date(
                          item.performed_at || item.created_at,
                        ).toLocaleString("vi-VN")}
                      </td>
                      <td className="p-3 font-medium text-gray-900">
                        {item.catalog_item?.name || "Dịch vụ Spa"}
                      </td>
                      <td className="p-3">
                        <Badge variant={isPackage ? "info" : "neutral"}>
                          {isPackage
                            ? "Gói liệu trình"
                            : "Thanh toán trực tiếp"}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {item.staff?.full_name || "Kỹ thuật viên"}
                      </td>
                      <td className="p-3 font-semibold text-gray-900">
                        {isPackage ? (
                          <span className="text-gray-400">0 đ</span>
                        ) : (
                          `${(item.price_charged || 0).toLocaleString("vi-VN")} đ`
                        )}
                      </td>
                      <td className="p-3 text-xs text-gray-500">
                        {item.notes || "—"}
                      </td>
                    </tr>
                  );
                }}
              />
            )}
          </PanelContent>
        </Panel>
      )}

      {/* MODAL: EDIT CUSTOMER INFO */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Cập nhật thông tin khách hàng"
      >
        <form onSubmit={handleUpdateInfo} className="space-y-4">
          <Input
            label="Họ và Tên *"
            required
            value={editFormData.full_name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEditFormData({ ...editFormData, full_name: e.target.value })
            }
          />
          <Input
            label="Số Điện Thoại *"
            required
            value={editFormData.phone}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEditFormData({ ...editFormData, phone: e.target.value })
            }
          />
          <Input
            label="Email"
            type="email"
            value={editFormData.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEditFormData({ ...editFormData, email: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Giới tính"
              value={editFormData.gender}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setEditFormData({ ...editFormData, gender: e.target.value })
              }
            >
              <option value="">Chưa chọn</option>
              <option value="Nữ">Nữ</option>
              <option value="Nam">Nam</option>
              <option value="Khác">Khác</option>
            </Select>
            <Input
              label="Ngày sinh"
              type="date"
              value={editFormData.birth_date}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEditFormData({ ...editFormData, birth_date: e.target.value })
              }
            />
          </div>
          <Input
            label="Địa chỉ"
            value={editFormData.address}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEditFormData({ ...editFormData, address: e.target.value })
            }
          />
          <Textarea
            label="Ghi chú"
            value={editFormData.notes}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setEditFormData({ ...editFormData, notes: e.target.value })
            }
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" isLoading={updating}>
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: UPLOAD PHOTO */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Ảnh Điều Trị Mới"
      >
        <form onSubmit={handleUploadPhoto} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Chọn file ảnh *
            </label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <Select
            label="Phân loại ảnh *"
            value={uploadPhotoType}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setUploadPhotoType(e.target.value as PhotoType)
            }
          >
            <option value="BEFORE">BEFORE (Trước điều trị)</option>
            <option value="PROGRESS">PROGRESS (Trong quá trình)</option>
            <option value="AFTER">AFTER (Sau kết quả)</option>
          </Select>
          <Textarea
            label="Ghi chú ảnh"
            placeholder="Mô tả tình trạng da tại thời điểm chụp..."
            value={uploadNotes}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setUploadNotes(e.target.value)
            }
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" isLoading={uploading}>
              Tải lên
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: PHOTO PREVIEW */}
      {previewPhoto && (
        <Modal
          isOpen={!!previewPhoto}
          onClose={() => setPreviewPhoto(null)}
          title={`Xem ảnh ${previewPhoto.photo_type}`}
        >
          <div className="space-y-4">
            <div className="max-h-[60vh] flex items-center justify-center overflow-hidden rounded-lg bg-black/5">
              <img
                src={previewPhoto.signed_url}
                alt="Chi tiết"
                className="max-h-[60vh] object-contain"
              />
            </div>
            {previewPhoto.notes && (
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                {previewPhoto.notes}
              </p>
            )}
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>
                Ngày chụp:{" "}
                {new Date(previewPhoto.created_at).toLocaleDateString("vi-VN")}
              </span>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeletePhoto(previewPhoto)}
              >
                Xóa ảnh
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: INVOICE DETAIL PREVIEW */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Hóa đơn ${selectedInvoice.invoice_code || selectedInvoice.code || ""}`}
        >
          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Ngày tạo:</span>
              <span className="font-semibold">
                {new Date(selectedInvoice.created_at).toLocaleString("vi-VN")}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Phương thức:</span>
              <Badge variant="info">{selectedInvoice.payment_method}</Badge>
            </div>

            <div className="pt-2">
              <h5 className="font-bold text-xs uppercase text-gray-500 mb-2">
                Chi tiết sản phẩm / dịch vụ:
              </h5>
              <div className="divide-y border rounded-lg overflow-hidden">
                {(selectedInvoice.items || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 flex justify-between items-center bg-white"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.item_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} x{" "}
                        {item.unit_price?.toLocaleString("vi-VN")} đ
                      </p>
                    </div>
                    <span className="font-bold text-gray-800">
                      {item.subtotal?.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 space-y-1 text-right border-t">
              <p className="text-xs text-gray-500">
                Tổng cộng:{" "}
                <span className="font-semibold">
                  {selectedInvoice.total_amount?.toLocaleString("vi-VN")} đ
                </span>
              </p>
              <p className="text-xs text-red-500">
                Giảm giá:{" "}
                <span className="font-semibold">
                  -{selectedInvoice.discount_amount?.toLocaleString("vi-VN")} đ
                </span>
              </p>
              <p className="text-base font-bold text-blue-600">
                Thành tiền:{" "}
                {selectedInvoice.final_amount?.toLocaleString("vi-VN")} đ
              </p>
            </div>
          </div>
        </Modal>
      )}
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
    gender: "",
    birth_date: "",
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

  const handleCreateCustomer = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setSubmitting(true);
    try {
      await createCustomer({
        full_name: formData.name,
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        address: formData.address || null,
        gender: formData.gender || null,
        birth_date: formData.birth_date || null,
        notes: formData.notes || null,
      });
      setIsAddModalOpen(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        gender: "",
        birth_date: "",
        notes: "",
      });
      await loadData();
    } catch (err) {
      console.error("Lỗi tạo khách hàng:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
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
        description="Danh sách hồ sơ khách hàng, gói liệu trình và nhật ký hình ảnh điều trị"
        action={
          <Button onClick={() => setIsAddModalOpen(true)}>
            + Thêm khách hàng
          </Button>
        }
      />

      <Panel>
        <PanelHeader
          title="Danh sách hồ sơ khách hàng"
          action={
            <div className="w-72">
              <Input
                placeholder="Tìm theo tên hoặc số điện thoại..."
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
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
              description="Thử tìm kiếm với từ khóa khác hoặc thêm hồ sơ khách hàng mới."
              action={
                <Button onClick={() => setIsAddModalOpen(true)}>
                  + Thêm khách hàng mới
                </Button>
              }
            />
          ) : (
            <Table
              headers={[
                "Mã KH",
                "Họ & Tên",
                "Số điện thoại",
                "Địa chỉ",
                "Tổng chi tiêu",
                "Lần ghé cuối",
                "Thao tác",
              ]}
              data={filteredCustomers}
              renderRow={(item: Customer) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedCustomerId(item.id)}
                >
                  <td className="p-3 text-xs font-mono text-gray-500">
                    {item.code || item.id.substring(0, 8)}
                  </td>
                  <td className="p-3 font-medium text-gray-900">
                    {item.full_name || item.name}
                  </td>
                  <td className="p-3 text-gray-600">{item.phone}</td>
                  <td className="p-3 text-gray-500 text-xs truncate max-w-xs">
                    {item.address || "—"}
                  </td>
                  <td className="p-3 font-semibold text-blue-600">
                    {(item.total_spend || item.total_spent || 0).toLocaleString(
                      "vi-VN",
                    )}{" "}
                    đ
                  </td>
                  <td className="p-3 text-xs text-gray-500">
                    {item.last_visit
                      ? new Date(item.last_visit).toLocaleDateString("vi-VN")
                      : "Chưa có"}
                  </td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
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
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Nhập họ và tên khách hàng"
          />
          <Input
            label="Số Điện Thoại *"
            required
            value={formData.phone}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="0901234567"
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="example@mail.com"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Giới tính"
              value={formData.gender}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setFormData({ ...formData, gender: e.target.value })
              }
            >
              <option value="">Chưa chọn</option>
              <option value="Nữ">Nữ</option>
              <option value="Nam">Nam</option>
              <option value="Khác">Khác</option>
            </Select>
            <Input
              label="Ngày sinh"
              type="date"
              value={formData.birth_date}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, birth_date: e.target.value })
              }
            />
          </div>
          <Input
            label="Địa chỉ"
            value={formData.address}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="Số nhà, Tên đường, Quận/Huyện"
          />
          <Textarea
            label="Ghi chú"
            value={formData.notes}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Ghi chú tình trạng da hoặc yêu cầu dịch vụ đặc biệt..."
          />
          <div className="flex justify-end gap-2 pt-4 border-t">
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

export default CustomersPage;
