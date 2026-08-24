import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";
import { Payroll, PayrollDetail } from "../types/domain";

// Helper: số ngày trong tháng
function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

// Helper: lấy tổng commission của nhân viên trong tháng
async function getTotalCommission(staffId: string, month: number, year: number): Promise<number> {
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  const { data, error } = await supabase
    .from('commission_logs')
    .select('amount')
    .eq('staff_id', staffId)
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (error) {
    console.error('Error fetching commission:', error);
    return 0;
  }

  return data?.reduce((sum, row) => sum + (row.amount || 0), 0) || 0;
}

// Helper: lấy tổng bonus của nhân viên trong tháng
async function getTotalBonus(staffId: string, month: number, year: number): Promise<number> {
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('bonus_penalty')
    .select('amount')
    .eq('staff_id', staffId)
    .eq('type', 'BONUS')
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) return 0;
  return data?.reduce((sum, row) => sum + (row.amount || 0), 0) || 0;
}

// Helper: lấy tổng penalty của nhân viên trong tháng
async function getTotalPenalty(staffId: string, month: number, year: number): Promise<number> {
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('bonus_penalty')
    .select('amount')
    .eq('staff_id', staffId)
    .eq('type', 'PENALTY')
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) return 0;
  return data?.reduce((sum, row) => sum + (row.amount || 0), 0) || 0;
}

// Helper: lấy cài đặt số ngày nghỉ được phép
async function getAllowedLeaveDays(organizationId: string, branchId: string): Promise<number> {
  const { data, error } = await supabase
    .from('salary_settings')
    .select('default_allowed_leave_days')
    .eq('organization_id', organizationId)
    .eq('branch_id', branchId)
    .maybeSingle();

  if (error || !data) return 2; // mặc định 2 ngày
  return data.default_allowed_leave_days || 2;
}

export const payrollService = {
  /**
   * Tính lương cho một nhân viên trong tháng cụ thể
   */
  async calculateMonthlySalary(
    staffId: string,
    month: number,
    year: number,
    organizationId: string = DEFAULT_ORG_ID,
    branchId: string = DEFAULT_BRANCH_ID
  ): Promise<Payroll> {
    // 1. Lấy thông tin nhân viên
    const { data: staff, error: staffErr } = await supabase
      .from('staff')
      .select('base_salary')
      .eq('id', staffId)
      .single();

    if (staffErr || !staff) throw new Error('Không tìm thấy nhân viên');
    const baseSalary = staff.base_salary || 0;

    // 2. Lấy attendance trong tháng
    const attendances = await attendanceService.getMonthlyAttendance(staffId, month, year);
    const daysInMonth = getDaysInMonth(month, year);

    // 3. Đếm số ngày làm việc (có check_in)
    const workingDays = attendances.filter(a => a.check_in !== null).length;
    const leaveDays = daysInMonth - workingDays;

    // 4. Lấy số ngày nghỉ được phép
    const allowedLeaveDays = await getAllowedLeaveDays(organizationId, branchId);

    // 5. Tính số ngày nghỉ vượt
    const excessLeaveDays = Math.max(0, leaveDays - allowedLeaveDays);

    // 6. Tính tiền trừ nghỉ vượt
    const dailyRate = baseSalary / daysInMonth;
    const excessLeaveDeduction = excessLeaveDays * dailyRate;

    // 7. Lấy commission, bonus, penalty
    const totalCommission = await getTotalCommission(staffId, month, year);
    const totalBonus = await getTotalBonus(staffId, month, year);
    const totalPenalty = await getTotalPenalty(staffId, month, year);

    // 8. Tính lương thực nhận
    const netSalary = baseSalary - excessLeaveDeduction + totalCommission + totalBonus - totalPenalty;

    // 9. Lưu vào bảng payroll
    const payrollData = {
      staff_id: staffId,
      month,
      year,
      base_salary: baseSalary,
      total_working_days: daysInMonth,
      actual_working_days: workingDays,
      leave_days_taken: leaveDays,
      allowed_leave_days: allowedLeaveDays,
      excess_leave_days: excessLeaveDays,
      excess_leave_deduction: excessLeaveDeduction,
      total_commission: totalCommission,
      total_bonus: totalBonus,
      total_penalty: totalPenalty,
      net_salary: netSalary,
      status: 'DRAFT',
      organization_id: organizationId,
      branch_id: branchId,
    };

    // Upsert: nếu đã có payroll cho tháng này thì update, không thì insert
    const { data: existing } = await supabase
      .from('payroll')
      .select('id')
      .eq('staff_id', staffId)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle();

    let result: Payroll;
    if (existing) {
      const { data, error } = await supabase
        .from('payroll')
        .update(payrollData)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('payroll')
        .insert(payrollData)
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    return result;
  },

  /**
   * Lấy bảng lương của một nhân viên trong tháng
   */
  async getPayroll(staffId: string, month: number, year: number): Promise<Payroll | null> {
    const { data, error } = await supabase
      .from('payroll')
      .select('*')
      .eq('staff_id', staffId)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  },

  /**
   * Lấy danh sách payroll của tất cả nhân viên trong tháng
   */
  async getPayrollList(month: number, year: number): Promise<Payroll[]> {
    const { data, error } = await supabase
      .from('payroll')
      .select('*, staff:staff_id(full_name, role)')
      .eq('month', month)
      .eq('year', year)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Lấy cài đặt lương (số ngày nghỉ, bật/tắt chấm công)
   */
  async getSettings(organizationId: string = DEFAULT_ORG_ID, branchId: string = DEFAULT_BRANCH_ID): Promise<any> {
    const { data, error } = await supabase
      .from('salary_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('branch_id', branchId)
      .maybeSingle();

    if (error) throw error;
    if (data) return data;

    // Nếu chưa có, tạo mới
    const { data: newSetting, error: insertErr } = await supabase
      .from('salary_settings')
      .insert({
        organization_id: organizationId,
        branch_id: branchId,
        default_allowed_leave_days: 2,
        attendance_enabled: true,
      })
      .select()
      .single();

    if (insertErr) throw insertErr;
    return newSetting;
  },

  /**
   * Cập nhật cài đặt lương
   */
  async updateSettings(
    organizationId: string,
    branchId: string,
    updates: { default_allowed_leave_days?: number; attendance_enabled?: boolean; updated_by?: string }
  ): Promise<any> {
    const { data, error } = await supabase
      .from('salary_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('organization_id', organizationId)
      .eq('branch_id', branchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Thêm khoản thưởng/phạt
   */
  async addBonusPenalty(data: {
    staff_id: string;
    type: 'BONUS' | 'PENALTY';
    amount: number;
    description: string;
    date: string;
    created_by?: string;
  }): Promise<any> {
    const { data: result, error } = await supabase
      .from('bonus_penalty')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  /**
   * Lấy danh sách thưởng/phạt của nhân viên trong tháng
   */
  async getBonusPenalties(staffId: string, month: number, year: number): Promise<any[]> {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('bonus_penalty')
      .select('*')
      .eq('staff_id', staffId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};