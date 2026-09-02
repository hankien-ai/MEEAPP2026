// src/pages/LoyaltyPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { settingsService } from '@/services/settings.service';
import { Button, Card, Input, Select } from '@/components/primitives';
import { Switch } from '@/components/ui/switch';
import { Gift, Save } from 'lucide-react';
import { getRedeemableItems, updateRedeemConfig, getRedeemConfig, checkExpiryOnLoad } from '@/services/loyalty.service';
import type { LoyaltyConfig, LoyaltyMode } from '@/types/loyalty';

const defaultConfig: LoyaltyConfig = {
  enabled: false,
  mode: 'OFF',
  sessions_required: 5,
  sessions_reward: 1,
  amount_per_point: 100000,
  points_per_amount: 10,
  expiry_months: null,
};

export default function LoyaltyPage() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<LoyaltyConfig>(defaultConfig);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [redeemConfigs, setRedeemConfigs] = useState<Record<string, { points_required: number; is_active: boolean }>>({});

  useEffect(() => {
    loadConfig();
    loadCatalog();
    // 👇 GỌI EXPIRY KHI MỞ TRANG (chỉ admin)
    if (isAdmin) {
      checkExpiryOnLoad();
    }
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const saved = await settingsService.getConfig('loyalty_config');
      if (saved) setConfig({ ...defaultConfig, ...saved });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCatalog = async () => {
    try {
      const items = await getRedeemableItems('POINTS');
      setCatalogItems(items);
      // Load configs
      const configs: Record<string, any> = {};
      for (const item of items) {
        const cfg = await getRedeemConfig(item.id);
        if (cfg) {
          configs[item.id] = { points_required: cfg.points_required, is_active: cfg.is_active };
        }
      }
      setRedeemConfigs(configs);
    } catch (err) {
      console.error(err);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await settingsService.setConfig('loyalty_config', config);
      alert('✅ Đã lưu cấu hình Loyalty!');
    } catch (err: any) {
      alert(err.message || '❌ Lỗi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  const handleRedeemConfigChange = async (catalogItemId: string, pointsRequired: number | null, isActive: boolean) => {
    try {
      await updateRedeemConfig(catalogItemId, pointsRequired, isActive);
      // Refresh configs
      const cfg = await getRedeemConfig(catalogItemId);
      setRedeemConfigs(prev => ({
        ...prev,
        [catalogItemId]: cfg ? { points_required: cfg.points_required, is_active: cfg.is_active } : { points_required: 0, is_active: false },
      }));
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật cấu hình đổi điểm');
    }
  };

  if (!isAdmin) {
    return <div className="p-6 text-center text-slate-500">Bạn không có quyền truy cập.</div>;
  }

  if (loading) return <div className="p-6 text-center">Đang tải...</div>;

  const mode = config.mode;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20">
      <div className="flex items-center gap-3 border-b pb-3">
        <Gift className="w-8 h-8 text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Loyalty Settings</h1>
          <p className="text-sm text-slate-500">Cấu hình chương trình khách hàng thân thiết</p>
        </div>
      </div>

      {/* General */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Bật Loyalty</p>
              <p className="text-xs text-slate-500">Kích hoạt chương trình</p>
            </div>
            <Switch checked={config.enabled} onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })} />
          </div>

          {config.enabled && (
            <div>
              <label className="block text-sm font-medium text-slate-700">Chế độ Loyalty</label>
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
          )}

          {config.enabled && config.mode === 'SESSIONS' && (
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border">
              <div>
                <label className="block text-xs font-semibold text-slate-600">Số buổi cần tích</label>
                <Input
                  type="number"
                  min={1}
                  value={config.sessions_required}
                  onChange={(e) => setConfig({ ...config, sessions_required: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">Số buổi được tặng</label>
                <Input
                  type="number"
                  min={1}
                  value={config.sessions_reward}
                  onChange={(e) => setConfig({ ...config, sessions_reward: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {config.enabled && config.mode === 'POINTS' && (
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border">
              <div>
                <label className="block text-xs font-semibold text-slate-600">Mỗi (VNĐ)</label>
                <Input
                  type="number"
                  min={1}
                  value={config.amount_per_point}
                  onChange={(e) => setConfig({ ...config, amount_per_point: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">Nhận (điểm)</label>
                <Input
                  type="number"
                  min={1}
                  value={config.points_per_amount}
                  onChange={(e) => setConfig({ ...config, points_per_amount: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {config.enabled && (
            <div>
              <label className="block text-sm font-medium text-slate-700">Thời hạn điểm/buổi</label>
              <Select
                value={config.expiry_months === null ? 'none' : String(config.expiry_months)}
                onChange={(e: any) => {
                  const val = e.target.value;
                  setConfig({ ...config, expiry_months: val === 'none' ? null : Number(val) });
                }}
                className="w-full mt-1"
              >
                <option value="none">Không hết hạn</option>
                <option value="3">3 tháng</option>
                <option value="6">6 tháng</option>
                <option value="12">12 tháng</option>
              </Select>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={saveConfig} isLoading={saving} className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" /> Lưu cấu hình
            </Button>
          </div>
        </div>
      </Card>

      {/* Redeem Config (chỉ POINTS) */}
      {config.enabled && config.mode === 'POINTS' && (
        <Card>
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 border-b pb-2">Cấu hình đổi điểm</h3>
            <p className="text-xs text-slate-500">Chọn Service/Product được phép đổi điểm và số điểm cần</p>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {catalogItems.map((item) => {
                const cfg = redeemConfigs[item.id] || { points_required: 0, is_active: false };
                return (
                  <div key={item.id} className="flex items-center gap-3 p-2 border rounded-lg hover:bg-slate-50">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.item_type} • {new Intl.NumberFormat('vi-VN').format(item.price)}đ</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={cfg.is_active}
                        onChange={(e) => handleRedeemConfigChange(item.id, cfg.points_required || 100, e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                      <Input
                        type="number"
                        min={1}
                        value={cfg.points_required || ''}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val > 0) {
                            handleRedeemConfigChange(item.id, val, cfg.is_active);
                          }
                        }}
                        className="w-20 text-center"
                        placeholder="điểm"
                        disabled={!cfg.is_active}
                      />
                    </div>
                  </div>
                );
              })}
              {catalogItems.length === 0 && (
                <div className="text-center text-slate-400 py-4">Chưa có Service/Product nào.</div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}