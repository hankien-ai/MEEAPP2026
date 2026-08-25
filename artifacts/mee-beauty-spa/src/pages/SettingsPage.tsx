// src/pages/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth, VisibilitySettings } from '@/context/AuthContext';
import { Switch } from '@/components/ui/switch';
import { Shield, Lock, Unlock, Banknote } from 'lucide-react';
import { Button } from '@/components/primitives';
import { paymentSettingsService, vietnamBanks } from '@/services/payment-settings.service';

export const SettingsPage: React.FC = () => {
  const { role, visibility, setVisibility } = useAuth();
  const [localSettings, setLocalSettings] = useState<VisibilitySettings>(visibility);

  // Bank settings state
  const [bankSettings, setBankSettings] = useState({
    bankCode: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
  });
  const [bankLoading, setBankLoading] = useState(false);
  const [bankError, setBankError] = useState('');
  const [bankSuccess, setBankSuccess] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [showPinInput, setShowPinInput] = useState(true);
  const [pinError, setPinError] = useState('');
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => {
    setLocalSettings(visibility);
    loadBankSettings();
  }, [visibility]);

  const loadBankSettings = async () => {
    try {
      const settings = await paymentSettingsService.getSettings();
      if (settings) {
        setBankSettings({
          bankCode: settings.bank_code || '',
          bankName: settings.bank_name || '',
          accountNumber: settings.account_number || '',
          accountName: settings.account_name || '',
        });
        setHasPin(!!settings.pin_hash);
      } else {
        setHasPin(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = (key: keyof VisibilitySettings) => {
    const updated = { ...localSettings, [key]: !localSettings[key] };
    setLocalSettings(updated);
    setVisibility(updated);
  };

  const handleVerifyPin = async () => {
    if (!pinInput) {
      setPinError('Vui lòng nhập PIN');
      return;
    }
    try {
      const valid = await paymentSettingsService.verifyPin(pinInput);
      if (valid) {
        setPinVerified(true);
        setShowPinInput(false);
        setPinError('');
        setPinInput('');
        setBankSuccess('');
      } else {
        setPinError('PIN không đúng. Vui lòng thử lại.');
      }
    } catch (err) {
      setPinError('Lỗi xác minh PIN');
    }
  };

  const handleSetPin = async () => {
    if (!pinInput || pinInput.length < 4) {
      setPinError('PIN phải có ít nhất 4 số');
      return;
    }
    try {
      await paymentSettingsService.setPin(pinInput);
      setHasPin(true);
      setPinVerified(true);
      setShowPinInput(false);
      setPinInput('');
      setPinError('');
      setBankSuccess('✅ Đã tạo PIN thành công!');
    } catch (err: any) {
      setPinError(err.message || 'Lỗi tạo PIN');
    }
  };

  const handleSaveBank = async () => {
    if (!bankSettings.bankCode || !bankSettings.accountNumber || !bankSettings.accountName) {
      setBankError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setBankLoading(true);
    setBankError('');
    setBankSuccess('');
    try {
      await paymentSettingsService.saveSettings({
        bank_code: bankSettings.bankCode,
        bank_name: bankSettings.bankName,
        account_number: bankSettings.accountNumber,
        account_name: bankSettings.accountName,
      });
      setBankSuccess('✅ Đã lưu cấu hình thành công!');
      setPinVerified(false);
      setShowPinInput(true);
    } catch (err: any) {
      setBankError(err.message || 'Lỗi lưu cấu hình');
    } finally {
      setBankLoading(false);
    }
  };

  if (role !== 'admin') {
    return (
      <div className="p-6 text-center text-slate-500">
        <p className="text-sm">Bạn không có quyền truy cập cài đặt.</p>
      </div>
    );
  }

  const modules: { key: keyof VisibilitySettings; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'pos', label: 'POS' },
    { key: 'customers', label: 'Khách hàng' },
    { key: 'operations', label: 'Vận hành' },
    { key: 'catalog', label: 'Danh mục' },
    { key: 'inventory', label: 'Tồn kho' },
    { key: 'staff', label: 'Nhân viên' },
    { key: 'payroll', label: 'Bảng lương' },
    { key: 'expenses', label: 'Chi phí' },
    { key: 'settings', label: 'Cài đặt' },
  ];

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Quyền & Hiển thị */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <Shield className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Quyền & Hiển thị</h2>
        </div>
        <div className="space-y-3">
          {modules.map((mod) => (
            <div key={mod.key} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-sm font-medium text-slate-700">{mod.label}</span>
              <Switch
                checked={localSettings[mod.key]}
                onCheckedChange={() => handleToggle(mod.key)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Thanh toán chuyển khoản */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <Banknote className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">Thanh toán chuyển khoản</h2>
        </div>

        {showPinInput ? (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              {hasPin ? '🔒 Khu vực bảo mật - Nhập PIN quản lý' : '🔐 Thiết lập PIN quản lý lần đầu'}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {hasPin ? 'PIN quản lý' : 'Tạo PIN mới (4-6 số)'}
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nhập PIN..."
                />
                <Button
                  variant="secondary"
                  onClick={hasPin ? handleVerifyPin : handleSetPin}
                >
                  {hasPin ? 'Xác nhận' : 'Tạo PIN'}
                </Button>
              </div>
              {pinError && <p className="text-sm text-red-600 mt-1">{pinError}</p>}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700 flex items-center gap-2">
              <Unlock className="w-4 h-4" />
              ✅ Đã xác minh PIN - Bạn có thể cập nhật thông tin ngân hàng
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ngân hàng</label>
              <select
                value={bankSettings.bankCode}
                onChange={(e) => {
                  const selected = vietnamBanks.find(b => b.code === e.target.value);
                  setBankSettings({
                    ...bankSettings,
                    bankCode: e.target.value,
                    bankName: selected ? selected.name : '',
                  });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Chọn ngân hàng --</option>
                {vietnamBanks.map(b => (
                  <option key={b.code} value={b.code}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Số tài khoản</label>
              <input
                type="text"
                value={bankSettings.accountNumber}
                onChange={(e) => setBankSettings({ ...bankSettings, accountNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="Nhập số tài khoản"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tên chủ tài khoản</label>
              <input
                type="text"
                value={bankSettings.accountName}
                onChange={(e) => setBankSettings({ ...bankSettings, accountName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="Nhập tên chủ tài khoản"
              />
            </div>

            {bankError && <p className="text-sm text-red-600">{bankError}</p>}
            {bankSuccess && <p className="text-sm text-emerald-600">{bankSuccess}</p>}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleSaveBank}
                isLoading={bankLoading}
              >
                💾 Lưu cấu hình
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPinVerified(false);
                  setShowPinInput(true);
                  setPinInput('');
                  setBankSuccess('');
                }}
              >
                🔒 Khóa lại
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;