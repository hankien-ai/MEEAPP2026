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
  X,
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

  // Danh mục Route mở rộng / Quick Access
  const extraModules: NavItem[] = [
    { label: "Bán hàng (POS)", route: "/pos", icon: ShoppingCart },
    { label: "Khách hàng", route: "/customers", icon: Users },
    { label: "Danh mục & Gói", route: "/catalog", icon: Package },
    { label: "Nhân viên", route: "/staff", icon: UserCog },
    { label: "Vận hành & Báo cáo", route: "/operations", icon: Sliders },
  ];

  const handleNavigate = (route: string) => {
    navigate(route);
    setIsMoreOpen(false);
    setIsQuickAccessOpen(false);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-[env(safe-area-inset-bottom,0px)]">
      {!isManager ? (
        /* ==================== NAVBAR NHÂN VIÊN ==================== */
        <div className="grid grid-cols-5 items-center h-16 px-1">
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
            <span className="text-[10px]">Trang chính</span>
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
            <span className="text-[10px]">Khách hàng</span>
          </button>

          {/* 3. POS - Nổi bật giữa */}
          <div className="relative flex justify-center -top-3">
            <button
              onClick={() => handleNavigate("/pos")}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 border-4 border-slate-100 active:scale-95 transition-transform ${
                currentPath === "/pos"
                  ? "ring-2 ring-emerald-500 ring-offset-2"
                  : ""
              }`}
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="text-[9px] font-bold mt-0.5">POS</span>
            </button>
          </div>

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
            <span className="text-[10px]">Nhân viên</span>
          </button>

          {/* 5. Mở rộng */}
          <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center py-1 text-slate-500 hover:text-slate-800">
                <MoreHorizontal className="w-5 h-5 mb-0.5" />
                <span className="text-[10px]">Mở rộng</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl p-4">
              <SheetHeader className="pb-3 border-b border-slate-100">
                <SheetTitle className="text-sm font-bold text-slate-800 text-left">
                  Chức năng khả dụng
                </SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-3 gap-3 pt-4">
                {extraModules.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.route;
                  return (
                    <button
                      key={item.route}
                      onClick={() => handleNavigate(item.route)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                        isActive
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-6 h-6 mb-1 text-emerald-600" />
                      <span className="text-xs font-medium leading-tight">
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
        /* ==================== NAVBAR QUẢN LÝ ==================== */
        <div className="grid grid-cols-5 items-center h-16 px-1">
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
            <span className="text-[10px]">Trang chính</span>
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
            <span className="text-[10px]">Khách hàng</span>
          </button>

          {/* 3. CHUYỂN NHANH - Nổi bật trung tâm */}
          <div className="relative flex justify-center -top-3">
            <Sheet open={isQuickAccessOpen} onOpenChange={setIsQuickAccessOpen}>
              <SheetTrigger asChild>
                <button className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 border-4 border-slate-100 active:scale-95 transition-transform">
                  <Zap className="w-6 h-6" />
                  <span className="text-[8px] font-extrabold mt-0.5 uppercase">
                    Nhanh
                  </span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl p-4">
                <SheetHeader className="pb-3 border-b border-slate-100">
                  <SheetTitle className="text-sm font-bold text-slate-800 text-left">
                    ⚡ CHUYỂN NHANH TRUY CẬP
                  </SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-2 gap-3 pt-4">
                  {extraModules.map((item) => {
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
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
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
            <span className="text-[10px]">Nhân viên</span>
          </button>

          {/* 5. Vận hành */}
          <button
            onClick={() => handleNavigate("/operations")}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              currentPath === "/operations"
                ? "text-emerald-600 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sliders className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Vận hành</span>
          </button>
        </div>
      )}
    </nav>
  );
};
