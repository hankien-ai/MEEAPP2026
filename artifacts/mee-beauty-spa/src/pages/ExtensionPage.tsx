// src/pages/ExtensionPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  ShoppingCart,
  Users,
  UserCog,
  BarChart3,
  Settings,
  Plus,
  Scissors,
  Sliders,
  FileText,
  LayoutDashboard,
  Check,
  Zap
} from 'lucide-react';
import { Button, Spinner } from '@/components/primitives';

interface ExtensionModule {
  id: string;
  title: string;
  icon: React.ElementType;
  tabKey: string;
  category: string;
  adminOnly?: boolean;
  description?: string;
}

interface ExtensionPageProps {
  onNavigate: (tabKey: string) => void;
}

const ALL_MODULES: ExtensionModule[] = [
  { id: 'pos', title: 'POS', icon: ShoppingCart, tabKey: 'pos', category: 'Bán hàng', description: 'Thu ngân, thanh toán' },
  { id: 'invoices', title: 'Hóa đơn', icon: FileText, tabKey: 'invoices', category: 'Bán hàng', description: 'Lịch sử hóa đơn' },
  { id: 'customers', title: 'Khách hàng', icon: Users, tabKey: 'customers', category: 'Khách hàng', description: 'Quản lý hồ sơ' },
  { id: 'staff', title: 'Nhân viên', icon: UserCog, tabKey: 'staff', category: 'Nhân viên', description: 'Quản lý nhân viên' },
  { id: 'catalog', title: 'Danh mục', icon: Scissors, tabKey: 'catalog', category: 'Kho', description: 'Dịch vụ, sản phẩm' },
  { id: 'operations', title: 'Vận hành', icon: Sliders, tabKey: 'operations', category: 'Vận hành', description: 'Điều phối, báo cáo' },
  { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, tabKey: 'dashboard', category: 'Tổng quan', description: 'Trang chính' },
  { id: 'reports', title: 'Báo cáo', icon: BarChart3, tabKey: 'reports', category: 'Báo cáo', description: 'Doanh thu, thống kê', adminOnly: true },
  { id: 'settings', title: 'Cài đặt', icon: Settings, tabKey: 'settings', category: 'Cài đặt', description: 'Cài đặt hệ thống', adminOnly: true },
];

