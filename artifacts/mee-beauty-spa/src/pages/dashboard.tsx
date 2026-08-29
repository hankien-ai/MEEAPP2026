// src/pages/dashboard.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/services/supabase";
import { attendanceService } from "@/services/attendance.service";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Users,
  ShoppingCart,
  UserCog,
  Grid,
  BarChart3,
  Clock,
  Calendar,
  AlertCircle,
  DollarSign,
  FileText,
  ClipboardCheck,
} from "lucide-react";

// ==========================================================
// HELPERS
// ==========================================================
const formatVND = (val: number) => new Intl.NumberFormat("vi-VN").format(val) + " đ";

// Danh sách công việc mặc định cho nhân viên
const DEFAULT_TASKS = [
  { id: "task-1", label: "Vệ sinh khu vực làm việc", done: false },
  { id: "task-2", label: "Kiểm tra dụng cụ, thiết bị", done: false },
  { id: "task-3", label: "Kiểm tra vật tư tiêu hao", done: false },
  { id: "task-4", label: "Chuẩn bị phòng dịch vụ", done: false },
  { id: "task-5", label: "Cập nhật danh sách khách hẹn", done: false },
];

// ==========================================================
// DASHBOARD PAGE
// ==========================================================
interface DashboardPageProps {
  userRole?: string;
  onNavigate?: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ userRole, onNavigate }) => {
  const { currentStaff, role } = useAuth();
  const isAdmin = role === "admin" || userRole === "owner";

  // ---------------------------------------------------------
  // State chung
  // ---------------------------------------------------------
  const [today, setToday] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------
  // Staff Dashboard States
  // ---------------------------------------------------------
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [monthlyAttendance, setMonthlyAttendance] = useState<any[]>([]);
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // ---------------------------------------------------------
  // Admin Dashboard States
  // ---------------------------------------------------------
  const [adminStats, setAdminStats] = useState({
    customersToday: 0,
    invoicesToday: 0,
    revenueToday: 0,
    staffOnDuty: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [actionItems, setActionItems] = useState<any[]>([]);

  // ---------------------------------------------------------
  // LOAD DATA
  // ---------------------------------------------------------
  useEffect(() => {
    if (currentStaff) {
      loadData();
    }
  }, [currentStaff, currentMonth]);

  const loadData = async () => {
    setLoading(true);
    try {
      const staffId = currentStaff?.id;
      if (!staffId) return;

      // ---- Attendance ----
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const attToday = await attendanceService.getTodayAttendance(staffId);
      setTodayAttendance(attToday);

      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      const attMonth = await attendanceService.getMonthlyAttendance(staffId, month, year);
      setMonthlyAttendance(attMonth);

      // ---- Nếu là admin, load thêm dữ liệu ----
      if (isAdmin) {
        await loadAdminData();
      }
    } catch (err) {
      console.error("Lỗi tải dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // ADMIN DATA
  // ---------------------------------------------------------
  const loadAdminData = async () => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const startOfDay = new Date(todayStr).toISOString();
    const endOfDay = new Date(todayStr + "T23:59:59.999Z").toISOString();

    // 1. Customers mới hôm nay
    const { count: customersCount } = await supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay);

    // 2. Invoices hôm nay (đã thanh toán hoặc nợ một phần)
    const { data: invoices } = await supabase
      .from("invoices")
      .select("total_amount, status")
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay)
      .in("status", ["PAID", "PARTIALLY_PAID"]);

    const revenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
    const invoiceCount = invoices?.length || 0;

    // 3. Staff đang làm (check-in hôm nay, chưa check-out)
    const { data: staffOnDuty } = await supabase
      .from("attendance")
      .select("staff_id")
      .eq("work_date", todayStr)
      .not("check_in", "is", null)
      .is("check_out", null);

    setAdminStats({
      customersToday: customersCount || 0,
      invoicesToday: invoiceCount,
      revenueToday: revenue,
      staffOnDuty: staffOnDuty?.length || 0,
    });

    // 4. Hoạt động hôm nay (timeline)
    await loadActivities(todayStr);

    // 5. Việc cần xử lý
    await loadActionItems(todayStr);
  };

  const loadActivities = async (dateStr: string) => {
    const activities: any[] = [];

    // Attendance check-in
    const { data: checkins } = await supabase
      .from("attendance")
      .select(`
        staff_id,
        check_in,
        staff:staff_id (full_name)
      `)
      .eq("work_date", dateStr)
      .not("check_in", "is", null)
      .order("check_in", { ascending: false })
      .limit(5);

    if (checkins) {
      checkins.forEach((item) => {
        activities.push({
          id: `att-${item.staff_id}`,
          type: "checkin",
          label: `${item.staff?.full_name || "Nhân viên"} đã check-in`,
          time: item.check_in,
          icon: "🟢",
        });
      });
    }

    // Customers mới
    const { data: newCustomers } = await supabase
      .from("customers")
      .select("full_name, created_at")
      .gte("created_at", `${dateStr}T00:00:00`)
      .lte("created_at", `${dateStr}T23:59:59`)
      .order("created_at", { ascending: false })
      .limit(5);

    if (newCustomers) {
      newCustomers.forEach((c) => {
        activities.push({
          id: `cust-${c.id}`,
          type: "new_customer",
          label: `Khách hàng mới: ${c.full_name}`,
          time: c.created_at,
          icon: "👤",
        });
      });
    }

    // Invoices thanh toán
    const { data: paidInvoices } = await supabase
      .from("invoices")
      .select("id, total_amount, created_at")
      .gte("created_at", `${dateStr}T00:00:00`)
      .lte("created_at", `${dateStr}T23:59:59`)
      .in("status", ["PAID", "PARTIALLY_PAID"])
      .order("created_at", { ascending: false })
      .limit(5);

    if (paidInvoices) {
      paidInvoices.forEach((inv) => {
        activities.push({
          id: `inv-${inv.id}`,
          type: "invoice_paid",
          label: `Hóa đơn ${inv.id.slice(0, 6)} - ${formatVND(inv.total_amount)}`,
          time: inv.created_at,
          icon: "💳",
        });
      });
    }

    // Sắp xếp theo thời gian giảm dần và lấy 10 mục gần nhất
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setActivities(activities.slice(0, 10));
  };

  const loadActionItems = async (dateStr: string) => {
    const items: any[] = [];

    // 1. Staff chưa check-in hôm nay (active staff)
    const { data: activeStaff } = await supabase.from("staff").select("id, full_name").eq("status", "ACTIVE");
    const { data: checkedIn } = await supabase
      .from("attendance")
      .select("staff_id")
      .eq("work_date", dateStr)
      .not("check_in", "is", null);

    const checkedInIds = new Set(checkedIn?.map((c) => c.staff_id) || []);
    const notCheckedIn = activeStaff?.filter((s) => !checkedInIds.has(s.id)) || [];
    if (notCheckedIn.length > 0) {
      items.push({
        id: "att-missing",
        label: `${notCheckedIn.length} nhân viên chưa check-in hôm nay`,
        action: "Xem",
        link: "staff",
        severity: "warning",
      });
    }

    // 2. Hóa đơn chưa hoàn tất (DRAFT hoặc PARTIALLY_PAID)
    const { data: draftInvoices } = await supabase
      .from("invoices")
      .select("id, status")
      .in("status", ["DRAFT", "PARTIALLY_PAID"])
      .limit(5);
    if (draftInvoices && draftInvoices.length > 0) {
      items.push({
        id: "inv-pending",
        label: `${draftInvoices.length} hóa đơn chưa hoàn tất`,
        action: "Xem",
        link: "invoices",
        severity: "info",
      });
    }

    // 3. Khách đang chờ (service_sessions chưa có staff)
    const { data: waiting } = await supabase
      .from("service_sessions")
      .select("id, customers:customer_id (full_name)")
      .is("staff_id", null)
      .gt("performed_at", new Date().toISOString())
      .limit(5);

    if (waiting && waiting.length > 0) {
      items.push({
        id: "waiting",
        label: `${waiting.length} khách đang chờ dịch vụ`,
        action: "Xem",
        link: "operations",
        severity: "danger",
      });
    }

    setActionItems(items);
  };

  // ---------------------------------------------------------
  // HANDLERS – CHẤM CÔNG
  // ---------------------------------------------------------
  const handleCheckIn = async () => {
    if (!currentStaff) return;
    setSubmitting(true);
    try {
      const result = await attendanceService.checkIn(currentStaff.id);
      setTodayAttendance(result);
    } catch (err: any) {
      alert(err.message || "Lỗi check-in");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    if (!currentStaff) return;
    setSubmitting(true);
    try {
      const result = await attendanceService.checkOut(currentStaff.id);
      setTodayAttendance(result);
    } catch (err: any) {
      alert(err.message || "Lỗi check-out");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // HANDLERS – TASKS
  // ---------------------------------------------------------
  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t))
    );
  };

  // ---------------------------------------------------------
  // HANDLERS – NAVIGATION
  // ---------------------------------------------------------
  const navigateTo = (tab: string) => {
    if (onNavigate) onNavigate(tab);
  };

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center text-slate-500">Đang tải...</div>
      </div>
    );
  }

  // ==========================================================
  // STAFF DASHBOARD
  // ==========================================================
  if (!isAdmin) {
    const staffName = currentStaff?.full_name || "Nhân viên";
    const now = new Date();
    const isCheckedIn = todayAttendance?.check_in !== null && todayAttendance?.check_in !== undefined;
    const isCheckedOut = todayAttendance?.check_out !== null && todayAttendance?.check_out !== undefined;

    // Thống kê tháng
    const daysInMonth = monthlyAttendance.filter((a) => a.check_in !== null).length;
    const leaveDays = monthlyAttendance.filter((a) => a.check_in === null).length;
    const lateDays = monthlyAttendance.filter((a) => a.status === "LATE").length;
    const earlyLeave = monthlyAttendance.filter((a) => a.status === "EARLY_LEAVE").length;

    // Lịch tháng
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const getDayStatus = (date: Date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const att = monthlyAttendance.find((a) => a.work_date === dateStr);
      if (!att) return null;
      if (att.check_in && att.check_out) return "present";
      if (att.check_in && !att.check_out) return "present";
      return "absent";
    };

    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        <div className="max-w-lg mx-auto p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-800">Xin chào, {staffName} 👋</h1>
            <span className="text-sm text-slate-500">{format(now, "EEEE, dd/MM/yyyy", { locale: vi })}</span>
          </div>

          {/* Chấm công */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">⏰ {format(now, "HH:mm", { locale: vi })}</span>
              <span className="text-xs text-slate-400">{isCheckedOut ? "Đã kết thúc ca" : isCheckedIn ? "Đang làm việc" : "Chưa chấm công"}</span>
            </div>
            <div className="flex gap-3">
              {!isCheckedIn && (
                <button
                  onClick={handleCheckIn}
                  disabled={submitting}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30 active:scale-95 transition-all"
                >
                  🟢 CHẤM CÔNG
                </button>
              )}
              {isCheckedIn && !isCheckedOut && (
                <button
                  onClick={handleCheckOut}
                  disabled={submitting}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-600/30 active:scale-95 transition-all"
                >
                  🔴 KẾT THÚC CA
                </button>
              )}
              {isCheckedOut && (
                <div className="flex-1 text-center py-3 bg-slate-100 text-slate-500 font-medium rounded-xl">
                  ✅ Đã hoàn tất
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4 text-xs">
              <div className="text-center p-2 bg-slate-50 rounded-xl">
                <div className="text-emerald-600 font-bold">{daysInMonth}</div>
                <div className="text-slate-400">Đã làm</div>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-xl">
                <div className="text-amber-600 font-bold">{leaveDays}</div>
                <div className="text-slate-400">Nghỉ</div>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-xl">
                <div className="text-rose-600 font-bold">{lateDays}</div>
                <div className="text-slate-400">Đi trễ</div>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-xl">
                <div className="text-blue-600 font-bold">{earlyLeave}</div>
                <div className="text-slate-400">Về sớm</div>
              </div>
            </div>
          </div>

          {/* Công việc hôm nay */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" /> Công việc hôm nay
            </h2>
            <div className="space-y-2">
              {tasks.map((task) => (
                <label key={task.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(task.id)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className={`text-sm ${task.done ? "line-through text-slate-400" : "text-slate-700"}`}>{task.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Lịch chấm công */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Lịch chấm công
            </h2>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
                <div key={d} className="font-semibold text-slate-400 py-1">{d}</div>
              ))}
              {days.map((day) => {
                const status = getDayStatus(day);
                let bg = "bg-white hover:bg-slate-50";
                if (status === "present") bg = "bg-emerald-100 hover:bg-emerald-200";
                if (status === "absent") bg = "bg-rose-100 hover:bg-rose-200";
                const todayFlag = isToday(day);
                const dayNum = format(day, "d");
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(format(day, "yyyy-MM-dd"))}
                    className={`p-1.5 rounded-lg ${bg} ${todayFlag ? "ring-2 ring-emerald-500" : ""}`}
                  >
                    <div className="font-medium">{dayNum}</div>
                  </button>
                );
              })}
            </div>
            {selectedDate && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs">
                <div className="font-semibold">{format(new Date(selectedDate), "EEEE, dd/MM/yyyy", { locale: vi })}</div>
                {(() => {
                  const att = monthlyAttendance.find((a) => a.work_date === selectedDate);
                  if (!att) return <div className="text-slate-400">Không có dữ liệu</div>;
                  if (att.check_in) {
                    return (
                      <div className="mt-1 space-y-0.5">
                        <div>Check-in: {format(new Date(att.check_in), "HH:mm")}</div>
                        {att.check_out && <div>Check-out: {format(new Date(att.check_out), "HH:mm")}</div>}
                        {att.notes && <div className="text-slate-400">Ghi chú: {att.notes}</div>}
                      </div>
                    );
                  }
                  return <div className="text-rose-600">Nghỉ</div>;
                })()}
              </div>
            )}
          </div>

          {/* Thao tác nhanh */}
          <div className="grid grid-cols-3 gap-3 mt-2">
            <button
              onClick={() => navigateTo("pos")}
              className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
            >
              <ShoppingCart className="w-6 h-6 text-pink-600" />
              <span className="text-xs font-medium mt-1">POS</span>
            </button>
            <button
              onClick={() => navigateTo("customers")}
              className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
            >
              <Users className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-medium mt-1">Khách hàng</span>
            </button>
            <button
              onClick={() => navigateTo("extension")}
              className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
            >
              <Grid className="w-6 h-6 text-purple-600" />
              <span className="text-xs font-medium mt-1">Mở rộng</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ADMIN DASHBOARD
  // ==========================================================
  const adminName = currentStaff?.full_name || "Quản lý";
  const now = new Date();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Xin chào, {adminName} 👋</h1>
          <span className="text-sm text-slate-500">{format(now, "EEEE, dd/MM/yyyy", { locale: vi })}</span>
        </div>

        {/* Chấm công cho Admin (nếu có) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-slate-700">Chấm công hôm nay</span>
            {todayAttendance ? (
              <div className="text-xs text-emerald-600">✅ Đã check-in {format(new Date(todayAttendance.check_in), "HH:mm")}</div>
            ) : (
              <div className="text-xs text-amber-600">⏳ Chưa chấm công</div>
            )}
          </div>
          <button
            onClick={todayAttendance ? handleCheckOut : handleCheckIn}
            disabled={submitting}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/30 active:scale-95 transition-all"
          >
            {todayAttendance ? "Kết thúc ca" : "Chấm công"}
          </button>
        </div>

        {/* Báo cáo hôm nay */}
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => navigateTo("customers")}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-xs text-slate-400">Hôm nay</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-800">{adminStats.customersToday}</div>
            <div className="text-xs text-slate-500">Khách hàng mới</div>
          </div>
          <div
            onClick={() => navigateTo("invoices")}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <FileText className="w-5 h-5 text-purple-600" />
              <span className="text-xs text-slate-400">Hôm nay</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-800">{adminStats.invoicesToday}</div>
            <div className="text-xs text-slate-500">Hóa đơn</div>
          </div>
          <div
            onClick={() => navigateTo("reports")}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span className="text-xs text-slate-400">Hôm nay</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-700">{formatVND(adminStats.revenueToday)}</div>
            <div className="text-xs text-slate-500">Doanh thu</div>
          </div>
          <div
            onClick={() => navigateTo("staff")}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <UserCog className="w-5 h-5 text-amber-600" />
              <span className="text-xs text-slate-400">Hôm nay</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-800">{adminStats.staffOnDuty}</div>
            <div className="text-xs text-slate-500">Nhân viên đang làm</div>
          </div>
        </div>

        {/* Việc cần xử lý */}
        {actionItems.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" /> Việc cần xử lý
            </h2>
            <div className="space-y-2">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigateTo(item.link)}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all"
                >
                  <span className="text-sm text-slate-700">{item.label}</span>
                  <span className="text-xs text-indigo-600 font-medium">Xem →</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hoạt động hôm nay */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Hoạt động hôm nay
          </h2>
          {activities.length === 0 ? (
            <div className="text-center text-slate-400 text-sm py-4">Chưa có hoạt động nào</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {activities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 p-2 border-b border-slate-100 last:border-0">
                  <span className="text-lg">{act.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm text-slate-800">{act.label}</div>
                    <div className="text-xs text-slate-400">{format(new Date(act.time), "HH:mm")}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Thao tác nhanh */}
        <div className="grid grid-cols-5 gap-2 mt-2">
          <button
            onClick={() => navigateTo("pos")}
            className="flex flex-col items-center justify-center p-2 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
          >
            <ShoppingCart className="w-5 h-5 text-pink-600" />
            <span className="text-[10px] font-medium mt-1">POS</span>
          </button>
          <button
            onClick={() => navigateTo("customers")}
            className="flex flex-col items-center justify-center p-2 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
          >
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-[10px] font-medium mt-1">Khách hàng</span>
          </button>
          <button
            onClick={() => navigateTo("staff")}
            className="flex flex-col items-center justify-center p-2 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
          >
            <UserCog className="w-5 h-5 text-amber-600" />
            <span className="text-[10px] font-medium mt-1">Nhân viên</span>
          </button>
          <button
            onClick={() => navigateTo("reports")}
            className="flex flex-col items-center justify-center p-2 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
          >
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span className="text-[10px] font-medium mt-1">Báo cáo</span>
          </button>
          <button
            onClick={() => navigateTo("extension")}
            className="flex flex-col items-center justify-center p-2 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
          >
            <Grid className="w-5 h-5 text-purple-600" />
            <span className="text-[10px] font-medium mt-1">Mở rộng</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;