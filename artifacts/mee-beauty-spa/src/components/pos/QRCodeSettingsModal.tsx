import React, { useState } from "react";
import { X, QrCode, Lock, Save } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentQrUrl?: string;
  onSave: (url: string) => void;
}

export const QRCodeSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentQrUrl = "",
  onSave,
}) => {
  const [pin, setPin] = useState("");
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [qrUrl, setQrUrl] = useState(currentQrUrl);
  const [pinError, setPinError] = useState("");

  // Mặc định pin là 1234 (có thể thay đổi sau)
  const DEFAULT_PIN = "1234";

  const handleVerifyPin = () => {
    if (pin === DEFAULT_PIN) {
      setIsPinVerified(true);
      setPinError("");
    } else {
      setPinError("Sai mã PIN. Vui lòng thử lại.");
    }
  };

  const handleSave = () => {
    onSave(qrUrl);
    onClose();
    setPin("");
    setIsPinVerified(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-600" />
            Cài đặt mã QR thanh toán
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isPinVerified ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded-lg text-xs">
              <Lock className="w-4 h-4" />
              <span>Nhập mã PIN để truy cập cài đặt</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mã PIN</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Nhập PIN (mặc định: 1234)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyPin()}
              />
              {pinError && <p className="text-xs text-red-500 mt-1">{pinError}</p>}
            </div>
            <button
              onClick={handleVerifyPin}
              className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700"
            >
              Xác nhận
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg">
              ✅ Đã xác nhận PIN. Bạn có thể cập nhật mã QR.
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL mã QR (ví dụ: https://img.vietqr.io/image/...)
              </label>
              <input
                type="text"
                value={qrUrl}
                onChange={(e) => setQrUrl(e.target.value)}
                placeholder="Nhập link ảnh mã QR..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Nhập đường dẫn đến ảnh mã QR để hiển thị khi thanh toán chuyển khoản.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setPin(""); setIsPinVerified(false); }}
                className="flex-1 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Quay lại
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 flex items-center justify-center gap-1"
              >
                <Save className="w-4 h-4" />
                Lưu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};