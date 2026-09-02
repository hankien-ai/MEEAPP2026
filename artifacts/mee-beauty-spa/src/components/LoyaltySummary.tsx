// src/components/loyalty/LoyaltySummary.tsx
import React from 'react';
import { Badge } from '@/components/primitives';
import { Star } from 'lucide-react';

interface LoyaltySummaryProps {
  balance: number;
  mode: string;
  isEligible: boolean;
  sessionsRequired?: number;
  onViewDetail: () => void;
}

export default function LoyaltySummary({
  balance,
  mode,
  isEligible,
  sessionsRequired = 0,
  onViewDetail,
}: LoyaltySummaryProps) {
  if (mode === 'OFF') return null;

  const unit = mode === 'SESSIONS' ? 'buổi' : 'điểm';
  const label = mode === 'SESSIONS' ? 'Tích buổi' : 'Tích điểm';

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-purple-600 font-medium">{label}</p>
            <p className="text-xl font-bold text-purple-800">
              {balance}
              <span className="text-sm font-normal text-purple-500 ml-1">{unit}</span>
            </p>
            {mode === 'SESSIONS' && sessionsRequired > 0 && (
              <div className="mt-1 text-xs text-purple-600">
                {balance} / {sessionsRequired} buổi
                <div className="w-full h-1.5 bg-purple-200 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (balance / sessionsRequired) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          {isEligible ? (
            <Badge variant="success" className="text-sm px-3 py-1">
              ✅ Đủ điều kiện
            </Badge>
          ) : (
            <Badge variant="neutral" className="text-sm px-3 py-1">
              Chưa đủ
            </Badge>
          )}
          <button
            onClick={onViewDetail}
            className="block text-xs text-indigo-600 hover:underline mt-1 font-medium"
          >
            Xem chi tiết →
          </button>
        </div>
      </div>
    </div>
  );
}