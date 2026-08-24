import React, { useState, useEffect } from 'react';
import { payrollService } from '../services/payroll.service';
import { Button, Card, Input, Switch, Spinner } from '../components/primitives';

export const SalarySettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [allowedLeaveDays, setAllowedLeaveDays] = useState(2);
  const [attendanceEnabled, setAttendanceEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await payrollService.getSettings();
      setSettings(data);
      setAllowedLeaveDays(data.default_allowed_leave_days || 2);
      setAttendanceEnabled(data.attendance_enabled !== false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await payrollService.updateSettings(settings.organization_id, settings.branch_id, {
        default_allowed_leave_days: allowedLeaveDays,
        attendance_enabled: attendanceEnabled,
      });
      setMessage({ type: 'success', text: 'Đã lưu cài đặt thành công!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Lỗi lưu cài đặt' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner className="py-8" />;

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">Cài đặt lương</h1>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Số ngày nghỉ được phép (mỗi tháng)</label>
            <Input
              type="number"
              value={allowedLeaveDays}
              onChange={(e) => setAllowedLeaveDays(Number(e.target.value))}
              min={0}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Mặc định: 2 ngày</p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Bật chấm công</span>
            <Switch checked={attendanceEnabled} onChange={setAttendanceEnabled} />
          </div>

          <Button variant="primary" onClick={handleSave} isLoading={saving} className="w-full">
            Lưu cài đặt
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SalarySettingsPage;