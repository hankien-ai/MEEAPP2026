import React, { useState, useEffect } from "react";
import {
  processInventoryTransaction,
  fetchInventoryHistory,
} from "../services/catalog-service";
import type {
  ProductItem,
  InventoryTransaction,
  InventoryTransactionType,
} from "../types/catalog";

interface Props {
  product: ProductItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Trigger refresh danh sách sản phẩm ở trang cha
}

export const InventoryModal: React.FC<Props> = ({
  product,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"ACTION" | "HISTORY">("ACTION");
  const [transType, setTransType] = useState<InventoryTransactionType>("IN");
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<InventoryTransaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const isLowStock = product.stock_quantity <= product.minimum_stock;
  const isConsumable = product.product_type === "CONSUMABLE";

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await fetchInventoryHistory(product.product_id);
      setHistory(data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setQuantity(1);
      setNote("");
      setTransType("IN");
      loadHistory();
    }
  }, [isOpen, product.product_id]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setErrorMsg("Số lượng phải lớn hơn 0");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await processInventoryTransaction({
        product_id: product.product_id,
        type: transType,
        quantity,
        note,
      });

      setNote("");
      setQuantity(1);
      await loadHistory();
      onSuccess(); // Tải lại stock_quantity ở màn hình chính
    } catch (err: any) {
      setErrorMsg(err.message || "Thao tác thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {product.name}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
              {isConsumable
                ? "Vật tư tiêu hao (CONSUMABLE)"
                : "Sản phẩm bán (RETAIL)"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg text-lg"
          >
            ✕
          </button>
        </div>

        {/* Tồn kho & Cảnh báo */}
        <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Tồn kho hiện tại</p>
            <p className="text-xl font-bold text-gray-900">
              {product.stock_quantity}{" "}
              <span className="text-sm font-normal text-gray-600">
                {product.unit}
              </span>
            </p>
          </div>
          {isLowStock && (
            <div className="bg-amber-100 text-amber-800 text-xs px-3 py-1.5 rounded-lg font-medium border border-amber-200">
              ⚠️ Sắp hết hàng (Tồn ≤ {product.minimum_stock})
            </div>
          )}
        </div>

        {/* Tabs navigation */}
        <div className="flex border-b text-sm font-medium">
          <button
            onClick={() => setActiveTab("ACTION")}
            className={`flex-1 py-2 min-h-[44px] text-center border-b-2 transition-colors ${
              activeTab === "ACTION"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-gray-500"
            }`}
          >
            Thao Tác Kho
          </button>
          <button
            onClick={() => setActiveTab("HISTORY")}
            className={`flex-1 py-2 min-h-[44px] text-center border-b-2 transition-colors ${
              activeTab === "HISTORY"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-gray-500"
            }`}
          >
            Lịch Sử Biến Động
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "ACTION" ? (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              {/* Chọn loại giao dịch */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Loại thao tác
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransType("IN")}
                    className={`min-h-[44px] rounded-lg font-semibold text-sm transition-all border ${
                      transType === "IN"
                        ? "bg-green-600 text-white border-green-600 shadow-sm"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    📥 Nhập Kho
                  </button>

                  {/* RETAIL: ẨN NÚT XUẤT KHO THỦ CÔNG */}
                  {isConsumable ? (
                    <button
                      type="button"
                      onClick={() => setTransType("OUT")}
                      className={`min-h-[44px] rounded-lg font-semibold text-sm transition-all border ${
                        transType === "OUT"
                          ? "bg-red-600 text-white border-red-600 shadow-sm"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      📤 Xuất Kho
                    </button>
                  ) : (
                    <div className="min-h-[44px] bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-xs text-gray-400 italic px-2 text-center">
                      Xuất tự động qua POS
                    </div>
                  )}
                </div>
              </div>

              {/* Số lượng */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Số lượng {transType === "IN" ? "nhập" : "xuất"} (
                  {product.unit}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 0))
                  }
                  className="w-full min-h-[44px] px-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Ghi chú */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Ghi chú
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="VD: Nhập hàng NCC / Xuất dùng phòng dịch vụ..."
                  className="w-full min-h-[44px] px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center mt-4"
              >
                {loading ? "Đang cập nhật..." : "Xác Nhận Cập Nhật Kho"}
              </button>
            </form>
          ) : (
            /* Lịch sử giao dịch */
            <div className="space-y-2 pt-2">
              {loadingHistory ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  Đang tải lịch sử...
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm italic">
                  Chưa có lịch sử biến động kho.
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          item.transaction_type === "IN"
                            ? "bg-green-100 text-green-800"
                            : item.transaction_type === "OUT"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {item.transaction_type === "IN"
                          ? "NHẬP"
                          : item.transaction_type === "OUT"
                            ? "XUẤT"
                            : "ĐIỀU CHỈNH"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleString("vi-VN")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm pt-1">
                      <span className="text-gray-600">
                        Thay đổi:{" "}
                        <strong
                          className={
                            item.transaction_type === "IN"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {item.transaction_type === "IN" ? "+" : "-"}
                          {item.quantity}
                        </strong>
                      </span>
                      <span className="text-xs text-gray-500">
                        Tồn: {item.stock_before} ➔{" "}
                        <strong className="text-gray-900">
                          {item.stock_after}
                        </strong>
                      </span>
                    </div>

                    {item.note && (
                      <p className="text-xs text-gray-500 italic border-t pt-1 mt-1">
                        Ghi chú: {item.note}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
