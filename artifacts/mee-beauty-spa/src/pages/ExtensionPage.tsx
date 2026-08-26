// src/pages/ExtensionPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  ShoppingCart,
  Users,
  UserCog,
  Clock,
  DollarSign,
  BarChart3,
  Package,
  Settings,
  QrCode,
  Plus,
  Grid,
  Scissors,
  Sliders,
  FileText,
  Gift,
  Home,
  LayoutDashboard
} from 'lucide-react';
import { Button, Card, Badge, Spinner } from '@/components/primitives';

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
    setIsEditQuick(false);
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
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mở rộng</h1>
          <p className="text-sm text-slate-500">Trung tâm điều khiển các tính năng</p>
        </div>
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={() => setIsEditQuick(!isEditQuick)}>
            {isEditQuick ? 'Hoàn tất' : 'Chỉnh sửa Quick'}
          </Button>
        )}
      </div>

      {/* Quick Button */}
      {quickModules.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick</span>
            {isEditQuick && <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Chọn module</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleModules.map(mod => {
              const isQuick = quickButtons.includes(mod.id);
              if (isEditQuick) {
                return (
                  <button
                    key={mod.id}
                    onClick={() => toggleQuickButton(mod.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isQuick ? 'bg-indigo-100 border-indigo-400 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}
                  >
                    {isQuick ? '✓' : <Plus className="w-3 h-3" />}
                    {mod.title}
                  </button>
                );
              } else if (isQuick) {
                const Icon = mod.icon;
                return (
                  <button
                    key={mod.id}
                    onClick={() => onNavigate(mod.tabKey)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-200"
                  >
                    <Icon className="w-4 h-4" />
                    {mod.title}
                  </button>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      {/* Danh sách module theo category */}
      <div className="space-y-6">
        {Object.entries(categories).map(([category, modules]) => (
          <div key={category}>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2">
              {category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {modules.map(mod => {
                const Icon = mod.icon;
                const isQuick = quickButtons.includes(mod.id);
                return (
                  <Card
                    key={mod.id}
                    className={`p-3 hover:shadow-md transition-shadow cursor-pointer border ${
                      isQuick ? 'border-indigo-300 bg-indigo-50/30' : 'border-slate-200'
                    }`}
                    onClick={() => onNavigate(mod.tabKey)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 text-sm">{mod.title}</span>
                          {isQuick && <Badge variant="info" className="text-[10px] px-1.5 py-0.5">Quick</Badge>}
                          {mod.adminOnly && <Badge variant="neutral" className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700">Admin</Badge>}
                        </div>
                        {mod.description && <p className="text-xs text-slate-500">{mod.description}</p>}
                      </div>
                    </div>
                  </Card>
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