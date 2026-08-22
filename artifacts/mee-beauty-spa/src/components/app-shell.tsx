import React from "react";
import { BottomToolbar } from "@/components/bottom-toolbar";

interface AppShellProps {
  children: React.ReactNode;
  userRole?: string;
  activeRoute?: string;
  onNavigate?: (route: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  userRole,
  activeRoute,
  onNavigate,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      {/* Nội dung chính: Đảm bảo pb-24 trên Mobile để Bottom Toolbar không che button/nội dung */}
      <main className="flex-1 w-full pb-24 md:pb-0">{children}</main>

      {/* Bottom Toolbar cố định phía dưới cho Mobile */}
      <BottomToolbar
        userRole={userRole}
        activeRoute={activeRoute}
        onNavigate={onNavigate}
      />
    </div>
  );
};