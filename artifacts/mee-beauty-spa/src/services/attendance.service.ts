import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from "./supabase";
import { Attendance } from "../types/domain";

export const attendanceService = {
  /**
   * Check-in: tạo bản ghi attendance cho hôm nay
   */
  async checkIn(staffId: string): Promise<Attendance> {
    const today = new Date().toISOString().split('T')[0];

    // Kiểm tra đã check-in chưa
    const { data: existing } = await supabase
      .from('attendance')
      .select('id, check_in')
      .eq('staff_id', staffId)
      .eq('work_date', today)
      .maybeSingle();

    if (existing) {
      if (existing.check_in) {
        throw new Error('Bạn đã check-in hôm nay rồi.');
      }
      // Nếu chưa check-in nhưng có bản ghi (do tạo từ trước) thì update
      const { data, error } = await supabase
        .from('attendance')
        .update({ check_in: new Date().toISOString(), status: 'PRESENT' })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    // Tạo mới
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        staff_id: staffId,
        work_date: today,
        check_in: new Date().toISOString(),
        status: 'PRESENT',
        organization_id: DEFAULT_ORG_ID,
        branch_id: DEFAULT_BRANCH_ID,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Check-out: cập nhật check_out cho hôm nay
   */
  async checkOut(staffId: string): Promise<Attendance> {
    const today = new Date().toISOString().split('T')[0];

    const { data: record, error: fetchError } = await supabase
      .from('attendance')
      .select('id, check_out')
      .eq('staff_id', staffId)
      .eq('work_date', today)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!record) throw new Error('Bạn chưa check-in hôm nay.');
    if (record.check_out) throw new Error('Bạn đã check-out hôm nay rồi.');

    const { data, error } = await supabase
      .from('attendance')
      .update({ check_out: new Date().toISOString() })
      .eq('id', record.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Lấy attendance theo nhân viên và tháng
   */
  async getMonthlyAttendance(staffId: string, month: number, year: number): Promise<Attendance[]> {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('staff_id', staffId)
      .gte('work_date', startDate)
      .lte('work_date', endDate)
      .order('work_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Lấy attendance hôm nay của nhân viên
   */
  async getTodayAttendance(staffId: string): Promise<Attendance | null> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('staff_id', staffId)
      .eq('work_date', today)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  },

  /**
   * Lấy danh sách attendance của tất cả nhân viên trong ngày (admin)
   */
  async getTodayAll(): Promise<Attendance[]> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('attendance')
      .select('*, staff:staff_id(full_name, role)')
      .eq('work_date', today)
      .order('check_in', { ascending: true });

    if (error) throw error;
    return data || [];
  },
};