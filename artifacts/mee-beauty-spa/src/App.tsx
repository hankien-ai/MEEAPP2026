// src/App.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "./pages/dashboard";
import CustomersPage from "./pages/customers";
import CatalogPage from "./pages/catalog";
import OperationsPage from "./pages/operations";
import StaffPage from "./pages/staff";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/not-found";
import POSPage from "./pages/POSPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import ReportsPage from "./pages/ReportsPage";
import ExtensionPage from "./pages/ExtensionPage";
import { AppShell } from "./components/app-shell";

export function App() {
  const { role, isLoggedIn, visibility } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Chỉ đặt lại tab khi role thay đổi
  useEffect(() => {
    setActiveTab("dashboard");
  }, [role]);

  const isAdmin = role === 'admin';

  // Route protection – kiểm tra quyền truy cập
  useEffect(() => {
    if (!isLoggedIn) return;
    const tabs = getVisibleTabs();
    if (!isAdmin && activeTab !== 'dashboard') {
      const isAllowed = tabs.includes(activeTab);
      if (!isAllowed) {
        setActiveTab(tabs[0] || 'dashboard');
      }
    }
  }, [activeTab, isAdmin, isLoggedIn, visibility]);

  if (!isLoggedIn) return <LoginPage />;

  const getVisibleTabs = (): string[] => {
    const tabs: string[] = [];
    if (visibility.dashboard) tabs.push("dashboard");
    if (visibility.customers) tabs.push("customers");
    if (visibility.pos) tabs.push("pos");
    if (isAdmin && visibility.catalog) tabs.push("catalog");
    if (visibility.operations) tabs.push("operations");
    if (isAdmin && visibility.staff) tabs.push("staff");
    if (isAdmin && visibility.settings) tabs.push("settings");
    if (isAdmin) tabs.push("invoices");
    if (isAdmin) tabs.push("reports");
    if (isAdmin) tabs.push("extension");
    return tabs;
  };

  const visibleTabs = getVisibleTabs();
  const currentActiveTab = visibleTabs.includes(activeTab) ? activeTab : (visibleTabs.length > 0 ? visibleTabs[0] : "dashboard");

  const renderContent = () => {
    switch (currentActiveTab) {
      case "dashboard": return <DashboardPage userRole={role} onNavigate={setActiveTab} />;
      case "customers": return <CustomersPage />;
      case "catalog": return <CatalogPage />;
      case "operations": return <OperationsPage userRole={role} />;
      case "staff": return <StaffPage userRole={role} />;
      case "pos": return <POSPage />;
      case "settings": return <SettingsPage onNavigate={setActiveTab} />;
      case "invoices": return <InvoicesPage />;
      case "reports": return <ReportsPage />;
      case "extension": return <ExtensionPage onNavigate={setActiveTab} />;
      default: return <NotFoundPage />;
    }
  };

  const header = (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-pink-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-pink-600/20">M</div>
        <div><h1 className="text-base font-bold text-gray-900 leading-tight">Mee Beauty Spa</h1><p className="text-[9px] text-gray-400 hidden sm:block">{isAdmin ? 'Quản lý' : 'Nhân viên'}</p></div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => { localStorage.removeItem('mee_role'); window.location.reload(); }} className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100">Đăng xuất</button>
      </div>
    </header>
  );

  return (
    <AppShell activeTab={currentActiveTab} onSelectTab={setActiveTab} userRole={role} visibleTabs={visibleTabs}>
      {header}
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6">{renderContent()}</div>
    </AppShell>
  );
}

export default App;