// src/components/loyalty/LoyaltyWallet.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getWallet, getTransactions, redeem, adjust, checkExpiryOnLoad } from '@/services/loyalty.service';
import { Button, Card, Badge } from '@/components/primitives';
import { Gift, History, Plus } from 'lucide-react';
import RedeemModal from './RedeemModal';
import AdjustmentModal from './AdjustmentModal';

interface LoyaltyWalletProps {
  customerId: string;
}

export default function LoyaltyWallet({ customerId }: LoyaltyWalletProps) {
  const { isAdmin, currentStaff } = useAuth();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showRedeem, setShowRedeem] = useState(false);
  const [showAdjustment, setShowAdjustment] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // 👇 KIỂM TRA EXPIRY TRƯỚC KHI LOAD WALLET
      await checkExpiryOnLoad();

      const [w, txs] = await Promise.all([
        getWallet(customerId),
        getTransactions(customerId, 20),
      ]);
      setWallet(w);
      setTransactions(txs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) loadData();
  }, [customerId]);

  const handleRedeemSuccess = () => {
    setShowRedeem(false);
    loadData();
  };

  const handleAdjustmentSuccess = () => {
    setShowAdjustment(false);
    loadData();
  };

  if (loading) return <div className="p-4 text-center text-slate-500">Đang tải...</div>;

  if (!wallet || !wallet.hasAccount) {
    return (
      <div className="p-6 text-center text-slate-400 border rounded-xl">
        <Gift className="w-12 h-12 mx-auto text-slate-300 mb-2" />
        <p>Khách hàng chưa có tài khoản Loyalty.</p>
      </div>
    );
  }

  const mode = wallet.mode;
  const balance = wallet.balance;
  const isEligible = wallet.isEligible;
  const sessionsRequired = wallet.sessions_required || 0;
  const progress = wallet.sessions_progress || 0;

  return (
    <div className="space-y-4">
      {/* Wallet Summary */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {mode === 'SESSIONS' ? '🎁 Tích buổi' : '⭐ Tích điểm'}
            </p>
            <div className="text-3xl font-bold text-slate-900 mt-1">
              {balance}
              <span className="text-sm font-normal text-slate-500 ml-1">
                {mode === 'SESSIONS' ? 'buổi' : 'điểm'}
              </span>
            </div>
            {mode === 'SESSIONS' && sessionsRequired > 0 && (
              <div className="mt-1 text-sm text-slate-600">
                Tiến trình: {progress} / {sessionsRequired} buổi
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (progress / sessionsRequired) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="text-right">
            {isEligible && (
              <Badge variant="success" className="text-sm px-3 py-1">
                ✅ Đủ điều kiện
              </Badge>
            )}
            {wallet.expires_at && (
              <div className="text-xs text-slate-400 mt-1">
                Hết hạn: {new Date(wallet.expires_at).toLocaleDateString('vi-VN')}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {isEligible && (
            <Button onClick={() => setShowRedeem(true)} className="flex-1 bg-purple-600 hover:bg-purple-700">
              <Gift className="w-4 h-4 mr-2" /> Đổi quà
            </Button>
          )}
          {isAdmin && (
            <Button variant="outline" onClick={() => setShowAdjustment(true)} className="flex-1">
              <Plus className="w-4 h-4 mr-1" /> Điều chỉnh
            </Button>
          )}
        </div>
      </Card>

      {/* Transaction History */}
      <div>
        <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <History className="w-4 h-4" /> Lịch sử
        </h4>
        {transactions.length === 0 ? (
          <p className="text-sm text-slate-400">Chưa có giao dịch</p>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center p-2 border-b border-slate-100 text-sm">
                <div>
                  <span className="font-medium">
                    {tx.transaction_type === 'EARN' && '➕ Tích'}
                    {tx.transaction_type === 'REDEEM' && '🎁 Đổi'}
                    {tx.transaction_type === 'ADJUSTMENT' && '✏️ Điều chỉnh'}
                    {tx.transaction_type === 'REVERSAL' && '↩️ Hoàn tác'}
                    {tx.transaction_type === 'EXPIRY' && '⏳ Hết hạn'}
                  </span>
                  {tx.note && <span className="text-xs text-slate-400 ml-2">({tx.note})</span>}
                  <div className="text-xs text-slate-400">{new Date(tx.created_at).toLocaleString('vi-VN')}</div>
                </div>
                <div className={`font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showRedeem && (
        <RedeemModal
          customerId={customerId}
          wallet={wallet}
          onClose={() => setShowRedeem(false)}
          onSuccess={handleRedeemSuccess}
          staffId={currentStaff?.id}
        />
      )}
      {showAdjustment && (
        <AdjustmentModal
          customerId={customerId}
          onClose={() => setShowAdjustment(false)}
          onSuccess={handleAdjustmentSuccess}
          staffId={currentStaff?.id}
        />
      )}
    </div>
  );
}