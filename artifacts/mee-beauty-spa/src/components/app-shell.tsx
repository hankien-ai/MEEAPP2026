import React from "react";
import { BottomToolbar } from "@/components/bottom-toolbar";

interface AppShellProps {
  children: React.ReactNode;
  userRole?: string;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  activeRoute?: string;
  onNavigate?: (route: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  userRole,
  activeTab,
  onSelectTab,
  activeRoute,
  onNavigate,
}) => {
  const currentTab = activeTab || activeRoute || "dashboard";
  const handleSelectTab = onSelectTab || onNavigate || (() => {});

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      <main className="flex-1 w-full pb-24 md:pb-0">{children}</main>

      <BottomToolbar
        userRole={userRole}
        activeTab={currentTab}
        onSelectTab={handleSelectTab}
      />
    </div>
  );
};
