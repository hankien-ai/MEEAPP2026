// src/pages/TasksPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { taskService } from '@/services/task.service';
import { supabase } from '@/services/supabase';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ClipboardCheck, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { Button, Card, Spinner, Badge } from '@/components/primitives';

export const TasksPage: React.FC = () => {
  const { isAdmin, currentStaff } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    due_time: '17:00',
    priority: 'NORMAL',
    status: 'TODO',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const staffId = isAdmin ? undefined : currentStaff?.id;
      const data = await taskService.getTasks(staffId);
      setTasks(data);

      const { data: staff } = await supabase
        .from('staff')
        .select('id, full_name')
        .eq('status', 'ACTIVE');
      setStaffList(staff || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (task?: any) => {
    if (task) {
      setEditingId(task.id);
      setForm({
        title: task.title,
        description: task.description || '',
        assigned_to: task.assigned_to,
        due_date: task.due_date,
        due_time: task.due_time || '17:00',
        priority: task.priority,
        status: task.status,
      });
    } else {
      setEditingId(null);
      setForm({
        title: '',
        description: '',
        assigned_to: '',
        due_date: format(new Date(), 'yyyy-MM-dd'),
        due_time: '17:00',
        priority: 'NORMAL',
        status: 'TODO',
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
    if (!form.title.trim() || !form.assigned_to) {
      alert('Vui lòng nhập tiêu đề và chọn nhân viên');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        assigned_to: form.assigned_to,
        due_date: form.due_date,
        due_time: form.due_time,
        priority: form.priority,
        status: form.status,
        created_by: currentStaff?.id,
      };
      if (editingId) {
        await taskService.updateTask(editingId, payload);
      } else {
        await taskService.createTask(payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu công việc');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa công việc này?')) return;
    try {
      await taskService.deleteTask(id);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const priorityColors: Record<string, string> = {
    NORMAL: 'bg-slate-100 text-slate-600',
    IMPORTANT: 'bg-amber-100 text-amber-700',
    URGENT: 'bg-red-100 text-red-700',
  };

  const priorityLabels: Record<string, string> = {
    NORMAL: 'Bình thường',
    IMPORTANT: 'Quan trọng',
    URGENT: 'Khẩn cấp',
  };

  const statusColors: Record<string, string> = {
    TODO: 'bg-slate-100 text-slate-600',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    OVERDUE: 'bg-red-100 text-red-700',
  };

  const statusLabels: Record<string, string> = {
    TODO: 'Chưa làm',
    IN_PROGRESS: 'Đang làm',
    COMPLETED: 'Hoàn thành',
    OVERDUE: 'Quá hạn',
  };

  if (loading) return <Spinner className="py-8" />;

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">📋 Quản lý công việc</h1>
        {isAdmin && (
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-1">
            <Plus className="w-4 h-4" /> Giao việc
          </Button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8 text-slate-400">Chưa có công việc nào</div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id} className="p-4">
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800">{task.title}</span>
                    <Badge variant="neutral" className={priorityColors[task.priority]}>
                      {priorityLabels[task.priority]}
                    </Badge>
                    <Badge variant="neutral" className={statusColors[task.status]}>
                      {statusLabels[task.status]}
                    </Badge>
                  </div>
                  {task.description && (
                    <div className="text-sm text-slate-600 mt-1">{task.description}</div>
                  )}
                  <div className="text-xs text-slate-400 mt-0.5">
                    NV: {task.assigned?.full_name || 'Chưa phân công'} • Hạn: {format(new Date(task.due_date), 'dd/MM/yyyy', { locale: vi })}
                    {task.due_time && ` lúc ${task.due_time.slice(0, 5)}`}
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleOpenModal(task)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(task.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
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
              <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Sửa công việc' : 'Giao việc mới'}</h2>
              <button onClick={handleCloseModal} className="p-1 hover:bg-slate-100 rounded">
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
                <label className="block text-sm font-medium text-slate-700">Giao cho *</label>
                <select
                  required
                  value={form.assigned_to}
                  onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">-- Chọn --</option>
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
              <div>
                <label className="block text-sm font-medium text-slate-700">Trạng thái</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="TODO">Chưa làm</option>
                  <option value="IN_PROGRESS">Đang làm</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="OVERDUE">Quá hạn</option>
                </select>
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

export default TasksPage;