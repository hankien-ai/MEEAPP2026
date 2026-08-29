// src/components/bottom-toolbar.tsx
import React, { useState, useEffect } from "react";
import {
  Home,
  Users,
  ShoppingCart,
  UserCog,
  Package,
  MoreHorizontal,
  Zap,
  X,
  Settings,
} from "lucide-react";
import { ALL_MODULES, DEFAULT_QUICK_BUTTONS, type ModuleId } from "@/constants/modules";
import { settingsService } from "@/services/settings.service";

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
  const [quickButtons, setQuickButtons] = useState<ModuleId[]>(DEFAULT_QUICK_BUTTONS);

  const normalizedRole = (userRole || "staff").toLowerCase();
  const isAdmin = ["admin", "owner", "manager", "quan_ly"].includes(normalizedRole);

  useEffect(() => {
    if (isAdmin) {
      const loadConfig = async () => {
        try {
          const data = await settingsService.getConfig('quick_buttons');
          if (data && Array.isArray(data) && data.length > 0) {
            setQuickButtons(data);
          } else {
            setQuickButtons(DEFAULT_QUICK_BUTTONS);
          }
        } catch (err) {
          console.error('Lỗi load quick buttons:', err);
          setQuickButtons(DEFAULT_QUICK_BUTTONS);
        }
      };
      loadConfig();
    }
  }, [isAdmin]);

  useEffect(() => {
    const handleStorage = () => {
      if (isAdmin) {
        settingsService.getConfig('quick_buttons').then(data => {
          if (data && Array.isArray(data)) setQuickButtons(data);
        });
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [isAdmin]);

  const isVisible = (moduleId: string) => visibleTabs.includes(moduleId);

  // ===== STAFF =====
  if (!isAdmin) {
    const staffOrder = ['dashboard', 'customers', 'pos', 'catalog', 'staff'];
    const staffModules = staffOrder
      .filter(id => isVisible(id))
      .map(id => ALL_MODULES.find(m => m.id === id))
      .filter(Boolean) as { id: string; label: string; icon: any }[];

    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-[env(safe-area-inset-bottom,0px)]">
        <div className="flex items-center justify-around h-16 px-2 max-w-screen-xl mx-auto">
          {staffModules.map((mod) => {
            const isCenter = mod.id === 'pos';
            const Icon = mod.icon;
            const isActive = activeTab === mod.id;

            return (
              <button
                key={mod.id}
                onClick={() => onSelectTab(mod.id)}
                className={`flex flex-col items-center justify-center transition-all ${
                  isCenter
                    ? 'relative -top-4 w-16 h-16 rounded-full bg-gradient-to-tr from-pink-600 to-rose-600 text-white shadow-xl shadow-pink-600/30 border-4 border-white active:scale-95'
                    : `py-1 ${isActive ? 'text-pink-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`
                }`}
                style={isCenter ? { width: 64, height: 64 } : {}}
              >
                <Icon className={`${isCenter ? 'w-7 h-7 fill-white/20' : 'w-5 h-5 mb-0.5'}`} />
                <span className={`${isCenter ? 'text-[8px] font-black uppercase tracking-wider mt-0.5' : 'text-[10px] tracking-tight'}`}>
                  {isCenter ? 'POS' : mod.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  // ===== ADMIN =====
  const adminOrder = ['dashboard', 'catalog', 'staff'];
  const adminModules = adminOrder
    .filter(id => isVisible(id))
    .map(id => ALL_MODULES.find(m => m.id === id))
    .filter(Boolean) as { id: string; label: string; icon: any }[];

  const quickModules = quickButtons
    .map(id => ALL_MODULES.find(m => m.id === id))
    .filter(Boolean) as { id: string; label: string; icon: any }[];

  const handleMoreClick = () => {
    onSelectTab('extension');
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-[env(safe-area-inset-bottom,0px)]">
        <div className="flex items-center justify-around h-16 px-2 max-w-screen-xl mx-auto">
          {adminModules.map((mod) => {
            const Icon = mod.icon;
            const isActive = activeTab === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => onSelectTab(mod.id)}
                className={`flex flex-col items-center justify-center py-1 transition-all ${
                  isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] tracking-tight">{mod.label}</span>
              </button>
            );
          })}

          {/* Quick Button */}
          <div className="relative -top-4">
            <button
              onClick={() => setIsQuickOpen(true)}
              className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-teal-600 text-white shadow-xl shadow-teal-600/30 border-4 border-white active:scale-95 transition-all"
            >
              <Zap className="w-7 h-7 fill-white/20" />
              <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">Quick</span>
              {quickModules.length > 4 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  +{quickModules.length - 4}
                </span>
              )}
            </button>
          </div>

          {/* More */}
          <button
            onClick={handleMoreClick}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === 'extension' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
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
              {quickModules.map(mod => {
                const Icon = mod.icon;
                return (
                  <button
                    key={mod.id}
                    onClick={() => {
                      onSelectTab(mod.id);
                      setIsQuickOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all text-slate-700"
                  >
                    <Icon className="w-5 h-5 text-slate-500" />
                    <span className="text-sm font-medium">{mod.label}</span>
                  </button>
                );
              })}
              {quickModules.length === 0 && (
                <div className="text-center text-slate-400 text-sm py-4">Chưa có module nào được chọn</div>
              )}
            </div>
            <div className="border-t pt-3 shrink-0 flex justify-end">
              <button
                onClick={() => {
                  setIsQuickOpen(false);
                  onSelectTab('settings');
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