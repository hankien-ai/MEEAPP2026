// src/pages/catalog.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Trash2,
  Package as PackageIcon,
  ShoppingBag,
  Scissors,
  FolderTree,
  X,
  AlertCircle,
  CheckCircle2,
  Eye,
  ArrowDownCircle,
  ArrowUpCircle,
  Filter,
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

type ActiveTab = "services" | "products" | "packages" | "categories";

// ===== HÀM BỎ DẤU =====
function removeAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

// ===== MÀU CATEGORY =====
const CATEGORY_COLORS = [
  "bg-red-100 text-red-800 border-red-200",
  "bg-blue-100 text-blue-800 border-blue-200",
  "bg-green-100 text-green-800 border-green-200",
  "bg-yellow-100 text-yellow-800 border-yellow-200",
  "bg-purple-100 text-purple-800 border-purple-200",
  "bg-pink-100 text-pink-800 border-pink-200",
  "bg-indigo-100 text-indigo-800 border-indigo-200",
  "bg-teal-100 text-teal-800 border-teal-200",
  "bg-orange-100 text-orange-800 border-orange-200",
  "bg-cyan-100 text-cyan-800 border-cyan-200",
];

function getCategoryColor(name: string): string {
  if (!name) return CATEGORY_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
}

// ==========================================================
// FILTER BOTTOM SHEET
// ==========================================================
interface FilterState {
  category: string;
  status: string;
  productType: string;
  categoryType: string;
}

