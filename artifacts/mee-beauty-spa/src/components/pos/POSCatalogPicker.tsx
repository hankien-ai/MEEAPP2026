// src/components/pos/POSCatalogPicker.tsx
import React, { useState, useMemo } from "react";
import {
  CatalogServiceItem,
  CatalogProductItem,
  CatalogPackageItem
} from "@/types/pos";
import { Package, Scissors, ShoppingBag, Grid, Clock, Search } from "lucide-react";

type TabType = 'ALL' | 'SERVICE' | 'PRODUCT' | 'PACKAGE';

// Hàm bỏ dấu
function removeAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

interface Props {
  services: CatalogServiceItem[];
  products: CatalogProductItem[];
  packages: CatalogPackageItem[];
  onAddService: (item: CatalogServiceItem) => void;
  onAddProduct: (item: CatalogProductItem) => void;
  onAddPackage: (item: CatalogPackageItem) => void;
  activeTab?: TabType;
  cartItemIds?: Set<string>;
  recentServices?: CatalogServiceItem[];
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
  recentServices = [],
}) => {
  const [internalTab, setInternalTab] = useState<TabType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const activeTab = externalTab || internalTab;

  const formatVND = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  // Chỉ hiển thị sản phẩm RETAIL
  const retailProducts = products.filter(p => p.product_type === 'RETAIL');

  // Tìm kiếm không dấu
  const filterItems = <T extends { name: string }>(items: T[], query: string): T[] => {
    if (!query.trim()) return items;
    const keyword = removeAccents(query.trim().toLowerCase());
    return items.filter(item => removeAccents(item.name.toLowerCase()).includes(keyword));
  };

  const filteredServices = useMemo(() => filterItems(services, searchQuery), [services, searchQuery]);
  const filteredProducts = useMemo(() => filterItems(retailProducts, searchQuery), [retailProducts, searchQuery]);
  const filteredPackages = useMemo(() => filterItems(packages, searchQuery), [packages, searchQuery]);

  // ALL tab: gộp tất cả
  const allItems = useMemo(() => {
    const list = [
      ...services.map(s => ({ ...s, type: 'SERVICE' as const })),
      ...retailProducts.map(p => ({ ...p, type: 'PRODUCT' as const })),
      ...packages.map(pkg => ({ ...pkg, type: 'PACKAGE' as const })),
    ];
    return filterItems(list, searchQuery);
  }, [services, retailProducts, packages, searchQuery]);

  // Khi click vào item, thêm vào giỏ
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

  // Tab config
  const tabs: { key: TabType; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'ALL', label: 'Tất cả', icon: <Grid className="w-4 h-4" />, count: allItems.length },
    { key: 'SERVICE', label: 'Dịch vụ', icon: <Scissors className="w-4 h-4" />, count: filteredServices.length },
    { key: 'PRODUCT', label: 'Sản phẩm', icon: <ShoppingBag className="w-4 h-4" />, count: filteredProducts.length },
    { key: 'PACKAGE', label: 'Gói', icon: <Package className="w-4 h-4" />, count: filteredPackages.length },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Thanh tìm kiếm */}
      <div className="p-3 border-b border-slate-100 bg-slate-50/50">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm không dấu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Tab navigation – icon trên, chữ dưới */}
      <div className="flex bg-white border-b border-slate-100 p-1 gap-0.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setInternalTab(tab.key)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className={`${isActive ? 'text-white' : 'text-slate-500'}`}>
                {tab.icon}
              </span>
              <span className="mt-0.5">{tab.label}</span>
              {tab.count > 0 && (
                <span className={`text-[9px] ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                  ({tab.count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Danh sách gợi ý dịch vụ gần đây */}
      {recentServices.length > 0 && searchQuery.trim() === '' && (
        <div className="p-2 bg-blue-50/50 border-b border-blue-100">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-blue-700 mb-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Gần đây</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {recentServices.slice(0, 5).map((service) => {
              const isInCart = cartItemIds.has(service.catalog_item_id || service.id);
              return (
                <button
                  key={service.id}
                  onClick={() => handleItemClick(service, 'SERVICE')}
                  disabled={isInCart}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${
                    isInCart
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300 cursor-not-allowed opacity-60'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {service.name}
                  {isInCart && ' ✓'}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid items */}
      <div className="p-3 overflow-y-auto flex-1 max-h-[420px]">
        {activeTab === 'ALL' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allItems.map((item) => {
              const id = getItemId(item);
              const isInCart = cartItemIds.has(id);
              return (
                <div
                  key={id}
                  onClick={() => handleItemClick(item, item.type)}
                  className={`p-2.5 border-2 rounded-xl transition-all cursor-pointer ${
                    isInCart
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : getBorderColor(item.type, false)
                  }`}
                >
                  <div className="font-semibold text-sm text-slate-800 line-clamp-2">{item.name}</div>
                  <div className="font-medium text-sm text-emerald-700">{formatVND(item.price)}</div>
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
              <div className="col-span-full text-center text-slate-400 text-xs py-8">
                Không tìm thấy kết quả
              </div>
            )}
          </div>
        )}

        {activeTab === 'SERVICE' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredServices.map((s) => {
              const id = s.catalog_item_id || s.id;
              const isInCart = cartItemIds.has(id);
              return (
                <div
                  key={id}
                  onClick={() => handleItemClick(s, 'SERVICE')}
                  className={`p-2.5 border-2 rounded-xl transition-all cursor-pointer ${
                    isInCart
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : 'border-blue-200 hover:border-blue-500'
                  }`}
                >
                  <div className="font-semibold text-sm text-slate-800 line-clamp-2">{s.name}</div>
                  <div className="font-medium text-sm text-emerald-700">{formatVND(s.price)}</div>
                  {isInCart && (
                    <div className="text-[10px] font-bold text-emerald-600 mt-1">✓ Đã thêm</div>
                  )}
                </div>
              );
            })}
            {filteredServices.length === 0 && (
              <div className="col-span-full text-center text-slate-400 text-xs py-8">
                Không có dịch vụ
              </div>
            )}
          </div>
        )}

        {activeTab === 'PRODUCT' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredProducts.map((p) => {
              const id = p.catalog_item_id || p.id;
              const isInCart = cartItemIds.has(id);
              const isOutOfStock = p.stock_quantity <= 0;
              return (
                <div
                  key={id}
                  onClick={() => !isOutOfStock && handleItemClick(p, 'PRODUCT')}
                  className={`p-2.5 border-2 rounded-xl transition-all cursor-pointer ${
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
              <div className="col-span-full text-center text-slate-400 text-xs py-8">
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
                  className={`p-2.5 border-2 rounded-xl transition-all cursor-pointer ${
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