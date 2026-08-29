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
import PayrollDetailPage from "./pages/PayrollDetailPage"; // <-- Import
import { AppShell } from "./components/app-shell";

export function App() {
  const { role, isLoggedIn, visibility, isAdmin, loading, currentStaff } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // State cho Payroll detail (dùng để hiển thị chi tiết mà không cần router)
  const [payrollDetail, setPayrollDetail] = useState<{
    staffId: string;
    month: number;
    year: number;
  } | null>(null);

  useEffect(() => {
    setActiveTab("dashboard");
  }, [role]);

  useEffect(() => {
    if (!isLoggedIn || loading) return;

    const tabs: string[] = [];
    if (visibility.dashboard) tabs.push("dashboard");
    if (visibility.customers) tabs.push("customers");
    if (visibility.pos) tabs.push("pos");
    if (isAdmin && visibility.catalog) tabs.push("catalog");
    if (visibility.operations) tabs.push("operations");
    if (isAdmin && visibility.staff) tabs.push("staff");
    if (isAdmin && visibility.payroll) tabs.push("payroll"); // <-- Thêm payroll
    if (isAdmin && visibility.settings) tabs.push("settings");
    if (isAdmin) tabs.push("invoices");
    if (isAdmin) tabs.push("reports");
    if (isAdmin) tabs.push("extension");

    const visibleTabs = tabs;

    if (!isAdmin && activeTab !== 'dashboard') {
      const isAllowed = visibleTabs.includes(activeTab);
      if (!isAllowed) {
        setActiveTab(visibleTabs[0] || 'dashboard');
      }
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
    if (visibility.operations) tabs.push("operations");
    if (isAdmin && visibility.staff) tabs.push("staff");
    if (isAdmin && visibility.payroll) tabs.push("payroll");
    if (isAdmin && visibility.settings) tabs.push("settings");
    if (isAdmin) tabs.push("invoices");
    if (isAdmin) tabs.push("reports");
    if (isAdmin) tabs.push("extension");
    return tabs;
  };

  const visibleTabs = getVisibleTabs();
  const currentActiveTab = visibleTabs.includes(activeTab) ? activeTab : (visibleTabs.length > 0 ? visibleTabs[0] : "dashboard");

  // Hàm xử lý khi bấm vào một dòng payroll để xem chi tiết
  const handleViewPayrollDetail = (staffId: string, month: number, year: number) => {
    setPayrollDetail({ staffId, month, year });
  };

  // Hàm quay lại danh sách payroll
  const handleBackFromDetail = () => {
    setPayrollDetail(null);
  };

  const renderContent = () => {
    // Nếu đang ở chế độ xem chi tiết payroll, ưu tiên render Detail
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

    // Ngược lại render các tab bình thường
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