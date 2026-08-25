// src/pages/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth, VisibilitySettings } from '@/context/AuthContext';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, EyeOff } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { role, visibility, setVisibility } = useAuth();
  const [localSettings, setLocalSettings] = useState<VisibilitySettings>(visibility);

  useEffect(() => {
    setLocalSettings(visibility);
  }, [visibility]);

  const handleToggle = (key: keyof VisibilitySettings) => {
    const updated = { ...localSettings, [key]: !localSettings[key] };
    setLocalSettings(updated);
    setVisibility(updated);
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
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quyền & Hiển thị</h1>
          <p className="text-sm text-slate-500">Cấu hình module nhân viên được nhìn thấy</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Staff Visibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {modules.map((mod) => (
            <div key={mod.key} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-sm font-medium text-slate-700">{mod.label}</span>
              <Switch
                checked={localSettings[mod.key]}
                onCheckedChange={() => handleToggle(mod.key)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <p className="flex items-center gap-1">
          <EyeOff className="w-3.5 h-3.5" /> Khi tắt, module sẽ không xuất hiện trên thanh điều hướng của nhân viên.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;