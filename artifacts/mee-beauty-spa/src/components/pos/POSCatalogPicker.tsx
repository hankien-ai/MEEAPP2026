// src/components/pos/POSCatalogPicker.tsx
import React, { useState } from 'react';
import {
  CatalogServiceItem,
  CatalogProductItem,
  CatalogPackageItem
} from '@/types/pos';

type TabType = 'ALL' | 'SERVICE' | 'PRODUCT' | 'PACKAGE';

interface Props {
  services: CatalogServiceItem[];
  products: CatalogProductItem[];
  packages: CatalogPackageItem[];
  onAddService: (item: CatalogServiceItem) => void;
  onAddProduct: (item: CatalogProductItem) => void;
  onAddPackage: (item: CatalogPackageItem) => void;
  activeTab?: TabType;
  // NEW: danh sách các item đã có trong giỏ hàng để highlight
  cartItemIds?: Set<string>;
}

export const POSCatalogPicker: React.FC<Props> = ({
  services,
  products,
  packages,
  onAddService,
  onAddProduct,
  onAddPackage,
  activeTab: externalTab,
  cartItemIds = new Set(),
}) => {
  const [internalTab, setInternalTab] = useState<TabType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const activeTab = externalTab || internalTab;

  const formatVND = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  // Chỉ hiển thị sản phẩm RETAIL
  const retailProducts = products.filter(p => p.product_type === 'RETAIL');

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = retailProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPackages = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ALL tab: gộp tất cả, mỗi item có type
  const allItems = [
    ...services.map(s => ({ ...s, type: 'SERVICE' as const })),
    ...retailProducts.map(p => ({ ...p, type: 'PRODUCT' as const })),
    ...packages.map(pkg => ({ ...pkg, type: 'PACKAGE' as const })),
  ].filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Khi click vào item, thêm vào giỏ ngay
  const handleItemClick = (item: any, type: 'SERVICE' | 'PRODUCT' | 'PACKAGE') => {
    if (type === 'SERVICE') {
      onAddService(item);
    } else if (type === 'PRODUCT') {
      onAddProduct(item);
    } else if (type === 'PACKAGE') {
      onAddPackage(item);
    }
  };

  // Xác định màu viền theo loại
  const getBorderColor = (type: string, isInCart: boolean) => {
    if (isInCart) {
      return 'border-emerald-500 bg-emerald-50 shadow-md';
    }
    switch (type) {
      case 'SERVICE': return 'border-blue-200 hover:border-blue-500';
      case 'PRODUCT': return 'border-orange-200 hover:border-orange-500';
      case 'PACKAGE': return 'border-purple-200 hover:border-purple-500';
      default: return 'border-slate-200 hover:border-slate-300';
    }
  };

  // Lấy id để so sánh với cartItemIds
  const getItemId = (item: any) => {
    if (item.type === 'SERVICE') return item.catalog_item_id || item.id;
    if (item.type === 'PRODUCT') return item.catalog_item_id || item.id;
    if (item.type === 'PACKAGE') return item.id;
    return item.id;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
        <div className="flex bg-slate-200/80 p-1 rounded-xl gap-1 overflow-x-auto">
          <button
            onClick={() => setInternalTab('ALL')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Tất cả ({services.length + retailProducts.length + packages.length})
          </button>
          <button
            onClick={() => setInternalTab('SERVICE')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'SERVICE'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💆‍♀️ DV ({services.length})
          </button>
          <button
            onClick={() => setInternalTab('PRODUCT')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'PRODUCT'
                ? 'bg-white text-orange-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🧴 SP ({retailProducts.length})
          </button>
          <button
            onClick={() => setInternalTab('PACKAGE')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'PACKAGE'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📦 Gói ({packages.length})
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

      <div className="p-4 overflow-y-auto flex-1 max-h-[480px]">
        {activeTab === 'ALL' && (
          <div className="grid grid-cols-2 gap-2">
            {allItems.map((item) => {
              const id = getItemId(item);
              const isInCart = cartItemIds.has(id);
              return (
                <div
                  key={id}
                  onClick={() => handleItemClick(item, item.type)}
                  className={`p-3 border-2 rounded-xl transition-all cursor-pointer ${
                    isInCart
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : getBorderColor(item.type, false)
                  }`}
                >
                  <div className="font-semibold text-sm text-slate-800 line-clamp-2">{item.name}</div>
                  <div className="font-medium text-sm text-emerald-700">{formatVND(item.price)}</div>
                  {item.type === 'SERVICE' && (item as any).duration_minutes && (
                    <div className="text-[11px] text-slate-400">⏱ {(item as any).duration_minutes} phút</div>
                  )}
                  {item.type === 'PRODUCT' && (item as any).stock_quantity !== undefined && (
                    <div className="text-[10px] text-slate-500">Tồn: {(item as any).stock_quantity}</div>
                  )}
                  {item.type === 'PACKAGE' && (item as any).validity_days && (
                    <div className="text-[10px] text-purple-500">⌛ {(item as any).validity_days} ngày</div>
                  )}
                  {isInCart && (
                    <div className="text-[10px] font-bold text-emerald-600 mt-1">✓ Đã thêm</div>
                  )}
                </div>
              );
            })}
            {allItems.length === 0 && (
              <div className="col-span-2 text-center text-slate-400 text-xs py-8">
                Không tìm thấy kết quả
              </div>
            )}
          </div>
        )}

        {activeTab === 'SERVICE' && (
          <div className="grid grid-cols-2 gap-2">
            {filteredServices.map((s) => {
              const id = s.catalog_item_id || s.id;
              const isInCart = cartItemIds.has(id);
              return (
                <div
                  key={id}
                  onClick={() => handleItemClick(s, 'SERVICE')}
                  className={`p-3 border-2 rounded-xl transition-all cursor-pointer ${
                    isInCart
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : 'border-blue-200 hover:border-blue-500'
                  }`}
                >
                  <div className="font-semibold text-sm text-slate-800 line-clamp-2">{s.name}</div>
                  <div className="font-medium text-sm text-emerald-700">{formatVND(s.price)}</div>
                  {s.duration_minutes && (
                    <div className="text-[11px] text-slate-400">⏱ {s.duration_minutes} phút</div>
                  )}
                  {isInCart && (
                    <div className="text-[10px] font-bold text-emerald-600 mt-1">✓ Đã thêm</div>
                  )}
                </div>
              );
            })}
            {filteredServices.length === 0 && (
              <div className="col-span-2 text-center text-slate-400 text-xs py-8">
                Không có dịch vụ
              </div>
            )}
          </div>
        )}

        {activeTab === 'PRODUCT' && (
          <div className="grid grid-cols-2 gap-2">
            {filteredProducts.map((p) => {
              const id = p.catalog_item_id || p.id;
              const isInCart = cartItemIds.has(id);
              const isOutOfStock = p.stock_quantity <= 0;
              return (
                <div
                  key={id}
                  onClick={() => !isOutOfStock && handleItemClick(p, 'PRODUCT')}
                  className={`p-3 border-2 rounded-xl transition-all cursor-pointer ${
                    isOutOfStock
                      ? 'border-red-200 opacity-50 cursor-not-allowed bg-red-50'
                      : isInCart
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : 'border-orange-200 hover:border-orange-500'
                  }`}
                >
                  <div className="font-semibold text-sm text-slate-800 line-clamp-2">{p.name}</div>
                  <div className="font-medium text-sm text-emerald-700">{formatVND(p.selling_price)}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] text-slate-500">Tồn: {p.stock_quantity}</span>
                    {isOutOfStock && (
                      <span className="text-[9px] font-bold text-red-600 bg-red-100 px-1 rounded">Hết</span>
                    )}
                  </div>
                  {isInCart && (
                    <div className="text-[10px] font-bold text-emerald-600 mt-1">✓ Đã thêm</div>
                  )}
                </div>
              );
            })}
            {filteredProducts.length === 0 && (
              <div className="col-span-2 text-center text-slate-400 text-xs py-8">
                Không có sản phẩm bán
              </div>
            )}
          </div>
        )}

        {activeTab === 'PACKAGE' && (
          <div className="space-y-2">
            {filteredPackages.map((pkg) => {
              const id = pkg.id;
              const isInCart = cartItemIds.has(id);
              return (
                <div
                  key={id}
                  onClick={() => handleItemClick(pkg, 'PACKAGE')}
                  className={`p-3 border-2 rounded-xl transition-all cursor-pointer ${
                    isInCart
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : 'border-purple-200 hover:border-purple-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm text-purple-900">{pkg.name}</div>
                      <div className="font-medium text-sm text-emerald-700">{formatVND(pkg.price)}</div>
                      {pkg.validity_days && (
                        <div className="text-[10px] text-purple-500">⌛ {pkg.validity_days} ngày</div>
                      )}
                      <div className="mt-1 text-[10px] text-slate-500">
                        {pkg.items.map(i => i.service_name).join(', ')}
                      </div>
                      {isInCart && (
                        <div className="text-[10px] font-bold text-emerald-600 mt-1">✓ Đã thêm</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredPackages.length === 0 && (
              <div className="text-center text-slate-400 text-xs py-8">
                Không có gói
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};