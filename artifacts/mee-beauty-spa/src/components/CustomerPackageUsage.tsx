// src/components/CustomerPackageUsage.tsx

import React, { useState, useEffect } from "react";
import {
  fetchCustomerPackages,
  executePackageSession,
  fetchActiveStaff,
} from "../services/catalog-service";
import type { CustomerPackage, CustomerPackageItem } from "../types/catalog";

interface Props {
  customerId: string;
  organizationId: string;
}

export const CustomerPackageUsage: React.FC<Props> = ({
  customerId,
  organizationId,
}) => {
  const [packages, setPackages] = useState<CustomerPackage[]>([]);
  const [staffList, setStaffList] = useState<
    Array<{ id: string; full_name: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [selectedItem, setSelectedItem] = useState<{
    pkg: CustomerPackage;
    item: CustomerPackageItem;
  } | null>(null);
  const [performedBy, setPerformedBy] = useState("");
  const [note, setNote] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [pkgs, staff] = await Promise.all([
        fetchCustomerPackages(customerId),
        fetchActiveStaff(organizationId),
      ]);
      setPackages(pkgs);
      setStaffList(staff);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) loadData();
  }, [customerId]);

  const handleOpenExecuteModal = (
    pkg: CustomerPackage,
    item: CustomerPackageItem,
  ) => {
    setErrorMessage(null);
    setSelectedItem({ pkg, item });
    setPerformedBy(staffList[0]?.id || "");
    setNote("");
  };

  const handleConfirmExecute = async () => {
    if (!selectedItem) return;
    if (!performedBy) {
      setErrorMessage("Vui lòng chọn KTV thực hiện ca");
      return;
    }

    setExecuting(true);
    setErrorMessage(null);

    try {
      await executePackageSession({
        customer_package_id: selectedItem.pkg.id,
        service_id: selectedItem.item.service_id,
        performed_by: performedBy,
        note: note.trim() || undefined,
      });

      setSelectedItem(null);
      await loadData(); // Auto refresh quota
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi hệ thống khi trừ buổi dịch vụ");
    } finally {
      setExecuting(false);
    }
  };

  if (loading)
    return (
      <div className="p-4 text-center text-gray-500">
        Đang tải gói dịch vụ...
      </div>
    );

  return (
    <div className="w-full max-w-md mx-auto space-y-4 px-2 sm:px-0">
      <h2 className="text-lg font-bold text-gray-900">
        Gói Dịch Vụ Của Khách hàng
      </h2>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {errorMessage}
        </div>
      )}

      {packages.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          Khách hàng chưa sở hữu gói dịch vụ nào.
        </p>
      ) : (
        packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white border rounded-xl p-4 shadow-sm space-y-3"
          >
            {/* Header Gói */}
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <span className="font-semibold text-gray-800 text-base">
                  {pkg.package?.name || "Gói Dịch Vụ"}
                </span>
                <p className="text-xs text-gray-500">
                  Còn lại:{" "}
                  <strong className="text-blue-600">
                    {pkg.remaining_sessions}
                  </strong>{" "}
                  / {pkg.total_sessions} buổi
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  pkg.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {pkg.status}
              </span>
            </div>

            {/* Danh sách Dịch vụ Quota */}
            <div className="space-y-3">
              {pkg.items?.map((item) => {
                const serviceName =
                  item.service?.catalog_item?.name || "Dịch vụ";
                const serviceCode = item.service?.catalog_item?.code || "";
                const isExecutable =
                  pkg.status === "ACTIVE" && item.remaining_quantity > 0;

                return (
                  <div
                    key={item.id}
                    className="bg-gray-50 p-3 rounded-lg flex flex-col space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {serviceName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Mã DV: {serviceCode}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-gray-700">
                        Còn {item.remaining_quantity} / {item.total_quantity}{" "}
                        buổi
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full transition-all duration-300"
                        style={{
                          width: `${(item.used_quantity / item.total_quantity) * 100}%`,
                        }}
                      />
                    </div>

                    {/* Button Thực Hiện (Touch target >= 44px) */}
                    <button
                      onClick={() => handleOpenExecuteModal(pkg, item)}
                      disabled={!isExecutable}
                      className={`w-full min-h-[44px] mt-1 text-sm font-medium rounded-lg transition-colors flex items-center justify-center ${
                        isExecutable
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {item.remaining_quantity <= 0
                        ? "Đã hết buổi"
                        : "Thực hiện dịch vụ"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Modal Chọn KTV & Xác nhận */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-gray-900 border-b pb-2">
              Thực Hiện Ca Dịch Vụ
            </h3>

            <div className="text-sm space-y-1 bg-blue-50 p-3 rounded-lg">
              <p>
                <strong>Dịch vụ:</strong>{" "}
                {selectedItem.item.service?.catalog_item?.name}
              </p>
              <p>
                <strong>Số buổi còn lại:</strong>{" "}
                {selectedItem.item.remaining_quantity} buổi
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Kỹ thuật viên thực hiện <span className="text-red-500">*</span>
              </label>
              <select
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
                className="w-full min-h-[44px] px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn KTV --</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Ghi chú ca làm
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú (nếu có)..."
                className="w-full min-h-[44px] px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="flex-1 min-h-[44px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmExecute}
                disabled={executing}
                className="flex-1 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm flex items-center justify-center"
              >
                {executing ? "Đang xử lý..." : "Xác nhận trừ buổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
