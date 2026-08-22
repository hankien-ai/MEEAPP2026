import React from "react";
import { BottomToolbar } from "@/components/bottom-toolbar";

interface AppShellProps {
  children: React.ReactNode;
  userRole?: string;
}

export const AppShell: React.FC<AppShellProps> = ({ children, userRole }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Main Content Area: Padding bottom pb-24 để không bị Bottom Toolbar che nội dung trên mobile */}
      <main className="flex-1 pb-24 overflow-x-hidden">{children}</main>

      {/* Bottom Toolbar dùng chung cố định phía dưới */}
      <BottomToolbar userRole={userRole} />
    </div>
  );
};
