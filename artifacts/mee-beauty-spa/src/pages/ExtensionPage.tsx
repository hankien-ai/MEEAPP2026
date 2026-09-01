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
  Zap,
  Calendar,
  ClipboardCheck,
  Grid,
  DollarSign,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Button, Spinner } from '@/components/primitives';

interface ExtensionModule {
  id: string;
  title: string;
  icon: React.ElementType;
  tabKey: string;
  adminOnly?: boolean;
  description?: string;
}

interface ExtensionPageProps {
  onNavigate: (tabKey: string) => void;
}

const ALL_MODULES: ExtensionModule[] = [
  { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, tabKey: 'dashboard', description: 'Trang chính' },
  { id: 'pos', title: 'POS', icon: ShoppingCart, tabKey: 'pos', description: 'Thu ngân, thanh toán' },
  { id: 'customers', title: 'Khách hàng', icon: Users, tabKey: 'customers', description: 'Quản lý hồ sơ' },
  { id: 'catalog', title: 'Danh mục', icon: Scissors, tabKey: 'catalog', description: 'Dịch vụ, sản phẩm' },
  { id: 'staff', title: 'Nhân viên', icon: UserCog, tabKey: 'staff', description: 'Quản lý nhân viên', adminOnly: true },
  { id: 'payroll', title: 'Bảng lương', icon: DollarSign, tabKey: 'payroll', description: 'Tính lương', adminOnly: true },
  { id: 'invoices', title: 'Hóa đơn', icon: FileText, tabKey: 'invoices', description: 'Lịch sử hóa đơn', adminOnly: true },
  { id: 'reports', title: 'Báo cáo', icon: BarChart3, tabKey: 'reports', description: 'Doanh thu, thống kê', adminOnly: true },
  { id: 'operations', title: 'Vận hành', icon: Sliders, tabKey: 'operations', description: 'Điều phối, báo cáo' },
  { id: 'settings', title: 'Cài đặt', icon: Settings, tabKey: 'settings', description: 'Cài đặt hệ thống', adminOnly: true },
  { id: 'appointments', title: 'Lịch hẹn', icon: Calendar, tabKey: 'appointments', description: 'Quản lý lịch hẹn' },
  { id: 'tasks', title: 'Công việc', icon: ClipboardCheck, tabKey: 'tasks', description: 'Quản lý công việc' },
];