const ExtensionPage: React.FC<ExtensionPageProps> = ({ onNavigate }) => {
  const { role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [quickButtons, setQuickButtons] = useState<string[]>([]);
  const [isEditQuick, setIsEditQuick] = useState(false);
  const isAdmin = role === 'admin';

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mee_quick_buttons');
      if (saved) {
        const parsed = JSON.parse(saved);
        const validIds = parsed.filter((id: string) => ALL_MODULES.some(m => m.id === id));
        setQuickButtons(validIds);
      } else {
        const defaultIds = ['pos', 'customers'];
        if (isAdmin) defaultIds.push('settings');
        setQuickButtons(defaultIds);
        localStorage.setItem('mee_quick_buttons', JSON.stringify(defaultIds));
      }
    } catch {
      setQuickButtons(['pos', 'customers']);
    }
    setLoading(false);
  }, [isAdmin]);

  const saveQuickButtons = (ids: string[]) => {
    setQuickButtons(ids);
    localStorage.setItem('mee_quick_buttons', JSON.stringify(ids));
  };

  const toggleQuickButton = (moduleId: string) => {
    if (quickButtons.includes(moduleId)) {
      saveQuickButtons(quickButtons.filter(id => id !== moduleId));
    } else {
      saveQuickButtons([...quickButtons, moduleId]);
    }
  };

  const visibleModules = ALL_MODULES.filter(mod => {
    if (mod.adminOnly && !isAdmin) return false;
    return true;
  });

  const categories = visibleModules.reduce((acc, mod) => {
    if (!acc[mod.category]) acc[mod.category] = [];
    acc[mod.category].push(mod);
    return acc;
  }, {} as Record<string, ExtensionModule[]>);

  const quickModules = ALL_MODULES.filter(mod => quickButtons.includes(mod.id) && (!mod.adminOnly || (mod.adminOnly && isAdmin)));

  if (loading) return <Spinner className="py-12" />;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F8FAFC] p-4 pb-12 sm:max-w-2xl lg:max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pt-1">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Tiện ích</h1>
          <p className="text-xs text-slate-400 font-medium">Trung tâm điều khiển ứng dụng</p>
        </div>
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditQuick(!isEditQuick)}
            className={`rounded-full text-xs font-semibold px-3 py-1.5 h-auto transition-all ${
              isEditQuick 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 shadow-sm'
            }`}
          >
            {isEditQuick ? 'Hoàn tất' : 'Sửa Quick'}
          </Button>
        )}
      </div>

      {/* Widget Quick Minimalist */}
      {quickModules.length > 0 && !isEditQuick && (
        <div className="mb-5 bg-white/80 border border-slate-200/60 p-3.5 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] backdrop-blur-md">
          <div className="flex items-center gap-1.5 mb-3 px-1">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Truy cập nhanh</span>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {quickModules.map(mod => {
              const Icon = mod.icon;
              return (
                <button
                  key={mod.id}
                  onClick={() => onNavigate(mod.tabKey)}
                  className="flex flex-col items-center group active:scale-95 transition-all"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50/70 rounded-2xl flex items-center justify-center border border-indigo-100/80 text-indigo-600 group-hover:bg-indigo-100/70 transition-all shadow-sm">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />
                  </div>
                  <span className="mt-1.5 text-[11px] font-medium text-slate-700 text-center line-clamp-1">
                    {mod.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chế độ sửa Quick Banner */}
      {isEditQuick && (
        <div className="mb-4 bg-indigo-50/80 border border-indigo-100 rounded-2xl p-3 flex items-center justify-between text-xs text-indigo-900">
          <span className="font-medium">Chạm ứng dụng bên dưới để thêm/bớt</span>
          <span className="font-bold bg-indigo-200/50 text-indigo-700 px-2 py-0.5 rounded-full text-[10px]">
            Đã chọn {quickButtons.length}
          </span>
        </div>
      )}

      {/* Grid Apps Theo Danh Mục */}
      <div className="space-y-4">
        {Object.entries(categories).map(([category, modules]) => (
          <div key={category} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)]">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
              {category}
            </h2>

            <div className="grid grid-cols-4 gap-y-4 gap-x-2 sm:grid-cols-6 md:grid-cols-8">
              {modules.map(mod => {
                const Icon = mod.icon;
                const isQuick = quickButtons.includes(mod.id);

                return (
                  <div
                    key={mod.id}
                    onClick={() => {
                      if (isEditQuick) {
                        toggleQuickButton(mod.id);
                      } else {
                        onNavigate(mod.tabKey);
                      }
                    }}
                    className="flex flex-col items-center cursor-pointer group active:scale-95 transition-transform select-none"
                  >
                    {/* App Icon Box */}
                    <div
                      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all ${
                        isQuick && !isEditQuick
                          ? 'bg-indigo-50/80 text-indigo-600 border border-indigo-200/60 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border border-slate-200/50 group-hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />

                      {/* Flag Admin */}
                      {mod.adminOnly && !isEditQuick && (
                        <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] font-bold px-1 rounded-full border border-white">
                          ADM
                        </span>
                      )}

                      {/* Check mark khi Edit */}
                      {isEditQuick && (
                        <div
                          className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-all ${
                            isQuick ? 'bg-indigo-600 text-white scale-105' : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isQuick ? <Check className="w-3 h-3 stroke-[3]" /> : <Plus className="w-3 h-3 stroke-[3]" />}
                        </div>
                      )}
                    </div>

                    {/* App Title */}
                    <span className="mt-1.5 text-[11px] font-medium text-slate-700 text-center line-clamp-1 max-w-[68px]">
                      {mod.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExtensionPage;