// src/pages/LoginPage.tsx
import React from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Users, UserCog, Sparkles, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();

  const handleLogin = (role: UserRole) => {
    login(role);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none font-sans">
      {/* 1. Ảnh nền Spa chất lượng cao */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 animate-pulse duration-[10000ms]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1920')`,
        }}
      />

      {/* 2. Lớp phủ Gradient làm dịu ảnh & tăng độ tương phản */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/85 via-emerald-950/70 to-slate-900/80 backdrop-blur-[2px]" />

      {/* 3. Hiệu ứng ánh sáng huyền ảo xung quanh */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* 4. Thẻ đăng nhập Glassmorphism */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-900/40 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/15 text-white">

          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-5 group">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 blur-md opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-slate-900/90 border border-emerald-400/40 flex items-center justify-center shadow-inner">
                <Sparkles className="w-9 h-9 text-emerald-300" />
              </div>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight font-serif">
              MEE <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">Beauty</span> Spa
            </h1>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-200/80 mt-2 font-medium">
              Hệ thống Quản lý Vận hành
            </p>
          </div>

          {/* Khối nút đăng nhập */}
          <div className="mt-8 space-y-4">
            {/* Nút Quản lý */}
            <button
              onClick={() => handleLogin('admin')}
              className="group relative w-full py-4 px-6 rounded-2xl font-semibold text-sm sm:text-base text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-950/50 hover:shadow-emerald-500/30 border border-emerald-400/30 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
            >
              {/* Hiệu ứng ánh sáng quét qua nút */}
              <div className="absolute inset-0 w-1/2 h-full bg-white/15 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out" />
              <UserCog className="w-5 h-5 text-emerald-200 group-hover:rotate-12 transition-transform duration-300" />
              <span>Vào với Quản lý</span>
            </button>

            {/* Nút Nhân viên */}
            <button
              onClick={() => handleLogin('staff')}
              className="group relative w-full py-4 px-6 rounded-2xl font-semibold text-sm sm:text-base text-slate-100 bg-white/10 hover:bg-white/20 backdrop-blur-md shadow-md border border-white/15 hover:border-white/30 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3"
            >
              <Users className="w-5 h-5 text-teal-300 group-hover:scale-110 transition-transform duration-300" />
              <span>Vào với Nhân viên</span>
            </button>
          </div>

          {/* Ghi chú Demo */}
          <div className="mt-8 pt-5 border-t border-white/10 text-center">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Phiên bản Demo – Chọn vai trò để trải nghiệm</span>
            </div>
          </div>
        </div>

        {/* Footer Bản quyền */}
        <div className="mt-6 text-center text-xs text-white/50 tracking-wider">
          <p>© MEE Beauty Spa. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;