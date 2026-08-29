// src/services/auth.service.ts
import { supabase } from './supabase';

const STAFF_TOKEN_KEY = 'mee_staff_token';
const STAFF_PROFILE_KEY = 'mee_staff_profile';

// Hàm mã hóa UTF-8 sang base64 (xử lý tiếng Việt an toàn)
function utf8ToBase64(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (_, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    })
  );
}

// Hàm giải mã base64 về UTF-8
function base64ToUtf8(str: string): string {
  return decodeURIComponent(
    atob(str)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
}

export const authService = {
  /**
   * ADMIN LOGIN - Supabase Auth
   */
  async loginAdmin(email: string, password: string) {
    // 1. Dọn dẹp token Staff PIN cũ trước khi đăng nhập Admin
    this.clearStaffSession();

    // 2. Thực hiện đăng nhập Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    // 3. Lấy thông tin Staff tương ứng và lưu vào LocalStorage để đồng bộ isAdmin()
    if (data?.user) {
      const { data: staff } = await supabase
        .from('staff')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .maybeSingle();

      if (staff) {
        localStorage.setItem(STAFF_PROFILE_KEY, JSON.stringify(staff));
      }
    }

    return data;
  },

  /**
   * STAFF LOGIN - PIN qua RPC
   */
  async loginStaff(pin: string) {
    // 1. Đăng xuất khỏi Supabase Auth Admin trước để tránh xung đột session ngầm
    await supabase.auth.signOut().catch(() => {});

    // 2. Gọi RPC staff_pin_login
    const { data, error } = await supabase.rpc('staff_pin_login', {
      p_pin: pin,
    });

    if (error) {
      console.error('RPC staff_pin_login error:', error);
      throw new Error('Lỗi kết nối server');
    }

    if (!data || !data.success) {
      throw new Error(data?.error || 'Mã PIN không đúng');
    }

    // 3. Lưu thông tin Staff vào LocalStorage
    localStorage.setItem(STAFF_PROFILE_KEY, JSON.stringify(data.staff));

    // 4. Tạo token Staff (Expiration 12 giờ)
    const tokenPayload = {
      staff_id: data.staff.id,
      role: data.staff.role,
      exp: Date.now() + 12 * 60 * 60 * 1000,
    };
    const token = utf8ToBase64(JSON.stringify(tokenPayload));
    localStorage.setItem(STAFF_TOKEN_KEY, token);

    console.log('✅ Đăng nhập Staff thành công:', data.staff.full_name);
    return data;
  },

  /**
   * LOGOUT - Đăng xuất sạch sẽ cả Admin & Staff
   */
  async logout() {
    try {
      // 1. Đăng xuất Supabase Admin
      await supabase.auth.signOut().catch(() => {});
    } finally {
      // 2. Xóa toàn bộ LocalStorage liên quan đến Auth
      this.clearStaffSession();
      localStorage.removeItem('mee_role');
      localStorage.removeItem('mee_visibility');
      console.log('✅ Đã đăng xuất hoàn toàn');
    }
  },

  /**
   * Xóa bộ nhớ tạm của Staff PIN
   */
  clearStaffSession() {
    localStorage.removeItem(STAFF_TOKEN_KEY);
    localStorage.removeItem(STAFF_PROFILE_KEY);
  },

  /**
   * Lấy staff hiện tại từ localStorage
   */
  getCurrentStaff() {
    const raw = localStorage.getItem(STAFF_PROFILE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * Lấy token staff hiện tại
   */
  getToken() {
    return localStorage.getItem(STAFF_TOKEN_KEY);
  },

  /**
   * Kiểm tra phiên đăng nhập Staff còn hạn hay không
   */
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(base64ToUtf8(token));
      if (payload.exp < Date.now()) {
        this.clearStaffSession();
        return false;
      }
      return true;
    } catch {
      this.clearStaffSession();
      return false;
    }
  },

  /**
   * Kiểm tra quyền Admin
   */
  isAdmin() {
    const staff = this.getCurrentStaff();
    if (!staff) return false;
    return staff.role === 'Admin' || staff.role === 'admin';
  },

  /**
   * Kiểm tra xem người dùng có phải Nhân viên thường không
   */
  isStaff() {
    const staff = this.getCurrentStaff();
    if (!staff) return false;
    return !this.isAdmin();
  },

  /**
   * SET PIN cho staff - Gọi RPC hash_and_update_pin
   */
  async setStaffPin(staffId: string, pin: string) {
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      throw new Error('Mã PIN phải gồm đúng 6 chữ số');
    }

    const { data, error } = await supabase.rpc('hash_and_update_pin', {
      p_staff_id: staffId,
      p_pin: pin,
    });

    if (error) {
      console.error('RPC hash_and_update_pin error:', error);
      throw new Error('Không thể cập nhật PIN: ' + error.message);
    }

    if (!data || !data.success) {
      throw new Error(data?.error || 'Không thể cập nhật PIN');
    }

    return data;
  },

  /**
   * Lấy danh sách staff (Chỉ Admin)
   */
  async getStaffList() {
    if (!this.isAdmin()) {
      throw new Error('Chỉ Admin mới có quyền xem danh sách nhân viên');
    }

    const { data, error } = await supabase
      .from('staff')
      .select('id, full_name, phone, role, status, base_salary, started_on, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Tạo staff mới kèm PIN (Chỉ Admin)
   */
  async createStaffWithPin(staffData: {
    full_name: string;
    phone: string;
    role: string;
    base_salary?: number;
    status?: string;
    started_on?: string;
    pin: string;
    organization_id?: string;
    branch_id?: string;
  }) {
    if (!this.isAdmin()) {
      throw new Error('Chỉ Admin mới có quyền tạo nhân viên');
    }

    if (!staffData.pin || staffData.pin.length !== 6 || !/^\d{6}$/.test(staffData.pin)) {
      throw new Error('Mã PIN phải gồm đúng 6 chữ số');
    }

    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .insert({
        full_name: staffData.full_name,
        phone: staffData.phone,
        role: staffData.role || 'Kỹ thuật viên',
        base_salary: staffData.base_salary || 0,
        status: staffData.status || 'ACTIVE',
        started_on: staffData.started_on || new Date().toISOString().split('T')[0],
        organization_id: staffData.organization_id || '4fc2ef26-2fa6-43c1-9e7f-7362ac747a26',
        branch_id: staffData.branch_id || '677f6f26-77d1-4a26-ab13-7c2f5a2994f9',
      })
      .select()
      .single();

    if (staffError) throw staffError;

    // Cập nhật PIN mã hóa cho Staff vừa tạo
    await this.setStaffPin(staff.id, staffData.pin);

    return staff;
  },

  /**
   * Cập nhật thông tin staff (Chỉ Admin)
   */
  async updateStaff(
    staffId: string,
    data: {
      full_name?: string;
      phone?: string;
      role?: string;
      status?: string;
      base_salary?: number;
    }
  ) {
    if (!this.isAdmin()) {
      throw new Error('Chỉ Admin mới có quyền cập nhật nhân viên');
    }

    const { error } = await supabase
      .from('staff')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', staffId);

    if (error) throw error;

    // Đăng nhập lại nếu đang tự sửa chính mình để cập nhật local storage
    const current = this.getCurrentStaff();
    if (current && current.id === staffId) {
      localStorage.setItem(STAFF_PROFILE_KEY, JSON.stringify({ ...current, ...data }));
    }

    return true;
  },

  /**
   * Vô hiệu hóa staff (Soft delete)
   */
  async deactivateStaff(staffId: string) {
    if (!this.isAdmin()) {
      throw new Error('Chỉ Admin mới có quyền vô hiệu hóa nhân viên');
    }

    const { error } = await supabase
      .from('staff')
      .update({
        status: 'INACTIVE',
        updated_at: new Date().toISOString(),
      })
      .eq('id', staffId);

    if (error) throw error;
    return true;
  },

  /**
   * Kích hoạt lại staff
   */
  async activateStaff(staffId: string) {
    if (!this.isAdmin()) {
      throw new Error('Chỉ Admin mới có quyền kích hoạt nhân viên');
    }

    const { error } = await supabase
      .from('staff')
      .update({
        status: 'ACTIVE',
        updated_at: new Date().toISOString(),
      })
      .eq('id', staffId);

    if (error) throw error;
    return true;
  },
};

export default authService;