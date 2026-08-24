import React, { useState, useEffect, useCallback } from "react";
import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "../services/supabase";
import { Button, Card, Badge, Spinner } from "../components/primitives";
import { attendanceService } from "../services/attendance.service";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// ============================================================
// HELPERS
// ============================================================

const formatVND = (val: number) =>
  new Intl.NumberFormat("vi-VN").format(val) + " đ";

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return format(d, "HH:mm", { locale: vi });
};

const formatDateFull = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return format(d, "EEEE, dd/MM/yyyy", { locale: vi });
};

// ============================================================
// DASHBOARD PROPS
// ============================================================

interface DashboardPageProps {
  userRole?: string; // 'owner' hoặc 'staff'
  onNavigate?: (tab: string) => void;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  userRole = "owner",
  onNavigate 
}) => {
  const isAdmin = userRole === "owner";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Staff hiện tại (tạm lấy staff đầu tiên, sau này thay bằng auth)
  const [currentStaffId, setCurrentStaffId] = useState<string | null>(null);

  // ---- Data states ----
  const [todayStats, setTodayStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    staffOnDuty: 0,
    staffAvailable: 0,
  });

  const [staffStatus, setStaffStatus] = useState<
    { id: string; full_name: string; role: string; status: "active" | "busy" | "off" }[]
  >([]);

  const [todayInvoices, setTodayInvoices] = useState<any[]>([]);
  const [actionItems, setActionItems] = useState<any[]>([]);

  // Staff-only states
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [currentService, setCurrentService] = useState<any>(null);
  const [staffList, setStaffList] = useState<any[]>([]);

  // ---- Fetch data ----
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString();

      // 1. Lấy invoices hôm nay
      const { data: invoices, error: invErr } = await supabase
        .from("invoices")
        .select(`
          id,
          created_at,
          customer_id,
          status,
          total_amount,
          subtotal,
          discount_amount,
          payment_method,
          customers (
            full_name,
            phone
          )
        `)
        .gte("created_at", todayIso)
        .order("created_at", { ascending: true });

      if (invErr) throw invErr;

      const paidInvoices = (invoices || []).filter(
        (i) => i.status === "PAID" || i.status === "PARTIALLY_PAID"
      );
      const revenue = paidInvoices.reduce((sum, i) => sum + (i.total_amount || 0), 0);
      const orders = (invoices || []).length;

      const custIds = new Set(
        (invoices || []).filter((i) => i.customer_id).map((i) => i.customer_id)
      );
      const customers = custIds.size;

      // 2. Lấy staff attendance hôm nay
      let staffOnDuty: any[] = [];
      let staffAvailable: any[] = [];
      try {
        const { data: attendances, error: attErr } = await supabase
          .from("attendance")
          .select(`
            staff_id,
            check_in,
            check_out,
            staff:staff_id (
              id,
              full_name,
              role
            )
          `)
          .eq("work_date", today.toISOString().split("T")[0]);

        if (!attErr && attendances) {
          staffOnDuty = attendances.filter((a) => a.check_in !== null) || [];
          staffAvailable = staffOnDuty.filter((a) => a.check_out === null) || [];
        }
      } catch (attErr) {
        console.warn("Attendance table not ready:", attErr);
      }

      // 3. Lấy tất cả staff (active)
      const { data: staffData, error: staffErr } = await supabase
        .from("staff")
        .select("id, full_name, role, status")
        .eq("status", "ACTIVE");

      if (staffErr) throw staffErr;
      setStaffList(staffData || []);

      // Set current staff id (lần đầu)
      if (staffData && staffData.length > 0 && !currentStaffId) {
        setCurrentStaffId(staffData[0].id);
      }

      const staffMap = new Map(
        staffOnDuty.map((a) => [
          a.staff_id,
          { check_in: a.check_in, check_out: a.check_out, staff: a.staff },
        ])
      );

      const staffStatusData = (staffData || []).map((s) => {
        const att = staffMap.get(s.id);
        if (!att) return { ...s, status: "off" as const };
        if (att.check_out) return { ...s, status: "off" as const };
        return { ...s, status: "active" as const };
      });

      const draftInvoices = (invoices || []).filter((i) => i.status === "DRAFT");
      const actionItemsData = draftInvoices.map((inv) => ({
        id: inv.id,
        title: `Hóa đơn #${inv.id.slice(0, 8)} chưa thanh toán`,
        action: "Thanh toán",
      }));

      setTodayInvoices(invoices || []);
      setTodayStats({ revenue, orders, customers, staffOnDuty: staffOnDuty.length, staffAvailable: staffAvailable.length });
      setStaffStatus(staffStatusData);
      setActionItems(actionItemsData);

      // 4. Lấy attendance của staff hiện tại
      const staffIdToUse = currentStaffId || staffData?.[0]?.id;
      if (staffIdToUse) {
        const { data: attToday, error: attTodayErr } = await supabase
          .from("attendance")
          .select("*")
          .eq("staff_id", staffIdToUse)
          .eq("work_date", today.toISOString().split("T")[0])
          .maybeSingle();

        if (!attTodayErr) {
          setTodayAttendance(attToday || null);
        } else {
          setTodayAttendance(null);
        }

        // Lấy service session đang diễn ra (nếu có)
        const { data: sessions, error: sessErr } = await supabase
          .from("service_sessions")
          .select(`
            id,
            performed_at,
            catalog_item_id,
            customer_id,
            catalog_items: catalog_item_id (
              name
            ),
            customers: customer_id (
              full_name
            )
          `)
          .eq("staff_id", staffIdToUse)
          .gt("performed_at", todayIso)
          .order("performed_at", { ascending: true })
          .limit(1);

        if (!sessErr && sessions && sessions.length > 0) {
          setCurrentService(sessions[0]);
        } else {
          setCurrentService(null);
        }

        // Khách tiếp theo
        const { data: nextSessions, error: nextErr } = await supabase
          .from("service_sessions")
          .select(`
            id,
            performed_at,
            catalog_item_id,
            customer_id,
            catalog_items: catalog_item_id (
              name
            ),
            customers: customer_id (
              full_name
            )
          `)
          .eq("staff_id", staffIdToUse)
          .gt("performed_at", new Date().toISOString())
          .order("performed_at", { ascending: true })
          .limit(1);

        if (!nextErr && nextSessions && nextSessions.length > 0) {
          setNextAppointment(nextSessions[0]);
        } else {
          setNextAppointment(null);
        }
      }
    } catch (err: any) {
      setError(err.message || "Lỗi tải dữ liệu Dashboard");
    } finally {
      setLoading(false);
    }
  }, [currentStaffId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // ========== HANDLERS ==========

  const handleCheckIn = async () => {
    const staffId = currentStaffId || staffList[0]?.id;
    if (!staffId) {
      alert("Không tìm thấy nhân viên");
      return;
    }
    setSubmitting(true);
    try {
      const result = await attendanceService.checkIn(staffId);
      // Cập nhật state ngay lập tức
      setTodayAttendance(result);
      alert("✅ Check-in thành công!");
      // Vẫn gọi loadDashboard để cập nhật thống kê staff khác
      loadDashboard();
    } catch (err: any) {
      alert(err.message || "Lỗi check-in");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    const staffId = currentStaffId || staffList[0]?.id;
    if (!staffId) {
      alert("Không tìm thấy nhân viên");
      return;
    }
    setSubmitting(true);
    try {
      const result = await attendanceService.checkOut(staffId);
      setTodayAttendance(result);
      alert("✅ Check-out thành công!");
      loadDashboard();
    } catch (err: any) {
      alert(err.message || "Lỗi check-out");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoToPOS = () => {
    if (onNavigate) onNavigate("pos");
  };

  const handleGoToCustomers = () => {
    if (onNavigate) onNavigate("customers");
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Spinner className="py-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          <p className="font-semibold">⚠️ {error}</p>
          <button
            onClick={loadDashboard}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // ------ MANAGER DASHBOARD ------
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">MEE BEAUTY SPA</h1>
            <p className="text-sm text-slate-500">
              {formatDateFull(new Date().toISOString())}
            </p>
            <p className="text-sm text-slate-600 mt-1">Chào buổi sáng, Quản lý 👋</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboard}
              className="p-2 rounded-full hover:bg-slate-200 transition"
            >
              🔄
            </button>
            <div className="relative">
              <span className="text-2xl">🔔</span>
              {actionItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                  {actionItems.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Today Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500">👥 Khách</div>
            <div className="text-2xl font-bold text-slate-900">{todayStats.customers}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500">📅 Lịch</div>
            <div className="text-2xl font-bold text-slate-900">{todayStats.orders}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500">💰 Doanh thu</div>
            <div className="text-2xl font-bold text-emerald-700">{formatVND(todayStats.revenue)}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500">👩 KTV</div>
            <div className="text-2xl font-bold text-slate-900">
              {todayStats.staffAvailable} / {todayStats.staffOnDuty}
            </div>
          </div>
        </div>

        {/* Action Required */}
        {actionItems.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">⚠️ Cần xử lý</h2>
            <div className="space-y-2">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm flex flex-wrap items-center justify-between gap-3"
                >
                  <span className="text-sm text-slate-800">{item.title}</span>
                  <Button size="sm" variant="outline" onClick={handleGoToPOS}>
                    {item.action}
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Live Operations */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-800">🔄 Đang vận hành</h2>
            <button className="text-sm text-blue-600 hover:underline" onClick={() => onNavigate?.("operations")}>
              Xem tất cả
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {staffStatus.length === 0 ? (
              <div className="col-span-2 text-center text-slate-500 py-8">
                Chưa có nhân viên nào đang làm.
              </div>
            ) : (
              staffStatus.map((staff) => {
                const statusColor =
                  staff.status === "active"
                    ? "bg-emerald-100 text-emerald-800"
                    : staff.status === "busy"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-100 text-slate-500";
                const statusLabel =
                  staff.status === "active"
                    ? "🟢 Rảnh"
                    : staff.status === "busy"
                    ? "🔵 Đang phục vụ"
                    : "⚪ Nghỉ / tạm vắng";
                return (
                  <div key={staff.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{staff.full_name}</div>
                        <div className="text-xs text-slate-500">{staff.role}</div>
                      </div>
                      <Badge variant="neutral" className={statusColor}>
                        {statusLabel}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Today's Appointments */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">📋 Hôm nay</h2>
          {todayInvoices.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
              Hôm nay chưa có lịch hẹn.
            </div>
          ) : (
            <div className="space-y-2">
              {todayInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-medium text-slate-900">
                      {inv.customers?.full_name || "Khách vãng lai"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatDate(inv.created_at)} · {inv.customers?.phone || ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral" className="bg-slate-100">
                      {inv.status === "PAID" ? "Đã thanh toán" : inv.status}
                    </Badge>
                    <span className="text-sm font-medium text-slate-800">
                      {formatVND(inv.total_amount || 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:static md:translate-x-0 flex gap-3 bg-white p-3 rounded-2xl shadow-lg border border-slate-200 md:shadow-none md:border-0 md:bg-transparent md:p-0">
          <Button variant="primary" className="flex-1 md:flex-none" onClick={handleGoToCustomers}>
            + Thêm khách
          </Button>
          <Button variant="secondary" className="flex-1 md:flex-none" onClick={handleGoToPOS}>
            🛒 POS
          </Button>
        </div>
      </div>
    );
  }

  // ------ STAFF DASHBOARD ------
  const currentStaffName = staffList.find(s => s.id === currentStaffId)?.full_name || "Nhân viên";

  return (
    <div className="min-h-screen bg-slate-50 p-4 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">MEE BEAUTY SPA</h1>
        <p className="text-sm text-slate-500">Xin chào, {currentStaffName} 👋</p>
        <p className="text-xs text-slate-400 mt-1">{formatDateFull(new Date().toISOString())}</p>
      </div>

      {/* Attendance */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Chấm công</span>
          {todayAttendance?.check_in ? (
            <Badge variant="success" className="bg-emerald-100 text-emerald-800">
              🟢 Đã chấm công
            </Badge>
          ) : (
            <Badge variant="neutral">Chưa chấm công</Badge>
          )}
        </div>
        {todayAttendance?.check_in && (
          <div className="mt-1 text-xs text-slate-500">
            Check-in: {formatDate(todayAttendance.check_in)}
            {todayAttendance.check_out && ` · Check-out: ${formatDate(todayAttendance.check_out)}`}
          </div>
        )}
        <div className="mt-3">
          {!todayAttendance?.check_in ? (
            <Button variant="primary" className="w-full py-3 text-base" onClick={handleCheckIn} disabled={submitting}>
              🟢 Check-in
            </Button>
          ) : todayAttendance?.check_out ? (
            <div className="text-center text-sm text-slate-500">✅ Ca hôm nay đã kết thúc</div>
          ) : (
            <Button variant="secondary" className="w-full py-3 text-base" onClick={handleCheckOut} disabled={submitting}>
              🔴 Check-out
            </Button>
          )}
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="text-sm font-medium text-slate-700">Trạng thái của bạn</div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-2xl">🟢</span>
          <span className="text-lg font-semibold text-slate-800">Đang rảnh</span>
        </div>
        {currentService && (
          <div className="mt-2 border-t pt-2 text-xs text-slate-600">
            <div>Đang phục vụ: {currentService.customers?.full_name}</div>
            <div>{currentService.catalog_items?.name}</div>
            <div className="text-slate-400">{formatDate(currentService.performed_at)}</div>
          </div>
        )}
      </div>

      {/* Next Appointment */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="text-sm font-medium text-slate-700">Khách tiếp theo</div>
        {nextAppointment ? (
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900">
              {nextAppointment.customers?.full_name || "Khách"}
            </div>
            <div className="text-sm text-slate-600">{nextAppointment.catalog_items?.name}</div>
            <div className="text-xs text-slate-400 mt-1">{formatDate(nextAppointment.performed_at)}</div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">Xem khách</Button>
              <Button size="sm" variant="secondary" className="flex-1">Bắt đầu</Button>
            </div>
          </div>
        ) : (
          <div className="mt-2 text-sm text-slate-500">Bạn hiện không có lịch khách.</div>
        )}
      </div>

      {/* POS Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg">
        <Button variant="primary" className="w-full py-4 text-lg shadow-lg shadow-emerald-600/20" onClick={handleGoToPOS}>
          🛒 MỞ POS
        </Button>
      </div>
    </div>
  );
};

export default DashboardPage;