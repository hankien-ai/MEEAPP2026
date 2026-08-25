// src/components/bottom-toolbar.tsx
import React, { useState } from "react";
import {
  Home,
  Users,
  ShoppingCart,
  UserCog,
  MoreHorizontal,
  Zap,
  Package,
  Sliders,
  LayoutDashboard,
  X,
  Settings,
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
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isQuickOpen, setIsQuickOpen] = useState(false);

  const normalizedRole = userRole.toLowerCase();
  const isAdmin = ["admin", "owner", "manager", "quan_ly"].includes(normalizedRole);

  // Tất cả các module có sẵn
  const allModules: NavItem[] = [
    { key: "dashboard", label: "Trang chính", icon: Home },
    { key: "customers", label: "Khách hàng", icon: Users },
    { key: "pos", label: "POS", icon: ShoppingCart },
    { key: "catalog", label: "Danh mục", icon: Package },
    { key: "operations", label: "Vận hành", icon: Sliders },
    { key: "staff", label: "Nhân viên", icon: UserCog },
    { key: "settings", label: "Cài đặt", icon: Settings },
  ];

  // Lọc theo visibleTabs
  const visibleModules = allModules.filter(m => visibleTabs.includes(m.key));

  // Nhóm cố định cho admin: Home, Customers, Staff
  const adminFixed = visibleModules.filter(m => m.key === 'dashboard' || m.key === 'customers' || m.key === 'staff');
  // Các module còn lại (cho quick và more)
  const otherModules = visibleModules.filter(m => m.key !== 'dashboard' && m.key !== 'customers' && m.key !== 'staff');

  // Phân chia otherModules thành quick (có thể tùy chỉnh, mặc định lấy 2-3 module) và more
  // Giả sử quick lấy 2 module đầu, phần còn lại vào more
  const quickModules = otherModules.slice(0, 2);
  const moreModules = otherModules.slice(2);

  // Staff mode: hiển thị tối đa 5 nút: Home, Customers, POS, Staff, More (nếu có thêm)
  const staffMain = visibleModules.filter(m => m.key === 'dashboard' || m.key === 'customers' || m.key === 'pos' || m.key === 'staff');
  const staffExtra = visibleModules.filter(m => !staffMain.some(s => s.key === m.key));

  const handleTabClick = (tabKey: string) => {
    onSelectTab(tabKey);
    setIsMoreOpen(false);
    setIsQuickOpen(false);
  };

  if (isAdmin) {
    return (
      <>
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-[env(safe-area-inset-bottom,0px)]">
          <div className="grid grid-cols-5 items-center h-16 px-1 max-w-md mx-auto sm:max-w-none">
            {/* 1. Home */}
            <button
              onClick={() => handleTabClick("dashboard")}
              className={`flex flex-col items-center justify-center py-1 transition-all ${
                activeTab === "dashboard"
                  ? "text-teal-600 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Home className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Trang chính</span>
            </button>

            {/* 2. Khách hàng */}
            <button
              onClick={() => handleTabClick("customers")}
              className={`flex flex-col items-center justify-center py-1 transition-all ${
                activeTab === "customers"
                  ? "text-teal-600 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Users className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Khách hàng</span>
            </button>

            {/* 3. Quick (nút giữa) */}
            <div className="relative flex justify-center -top-3">
              <button
                onClick={() => setIsQuickOpen(true)}
                className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-teal-600 text-white shadow-xl shadow-teal-600/30 border-4 border-white active:scale-95 transition-all"
              >
                <Zap className="w-7 h-7 fill-white/20" />
                <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">
                  Nhanh
                </span>
              </button>
            </div>

            {/* 4. Nhân viên */}
            <button
              onClick={() => handleTabClick("staff")}
              className={`flex flex-col items-center justify-center py-1 transition-all ${
                activeTab === "staff"
                  ? "text-teal-600 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <UserCog className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Nhân viên</span>
            </button>

            {/* 5. Mở rộng */}
            <button
              onClick={() => setIsMoreOpen(true)}
              className={`flex flex-col items-center justify-center py-1 transition-all ${
                isMoreOpen || moreModules.some(m => m.key === activeTab)
                  ? "text-teal-600 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <MoreHorizontal className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Mở rộng</span>
            </button>
          </div>
        </nav>

        {/* Quick Drawer */}
        {isQuickOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsQuickOpen(false)} />
            <div className="relative bg-white rounded-t-3xl p-5 shadow-2xl z-10 max-w-md mx-auto w-full border-t border-slate-100 animate-in slide-in-from-bottom duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                  TRUY CẬP NHANH
                </h3>
                <button onClick={() => setIsQuickOpen(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 pb-2">
                {quickModules.length > 0 ? (
                  quickModules.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.key}
                        onClick={() => { handleTabClick(item.key); setIsQuickOpen(false); }}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                          activeTab === item.key
                            ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-bold shadow-xs"
                            : "bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold">{item.label}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center text-xs text-slate-400 py-4">
                    Không có module nào để thêm vào nhanh.
                  </div>
                )}
              </div>
              <div className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100">
                Quản lý có thể cấu hình module nhanh trong Cài đặt
              </div>
            </div>
          </div>
        )}

        {/* More Drawer */}
        {isMoreOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsMoreOpen(false)} />
            <div className="relative bg-white rounded-t-3xl p-5 shadow-2xl z-10 max-w-md mx-auto w-full border-t border-slate-100 animate-in slide-in-from-bottom duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">Chức năng mở rộng</h3>
                <button onClick={() => setIsMoreOpen(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 pb-2">
                {moreModules.length > 0 ? (
                  moreModules.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.key}
                        onClick={() => { handleTabClick(item.key); setIsMoreOpen(false); }}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                          activeTab === item.key
                            ? "bg-teal-50 border-teal-500 text-teal-700 font-bold shadow-xs"
                            : "bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-teal-100/80 text-teal-700 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold">{item.label}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center text-xs text-slate-400 py-4">
                    Không có module nào trong mở rộng.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ==================== STAFF MODE ====================
  // Staff hiển thị tối đa 5 nút: Home, Customers, POS, Staff, More (nếu có thêm)
  const staffMainItems = visibleModules.filter(m => m.key === 'dashboard' || m.key === 'customers' || m.key === 'pos' || m.key === 'staff');
  const staffExtraItems = visibleModules.filter(m => !staffMainItems.some(s => s.key === m.key));

  // Đảm bảo luôn có 5 vị trí, nếu thiếu thì thêm placeholder
  const displayItems = [...staffMainItems];
  while (displayItems.length < 4) {
    displayItems.push({ key: `empty-${displayItems.length}`, label: '', icon: Home } as NavItem);
  }
  const hasExtra = staffExtraItems.length > 0;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-[env(safe-area-inset-bottom,0px)]">
        <div className="grid grid-cols-5 items-center h-16 px-1 max-w-md mx-auto sm:max-w-none">
          {displayItems.slice(0, 4).map((item) => {
            if (item.key.startsWith('empty-')) {
              return <div key={item.key} className="flex flex-col items-center justify-center py-1" />;
            }
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => handleTabClick(item.key)}
                className={`flex flex-col items-center justify-center py-1 transition-all ${
                  activeTab === item.key
                    ? "text-teal-600 font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}

          {/* Nút Mở rộng (vị trí thứ 5) */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              isMoreOpen || staffExtraItems.some(m => m.key === activeTab)
                ? "text-teal-600 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <MoreHorizontal className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Mở rộng</span>
          </button>
        </div>
      </nav>

      {/* More Drawer cho Staff */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsMoreOpen(false)} />
          <div className="relative bg-white rounded-t-3xl p-5 shadow-2xl z-10 max-w-md mx-auto w-full border-t border-slate-100 animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Chức năng mở rộng</h3>
              <button onClick={() => setIsMoreOpen(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4 pb-2">
              {staffExtraItems.length > 0 ? (
                staffExtraItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => { handleTabClick(item.key); setIsMoreOpen(false); }}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                        activeTab === item.key
                          ? "bg-teal-50 border-teal-500 text-teal-700 font-bold shadow-xs"
                          : "bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-teal-100/80 text-teal-700 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold">{item.label}</span>
                    </button>
                  );
                })
              ) : (
                <div className="col-span-2 text-center text-xs text-slate-400 py-4">
                  Không có module nào thêm.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};