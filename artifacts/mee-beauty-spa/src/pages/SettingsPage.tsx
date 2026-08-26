// src/pages/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth, VisibilitySettings } from '@/context/AuthContext';
import { Switch } from '@/components/ui/switch';
import { Shield, Lock, Unlock, Banknote, QrCode, Plus, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Button, Card, Modal, Input, Select } from '@/components/primitives';
import { paymentSettingsService, vietnamBanks } from '@/services/payment-settings.service';
import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from '@/services/supabase';

export const SettingsPage: React.FC = () => {
  const { role, visibility, setVisibility } = useAuth();
  const [localSettings, setLocalSettings] = useState<VisibilitySettings>(visibility);

  // Bank settings state (PIN + QR)
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

  // QR list
  const [qrList, setQrList] = useState<any[]>([]);
  const [qrLoading, setQrLoading] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [editingQrId, setEditingQrId] = useState<string | null>(null);
  const [qrForm, setQrForm] = useState({ bank_code: '', bank_name: '', account_number: '', account_name: '', label: '', is_default: false });
  const [qrError, setQrError] = useState('');
  const [qrSubmitting, setQrSubmitting] = useState(false);

  useEffect(() => {
    setLocalSettings(visibility);
    loadBankSettings();
    loadQRs();
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

  const loadQRs = async () => {
    setQrLoading(true);
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('branch_id', DEFAULT_BRANCH_ID)
      .order('is_default', { ascending: false });
    if (!error) setQrList(data || []);
    setQrLoading(false);
  };

  const handleToggle = (key: keyof VisibilitySettings) => {
    const updated = { ...localSettings, [key]: !localSettings[key] };
    setLocalSettings(updated);
    setVisibility(updated);
  };

  const handleVerifyPin = async () => {
    if (!pinInput) { setPinError('Vui lòng nhập PIN'); return; }
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
    if (!pinInput || pinInput.length < 4) { setPinError('PIN phải có ít nhất 4 số'); return; }
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
      await loadQRs();
    } catch (err: any) {
      setBankError(err.message || 'Lỗi lưu cấu hình');
    } finally {
      setBankLoading(false);
    }
  };

  // QR Handlers
  const openQrModal = (qr?: any) => {
    if (qr) {
      setEditingQrId(qr.id);
      setQrForm({
        bank_code: qr.bank_code,
        bank_name: qr.bank_name,
        account_number: qr.account_number,
        account_name: qr.account_name,
        label: qr.label || '',
        is_default: qr.is_default || false,
      });
    } else {
      setEditingQrId(null);
      setQrForm({ bank_code: '', bank_name: '', account_number: '', account_name: '', label: '', is_default: false });
    }
    setQrError('');
    setIsQrModalOpen(true);
  };

  const closeQrModal = () => {
    setIsQrModalOpen(false);
    setEditingQrId(null);
  };

  const handleSaveQr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrForm.bank_code || !qrForm.account_number || !qrForm.account_name) {
      setQrError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setQrSubmitting(true);
    setQrError('');
    try {
      const payload = {
        organization_id: DEFAULT_ORG_ID,
        branch_id: DEFAULT_BRANCH_ID,
        bank_code: qrForm.bank_code,
        bank_name: qrForm.bank_name,
        account_number: qrForm.account_number,
        account_name: qrForm.account_name,
        label: qrForm.label || qrForm.bank_name,
        is_default: qrForm.is_default,
      };

      if (editingQrId) {
        // Update
        const { error } = await supabase
          .from('payment_settings')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', editingQrId);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase.from('payment_settings').insert(payload);
        if (error) throw error;
      }

      // Nếu đặt mặc định, bỏ default của các QR khác
      if (qrForm.is_default) {
        await supabase
          .from('payment_settings')
          .update({ is_default: false })
          .eq('organization_id', DEFAULT_ORG_ID)
          .eq('branch_id', DEFAULT_BRANCH_ID)
          .neq('id', editingQrId || '');
      }

      await loadQRs();
      closeQrModal();
      setBankSuccess('✅ Cập nhật QR thành công!');
    } catch (err: any) {
      setQrError(err.message);
    } finally {
      setQrSubmitting(false);
    }
  };

  const handleDeleteQr = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa QR này?')) return;
    try {
      const { error } = await supabase.from('payment_settings').delete().eq('id', id);
      if (error) throw error;
      await loadQRs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSetDefaultQr = async (id: string) => {
    try {
      // Bỏ default của tất cả
      await supabase
        .from('payment_settings')
        .update({ is_default: false })
        .eq('organization_id', DEFAULT_ORG_ID)
        .eq('branch_id', DEFAULT_BRANCH_ID);
      // Set default cho id
      const { error } = await supabase
        .from('payment_settings')
        .update({ is_default: true })
        .eq('id', id);
      if (error) throw error;
      await loadQRs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatVND = (val: number) => new Intl.NumberFormat('vi-VN').format(val) + ' đ';

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

      {/* Thanh toán chuyển khoản + QR Management */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <Banknote className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">Thanh toán chuyển khoản & QR</h2>
        </div>

        {/* PIN verification */}
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
              ✅ Đã xác minh PIN - Bạn có thể cập nhật thông tin ngân hàng và quản lý QR
            </div>

            {/* Bank config */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên chủ tài khoản</label>
                <input
                  type="text"
                  value={bankSettings.accountName}
                  onChange={(e) => setBankSettings({ ...bankSettings, accountName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nhập tên chủ tài khoản"
                />
              </div>
            </div>
            {bankError && <p className="text-sm text-red-600">{bankError}</p>}
            {bankSuccess && <p className="text-sm text-emerald-600">{bankSuccess}</p>}
            <Button variant="secondary" onClick={handleSaveBank} isLoading={bankLoading}>
              💾 Lưu cấu hình ngân hàng
            </Button>

            {/* QR List */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <QrCode className="w-4 h-4" /> Danh sách QR
                </h3>
                <Button size="sm" variant="outline" onClick={() => openQrModal()}>
                  <Plus className="w-3.5 h-3.5" /> Thêm QR
                </Button>
              </div>
              {qrLoading ? (
                <div className="text-center py-4 text-sm text-slate-400">Đang tải...</div>
              ) : qrList.length === 0 ? (
                <div className="text-center py-4 text-sm text-slate-400">Chưa có QR nào.</div>
              ) : (
                <div className="space-y-2">
                  {qrList.map(qr => (
                    <div key={qr.id} className={`flex items-center justify-between p-3 rounded-lg border ${qr.is_default ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200'}`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{qr.label || qr.bank_name}</span>
                          {qr.is_default && <Badge variant="success" className="text-[10px]">Mặc định</Badge>}
                        </div>
                        <div className="text-xs text-slate-500">{qr.bank_name} - {qr.account_number}</div>
                        <div className="text-xs text-slate-400">Chủ TK: {qr.account_name}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!qr.is_default && (
                          <Button size="sm" variant="outline" onClick={() => handleSetDefaultQr(qr.id)} className="text-[10px]">
                            <CheckCircle className="w-3.5 h-3.5" /> Mặc định
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => openQrModal(qr)} className="p-1.5">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDeleteQr(qr.id)} className="p-1.5">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
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

      {/* QR Modal */}
      <Modal isOpen={isQrModalOpen} onClose={closeQrModal} title={editingQrId ? 'Sửa QR' : 'Thêm QR mới'}>
        <form onSubmit={handleSaveQr} className="space-y-4">
          {qrError && <div className="p-2 bg-red-50 text-red-700 text-sm rounded">{qrError}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tên QR (hiển thị)</label>
            <input
              type="text"
              value={qrForm.label}
              onChange={(e) => setQrForm({ ...qrForm, label: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              placeholder="VD: Vietcombank - MEE"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ngân hàng</label>
            <select
              value={qrForm.bank_code}
              onChange={(e) => {
                const bank = vietnamBanks.find(b => b.code === e.target.value);
                setQrForm({
                  ...qrForm,
                  bank_code: e.target.value,
                  bank_name: bank ? bank.name : '',
                });
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="">-- Chọn --</option>
              {vietnamBanks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Số tài khoản</label>
            <input
              type="text"
              value={qrForm.account_number}
              onChange={(e) => setQrForm({ ...qrForm, account_number: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              placeholder="VD: 1234567890"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Chủ tài khoản</label>
            <input
              type="text"
              value={qrForm.account_name}
              onChange={(e) => setQrForm({ ...qrForm, account_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              placeholder="VD: MEE BEAUTY SPA"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={qrForm.is_default}
              onChange={(e) => setQrForm({ ...qrForm, is_default: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300"
            />
            <label className="text-sm font-medium text-slate-700">Đặt làm mặc định</label>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={closeQrModal}>Hủy</Button>
            <Button type="submit" isLoading={qrSubmitting}>
              {editingQrId ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SettingsPage;