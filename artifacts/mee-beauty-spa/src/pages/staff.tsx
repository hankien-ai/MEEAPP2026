// src/pages/staff.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  fetchStaff,
  createStaff,
  updateStaff,
  updateStaffStatus,
  archiveStaff,
} from "../services/staff.service";
import { StaffMemberDomain, CreateStaffInput } from "../types/domain";
import { attendanceService } from "../services/attendance.service";
import { payrollService } from "../services/payroll.service";
import { Button, Card, Badge, Spinner, Input } from "../components/primitives";
import { StaffDetailPage } from "./StaffDetailPage";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";

// ============================================================
// HELPER COMPONENTS & ICONS
// ============================================================

const Avatar: React.FC<{ name: string; className?: string }> = ({ name, className = "" }) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(-2)
    .toUpperCase();

  return (
    <div
      className={`w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm ${className}`}
    >
      {initials || "NV"}
    </div>
  );
};

// ============================================================
// PROPS
// ============================================================

interface StaffPageProps {
  userRole?: string; // 'owner' hoặc 'staff' - giữ để tương thích nhưng sẽ dùng useAuth
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

// ---- Staff List ----
const StaffList: React.FC<{
  staffList: StaffMemberDomain[];
  loading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  onEdit: (staff: StaffMemberDomain) => void;
  onToggleStatus: (id: string, status: "ACTIVE" | "INACTIVE") => void;
  onArchive: (id: string, name: string) => void;
  onResetPin: (staffId: string) => void; // 👈 MỚI
  onRefresh: () => void;
  isAdmin: boolean;
  onSelectStaff: (staffId: string) => void;
}> = ({
  staffList,
  loading,
  errorMessage,
  successMessage,
  onEdit,
  onToggleStatus,
  onArchive,
  onResetPin,
  onRefresh,
  isAdmin,
  onSelectStaff,
}) => {
  const formatVND = (val: number) => new Intl.NumberFormat("vi-VN").format(val) + " đ";

  return (
    <div className="space-y-3">
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl flex items-center gap-2">
          <span>⚠️</span> {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-2xl flex items-center gap-2">
          <span>✅</span> {successMessage}
        </div>
      )}

      {loading ? (
        <div className="py-12 flex justify-center">
          <Spinner />
        </div>
      ) : staffList.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-sm font-medium">Không tìm thấy nhân viên nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {staffList.map((staff) => (
            <div
              key={staff.id}
              className="p-4 rounded-2xl border border-slate-100 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
              onClick={() => onSelectStaff(staff.id)}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={staff.full_name} />
                    <div>
                      <h3 className="font-semibold text-slate-900 text-base leading-tight">
                        {staff.full_name}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{staff.role}</p>
                    </div>
                  </div>
                  <Badge
                    variant={staff.status === "ACTIVE" ? "success" : "warning"}
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  >
                    {staff.status === "ACTIVE" ? "Hoạt động" : "Tạm ngưng"}
                  </Badge>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Số điện thoại:</span>
                    <a href={`tel:${staff.phone}`} className="font-medium text-blue-600 active:opacity-75">
                      {staff.phone}
                    </a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Lương cơ bản:</span>
                    <span className="font-semibold text-slate-800">
                      {staff.base_salary ? formatVND(staff.base_salary) : "Chưa thiết lập"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Ngày bắt đầu:</span>
                    <span className="font-medium text-slate-700">{staff.started_on || "N/A"}</span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); onEdit(staff); }}
                    className="w-full text-xs rounded-xl h-9 font-medium"
                  >
                    ✏️ Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant={staff.status === "ACTIVE" ? "outline" : "secondary"}
                    onClick={(e) => { e.stopPropagation(); onToggleStatus(staff.id, staff.status); }}
                    className="w-full text-xs rounded-xl h-9 font-medium"
                  >
                    {staff.status === "ACTIVE" ? "⏸ Tạm ngưng" : "▶️ Bật"}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={(e) => { e.stopPropagation(); onArchive(staff.id, staff.full_name); }}
                    className="w-full text-xs rounded-xl h-9 font-medium"
                  >
                    🗑 Lưu trữ
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); onResetPin(staff.id); }}
                    className="w-full text-xs rounded-xl h-9 font-medium text-amber-600 border-amber-300 hover:bg-amber-50"
                  >
                    🔑 Reset PIN
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---- Attendance Check ----
const AttendanceCheck: React.FC<{
  staffId: string;
  staffName: string;
  isAdmin: boolean;
  onRefresh: () => void;
}> = ({ staffId, staffName, isAdmin, onRefresh }) => {
  const [today, setToday] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadToday = useCallback(async () => {
    if (!staffId) return;
    setLoading(true);
    try {
      const data = await attendanceService.getTodayAttendance(staffId);
      setToday(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  const handleCheckIn = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      const result = await attendanceService.checkIn(staffId);
      setToday(result);
      setMessage({ type: "success", text: "Check-in thành công!" });
      onRefresh();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi check-in" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      const result = await attendanceService.checkOut(staffId);
      setToday(result);
      setMessage({ type: "success", text: "Check-out thành công!" });
      onRefresh();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi check-out" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearAttendance = async () => {
    if (!window.confirm(`Bạn có chắc muốn xoá chấm công hôm nay của ${staffName}?`)) return;
    setSubmitting(true);
    setMessage(null);
    try {
      if (today && typeof (attendanceService as any).deleteAttendance === "function") {
        await (attendanceService as any).deleteAttendance(today.id);
      } else if (today && typeof (attendanceService as any).deleteTodayAttendance === "function") {
        await (attendanceService as any).deleteTodayAttendance(staffId);
      }
      setToday(null);
      setMessage({ type: "success", text: "Đã xoá chấm công hôm nay." });
      onRefresh();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi xoá chấm công" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner className="py-8" />;

  const isCheckedIn = today?.check_in !== null && today?.check_in !== undefined;
  const isCheckedOut = today?.check_out !== null && today?.check_out !== undefined;

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {message && (
        <div
          className={`p-3.5 rounded-2xl text-sm font-medium flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{message.type === "success" ? "✅" : "⚠️"}</span> {message.text}
        </div>
      )}

      <Card className="p-5 rounded-3xl border border-slate-100 bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Hôm nay</p>
            <h3 className="text-base font-bold text-slate-800">{staffName}</h3>
          </div>
          <Badge
            variant={isCheckedOut ? "success" : isCheckedIn ? "warning" : "neutral"}
            className="px-3 py-1 text-xs rounded-full font-semibold"
          >
            {isCheckedOut ? "Hoàn tất" : isCheckedIn ? "Đang trong ca" : "Chưa chấm công"}
          </Badge>
        </div>

        {(isCheckedIn || isCheckedOut) && (
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl text-xs">
            <div className="text-center p-2 bg-white rounded-xl shadow-2xs">
              <span className="text-slate-400 block mb-0.5">Vào ca</span>
              <span className="font-bold text-slate-800 text-sm">
                {isCheckedIn ? new Date(today.check_in).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "--:--"}
              </span>
            </div>
            <div className="text-center p-2 bg-white rounded-xl shadow-2xs">
              <span className="text-slate-400 block mb-0.5">Ra ca</span>
              <span className="font-bold text-slate-800 text-sm">
                {isCheckedOut ? new Date(today.check_out).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "--:--"}
              </span>
            </div>
          </div>
        )}

        <div className="pt-2">
          {!isCheckedIn && (
            <Button
              variant="primary"
              onClick={handleCheckIn}
              disabled={submitting}
              className="w-full h-12 rounded-2xl text-base font-bold shadow-md shadow-blue-500/20 active:scale-[0.98] transition-transform"
            >
              🟢 Check-in Vào Ca
            </Button>
          )}

          {isCheckedIn && !isCheckedOut && (
            <Button
              variant="secondary"
              onClick={handleCheckOut}
              disabled={submitting}
              className="w-full h-12 rounded-2xl text-base font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 active:scale-[0.98] transition-transform"
            >
              🔴 Check-out Ra Ca
            </Button>
          )}

          {isCheckedOut && (
            <div className="p-4 text-center rounded-2xl bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-100">
              🎉 Bạn đã hoàn tất ca làm việc hôm nay!
            </div>
          )}
        </div>

        {isAdmin && (isCheckedIn || isCheckedOut) && (
          <div className="pt-3 border-t border-slate-100 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAttendance}
              disabled={submitting}
              className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200 rounded-xl"
            >
              🗑 Xoá chấm công hôm nay
            </Button>
          </div>
        )}
      </Card>

      <div className="text-center">
        <button
          onClick={loadToday}
          className="text-xs font-semibold text-blue-600 hover:underline py-2 px-3 rounded-full hover:bg-blue-50 active:bg-blue-100 transition-colors inline-flex items-center gap-1"
        >
          🔄 Làm mới dữ liệu
        </button>
      </div>
    </div>
  );
};

// ---- Payroll List ----
const PayrollList: React.FC<{
  staffId?: string;
  isAdmin: boolean;
}> = ({ staffId, isAdmin }) => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [payrollList, setPayrollList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(staffId || null);

  useEffect(() => {
    setSelectedStaff(staffId || null);
  }, [staffId]);

  useEffect(() => {
    loadPayroll();
  }, [month, year, selectedStaff]);

  const loadPayroll = async () => {
    setLoading(true);
    setError(null);
    try {
      if (selectedStaff) {
        const data = await payrollService.getPayroll(selectedStaff, month, year);
        setPayrollList(data ? [data] : []);
      } else {
        const data = await payrollService.getPayrollList(month, year);
        setPayrollList(data);
      }
    } catch (err: any) {
      setError(err.message || "Lỗi tải bảng lương");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateAll = async () => {
    setCalculating(true);
    setError(null);
    try {
      if (selectedStaff) {
        await payrollService.calculateMonthlySalary(selectedStaff, month, year);
        await loadPayroll();
      } else {
        const staffs = await fetchStaff("", true);
        if (staffs && staffs.length > 0) {
          for (const staff of staffs) {
            await payrollService.calculateMonthlySalary(staff.id, month, year);
          }
          await loadPayroll();
        }
      }
    } catch (err: any) {
      setError(err.message || "Lỗi tính lương");
    } finally {
      setCalculating(false);
    }
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else setMonth(month - 1);
  };
  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else setMonth(month + 1);
  };

  const formatVND = (val: number) => new Intl.NumberFormat("vi-VN").format(val) + " đ";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-700 font-bold active:scale-95 transition-transform"
          >
            ‹
          </button>
          <span className="text-sm font-bold text-slate-800 px-1">
            Tháng {month}/{year}
          </span>
          <button
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-700 font-bold active:scale-95 transition-transform"
          >
            ›
          </button>
        </div>

        {isAdmin && (
          <Button
            size="sm"
            onClick={handleCalculateAll}
            isLoading={calculating}
            className="rounded-xl text-xs font-semibold px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            🧮 Tính lương
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-2xl border border-rose-200">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center">
          <Spinner />
        </div>
      ) : payrollList.length === 0 ? (
        <div className="text-center py-10 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-sm">
          Chưa có dữ liệu bảng lương cho tháng này.
        </div>
      ) : (
        <div className="space-y-3">
          {payrollList.map((p) => (
            <Card
              key={p.id}
              className="p-4 rounded-2xl border border-slate-100 bg-white shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-base">
                    {p.staff?.full_name || p.staff_id}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Lương cơ bản: <span className="font-medium text-slate-700">{formatVND(p.base_salary)}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Đi làm: <span className="font-semibold text-slate-800">{p.actual_working_days}/{p.total_working_days}</span> ngày · Nghỉ: <span className="font-semibold text-amber-600">{p.leave_days_taken}</span> ngày
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-400 mb-0.5">Thực nhận</div>
                  <div className="font-black text-emerald-600 text-base">{formatVND(p.net_salary)}</div>
                  <Badge
                    variant={p.status === "LOCKED" ? "success" : "neutral"}
                    className="mt-1 text-[10px] rounded-full px-2 py-0.5"
                  >
                    {p.status === "LOCKED" ? "Đã khóa" : "Tạm tính"}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ---- Salary Settings ----
const SalarySettings: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [allowedLeaveDays, setAllowedLeaveDays] = useState(2);
  const [attendanceEnabled, setAttendanceEnabled] = useState(true);

  useEffect(() => {
    if (isAdmin) loadSettings();
  }, [isAdmin]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await payrollService.getSettings();
      setSettings(data);
      setAllowedLeaveDays(data.default_allowed_leave_days || 2);
      setAttendanceEnabled(data.attendance_enabled !== false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await payrollService.updateSettings(settings.organization_id, settings.branch_id, {
        default_allowed_leave_days: allowedLeaveDays,
        attendance_enabled: attendanceEnabled,
      });
      setMessage({ type: "success", text: "Đã lưu cài đặt thành công!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi lưu cài đặt" });
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12 text-slate-400 font-medium text-sm">
        🔒 Bạn không có quyền truy cập cài đặt lương.
      </div>
    );
  }

  if (loading) return <Spinner className="py-8" />;

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {message && (
        <div
          className={`p-3.5 rounded-2xl text-sm font-medium flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{message.type === "success" ? "✅" : "⚠️"}</span> {message.text}
        </div>
      )}

      <Card className="p-5 rounded-3xl border border-slate-100 bg-white shadow-xs space-y-5">
        <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
          ⚙️ Cấu hình Lương & Chấm công
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
            Số ngày nghỉ phép có lương (mỗi tháng)
          </label>
          <Input
            type="number"
            value={allowedLeaveDays}
            onChange={(e) => setAllowedLeaveDays(Number(e.target.value))}
            min={0}
            className="w-full rounded-2xl border-slate-200 focus:border-blue-500 h-11"
          />
          <p className="text-xs text-slate-400 mt-1.5">Số ngày nghỉ phép mặc định mỗi tháng không bị trừ lương.</p>
        </div>

        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <span className="text-sm font-semibold text-slate-800 block">Kích hoạt chấm công</span>
            <span className="text-xs text-slate-400 block">Cho phép nhân viên tự check-in/out hằng ngày</span>
          </div>
          <input
            type="checkbox"
            checked={attendanceEnabled}
            onChange={(e) => setAttendanceEnabled(e.target.checked)}
            className="w-6 h-6 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
          />
        </div>

        <Button
          variant="primary"
          onClick={handleSave}
          isLoading={saving}
          className="w-full h-11 rounded-2xl font-bold shadow-md shadow-blue-500/20 active:scale-[0.98] transition-transform"
        >
          Lưu cài đặt
        </Button>
      </Card>
    </div>
  );
};

// ============================================================
// MAIN STAFF PAGE
// ============================================================

export const StaffPage: React.FC<StaffPageProps> = ({ userRole = "staff" }) => {
  const { isAdmin } = useAuth(); // 👈 Lấy từ context auth thật
  const [activeSubTab, setActiveSubTab] = useState<"list" | "attendance" | "payroll" | "settings">("list");

  // Staff List state
  const [staffList, setStaffList] = useState<StaffMemberDomain[]>([]);
  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State (Add/Edit Staff)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMemberDomain | null>(null);
  const [formData, setFormData] = useState<any>({
    full_name: "",
    role: "Kỹ thuật viên",
    phone: "",
    base_salary: 0,
    status: "ACTIVE",
    started_on: new Date().toISOString().split("T")[0],
    pin: "",          // 👈 THÊM
    confirm_pin: "",  // 👈 THÊM
  });

  // For attendance/payroll selection
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");

  // For detail view
  const [selectedDetailStaffId, setSelectedDetailStaffId] = useState<string | null>(null);

  // Predefined roles
  const roles = ["Admin", "Cửa hàng trưởng", "Kỹ thuật viên", "Trưởng ca"];

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchStaff(search, includeInactive);
      setStaffList(data);
      if (data.length > 0 && !selectedStaffId) {
        setSelectedStaffId(data[0].id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi khi kết nối tới hệ thống");
    } finally {
      setLoading(false);
    }
  }, [search, includeInactive]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---- Staff CRUD handlers ----
  const handleOpenModal = (staff?: StaffMemberDomain) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        full_name: staff.full_name,
        role: staff.role,
        phone: staff.phone,
        base_salary: staff.base_salary || 0,
        status: staff.status,
        started_on: staff.started_on ? staff.started_on.split("T")[0] : "",
        pin: "",
        confirm_pin: "",
      });
    } else {
      setEditingStaff(null);
      setFormData({
        full_name: "",
        role: "Kỹ thuật viên",
        phone: "",
        base_salary: 0,
        status: "ACTIVE",
        started_on: new Date().toISOString().split("T")[0],
        pin: "",
        confirm_pin: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // 👇 Validate PIN (chỉ khi tạo mới, không cần khi edit)
    if (!editingStaff) {
      if (formData.pin.length !== 6 || !/^\d{6}$/.test(formData.pin)) {
        setErrorMessage("Mã PIN phải gồm 6 chữ số");
        return;
      }
      if (formData.pin !== formData.confirm_pin) {
        setErrorMessage("Mã PIN và xác nhận không khớp");
        return;
      }
    }

    try {
      const payload = {
        full_name: formData.full_name,
        role: formData.role,
        phone: formData.phone,
        base_salary: Number(formData.base_salary) || 0,
        status: formData.status,
        started_on: formData.started_on,
      };

      let staffId: string;
      if (editingStaff) {
        await updateStaff(editingStaff.id, payload);
        staffId = editingStaff.id;
        setSuccessMessage("Cập nhật nhân viên thành công!");
      } else {
        const newStaff = await createStaff(payload);
        staffId = newStaff.id;
        // 👇 Set PIN cho staff mới
        await authService.setStaffPin(staffId, formData.pin);
        setSuccessMessage("Thêm mới nhân viên thành công!");
      }

      handleCloseModal();
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: "ACTIVE" | "INACTIVE") => {
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateStaffStatus(id, nextStatus);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleArchive = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn lưu trữ nhân viên "${name}"?`)) return;
    try {
      await archiveStaff(id);
      setSuccessMessage(`Đã lưu trữ nhân viên ${name}`);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // 👇 Reset PIN handler
  const handleResetPin = async (staffId: string) => {
    const newPin = window.prompt("Nhập mã PIN mới (6 chữ số):");
    if (!newPin) return;
    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      alert("PIN phải gồm 6 chữ số");
      return;
    }
    const confirmPin = window.prompt("Xác nhận mã PIN mới:");
    if (newPin !== confirmPin) {
      alert("Mã PIN không khớp");
      return;
    }
    try {
      await authService.setStaffPin(staffId, newPin);
      setSuccessMessage("Reset PIN thành công!");
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi reset PIN");
    }
  };

  const handleSelectStaff = (staffId: string) => {
    setSelectedDetailStaffId(staffId);
  };

  const handleBackFromDetail = () => {
    setSelectedDetailStaffId(null);
    loadData();
  };

  useEffect(() => {
    if (staffList.length > 0 && !selectedStaffId) {
      setSelectedStaffId(staffList[0].id);
    }
  }, [staffList]);

  // Admin-only tabs vs Staff tabs
  const adminTabs = ["list", "attendance", "payroll", "settings"];
  const staffTabs = ["list", "attendance"];

  const availableTabs = isAdmin ? adminTabs : staffTabs;

  useEffect(() => {
    if (!availableTabs.includes(activeSubTab)) {
      setActiveSubTab(availableTabs[0] as any);
    }
  }, [isAdmin]);

  // If detail view is active, render StaffDetailPage
  if (selectedDetailStaffId) {
    return <StaffDetailPage staffId={selectedDetailStaffId} onBack={handleBackFromDetail} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-12">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Quản lý Nhân viên</h1>
            <p className="text-xs text-slate-400 font-medium">
              {isAdmin ? "Quyền Quản lý" : "Quyền Nhân viên"}
            </p>
          </div>
          {activeSubTab === "list" && isAdmin && (
            <Button
              onClick={() => handleOpenModal()}
              className="rounded-2xl text-xs font-bold px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-95 transition-transform"
            >
              + Thêm mới
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-4">
        {/* Segmented Control Tab Navigation */}
        <nav className="flex p-1 bg-slate-200/70 backdrop-blur-sm rounded-2xl overflow-x-auto scrollbar-none shadow-inner">
          {availableTabs.map((key) => {
            const labels: Record<string, string> = {
              list: "📋 Danh sách",
              attendance: "⏰ Chấm công",
              payroll: "💰 Bảng lương",
              settings: "⚙️ Cài đặt",
            };
            const isActive = activeSubTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveSubTab(key as any)}
                className={`flex-1 min-w-[90px] py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap text-center ${
                  isActive
                    ? "bg-white text-blue-600 shadow-xs scale-[1.02]"
                    : "text-slate-600 hover:text-slate-900 active:opacity-70"
                }`}
              >
                {labels[key]}
              </button>
            );
          })}
        </nav>

        {/* Content Section */}
        <div className="bg-white rounded-3xl border border-slate-200/70 p-4 sm:p-6 shadow-2xs">
          {activeSubTab === "list" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm">🔍</span>
                  <input
                    type="text"
                    placeholder="Tìm theo tên, SĐT, vị trí..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 px-1">
                  {isAdmin && (
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeInactive}
                        onChange={(e) => setIncludeInactive(e.target.checked)}
                        className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 accent-blue-600"
                      />
                      <span>Hiện tạm ngưng</span>
                    </label>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={loadData}
                    className="rounded-xl text-xs font-semibold h-8 px-2.5 border-slate-200 hover:bg-slate-100"
                  >
                    🔄
                  </Button>
                </div>
              </div>

              <StaffList
                staffList={staffList}
                loading={loading}
                errorMessage={errorMessage}
                successMessage={successMessage}
                onEdit={handleOpenModal}
                onToggleStatus={handleToggleStatus}
                onArchive={handleArchive}
                onResetPin={handleResetPin}
                onRefresh={loadData}
                isAdmin={isAdmin}
                onSelectStaff={handleSelectStaff}
              />
            </div>
          )}

          {activeSubTab === "attendance" && (
            <div className="space-y-4">
              {isAdmin ? (
                <div className="max-w-lg mx-auto bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                    Chọn nhân viên chấm công
                  </label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="text-center py-1 text-xs font-medium text-slate-400">
                  Thông tin chấm công cá nhân
                </div>
              )}

              {selectedStaffId && (
                <AttendanceCheck
                  staffId={selectedStaffId}
                  staffName={staffList.find((s) => s.id === selectedStaffId)?.full_name || "Nhân viên"}
                  isAdmin={isAdmin}
                  onRefresh={loadData}
                />
              )}
            </div>
          )}

          {activeSubTab === "payroll" && (
            <div className="space-y-4">
              {isAdmin ? (
                <div className="max-w-lg mx-auto bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                    Lọc theo nhân viên
                  </label>
                  <select
                    value={selectedStaffId || ""}
                    onChange={(e) => setSelectedStaffId(e.target.value || "")}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">-- Tất cả nhân viên --</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="text-center py-1 text-xs font-medium text-slate-400">
                  Bảng lương cá nhân của bạn
                </div>
              )}

              <PayrollList
                staffId={isAdmin ? selectedStaffId : staffList[0]?.id || undefined}
                isAdmin={isAdmin}
              />
            </div>
          )}

          {activeSubTab === "settings" && <SalarySettings isAdmin={isAdmin} />}
        </div>
      </main>

      {/* Modal Add/Edit Staff */}
      {isAdmin && isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity animate-in fade-in">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 border border-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingStaff ? "✏️ Cập nhật thông tin" : "➕ Thêm nhân viên mới"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Chức danh</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0901234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Lương cơ bản (VNĐ)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.base_salary}
                  onChange={(e) => setFormData({ ...formData, base_salary: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={formData.started_on}
                    onChange={(e) => setFormData({ ...formData, started_on: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as "ACTIVE" | "INACTIVE" })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Tạm ngưng</option>
                  </select>
                </div>
              </div>

              {/* 👇 Thêm trường PIN (chỉ khi tạo mới) */}
              {!editingStaff && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Mã PIN (6 chữ số) *
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={formData.pin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pin: e.target.value.replace(/\D/g, "").slice(0, 6),
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="••••••"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Xác nhận mã PIN *
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={formData.confirm_pin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirm_pin: e.target.value.replace(/\D/g, "").slice(0, 6),
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="••••••"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl text-xs hover:bg-slate-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-2xl text-xs shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all"
                >
                  {editingStaff ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;