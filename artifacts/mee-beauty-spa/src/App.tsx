import React, { useState } from "react";
import DashboardPage from "./pages/dashboard";
import CustomersPage, { CustomerProfilePage } from "./pages/customers";
import CatalogPage from "./pages/catalog";
import OperationsPage from "./pages/operations";
import StaffPage from "./pages/staff";
import NotFoundPage from "./pages/not-found";
import POSPage from "./pages/POSPage";
import { AppShell } from "./components/app-shell";

export function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [userRole, setUserRole] = useState<string>("owner");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPage />;
      case "customers":
        return <CustomersPage />;
      case "catalog":
        return <CatalogPage />;
      case "operations":
        return <OperationsPage />;
      case "staff":
        return <StaffPage userRole={userRole} />; // ✅ Truyền userRole vào StaffPage
      case "pos":
        return <POSPage />;
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <AppShell
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      userRole={userRole}
    >
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-600/20">
            M
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              Mee Beauty Spa - Management
            </h1>
            <p className="text-[10px] text-gray-400 hidden sm:block">
              Hệ thống quản lý vận hành Spa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setUserRole("owner")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                userRole === "owner"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Quản lý
            </button>
            <button
              type="button"
              onClick={() => setUserRole("staff")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                userRole === "staff"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Nhân viên
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("dashboard")}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "dashboard"
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Tổng quan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("customers")}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "customers"
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Khách hàng
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pos")}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "pos"
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              POS
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("catalog")}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "catalog"
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Danh mục
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("operations")}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "operations"
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Vận hành
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("staff")}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "staff"
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Nhân viên
            </button>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6">
        {renderContent()}
      </div>
    </AppShell>
  );
}

export default App;