import React, { useState, useEffect } from "react";
import { catalogService } from "../services/catalogService";
import {
  ServiceItem,
  ProductItem,
  ServicePackage,
  Category,
  TenantContext,
  CatalogType,
} from "../types/catalog";
import { PackageModal } from "./PackageModal";
import { CategoryManagerModal } from "./CategoryManagerModal";

interface CatalogModuleProps {
  tenant: TenantContext;
}

type TabType =
  | "services"
  | "products"
  | "service_packages"
  | "product_packages";

export const CatalogModule: React.FC<CatalogModuleProps> = ({ tenant }) => {
  const [activeTab, setActiveTab] = useState<TabType>("services");

  // States
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(
    null,
  );

  // Service/Product Modal toggle
  const [editingService, setEditingService] = useState<ServiceItem | null>(
    null,
  );
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(
    null,
  );
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  // Re-fetch data on tenant or tab change
  useEffect(() => {
    loadTabContent();
    loadCategoriesForFilter();
  }, [
    tenant.organizationId,
    tenant.branchId,
    activeTab,
    search,
    selectedCategory,
    selectedStatus,
  ]);

  const loadCategoriesForFilter = async () => {
    try {
      const type: CatalogType = activeTab.includes("product")
        ? "product"
        : "service";
      const cats = await catalogService.getCategories(tenant, type);
      setCategories(cats);
    } catch {
      // Non-critical
    }
  };

  const loadTabContent = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (activeTab === "services") {
        const res = await catalogService.getServices(tenant, {
          search,
          categoryId: selectedCategory,
          status: selectedStatus,
        });
        setServices(res);
      } else if (activeTab === "products") {
        const res = await catalogService.getProducts(tenant, {
          search,
          categoryId: selectedCategory,
          status: selectedStatus,
        });
        setProducts(res);
      } else if (activeTab === "service_packages") {
        const res = await catalogService.getPackages(tenant, "service", {
          search,
          status: selectedStatus,
        });
        setPackages(res);
      } else if (activeTab === "product_packages") {
        const res = await catalogService.getPackages(tenant, "product", {
          search,
          status: selectedStatus,
        });
        setPackages(res);
      }
    } catch (err: any) {
      setErrorMsg("Không thể tải dữ liệu. Vui lòng kiểm tra kết nối Supabase.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa mục này? Thao tác không thể hoàn tác.",
      )
    )
      return;
    try {
      if (activeTab === "services")
        await catalogService.deleteService(tenant, id);
      else if (activeTab === "products")
        await catalogService.deleteProduct(tenant, id);
      else await catalogService.deletePackage(tenant, id);

      loadTabContent();
    } catch (err: any) {
      alert(err.message || "Xóa thất bại.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            DANH MỤC POS
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Quản lý Dịch vụ, Sản phẩm và Gói áp dụng cho Chi nhánh hiện tại
          </p>
        </div>

        <div className="flex gap-2">
          {(activeTab === "services" || activeTab === "products") && (
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded shadow-sm hover:bg-gray-50"
            >
              Quản lý Danh mục
            </button>
          )}

          <button
            onClick={() => {
              if (activeTab.includes("package")) {
                setEditingPackage(null);
                setIsPackageModalOpen(true);
              } else {
                setEditingService(null);
                setEditingProduct(null);
                setIsItemModalOpen(true);
              }
            }}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded shadow-sm hover:bg-emerald-700 flex items-center gap-1"
          >
            + Thêm mới
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t shadow-sm px-2">
        {[
          { key: "services", label: "Dịch vụ" },
          { key: "products", label: "Sản phẩm" },
          { key: "service_packages", label: "Gói dịch vụ" },
          { key: "product_packages", label: "Gói sản phẩm" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key as TabType);
              setSelectedCategory("");
            }}
            className={`py-3 px-5 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.key
                ? "border-emerald-600 text-emerald-600 font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded shadow-sm border border-gray-200 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, mã SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
        />

        {(activeTab === "services" || activeTab === "products") && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động (Active)</option>
          <option value="inactive">Ngưng hoạt động (Inactive)</option>
        </select>

        <button
          onClick={loadTabContent}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-1.5 px-3 rounded"
        >
          Làm mới
        </button>
      </div>

      {/* Main Content Area */}
      {errorMsg && (
        <div className="p-4 mb-4 bg-red-50 text-red-700 text-sm rounded border border-red-200">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-gray-400 bg-white rounded shadow-sm border">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full mb-2"></div>
          <p className="text-sm">Đang tải dữ liệu Supabase...</p>
        </div>
      ) : (
        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
          {activeTab === "services" && (
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b">
                <tr>
                  <th className="p-3">Mã</th>
                  <th className="p-3">Tên dịch vụ</th>
                  <th className="p-3">Danh mục</th>
                  <th className="p-3 text-right">Thời lượng</th>
                  <th className="p-3 text-right">Giá bán</th>
                  <th className="p-3 text-center">Trạng thái</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {services.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      Chưa có dịch vụ nào
                    </td>
                  </tr>
                ) : (
                  services.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs text-gray-500">
                        {item.code || "-"}
                      </td>
                      <td className="p-3 font-semibold text-gray-800">
                        {item.name}
                      </td>
                      <td className="p-3 text-gray-600">
                        {(item.categories as any)?.name || "-"}
                      </td>
                      <td className="p-3 text-right">{item.duration} phút</td>
                      <td className="p-3 text-right font-medium text-emerald-600">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.price)}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            item.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingService(item);
                            setIsItemModalOpen(true);
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:underline"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === "products" && (
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b">
                <tr>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Sản phẩm</th>
                  <th className="p-3">Danh mục</th>
                  <th className="p-3">ĐVT</th>
                  <th className="p-3 text-right">Giá vốn</th>
                  <th className="p-3 text-right">Giá bán</th>
                  <th className="p-3 text-center">Trạng thái</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      Chưa có sản phẩm nào
                    </td>
                  </tr>
                ) : (
                  products.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs text-gray-500">
                        {item.sku || "-"}
                      </td>
                      <td className="p-3 font-semibold text-gray-800">
                        {item.name}
                      </td>
                      <td className="p-3 text-gray-600">
                        {(item.categories as any)?.name || "-"}
                      </td>
                      <td className="p-3 text-gray-600">{item.unit}</td>
                      <td className="p-3 text-right text-gray-500">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.cost_price)}
                      </td>
                      <td className="p-3 text-right font-medium text-emerald-600">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.selling_price)}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            item.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingProduct(item);
                            setIsItemModalOpen(true);
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:underline"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab.includes("package") && (
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b">
                <tr>
                  <th className="p-3">Mã gói</th>
                  <th className="p-3">Tên gói</th>
                  <th className="p-3 text-center">Số thành phần</th>
                  <th className="p-3 text-right">Thời hạn</th>
                  <th className="p-3 text-right">Giá gói</th>
                  <th className="p-3 text-center">Trạng thái</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {packages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      Chưa có gói dịch vụ / sản phẩm nào
                    </td>
                  </tr>
                ) : (
                  packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs text-gray-500">
                        {pkg.code || "-"}
                      </td>
                      <td className="p-3 font-semibold text-gray-800">
                        {pkg.name}
                      </td>
                      <td className="p-3 text-center font-medium">
                        {pkg.items?.length || 0}
                      </td>
                      <td className="p-3 text-right text-gray-600">
                        {pkg.validity_days} ngày
                      </td>
                      <td className="p-3 text-right font-medium text-emerald-600">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(pkg.price)}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            pkg.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {pkg.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingPackage(pkg);
                            setIsPackageModalOpen(true);
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteItem(pkg.id)}
                          className="text-red-600 hover:underline"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        type={activeTab.includes("product") ? "product" : "service"}
        tenant={tenant}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      {/* Package Modal */}
      <PackageModal
        isOpen={isPackageModalOpen}
        type={activeTab === "product_packages" ? "product" : "service"}
        editingPackage={editingPackage}
        tenant={tenant}
        onClose={() => setIsPackageModalOpen(false)}
        onSuccess={loadTabContent}
      />
    </div>
  );
};
