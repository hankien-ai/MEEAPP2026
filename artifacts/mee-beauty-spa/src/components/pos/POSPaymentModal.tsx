import React, { useState } from "react";
import { PaymentMethod, Customer, CartItem, Staff } from "@/types/pos";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  staffList: Staff[];
  onConfirmPayment: (
    paymentMethod: PaymentMethod,
    cashGiven: number,
    notes?: string,
  ) => void;
  isSubmitting: boolean;
}

export const POSPaymentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  customer,
  items,
  subtotal,
  discountAmount,
  totalAmount,
  staffList,
  onConfirmPayment,
  isSubmitting,
}) => {
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [cashGiven, setCashGiven] = useState<number>(totalAmount);
  const [notes, setNotes] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  if (!isOpen) return null;

  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN").format(val) + " đ";
  const changeDue = Math.max(0, cashGiven - totalAmount);

  const getStaffName = (id?: string) => {
    if (!id) return "---";
    const s = staffList.find((st) => st.id === id);
    return s ? s.full_name : "---";
  };

  const handlePay = () => {
    setErrorMessage("");

    if (method === "CASH" && cashGiven < totalAmount) {
      setErrorMessage("Số tiền tiền mặt khách đưa chưa đủ!");
      return;
    }

    if ((method === "DEBT" || method === "GIFT") && !customer) {
      setErrorMessage(`Thanh toán ${method === "DEBT" ? "Nợ" : "Quà tặng"} bắt buộc phải có thông tin Khách hàng!`);
      return;
    }

    onConfirmPayment(method, cashGiven, notes);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">Xác Nhận Thanh Toán</h2>
            <p className="text-xs text-slate-500">Kiểm tra thông tin trước khi xuất hóa đơn</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Khách hàng:</span>
            <span className="font-bold text-slate-800 text-sm">
              {customer ? `${customer.full_name} (${customer.phone})` : "Khách vãng lai"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Tổng món:</span>
            <span className="font-bold text-slate-800 text-sm">{items.length} hạng mục</span>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2">Hạng mục</th>
                <th className="p-2 text-center">SL</th>
                <th className="p-2 text-right">Đơn giá</th>
                <th className="p-2 text-right">Thành tiền</th>
                <th className="p-2">NV Sale / KTV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((it) => (
                <tr key={it.cart_item_id}>
                  <td className="p-2 font-medium text-slate-800">{it.name}</td>
                  <td className="p-2 text-center">{it.quantity}</td>
                  <td className="p-2 text-right">{formatVND(it.unit_price)}</td>
                  <td className="p-2 text-right font-bold text-slate-900">
                    {formatVND(it.total_amount)}
                  </td>
                  <td className="p-2 text-[11px] text-slate-500">
                    <div>Sale: {getStaffName(it.seller_staff_id)}</div>
                    {it.item_type === "SERVICE" && (
                      <div className="text-blue-600">
                        KTV: {getStaffName(it.performing_staff_id)}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-1 text-right border-t border-slate-100 pt-2 text-xs">
          <div className="text-slate-500">
            Tạm tính: <span className="font-medium text-slate-700">{formatVND(subtotal)}</span>
          </div>
          <div className="text-slate-500">
            Giảm giá: <span className="font-medium text-red-600">-{formatVND(discountAmount)}</span>
          </div>
          <div className="text-base font-black text-emerald-700 pt-1">
            THÀNH TIỀN: {formatVND(totalAmount)}
          </div>
        </div>

        {/* PAYMENT METHOD SELECTION */}
        <div className="space-y-3 pt-1">
          <label className="text-xs font-bold text-slate-800 block">Phương thức thanh toán:</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setMethod("CASH"); setErrorMessage(""); }}
              className={`py-3 px-4 text-sm font-bold rounded-xl border-2 transition-all ${
                method === "CASH"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-md"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              💵 Tiền mặt
            </button>

            <button
              type="button"
              onClick={() => { setMethod("BANK_TRANSFER"); setErrorMessage(""); }}
              className={`py-3 px-4 text-sm font-bold rounded-xl border-2 transition-all ${
                method === "BANK_TRANSFER"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-md"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              🏦 Chuyển khoản
            </button>

            <button
              type="button"
              onClick={() => { setMethod("GIFT"); setErrorMessage(""); }}
              className={`py-2 text-xs font-semibold rounded-xl border-2 transition-all ${
                method === "GIFT"
                  ? "border-purple-600 bg-purple-50 text-purple-800"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              }`}
            >
              🎁 Quà tặng
            </button>

            <button
              type="button"
              onClick={() => { setMethod("DEBT"); setErrorMessage(""); }}
              className={`py-2 text-xs font-semibold rounded-xl border-2 transition-all ${
                method === "DEBT"
                  ? "border-amber-600 bg-amber-50 text-amber-800"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              }`}
            >
              📝 Nợ
            </button>
          </div>

          {method === "CASH" && (
            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs font-bold text-slate-700">Tiền khách đưa:</label>
                <input
                  type="number"
                  value={cashGiven}
                  onChange={(e) => setCashGiven(Number(e.target.value))}
                  className="w-40 text-right px-3 py-1 font-bold text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-400 bg-white"
                />
              </div>
              <div className="flex justify-end gap-1">
                {[totalAmount, 100000, 200000, 500000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCashGiven(amt)}
                    className="text-[11px] bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium"
                  >
                    {formatVND(amt)}
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-center text-xs font-bold border-t border-emerald-200 pt-2">
                <span className="text-slate-600">Tiền thừa trả khách:</span>
                <span className="text-emerald-700 text-sm">{formatVND(changeDue)}</span>
              </div>
            </div>
          )}

          {method === "BANK_TRANSFER" && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
              <p>💳 Chuyển khoản qua ngân hàng. Số tiền cần chuyển: <strong>{formatVND(totalAmount)}</strong></p>
            </div>
          )}

          {method === "GIFT" && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800">
              <p>🎁 Tặng gói dịch vụ cho khách hàng <strong>{customer?.full_name || "chưa chọn"}</strong>.</p>
              <p className="mt-1 text-[11px]">Khách sẽ nhận được gói quà tặng theo cấu hình.</p>
              <p className="mt-1 text-[11px] font-bold text-purple-700">Số tiền phải trả: 0đ</p>
            </div>
          )}

          {method === "DEBT" && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              <p>📝 Ghi nợ cho khách <strong>{customer?.full_name || "chưa chọn"}</strong>.</p>
              <p className="mt-1 text-[11px]">Số tiền còn nợ: <strong>{formatVND(totalAmount)}</strong></p>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-500 block mb-1">Ghi chú đơn hàng:</label>
            <input
              type="text"
              placeholder="Nhập ghi chú (nếu có)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-bold text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handlePay}
            className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/30 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Đang xử lý..." : "Xác Nhận Thanh Toán"}
          </button>
        </div>
      </div>
    </div>
  );
};