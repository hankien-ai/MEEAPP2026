import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface BottomToolbarProps {
  userRole?: string;
}

interface NavItem {
  label: string;
  route: string;
  icon: React.ElementType;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  userRole = "staff",
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isQuickAccessOpen, setIsQuickAccessOpen] = useState(false);

  const normalizedRole = userRole.toLowerCase();
  const isManager = ["admin", "owner", "manager", "quan_ly"].includes(
    normalizedRole,
  );

  const currentPath = location.pathname;

  // Danh mục mở rộng cho Staff
  const staffExtraModules: NavItem[] = [
    { label: "Danh mục & Gói", route: "/catalog", icon: Package },
    { label: "Vận hành", route: "/operations", icon: Sliders },
  ];

  // Danh mục CHUYỂN NHANH cho Quản lý
  const managerQuickModules: NavItem[] = [
    { label: "Dashboard", route: "/dashboard", icon: LayoutDashboard },
    { label: "Khách hàng", route: "/customers", icon: Users },
    { label: "Bán hàng (POS)", route: "/pos", icon: ShoppingCart },
    { label: "Danh mục & Gói", route: "/catalog", icon: Package },
    { label: "Nhân viên", route: "/staff", icon: UserCog },
    { label: "Vận hành", route: "/operations", icon: Sliders },
  ];

  const handleNavigate = (route: string) => {
    navigate(route);
    setIsMoreOpen(false);
    setIsQuickAccessOpen(false);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-[env(safe-area-inset-bottom,0px)]">
      {!isManager ? (
        /* ==================== NAVBAR NHÂN VIÊN (5 KHU VỰC) ==================== */
        <div className="grid grid-cols-5 items-center h-16 px-1 max-w-md mx-auto sm:max-w-none">
          {/* 1. Trang chính */}
          <button
            onClick={() => handleNavigate("/dashboard")}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              currentPath === "/dashboard"
                ? "text-emerald-600 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Trang chính</span>
          </button>

          {/* 2. Khách hàng */}
          <button
            onClick={() => handleNavigate("/customers")}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              currentPath === "/customers"
                ? "text-emerald-600 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Khách hàng</span>
          </button>

          {/* 3. POS */}
          <button
            onClick={() => handleNavigate("/pos")}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              currentPath === "/pos"
                ? "text-emerald-600 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShoppingCart className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">POS</span>
          </button>

          {/* 4. Nhân viên */}
          <button
            onClick={() => handleNavigate("/staff")}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              currentPath === "/staff"
                ? "text-emerald-600 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserCog className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Nhân viên</span>
          </button>

          {/* 5. Mở rộng */}
          <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center py-1 text-slate-500 hover:text-slate-800">
                <MoreHorizontal className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] tracking-tight">Mở rộng</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl p-4 pb-8">
              <SheetHeader className="pb-3 border-b border-slate-100">
                <SheetTitle className="text-sm font-bold text-slate-800 text-left">
                  Chức năng mở rộng
                </SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-3 pt-4">
                {staffExtraModules.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.route;
                  return (
                    <button
                      key={item.route}
                      onClick={() => handleNavigate(item.route)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        isActive
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      ) : (
        /* ==================== NAVBAR QUẢN LÝ (3 KHU VỰC) ==================== */
        <div className="grid grid-cols-3 items-center h-16 px-3 max-w-md mx-auto sm:max-w-none">
          {/* 1. Trang chính */}
          <button
            onClick={() => handleNavigate("/dashboard")}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              currentPath === "/dashboard"
                ? "text-emerald-600 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Home className="w-6 h-6 mb-0.5" />
            <span className="text-[11px]">Trang chính</span>
          </button>

          {/* 2. CHUYỂN NHANH (Nút trung tâm lớn nổi bật) */}
          <div className="relative flex justify-center -top-3">
            <Sheet open={isQuickAccessOpen} onOpenChange={setIsQuickAccessOpen}>
              <SheetTrigger asChild>
                <button className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-600 text-white shadow-xl shadow-indigo-600/30 border-4 border-white active:scale-95 transition-all">
                  <Zap className="w-7 h-7 fill-white/20" />
                  <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">
                    Nhanh
                  </span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl p-4 pb-8">
                <SheetHeader className="pb-3 border-b border-slate-100">
                  <SheetTitle className="text-sm font-bold text-slate-800 text-left flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                    CHUYỂN NHANH TRUY CẬP
                  </SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-2 gap-3 pt-4">
                  {managerQuickModules.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.route;
                    return (
                      <button
                        key={item.route}
                        onClick={() => handleNavigate(item.route)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                          isActive
                            ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-bold"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* 3. Khách hàng */}
          <button
            onClick={() => handleNavigate("/customers")}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              currentPath === "/customers"
                ? "text-emerald-600 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-6 h-6 mb-0.5" />
            <span className="text-[11px]">Khách hàng</span>
          </button>
        </div>
      )}
    </nav>
  );
};
