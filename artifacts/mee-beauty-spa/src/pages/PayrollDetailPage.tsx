// src/pages/PayrollDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { payrollService } from '../services/payroll.service';
import { Button, Card, Spinner } from '../components/primitives';
import { ArrowLeft } from 'lucide-react';

// ===== HÀM LÀM TRÒN THEO 500/1000 =====
function roundUpToNearest(value: number): number {
  if (value === 0) return 0;
  const remainder = Math.abs(value) % 1000;
  if (remainder === 0) return value;
  // Nếu < 500, làm tròn lên 500
  if (remainder < 500) {
    return value + (500 - remainder);
  } else {
    // Nếu >= 500, làm tròn lên 1000
    return value + (1000 - remainder);
  }
}

// ===== HÀM FORMAT VND CÓ LÀM TRÒN =====
function formatRoundedVND(val: number): string {
  if (val === undefined || val === null) return '0đ';
  const rounded = roundUpToNearest(val);
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);
}

// ===== GIẢI THÍCH LƯƠNG (có làm tròn) =====
function generateExplanation(p: any): string {
  const lines = [];
  lines.push(`Lương cơ bản: ${formatRoundedVND(p.base_salary)}.`);
  lines.push(`Tháng này nhân viên làm ${p.actual_working_days}/${p.total_working_days} ngày.`);
  if (p.allowed_leave_days > 0) {
    lines.push(`Được hưởng ${p.allowed_leave_days} ngày phép và đã sử dụng ${p.leave_days_taken} ngày,`);
    if (p.excess_leave_days === 0) {
      lines.push(`nên không phát sinh trừ nghỉ vượt.`);
    } else {
      lines.push(`nên bị trừ nghỉ vượt ${p.excess_leave_days} ngày, tương đương ${formatRoundedVND(p.excess_leave_deduction)}.`);
    }
  }
  if (p.sale_commission > 0) lines.push(`Hoa hồng Sale: ${formatRoundedVND(p.sale_commission)}.`);
  if (p.performance_commission > 0) lines.push(`Hoa hồng KTV/Performance: ${formatRoundedVND(p.performance_commission)}.`);
  if (p.total_bonus > 0) lines.push(`Thưởng: ${formatRoundedVND(p.total_bonus)}.`);
  if (p.allowance > 0) lines.push(`Phụ cấp: ${formatRoundedVND(p.allowance)}.`);
  if (p.tip > 0) lines.push(`Tip: ${formatRoundedVND(p.tip)}.`);
  if (p.total_penalty > 0) lines.push(`Phạt: ${formatRoundedVND(p.total_penalty)}.`);
  if (p.advance > 0) lines.push(`Đã tạm ứng: ${formatRoundedVND(p.advance)}.`);
  if (p.deduction > 0) lines.push(`Khấu trừ: ${formatRoundedVND(p.deduction)}.`);
  const totalIncome = p.base_salary + p.sale_commission + p.performance_commission + p.total_bonus + p.allowance + p.tip;
  const totalDeduction = p.excess_leave_deduction + p.total_penalty + p.advance + p.deduction;
  lines.push(`Tổng thu nhập: ${formatRoundedVND(totalIncome)}.`);
  lines.push(`Tổng khoản trừ: ${formatRoundedVND(totalDeduction)}.`);
  lines.push(`THỰC NHẬN: ${formatRoundedVND(p.net_salary)}.`);
  return lines.join('\n');
}

interface PayrollDetailPageProps {
  staffId: string;
  month: number;
  year: number;
  onBack: () => void;
}

