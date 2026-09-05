// src/pages/staff.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  fetchStaff,
  createStaff,
  updateStaff,
  updateStaffStatus,
  archiveStaff,
} from "../services/staff.service";
import { StaffMemberDomain } from "../types/domain";
import { attendanceService } from "../services/attendance.service";
import { payrollService } from "../services/payroll.service";
import { Button, Card, Badge, Spinner, Input } from "../components/primitives";
import { StaffDetailPage } from "./StaffDetailPage";
import { PayrollPage } from "./PayrollPage";
import { SalarySettingsPage } from "./SalarySettingsPage";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";
import { supabase } from "@/services/supabase";
import { Pencil, Trash2, Key, Plus, RefreshCw, Search, CheckCircle, XCircle, User, Settings } from "lucide-react";

// ============================================================
// AVATAR
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
      className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm ${className}`}
    >
      {initials || "NV"}
    </div>
  );
};

// ============================================================
// STAFF LIST – UI ĐƠN GIẢN
// ============================================================
const StaffList: React.FC<{
  staffList: StaffMemberDomain[];
  loading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  onEdit: (staff: StaffMemberDomain) => void;
  onToggleStatus: (id: string, status: "ACTIVE" | "INACTIVE") => void;
  onArchive: (id: string, name: string) => void;
  onResetPin: (staffId: string) => void;
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
  isAdmin,
  onSelectStaff,
}) => {
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
          {staffList.map((staff) => {
            const isActive = staff.status === "ACTIVE" && !staff.archived_at;
            const isInactive = staff.status === "INACTIVE" || staff.archived_at;
            return (
              <div
                key={staff.id}
                className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                  isActive
                    ? "bg-emerald-50/70 border-emerald-200 hover:border-emerald-300"
                    : "bg-slate-50/60 border-slate-200 hover:border-slate-300 opacity-80"
                }`}
                onClick={() => onSelectStaff(staff.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={staff.full_name} />
                    <div>
                      <h3 className="font-semibold text-slate-900 text-base leading-tight">
                        {staff.full_name}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{staff.role}</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-0.5 shrink-0">
                      {/* SỬA */}
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(staff); }}
                        className="p-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Sửa"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {/* LƯU TRỮ */}
                      <button
                        onClick={(e) => { e.stopPropagation(); onArchive(staff.id, staff.full_name); }}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors"
                        title="Lưu trữ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {/* RESET PIN */}
                      <button
                        onClick={(e) => { e.stopPropagation(); onResetPin(staff.id); }}
                        className="p-1.5 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Reset PIN"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================================
