// src/pages/QRBankSettings.tsx
import React, { useState, useEffect } from 'react';
import { vietnamBanks, getBankConfig, saveBankConfig, BankConfig, defaultBankConfig } from '@/config/bank';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Select } from '@/components/primitives';
import { Check, X, Save, Trash2, Plus } from 'lucide-react';

export const QRBankSettingsPage: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  // State cho cài đặt hiện tại
  const [bankConfig, setBankConfig] = useState<BankConfig>(defaultBankConfig);
  const [showSuccess, setShowSuccess] = useState(false);

  // State cho danh sách ngân hàng tùy chỉnh (mở rộng sau)
  const [customBanks, setCustomBanks] = useState<BankConfig[]>([]);

  useEffect(() => {
    // Load config hiện tại
    const config = getBankConfig();
    setBankConfig(config);

    // Load danh sách ngân hàng tùy chỉnh (nếu có)
    try {
      const saved = localStorage.getItem('mee_custom_banks');
      if (saved) {
        setCustomBanks(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleSave = () => {
    saveBankConfig(bankConfig);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleChange = (field: keyof BankConfig, value: string) => {
    setBankConfig({ ...bankConfig, [field]: value });
  };

  // Khi chọn ngân hàng từ dropdown, tự động điền bankName
  const handleBankSelect = (bankCode: string) => {
    const bank = vietnamBanks.find(b => b.code === bankCode);
    if (bank) {
      setBankConfig({ ...bankConfig, bankCode, bankName: bank.name });
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6 text-center text-slate-500">
        <p>Bạn không có quyền truy cập trang này.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cài đặt QR thanh toán</h1>
          <p className="text-sm text-slate-500">Cấu hình thông tin ngân hàng cho QR chuyển khoản</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          <Save className="w-4 h-4" />
          Lưu
        </button>
      </div>

      {showSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          Đã lưu cài đặt thành công!
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="font-semibold text-slate-800">Thông tin ngân hàng</h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ngân hàng</label>
          <select
            value={bankConfig.bankCode}
            onChange={(e) => handleBankSelect(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
          >
            {vietnamBanks.map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name} ({bank.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tên ngân hàng (hiển thị)</label>
          <input
            type="text"
            value={bankConfig.bankName}
            onChange={(e) => handleChange('bankName', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Số tài khoản</label>
          <input
            type="text"
            value={bankConfig.accountNumber}
            onChange={(e) => handleChange('accountNumber', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            placeholder="VD: 1234567890"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Chủ tài khoản</label>
          <input
            type="text"
            value={bankConfig.accountName}
            onChange={(e) => handleChange('accountName', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            placeholder="VD: MEE BEAUTY SPA"
          />
        </div>
      </div>

      {/* Phần mở rộng: thêm ngân hàng tùy chỉnh (nếu cần) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Ngân hàng tùy chỉnh</h2>
          <button
            className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
          >
            <Plus className="w-4 h-4" />
            Thêm
          </button>
        </div>

        {customBanks.length === 0 ? (
          <p className="text-sm text-slate-400">Chưa có ngân hàng tùy chỉnh.</p>
        ) : (
          <div className="space-y-2">
            {customBanks.map((bank, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-sm">{bank.bankName} - {bank.accountNumber}</span>
                <div className="flex gap-1">
                  <button className="p-1 text-slate-400 hover:text-blue-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRBankSettingsPage;