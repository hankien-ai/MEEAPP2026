// src/components/bottom-toolbar.tsx
import React, { useState } from "react";
import {
  Home,
  Users,
  ShoppingCart,
  UserCog,
  Package,
  MoreHorizontal,
  Zap,
  X,
  BarChart3,
  Settings, // <-- Thêm Settings
} from "lucide-react";

interface BottomToolbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  userRole?: string | null;
  visibleTabs?: string[];
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  activeTab,
  onSelectTab,
  userRole = "staff",
  visibleTabs = [],
}) => {
  const [isQuickOpen, setIsQuickOpen] = useState(false);

  const normalizedRole = (userRole || "staff").toLowerCase();
  const isAdmin = ["admin", "owner", "manager", "quan_ly"].includes(normalizedRole);

  // ==========================================================
  // STAFF – 5 nút cố định, không cần visibleTabs
  // ==========================================================
  if (!isAdmin) {
    const staffModules = [
      { id: "dashboard", label: "Trang chính", icon: Home },
      { id: "customers", label: "Khách hàng", icon: Users },
      { id: "pos", label: "POS", icon: ShoppingCart },
      { id: "catalog", label: "Danh mục", icon: Package },
      { id: "staff", label: "Nhân viên", icon: UserCog },
    ];

    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-[env(safe-area-inset-bottom,0px)]">
        <div className="flex items-center justify-around h-16 px-2 max-w-screen-xl mx-auto">
          {staffModules.map((mod) => {
            const isCenter = mod.id === "pos";
            const Icon = mod.icon;
            const isActive = activeTab === mod.id;

            return (
              <button
                key={mod.id}
                onClick={() => onSelectTab(mod.id)}
                className={`flex flex-col items-center justify-center transition-all ${
                  isCenter
                    ? "relative -top-5 w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-2xl shadow-pink-500/40 border-4 border-white active:scale-95 hover:shadow-pink-500/60"
                    : `py-1 ${isActive ? "text-pink-600 font-bold" : "text-slate-500 hover:text-slate-800"}`
                }`}
                style={isCenter ? { width: 64, height: 64 } : {}}
              >
                <Icon className={`${isCenter ? "w-7 h-7 fill-white/10" : "w-5 h-5 mb-0.5"}`} />
                <span className={`${isCenter ? "text-[8px] font-black uppercase tracking-wider mt-0.5" : "text-[10px] tracking-tight"}`}>
                  {isCenter ? "POS" : mod.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  // ==========================================================
  // ADMIN – 5 vị trí: Home, Catalog, Quick, Staff, More
  // ==========================================================

  // Quick menu chỉ có 3 mục: Khách hàng, POS, Báo cáo
  const quickMenuItems = [
    { id: "customers", label: "Khách hàng", icon: Users },
    { id: "pos", label: "POS", icon: ShoppingCart },
    { id: "reports", label: "Báo cáo", icon: BarChart3 },
  ];

  const handleMoreClick = () => {
    onSelectTab("extension");
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-[env(safe-area-inset-bottom,0px)]">
        <div className="flex items-center justify-around h-16 px-2 max-w-screen-xl mx-auto">
          {/* Trang chính */}
          <button
            onClick={() => onSelectTab("dashboard")}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === "dashboard" ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Trang chính</span>
          </button>

          {/* Danh mục */}
          <button
            onClick={() => onSelectTab("catalog")}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === "catalog" ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Package className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Danh mục</span>
          </button>

          {/* Quick Button – nổi bật, chỉ icon, không chữ */}
          <div className="relative -top-5">
            <button
              onClick={() => setIsQuickOpen(true)}
              className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl shadow-indigo-500/50 border-4 border-white active:scale-95 hover:shadow-indigo-500/70 transition-all duration-200"
            >
              <Zap className="w-8 h-8 fill-white/20" />
            </button>
          </div>

          {/* Nhân viên */}
          <button
            onClick={() => onSelectTab("staff")}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === "staff" ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserCog className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Nhân viên</span>
          </button>

          {/* More */}
          <button
            onClick={handleMoreClick}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === "extension" ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <MoreHorizontal className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">More</span>
          </button>
        </div>
      </nav>

      {/* Quick Action Modal */}
      {isQuickOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsQuickOpen(false)} />
          <div className="relative bg-white rounded-t-3xl p-5 shadow-2xl z-10 max-w-md mx-auto w-full border-t border-slate-100 animate-in slide-in-from-bottom duration-200 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 shrink-0">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" /> THAO TÁC NHANH
              </h3>
              <button onClick={() => setIsQuickOpen(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 py-3 space-y-1">
              {quickMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      setIsQuickOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all text-slate-700"
                  >
                    <Icon className="w-5 h-5 text-slate-500" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="border-t pt-3 shrink-0 flex justify-end">
              <button
                onClick={() => {
                  setIsQuickOpen(false);
                  onSelectTab("settings");
                }}
                className="text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:underline"
              >
                <Settings className="w-3.5 h-3.5" /> Cấu hình
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};