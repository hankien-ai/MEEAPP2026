// src/components/loyalty/AdjustmentModal.tsx
import React, { useState } from 'react';
import { adjust } from '@/services/loyalty.service';
import { Button, Input, Select } from '@/components/primitives';
import { X } from 'lucide-react';

interface Props {
  customerId: string;
  onClose: () => void;
  onSuccess: () => void;
  staffId?: string;
}

export default function AdjustmentModal({ customerId, onClose, onSuccess, staffId }: Props) {
  const [type, setType] = useState<'INCREASE' | 'DECREASE'>('INCREASE');
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (amount <= 0) {
      alert('Số lượng phải lớn hơn 0');
      return;
    }
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do');
      return;
    }

    setSubmitting(true);
    try {
      const finalAmount = type === 'INCREASE' ? amount : -amount;
      await adjust(customerId, finalAmount, reason.trim(), staffId || '');
      alert('✅ Điều chỉnh thành công!');
      onSuccess();
    } catch (err: any) {
      alert(err.message || '❌ Lỗi điều chỉnh');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold text-slate-900">Điều chỉnh Loyalty</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Loại</label>
            <Select
              value={type}
              onChange={(e: any) => setType(e.target.value)}
              className="w-full mt-1"
            >
              <option value="INCREASE">➕ Cộng</option>
              <option value="DECREASE">➖ Trừ</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Số lượng</label>
            <Input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Lý do *</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do điều chỉnh..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">Hủy</Button>
          <Button
            onClick={handleSubmit}
            isLoading={submitting}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            Xác nhận
          </Button>
        </div>
      </div>
    </div>
  );
}