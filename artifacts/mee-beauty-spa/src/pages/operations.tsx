import React, { useEffect, useState, useCallback } from "react";
import {
  packageService,
  CreatePackageInput,
} from "../services/package.service";
import {
  expenseService,
  CreateExpenseInput,
} from "../services/expense.service";
import { catalogService } from "../services/catalog-service";
import { customerService } from "../services/customer.service";
import { PackageTemplate, Expense } from "../types/domain";

export const OperationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "packages" | "expenses" | "overview"
  >("packages");

  // State Packages
  const [packages, setPackages] = useState<PackageTemplate[]>([]);
  const [pkgLoading, setPkgLoading] = useState<boolean>(false);
  const [pkgError, setPkgError] = useState<string | null>(null);
  const [pkgSearch, setPkgSearch] = useState<string>("");
  const [isPkgModalOpen, setIsPkgModalOpen] = useState<boolean>(false);
  const [editingPkg, setEditingPkg] = useState<PackageTemplate | null>(null);
  const [pkgFormData, setPkgFormData] = useState<CreatePackageInput>({
    name: "",
    description: "",
    price: 0,
    total_sessions: 1,
    validity_days: 30,
  });

  // State Expenses
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expLoading, setExpLoading] = useState<boolean>(false);
  const [expError, setExpError] = useState<string | null>(null);
  const [expSearch, setExpSearch] = useState<string>("");
  const [expCategory, setExpCategory] = useState<string>("");
  const [expDate, setExpDate] = useState<string>("");
  const [isExpModalOpen, setIsExpModalOpen] = useState<boolean>(false);
  const [editingExp, setEditingExp] = useState<Expense | null>(null);
  const [expFormData, setExpFormData] = useState<CreateExpenseInput>({
    category: "",
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
    payment_method: "Tiền mặt",
  });

  // State Overview KPI
  const [overviewMetrics, setOverviewMetrics] = useState<{
    totalCustomers: number | null;
    totalServices: number | null;
    totalProducts: number | null;
    totalExpenses: number | null;
  }>({
    totalCustomers: null,
    totalServices: null,
    totalProducts: null,
    totalExpenses: null,
  });
  const [overviewLoading, setOverviewLoading] = useState<boolean>(false);

  // Load Packages
  const loadPackages = useCallback(async () => {
    try {
      setPkgLoading(true);
      setPkgError(null);
      const data = await packageService.getPackages(pkgSearch);
      setPackages(data);
    } catch (err: unknown) {
      setPkgError(
        err instanceof Error ? err.message : "Đã có lỗi tải gói liệu trình.",
      );
    } finally {
      setPkgLoading(false);
    }
  }, [pkgSearch]);

  // Load Expenses
  const loadExpenses = useCallback(async () => {
    try {
      setExpLoading(true);
      setExpError(null);
      const data = await expenseService.getExpenses({
        category: expCategory || undefined,
        date: expDate || undefined,
        searchQuery: expSearch || undefined,
      });
      setExpenses(data);
    } catch (err: unknown) {
      setExpError(
        err instanceof Error ? err.message : "Đã có lỗi tải danh sách chi phí.",
      );
    } finally {
      setExpLoading(false);
    }
  }, [expCategory, expDate, expSearch]);

  // Load Overview Data
  const loadOverview = useCallback(async () => {
    try {
      setOverviewLoading(true);
      const [customers, services, products, expList] = await Promise.all([
        customerService.getCustomers(),
        catalogService.fetchServices(),
        catalogService.fetchProducts(),
        expenseService.getExpenses(),
      ]);

      const servicesCount = services.length;
      const productsCount = products.length;
      const sumExpense = expList.reduce(
        (acc, curr) => acc + (curr.amount || 0),
        0,
      );

      setOverviewMetrics({
        totalCustomers: customers.length,
        totalServices: servicesCount,
        totalProducts: productsCount,
        totalExpenses: sumExpense,
      });
    } catch {
      setOverviewMetrics({
        totalCustomers: null,
        totalServices: null,
        totalProducts: null,
        totalExpenses: null,
      });
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "packages") loadPackages();
    if (activeTab === "expenses") loadExpenses();
    if (activeTab === "overview") loadOverview();
  }, [activeTab, loadPackages, loadExpenses, loadOverview]);

  // Package Modal Handlers
  const handleOpenPkgModal = (pkg?: PackageTemplate) => {
    if (pkg) {
      setEditingPkg(pkg);
      setPkgFormData({
        name: pkg.name || "",
        description: pkg.description || "",
        price: pkg.price || 0,
        total_sessions: pkg.total_sessions || 1,
        validity_days: pkg.validity_days || 30,
      });
    } else {
      setEditingPkg(null);
      setPkgFormData({
        name: "",
        description: "",
        price: 0,
        total_sessions: 1,
        validity_days: 30,
      });
    }
    setIsPkgModalOpen(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPkg) {
        await packageService.updatePackage(editingPkg.id, pkgFormData);
      } else {
        await packageService.createPackage(pkgFormData);
      }
      setIsPkgModalOpen(false);
      loadPackages();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Thao tác thất bại.");
    }
  };

  const handleArchivePackage = async (id: string) => {
    if (window.confirm("Lưu trữ gói liệu trình này?")) {
      try {
        await packageService.archivePackage(id);
        loadPackages();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Lỗi lưu trữ.");
      }
    }
  };

  // Expense Modal Handlers
  const handleOpenExpModal = (exp?: Expense) => {
    if (exp) {
      setEditingExp(exp);
      setExpFormData({
        category: exp.category || "",
        amount: exp.amount || 0,
        description: exp.description || "",
        date: exp.date || new Date().toISOString().split("T")[0],
        payment_method: exp.payment_method || "Tiền mặt",
      });
    } else {
      setEditingExp(null);
      setExpFormData({
        category: "",
        amount: 0,
        description: "",
        date: new Date().toISOString().split("T")[0],
        payment_method: "Tiền mặt",
      });
    }
    setIsExpModalOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExp) {
        await expenseService.updateExpense(editingExp.id, expFormData);
      } else {
        await expenseService.createExpense(expFormData);
      }
      setIsExpModalOpen(false);
      loadExpenses();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Thao tác thất bại.");
    }
  };

  const handleArchiveExpense = async (id: string) => {
    if (window.confirm("Lưu trữ khoản chi phí này?")) {
      try {
        await expenseService.archiveExpense(id);
        loadExpenses();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Lỗi lưu trữ.");
      }
    }
  };

  const totalExpenseAmount = expenses.reduce(
    (acc, c) => acc + (c.amount || 0),
    0,
  );

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
      <h2>Quản lý Vận hành</h2>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          borderBottom: "2px solid #eee",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setActiveTab("packages")}
          style={{
            padding: "10px 20px",
            borderBottom:
              activeTab === "packages" ? "3px solid #007bff" : "none",
            fontWeight: activeTab === "packages" ? "bold" : "normal",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Gói liệu trình
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          style={{
            padding: "10px 20px",
            borderBottom:
              activeTab === "expenses" ? "3px solid #007bff" : "none",
            fontWeight: activeTab === "expenses" ? "bold" : "normal",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Chi phí vận hành
        </button>
        <button
          onClick={() => setActiveTab("overview")}
          style={{
            padding: "10px 20px",
            borderBottom:
              activeTab === "overview" ? "3px solid #007bff" : "none",
            fontWeight: activeTab === "overview" ? "bold" : "normal",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Tổng quan
        </button>
      </div>

      {/* TAB 1: PACKAGES */}
      {activeTab === "packages" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", gap: "8px", flex: 1 }}>
              <input
                type="text"
                placeholder="Tìm gói liệu trình..."
                value={pkgSearch}
                onChange={(e) => setPkgSearch(e.target.value)}
                style={{
                  padding: "8px",
                  width: "300px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              <button onClick={loadPackages} style={{ padding: "8px 16px" }}>
                Làm mới
              </button>
            </div>
            <button
              onClick={() => handleOpenPkgModal()}
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              + Thêm gói
            </button>
          </div>

          {pkgLoading && <div>Đang tải gói liệu trình...</div>}
          {pkgError && <div style={{ color: "red" }}>{pkgError}</div>}
          {!pkgLoading && !pkgError && packages.length === 0 && (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                border: "1px dashed #ccc",
              }}
            >
              Chưa có dữ liệu gói liệu trình.
            </div>
          )}

          {!pkgLoading && !pkgError && packages.length > 0 && (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #dee2e6",
                  }}
                >
                  <th style={{ padding: "10px" }}>Tên gói</th>
                  <th style={{ padding: "10px" }}>Giá</th>
                  <th style={{ padding: "10px" }}>Số buổi</th>
                  <th style={{ padding: "10px" }}>Thời hạn (Ngày)</th>
                  <th style={{ padding: "10px" }}>Trạng thái</th>
                  <th style={{ padding: "10px" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                    <td style={{ padding: "10px" }}>
                      <strong>{p.name}</strong>
                      {p.description && (
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {p.price ? `${p.price.toLocaleString("vi-VN")} đ` : "0 đ"}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {p.total_sessions || "—"}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {p.validity_days || "—"}
                    </td>
                    <td style={{ padding: "10px" }}>{p.status || "active"}</td>
                    <td style={{ padding: "10px" }}>
                      <button
                        onClick={() => handleOpenPkgModal(p)}
                        style={{ marginRight: "8px", padding: "4px 8px" }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleArchivePackage(p.id)}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#dc3545",
                          color: "#fff",
                          border: "none",
                        }}
                      >
                        Lưu trữ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 2: EXPENSES */}
      {activeTab === "expenses" && (
        <div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "16px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder="Tìm mô tả, danh mục..."
              value={expSearch}
              onChange={(e) => setExpSearch(e.target.value)}
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <input
              type="text"
              placeholder="Lọc danh mục..."
              value={expCategory}
              onChange={(e) => setExpCategory(e.target.value)}
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <input
              type="date"
              value={expDate}
              onChange={(e) => setExpDate(e.target.value)}
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <button onClick={loadExpenses} style={{ padding: "8px 16px" }}>
              Làm mới
            </button>
            <div style={{ marginLeft: "auto" }}>
              <button
                onClick={() => handleOpenExpModal()}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                + Thêm chi phí
              </button>
            </div>
          </div>

          <div
            style={{
              marginBottom: "16px",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            Tổng chi phí: {totalExpenseAmount.toLocaleString("vi-VN")} đ
          </div>

          {expLoading && <div>Đang tải chi phí...</div>}
          {expError && <div style={{ color: "red" }}>{expError}</div>}
          {!expLoading && !expError && expenses.length === 0 && (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                border: "1px dashed #ccc",
              }}
            >
              Chưa có dữ liệu chi phí.
            </div>
          )}

          {!expLoading && !expError && expenses.length > 0 && (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #dee2e6",
                  }}
                >
                  <th style={{ padding: "10px" }}>Ngày</th>
                  <th style={{ padding: "10px" }}>Danh mục</th>
                  <th style={{ padding: "10px" }}>Số tiền</th>
                  <th style={{ padding: "10px" }}>Phương thức</th>
                  <th style={{ padding: "10px" }}>Mô tả</th>
                  <th style={{ padding: "10px" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                    <td style={{ padding: "10px" }}>{e.date}</td>
                    <td style={{ padding: "10px" }}>{e.category}</td>
                    <td style={{ padding: "10px", fontWeight: "bold" }}>
                      {e.amount
                        ? `${e.amount.toLocaleString("vi-VN")} đ`
                        : "0 đ"}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {e.payment_method || "—"}
                    </td>
                    <td style={{ padding: "10px" }}>{e.description || "—"}</td>
                    <td style={{ padding: "10px" }}>
                      <button
                        onClick={() => handleOpenExpModal(e)}
                        style={{ marginRight: "8px", padding: "4px 8px" }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleArchiveExpense(e.id)}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#dc3545",
                          color: "#fff",
                          border: "none",
                        }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 3: OVERVIEW */}
      {activeTab === "overview" && (
        <div>
          {overviewLoading ? (
            <div>Đang tính toán chỉ số...</div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#666" }}>
                  Tổng khách hàng
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginTop: "8px",
                  }}
                >
                  {overviewMetrics.totalCustomers !== null
                    ? overviewMetrics.totalCustomers
                    : "Chưa có dữ liệu"}
                </div>
              </div>
              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#666" }}>
                  Tổng dịch vụ
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginTop: "8px",
                  }}
                >
                  {overviewMetrics.totalServices !== null
                    ? overviewMetrics.totalServices
                    : "Chưa có dữ liệu"}
                </div>
              </div>
              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#666" }}>
                  Tổng sản phẩm
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginTop: "8px",
                  }}
                >
                  {overviewMetrics.totalProducts !== null
                    ? overviewMetrics.totalProducts
                    : "Chưa có dữ liệu"}
                </div>
              </div>
              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#666" }}>
                  Tổng chi phí
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginTop: "8px",
                  }}
                >
                  {overviewMetrics.totalExpenses !== null
                    ? `${overviewMetrics.totalExpenses.toLocaleString("vi-VN")} đ`
                    : "Chưa có dữ liệu"}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL PACKAGE */}
      {isPkgModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h3>
              {editingPkg ? "Sửa gói liệu trình" : "Thêm gói liệu trình mới"}
            </h3>
            <form onSubmit={handleSavePackage}>
              <div style={{ marginBottom: "12px" }}>
                <label>Tên gói *</label>
                <input
                  type="text"
                  required
                  style={{ width: "100%", padding: "8px" }}
                  value={pkgFormData.name}
                  onChange={(e) =>
                    setPkgFormData({ ...pkgFormData, name: e.target.value })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Giá *</label>
                <input
                  type="number"
                  required
                  style={{ width: "100%", padding: "8px" }}
                  value={pkgFormData.price}
                  onChange={(e) =>
                    setPkgFormData({
                      ...pkgFormData,
                      price: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Số buổi</label>
                <input
                  type="number"
                  style={{ width: "100%", padding: "8px" }}
                  value={pkgFormData.total_sessions || 1}
                  onChange={(e) =>
                    setPkgFormData({
                      ...pkgFormData,
                      total_sessions: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Thời hạn (ngày)</label>
                <input
                  type="number"
                  style={{ width: "100%", padding: "8px" }}
                  value={pkgFormData.validity_days || 30}
                  onChange={(e) =>
                    setPkgFormData({
                      ...pkgFormData,
                      validity_days: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Mô tả</label>
                <textarea
                  style={{ width: "100%", padding: "8px" }}
                  value={pkgFormData.description || ""}
                  onChange={(e) =>
                    setPkgFormData({
                      ...pkgFormData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                }}
              >
                <button type="button" onClick={() => setIsPkgModalOpen(false)}>
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                  }}
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EXPENSE */}
      {isExpModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h3>{editingExp ? "Sửa khoản chi" : "Thêm khoản chi mới"}</h3>
            <form onSubmit={handleSaveExpense}>
              <div style={{ marginBottom: "12px" }}>
                <label>Danh mục *</label>
                <input
                  type="text"
                  required
                  style={{ width: "100%", padding: "8px" }}
                  value={expFormData.category}
                  onChange={(e) =>
                    setExpFormData({ ...expFormData, category: e.target.value })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Số tiền *</label>
                <input
                  type="number"
                  required
                  style={{ width: "100%", padding: "8px" }}
                  value={expFormData.amount}
                  onChange={(e) =>
                    setExpFormData({
                      ...expFormData,
                      amount: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Ngày chi *</label>
                <input
                  type="date"
                  required
                  style={{ width: "100%", padding: "8px" }}
                  value={expFormData.date}
                  onChange={(e) =>
                    setExpFormData({ ...expFormData, date: e.target.value })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Phương thức thanh toán</label>
                <input
                  type="text"
                  style={{ width: "100%", padding: "8px" }}
                  value={expFormData.payment_method || ""}
                  onChange={(e) =>
                    setExpFormData({
                      ...expFormData,
                      payment_method: e.target.value,
                    })
                  }
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label>Mô tả</label>
                <textarea
                  style={{ width: "100%", padding: "8px" }}
                  value={expFormData.description || ""}
                  onChange={(e) =>
                    setExpFormData({
                      ...expFormData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                }}
              >
                <button type="button" onClick={() => setIsExpModalOpen(false)}>
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                  }}
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Router compatibility exports
export const AttendancePage = OperationsPage;
export const BookingPage = OperationsPage;
export const ExpensesPage = OperationsPage;
export const LoyaltyPage = OperationsPage;
export const PackagesPage = OperationsPage;
export const PosPage = OperationsPage;
export const ReportsPage = OperationsPage;
export const SettingsPage = OperationsPage;
export const StaffPage = OperationsPage;

export default OperationsPage;
