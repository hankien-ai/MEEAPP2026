# POS PAYMENT MODAL
===== artifacts/mee-beauty-spa/src/components/pos/POSPaymentModal.tsx =====
import React, { useState } from 'react';
import {
  PaymentMethod,
  Customer,
  CartItem,
  Staff
} from '@/types/pos';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  staffList: Staff[];
  onConfirmPayment: (paymentMethod: PaymentMethod, cashGiven: number) => void;
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
  isSubmitting
}) => {
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [cashGiven, setCashGiven] = useState<number>(totalAmount);

  if (!isOpen) return null;

  const formatVND = (val: number) => new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  const changeDue = Math.max(0, cashGiven - totalAmount);

  const getStaffName = (id?: string) => {
    if (!id) return '---';
    const s = staffList.find((st) => st.id === id);
    return s ? s.full_name : '---';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Xác nhận thanh toán</h2>
            <p className="text-xs text-slate-500">Kiểm tra thông tin đơn hàng trước khi hoàn tất</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
            ✕
          </button>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Khách hàng:</span>
            <span className="font-bold text-slate-800 text-sm">
              {customer ? `${customer.full_name} (${customer.phone})` : 'Khách vãng lai'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Số lượng món:</span>
            <span className="font-bold text-slate-800 text-sm">{items.length} món</span>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Món</th>
                <th className="p-2.5 text-center">SL</th>
                <th className="p-2.5 text-right">Đơn giá</th>
                <th className="p-2.5 text-right">Thành tiền</th>
                <th className="p-2.5">NV Sale / KTV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((it) => (
                <tr key={it.cart_item_id}>
                  <td className="p-2.5 font-medium text-slate-800">{it.name}</td>
                  <td className="p-2.5 text-center">{it.quantity}</td>
                  <td className="p-2.5 text-right">{formatVND(it.unit_price)}</td>
                  <td className="p-2.5 text-right font-bold text-slate-900">{formatVND(it.total_amount)}</td>
                  <td className="p-2.5 text-[11px] text-slate-500">
                    <div>Sale: {getStaffName(it.seller_staff_id)}</div>
                    {it.item_type === 'SERVICE' && (
                      <div className="text-blue-600">KTV: {getStaffName(it.performing_staff_id)}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-1.5 text-right border-t border-slate-100 pt-3 text-xs">
          <div className="text-slate-500">Tổng tiền hàng: <span className="font-medium text-slate-700">{formatVND(subtotal)}</span></div>
          <div className="text-slate-500">Giảm giá: <span className="font-medium text-red-600">-{formatVND(discountAmount)}</span></div>
          <div className="text-base font-extrabold text-emerald-700 pt-1">
            CẦN THANH TOÁN: {formatVND(totalAmount)}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <label className="text-sm font-bold text-slate-800 block">Phương thức thanh toán:</label>
          <div className="grid grid-cols-4 gap-2">
            {(['CASH', 'BANK_TRANSFER', 'QR', 'DEBT'] as PaymentMethod[]).map((m) => {
              const labels: Record<PaymentMethod, string> = {
                CASH: '💵 Tiền mặt',
                BANK_TRANSFER: '🏦 Chuyển khoản',
                QR: '📲 Mã QR',
                DEBT: '📝 Ghi nợ'
              };
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`py-2.5 px-2 text-xs font-bold rounded-xl border transition-all ${
                    method === m
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {labels[m]}
                </button>
              );
            })}
          </div>

          {method === 'CASH' && (
            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-3 mt-3">
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs font-bold text-slate-700">Tiền khách đưa:</label>
                <input
                  type="number"
                  value={cashGiven}
                  onChange={(e) => setCashGiven(Number(e.target.value))}
                  className="w-48 text-right px-3 py-1.5 font-bold text-sm border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                />
              </div>

              <div className="flex justify-end gap-1.5">
                {[totalAmount, 100000, 200000, 500000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCashGiven(amt)}
                    className="text-[11px] bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-medium"
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

          {method === 'BANK_TRANSFER' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
              ℹ️ Vui lòng kiểm tra báo có tài khoản ngân hàng trước khi xác nhận thanh toán.
            </div>
          )}
          {method === 'QR' && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800">
              📲 Mã QR thanh toán đã sẵn sàng. Vui lòng quét mã trên ứng dụng ngân hàng.
            </div>
          )}
          {method === 'DEBT' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              ⚠️ Đơn hàng sẽ được ghi nhận công nợ vào tài khoản của khách hàng này.
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-xs font-bold text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onConfirmPayment(method, cashGiven)}
            className="flex-1 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/30 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Đang xử lý...' : 'Xác Nhận Thanh Toán'}
          </button>
        </div>
      </div>
    </div>
  );
};