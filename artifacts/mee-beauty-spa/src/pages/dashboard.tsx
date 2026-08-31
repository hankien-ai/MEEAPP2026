// src/pages/dashboard.tsx
import { DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "@/services/supabase";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/services/supabase";
import { attendanceService } from "@/services/attendance.service";
import { appointmentService } from "@/services/appointment.service";
import { taskService } from "@/services/task.service";
import { notificationService } from "@/services/notification.service";
import { pushService } from "@/services/push.service";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Home,
  Users,
  ShoppingCart,
  UserCog,
  Package,
  MoreHorizontal,
  Zap,
  X,
  BarChart3,
  CheckCircle,
  Clock,
  Calendar,
  AlertCircle,
  TrendingUp,
  DollarSign,
  UserPlus,
  FileText,
  Briefcase,
  ClipboardCheck,
  Sparkles,
  Grid,
  Plus,
  Bell,
  Building2,
} from "lucide-react";

const formatVND = (val: number) => new Intl.NumberFormat("vi-VN").format(val) + " đ";

// ==========================================================
// MODAL TẠO LỊCH HẸN (Đơn giản)
// ==========================================================
const AppointmentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  staffList: any[];
  customerList: any[];
}> = ({ isOpen, onClose, onSave, staffList, customerList }) => {
  const [form, setForm] = useState({
    customer_id: "",
    staff_id: "",
    appointment_date: format(new Date(), "yyyy-MM-dd"),
    start_time: "09:00",
    end_time: "10:00",
    note: "",
    is_new_customer: false,
  });
  const [loading, setLoading] = useState(false);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState(customerList);

  useEffect(() => {
    if (searchCustomer.trim()) {
      setFilteredCustomers(
        customerList.filter(c => 
          c.full_name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
          c.phone?.includes(searchCustomer)
        )
      );
    } else {
      setFilteredCustomers(customerList.slice(0, 10));
    }
  }, [searchCustomer, customerList]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      alert(err.message || "Lỗi tạo lịch hẹn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800">📅 Tạo lịch hẹn</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Khách hàng</label>
            <input
              type="text"
              value={searchCustomer}
              onChange={(e) => setSearchCustomer(e.target.value)}
              placeholder="Tìm khách hàng..."
              className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
            />
            {searchCustomer && filteredCustomers.length > 0 && (
              <div className="mt-1 max-h-40 overflow-y-auto border border-slate-200 rounded-lg bg-white">
                {filteredCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setForm({ ...form, customer_id: c.id });
                      setSearchCustomer(c.full_name);
                      setFilteredCustomers([]);
                    }}
                    className="p-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 text-sm"
                  >
                    {c.full_name} {c.phone && `(${c.phone})`}
                  </div>
                ))}
              </div>
            )}
            {form.customer_id && !searchCustomer && (
              <div className="mt-1 p-2 bg-emerald-50 rounded-lg text-sm text-emerald-700">
                ✅ Đã chọn: {customerList.find(c => c.id === form.customer_id)?.full_name}
                <button 
                  onClick={() => { setForm({ ...form, customer_id: "" }); setSearchCustomer(""); }}
                  className="ml-2 text-red-500 text-xs"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Tag khách hàng</label>
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => setForm({ ...form, is_new_customer: false })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                  !form.is_new_customer ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-slate-300 text-slate-600'
                }`}
              >
                Khách cũ
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, is_new_customer: true })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                  form.is_new_customer ? 'bg-emerald-100 border-emerald-400 text-emerald-700' : 'bg-white border-slate-300 text-slate-600'
                }`}
              >
                Khách mới
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Nhân viên</label>
            <select
              value={form.staff_id}
              onChange={(e) => setForm({ ...form, staff_id: e.target.value })}
              className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="">-- Chọn nhân viên (nếu có) --</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Ngày</label>
              <input
                type="date"
                value={form.appointment_date}
                onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Giờ</label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Ghi chú</label>
            <textarea
              rows={2}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
              placeholder="Ghi chú thêm..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Đang tạo..." : "Tạo lịch hẹn"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================================
