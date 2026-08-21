import React, { useState, useEffect } from "react";
import {
  X,
  Package,
  History,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  ProductItem,
  InventoryTransaction,
  InventoryTransactionType,
} from "../types/catalog";
import {
  processInventoryTransaction,
  fetchInventoryHistory,
} from "../services/catalog-service";

interface InventoryModalProps {
  product: ProductItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export default function InventoryModal({
  product,
  isOpen,
  onClose,
  onSuccess,
}: InventoryModalProps) {
  const [activeTab, setActiveTab] = useState<"action" | "history">("action");
  const [transactionType, setTransactionType] =
    useState<InventoryTransactionType>("IN");
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<InventoryTransaction[]>([]);

  const loadHistory = async () => {
    if (!product.product_id) return;
    setHistoryLoading(true);
    try {
      const data = await fetchInventoryHistory(product.product_id);
      setHistory(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, product.product_id]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setError("Số lượng phải lớn hơn 0");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await processInventoryTransaction({
        product_id: product.product_id,
        type: transactionType,
        quantity: Number(quantity),
        note: note.trim() || undefined,
      });

      await onSuccess();
      await loadHistory();
      setQuantity(1);
      setNote("");
      setActiveTab("history");
    } catch (err: any) {
      setError(err.message || "Lỗi cập nhật tồn kho");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                {product.code}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                {product.product_type === "CONSUMABLE" ? "Tiêu hao" : "Bán lẻ"}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              {product.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Stock Banner */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">
              Tồn kho hiện tại
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-blue-400">
                {product.stock_quantity ?? 0}
              </span>
              <span className="text-xs text-slate-300">
                {product.unit || "cái"}
              </span>
            </div>
          </div>
          <div className="text-right text-xs text-slate-400">
            <span>Cảnh báo tối thiểu: </span>
            <strong className="text-slate-200">
              {product.minimum_stock ?? 0}
            </strong>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("action")}
            className={`flex items-center gap-1.5 px-4 py-2.5 font-semibold text-xs border-b-2 transition-colors ${
              activeTab === "action"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Package className="w-4 h-4" />
            Nhập / Xuất kho
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("history");
              loadHistory();
            }}
            className={`flex items-center gap-1.5 px-4 py-2.5 font-semibold text-xs border-b-2 transition-colors ${
              activeTab === "history"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <History className="w-4 h-4" />
            Lịch sử biến động
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === "action" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Loại giao dịch
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransactionType("IN")}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      transactionType === "IN"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                    Nhập kho (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType("OUT")}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      transactionType === "OUT"
                        ? "bg-rose-50 border-rose-500 text-rose-700 shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-rose-600" />
                    Xuất kho (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số lượng thay đổi ({product.unit || "cái"}) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 0))
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú giao dịch
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Nhập hàng đợt 1 / Xuất sử dụng spa..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Xác nhận {transactionType === "IN" ? "Nhập kho" : "Xuất kho"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {historyLoading ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Đang tải lịch sử...
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Chưa có lịch sử giao dịch kho
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {history.map((tx) => (
                    <div
                      key={tx.id}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                              tx.transaction_type === "IN"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {tx.transaction_type === "IN" ? "+ Nhập" : "- Xuất"}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {tx.quantity} {product.unit || "cái"}
                          </span>
                        </div>
                        {tx.note && (
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            {tx.note}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(tx.created_at).toLocaleString("vi-VN")}
                        </span>
                        <span className="text-[11px] text-slate-600 font-mono">
                          {tx.stock_before} ➔ {tx.stock_after}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
