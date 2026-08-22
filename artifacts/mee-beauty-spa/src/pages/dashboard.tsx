import React, { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";

interface InvoiceSummary {
  id: string;
  code: string;
  customer_name?: string;
  final_amount: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
}

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
          id,
          code,
          invoice_number,
          total_amount,
          final_amount,
          payment_method,
          payment_status,
          status,
          created_at,
          customers ( full_name )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Lỗi khi tải dữ liệu hóa đơn:", error);
      } else if (data) {
        const mappedInvoices: InvoiceSummary[] = data.map((inv: any) => ({
          id: inv.id,
          code: inv.code || inv.invoice_number || `INV-${inv.id.slice(0, 5)}`,
          customer_name: inv.customers?.full_name || "Khách vãng lai",
          final_amount: Number(inv.final_amount ?? inv.total_amount ?? 0),
          payment_method: inv.payment_method || "CASH",
          payment_status: inv.payment_status || inv.status || "PAID",
          created_at: inv.created_at,
        }));

        const paidInvoices = mappedInvoices.filter(
          (inv) => inv.payment_status.toUpperCase() === "PAID",
        );

        const revenue = paidInvoices.reduce(
          (sum, inv) => sum + inv.final_amount,
          0,
        );

        setInvoices(mappedInvoices);
        setTotalRevenue(revenue);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN").format(val) + " đ";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Tổng quan kinh doanh
          </h1>
          <p className="text-xs text-slate-500">
            Báo cáo doanh thu & hóa đơn từ POS
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-50 text-slate-700"
        >
          Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Tổng doanh thu</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {formatVND(totalRevenue)}
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <p className="text-xs font-semibold text-slate-500">
            Số đơn bán lẻ (Invoices)
          </p>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {invoices.length}
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <p className="text-xs font-semibold text-slate-500">
            Giá trị trung bình đơn
          </p>
          <p className="text-2xl font-black text-indigo-600 mt-1">
            {invoices.length > 0
              ? formatVND(Math.round(totalRevenue / invoices.length))
              : "0 đ"}
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-800 mb-4">
          Hóa đơn gần đây
        </h2>
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Đang tải dữ liệu...
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Chưa có hóa đơn nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="pb-2">Mã HĐ</th>
                  <th className="pb-2">Khách hàng</th>
                  <th className="pb-2">HT Thanh toán</th>
                  <th className="pb-2 text-right">Tổng tiền</th>
                  <th className="pb-2 text-center">Trạng thái</th>
                  <th className="pb-2 text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.slice(0, 10).map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80">
                    <td className="py-3 font-mono font-bold text-blue-600">
                      {inv.code}
                    </td>
                    <td className="py-3 font-medium text-slate-800">
                      {inv.customer_name}
                    </td>
                    <td className="py-3 uppercase text-slate-600">
                      {inv.payment_method}
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900">
                      {formatVND(inv.final_amount)}
                    </td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {inv.payment_status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-400">
                      {new Date(inv.created_at).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
