// src/pages/LoginPage.tsx
import React from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Users, UserCog } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();

  const handleLogin = (role: UserRole) => {
    login(role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-600/30">
            <span className="text-3xl font-bold text-white">M</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">MEE BEAUTY SPA</h1>
          <p className="text-sm text-slate-500 mt-1">Chọn vai trò để đăng nhập</p>
        </div>

        <div className="space-y-3 pt-4">
          <button
            onClick={() => handleLogin('admin')}
            className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-base shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <UserCog className="w-5 h-5" />
            Vào với Quản lý
          </button>

          <button
            onClick={() => handleLogin('staff')}
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-base shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <Users className="w-5 h-5" />
            Vào với Nhân viên
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
          👤 Phiên bản test – chưa có mật khẩu
        </p>
      </div>
    </div>
  );
};

export default LoginPage;