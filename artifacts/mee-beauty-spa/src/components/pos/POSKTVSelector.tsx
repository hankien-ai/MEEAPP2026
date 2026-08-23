import React, { useState } from "react";
import { Staff, KTVSplit } from "@/types/pos";
import { X, Plus, User, Settings, Equal } from "lucide-react";

interface Props {
  staffList: Staff[];
  selectedSplits: KTVSplit[];
  onSplitsChange: (splits: KTVSplit[]) => void;
  totalCommission: number;
}

export const POSKTVSelector: React.FC<Props> = ({
  staffList,
  selectedSplits,
  onSplitsChange,
  totalCommission,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [tempStaffId, setTempStaffId] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false); // true: hiển thị input %, false: chỉ hiển thị đã chia đều

  const availableStaff = staffList.filter(
    (s) => !selectedSplits.some((split) => split.staff_id === s.id)
  );

  const totalShare = selectedSplits.reduce((sum, s) => sum + s.share_percent, 0);
  const remainingPercent = Math.max(0, 100 - totalShare);

  const formatVND = (val: number) => new Intl.NumberFormat("vi-VN").format(val) + " đ";

  // Hàm chia đều cho tất cả KTV hiện có
  const handleSplitEqually = () => {
    if (selectedSplits.length === 0) return;
    const equalShare = Math.floor(100 / selectedSplits.length);
    const remainder = 100 - equalShare * selectedSplits.length;
    const newSplits = selectedSplits.map((split, index) => ({
      ...split,
      share_percent: index === 0 ? equalShare + remainder : equalShare,
    }));
    onSplitsChange(newSplits);
  };

  // Thêm KTV mới với chia đều tự động
  const handleAdd = () => {
    if (!tempStaffId) return;
    const staff = staffList.find((s) => s.id === tempStaffId);
    if (!staff) return;

    // Tính số KTV mới
    const newCount = selectedSplits.length + 1;
    const equalShare = Math.floor(100 / newCount);
    const remainder = 100 - equalShare * newCount;

    // Tạo danh sách mới: các KTV cũ + KTV mới, chia đều
    const newSplits = [
      ...selectedSplits.map((s) => ({
        ...s,
        share_percent: equalShare,
      })),
      {
        staff_id: staff.id,
        staff_name: staff.full_name,
        share_percent: equalShare + remainder, // cộng phần dư vào KTV cuối
      },
    ];
    onSplitsChange(newSplits);
    setTempStaffId("");
    setIsAdding(false);
    setIsCustomMode(false); // khi thêm mới, tự động về chế độ chia đều
  };

  const handleRemove = (index: number) => {
    if (selectedSplits.length <= 1) {
      alert("Phải có ít nhất 1 KTV");
      return;
    }
    const newSplits = selectedSplits.filter((_, i) => i !== index);
    // Tự động chia đều lại sau khi xóa
    const equalShare = Math.floor(100 / newSplits.length);
    const remainder = 100 - equalShare * newSplits.length;
    const rebalanced = newSplits.map((s, idx) => ({
      ...s,
      share_percent: idx === 0 ? equalShare + remainder : equalShare,
    }));
    onSplitsChange(rebalanced);
    if (!isCustomMode) setIsCustomMode(false);
  };

  const handleShareChange = (index: number, newShare: number) => {
    if (!isCustomMode) {
      // Nếu chưa bật chế độ tùy chỉnh, bật lên
      setIsCustomMode(true);
    }
    const newSplits = [...selectedSplits];
    const diff = newShare - newSplits[index].share_percent;
    const newTotal = totalShare + diff;
    if (newTotal > 100) {
      alert(`Tổng tỷ lệ không được vượt quá 100%`);
      return;
    }
    if (newShare < 0) return;
    newSplits[index].share_percent = newShare;
    onSplitsChange(newSplits);
  };

  // Khi số lượng KTV là 1, hiển thị 100% và không cho chỉnh sửa
  if (selectedSplits.length === 1) {
    return (
      <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-sm font-medium text-slate-800">{selectedSplits[0].staff_name || "KTV"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">100%</span>
          <span className="text-xs font-medium text-emerald-700">{formatVND(totalCommission)}</span>
          {staffList.length > 1 && (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="p-1 text-emerald-600 hover:text-emerald-800"
              title="Thêm KTV"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {selectedSplits.map((split, index) => {
        const commAmount = Math.round((totalCommission * split.share_percent) / 100);
        return (
          <div key={index} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <div className="flex-1 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-sm font-medium text-slate-800">{split.staff_name || "KTV"}</span>
            </div>
            <div className="flex items-center gap-2">
              {isCustomMode ? (
                <input
                  type="number"
                  value={split.share_percent}
                  onChange={(e) => handleShareChange(index, Number(e.target.value))}
                  className="w-14 text-center p-1 border border-slate-300 rounded text-xs font-semibold"
                  min={0}
                  max={100}
                />
              ) : (
                <span className="text-xs font-semibold text-slate-700 min-w-[32px] text-center">{split.share_percent}%</span>
              )}
              <span className="text-xs text-slate-500">%</span>
              <span className="text-xs font-medium text-emerald-700 min-w-[60px] text-right">
                {formatVND(commAmount)}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-1 text-slate-400 hover:text-red-600"
                title="Xóa KTV"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-between text-xs flex-wrap gap-2">
        <span className="text-slate-500">Tổng: {totalShare}%</span>
        <span className="text-slate-500">Còn: {remainingPercent}%</span>
        <div className="flex items-center gap-1">
          {!isCustomMode && selectedSplits.length > 1 && (
            <button
              type="button"
              onClick={() => setIsCustomMode(true)}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-0.5 text-[11px] font-medium"
            >
              <Settings className="w-3 h-3" /> Tùy chỉnh
            </button>
          )}
          {isCustomMode && (
            <button
              type="button"
              onClick={() => {
                handleSplitEqually();
                setIsCustomMode(false);
              }}
              className="text-emerald-600 hover:text-emerald-800 flex items-center gap-0.5 text-[11px] font-medium"
            >
              <Equal className="w-3 h-3" /> Chia đều
            </button>
          )}
          {staffList.length > selectedSplits.length && (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="text-emerald-600 font-semibold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm KTV
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-emerald-200">
          <select
            value={tempStaffId}
            onChange={(e) => setTempStaffId(e.target.value)}
            className="flex-1 p-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Chọn KTV...</option>
            {availableStaff.map((s) => (
              <option key={s.id} value={s.id}>{s.full_name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAdd}
            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700"
          >
            Thêm
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {totalShare !== 100 && selectedSplits.length > 0 && (
        <div className="text-[10px] text-amber-600 bg-amber-50 p-1 rounded text-center">
          ⚠️ Tổng tỷ lệ phải bằng 100% mới được thanh toán
        </div>
      )}
    </div>
  );
};