// src/pages/LoginPage.tsx
import React from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Users, UserCog, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();

  const handleLogin = (role: UserRole) => {
    login(role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-300 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-300 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              MEE <span className="text-emerald-600">Beauty</span> Spa
            </h1>
            <p className="text-sm text-gray-500 mt-1">Hệ thống quản lý vận hành</p>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => handleLogin('admin')}
              className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-2xl font-semibold text-base shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3"
            >
              <UserCog className="w-5 h-5" />
              <span>Vào với Quản lý</span>
            </button>

            <button
              onClick={() => handleLogin('staff')}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl font-semibold text-base shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3"
            >
              <Users className="w-5 h-5" />
              <span>Vào với Nhân viên</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[10px] text-gray-400 border-t border-gray-100 pt-4">
              👤 Phiên bản demo – chọn vai trò để trải nghiệm
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>© 2024 MEE Beauty Spa. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;