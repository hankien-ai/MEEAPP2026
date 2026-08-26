// src/pages/ReportsPage.tsx
import React, { useState, useEffect } from 'react';
import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from '@/services/supabase';
import { Card, Spinner } from '@/components/primitives';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [monthOrders, setMonthOrders] = useState(0);
  const [topServices, setTopServices] = useState<any[]>([]);
  const [topStaff, setTopStaff] = useState<any[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    // Today
    const { data: todayData } = await supabase
      .from('invoices')
      .select('total_amount')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('branch_id', DEFAULT_BRANCH_ID)
      .gte('created_at', today)
      .in('status', ['PAID', 'PARTIALLY_PAID']);
    setTodayRevenue(todayData?.reduce((s, i) => s + (i.total_amount || 0), 0) || 0);
    setTodayOrders(todayData?.length || 0);

    // Month
    const { data: monthData } = await supabase
      .from('invoices')
      .select('total_amount')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('branch_id', DEFAULT_BRANCH_ID)
      .gte('created_at', startOfMonth)
      .in('status', ['PAID', 'PARTIALLY_PAID']);
    setMonthRevenue(monthData?.reduce((s, i) => s + (i.total_amount || 0), 0) || 0);
    setMonthOrders(monthData?.length || 0);

    // Top services (from invoice_items)
    const { data: items } = await supabase
      .from('invoice_items')
      .select('description, total_amount, catalog_item_id')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('branch_id', DEFAULT_BRANCH_ID)
      .gte('created_at', startOfMonth);
    const serviceMap = new Map();
    (items || []).forEach(item => {
      const key = item.description || item.catalog_item_id || 'Khác';
      const current = serviceMap.get(key) || { total: 0, count: 0 };
      current.total += item.total_amount || 0;
      current.count += 1;
      serviceMap.set(key, current);
    });
    const sorted = Array.from(serviceMap.entries()).sort((a, b) => b[1].total - a[1].total).slice(0, 5);
    setTopServices(sorted.map(([name, data]) => ({ name, total: data.total, count: data.count })));

    // Top staff (from staff_commissions)
    const { data: comms } = await supabase
      .from('staff_commissions')
      .select('staff_id, amount, staff:staff_id(full_name)')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('branch_id', DEFAULT_BRANCH_ID)
      .gte('created_at', startOfMonth);
    const staffMap = new Map();
    (comms || []).forEach(c => {
      const name = c.staff?.full_name || 'Nhân viên';
      const current = staffMap.get(name) || 0;
      staffMap.set(name, current + (c.amount || 0));
    });
    const sortedStaff = Array.from(staffMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
    setTopStaff(sortedStaff.map(([name, total]) => ({ name, total })));

    setLoading(false);
  };

  const formatVND = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  if (loading) return <Spinner className="py-12" />;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Báo cáo</h1>
      <p className="text-sm text-slate-500">Thống kê doanh thu, dịch vụ, nhân viên</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center"><div className="text-2xl font-bold text-emerald-600">{formatVND(todayRevenue)}</div><div className="text-xs text-slate-500">Doanh thu hôm nay</div></Card>
        <Card className="p-4 text-center"><div className="text-2xl font-bold text-blue-600">{todayOrders}</div><div className="text-xs text-slate-500">Hóa đơn hôm nay</div></Card>
        <Card className="p-4 text-center"><div className="text-2xl font-bold text-purple-600">{formatVND(monthRevenue)}</div><div className="text-xs text-slate-500">Doanh thu tháng</div></Card>
        <Card className="p-4 text-center"><div className="text-2xl font-bold text-amber-600">{monthOrders}</div><div className="text-xs text-slate-500">Hóa đơn tháng</div></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Dịch vụ bán chạy nhất">
          {topServices.length === 0 ? <div className="text-sm text-slate-400">Chưa có dữ liệu</div> :
            topServices.map((s, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                <span>{i+1}. {s.name}</span>
                <span className="font-semibold">{formatVND(s.total)} ({s.count} lượt)</span>
              </div>
            ))}
        </Card>
        <Card title="Nhân viên có hoa hồng cao nhất">
          {topStaff.length === 0 ? <div className="text-sm text-slate-400">Chưa có dữ liệu</div> :
            topStaff.map((s, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                <span>{i+1}. {s.name}</span>
                <span className="font-semibold">{formatVND(s.total)}</span>
              </div>
            ))}
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;