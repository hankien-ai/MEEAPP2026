// src/pages/ReportsPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from '@/services/supabase';
import { Card, Spinner, Badge } from '@/components/primitives';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  Calendar,
  CreditCard,
  Package,
  UserCog,
  AlertCircle,
  ChevronDown,
  Filter,
  X
} from 'lucide-react';

const formatVND = (val: number) => new Intl.NumberFormat('vi-VN').format(val) + ' đ';

type DateRange = 'today' | 'yesterday' | 'week' | 'month' | 'custom';

const ReportsPage: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  // Data states
  const [summary, setSummary] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    avgOrderValue: 0,
    cash: 0,
    bank: 0,
    qr: 0,
    debt: 0,
  });
  const [topServices, setTopServices] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topStaff, setTopStaff] = useState<any[]>([]);
  const [pendingDebt, setPendingDebt] = useState(0);
  const [pendingInvoices, setPendingInvoices] = useState(0);
  const [lowStock, setLowStock] = useState<any[]>([]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [dateRange, customStart, customEnd]);

  const getDateRange = () => {
    const now = new Date();
    let start: Date, end: Date = now;
    switch (dateRange) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'yesterday':
        start = subDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), 1);
        end = start;
        break;
      case 'week':
        start = subDays(now, 7);
        break;
      case 'month':
        start = startOfMonth(now);
        break;
      case 'custom':
        if (customStart && customEnd) {
          start = new Date(customStart);
          end = new Date(customEnd);
        } else {
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    return { start, end };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange();
      const startStr = start.toISOString();
      const endStr = end.toISOString();

      // 1. Invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total_amount, payment_method, status')
        .eq('organization_id', DEFAULT_ORG_ID)
        .eq('branch_id', DEFAULT_BRANCH_ID)
        .gte('created_at', startStr)
        .lte('created_at', endStr)
        .in('status', ['PAID', 'PARTIALLY_PAID']);

      const revenue = invoices?.reduce((s, i) => s + (i.total_amount || 0), 0) || 0;
      const orders = invoices?.length || 0;
      const avgOrder = orders > 0 ? revenue / orders : 0;

      const cash = invoices?.filter(i => i.payment_method === 'CASH').reduce((s, i) => s + (i.total_amount || 0), 0) || 0;
      const bank = invoices?.filter(i => i.payment_method === 'BANK_TRANSFER').reduce((s, i) => s + (i.total_amount || 0), 0) || 0;
      const qr = invoices?.filter(i => i.payment_method === 'QR').reduce((s, i) => s + (i.total_amount || 0), 0) || 0;
      const debt = invoices?.filter(i => i.status === 'PARTIALLY_PAID').reduce((s, i) => s + (i.total_amount || 0), 0) || 0;

      setSummary({ revenue, orders, customers: 0, avgOrderValue: avgOrder, cash, bank, qr, debt });

      // 2. Customers (new in period)
      const { count: customers } = await supabase
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startStr)
        .lte('created_at', endStr);
      setSummary(prev => ({ ...prev, customers: customers || 0 }));

      // 3. Top services
      const { data: serviceItems } = await supabase
        .from('invoice_items')
        .select('description, total_amount, catalog_item_id')
        .eq('organization_id', DEFAULT_ORG_ID)
        .eq('branch_id', DEFAULT_BRANCH_ID)
        .gte('created_at', startStr)
        .lte('created_at', endStr);

      const serviceMap = new Map();
      (serviceItems || []).forEach(item => {
        const key = item.description || item.catalog_item_id || 'Khác';
        const current = serviceMap.get(key) || { total: 0, count: 0 };
        current.total += item.total_amount || 0;
        current.count += 1;
        serviceMap.set(key, current);
      });
      const sortedServices = Array.from(serviceMap.entries())
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 5)
        .map(([name, data]) => ({ name, total: data.total, count: data.count }));
      setTopServices(sortedServices);

      // 4. Top products (từ catalog_items item_type = 'PRODUCT')
      const { data: productItems } = await supabase
        .from('invoice_items')
        .select('catalog_item_id, total_amount, catalog_items!inner(name)')
        .eq('organization_id', DEFAULT_ORG_ID)
        .eq('branch_id', DEFAULT_BRANCH_ID)
        .gte('created_at', startStr)
        .lte('created_at', endStr);

      const productMap = new Map();
      (productItems || []).forEach(item => {
        const name = (item.catalog_items as any)?.name || 'Sản phẩm';
        const current = productMap.get(name) || 0;
        productMap.set(name, current + (item.total_amount || 0));
      });
      const sortedProducts = Array.from(productMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, total]) => ({ name, total }));
      setTopProducts(sortedProducts);

      // 5. Top staff (commission)
      const { data: comms } = await supabase
        .from('staff_commissions')
        .select('staff_id, amount, staff:staff_id(full_name)')
        .eq('organization_id', DEFAULT_ORG_ID)
        .eq('branch_id', DEFAULT_BRANCH_ID)
        .gte('created_at', startStr)
        .lte('created_at', endStr);

      const staffMap = new Map();
      (comms || []).forEach(c => {
        const name = (c.staff as any)?.full_name || 'Nhân viên';
        const current = staffMap.get(name) || 0;
        staffMap.set(name, current + (c.amount || 0));
      });
      const sortedStaff = Array.from(staffMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, total]) => ({ name, total }));
      setTopStaff(sortedStaff);

      // 6. Pending debt & invoices
      const { data: pendingInv } = await supabase
        .from('invoices')
        .select('id, total_amount, paid_amount')
        .eq('organization_id', DEFAULT_ORG_ID)
        .eq('branch_id', DEFAULT_BRANCH_ID)
        .eq('status', 'PARTIALLY_PAID');
      const totalDebt = (pendingInv || []).reduce((s, i) => s + (i.total_amount - (i.paid_amount || 0)), 0);
      setPendingDebt(totalDebt);
      setPendingInvoices(pendingInv?.length || 0);

      // 7. Low stock
      const { data: products } = await supabase
        .from('products')
        .select('catalog_item_id, stock_quantity, minimum_stock, catalog_items!inner(name)')
        .eq('organization_id', DEFAULT_ORG_ID)
        .eq('branch_id', DEFAULT_BRANCH_ID);
      const low = (products || [])
        .filter(p => (p.stock_quantity || 0) <= (p.minimum_stock || 0) && (p.stock_quantity || 0) > 0)
        .map(p => ({
          name: (p.catalog_items as any)?.name || 'Sản phẩm',
          stock: p.stock_quantity || 0,
          min: p.minimum_stock || 0
        }));
      setLowStock(low);

    } catch (err) {
      console.error('Lỗi tải báo cáo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (range: DateRange) => {
    setDateRange(range);
    if (range !== 'custom') {
      setShowFilter(false);
    }
  };

  const navigateTo = (tab: string) => {
    // Sẽ được tích hợp với navigation
    window.location.href = `/${tab}`;
  };

  if (loading) return <Spinner className="py-12" />;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">📊 Báo cáo</h1>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700"
          >
            <Calendar className="w-4 h-4" />
            {dateRange === 'today' ? 'Hôm nay' :
             dateRange === 'yesterday' ? 'Hôm qua' :
             dateRange === 'week' ? '7 ngày' :
             dateRange === 'month' ? 'Tháng này' : 'Tùy chỉnh'}
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Filter dropdown */}
        {showFilter && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-wrap gap-2">
              {['today', 'yesterday', 'week', 'month', 'custom'].map((key) => (
                <button
                  key={key}
                  onClick={() => handleDateChange(key as DateRange)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    dateRange === key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {key === 'today' ? 'Hôm nay' :
                   key === 'yesterday' ? 'Hôm qua' :
                   key === 'week' ? '7 ngày' :
                   key === 'month' ? 'Tháng này' : 'Tùy chỉnh'}
                </button>
              ))}
            </div>
            {dateRange === 'custom' && (
              <div className="flex gap-3">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="flex-1 p-2 border border-slate-300 rounded-lg text-sm"
                />
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="flex-1 p-2 border border-slate-300 rounded-lg text-sm"
                />
                <button
                  onClick={() => loadData()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium"
                >
                  Áp dụng
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tổng quan */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500">Doanh thu</div>
            <div className="text-xl font-bold text-emerald-700">{formatVND(summary.revenue)}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500">Hóa đơn</div>
            <div className="text-xl font-bold text-slate-800">{summary.orders}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500">Khách hàng mới</div>
            <div className="text-xl font-bold text-blue-600">{summary.customers}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500">Trung bình/đơn</div>
            <div className="text-xl font-bold text-purple-600">{formatVND(summary.avgOrderValue)}</div>
          </div>
        </div>

        {/* Doanh thu theo phương thức */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Doanh thu theo phương thức</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span>Tiền mặt</span>
              <span className="font-medium">{formatVND(summary.cash)}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span>Chuyển khoản</span>
              <span className="font-medium">{formatVND(summary.bank)}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span>QR</span>
              <span className="font-medium">{formatVND(summary.qr)}</span>
            </div>
            <div className="flex justify-between p-2 bg-amber-50 rounded">
              <span>Công nợ</span>
              <span className="font-medium text-amber-700">{formatVND(summary.debt)}</span>
            </div>
          </div>
        </div>

        {/* Top Services & Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Top dịch vụ</h3>
            {topServices.length === 0 ? (
              <div className="text-sm text-slate-400">Chưa có dữ liệu</div>
            ) : (
              topServices.map((item, i) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0 text-sm">
                  <span>{i+1}. {item.name}</span>
                  <span className="font-medium">{formatVND(item.total)}</span>
                </div>
              ))
            )}
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Top sản phẩm</h3>
            {topProducts.length === 0 ? (
              <div className="text-sm text-slate-400">Chưa có dữ liệu</div>
            ) : (
              topProducts.map((item, i) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0 text-sm">
                  <span>{i+1}. {item.name}</span>
                  <span className="font-medium">{formatVND(item.total)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Staff */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">🌟 Nhân viên xuất sắc</h3>
          {topStaff.length === 0 ? (
            <div className="text-sm text-slate-400">Chưa có dữ liệu</div>
          ) : (
            topStaff.map((item, i) => (
              <div key={i} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0 text-sm">
                <span>{i+1}. {item.name}</span>
                <span className="font-medium text-emerald-600">+{formatVND(item.total)}</span>
              </div>
            ))
          )}
        </div>

        {/* Các khoản cần chú ý */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" /> Cần chú ý
          </h3>
          <div className="space-y-2 text-sm">
            {pendingDebt > 0 && (
              <div className="flex justify-between p-2 bg-amber-50 rounded-lg">
                <span>💳 Công nợ</span>
                <span className="font-medium text-amber-700">{formatVND(pendingDebt)} ({pendingInvoices} hóa đơn)</span>
              </div>
            )}
            {lowStock.length > 0 && (
              <div className="flex justify-between p-2 bg-red-50 rounded-lg">
                <span>📦 Tồn kho thấp</span>
                <span className="font-medium text-red-700">{lowStock.length} sản phẩm</span>
              </div>
            )}
            {pendingDebt === 0 && lowStock.length === 0 && (
              <div className="text-slate-400 text-sm">Không có vấn đề đáng chú ý</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;