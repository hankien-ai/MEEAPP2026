import React, { useState } from 'react';
import {
  CatalogServiceItem,
  CatalogProductItem,
  CatalogPackageItem
} from '@/types/pos';

interface Props {
  services: CatalogServiceItem[];
  products: CatalogProductItem[];
  packages: CatalogPackageItem[];
  onAddService: (item: CatalogServiceItem) => void;
  onAddProduct: (item: CatalogProductItem) => void;
  onAddPackage: (item: CatalogPackageItem) => void;
}

export const POSCatalogPicker: React.FC<Props> = ({
  services,
  products,
  packages,
  onAddService,
  onAddProduct,
  onAddPackage
}) => {
  const [activeTab, setActiveTab] = useState<'SERVICE' | 'PRODUCT' | 'PACKAGE'>('SERVICE');
  const [searchQuery, setSearchQuery] = useState('');

  const formatVND = (val: number) => new Intl.NumberFormat('vi-VN').format(val) + ' đ';

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPackages = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
        <div className="flex bg-slate-200/80 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab('SERVICE')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'SERVICE'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💆‍♀️ Dịch vụ ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('PRODUCT')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'PRODUCT'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🧴 Sản phẩm ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('PACKAGE')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'PACKAGE'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📦 Gói dịch vụ ({packages.length})
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Tìm theo tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="p-4 overflow-y-auto flex-1 max-h-[520px]">
        {activeTab === 'SERVICE' && (
          <div className="grid grid-cols-2 gap-3">
            {filteredServices.map((s) => (
              <div
                key={s.id}
                className="p-3 border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="font-semibold text-sm text-slate-800 line-clamp-2">{s.name}</div>
                  {s.duration_minutes && (
                    <div className="text-[11px] text-slate-400 mt-0.5">⏱ {s.duration_minutes} phút</div>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="font-bold text-sm text-emerald-700">{formatVND(s.price)}</div>
                  <button
                    onClick={() => onAddService(s)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-2.5 py-1.5 rounded-lg active:scale-95 transition-all"
                  >
                    + Thêm
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'PRODUCT' && (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((p) => {
              const isLowStock = p.stock_quantity <= p.minimum_stock;
              const isOutOfStock = p.stock_quantity <= 0;

              return (
                <div
                  key={p.id}
                  className={`p-3 border rounded-xl transition-all flex flex-col justify-between bg-white ${
                    isOutOfStock
                      ? 'border-red-200 opacity-75'
                      : isLowStock
                      ? 'border-amber-300 hover:border-amber-500'
                      : 'border-slate-200 hover:border-emerald-500 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-sm text-slate-800 line-clamp-2">{p.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-slate-500">Đơn vị: {p.unit || 'cái'}</span>
                      {isOutOfStock ? (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          Hết hàng
                        </span>
                      ) : isLowStock ? (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                          Sắp hết ({p.stock_quantity})
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Tồn: {p.stock_quantity}</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="font-bold text-sm text-emerald-700">{formatVND(p.selling_price)}</div>
                    <button
                      disabled={isOutOfStock}
                      onClick={() => onAddProduct(p)}
                      className={`font-medium text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                        isOutOfStock
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                      }`}
                    >
                      + Thêm
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'PACKAGE' && (
          <div className="grid grid-cols-1 gap-3">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-3.5 border border-purple-200 rounded-xl hover:border-purple-500 hover:shadow-md transition-all bg-gradient-to-r from-purple-50/40 to-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-sm text-purple-900">{pkg.name}</div>
                    <div className="font-extrabold text-sm text-purple-700">{formatVND(pkg.price)}</div>
                  </div>
                  {pkg.validity_days && (
                    <div className="text-[11px] text-purple-600 mt-0.5">⌛ Hạn dùng: {pkg.validity_days} ngày</div>
                  )}

                  <div className="mt-2 text-xs bg-white/80 p-2 rounded-lg border border-purple-100 space-y-1">
                    <div className="text-[11px] font-semibold text-slate-500 mb-1">Dịch vụ bao gồm:</div>
                    {pkg.items.map((pi, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] text-slate-700">
                        <span>• {pi.service_name}</span>
                        <span className="font-bold text-purple-700">x{pi.quantity} buổi</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 text-right pt-2 border-t border-purple-100">
                  <button
                    onClick={() => onAddPackage(pkg)}
                    className="bg-purple-700 hover:bg-purple-800 text-white font-medium text-xs px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                  >
                    + Chọn Gói Này
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};