// src/components/loyalty/RedeemModal.tsx
import React, { useState, useEffect } from 'react';
import { getRedeemableItems, redeem } from '@/services/loyalty.service';
import { Button, Card } from '@/components/primitives';
import { X, Gift } from 'lucide-react';

interface Props {
  customerId: string;
  wallet: any;
  onClose: () => void;
  onSuccess: () => void;
  staffId?: string;
}

export default function RedeemModal({ customerId, wallet, onClose, onSuccess, staffId }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getRedeemableItems(wallet.mode);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!selectedItem) return;
    setSubmitting(true);
    try {
      const result = await redeem(customerId, selectedItem.id, staffId || '');
      if (result.success) {
        alert('✅ Đổi thưởng thành công!');
        onSuccess();
      } else {
        alert(result.error || '❌ Lỗi đổi thưởng');
      }
    } catch (err: any) {
      alert(err.message || '❌ Lỗi đổi thưởng');
    } finally {
      setSubmitting(false);
    }
  };

  const mode = wallet.mode;
  const balance = wallet.balance;

  // Lọc items theo mode
  let displayItems = items;
  if (mode === 'POINTS') {
    // Chỉ hiện items đã cấu hình và active
    displayItems = items.filter((item) => item.loyalty_redeem_config && item.loyalty_redeem_config.length > 0 && item.loyalty_redeem_config[0].is_active);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-600" /> Đổi quà
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 mb-3 p-3 bg-slate-50 rounded-xl">
          <p className="text-sm text-slate-600">
            {mode === 'SESSIONS' ? '🎁 Số buổi hiện có:' : '⭐ Điểm hiện có:'}
            <span className="font-bold text-purple-700 ml-2">{balance}</span>
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Đang tải...</div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-8 text-slate-400">Không có phần thưởng nào phù hợp.</div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {displayItems.map((item) => {
              const cfg = item.loyalty_redeem_config?.[0];
              const pointsRequired = cfg?.points_required || 0;
              const isEligible = mode === 'SESSIONS' ? balance >= wallet.sessions_required : balance >= pointsRequired;
              const isSelected = selectedItem?.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => isEligible && setSelectedItem(item)}
                  className={`p-3 border rounded-xl cursor-pointer transition-all ${isEligible ? 'hover:bg-slate-50' : 'opacity-50 cursor-not-allowed'
                    } ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-slate-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.item_type}</p>
                    </div>
                    <div className="text-right">
                      {mode === 'SESSIONS' ? (
                        <span className="text-xs font-semibold text-purple-600">
                          {wallet.sessions_required || 1} buổi
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-purple-600">
                          {pointsRequired} điểm
                        </span>
                      )}
                      {!isEligible && <div className="text-xs text-rose-500">Không đủ</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">Hủy</Button>
          <Button
            onClick={handleRedeem}
            disabled={!selectedItem || submitting}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            {submitting ? 'Đang xử lý...' : 'Xác nhận đổi'}
          </Button>
        </div>
      </div>
    </div>
  );
}