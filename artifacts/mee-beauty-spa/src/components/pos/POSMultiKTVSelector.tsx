import React, { useState } from "react";
import { Staff } from "@/types/pos";
import { X, Plus, User } from "lucide-react";

interface KTVSplit {
  staff_id: string;
  staff_name?: string;
  share_percent: number;
}

interface Props {
  staffList: Staff[];
  selectedSplits: KTVSplit[];
  onSplitsChange: (splits: KTVSplit[]) => void;
  totalCommission: number; // tổng commission KTV cần chia
}

export const POSMultiKTVSelector: React.FC<Props> = ({
  staffList,
  selectedSplits,
  onSplitsChange,
  totalCommission,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [tempStaffId, setTempStaffId] = useState("");
  const [tempShare, setTempShare] = useState<number>(0);

  const availableStaff = staffList.filter(
    (s) => !selectedSplits.some((split) => split.staff_id === s.id)
  );

  const totalShare = selectedSplits.reduce((sum, s) => sum + s.share_percent, 0);
  const remainingPercent = Math.max(0, 100 - totalShare);

  const handleAdd = () => {
    if (!tempStaffId || tempShare <= 0) return;
    if (totalShare + tempShare > 100) {
      alert(`Tổng tỷ lệ không được vượt quá 100%. Còn ${remainingPercent}%`);
      return;
    }
    const staff = staffList.find((s) => s.id === tempStaffId);
    onSplitsChange([
      ...selectedSplits,
      {
        staff_id: tempStaffId,
        staff_name: staff?.full_name,
        share_percent: tempShare,
      },
    ]);
    setTempStaffId("");
    setTempShare(0);
    setIsAdding(false);
  };

  const handleRemove = (index: number) => {
    const newSplits = selectedSplits.filter((_, i) => i !== index);
    onSplitsChange(newSplits);
  };

  const handleShareChange = (index: number, newShare: number) => {
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

  const formatVND = (val: number) => new Intl.NumberFormat("vi-VN").format(val) + " đ";

  if (selectedSplits.length === 0) {
    return (
      <div className="p-2 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center">
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1 hover:underline"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm KTV thực hiện
        </button>
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
              <input
                type="number"
                value={split.share_percent}
                onChange={(e) => handleShareChange(index, Number(e.target.value))}
                className="w-14 text-center p-1 border border-slate-300 rounded text-xs font-semibold"
                min={0}
                max={100}
              />
              <span className="text-xs text-slate-500">%</span>
              <span className="text-xs font-medium text-emerald-700 min-w-[60px] text-right">
                {formatVND(commAmount)}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-1 text-slate-400 hover:text-red-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Tổng: {totalShare}%</span>
        <span className="text-slate-500">Còn: {remainingPercent}%</span>
        {remainingPercent > 0 && (
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
          <input
            type="number"
            value={tempShare}
            onChange={(e) => setTempShare(Number(e.target.value))}
            placeholder="%"
            className="w-14 text-center p-1 border border-slate-300 rounded text-xs"
            min={0}
            max={remainingPercent}
          />
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