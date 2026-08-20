import React, { useState } from "react";
import DashboardPage from "./pages/dashboard";
import CustomersPage, { CustomerProfilePage } from "./pages/customers";
import CatalogPage from "./pages/catalog";
import OperationsPage from "./pages/operations";
import StaffPage from "./pages/staff";
import NotFoundPage from "./pages/not-found";

export function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

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
        return <StaffPage />;
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            M
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Mee Beauty Spa - Management
          </h1>
        </div>
        <nav className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "dashboard"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "customers"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Khách hàng
          </button>
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "catalog"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Danh mục
          </button>
          <button
            onClick={() => setActiveTab("operations")}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "operations"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Vận hành
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "staff"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Nhân viên
          </button>
        </nav>
      </header>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
