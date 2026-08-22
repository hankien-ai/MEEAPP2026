import React from "react";
import { BottomToolbar } from "@/components/bottom-toolbar";

interface AppShellProps {
  children: React.ReactNode;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  userRole?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeTab,
  onSelectTab,
  userRole,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Vùng nội dung chính: Khoảng padding pb-24/pb-28 dành riêng để không bị Bottom Toolbar che */}
      <main className="flex-1 pb-24 sm:pb-28 overflow-x-hidden">
        {children}
      </main>

      {/* Bottom Toolbar hiển thị cố định ở phía dưới */}
      <BottomToolbar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        userRole={userRole}
      />
    </div>
  );
};
