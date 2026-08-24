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

// ============================================================
// PROPS
// ============================================================

interface StaffPageProps {
  userRole?: string; // 'owner' hoặc 'staff'
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
  onRefresh: () => void;
  isAdmin: boolean;
}> = ({
  staffList,
  loading,
  errorMessage,
  successMessage,
  onEdit,
  onToggleStatus,
  onArchive,
  onRefresh,
  isAdmin,
}) => {
  const formatVND = (val: number) => new Intl.NumberFormat("vi-VN").format(val) + " đ";

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{errorMessage}</div>
      )}
      {successMessage && (
        <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg">{successMessage}</div>
      )}

      {loading ? (
        <Spinner className="py-8" />
      ) : staffList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Không tìm thấy nhân viên.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {staffList.map((staff) => (
            <Card key={staff.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-lg">{staff.full_name}</div>
                  <div className="text-sm text-gray-500">{staff.role}</div>
                  <div className="text-sm text-gray-500">{staff.phone}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Lương: {staff.base_salary ? formatVND(staff.base_salary) : "Chưa thiết lập"}
                  </div>
                  <div className="text-xs text-gray-400">Bắt đầu: {staff.started_on || "N/A"}</div>
                </div>
                <Badge variant={staff.status === "ACTIVE" ? "success" : "warning"}>
                  {staff.status}
                </Badge>
              </div>
              {isAdmin && (
                <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(staff)}>
                    ✏️ Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant={staff.status === "ACTIVE" ? "outline" : "secondary"}
                    onClick={() => onToggleStatus(staff.id, staff.status)}
                  >
                    {staff.status === "ACTIVE" ? "Tạm ngưng" : "Kích hoạt"}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => onArchive(staff.id, staff.full_name)}>
                    🗑 Lưu trữ
                  </Button>
                </div>
              )}
            </Card>
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
      setMessage({ type: "success", text: "✅ Check-in thành công!" });
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
      setMessage({ type: "success", text: "✅ Check-out thành công!" });
      onRefresh();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi check-out" });
    } finally {
      setSubmitting(false);
    }
  };

  // Admin: xoá check-in/out hôm nay (bỏ)
  const handleClearAttendance = async () => {
    if (!window.confirm(`Bạn có chắc muốn xoá chấm công hôm nay của ${staffName}?`)) return;
    setSubmitting(true);
    setMessage(null);
    try {
      // Xoá bản ghi attendance hôm nay
      if (today) {
        await supabase.from("attendance").delete().eq("id", today.id);
        setToday(null);
        setMessage({ type: "success", text: "✅ Đã xoá chấm công hôm nay." });
        onRefresh();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi xoá chấm công" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner className="py-4" />;

  const isCheckedIn = today?.check_in !== null && today?.check_in !== undefined;
  const isCheckedOut = today?.check_out !== null && today?.check_out !== undefined;

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <Card>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Hôm nay - {staffName}</span>
            <Badge variant={isCheckedOut ? "success" : isCheckedIn ? "warning" : "neutral"}>
              {isCheckedOut ? "Đã hoàn tất" : isCheckedIn ? "Đã check-in" : "Chưa check-in"}
            </Badge>
          </div>

          {isCheckedIn && (
            <div className="text-xs text-gray-500">
              Check-in: {new Date(today.check_in).toLocaleTimeString()}
            </div>
          )}
          {isCheckedOut && (
            <div className="text-xs text-gray-500">
              Check-out: {new Date(today.check_out).toLocaleTimeString()}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            {!isCheckedIn && (
              <Button variant="primary" onClick={handleCheckIn} disabled={submitting} className="py-3">
                🟢 Check-in
              </Button>
            )}
            {isCheckedIn && !isCheckedOut && (
              <Button variant="secondary" onClick={handleCheckOut} disabled={submitting} className="py-3">
                🔴 Check-out
              </Button>
            )}
            {isCheckedOut && (
              <div className="col-span-2 text-center text-sm text-gray-500">✅ Đã hoàn tất chấm công hôm nay</div>
            )}
          </div>

          {isAdmin && (isCheckedIn || isCheckedOut) && (
            <div className="pt-2 border-t text-center">
              <Button variant="outline" size="sm" onClick={handleClearAttendance} disabled={submitting}>
                🗑 Bỏ chấm công hôm nay
              </Button>
            </div>
          )}
        </div>
      </Card>

      <button onClick={loadToday} className="text-xs text-blue-600 hover:underline">
        🔄 Làm mới
      </button>
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
        const { data: staffs } = await supabase.from("staff").select("id");
        if (staffs) {
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
    if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(month - 1);
  };
  const handleNextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(month + 1);
  };

  const formatVND = (val: number) => new Intl.NumberFormat("vi-VN").format(val) + " đ";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="p-1 border rounded px-2">‹</button>
          <span className="text-sm font-semibold">Tháng {month}/{year}</span>
          <button onClick={handleNextMonth} className="p-1 border rounded px-2">›</button>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={handleCalculateAll} isLoading={calculating}>
            Tính lương
          </Button>
        )}
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

      {loading ? (
        <Spinner className="py-4" />
      ) : payrollList.length === 0 ? (
        <div className="text-center py-4 text-gray-500">Chưa có dữ liệu lương cho tháng này.</div>
      ) : (
        <div className="space-y-3">
          {payrollList.map((p) => (
            <Card key={p.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{p.staff?.full_name || p.staff_id}</div>
                  <div className="text-xs text-gray-500">
                    Lương cơ bản: {formatVND(p.base_salary)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Đi làm: {p.actual_working_days}/{p.total_working_days} ngày · Nghỉ: {p.leave_days_taken} ngày
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-700">{formatVND(p.net_salary)}</div>
                  <Badge variant={p.status === "LOCKED" ? "success" : "neutral"}>{p.status}</Badge>
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
    return <div className="text-center py-8 text-gray-500">Bạn không có quyền truy cập cài đặt lương.</div>;
  }

  if (loading) return <Spinner className="py-4" />;

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Số ngày nghỉ được phép (mỗi tháng)</label>
            <Input
              type="number"
              value={allowedLeaveDays}
              onChange={(e) => setAllowedLeaveDays(Number(e.target.value))}
              min={0}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Mặc định: 2 ngày</p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Bật chấm công</span>
            <input
              type="checkbox"
              checked={attendanceEnabled}
              onChange={(e) => setAttendanceEnabled(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>

          <Button variant="primary" onClick={handleSave} isLoading={saving} className="w-full">
            Lưu cài đặt
          </Button>
        </div>
      </Card>
    </div>
  );
};

// ============================================================
// MAIN STAFF PAGE
// ============================================================

export const StaffPage: React.FC<StaffPageProps> = ({ userRole = "staff" }) => {
  const isAdmin = userRole === "owner"; // admin

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
  });

  // For attendance/payroll selection
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");

  // Predefined roles
  const roles = ["Admin", "Cửa hàng trưởng", "Kỹ thuật viên", "Trưởng ca"];

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchStaff(search, includeInactive);
      setStaffList(data);
      if (data.length > 0 && !selectedStaffId) {
        // If staff, set to their own ID if not admin? For now just pick first
        setSelectedStaffId(data[0].id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi khi kết nối tới hệ thống Supabase");
    } finally {
      setLoading(false);
    }
  }, [search, includeInactive]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Staff CRUD handlers
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
    try {
      const payload = {
        full_name: formData.full_name,
        role: formData.role,
        phone: formData.phone,
        base_salary: Number(formData.base_salary) || 0,
        status: formData.status,
        started_on: formData.started_on,
      };
      if (editingStaff) {
        await updateStaff(editingStaff.id, payload);
        setSuccessMessage("Cập nhật nhân viên thành công!");
      } else {
        await createStaff(payload);
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

  // Update selected staff when list changes or staffId changes
  useEffect(() => {
    if (staffList.length > 0 && !selectedStaffId) {
      // If not admin, try to find logged-in staff (but we don't have auth, default first)
      setSelectedStaffId(staffList[0].id);
    }
  }, [staffList]);

  // Admin-only tabs
  const adminTabs = ["list", "attendance", "payroll", "settings"];
  const staffTabs = ["list", "attendance"]; // staff only sees list and attendance (their own)

  const availableTabs = isAdmin ? adminTabs : staffTabs;

  // If current tab not available, switch to first available
  useEffect(() => {
    if (!availableTabs.includes(activeSubTab)) {
      setActiveSubTab(availableTabs[0] as any);
    }
  }, [isAdmin]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold">Quản lý Nhân viên</h1>
          <p className="text-sm text-gray-500">
            {isAdmin ? "Quản lý toàn bộ nhân viên" : "Xem thông tin của bạn"}
          </p>
        </div>
        {activeSubTab === "list" && isAdmin && (
          <Button onClick={() => handleOpenModal()}>+ Thêm nhân viên</Button>
        )}
      </div>

      {/* Sub-tabs (Admin có 4 tab, Staff chỉ có 2) */}
      <div className="flex overflow-x-auto gap-1 bg-white rounded-xl border p-1 mb-4 shadow-sm">
        {availableTabs.map((key) => {
          const labels: Record<string, string> = {
            list: "📋 Danh sách",
            attendance: "⏰ Chấm công",
            payroll: "💰 Bảng lương",
            settings: "⚙️ Cài đặt",
          };
          return (
            <button
              key={key}
              onClick={() => setActiveSubTab(key as any)}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeSubTab === key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {labels[key]}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        {activeSubTab === "list" && (
          <>
            {/* Search & Filter */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <input
                type="text"
                placeholder="Tìm theo tên, SĐT, chức danh..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-[180px] px-3 py-2 border rounded text-sm"
              />
              {isAdmin && (
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeInactive}
                    onChange={(e) => setIncludeInactive(e.target.checked)}
                    className="rounded"
                  />
                  Hiển thị cả nhân viên tạm ngưng
                </label>
              )}
              <Button size="sm" variant="outline" onClick={loadData}>
                🔄 Làm mới
              </Button>
            </div>

            <StaffList
              staffList={staffList}
              loading={loading}
              errorMessage={errorMessage}
              successMessage={successMessage}
              onEdit={handleOpenModal}
              onToggleStatus={handleToggleStatus}
              onArchive={handleArchive}
              onRefresh={loadData}
              isAdmin={isAdmin}
            />
          </>
        )}

        {activeSubTab === "attendance" && (
          <div>
            {isAdmin ? (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Chọn nhân viên để chấm công</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full max-w-xs px-3 py-2 border rounded text-sm"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              // Staff only sees their own (tạm thời lấy nhân viên đầu tiên, sau này tích hợp auth)
              <div className="mb-4">
                <p className="text-sm text-gray-500">Chấm công của bạn</p>
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
          <div>
            {isAdmin ? (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Chọn nhân viên (bỏ trống để xem tất cả)</label>
                <select
                  value={selectedStaffId || ""}
                  onChange={(e) => setSelectedStaffId(e.target.value || "")}
                  className="w-full max-w-xs px-3 py-2 border rounded text-sm"
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
              <div className="mb-4">
                <p className="text-sm text-gray-500">Bảng lương của bạn</p>
              </div>
            )}
            <PayrollList staffId={isAdmin ? selectedStaffId : (staffList[0]?.id || undefined)} isAdmin={isAdmin} />
          </div>
        )}

        {activeSubTab === "settings" && <SalarySettings isAdmin={isAdmin} />}
      </div>

      {/* Modal Add/Edit Staff (only admin) */}
      {isAdmin && isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingStaff ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chức danh</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lương cơ bản (VNĐ)</label>
                <input
                  type="number"
                  value={formData.base_salary}
                  onChange={(e) => setFormData({ ...formData, base_salary: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={formData.started_on}
                  onChange={(e) => setFormData({ ...formData, started_on: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "ACTIVE" | "INACTIVE" })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">ACTIVE (Hoạt động)</option>
                  <option value="INACTIVE">INACTIVE (Tạm ngưng)</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
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