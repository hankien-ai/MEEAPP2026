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
} from "lucide-react";

interface BottomToolbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  userRole?: string;
}

interface NavItem {
  key: string;
  label: string;
  icon: React.ElementType;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  activeTab,
  onSelectTab,
  userRole = "owner",
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isQuickAccessOpen, setIsQuickAccessOpen] = useState(false);

  const normalizedRole = userRole.toLowerCase();
  const isManager = ["admin", "owner", "manager", "quan_ly"].includes(
    normalizedRole,
  );

  // Chức năng trong menu Mở Rộng dành cho Nhân Viên
  const staffExtraModules: NavItem[] = [
    { key: "catalog", label: "Danh mục & Gói", icon: Package },
    { key: "operations", label: "Vận hành", icon: Sliders },
  ];

  // Chức năng trong menu CHUYỂN NHANH dành cho Quản Lý
  const managerQuickModules: NavItem[] = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "customers", label: "Khách hàng", icon: Users },
    { key: "pos", label: "Bán hàng (POS)", icon: ShoppingCart },
    { key: "catalog", label: "Danh mục & Gói", icon: Package },
    { key: "staff", label: "Nhân viên", icon: UserCog },
    { key: "operations", label: "Vận hành", icon: Sliders },
  ];

  const handleTabClick = (tabKey: string) => {
    onSelectTab(tabKey);
    setIsMoreOpen(false);
    setIsQuickAccessOpen(false);
  };

  return (
    <>
      {/* TOOLBAR NẰM FIXED Ở ĐÁY MÀN HÌNH */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-[env(safe-area-inset-bottom,0px)]">
        {!isManager ? (
          /* ==================== NAVBAR NHÂN VIÊN (5 NÚT) ==================== */
          <div className="grid grid-cols-5 items-center h-16 px-1 max-w-md mx-auto sm:max-w-none">
            {/* 1. Trang chính */}
            <button
              type="button"
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
              type="button"
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

            {/* 3. POS */}
            <button
              type="button"
              onClick={() => handleTabClick("pos")}
              className={`flex flex-col items-center justify-center py-1 transition-all ${
                activeTab === "pos"
                  ? "text-teal-600 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ShoppingCart className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">POS</span>
            </button>

            {/* 4. Nhân viên */}
            <button
              type="button"
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
              type="button"
              onClick={() => setIsMoreOpen(true)}
              className={`flex flex-col items-center justify-center py-1 transition-all ${
                isMoreOpen || ["catalog", "operations"].includes(activeTab)
                  ? "text-teal-600 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <MoreHorizontal className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Mở rộng</span>
            </button>
          </div>
        ) : (
          /* ==================== NAVBAR QUẢN LÝ (3 KHU VỰC) ==================== */
          <div className="grid grid-cols-3 items-center h-16 px-4 max-w-md mx-auto sm:max-w-none">
            {/* 1. Trang chính */}
            <button
              type="button"
              onClick={() => handleTabClick("dashboard")}
              className={`flex flex-col items-center justify-center py-1 transition-all ${
                activeTab === "dashboard"
                  ? "text-teal-600 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Home className="w-6 h-6 mb-0.5" />
              <span className="text-[11px] font-medium">Trang chính</span>
            </button>

            {/* 2. CHUYỂN NHANH (Nút trung tâm lớn nổi bật) */}
            <div className="relative flex justify-center -top-3">
              <button
                type="button"
                onClick={() => setIsQuickAccessOpen(true)}
                className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-teal-600 text-white shadow-xl shadow-teal-600/30 border-4 border-white active:scale-95 transition-all"
              >
                <Zap className="w-7 h-7 fill-white/20" />
                <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">
                  Nhanh
                </span>
              </button>
            </div>

            {/* 3. Khách hàng */}
            <button
              type="button"
              onClick={() => handleTabClick("customers")}
              className={`flex flex-col items-center justify-center py-1 transition-all ${
                activeTab === "customers"
                  ? "text-teal-600 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Users className="w-6 h-6 mb-0.5" />
              <span className="text-[11px] font-medium">Khách hàng</span>
            </button>
          </div>
        )}
      </nav>

      {/* DRAWER MỞ RỘNG (NHÂN VIÊN) */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="relative bg-white rounded-t-3xl p-5 shadow-2xl z-10 max-w-md mx-auto w-full border-t border-slate-100 animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">
                Chức năng mở rộng
              </h3>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4 pb-2">
              {staffExtraModules.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleTabClick(item.key)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                      isActive
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
              })}
            </div>
          </div>
        </div>
      )}

      {/* DRAWER CHUYỂN NHANH (QUẢN LÝ) */}
      {isQuickAccessOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsQuickAccessOpen(false)}
          />
          <div className="relative bg-white rounded-t-3xl p-5 shadow-2xl z-10 max-w-md mx-auto w-full border-t border-slate-100 animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                CHUYỂN NHANH TRUY CẬP
              </h3>
              <button
                type="button"
                onClick={() => setIsQuickAccessOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4 pb-2">
              {managerQuickModules.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleTabClick(item.key)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                      isActive
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
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
