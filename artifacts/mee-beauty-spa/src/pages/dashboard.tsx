import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/services/supabase";

interface CustomerRelation {
  full_name: string | null;
  phone: string | null;
}

interface Invoice {
  id: string;
  created_at: string;
  customer_id: string | null;
  status: "DRAFT" | "PARTIALLY_PAID" | "PAID" | "VOID" | string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string | null;
  customers?: CustomerRelation | null;
}

interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  todayCustomers: number;
  servicesSold: number;
  productsSold: number;
  packagesSold: number;
}

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    todayOrders: 0,
    todayCustomers: 0,
    servicesSold: 0,
    productsSold: 0,
    packagesSold: 0,
  });

  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);

  const formatVND = (val: number) => {
    return new Intl.NumberFormat("vi-VN").format(val || 0) + " đ";
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return "---";
    try {
      const d = new Date(isoStr);
      return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(d);
    } catch {
      return isoStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Đã thanh toán
          </span>
        );
      case "PARTIALLY_PAID":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Thanh toán 1 phần
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Đơn nháp
          </span>
        );
      case "VOID":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
            {status || "Khác"}
          </span>
        );
    }
  };

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return "---";
    switch (method) {
      case "CASH":
        return "💵 Tiền mặt";
      case "BANK_TRANSFER":
        return "🏦 Chuyển khoản";
      case "QR":
        return "📲 Mã QR";
      case "DEBT":
        return "📝 Ghi nợ";
      default:
        return method;
    }
  };

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString();

      // 1. Fetch Today's Invoices with relationship safety
      let todayInvoices: Invoice[] = [];

      const { data: invWithCust, error: errWithCust } = await supabase
        .from("invoices")
        .select(
          "id, created_at, customer_id, status, subtotal, discount_amount, total_amount, payment_method, customers(full_name, phone)",
        )
        .gte("created_at", todayIso)
        .order("created_at", { ascending: false });

      if (errWithCust) {
        // Fallback if relational join is not supported directly by key
        const { data: invPlain, error: errPlain } = await supabase
          .from("invoices")
          .select(
            "id, created_at, customer_id, status, subtotal, discount_amount, total_amount, payment_method",
          )
          .gte("created_at", todayIso)
          .order("created_at", { ascending: false });

        if (errPlain) throw errPlain;

        todayInvoices = (invPlain || []).map((i: any) => ({
          ...i,
          customers: null,
        }));

        const cIds = Array.from(
          new Set(todayInvoices.map((i) => i.customer_id).filter(Boolean)),
        ) as string[];
        if (cIds.length > 0) {
          const { data: custs } = await supabase
            .from("customers")
            .select("id, full_name, phone")
            .in("id", cIds);

          if (custs) {
            const custMap = new Map(custs.map((c: any) => [c.id, c]));
            todayInvoices = todayInvoices.map((i) => ({
              ...i,
              customers: i.customer_id
                ? custMap.get(i.customer_id) || null
                : null,
            }));
          }
        }
      } else {
        todayInvoices = (invWithCust as any[]) || [];
      }

      // Compute Today Revenue (PAID & PARTIALLY_PAID)
      const paidInvoices = todayInvoices.filter(
        (i) => i.status === "PAID" || i.status === "PARTIALLY_PAID",
      );
      const todayRevenue = paidInvoices.reduce(
        (sum, i) => sum + Number(i.total_amount || 0),
        0,
      );
      const todayOrders = todayInvoices.length;

      // Unique transacted customers today (excluding VOID)
      const validCustomerIds = new Set(
        todayInvoices
          .filter((i) => i.status !== "VOID" && i.customer_id)
          .map((i) => i.customer_id as string),
      );
      const todayCustomers = validCustomerIds.size;

      // 2. Fetch Item breakdown for today's active invoices
      const activeTodayInvoiceIds = todayInvoices
        .filter((i) => i.status !== "VOID")
        .map((i) => i.id);

      let servicesSold = 0;
      let productsSold = 0;
      let packagesSold = 0;

      if (activeTodayInvoiceIds.length > 0) {
        const { data: itemsData, error: itemsErr } = await supabase
          .from("invoice_items")
          .select(
            "id, invoice_id, catalog_item_id, package_id, actual_service_id, quantity",
          )
          .in("invoice_id", activeTodayInvoiceIds);

        if (!itemsErr && itemsData) {
          itemsData.forEach((item: any) => {
            const qty = Number(item.quantity || 1);
            if (item.package_id) {
              packagesSold += qty;
            } else if (item.actual_service_id) {
              servicesSold += qty;
            } else if (item.catalog_item_id) {
              productsSold += qty;
            }
          });
        }
      }

      setStats({
        todayRevenue,
        todayOrders,
        todayCustomers,
        servicesSold,
        productsSold,
        packagesSold,
      });

      // 3. Fetch Recent Invoices
      let recentList: Invoice[] = [];

      const { data: recentWithCust, error: recentCustErr } = await supabase
        .from("invoices")
        .select(
          "id, created_at, customer_id, status, subtotal, discount_amount, total_amount, payment_method, customers(full_name, phone)",
        )
        .order("created_at", { ascending: false })
        .limit(10);

      if (recentCustErr) {
        const { data: recentPlain, error: recentPlainErr } = await supabase
          .from("invoices")
          .select(
            "id, created_at, customer_id, status, subtotal, discount_amount, total_amount, payment_method",
          )
          .order("created_at", { ascending: false })
          .limit(10);

        if (recentPlainErr) throw recentPlainErr;

        recentList = (recentPlain || []).map((i: any) => ({
          ...i,
          customers: null,
        }));
        const rCustomerIds = Array.from(
          new Set(recentList.map((i) => i.customer_id).filter(Boolean)),
        ) as string[];

        if (rCustomerIds.length > 0) {
          const { data: rCusts } = await supabase
            .from("customers")
            .select("id, full_name, phone")
            .in("id", rCustomerIds);

          if (rCusts) {
            const rMap = new Map(rCusts.map((c: any) => [c.id, c]));
            recentList = recentList.map((i) => ({
              ...i,
              customers: i.customer_id ? rMap.get(i.customer_id) || null : null,
            }));
          }
        }
      } else {
        recentList = (recentWithCust as any[]) || [];
      }

      setRecentInvoices(recentList);
    } catch (err: any) {
      console.error("Error loading dashboard data:", err);
      setErrorMsg(err.message || "Không thể tải dữ liệu Dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <div className="min-h-screen bg-slate-50/50 p-3 sm:p-6 font-sans text-slate-800 space-y-4 sm:space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-teal-600/20 shrink-0">
            M
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-base sm:text-xl tracking-tight">
              MEE BEAUTY SPA — Tổng Quan
            </h1>
            <p className="text-xs text-slate-500">
              Báo cáo doanh thu & hoạt động trong ngày
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          <span className="text-[11px] font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg border border-teal-100">
            Hôm nay: {new Date().toLocaleDateString("vi-VN")}
          </span>
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Tải lại
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-3 py-1 bg-rose-600 text-white rounded-lg text-[11px] font-bold hover:bg-rose-700 transition-all shrink-0"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && !errorMsg && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs animate-pulse space-y-2"
              >
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center text-slate-400 text-xs font-medium">
            Đang tải dữ liệu Dashboard...
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      {!loading && (
        <>
          {/* STATS GRID - MOBILE FIRST */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
            {/* 1. DOANH THU HÔM NAY */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-1 xl:col-span-2 bg-gradient-to-br from-teal-600 to-emerald-700 text-white p-4 sm:p-5 rounded-2xl shadow-md shadow-teal-600/10 flex flex-col justify-between space-y-2">
              <div className="flex justify-between items-center opacity-90">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Doanh Thu Hôm Nay
                </span>
                <span className="p-1.5 bg-white/20 rounded-lg">💵</span>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black tracking-tight truncate">
                  {formatVND(stats.todayRevenue)}
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  Chỉ tính đơn đã/thanh toán 1 phần
                </div>
              </div>
            </div>

            {/* 2. SỐ ĐƠN HÀNG */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Đơn Hàng
                </span>
                <span className="p-1.5 bg-slate-100 rounded-lg text-xs">
                  🛍️
                </span>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {stats.todayOrders}{" "}
                  <span className="text-xs font-normal text-slate-500">
                    đơn
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Tổng phát sinh hôm nay
                </div>
              </div>
            </div>

            {/* 3. KHÁCH HÀNG */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Khách Giao Dịch
                </span>
                <span className="p-1.5 bg-slate-100 rounded-lg text-xs">
                  👥
                </span>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {stats.todayCustomers}{" "}
                  <span className="text-xs font-normal text-slate-500">
                    khách
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Có mã khách hàng
                </div>
              </div>
            </div>

            {/* 4. DỊCH VỤ ĐÃ BÁN */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Dịch Vụ Bán
                </span>
                <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">
                  ✨
                </span>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-extrabold text-blue-700">
                  {stats.servicesSold}{" "}
                  <span className="text-xs font-normal text-slate-500">
                    lượt
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Dịch vụ lẻ trong đơn
                </div>
              </div>
            </div>

            {/* 5. SẢN PHẨM ĐÃ BÁN */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Sản Phẩm Bán
                </span>
                <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">
                  📦
                </span>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-extrabold text-emerald-700">
                  {stats.productsSold}{" "}
                  <span className="text-xs font-normal text-slate-500">
                    món
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Sản phẩm bán lẻ
                </div>
              </div>
            </div>

            {/* 6. GÓI DỊCH VỤ ĐÃ BÁN */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2 col-span-2 sm:col-span-1">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Gói Liệu Trình
                </span>
                <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold">
                  🎁
                </span>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-extrabold text-purple-700">
                  {stats.packagesSold}{" "}
                  <span className="text-xs font-normal text-slate-500">
                    gói
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Package bán ra
                </div>
              </div>
            </div>
          </div>

          {/* RECENT INVOICES SECTION */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                  Hóa Đơn Gần Đây
                </h2>
                <p className="text-xs text-slate-500">
                  Top 10 đơn hàng mới nhất trên hệ thống
                </p>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {recentInvoices.length} đơn
              </span>
            </div>

            {recentInvoices.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-1">
                <div className="text-2xl">📑</div>
                <p className="text-xs font-medium text-slate-600">
                  Chưa có hóa đơn nào được ghi nhận
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                      <th className="py-3 px-4">Mã Hóa Đơn</th>
                      <th className="py-3 px-4">Thời Gian</th>
                      <th className="py-3 px-4">Khách Hàng</th>
                      <th className="py-3 px-4 text-right">Tổng Tiền</th>
                      <th className="py-3 px-4">Thanh Toán</th>
                      <th className="py-3 px-4 text-center">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {recentInvoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          #{inv.id ? inv.id.slice(0, 8).toUpperCase() : "---"}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {formatDate(inv.created_at)}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {inv.customers?.full_name ? (
                            <div>
                              <div className="font-semibold">
                                {inv.customers.full_name}
                              </div>
                              {inv.customers.phone && (
                                <div className="text-[10px] text-slate-400">
                                  {inv.customers.phone}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">
                              Khách vãng lai
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {formatVND(inv.total_amount)}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px]">
                          {getPaymentMethodLabel(inv.payment_method)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(inv.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
