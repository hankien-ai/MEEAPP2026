// src/pages/LoyaltyPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { settingsService } from '@/services/settings.service';
import { notificationService } from '@/services/notification.service';
import { supabase } from '@/services/supabase';
import { Button, Card, Input, Select, Switch } from '@/components/primitives';
import { Search, Bell, Gift } from 'lucide-react';

type LoyaltyMode = 'OFF' | 'SESSIONS' | 'POINTS';

interface LoyaltyConfig {
  enabled: boolean;
  mode: LoyaltyMode;
  sessions_required: number;
  sessions_reward: number;
  points_per_amount: number;
  amount_per_point: number;
}

const defaultConfig: LoyaltyConfig = {
  enabled: false,
  mode: 'OFF',
  sessions_required: 5,
  sessions_reward: 1,
  points_per_amount: 10,
  amount_per_point: 100000,
};

export default function LoyaltyPage() {
  const { isAdmin, currentStaff } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<LoyaltyConfig>(defaultConfig);

  // State cho notification
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    loadConfig();
    loadCustomers();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const saved = await settingsService.getConfig('loyalty_config');
      if (saved) {
        setConfig({ ...defaultConfig, ...saved });
      }
    } catch (err) {
      console.error('Lỗi tải cấu hình Loyalty:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    const { data } = await supabase
      .from('customers')
      .select('id, full_name, phone')
      .order('full_name', { ascending: true })
      .limit(100);
    if (data) setCustomers(data);
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await settingsService.setConfig('loyalty_config', config);
      alert('Đã lưu cấu hình Loyalty thành công!');
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  const handleSendNotification = async () => {
    if (!selectedCustomerId) {
      alert('Vui lòng chọn khách hàng');
      return;
    }

    setNotifyLoading(true);
    try {
      const customer = customers.find(c => c.id === selectedCustomerId);
      const name = customer?.full_name || 'Khách hàng';
      const message = customMessage || `🎁 ${name} đã đủ điều kiện nhận thưởng Loyalty.`;

      // Lấy tất cả staff active để gửi notification
      const { data: staffs } = await supabase
        .from('staff')
        .select('id')
        .eq('status', 'ACTIVE');

      if (!staffs || staffs.length === 0) {
        alert('Không có nhân viên nào để nhận thông báo');
        return;
      }

      for (const staff of staffs) {
        await notificationService.createNotification({
          staff_id: staff.id,
          type: 'LOYALTY',
          title: '🎁 Loyalty - Đủ điều kiện nhận thưởng',
          message: message,
          reference_type: 'customer',
          reference_id: selectedCustomerId,
        });
      }

      alert(`Đã gửi thông báo cho ${staffs.length} nhân viên.`);
      setSelectedCustomerId('');
      setSelectedCustomerName('');
      setCustomMessage('');
    } catch (err: any) {
      alert(err.message || 'Lỗi gửi thông báo');
    } finally {
      setNotifyLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.full_name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    c.phone?.includes(searchCustomer)
  );

  if (!isAdmin) {
    return (
      <div className="p-6 text-center text-slate-500">
        <p className="text-sm">Bạn không có quyền truy cập trang này.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center text-slate-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3 border-b pb-3">
        <Gift className="w-8 h-8 text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Loyalty Settings</h1>
          <p className="text-sm text-slate-500">Cấu hình chương trình khách hàng thân thiết</p>
        </div>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Bật Loyalty</p>
              <p className="text-xs text-slate-500">Cho phép kích hoạt chương trình</p>
            </div>
            <Switch
              checked={config.enabled}
              onChange={(checked) => setConfig({ ...config, enabled: checked })}
            />
          </div>

          {config.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700">Chọn mô hình</label>
                <Select
                  value={config.mode}
                  onChange={(e: any) => setConfig({ ...config, mode: e.target.value as LoyaltyMode })}
                  className="w-full mt-1"
                >
                  <option value="OFF">Tắt</option>
                  <option value="SESSIONS">Tích buổi</option>
                  <option value="POINTS">Tích điểm</option>
                </Select>
              </div>

              {config.mode === 'SESSIONS' && (
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">
                      Tích đủ số buổi
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={config.sessions_required}
                      onChange={(e) =>
                        setConfig({ ...config, sessions_required: Number(e.target.value) })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">
                      Được tặng số buổi
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={config.sessions_reward}
                      onChange={(e) =>
                        setConfig({ ...config, sessions_reward: Number(e.target.value) })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-2 text-xs text-slate-500">
                    💡 Quy tắc: Khi khách đạt đủ số buổi, sẽ được tặng một buổi dịch vụ có giá thấp nhất.
                  </div>
                </div>
              )}

              {config.mode === 'POINTS' && (
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">
                      Mỗi (VNĐ)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={config.amount_per_point}
                      onChange={(e) =>
                        setConfig({ ...config, amount_per_point: Number(e.target.value) })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">
                      Nhận (điểm)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={config.points_per_amount}
                      onChange={(e) =>
                        setConfig({ ...config, points_per_amount: Number(e.target.value) })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-2 text-xs text-slate-500">
                    💡 Ví dụ: 100.000đ → 10 điểm. Có thể cấu hình quy đổi sau.
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end">
            <Button
              onClick={saveConfig}
              isLoading={saving}
              className="w-full sm:w-auto"
            >
              Lưu cấu hình
            </Button>
          </div>
        </div>
      </Card>

      {/* Khu vực tạo thông báo thủ công */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-slate-800">Tạo thông báo thủ công</h3>
            <span className="text-xs text-slate-400 ml-auto">Gửi đến tất cả nhân viên</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Chọn khách hàng</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm theo tên hoặc số điện thoại..."
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
              />
              {searchCustomer && filteredCustomers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredCustomers.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedCustomerId(c.id);
                        setSelectedCustomerName(c.full_name);
                        setSearchCustomer('');
                        setCustomMessage(`🎁 ${c.full_name} đã đủ điều kiện nhận thưởng Loyalty.`);
                      }}
                      className="p-2 hover:bg-slate-50 cursor-pointer border-b last:border-0 text-sm"
                    >
                      {c.full_name} {c.phone && `(${c.phone})`}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedCustomerId && (
              <div className="mt-2 p-2 bg-emerald-50 rounded-xl text-sm text-emerald-700 flex items-center justify-between">
                <span>✅ Đã chọn: {selectedCustomerName}</span>
                <button
                  onClick={() => {
                    setSelectedCustomerId('');
                    setSelectedCustomerName('');
                    setCustomMessage('');
                  }}
                  className="text-red-500 text-xs"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Nội dung thông báo</label>
            <textarea
              rows={2}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Nhập nội dung thông báo..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <Button
            onClick={handleSendNotification}
            isLoading={notifyLoading}
            disabled={!selectedCustomerId}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Bell className="w-4 h-4 mr-2" /> Gửi thông báo
          </Button>

          <p className="text-xs text-slate-400 text-center">
            Thông báo sẽ xuất hiện trên Notification Bell của tất cả nhân viên.
            Bấm vào thông báo để mở hồ sơ khách hàng.
          </p>
        </div>
      </Card>
    </div>
  );
}