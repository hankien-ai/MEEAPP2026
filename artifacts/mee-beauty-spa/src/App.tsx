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
import PayrollPage from "./pages/PayrollPage";
import PayrollDetailPage from "./pages/PayrollDetailPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import TasksPage from "./pages/TasksPage";
import LoyaltyPage from "./pages/LoyaltyPage";
import { AppShell } from "./components/app-shell";
import { NotificationBell } from "@/components/NotificationBell";

export function App() {
  const { role, isLoggedIn, visibility, isAdmin, loading, currentStaff } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // State cho Payroll detail
  const [payrollDetail, setPayrollDetail] = useState<{
    staffId: string;
    month: number;
    year: number;
  } | null>(null);

  const handleViewPayrollDetail = (staffId: string, month: number, year: number) => {
    setPayrollDetail({ staffId, month, year });
  };

  const handleBackFromDetail = () => {
    setPayrollDetail(null);
  };

  useEffect(() => {
    setActiveTab("dashboard");
  }, [role]);

  useEffect(() => {
    if (!isLoggedIn || loading) return;

    const tabs: string[] = [];
    if (visibility.dashboard) tabs.push("dashboard");
    if (visibility.customers) tabs.push("customers");
    if (visibility.pos) tabs.push("pos");
    // Cho phép staff truy cập catalog
    if (isAdmin && visibility.catalog) tabs.push("catalog");
    if (!isAdmin) tabs.push("catalog"); // staff luôn có catalog
    if (visibility.operations) tabs.push("operations");
    if (isAdmin && visibility.staff) tabs.push("staff");
    if (isAdmin && visibility.payroll) tabs.push("payroll");
    if (isAdmin && visibility.settings) tabs.push("settings");
    // Cho phép staff truy cập invoices
    if (isAdmin) tabs.push("invoices");
    if (!isAdmin) tabs.push("invoices"); // staff luôn có invoices
    if (isAdmin) tabs.push("reports");
    if (isAdmin) tabs.push("extension");
    if (isAdmin) tabs.push("appointments");
    if (isAdmin) tabs.push("tasks");
    if (isAdmin) tabs.push("loyalty");
    if (visibility.customers) tabs.push("appointments");
    if (visibility.staff) tabs.push("tasks");

    const uniqueTabs = Array.from(new Set(tabs));
    if (!uniqueTabs.includes(activeTab)) {
      setActiveTab(uniqueTabs[0] || "dashboard");
    }
  }, [activeTab, isAdmin, isLoggedIn, visibility, loading]);

  if (!isLoggedIn) return <LoginPage />;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center text-slate-500">Đang tải...</div>
      </div>
    );
  }

  const getVisibleTabs = (): string[] => {
    const tabs: string[] = [];
    if (visibility.dashboard) tabs.push("dashboard");
    if (visibility.customers) tabs.push("customers");
    if (visibility.pos) tabs.push("pos");
    if (isAdmin && visibility.catalog) tabs.push("catalog");
    if (!isAdmin) tabs.push("catalog");
    if (visibility.operations) tabs.push("operations");
    if (isAdmin && visibility.staff) tabs.push("staff");
    if (isAdmin && visibility.payroll) tabs.push("payroll");
    if (isAdmin && visibility.settings) tabs.push("settings");
    if (isAdmin) tabs.push("invoices");
    if (!isAdmin) tabs.push("invoices");
    if (isAdmin) tabs.push("reports");
    if (isAdmin) tabs.push("extension");
    if (isAdmin) tabs.push("appointments");
    if (isAdmin) tabs.push("tasks");
    if (isAdmin) tabs.push("loyalty");
    if (visibility.customers) tabs.push("appointments");
    if (visibility.staff) tabs.push("tasks");
    return Array.from(new Set(tabs));
  };

  const visibleTabs = getVisibleTabs();
  const currentActiveTab = visibleTabs.includes(activeTab) ? activeTab : (visibleTabs.length > 0 ? visibleTabs[0] : "dashboard");

  const renderContent = () => {
    // Nếu đang xem chi tiết payroll, ưu tiên hiển thị
    if (payrollDetail) {
      return (
        <PayrollDetailPage
          staffId={payrollDetail.staffId}
          month={payrollDetail.month}
          year={payrollDetail.year}
          onBack={handleBackFromDetail}
        />
      );
    }

    switch (currentActiveTab) {
      case "dashboard": return <DashboardPage userRole={role} onNavigate={setActiveTab} />;
      case "customers": return <CustomersPage />;
      case "catalog": return <CatalogPage />;
      case "operations": return <OperationsPage userRole={role} />;
      case "staff": return <StaffPage userRole={role} />;
      case "pos": return <POSPage />;
      case "payroll": return <PayrollPage onViewDetail={handleViewPayrollDetail} />;
      case "settings": return <SettingsPage onNavigate={setActiveTab} />;
      case "invoices": return <InvoicesPage />;
      case "reports": return <ReportsPage />;
      case "extension": return <ExtensionPage onNavigate={setActiveTab} />;
      case "appointments": return <AppointmentsPage />;
      case "tasks": return <TasksPage />;
      case "loyalty": return <LoyaltyPage />;
      default: return <NotFoundPage />;
    }
  };

  const header = (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-pink-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-pink-600/20">M</div>
        <p className="text-[9px] text-gray-400 hidden sm:block">
          {isAdmin ? 'Quản lý' : currentStaff?.full_name || 'Nhân viên'}
        </p>
        <div>
          <h1 className="text-base font-bold text-gray-900 leading-tight">Mee Beauty Spa</h1>
          <p className="text-[9px] text-gray-400 hidden sm:block">
            {isAdmin ? 'Quản lý' : currentStaff?.full_name || 'Nhân viên'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell />
        <button
          onClick={() => {
            localStorage.removeItem('mee_role');
            window.location.reload();
          }}
          className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100"
        >
          Đăng xuất
        </button>
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