// src/pages/catalog.tsx
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

type ActiveTab = "services" | "products" | "categories" | "packages";

// ==========================================================
// FILTER BOTTOM SHEET
// ==========================================================
interface FilterState {
  category: string;
  status: string;
  productType: string;
}

const FilterSheet: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  categories: Category[];
  activeTab: ActiveTab;
}> = ({ isOpen, onClose, filters, onApply, categories, activeTab }) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const reset = { category: "", status: "", productType: "" };
    setLocalFilters(reset);
    onApply(reset);
    onClose();
  };

  const showCategoryFilter = activeTab !== "categories";

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl p-5 pb-8 max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">Bộ lọc</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {showCategoryFilter && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục</label>
              <select
                value={localFilters.category}
                onChange={(e) => setLocalFilters({ ...localFilters, category: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-white"
              >
                <option value="">Tất cả</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
            <select
              value={localFilters.status}
              onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
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
                value={localFilters.productType}
                onChange={(e) => setLocalFilters({ ...localFilters, productType: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-white"
              >
                <option value="">Tất cả</option>
                <option value="RETAIL">Bán lẻ</option>
                <option value="CONSUMABLE">Vật tư tiêu hao</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
          <button
            onClick={handleReset}
            className="flex-1 py-3 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Xóa bộ lọc
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================================
// DETAIL MODAL
// ==========================================================
const DetailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  item: any;
  type: "service" | "product" | "package" | "category";
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onInventoryAction?: (type: "IN" | "OUT") => void;
}> = ({
  isOpen,
  onClose,
  item,
  type,
  onEdit,
  onDelete,
  onToggleStatus,
  onInventoryAction,
}) => {
  if (!isOpen || !item) return null;

  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val || 0);

  const isActive = type === "package" ? item.is_active : item.status === "ACTIVE" || item.status === "active";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={isActive ? "success" : "neutral"} className="text-xs">
                {isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
              </Badge>
              {type === "category" && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {item.type === "service" ? "Dịch vụ" : "Sản phẩm"}
                </span>
              )}
              {item.category && type !== "category" && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {item.category}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-2">{item.name}</h2>
            {type !== "category" && (
              <p className="text-lg font-semibold text-emerald-700">{formatVND(item.price || item.selling_price)}</p>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-sm border-t border-slate-100 pt-4">
          {/* Service fields */}
          {type === "service" && (
            <>
              <div className="flex justify-between">
                <span className="text-slate-500">Mã dịch vụ</span>
                <span className="font-medium">{item.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời lượng</span>
                <span className="font-medium">{item.duration_minutes || 0} phút</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hoa hồng Sale</span>
                <span className="font-medium">
                  {item.sales_commission_type === "PERCENT"
                    ? `${item.sales_commission_value || 0}%`
                    : formatVND(item.sales_commission_value || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hoa hồng KTV</span>
                <span className="font-medium">
                  {item.performance_commission_type === "PERCENT"
                    ? `${item.performance_commission_value || 0}%`
                    : formatVND(item.performance_commission_value || 0)}
                </span>
              </div>
              {item.description && (
                <div>
                  <span className="text-slate-500 block">Mô tả</span>
                  <p className="text-slate-700 mt-1">{item.description}</p>
                </div>
              )}
            </>
          )}

          {/* Product fields */}
          {type === "product" && (
            <>
              <div className="flex justify-between">
                <span className="text-slate-500">Mã SKU</span>
                <span className="font-medium">{item.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Loại</span>
                <span className="font-medium">{item.product_type === "RETAIL" ? "Bán lẻ" : "Vật tư tiêu hao"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tồn kho</span>
                <span className="font-medium">{item.stock_quantity || 0} {item.unit || "cái"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cảnh báo tối thiểu</span>
                <span className="font-medium">{item.minimum_stock || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Giá vốn</span>
                <span className="font-medium">{formatVND(item.cost_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hoa hồng Sale</span>
                <span className="font-medium">
                  {item.sales_commission_type === "PERCENT"
                    ? `${item.sales_commission_value || 0}%`
                    : formatVND(item.sales_commission_value || 0)}
                </span>
              </div>
              {item.description && (
                <div>
                  <span className="text-slate-500 block">Mô tả</span>
                  <p className="text-slate-700 mt-1">{item.description}</p>
                </div>
              )}
            </>
          )}

          {/* Package fields */}
          {type === "package" && (
            <>
              <div className="flex justify-between">
                <span className="text-slate-500">Mã gói</span>
                <span className="font-medium">{item.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hạn sử dụng</span>
                <span className="font-medium">{item.validity_days || 0} ngày</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hoa hồng Sale</span>
                <span className="font-medium">
                  {item.sales_commission_type === "PERCENT"
                    ? `${item.sales_commission_value || 0}%`
                    : formatVND(item.sales_commission_value || 0)}
                </span>
              </div>
              {item.description && (
                <div>
                  <span className="text-slate-500 block">Mô tả</span>
                  <p className="text-slate-700 mt-1">{item.description}</p>
                </div>
              )}
              {item.package_items && item.package_items.length > 0 && (
                <div>
                  <span className="text-slate-500 block">Thành phần</span>
                  <div className="mt-1 space-y-1">
                    {item.package_items.map((pi: any, idx: number) => (
                      <div key={idx} className="text-sm text-slate-600">
                        • {pi.service_name || pi.product_name || "Dịch vụ"} x{pi.quantity}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Category fields */}
          {type === "category" && (
            <>
              <div className="flex justify-between">
                <span className="text-slate-500">Loại</span>
                <span className="font-medium">{item.type === "service" ? "Dịch vụ" : "Sản phẩm"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trạng thái</span>
                <span className="font-medium">{item.status === "active" ? "Hoạt động" : "Ngừng hoạt động"}</span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-200">
          <Button size="sm" variant="secondary" onClick={onEdit} className="flex-1">
            <Edit2 className="w-4 h-4 mr-1" /> Sửa
          </Button>
          <Button
            size="sm"
            variant={isActive ? "outline" : "secondary"}
            onClick={onToggleStatus}
            className="flex-1"
          >
            {isActive ? "Tạm ngưng" : "Kích hoạt"}
          </Button>

          {type === "product" && onInventoryAction && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onInventoryAction("IN")}
                className="flex-1 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              >
                <ArrowDownCircle className="w-4 h-4 mr-1" /> Nhập kho
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onInventoryAction("OUT")}
                className="flex-1 bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
              >
                <ArrowUpCircle className="w-4 h-4 mr-1" /> Xuất kho
              </Button>
            </>
          )}

          <Button size="sm" variant="danger" onClick={onDelete} className="flex-1">
            <Trash2 className="w-4 h-4 mr-1" /> Xóa
          </Button>
        </div>
      </div>
    </div>
  );
};

// ==========================================================
// MAIN CATALOG PAGE
// ==========================================================
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

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    status: "",
    productType: "",
  });
  const [showFilter, setShowFilter] = useState(false);

  // Modal state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

  // Detail modal
  const [detailItem, setDetailItem] = useState<any>(null);
  const [detailType, setDetailType] = useState<"service" | "product" | "package" | "category">("service");
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Quick inventory modal
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

  // Product Export Modal
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
        const cData = await fetchCategories("service");
        setCategories(cData);
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
    setFilters({ category: "", status: "", productType: "" });
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

  // Lọc dữ liệu
  const filteredItems = useMemo(() => {
    if (activeTab === "categories") {
      return categories.filter((item) => {
        const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = !filters.status || item.status === filters.status.toLowerCase();
        return matchSearch && matchStatus;
      });
    }

    const items = activeTab === "services" ? services : activeTab === "products" ? products : packages;
    return items.filter((item: any) => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.code || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = !filters.category || item.category === filters.category;
      const matchStatus =
        !filters.status ||
        (activeTab === "packages"
          ? (filters.status === "ACTIVE" ? item.is_active : !item.is_active)
          : item.status === filters.status);
      const matchProductType =
        !filters.productType ||
        (activeTab === "products" && item.product_type === filters.productType);
      return matchSearch && matchCategory && matchStatus && matchProductType;
    });
  }, [activeTab, services, products, packages, categories, searchTerm, filters]);

  const handleToggleStatus = async (
    id: string,
    currentStatus: CatalogStatus,
    type: "service" | "product" = "service",
  ) => {
    try {
      await toggleCatalogItemStatus(id, currentStatus, type);
      showToast("success", `Đã cập nhật trạng thái`);
      loadData();
      setIsDetailOpen(false);
    } catch (err: any) {
      showToast("error", err.message || "Lỗi đổi trạng thái");
    }
  };

  const handleTogglePkgStatus = async (id: string, currentIsActive: boolean) => {
    try {
      await togglePackageStatus(id, currentIsActive);
      showToast("success", "Đã cập nhật trạng thái gói");
      loadData();
      setIsDetailOpen(false);
    } catch (err: any) {
      showToast("error", err.message || "Lỗi đổi trạng thái gói");
    }
  };

  const handleToggleCategoryStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const cat = categories.find(c => c.id === id);
      if (cat) {
        await updateCategory(id, { ...cat, status: newStatus });
        showToast("success", `Đã cập nhật trạng thái danh mục`);
        loadData();
        setIsDetailOpen(false);
      }
    } catch (err: any) {
      showToast("error", err.message || "Lỗi đổi trạng thái danh mục");
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
      setIsDetailOpen(false);
    } catch (err: any) {
      showToast("error", err.message || "Không thể xóa");
    }
  };

  const openDetail = (item: any, type: "service" | "product" | "package" | "category") => {
    setDetailItem(item);
    setDetailType(type);
    setIsDetailOpen(true);
  };

  // ===== INVENTORY =====
  const openQuickInventory = (product: ProductItem, type: InventoryTransactionType) => {
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
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? {
                ...p,
                stock_quantity:
                  (p.stock_quantity || 0) + (type === "IN" ? quantity : -quantity),
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
      setIsDetailOpen(false);
    } catch (err: any) {
      showToast("error", err.message || "Lỗi xử lý giao dịch kho");
    } finally {
      setQuickInventory((prev) => ({ ...prev, submitting: false }));
    }
  };

  // ===== PRODUCT EXPORT =====
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
      loadData();
      setIsDetailOpen(false);
    } catch (err: any) {
      showToast("error", err.message || "Lỗi xuất kho");
    } finally {
      setExportModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================
  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Danh mục</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Quản lý dịch vụ, sản phẩm, danh mục & gói liệu trình
          </p>
        </div>
        <button
          onClick={() => {
            if (activeTab === "services") {
              setEditingService(null);
              setIsServiceModalOpen(true);
            } else if (activeTab === "products") {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            } else if (activeTab === "categories") {
              setEditingCategory(null);
              setIsCategoryModalOpen(true);
            } else if (activeTab === "packages") {
              setEditingPackage(null);
              setIsPackageModalOpen(true);
            }
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-pink-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-pink-700 shadow-sm active:scale-[0.98] transition-transform"
        >
          <Plus className="w-4 h-4" /> Thêm mới
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
          onClick={() => {
            setActiveTab("services");
            setSearchTerm("");
            setFilters({ category: "", status: "", productType: "" });
          }}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "services"
              ? "border-pink-600 text-pink-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Scissors className="w-4 h-4" /> Dịch vụ
        </button>
        <button
          onClick={() => {
            setActiveTab("products");
            setSearchTerm("");
            setFilters({ category: "", status: "", productType: "" });
          }}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "products"
              ? "border-pink-600 text-pink-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Sản phẩm
        </button>
        <button
          onClick={() => {
            setActiveTab("categories");
            setSearchTerm("");
            setFilters({ category: "", status: "", productType: "" });
          }}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "categories"
              ? "border-pink-600 text-pink-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <FolderTree className="w-4 h-4" /> Danh mục
        </button>
        <button
          onClick={() => {
            setActiveTab("packages");
            setSearchTerm("");
            setFilters({ category: "", status: "", productType: "" });
          }}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "packages"
              ? "border-pink-600 text-pink-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <PackageIcon className="w-4 h-4" /> Gói dịch vụ
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Tìm ${activeTab === "services" ? "dịch vụ" : activeTab === "products" ? "sản phẩm" : activeTab === "categories" ? "danh mục" : "gói"}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <button
          onClick={() => setShowFilter(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-700 transition-colors font-medium"
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Lọc</span>
          {(filters.category || filters.status || filters.productType) && (
            <span className="w-2 h-2 bg-pink-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Filter Sheet */}
      <FilterSheet
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        filters={filters}
        onApply={(newFilters) => setFilters(newFilters)}
        categories={categories}
        activeTab={activeTab}
      />

      {/* List - Card layout với nút thao tác trên card */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
          <p className="text-slate-400">Không tìm thấy</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map((item: any) => {
            let isActive = false;
            let displayName = item.name || "";
            let price = 0;
            let categoryLabel = "";
            let extraInfo = null;
            let isProduct = activeTab === "products";

            if (activeTab === "services") {
              isActive = item.status === "ACTIVE";
              price = item.price || 0;
              categoryLabel = item.category || "Chưa phân loại";
            } else if (activeTab === "products") {
              isActive = item.status === "ACTIVE";
              price = item.selling_price || item.price || 0;
              categoryLabel = item.category || "Chưa phân loại";
              extraInfo = `Tồn: ${item.stock_quantity || 0} ${item.unit || "cái"}`;
            } else if (activeTab === "packages") {
              isActive = item.is_active;
              price = item.price || 0;
              categoryLabel = "Gói dịch vụ";
            } else if (activeTab === "categories") {
              isActive = item.status === "active";
              categoryLabel = item.type === "service" ? "Dịch vụ" : "Sản phẩm";
            }

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => openDetail(item, activeTab)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {categoryLabel.toUpperCase()}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-800 mt-1.5 truncate">{displayName}</h3>
                    {activeTab !== "categories" && (
                      <p className="text-sm font-bold text-emerald-700 mt-0.5">{formatVND(price)}</p>
                    )}
                    {extraInfo && (
                      <p className="text-xs text-slate-400 mt-0.5">{extraInfo}</p>
                    )}
                  </div>
                  <Badge variant={isActive ? "success" : "neutral"} className="shrink-0 text-[10px]">
                    {isActive ? "Hoạt động" : "Ngừng"}
                  </Badge>
                </div>

                {/* Nút thao tác nhanh trên card */}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                  {isProduct && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openQuickInventory(item, "IN");
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100"
                      >
                        <ArrowDownCircle className="w-3.5 h-3.5" /> Nhập
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openQuickInventory(item, "OUT");
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100"
                      >
                        <ArrowUpCircle className="w-3.5 h-3.5" /> Xuất
                      </button>
                    </>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id, activeTab);
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-100 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== DETAIL MODAL ===== */}
      <DetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        item={detailItem}
        type={detailType}
        onEdit={() => {
          setIsDetailOpen(false);
          if (detailType === "service") {
            setEditingService(detailItem);
            setIsServiceModalOpen(true);
          } else if (detailType === "product") {
            setEditingProduct(detailItem);
            setIsProductModalOpen(true);
          } else if (detailType === "category") {
            setEditingCategory(detailItem);
            setIsCategoryModalOpen(true);
          } else if (detailType === "package") {
            setEditingPackage(detailItem);
            setIsPackageModalOpen(true);
          }
        }}
        onDelete={() => {
          if (detailItem) {
            handleDelete(detailItem.id, detailType);
          }
        }}
        onToggleStatus={() => {
          if (!detailItem) return;
          if (detailType === "package") {
            handleTogglePkgStatus(detailItem.id, detailItem.is_active);
          } else if (detailType === "category") {
            handleToggleCategoryStatus(detailItem.id, detailItem.status);
          } else {
            handleToggleStatus(detailItem.id, detailItem.status, detailType);
          }
        }}
        onInventoryAction={detailType === "product" ? (type) => {
          if (detailItem) {
            openQuickInventory(detailItem, type);
          }
        } : undefined}
      />

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

      {/* ===== EXPORT MODAL (CONSUMABLE) ===== */}
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

      {/* ===== MODAL FORMS ===== */}
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
    </div>
  );
}

// ==========================================
// SERVICE FORM MODAL (giữ nguyên)
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
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
    setLoading(true);
    try {
      await onSave(formData);
    } catch (err) {
      // handled by parent
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 shadow-md active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Lưu Dịch vụ"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// PRODUCT FORM MODAL (giữ nguyên)
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
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
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 shadow-md active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Lưu Sản phẩm"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CATEGORY FORM MODAL (giữ nguyên)
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

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
            disabled={loading}
            className="flex-1 sm:flex-none px-4 py-2 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// PACKAGE FORM MODAL (giữ nguyên)
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
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async () => {
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

    setLoading(true);
    try {
      await onSave(pkgData, allItems);
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Lưu Gói"}
          </button>
        </div>
      </div>
    </div>
  );
}