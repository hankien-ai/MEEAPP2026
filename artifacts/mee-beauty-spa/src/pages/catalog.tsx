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
