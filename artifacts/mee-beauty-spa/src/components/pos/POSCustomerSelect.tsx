import React, { useState, useEffect } from 'react';
import { Customer } from '@/types/pos';
import { POSService } from '@/services/pos-service';

interface Props {
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
  hasPackageInCart: boolean;
}

export const POSCustomerSelect: React.FC<Props> = ({
  selectedCustomer,
  onSelectCustomer,
  hasPackageInCart
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

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
            ❌ Đổi / Bỏ chọn
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
              <div className="text-xs text-slate-500">{selectedCustomer.phone}</div>
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
            placeholder="Tìm theo tên hoặc số điện thoại (tối thiểu 2 ký tự)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border focus:ring-2 focus:outline-none transition-all ${
              hasPackageInCart && !selectedCustomer
                ? 'border-amber-400 focus:ring-amber-200 bg-amber-50/30'
                : 'border-slate-300 focus:ring-emerald-200 focus:border-emerald-500'
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
                    setQuery('');
                    setIsSearching(false);
                  }}
                  className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-sm text-slate-800">{c.full_name}</div>
                    <div className="text-xs text-slate-500">{c.phone}</div>
                  </div>
                  <button className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded font-medium">
                    Chọn
                  </button>
                </div>
              ))}
            </div>
          )}

          {isSearching && results.length === 0 && !loading && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-md p-3 text-center text-xs text-slate-500">
              Không tìm thấy khách hàng
            </div>
          )}
        </div>
      )}
    </div>
  );
};