// ATTENDANCE CHECK – DANH SÁCH TẤT CẢ NHÂN VIÊN
// ============================================================
const AttendanceAll: React.FC<{
  staffList: StaffMemberDomain[];
  isAdmin: boolean;
  onRefresh: () => void;
}> = ({ staffList, isAdmin, onRefresh }) => {
  const [attendanceMap, setAttendanceMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyWorking, setShowOnlyWorking] = useState(false);

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("work_date", today)
        .in("staff_id", staffList.map(s => s.id));

      if (error) throw error;
      const map: Record<string, any> = {};
      data?.forEach((a: any) => {
        map[a.staff_id] = a;
      });
      setAttendanceMap(map);
    } catch (err) {
      console.error("Lỗi tải chấm công:", err);
    } finally {
      setLoading(false);
    }
  }, [staffList]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const handleCheckIn = async (staffId: string) => {
    setSubmitting(prev => ({ ...prev, [staffId]: true }));
    setMessage(null);
    try {
      const result = await attendanceService.checkIn(staffId);
      setAttendanceMap(prev => ({ ...prev, [staffId]: result }));
      setMessage({ type: "success", text: `Check-in thành công` });
      onRefresh();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi check-in" });
    } finally {
      setSubmitting(prev => ({ ...prev, [staffId]: false }));
    }
  };

  const handleCheckOut = async (staffId: string) => {
    setSubmitting(prev => ({ ...prev, [staffId]: true }));
    setMessage(null);
    try {
      const result = await attendanceService.checkOut(staffId);
      setAttendanceMap(prev => ({ ...prev, [staffId]: result }));
      setMessage({ type: "success", text: `Check-out thành công` });
      onRefresh();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi check-out" });
    } finally {
      setSubmitting(prev => ({ ...prev, [staffId]: false }));
    }
  };

  const removeAccents = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  const filteredStaff = useMemo(() => {
    let list = staffList;
    if (searchQuery.trim()) {
      const keyword = removeAccents(searchQuery.trim().toLowerCase());
      list = list.filter(s => removeAccents(s.full_name.toLowerCase()).includes(keyword));
    }
    if (showOnlyWorking) {
      list = list.filter(s => {
        const att = attendanceMap[s.id];
        return att && att.check_in !== null && att.check_out === null;
      });
    }
    return list;
  }, [staffList, searchQuery, showOnlyWorking, attendanceMap]);

  if (loading) return <Spinner className="py-8" />;

  return (
    <div className="space-y-4">
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

      <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm nhân viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 whitespace-nowrap">
          <input
            type="checkbox"
            checked={showOnlyWorking}
            onChange={(e) => setShowOnlyWorking(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Chỉ hiện đang làm
        </label>
      </div>

      {filteredStaff.length === 0 ? (
        <div className="text-center py-8 text-slate-400">Không có nhân viên nào</div>
      ) : (
        <div className="space-y-2">
          {filteredStaff.map((staff) => {
            const att = attendanceMap[staff.id];
            const isCheckedIn = att?.check_in !== null && att?.check_in !== undefined;
            const isCheckedOut = att?.check_out !== null && att?.check_out !== undefined;
            const isWorking = isCheckedIn && !isCheckedOut;

            let statusColor = "bg-slate-50 border-slate-200";
            if (isWorking) statusColor = "bg-emerald-50 border-emerald-200";
            else if (!isCheckedIn) statusColor = "bg-rose-50/50 border-rose-200";

            return (
              <div
                key={staff.id}
                className={`p-3 rounded-xl border ${statusColor} flex items-center justify-between gap-2`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar name={staff.full_name} className="w-8 h-8 text-xs" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800 text-sm truncate">{staff.full_name}</div>
                    <div className="text-xs text-slate-500">{staff.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isWorking && (
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Đang làm</span>
                  )}
                  {!isCheckedIn && (
                    <span className="text-xs font-medium text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">Vắng</span>
                  )}
                  {isCheckedOut && (
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Đã về</span>
                  )}
                  {!isCheckedIn && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleCheckIn(staff.id)}
                      isLoading={submitting[staff.id]}
                      className="text-xs px-3 py-1.5 rounded-lg"
                    >
                      Check-in
                    </Button>
                  )}
                  {isCheckedIn && !isCheckedOut && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleCheckOut(staff.id)}
                      isLoading={submitting[staff.id]}
                      className="text-xs px-3 py-1.5 rounded-lg"
                    >
                      Check-out
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================================
// PAYROLL – TÍCH HỢP PAYROLL PAGE
// ============================================================
const PayrollTab: React.FC<{
  staffId?: string;
  isAdmin: boolean;
}> = ({ staffId, isAdmin }) => {
  // Sử dụng component PayrollPage đã có
  return <PayrollPage onViewDetail={(staffId, month, year) => {}} />;
};

// ============================================================
// MAIN STAFF PAGE
// ============================================================
export const StaffPage: React.FC<{ userRole?: string }> = ({ userRole = "staff" }) => {
  const { isAdmin } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<"list" | "attendance" | "payroll" | "settings">("list");

  // Staff List state
  const [staffList, setStaffList] = useState<StaffMemberDomain[]>([]);
  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMemberDomain | null>(null);
  const [formData, setFormData] = useState<any>({
    full_name: "",
    role: "Kỹ thuật viên",
    phone: "",
    base_salary: 0,
    status: "ACTIVE",
    started_on: new Date().toISOString().split("T")[0],
    pin: "",
    confirm_pin: "",
  });

  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [selectedDetailStaffId, setSelectedDetailStaffId] = useState<string | null>(null);
  const roles = ["Admin", "Cửa hàng trưởng", "Kỹ thuật viên", "Trưởng ca"];

  // ---- LOAD DATA ----
  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchStaff("", includeInactive, includeInactive);
      setStaffList(data);
      if (data.length > 0 && !selectedStaffId) {
        setSelectedStaffId(data[0].id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi khi kết nối tới hệ thống");
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---- Client-side search ----
  const filteredStaff = useMemo(() => {
    if (!search.trim()) return staffList;
    const q = search.trim().toLowerCase();
    const removeAccents = (str: string) => {
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
    };
    const keyword = removeAccents(q);
    return staffList.filter((staff) => {
      const name = removeAccents(staff.full_name.toLowerCase());
      const phone = staff.phone || "";
      const role = removeAccents(staff.role.toLowerCase());
      return name.includes(keyword) || phone.includes(keyword) || role.includes(keyword);
    });
  }, [staffList, search]);

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
      {/* HEADER – KHÔNG STICKY */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Quản lý Nhân viên</h1>
            <p className="text-xs text-slate-400 font-medium">
              {isAdmin ? "Quyền Quản lý" : "Quyền Nhân viên"}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-4">
        {/* Segmented Control Tab Navigation */}
        <nav className="flex p-1 bg-slate-200/70 backdrop-blur-sm rounded-2xl overflow-x-auto scrollbar-none shadow-inner">
          {availableTabs.map((key) => {
            const labels: Record<string, string> = {
              list: "Danh sách",
              attendance: "Chấm công",
              payroll: "Bảng lương",
              settings: "Cài đặt",
            };
            const icons: Record<string, React.ElementType> = {
              list: User,
              attendance: CheckCircle,
              payroll: Key,
              settings: Settings,
            };
            const Icon = icons[key] || User;
            const isActive = activeSubTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveSubTab(key as any)}
                className={`flex-1 min-w-[70px] py-2 px-3 text-xs font-bold rounded-xl transition-all flex flex-col items-center gap-0.5 ${
                  isActive
                    ? "bg-white text-blue-600 shadow-xs scale-[1.02]"
                    : "text-slate-600 hover:text-slate-900 active:opacity-70"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                <span>{labels[key]}</span>
              </button>
            );
          })}
        </nav>

        {/* Content Section */}
        <div className="bg-white rounded-3xl border border-slate-200/70 p-4 sm:p-6 shadow-2xs">
          {activeSubTab === "list" && (
            <div className="space-y-4">
              {/* Thanh tìm kiếm + nút thêm mới */}
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm nhân viên..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {isAdmin && (
                  <>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={includeInactive}
                        onChange={(e) => setIncludeInactive(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      Hiện tạm ngưng
                    </label>
                    <button
                      onClick={() => handleOpenModal()}
                      className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center"
                      title="Thêm nhân viên"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              <StaffList
                staffList={filteredStaff}
                loading={loading}
                errorMessage={errorMessage}
                successMessage={successMessage}
                onEdit={handleOpenModal}
                onToggleStatus={handleToggleStatus}
                onArchive={handleArchive}
                onResetPin={handleResetPin}
                isAdmin={isAdmin}
                onSelectStaff={handleSelectStaff}
              />
            </div>
          )}

          {activeSubTab === "attendance" && (
            <AttendanceAll
              staffList={staffList}
              isAdmin={isAdmin}
              onRefresh={loadData}
            />
          )}

          {activeSubTab === "payroll" && (
            <PayrollTab staffId={selectedStaffId} isAdmin={isAdmin} />
          )}

          {activeSubTab === "settings" && <SalarySettingsPage />}
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