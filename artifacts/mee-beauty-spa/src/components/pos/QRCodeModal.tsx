// src/components/pos/QRCodeModal.tsx
import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  invoiceCode?: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  onConfirm: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  amount,
  invoiceCode,
  bankName,
  accountNumber,
  accountName,
  onConfirm,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const formatVND = (val: number) => new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  const transactionId = invoiceCode ? `MEE${invoiceCode.slice(0,6)}` : `MEE${Date.now().toString().slice(-6)}`;

  // Tạo QR từ API (không cần thư viện)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MEE%20${accountNumber}%20${transactionId}%20${amount}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-800">Thanh toán chuyển khoản</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <img src={qrUrl} alt="Mã QR thanh toán" width={200} height={200} className="w-48 h-48" />
          </div>

          <div className="w-full mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Số tiền:</span>
              <span className="font-bold text-emerald-700">{formatVND(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Ngân hàng:</span>
              <span className="font-medium">{bankName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Số TK:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold">{accountNumber}</span>
                <button onClick={handleCopy} className="text-blue-600 hover:text-blue-800" title="Sao chép">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Chủ TK:</span>
              <span className="font-medium">{accountName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Nội dung:</span>
              <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{transactionId}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 shadow-md transition-colors"
          >
            ✅ Xác nhận đã thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};