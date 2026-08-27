// src/pages/StaffDetailPage.tsx
import React, { useState, useEffect } from "react";
import {
  getStaffById,
  getStaffDetailStats,
  getStaffAttendanceCalendar,
  getStaffInvoices,
  getStaffCommissions,
  getStaffRecentActivity,
  updateStaff,
} from "../services/staff.service";
import { Button, Spinner, Badge } from "../components/primitives";
import { format, parseISO, differenceInHours, differenceInMinutes } from "date-fns";
import { vi } from "date-fns/locale";
import { ArrowLeft, Calendar, FileText, DollarSign, Settings, Clock } from "lucide-react";
import { supabase } from "../services/supabase";
import { useAuth } from '@/context/AuthContext';
import { maskPhone } from '@/lib/utils';

interface Props {
  staffId: string;
  onBack: () => void;
}

export const StaffDetailPage: React.FC<Props> = ({ staffId, onBack }) => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState<any>(null);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [selectedCommission, setSelectedCommission] = useState<any | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    role: "",
    phone: "",
    base_salary: 0,
    status: "",
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (staffId) {
      loadData();
    }
  }, [staffId, selectedMonth, selectedYear]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [staffData, statsData, calData, invData, commData, actData] = await Promise.all([
        getStaffById(staffId),
        getStaffDetailStats(staffId, selectedMonth, selectedYear),
        getStaffAttendanceCalendar(staffId, selectedMonth, selectedYear),
        getStaffInvoices(staffId, selectedMonth, selectedYear),
        getStaffCommissions(staffId, selectedMonth, selectedYear),
        getStaffRecentActivity(staffId),
      ]);
      setStaff(staffData);
      setStats(statsData);
      setCalendar(calData);
      setInvoices(invData);
      setCommissions(commData);
      setActivities(actData);
      setEditForm({
        full_name: staffData.full_name,
        role: staffData.role,
        phone: staffData.phone,
        base_salary: staffData.base_salary || 0,
        status: staffData.status,
      });
    } catch (err) {
      console.error("Lỗi tải dữ liệu nhân viên:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(selectedYear - 1); }
    else setSelectedMonth(selectedMonth - 1);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(selectedYear + 1); }
    else setSelectedMonth(selectedMonth + 1);
  };

  const handleUpdateStaff = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("staff")
        .update({
          full_name: editForm.full_name,
          role: editForm.role,
          phone: editForm.phone,
          base_salary: editForm.base_salary,
          status: editForm.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", staffId);
      if (error) throw error;
      setShowSettings(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Lỗi cập nhật thông tin");
    } finally {
      setUpdating(false);
    }
  };

  const formatVND = (amount: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = parseISO(dateStr);
    return format(d, "dd/MM/yyyy", { locale: vi });
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    const d = parseISO(dateStr);
    return format(d, "HH:mm", { locale: vi });
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "";
    const d = parseISO(dateStr);
    return format(d, "HH:mm dd/MM/yyyy", { locale: vi });
  };

  const getStatusToday = () => {
    const today = new Date().toISOString().split("T")[0];
    const todayAtt = calendar.find(c => c.date === today);
    if (!todayAtt) return { label: "Chưa chấm công", color: "text-amber-600", bg: "bg-amber-50" };
    if (todayAtt.check_in && !todayAtt.check_out) return { label: "🟢 Đang làm", color: "text-emerald-600", bg: "bg-emerald-50" };
    if (todayAtt.check_in && todayAtt.check_out) return { label: "✅ Đã về", color: "text-blue-600", bg: "bg-blue-50" };
    return { label: "⚪ Vắng", color: "text-slate-500", bg: "bg-slate-100" };
  };

  if (loading) {
    return <Spinner className="py-12" />;
  }

  if (!staff) {
    return (
      <div className="p-4 text-center">
        <p className="text-slate-500">Không tìm thấy nhân viên</p>
        <Button onClick={onBack} className="mt-4">Quay lại</Button>
      </div>
    );
  }

  const statusToday = getStatusToday();
  const isActive = staff.status === "ACTIVE";

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
            {staff.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{staff.full_name}</h2>
            <p className="text-sm text-slate-500">{staff.role}</p>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <Badge variant={isActive ? "success" : "neutral"}>{isActive ? "Hoạt động" : "Không hoạt động"}</Badge>
              <span className={`px-2 py-0.5 rounded-full ${statusToday.color} ${statusToday.bg}`}>
                {statusToday.label}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="w-4 h-4" /> Thiết lập
          </Button>
        </div>
      </div>

      {/* Settings Form */}
      {showSettings && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
          <h3 className="font-bold text-slate-900">Thiết lập nhân viên</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Họ tên</label>
              <input
                type="text"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Chức danh</label>
              <input
                type="text"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lương cơ bản</label>
              <input
                type="number"
                value={editForm.base_salary}
                onChange={(e) => setEditForm({ ...editForm, base_salary: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Không hoạt động</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowSettings(false)}>Hủy</Button>
            <Button onClick={handleUpdateStaff} isLoading={updating}>Lưu thay đổi</Button>
          </div>
        </div>
      )}

      {/* Month Selector */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 shadow-sm p-3">
        <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-lg">
          ‹
        </button>
        <span className="font-semibold text-slate-800">
          Tháng {selectedMonth}/{selectedYear}
        </span>
        <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-lg">
          ›
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedDate(null)}>
          <div className="text-2xl font-bold text-emerald-600">{stats?.total_working_days || 0}</div>
          <div className="text-xs text-slate-500">Ngày đi làm</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl font-bold text-rose-500">{stats?.total_leave_days || 0}</div>
          <div className="text-xs text-slate-500">Ngày nghỉ</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl font-bold text-blue-600">{stats?.total_invoices || 0}</div>
          <div className="text-xs text-slate-500">Hóa đơn</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl font-bold text-purple-600">{formatVND(stats?.total_commission || 0)}</div>
          <div className="text-xs text-slate-500">Hoa hồng</div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Lịch chấm công
        </h3>
        <div className="grid grid-cols-7 gap-1 text-xs">
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
            <div key={day} className="text-center font-semibold text-slate-400 py-1">{day}</div>
          ))}
          {calendar.map((day, idx) => {
            const isWorking = day.check_in !== null;
            const isLeave = day.status === "ABSENT" || day.status === "LEAVE";
            let bgColor = "bg-white hover:bg-slate-50";
            if (isWorking) bgColor = "bg-emerald-100 hover:bg-emerald-200";
            if (isLeave) bgColor = "bg-rose-100 hover:bg-rose-200";
            const dayNum = new Date(day.date).getDate();
            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(selectedDate === day.date ? null : day.date)}
                className={`p-2 rounded-lg text-center transition-colors ${bgColor} ${selectedDate === day.date ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="font-medium text-slate-700">{dayNum}</div>
                {isWorking && <div className="text-[8px] text-emerald-600">✓</div>}
                {isLeave && <div className="text-[8px] text-rose-600">✕</div>}
              </button>
            );
          })}
        </div>
        {selectedDate && (
          <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-semibold text-sm">{formatDate(selectedDate)}</div>
            {(() => {
              const day = calendar.find(c => c.date === selectedDate);
              if (!day) return <div className="text-xs text-slate-500">Không có dữ liệu</div>;
              if (day.check_in) {
                const hours = day.check_out ? differenceInHours(parseISO(day.check_out), parseISO(day.check_in)) : 0;
                const mins = day.check_out ? differenceInMinutes(parseISO(day.check_out), parseISO(day.check_in)) % 60 : 0;
                return (
                  <div className="text-xs space-y-1 mt-1">
                    <div>Check-in: {formatTime(day.check_in)}</div>
                    {day.check_out && <div>Check-out: {formatTime(day.check_out)}</div>}
                    {day.check_out && <div className="text-emerald-600 font-medium">Tổng: {hours}h{mins}m</div>}
                    {day.notes && <div className="text-slate-400">Ghi chú: {day.notes}</div>}
                  </div>
                );
              }
              if (day.status === "ABSENT") return <div className="text-xs text-rose-600">Nghỉ</div>;
              return <div className="text-xs text-slate-500">Chưa có dữ liệu</div>;
            })()}
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Hóa đơn ({invoices.length})
          </h3>
          {invoices.length > 0 && <span className="text-xs text-slate-400">Bấm để xem chi tiết</span>}
        </div>
        {invoices.length === 0 ? (
          <div className="text-center text-slate-400 py-4 text-sm">Chưa có hóa đơn trong tháng</div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {invoices.slice(0, 10).map((inv) => (
              <div
                key={inv.id}
                onClick={() => setSelectedInvoice(selectedInvoice?.id === inv.id ? null : inv)}
                className="py-2 px-1 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-sm text-slate-800">{inv.invoice_code}</div>
                  <div className="text-xs text-slate-500">{inv.customer_name} • {formatDateTime(inv.created_at)}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-700">{formatVND(inv.total_amount)}</div>
                  {inv.commission_amount > 0 && (
                    <div className="text-xs text-blue-600">HH: {formatVND(inv.commission_amount)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {selectedInvoice && (
          <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-sm mb-2">Chi tiết hóa đơn #{selectedInvoice.invoice_code}</h4>
            <div className="text-xs space-y-1">
              <div>Khách: {selectedInvoice.customer_name}</div>
              <div>Ngày: {formatDateTime(selectedInvoice.created_at)}</div>
              <div>Phương thức: {selectedInvoice.payment_method}</div>
              <div>Trạng thái: {selectedInvoice.status}</div>
              <div className="font-bold text-emerald-700">Tổng: {formatVND(selectedInvoice.total_amount)}</div>
              {selectedInvoice.commission_amount > 0 && (
                <div className="text-blue-600">Hoa hồng: {formatVND(selectedInvoice.commission_amount)}</div>
              )}
            </div>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => setSelectedInvoice(null)}>Đóng</Button>
          </div>
        )}
      </div>

      {/* Commissions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Hoa hồng ({commissions.length})
          </h3>
          <span className="text-xs font-bold text-emerald-600">
            Tổng: {formatVND(stats?.total_commission || 0)}
          </span>
        </div>
        {commissions.length === 0 ? (
          <div className="text-center text-slate-400 py-4 text-sm">Chưa có hoa hồng trong tháng</div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {commissions.map((comm) => (
              <div
                key={comm.id}
                onClick={() => setSelectedCommission(selectedCommission?.id === comm.id ? null : comm)}
                className="py-2 px-1 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-sm text-slate-800">
                    {comm.commission_type === "PERFORMANCE" ? "💆 KTV" : "💼 Sale"}
                  </div>
                  <div className="text-xs text-slate-500">{comm.description || comm.invoice_code}</div>
                  <div className="text-xs text-slate-400">{formatDateTime(comm.created_at)}</div>
                </div>
                <div className="font-bold text-emerald-700">+{formatVND(comm.amount)}</div>
              </div>
            ))}
          </div>
        )}
        {selectedCommission && (
          <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-sm mb-2">Chi tiết hoa hồng</h4>
            <div className="text-xs space-y-1">
              <div>Mã hóa đơn: {selectedCommission.invoice_code}</div>
              <div>Khách: {selectedCommission.customer_name}</div>
              <div>Loại: {selectedCommission.commission_type === "PERFORMANCE" ? "KTV" : "Sale"}</div>
              <div>Mô tả: {selectedCommission.description || "—"}</div>
              <div>Ngày: {formatDateTime(selectedCommission.created_at)}</div>
              <div className="font-bold text-emerald-700">Số tiền: {formatVND(selectedCommission.amount)}</div>
            </div>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => setSelectedCommission(null)}>Đóng</Button>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Hoạt động gần đây
        </h3>
        {activities.length === 0 ? (
          <div className="text-center text-slate-400 py-4 text-sm">Chưa có hoạt động</div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {activities.slice(0, 15).map((act, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs border-b border-slate-100 pb-2 last:border-0">
                <span className="text-lg">{act.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{act.title}</div>
                  <div className="text-slate-500">{act.description}</div>
                </div>
                <div className="text-slate-400 text-[10px]">{formatDateTime(act.time)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDetailPage;