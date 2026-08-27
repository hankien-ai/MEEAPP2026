// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { settingsService, DEFAULT_STAFF_PERMISSIONS } from '@/services/settings.service';

export type UserRole = 'admin' | 'staff';

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

const moduleToVisibilityKey: Record<string, keyof VisibilitySettings> = {
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

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  visibility: VisibilitySettings;
  setVisibility: (settings: VisibilitySettings) => void;
  isLoggedIn: boolean;
  login: (role: UserRole) => Promise<void>;
  logout: () => void;
  loadStaffPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('staff');
  const [visibility, setVisibility] = useState<VisibilitySettings>(defaultVisibility);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const loadStaffPermissions = async () => {
    try {
      const permissions = await settingsService.getStaffPermissions();
      const newVisibility = { ...defaultVisibility };
      permissions.forEach((modId: string) => {
        const key = moduleToVisibilityKey[modId];
        if (key) {
          newVisibility[key] = true;
        }
      });
      setVisibility(newVisibility);
      localStorage.setItem('mee_visibility', JSON.stringify(newVisibility));
    } catch (err) {
      console.error('loadStaffPermissions error:', err);
      setVisibility(defaultVisibility);
    }
  };

  useEffect(() => {
    const savedRole = localStorage.getItem('mee_role') as UserRole | null;
    const savedVisibility = localStorage.getItem('mee_visibility');

    if (savedRole) {
      setRole(savedRole);
      setIsLoggedIn(true);

      if (savedVisibility) {
        try {
          setVisibility(JSON.parse(savedVisibility));
        } catch (e) {
          if (savedRole === 'admin') {
            setVisibility(adminVisibility);
          } else {
            loadStaffPermissions();
          }
        }
      } else {
        if (savedRole === 'admin') {
          setVisibility(adminVisibility);
        } else {
          loadStaffPermissions();
        }
      }
    }
  }, []);

  const login = async (newRole: UserRole) => {
    setRole(newRole);
    setIsLoggedIn(true);
    localStorage.setItem('mee_role', newRole);

    if (newRole === 'admin') {
      setVisibility(adminVisibility);
      localStorage.setItem('mee_visibility', JSON.stringify(adminVisibility));
    } else {
      await loadStaffPermissions();
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('mee_role');
  };

  const handleSetVisibility = (settings: VisibilitySettings) => {
    setVisibility(settings);
    localStorage.setItem('mee_visibility', JSON.stringify(settings));
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        visibility,
        setVisibility: handleSetVisibility,
        isLoggedIn,
        login,
        logout,
        loadStaffPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};