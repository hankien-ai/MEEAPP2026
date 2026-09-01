// src/pages/customers.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent, useRef } from "react";
import { useAuth } from '@/context/AuthContext';
import { maskPhone } from '@/lib/utils';
import { supabase } from "../services/supabase";
import {
  Button,
  Card,
  Panel,
  PanelHeader,
  PanelContent,
  PageHeader,
  Input,
  Modal,
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
  usePackageSessionLegacy,
  fetchCustomerServiceHistory,
  fetchCustomerInvoices,
  fetchCustomerPackageWithItems,
  fetchCustomerStats,
  isValidPhone,
  isPhoneExists,
} from "../services/customer.service";
import { User, Package, Camera, ArrowLeft, Plus, Search, Gift } from "lucide-react";

// ============================================================
// HÀM BỎ DẤU (removeAccents)
// ============================================================
function removeAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

// ============================================================
// HELPERS
// ============================================================

function formatVND(amount: number): string {
  return (amount || 0).toLocaleString("vi-VN") + " đ";
}

// ============================================================
// CUSTOMER PROFILE PAGE
// ============================================================

export interface CustomerProfilePageProps {
  customerId?: string;
  onBack?: () => void;
  initialTab?: "info" | "photos" | "packages" | "history";
}

export function CustomerProfilePage({
  customerId,
  onBack,
  initialTab = "info",
}: CustomerProfilePageProps) {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    "info" | "photos" | "packages" | "history"
  >(initialTab);

  const [stats, setStats] = useState({
    total_spending: 0,
    total_visits: 0,
    last_visit: null as string | null,
  });

  // Tab 1: Info
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
    gender: "",
    birthday: "",
    notes: "",
  });
  const [updating, setUpdating] = useState<boolean>(false);

  // Tab 2: Photos
  const [photos, setPhotos] = useState<CustomerPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState<boolean>(false);
  const [photoFilter, setPhotoFilter] = useState<string>("ALL");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPhotoType, setUploadPhotoType] = useState<PhotoType>("BEFORE");
  const [uploadNotes, setUploadNotes] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [previewPhoto, setPreviewPhoto] = useState<CustomerPhoto | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab 3: Packages
  const [packages, setPackages] = useState<CustomerPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState<boolean>(false);
  const [usingSessionId, setUsingSessionId] = useState<string | null>(null);

  const [editPackageModal, setEditPackageModal] = useState<{
    isOpen: boolean;
    pkg: CustomerPackage | null;
  }>({ isOpen: false, pkg: null });
  const [editPackageData, setEditPackageData] = useState({
    remaining_sessions: 0,
    expires_at: "",
    status: "",
  });

  // Tab 4: History
  const [history, setHistory] = useState<ServiceSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Invoices
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // ============================================================
  // SWIPE-BACK iOS STYLE
  // ============================================================
  const containerRef = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isHorizontal, setIsHorizontal] = useState<boolean | null>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchCurrentX = useRef(0);
  const threshold = 0.1; // 25% màn hình để back

  const resetSwipe = () => {
    setIsSwiping(false);
    setIsHorizontal(null);
    setTranslateX(0);
    touchStartX.current = 0;
    touchStartY.current = 0;
    touchCurrentX.current = 0;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchCurrentX.current = touch.clientX;
    setIsHorizontal(null);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isSwiping || !containerRef.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    // Xác định hướng lần đầu
    if (isHorizontal === null) {
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Kéo ngang
          setIsHorizontal(true);
          // Chỉ kích hoạt nếu bắt đầu từ mép trái (<30px) và kéo sang phải
          if (touchStartX.current < 40 && deltaX > 0) {
            e.preventDefault();
          } else {
            // Không phải swipe từ mép trái, cancel
            setIsSwiping(false);
            return;
          }
        } else {
          // Kéo dọc, để scroll tự do
          setIsHorizontal(false);
          setIsSwiping(false);
          return;
        }
      }
      return;
    }

    if (!isHorizontal) {
      setIsSwiping(false);
      return;
    }

    // Đã xác định là swipe ngang hợp lệ
    e.preventDefault();
    const newX = Math.max(0, deltaX);
    const screenWidth = window.innerWidth;
    const maxTranslate = screenWidth * 0.5;
    const clampedX = Math.min(newX, maxTranslate);
    setTranslateX(clampedX);
    touchCurrentX.current = touch.clientX;
  };

  const handleTouchEnd = () => {
    if (!isSwiping || !isHorizontal) {
      resetSwipe();
      return;
    }

    const screenWidth = window.innerWidth;
    const thresholdPx = screenWidth * threshold;

    if (translateX > thresholdPx) {
      // Đủ ngưỡng → back
      setTranslateX(screenWidth);
      setTimeout(() => {
        if (onBack) onBack();
        resetSwipe();
      }, 200);
    } else {
      // Chưa đủ → reset
      setTranslateX(0);
      resetSwipe();
    }
  };

  const handleTouchCancel = () => {
    resetSwipe();
  };

  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadCustomerDetails = async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const [cust, statsData] = await Promise.all([
        fetchCustomerById(customerId),
        fetchCustomerStats(customerId),
      ]);
      setCustomer(cust);
      setStats(statsData);
      if (cust) {
        setEditFormData({
          full_name: cust.full_name || cust.name || "",
          phone: cust.phone || "",
          email: cust.email || "",
          address: cust.address || "",
          gender: cust.gender || "",
          birthday: cust.birthday || "",
          notes: cust.notes || "",
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
      const data = await fetchCustomerPackageWithItems(customerId);
      setPackages(data);
    } catch (err) {
      console.error("Lỗi tải gói liệu trình:", err);
      setPackages([]);
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
      setHistory([]);
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
      setInvoices([]);
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

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleUpdateInfo = async (e: FormEvent) => {
    e.preventDefault();
    if (!customerId) return;

    setUpdating(true);
    try {
      const payload: any = {
        full_name: editFormData.full_name,
        phone: editFormData.phone,
      };
      if (editFormData.email) payload.email = editFormData.email;
      if (editFormData.gender) payload.gender = editFormData.gender;
      if (editFormData.birthday) payload.birthday = editFormData.birthday;
      if (editFormData.notes) payload.notes = editFormData.notes;

      const updated = await updateCustomer(customerId, payload);
      setCustomer(updated);
      setIsEditModalOpen(false);
      await loadCustomerDetails();
    } catch (err: any) {
      alert(err.message || "Lỗi cập nhật thông tin");
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
    } catch (err: any) {
      alert(err.message || "Lỗi upload ảnh");
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
    } catch (err: any) {
      alert(err.message || "Lỗi xóa ảnh");
    }
  };

  const handleUsePackageSession = async (
    pkg: CustomerPackage,
    packageItemId: string,
    serviceId: string,
  ) => {
    if (!packageItemId) {
      alert("Không xác định được dịch vụ trong gói");
      return;
    }
    if (pkg.remaining_sessions <= 0) {
      alert("Gói đã hết buổi");
      return;
    }
    if (
      !window.confirm(
        `Xác nhận trừ 1 buổi từ gói "${pkg.package_name || pkg.catalog_item?.name || "Liệu trình"}"?`,
      )
    ) {
      return;
    }

    setUsingSessionId(pkg.id);
    try {
      const result = await usePackageSessionLegacy(
        pkg.id,
        packageItemId,
        serviceId,
        customer?.id,
        "Sử dụng package từ Customer Profile",
      );
      if (!result.success) {
        alert(result.message);
      }
      await Promise.all([
        loadPackages(),
        loadHistory(),
        loadCustomerDetails(),
      ]);
    } catch (err: any) {
      alert(err.message || "Thao tác thất bại");
    } finally {
      setUsingSessionId(null);
    }
  };

  const handleEditPackage = (pkg: CustomerPackage) => {
    setEditPackageData({
      remaining_sessions: pkg.remaining_sessions,
      expires_at: pkg.expires_at || "",
      status: pkg.status,
    });
    setEditPackageModal({ isOpen: true, pkg });
  };

  const handleSavePackageEdit = async () => {
    if (!editPackageModal.pkg) return;
    try {
      const { error } = await supabase
        .from("customer_packages")
        .update({
          remaining_sessions: editPackageData.remaining_sessions,
          expires_at: editPackageData.expires_at || null,
          status: editPackageData.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editPackageModal.pkg.id);
      if (error) throw error;
      setEditPackageModal({ isOpen: false, pkg: null });
      await loadPackages();
    } catch (err: any) {
      alert(err.message || "Lỗi cập nhật package");
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

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

  const totalSpentFormatted = formatVND(stats.total_spending);
  const filteredPhotos = photos.filter(
    (p) => photoFilter === "ALL" || p.photo_type === photoFilter,
  );

  const hasActivePackage = packages.some(
    (p) => p.status === "ACTIVE" && p.remaining_sessions > 0,
  );
  const hasGift = packages.some((p) => p.is_gift === true);

  const handleQuickUpload = () => {
    setIsUploadModalOpen(true);
  };

  // ============================================================
  // RENDER PROFILE (VỚI SWIPE-BACK)
  // ============================================================
  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      className="space-y-4 max-w-full"
      style={{
        transform: `translateX(${translateX}px)`,
        transition:
          isSwiping && isHorizontal
            ? 'none'
            : 'transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.1)',
        willChange: 'transform',
        touchAction: isHorizontal ? 'none' : 'auto',
      }}
    >
      {/* HEADER - gọn */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {customer.full_name || customer.name}
            </h2>
            <p className="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
              <span>📱 {maskPhone(customer.phone || "", isAdmin)}</span>
              {customer.email && (
                <span className="text-xs text-gray-400">• {customer.email}</span>
              )}
              <span className="text-xs text-gray-400">
                • Ghé: {stats.total_visits} lần
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-right">
            <p className="text-xs text-gray-500">Tổng chi tiêu</p>
            <p className="text-base font-bold text-blue-600">
              {totalSpentFormatted}
            </p>
          </div>
          {onBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
            </Button>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="flex overflow-x-auto no-scrollbar gap-1 bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
        {[
          { key: "info", label: "📋 Thông tin" },
          { key: "photos", label: "📷 Ảnh" },
          { key: "packages", label: "📦 Liệu trình" },
          { key: "history", label: "📜 Lịch sử" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: THÔNG TIN - gọn */}
      {activeTab === "info" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            title="Thông tin chi tiết"
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditModalOpen(true)}
              >
                ✏️ Sửa
              </Button>
            }
          >
            <div className="space-y-1 text-sm">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Họ tên</span>
                <span className="font-medium text-gray-900">
                  {customer.full_name || customer.name}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">SĐT</span>
                <span className="font-medium text-gray-900">
                  {maskPhone(customer.phone || "", isAdmin)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-900">
                  {customer.email || "—"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Giới tính / Ngày sinh</span>
                <span className="font-medium text-gray-900">
                  {customer.gender || "—"} / {customer.birthday || "—"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Địa chỉ</span>
                <span className="font-medium text-gray-900">
                  {customer.address || "—"}
                </span>
              </div>
              <div className="py-1">
                <span className="text-gray-500 block mb-1">Ghi chú</span>
                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
                  {customer.notes || "Không có ghi chú"}
                </p>
              </div>
            </div>
          </Card>

          <Card title="Thống kê">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-600 font-medium">Tổng chi tiêu</p>
                <p className="text-lg font-bold text-blue-900 mt-1">
                  {totalSpentFormatted}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <p className="text-xs text-emerald-600 font-medium">Số lượt ghé</p>
                <p className="text-lg font-bold text-emerald-900 mt-1">
                  {stats.total_visits} lượt
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 col-span-2">
                <p className="text-xs text-purple-600 font-medium">Ngày tham gia</p>
                <p className="text-sm font-bold text-purple-900 mt-1">
                  {new Date(customer.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-bold text-gray-800 mb-2">
                Hóa đơn gần đây ({invoices.length})
              </h4>
              {loadingInvoices ? (
                <Spinner className="py-4" />
              ) : invoices.length === 0 ? (
                <p className="text-xs text-gray-500 italic">Chưa có hóa đơn nào.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {invoices.slice(0, 5).map((inv) => {
                    const paymentColor = {
                      CASH: "bg-emerald-100 text-emerald-800",
                      BANK_TRANSFER: "bg-blue-100 text-blue-800",
                      GIFT: "bg-purple-100 text-purple-800",
                      DEBT: "bg-amber-100 text-amber-800",
                    }[inv.payment_method] || "bg-gray-100 text-gray-800";

                    let ktvNames = "Chưa phân công";
                    if (inv.items && inv.items.length > 0) {
                      const ktvSet = new Set();
                      inv.items.forEach((item: any) => {
                        if (item.performing_staff_id) {
                          ktvSet.add(item.performing_staff_id);
                        }
                      });
                      if (ktvSet.size > 0) {
                        ktvNames = Array.from(ktvSet).join(", ");
                      }
                    }

                    return (
                      <div
                        key={inv.id}
                        onClick={() => setSelectedInvoice(inv)}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-100 text-xs cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-gray-800">
                            #{inv.invoice_code || inv.id.slice(0, 8)}
                          </p>
                          <p className="text-gray-500">
                            {new Date(inv.created_at).toLocaleDateString("vi-VN")}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            KTV: {ktvNames}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">
                            {formatVND(inv.final_amount || inv.total_amount || 0)}
                          </p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${paymentColor}`}>
                            {inv.payment_method}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: NHẬT KÝ ẢNH */}
      {activeTab === "photos" && (
        <Panel>
          <PanelHeader
            title="Nhật ký hình ảnh"
            action={
              <div className="flex items-center gap-2 flex-wrap">
                <Select
                  value={photoFilter}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setPhotoFilter(e.target.value)
                  }
                  className="w-28"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="BEFORE">BEFORE</option>
                  <option value="PROGRESS">PROGRESS</option>
                  <option value="AFTER">AFTER</option>
                </Select>
                <Button size="sm" onClick={handleQuickUpload}>
                  📷 + Ảnh
                </Button>
              </div>
            }
          />
          <PanelContent>
            {loadingPhotos ? (
              <Spinner className="py-8" />
            ) : filteredPhotos.length === 0 ? (
              <EmptyState
                title="Chưa có hình ảnh"
                description="Chụp hoặc tải ảnh điều trị để theo dõi tiến trình của khách."
                action={
                  <Button onClick={handleQuickUpload}>📷 Tải ảnh ngay</Button>
                }
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow aspect-square"
                    onClick={() => setPreviewPhoto(photo)}
                  >
                    {photo.signed_url ? (
                      <img
                        src={photo.signed_url}
                        alt={photo.photo_type}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        Lỗi tải ảnh
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1.5 flex items-center justify-between">
                      <Badge
                        variant={
                          photo.photo_type === "BEFORE"
                            ? "danger"
                            : photo.photo_type === "PROGRESS"
                              ? "warning"
                              : "success"
                        }
                        className="text-[10px]"
                      >
                        {photo.photo_type}
                      </Badge>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(photo);
                        }}
                        className="text-white/70 hover:text-red-400 text-xs font-semibold p-1"
                      >
                        ✕
                      </button>
                    </div>
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
          <PanelHeader title="Danh sách gói liệu trình" />
          <PanelContent>
            {loadingPackages ? (
              <Spinner className="py-8" />
            ) : packages.length === 0 ? (
              <EmptyState
                title="Chưa có gói liệu trình"
                description="Khách hàng chưa mua gói dịch vụ nào."
              />
            ) : (
              <div className="space-y-4">
                {packages.map((pkg) => {
                  const usedSessions = pkg.total_sessions - pkg.remaining_sessions;
                  const isDepleted = pkg.remaining_sessions <= 0;
                  const isGift = pkg.is_gift || false;
                  const isExpired = pkg.expires_at && new Date(pkg.expires_at) < new Date();
                  const isExpiringSoon = pkg.expires_at && new Date(pkg.expires_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && new Date(pkg.expires_at) >= new Date();

                  return (
                    <div
                      key={pkg.id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {isGift && <span className="text-purple-500 text-lg" title="Quà tặng">🎁</span>}
                            {isExpired && <span className="text-red-500 text-lg" title="Đã hết hạn">🔒</span>}
                            {isExpiringSoon && !isExpired && <span className="text-amber-500 text-lg" title="Sắp hết hạn">⏳</span>}
                            <h4 className="font-bold text-gray-900">
                              {pkg.package_name || pkg.catalog_item?.name || "Gói dịch vụ"}
                            </h4>
                            {isAdmin && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditPackage(pkg)}
                                className="ml-1"
                              >
                                ✏️
                              </Button>
                            )}
                          </div>
                          <Badge variant={isDepleted ? "danger" : pkg.status === "ACTIVE" ? "success" : "warning"}>
                            {isDepleted ? "Đã hết" : pkg.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Mua ngày: {new Date(pkg.purchased_at || pkg.created_at).toLocaleDateString("vi-VN")}
                          {pkg.expires_at && (
                            <span className="ml-2">
                              • Hạn: {new Date(pkg.expires_at).toLocaleDateString("vi-VN")}
                            </span>
                          )}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-xs">
                          <span className="text-gray-500">Tổng: {pkg.total_sessions} buổi</span>
                          <span className="text-gray-500">Đã dùng: {usedSessions} buổi</span>
                          <span className="font-bold text-blue-600">Còn: {pkg.remaining_sessions} buổi</span>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full transition-all duration-300"
                            style={{
                              width: `${(usedSessions / pkg.total_sessions) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      {pkg.items && pkg.items.length > 0 && (
                        <div className="p-3 bg-gray-50 space-y-2">
                          <p className="text-xs font-semibold text-gray-700">Dịch vụ trong gói:</p>
                          {pkg.items.map((item: any) => {
                            const serviceName = item.services?.name || item.service_name || "Dịch vụ";
                            return (
                              <div
                                key={item.id}
                                className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100 text-xs"
                              >
                                <span className="font-medium text-gray-800">{serviceName}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-gray-500">
                                    Còn {item.remaining_quantity} / {item.total_quantity} buổi
                                  </span>
                                  {item.remaining_quantity > 0 && !isDepleted && (
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      disabled={usingSessionId === pkg.id}
                                      isLoading={usingSessionId === pkg.id}
                                      onClick={() => handleUsePackageSession(pkg, item.package_item_id, item.service_id)}
                                    >
                                      Sử dụng
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {isDepleted && (
                        <div className="p-2 bg-gray-50 text-center text-xs text-gray-500 border-t border-gray-100">
                          ✅ Đã sử dụng hết gói
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </PanelContent>
        </Panel>
      )}

      {/* TAB 4: LỊCH SỬ DỊCH VỤ */}
      {activeTab === "history" && (
        <Panel>
          <PanelHeader title="Lịch sử sử dụng dịch vụ" />
          <PanelContent>
            {loadingHistory ? (
              <Spinner className="py-8" />
            ) : history.length === 0 ? (
              <EmptyState
                title="Chưa có lịch sử dịch vụ"
                description="Khách hàng chưa thực hiện dịch vụ nào."
              />
            ) : (
              <div className="space-y-3">
                {history.map((item) => {
                  const isPackage = item.source_type === "PACKAGE";
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-gray-900">
                              {item.catalog_item?.name || "Dịch vụ"}
                            </h4>
                            <Badge variant={isPackage ? "info" : "neutral"}>
                              {isPackage ? "📦 Package" : "💰 Mua lẻ"}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(item.performed_at || item.created_at).toLocaleString("vi-VN")}
                          </p>
                          {isPackage && item.package_id && (
                            <p className="text-xs text-blue-600 mt-0.5">
                              🎁 Gói: #{item.package_id.slice(0, 8)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-700">
                            {isPackage ? "0đ" : formatVND(item.price_charged || 0)}
                          </p>
                          {item.notes && (
                            <p className="text-[10px] text-gray-400 mt-1">{item.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </PanelContent>
        </Panel>
      )}

      {/* ========== MODALS (giữ nguyên) ========== */}

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
              value={editFormData.birthday}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEditFormData({ ...editFormData, birthday: e.target.value })
              }
            />
          </div>
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
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedFile(null);
        }}
        title="Upload Ảnh Điều Trị"
      >
        <form onSubmit={handleUploadPhoto} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Chọn file ảnh *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              required
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              📱 Chụp ảnh trực tiếp hoặc chọn từ thư viện
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => fileInputRef.current?.click()}
            >
              📁 Chọn ảnh
            </Button>
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
              onClick={() => {
                setIsUploadModalOpen(false);
                setSelectedFile(null);
              }}
            >
              Hủy
            </Button>
            <Button type="submit" isLoading={uploading}>
              📤 Tải lên
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
                🗑 Xóa ảnh
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: INVOICE DETAIL */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Hóa đơn ${selectedInvoice.invoice_code || selectedInvoice.code || selectedInvoice.id.slice(0, 8)}`}
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
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Trạng thái:</span>
              <Badge
                variant={
                  selectedInvoice.status === "PAID"
                    ? "success"
                    : selectedInvoice.status === "PARTIALLY_PAID"
                      ? "warning"
                      : selectedInvoice.status === "VOID"
                        ? "danger"
                        : "neutral"
                }
              >
                {selectedInvoice.status}
              </Badge>
            </div>

            <div className="pt-2">
              <h5 className="font-bold text-xs uppercase text-gray-500 mb-2">
                Chi tiết:
              </h5>
              <div className="divide-y border rounded-lg overflow-hidden">
                {(selectedInvoice.items || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 flex justify-between items-center bg-white text-xs"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.description || item.item_name || "Sản phẩm"}
                      </p>
                      <p className="text-gray-500">
                        {item.quantity} x {formatVND(item.unit_price || 0)}
                      </p>
                      {item.performing_staff_id && (
                        <p className="text-[10px] text-gray-400">
                          KTV: {item.staff?.full_name || "Chưa xác định"}
                        </p>
                      )}
                    </div>
                    <span className="font-bold text-gray-800">
                      {formatVND(item.total_amount || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 space-y-1 text-right border-t">
              <p className="text-xs text-gray-500">
                Tạm tính:{" "}
                <span className="font-semibold">
                  {formatVND(selectedInvoice.subtotal || 0)}
                </span>
              </p>
              <p className="text-xs text-red-500">
                Giảm giá:{" "}
                <span className="font-semibold">
                  -{formatVND(selectedInvoice.discount_amount || 0)}
                </span>
              </p>
              <p className="text-base font-bold text-blue-600">
                Thành tiền: {formatVND(selectedInvoice.total_amount || selectedInvoice.final_amount || 0)}
              </p>
              {selectedInvoice.payment_method === "DEBT" && (
                <p className="text-xs text-amber-600">
                  Đã trả: {formatVND(selectedInvoice.paid_amount || 0)} • Còn nợ:{" "}
                  {formatVND((selectedInvoice.total_amount || 0) - (selectedInvoice.paid_amount || 0))}
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: EDIT PACKAGE */}
      {editPackageModal.isOpen && (
        <Modal
          isOpen={editPackageModal.isOpen}
          onClose={() => setEditPackageModal({ isOpen: false, pkg: null })}
          title="Chỉnh sửa gói liệu trình"
        >
          <div className="space-y-4">
            <Input
              label="Số buổi còn lại"
              type="number"
              value={editPackageData.remaining_sessions}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEditPackageData({
                  ...editPackageData,
                  remaining_sessions: Number(e.target.value),
                })
              }
              min={0}
            />
            <Input
              label="Ngày hết hạn"
              type="date"
              value={editPackageData.expires_at?.split("T")[0] || ""}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEditPackageData({
                  ...editPackageData,
                  expires_at: e.target.value,
                })
              }
            />
            <Select
              label="Trạng thái"
              value={editPackageData.status}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setEditPackageData({
                  ...editPackageData,
                  status: e.target.value,
                })
              }
            >
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="EXPIRED">Hết hạn</option>
              <option value="DEPLETED">Đã hết buổi</option>
              <option value="CANCELLED">Hủy</option>
            </Select>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditPackageModal({ isOpen: false, pkg: null })}
              >
                Hủy
              </Button>
              <Button onClick={handleSavePackageEdit}>Lưu</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// MAIN CUSTOMERS PAGE
// ============================================================

export function CustomersPage() {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<
    "info" | "photos" | "packages" | "history"
  >("info");

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    gender: "",
    birthday: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [customerBadges, setCustomerBadges] = useState<
    Record<string, { hasPackage: boolean; hasGift: boolean }>
  >({});

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchCustomers();
      setCustomers(data || []);

      const badges: Record<string, { hasPackage: boolean; hasGift: boolean }> = {};
      for (const c of data || []) {
        const pkgs = await fetchCustomerPackages(c.id);
        badges[c.id] = {
          hasPackage: pkgs.some((p) => p.status === "ACTIVE" && p.remaining_sessions > 0),
          hasGift: pkgs.some((p) => p.is_gift === true),
        };
      }
      setCustomerBadges(badges);
    } catch (err) {
      console.error("Lỗi lấy danh sách khách hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Client-side search với removeAccents
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const keyword = removeAccents(q);
    const name = removeAccents((c.full_name || c.name || "").toLowerCase());
    const phone = (c.phone || "").toLowerCase();
    return name.includes(keyword) || phone.includes(q);
  });

  const handleCreateCustomer = async (e: FormEvent) => {
    e.preventDefault();
    setAddError(null);

    if (!formData.name.trim()) {
      setAddError("Vui lòng nhập họ tên khách hàng");
      return;
    }

    if (!formData.phone.trim()) {
      setAddError("Vui lòng nhập số điện thoại");
      return;
    }

    if (!/^0\d{9}$/.test(formData.phone.trim())) {
      setAddError("Số điện thoại phải bắt đầu bằng 0 và đúng 10 số");
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        full_name: formData.name,
        phone: formData.phone.trim(),
      };
      if (formData.email?.trim()) payload.email = formData.email.trim();
      if (formData.address?.trim()) payload.address = formData.address.trim();
      if (formData.gender?.trim()) payload.gender = formData.gender.trim();
      if (formData.birthday?.trim()) payload.birthday = formData.birthday.trim();
      if (formData.notes?.trim()) payload.notes = formData.notes.trim();

      await createCustomer(payload);
      setIsAddModalOpen(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        gender: "",
        birthday: "",
        notes: "",
      });
      await loadData();
    } catch (err: any) {
      setAddError(err.message || "Lỗi tạo khách hàng");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickPhoto = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setSelectedTab("photos");
  };

  const handleQuickPackage = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setSelectedTab("packages");
  };

  // Nếu có customerId được chọn, render profile
  if (selectedCustomerId) {
    return (
      <CustomerProfilePage
        customerId={selectedCustomerId}
        onBack={() => setSelectedCustomerId(null)}
        initialTab={selectedTab}
      />
    );
  }

  return (
    <div className="space-y-4 max-w-full">
      <PageHeader
        title="Quản lý Khách hàng"
        description="Danh sách hồ sơ khách hàng, gói liệu trình và nhật ký hình ảnh"
      />

      <Panel>
        <PanelHeader
          title="Danh sách khách hàng"
          action={
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <Search className="w-4 h-4" />
                </span>
                <Input
                  placeholder="Tìm khách hàng..."
                  value={searchQuery}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  className="pl-9 text-base py-2.5 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 active:scale-95 transition-transform"
                title="Thêm khách hàng"
              >
                <Plus className="w-6 h-6" />
              </Button>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCustomers.map((item) => {
                const badges = customerBadges[item.id] || { hasPackage: false, hasGift: false };
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedCustomerId(item.id);
                      setSelectedTab("info");
                    }}
                    className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-gray-900 text-base truncate">
                            {item.full_name || item.name}
                          </p>
                          <div className="flex items-center gap-2 shrink-0">
                            {badges.hasPackage && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickPackage(item.id);
                                }}
                                className="w-9 h-9 rounded-full border-2 border-blue-200 text-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center"
                                title="Xem gói dịch vụ"
                              >
                                <Gift className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickPhoto(item.id);
                              }}
                              className="w-9 h-9 rounded-full border-2 border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors flex items-center justify-center"
                              title="Chụp ảnh nhanh"
                            >
                              <Camera className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {maskPhone(item.phone || "", isAdmin)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PanelContent>
      </Panel>

      {/* MODAL THÊM KHÁCH HÀNG */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddError(null);
        }}
        title="Thêm Khách Hàng Mới"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          {addError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              ⚠️ {addError}
            </div>
          )}
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
            helperText="Phải bắt đầu bằng 0 và đúng 10 số"
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
              value={formData.birthday}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, birthday: e.target.value })
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
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setAddError(null);
              }}
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