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
}

export const POSCatalogPicker: React.FC<Props> = ({
  services,
  products,
  packages,
  onAddService,
  onAddProduct,
  onAddPackage,
  activeTab: externalTab
}) => {
  const [internalTab, setInternalTab] = useState<TabType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const activeTab = externalTab || internalTab;

  const formatVND = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  // Lọc sản phẩm: chỉ hiển thị RETAIL (sản phẩm bán)
  const retailProducts = products.filter(p => p.product_type === 'RETAIL');

  const getAllItems = () => {
    const all: { id: string; name: string; type: 'SERVICE' | 'PRODUCT' | 'PACKAGE'; price: number; duration?: number; items?: any[] }[] = [
      ...services.map(s => ({ ...s, type: 'SERVICE' as const })),
      ...retailProducts.map(p => ({ ...p, type: 'PRODUCT' as const })),
      ...packages.map(pkg => ({ ...pkg, type: 'PACKAGE' as const })),
    ];
    return all.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const handleSelect = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleAddSelected = () => {
    const allItems = getAllItems();
    selectedItems.forEach(id => {
      const item = allItems.find(i => i.id === id);
      if (item) {
        if (item.type === 'SERVICE') onAddService(item as CatalogServiceItem);
        else if (item.type === 'PRODUCT') onAddProduct(item as CatalogProductItem);
        else if (item.type === 'PACKAGE') onAddPackage(item as CatalogPackageItem);
      }
    });
    setSelectedItems(new Set());
  };

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = retailProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPackages = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allItems = getAllItems();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
        <div className="flex bg-slate-200/80 p-1 rounded-xl gap-1 overflow-x-auto">
          <button
            onClick={() => setInternalTab('ALL')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Tất cả ({services.length + retailProducts.length + packages.length})
          </button>
          <button
            onClick={() => setInternalTab('SERVICE')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'SERVICE'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💆‍♀️ DV ({services.length})
          </button>
          <button
            onClick={() => setInternalTab('PRODUCT')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'PRODUCT'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🧴 SP ({retailProducts.length})
          </button>
          <button
            onClick={() => setInternalTab('PACKAGE')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'PACKAGE'
                ? 'bg-white text-emerald-700 shadow-sm'
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
              const isSelected = selectedItems.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`p-2.5 border-2 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <div className="font-semibold text-xs text-slate-800 line-clamp-2">{item.name}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] font-medium text-emerald-700">{formatVND(item.price)}</span>
                        {item.type === 'SERVICE' && (
                          <span className="text-[9px] text-slate-400 bg-slate-100 px-1 rounded">DV</span>
                        )}
                        {item.type === 'PRODUCT' && (
                          <span className="text-[9px] text-slate-400 bg-slate-100 px-1 rounded">SP</span>
                        )}
                        {item.type === 'PACKAGE' && (
                          <span className="text-[9px] text-purple-400 bg-purple-50 px-1 rounded">Gói</span>
                        )}
                      </div>
                    </div>
                    {isSelected && <span className="text-emerald-600 text-sm">✓</span>}
                  </div>
                  {item.type === 'SERVICE' && (item as any).duration_minutes && (
                    <div className="text-[10px] text-slate-400 mt-0.5">⏱ {(item as any).duration_minutes} phút</div>
                  )}
                  {item.type === 'PACKAGE' && (item as CatalogPackageItem).items && (
                    <div className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">
                      {(item as CatalogPackageItem).items.map(i => i.service_name).join(', ')}
                    </div>
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
              const isSelected = selectedItems.has(s.id);
              return (
                <div
                  key={s.id}
                  onClick={() => handleSelect(s.id)}
                  className={`p-2.5 border-2 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <div className="font-semibold text-xs text-slate-800 line-clamp-2">{s.name}</div>
                      <div className="font-medium text-[11px] text-emerald-700">{formatVND(s.price)}</div>
                      {s.duration_minutes && (
                        <div className="text-[10px] text-slate-400">⏱ {s.duration_minutes} phút</div>
                      )}
                    </div>
                    {isSelected && <span className="text-emerald-600 text-sm">✓</span>}
                  </div>
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
              const isSelected = selectedItems.has(p.id);
              const isLowStock = p.stock_quantity <= p.minimum_stock;
              const isOutOfStock = p.stock_quantity <= 0;
              return (
                <div
                  key={p.id}
                  onClick={() => !isOutOfStock && handleSelect(p.id)}
                  className={`p-2.5 border-2 rounded-xl transition-all cursor-pointer ${
                    isOutOfStock
                      ? 'border-red-200 opacity-50 cursor-not-allowed'
                      : isSelected
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <div className="font-semibold text-xs text-slate-800 line-clamp-2">{p.name}</div>
                      <div className="font-medium text-[11px] text-emerald-700">{formatVND(p.selling_price)}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] text-slate-500">Tồn: {p.stock_quantity}</span>
                        {isOutOfStock && (
                          <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1 rounded">Hết</span>
                        )}
                        {isLowStock && !isOutOfStock && (
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 rounded">Sắp hết</span>
                        )}
                      </div>
                    </div>
                    {isSelected && <span className="text-emerald-600 text-sm">✓</span>}
                  </div>
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
              const isSelected = selectedItems.has(pkg.id);
              return (
                <div
                  key={pkg.id}
                  onClick={() => handleSelect(pkg.id)}
                  className={`p-3 border-2 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <div className="font-bold text-sm text-purple-900">{pkg.name}</div>
                      <div className="font-medium text-sm text-purple-700">{formatVND(pkg.price)}</div>
                      {pkg.validity_days && (
                        <div className="text-[10px] text-purple-500">⌛ {pkg.validity_days} ngày</div>
                      )}
                      <div className="mt-1 text-[10px] text-slate-500 line-clamp-1">
                        {pkg.items.map(i => i.service_name).join(', ')}
                      </div>
                    </div>
                    {isSelected && <span className="text-purple-600 text-sm">✓</span>}
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

      {/* Nút Thêm các mục đã chọn */}
      {selectedItems.size > 0 && (
        <div className="p-3 border-t border-slate-200 bg-slate-50/80">
          <button
            onClick={handleAddSelected}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            + Thêm {selectedItems.size} mục đã chọn
          </button>
        </div>
      )}
    </div>
  );
};