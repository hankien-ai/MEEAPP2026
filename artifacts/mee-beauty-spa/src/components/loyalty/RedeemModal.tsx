// src/components/loyalty/RedeemModal.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getRedeemableItems, redeem } from '@/services/loyalty.service';
import { Button } from '@/components/primitives';
import { X, Gift } from 'lucide-react';

interface Props {
  customerId: string;
  wallet: any;
  onClose: () => void;
  onSuccess: () => void;
  staffId?: string;
}

export default function RedeemModal({ customerId, wallet, onClose, onSuccess, staffId: propStaffId }: Props) {
  const { currentStaff } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Lấy staffId từ prop hoặc context
  const staffId = propStaffId || currentStaff?.id;

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getRedeemableItems(wallet.mode);
      setItems(data);
    } catch (err) {
      console.error('Lỗi load items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!selectedItem) {
      alert('Vui lòng chọn phần thưởng.');
      return;
    }

    // Kiểm tra staffId trước khi gọi redeem
    const finalStaffId = staffId;
    if (!finalStaffId) {
      console.error('❌ staffId is null/undefined');
      alert('Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.');
      return;
    }

    console.log('🆔 staffId final:', finalStaffId);

    setSubmitting(true);
    try {
      const result = await redeem(customerId, selectedItem.id, finalStaffId);
      console.log('📦 Redeem result:', result);
      if (result.success) {
        alert('✅ Đổi thưởng thành công!');
        onSuccess();
      } else {
        alert(result.error || '❌ Lỗi đổi thưởng');
      }
    } catch (err: any) {
      console.error('❌ Redeem error:', err);
      alert(err.message || '❌ Lỗi đổi thưởng');
    } finally {
      setSubmitting(false);
    }
  };

  const mode = wallet.mode;
  const balance = wallet.balance;

  // SESSIONS: cần sessions_required để đổi 1 phần thưởng
  // POINTS: cần price của item
  const isEligible = (item: any) => {
    if (mode === 'SESSIONS') {
      return balance >= (wallet.sessions_required || 1);
    }
    // POINTS: so sánh balance >= price
    return balance >= (item.price || 0);
  };

  const displayItems = items.filter((item) => item.status === 'ACTIVE');

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
          {mode === 'SESSIONS' && (
            <p className="text-xs text-slate-500 mt-1">
              Cần <strong>{wallet.sessions_required || 1} buổi</strong> để đổi <strong>1 phần thưởng</strong>
            </p>
          )}
          {mode === 'POINTS' && (
            <p className="text-xs text-slate-500 mt-1">
              Giá trị mỗi điểm = 1đ. Bạn có thể đổi sản phẩm/dịch vụ có giá ≤ {balance} điểm.
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Đang tải...</div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-8 text-slate-400">Không có phần thưởng nào phù hợp.</div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {displayItems.map((item) => {
              const eligible = isEligible(item);
              const isSelected = selectedItem?.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => eligible && setSelectedItem(item)}
                  className={`p-3 border rounded-xl cursor-pointer transition-all ${
                    eligible ? 'hover:bg-slate-50' : 'opacity-50 cursor-not-allowed'
                  } ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-slate-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.item_type}</p>
                    </div>
                    <div className="text-right">
                      {!eligible && <div className="text-xs text-rose-500 font-medium">Không đủ</div>}
                      {eligible && <div className="text-xs text-emerald-500 font-medium">✅ Đủ</div>}
                    </div>
                  </div>
                  {mode === 'POINTS' && eligible && (
                    <div className="text-xs text-purple-600 mt-1">
                      Giá: {item.price} điểm
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Hủy
          </Button>
          <Button
            onClick={handleRedeem}
            disabled={!selectedItem || submitting || !staffId}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
          >
            {submitting ? 'Đang xử lý...' : 'Xác nhận đổi'}
          </Button>
        </div>

        {!staffId && (
          <p className="text-xs text-rose-500 mt-3 text-center">
            ⚠️ Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.
          </p>
        )}
      </div>
    </div>
  );
}