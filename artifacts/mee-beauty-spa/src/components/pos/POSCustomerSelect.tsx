// src/components/pos/POSCustomerSelect.tsx
import React, { useState, useEffect } from "react";
import { Customer } from "@/types/pos";
import { POSService } from "@/services/pos-service";
import { customerService } from "@/services/customer.service";
import { X, UserPlus } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { maskPhone } from '@/lib/utils';

interface Props {
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
  hasPackageInCart: boolean;
}

export const POSCustomerSelect: React.FC<Props> = ({
  selectedCustomer,
  onSelectCustomer,
  hasPackageInCart,
}) => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        const data = await POSService.searchCustomers(query);
        setResults(data);
        setLoading(false);
        setIsSearching(true);
      } else {
        setResults([]);
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      setAddError("Vui lòng nhập đầy đủ tên và số điện thoại.");
      return;
    }
    setAdding(true);
    setAddError(null);
    try {
      const newCustomer = await customerService.createCustomer({
        full_name: newName.trim(),
        phone: newPhone.trim(),
      });
      onSelectCustomer(newCustomer);
      setShowQuickAdd(false);
      setNewName("");
      setNewPhone("");
      setQuery("");
    } catch (err: any) {
      setAddError(err.message || "Lỗi tạo khách hàng.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Khách hàng {hasPackageInCart && <span className="text-red-500 font-bold">* (Bắt buộc cho Gói)</span>}
        </label>
        {selectedCustomer && (
          <button
            onClick={() => onSelectCustomer(null)}
            className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1 hover:underline"
          >
            <X className="w-3.5 h-3.5" /> Đổi
          </button>
        )}
      </div>

      {selectedCustomer ? (
        <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-sm">
              {selectedCustomer.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-slate-800">{selectedCustomer.full_name}</div>
              <div className="text-xs text-slate-500">{maskPhone(selectedCustomer.phone, isAdmin)}</div>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-full">
            Đã chọn
          </span>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc số điện thoại..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border focus:ring-2 focus:outline-none transition-all ${
              hasPackageInCart && !selectedCustomer
                ? "border-amber-400 focus:ring-amber-200 bg-amber-50/30"
                : "border-slate-300 focus:ring-emerald-200 focus:border-emerald-500"
            }`}
          />
          {loading && (
            <div className="absolute right-3 top-3 text-xs text-slate-400">Đang tìm...</div>
          )}

          {isSearching && results.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {results.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    onSelectCustomer(c);
                    setQuery("");
                    setIsSearching(false);
                  }}
                  className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-sm text-slate-800">{c.full_name}</div>
                    <div className="text-xs text-slate-500">{maskPhone(c.phone, isAdmin)}</div>
                  </div>
                  <button className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded font-medium">
                    Chọn
                  </button>
                </div>
              ))}
            </div>
          )}

          {isSearching && results.length === 0 && !loading && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-md p-4 text-center">
              <p className="text-xs text-slate-500 mb-2">Không tìm thấy khách hàng.</p>
              <button
                onClick={() => setShowQuickAdd(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                + THÊM KHÁCH HÀNG NHANH
              </button>
            </div>
          )}

          <div className="mt-2 text-center">
            <button
              onClick={() => setShowQuickAdd(true)}
              className="text-xs text-emerald-600 font-semibold hover:underline flex items-center justify-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Thêm khách hàng mới
            </button>
          </div>
        </div>
      )}

      {showQuickAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Thêm khách hàng nhanh</h3>
              <button onClick={() => { setShowQuickAdd(false); setAddError(null); }} className="p-1 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleQuickAdd} className="space-y-4">
              {addError && (
                <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {addError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nhập họ tên khách hàng"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {adding ? "Đang tạo..." : "Tạo khách hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};