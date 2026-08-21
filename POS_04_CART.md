# POS CART
===== artifacts/mee-beauty-spa/src/components/pos/POSCart.tsx =====
import React from 'react';
import { CartItem, Staff } from '@/types/pos';

interface Props {
  items: CartItem[];
  staffList: Staff[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onUpdateDiscount: (cartItemId: string, discount: number) => void;
  onUpdateSellerStaff: (cartItemId: string, staffId: string) => void;
  onUpdatePerformingStaff: (cartItemId: string, staffId: string) => void;
  onRemoveItem: (cartItemId: string) => void;
}

export const POSCart: React.FC<Props> = ({
  items,
  staffList,
  onUpdateQuantity,
  onUpdateDiscount,
  onUpdateSellerStaff,
  onUpdatePerformingStaff,
  onRemoveItem
}) => {
  const formatVND = (val: number) => new Intl.NumberFormat('vi-VN').format(val) + ' đ';

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[300px]">
        <svg className="w-12 h-12 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="text-sm font-medium">Giỏ hàng đang trống</p>
        <p className="text-xs text-slate-400 mt-1">Vui lòng chọn Dịch vụ, Sản phẩm hoặc Gói từ danh mục bên cạnh</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-3 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700 flex justify-between items-center">
        <span>DANH SÁCH MÓN ({items.length})</span>
        <span className="text-[11px] text-slate-500 font-normal">Điều chỉnh NV Sale / KTV trên từng món</span>
      </div>

      <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
        {items.map((item) => {
          const isService = item.item_type === 'SERVICE';
          const isPackage = item.item_type === 'PACKAGE';

          return (
            <div key={item.cart_item_id} className="p-3 hover:bg-slate-50/80 transition-all space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isService
                          ? 'bg-blue-100 text-blue-700'
                          : isPackage
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isService ? 'DỊCH VỤ' : isPackage ? 'GÓI' : 'SẢN PHẨM'}
                    </span>
                    <span className="font-semibold text-sm text-slate-800">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() => onUpdateQuantity(item.cart_item_id, item.quantity - 1)}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 font-semibold text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.cart_item_id, item.quantity + 1)}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-slate-500">
                      Đơn giá: <span className="font-medium text-slate-700">{formatVND(item.unit_price)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-sm text-slate-900">{formatVND(item.total_amount)}</div>
                  <button
                    onClick={() => onRemoveItem(item.cart_item_id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium mt-1 hover:underline"
                  >
                    Xóa
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">NV Tư vấn / Sale:</label>
                  <select
                    value={item.seller_staff_id || ''}
                    onChange={(e) => onUpdateSellerStaff(item.cart_item_id, e.target.value)}
                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">-- Chọn NV Sale --</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                {isService ? (
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">KTV Thực hiện:</label>
                    <select
                      value={item.performing_staff_id || ''}
                      onChange={(e) => onUpdatePerformingStaff(item.cart_item_id, e.target.value)}
                      className="w-full text-xs p-1.5 border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">-- Chọn KTV --</option>
                      {staffList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 flex items-center italic">
                    (Sản phẩm/Gói không chọn KTV)
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};