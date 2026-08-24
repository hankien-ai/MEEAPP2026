import React, { useState, useEffect } from 'react';
import { payrollService } from '../services/payroll.service';
import { Button, Card, Spinner, Badge } from '../components/primitives';
import { useNavigate } from 'react-router-dom';

const formatVND = (val: number) => new Intl.NumberFormat('vi-VN').format(val) + ' đ';

export const PayrollPage: React.FC = () => {
  const navigate = useNavigate();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [payrollList, setPayrollList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    loadPayroll();
  }, [month, year]);

  const loadPayroll = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await payrollService.getPayrollList(month, year);
      setPayrollList(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải bảng lương');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateAll = async () => {
    setCalculating(true);
    setError(null);
    try {
      // Lấy danh sách staff
      const { data: staffs } = await supabase.from('staff').select('id');
      if (staffs) {
        for (const staff of staffs) {
          await payrollService.calculateMonthlySalary(staff.id, month, year);
        }
        await loadPayroll();
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi tính lương');
    } finally {
      setCalculating(false);
    }
  };

  const handleViewDetail = (staffId: string) => {
    navigate(`/payroll-detail/${staffId}?month=${month}&year=${year}`);
  };

  const handlePrevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const handleNextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Bảng lương</h1>
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="p-1 border rounded">&lt;</button>
          <span className="text-sm font-semibold">Tháng {month}/{year}</span>
          <button onClick={handleNextMonth} className="p-1 border rounded">&gt;</button>
          <Button size="sm" onClick={handleCalculateAll} isLoading={calculating}>
            Tính lương
          </Button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

      {loading ? (
        <Spinner className="py-8" />
      ) : payrollList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Chưa có dữ liệu lương cho tháng này.</div>
      ) : (
        <div className="space-y-3">
          {payrollList.map((p) => (
            <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewDetail(p.staff_id)}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{p.staff?.full_name || p.staff_id}</div>
                  <div className="text-xs text-gray-500">Lương cơ bản: {formatVND(p.base_salary)}</div>
                  <div className="text-xs text-gray-500">
                    Đi làm: {p.actual_working_days}/{p.total_working_days} ngày · Nghỉ: {p.leave_days_taken} ngày
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-700">{formatVND(p.net_salary)}</div>
                  <Badge variant={p.status === 'LOCKED' ? 'success' : 'neutral'}>{p.status}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PayrollPage;