const ExtensionPage: React.FC<ExtensionPageProps> = ({ onNavigate }) => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<ExtensionModule[]>([]);
  const [quickButtons, setQuickButtons] = useState<string[]>([]);
  const [isEditQuick, setIsEditQuick] = useState(false);
  const [isRearrange, setIsRearrange] = useState(false);

  // Load dữ liệu từ localStorage
  useEffect(() => {
    try {
      // Load thứ tự modules
      const savedOrder = localStorage.getItem('mee_module_order');
      let sortedModules = [...ALL_MODULES];
      if (savedOrder) {
        const order = JSON.parse(savedOrder);
        sortedModules = order
          .map((id: string) => ALL_MODULES.find((m) => m.id === id))
          .filter(Boolean) as ExtensionModule[];
        // Thêm các module mới chưa có trong order
        const existingIds = new Set(sortedModules.map((m) => m.id));
        ALL_MODULES.forEach((m) => {
          if (!existingIds.has(m.id)) sortedModules.push(m);
        });
      }
      setModules(sortedModules);

      // Load quick buttons
      const savedQuick = localStorage.getItem('mee_quick_buttons');
      if (savedQuick) {
        const parsed = JSON.parse(savedQuick);
        const validIds = parsed.filter((id: string) => ALL_MODULES.some((m) => m.id === id));
        setQuickButtons(validIds);
      } else {
        const defaultIds = ['dashboard', 'pos', 'customers'];
        if (isAdmin) defaultIds.push('staff', 'payroll');
        setQuickButtons(defaultIds);
        localStorage.setItem('mee_quick_buttons', JSON.stringify(defaultIds));
      }
    } catch (err) {
      console.error('Lỗi load dữ liệu Extension:', err);
      setModules(ALL_MODULES);
      setQuickButtons(['dashboard', 'pos', 'customers']);
    }
    setLoading(false);
  }, [isAdmin]);

  // Lưu thứ tự modules
  const saveModuleOrder = (newModules: ExtensionModule[]) => {
    setModules(newModules);
    localStorage.setItem('mee_module_order', JSON.stringify(newModules.map((m) => m.id)));
  };

  // Lưu quick buttons
  const saveQuickButtons = (ids: string[]) => {
    setQuickButtons(ids);
    localStorage.setItem('mee_quick_buttons', JSON.stringify(ids));
  };

  // Toggle quick
  const toggleQuick = (moduleId: string) => {
    if (quickButtons.includes(moduleId)) {
      saveQuickButtons(quickButtons.filter((id) => id !== moduleId));
    } else {
      saveQuickButtons([...quickButtons, moduleId]);
    }
  };

  // Di chuyển module lên
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newModules = [...modules];
    [newModules[index - 1], newModules[index]] = [newModules[index], newModules[index - 1]];
    saveModuleOrder(newModules);
  };

  // Di chuyển module xuống
  const moveDown = (index: number) => {
    if (index === modules.length - 1) return;
    const newModules = [...modules];
    [newModules[index], newModules[index + 1]] = [newModules[index + 1], newModules[index]];
    saveModuleOrder(newModules);
  };

  // Lọc module theo quyền
  const visibleModules = modules.filter((mod) => {
    if (mod.adminOnly && !isAdmin) return false;
    return true;
  });
  console.log('visibleModules:', visibleModules);

  // Quick modules
  const quickModules = visibleModules.filter((mod) => quickButtons.includes(mod.id));

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
          <div className="flex items-center gap-1">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRearrange(!isRearrange)}
              className={`rounded-full text-xs font-semibold px-3 py-1.5 h-auto transition-all ${
                isRearrange
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 shadow-sm'
              }`}
            >
              {isRearrange ? 'Xong' : 'Sắp xếp'}
            </Button>
          </div>
        )}
      </div>

      {/* Quick modules (truy cập nhanh) */}
      {quickModules.length > 0 && !isEditQuick && (
        <div className="mb-5 bg-white/80 border border-slate-200/60 p-3.5 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] backdrop-blur-md">
          <div className="flex items-center gap-1.5 mb-3 px-1">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Truy cập nhanh</span>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {quickModules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => onNavigate(mod.tabKey)}
                className="flex flex-col items-center group active:scale-95 transition-all"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50/70 rounded-2xl flex items-center justify-center border border-indigo-100/80 text-indigo-600 group-hover:bg-indigo-100/70 transition-all shadow-sm">
                  <mod.icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />
                </div>
                <span className="mt-1.5 text-[11px] font-medium text-slate-700 text-center line-clamp-1">
                  {mod.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chế độ sửa Quick */}
      {isEditQuick && (
        <div className="mb-4 bg-indigo-50/80 border border-indigo-100 rounded-2xl p-3 flex items-center justify-between text-xs text-indigo-900">
          <span className="font-medium">Chạm ứng dụng bên dưới để thêm/bớt Quick</span>
          <span className="font-bold bg-indigo-200/50 text-indigo-700 px-2 py-0.5 rounded-full text-[10px]">
            Đã chọn {quickButtons.length}
          </span>
        </div>
      )}

      {/* Grid tất cả module */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)]">
        <div className="grid grid-cols-4 gap-y-4 gap-x-2 sm:grid-cols-6 md:grid-cols-8">
          {visibleModules.map((mod, index) => {
            const Icon = mod.icon;
            const isQuick = quickButtons.includes(mod.id);
            const isAdminOnly = mod.adminOnly && !isAdmin;

            if (isAdminOnly) return null;

            return (
              <div
                key={mod.id}
                className="relative flex flex-col items-center select-none group"
              >
                <div
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all ${
                    isQuick && !isEditQuick
                      ? 'bg-indigo-50/80 text-indigo-600 border border-indigo-200/60 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border border-slate-200/50 group-hover:bg-slate-100'
                  }`}
                  onClick={() => {
                    if (isEditQuick) {
                      toggleQuick(mod.id);
                    } else {
                      onNavigate(mod.tabKey);
                    }
                  }}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />
                  {mod.adminOnly && !isEditQuick && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] font-bold px-1 rounded-full border border-white">
                      ADM
                    </span>
                  )}
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
                <span className="mt-1.5 text-[11px] font-medium text-slate-700 text-center line-clamp-1 max-w-[68px]">
                  {mod.title}
                </span>

                {/* Nút lên/xuống khi ở chế độ sắp xếp */}
                {isRearrange && (
                  <div className="absolute -right-4 top-0 flex flex-col gap-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveUp(index);
                      }}
                      className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveDown(index);
                      }}
                      className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isRearrange && (
        <div className="mt-3 text-center text-[10px] text-slate-400">
          Dùng nút lên/xuống để sắp xếp vị trí hiển thị
        </div>
      )}
    </div>
  );
};

export default ExtensionPage;