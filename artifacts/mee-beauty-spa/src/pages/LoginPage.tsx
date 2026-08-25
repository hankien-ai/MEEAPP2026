// src/pages/LoginPage.tsx
import React from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Sparkles, Users, UserCog } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-pink-50 p-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/40">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
            <span className="text-4xl font-black text-white">M</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mt-4">MEE BEAUTY SPA</h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Hệ thống quản lý spa
          </p>
        </div>

        {/* Description */}
        <p className="text-center text-sm text-slate-600 mb-6">
          Chọn vai trò để đăng nhập vào hệ thống
        </p>

        {/* Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => login('admin')}
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold text-base shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
          >
            <UserCog className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Vào với Quản lý
          </button>

          <button
            onClick={() => login('staff')}
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold text-base shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
          >
            <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Vào với Nhân viên
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-400 mt-6 border-t border-slate-100 pt-4">
          🔒 Phiên bản test – không cần mật khẩu
        </p>
      </div>
    </div>
  );
};

export default LoginPage;