// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import { settingsService } from '@/services/settings.service';
import { supabase } from '@/services/supabase';

export type UserRole = 'admin' | 'staff';
export type AuthType = 'admin' | 'staff' | null;

export interface VisibilitySettings {
  dashboard: boolean;
  pos: boolean;
  customers: boolean;
  operations: boolean;
  catalog: boolean;
  inventory: boolean;
  staff: boolean;
  payroll: boolean;
  expenses: boolean;
  settings: boolean;
  invoices: boolean;
  reports: boolean;
  extension: boolean;
}

const defaultVisibility: VisibilitySettings = {
  dashboard: true,
  pos: true,
  customers: true,
  operations: true,
  catalog: false,
  inventory: false,
  staff: false,
  payroll: false,
  expenses: false,
  settings: false,
  invoices: false,
  reports: false,
  extension: false,
};

const adminVisibility: VisibilitySettings = {
  dashboard: true,
  pos: true,
  customers: true,
  operations: true,
  catalog: true,
  inventory: true,
  staff: true,
  payroll: true,
  expenses: true,
  settings: true,
  invoices: true,
  reports: true,
  extension: true,
};

interface AuthContextType {
  currentStaff: any | null;
  role: UserRole | null;
  authType: AuthType;
  isAuthenticated: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  visibility: VisibilitySettings;
  loginAdmin: (email: string, password: string) => Promise<void>;
  loginStaff: (pin: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStaff, setCurrentStaff] = useState<any | null>(null);
  const [authType, setAuthType] = useState<AuthType>(null);
  const [visibility, setVisibility] = useState<VisibilitySettings>(defaultVisibility);
  const [loading, setLoading] = useState(false);

  // Derive role từ currentStaff
  const role: UserRole | null = currentStaff
    ? (currentStaff.role === 'Admin' || currentStaff.role === 'admin' ? 'admin' : 'staff')
    : null;

  const buildVisibility = async (staff: any): Promise<VisibilitySettings> => {
    if (!staff) return defaultVisibility;
    if (staff.role === 'Admin' || staff.role === 'admin') {
      return adminVisibility;
    }
    try {
      const permissions = await settingsService.getStaffPermissions();
      const newVis = { ...defaultVisibility };
      const keyMap: Record<string, keyof VisibilitySettings> = {
        dashboard: 'dashboard',
        pos: 'pos',
        customers: 'customers',
        operations: 'operations',
        catalog: 'catalog',
        inventory: 'inventory',
        staff: 'staff',
        payroll: 'payroll',
        expenses: 'expenses',
        settings: 'settings',
        invoices: 'invoices',
        reports: 'reports',
        extension: 'extension',
      };
      permissions.forEach((modId: string) => {
        const key = keyMap[modId];
        if (key) newVis[key] = true;
      });
      return newVis;
    } catch (err) {
      console.error('Lỗi tải quyền nhân viên:', err);
      return defaultVisibility;
    }
  };

  // ✅ KHÔNG TỰ ĐỘNG LOGIN KHI REFRESH TRANG
  useEffect(() => {
    setLoading(false);
  }, []);

  const loginAdmin = async (email: string, password: string) => {
    setLoading(true);
    try {
      authService.clearStaffSession();
      const data = await authService.loginAdmin(email, password);

      const { data: staff, error } = await supabase
        .from('staff')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .single();

      if (error || !staff) {
        throw new Error('Không tìm thấy thông tin nhân viên.');
      }

      setCurrentStaff(staff);
      setAuthType('admin');
      const vis = await buildVisibility(staff);
      setVisibility(vis);
    } catch (err) {
      console.error('Lỗi loginAdmin:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginStaff = async (pin: string) => {
    setLoading(true);
    try {
      await supabase.auth.signOut().catch(() => {});
      const data = await authService.loginStaff(pin);

      setCurrentStaff(data.staff);
      setAuthType('staff');
      const vis = await buildVisibility(data.staff);
      setVisibility(vis);
    } catch (err) {
      console.error('Lỗi loginStaff:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setCurrentStaff(null);
      setAuthType(null);
      setVisibility(defaultVisibility);
    } finally {
      setLoading(false);
    }
  };

  const isLoggedIn = !!currentStaff;

  return (
    <AuthContext.Provider
      value={{
        currentStaff,
        role,
        authType,
        isAuthenticated: isLoggedIn,
        isLoggedIn,
        isAdmin: role === 'admin',
        isStaff: role === 'staff',
        visibility,
        loginAdmin,
        loginStaff,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải được sử dụng trong AuthProvider');
  return context;
};