import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { payrollService } from '../services/payroll.service';
import { Card, Spinner, Badge } from '../components/primitives';

const formatVND = (val: number) => new Intl.NumberFormat('vi-VN').format(val) + ' đ';

export const PayrollDetailPage: React.FC = () => {
  const { staffId } = useParams<{ staffId: string }>();
  const [searchParams] = useSearchParams();
  const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

  const [payroll, setPayroll] = useState<any>(null);
  const [bonusPenalties, setBonusPenalties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (staffId) {
      loadData();
    }
  }, [staffId, month, year]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [payrollData, bpData] = await Promise.all([
        payrollService.getPayroll(staffId!, month, year),
        payrollService.getBonusPenalties(staffId!, month, year),
      ]);
      setPayroll(payrollData);
      setBonusPenalties(bpData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner className="py-8" />;
  if (!payroll) return <div className="p-4 text-center">Không tìm thấy dữ liệu lương.</div>;

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">Chi tiết lương tháng {month}/{year}</h1>

      <Card>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b py-1">
            <span className="text-gray-500">Lương cơ bản</span>
            <span className="font-semibold">{formatVND(payroll.base_salary)}</span>
          </div>
          <div className="flex justify-between border-b py-1">
            <span className="text-gray-500">Ngày trong tháng</span>
            <span>{payroll.total_working_days} ngày</span>
          </div>
          <div className="flex justify-between border-b py-1">
            <span className="text-gray-500">Ngày đi làm</span>
            <span>{payroll.actual_working_days} ngày</span>
          </div>
          <div className="flex justify-between border-b py-1">
            <span className="text-gray-500">Ngày nghỉ</span>
            <span>{payroll.leave_days_taken} ngày</span>
          </div>
          <div className="flex justify-between border-b py-1">
            <span className="text-gray-500">Nghỉ được phép</span>
            <span>{payroll.allowed_leave_days} ngày</span>
          </div>
          <div className="flex justify-between border-b py-1 text-amber-600">
            <span>Nghỉ vượt</span>
            <span>{payroll.excess_leave_days} ngày</span>
          </div>
          <div className="flex justify-between border-b py-1 text-red-600">
            <span>Tiền trừ nghỉ vượt</span>
            <span>-{formatVND(payroll.excess_leave_deduction)}</span>
          </div>
          <div className="flex justify-between border-b py-1 text-emerald-700">
            <span>Hoa hồng</span>
            <span>+{formatVND(payroll.total_commission)}</span>
          </div>
          <div className="flex justify-between border-b py-1 text-emerald-700">
            <span>Thưởng</span>
            <span>+{formatVND(payroll.total_bonus)}</span>
          </div>
          <div className="flex justify-between border-b py-1 text-red-600">
            <span>Phạt</span>
            <span>-{formatVND(payroll.total_penalty)}</span>
          </div>
          <div className="flex justify-between pt-2 text-base font-bold">
            <span>THỰC NHẬN</span>
            <span className="text-emerald-700">{formatVND(payroll.net_salary)}</span>
          </div>
        </div>
      </Card>

      {bonusPenalties.length > 0 && (
        <div>
          <h2 className="font-semibold text-sm mb-2">Chi tiết thưởng/phạt</h2>
          {bonusPenalties.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-2 border-b text-sm">
              <div>
                <div className="font-medium">{item.type === 'BONUS' ? '🎉 Thưởng' : '⚠️ Phạt'}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
              <div className={item.type === 'BONUS' ? 'text-emerald-700' : 'text-red-600'}>
                {item.type === 'BONUS' ? '+' : '-'}{formatVND(item.amount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PayrollDetailPage;