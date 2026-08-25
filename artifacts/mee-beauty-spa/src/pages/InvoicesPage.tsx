// src/pages/InvoicesPage.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Eye, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge, Spinner } from '@/components/primitives';

export const InvoicesPage: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          customers:customer_id (full_name, phone),
          seller: seller_staff_id (full_name),
          items: invoice_items (*)
        `)
        .order('created_at', { ascending: false });

      if (!isAdmin) {
        // Nếu staff, chỉ xem hóa đơn của mình (tạm thời lấy staff đầu tiên)
        const { data: staffData } = await supabase.from('staff').select('id').limit(1).single();
        if (staffData) {
          query = query.eq('seller_staff_id', staffData.id);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      setInvoices(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (val: number) => new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  const formatDate = (date: string) => format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi });

  if (loading) return <Spinner className="py-12" />;

  const filtered = invoices.filter(inv =>
    inv.customers?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    inv.invoice_code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Lịch sử hóa đơn</h1>
        <button onClick={loadInvoices} className="text-sm text-blue-600 hover:underline">
          🔄 Làm mới
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm theo tên khách hàng hoặc mã hóa đơn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-slate-500">Không có hóa đơn nào</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(inv => (
            <div
              key={inv.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedInvoice(inv)}
            >
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                  <div className="font-semibold text-slate-900">
                    {inv.customers?.full_name || 'Khách vãng lai'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatDate(inv.created_at)} · Mã: {inv.invoice_code || inv.id.slice(0, 8)}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Nhân viên: {inv.seller?.full_name || 'N/A'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-700">{formatVND(inv.total_amount)}</div>
                  <Badge variant={
                    inv.status === 'PAID' ? 'success' :
                    inv.status === 'PARTIALLY_PAID' ? 'warning' :
                    inv.status === 'DRAFT' ? 'neutral' :
                    'danger'
                  }>
                    {inv.status === 'PAID' ? 'Đã thanh toán' :
                     inv.status === 'PARTIALLY_PAID' ? 'Nợ một phần' :
                     inv.status === 'DRAFT' ? 'Nháp' :
                     inv.status === 'VOID' ? 'Hủy' : inv.status}
                  </Badge>
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Nhấn để xem chi tiết
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal chi tiết hóa đơn */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                Hóa đơn {selectedInvoice.invoice_code || selectedInvoice.id.slice(0, 8)}
              </h3>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Khách hàng:</span>
                <span className="font-medium">{selectedInvoice.customers?.full_name || 'Khách vãng lai'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ngày:</span>
                <span>{formatDate(selectedInvoice.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trạng thái:</span>
                <Badge variant={selectedInvoice.status === 'PAID' ? 'success' : 'neutral'}>
                  {selectedInvoice.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phương thức:</span>
                <span>{selectedInvoice.payment_method}</span>
              </div>
            </div>

            <div className="border-t pt-3">
              <h4 className="font-semibold text-slate-800 mb-2">Chi tiết</h4>
              <div className="space-y-2">
                {selectedInvoice.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm bg-slate-50 p-2 rounded-lg">
                    <span>{item.description || 'Dịch vụ'}</span>
                    <span>{item.quantity} x {formatVND(item.unit_price)}</span>
                    <span className="font-bold">{formatVND(item.total_amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-3 space-y-1 text-right">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tạm tính:</span>
                <span>{formatVND(selectedInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-red-600">
                <span>Giảm giá:</span>
                <span>-{formatVND(selectedInvoice.discount_amount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-emerald-700">
                <span>Tổng cộng:</span>
                <span>{formatVND(selectedInvoice.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};