import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface PackageItem {
  package_item_id: string;
  service_id: string;
  service_name: string;
  remaining_quantity: number;
  total_quantity: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customerPackageId: string;
  packageItems: PackageItem[];
  onConfirm: (packageItemId: string, serviceId: string) => void;
  isSubmitting?: boolean;
}

export const POSPackageUsageModal: React.FC<Props> = ({
  isOpen,
  onClose,
  customerPackageId,
  packageItems,
  onConfirm,
  isSubmitting = false,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedItemId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedItem = packageItems.find((item) => item.package_item_id === selectedItemId);

  const handleConfirm = () => {
    if (!selectedItemId) return;
    const item = packageItems.find((i) => i.package_item_id === selectedItemId);
    if (item) {
      onConfirm(item.package_item_id, item.service_id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-slate-100 p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-800">Sử dụng gói dịch vụ</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-slate-500">Chọn dịch vụ muốn sử dụng từ gói:</div>

        <div className="space-y-2">
          {packageItems.length === 0 ? (
            <div className="text-center text-slate-400 text-sm p-4">Gói này không có dịch vụ nào</div>
          ) : (
            packageItems.map((item) => (
              <button
                key={item.package_item_id}
                onClick={() => setSelectedItemId(item.package_item_id)}
                className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                  selectedItemId === item.package_item_id
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 hover:border-slate-300"
                } ${item.remaining_quantity <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={item.remaining_quantity <= 0}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-sm text-slate-800">{item.service_name}</div>
                    <div className="text-xs text-slate-500">
                      Còn {item.remaining_quantity} / {item.total_quantity} buổi
                    </div>
                  </div>
                  {selectedItemId === item.package_item_id && (
                    <span className="text-emerald-600 text-xs font-bold">✓</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="flex gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={!selectedItemId || isSubmitting}
            onClick={handleConfirm}
            className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận sử dụng"}
          </button>
        </div>
      </div>
    </div>
  );
};