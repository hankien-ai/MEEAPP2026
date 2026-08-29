// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export const LoginPage: React.FC = () => {
  const { loginAdmin, loginStaff, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'admin' | 'staff'>('staff'); // 👈 ĐỔI MẶC ĐỊNH THÀNH STAFF
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 👇 TỰ ĐỘNG LOGIN KHI NHẬP ĐỦ 6 SỐ
  useEffect(() => {
    if (pin.length === 6 && activeTab === 'staff') {
      handleStaffLogin(new Event('submit') as any);
    }
  }, [pin]);

  useEffect(() => {
    if (loginSuccess) {
      console.log("✅ Redirecting to dashboard...");
      window.location.href = '/';
    }
  }, [loginSuccess]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      console.log("🔐 Đang gọi loginAdmin...");
      await loginAdmin(email, password);
      console.log("✅ LoginAdmin thành công!");
      setLoginSuccess(true);
    } catch (err: any) {
      console.error("❌ LoginAdmin error:", err);
      setError(err.message || 'Đăng nhập thất bại.');
      setIsSubmitting(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setError('Mã PIN phải gồm 6 chữ số');
      return;
    }
    setIsSubmitting(true);
    try {
      await loginStaff(pin);
      console.log("✅ Staff login thành công!");
      setLoginSuccess(true);
    } catch (err: any) {
      console.error("❌ Staff login error:", err);
      setError(err.message || 'Sai mã PIN');
      setIsSubmitting(false);
    }
  };

  const isDisabled = isSubmitting || loading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-900 to-emerald-900 p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">MEE Beauty Spa</h1>
          <p className="text-emerald-200 text-sm mt-2">Đăng nhập hệ thống</p>
        </div>

        <div className="flex rounded-xl bg-white/10 p-1 mb-6">
          <button
            onClick={() => { setActiveTab('staff'); setError(''); setLoginSuccess(false); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
              activeTab === 'staff' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'
            }`}
          >
            Nhân viên
          </button>
          <button
            onClick={() => { setActiveTab('admin'); setError(''); setLoginSuccess(false); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
              activeTab === 'admin' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'
            }`}
          >
            Quản lý
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        {activeTab === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isDisabled}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDisabled ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        )}

        {activeTab === 'staff' && (
          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80">Mã PIN (6 chữ số)</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full mt-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-center text-2xl tracking-widest placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="••••••"
                required
                autoFocus // 👈 TỰ ĐỘNG FOCUS VÀO Ô PIN
              />
              <p className="text-xs text-white/40 mt-2 text-center">Nhập đủ 6 số sẽ tự động đăng nhập</p>
            </div>
            <button
              type="submit"
              disabled={isDisabled}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDisabled ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-white/30">
          © MEE Beauty Spa. Hệ thống quản lý.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;