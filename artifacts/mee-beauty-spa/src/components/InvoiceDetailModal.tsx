// src/components/InvoiceDetailModal.tsx
import React, { useState, useEffect } from 'react';
import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';
import { X, CreditCard, Gift, Package, User, Users, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Badge, Button } from '@/components/primitives';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { maskPhone } from '@/lib/utils';
import { processRefund } from '@/services/loyalty.service';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  invoiceId: string | null;
  onClose: () => void;
  onInvoiceVoided?: () => void; // 👈 Gọi lại để refresh danh sách
}

const formatVND = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return format(new Date(dateStr), 'dd/MM/yyyy HH:mm', { locale: vi });
};

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ 
  isOpen, 
  invoiceId, 
  onClose,
  onInvoiceVoided 
}) => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [entitlements, setEntitlements] = useState<any[]>([]);
  const [isVoiding, setIsVoiding] = useState(false);

  useEffect(() => {
    if (isOpen && invoiceId) {
      loadData();
    }
  }, [isOpen, invoiceId]);

  const loadData = async () => {
    if (!invoiceId) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Invoice + customer + seller
      const { data: inv, error: invErr } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customer_id (id, full_name, phone),
          seller:seller_staff_id (id, full_name)
        `)
        .eq('id', invoiceId)
        .single();

      if (invErr) throw invErr;

      // 👇 STAFF: kiểm tra ngày hôm nay
      if (!isAdmin && inv) {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        const invDate = new Date(inv.created_at);

        if (invDate < startOfToday || invDate > endOfToday) {
          setError('Bạn không có quyền xem hóa đơn này (chỉ xem được hóa đơn trong ngày hiện tại)');
          setLoading(false);
          return;
        }
      }

      setInvoice(inv);

      // 2. Invoice items
      const { data: itemsData, error: itemsErr } = await supabase
        .from('invoice_items')
        .select(`
          *,
          catalog_item:catalog_item_id (name, code),
          performing_staff:performing_staff_id (id, full_name),
          seller_staff:seller_staff_id (id, full_name)
        `)
        .eq('invoice_id', invoiceId);
      if (itemsErr) throw itemsErr;
      setItems(itemsData || []);

      // 3. Commissions (join qua invoice_items)
      const itemIds = (itemsData || []).map(i => i.id);
      if (itemIds.length > 0) {
        const { data: commData, error: commErr } = await supabase
          .from('staff_commissions')
          .select(`
            *,
            staff:staff_id (id, full_name),
            invoice_item:invoice_item_id (id, invoice_id)
          `)
          .in('invoice_item_id', itemIds);
        if (!commErr) setCommissions(commData || []);
      }

      // 4. Customer packages (gift or purchased)
      const { data: pkgData, error: pkgErr } = await supabase
        .from('customer_packages')
        .select(`
          *,
          package:package_id (id, name)
        `)
        .eq('invoice_id', invoiceId);
      if (!pkgErr) setPackages(pkgData || []);

      // 5. Service entitlements (gift service lẻ)
      const { data: entData, error: entErr } = await supabase
        .from('customer_service_entitlements')
        .select(`
          *,
          service:service_id (id, catalog_item_id, catalog_item:catalog_items (name, code))
        `)
        .eq('invoice_id', invoiceId);
      if (!entErr) setEntitlements(entData || []);
    } catch (err) {
      console.error('Lỗi tải chi tiết hóa đơn:', err);
      setError('Không thể tải chi tiết hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  // 👇 XỬ LÝ HỦY HÓA ĐƠN + REFUND LOYALTY
  const handleVoidInvoice = async () => {
    if (!invoice || invoice.status === 'VOID') return;

    if (!window.confirm('Bạn có chắc muốn hủy hóa đơn này? Hành động không thể hoàn tác.\nLoyalty đã tích từ hóa đơn sẽ được hoàn tác tự động.')) {
      return;
    }

    setIsVoiding(true);
    setError(null);
    try {
      // 1. Cập nhật status invoice thành VOID
      const { error: updateErr } = await supabase
        .from('invoices')
        .update({ 
          status: 'VOID', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', invoice.id);

      if (updateErr) throw updateErr;

      // 2. Gọi Loyalty Refund (hoàn tác điểm/buổi)
      await processRefund(invoice.id);

      // 3. Cập nhật invoice state
      setInvoice({ ...invoice, status: 'VOID' });

      // 4. Thông báo thành công
      alert('✅ Đã hủy hóa đơn và hoàn tác Loyalty thành công!');

      // 5. Gọi callback để refresh danh sách (nếu có)
      if (onInvoiceVoided) {
        onInvoiceVoided();
      }

      // 6. Đóng modal sau 1 giây
      setTimeout(() => {
        onClose();
      }, 500);

    } catch (err: any) {
      console.error('Lỗi hủy hóa đơn:', err);
      setError(err.message || 'Lỗi khi hủy hóa đơn, vui lòng thử lại.');
    } finally {
      setIsVoiding(false);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] p-6 flex items-center justify-center">
          <div className="text-center text-slate-500">Đang tải chi tiết hóa đơn...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] p-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="text-lg font-bold text-red-600">Lỗi</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="mt-4 text-slate-600">{error}</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Đóng
          </button>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] p-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="text-lg font-bold text-slate-900">Không tìm thấy hóa đơn</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isGift = invoice.is_gift || false;
  const statusColor = {
    PAID: 'bg-emerald-100 text-emerald-800',
    PARTIALLY_PAID: 'bg-amber-100 text-amber-800',
    DRAFT: 'bg-slate-100 text-slate-600',
    VOID: 'bg-rose-100 text-rose-800',
  }[invoice.status] || 'bg-slate-100 text-slate-600';

  const totalPaid = invoice.paid_amount || 0;
  const remainingDebt = invoice.total_amount - totalPaid;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 p-4 border-b border-slate-200 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">
                HÓA ĐƠN #{invoice.id.slice(0, 8).toUpperCase()}
              </h2>
              {isGift && (
                <Badge variant="success" className="bg-purple-100 text-purple-800 border-purple-200">
                  🎁 QUÀ TẶNG
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">{formatDate(invoice.created_at)}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="neutral" className={statusColor}>{invoice.status}</Badge>
              <span className="text-xs text-slate-400">
                Phương thức: {invoice.payment_method || '—'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* 👇 NÚT HỦY HÓA ĐƠN - CHỈ ADMIN */}
            {isAdmin && invoice.status !== 'VOID' && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleVoidInvoice}
                isLoading={isVoiding}
                className="text-xs font-semibold"
              >
                🗑 Hủy hóa đơn
              </Button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Khách hàng - 👇 PHONE MASK */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-3">
            <User className="w-4 h-4 text-slate-600" />
            <div>
              <div className="font-medium text-slate-800">
                {invoice.customer?.full_name || 'Khách vãng lai'}
              </div>
              <div className="text-xs text-slate-500">
                {maskPhone(invoice.customer?.phone, isAdmin)}
              </div>
            </div>
          </div>

          {/* Người bán & KTV */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-400">Người bán</div>
              <div className="font-medium text-slate-800">{invoice.seller?.full_name || '—'}</div>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-400">KTV thực hiện</div>
              <div className="font-medium text-slate-800">
                {items.find(i => i.performing_staff)?.performing_staff?.full_name || '—'}
              </div>
            </div>
          </div>

          {/* Chi tiết items */}
          <div className="border-t pt-3">
            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Chi tiết</h4>
            <div className="space-y-2">
              {items.length === 0 ? (
                <div className="text-sm text-slate-400">Không có dịch vụ nào</div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{item.description || item.catalog_item?.name || 'Dịch vụ'}</span>
                        {item.is_gift && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">🎁 GIFT</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.quantity} × {formatVND(item.unit_price)}
                        {item.discount_amount > 0 && (
                          <span className="text-red-500 ml-2">-{formatVND(item.discount_amount)}</span>
                        )}
                      </div>
                    </div>
                    <div className="font-bold text-slate-800 text-sm">
                      {item.is_gift ? '0đ' : formatVND(item.total_amount)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Thanh toán */}
          <div className="border-t pt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Tạm tính</span>
              <span>{formatVND(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Giảm giá</span>
              <span className="text-red-500">-{formatVND(invoice.discount_amount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t pt-2">
              <span className="text-slate-800">Tổng cộng</span>
              <span className={isGift ? 'text-purple-700' : 'text-emerald-700'}>
                {isGift ? '0đ' : formatVND(invoice.total_amount)}
              </span>
            </div>
            {invoice.payment_method === 'DEBT' && (
              <div className="flex justify-between text-xs bg-amber-50 p-2 rounded">
                <span className="text-amber-600">Đã trả</span>
                <span className="text-amber-800 font-semibold">{formatVND(totalPaid)}</span>
                <span className="text-amber-600">Còn nợ</span>
                <span className="text-amber-800 font-semibold">{formatVND(remainingDebt)}</span>
              </div>
            )}
          </div>

          {/* Package & Gift Entitlements */}
          {packages.length > 0 && (
            <div className="border-t pt-3">
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Package className="w-3.5 h-3.5" /> Gói đã mua/tặng
              </h4>
              {packages.map(pkg => (
                <div key={pkg.id} className="bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-sm">
                  <div className="font-semibold">{pkg.package?.name || 'Gói dịch vụ'}</div>
                  <div className="text-xs text-slate-600">
                    {pkg.total_sessions} buổi · Còn {pkg.remaining_sessions} buổi
                    {pkg.is_gift && <span className="text-purple-700 ml-2">🎁 Tặng</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {entitlements.length > 0 && (
            <div className="border-t pt-3">
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Gift className="w-3.5 h-3.5" /> Quà tặng dịch vụ
              </h4>
              {entitlements.map(ent => (
                <div key={ent.id} className="bg-purple-50 p-2 rounded-lg border border-purple-200 text-sm">
                  <div className="font-semibold">{ent.service?.catalog_item?.name || 'Dịch vụ'}</div>
                  <div className="text-xs text-slate-600">
                    Còn {ent.remaining_quantity} buổi
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Commission */}
          {commissions.length > 0 && (
            <div className="border-t pt-3">
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Hoa hồng
              </h4>
              <div className="space-y-1">
                {commissions.map((c, idx) => (
                  <div key={idx} className="flex justify-between text-sm bg-slate-50 p-2 rounded border border-slate-200">
                    <div>
                      <span className="font-medium">{c.commission_type === 'SALES' ? '💼 SALE' : '💆 PERFORMANCE'}</span>
                      <span className="mx-2 text-slate-400">|</span>
                      <span className="text-slate-600">{c.staff?.full_name || 'Nhân viên'}</span>
                    </div>
                    <span className="font-bold text-emerald-600">+{formatVND(c.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailModal;