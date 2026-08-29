// src/pages/AppointmentsPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { appointmentService } from '@/services/appointment.service';
import { supabase } from '@/services/supabase';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { Button, Card, Spinner, Badge } from '@/components/primitives';

export const AppointmentsPage: React.FC = () => {
  const { isAdmin, currentStaff } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [serviceList, setServiceList] = useState<any[]>([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    customer_id: '',
    staff_id: '',
    service_id: '',
    service_name: '',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    end_time: '10:00',
    note: '',
    status: 'SCHEDULED',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const staffId = isAdmin ? undefined : currentStaff?.id;
      const data = await appointmentService.getAppointments(staffId);
      setAppointments(data);

      const [staff, customers, services] = await Promise.all([
        supabase.from('staff').select('id, full_name').eq('status', 'ACTIVE'),
        supabase.from('customers').select('id, full_name').limit(50),
        supabase.from('catalog_items').select('id, name').eq('item_type', 'SERVICE').eq('status', 'ACTIVE'),
      ]);
      setStaffList(staff.data || []);
      setCustomerList(customers.data || []);
      setServiceList(services.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (appointment?: any) => {
    if (appointment) {
      setEditingId(appointment.id);
      setForm({
        customer_id: appointment.customer_id,
        staff_id: appointment.staff_id,
        service_id: appointment.service_id || '',
        service_name: appointment.service_name || '',
        appointment_date: appointment.appointment_date,
        start_time: appointment.start_time.slice(0, 5),
        end_time: appointment.end_time.slice(0, 5),
        note: appointment.note || '',
        status: appointment.status,
      });
    } else {
      setEditingId(null);
      setForm({
        customer_id: '',
        staff_id: '',
        service_id: '',
        service_name: '',
        appointment_date: format(new Date(), 'yyyy-MM-dd'),
        start_time: '09:00',
        end_time: '10:00',
        note: '',
        status: 'SCHEDULED',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_id || !form.staff_id) {
      alert('Vui lòng chọn khách hàng và nhân viên');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        customer_id: form.customer_id,
        staff_id: form.staff_id,
        service_id: form.service_id || null,
        service_name: form.service_name || null,
        appointment_date: form.appointment_date,
        start_time: form.start_time,
        end_time: form.end_time,
        note: form.note,
        status: form.status,
        created_by: currentStaff?.id,
      };
      if (editingId) {
        await appointmentService.updateAppointment(editingId, payload);
      } else {
        await appointmentService.createAppointment(payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu lịch hẹn');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa lịch hẹn này?')) return;
    try {
      await appointmentService.deleteAppointment(id);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const statusColors: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-700',
    CONFIRMED: 'bg-emerald-100 text-emerald-700',
    COMPLETED: 'bg-slate-100 text-slate-600',
    CANCELLED: 'bg-red-100 text-red-700',
    NO_SHOW: 'bg-amber-100 text-amber-700',
  };

  const statusLabels: Record<string, string> = {
    SCHEDULED: 'Đã đặt',
    CONFIRMED: 'Xác nhận',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Hủy',
    NO_SHOW: 'Vắng mặt',
  };

  if (loading) return <Spinner className="py-8" />;

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">📅 Quản lý lịch hẹn</h1>
        {isAdmin && (
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-1">
            <Plus className="w-4 h-4" /> Tạo lịch
          </Button>
        )}
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-8 text-slate-400">Chưa có lịch hẹn nào</div>
      ) : (
        <div className="space-y-3">
          {appointments.map((app) => (
            <Card key={app.id} className="p-4">
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800">{app.customer?.full_name || 'Khách'}</span>
                    <Badge variant="neutral" className={statusColors[app.status]}>
                      {statusLabels[app.status] || app.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    <span className="font-medium">{app.start_time?.slice(0, 5)} - {app.end_time?.slice(0, 5)}</span>
                    <span className="mx-2">•</span>
                    {app.service_name || app.service?.name || 'Dịch vụ'}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    NV: {app.staff?.full_name || 'Chưa phân công'} • {format(new Date(app.appointment_date), 'dd/MM/yyyy', { locale: vi })}
                  </div>
                  {app.note && <div className="text-xs text-slate-500 mt-1">📝 {app.note}</div>}
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleOpenModal(app)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(app.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Sửa lịch hẹn' : 'Tạo lịch hẹn mới'}</h2>
              <button onClick={handleCloseModal} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Khách hàng *</label>
                <select
                  required
                  value={form.customer_id}
                  onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">-- Chọn --</option>
                  {customerList.map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Nhân viên *</label>
                <select
                  required
                  value={form.staff_id}
                  onChange={(e) => setForm({ ...form, staff_id: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">-- Chọn --</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Dịch vụ</label>
                <select
                  value={form.service_id}
                  onChange={(e) => {
                    const svc = serviceList.find(s => s.id === e.target.value);
                    setForm({ ...form, service_id: e.target.value, service_name: svc?.name || '' });
                  }}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">-- Không chọn --</option>
                  {serviceList.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Trạng thái</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="SCHEDULED">Đã đặt</option>
                  <option value="CONFIRMED">Xác nhận</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="CANCELLED">Hủy</option>
                  <option value="NO_SHOW">Vắng mặt</option>
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
                  <label className="block text-sm font-medium text-slate-700">Giờ bắt đầu</label>
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
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? 'Đang lưu...' : 'Lưu'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;