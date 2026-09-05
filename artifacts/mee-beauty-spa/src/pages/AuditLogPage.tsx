// src/pages/AuditLogPage.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Search, X } from 'lucide-react';
import { Badge, Spinner, Button } from '@/components/primitives';

export const AuditLogPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    entity_type: '',
    action: '',
    dateFrom: '',
    dateTo: '',
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isAdmin) loadLogs();
  }, [filter, search]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*, profiles:actor_profile_id(full_name)')
        .order('created_at', { ascending: false })
        .limit(200);

      if (filter.entity_type) {
        query = query.eq('entity_type', filter.entity_type);
      }
      if (filter.action) {
        query = query.eq('action', filter.action);
      }
      if (filter.dateFrom) {
        query = query.gte('created_at', filter.dateFrom);
      }
      if (filter.dateTo) {
        query = query.lte('created_at', filter.dateTo + 'T23:59:59');
      }
      if (search) {
        query = query.or(`entity_id.ilike.%${search}%,entity_type.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    return format(new Date(date), 'HH:mm dd/MM/yyyy', { locale: vi });
  };

  const getActionBadge = (action: string) => {
    const map: Record<string, string> = {
      INSERT: 'bg-emerald-100 text-emerald-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
    };
    return map[action] || 'bg-gray-100 text-gray-800';
  };

  if (!isAdmin) {
    return (
      <div className="p-6 text-center text-slate-500">
        Bạn không có quyền xem log.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Lịch sử thay đổi</h1>
        <Button variant="outline" onClick={loadLogs} size="sm">
          🔄 Làm mới
        </Button>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600">Bảng</label>
          <select
            value={filter.entity_type}
            onChange={(e) => setFilter({ ...filter, entity_type: e.target.value })}
            className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="">Tất cả</option>
            <option value="customers">Khách hàng</option>
            <option value="staff">Nhân viên</option>
            <option value="catalog_items">Danh mục</option>
            <option value="services">Dịch vụ</option>
            <option value="products">Sản phẩm</option>
            <option value="packages">Gói</option>
            <option value="invoices">Hóa đơn</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Hành động</label>
          <select
            value={filter.action}
            onChange={(e) => setFilter({ ...filter, action: e.target.value })}
            className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="">Tất cả</option>
            <option value="INSERT">Thêm mới</option>
            <option value="UPDATE">Cập nhật</option>
            <option value="DELETE">Xóa</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Từ ngày</label>
          <input
            type="date"
            value={filter.dateFrom}
            onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
            className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Đến ngày</label>
          <input
            type="date"
            value={filter.dateTo}
            onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
            className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => setFilter({ entity_type: '', action: '', dateFrom: '', dateTo: '' })}
            className="w-full py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1"
          >
            <X className="w-4 h-4" /> Xóa lọc
          </button>
        </div>
      </div>

      {/* Tìm kiếm */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm theo ID hoặc tên bảng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <Spinner className="py-12" />
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-slate-400">Không có bản ghi nào</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 font-semibold">Thời gian</th>
                <th className="p-3 font-semibold">Bảng</th>
                <th className="p-3 font-semibold">Hành động</th>
                <th className="p-3 font-semibold">ID</th>
                <th className="p-3 font-semibold">Người thực hiện</th>
                <th className="p-3 font-semibold">Thay đổi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3 whitespace-nowrap">{formatDate(log.created_at)}</td>
                  <td className="p-3">
                    <Badge variant="neutral">{log.entity_type}</Badge>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${getActionBadge(log.action)}`}>
                      {log.action === 'INSERT' ? 'Thêm' : log.action === 'UPDATE' ? 'Sửa' : 'Xóa'}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{log.entity_id?.slice(0, 8)}</td>
                  <td className="p-3">{log.profiles?.full_name || 'Hệ thống'}</td>
                  <td className="p-3 max-w-xs truncate">
                    {log.action === 'INSERT' && log.new_values ? (
                      <span className="text-emerald-600">Tạo mới</span>
                    ) : log.action === 'DELETE' ? (
                      <span className="text-red-600">Xóa</span>
                    ) : log.old_values && log.new_values ? (
                      <span className="text-blue-600">Cập nhật</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogPage;