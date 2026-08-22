import React from "react";
import { BottomToolbar } from "@/components/bottom-toolbar";

interface AppShellProps {
  children: React.ReactNode;
  userRole?: string;
}

export const AppShell: React.FC<AppShellProps> = ({ children, userRole }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Main Content Area: Padding bottom pb-20 (80px) để không bị Bottom Toolbar che */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Bottom Toolbar dành riêng cho Mobile */}
      <BottomToolbar userRole={userRole} />
    </div>
  );
};
