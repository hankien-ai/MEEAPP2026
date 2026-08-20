import React, { useState, useEffect, useCallback } from "react";
import {
  fetchStaff,
  createStaff,
  updateStaff,
  updateStaffStatus,
  archiveStaff,
} from "../services/staff.service";
import { StaffMemberDomain, CreateStaffInput } from "../types/domain";

export const StaffPage: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffMemberDomain[]>([]);
  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMemberDomain | null>(
    null,
  );
  const [formData, setFormData] = useState<CreateStaffInput>({
    full_name: "",
    role: "Kỹ thuật viên",
    phone: "",
    status: "ACTIVE",
    started_on: new Date().toISOString().split("T")[0],
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchStaff(search, includeInactive);
      setStaffList(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi khi kết nối tới hệ thống Supabase");
    } finally {
      setLoading(false);
    }
  }, [search, includeInactive]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenModal = (staff?: StaffMemberDomain) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        full_name: staff.full_name,
        role: staff.role,
        phone: staff.phone,
        status: staff.status,
        started_on: staff.started_on ? staff.started_on.split("T")[0] : "",
      });
    } else {
      setEditingStaff(null);
      setFormData({
        full_name: "",
        role: "Kỹ thuật viên",
        phone: "",
        status: "ACTIVE",
        started_on: new Date().toISOString().split("T")[0],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, formData);
        setSuccessMessage("Cập nhật nhân viên thành công!");
      } else {
        await createStaff(formData);
        setSuccessMessage("Thêm mới nhân viên thành công!");
      }
      handleCloseModal();
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleToggleStatus = async (
    id: string,
    currentStatus: "ACTIVE" | "INACTIVE",
  ) => {
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateStaffStatus(id, nextStatus);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleArchive = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn lưu trữ (archive) nhân viên "${name}"?`,
      )
    )
      return;
    try {
      await archiveStaff(id);
      setSuccessMessage(`Đã lưu trữ nhân viên ${name}`);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý Nhân viên (Staff)
          </h1>
          <p className="text-sm text-gray-500">Dữ liệu thực tế từ Supabase</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
        >
          + Thêm nhân viên
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="Tìm theo tên, SĐT, hoặc chức danh..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-3 py-2 border rounded text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
            className="rounded"
          />
          Hiển thị cả nhân viên Tạm ngưng (INACTIVE)
        </label>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded border border-red-300 text-sm">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="p-4 mb-4 text-green-700 bg-green-100 rounded border border-green-300 text-sm">
          {successMessage}
        </div>
      )}

      {/* Main Table */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">
          Đang tải danh sách nhân viên từ Supabase...
        </div>
      ) : staffList.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 border rounded text-gray-500">
          Không tìm thấy nhân viên nào phù hợp.
        </div>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3 font-semibold text-gray-700">Họ và tên</th>
                <th className="p-3 font-semibold text-gray-700">
                  Chức danh / Role
                </th>
                <th className="p-3 font-semibold text-gray-700">
                  Số điện thoại
                </th>
                <th className="p-3 font-semibold text-gray-700">
                  Ngày bắt đầu
                </th>
                <th className="p-3 font-semibold text-gray-700 text-center">
                  Trạng thái
                </th>
                <th className="p-3 font-semibold text-gray-700 text-center">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff) => (
                <tr
                  key={staff.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium text-gray-900">
                    {staff.full_name}
                  </td>
                  <td className="p-3 text-gray-600">{staff.role}</td>
                  <td className="p-3 text-gray-600">{staff.phone}</td>
                  <td className="p-3 text-gray-600">
                    {staff.started_on || "N/A"}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        staff.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {staff.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleOpenModal(staff)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() =>
                          handleToggleStatus(staff.id, staff.status)
                        }
                        className="text-gray-600 hover:underline"
                      >
                        {staff.status === "ACTIVE" ? "Tạm ngưng" : "Kích hoạt"}
                      </button>
                      <button
                        onClick={() => handleArchive(staff.id, staff.full_name)}
                        className="text-red-600 hover:underline"
                      >
                        Lưu trữ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {editingStaff ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chức danh / Role *
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Kỹ thuật viên, Lễ tân, Quản lý..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={formData.started_on}
                  onChange={(e) =>
                    setFormData({ ...formData, started_on: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "ACTIVE" | "INACTIVE",
                    })
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">ACTIVE (Hoạt động)</option>
                  <option value="INACTIVE">INACTIVE (Tạm ngưng)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingStaff ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;
