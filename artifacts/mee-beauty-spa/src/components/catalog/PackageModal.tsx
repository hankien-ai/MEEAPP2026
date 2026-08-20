import React, { useState, useEffect } from "react";
import {
  ServicePackage,
  PackageItemDetail,
  CatalogType,
  ServiceItem,
  ProductItem,
  TenantContext,
} from "../types/catalog";
import { catalogService } from "../services/catalogService";

interface PackageModalProps {
  isOpen: boolean;
  type: CatalogType;
  editingPackage: ServicePackage | null;
  tenant: TenantContext;
  onClose: () => void;
  onSuccess: () => void;
}

export const PackageModal: React.FC<PackageModalProps> = ({
  isOpen,
  type,
  editingPackage,
  tenant,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Partial<ServicePackage>>({
    name: "",
    code: "",
    price: 0,
    validity_days: 30,
    description: "",
    status: "active",
  });

  const [availableItems, setAvailableItems] = useState<
    (ServiceItem | ProductItem)[]
  >([]);
  const [selectedItems, setSelectedItems] = useState<PackageItemDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAvailableOptions();
      if (editingPackage) {
        setFormData({
          id: editingPackage.id,
          name: editingPackage.name,
          code: editingPackage.code,
          price: editingPackage.price,
          validity_days: editingPackage.validity_days,
          description: editingPackage.description,
          status: editingPackage.status,
        });
        setSelectedItems(editingPackage.items || []);
      } else {
        setFormData({
          name: "",
          code: "",
          price: 0,
          validity_days: 30,
          description: "",
          status: "active",
        });
        setSelectedItems([]);
      }
    }
  }, [isOpen, editingPackage]);

  const loadAvailableOptions = async () => {
    try {
      if (type === "service") {
        const res = await catalogService.getServices(tenant, {
          status: "active",
        });
        setAvailableItems(res);
      } else {
        const res = await catalogService.getProducts(tenant, {
          status: "active",
        });
        setAvailableItems(res);
      }
    } catch (err: any) {
      setErrorMsg("Không thể tải danh sách vật tư/dịch vụ.");
    }
  };

  const handleAddItem = (itemId: string) => {
    if (!itemId) return;
    const target = availableItems.find((i) => i.id === itemId);
    if (!target) return;

    const existingIdx = selectedItems.findIndex((it) => it.item_id === itemId);
    if (existingIdx > -1) {
      const updated = [...selectedItems];
      updated[existingIdx].quantity += 1;
      setSelectedItems(updated);
    } else {
      const price = "price" in target ? target.price : target.selling_price;
      const code = "code" in target ? target.code : target.sku;

      setSelectedItems([
        ...selectedItems,
        {
          organization_id: tenant.organizationId,
          branch_id: tenant.branchId,
          item_type: type,
          item_id: target.id,
          quantity: 1,
          unit_price: price,
          item_name: target.name,
          item_code: code,
        },
      ]);
    }
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...selectedItems];
    updated[index].quantity = Math.max(1, qty);
    setSelectedItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const calculateTotalValue = () => {
    return selectedItems.reduce(
      (acc, curr) => acc + curr.quantity * curr.unit_price,
      0,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setErrorMsg("Vui lòng nhập tên gói");
      return;
    }
    if (selectedItems.length === 0) {
      setErrorMsg(
        `Vui lòng chọn ít nhất 1 ${type === "service" ? "dịch vụ" : "sản phẩm"} vào gói`,
      );
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await catalogService.savePackage(
        tenant,
        { ...formData, type },
        selectedItems,
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi khi lưu gói. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">
            {editingPackage ? "Sửa" : "Thêm mới"}{" "}
            {type === "service" ? "Gói Dịch Vụ" : "Gói Sản Phẩm"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-xl"
          >
            &times;
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto space-y-4 flex-1"
        >
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên gói *
              </label>
              <input
                type="text"
                required
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="VD: Gói Skincare Chuyên Sâu 10 Lần"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã gói
              </label>
              <input
                type="text"
                value={formData.code || ""}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="VD: PKG-SKIN-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá bán gói (VNĐ) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.price || 0}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-emerald-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời hạn (Ngày)
              </label>
              <input
                type="number"
                min="1"
                value={formData.validity_days || 30}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    validity_days: Number(e.target.value),
                  })
                }
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={formData.status || "active"}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="active">Hoạt động (Active)</option>
                <option value="inactive">Ngưng (Inactive)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              rows={2}
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <hr className="my-4 border-gray-200" />

          {/* Thành phần gói */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-gray-800 text-sm">
                Thành phần {type === "service" ? "Dịch vụ" : "Sản phẩm"} trong
                gói
              </h4>
              <span className="text-xs text-gray-500">
                Tổng giá trị lẻ:{" "}
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(calculateTotalValue())}
              </span>
            </div>

            <div className="flex gap-2 mb-3">
              <select
                onChange={(e) => {
                  handleAddItem(e.target.value);
                  e.target.value = "";
                }}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">
                  -- Chọn {type === "service" ? "dịch vụ" : "sản phẩm"} thêm vào
                  gói --
                </option>
                {availableItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - (
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(
                      "price" in item ? item.price : item.selling_price,
                    )}
                    )
                  </option>
                ))}
              </select>
            </div>

            <table className="w-full text-left text-sm border border-gray-200 rounded">
              <thead className="bg-gray-100 text-gray-600 border-b">
                <tr>
                  <th className="p-2">Tên</th>
                  <th className="p-2 w-24">Số lượng</th>
                  <th className="p-2 w-32 text-right">Đơn giá lẻ</th>
                  <th className="p-2 w-32 text-right">Thành tiền</th>
                  <th className="p-2 w-12 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-4 text-center text-gray-400 italic"
                    >
                      Chưa có thành phần nào trong gói
                    </td>
                  </tr>
                ) : (
                  selectedItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-medium">
                        {item.item_name || "Vật tư"}
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(idx, Number(e.target.value))
                          }
                          className="w-16 border rounded px-2 py-1 text-center"
                        />
                      </td>
                      <td className="p-2 text-right">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.unit_price)}
                      </td>
                      <td className="p-2 text-right font-medium">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.quantity * item.unit_price)}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          &times;
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu Gói"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
