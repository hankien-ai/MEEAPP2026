import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Package as PackageIcon,
  ShoppingBag,
  Scissors,
  FolderTree,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Clock,
  Layers,
} from "lucide-react";
import {
  ServiceItem,
  ProductItem,
  Category,
  Package,
  CategoryType,
  CatalogStatus,
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
} from "../services/catalog-service";

type ActiveTab = "services" | "products" | "categories" | "packages";

export default function CatalogManagementPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("services");
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // States Dữ liệu
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");

  // Modal States
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

  // Delete Confirm Modal State
  const [confirmDelete, setConfirmDelete] = useState<{
    type: ActiveTab;
    id: string;
    extraData?: string;
    title: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load Data dựa theo Tab
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

  useEffect(() => {
    loadData();
    setSearchTerm("");
    setCategoryFilter("");
    setStatusFilter("ALL");
  }, [activeTab]);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  // Filtered Services
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

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = !categoryFilter || p.category === categoryFilter;
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  // Category Toggle & Handlers
  const handleToggleStatus = async (
    id: string,
    currentStatus: CatalogStatus,
  ) => {
    try {
      const newStatus = await toggleCatalogItemStatus(id, currentStatus);
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý Danh mục (Catalog)
          </h1>
          <p className="text-sm text-slate-500">
            Quản lý tập trung Dịch vụ, Sản phẩm, Danh mục và Gói liệu trình Mee
            Beauty Spa
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div
          className={`flex items-center justify-between p-4 rounded-lg border ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-lg px-4 pt-2">
        <button
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
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
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
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
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
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
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "packages"
              ? "border-pink-600 text-pink-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <PackageIcon className="w-4 h-4" />
          Gói dịch vụ
        </button>
      </div>

      {/* TAB 1: DỊCH VỤ */}
      {activeTab === "services" && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc mã..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
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
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Ngưng hoạt động</option>
              </select>
            </div>
            <button
              onClick={() => {
                setEditingService(null);
                setIsServiceModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 shadow-sm w-full md:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              Thêm Dịch vụ
            </button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                  <th className="p-3">Mã</th>
                  <th className="p-3">Tên dịch vụ</th>
                  <th className="p-3">Danh mục</th>
                  <th className="p-3">Giá bán</th>
                  <th className="p-3">Thời lượng</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500">
                      Chưa có dịch vụ nào phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-xs font-bold text-slate-700">
                        {item.code}
                      </td>
                      <td className="p-3 font-medium text-slate-900">
                        {item.name}
                      </td>
                      <td className="p-3 text-slate-600">
                        {item.category ? (
                          <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                            {item.category}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3 font-semibold text-slate-900">
                        {formatVND(item.price)}
                      </td>
                      <td className="p-3 text-slate-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {item.duration_minutes || 0} phút
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() =>
                            handleToggleStatus(item.id, item.status)
                          }
                          className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
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
                          className="p-1 text-slate-500 hover:text-pink-600"
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
                          className="p-1 text-slate-500 hover:text-rose-600"
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

      {/* TAB 2: SẢN PHẨM */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm SKU hoặc tên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
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
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Ngưng hoạt động</option>
              </select>
            </div>
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 shadow-sm w-full md:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              Thêm Sản phẩm
            </button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                  <th className="p-3">SKU</th>
                  <th className="p-3">Tên sản phẩm</th>
                  <th className="p-3">Danh mục</th>
                  <th className="p-3">Giá vốn</th>
                  <th className="p-3">Giá bán</th>
                  <th className="p-3">Tồn kho</th>
                  <th className="p-3">Đơn vị</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-500">
                      Chưa có sản phẩm nào phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-xs font-bold text-slate-700">
                        {item.code}
                      </td>
                      <td className="p-3 font-medium text-slate-900">
                        {item.name}
                      </td>
                      <td className="p-3 text-slate-600">
                        {item.category ? (
                          <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                            {item.category}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3 text-slate-500">
                        {formatVND(item.cost_price || 0)}
                      </td>
                      <td className="p-3 font-semibold text-slate-900">
                        {formatVND(item.selling_price || item.price)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-semibold ${
                            (item.stock_quantity || 0) <=
                            (item.minimum_stock || 0)
                              ? "text-rose-600"
                              : "text-slate-800"
                          }`}
                        >
                          {item.stock_quantity || 0}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">
                        {item.unit || "cái"}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() =>
                            handleToggleStatus(item.id, item.status)
                          }
                          className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
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
                            setEditingProduct(item);
                            setIsProductModalOpen(true);
                          }}
                          className="p-1 text-slate-500 hover:text-pink-600"
                        >
                          <Edit2 className="w-4 h-4" />
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

      {/* TAB 3: DANH MỤC */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingCategory(null);
                setIsCategoryModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Thêm Danh mục
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nhóm Dịch vụ */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-pink-600" />
                  Danh mục Dịch vụ
                </h3>
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">
                  {categories.filter((c) => c.type === "service").length} mục
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {categories.filter((c) => c.type === "service").length === 0 ? (
                  <p className="text-sm text-slate-500 py-3 text-center">
                    Chưa có danh mục dịch vụ
                  </p>
                ) : (
                  categories
                    .filter((c) => c.type === "service")
                    .map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between py-2 hover:bg-slate-50 px-2 rounded"
                      >
                        <span className="text-sm font-medium text-slate-800">
                          {cat.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              cat.status === "active"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {cat.status === "active" ? "Hoạt động" : "Ẩn"}
                          </span>
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setIsCategoryModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-pink-600"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
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
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Nhóm Sản phẩm */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-pink-600" />
                  Danh mục Sản phẩm
                </h3>
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">
                  {categories.filter((c) => c.type === "product").length} mục
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {categories.filter((c) => c.type === "product").length === 0 ? (
                  <p className="text-sm text-slate-500 py-3 text-center">
                    Chưa có danh mục sản phẩm
                  </p>
                ) : (
                  categories
                    .filter((c) => c.type === "product")
                    .map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between py-2 hover:bg-slate-50 px-2 rounded"
                      >
                        <span className="text-sm font-medium text-slate-800">
                          {cat.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              cat.status === "active"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {cat.status === "active" ? "Hoạt động" : "Ẩn"}
                          </span>
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setIsCategoryModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-pink-600"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
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
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GÓI DỊCH VỤ */}
      {activeTab === "packages" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800">
              Danh sách Gói Dịch vụ / Liệu trình
            </h3>
            <button
              onClick={() => {
                setEditingPackage(null);
                setIsPackageModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tạo Gói Dịch vụ
            </button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                  <th className="p-3">Mã gói</th>
                  <th className="p-3">Tên gói</th>
                  <th className="p-3">Giá gói</th>
                  <th className="p-3">Hạn dùng (Ngày)</th>
                  <th className="p-3">Số dịch vụ</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {packages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500">
                      Chưa có gói dịch vụ nào
                    </td>
                  </tr>
                ) : (
                  packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-xs font-bold text-slate-700">
                        {pkg.code}
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-900">
                          {pkg.name}
                        </div>
                        {pkg.description && (
                          <div className="text-xs text-slate-500 truncate max-w-xs">
                            {pkg.description}
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-pink-600">
                        {formatVND(pkg.price)}
                      </td>
                      <td className="p-3 text-slate-600">
                        {pkg.validity_days || 0} ngày
                      </td>
                      <td className="p-3 text-slate-600 font-medium">
                        {pkg.package_items?.length || 0} mục
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() =>
                            handleTogglePkgStatus(pkg.id, pkg.is_active)
                          }
                          className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                            pkg.is_active
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {pkg.is_active ? "Kích hoạt" : "Tắt"}
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingPackage(pkg);
                            setIsPackageModalOpen(true);
                          }}
                          className="p-1 text-slate-500 hover:text-pink-600"
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
                          className="p-1 text-slate-500 hover:text-rose-600"
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

      {/* MODAL CỦA DỊCH VỤ */}
      {isServiceModalOpen && (
        <ServiceFormModal
          isOpen={isServiceModalOpen}
          onClose={() => setIsServiceModalOpen(false)}
          editingService={editingService}
          categories={categories}
          onSave={async (formData) => {
            try {
              if (editingService) {
                await updateService(editingService.id, formData);
                showToast("success", "Đã cập nhật dịch vụ");
              } else {
                await createService(formData);
                showToast("success", "Đã thêm dịch vụ thành công");
              }
              setIsServiceModalOpen(false);
              loadData();
            } catch (err: any) {
              showToast("error", err.message || "Lỗi lưu dịch vụ");
            }
          }}
        />
      )}

      {/* MODAL CỦA SẢN PHẨM */}
      {isProductModalOpen && (
        <ProductFormModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          editingProduct={editingProduct}
          categories={categories}
          onSave={async (formData) => {
            try {
              if (editingProduct) {
                await updateProduct(editingProduct.id, formData);
                showToast("success", "Đã cập nhật sản phẩm");
              } else {
                await createProduct(formData);
                showToast("success", "Đã thêm sản phẩm mới");
              }
              setIsProductModalOpen(false);
              loadData();
            } catch (err: any) {
              showToast("error", err.message || "Lỗi lưu sản phẩm");
            }
          }}
        />
      )}

      {/* MODAL DANH MỤC */}
      {isCategoryModalOpen && (
        <CategoryFormModal
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

      {/* MODAL GÓI DỊCH VỤ */}
      {isPackageModalOpen && (
        <PackageFormModal
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

      {/* MODAL XÁC NHẬN XÓA */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-lg text-slate-900">Xác nhận xóa</h3>
            <p className="text-sm text-slate-600">
              Bạn có chắc chắn muốn xóa "<strong>{confirmDelete.title}</strong>
              "? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700"
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

// ==================== COMPONENT MODAL SUB-FORMS ====================

// 1. Service Modal
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
    sales_commission_rate: editingService?.sales_commission_rate || 0,
    performance_commission_rate:
      editingService?.performance_commission_rate || 0,
  });

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-bold text-slate-900">
            {editingService ? "Sửa Dịch vụ" : "Thêm Dịch vụ Mới"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã dịch vụ *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Danh mục
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded text-sm bg-white"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên dịch vụ *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-2 border border-slate-300 rounded text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giá bán (VND) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                className="w-full p-2 border border-slate-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                className="w-full p-2 border border-slate-300 rounded text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hoa hồng Sales (%)
              </label>
              <input
                type="number"
                value={formData.sales_commission_rate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sales_commission_rate: Number(e.target.value),
                  })
                }
                className="w-full p-2 border border-slate-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hoa hồng KTV (%)
              </label>
              <input
                type="number"
                value={formData.performance_commission_rate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    performance_commission_rate: Number(e.target.value),
                  })
                }
                className="w-full p-2 border border-slate-300 rounded text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả dịch vụ
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-2 border border-slate-300 rounded text-sm"
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded text-sm font-medium text-slate-700"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-pink-600 text-white rounded text-sm font-medium hover:bg-pink-700"
          >
            Lưu Dịch vụ
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. Product Modal
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
  });

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-bold text-slate-900">
            {editingProduct ? "Sửa Sản phẩm" : "Thêm Sản phẩm Mới"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã SKU *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Danh mục
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded text-sm bg-white"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên sản phẩm *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-2 border border-slate-300 rounded text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                className="w-full p-2 border border-slate-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                className="w-full p-2 border border-slate-300 rounded text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số lượng kho
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
                className="w-full p-2 border border-slate-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cảnh báo tối thiểu
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
                className="w-full p-2 border border-slate-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Đơn vị tính
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả sản phẩm
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-2 border border-slate-300 rounded text-sm"
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded text-sm font-medium text-slate-700"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-pink-600 text-white rounded text-sm font-medium hover:bg-pink-700"
          >
            Lưu Sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
}

// 3. Category Modal
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

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-bold text-slate-900">
            {editingCategory ? "Sửa Danh mục" : "Thêm Danh mục Mới"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên danh mục *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-2 border border-slate-300 rounded text-sm"
              placeholder="VD: Chăm sóc da mặt, Mỹ phẩm..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
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
              className="w-full p-2 border border-slate-300 rounded text-sm bg-white"
            >
              <option value="service">Dịch vụ</option>
              <option value="product">Sản phẩm</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Trạng thái
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as any })
              }
              className="w-full p-2 border border-slate-300 rounded text-sm bg-white"
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Ẩn</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded text-sm font-medium text-slate-700"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-pink-600 text-white rounded text-sm font-medium hover:bg-pink-700"
          >
            Lưu Danh mục
          </button>
        </div>
      </div>
    </div>
  );
}

// 4. Package Modal
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
  });

  const [items, setItems] = useState<
    Array<{ service_id: string; quantity: number; price_override?: number }>
  >(
    editingPackage?.package_items?.map((it) => ({
      service_id: it.service_id,
      quantity: it.quantity,
      price_override: it.price_override || undefined,
    })) || [],
  );

  const addItemRow = () => {
    if (availableServices.length === 0) return;
    const firstService = availableServices[0];
    if (firstService.service_id) {
      setItems([
        ...items,
        { service_id: firstService.service_id, quantity: 1 },
      ]);
    }
  };

  const removeItemRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-bold text-slate-900">
            {editingPackage ? "Sửa Gói Dịch vụ" : "Thêm Gói Dịch vụ Mới"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã gói *
              </label>
              <input
                type="text"
                value={pkgData.code}
                onChange={(e) =>
                  setPkgData({ ...pkgData, code: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên gói dịch vụ *
              </label>
              <input
                type="text"
                value={pkgData.name}
                onChange={(e) =>
                  setPkgData({ ...pkgData, name: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giá bán trọn gói (VND) *
              </label>
              <input
                type="number"
                value={pkgData.price}
                onChange={(e) =>
                  setPkgData({ ...pkgData, price: Number(e.target.value) })
                }
                className="w-full p-2 border border-slate-300 rounded text-sm font-semibold text-pink-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hạn sử dụng (Số ngày)
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
                className="w-full p-2 border border-slate-300 rounded text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả gói
            </label>
            <textarea
              rows={2}
              value={pkgData.description}
              onChange={(e) =>
                setPkgData({ ...pkgData, description: e.target.value })
              }
              className="w-full p-2 border border-slate-300 rounded text-sm"
            ></textarea>
          </div>

          {/* Dịch vụ trong gói */}
          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Thành phần dịch vụ trong gói
              </h4>
              <button
                type="button"
                onClick={addItemRow}
                className="flex items-center gap-1 text-xs font-semibold text-pink-600 hover:text-pink-700"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm dịch vụ
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                Chưa thêm dịch vụ nào vào gói này
              </p>
            ) : (
              <div className="space-y-2">
                {items.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-slate-50 p-2 rounded border"
                  >
                    <select
                      value={it.service_id}
                      onChange={(e) => {
                        const next = [...items];
                        next[idx].service_id = e.target.value;
                        setItems(next);
                      }}
                      className="flex-1 p-1.5 border border-slate-300 rounded text-xs bg-white"
                    >
                      {availableServices.map((s) => (
                        <option key={s.service_id || s.id} value={s.service_id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Số buổi"
                      min={1}
                      value={it.quantity}
                      onChange={(e) => {
                        const next = [...items];
                        next[idx].quantity = Number(e.target.value);
                        setItems(next);
                      }}
                      className="w-20 p-1.5 border border-slate-300 rounded text-xs text-center"
                    />
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded text-sm font-medium text-slate-700"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave(pkgData, items)}
            className="px-4 py-2 bg-pink-600 text-white rounded text-sm font-medium hover:bg-pink-700"
          >
            Lưu Gói Dịch vụ
          </button>
        </div>
      </div>
    </div>
  );
}