export const PayrollDetailPage: React.FC<PayrollDetailPageProps> = ({ staffId, month, year, onBack }) => {
  const { isAdmin, currentStaff } = useAuth();

  const [payroll, setPayroll] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [editAllowance, setEditAllowance] = useState<number>(0);
  const [editTip, setEditTip] = useState<number>(0);
  const [editAdvance, setEditAdvance] = useState<number>(0);
  const [editDeduction, setEditDeduction] = useState<number>(0);

  useEffect(() => {
    if (staffId) {
      loadData();
    }
  }, [staffId, month, year]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isAdmin && currentStaff && currentStaff.id !== staffId) {
        setError('Bạn không có quyền xem payroll của nhân viên khác.');
        setLoading(false);
        return;
      }
      const data = await payrollService.getPayroll(staffId, month, year);
      if (!data) {
        setError('Không tìm thấy dữ liệu lương cho tháng này.');
        setLoading(false);
        return;
      }
      setPayroll(data);
      setEditAllowance(data.allowance || 0);
      setEditTip(data.tip || 0);
      setEditAdvance(data.advance || 0);
      setEditDeduction(data.deduction || 0);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu lương');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAdjustments = async () => {
    if (!payroll) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await payrollService.updatePayroll(payroll.id, {
        allowance: editAllowance,
        tip: editTip,
        advance: editAdvance,
        deduction: editDeduction,
      });
      setPayroll(updated);
    } catch (err: any) {
      setError(err.message || 'Lỗi cập nhật');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner className="py-8" />;
  if (error) return <div className="p-4 text-center text-red-600">{error}</div>;
  if (!payroll) return <div className="p-4 text-center">Không tìm thấy dữ liệu.</div>;

  const grossIncome = payroll.base_salary
    + payroll.sale_commission
    + payroll.performance_commission
    + payroll.total_bonus
    + payroll.allowance
    + payroll.tip;

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Chi tiết lương tháng {month}/{year}</h1>
      </div>

      <Card>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b py-1">
            <span className="text-gray-500">Lương cơ bản</span>
            <span className="font-semibold">{formatRoundedVND(payroll.base_salary)}</span>
          </div>
          <div className="flex justify-between border-b py-1">
            <span className="text-gray-500">Ngày công</span>
            <span>{payroll.actual_working_days} / {payroll.total_working_days} ngày</span>
          </div>
          <div className="flex justify-between border-b py-1">
            <span className="text-gray-500">Nghỉ phép</span>
            <span>{payroll.allowed_leave_days} ngày</span>
          </div>
          <div className="flex justify-between border-b py-1">
            <span className="text-gray-500">Nghỉ vượt</span>
            <span>{payroll.excess_leave_days} ngày</span>
          </div>
          <div className="flex justify-between border-b py-1 text-red-600">
            <span>Trừ nghỉ vượt</span>
            <span>-{formatRoundedVND(payroll.excess_leave_deduction)}</span>
          </div>

          <div className="flex justify-between border-b py-1 text-emerald-700">
            <span>Hoa hồng Sale</span>
            <span>+{formatRoundedVND(payroll.sale_commission)}</span>
          </div>
          <div className="flex justify-between border-b py-1 text-emerald-700">
            <span>Hoa hồng KTV / Performance</span>
            <span>+{formatRoundedVND(payroll.performance_commission)}</span>
          </div>

          <div className="flex justify-between border-b py-1 text-emerald-700">
            <span>Thưởng</span>
            <span>+{formatRoundedVND(payroll.total_bonus)}</span>
          </div>
          <div className="flex justify-between border-b py-1 text-emerald-700">
            <span>Phụ cấp</span>
            <span>+{formatRoundedVND(payroll.allowance)}</span>
          </div>
          <div className="flex justify-between border-b py-1 text-emerald-700">
            <span>Tip</span>
            <span>+{formatRoundedVND(payroll.tip)}</span>
          </div>

          <div className="flex justify-between border-b py-1 font-bold text-base">
            <span>Tổng thu nhập</span>
            <span className="text-emerald-700">{formatRoundedVND(grossIncome)}</span>
          </div>

          <div className="flex justify-between border-b py-1 text-red-600">
            <span>Phạt</span>
            <span>-{formatRoundedVND(payroll.total_penalty)}</span>
          </div>
          <div className="flex justify-between border-b py-1 text-red-600">
            <span>Tạm ứng</span>
            <span>-{formatRoundedVND(payroll.advance)}</span>
          </div>
          <div className="flex justify-between border-b py-1 text-red-600">
            <span>Khấu trừ</span>
            <span>-{formatRoundedVND(payroll.deduction)}</span>
          </div>

          <div className="flex justify-between pt-2 text-lg font-bold">
            <span>THỰC NHẬN</span>
            <span className="text-emerald-700">{formatRoundedVND(payroll.net_salary)}</span>
          </div>
        </div>
      </Card>

      <div className="p-4 bg-slate-50 rounded-lg border">
        <h4 className="font-semibold text-sm mb-2">📘 GIẢI THÍCH LƯƠNG</h4>
        <p className="text-sm whitespace-pre-wrap">{generateExplanation(payroll)}</p>
      </div>

      {isAdmin && (
        <div className="p-4 border rounded-lg bg-white">
          <h4 className="font-semibold text-sm mb-2">✏️ Điều chỉnh các khoản phát sinh</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs">Phụ cấp</label>
              <input
                type="number"
                value={editAllowance}
                onChange={(e) => setEditAllowance(Number(e.target.value))}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs">Tip</label>
              <input
                type="number"
                value={editTip}
                onChange={(e) => setEditTip(Number(e.target.value))}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs">Tạm ứng</label>
              <input
                type="number"
                value={editAdvance}
                onChange={(e) => setEditAdvance(Number(e.target.value))}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs">Khấu trừ</label>
              <input
                type="number"
                value={editDeduction}
                onChange={(e) => setEditDeduction(Number(e.target.value))}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
          <Button onClick={handleSaveAdjustments} isLoading={saving} className="mt-3">
            Lưu thay đổi
          </Button>
          {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        </div>
      )}
    </div>
  );
};

export default PayrollDetailPage;