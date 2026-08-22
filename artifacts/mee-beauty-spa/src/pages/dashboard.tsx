import React, { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  todayRevenue: number;
  monthRevenue: number;
  totalExpenses: number;
  totalCustomers: number;
  totalInvoices: number;
  pendingInvoices: number;
}

interface RecentInvoice {
  id: string;
  total_amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  customers?: { full_name: string; phone: string } | null;
}

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    monthRevenue: 0,
    totalExpenses: 0,
    totalCustomers: 0,
    totalInvoices: 0,
    pendingInvoices: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      // 1. Lấy dữ liệu Hóa đơn
      const { data: invoicesData } = await supabase
        .from("invoices")
        .select(
          "id, total_amount, status, payment_method, created_at, customer_id, customers(full_name, phone)",
        )
        .order("created_at", { ascending: false });

      const invoices = invoicesData || [];

      let todayRev = 0;
      let monthRev = 0;
      let pendingCount = 0;

      invoices.forEach((inv: any) => {
        const invDate = new Date(inv.created_at);
        const amt = Number(inv.total_amount || 0);

        if (invDate >= todayStart) {
          todayRev += amt;
        }
        if (invDate >= monthStart) {
          monthRev += amt;
        }
        if (inv.status === "DRAFT" || inv.status === "PARTIALLY_PAID") {
          pendingCount += 1;
        }
      });

      // 2. Lấy dữ liệu Chi phí
      const { data: expensesData } = await supabase
        .from("expenses")
        .select("amount");

      const totalExp = (expensesData || []).reduce(
        (sum: number, exp: any) => sum + Number(exp.amount || 0),
        0,
      );

      // 3. Đếm số lượng Khách hàng
      const { count: customerCount } = await supabase
        .from("customers")
        .select("id", { count: "exact", head: true });

      setStats({
        todayRevenue: todayRev,
        monthRevenue: monthRev,
        totalExpenses: totalExp,
        totalCustomers: customerCount || 0,
        totalInvoices: invoices.length,
        pendingInvoices: pendingCount,
      });

      setRecentInvoices(invoices.slice(0, 5) as RecentInvoice[]);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (num: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 text-[10px]">
            Đã thanh toán
          </Badge>
        );
      case "PARTIALLY_PAID":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 text-[10px]">
            Thanh toán 1 phần
          </Badge>
        );
      case "DRAFT":
        return (
          <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200 text-[10px]">
            Đơn nháp
          </Badge>
        );
      case "VOID":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200 text-[10px]">
            Đã hủy
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4 p-3 sm:p-6 pb-24 max-w-7xl mx-auto font-sans">
      {/* Header Mobile-First */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Tổng Quan MEE BEAUTY SPA
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Báo cáo kinh doanh & chỉ số vận hành thực tế
          </p>
        </div>
        <Button
          onClick={fetchDashboardData}
          disabled={loading}
          size="sm"
          variant="outline"
          className="w-full sm:w-auto h-9 text-xs font-semibold rounded-lg shadow-sm border-slate-300"
        >
          🔄 {loading ? "Đang cập nhật..." : "Cập nhật số liệu"}
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="shadow-sm border-slate-200 rounded-xl">
          <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Doanh Thu Hôm Nay
            </CardTitle>
            <span className="text-base">💵</span>
          </CardHeader>
          <CardContent className="p-3.5 pt-1">
            {loading ? (
              <Skeleton className="h-7 w-28 mt-1" />
            ) : (
              <div className="text-xl sm:text-2xl font-black text-emerald-700">
                {formatVND(stats.todayRevenue)}
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              Tính theo hóa đơn ghi nhận trong ngày
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 rounded-xl">
          <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Doanh Thu Tháng
            </CardTitle>
            <span className="text-base">📈</span>
          </CardHeader>
          <CardContent className="p-3.5 pt-1">
            {loading ? (
              <Skeleton className="h-7 w-28 mt-1" />
            ) : (
              <div className="text-xl sm:text-2xl font-black text-blue-700">
                {formatVND(stats.monthRevenue)}
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              Tổng cộng từ đầu tháng hiện tại
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 rounded-xl">
          <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng Chi Phí
            </CardTitle>
            <span className="text-base">💸</span>
          </CardHeader>
          <CardContent className="p-3.5 pt-1">
            {loading ? (
              <Skeleton className="h-7 w-28 mt-1" />
            ) : (
              <div className="text-xl sm:text-2xl font-black text-rose-600">
                {formatVND(stats.totalExpenses)}
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              Các khoản chi ghi nhận trên hệ thống
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 rounded-xl">
          <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Lợi Nhuận Ước Tính
            </CardTitle>
            <span className="text-base">⚖️</span>
          </CardHeader>
          <CardContent className="p-3.5 pt-1">
            {loading ? (
              <Skeleton className="h-7 w-28 mt-1" />
            ) : (
              <div
                className={`text-xl sm:text-2xl font-black ${stats.monthRevenue - stats.totalExpenses >= 0 ? "text-indigo-700" : "text-amber-600"}`}
              >
                {formatVND(stats.monthRevenue - stats.totalExpenses)}
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              Doanh thu tháng trừ tổng chi phí
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Operations Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="shadow-sm border-slate-200 rounded-xl bg-slate-50/50">
          <CardContent className="p-3.5 text-center">
            <div className="text-xs font-semibold text-slate-500">
              Khách Hàng
            </div>
            {loading ? (
              <Skeleton className="h-6 w-12 mx-auto mt-1" />
            ) : (
              <div className="text-lg font-black text-slate-800 mt-0.5">
                {stats.totalCustomers}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 rounded-xl bg-slate-50/50">
          <CardContent className="p-3.5 text-center">
            <div className="text-xs font-semibold text-slate-500">
              Tổng Đơn Hàng
            </div>
            {loading ? (
              <Skeleton className="h-6 w-12 mx-auto mt-1" />
            ) : (
              <div className="text-lg font-black text-slate-800 mt-0.5">
                {stats.totalInvoices}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 rounded-xl bg-slate-50/50 col-span-2 sm:col-span-1">
          <CardContent className="p-3.5 text-center">
            <div className="text-xs font-semibold text-slate-500">
              Đơn Chờ Xử Lý
            </div>
            {loading ? (
              <Skeleton className="h-6 w-12 mx-auto mt-1" />
            ) : (
              <div className="text-lg font-black text-amber-600 mt-0.5">
                {stats.pendingInvoices}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices List */}
      <Card className="shadow-sm border-slate-200 rounded-xl overflow-hidden">
        <CardHeader className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-800">
            Giao Dịch Gần Đây
          </CardTitle>
          <span className="text-xs text-slate-400">5 hóa đơn mới nhất</span>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : recentInvoices.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Chưa có dữ liệu hóa đơn phát sinh trên hệ thống.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-bold text-slate-800 truncate">
                      {inv.customers?.full_name || "Khách vãng lai"}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>
                        {new Date(inv.created_at).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        - {new Date(inv.created_at).toLocaleDateString("vi-VN")}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-slate-600">
                        {inv.payment_method || "CASH"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 space-y-1">
                    <div className="font-extrabold text-slate-900 text-sm">
                      {formatVND(inv.total_amount)}
                    </div>
                    <div>{getStatusBadge(inv.status)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
