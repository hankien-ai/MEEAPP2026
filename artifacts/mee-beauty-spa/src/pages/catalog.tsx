import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package as PackageIcon,
  ShoppingBag,
  Scissors,
  FolderTree,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Percent,
  Coins,
  Eye,
  ArrowUpRight,
  User,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import {
  ServiceItem,
  ProductItem,
  Category,
  Package,
  CategoryType,
  CatalogStatus,
  CommissionType,
  ProductType,
  InventoryTransactionType,
} from "../types/catalog";
import {
  fetchServices,
  createService,
  updateService,
  deleteService,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCatalogItemStatus,
  fetchPackages,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageStatus,
  processInventoryTransaction,
  fetchInventoryHistory,
} from "../services/catalog-service";
import { supabase } from "../services/supabase";
import { Badge, Button } from "../components/primitives";

type ActiveTab = "services" | "products" | "categories" | "packages";

export default function CatalogManagementPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("services");
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");
  const [productTypeFilter, setProductTypeFilter] = useState<
    "ALL" | "RETAIL" | "CONSUMABLE"
  >("ALL");

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(
    null,
  );

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(
    null,
  );

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{
    type: ActiveTab;
    id: string;
    extraData?: string;
    title: string;
  } | null>(null);

  // === Product Detail Modal ===
  const [productDetail, setProductDetail] = useState<{
    isOpen: boolean;
    product: ProductItem | null;
    history: any[];
    loadingHistory: boolean;
  }>({
    isOpen: false,
    product: null,
    history: [],
    loadingHistory: false,
  });

  // === Quick Inventory Modal (Nhập/Xuất nhanh) ===
  const [quickInventory, setQuickInventory] = useState<{
    isOpen: boolean;
    product: ProductItem | null;
    type: InventoryTransactionType;
    quantity: number;
    note: string;
    submitting: boolean;
  }>({
    isOpen: false,
    product: null,
    type: "IN",
    quantity: 1,
    note: "",
    submitting: false,
  });

  // === Product Export Modal (cho CONSUMABLE) – giữ lại nhưng sẽ dùng chung quick inventory ===
  const [exportModal, setExportModal] = useState<{
    isOpen: boolean;
    product: ProductItem | null;
    quantity: number;
    note: string;
    submitting: boolean;
  }>({
    isOpen: false,
    product: null,
    quantity: 1,
    note: "",
    submitting: false,
  });

  const [staffList, setStaffList] = useState<any[]>([]);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "services") {
        const [sData, cData] = await Promise.all([
          fetchServices(),
          fetchCategories("service"),
        ]);
        setServices(sData);
        setCategories(cData);
      } else if (activeTab === "products") {
        const [pData, cData] = await Promise.all([
          fetchProducts(),
          fetchCategories("product"),
        ]);
        setProducts(pData);
        setCategories(cData);
      } else if (activeTab === "categories") {
        const cData = await fetchCategories();
        setCategories(cData);
      } else if (activeTab === "packages") {
        const [pkgData, sData] = await Promise.all([
          fetchPackages(),
          fetchServices(),
        ]);
        setPackages(pkgData);
        setServices(sData);
      }
    } catch (err: any) {
      showToast("error", err.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    const { data } = await supabase
      .from("staff")
      .select("id, full_name")
      .eq("status", "ACTIVE");
    if (data) setStaffList(data);
  };

  useEffect(() => {
    loadData();
    loadStaff();
    setSearchTerm("");
    setCategoryFilter("");
    setStatusFilter("ALL");
    setProductTypeFilter("ALL");
  }, [activeTab]);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatCommission = (
    type?: CommissionType,
    value?: number,
    fallbackRate?: number,
  ) => {
    const commType = type || "PERCENT";
    const commVal = value ?? fallbackRate ?? 0;
    if (commType === "FIXED") {
      return formatVND(commVal);
    }
    return `${commVal}%`;
  };

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = !categoryFilter || s.category === categoryFilter;
      const matchStatus = statusFilter === "ALL" || s.status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [services, searchTerm, categoryFilter, statusFilter]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = !categoryFilter || p.category === categoryFilter;
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
      const matchType =
        productTypeFilter === "ALL" || p.product_type === productTypeFilter;
      return matchSearch && matchCat && matchStatus && matchType;
    });
  }, [products, searchTerm, categoryFilter, statusFilter, productTypeFilter]);

  const handleToggleStatus = async (
    id: string,
    currentStatus: CatalogStatus,
    type: "service" | "product" = "service",
  ) => {
    try {
      const newStatus = await toggleCatalogItemStatus(id, currentStatus, type);
      showToast("success", `Đã cập nhật trạng thái thành ${newStatus}`);
      loadData();
    } catch (err: any) {
      showToast("error", err.message || "Lỗi đổi trạng thái");
    }
  };

  const handleTogglePkgStatus = async (
    id: string,
    currentIsActive: boolean,
  ) => {
    try {
      await togglePackageStatus(id, currentIsActive);
      showToast("success", "Đã cập nhật trạng thái gói");
      loadData();
    } catch (err: any) {
      showToast("error", err.message || "Lỗi đổi trạng thái gói");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setLoading(true);
    try {
      if (confirmDelete.type === "services") {
        await deleteService(confirmDelete.id);
        showToast("success", "Đã xóa dịch vụ thành công");
      } else if (confirmDelete.type === "products") {
        await deleteProduct(confirmDelete.id);
        showToast("success", "Đã xóa sản phẩm thành công");
      } else if (confirmDelete.type === "categories") {
        await deleteCategory(confirmDelete.id, confirmDelete.extraData || "");
        showToast("success", "Đã xóa danh mục thành công");
      } else if (confirmDelete.type === "packages") {
        await deletePackage(confirmDelete.id);
        showToast("success", "Đã xóa gói dịch vụ thành công");
      }
      setConfirmDelete(null);
      loadData();
    } catch (err: any) {
      showToast("error", err.message || "Không thể xóa");
    } finally {
      setLoading(false);
    }
  };

  // ===== PRODUCT DETAIL =====
  const openProductDetail = async (product: ProductItem) => {
    setProductDetail({
      isOpen: true,
      product,
      history: [],
      loadingHistory: true,
    });
    try {
      const history = await fetchInventoryHistory(product.product_id);
      const historyWithStaff = history.map((item) => {
        const staff = staffList.find((s) => s.id === item.created_by);
        return {
          ...item,
          staff_name: staff?.full_name || "Hệ thống",
        };
      });
      setProductDetail((prev) => ({
        ...prev,
        history: historyWithStaff,
        loadingHistory: false,
      }));
    } catch (err) {
      console.error(err);
      setProductDetail((prev) => ({ ...prev, loadingHistory: false }));
    }
  };

  const closeProductDetail = () => {
    setProductDetail({
      isOpen: false,
      product: null,
      history: [],
      loadingHistory: false,
    });
  };

  // ===== QUICK INVENTORY =====
  const openQuickInventory = (
    product: ProductItem,
    type: InventoryTransactionType,
  ) => {
    setQuickInventory({
      isOpen: true,
      product,
      type,
      quantity: 1,
      note: "",
      submitting: false,
    });
  };

  const closeQuickInventory = () => {
    setQuickInventory({
      isOpen: false,
      product: null,
      type: "IN",
      quantity: 1,
      note: "",
      submitting: false,
    });
  };

  const handleQuickInventorySubmit = async () => {
    const { product, type, quantity, note } = quickInventory;
    if (!product || quantity <= 0) {
      showToast("error", "Số lượng phải lớn hơn 0");
      return;
    }
    if (type === "OUT" && quantity > (product.stock_quantity || 0)) {
      showToast("error", "Số lượng xuất vượt quá tồn kho hiện tại");
      return;
    }
    setQuickInventory((prev) => ({ ...prev, submitting: true }));
    try {
      await processInventoryTransaction({
        product_id: product.product_id,
        type: type,
        quantity: quantity,
        note: note || `${type === "IN" ? "Nhập" : "Xuất"} kho: ${product.name}`,
      });
      // Cập nhật stock trong state
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? {
                ...p,
                stock_quantity:
                  (p.stock_quantity || 0) +
                  (type === "IN" ? quantity : -quantity),
              }
            : p,
        ),
      );
      showToast(
        "success",
        `${type === "IN" ? "Nhập" : "Xuất"} kho ${quantity} ${product.unit} thành công`,
      );
      closeQuickInventory();
      loadData();
    } catch (err: any) {
      showToast("error", err.message || "Lỗi xử lý giao dịch kho");
    } finally {
      setQuickInventory((prev) => ({ ...prev, submitting: false }));
    }
  };

  // ===== PRODUCT EXPORT (CONSUMABLE) – giữ lại nhưng sẽ dùng chung quick inventory =====
  const openExportModal = (product: ProductItem) => {
    setExportModal({
      isOpen: true,
      product,
      quantity: 1,
      note: "",
      submitting: false,
    });
  };

  const closeExportModal = () => {
    setExportModal({
      isOpen: false,
      product: null,
      quantity: 0,
      note: "",
      submitting: false,
    });
  };

  const handleExportSubmit = async () => {
    const { product, quantity, note } = exportModal;
    if (!product || quantity <= 0) {
      showToast("error", "Số lượng phải lớn hơn 0");
      return;
    }
    if (quantity > (product.stock_quantity || 0)) {
      showToast("error", "Số lượng xuất vượt quá tồn kho hiện tại");
      return;
    }
    setExportModal((prev) => ({ ...prev, submitting: true }));
    try {
      await processInventoryTransaction({
        product_id: product.product_id,
        type: "OUT",
        quantity: quantity,
        note: note || `Xuất vật tư tiêu hao: ${product.name}`,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, stock_quantity: (p.stock_quantity || 0) - quantity }
            : p,
        ),
      );
      showToast("success", `Đã xuất kho ${quantity} ${product.unit}`);
      closeExportModal();
      if (productDetail.isOpen) {
        await openProductDetail(product);
      }
      loadData();
    } catch (err: any) {
      showToast("error", err.message || "Lỗi xuất kho");
    } finally {
      setExportModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Quản lý Danh mục (Catalog)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Dịch vụ, Sản phẩm, Danh mục & Gói liệu trình
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-700 transition-colors w-full sm:w-auto font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* Toast */}
      {notification && (
        <div
          className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border text-sm ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-slate-200 bg-white rounded-xl px-2 pt-2 shadow-sm">
        <button
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "services"
              ? "border-pink-600 text-pink-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Scissors className="w-4 h-4" />
          Dịch vụ
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "products"
              ? "border-pink-600 text-pink-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Sản phẩm
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "categories"
              ? "border-pink-600 text-pink-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <FolderTree className="w-4 h-4" />
          Danh mục
        </button>
        <button
          onClick={() => setActiveTab("packages")}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "packages"
              ? "border-pink-600 text-pink-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <PackageIcon className="w-4 h-4" />
          Gói dịch vụ
        </button>
      </div>

      {/* TAB 1: DỊCH VỤ - giữ nguyên */}
      {activeTab === "services" && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên/mã..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm bg-white"
              >
                <option value="">-- Tất cả danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm bg-white"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Ngưng</option>
              </select>
            </div>
            <button
              onClick={() => {
                setEditingService(null);
                setIsServiceModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-pink-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-pink-700 shadow-sm active:scale-[0.98] transition-transform"
            >
              <Plus className="w-4 h-4" />
              Thêm Dịch vụ
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                  <th className="p-3">Mã</th>
                  <th className="p-3">Tên dịch vụ</th>
                  <th className="p-3">Danh mục</th>
                  <th className="p-3 text-right">Giá bán</th>
                  <th className="p-3">Sale Comm</th>
                  <th className="p-3">KTV Comm</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-500">
                      Chưa có dịch vụ nào phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-xs font-bold text-slate-700">
                        {item.code}
                      </td>
                      <td className="p-3 font-semibold text-slate-900">
                        {item.name}
                        {item.duration_minutes ? (
                          <span className="block text-xs text-slate-400 font-normal">
                            {item.duration_minutes} phút
                          </span>
                        ) : null}
                      </td>
                      <td className="p-3 text-slate-600">
                        {item.category ? (
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">
                            {item.category}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3 font-semibold text-slate-900 text-right">
                        {formatVND(item.price)}
                      </td>
                      <td className="p-3 font-medium text-emerald-700">
                        {formatCommission(
                          item.sales_commission_type,
                          item.sales_commission_value,
                          item.sales_commission_rate,
                        )}
                      </td>
                      <td className="p-3 font-medium text-blue-700">
                        {formatCommission(
                          item.performance_commission_type,
                          item.performance_commission_value,
                          item.performance_commission_rate,
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() =>
                            handleToggleStatus(item.id, item.status, "service")
                          }
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                            item.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {item.status === "ACTIVE" ? "Hoạt động" : "Ngưng"}
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingService(item);
                            setIsServiceModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-pink-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDelete({
                              type: "services",
                              id: item.id,
                              title: item.name,
                            })
                          }
                          className="p-1.5 text-slate-500 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {filteredServices.length === 0 ? (
              <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
                Chưa có dịch vụ nào phù hợp
              </div>
            ) : (
              filteredServices.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded">
                        {item.code}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-1">
                        {item.name}
                      </h3>
                    </div>
                    <button
                      onClick={() =>
                        handleToggleStatus(item.id, item.status, "service")
                      }
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                        item.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.status === "ACTIVE" ? "Hoạt động" : "Ngưng"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-500 block">Giá dịch vụ</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {formatVND(item.price)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Thời lượng</span>
                      <span className="font-medium text-slate-700">
                        {item.duration_minutes || 0} phút
                      </span>
                    </div>
                    <div className="border-t pt-1.5 mt-1 border-slate-200">
                      <span className="text-slate-500 block">
                        Hoa hồng Sale
                      </span>
                      <span className="font-bold text-emerald-700">
                        {formatCommission(
                          item.sales_commission_type,
                          item.sales_commission_value,
                          item.sales_commission_rate,
                        )}
                      </span>
                    </div>
                    <div className="border-t pt-1.5 mt-1 border-slate-200">
                      <span className="text-slate-500 block">Hoa hồng KTV</span>
                      <span className="font-bold text-blue-700">
                        {formatCommission(
                          item.performance_commission_type,
                          item.performance_commission_value,
                          item.performance_commission_rate,
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-500">
                      {item.category
                        ? `DM: ${item.category}`
                        : "Chưa phân loại"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingService(item);
                          setIsServiceModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-pink-600" />
                        Sửa
                      </button>
                      <button
                        onClick={() =>
                          setConfirmDelete({
                            type: "services",
                            id: item.id,
                            title: item.name,
                          })
                        }
                        className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SẢN PHẨM - CÓ NHẬP/XUẤT NHANH */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm SKU/tên sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm bg-white"
              >
                <option value="">-- Tất cả danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm bg-white"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Ngưng</option>
              </select>
            </div>
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-pink-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-pink-700 shadow-sm active:scale-[0.98] transition-transform"
            >
              <Plus className="w-4 h-4" />
              Thêm Sản phẩm
            </button>
          </div>

          {/* Product Type Filter */}
          <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500 mr-1">
              Loại:
            </span>
            <button
              onClick={() => setProductTypeFilter("ALL")}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                productTypeFilter === "ALL"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setProductTypeFilter("RETAIL")}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                productTypeFilter === "RETAIL"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              💰 RETAIL
            </button>
            <button
              onClick={() => setProductTypeFilter("CONSUMABLE")}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                productTypeFilter === "CONSUMABLE"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              📦 CONSUMABLE
            </button>
          </div>

          {/* Desktop Table View - COMPACT + NHẬP/XUẤT NHANH */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                  <th className="p-2">SKU</th>
                  <th className="p-2">Tên sản phẩm</th>
                  <th className="p-2">Loại</th>
                  <th className="p-2">Danh mục</th>
                  <th className="p-2 text-right">Giá bán</th>
                  <th className="p-2 text-center">Tồn kho</th>
                  <th className="p-2">Trạng thái</th>
                  <th className="p-2 text-center">Nhập/Xuất</th>
                  <th className="p-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-4 text-center text-slate-500">
                      Chưa có sản phẩm nào phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((item) => {
                    const stock = item.stock_quantity || 0;
                    const minStock = item.minimum_stock || 0;
                    let stockColor = "bg-emerald-100 text-emerald-800";
                    let stockLabel = `${stock}`;
                    if (stock === 0) {
                      stockColor = "bg-rose-100 text-rose-800";
                      stockLabel = "0";
                    } else if (stock <= minStock) {
                      stockColor = "bg-amber-100 text-amber-800";
                      stockLabel = `${stock}`;
                    }
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-2 font-mono text-xs font-bold text-slate-700">
                          {item.code}
                        </td>
                        <td
                          className="p-2 font-semibold text-slate-900 cursor-pointer hover:text-pink-600 transition-colors"
                          onClick={() => openProductDetail(item)}
                        >
                          {item.name}
                        </td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              item.product_type === "RETAIL"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {item.product_type === "RETAIL"
                              ? "RETAIL"
                              : "CONSUMABLE"}
                          </span>
                        </td>
                        <td className="p-2 text-slate-600">
                          {item.category || "-"}
                        </td>
                        <td className="p-2 font-semibold text-slate-900 text-right">
                          {formatVND(item.selling_price || item.price || 0)}
                        </td>
                        <td className="p-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${stockColor}`}
                          >
                            {stockLabel}
                          </span>
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() =>
                              handleToggleStatus(
                                item.id,
                                item.status,
                                "product",
                              )
                            }
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer ${
                              item.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {item.status === "ACTIVE" ? "Hoạt động" : "Ngưng"}
                          </button>
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openQuickInventory(item, "IN")}
                              className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded"
                              title="Nhập kho"
                            >
                              <ArrowDownCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openQuickInventory(item, "OUT")}
                              className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded"
                              title="Xuất kho"
                            >
                              <ArrowUpCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="p-2 text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditingProduct(item);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1 text-slate-500 hover:text-pink-600"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmDelete({
                                type: "products",
                                id: item.id,
                                title: item.name,
                              })
                            }
                            className="p-1 text-slate-500 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openProductDetail(item)}
                            className="p-1 text-slate-500 hover:text-blue-600"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Compact List + NHẬP/XUẤT NHANH */}
          <div className="md:hidden space-y-2">
            {filteredProducts.length === 0 ? (
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
                Chưa có sản phẩm nào phù hợp
              </div>
            ) : (
              filteredProducts.map((item) => {
                const stock = item.stock_quantity || 0;
                let stockColor =
                  stock === 0
                    ? "text-rose-600"
                    : stock <= (item.minimum_stock || 0)
                    ? "text-amber-600"
                    : "text-emerald-600";
                return (
                  <div
                    key={item.id}
                    className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-slate-900 truncate">
                          {item.name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            item.product_type === "RETAIL"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.product_type === "RETAIL" ? "💰" : "📦"}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded ${
                            item.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {item.status === "ACTIVE" ? "Active" : "Ngưng"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-800">
                          {formatVND(item.selling_price || item.price || 0)}
                        </span>
                        <span>•</span>
                        <span className={stockColor}>Tồn: {stock}</span>
                        {item.category && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">
                              {item.category}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openQuickInventory(item, "IN")}
                        className="p-1 text-emerald-600 hover:text-emerald-800"
                        title="Nhập kho"
                      >
                        <ArrowDownCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openQuickInventory(item, "OUT")}
                        className="p-1 text-rose-600 hover:text-rose-800"
                        title="Xuất kho"
                      >
                        <ArrowUpCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingProduct(item);
                          setIsProductModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-pink-600"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setConfirmDelete({
                            type: "products",
                            id: item.id,
                            title: item.name,
                          })
                        }
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openProductDetail(item)}
                        className="p-1 text-slate-400 hover:text-blue-600"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES - giữ nguyên */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingCategory(null);
                setIsCategoryModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-pink-700 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Thêm Danh mục
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm sm:text-base">
                  <Scissors className="w-4 h-4 text-pink-600" />
                  Danh mục Dịch vụ
                </h3>
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">
                  {categories.filter((c) => c.type === "service").length} mục
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {categories
                  .filter((c) => c.type === "service")
                  .map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between py-2 hover:bg-slate-50 px-1 rounded text-xs sm:text-sm"
                    >
                      <span className="font-medium text-slate-800">
                        {cat.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setIsCategoryModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-pink-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDelete({
                              type: "categories",
                              id: cat.id,
                              extraData: cat.name,
                              title: cat.name,
                            })
                          }
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm sm:text-base">
                  <ShoppingBag className="w-4 h-4 text-pink-600" />
                  Danh mục Sản phẩm
                </h3>
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">
                  {categories.filter((c) => c.type === "product").length} mục
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {categories
                  .filter((c) => c.type === "product")
                  .map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between py-2 hover:bg-slate-50 px-1 rounded text-xs sm:text-sm"
                    >
                      <span className="font-medium text-slate-800">
                        {cat.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setIsCategoryModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-pink-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDelete({
                              type: "categories",
                              id: cat.id,
                              extraData: cat.name,
                              title: cat.name,
                            })
                          }
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PACKAGES */}
      {activeTab === "packages" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Gói Dịch vụ / Liệu trình
            </h3>
            <button
              onClick={() => {
                setEditingPackage(null);
                setIsPackageModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-pink-700 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tạo Gói Dịch vụ
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                  <th className="p-3">Mã gói</th>
                  <th className="p-3">Tên gói</th>
                  <th className="p-3 text-right">Giá gói</th>
                  <th className="p-3 text-right">Sale Commission</th>
                  <th className="p-3 text-right">Hạn dùng</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {packages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">
                      Chưa có gói dịch vụ nào
                    </td>
                  </tr>
                ) : (
                  packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-xs font-bold text-slate-700">
                        {pkg.code}
                      </td>
                      <td className="p-3 font-semibold text-slate-900">
                        {pkg.name}
                      </td>
                      <td className="p-3 font-semibold text-pink-600 text-right">
                        {formatVND(pkg.price)}
                      </td>
                      <td className="p-3 font-medium text-emerald-700 text-right">
                        {pkg.sales_commission_type &&
                        pkg.sales_commission_value !== undefined
                          ? formatCommission(
                              pkg.sales_commission_type,
                              pkg.sales_commission_value,
                            )
                          : "—"}
                      </td>
                      <td className="p-3 text-slate-600 text-right text-xs">
                        {pkg.validity_days || 0} ngày
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingPackage(pkg);
                            setIsPackageModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-pink-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDelete({
                              type: "packages",
                              id: pkg.id,
                              title: pkg.name,
                            })
                          }
                          className="p-1.5 text-slate-500 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== MODAL FORMS ===== */}

      {/* MODAL 1: SERVICE FORM */}
      {isServiceModalOpen && (
        <ServiceFormModal
          key={editingService?.id || "new-service"}
          isOpen={isServiceModalOpen}
          onClose={() => setIsServiceModalOpen(false)}
          editingService={editingService}
          categories={categories}
          onSave={async (formData) => {
            try {
              if (editingService) {
                await updateService(editingService.id, formData);
                showToast("success", "Đã cập nhật dịch vụ thành công");
              } else {
                await createService(formData);
                showToast("success", "Đã thêm dịch vụ mới thành công");
              }
              setIsServiceModalOpen(false);
              loadData();
            } catch (err: any) {
              showToast("error", err.message || "Lỗi lưu dịch vụ");
            }
          }}
        />
      )}

      {/* MODAL 2: PRODUCT FORM */}
      {isProductModalOpen && (
        <ProductFormModal
          key={editingProduct?.id || "new-product"}
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          editingProduct={editingProduct}
          categories={categories}
          onSave={async (formData) => {
            try {
              if (editingProduct) {
                await updateProduct(editingProduct.id, formData);
                showToast("success", "Đã cập nhật sản phẩm thành công");
              } else {
                await createProduct(formData);
                showToast("success", "Đã thêm sản phẩm mới thành công");
              }
              setIsProductModalOpen(false);
              loadData();
            } catch (err: any) {
              showToast("error", err.message || "Lỗi lưu sản phẩm");
            }
          }}
        />
      )}

      {/* MODAL 3: CATEGORY FORM */}
      {isCategoryModalOpen && (
        <CategoryFormModal
          key={editingCategory?.id || "new-category"}
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          editingCategory={editingCategory}
          onSave={async (formData) => {
            try {
              if (editingCategory) {
                await updateCategory(editingCategory.id, formData);
                showToast("success", "Đã cập nhật danh mục");
              } else {
                await createCategory(formData);
                showToast("success", "Đã thêm danh mục mới");
              }
              setIsCategoryModalOpen(false);
              loadData();
            } catch (err: any) {
              showToast("error", err.message || "Lỗi lưu danh mục");
            }
          }}
        />
      )}

      {/* MODAL 4: PACKAGE FORM */}
      {isPackageModalOpen && (
        <PackageFormModal
          key={editingPackage?.id || "new-package"}
          isOpen={isPackageModalOpen}
          onClose={() => setIsPackageModalOpen(false)}
          editingPackage={editingPackage}
          availableServices={services}
          onSave={async (pkgData, items) => {
            try {
              if (editingPackage) {
                await updatePackage(editingPackage.id, pkgData, items);
                showToast("success", "Đã cập nhật gói dịch vụ");
              } else {
                await createPackage(pkgData, items);
                showToast("success", "Đã thêm gói dịch vụ thành công");
              }
              setIsPackageModalOpen(false);
              loadData();
            } catch (err: any) {
              showToast("error", err.message || "Lỗi lưu gói dịch vụ");
            }
          }}
        />
      )}

      {/* ===== PRODUCT DETAIL MODAL ===== */}
      {productDetail.isOpen && productDetail.product && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Chi tiết sản phẩm
                </h3>
                <p className="text-xs text-slate-500">
                  #{productDetail.product.code}
                </p>
              </div>
              <button
                onClick={closeProductDetail}
                className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500">Tên sản phẩm</span>
                  <p className="font-semibold">{productDetail.product.name}</p>
                </div>
                <div>
                  <span className="text-slate-500">Loại</span>
                  <Badge
                    variant={
                      productDetail.product.product_type === "RETAIL"
                        ? "success"
                        : "neutral"
                    }
                  >
                    {productDetail.product.product_type === "RETAIL"
                      ? "RETAIL"
                      : "CONSUMABLE"}
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-500">Giá bán</span>
                  <p className="font-semibold text-pink-600">
                    {formatVND(
                      productDetail.product.selling_price ||
                        productDetail.product.price ||
                        0,
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Đơn vị</span>
                  <p>{productDetail.product.unit || "cái"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Danh mục</span>
                  <p>{productDetail.product.category || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Trạng thái</span>
                  <Badge
                    variant={
                      productDetail.product.status === "ACTIVE"
                        ? "success"
                        : "neutral"
                    }
                  >
                    {productDetail.product.status}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Mô tả</span>
                  <p className="text-slate-700 text-sm">
                    {productDetail.product.description || "Chưa có mô tả"}
                  </p>
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="font-semibold text-slate-800 mb-2">Tồn kho</h4>
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <span className="text-slate-500">Tồn hiện tại</span>
                    <div className="text-2xl font-bold text-slate-900">
                      {productDetail.product.stock_quantity || 0}{" "}
                      <span className="text-sm font-normal text-slate-500">
                        {productDetail.product.unit || "cái"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Cảnh báo tối thiểu</span>
                    <div className="text-lg font-semibold text-slate-700">
                      {productDetail.product.minimum_stock || 0}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <span className="text-slate-500">Trạng thái</span>
                    <div>
                      {(productDetail.product.stock_quantity || 0) === 0 ? (
                        <Badge variant="danger" className="text-sm">
                          🔴 Hết hàng
                        </Badge>
                      ) : (productDetail.product.stock_quantity || 0) <=
                        (productDetail.product.minimum_stock || 0) ? (
                        <Badge variant="warning" className="text-sm">
                          🟠 Sắp hết
                        </Badge>
                      ) : (
                        <Badge variant="success" className="text-sm">
                          🟢 Còn hàng
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {productDetail.product.product_type === "CONSUMABLE" && (
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-slate-800">
                      Xuất kho vật tư
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        closeProductDetail();
                        openExportModal(productDetail.product!);
                      }}
                    >
                      <ArrowUpRight className="w-4 h-4" /> Xuất kho
                    </Button>
                  </div>
                </div>
              )}

              <div className="border-t pt-3">
                <h4 className="font-semibold text-slate-800 mb-2">
                  Lịch sử xuất nhập tồn
                </h4>
                {productDetail.loadingHistory ? (
                  <div className="text-center py-4 text-slate-500 text-sm">
                    Đang tải...
                  </div>
                ) : productDetail.history.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-sm">
                    Chưa có giao dịch nào
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="p-2">Ngày</th>
                          <th className="p-2">Loại</th>
                          <th className="p-2 text-right">SL</th>
                          <th className="p-2 text-right">Tồn trước</th>
                          <th className="p-2 text-right">Tồn sau</th>
                          <th className="p-2">Ghi chú</th>
                          <th className="p-2">Người tạo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {productDetail.history.map((tx) => (
                          <tr key={tx.id}>
                            <td className="p-2 whitespace-nowrap">
                              {new Date(tx.created_at).toLocaleString(
                                "vi-VN",
                              )}
                            </td>
                            <td className="p-2">
                              <Badge
                                variant={
                                  tx.transaction_type === "IN"
                                    ? "success"
                                    : tx.transaction_type === "OUT"
                                    ? "danger"
                                    : "neutral"
                                }
                              >
                                {tx.transaction_type === "IN"
                                  ? "+ Nhập"
                                  : tx.transaction_type === "OUT"
                                  ? "- Xuất"
                                  : "Điều chỉnh"}
                              </Badge>
                            </td>
                            <td className="p-2 text-right font-medium">
                              {tx.quantity}
                            </td>
                            <td className="p-2 text-right text-slate-600">
                              {tx.stock_before}
                            </td>
                            <td className="p-2 text-right font-semibold">
                              {tx.stock_after}
                            </td>
                            <td className="p-2 text-slate-500 max-w-xs truncate">
                              {tx.note || "—"}
                            </td>
                            <td className="p-2 text-slate-500">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {tx.staff_name || "Hệ thống"}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 bg-slate-50 shrink-0">
              <Button variant="outline" onClick={closeProductDetail}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===== QUICK INVENTORY MODAL ===== */}
      {quickInventory.isOpen && quickInventory.product && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-base font-bold text-slate-900">
                {quickInventory.type === "IN" ? "Nhập kho" : "Xuất kho"}
              </h3>
              <button
                onClick={closeQuickInventory}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <p className="text-sm text-slate-700">
                Sản phẩm: <strong>{quickInventory.product.name}</strong>
              </p>
              <p className="text-xs text-slate-500">
                Tồn hiện tại: {quickInventory.product.stock_quantity || 0}{" "}
                {quickInventory.product.unit || "cái"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số lượng *
              </label>
              <input
                type="number"
                min="1"
                value={quickInventory.quantity}
                onChange={(e) =>
                  setQuickInventory((prev) => ({
                    ...prev,
                    quantity: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú
              </label>
              <input
                type="text"
                value={quickInventory.note}
                onChange={(e) =>
                  setQuickInventory((prev) => ({ ...prev, note: e.target.value }))
                }
                placeholder={`Lý do ${quickInventory.type === "IN" ? "nhập" : "xuất"}...`}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={closeQuickInventory}>
                Hủy
              </Button>
              <Button
                variant="secondary"
                isLoading={quickInventory.submitting}
                onClick={handleQuickInventorySubmit}
                disabled={quickInventory.quantity <= 0}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===== EXPORT MODAL (CONSUMABLE) – giữ lại ===== */}
      {exportModal.isOpen && exportModal.product && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-base font-bold text-slate-900">
                Xuất kho vật tư
              </h3>
              <button
                onClick={closeExportModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <p className="text-sm text-slate-700">
                Sản phẩm: <strong>{exportModal.product.name}</strong>
              </p>
              <p className="text-xs text-slate-500">
                Tồn hiện tại: {exportModal.product.stock_quantity || 0}{" "}
                {exportModal.product.unit || "cái"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số lượng xuất *
              </label>
              <input
                type="number"
                min="1"
                value={exportModal.quantity}
                onChange={(e) =>
                  setExportModal((prev) => ({
                    ...prev,
                    quantity: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lý do xuất
              </label>
              <input
                type="text"
                value={exportModal.note}
                onChange={(e) =>
                  setExportModal((prev) => ({ ...prev, note: e.target.value }))
                }
                placeholder="VD: Sử dụng vệ sinh, thay thế..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={closeExportModal}>
                Hủy
              </Button>
              <Button
                variant="secondary"
                isLoading={exportModal.submitting}
                onClick={handleExportSubmit}
                disabled={exportModal.quantity <= 0}
              >
                Xác nhận xuất
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-lg text-slate-900">Xác nhận xóa</h3>
            <p className="text-sm text-slate-600">
              Bạn có chắc chắn muốn xóa "<strong>{confirmDelete.title}</strong>"?
              Thao tác này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// SERVICE FORM MODAL
// ==========================================

function ServiceFormModal({
  isOpen,
  onClose,
  editingService,
  categories,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingService: ServiceItem | null;
  categories: Category[];
  onSave: (data: any) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    code: editingService?.code || `DV${Math.floor(100 + Math.random() * 900)}`,
    name: editingService?.name || "",
    category: editingService?.category || "",
    description: editingService?.description || "",
    price: editingService?.price || 0,
    duration_minutes: editingService?.duration_minutes || 60,
    sales_commission_type:
      editingService?.sales_commission_type || ("PERCENT" as CommissionType),
    sales_commission_value:
      editingService?.sales_commission_value ??
      editingService?.sales_commission_rate ??
      0,
    performance_commission_type:
      editingService?.performance_commission_type ||
      ("PERCENT" as CommissionType),
    performance_commission_value:
      editingService?.performance_commission_value ??
      editingService?.performance_commission_rate ??
      0,
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (
      formData.sales_commission_type === "PERCENT" &&
      (formData.sales_commission_value < 0 ||
        formData.sales_commission_value > 100)
    ) {
      setValidationError("Hoa hồng Sale (%) phải từ 0% đến 100%");
      return;
    }
    if (
      formData.performance_commission_type === "PERCENT" &&
      (formData.performance_commission_value < 0 ||
        formData.performance_commission_value > 100)
    ) {
      setValidationError("Hoa hồng KTV (%) phải từ 0% đến 100%");
      return;
    }
    if (
      formData.sales_commission_value < 0 ||
      formData.performance_commission_value < 0
    ) {
      setValidationError("Giá trị hoa hồng không được là số âm");
      return;
    }

    setValidationError(null);
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            {editingService ? "Sửa Dịch vụ" : "Thêm Dịch vụ Mới"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mã dịch vụ *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Danh mục
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-pink-500"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tên dịch vụ *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-500"
              placeholder="VD: Chăm sóc da mụn Chuyên sâu"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Giá bán (VND) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-pink-600 focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Thời lượng (Phút)
              </label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_minutes: Number(e.target.value),
                  })
                }
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-4">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Cấu hình Hoa hồng
            </h4>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <label className="block font-bold text-slate-800 text-xs">
                Hoa hồng Sale
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      sales_commission_type: "PERCENT",
                    })
                  }
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all ${
                    formData.sales_commission_type === "PERCENT"
                      ? "bg-pink-600 text-white border-pink-600 shadow-xs"
                      : "bg-white text-slate-600 border-slate-300"
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" /> % Phần trăm
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      sales_commission_type: "FIXED",
                    })
                  }
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all ${
                    formData.sales_commission_type === "FIXED"
                      ? "bg-pink-600 text-white border-pink-600 shadow-xs"
                      : "bg-white text-slate-600 border-slate-300"
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" /> Tiền cố định
                </button>
              </div>
              <div className="pt-1">
                <label className="block text-[11px] text-slate-500 mb-1">
                  Giá trị (
                  {formData.sales_commission_type === "PERCENT" ? "%" : "VNĐ"})
                </label>
                <input
                  type="number"
                  value={formData.sales_commission_value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sales_commission_value: Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 bg-white"
                  placeholder={
                    formData.sales_commission_type === "PERCENT"
                      ? "VD: 10"
                      : "VD: 50000"
                  }
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <label className="block font-bold text-slate-800 text-xs">
                Hoa hồng KTV (Kỹ thuật viên)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      performance_commission_type: "PERCENT",
                    })
                  }
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all ${
                    formData.performance_commission_type === "PERCENT"
                      ? "bg-pink-600 text-white border-pink-600 shadow-xs"
                      : "bg-white text-slate-600 border-slate-300"
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" /> % Phần trăm
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      performance_commission_type: "FIXED",
                    })
                  }
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all ${
                    formData.performance_commission_type === "FIXED"
                      ? "bg-pink-600 text-white border-pink-600 shadow-xs"
                      : "bg-white text-slate-600 border-slate-300"
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" /> Tiền cố định
                </button>
              </div>
              <div className="pt-1">
                <label className="block text-[11px] text-slate-500 mb-1">
                  Giá trị (
                  {formData.performance_commission_type === "PERCENT"
                    ? "%"
                    : "VNĐ"}
                  )
                </label>
                <input
                  type="number"
                  value={formData.performance_commission_value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      performance_commission_value: Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 bg-white"
                  placeholder={
                    formData.performance_commission_type === "PERCENT"
                      ? "VD: 15"
                      : "VD: 50000"
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mô tả dịch vụ
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              placeholder="Ghi chú chi tiết về dịch vụ..."
            ></textarea>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-100"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 shadow-md active:scale-[0.98] transition-transform"
          >
            Lưu Dịch vụ
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// PRODUCT FORM MODAL
// ==========================================

function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
  categories,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: ProductItem | null;
  categories: Category[];
  onSave: (data: any) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    code: editingProduct?.code || `SP${Math.floor(100 + Math.random() * 900)}`,
    name: editingProduct?.name || "",
    category: editingProduct?.category || "",
    description: editingProduct?.description || "",
    cost_price: editingProduct?.cost_price || 0,
    selling_price: editingProduct?.selling_price || editingProduct?.price || 0,
    stock_quantity: editingProduct?.stock_quantity || 0,
    minimum_stock: editingProduct?.minimum_stock || 5,
    unit: editingProduct?.unit || "Chai",
    product_type: editingProduct?.product_type || "RETAIL",
    sales_commission_type:
      editingProduct?.sales_commission_type || ("PERCENT" as CommissionType),
    sales_commission_value: editingProduct?.sales_commission_value ?? 0,
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (
      formData.sales_commission_type === "PERCENT" &&
      (formData.sales_commission_value < 0 ||
        formData.sales_commission_value > 100)
    ) {
      setValidationError("Hoa hồng Sale (%) phải từ 0% đến 100%");
      return;
    }
    if (formData.sales_commission_value < 0) {
      setValidationError("Giá trị hoa hồng không được là số âm");
      return;
    }

    setValidationError(null);
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            {editingProduct ? "Sửa Sản phẩm" : "Thêm Sản phẩm Mới"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mã SKU *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Danh mục
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-white"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tên sản phẩm *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              placeholder="VD: Tinh chất Serum Vitamin C"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Loại sản phẩm *
            </label>
            <select
              value={formData.product_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  product_type: e.target.value as "RETAIL" | "CONSUMABLE",
                })
              }
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-pink-500"
            >
              <option value="RETAIL">
                💰 Bán (Retail) – Xuất hiện trên POS
              </option>
              <option value="CONSUMABLE">
                📦 Vật tư tiêu hao – Không xuất hiện trên POS
              </option>
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              {formData.product_type === "RETAIL"
                ? "Sản phẩm này sẽ xuất hiện trên POS để bán cho khách."
                : "Sản phẩm này sẽ không xuất hiện trên POS, chỉ quản lý tồn kho nội bộ."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Giá vốn (VND)
              </label>
              <input
                type="number"
                value={formData.cost_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cost_price: Number(e.target.value),
                  })
                }
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Giá bán (VND) *
              </label>
              <input
                type="number"
                value={formData.selling_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    selling_price: Number(e.target.value),
                  })
                }
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-pink-600"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <label className="block font-bold text-slate-800 text-xs">
                Hoa hồng Sale (Sản phẩm)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      sales_commission_type: "PERCENT",
                    })
                  }
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all ${
                    formData.sales_commission_type === "PERCENT"
                      ? "bg-pink-600 text-white border-pink-600 shadow-xs"
                      : "bg-white text-slate-600 border-slate-300"
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" /> % Phần trăm
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      sales_commission_type: "FIXED",
                    })
                  }
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all ${
                    formData.sales_commission_type === "FIXED"
                      ? "bg-pink-600 text-white border-pink-600 shadow-xs"
                      : "bg-white text-slate-600 border-slate-300"
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" /> Tiền cố định
                </button>
              </div>
              <div className="pt-1">
                <label className="block text-[11px] text-slate-500 mb-1">
                  Giá trị (
                  {formData.sales_commission_type === "PERCENT" ? "%" : "VNĐ"})
                </label>
                <input
                  type="number"
                  value={formData.sales_commission_value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sales_commission_value: Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 bg-white"
                  placeholder={
                    formData.sales_commission_type === "PERCENT"
                      ? "VD: 10"
                      : "VD: 30000"
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tồn kho
              </label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock_quantity: Number(e.target.value),
                  })
                }
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cảnh báo
              </label>
              <input
                type="number"
                value={formData.minimum_stock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minimum_stock: Number(e.target.value),
                  })
                }
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Đơn vị
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-100"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 shadow-md active:scale-[0.98] transition-transform"
          >
            Lưu Sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CATEGORY FORM MODAL
// ==========================================

function CategoryFormModal({
  isOpen,
  onClose,
  editingCategory,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingCategory: Category | null;
  onSave: (data: any) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    name: editingCategory?.name || "",
    type: editingCategory?.type || ("service" as CategoryType),
    status: editingCategory?.status || "active",
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-slate-900 text-base">
            {editingCategory ? "Sửa Danh mục" : "Thêm Danh mục Mới"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="space-y-3 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tên danh mục *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-2.5 border border-slate-300 rounded-xl"
              placeholder="VD: Chăm sóc da mặt"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Loại danh mục
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as CategoryType,
                })
              }
              className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
            >
              <option value="service">Dịch vụ</option>
              <option value="product">Sản phẩm</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave(formData)}
            className="flex-1 sm:flex-none px-4 py-2 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// PACKAGE FORM MODAL - ĐÃ SỬA LỖI & CÓ SẢN PHẨM
// ==========================================

function PackageFormModal({
  isOpen,
  onClose,
  editingPackage,
  availableServices,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingPackage: Package | null;
  availableServices: ServiceItem[];
  onSave: (pkgData: any, items: any[]) => Promise<void>;
}) {
  const [pkgData, setPkgData] = useState({
    code: editingPackage?.code || `PKG${Math.floor(100 + Math.random() * 900)}`,
    name: editingPackage?.name || "",
    price: editingPackage?.price || 0,
    validity_days: editingPackage?.validity_days || 90,
    description: editingPackage?.description || "",
    is_active: editingPackage?.is_active ?? true,
    sales_commission_type: editingPackage?.sales_commission_type || "PERCENT",
    sales_commission_value: editingPackage?.sales_commission_value || 0,
  });

  // Service items
  const [serviceItems, setServiceItems] = useState<
    Array<{ service_id: string; quantity: number; price_override?: number }>
  >(
    editingPackage?.package_items
      ?.filter((item) => item.item_type !== "PRODUCT")
      ?.map((it) => ({
        service_id: it.service_id || "",
        quantity: it.quantity,
        price_override: it.price_override || undefined,
      })) || [],
  );

  // Product items
  const [productItems, setProductItems] = useState<
    Array<{ product_id: string; quantity: number; price_override?: number }>
  >(
    editingPackage?.package_items
      ?.filter((item) => item.item_type === "PRODUCT")
      ?.map((it) => ({
        product_id: it.product_id || "",
        quantity: it.quantity,
        price_override: it.price_override || undefined,
      })) || [],
  );

  const [availableProducts, setAvailableProducts] = useState<ProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Load products when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAvailableProducts();
    }
  }, [isOpen]);

  const loadAvailableProducts = async () => {
    setLoadingProducts(true);
    try {
      const products = await fetchProducts();
      setAvailableProducts(products.filter((p) => p.status === "ACTIVE"));
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Service handlers
  const addServiceRow = () => {
    if (availableServices.length === 0) return;
    const validService = availableServices[0];
    if (validService) {
      setServiceItems([
        ...serviceItems,
        {
          service_id: validService.service_id || validService.id,
          quantity: 1,
        },
      ]);
    }
  };

  const removeServiceRow = (index: number) => {
    setServiceItems(serviceItems.filter((_, i) => i !== index));
  };

  // Product handlers
  const addProductRow = () => {
    if (availableProducts.length === 0) {
      alert("Không có sản phẩm nào để thêm. Vui lòng tạo sản phẩm trước.");
      return;
    }
    const first = availableProducts[0];
    setProductItems([...productItems, { product_id: first.id, quantity: 1 }]);
  };

  const removeProductRow = (index: number) => {
    setProductItems(productItems.filter((_, i) => i !== index));
  };

  const handleProductQuantityChange = (index: number, qty: number) => {
    const updated = [...productItems];
    updated[index].quantity = Math.max(1, qty);
    setProductItems(updated);
  };

  const handleSubmit = () => {
    const allItems = [
      ...serviceItems.map((item) => ({
        ...item,
        product_id: undefined,
        item_type: "SERVICE" as const,
      })),
      ...productItems.map((item) => ({
        ...item,
        service_id: undefined,
        item_type: "PRODUCT" as const,
      })),
    ];

    if (allItems.length === 0) {
      alert("Vui lòng thêm ít nhất 1 dịch vụ hoặc sản phẩm vào gói.");
      return;
    }

    onSave(pkgData, allItems);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <h3 className="font-bold text-slate-900 text-base">
            {editingPackage ? "Sửa Gói Dịch vụ" : "Tạo Gói Dịch vụ Mới"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-full"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
          {/* Package Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mã gói *
              </label>
              <input
                type="text"
                value={pkgData.code}
                onChange={(e) =>
                  setPkgData({ ...pkgData, code: e.target.value })
                }
                className="w-full p-2.5 border border-slate-300 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tên gói *
              </label>
              <input
                type="text"
                value={pkgData.name}
                onChange={(e) =>
                  setPkgData({ ...pkgData, name: e.target.value })
                }
                className="w-full p-2.5 border border-slate-300 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Giá bán trọn gói (VND) *
              </label>
              <input
                type="number"
                value={pkgData.price}
                onChange={(e) =>
                  setPkgData({ ...pkgData, price: Number(e.target.value) })
                }
                className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold text-pink-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hạn sử dụng (Ngày)
              </label>
              <input
                type="number"
                value={pkgData.validity_days}
                onChange={(e) =>
                  setPkgData({
                    ...pkgData,
                    validity_days: Number(e.target.value),
                  })
                }
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hoa hồng Sale
              </label>
              <div className="flex gap-1">
                <select
                  value={pkgData.sales_commission_type}
                  onChange={(e) =>
                    setPkgData({
                      ...pkgData,
                      sales_commission_type: e.target.value as CommissionType,
                    })
                  }
                  className="flex-1 p-2 border border-slate-300 rounded-l-lg text-xs bg-white"
                >
                  <option value="PERCENT">%</option>
                  <option value="FIXED">₫</option>
                </select>
                <input
                  type="number"
                  min="0"
                  value={pkgData.sales_commission_value}
                  onChange={(e) =>
                    setPkgData({
                      ...pkgData,
                      sales_commission_value: Number(e.target.value),
                    })
                  }
                  className="w-24 p-2 border border-slate-300 rounded-r-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* DỊCH VỤ TRONG GÓI */}
          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-xs uppercase">
                Dịch vụ trong gói
              </h4>
              <button
                type="button"
                onClick={addServiceRow}
                className="flex items-center gap-1 text-xs font-semibold text-pink-600"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm dịch vụ
              </button>
            </div>

            {serviceItems.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-1">
                Chưa có dịch vụ nào trong gói
              </div>
            ) : (
              serviceItems.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200"
                >
                  <select
                    value={it.service_id}
                    onChange={(e) => {
                      const next = [...serviceItems];
                      next[idx].service_id = e.target.value;
                      setServiceItems(next);
                    }}
                    className="flex-1 p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    {availableServices.map((s) => (
                      <option key={s.id} value={s.service_id || s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={it.quantity}
                    onChange={(e) => {
                      const next = [...serviceItems];
                      next[idx].quantity = Number(e.target.value);
                      setServiceItems(next);
                    }}
                    className="w-16 p-2 border border-slate-300 rounded-lg text-xs text-center"
                  />
                  <button
                    type="button"
                    onClick={() => removeServiceRow(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* SẢN PHẨM / HÀNG HÓA TRONG GÓI */}
          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-xs uppercase">
                Sản phẩm / Hàng hóa
              </h4>
              <button
                type="button"
                onClick={addProductRow}
                className="flex items-center gap-1 text-xs font-semibold text-pink-600"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm sản phẩm
              </button>
            </div>

            {loadingProducts ? (
              <div className="text-xs text-slate-400 py-1">
                Đang tải sản phẩm...
              </div>
            ) : productItems.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-1">
                Chưa có sản phẩm nào trong gói
              </div>
            ) : (
              productItems.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200"
                >
                  <select
                    value={it.product_id}
                    onChange={(e) => {
                      const next = [...productItems];
                      next[idx].product_id = e.target.value;
                      setProductItems(next);
                    }}
                    className="flex-1 p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    {availableProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code}) - {p.product_type}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={it.quantity}
                    onChange={(e) =>
                      handleProductQuantityChange(idx, Number(e.target.value))
                    }
                    className="w-16 p-2 border border-slate-300 rounded-lg text-xs text-center"
                  />
                  <button
                    type="button"
                    onClick={() => removeProductRow(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mô tả gói
            </label>
            <textarea
              rows={2}
              value={pkgData.description}
              onChange={(e) =>
                setPkgData({ ...pkgData, description: e.target.value })
              }
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              placeholder="Mô tả chi tiết gói..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700"
          >
            Lưu Gói
          </button>
        </div>
      </div>
    </div>
  );
}