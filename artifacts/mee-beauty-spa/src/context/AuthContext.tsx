// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
};

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  visibility: VisibilitySettings;
  setVisibility: (settings: VisibilitySettings) => void;
  isLoggedIn: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('staff');
  const [visibility, setVisibility] = useState<VisibilitySettings>(defaultVisibility);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const savedRole = localStorage.getItem('mee_role') as UserRole | null;
    const savedVisibility = localStorage.getItem('mee_visibility');
    if (savedRole) {
      setRole(savedRole);
      setIsLoggedIn(true);
    }
    if (savedVisibility) {
      try {
        setVisibility(JSON.parse(savedVisibility));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const login = (newRole: UserRole) => {
    setRole(newRole);
    setIsLoggedIn(true);
    localStorage.setItem('mee_role', newRole);
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('mee_role');
    // không xóa visibility để giữ cài đặt
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