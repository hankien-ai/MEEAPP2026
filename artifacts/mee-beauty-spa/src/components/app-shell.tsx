// src/components/app-shell.tsx
import React from "react";
import { BottomToolbar } from "@/components/bottom-toolbar";

interface AppShellProps {
  children: React.ReactNode;
  userRole?: string;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  visibleTabs?: string[];
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  userRole,
  activeTab,
  onSelectTab,
  visibleTabs = [],
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      <main className="flex-1 w-full pb-24 md:pb-0">{children}</main>

      <BottomToolbar
        userRole={userRole}
        activeTab={activeTab || "dashboard"}
        onSelectTab={onSelectTab || (() => {})}
        visibleTabs={visibleTabs}
      />
    </div>
  );
};