// src/components/bottom-toolbar.tsx
import React, { useState } from "react";
import {
  Home,
  Users,
  ShoppingCart,
  UserCog,
  Zap,
  Package,
  Sliders,
  X,
  Settings,
  Grid,
  Check,
} from "lucide-react";

interface BottomToolbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  userRole?: string;
  visibleTabs?: string[];
}

interface NavItem {
  key: string;
  label: string;
  icon: React.ElementType;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  activeTab,
  onSelectTab,
  userRole = "staff",
  visibleTabs = [],
}) => {
  const [isQuickOpen, setIsQuickOpen] = useState(false);
  const normalizedRole = userRole.toLowerCase();
  const isAdmin = ["admin", "owner", "manager", "quan_ly"].includes(normalizedRole);

  // Đọc danh sách quick buttons từ localStorage
  const [quickButtons, setQuickButtons] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mee_quick_buttons');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Chỉ giữ các module hợp lệ
        const allKeys = allModules.map(m => m.key);
        return parsed.filter((key: string) => allKeys.includes(key));
      }
    } catch {}
    // Mặc định: pos và customers
    return ['pos', 'customers'];
  });

  // Lưu vào localStorage khi thay đổi
  const saveQuickButtons = (keys: string[]) => {
    setQuickButtons(keys);
    localStorage.setItem('mee_quick_buttons', JSON.stringify(keys));
  };

  const toggleQuickButton = (key: string) => {
    if (quickButtons.includes(key)) {
      saveQuickButtons(quickButtons.filter(k => k !== key));
    } else {
      saveQuickButtons([...quickButtons, key]);
    }
  };

  const allModules: NavItem[] = [
    { key: "dashboard", label: "Trang chính", icon: Home },
    { key: "customers", label: "Khách hàng", icon: Users },
    { key: "pos", label: "POS", icon: ShoppingCart },
    { key: "catalog", label: "Danh mục", icon: Package },
    { key: "operations", label: "Vận hành", icon: Sliders },
    { key: "staff", label: "Nhân viên", icon: UserCog },
    { key: "settings", label: "Cài đặt", icon: Settings },
  ];

  const visibleModules = allModules.filter(m => visibleTabs.includes(m.key));
  const quickModules = visibleModules.filter(m => quickButtons.includes(m.key));

  // Admin layout
  const adminMain = visibleModules.filter(m => m.key === 'dashboard' || m.key === 'customers' || m.key === 'staff');
  const otherModules = visibleModules.filter(m => m.key !== 'dashboard' && m.key !== 'customers' && m.key !== 'staff');
  // quickModules đã được lọc ở trên

  // Staff layout
  const staffMain = visibleModules.filter(m => m.key === 'dashboard' || m.key === 'customers' || m.key === 'pos' || m.key === 'staff');
  const displayItems = [...staffMain];
  while (displayItems.length < 4) {
    displayItems.push({ key: `empty-${displayItems.length}`, label: '', icon: Home } as NavItem);
  }

  const handleTabClick = (tabKey: string) => {
    onSelectTab(tabKey);
    setIsQuickOpen(false);
  };

  if (isAdmin) {
    return (
      <>
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-[env(safe-area-inset-bottom,0px)]">
          <div className="grid grid-cols-5 items-center h-16 px-1 max-w-md mx-auto sm:max-w-none">
            <button onClick={() => handleTabClick("dashboard")}
              className={`flex flex-col items-center justify-center py-1 transition-all ${activeTab === "dashboard" ? "text-teal-600 font-bold" : "text-slate-500 hover:text-slate-800"}`}>
              <Home className="w-5 h-5 mb-0.5" /><span className="text-[10px] tracking-tight">Trang chính</span>
            </button>
            <button onClick={() => handleTabClick("customers")}
              className={`flex flex-col items-center justify-center py-1 transition-all ${activeTab === "customers" ? "text-teal-600 font-bold" : "text-slate-500 hover:text-slate-800"}`}>
              <Users className="w-5 h-5 mb-0.5" /><span className="text-[10px] tracking-tight">Khách hàng</span>
            </button>
            <div className="relative flex justify-center -top-3">
              <button onClick={() => setIsQuickOpen(true)}
                className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-teal-600 text-white shadow-xl shadow-teal-600/30 border-4 border-white active:scale-95 transition-all">
                <Zap className="w-7 h-7 fill-white/20" /><span className="text-[8px] font-black uppercase tracking-wider mt-0.5">Nhanh</span>
              </button>
            </div>
            <button onClick={() => handleTabClick("staff")}
              className={`flex flex-col items-center justify-center py-1 transition-all ${activeTab === "staff" ? "text-teal-600 font-bold" : "text-slate-500 hover:text-slate-800"}`}>
              <UserCog className="w-5 h-5 mb-0.5" /><span className="text-[10px] tracking-tight">Nhân viên</span>
            </button>
            <button onClick={() => handleTabClick("extension")}
              className={`flex flex-col items-center justify-center py-1 transition-all ${activeTab === "extension" ? "text-teal-600 font-bold" : "text-slate-500 hover:text-slate-800"}`}>
              <Grid className="w-5 h-5 mb-0.5" /><span className="text-[10px] tracking-tight">Mở rộng</span>
            </button>
          </div>
        </nav>

        {isQuickOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsQuickOpen(false)} />
            <div className="relative bg-white rounded-t-3xl p-5 shadow-2xl z-10 max-w-md mx-auto w-full border-t border-slate-100 animate-in slide-in-from-bottom duration-200 max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 shrink-0">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" /> TÙY CHỈNH TRUY CẬP NHANH
                </h3>
                <button onClick={() => setIsQuickOpen(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 py-3 space-y-1">
                {allModules.map((item) => {
                  if (!visibleTabs.includes(item.key)) return null;
                  const isActive = quickButtons.includes(item.key);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => toggleQuickButton(item.key)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isActive ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isActive ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                      }`}>
                        {isActive && <Check className="w-4 h-4" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="border-t pt-3 shrink-0 flex justify-between items-center">
                <span className="text-xs text-slate-400">Chọn module để thêm vào thanh nhanh</span>
                <button
                  onClick={() => {
                    setIsQuickOpen(false);
                    onSelectTab('extension');
                  }}
                  className="text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:underline"
                >
                  <Settings className="w-3.5 h-3.5" /> Quản lý nâng cao
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Staff layout (giữ nguyên)
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-[env(safe-area-inset-bottom,0px)]">
      <div className="grid grid-cols-5 items-center h-16 px-1 max-w-md mx-auto sm:max-w-none">
        {displayItems.slice(0, 4).map((item) => {
          if (item.key.startsWith('empty-')) return <div key={item.key} className="flex flex-col items-center justify-center py-1" />;
          const Icon = item.icon;
          return (
            <button key={item.key} onClick={() => handleTabClick(item.key)}
              className={`flex flex-col items-center justify-center py-1 transition-all ${activeTab === item.key ? "text-teal-600 font-bold" : "text-slate-500 hover:text-slate-800"}`}>
              <Icon className="w-5 h-5 mb-0.5" /><span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
        <button onClick={() => handleTabClick("extension")}
          className={`flex flex-col items-center justify-center py-1 transition-all ${activeTab === "extension" ? "text-teal-600 font-bold" : "text-slate-500 hover:text-slate-800"}`}>
          <Grid className="w-5 h-5 mb-0.5" /><span className="text-[10px] tracking-tight">Mở rộng</span>
        </button>
      </div>
    </nav>
  );
};