// MODAL TẠO CÔNG VIỆC
// ==========================================================
const TaskModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  staffList: any[];
}> = ({ isOpen, onClose, onSave, staffList }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigned_to: "",
    due_date: format(new Date(), "yyyy-MM-dd"),
    due_time: "17:00",
    priority: "NORMAL",
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("Vui lòng nhập tiêu đề công việc");
      return;
    }
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      alert(err.message || "Lỗi tạo công việc");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800">📋 Giao việc mới</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Tiêu đề *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
              placeholder="VD: Vệ sinh phòng 2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Mô tả</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
              placeholder="Chi tiết công việc..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Giao cho</label>
            <select
              value={form.assigned_to}
              onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
              className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="">-- Chọn nhân viên (nếu có) --</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Ngày hạn</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Giờ hạn</label>
              <input
                type="time"
                value={form.due_time}
                onChange={(e) => setForm({ ...form, due_time: e.target.value })}
                className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Mức độ ưu tiên</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="NORMAL">Bình thường</option>
              <option value="IMPORTANT">Quan trọng</option>
              <option value="URGENT">Khẩn cấp</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Đang tạo..." : "Giao việc"}
          </button>
        </form>
      </div>
    </div>
  );
};

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

  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [monthlyAttendance, setMonthlyAttendance] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [serviceList, setServiceList] = useState<any[]>([]);

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Admin stats và các dữ liệu khác
  const [adminStats, setAdminStats] = useState({
    customersToday: 0,
    invoicesToday: 0,
    revenueToday: 0,
    staffOnDuty: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [actionItems, setActionItems] = useState<any[]>([]);

  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");

  // ==========================================================
  // LOAD DATA
  // ==========================================================
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

      const todayStr = format(new Date(), "yyyy-MM-dd");
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();

      // === Gom tất cả request KHÔNG PHỤ THUỘC vào Promise.all ===
      const [
        attToday,
        attMonth,
        staffData,
        customerData,
        branchData,
      ] = await Promise.all([
        attendanceService.getTodayAttendance(staffId),
        attendanceService.getMonthlyAttendance(staffId, month, year),
        supabase.from("staff").select("id, full_name").eq("status", "ACTIVE"),
        supabase.from("customers").select("id, full_name").order("created_at", { ascending: false }).limit(20),
        isAdmin ? supabase.from('branches').select('id, name') : Promise.resolve({ data: [] }),
      ]);

      // Lưu dữ liệu chính
      setTodayAttendance(attToday);
      setMonthlyAttendance(attMonth);
      setStaffList(staffData.data || []);
      setCustomerList(customerData.data || []);
      if (isAdmin && branchData.data && branchData.data.length > 0) {
        setBranches(branchData.data);
        setSelectedBranch(branchData.data[0].id);
      }

      // === Phần dữ liệu cần thiết cho admin (nhưng vẫn song song) ===
      if (isAdmin) {
        // Gom tất cả request admin vào một Promise.all
        const adminResults = await Promise.all([
          // 1. Đếm khách hàng mới
          supabase
            .from("customers")
            .select("id", { count: "exact", head: true })
            .gte("created_at", new Date(todayStr).toISOString())
            .lte("created_at", new Date(todayStr + "T23:59:59.999Z").toISOString()),
          // 2. Lấy hóa đơn trong ngày
          supabase
            .from("invoices")
            .select("total_amount, status")
            .gte("created_at", new Date(todayStr).toISOString())
            .lte("created_at", new Date(todayStr + "T23:59:59.999Z").toISOString())
            .in("status", ["PAID", "PARTIALLY_PAID"]),
          // 3. Staff đang làm
          supabase
            .from("attendance")
            .select("staff_id")
            .eq("work_date", todayStr)
            .not("check_in", "is", null)
            .is("check_out", null),
          // 4. Check-in gần nhất
          supabase
            .from("attendance")
            .select(`staff_id, check_in, staff:staff_id (full_name)`)
            .eq("work_date", todayStr)
            .not("check_in", "is", null)
            .order("check_in", { ascending: false })
            .limit(5),
          // 5. Khách hàng mới nhất
          supabase
            .from("customers")
            .select("full_name, created_at")
            .gte("created_at", `${todayStr}T00:00:00`)
            .lte("created_at", `${todayStr}T23:59:59`)
            .order("created_at", { ascending: false })
            .limit(5),
          // 6. Hóa đơn mới nhất
          supabase
            .from("invoices")
            .select("id, total_amount, created_at")
            .gte("created_at", `${todayStr}T00:00:00`)
            .lte("created_at", `${todayStr}T23:59:59`)
            .in("status", ["PAID", "PARTIALLY_PAID"])
            .order("created_at", { ascending: false })
            .limit(5),
          // 7. Hóa đơn DRAFT/PARTIALLY_PAID
          supabase
            .from("invoices")
            .select("id, status")
            .in("status", ["DRAFT", "PARTIALLY_PAID"])
            .limit(5),
        ]);

        // Parse kết quả
        const [
          { count: customersCount },
          invoicesData,
          staffOnDutyData,
          checkinsData,
          newCustomersData,
          paidInvoicesData,
          draftInvoicesData,
        ] = adminResults;

        // Tính toán admin stats
        const revenue = invoicesData.data?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
        const invoiceCount = invoicesData.data?.length || 0;
        const staffOnDuty = staffOnDutyData.data?.length || 0;

        setAdminStats({
          customersToday: customersCount || 0,
          invoicesToday: invoiceCount,
          revenueToday: revenue,
          staffOnDuty: staffOnDuty,
        });

        // Xây dựng activities
        const activities: any[] = [];
        if (checkinsData.data) {
          checkinsData.data.forEach((item: any) => {
            activities.push({
              id: `att-${item.staff_id}`,
              type: "checkin",
              label: `${item.staff?.full_name || "Nhân viên"} đã check-in`,
              time: item.check_in,
              icon: "🟢",
            });
          });
        }
        if (newCustomersData.data) {
          newCustomersData.data.forEach((c: any) => {
            activities.push({
              id: `cust-${c.id}`,
              type: "new_customer",
              label: `Khách hàng mới: ${c.full_name}`,
              time: c.created_at,
              icon: "👤",
            });
          });
        }
        if (paidInvoicesData.data) {
          paidInvoicesData.data.forEach((inv: any) => {
            activities.push({
              id: `inv-${inv.id}`,
              type: "invoice_paid",
              label: `Hóa đơn ${inv.id.slice(0, 6)} - ${formatVND(inv.total_amount)}`,
              time: inv.created_at,
              icon: "💳",
            });
          });
        }
        activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setActivities(activities.slice(0, 10));

        // Xây dựng action items
        const items: any[] = [];
        // Sử dụng staffData đã lấy để tính toán staff chưa check-in
        const checkedInIds = new Set(staffOnDutyData.data?.map((c: any) => c.staff_id) || []);
        const notCheckedIn = staffData.data?.filter((s: any) => !checkedInIds.has(s.id)) || [];
        if (notCheckedIn.length > 0) {
          items.push({
            id: "att-missing",
            label: `${notCheckedIn.length} nhân viên chưa check-in hôm nay`,
            link: "staff",
            severity: "warning",
          });
        }
        if (draftInvoicesData.data && draftInvoicesData.data.length > 0) {
          items.push({
            id: "inv-pending",
            label: `${draftInvoicesData.data.length} hóa đơn chưa hoàn tất`,
            link: "invoices",
            severity: "info",
          });
        }
        setActionItems(items);
      }

      // === Phần dữ liệu không cần thiết cho initial render (appointments, tasks) sẽ được tải sau ===
      // Nhưng vẫn gọi để có dữ liệu hiển thị sau khi UI đã sẵn sàng.
      // Chúng ta sẽ tách thành một hàm riêng và gọi sau setLoading(false)
      // Tuy nhiên, để đơn giản và vẫn đảm bảo có dữ liệu, chúng ta vẫn gọi nhưng không chặn render.

      // Bắt đầu tải appointments và tasks (không await để không chặn)
      const loadAppointmentsAndTasks = async () => {
        try {
          if (isAdmin) {
            const [apps, tasks] = await Promise.all([
              appointmentService.getAppointments(undefined, todayStr),
              taskService.getTasks(),
            ]);
            setTodayAppointments(apps);
            setTodayTasks(tasks.filter((t) => t.status !== "COMPLETED"));
          } else {
            const [apps, tasks] = await Promise.all([
              appointmentService.getAppointments(staffId, todayStr),
              taskService.getTasks(staffId),
            ]);
            setTodayAppointments(apps);
            setTodayTasks(tasks.filter((t) => t.status !== "COMPLETED"));
          }
        } catch (err) {
          console.error("Lỗi tải appointments/tasks:", err);
        }
      };

      // Gọi loadAppointmentsAndTasks nhưng không chặn
      loadAppointmentsAndTasks();

    } catch (err) {
      console.error("Lỗi tải dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // HANDLERS – ATTENDANCE
  // ==========================================================
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

  // ==========================================================
  // HANDLERS – APPOINTMENT & TASK (gửi notification cho tất cả staff nếu chưa phân công)
  // ==========================================================
  const handleCreateAppointment = async (data: any) => {
    const customerId = data.customer_id && data.customer_id.trim() !== "" ? data.customer_id : null;
    const staffId = data.staff_id && data.staff_id.trim() !== "" ? data.staff_id : null;

    const payload = {
      customer_id: customerId,
      staff_id: staffId,
      appointment_date: data.appointment_date,
      start_time: data.start_time,
      end_time: data.end_time,
      note: data.note || "",
      status: "SCHEDULED",
      created_by: currentStaff?.id,
      organization_id: DEFAULT_ORG_ID,
      branch_id: DEFAULT_BRANCH_ID,
    };
    const result = await appointmentService.createAppointment(payload);

    // Xác định danh sách staff nhận notification
    let targetStaffIds: string[] = [];
    if (staffId) {
      targetStaffIds = [staffId];
    } else {
      // Lấy tất cả staff active trong chi nhánh
      const { data: allStaff } = await supabase
        .from('staff')
        .select('id')
        .eq('status', 'ACTIVE')
        .eq('organization_id', DEFAULT_ORG_ID)
        .eq('branch_id', DEFAULT_BRANCH_ID);
      targetStaffIds = allStaff?.map(s => s.id) || [];
    }

    if (targetStaffIds.length > 0) {
      const customer = customerList.find(c => c.id === customerId);
      const customerName = customer?.full_name || "Khách";
      for (const sid of targetStaffIds) {
        await notificationService.createNotification({
          staff_id: sid,
          type: "APPOINTMENT",
          title: "📅 Lịch hẹn mới",
          message: `Bạn có lịch với khách ${customerName} lúc ${data.start_time}`,
          reference_type: "appointment",
          reference_id: result.id,
        });
        await pushService.sendPushNotification(
          sid,
          "📅 Lịch hẹn mới",
          `Bạn có lịch với khách ${customerName} lúc ${data.start_time}`,
          { type: "appointment", id: result.id }
        );
      }
    }

    await loadData();
  };

  const handleCreateTask = async (data: any) => {
    const assignedTo = data.assigned_to && data.assigned_to.trim() !== "" ? data.assigned_to : null;

    const payload = {
      title: data.title,
      description: data.description || "",
      assigned_to: assignedTo,
      due_date: data.due_date,
      due_time: data.due_time || null,
      priority: data.priority || "NORMAL",
      status: "TODO",
      created_by: currentStaff?.id,
    };
    const result = await taskService.createTask(payload);

    // Xác định danh sách staff nhận notification
    let targetStaffIds: string[] = [];
    if (assignedTo) {
      targetStaffIds = [assignedTo];
    } else {
      // Lấy tất cả staff active
      const { data: allStaff } = await supabase
        .from('staff')
        .select('id')
        .eq('status', 'ACTIVE')
        .eq('organization_id', DEFAULT_ORG_ID)
        .eq('branch_id', DEFAULT_BRANCH_ID);
      targetStaffIds = allStaff?.map(s => s.id) || [];
    }

    if (targetStaffIds.length > 0) {
      for (const sid of targetStaffIds) {
        await notificationService.createNotification({
          staff_id: sid,
          type: "TASK",
          title: "📋 Công việc mới",
          message: `Bạn được giao việc: ${data.title}`,
          reference_type: "task",
          reference_id: result.id,
        });
        await pushService.sendPushNotification(
          sid,
          "📋 Công việc mới",
          `Bạn được giao việc: ${data.title}`,
          { type: "task", id: result.id }
        );
      }
    }

    await loadData();
  };

  const handleTaskToggle = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "COMPLETED" ? "TODO" : "COMPLETED";
    try {
      await taskService.updateTask(taskId, { status: newStatus });
      await loadData();
    } catch (err) {
      alert("Lỗi cập nhật trạng thái");
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================
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

    const daysInMonth = monthlyAttendance.filter((a) => a.check_in !== null).length;
    const leaveDays = monthlyAttendance.filter((a) => a.check_in === null).length;
    const lateDays = monthlyAttendance.filter((a) => a.status === "LATE").length;
    const earlyLeave = monthlyAttendance.filter((a) => a.status === "EARLY_LEAVE").length;

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
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-800">Xin chào, {staffName} 👋</h1>
            <span className="text-sm text-slate-500">{format(now, "EEEE, dd/MM/yyyy", { locale: vi })}</span>
          </div>

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

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Lịch hôm nay
            </h2>
            {todayAppointments.length === 0 ? (
              <div className="text-center text-slate-400 text-sm py-2">Hôm nay chưa có lịch hẹn</div>
            ) : (
              <div className="space-y-2">
                {todayAppointments.map((app) => (
                  <div key={app.id} className="flex items-start gap-3 p-2 border-b border-slate-100 last:border-0">
                    <span className="text-xs font-semibold text-emerald-600">{app.start_time?.slice(0, 5)}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-800">{app.customer?.full_name || "Khách"}</div>
                      <div className="text-xs text-slate-500">{app.service_name || app.service?.name || "Dịch vụ"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" /> Công việc cần làm
            </h2>
            {todayTasks.length === 0 ? (
              <div className="text-center text-slate-400 text-sm py-2">Không có công việc nào</div>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={task.status === "COMPLETED"}
                        onChange={() => handleTaskToggle(task.id, task.status)}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600"
                      />
                      <span className={`text-sm ${task.status === "COMPLETED" ? "line-through text-slate-400" : "text-slate-700"}`}>
                        {task.title}
                      </span>
                    </div>
                    {task.priority === "URGENT" && (
                      <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded">Khẩn cấp</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

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

          <div className="grid grid-cols-3 gap-3 mt-2">
            <button
              onClick={() => onNavigate?.("pos")}
              className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
            >
              <ShoppingCart className="w-6 h-6 text-pink-600" />
              <span className="text-xs font-medium mt-1">POS</span>
            </button>
            <button
              onClick={() => onNavigate?.("customers")}
              className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
            >
              <Users className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-medium mt-1">Khách hàng</span>
            </button>
            <button
              onClick={() => onNavigate?.("extension")}
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
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Xin chào, {adminName} 👋</h1>
          <span className="text-sm text-slate-500">{format(now, "EEEE, dd/MM/yyyy", { locale: vi })}</span>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Chi nhánh chính</span>
          </div>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
            {branches.length === 0 && (
              <option value="">Chi nhánh chính</option>
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowAppointmentModal(true)}
            className="flex items-center justify-center gap-2 p-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/30 active:scale-95 transition-all"
          >
            <Calendar className="w-5 h-5" /> Tạo lịch hẹn
          </button>
          <button
            onClick={() => setShowTaskModal(true)}
            className="flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30 active:scale-95 transition-all"
          >
            <ClipboardCheck className="w-5 h-5" /> Giao việc
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => onNavigate?.("customers")}
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
            onClick={() => onNavigate?.("invoices")}
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
            onClick={() => onNavigate?.("reports")}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span className="text-xs text-slate-400">Hôm nay</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-700">{formatVND(adminStats.revenueToday)}</div>
            <div className="text-xs text-slate-500">Doanh thu → Xem báo cáo</div>
          </div>
          <div
            onClick={() => onNavigate?.("staff")}
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

        {actionItems.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" /> Việc cần xử lý
            </h2>
            <div className="space-y-2">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigate?.(item.link)}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all"
                >
                  <span className="text-sm text-slate-700">{item.label}</span>
                  <span className="text-xs text-indigo-600 font-medium">Xem →</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Lịch hôm nay
          </h2>
          {todayAppointments.length === 0 ? (
            <div className="text-center text-slate-400 text-sm py-2">Hôm nay chưa có lịch hẹn</div>
          ) : (
            <div className="space-y-2">
              {todayAppointments.map((app) => (
                <div key={app.id} className="flex items-start gap-3 p-2 border-b border-slate-100 last:border-0">
                  <span className="text-xs font-semibold text-emerald-600">{app.start_time?.slice(0, 5)}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-800">{app.customer?.full_name || "Khách"}</div>
                    <div className="text-xs text-slate-500">
                      {app.service_name || app.service?.name || "Dịch vụ"} - {app.staff?.full_name || "Chưa phân công"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" /> Công việc hôm nay
          </h2>
          {todayTasks.length === 0 ? (
            <div className="text-center text-slate-400 text-sm py-2">Không có công việc nào</div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 border-b border-slate-100 last:border-0">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-800">{task.title}</div>
                    <div className="text-xs text-slate-500">
                      {task.assigned?.full_name || "Chưa phân công"} - {task.priority === "URGENT" ? "🔴 Khẩn cấp" : task.priority === "IMPORTANT" ? "🟠 Quan trọng" : "🟢 Bình thường"}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    task.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                    task.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                    task.status === "OVERDUE" ? "bg-red-100 text-red-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {task.status === "COMPLETED" ? "✅ Hoàn thành" :
                     task.status === "IN_PROGRESS" ? "🔄 Đang làm" :
                     task.status === "OVERDUE" ? "⏰ Quá hạn" : "📋 Chưa làm"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

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
      </div>

      {/* Modals */}
      <AppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        onSave={handleCreateAppointment}
        staffList={staffList}
        customerList={customerList}
      />
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={handleCreateTask}
        staffList={staffList}
      />
    </div>
  );
};

export default DashboardPage;