const FilterSheet: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  categories: Category[];
  activeTab: ActiveTab;
}> = ({ isOpen, onClose, filters, onApply, categories, activeTab }) => {
  const [local, setLocal] = useState<FilterState>(filters);
  useEffect(() => setLocal(filters), [filters, isOpen]);
  if (!isOpen) return null;

  const handleApply = () => { onApply(local); onClose(); };
  const handleReset = () => {
    const reset = { category: "", status: "", productType: "", categoryType: "" };
    setLocal(reset);
    onApply(reset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl p-5 pb-8 max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">Bộ lọc</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          {activeTab !== "categories" && categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục</label>
              <select
                value={local.category}
                onChange={(e) => setLocal({ ...local, category: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-white"
              >
                <option value="">Tất cả</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
            <select
              value={local.status}
              onChange={(e) => setLocal({ ...local, status: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-white"
            >
              <option value="">Tất cả</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Ngừng hoạt động</option>
            </select>
          </div>
          {activeTab === "products" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loại sản phẩm</label>
              <select
                value={local.productType}
                onChange={(e) => setLocal({ ...local, productType: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-white"
              >
                <option value="">Tất cả</option>
                <option value="RETAIL">Bán lẻ</option>
                <option value="CONSUMABLE">Vật tư tiêu hao</option>
              </select>
            </div>
          )}
          {activeTab === "categories" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loại danh mục</label>
              <select
                value={local.categoryType}
                onChange={(e) => setLocal({ ...local, categoryType: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-white"
              >
                <option value="">Tất cả</option>
                <option value="service">Dịch vụ</option>
                <option value="product">Sản phẩm</option>
              </select>
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
          <button onClick={handleReset} className="flex-1 py-3 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Xóa bộ lọc
          </button>
          <button onClick={handleApply} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================================
// QUICK INVENTORY MODAL
// ==========================================================
const QuickInventoryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  product: ProductItem | null;
  type: InventoryTransactionType;
  onSubmit: (quantity: number, note: string) => Promise<void>;
  isSubmitting: boolean;
}> = ({ isOpen, onClose, product, type, onSubmit, isSubmitting }) => {
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  useEffect(() => {
    if (isOpen) { setQty(1); setNote(""); }
  }, [isOpen]);
  if (!isOpen || !product) return null;

  const handleSubmit = () => {
    if (qty <= 0) return alert("Số lượng phải lớn hơn 0");
    if (type === "OUT" && qty > (product.stock_quantity || 0)) {
      return alert("Số lượng xuất vượt quá tồn kho hiện tại");
    }
    onSubmit(qty, note);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">{type === "IN" ? "Nhập kho" : "Xuất kho"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <div>
          <p className="text-sm text-slate-700">Sản phẩm: <strong>{product.name}</strong></p>
          <p className="text-xs text-slate-500 mt-1">Tồn hiện tại: {product.stock_quantity || 0} {product.unit || "cái"}</p>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700">Số lượng *</label>
          <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm" />
        </div>
        <div className="mt-3">
          <label className="block text-sm font-medium text-slate-700">Ghi chú</label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder={`Lý do ${type === "IN" ? "nhập" : "xuất"}...`} className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm" />
        </div>
        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700">Hủy</button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
            {isSubmitting ? "Đang xử lý..." : type === "IN" ? "Nhập" : "Xuất"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================================
// MAIN
// ==========================================================
export default function CatalogManagementPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("services");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>({ category: "", status: "", productType: "", categoryType: "" });
  const [showFilter, setShowFilter] = useState(false);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

  const [quickInv, setQuickInv] = useState<{ isOpen: boolean; product: ProductItem | null; type: InventoryTransactionType; submitting: boolean }>({ isOpen: false, product: null, type: "IN", submitting: false });
  const [productDetail, setProductDetail] = useState<{ isOpen: boolean; product: ProductItem | null; history: any[]; loadingHistory: boolean }>({ isOpen: false, product: null, history: [], loadingHistory: false });

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "services") {
        const [sData, cData] = await Promise.all([fetchServices(), fetchCategories("service")]);
        setServices(sData);
        setCategories(cData);
      } else if (activeTab === "products") {
        const [pData, cData] = await Promise.all([fetchProducts(), fetchCategories("product")]);
        setProducts(pData);
        setCategories(cData);
      } else if (activeTab === "packages") {
        const [pkgData, sData] = await Promise.all([fetchPackages(), fetchServices()]);
        setPackages(pkgData);
        setServices(sData);
        const cData = await fetchCategories("service");
        setCategories(cData);
      } else if (activeTab === "categories") {
        const cData = await fetchCategories();
        setCategories(cData);
      }
    } catch (err: any) {
      showToast("error", err.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    const { data } = await supabase.from("staff").select("id, full_name").eq("status", "ACTIVE");
    if (data) setStaffList(data);
  };

  useEffect(() => {
    loadData();
    loadStaff();
    setSearchTerm("");
    setFilters({ category: "", status: "", productType: "", categoryType: "" });
  }, [activeTab]);

  const formatVND = (amount: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);

  const matchSearch = (text: string, keyword: string): boolean => {
    if (!keyword) return true;
    const normalizedText = removeAccents(text).toLowerCase();
    const normalizedKeyword = removeAccents(keyword).toLowerCase();
    return normalizedText.includes(normalizedKeyword);
  };

  const filteredItems = useMemo(() => {
    if (activeTab === "categories") {
      return categories.filter((item) => {
        const matchSearchName = matchSearch(item.name, searchTerm);
        const matchStatus = !filters.status || item.status === filters.status.toLowerCase();
        const matchType = !filters.categoryType || item.type === filters.categoryType;
        return matchSearchName && matchStatus && matchType;
      });
    }
    const items = activeTab === "services" ? services : activeTab === "products" ? products : packages;
    return items.filter((item: any) => {
      const matchSearchName = matchSearch(item.name, searchTerm) || matchSearch(item.code || "", searchTerm);
      const matchCategory = !filters.category || item.category === filters.category;
      const matchStatus = !filters.status || (activeTab === "packages" ? (filters.status === "ACTIVE" ? item.is_active : !item.is_active) : item.status === filters.status);
      const matchProductType = !filters.productType || (activeTab === "products" && item.product_type === filters.productType);
      return matchSearchName && matchCategory && matchStatus && matchProductType;
    });
  }, [activeTab, services, products, packages, categories, searchTerm, filters]);

  const handleToggleStatus = async (id: string, type: "service" | "product" | "package" | "category") => {
    try {
      if (type === "package") {
        const pkg = packages.find(p => p.id === id);
        if (pkg) await togglePackageStatus(id, pkg.is_active);
      } else if (type === "category") {
        const cat = categories.find(c => c.id === id);
        if (cat) {
          const newStatus = cat.status === "active" ? "inactive" : "active";
          await updateCategory(id, { ...cat, status: newStatus });
        }
      } else {
        const item = type === "service" ? services.find(s => s.id === id) : products.find(p => p.id === id);
        if (item) await toggleCatalogItemStatus(id, item.status, type);
      }
      showToast("success", "Đã cập nhật trạng thái");
      loadData();
    } catch (err: any) {
      showToast("error", err.message || "Lỗi đổi trạng thái");
    }
  };

  const handleDelete = async (id: string, type: "service" | "product" | "package" | "category") => {
    if (!window.confirm("Bạn có chắc muốn xóa mục này? Thao tác không thể hoàn tác.")) return;
    try {
      if (type === "service") await deleteService(id);
      else if (type === "product") await deleteProduct(id);
      else if (type === "package") await deletePackage(id);
      else if (type === "category") {
        const cat = categories.find(c => c.id === id);
        if (cat) await deleteCategory(id, cat.name);
      }
      showToast("success", "Đã xóa thành công");
      loadData();
    } catch (err: any) {
      showToast("error", err.message || "Không thể xóa");
    }
  };

  const openQuickInventory = (product: ProductItem, type: InventoryTransactionType) => {
    setQuickInv({ isOpen: true, product, type, submitting: false });
  };
  const closeQuickInventory = () => setQuickInv({ isOpen: false, product: null, type: "IN", submitting: false });

  const handleQuickInventorySubmit = async (quantity: number, note: string) => {
    const { product, type } = quickInv;
    if (!product) return;
    setQuickInv(prev => ({ ...prev, submitting: true }));
    try {
      await processInventoryTransaction({
        product_id: product.product_id,
        type,
        quantity,
        note: note || `${type === "IN" ? "Nhập" : "Xuất"} kho: ${product.name}`,
      });
      setProducts(prev =>
        prev.map(p =>
          p.id === product.id
            ? { ...p, stock_quantity: (p.stock_quantity || 0) + (type === "IN" ? quantity : -quantity) }
            : p
        )
      );
      showToast("success", `${type === "IN" ? "Nhập" : "Xuất"} kho ${quantity} ${product.unit} thành công`);
      closeQuickInventory();
      loadData();
    } catch (err: any) {
      showToast("error", err.message || "Lỗi xử lý giao dịch kho");
    } finally {
      setQuickInv(prev => ({ ...prev, submitting: false }));
    }
  };

  const openProductDetail = async (product: ProductItem) => {
    if (!product || !product.product_id) {
      showToast("error", "Không tìm thấy ID sản phẩm để xem lịch sử");
      return;
    }
    setProductDetail({ isOpen: true, product, history: [], loadingHistory: true });
    try {
      const history = await fetchInventoryHistory(product.product_id);
      const historyWithStaff = history.map((item) => {
        const staff = staffList.find((s) => s.id === item.created_by);
        return { ...item, staff_name: staff?.full_name || "Hệ thống" };
      });
      setProductDetail(prev => ({ ...prev, history: historyWithStaff, loadingHistory: false }));
    } catch (err) {
      console.error("Lỗi tải lịch sử tồn kho:", err);
      showToast("error", "Không thể tải lịch sử tồn kho");
      setProductDetail(prev => ({ ...prev, loadingHistory: false }));
    }
  };
  const closeProductDetail = () => setProductDetail({ isOpen: false, product: null, history: [], loadingHistory: false });

  // ==========================================================
  // RENDER
  // ==========================================================
  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Danh mục</h1>
        <button
          onClick={() => {
            if (activeTab === "services") { setEditingService(null); setIsServiceModalOpen(true); }
            else if (activeTab === "products") { setEditingProduct(null); setIsProductModalOpen(true); }
            else if (activeTab === "packages") { setEditingPackage(null); setIsPackageModalOpen(true); }
            else if (activeTab === "categories") { setEditingCategory(null); setIsCategoryModalOpen(true); }
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 text-white rounded-lg text-sm font-semibold hover:bg-pink-700 shadow-sm active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" /> Tạo mới
        </button>
      </div>

      {notification && (
        <div className={`flex items-center justify-between p-3 rounded-xl border text-sm ${notification.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
          <div className="flex items-center gap-2">
            {notification.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex overflow-x-auto bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
        {[
          { key: "services", label: "Dịch vụ" },
          { key: "products", label: "Sản phẩm" },
          { key: "packages", label: "Gói dịch vụ" },
          { key: "categories", label: "Danh mục" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key as ActiveTab); setSearchTerm(""); setFilters({ category: "", status: "", productType: "", categoryType: "" }); }}
            className={`flex-1 py-2.5 px-3 text-sm font-semibold rounded-lg transition-all ${activeTab === tab.key ? "bg-pink-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Tìm ${activeTab === "services" ? "dịch vụ" : activeTab === "products" ? "sản phẩm" : activeTab === "packages" ? "gói" : "danh mục"}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <button
          onClick={() => setShowFilter(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-sm text-slate-700 transition-colors font-medium"
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Lọc</span>
          {(filters.category || filters.status || filters.productType || filters.categoryType) && <span className="w-2 h-2 bg-pink-500 rounded-full" />}
        </button>
      </div>

      <FilterSheet
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        filters={filters}
        onApply={(newFilters) => setFilters(newFilters)}
        categories={categories}
        activeTab={activeTab}
      />

      {loading ? (
        <div className="py-12 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full" /></div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200"><p className="text-slate-400">Không tìm thấy</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map((item: any) => {
            const isProduct = activeTab === "products";
            const isService = activeTab === "services";
            const isPackage = activeTab === "packages";
            const isCategory = activeTab === "categories";

            let categoryLabel = "";
            let price = 0;
            let displayName = item.name || "";
            let stockColor = "bg-emerald-500";
            let borderColor = "border-slate-200";
            let isRetail = false;
            let isConsumable = false;
            let categoryColorClass = "";
            let productTypeLabel = "";

            if (isService) {
              categoryLabel = item.category || "Chưa phân loại";
              price = item.price || 0;
              categoryColorClass = getCategoryColor(categoryLabel);
            } else if (isProduct) {
              categoryLabel = item.category || "Chưa phân loại";
              price = item.selling_price || item.price || 0;
              const stock = item.stock_quantity || 0;
              const min = item.minimum_stock || 0;
              if (stock <= 0) stockColor = "bg-red-500";
              else if (stock <= min) stockColor = "bg-amber-500";
              else stockColor = "bg-emerald-500";
              borderColor = item.product_type === "RETAIL" ? "border-indigo-300" : "border-amber-300";
              isRetail = item.product_type === "RETAIL";
              isConsumable = item.product_type === "CONSUMABLE";
              categoryColorClass = getCategoryColor(categoryLabel);
              productTypeLabel = isRetail ? "BÁN LẺ" : "VẬT TƯ";
            } else if (isPackage) {
              categoryLabel = "Gói";
              price = item.price || 0;
              categoryColorClass = getCategoryColor("Gói");
            } else if (isCategory) {
              categoryLabel = item.type === "service" ? "Dịch vụ" : "Sản phẩm";
              categoryColorClass = getCategoryColor(item.name);
            }

            const inventoryButtons = isProduct && (
              <div className="flex flex-wrap items-center gap-1 mt-1">
                <button
                  onClick={(e) => { e.stopPropagation(); openQuickInventory(item, "IN"); }}
                  className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100"
                >
                  <ArrowDownCircle className="w-3.5 h-3.5 inline mr-0.5" /> Nhập
                </button>
                {isConsumable && (
                  <button
                    onClick={(e) => { e.stopPropagation(); openQuickInventory(item, "OUT"); }}
                    className="text-xs px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded hover:bg-rose-100"
                  >
                    <ArrowUpCircle className="w-3.5 h-3.5 inline mr-0.5" /> Xuất
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); openProductDetail(item); }}
                  className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded hover:bg-slate-200"
                >
                  <Eye className="w-3.5 h-3.5 inline mr-0.5" /> Tồn
                </button>
              </div>
            );

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border-2 ${borderColor} p-3 shadow-sm hover:shadow-md transition-all relative group cursor-pointer`}
                onClick={() => {
                  if (isService) { setEditingService(item); setIsServiceModalOpen(true); }
                  else if (isProduct) { setEditingProduct(item); setIsProductModalOpen(true); }
                  else if (isPackage) { setEditingPackage(item); setIsPackageModalOpen(true); }
                  else if (isCategory) { setEditingCategory(item); setIsCategoryModalOpen(true); }
                }}
              >
                <div className="font-semibold text-slate-800 text-sm pr-8">{displayName}</div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryColorClass}`}>
                    {categoryLabel.toUpperCase()}
                  </span>
                  {isProduct && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isRetail ? "bg-indigo-100 text-indigo-800 border-indigo-200" : "bg-amber-100 text-amber-800 border-amber-200"}`}>
                      {productTypeLabel}
                    </span>
                  )}
                  {!isCategory && <span className="text-sm font-bold text-emerald-700">{formatVND(price)}</span>}
                  {isProduct && <span className={`w-2.5 h-2.5 rounded-full ${stockColor} inline-block`} title={stockColor === "bg-emerald-500" ? "Còn nhiều" : stockColor === "bg-amber-500" ? "Sắp hết" : "Hết hàng"} />}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Bạn có chắc muốn xóa "${displayName}"?`)) {
                        handleDelete(item.id, activeTab);
                      }
                    }}
                    className="text-slate-400 hover:text-red-600 transition-colors ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {inventoryButtons}
              </div>
            );
          })}
        </div>
      )}

      {/* ===== MODALS ===== */}
      {isServiceModalOpen && (
        <ServiceFormModal
          key={editingService?.id || "new-service"}
          isOpen={isServiceModalOpen}
          onClose={() => setIsServiceModalOpen(false)}
          editingService={editingService}
          categories={categories}
          onSave={async (formData) => {
            try {
              if (editingService) await updateService(editingService.id, formData);
              else await createService(formData);
              showToast("success", editingService ? "Đã cập nhật dịch vụ" : "Đã thêm dịch vụ mới");
              setIsServiceModalOpen(false);
              loadData();
            } catch (err: any) { showToast("error", err.message || "Lỗi lưu dịch vụ"); }
          }}
        />
      )}
      {isProductModalOpen && (
        <ProductFormModal
          key={editingProduct?.id || "new-product"}
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          editingProduct={editingProduct}
          categories={categories}
          onSave={async (formData) => {
            try {
              if (editingProduct) await updateProduct(editingProduct.id, formData);
              else await createProduct(formData);
              showToast("success", editingProduct ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm mới");
              setIsProductModalOpen(false);
              loadData();
            } catch (err: any) { showToast("error", err.message || "Lỗi lưu sản phẩm"); }
          }}
        />
      )}
      {isCategoryModalOpen && (
        <CategoryFormModal
          key={editingCategory?.id || "new-category"}
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          editingCategory={editingCategory}
          onSave={async (formData) => {
            try {
              if (editingCategory) await updateCategory(editingCategory.id, formData);
              else await createCategory(formData);
              showToast("success", editingCategory ? "Đã cập nhật danh mục" : "Đã thêm danh mục mới");
              setIsCategoryModalOpen(false);
              loadData();
            } catch (err: any) { showToast("error", err.message || "Lỗi lưu danh mục"); }
          }}
        />
      )}
      {isPackageModalOpen && (
        <PackageFormModal
          key={editingPackage?.id || "new-package"}
          isOpen={isPackageModalOpen}
          onClose={() => setIsPackageModalOpen(false)}
          editingPackage={editingPackage}
          availableServices={services}
          onSave={async (pkgData, items) => {
            try {
              if (editingPackage) await updatePackage(editingPackage.id, pkgData, items);
              else await createPackage(pkgData, items);
              showToast("success", editingPackage ? "Đã cập nhật gói" : "Đã thêm gói mới");
              setIsPackageModalOpen(false);
              loadData();
            } catch (err: any) { showToast("error", err.message || "Lỗi lưu gói"); }
          }}
        />
      )}

      <QuickInventoryModal
        isOpen={quickInv.isOpen}
        onClose={closeQuickInventory}
        product={quickInv.product}
        type={quickInv.type}
        onSubmit={handleQuickInventorySubmit}
        isSubmitting={quickInv.submitting}
      />

      {productDetail.isOpen && productDetail.product && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Chi tiết sản phẩm</h3>
              <button onClick={closeProductDetail} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-500">Tên</span><p className="font-semibold">{productDetail.product.name}</p></div>
              <div><span className="text-slate-500">Loại</span><Badge variant={productDetail.product.product_type === "RETAIL" ? "success" : "neutral"}>{productDetail.product.product_type === "RETAIL" ? "RETAIL" : "CONSUMABLE"}</Badge></div>
              <div><span className="text-slate-500">Giá bán</span><p className="font-semibold text-pink-600">{formatVND(productDetail.product.selling_price || productDetail.product.price || 0)}</p></div>
              <div><span className="text-slate-500">Đơn vị</span><p>{productDetail.product.unit || "cái"}</p></div>
              <div><span className="text-slate-500">Danh mục</span><p>{productDetail.product.category || "—"}</p></div>
              <div><span className="text-slate-500">Trạng thái</span><Badge variant={productDetail.product.status === "ACTIVE" ? "success" : "neutral"}>{productDetail.product.status}</Badge></div>
              <div className="col-span-2"><span className="text-slate-500">Mô tả</span><p className="text-slate-700 text-sm">{productDetail.product.description || "Chưa có mô tả"}</p></div>
            </div>
            <div className="border-t pt-3 mt-3">
              <h4 className="font-semibold text-slate-800">Tồn kho</h4>
              <div className="flex items-center gap-4 flex-wrap mt-1">
                <div><span className="text-slate-500">Tồn hiện tại</span><div className="text-2xl font-bold">{productDetail.product.stock_quantity || 0} <span className="text-sm font-normal text-slate-500">{productDetail.product.unit || "cái"}</span></div></div>
                <div><span className="text-slate-500">Cảnh báo</span><div className="text-lg font-semibold">{productDetail.product.minimum_stock || 0}</div></div>
                <div className="ml-auto">
                  <span className="text-slate-500">Trạng thái</span>
                  <div>
                    {(productDetail.product.stock_quantity || 0) === 0 ? <Badge variant="danger" className="text-sm">🔴 Hết hàng</Badge>
                    : (productDetail.product.stock_quantity || 0) <= (productDetail.product.minimum_stock || 0) ? <Badge variant="warning" className="text-sm">🟠 Sắp hết</Badge>
                    : <Badge variant="success" className="text-sm">🟢 Còn hàng</Badge>}
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t pt-3 mt-3">
              <h4 className="font-semibold text-slate-800">Lịch sử xuất nhập tồn</h4>
              {productDetail.loadingHistory ? <div className="text-center py-4 text-slate-500">Đang tải...</div>
              : productDetail.history.length === 0 ? <div className="text-center py-4 text-slate-400">Không có dữ liệu lịch sử hoặc bạn không có quyền xem.</div>
              : <div className="overflow-x-auto"><table className="w-full text-left text-xs border-collapse"><thead className="bg-slate-50"><tr><th className="p-2">Ngày</th><th className="p-2">Loại</th><th className="p-2 text-right">SL</th><th className="p-2 text-right">Tồn trước</th><th className="p-2 text-right">Tồn sau</th><th className="p-2">Ghi chú</th><th className="p-2">Người tạo</th></tr></thead><tbody className="divide-y divide-slate-100">{productDetail.history.map((tx) => (<tr key={tx.id}><td className="p-2 whitespace-nowrap">{new Date(tx.created_at).toLocaleString("vi-VN")}</td><td className="p-2"><Badge variant={tx.transaction_type === "IN" ? "success" : tx.transaction_type === "OUT" ? "danger" : "neutral"}>{tx.transaction_type === "IN" ? "+ Nhập" : tx.transaction_type === "OUT" ? "- Xuất" : "Điều chỉnh"}</Badge></td><td className="p-2 text-right font-medium">{tx.quantity}</td><td className="p-2 text-right text-slate-600">{tx.stock_before}</td><td className="p-2 text-right font-semibold">{tx.stock_after}</td><td className="p-2 text-slate-500 max-w-xs truncate">{tx.note || "—"}</td><td className="p-2 text-slate-500">{tx.staff_name || "Hệ thống"}</td></tr>))}</tbody></table></div>}
            </div>
            <div className="flex justify-end mt-4"><Button variant="outline" onClick={closeProductDetail}>Đóng</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================================
// MODAL FORMS
// ==========================================================
function ServiceFormModal({ isOpen, onClose, editingService, categories, onSave }) {
  const [formData, setFormData] = useState({
    code: editingService?.code || `DV${Math.floor(100 + Math.random() * 900)}`,
    name: editingService?.name || "",
    category: editingService?.category || "",
    description: editingService?.description || "",
    price: editingService?.price || 0,
    duration_minutes: editingService?.duration_minutes || 60,
    sales_commission_type: editingService?.sales_commission_type || "PERCENT",
    sales_commission_value: editingService?.sales_commission_value ?? editingService?.sales_commission_rate ?? 0,
    performance_commission_type: editingService?.performance_commission_type || "PERCENT",
    performance_commission_value: editingService?.performance_commission_value ?? editingService?.performance_commission_rate ?? 0,
    loyalty_points: editingService?.loyalty_points ?? 0,
  });
  const [validationError, setValidationError] = useState(null);

  const handleSubmit = () => {
    if (formData.sales_commission_type === "PERCENT" && (formData.sales_commission_value < 0 || formData.sales_commission_value > 100)) {
      setValidationError("Hoa hồng Sale (%) phải từ 0% đến 100%");
      return;
    }
    if (formData.performance_commission_type === "PERCENT" && (formData.performance_commission_value < 0 || formData.performance_commission_value > 100)) {
      setValidationError("Hoa hồng KTV (%) phải từ 0% đến 100%");
      return;
    }
    if (formData.sales_commission_value < 0 || formData.performance_commission_value < 0) {
      setValidationError("Giá trị hoa hồng không được là số âm");
      return;
    }
    setValidationError(null);
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">{editingService ? "Sửa Dịch vụ" : "Thêm Dịch vụ Mới"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        {validationError && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm mb-4 flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{validationError}</span></div>}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-slate-700">Mã *</label><input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg text-sm" required /></div>
            <div><label className="block text-sm font-medium text-slate-700">Danh mục</label><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"><option value="">-- Chọn --</option>{categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700">Tên *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg text-sm" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-slate-700">Giá (VNĐ) *</label><input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full p-2 border border-slate-300 rounded-lg text-sm" required /></div>
            <div><label className="block text-sm font-medium text-slate-700">Thời lượng (phút)</label><input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })} className="w-full p-2 border border-slate-300 rounded-lg text-sm" /></div>
          </div>
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-semibold text-slate-800 text-sm">Hoa hồng</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-lg"><label className="block text-xs font-medium text-slate-600">Sale</label><div className="flex gap-2 mt-1"><button type="button" onClick={() => setFormData({ ...formData, sales_commission_type: "PERCENT" })} className={`px-2 py-1 text-xs rounded ${formData.sales_commission_type === "PERCENT" ? "bg-pink-600 text-white" : "bg-white border border-slate-300"}`}>%</button><button type="button" onClick={() => setFormData({ ...formData, sales_commission_type: "FIXED" })} className={`px-2 py-1 text-xs rounded ${formData.sales_commission_type === "FIXED" ? "bg-pink-600 text-white" : "bg-white border border-slate-300"}`}>₫</button></div><input type="number" value={formData.sales_commission_value} onChange={(e) => setFormData({ ...formData, sales_commission_value: Number(e.target.value) })} className="w-full mt-1 p-1.5 border border-slate-300 rounded text-xs" /></div>
              <div className="bg-slate-50 p-3 rounded-lg"><label className="block text-xs font-medium text-slate-600">KTV</label><div className="flex gap-2 mt-1"><button type="button" onClick={() => setFormData({ ...formData, performance_commission_type: "PERCENT" })} className={`px-2 py-1 text-xs rounded ${formData.performance_commission_type === "PERCENT" ? "bg-pink-600 text-white" : "bg-white border border-slate-300"}`}>%</button><button type="button" onClick={() => setFormData({ ...formData, performance_commission_type: "FIXED" })} className={`px-2 py-1 text-xs rounded ${formData.performance_commission_type === "FIXED" ? "bg-pink-600 text-white" : "bg-white border border-slate-300"}`}>₫</button></div><input type="number" value={formData.performance_commission_value} onChange={(e) => setFormData({ ...formData, performance_commission_value: Number(e.target.value) })} className="w-full mt-1 p-1.5 border border-slate-300 rounded text-xs" /></div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Điểm Loyalty</label>
            <input
              type="number"
              min="0"
              value={formData.loyalty_points}
              onChange={(e) => setFormData({ ...formData, loyalty_points: Number(e.target.value) })}
              className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              placeholder="Số điểm cần để đổi (0 = không dùng)"
            />
            <p className="text-xs text-slate-400 mt-1">Áp dụng khi hệ thống ở chế độ POINTS</p>
          </div>
          <div><label className="block text-sm font-medium text-slate-700">Mô tả</label><textarea rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg text-sm" /></div>
          <div className="flex gap-3 pt-4 border-t">
            <button onClick={onClose} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700">Hủy</button>
            <button onClick={handleSubmit} className="flex-1 py-2.5 bg-pink-600 text-white rounded-lg text-sm font-semibold hover:bg-pink-700">Lưu</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductFormModal({ isOpen, onClose, editingProduct, categories, onSave }) {
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
    sales_commission_type: editingProduct?.sales_commission_type || "PERCENT",
    sales_commission_value: editingProduct?.sales_commission_value ?? 0,
    loyalty_points: editingProduct?.loyalty_points ?? 0,
  });
  const [validationError, setValidationError] = useState(null);

  const handleSubmit = () => {
    if (formData.sales_commission_type === "PERCENT" && (formData.sales_commission_value < 0 || formData.sales_commission_value > 100)) {
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">{editingProduct ? "Sửa Sản phẩm" : "Thêm Sản phẩm Mới"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        {validationError && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm mb-4 flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{validationError}</span></div>}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-slate-700">Mã SKU *</label><input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg text-sm" required /></div>
            <div><label className="block text-sm font-medium text-slate-700">Danh mục</label><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"><option value="">-- Chọn --</option>{categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700">Tên *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg text-sm" required /></div>
          <div><label className="block text-sm font-medium text-slate-700">Loại sản phẩm *</label><select value={formData.product_type} onChange={(e) => setFormData({ ...formData, product_type: e.target.value as "RETAIL" | "CONSUMABLE" })} className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"><option value="RETAIL">💰 Bán lẻ</option><option value="CONSUMABLE">📦 Vật tư tiêu hao</option></select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-slate-700">Giá vốn (VNĐ)</label><input type="number" value={formData.cost_price} onChange={(e) => setFormData({ ...formData, cost_price: Number(e.target.value) })} className="w-full p-2 border border-slate-300 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700">Giá bán (VNĐ) *</label><input type="number" value={formData.selling_price} onChange={(e) => setFormData({ ...formData, selling_price: Number(e.target.value) })} className="w-full p-2 border border-slate-300 rounded-lg text-sm" required /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700">Mô tả</label><textarea rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg text-sm" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm font-medium text-slate-700">Tồn kho</label><input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })} className="w-full p-2 border border-slate-300 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700">Cảnh báo</label><input type="number" value={formData.minimum_stock} onChange={(e) => setFormData({ ...formData, minimum_stock: Number(e.target.value) })} className="w-full p-2 border border-slate-300 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700">Đơn vị</label><input type="text" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg text-sm" /></div>
          </div>
          <div className="border-t pt-4">
            <h4 className="font-semibold text-slate-800 text-sm mb-2">Hoa hồng Sale</h4>
            <div className="flex gap-3">
              <div className="flex-1"><div className="flex gap-2"><button type="button" onClick={() => setFormData({ ...formData, sales_commission_type: "PERCENT" })} className={`px-2 py-1 text-xs rounded ${formData.sales_commission_type === "PERCENT" ? "bg-pink-600 text-white" : "bg-white border border-slate-300"}`}>%</button><button type="button" onClick={() => setFormData({ ...formData, sales_commission_type: "FIXED" })} className={`px-2 py-1 text-xs rounded ${formData.sales_commission_type === "FIXED" ? "bg-pink-600 text-white" : "bg-white border border-slate-300"}`}>₫</button></div></div>
              <div className="flex-2"><input type="number" value={formData.sales_commission_value} onChange={(e) => setFormData({ ...formData, sales_commission_value: Number(e.target.value) })} className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="Giá trị" /></div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Điểm Loyalty</label>
            <input
              type="number"
              min="0"
              value={formData.loyalty_points}
              onChange={(e) => setFormData({ ...formData, loyalty_points: Number(e.target.value) })}
              className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              placeholder="Số điểm cần để đổi (0 = không dùng)"
            />
            <p className="text-xs text-slate-400 mt-1">Áp dụng khi hệ thống ở chế độ POINTS</p>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button onClick={onClose} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700">Hủy</button>
            <button onClick={handleSubmit} className="flex-1 py-2.5 bg-pink-600 text-white rounded-lg text-sm font-semibold hover:bg-pink-700">Lưu</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryFormModal({ isOpen, onClose, editingCategory, onSave }) {
  const [formData, setFormData] = useState({
    name: editingCategory?.name || "",
    type: editingCategory?.type || "service",
    status: editingCategory?.status || "active",
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">{editingCategory ? "Sửa Danh mục" : "Thêm Danh mục Mới"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700">Tên danh mục *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg text-sm" required /></div>
          <div><label className="block text-sm font-medium text-slate-700">Loại</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as CategoryType })} className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"><option value="service">Dịch vụ</option><option value="product">Sản phẩm</option></select></div>
          <div className="flex gap-3 pt-4 border-t">
            <button onClick={onClose} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700">Hủy</button>
            <button onClick={() => onSave(formData)} className="flex-1 py-2.5 bg-pink-600 text-white rounded-lg text-sm font-semibold hover:bg-pink-700">Lưu</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PackageFormModal({ isOpen, onClose, editingPackage, availableServices, onSave }) {
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
  const [serviceItems, setServiceItems] = useState<Array<{ service_id: string; quantity: number; price_override?: number }>>(
    editingPackage?.package_items?.filter(item => item.item_type !== "PRODUCT")?.map(it => ({
      service_id: it.service_id || "",
      quantity: it.quantity,
      price_override: it.price_override || undefined,
    })) || []
  );
  const [productItems, setProductItems] = useState<Array<{ product_id: string; quantity: number; price_override?: number }>>(
    editingPackage?.package_items?.filter(item => item.item_type === "PRODUCT")?.map(it => ({
      product_id: it.product_id || "",
      quantity: it.quantity,
      price_override: it.price_override || undefined,
    })) || []
  );
  const [availableProducts, setAvailableProducts] = useState<ProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (isOpen) loadAvailableProducts();
  }, [isOpen]);

  const loadAvailableProducts = async () => {
    setLoadingProducts(true);
    try {
      const products = await fetchProducts();
      setAvailableProducts(products.filter(p => p.status === "ACTIVE"));
    } catch (err) { console.error(err); } finally { setLoadingProducts(false); }
  };

  const addServiceRow = () => {
    if (availableServices.length === 0) return;
    const validService = availableServices[0];
    if (validService) {
      setServiceItems([...serviceItems, { service_id: validService.service_id || validService.id, quantity: 1 }]);
    }
  };
  const removeServiceRow = (index) => setServiceItems(serviceItems.filter((_, i) => i !== index));
  const addProductRow = () => {
    if (availableProducts.length === 0) { alert("Không có sản phẩm nào để thêm. Vui lòng tạo sản phẩm trước."); return; }
    const first = availableProducts[0];
    setProductItems([...productItems, { product_id: first.id, quantity: 1 }]);
  };
  const removeProductRow = (index) => setProductItems(productItems.filter((_, i) => i !== index));
  const handleProductQuantityChange = (index, qty) => {
    const updated = [...productItems];
    updated[index].quantity = Math.max(1, qty);
    setProductItems(updated);
  };
  const handleSubmit = () => {
    const allItems = [
      ...serviceItems.map(item => ({ ...item, product_id: undefined, item_type: "SERVICE" as const })),
      ...productItems.map(item => ({ ...item, service_id: undefined, item_type: "PRODUCT" as const })),
    ];
    if (allItems.length === 0) { alert("Vui lòng thêm ít nhất 1 dịch vụ hoặc sản phẩm vào gói."); return; }
    onSave(pkgData, allItems);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">{editingPackage ? "Sửa Gói Dịch vụ" : "Tạo Gói Dịch vụ Mới"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-slate-700">Mã gói *</label><input type="text" value={pkgData.code} onChange={(e) => setPkgData({ ...pkgData, code: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg text-sm" required /></div>
            <div><label className="block text-sm font-medium text-slate-700">Tên gói *</label><input type="text" value={pkgData.name} onChange={(e) => setPkgData({ ...pkgData, name: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg text-sm" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-slate-700">Giá (VNĐ) *</label><input type="number" value={pkgData.price} onChange={(e) => setPkgData({ ...pkgData, price: Number(e.target.value) })} className="w-full p-2 border border-slate-300 rounded-lg text-sm" required /></div>
            <div><label className="block text-sm font-medium text-slate-700">Hạn sử dụng (ngày)</label><input type="number" value={pkgData.validity_days} onChange={(e) => setPkgData({ ...pkgData, validity_days: Number(e.target.value) })} className="w-full p-2 border border-slate-300 rounded-lg text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700">Hoa hồng Sale</label><div className="flex gap-2"><select value={pkgData.sales_commission_type} onChange={(e) => setPkgData({ ...pkgData, sales_commission_type: e.target.value as CommissionType })} className="w-20 p-2 border border-slate-300 rounded-lg text-sm bg-white"><option value="PERCENT">%</option><option value="FIXED">₫</option></select><input type="number" min="0" value={pkgData.sales_commission_value} onChange={(e) => setPkgData({ ...pkgData, sales_commission_value: Number(e.target.value) })} className="flex-1 p-2 border border-slate-300 rounded-lg text-sm" /></div></div>
          <div><label className="block text-sm font-medium text-slate-700">Mô tả</label><textarea rows={2} value={pkgData.description} onChange={(e) => setPkgData({ ...pkgData, description: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg text-sm" /></div>
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2"><h4 className="font-semibold text-slate-800 text-sm">Dịch vụ trong gói</h4><button type="button" onClick={addServiceRow} className="text-xs text-pink-600 font-semibold flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Thêm</button></div>
            {serviceItems.length === 0 ? <div className="text-sm text-slate-400 italic">Chưa có dịch vụ</div> : serviceItems.map((it, idx) => (<div key={idx} className="flex items-center gap-2 mt-2 bg-slate-50 p-2 rounded-lg"><select value={it.service_id} onChange={(e) => { const next = [...serviceItems]; next[idx].service_id = e.target.value; setServiceItems(next); }} className="flex-1 p-1.5 border border-slate-300 rounded text-xs bg-white">{availableServices.map((s) => <option key={s.id} value={s.service_id || s.id}>{s.name} ({s.code})</option>)}</select><input type="number" min={1} value={it.quantity} onChange={(e) => { const next = [...serviceItems]; next[idx].quantity = Number(e.target.value); setServiceItems(next); }} className="w-12 p-1.5 border border-slate-300 rounded text-xs text-center" /><button type="button" onClick={() => removeServiceRow(idx)} className="text-rose-500 hover:text-rose-700"><Trash2 className="w-3.5 h-3.5" /></button></div>))}
          </div>
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2"><h4 className="font-semibold text-slate-800 text-sm">Sản phẩm trong gói</h4><button type="button" onClick={addProductRow} className="text-xs text-pink-600 font-semibold flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Thêm</button></div>
            {loadingProducts ? <div className="text-sm text-slate-400">Đang tải sản phẩm...</div> : productItems.length === 0 ? <div className="text-sm text-slate-400 italic">Chưa có sản phẩm</div> : productItems.map((it, idx) => (<div key={idx} className="flex items-center gap-2 mt-2 bg-slate-50 p-2 rounded-lg"><select value={it.product_id} onChange={(e) => { const next = [...productItems]; next[idx].product_id = e.target.value; setProductItems(next); }} className="flex-1 p-1.5 border border-slate-300 rounded text-xs bg-white">{availableProducts.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}</select><input type="number" min={1} value={it.quantity} onChange={(e) => handleProductQuantityChange(idx, Number(e.target.value))} className="w-12 p-1.5 border border-slate-300 rounded text-xs text-center" /><button type="button" onClick={() => removeProductRow(idx)} className="text-rose-500 hover:text-rose-700"><Trash2 className="w-3.5 h-3.5" /></button></div>))}
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button onClick={onClose} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700">Hủy</button>
            <button onClick={handleSubmit} className="flex-1 py-2.5 bg-pink-600 text-white rounded-lg text-sm font-semibold hover:bg-pink-700">Lưu</button>
          </div>
        </div>
      </div>
    </div>
  );
}